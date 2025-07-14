import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Stack,
  Tabs,
  Tab,
  Typography,
  Grid,
  CircularProgress,
  Tooltip,
  IconButton,
  Paper,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { ChromePicker } from 'react-color';
import { useAppDispatch } from '../../../storeHooks';
import { createDashboardTheme, updateDashboardTheme } from '../../../reducers/dashboardThemeSlice';
import { DashboardTheme, CreateDashboardThemeDialogProps } from '../../../types/dashboardTheme';
import { getDefaultDashboardTheme } from '../../../styles/themeConstants';
import { getColorFieldTooltip } from '../../../constants/colorFieldTooltips';
import { STYLE_GUIDE } from '../../../styles';
import { useDashboardTheme } from '../../../context/DashboardThemeProvider';

const getDefaultTheme = (): DashboardTheme => ({
  ...getDefaultDashboardTheme(),
  name: '',
  description: '',
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`theme-tabpanel-${index}`}
      aria-labelledby={`theme-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const CreateDashboardThemeDialog: React.FC<CreateDashboardThemeDialogProps> = ({
  open,
  onClose,
  theme,
}) => {
  const dispatch = useAppDispatch();
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<DashboardTheme>(getDefaultTheme());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { currentTheme } = useDashboardTheme();

  useEffect(() => {
    if (theme) {
      setFormData(theme);
    } else {
      setFormData(getDefaultTheme());
    }
  }, [theme]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (path: string, value: any) => {
    setFormData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleColorChange = (path: string, color: any) => {
    console.log('Color changed:', path, color.hex);
    handleInputChange(path, color.hex);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Theme name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (theme?._id) {
        dispatch(updateDashboardTheme({ id: theme._id, themeData: formData }));
      } else {
        dispatch(createDashboardTheme(formData));
      }
      onClose();
    } catch (error) {
      console.error('Error saving theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const ColorPickerField = ({ label, path, color }: { label: string; path: string; color: string }) => {
    const tooltipText = getColorFieldTooltip(label);

    return (
      <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '4px',
              backgroundColor: color,
              border: '1px solid #ccc',
              mr: 1
            }}
          />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {label}
          </Typography>
          {tooltipText && (
            <Tooltip title={tooltipText} placement="top">
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <ChromePicker
          key={path}
          color={color}
          onChange={(color) => handleColorChange(path, color)}
          onChangeComplete={(color) => handleColorChange(path, color)}
          disableAlpha
        />
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        {theme ? 'Edit Dashboard Theme' : 'Create New Dashboard Theme'}
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="theme settings tabs">
            <Tab label="Theme Selection" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Stack spacing={3}>
              <TextField
                label="Theme Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                fullWidth
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: STYLE_GUIDE.SPACING.s6,
                    alignItems: 'flex-start',
                    mb: 2,
                    paddingRight: STYLE_GUIDE.SPACING.s2,
                    fontSize: '14px',
                    padding: '12px 16px',
                    backgroundColor: currentTheme?.colors?.background?.paper || '#ffffff',
                    '& fieldset': {
                      borderColor: currentTheme?.colors?.inputBorder || STYLE_GUIDE.COLORS.darkBackground,
                    },
                    '&:hover fieldset': {
                      borderColor: currentTheme?.colors?.borderHover || STYLE_GUIDE.COLORS.darkBorderHover,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: currentTheme?.components?.input?.focusBorderColor || currentTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: currentTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: currentTheme?.components?.input?.focusBorderColor || currentTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback,
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
            </Stack>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                    Primary Colors
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Primary" path="colors.primary.main" color={formData.colors.primary.main} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Primary Hover" path="colors.primary.light" color={formData.colors.primary.light} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Primary Text" path="colors.primary.contrastText" color={formData.colors.primary.contrastText} />
                    </Grid>
                  </Grid>
                </Paper>

                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                    Secondary Colors
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Secondary" path="colors.secondary.main" color={formData.colors.secondary.main} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Secondary Hover" path="colors.secondary.light" color={formData.colors.secondary.light} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Secondary Text" path="colors.secondary.contrastText" color={formData.colors.secondary.contrastText} />
                    </Grid>
                  </Grid>
                </Paper>

                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                    Input & Dropdown Colors
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Input Text Color" path="colors.inputText" color={formData.colors.inputText} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Input Border Color" path="colors.inputBorder" color={formData.colors.inputBorder} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Input Focus Border Color" path="components.input.focusBorderColor" color={formData.components.input.focusBorderColor} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Input Focus Border Fallback" path="components.input.focusBorderColorFallback" color={formData.components.input.focusBorderColorFallback} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Dropdown Background" path="colors.dropdownBg" color={formData.colors.dropdownBg} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Dropdown Border Color" path="colors.dropdownBorder" color={formData.colors.dropdownBorder} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Dropdown Option Background" path="colors.dropdownOptionBg" color={formData.colors.dropdownOptionBg} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Dropdown Option Text" path="colors.dropdownOptionText" color={formData.colors.dropdownOptionText} />
                    </Grid>
                  </Grid>
                </Paper>

                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                    Table Colors
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Table Header Background" path="components.table.headerBackground" color={formData.components.table.headerBackground} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Table Header Text" path="components.table.headerText" color={formData.components.table.headerText} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Table Row Odd Background" path="components.table.rowOddBackground" color={formData.components.table.rowOddBackground} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Table Row Even Background" path="components.table.rowEvenBackground" color={formData.components.table.rowEvenBackground} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Table Row Hover Background" path="components.table.rowHoverBackground" color={formData.components.table.rowHoverBackground} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Table Row Text" path="components.table.rowText" color={formData.components.table.rowText} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Table Border Color" path="components.table.borderColor" color={formData.components.table.borderColor} />
                    </Grid>
                  </Grid>
                </Paper>

                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                    Background & Text
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Background Default" path="colors.background.default" color={formData.colors.background.default} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Background Paper" path="colors.background.paper" color={formData.colors.background.paper} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Card Background" path="colors.background.card" color={formData.colors.background.card} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Text Primary" path="colors.text.primary" color={formData.colors.text.primary} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Text Secondary" path="colors.text.secondary" color={formData.colors.text.secondary} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Text Disabled" path="colors.text.disabled" color={formData.colors.text.disabled} />
                    </Grid>
                  </Grid>
                </Paper>

                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                      Additional Colors
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}>
                        <ColorPickerField label="Divider" path="colors.divider" color={formData.colors.divider} />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <ColorPickerField label="Border" path="colors.border" color={formData.colors.border} />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <ColorPickerField label="Border Hover" path="colors.borderHover" color={formData.colors.borderHover} />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <ColorPickerField label="Background Hover" path="colors.background.hover" color={formData.colors.background.hover} />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <ColorPickerField label="Background Surface" path="colors.background.surface" color={formData.colors.background.surface} />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="secondary" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading || !formData.name.trim()}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Saving...' : (theme ? 'Update Theme' : 'Create Theme')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateDashboardThemeDialog; 