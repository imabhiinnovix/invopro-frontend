import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { Dashboard } from '../../../../pages/dashboard/types';

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
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle id="delete-dialog-title">
        Delete Dashboard
      </DialogTitle>
      <DialogContent>
        <p>Are you sure you want to delete "{dashboard?.name}"?</p>
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