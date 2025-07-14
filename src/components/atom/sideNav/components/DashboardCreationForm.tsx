import React from 'react';
import { Box, TextField, MenuItem } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useDashboardTheme } from '../../../../context/DashboardThemeProvider';
import { useTheme } from '@mui/material';
import { STYLE_GUIDE } from '../../../../styles';
import StyledSelect from '../../common/StyledSelect';

interface DashboardCreationFormProps {
  newDashboardName: string;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCreate: () => void;
  onCancel: () => void;
  isCreatingLoading: boolean;
  dashboardType: 'normal' | 'trend';
  onDashboardTypeChange: (type: 'normal' | 'trend') => void;
}

export const DashboardCreationForm: React.FC<DashboardCreationFormProps> = ({
  newDashboardName,
  onNameChange,
  onCreate,
  onCancel,
  isCreatingLoading,
  dashboardType,
  onDashboardTypeChange,
}) => {
  const { currentTheme } = useDashboardTheme();
  const theme = useTheme();
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
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: STYLE_GUIDE.SPACING.s2, alignItems: 'flex-start', paddingRight: STYLE_GUIDE.SPACING.s2, fontSize: '14px', backgroundColor: currentTheme?.colors?.background?.paper || '#ffffff', '& fieldset': { borderColor: currentTheme?.colors?.inputBorder || STYLE_GUIDE.COLORS.darkBackground, }, '&:hover fieldset': { borderColor: currentTheme?.colors?.borderHover || STYLE_GUIDE.COLORS.darkBorderHover, }, '&.Mui-focused fieldset': { borderColor: currentTheme?.components?.input?.focusBorderColor || currentTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback, }, }, '& .MuiInputLabel-root': { color: currentTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus, }, '& .MuiInputLabel-root.Mui-focused': { color: currentTheme?.components?.input?.focusBorderColor || currentTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback, }, '& .MuiInputBase-input': { color: `${currentTheme?.colors?.inputText || theme.palette.text.primary} !important`, }, '& .MuiInputBase-input::placeholder': { color: `${currentTheme?.colors?.text?.secondary || '#666'} !important`, }, '& .MuiInputBase-input:-webkit-autofill': { WebkitTextFillColor: `${currentTheme?.colors?.inputText || theme.palette.text.primary} !important`, WebkitBoxShadow: `0 0 0 1000px ${currentTheme?.colors?.background?.paper || '#ffffff'} inset !important`, }, }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
        <StyledSelect
          label="Dashboard Type"
          value={dashboardType}
          onChange={(e) => onDashboardTypeChange(e.target.value as 'normal' | 'trend')}
          size="small"
          sx={{ mb: 1, minWidth: 150 }}
        >
          <MenuItem value="normal">Normal</MenuItem>
          <MenuItem value="trend">Trend</MenuItem>
        </StyledSelect>
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