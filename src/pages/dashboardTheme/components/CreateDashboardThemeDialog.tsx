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
import { STYLE_GUIDE } from '../../../styles';

// Default theme based on style guide
const getDefaultTheme = (): DashboardTheme => ({
  name: '',
  description: '',
  colors: {
    primary: {
      main: STYLE_GUIDE.COLORS.primary,
      light: STYLE_GUIDE.COLORS.primaryLight,

      contrastText: STYLE_GUIDE.COLORS.white,
    },
    secondary: {
      main: STYLE_GUIDE.COLORS.materialBlue,
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: STYLE_GUIDE.COLORS.white,
    },

    background: {
      default: STYLE_GUIDE.COLORS.backgroundDefault,
      paper: STYLE_GUIDE.COLORS.white,
      surface: STYLE_GUIDE.COLORS.backgroundSurface,
      hover: STYLE_GUIDE.COLORS.backgroundHover,
      card: STYLE_GUIDE.COLORS.backgroundSurface,
      dropdown: STYLE_GUIDE.COLORS.white,
    },
    text: {
      primary: STYLE_GUIDE.COLORS.textDarkGray,
      secondary: STYLE_GUIDE.COLORS.textMediumGray,
      disabled: STYLE_GUIDE.COLORS.textGray,
      hint: STYLE_GUIDE.COLORS.textMediumGray,
    },
    divider: STYLE_GUIDE.COLORS.divider,
    border: STYLE_GUIDE.COLORS.borderGray,
    borderHover: STYLE_GUIDE.COLORS.materialPurpleDark,
    inputText: STYLE_GUIDE.COLORS.textDarkGray,
    inputBorder: STYLE_GUIDE.COLORS.borderGray,
    dropdownBg: STYLE_GUIDE.COLORS.white,
    dropdownOptionBg: STYLE_GUIDE.COLORS.backgroundHover,
    dropdownOptionText: STYLE_GUIDE.COLORS.textDarkGray,
  },
  typography: {
    fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily,
    fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize,
    fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight,
    lineHeight: STYLE_GUIDE.TYPOGRAPHY.lineHeight,
    letterSpacing: STYLE_GUIDE.TYPOGRAPHY.letterSpacing,
  },
  components: {
    button: {
      borderRadius: STYLE_GUIDE.SPACING.s2,
      textTransform: 'none',
      fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
      fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
      padding: {
        small: '6px 16px',
        medium: '8px 24px',
        large: '12px 32px',
      },
      minHeight: {
        small: '32px',
        medium: '40px',
        large: '48px',
      },
    },
    card: {
      borderRadius: STYLE_GUIDE.SPACING.s2,
      boxShadow: STYLE_GUIDE.SHADOWS.sm,
      padding: STYLE_GUIDE.SPACING.s4,
    },
    paper: {
      borderRadius: STYLE_GUIDE.SPACING.s2,
      boxShadow: STYLE_GUIDE.SHADOWS.sm,
    },
    input: {
      borderRadius: STYLE_GUIDE.SPACING.s1,
      fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
      padding: '12px 16px',
      borderColor: STYLE_GUIDE.COLORS.borderGray,
      focusBorderColor: STYLE_GUIDE.COLORS.primary,
    },
    table: {
      borderRadius: STYLE_GUIDE.SPACING.s2,
      boxShadow: STYLE_GUIDE.SHADOWS.sm,
      headerBackground: STYLE_GUIDE.COLORS.backgroundLightGray,
      rowHoverBackground: STYLE_GUIDE.COLORS.backgroundHover,
      borderColor: STYLE_GUIDE.COLORS.divider,
    },
    navigation: {
      backgroundColor: STYLE_GUIDE.COLORS.white,
      textColor: STYLE_GUIDE.COLORS.textDarkGray,
      activeBackground: STYLE_GUIDE.COLORS.primary,
      activeTextColor: STYLE_GUIDE.COLORS.white,
      hoverBackground: STYLE_GUIDE.COLORS.backgroundHover,
      hoverTextColor: STYLE_GUIDE.COLORS.textDarkGray,
    },
    sidebar: {
      backgroundColor: STYLE_GUIDE.COLORS.white,
      textColor: STYLE_GUIDE.COLORS.textDarkGray,
      activeBackground: STYLE_GUIDE.COLORS.primary,
      activeTextColor: STYLE_GUIDE.COLORS.white,
      hoverBackground: STYLE_GUIDE.COLORS.backgroundHover,
      hoverTextColor: STYLE_GUIDE.COLORS.textDarkGray,
      width: '280px',
    },
    header: {
      backgroundColor: STYLE_GUIDE.COLORS.white,
      textColor: STYLE_GUIDE.COLORS.textDarkGray,
      height: '64px',
      boxShadow: STYLE_GUIDE.SHADOWS.sm,
    },
  },
  spacing: {
    s0: STYLE_GUIDE.SPACING.s0,
    s1: STYLE_GUIDE.SPACING.s1,
    s2: STYLE_GUIDE.SPACING.s2,
    s3: STYLE_GUIDE.SPACING.s3,
    s4: STYLE_GUIDE.SPACING.s4,
    s5: STYLE_GUIDE.SPACING.s5,
    s6: STYLE_GUIDE.SPACING.s6,
    s7: STYLE_GUIDE.SPACING.s7,
    s8: STYLE_GUIDE.SPACING.s8,
    s9: STYLE_GUIDE.SPACING.s9,
    s10: STYLE_GUIDE.SPACING.s10,
    s11: STYLE_GUIDE.SPACING.s11,
    s12: STYLE_GUIDE.SPACING.s12,
    s13: STYLE_GUIDE.SPACING.s13,
    s14: STYLE_GUIDE.SPACING.s14,
    s15: STYLE_GUIDE.SPACING.s15,
  },
  shadows: STYLE_GUIDE.SHADOWS,
  layout: {
    maxWidth: '1200px',
    containerPadding: STYLE_GUIDE.SPACING.s4,
    gridGap: STYLE_GUIDE.SPACING.s3,
  },
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

  useEffect(() => {
    if (theme) {
      setFormData(theme);
    } else {
      setFormData(getDefaultTheme());
    }
  }, [theme]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
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
    const getTooltipText = (label: string) => {
      switch (label) {
        case 'Background Paper':
          return 'Used for cards, dialogs, paper components, and elevated surfaces throughout the app';
        case 'Text Primary':
          return 'Main text color for headings, body text, and primary content across all pages';
        case 'Background Default':
          return 'Main page background color for the entire application';
        case 'Text Secondary':
          return 'Secondary text color for captions, descriptions, and less important content';
        case 'Text Disabled':
          return 'Text color for disabled buttons, inputs, and inactive UI elements';
        case 'Primary':
          return 'Main brand color for buttons, links, and primary UI elements';
        case 'Primary Light':
          return 'Lighter variant of primary color for hover states and subtle highlights';

        case 'Primary Text':
          return 'Text color for primary buttons and elements with primary background';
        case 'Primary Hover':
          return 'Background color for primary button hover states';
        case 'Secondary':
          return 'Secondary brand color for alternative actions and UI elements';
        case 'Secondary Text':
          return 'Text color for secondary buttons and elements with secondary background';
        case 'Secondary Hover':
          return 'Background color for secondary button hover states';

        case 'Divider':
          return 'Color for borders, dividers, and separation lines';
        case 'Border':
          return 'Color for input borders, card borders, and UI boundaries';
        case 'Border Hover':
          return 'Color for border hover states on cards, buttons, and interactive elements';
        case 'Background Hover':
          return 'Background color for hover states on buttons, cards, and interactive elements';
        case 'Background Surface':
          return 'Color for surface elements like toolbars, headers, and navigation areas';
        default:
          return '';
      }
    };

    const tooltipText = getTooltipText(label);

    return (
      <Box sx={{ mb: 2, p: 1.5, border: '1px solid #e0e0e0', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: '3px',
              backgroundColor: color,
              border: '1px solid #ccc',
              mr: 1
            }}
          />
          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
            {label}
          </Typography>
          {tooltipText && (
            <Tooltip title={tooltipText} placement="top">
              <IconButton size="small" sx={{ ml: 1, p: 0.5 }}>
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
          styles={{
            default: {
              picker: {
                width: '100%',
                boxShadow: 'none',
                border: '1px solid #e0e0e0'
              }
            }
          }}
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

        {/* Theme Selection Tab */}
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
                sx={{ mb: 2 }}
              />
            </Stack>

            <Grid container spacing={3}>
              {/* Row for the four main color groups */}
              <Grid container spacing={3} direction="row">
                <Grid item xs={12} md={3}>
                  <Paper elevation={2} sx={{ p: 2.5, mb: 3, height: 'fit-content' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, fontSize: '1rem' }}>
                      Primary Colors
                    </Typography>
                    <Stack spacing={1}>
                      <ColorPickerField label="Primary" path="colors.primary.main" color={formData.colors.primary.main} />
                      <ColorPickerField label="Primary Hover" path="colors.primary.light" color={formData.colors.primary.light} />
                      <ColorPickerField label="Primary Text" path="colors.primary.contrastText" color={formData.colors.primary.contrastText} />
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Paper elevation={2} sx={{ p: 2.5, mb: 3, height: 'fit-content' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, fontSize: '1rem' }}>
                      Secondary Colors
                    </Typography>
                    <Stack spacing={1}>
                      <ColorPickerField label="Secondary" path="colors.secondary.main" color={formData.colors.secondary.main} />
                      <ColorPickerField label="Secondary Hover" path="colors.secondary.light" color={formData.colors.secondary.light} />
                      <ColorPickerField label="Secondary Text" path="colors.secondary.contrastText" color={formData.colors.secondary.contrastText} />
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Paper elevation={2} sx={{ p: 2.5, mb: 3, height: 'fit-content' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, fontSize: '1rem' }}>
                      Input & Dropdown Colors
                    </Typography>
                    <Stack spacing={1}>
                      <ColorPickerField label="Input Text Color" path="colors.inputText" color={formData.colors.inputText} />
                      <ColorPickerField label="Input Border Color" path="colors.inputBorder" color={formData.colors.inputBorder} />
                      <ColorPickerField label="Dropdown Background" path="colors.dropdownBg" color={formData.colors.dropdownBg} />
                      <ColorPickerField label="Dropdown Option Background" path="colors.dropdownOptionBg" color={formData.colors.dropdownOptionBg} />
                      <ColorPickerField label="Dropdown Option Text" path="colors.dropdownOptionText" color={formData.colors.dropdownOptionText} />
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Paper elevation={2} sx={{ p: 2.5, mb: 3, height: 'fit-content' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, fontSize: '1rem' }}>
                      Background & Text
                    </Typography>
                    <Stack spacing={1}>
                      <ColorPickerField label="Background Default" path="colors.background.default" color={formData.colors.background.default} />
                      <ColorPickerField label="Background Paper" path="colors.background.paper" color={formData.colors.background.paper} />
                      <ColorPickerField label="Card Background" path="colors.background.card" color={formData.colors.background.card} />
                      <ColorPickerField label="Dropdown Background" path="colors.background.dropdown" color={formData.colors.background.dropdown} />
                      <ColorPickerField label="Text Primary" path="colors.text.primary" color={formData.colors.text.primary} />
                      <ColorPickerField label="Text Secondary" path="colors.text.secondary" color={formData.colors.text.secondary} />
                      <ColorPickerField label="Text Disabled" path="colors.text.disabled" color={formData.colors.text.disabled} />
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>

              {/* Additional Colors full-width below */}
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