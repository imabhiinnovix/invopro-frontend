import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  Autocomplete,
  TextField,
  CircularProgress,
} from '@mui/material';
import { Dashboard } from '../../../../pages/dashboard/types';
import { useAppDispatch, useAppSelector } from '../../../../storeHooks';
import { fetchDashboardShareUsers, shareDashboard } from '../../../../pages/dashboard/dashboardActions';
import { toast } from 'react-toastify';
import { STYLE_GUIDE } from '../../../../styles';
import { useUnifiedTheme } from '../../../../hooks/useUnifiedTheme';

interface ShareDashboardModalProps {
  open: boolean;
  onClose: () => void;
  dashboard: Dashboard | null;
  onSubmit: (selectedUsers: string[], sharedToAll: boolean) => void;
}

export const ShareDashboardModal: React.FC<ShareDashboardModalProps> = ({
  open,
  onClose,
  dashboard,
  onSubmit,
}) => {
  const [sharedToAll, setSharedToAll] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();
  const { shareUsers, shareUsersLoading, shareUsersError } = useAppSelector((state) => ({
    shareUsers: state.dashboard.shareUsers,
    shareUsersLoading: state.dashboard.shareUsersLoading,
    shareUsersError: state.dashboard.shareUsersError,
  }));
 
  const theme = useUnifiedTheme();
  
  
  useEffect(() => {
    if (open && dashboard?._id) {
      dispatch(fetchDashboardShareUsers(dashboard._id));
    } else {
      // Reset states when modal closes
      setSelectedUsers([]);
      setSharedToAll(false);
    }
  }, [open, dashboard?._id, dispatch]);

  const handleSharedToAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setSharedToAll(isChecked);
    if (isChecked) {
      setSelectedUsers([]);
    }
  };

  const handleSubmit = async () => {
    if (!dashboard?._id) return;

    try {
      setIsSubmitting(true);
      const response = await dispatch(shareDashboard({
        receiverEmails: sharedToAll ? shareUsers : selectedUsers,
        dashboardId: dashboard._id,
        isShareble: true
      })).unwrap();

      if (response.success) {
        toast.success('Dashboard shared successfully!');
        onSubmit(selectedUsers, sharedToAll);
        onClose();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to share dashboard';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Share Dashboard
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: STYLE_GUIDE.SPACING.s2 }}>
          <Typography variant="subtitle1" sx={{ mb: STYLE_GUIDE.SPACING.s2 }}>
            {dashboard?.name}
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={sharedToAll}
                onChange={handleSharedToAllChange}
                color="primary"
              />
            }
            label="Share with all users"
          />

          <Box sx={{ mt: STYLE_GUIDE.SPACING.s2 }}>
            {shareUsersLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: STYLE_GUIDE.SPACING.s2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : shareUsersError ? (
              <Typography color="error" variant="body2">
                {shareUsersError}
              </Typography>
            ) : (
              <Autocomplete
                multiple
                disabled={sharedToAll}
                options={shareUsers}
                value={selectedUsers}
                onChange={(_, newValue) => setSelectedUsers(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select users"
                    placeholder="Choose users to share with"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: STYLE_GUIDE.SPACING.s2, alignItems: 'center', fontSize: '14px', backgroundColor: theme.dashboardTheme?.colors?.background?.paper || '#ffffff', '& fieldset': { borderColor: theme.dashboardTheme?.colors?.inputBorder || STYLE_GUIDE.COLORS.darkBackground, }, '&:hover fieldset': { borderColor: theme.dashboardTheme?.colors?.borderHover || STYLE_GUIDE.COLORS.darkBorderHover, }, '&.Mui-focused fieldset': { borderColor: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback, }, }, '& .MuiInputLabel-root': { color: theme.dashboardTheme?.components?.input?.focusBorderColor || STYLE_GUIDE.COLORS.darkBorderFocus, }, '& .MuiInputLabel-root.Mui-focused': { color: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback, }, '& .MuiInputBase-input': { color: `${theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || '#000000'} !important`, }, '& .MuiInputBase-input::placeholder': { color: `${theme.dashboardTheme?.components?.input?.focusBorderColor || '#666'} !important`, }, '& .MuiInputBase-input:-webkit-autofill': { WebkitTextFillColor: `${theme.dashboardTheme?.components?.input?.focusBorderColor || '#000000'} !important`, WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || '#ffffff'} inset !important`, }, }}
                  />
                )}
              />
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={(!sharedToAll && selectedUsers.length === 0) || isSubmitting}
        >
          {isSubmitting ? 'Sharing...' : 'Share'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 