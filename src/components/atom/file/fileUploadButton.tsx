import React from "react";
import { Button, Box } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { STYLE_GUIDE } from "../../../styles";
import PrimaryButton from "../../common/PrimaryButton";

interface FileUploadButtonProps {
  fileName: string | null; // Controlled file name state
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void; // File input change handler
  buttonName: string;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  fileName,
  onFileChange,
  buttonName,
}) => {
  return (
    <Box display="flex" alignItems="center" gap={STYLE_GUIDE.SPACING.s2}>
      <PrimaryButton variant="outlined" component="label">
        <Box
          gap={STYLE_GUIDE.SPACING.s1}
          display="flex"
          justifyContent="center"
        >
          <UploadFileIcon />
          {buttonName}
        </Box>

        <input type="file" hidden onChange={onFileChange} />
      </PrimaryButton>
      {fileName && (
        <Box
          component="span"
          sx={{
            fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
            color: STYLE_GUIDE.COLORS.darkText,
            fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily,
          }}
        >
          {fileName}
        </Box>
      )}
    </Box>
  );
};

export default FileUploadButton;
