import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { Dashboard } from '../../../../pages/dashboard/types';
import { STYLE_GUIDE } from '../../../../styles';
import { useUnifiedTheme } from '../../../../hooks/useUnifiedTheme';
import { useComponentTypography } from '../../../../hooks/useComponentTypography';

interface DeleteConfirmationModalProps {
  open: boolean;
  dashboard: Dashboard | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  open,
  dashboard,
  onConfirm,
  onCancel,
  isDeleting,
}) => {
  const theme = useUnifiedTheme();
  const { getDialogTitleSx } = useComponentTypography();

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.dialog?.background || STYLE_GUIDE.COLORS.white,
          border: `1px solid ${theme.palette.dialog?.border || theme.palette.border?.main || STYLE_GUIDE.COLORS.borderGray}`,
          borderRadius: theme.palette.dialog?.borderRadius || '8px',
          boxShadow: theme.palette.dialog?.shadow || STYLE_GUIDE.SHADOWS.lg,
        }
      }}
    >
      <DialogTitle 
        id="delete-dialog-title"
        sx={{
          ...getDialogTitleSx(),
          color: theme.palette.dialog?.titleColor || STYLE_GUIDE.COLORS.textDarkGray,
        }}
      >
        Delete Dashboard
      </DialogTitle>
      <DialogContent sx={{
        color: theme.palette.dialog?.contentColor || STYLE_GUIDE.COLORS.textDarkGray,
        fontSize: theme.palette.dialog?.contentFontSize || '1rem',
      }}>
        <Typography>Are you sure you want to delete "{dashboard?.name}"?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <LoadingButton
          onClick={onConfirm}
          loading={isDeleting}
          color="error"
          variant="contained"
        >
          Delete
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}; 