import { DashboardTheme } from '../types/dashboardTheme';
import { STYLE_GUIDE } from './index';
import { createTheme } from '@mui/material/styles';

export const getDefaultDashboardTheme = (): DashboardTheme => ({
  name: 'Default',
  description: 'Default dashboard theme',
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
    inputText: STYLE_GUIDE.COLORS.textDarkGray,
    inputBorder: STYLE_GUIDE.COLORS.borderGray,
    dropdownBg: STYLE_GUIDE.COLORS.inputFieldBackground,
    dropdownBorder: STYLE_GUIDE.COLORS.inputFieldBorder,
    dropdownOptionBg: STYLE_GUIDE.COLORS.backgroundHover,
    dropdownOptionText: STYLE_GUIDE.COLORS.textDarkGray,
    dropdownSelectedText: STYLE_GUIDE.COLORS.primary,
    dropdownLabelColor: STYLE_GUIDE.COLORS.textMediumGray,
    dropdownFocusedBorder: STYLE_GUIDE.COLORS.primary,
    dropdownFocusedLabel: STYLE_GUIDE.COLORS.primary,
    iconPrimary: STYLE_GUIDE.COLORS.black,
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
  },
  typography: {
    fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
    fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
    fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.regular,
    
    headings: {
      fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
      fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
      fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
    },
    body: {
      fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
      fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
      fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.regular,
    },
    buttons: {
      fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
      fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
      fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
    },
    cards: {
      fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
      fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
      fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.regular,
    },
    inputs: {
      fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
      fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
      fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.regular,
    },
    tables: {
      fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
      fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
      fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.regular,
    },
    navigation: {
      fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
      fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
      fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
    },
  },
  components: {
    button: {
      textTransform: 'none',
    },
    card: {
      boxShadow: STYLE_GUIDE.SHADOWS.sm,
    },
    dialog: {
      backgroundColor: STYLE_GUIDE.COLORS.white,
      borderColor: STYLE_GUIDE.COLORS.borderGray,
      boxShadow: STYLE_GUIDE.SHADOWS.lg,
      borderRadius: '4px',
      titleColor: STYLE_GUIDE.COLORS.textDarkGray,
      titleFontSize: '12px',
      titleFontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
      titleFontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
      contentColor: STYLE_GUIDE.COLORS.textDarkGray,
      contentFontSize: '1rem',
      overlayColor: 'rgba(0, 0, 0, 0.5)',
    },
    paper: {
      boxShadow: STYLE_GUIDE.SHADOWS.sm,
    },
    input: {
      borderColor: STYLE_GUIDE.COLORS.borderGray,
      focusBorderColor: STYLE_GUIDE.COLORS.primary,
      focusBorderColorFallback: STYLE_GUIDE.COLORS.inputFocusFallback,
    },
    table: {
      boxShadow: STYLE_GUIDE.SHADOWS.sm,
      headerBackground: STYLE_GUIDE.COLORS.white,
      headerText: STYLE_GUIDE.COLORS.tableHeaderText,
      rowOddBackground: STYLE_GUIDE.COLORS.white,
      rowEvenBackground: STYLE_GUIDE.COLORS.white,
      rowHoverBackground: STYLE_GUIDE.COLORS.backgroundHover,
      rowText: STYLE_GUIDE.COLORS.tableBodyText,
      borderColor: STYLE_GUIDE.COLORS.tableBorder,
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
    },
    header: {
      backgroundColor: STYLE_GUIDE.COLORS.white,
      textColor: STYLE_GUIDE.COLORS.textDarkGray,
      boxShadow: STYLE_GUIDE.SHADOWS.sm,
    },
  },
  shadows: STYLE_GUIDE.SHADOWS,
  layout: {
    maxWidth: '1200px',
  },
  customFonts: [],
});

