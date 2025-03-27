import React from 'react';
import { Box, TextField } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

interface DashboardCreationFormProps {
  newDashboardName: string;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCreate: () => void;
  onCancel: () => void;
  isCreatingLoading: boolean;
}

export const DashboardCreationForm: React.FC<DashboardCreationFormProps> = ({
  newDashboardName,
  onNameChange,
  onCreate,
  onCancel,
  isCreatingLoading,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onCreate();
    }
  };

  return (
    <Box sx={{ pl: 4, pr: 2, py: 1 }}>
      <TextField
        fullWidth
        size="small"
        value={newDashboardName}
        onChange={onNameChange}
        placeholder="Enter dashboard name"
        autoFocus
        onKeyPress={handleKeyPress}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
        <LoadingButton
          size="small"
          onClick={onCancel}
          disabled={isCreatingLoading}
          startIcon={<CloseIcon />}
          variant="outlined"
          sx={{ minWidth: 'auto', p: 1 }}
        />
        <LoadingButton
          size="small"
          onClick={onCreate}
          loading={isCreatingLoading}
          loadingIndicator="Creating..."
          startIcon={<CheckIcon />}
          variant="contained"
          sx={{ minWidth: 'auto', p: 1 }}
        />
      </Box>
    </Box>
  );
}; 