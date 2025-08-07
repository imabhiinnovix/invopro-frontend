import { createTheme, Theme } from '@mui/material/styles';
import { STYLE_GUIDE } from '../styles';
import './themeAugmentation';

export interface DynamicThemeOptions {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
}

const commonValues = {
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

export const createDynamicTheme = (typographyOptions: DynamicThemeOptions = {}): Theme => {
  const {
    fontFamily = STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
    fontSize = STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
    fontWeight = STYLE_GUIDE.TYPOGRAPHY.fontWeight.regular,
  } = typographyOptions;

  return createTheme({
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
        border: STYLE_GUIDE.SPACING.s1,
        selectedText: STYLE_GUIDE.COLORS.textDarkGray,
        labelColor: STYLE_GUIDE.COLORS.textDarkGray,
        focusedBorder: STYLE_GUIDE.COLORS.primary,
        focusedLabel: STYLE_GUIDE.COLORS.primary
      },
      table: {
        headerBackground: STYLE_GUIDE.COLORS.backgroundLightGray,
        headerText: STYLE_GUIDE.COLORS.textGray,
        rowOddBackground: STYLE_GUIDE.COLORS.backgroundDefault,
        rowEvenBackground: STYLE_GUIDE.COLORS.white,
        rowHoverBackground: STYLE_GUIDE.COLORS.backgroundHover,
        rowText: STYLE_GUIDE.COLORS.textDarkGray,
      },
    },
    typography: {
      fontFamily,
      fontSize: parseInt(fontSize),
      h1: {
        fontFamily,
        fontWeight: parseInt(fontWeight),
      },
      h2: {
        fontFamily,
        fontWeight: parseInt(fontWeight),
      },
      h3: {
        fontFamily,
        fontWeight: parseInt(fontWeight),
      },
      h4: {
        fontFamily,
        fontWeight: parseInt(fontWeight),
      },
      h5: {
        fontFamily,
        fontWeight: parseInt(fontWeight),
      },
      h6: {
        fontFamily,
        fontWeight: parseInt(fontWeight),
      },
      body1: {
        fontFamily,
        fontSize,
        fontWeight: parseInt(fontWeight),
      },
      body2: {
        fontFamily,
        fontSize,
        fontWeight: parseInt(fontWeight),
      },
      button: {
        fontFamily,
        fontWeight: parseInt(fontWeight),
      },
      caption: {
        fontFamily,
        fontWeight: parseInt(fontWeight),
      },
      overline: {
        fontFamily,
        fontWeight: parseInt(fontWeight),
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: commonValues.boxShadow,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: commonValues.boxShadow,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontFamily,
            fontWeight: parseInt(fontWeight),
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            boxShadow: commonValues.boxShadow,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: STYLE_GUIDE.COLORS.backgroundLightGray,
            '& .MuiTableCell-root': {
              backgroundColor: STYLE_GUIDE.COLORS.backgroundLightGray,
              color: STYLE_GUIDE.COLORS.textGray,
              fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
              borderBottom: `2px solid ${STYLE_GUIDE.COLORS.divider}`,
              fontFamily,
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            fontFamily,
            fontWeight: parseInt(fontWeight),
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
            fontFamily,
            fontWeight: parseInt(fontWeight),
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
              fontFamily,
              fontWeight: parseInt(fontWeight),
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: STYLE_GUIDE.COLORS.primary,
            },
            '& .MuiSelect-select': {
              color: STYLE_GUIDE.COLORS.textDarkGray,
              fontFamily,
              fontWeight: parseInt(fontWeight),
            },
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontFamily,
            fontWeight: parseInt(fontWeight),
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
      MuiTypography: {
        styleOverrides: {
          root: {
            fontFamily,
            fontWeight: parseInt(fontWeight),
          },
        },
      },
    },
  });
}; 