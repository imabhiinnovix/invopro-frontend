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
    // New customizations
    inputText: STYLE_GUIDE.COLORS.textDarkGray,
    inputBorder: STYLE_GUIDE.COLORS.borderGray,
    dropdownBg: STYLE_GUIDE.COLORS.white,
    dropdownOptionBg: STYLE_GUIDE.COLORS.backgroundHover,
    dropdownOptionText: STYLE_GUIDE.COLORS.textDarkGray,

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
      headerText: STYLE_GUIDE.COLORS.textGray,
      rowOddBackground: STYLE_GUIDE.COLORS.backgroundDefault,
      rowEvenBackground: STYLE_GUIDE.COLORS.white,
      rowHoverBackground: STYLE_GUIDE.COLORS.backgroundHover,
      rowText: STYLE_GUIDE.COLORS.textDarkGray,
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

// Convert dashboard theme to MUI theme
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
        optionBackground: dashboardTheme.colors.dropdownOptionBg,
        optionText: dashboardTheme.colors.dropdownOptionText,
        optionHoverBackground: dashboardTheme.colors.background.hover,
      },
    },
    typography: {
      fontFamily: dashboardTheme.typography.fontFamily.primary,
      h1: {
        fontFamily: dashboardTheme.typography.fontFamily.primary,
        fontSize: dashboardTheme.typography.fontSize.xxxxl,
        fontWeight: dashboardTheme.typography.fontWeight.bold,
        lineHeight: dashboardTheme.typography.lineHeight.tight,
      },
      h2: {
        fontFamily: dashboardTheme.typography.fontFamily.primary,
        fontSize: dashboardTheme.typography.fontSize.xxxl,
        fontWeight: dashboardTheme.typography.fontWeight.semiBold,
        lineHeight: dashboardTheme.typography.lineHeight.tight,
      },
      h3: {
        fontFamily: dashboardTheme.typography.fontFamily.primary,
        fontSize: dashboardTheme.typography.fontSize.xxl,
        fontWeight: dashboardTheme.typography.fontWeight.semiBold,
        lineHeight: dashboardTheme.typography.lineHeight.normal,
      },
      h4: {
        fontFamily: dashboardTheme.typography.fontFamily.primary,
        fontSize: dashboardTheme.typography.fontSize.xl,
        fontWeight: dashboardTheme.typography.fontWeight.medium,
        lineHeight: dashboardTheme.typography.lineHeight.normal,
      },
      h5: {
        fontFamily: dashboardTheme.typography.fontFamily.primary,
        fontSize: dashboardTheme.typography.fontSize.large,
        fontWeight: dashboardTheme.typography.fontWeight.medium,
        lineHeight: dashboardTheme.typography.lineHeight.normal,
      },
      h6: {
        fontFamily: dashboardTheme.typography.fontFamily.primary,
        fontSize: dashboardTheme.typography.fontSize.base,
        fontWeight: dashboardTheme.typography.fontWeight.medium,
        lineHeight: dashboardTheme.typography.lineHeight.normal,
      },
      body1: {
        fontFamily: dashboardTheme.typography.fontFamily.primary,
        fontSize: dashboardTheme.typography.fontSize.base,
        fontWeight: dashboardTheme.typography.fontWeight.regular,
        lineHeight: dashboardTheme.typography.lineHeight.normal,
        color: dashboardTheme.colors.text.primary,
      },
      body2: {
        fontFamily: dashboardTheme.typography.fontFamily.primary,
        fontSize: dashboardTheme.typography.fontSize.small,
        fontWeight: dashboardTheme.typography.fontWeight.regular,
        lineHeight: dashboardTheme.typography.lineHeight.normal,
        color: dashboardTheme.colors.text.secondary,
      },
      caption: {
        fontFamily: dashboardTheme.typography.fontFamily.primary,
        fontSize: dashboardTheme.typography.fontSize.xs,
        fontWeight: dashboardTheme.typography.fontWeight.regular,
        lineHeight: dashboardTheme.typography.lineHeight.normal,
        color: dashboardTheme.colors.text.secondary,
      },
    },
    shape: {
      borderRadius: parseInt(dashboardTheme.components.button.borderRadius),
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: dashboardTheme.components.card.borderRadius,
            boxShadow: dashboardTheme.components.card.boxShadow,
            padding: dashboardTheme.components.card.padding,
            backgroundColor: dashboardTheme.colors.background.card,
            color: dashboardTheme.colors.text.primary,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: dashboardTheme.components.paper.borderRadius,
            boxShadow: dashboardTheme.components.paper.boxShadow,
            backgroundColor: dashboardTheme.colors.background.card,
            color: dashboardTheme.colors.text.primary,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: dashboardTheme.components.input.borderRadius,
              fontSize: dashboardTheme.components.input.fontSize,
              color: dashboardTheme.colors.text.primary,
              '& fieldset': {
                borderColor: dashboardTheme.components.input.borderColor,
              },
              '&:hover fieldset': {
                borderColor: dashboardTheme.components.input.focusBorderColor,
              },
              '&.Mui-focused fieldset': {
                borderColor: dashboardTheme.components.input.focusBorderColor,
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
            borderRadius: dashboardTheme.components.table.borderRadius,
            boxShadow: dashboardTheme.components.table.boxShadow,
            '& .MuiTableHead-root .MuiTableCell-root': {
              backgroundColor: dashboardTheme.components.table.headerBackground,
              color: dashboardTheme.components.table.headerText,
              fontWeight: '600',
              fontSize: '14px',
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
              fontWeight: '600',
              fontSize: '14px',
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
            fontWeight: '600',
            fontSize: '14px',
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
            borderRadius: dashboardTheme.components.button.borderRadius,
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
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: dashboardTheme.colors.background.surface,
            color: dashboardTheme.colors.text.primary,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: dashboardTheme.colors.background.dropdown,
            color: dashboardTheme.colors.text.primary,
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            backgroundColor: dashboardTheme.colors.background.dropdown,
            color: dashboardTheme.colors.text.primary,
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            backgroundColor: dashboardTheme.colors.background.dropdown,
            color: dashboardTheme.colors.text.primary,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: dashboardTheme.colors.text.primary,
            '&:hover': {
              backgroundColor: dashboardTheme.colors.background.hover,
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
              borderRadius: '4px',
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
            borderRadius: dashboardTheme.components.button.borderRadius,
            textTransform: dashboardTheme.components.button.textTransform,
            fontSize: dashboardTheme.components.button.fontSize,
            fontWeight: dashboardTheme.components.button.fontWeight,
            minHeight: dashboardTheme.components.button.minHeight.medium,
            padding: dashboardTheme.components.button.padding.medium,
            '&.MuiButton-contained': {
              '&.MuiButton-colorPrimary': {
                backgroundColor: dashboardTheme.colors.primary.main,
                color: dashboardTheme.colors.primary.contrastText,
                '&:hover': {
                  backgroundColor: dashboardTheme.colors.primary.light,
                },
                '&:active': {
                  backgroundColor: dashboardTheme.colors.background.default,
                },
              },
              '&.MuiButton-colorSecondary': {
                backgroundColor: dashboardTheme.colors.secondary.main,
                color: dashboardTheme.colors.secondary.contrastText,
                '&:hover': {
                  backgroundColor: dashboardTheme.colors.secondary.light,
                },
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
            '&.MuiButton-sizeSmall': {
              minHeight: dashboardTheme.components.button.minHeight.small,
              padding: dashboardTheme.components.button.padding.small,
            },
            '&.MuiButton-sizeLarge': {
              minHeight: dashboardTheme.components.button.minHeight.large,
              padding: dashboardTheme.components.button.padding.large,
            },
          },
        },
      },
    },
  });
}; 