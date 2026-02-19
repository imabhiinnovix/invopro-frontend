import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { STYLE_GUIDE } from "../../../styles";
import DialogContainer from "../../molecule/dialog";
import { StyledButton } from "..";

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  content?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?:
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning";
  cancelButtonColor?:
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning";
  isSubmitting?: boolean;
  disableConfirmButton?: boolean;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  deleteId?: string | null;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  content,
  confirmText = "Yes",
  cancelText = "No",
  confirmButtonColor = "error",
  cancelButtonColor = "primary",
  isSubmitting = false,
  disableConfirmButton = false,
  maxWidth = "xs",
  deleteId,
}) => {
  const getButtonColor = (color: string) => {
    switch (color) {
      case "primary":
        return STYLE_GUIDE?.COLORS?.primaryDark || "#8c2d8c";
      case "secondary":
        return STYLE_GUIDE?.COLORS?.materialPurple || "#9C27B0";
      case "success":
        return STYLE_GUIDE?.COLORS?.bootstrapSuccess || "#28a745";
      case "error":
        return STYLE_GUIDE?.COLORS?.error || "#b71c1c";
      case "info":
        return STYLE_GUIDE?.COLORS?.materialBlue || "#1976d2";
      case "warning":
        return STYLE_GUIDE?.COLORS?.chartRed || "#e74c3c";
      default:
        return STYLE_GUIDE?.COLORS?.primaryDark || "#8c2d8c";
    }
  };

  const getButtonHoverColor = (color: string) => {
    switch (color) {
      case "primary":
        return STYLE_GUIDE?.COLORS?.primary || "#a136a1";
      case "secondary":
        return STYLE_GUIDE?.COLORS?.materialPurpleDark || "#7B1FA2";
      case "success":
        return STYLE_GUIDE?.COLORS?.chartGreenBorder || "#27ae60";
      case "error":
        return STYLE_GUIDE?.COLORS?.materialError || "#D32F2F";
      case "info":
        return STYLE_GUIDE?.COLORS?.blue700 || "#308fe8";
      case "warning":
        return STYLE_GUIDE?.COLORS?.chartRedBorder || "#c0392b";
      default:
        return STYLE_GUIDE?.COLORS?.primary || "#a136a1";
    }
  };

  // Default content based on whether deleteId is provided
  const dialogContent =
    content ||
    (deleteId
      ? `Are you sure you want to delete this?`
      : "Are you sure you want to proceed?");

  return (
    <DialogContainer
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      title={title}
      actions={
        <>
          <StyledButton
            variant="secondary"
            onClick={onClose}
            sx={{
              borderRadius: "8px",
              color: getButtonColor(cancelButtonColor),
            }}
          >
            {cancelText}
          </StyledButton>
          <StyledButton
            variant="primary"
            onClick={onConfirm}
            disabled={isSubmitting || disableConfirmButton}
            sx={{
              borderRadius: "8px",
              backgroundColor: getButtonColor(confirmButtonColor),
              color: "#ffffff",
              "&:hover": {
                backgroundColor: getButtonHoverColor(confirmButtonColor),
              },
              "&.Mui-disabled": {
                backgroundColor: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
                color: STYLE_GUIDE?.COLORS?.textMediumGray || "#9e9e9e",
              },
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              confirmText
            )}
          </StyledButton>
        </>
      }
    >
      <Typography>{dialogContent}</Typography>
    </DialogContainer>
  );
};
