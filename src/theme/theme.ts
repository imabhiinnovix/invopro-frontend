import { createTheme } from '@mui/material/styles';
import { STYLE_GUIDE } from '../styles';
import './themeAugmentation';

// Define common values for reuse
const commonValues = {
  borderRadius: parseInt(STYLE_GUIDE.SPACING.s2),
  boxShadow: STYLE_GUIDE.SHADOWS.sm,
  colors: {
    primary: {
      main: STYLE_GUIDE.COLORS.primary,
      light: STYLE_GUIDE.COLORS.primaryLight,
      dark: STYLE_GUIDE.COLORS.primaryDark,
      contrastText: STYLE_GUIDE.COLORS.white,
    },
      background: {
      default: STYLE_GUIDE.COLORS.backgroundDefault,
      paper: STYLE_GUIDE.COLORS.white,
    },
    divider: STYLE_GUIDE.COLORS.divider,
  }
};

export const theme = createTheme({
  palette: {
    primary: commonValues.colors.primary,
    background: commonValues.colors.background,
    divider: commonValues.colors.divider,
    border: {
      main: STYLE_GUIDE.COLORS.borderGray,
      hover: STYLE_GUIDE.COLORS.materialPurpleDark,
    },
    input: {
      text: STYLE_GUIDE.COLORS.textDarkGray,
      border: STYLE_GUIDE.COLORS.borderGray,
      focusBorder: STYLE_GUIDE.COLORS.primary,
    },
    dropdown: {
      background: STYLE_GUIDE.COLORS.white,
      optionBackground: STYLE_GUIDE.COLORS.backgroundHover,
      optionText: STYLE_GUIDE.COLORS.textDarkGray,
      optionHoverBackground: STYLE_GUIDE.COLORS.backgroundLightGray,
    },
  },
  shape: {
    borderRadius: parseInt(STYLE_GUIDE.SPACING.s2),
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: commonValues.borderRadius,
          boxShadow: commonValues.boxShadow,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: commonValues.borderRadius,
          boxShadow: commonValues.boxShadow,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: commonValues.borderRadius,
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: commonValues.borderRadius,
          boxShadow: commonValues.boxShadow,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: commonValues.borderRadius,
          '&:hover': {
            backgroundColor: STYLE_GUIDE.COLORS.backgroundHover,
          },
          '&.Mui-selected': {
            backgroundColor: STYLE_GUIDE.COLORS.backgroundHover,
            color: commonValues.colors.primary.main,
            '&:hover': {
              backgroundColor: STYLE_GUIDE.COLORS.backgroundHover,
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: STYLE_GUIDE.COLORS.white,
            '& fieldset': {
              borderColor: STYLE_GUIDE.COLORS.borderGray,
            },
            '&:hover fieldset': {
              borderColor: STYLE_GUIDE.COLORS.primary,
            },
            '&.Mui-focused fieldset': {
              borderColor: STYLE_GUIDE.COLORS.primary,
            },
          },
          '& .MuiInputLabel-root': {
            color: STYLE_GUIDE.COLORS.textDarkGray,
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: STYLE_GUIDE.COLORS.primary,
          },
          '& .MuiSelect-select': {
            color: STYLE_GUIDE.COLORS.textDarkGray,
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: STYLE_GUIDE.COLORS.backgroundLightGray,
          },
          '&.Mui-selected': {
            backgroundColor: STYLE_GUIDE.COLORS.backgroundHover,
            '&:hover': {
              backgroundColor: STYLE_GUIDE.COLORS.backgroundLightGray,
            },
          },
        },
      },
    },
  },
});

// Export common values for use in styled components or sx props
export const themeValues = commonValues; 