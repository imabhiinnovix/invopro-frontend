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
        headerBackground: STYLE_GUIDE.COLORS.white,
        headerText: STYLE_GUIDE.COLORS.tableHeaderText,
        rowOddBackground: STYLE_GUIDE.COLORS.white,
        rowEvenBackground: STYLE_GUIDE.COLORS.white,
        rowHoverBackground: STYLE_GUIDE.COLORS.backgroundHover,
        rowText: STYLE_GUIDE.COLORS.tableBodyText,
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
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: '10px',
            border: `1px solid ${STYLE_GUIDE.COLORS.tableBorder}`,
            overflow: 'hidden',
            backgroundColor: STYLE_GUIDE.COLORS.white,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: STYLE_GUIDE.COLORS.white,
            '& .MuiTableCell-root': {
              backgroundColor: STYLE_GUIDE.COLORS.white,
              color: STYLE_GUIDE.COLORS.tableHeaderText,
              fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
              borderBottom: `1px solid ${STYLE_GUIDE.COLORS.tableBorder}`,
              padding: '14px 16px',
              fontFamily,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            color: STYLE_GUIDE.COLORS.tableBodyText,
            borderBottom: `1px solid ${STYLE_GUIDE.COLORS.tableBorder}`,
            padding: '14px 16px',
            fontFamily,
            fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            backgroundColor: STYLE_GUIDE.COLORS.white,
            fontFamily,
            '&:nth-of-type(odd), &:nth-of-type(even)': {
              backgroundColor: STYLE_GUIDE.COLORS.white,
            },
            '&:hover': {
              backgroundColor: STYLE_GUIDE.COLORS.backgroundHover,
            },
            '&.Mui-selected': {
              backgroundColor: `${commonValues.colors.primary.light}15`,
              '&:hover': {
                backgroundColor: `${commonValues.colors.primary.light}25`,
              },
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
      MuiOutlinedInput: {
        styleOverrides: {
          root: (opts) => ({
            backgroundColor: STYLE_GUIDE.COLORS.inputFieldBackground,
            borderRadius: '10px',
            fontSize: '16px',
            '&:not(.MuiInputBase-multiline)': {
              height: '40px',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
            },
            [opts.theme.breakpoints.up('md')]: {
              fontSize: '14px',
            },
            '& fieldset': {
              borderColor: STYLE_GUIDE.COLORS.inputFieldBorder,
            },
            '&:hover fieldset': {
              borderColor: opts.theme.palette.primary.main,
            },
            '&.Mui-focused fieldset': {
              borderColor: opts.theme.palette.primary.main,
            },
            '& .MuiOutlinedInput-input': {
              padding: '10px 14px',
              height: '100% !important',
              boxSizing: 'border-box',
              fontSize: 'inherit',
              lineHeight: 1.25,
            },
          }),
          input: (opts) => ({
            fontSize: '16px',
            [opts.theme.breakpoints.up('md')]: {
              fontSize: '14px',
            },
          }),
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: (opts) => ({
            fontSize: '16px',
            [opts.theme.breakpoints.up('md')]: {
              fontSize: '14px',
            },
          }),
          outlined: {
            top: 0,
            transform: 'translate(14px, 16px) scale(1)',
            '&.MuiInputLabel-shrink': {
              transform: 'translate(14px, -9px) scale(0.75)',
            },
            '&.MuiInputLabel-sizeSmall': {
              transform: 'translate(14px, 9px) scale(1)',
              '&.MuiInputLabel-shrink': {
                transform: 'translate(14px, -6px) scale(0.75)',
              },
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: (opts) => ({
            fontFamily,
            fontWeight: parseInt(fontWeight),
            '& .MuiOutlinedInput-root': {
              backgroundColor: STYLE_GUIDE.COLORS.inputFieldBackground,
              borderRadius: '10px',
              height: '40px',
              minHeight: '40px',
              fontSize: '16px',
              [opts.theme.breakpoints.up('md')]: {
                fontSize: '14px',
              },
              '& fieldset': {
                borderColor: STYLE_GUIDE.COLORS.inputFieldBorder,
              },
              '&:hover fieldset': {
                borderColor: opts.theme.palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: opts.theme.palette.primary.main,
              },
            },
            '& .MuiInputLabel-root': {
              color: STYLE_GUIDE.COLORS.textDarkGray,
              fontFamily,
              fontWeight: parseInt(fontWeight),
              fontSize: '16px',
              [opts.theme.breakpoints.up('md')]: {
                fontSize: '14px',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: opts.theme.palette.primary.main,
            },
            '& .MuiSelect-select': {
              color: STYLE_GUIDE.COLORS.textDarkGray,
              fontFamily,
              fontWeight: parseInt(fontWeight),
              fontSize: '16px',
              [opts.theme.breakpoints.up('md')]: {
                fontSize: '14px',
              },
              padding: '10px 14px',
              height: '40px',
              lineHeight: 1.25,
              display: 'flex',
              alignItems: 'center',
              boxSizing: 'border-box',
            },
          }),
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