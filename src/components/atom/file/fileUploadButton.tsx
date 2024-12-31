import React from 'react';
import { Button, Box } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

interface FileUploadButtonProps {
  fileName: string | null; // Controlled file name state
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void; // File input change handler
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({ fileName, onFileChange }) => {
  return (
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
          Select XLSX File to Extract Attributes From Its Header
        </Box>

        <input type="file" hidden onChange={onFileChange} />
      </Button>
      {fileName && (
        <Box component="span" sx={{ fontSize: '1rem', color: '#555' }}>
          {fileName}
        </Box>
      )}
    </Box>
  );
};

export default FileUploadButton;
