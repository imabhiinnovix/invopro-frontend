import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
} from '@mui/material';
import { STYLE_GUIDE } from '../../../../styles';
import { useDashboardTheme } from '../../../../context/DashboardThemeProvider';

interface CreateDashboardModalProps {
  open: boolean;
  onClose: () => void;
  newDashboardName: string;
  onNameChange: (name: string) => void;
  onCreate: () => void;
  isCreating: boolean;
  dashboardType: 'normal' | 'trend';
  onDashboardTypeChange: (type: 'normal' | 'trend') => void;
  timePeriod: string;
  onTimePeriodChange: (period: string) => void;
}

export const CreateDashboardModal: React.FC<CreateDashboardModalProps> = ({
  open,
  onClose,
  newDashboardName,
  onNameChange,
  onCreate,
  isCreating,
  dashboardType,
  onDashboardTypeChange,
  timePeriod,
  onTimePeriodChange,
}) => {
  const theme = useTheme();
  const { currentTheme } = useDashboardTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: STYLE_GUIDE.SPACING.s1,
          minWidth: { xs: "90%", sm: "400px" },
          maxWidth: "500px",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          color: STYLE_GUIDE.COLORS.bootstrapPrimary,
          fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
          fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
          fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
          py: STYLE_GUIDE.SPACING.s4,
        }}
      >
        Create New Dashboard
      </DialogTitle>
      <DialogContent sx={{ mt: STYLE_GUIDE.SPACING.s4, pb: STYLE_GUIDE.SPACING.s2 }}>
        <TextField
          autoFocus
          margin="dense"
          label="Dashboard Name"
          type="text"
          fullWidth
          variant="outlined"
          value={newDashboardName}
          onChange={(e) => onNameChange(e.target.value)}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: STYLE_GUIDE.SPACING.s2,
              alignItems: 'flex-start',
              paddingRight: STYLE_GUIDE.SPACING.s2,
              fontSize: '14px',
              backgroundColor: currentTheme?.colors?.background?.paper || '#ffffff',
              '& fieldset': {
                borderColor: currentTheme?.colors?.inputBorder || STYLE_GUIDE.COLORS.darkBackground,
              },
              '&:hover fieldset': {
                borderColor: currentTheme?.colors?.borderHover || STYLE_GUIDE.COLORS.darkBorderHover,
              },
              '&.Mui-focused fieldset': {
                borderColor: currentTheme?.components?.input?.focusBorderColor || STYLE_GUIDE.COLORS.darkBorderFocus,
              },
            },
            '& .MuiInputLabel-root': {
              color: currentTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus,
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: currentTheme?.components?.input?.focusBorderColor || STYLE_GUIDE.COLORS.darkDarker,
            },
            '& .MuiInputBase-input': {
              color: `${currentTheme?.colors?.inputText} !important`,
            },
            '& .MuiInputBase-input::placeholder': {
              color: `${currentTheme?.colors?.text?.secondary || '#666'} !important`,
            },
            '& .MuiInputBase-input:-webkit-autofill': {
              WebkitTextFillColor: `${currentTheme?.colors?.inputText} !important`,
              WebkitBoxShadow: `0 0 0 1000px ${currentTheme?.colors?.background?.paper || '#ffffff'} inset !important`,
            },
          }}
        />
        <FormControl
          fullWidth
          margin="dense"
          size="small"
          sx={{
            mt: 2,
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: "primary.main",
              },
              "&.Mui-focused fieldset": {
                borderColor: "primary.main",
              },
            },
          }}
        >
          <InputLabel>Dashboard Type</InputLabel>
          <Select
            value={dashboardType}
            label="Dashboard Type"
            onChange={(e) => onDashboardTypeChange(e.target.value as "normal" | "trend")}
          >
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="trend">Trend</MenuItem>
          </Select>
        </FormControl>

        {dashboardType === "trend" && (
          <FormControl
            fullWidth
            margin="dense"
            sx={{
              mt: 2,
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "primary.main",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
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
        )}
      </DialogContent>
      <DialogActions sx={{ p: STYLE_GUIDE.SPACING.s4, gap: STYLE_GUIDE.SPACING.s2 }}>
        <Button
          onClick={onClose}
          sx={{
            color: STYLE_GUIDE.COLORS.darkText,
            "&:hover": {
              backgroundColor: alpha(theme.palette.grey[500], 0.1),
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onCreate}
          variant="contained"
          disabled={!newDashboardName.trim() || isCreating}
          sx={{
            backgroundColor: STYLE_GUIDE.COLORS.bootstrapPrimary,
            "&:hover": {
              backgroundColor: STYLE_GUIDE.COLORS.bootstrapPrimaryHover
            },
            "&.Mui-disabled": {
              backgroundColor: alpha(theme.palette.primary.main, 0.5),
              color: STYLE_GUIDE.COLORS.white,
            },
          }}
        >
          {isCreating ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 