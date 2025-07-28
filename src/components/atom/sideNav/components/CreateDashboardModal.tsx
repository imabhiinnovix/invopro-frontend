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
import { STYLE_GUIDE } from '../../../../styles';
import StyledSelect from '../../common/StyledSelect';
import { useUnifiedTheme } from '../../../../hooks/useUnifiedTheme';
import { useComponentTypography } from '../../../../hooks/useComponentTypography';


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
  const theme = useUnifiedTheme();
  const { getDialogTitleSx } = useComponentTypography();
  

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: theme.palette.dialog?.borderRadius || STYLE_GUIDE.SPACING.s1,
          minWidth: { xs: "90%", sm: "400px" },
          maxWidth: "500px",
          backgroundColor: theme.palette.dialog?.background || STYLE_GUIDE.COLORS.white,
          border: `1px solid ${theme.palette.dialog?.border || theme.palette.border?.main || STYLE_GUIDE.COLORS.borderGray}`,
          boxShadow: theme.palette.dialog?.shadow || STYLE_GUIDE.SHADOWS.lg,
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          color: theme.palette.dialog?.titleColor || STYLE_GUIDE.COLORS.bootstrapPrimary,
          py: STYLE_GUIDE.SPACING.s4,
          ...getDialogTitleSx(),
        }}
      >
        Create New Dashboard
      </DialogTitle>
      <DialogContent sx={{ 
        mt: STYLE_GUIDE.SPACING.s4, 
        pb: STYLE_GUIDE.SPACING.s2,
        color: theme.palette.dialog?.contentColor || STYLE_GUIDE.COLORS.textDarkGray,
        fontSize: theme.palette.dialog?.contentFontSize || '1rem',
      }}>
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
              backgroundColor: theme.dashboardTheme?.colors?.background?.paper || '#ffffff',
              '& fieldset': {
                borderColor: theme.dashboardTheme?.colors?.inputBorder || STYLE_GUIDE.COLORS.darkBackground,
              },
              '&:hover fieldset': {
                borderColor: theme.dashboardTheme?.colors?.borderHover || STYLE_GUIDE.COLORS.darkBorderHover,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.dashboardTheme?.components?.input?.focusBorderColor || STYLE_GUIDE.COLORS.darkBorderFocus,
              },
            },
            '& .MuiInputLabel-root': {
              color: theme.dashboardTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus,
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: theme.dashboardTheme?.components?.input?.focusBorderColor || STYLE_GUIDE.COLORS.darkDarker,
            },
            '& .MuiInputBase-input': {
              color: `${theme.dashboardTheme?.colors?.inputText} !important`,
            },
            '& .MuiInputBase-input::placeholder': {
              color: `${theme.dashboardTheme?.colors?.text?.secondary || '#666'} !important`,
            },
            '& .MuiInputBase-input:-webkit-autofill': {
              WebkitTextFillColor: `${theme.dashboardTheme?.colors?.inputText} !important`,
              WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || '#ffffff'} inset !important`,
            },
          }}
        />
        <StyledSelect
          label="Dashboard Type"
          value={dashboardType}
          onChange={(e) => onDashboardTypeChange(e.target.value as "normal" | "trend")}
          size="small"
          sx={{ mt: 2 }}
        >
          <MenuItem value="normal">Normal</MenuItem>
          <MenuItem value="trend">Trend</MenuItem>
        </StyledSelect>

        {dashboardType === "trend" && (
          <StyledSelect
            label="Time Period"
            value={timePeriod}
            onChange={(e) => onTimePeriodChange(e.target.value as string)}
            size="small"
            sx={{ mt: 2 }}
          >
            <MenuItem value="1m">Last 1 Month</MenuItem>
            <MenuItem value="3m">Last 3 Months</MenuItem>
            <MenuItem value="6m">Last 6 Months</MenuItem>
            <MenuItem value="12m">Last 12 Months</MenuItem>
          </StyledSelect>
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
          disabled={!newDashboardName?.trim() || isCreating}
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