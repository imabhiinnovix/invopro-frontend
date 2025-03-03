import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  styled,
  tableCellClasses,
  TableCell,
  Paper,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import useGet from '../../../hooks/useGet';
import { GET } from '../../../services/apiRoutes';

interface UploadMultipleFilesProps {
  reportId: string;
  versionValue: string;
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

const UploadMultipleFiles: React.FC<UploadMultipleFilesProps> = ({ reportId, versionValue }) => {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { handleSubmit } = useForm();

  const requiredVersionValues = useGet<{ success: boolean; versionValueDetails: any[] }>(
    [`versionValue`, String(reportId), String(versionValue)],
    GET?.Custom_Report + `/getVersionValue/?reportRequestId=${reportId}&versionValue=${versionValue}`,
    !!reportId && !!versionValue
  );

  console.log(requiredVersionValues.data);

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const onSubmit = () => {
    console.log('Uploading files:', files);
    setOpen(false);
  };

  return (
    <>
      {/* <Button variant="contained">Open File Upload</Button> */}
      <Button
        variant="text"
        size="large"
        type="submit"
        onClick={() => setOpen(true)}
        sx={{
          fontWeight: 'bold',
          fontSize: '1.2rem',
          width: '100%',
          bgcolor: '#007bff',
          color: '#fff',
          '&:hover': { bgcolor: '#0056b3' },
          '@media (max-width: 600px)': {
            fontSize: '1rem',
          },
        }}
        // onClick={handleSubmit(onSubmit)}
      >
        Generate Report
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Requested Report:</DialogTitle>
        <DialogTitle>Version Value:{versionValue}</DialogTitle>
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
                {requiredVersionValues.data?.versionValueDetails?.map((data, dataIndex) =>
                  data?.requiredFiles?.map((fileName: string) => (
                    <React.Fragment key={`${data._id}-${fileName}`}>
                      <StyledTableRow>
                        <StyledTableCell>{fileName || '-'}</StyledTableCell>
                        <StyledTableCell>
                          <>
                            <input
                              type="file"
                              accept=".xlsx,.xls"
                              multiple
                              style={{ display: 'none' }}
                              id="file-upload-input"
                              onChange={handleFilesChange}
                            />
                            <label htmlFor="file-upload-input">
                              <Button variant="contained" component="span" startIcon={<UploadFileIcon />}>
                                Upload Files
                              </Button>
                            </label>
                          </>
                        </StyledTableCell>
                        <StyledTableCell>Mappings</StyledTableCell>
                      </StyledTableRow>
                    </React.Fragment>
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
          <Button onClick={handleSubmit(onSubmit)} variant="contained" color="primary" disabled={files.length === 0}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UploadMultipleFiles;
