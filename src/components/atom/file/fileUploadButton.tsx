import React from 'react';
import { Button, Box } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { STYLE_GUIDE } from '../../../styles';

interface FileUploadButtonProps {
  fileName: string | null; // Controlled file name state
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void; // File input change handler
  buttonName: string;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({ fileName, onFileChange, buttonName }) => {
  return (
    <Box display="flex" alignItems="center" gap={STYLE_GUIDE.SPACING.s2}>
      <Button
        variant="contained"
        component="label"
        sx={{
          fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
          bgcolor: STYLE_GUIDE.COLORS.bootstrapPrimary,
          color: STYLE_GUIDE.COLORS.white,
          '&:hover': { bgcolor: STYLE_GUIDE.COLORS.bootstrapPrimaryHover },
          padding: STYLE_GUIDE.SPACING.s4,
        }}
      >
        <Box gap={STYLE_GUIDE.SPACING.s1} display="flex" justifyContent="center">
          <UploadFileIcon />
          {buttonName}
        </Box>

        <input type="file" hidden onChange={onFileChange} />
      </Button>
      {fileName && (
        <Box component="span" sx={{ 
          fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
          color: STYLE_GUIDE.COLORS.darkText,
          fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily
        }}>
          {fileName}
        </Box>
      )}
    </Box>
  );
};

export default FileUploadButton;
