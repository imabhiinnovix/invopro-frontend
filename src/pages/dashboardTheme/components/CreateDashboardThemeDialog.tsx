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
  MenuItem,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { ChromePicker } from 'react-color';
import { useAppDispatch } from '../../../storeHooks';
import { createDashboardTheme, updateDashboardTheme } from '../../../reducers/dashboardThemeSlice';
import { DashboardTheme, CreateDashboardThemeDialogProps } from '../../../types/dashboardTheme';
import { getDefaultDashboardTheme } from '../../../styles/themeConstants';
import { getColorFieldTooltip } from '../../../constants/colorFieldTooltips';
import { STYLE_GUIDE } from '../../../styles';
import { useUnifiedTheme } from '../../../hooks/useUnifiedTheme';

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
    const theme = useUnifiedTheme();
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
  const unifiedTheme = useUnifiedTheme();
  const dispatch = useAppDispatch();
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<DashboardTheme>(getDefaultTheme());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  

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
            <Tab label="Colors" />
            <Tab label="Typography" />
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
                    backgroundColor: unifiedTheme.palette.background.paper || '#ffffff',
                    '& fieldset': {
                      borderColor: unifiedTheme.palette.divider || STYLE_GUIDE.COLORS.darkBackground,
                    },
                    '&:hover fieldset': {
                      borderColor: unifiedTheme.palette.primary.main || STYLE_GUIDE.COLORS.darkBorderHover,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: unifiedTheme.palette.primary.main || STYLE_GUIDE.COLORS.inputFocusFallback,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: unifiedTheme.palette.text.secondary || STYLE_GUIDE.COLORS.darkBorderFocus,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: unifiedTheme.palette.primary.main || STYLE_GUIDE.COLORS.inputFocusFallback,
                  },
                  '& .MuiInputBase-input': {
                    color: `${unifiedTheme.palette.text.primary} !important`,
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: `${unifiedTheme.palette.text.secondary || '#666'} !important`,
                  },
                  '& .MuiInputBase-input:-webkit-autofill': {
                    WebkitTextFillColor: `${unifiedTheme.palette.text.primary} !important`,
                    WebkitBoxShadow: `0 0 0 1000px ${unifiedTheme.palette.background.paper || '#ffffff'} inset !important`,
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
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Dropdown Selected Text" path="colors.dropdownSelectedText" color={formData.colors.dropdownSelectedText} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Dropdown Label Color" path="colors.dropdownLabelColor" color={formData.colors.dropdownLabelColor} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Dropdown Focused Border" path="colors.dropdownFocusedBorder" color={formData.colors.dropdownFocusedBorder} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Dropdown Focused Label" path="colors.dropdownFocusedLabel" color={formData.colors.dropdownFocusedLabel} />
                    </Grid>
                  </Grid>
                </Paper>

                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                    Icon Colors
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Icon Color" path="colors.iconPrimary" color={formData.colors.iconPrimary} />
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
                    Dialog Colors
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Dialog Background" path="components.dialog.backgroundColor" color={formData.components.dialog.backgroundColor} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Dialog Border Color" path="components.dialog.borderColor" color={formData.components.dialog.borderColor} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Dialog Title Color" path="components.dialog.titleColor" color={formData.components.dialog.titleColor} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Dialog Content Color" path="components.dialog.contentColor" color={formData.components.dialog.contentColor} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <ColorPickerField label="Dialog Overlay Color" path="components.dialog.overlayColor" color={formData.components.dialog.overlayColor} />
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

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
              Component-Specific Typography Settings
            </Typography>
            
            {/* Global Typography */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Global Typography (Fallback)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Font Family"
                    value={formData.typography?.fontFamily || STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary}
                    onChange={(e) => handleInputChange('typography.fontFamily', e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {STYLE_GUIDE.TYPOGRAPHY.fontOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Font Size"
                    value={formData.typography?.fontSize || STYLE_GUIDE.TYPOGRAPHY.fontSize.base}
                    onChange={(e) => handleInputChange('typography.fontSize', e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {Object.entries(STYLE_GUIDE.TYPOGRAPHY.fontSize).map(([key, value]) => (
                      <MenuItem key={value} value={value}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Font Weight"
                    value={formData.typography?.fontWeight || STYLE_GUIDE.TYPOGRAPHY.fontWeight.regular}
                    onChange={(e) => handleInputChange('typography.fontWeight', e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {Object.entries(STYLE_GUIDE.TYPOGRAPHY.fontWeight).map(([key, value]) => (
                      <MenuItem key={value} value={value}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Paper>

            {/* Headings Typography */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Headings Typography
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Font Family"
                    value={formData.typography?.headings?.fontFamily || formData.typography?.fontFamily || STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary}
                    onChange={(e) => handleInputChange('typography.headings.fontFamily', e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {STYLE_GUIDE.TYPOGRAPHY.fontOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Font Size"
                    value={formData.typography?.headings?.fontSize || formData.typography?.fontSize || STYLE_GUIDE.TYPOGRAPHY.fontSize.large}
                    onChange={(e) => handleInputChange('typography.headings.fontSize', e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {Object.entries(STYLE_GUIDE.TYPOGRAPHY.fontSize).map(([key, value]) => (
                      <MenuItem key={value} value={value}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Font Weight"
                    value={formData.typography?.headings?.fontWeight || formData.typography?.fontWeight || STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold}
                    onChange={(e) => handleInputChange('typography.headings.fontWeight', e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {Object.entries(STYLE_GUIDE.TYPOGRAPHY.fontWeight).map(([key, value]) => (
                      <MenuItem key={value} value={value}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Paper>

            {/* Body Text Typography */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Body Text Typography
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Font Family"
                    value={formData.typography?.body?.fontFamily || formData.typography?.fontFamily || STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary}
                    onChange={(e) => handleInputChange('typography.body.fontFamily', e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {STYLE_GUIDE.TYPOGRAPHY.fontOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Font Size"
                    value={formData.typography?.body?.fontSize || formData.typography?.fontSize || STYLE_GUIDE.TYPOGRAPHY.fontSize.base}
                    onChange={(e) => handleInputChange('typography.body.fontSize', e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {Object.entries(STYLE_GUIDE.TYPOGRAPHY.fontSize).map(([key, value]) => (
                      <MenuItem key={value} value={value}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Font Weight"
                    value={formData.typography?.body?.fontWeight || formData.typography?.fontWeight || STYLE_GUIDE.TYPOGRAPHY.fontWeight.regular}
                    onChange={(e) => handleInputChange('typography.body.fontWeight', e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {Object.entries(STYLE_GUIDE.TYPOGRAPHY.fontWeight).map(([key, value]) => (
                      <MenuItem key={value} value={value}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Paper>

            {/* Buttons Typography */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Buttons Typography
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Font Family"
                    value={formData.typography?.buttons?.fontFamily || formData.typography?.fontFamily || STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary}
                    onChange={(e) => handleInputChange('typography.buttons.fontFamily', e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {STYLE_GUIDE.TYPOGRAPHY.fontOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Font Size"
                    value={formData.typography?.buttons?.fontSize || formData.typography?.fontSize || STYLE_GUIDE.TYPOGRAPHY.fontSize.small}
                    onChange={(e) => handleInputChange('typography.buttons.fontSize', e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {Object.entries(STYLE_GUIDE.TYPOGRAPHY.fontSize).map(([key, value]) => (
                      <MenuItem key={value} value={value}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Font Weight"
                    value={formData.typography?.buttons?.fontWeight || formData.typography?.fontWeight || STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium}
                    onChange={(e) => handleInputChange('typography.buttons.fontWeight', e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {Object.entries(STYLE_GUIDE.TYPOGRAPHY.fontWeight).map(([key, value]) => (
                      <MenuItem key={value} value={value}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Paper>

            {/* Cards Typography */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Cards Typography
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Font Family"
                    value={formData.typography?.cards?.fontFamily || formData.typography?.fontFamily || STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary}
                    onChange={(e) => handleInputChange('typography.cards.fontFamily', e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {STYLE_GUIDE.TYPOGRAPHY.fontOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Font Size"
                    value={formData.typography?.cards?.fontSize || formData.typography?.fontSize || STYLE_GUIDE.TYPOGRAPHY.fontSize.base}
                    onChange={(e) => handleInputChange('typography.cards.fontSize', e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {Object.entries(STYLE_GUIDE.TYPOGRAPHY.fontSize).map(([key, value]) => (
                      <MenuItem key={value} value={value}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Font Weight"
                    value={formData.typography?.cards?.fontWeight || formData.typography?.fontWeight || STYLE_GUIDE.TYPOGRAPHY.fontWeight.regular}
                    onChange={(e) => handleInputChange('typography.cards.fontWeight', e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {Object.entries(STYLE_GUIDE.TYPOGRAPHY.fontWeight).map(([key, value]) => (
                      <MenuItem key={value} value={value}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Paper>

            {/* Inputs Typography */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Inputs Typography
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Font Family"
                    value={formData.typography?.inputs?.fontFamily || formData.typography?.fontFamily || STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary}
                    onChange={(e) => handleInputChange('typography.inputs.fontFamily', e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {STYLE_GUIDE.TYPOGRAPHY.fontOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Font Size"
                    value={formData.typography?.inputs?.fontSize || formData.typography?.fontSize || STYLE_GUIDE.TYPOGRAPHY.fontSize.small}
                    onChange={(e) => handleInputChange('typography.inputs.fontSize', e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {Object.entries(STYLE_GUIDE.TYPOGRAPHY.fontSize).map(([key, value]) => (
                      <MenuItem key={value} value={value}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Font Weight"
                    value={formData.typography?.inputs?.fontWeight || formData.typography?.fontWeight || STYLE_GUIDE.TYPOGRAPHY.fontWeight.regular}
                    onChange={(e) => handleInputChange('typography.inputs.fontWeight', e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {Object.entries(STYLE_GUIDE.TYPOGRAPHY.fontWeight).map(([key, value]) => (
                      <MenuItem key={value} value={value}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Paper>

            {/* Tables Typography */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Tables Typography
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Font Family"
                    value={formData.typography?.tables?.fontFamily || formData.typography?.fontFamily || STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary}
                    onChange={(e) => handleInputChange('typography.tables.fontFamily', e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {STYLE_GUIDE.TYPOGRAPHY.fontOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Font Size"
                    value={formData.typography?.tables?.fontSize || formData.typography?.fontSize || STYLE_GUIDE.TYPOGRAPHY.fontSize.small}
                    onChange={(e) => handleInputChange('typography.tables.fontSize', e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {Object.entries(STYLE_GUIDE.TYPOGRAPHY.fontSize).map(([key, value]) => (
                      <MenuItem key={value} value={value}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Font Weight"
                    value={formData.typography?.tables?.fontWeight || formData.typography?.fontWeight || STYLE_GUIDE.TYPOGRAPHY.fontWeight.regular}
                    onChange={(e) => handleInputChange('typography.tables.fontWeight', e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {Object.entries(STYLE_GUIDE.TYPOGRAPHY.fontWeight).map(([key, value]) => (
                      <MenuItem key={value} value={value}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Paper>

            {/* Navigation Typography */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Navigation Typography
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Font Family"
                    value={formData.typography?.navigation?.fontFamily || formData.typography?.fontFamily || STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary}
                    onChange={(e) => handleInputChange('typography.navigation.fontFamily', e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {STYLE_GUIDE.TYPOGRAPHY.fontOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Font Size"
                    value={formData.typography?.navigation?.fontSize || formData.typography?.fontSize || STYLE_GUIDE.TYPOGRAPHY.fontSize.small}
                    onChange={(e) => handleInputChange('typography.navigation.fontSize', e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {Object.entries(STYLE_GUIDE.TYPOGRAPHY.fontSize).map(([key, value]) => (
                      <MenuItem key={value} value={value}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Font Weight"
                    value={formData.typography?.navigation?.fontWeight || formData.typography?.fontWeight || STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium}
                    onChange={(e) => handleInputChange('typography.navigation.fontWeight', e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {Object.entries(STYLE_GUIDE.TYPOGRAPHY.fontWeight).map(([key, value]) => (
                      <MenuItem key={value} value={value}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Paper>

            {/* Typography Preview */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Typography Preview
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      p: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      backgroundColor: 'background.paper',
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        fontFamily: formData.typography?.headings?.fontFamily || formData.typography?.fontFamily || STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: formData.typography?.headings?.fontSize || formData.typography?.fontSize || STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
                        fontWeight: formData.typography?.headings?.fontWeight || formData.typography?.fontWeight || STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
                        mb: 2,
                      }}
                    >
                      Heading Text
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: formData.typography?.body?.fontFamily || formData.typography?.fontFamily || STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: formData.typography?.body?.fontSize || formData.typography?.fontSize || STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                        fontWeight: formData.typography?.body?.fontWeight || formData.typography?.fontWeight || STYLE_GUIDE.TYPOGRAPHY.fontWeight.regular,
                        mb: 2,
                      }}
                    >
                      This is body text that demonstrates the typography settings for regular content.
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{
                        fontFamily: formData.typography?.buttons?.fontFamily || formData.typography?.fontFamily || STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: formData.typography?.buttons?.fontSize || formData.typography?.fontSize || STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        fontWeight: formData.typography?.buttons?.fontWeight || formData.typography?.fontWeight || STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                      }}
                    >
                      Button Text
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      p: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      backgroundColor: 'background.paper',
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Card Content
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: formData.typography?.cards?.fontFamily || formData.typography?.fontFamily || STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: formData.typography?.cards?.fontSize || formData.typography?.fontSize || STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                        fontWeight: formData.typography?.cards?.fontWeight || formData.typography?.fontWeight || STYLE_GUIDE.TYPOGRAPHY.fontWeight.regular,
                        mb: 2,
                      }}
                    >
                      This is card content with its own typography settings.
                    </Typography>
                    <TextField
                      fullWidth
                      label="Input Field"
                      sx={{
                        '& .MuiInputBase-input': {
                          fontFamily: formData.typography?.inputs?.fontFamily || formData.typography?.fontFamily || STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                          fontSize: formData.typography?.inputs?.fontSize || formData.typography?.fontSize || STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                          fontWeight: formData.typography?.inputs?.fontWeight || formData.typography?.fontWeight || STYLE_GUIDE.TYPOGRAPHY.fontWeight.regular,
                        },
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
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