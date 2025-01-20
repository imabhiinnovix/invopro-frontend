import React, { useState } from 'react';
import {
  Button,
  Popover,
  TextField,
  Box,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  DialogActions,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import CommonDropdownSearch from '../../common/dropdown/searchableDropdown';
import { GET } from '../../../services/apiRoutes';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { WidthFull } from '@mui/icons-material';
import CommonDatePicker from '../../common/datePicker/datePicker';
import ProgressBar from '../../molecule/progressBar';
import useGet from '../../../hooks/useGet';
import { DateTime } from 'luxon';
import FileUploadButton from '../file/fileUploadButton';
import ExcelJS from 'exceljs';
import { toast } from 'react-toastify';
interface AttributeMapping {
  newAttribute: { id: number; name: string; type: string };
  entitySettingAttribute: { name: string; type: string; required: string };
}

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

const sampleResponse = {
  mappedAttributes: {
    matchedAttributes: [
      {
        newAttribute: { id: 1, name: 'DisclosureNumber', type: 'text' },
        enttitySettingAttribute: { name: 'DisclosureNumber', type: 'text', required: 'Not Mandatory' },
      },
      {
        newAttribute: { id: 2, name: 'SBU', type: 'text' },
        enttitySettingAttribute: { name: 'SBU', type: 'text', required: 'Not Mandatory' },
      },
    ],
    unmatchedNewAttributes: [
      { id: 14, name: 'Accolad', type: 'text' },
      { id: 17, name: 'ResponsibleSTCName', type: 'text' },
    ],
    unmatchedEntitySettingAttributes: {
      required: [{ name: 'ResponsibleSTCName1', type: 'text', required: 'Mandatory' }],
    },
  },
};

const CreateDataSourceVersion: React.FC<CreateDataSourceVersionProps> = ({ setReload, CustomButton, title, data }) => {
  const [open, setOpen] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileHeader, setFileHeader] = useState<string[] | null>(null);

  const { mappedAttributes } = sampleResponse;

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
  const handleFormClose = () => {
    reset();
    setOpen(false);
  };
  const onSubmit = (formData: any) => {
    console.log(formData);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
      const reader = new FileReader();
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
            setFileHeader(headers);
          }
        } catch (e) {
          toast.error('Something went wrong while processing the file. Please try again.');
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

              <FileUploadButton fileName={fileName} onFileChange={handleFileChange} buttonName={'Upload File'} />
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
