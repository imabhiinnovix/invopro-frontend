import { useState, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import DialogContainer from "../../../components/molecule/dialog";
import { StyledButton } from "../../../components/common";
import { STYLE_GUIDE } from "../../../styles";

interface UploadFilesModalProps {
  open: boolean;
  onClose: () => void;
  tabName: string;
  onUpload: (files: File[], uploadedBy: string) => void;
  isUploading?: boolean;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: STYLE_GUIDE.SPACING.s2,
    fontSize: "14px",
    backgroundColor: STYLE_GUIDE.COLORS.white,
    "& fieldset": { borderColor: STYLE_GUIDE.COLORS.darkBackground },
    "&:hover fieldset": { borderColor: STYLE_GUIDE.COLORS.darkBorderHover },
    "&.Mui-focused fieldset": { borderColor: STYLE_GUIDE.COLORS.inputFocusFallback },
  },
  "& .MuiInputLabel-root": { color: STYLE_GUIDE.COLORS.darkBorderFocus },
  "& .MuiInputLabel-root.Mui-focused": { color: STYLE_GUIDE.COLORS.inputFocusFallback },
  "& .MuiInputBase-input": { color: `${STYLE_GUIDE.COLORS.textDarkGray} !important` },
};

export default function UploadFilesModal({
  open,
  onClose,
  tabName,
  onUpload,
  isUploading = false,
}: UploadFilesModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedBy, setUploadedBy] = useState("");

  const currentYear = String(new Date().getFullYear());
  const currentMonth = MONTHS[new Date().getMonth()];

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      rejectedFiles.forEach((rejection: any) => {
        rejection.errors.forEach((error: any) => {
          if (error.code === "file-too-large") {
            toast.error(`${rejection.file.name} exceeds 25MB limit`);
          } else if (error.code === "file-invalid-type") {
            toast.error("Only CSV and Excel files are allowed");
          } else {
            toast.error(error.message);
          }
        });
      });

      if (acceptedFiles.length > 0) {
        setFiles((prev) => [...prev, ...acceptedFiles]);
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxSize: MAX_FILE_SIZE,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setFiles([]);
    setUploadedBy("");
    onClose();
  };

  const handleUpload = () => {
    if (files.length === 0) {
      toast.error("Please select at least one file");
      return;
    }
    if (!uploadedBy.trim()) {
      toast.error("Please enter your name");
      return;
    }
    onUpload(files, uploadedBy.trim());
  };

  const isFormValid = files.length > 0 && uploadedBy.trim().length > 0 && !isUploading;

  return (
    <DialogContainer
      open={open}
      onClose={handleClose}
      title={`Upload Files to ${tabName}`}
      maxWidth="sm"
      actions={
        <>
          <StyledButton variant="secondary" onClick={handleClose}>
            Cancel
          </StyledButton>
          <StyledButton
            variant="primary"
            onClick={handleUpload}
            disabled={!isFormValid}
            icon={<FileUploadOutlinedIcon sx={{ fontSize: 18 }} />}
          >
            {isUploading ? "Uploading..." : "Upload & Validate"}
          </StyledButton>
        </>
      }
    >
      <Box
        {...getRootProps()}
        sx={{
          border: `2px dashed ${isDragActive ? STYLE_GUIDE.COLORS.themeColor : STYLE_GUIDE.COLORS.inputFieldBorder}`,
          borderRadius: "12px",
          py: 5,
          px: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          cursor: "pointer",
          backgroundColor: isDragActive
            ? `${STYLE_GUIDE.COLORS.themeColor}08`
            : STYLE_GUIDE.COLORS.white,
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: STYLE_GUIDE.COLORS.themeColor,
            backgroundColor: `${STYLE_GUIDE.COLORS.themeColor}05`,
          },
        }}
      >
        <input {...getInputProps()} />
        <FileUploadOutlinedIcon
          sx={{
            fontSize: 40,
            color: STYLE_GUIDE.COLORS.textSecondary,
            mb: 0.5,
          }}
        />
        <Typography
          variant="body1"
          sx={{
            fontWeight: 500,
            fontSize: "14px",
            color: STYLE_GUIDE.COLORS.tableBodyText,
          }}
        >
          Click to upload or drag files here
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: "13px",
            color: STYLE_GUIDE.COLORS.textSecondary,
          }}
        >
          CSV and Excel files only &bull; Max 25MB per file
        </Typography>
      </Box>

      <TextField
        label="Uploaded By"
        variant="outlined"
        fullWidth
        value={uploadedBy}
        onChange={(e) => setUploadedBy(e.target.value)}
        sx={textFieldSx}
      />

      {files.length > 0 && (
        <>
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: "14px",
                color: STYLE_GUIDE.COLORS.tableBodyText,
                mb: 1.5,
              }}
            >
              Files to Upload ({files.length})
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {files.map((file, index) => (
                <Box
                  key={`${file.name}-${index}`}
                  sx={{
                    borderRadius: "10px",
                    border: `1px solid ${STYLE_GUIDE.COLORS.inputFieldBorder}`,
                    backgroundColor: STYLE_GUIDE.COLORS.inputFieldBackground,
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <DescriptionOutlinedIcon
                    sx={{ fontSize: 20, color: STYLE_GUIDE.COLORS.textSecondary }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: STYLE_GUIDE.COLORS.tableBodyText,
                      }}
                    >
                      {file.name}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "12px",
                      color: STYLE_GUIDE.COLORS.textSecondary,
                      flexShrink: 0,
                    }}
                  >
                    ({formatFileSize(file.size)})
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => removeFile(index)}
                    sx={{
                      p: 0.25,
                      color: STYLE_GUIDE.COLORS.textSecondary,
                      "&:hover": { color: STYLE_GUIDE.COLORS.error },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <FormControl fullWidth disabled>
              <InputLabel>Year</InputLabel>
              <Select value={currentYear} label="Year">
                <MenuItem value={currentYear}>{currentYear}</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth disabled>
              <InputLabel>Month</InputLabel>
              <Select value={currentMonth} label="Month">
                <MenuItem value={currentMonth}>{currentMonth}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </>
      )}
    </DialogContainer>
  );
}