export const createMuiThemeFromDashboardTheme = (dashboardTheme: DashboardTheme) => {
  return createTheme({
    palette: {
      mode: 'light',
      primary: dashboardTheme.colors.primary,
      secondary: dashboardTheme.colors.secondary,
      background: {
        default: dashboardTheme.colors.background.default,
        paper: dashboardTheme.colors.background.paper,
      },
      text: {
        primary: dashboardTheme.colors.text.primary,
        secondary: dashboardTheme.colors.text.secondary,
        disabled: dashboardTheme.colors.text.disabled,
      },
      divider: dashboardTheme.colors.divider,
      border: {
        main: dashboardTheme.colors.border,
        hover: dashboardTheme.colors.borderHover,
      },
      input: {
        text: dashboardTheme.colors.inputText,
        border: dashboardTheme.colors.inputBorder,
        focusBorder: dashboardTheme.colors.primary.main,
      },
      dropdown: {
        background: dashboardTheme.colors.dropdownBg,
        border: dashboardTheme.colors.dropdownBorder,
        optionBackground: dashboardTheme.colors.dropdownOptionBg,
        optionText: dashboardTheme.colors.dropdownOptionText,
        optionHoverBackground: dashboardTheme.colors.background.hover,
        selectedText: dashboardTheme.colors.dropdownSelectedText,
        labelColor: dashboardTheme.colors.dropdownLabelColor,
        focusedBorder: dashboardTheme.colors.dropdownFocusedBorder,
        focusedLabel: dashboardTheme.colors.dropdownFocusedLabel,
      },
      icon: {
        primary: dashboardTheme.colors.iconPrimary,
      },
      dialog: {
        background: dashboardTheme.components.dialog.backgroundColor,
        border: dashboardTheme.components.dialog.borderColor,
        shadow: dashboardTheme.components.dialog.boxShadow,
        borderRadius: dashboardTheme.components.dialog.borderRadius,
        titleColor: dashboardTheme.components.dialog.titleColor,
        titleFontSize: dashboardTheme.components.dialog.titleFontSize,
        titleFontWeight: dashboardTheme.components.dialog.titleFontWeight,
        titleFontFamily: dashboardTheme.components.dialog.titleFontFamily,
        contentColor: dashboardTheme.components.dialog.contentColor,
        contentFontSize: dashboardTheme.components.dialog.contentFontSize,
        overlayColor: dashboardTheme.components.dialog.overlayColor,
      },
    },
    dashboardTheme,
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: dashboardTheme.colors.background.card,
            color: dashboardTheme.colors.text.primary,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: dashboardTheme.colors.background.card,
            color: dashboardTheme.colors.text.primary,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: dashboardTheme.components.dialog.backgroundColor,
            border: `1px solid ${dashboardTheme.components.dialog.borderColor}`,
            boxShadow: dashboardTheme.components.dialog.boxShadow,
            borderRadius: dashboardTheme.components.dialog.borderRadius,
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            color: dashboardTheme.components.dialog.titleColor,
            fontSize: dashboardTheme.components.dialog.titleFontSize,
            fontWeight: dashboardTheme.components.dialog.titleFontWeight,
            fontFamily: dashboardTheme.components.dialog.titleFontFamily,
            padding: '16px 24px',
            borderBottom: `1px solid ${dashboardTheme.colors.divider}`,
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            color: dashboardTheme.components.dialog.contentColor,
            fontSize: dashboardTheme.components.dialog.contentFontSize,
            padding: '16px 24px',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              color: dashboardTheme.colors.text.primary,
              '& fieldset': {
                borderColor: dashboardTheme.components.input.borderColor,
              },
              '&:hover fieldset': {
                borderColor: dashboardTheme.components.input.focusBorderColor || dashboardTheme.components.input.focusBorderColorFallback,
              },
              '&.Mui-focused fieldset': {
                borderColor: dashboardTheme.components.input.focusBorderColor || dashboardTheme.components.input.focusBorderColorFallback,
              },
              '& input': {
                color: dashboardTheme.colors.text.primary,
              },
              '& textarea': {
                color: dashboardTheme.colors.text.primary,
              },
            },
            '& .MuiInputLabel-root': {
              color: dashboardTheme.colors.text.secondary,
              '&.Mui-focused': {
                color: dashboardTheme.colors.text.primary,
              },
            },
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            '& .MuiTableHead-root .MuiTableCell-root': {
              backgroundColor: dashboardTheme.components.table.headerBackground,
              color: dashboardTheme.components.table.headerText,
              borderBottom: `2px solid ${dashboardTheme.colors.divider}`,
            },
            '& .MuiTableBody-root .MuiTableRow-root:hover': {
              backgroundColor: dashboardTheme.components.table.rowHoverBackground,
            },
            '& .MuiTableCell-root': {
              color: dashboardTheme.components.table.rowText,
            },
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-root': {
              backgroundColor: dashboardTheme.components.table.headerBackground,
              color: dashboardTheme.components.table.headerText,
              borderBottom: `2px solid ${dashboardTheme.colors.divider}`,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            color: dashboardTheme.colors.text.primary,
            borderBottom: `1px solid ${dashboardTheme.colors.divider}`,
          },
          head: {
            backgroundColor: dashboardTheme.components.table.headerBackground,
            color: dashboardTheme.components.table.headerText,
            borderBottom: `2px solid ${dashboardTheme.colors.divider}`,
          },
          body: {
            color: dashboardTheme.components.table.rowText,
            borderBottom: `1px solid ${dashboardTheme.colors.divider}`,
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: dashboardTheme.components.table.rowHoverBackground,
            },
            '&:nth-of-type(odd)': {
              backgroundColor: dashboardTheme.components.table.rowOddBackground,
            },
            '&:nth-of-type(even)': {
              backgroundColor: dashboardTheme.components.table.rowEvenBackground,
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            color: dashboardTheme.colors.text.primary,
            '&:hover': {
              backgroundColor: dashboardTheme.components.navigation.hoverBackground,
              color: dashboardTheme.components.navigation.hoverTextColor,
            },
            '&.Mui-selected': {
              backgroundColor: dashboardTheme.components.navigation.activeBackground,
              color: dashboardTheme.components.navigation.activeTextColor,
              '&:hover': {
                backgroundColor: dashboardTheme.components.navigation.activeBackground,
              },
            },
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            color: dashboardTheme.colors.text.primary,
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          root: {
            color: dashboardTheme.colors.text.primary,
          },
          primary: {
            color: dashboardTheme.colors.text.primary,
          },
          secondary: {
            color: dashboardTheme.colors.text.secondary,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: dashboardTheme.colors.background.surface,
            color: dashboardTheme.colors.text.primary,
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            color: dashboardTheme.colors.text.primary,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: dashboardTheme.colors.dropdownBg,
            color: dashboardTheme.colors.dropdownOptionText,
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            backgroundColor: dashboardTheme.colors.dropdownBg,
            color: dashboardTheme.colors.dropdownOptionText,
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            backgroundColor: dashboardTheme.colors.dropdownBg,
            color: dashboardTheme.colors.dropdownSelectedText,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: dashboardTheme.colors.dropdownOptionText,
            backgroundColor: dashboardTheme.colors.dropdownOptionBg,
            '&:hover': {
              backgroundColor: dashboardTheme.colors.dropdownOptionBg,
            },
            '&.Mui-selected': {
              backgroundColor: dashboardTheme.colors.dropdownOptionBg,
              color: dashboardTheme.colors.dropdownSelectedText,
              '&:hover': {
                backgroundColor: dashboardTheme.colors.dropdownOptionBg,
                color: dashboardTheme.colors.dropdownSelectedText,
              },
            },
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            color: dashboardTheme.colors.text.primary,
            backgroundColor: dashboardTheme.colors.background.default,
          },
          '*': {
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: dashboardTheme.colors.background.surface,
            },
            '&::-webkit-scrollbar-thumb': {
              background: dashboardTheme.colors.divider,
              '&:hover': {
                background: dashboardTheme.colors.text.secondary,
              },
            },
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: dashboardTheme.colors.text.primary,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '&.MuiButton-contained': {
              '&.MuiButton-colorPrimary': {
                backgroundColor: dashboardTheme.colors.primary.main,
                color: dashboardTheme.colors.primary.contrastText,
                '&:active': {
                  backgroundColor: dashboardTheme.colors.background.default,
                },
              },
              '&.MuiButton-colorSecondary': {
                backgroundColor: dashboardTheme.colors.secondary.main,
                color: dashboardTheme.colors.secondary.contrastText,
                '&:active': {
                  backgroundColor: dashboardTheme.colors.secondary.dark,
                },
              },

            },
            '&.MuiButton-outlined': {
              '&.MuiButton-colorPrimary': {
                borderColor: dashboardTheme.colors.primary.main,
                color: dashboardTheme.colors.primary.main,
                '&:hover': {
                  backgroundColor: dashboardTheme.colors.primary.main,
                  color: dashboardTheme.colors.primary.contrastText,
                },
              },
              '&.MuiButton-colorSecondary': {
                borderColor: dashboardTheme.colors.secondary.main,
                color: dashboardTheme.colors.secondary.contrastText,
                '&:hover': {
                  backgroundColor: dashboardTheme.colors.secondary.light,
                  color: dashboardTheme.colors.secondary.contrastText,
                },
              },
            },
            '&.MuiButton-text': {
              '&.MuiButton-colorPrimary': {
                color: dashboardTheme.colors.primary.main,
                '&:hover': {
                  backgroundColor: dashboardTheme.colors.primary.main,
                  color: dashboardTheme.colors.primary.contrastText,
                },
              },
              '&.MuiButton-colorSecondary': {
                color: dashboardTheme.colors.secondary.contrastText,
                '&:hover': {
                  backgroundColor: dashboardTheme.colors.secondary.light,
                  color: dashboardTheme.colors.secondary.contrastText,
                },
              },
            },
            '&.Mui-disabled': {
              backgroundColor: dashboardTheme.colors.background.hover,
              color: dashboardTheme.colors.text.disabled,
              '&:hover': {
                backgroundColor: dashboardTheme.colors.background.hover,
              },
            },
          },
        },
      },
    },
  });
}; 