import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  alpha,
} from '@mui/material';
import { STYLE_GUIDE } from '../../styles';
import StyledSelect from '../../components/atom/common/StyledSelect';
import { useUnifiedTheme } from '../../hooks/useUnifiedTheme';

interface SaveWidgetModelProps {
  open: boolean;
  onClose: () => void;
  newChartName: string;
  onNameChange: (name: string) => void;
  onCreate: () => void;
  isCreating: boolean;
  dashboardList: any[];
  dashBoardId: string;
  onDashboardChange: (id: string) => void;
  // dashboardType: 'normal' | 'trend';

  // timePeriod: string;
  // onTimePeriodChange: (period: string) => void;
}

export const SaveWidgetModel: React.FC<SaveWidgetModelProps> = ({
  open,
  onClose,
  newChartName,
  onNameChange,
  onCreate,
  isCreating,
  dashboardList,
  dashBoardId,
  onDashboardChange,
  // timePeriod,
  // onTimePeriodChange,
}) => {
  
  const theme = useUnifiedTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: STYLE_GUIDE.SPACING.s4,
          minWidth: { xs: '90%', sm: '400px' },
          maxWidth: '500px',
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          color: 'primary.main',
          fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
          fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.xl,
          py: STYLE_GUIDE.SPACING.s4,
        }}
      >
        Save Chart Settings
      </DialogTitle>
      <DialogContent sx={{ mt: STYLE_GUIDE.SPACING.s4, pb: STYLE_GUIDE.SPACING.s2 }}>
        <TextField
          autoFocus
          margin="dense"
          label="Chart Name"
          type="text"
          fullWidth
          variant="outlined"
          value={newChartName}
          onChange={(e) => onNameChange(e.target.value)}
          size="small"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: STYLE_GUIDE.SPACING.s2, alignItems: 'flex-start', paddingRight: STYLE_GUIDE.SPACING.s2, fontSize: '14px', backgroundColor: theme.dashboardTheme?.colors?.background?.paper || '#ffffff', '& fieldset': { borderColor: theme.dashboardTheme?.colors?.inputBorder || STYLE_GUIDE.COLORS.darkBackground, }, '&:hover fieldset': { borderColor: theme.dashboardTheme?.colors?.borderHover || STYLE_GUIDE.COLORS.darkBorderHover, }, '&.Mui-focused fieldset': { borderColor: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback, }, }, '& .MuiInputLabel-root': { color: theme.dashboardTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus, }, '& .MuiInputLabel-root.Mui-focused': { color: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback, }, '& .MuiInputBase-input': { color: `${theme.dashboardTheme?.colors?.inputText || theme.palette.text.primary} !important`, }, '& .MuiInputBase-input::placeholder': { color: `${theme.dashboardTheme?.colors?.text?.secondary || '#666'} !important`, }, '& .MuiInputBase-input:-webkit-autofill': { WebkitTextFillColor: `${theme.dashboardTheme?.colors?.inputText || theme.palette.text.primary} !important`, WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || '#ffffff'} inset !important`, }, }}
        />
        <StyledSelect
          label="Select Dashboard*"
          value={dashBoardId}
          onChange={(e) => onDashboardChange(e.target.value as string)}
          size="small"
          sx={{ mt: STYLE_GUIDE.SPACING.s4 }}
        >
          {dashboardList?.filter((data) => data.settings.dashboardType === "normal")?.map((data) => (
              <MenuItem key={data._id} value={data._id}>
                {data.name}
              </MenuItem>
          ))}
        </StyledSelect>
        {/* {dashboardType === 'trend' && (
          <FormControl
            fullWidth
            margin="dense"
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          >
            <InputLabel id="time-period-label">Time Period</InputLabel>
            <Select
              labelId="time-period-label"
              id="time-period-select"
              value={timePeriod}
              label="Time Period"
              onChange={(e) => onTimePeriodChange(e.target.value)}
              size="small"
            >
              <MenuItem value="1m">Last 1 Month</MenuItem>
              <MenuItem value="3m">Last 3 Months</MenuItem>
              <MenuItem value="6m">Last 6 Months</MenuItem>
              <MenuItem value="12m">Last 12 Months</MenuItem>
            </Select>
          </FormControl>
        )} */}
      </DialogContent>
      <DialogActions sx={{ p: STYLE_GUIDE.SPACING.s4, gap: STYLE_GUIDE.SPACING.s2 }}>
        <Button
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: alpha(theme.palette.grey[500], 0.1),
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onCreate}
          variant="contained"
          // disabled={!newWidgetName.trim() || isCreating}
          sx={{
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '&.Mui-disabled': {
              backgroundColor: alpha(theme.palette.primary.main, 0.5),
              color: STYLE_GUIDE.COLORS.white,
            },
          }}
        >
          {isCreating ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
