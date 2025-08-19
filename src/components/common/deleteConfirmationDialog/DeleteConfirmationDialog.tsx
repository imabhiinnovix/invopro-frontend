import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";
import { STYLE_GUIDE } from "../../../styles";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deleteId: string | null;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  deleteId,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "8px",
          backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
        },
      }}
    >
      <DialogTitle
        sx={{ color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5" }}
      >
        Confirm Delete
      </DialogTitle>
      <DialogContent>
        <Typography>
          {deleteId
            ? `Are you sure you want to delete this?`
            : "Are you sure you want to delete this?"}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: "8px",
            color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
          }}
        >
          No
        </Button>
        <Button
          onClick={onConfirm}
          sx={{
            borderRadius: "8px",
            backgroundColor: STYLE_GUIDE?.COLORS?.error || "#d32f2f",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: STYLE_GUIDE?.COLORS?.error || "#b71c1c", 
            }, 
          }}
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
