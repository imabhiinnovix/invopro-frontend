import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import ExcelJS from 'exceljs';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  styled,
  tableCellClasses,
  TableCell,
  Paper,
  IconButton,
  Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import useGet from '../../../hooks/useGet';
import { GET } from '../../../services/apiRoutes';
import { toast } from 'react-toastify';
import ViewMapping from '../report/viewMapping';

interface UploadMultipleFilesProps {
  reportId: string;
  versionValue: string;
  open: boolean;
  setOpen: any;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
}));

const UploadMultipleFiles: React.FC<UploadMultipleFilesProps> = ({ open, setOpen, reportId, versionValue }) => {
  const [fileUploads, setFileUploads] = useState<Record<string, File | null>>({});
  const [fileHeader, setFileHeader] = useState<Record<string, string[] | null>>({});
  const {
    control,
    handleSubmit,
    register,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      dataSourceId: '',
      versionName: '',
      file: null,
      mappings: {},
      separator: {},
    },
  });

  // Fetch required files from API
  const requiredVersionValues = useGet<{ success: boolean; versionValueDetails: any[] }>(
    [`versionValue`, String(reportId), String(versionValue)],
    GET?.Custom_Report + `/getVersionValue/?reportRequestId=${reportId}&versionValue=${versionValue}`,
    !!reportId && !!versionValue
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fileName: string) => {
    if (event.target.files?.[0]) {
      const selectedFile = event.target.files[0];

      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        toast.error('Please upload a valid Excel file.');
        return;
      }

      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;

          const workbook = new ExcelJS.Workbook();
          try {
            await workbook.xlsx.load(arrayBuffer);
          } catch (error) {
            toast.error('Failed to load the Excel file. Ensure the file is valid.');
            return;
          }

          if (!workbook.worksheets || workbook.worksheets.length === 0) {
            toast.error('No sheets found in the Excel file.');
            return;
          }

          const worksheet = workbook.worksheets[0];
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
            } else {
              setFileHeader((prev) => ({
                ...prev,
                [fileName]: [...headers, 'Extra-Attribute-Ignore'],
              }));
              setFileUploads((prev) => ({
                ...prev,
                [fileName]: selectedFile,
              }));
            }
          } else {
            toast.error('Headers not found.');
          }
        } catch (e) {
          toast.error('Something went wrong while processing the file. Please try again.');
        }
      };

      reader.readAsArrayBuffer(selectedFile);
    }
  };

  // Upload handler
  const onSubmit = (formData: any) => {
    console.log('Uploading files:', formData);
    setOpen(false);
  };

  // Ensure all required files are uploaded before enabling the Upload button
  const allFilesUploaded =
    requiredVersionValues.data?.versionValueDetails?.every((data) =>
      data?.requiredFiles?.every(
        (fileName: string) => fileUploads[fileName] !== null && fileUploads[fileName] !== undefined
      )
    ) ?? false;

  return (
    <>
      <Button variant="text" size="large" type="submit" onClick={() => setOpen(true)}></Button>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Requested Report:</DialogTitle>
        <DialogTitle>Version Value: {versionValue}</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table sx={{ width: '100%' }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>FILE NAME</StyledTableCell>
                  <StyledTableCell>UPLOAD FILE</StyledTableCell>
                  <StyledTableCell>MAPPINGS</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requiredVersionValues.data?.versionValueDetails?.map((data) =>
                  data?.requiredFiles?.map((fileName: string) => (
                    <StyledTableRow key={`${data._id}-${fileName}`}>
                      <StyledTableCell>{data.name || '-'}</StyledTableCell>
                      <StyledTableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Button
                            variant="contained"
                            component="label"
                            sx={{
                              fontWeight: 'bold',
                              bgcolor: '#007bff',
                              color: '#fff',
                              '&:hover': { bgcolor: '#0056b3' },
                              padding: 2,
                            }}
                          >
                            <Box gap={1} display="flex" justifyContent="center">
                              <UploadFileIcon />
                              Upload File
                            </Box>

                            <input type="file" hidden onChange={(e) => handleFileChange(e, fileName)} />
                          </Button>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        {fileHeader[fileName] ? (
                          <ViewMapping
                            fileName={fileName}
                            CustomButton={<Button>View Mappings</Button>}
                            title={'Mappings'}
                            settingAttributeOption={data.entityId.attributes}
                            fileHeaders={fileHeader[fileName]!}
                            control={control}
                            setValue={setValue}
                            reset={reset}
                            errors={errors}
                          />
                        ) : (
                          '-'
                        )}
                      </StyledTableCell>
                    </StyledTableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)} color="error">
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UploadMultipleFiles;
