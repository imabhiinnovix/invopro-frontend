import { createTheme } from '@mui/material/styles';
import { STYLE_GUIDE } from '../styles';

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
  },
});

// Export common values for use in styled components or sx props
export const themeValues = commonValues; 