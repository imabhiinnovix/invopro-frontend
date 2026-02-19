import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { STYLE_GUIDE } from "../../../styles";
import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";
import { useComponentTypography } from "../../../hooks/useComponentTypography";
import { StyledButton } from "../../../components/common";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  buttonText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  buttonText,
}) => {
  const theme = useUnifiedTheme();
  const { getDialogTitleSx } = useComponentTypography();

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          ...getDialogTitleSx(),
          color:
            theme.palette.dialog?.titleColor || STYLE_GUIDE.COLORS.textDarkGray,
        }}
      >
        <WarningAmberIcon color="warning" /> {title}
      </DialogTitle>
      <DialogContent
        sx={{
          color:
            theme.palette.dialog?.contentColor ||
            STYLE_GUIDE.COLORS.textDarkGray,
          fontSize: theme.palette.dialog?.contentFontSize || "1rem",
        }}
      >
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <StyledButton variant="secondary" onClick={onCancel}>
          Cancel
        </StyledButton>

        <StyledButton
          variant="primary"
          onClick={onConfirm}
          sx={{
            backgroundColor: "#d32f2f",
            "&:hover": { backgroundColor: "#b71c1c" },
          }}
        >
          {buttonText || "Delete"}
        </StyledButton>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
