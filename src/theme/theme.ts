import { createTheme } from '@mui/material/styles';

// Define common values for reuse
const commonValues = {
  borderRadius: '8px',
  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
  colors: {
    primary: {
      main: '#a136a1',
      light: '#b459b4',
      dark: '#8c2d8c',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f1f5f9',
      paper: '#ffffff',
    },
    divider: '#e0e0e0',
  }
};

export const theme = createTheme({
  palette: {
    primary: commonValues.colors.primary,
    background: commonValues.colors.background,
    divider: commonValues.colors.divider,
  },
  shape: {
    borderRadius: 8,
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
            backgroundColor: commonValues.colors.background.default,
          },
          '&.Mui-selected': {
            backgroundColor: commonValues.colors.background.default,
            color: commonValues.colors.primary.main,
            '&:hover': {
              backgroundColor: commonValues.colors.background.default,
            },
          },
        },
      },
    },
  },
});

// Export common values for use in styled components or sx props
export const themeValues = commonValues; 