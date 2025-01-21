import React, { useEffect, useState } from 'react';
import {
  Button,
  TextField,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  DialogActions,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import CommonDropdownSearch from '../../common/dropdown/searchableDropdown';
import { GET } from '../../../services/apiRoutes';
import CommonDatePicker from '../../common/datePicker/datePicker';
import ProgressBar from '../../molecule/progressBar';
import useGet from '../../../hooks/useGet';
import { DateTime } from 'luxon';
import FileUploadButton from '../file/fileUploadButton';
import ExcelJS from 'exceljs';
import { toast } from 'react-toastify';
import CommonSelect from '../../common/dropdown/commonSelect';

interface CreateDataSourceVersionProps {
  setReload: React.Dispatch<React.SetStateAction<boolean>>;
  CustomButton: React.ReactElement;
  title: string;
  data?: any;
}

interface FormValues {
  dataSourceId: string;
  versionValue: string;
  versionName: string;
  file: FileList | null;
  mappings: { [key: string]: string };
}

const CreateDataSourceVersion: React.FC<CreateDataSourceVersionProps> = ({ setReload, CustomButton, title, data }) => {
  const [open, setOpen] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileHeader, setFileHeader] = useState<string[]>([]);
  const [fileUploadLoader, setFileUploadLoader] = useState(false);
  const [settingAttribute, setSettingAttribute] = useState<Record<any, any>[]>([]);
  const [settingAttributeOption, setSettingAttributeOption] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    register,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      dataSourceId: '',
      versionName: '',
      file: null,
      mappings: {},
    },
  });

  const versionNameAvailability = useGet<{ success: boolean; available: boolean; message: string }>(
    [`codeAvailability`, versionName],
    GET?.Data_Source_Version_Name +
      `/dataSourceId/${watch('dataSourceId')}/versionValue/${DateTime.fromISO(watch('versionValue')).toFormat(
        'yyyy-LL'
      )}/versionName/${versionName}`,
    !!versionName && !!watch('dataSourceId') && !!watch('versionValue')
  );

  const dataSourceDetails = useGet<{ success: boolean; available: boolean; data: any }>(
    [`dataSourceDetails`, watch('dataSourceId')],
    GET?.Data_Source + `/${watch('dataSourceId')}`,
    !!watch('dataSourceId')
  );

  useEffect(() => {
    if (dataSourceDetails.isFetched) {
      setSettingAttribute(dataSourceDetails.data?.data?.entityId.attributes);
      setSettingAttributeOption([
        ...dataSourceDetails.data?.data?.entityId.attributes.map((data: any) => data.name),
        'Extra-Save As It',
        'Extra-Skip Data',
      ]);
    }
  }, [dataSourceDetails.isFetched]);

  const handleFormClose = () => {
    reset();
    setOpen(false);
  };
  const onSubmit = (formData: any) => {
    const reverseMap: Record<string, string[]> = {};
    Object.entries(formData.mappings).forEach(([key, value]) => {
      if (!reverseMap[value as string]) {
        reverseMap[value as string] = [];
      }

      if (!['Extra-Save As It', 'Extra-Skip Data'].includes(value as string)) reverseMap[value as string].push(key);
    });

    const duplicateEntries = Object.entries(reverseMap)
      .filter(([, keys]) => keys.length > 1)
      .map(([value, keys]) => `Value "${value}" is duplicated for file attributes: ${keys.join(', ')}`);

    const mandatoryAttributes = settingAttribute
      .filter((attr) => attr.required === 'Mandatory')
      .map((attr) => attr.name);

    const missingMandatoryAttributes = mandatoryAttributes.filter(
      (attr) => !Object.values(formData.mappings).includes(attr)
    );

    if (duplicateEntries.length > 0) {
      duplicateEntries.forEach((message) => {
        toast.error(message);
      });
    }
    if (missingMandatoryAttributes.length > 0) {
      missingMandatoryAttributes.forEach((attr) => {
        toast.error(`Mandatory attribute missing in mappings: ${attr}`);
      });
    }

    if (missingMandatoryAttributes.length === 0 && duplicateEntries.length === 0) {
      console.log(formData);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
      const reader = new FileReader();
      setFileUploadLoader(true);
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;

          // Load the Excel workbook
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(arrayBuffer);

          // Get the first worksheet
          const worksheet = workbook.worksheets[0];

          // Get the headers from the first row
          const headers: string[] = [];
          worksheet.getRow(1).eachCell((cell) => {
            headers.push(cell.value?.toString() || '');
          });

          if (headers.length > 0) {
            const headerCounts: Record<string, number> = headers.reduce(
              (acc: Record<string, number>, header: string) => {
                acc[header] = (acc[header] || 0) + 1;
                return acc;
              },
              {}
            );

            const duplicates = Object.entries(headerCounts).filter(([, count]) => count > 1);
            if (duplicates.length > 0) {
              duplicates.forEach(([header, count]) => {
                toast.error(`The header '${header}' is duplicated ${count} times.`);
              });

              setFileName(null);
              setFile(null);
            } else {
              setFileHeader(headers);
            }
          } else {
            toast.error(`Headers not found.`);
            setFileName(null);
            setFile(null);
          }
          setFileUploadLoader(false);
        } catch (e) {
          toast.error('Something went wrong while processing the file. Please try again.');
          setFileName(null);
          setFile(null);
          setFileUploadLoader(false);
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };
  return (
    <div>
      <Box onClick={() => setOpen(true)}>{CustomButton}</Box>
      <Dialog open={open} onClose={handleFormClose} fullWidth maxWidth="sm">
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={3}>
              <CommonDropdownSearch
                control={control}
                name={`dataSourceId`}
                label="Select Data Source* "
                apiUrl={`${GET.Data_Source_List}`}
                labelName="name"
                labelValue="_id"
                defaultValue={''}
                rules={{ required: 'Data Source is required' }}
                error={!!errors.dataSourceId}
                errorMessage={errors.dataSourceId?.message as string}
                apiName="entityList"
                defaultDataUrl={''}
              />
              <CommonDatePicker
                name={'versionValue'}
                control={control}
                views={['year', 'month']}
                label="Version Value*"
                rules={{ required: 'Version Value is required' }}
              />

              <TextField
                label="Version Name(Distinct Name for Identical Version of Same Data Source)*"
                fullWidth
                {...register('versionName', {
                  required: 'Version name is required',
                })}
                onChange={(event) => {
                  setVersionName(event.target.value);
                }}
                error={!!errors.versionName}
                defaultValue={''}
                disabled={watch('versionValue') && watch('dataSourceId') ? false : true}
                helperText={
                  errors.versionName?.message ||
                  (versionNameAvailability.isFetched && versionName.length > 0 ? (
                    versionNameAvailability.data?.available ? (
                      <Typography color="success">Version name is available</Typography>
                    ) : (
                      <Typography color="error">version name is not available</Typography>
                    )
                  ) : (
                    ''
                  ))
                }
              />

              {fileUploadLoader ? (
                <ProgressBar />
              ) : (
                <FileUploadButton fileName={fileName} onFileChange={handleFileChange} buttonName={'Upload File'} />
              )}

              {fileHeader.length > 0 && settingAttribute.length > 0 && settingAttributeOption.length > 0 && (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{fileName?.split('.')[0]} Attribute</TableCell>
                      <TableCell>Entity Setting Attribute</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fileHeader.map((header, index) => (
                      <TableRow key={index}>
                        <TableCell>{header}</TableCell>
                        <TableCell>
                          <CommonSelect
                            control={control}
                            name={`mappings.${header}`}
                            label={'Map To'}
                            options={settingAttributeOption}
                            defaultValue={settingAttributeOption.includes(header) ? header : ''}
                            rules={{
                              required:
                                'Choose how to handle extra fields: either save the data or skip saving for this column.',
                            }}
                            error={!!errors.mappings?.[header]}
                            errorMessage={errors.mappings?.[header]?.message}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          {false ? (
            <ProgressBar />
          ) : (
            <>
              {' '}
              <Button
                // onClick={handleCancel}
                color="error"
                sx={{ fontSize: 18, fontWeight: 'bold', p: 1, pl: 2, pr: 2 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                variant="contained"
                color="primary"
                sx={{ fontSize: 18, fontWeight: 'bold', p: 1, pl: 2, pr: 2 }}
              >
                Save Data Source
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CreateDataSourceVersion;
