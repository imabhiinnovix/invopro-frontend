import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useAppSelector } from '../storeHooks';
import { theme as baseTheme } from '../theme/theme';
import { DashboardTheme } from '../types/dashboardTheme';
import { STYLE_GUIDE } from '../styles';

interface UnifiedThemeProviderProps {
  children: React.ReactNode;
}

const UnifiedThemeProvider: React.FC<UnifiedThemeProviderProps> = ({ children }) => {
  const { dashboardTheme } = useAppSelector((state) => state.dashboardTheme);

  // Create a unified theme that combines the base MUI theme with the dashboard theme
  const unifiedTheme = React.useMemo(() => {
    if (!dashboardTheme) {
      return baseTheme;
    }

    return createTheme({
      ...baseTheme,
      palette: {
        ...baseTheme.palette,
        primary: {
          main: dashboardTheme.colors.primary.main,
          light: dashboardTheme.colors.primary.light,
          dark: dashboardTheme.colors.primary.main, // Use main as dark fallback
          contrastText: dashboardTheme.colors.primary.contrastText,
        },
        secondary: {
          main: dashboardTheme.colors.secondary.main,
          light: dashboardTheme.colors.secondary.light,
          dark: dashboardTheme.colors.secondary.dark,
          contrastText: dashboardTheme.colors.secondary.contrastText,
        },
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
        // Custom palette properties
        border: {
          main: dashboardTheme.colors.border,
          hover: dashboardTheme.colors.borderHover,
        },
        input: {
          text: dashboardTheme.colors.inputText,
          border: dashboardTheme.colors.inputBorder,
          focusBorder: dashboardTheme.components?.input?.focusBorderColor || baseTheme.palette.primary.main,
        },
        dropdown: {
          background: dashboardTheme.colors.dropdownBg,
          optionBackground: dashboardTheme.colors.dropdownOptionBg,
          optionText: dashboardTheme.colors.dropdownOptionText,
          optionHoverBackground: dashboardTheme.colors.background.hover,
          border: dashboardTheme.colors.dropdownBorder,
          selectedText: dashboardTheme.colors.dropdownSelectedText,
          labelColor: dashboardTheme.colors.dropdownLabelColor,
          focusedBorder: dashboardTheme.colors.dropdownFocusedBorder,
          focusedLabel: dashboardTheme.colors.dropdownFocusedLabel,
        },
        table: {
          headerBackground: dashboardTheme.components?.table?.headerBackground || STYLE_GUIDE.COLORS.backgroundLightGray,
          headerText: dashboardTheme.components?.table?.headerText || STYLE_GUIDE.COLORS.textGray,
          rowOddBackground: dashboardTheme.components?.table?.rowOddBackground || STYLE_GUIDE.COLORS.backgroundDefault,
          rowEvenBackground: dashboardTheme.components?.table?.rowEvenBackground || STYLE_GUIDE.COLORS.white,
          rowHoverBackground: dashboardTheme.components?.table?.rowHoverBackground || STYLE_GUIDE.COLORS.backgroundHover,
          rowText: dashboardTheme.components?.table?.rowText || STYLE_GUIDE.COLORS.textDarkGray,
        },
        card: {
          background: dashboardTheme.colors.background.card,
          border: dashboardTheme.colors.border,
          shadow: dashboardTheme.components.card.boxShadow,
        },
        dialog: {
          background: dashboardTheme.components.dialog.backgroundColor,
          border: dashboardTheme.components.dialog.borderColor,
          shadow: dashboardTheme.components.dialog.boxShadow,
          borderRadius: dashboardTheme.components.dialog.borderRadius,
          titleColor: dashboardTheme.components.dialog.titleColor,
          titleFontSize: dashboardTheme.components.dialog.titleFontSize,
          titleFontWeight: dashboardTheme.components.dialog.titleFontWeight,
          contentColor: dashboardTheme.components.dialog.contentColor,
          contentFontSize: dashboardTheme.components.dialog.contentFontSize,
          overlayColor: dashboardTheme.components.dialog.overlayColor,
        },
        icon: {
          primary: dashboardTheme.colors.iconPrimary,
        },
      },
      components: {
        ...baseTheme.components,
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: dashboardTheme.components?.button?.textTransform || 'none',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              boxShadow: dashboardTheme.components?.card?.boxShadow || STYLE_GUIDE.SHADOWS.sm,
              backgroundColor: dashboardTheme.colors.background.card || STYLE_GUIDE.COLORS.backgroundSurface,
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              backgroundColor: dashboardTheme.components?.dialog?.backgroundColor || STYLE_GUIDE.COLORS.white,
              border: `1px solid ${dashboardTheme.components?.dialog?.borderColor || dashboardTheme.colors.border}`,
              boxShadow: dashboardTheme.components?.dialog?.boxShadow || STYLE_GUIDE.SHADOWS.lg,
              borderRadius: dashboardTheme.components?.dialog?.borderRadius || '8px',
            },
            backdrop: {
              backgroundColor: dashboardTheme.components?.dialog?.overlayColor || 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
        MuiDialogTitle: {
          styleOverrides: {
            root: {
              color: dashboardTheme.components?.dialog?.titleColor || dashboardTheme.colors.text.primary,
              fontSize: dashboardTheme.components?.dialog?.titleFontSize || '1.25rem',
              fontWeight: dashboardTheme.components?.dialog?.titleFontWeight || STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
              padding: '16px 24px',
              borderBottom: `1px solid ${dashboardTheme.colors.divider}`,
            },
          },
        },
        MuiDialogContent: {
          styleOverrides: {
            root: {
              color: dashboardTheme.components?.dialog?.contentColor || dashboardTheme.colors.text.primary,
              fontSize: dashboardTheme.components?.dialog?.contentFontSize || '1rem',
              padding: '16px 24px',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              boxShadow: dashboardTheme.components?.paper?.boxShadow || STYLE_GUIDE.SHADOWS.sm,
              backgroundColor: dashboardTheme.colors.background.paper || STYLE_GUIDE.COLORS.white,
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            head: {
              backgroundColor: dashboardTheme.components?.table?.headerBackground || STYLE_GUIDE.COLORS.backgroundLightGray,
              color: dashboardTheme.components?.table?.headerText || STYLE_GUIDE.COLORS.textGray,
              fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
            },
            body: {
              color: dashboardTheme.components?.table?.rowText || STYLE_GUIDE.COLORS.textDarkGray,
            },
          },
        },
        MuiTableRow: {
          styleOverrides: {
            root: {
              '&:nth-of-type(odd)': {
                backgroundColor: dashboardTheme.components?.table?.rowOddBackground || STYLE_GUIDE.COLORS.backgroundDefault,
              },
              '&:nth-of-type(even)': {
                backgroundColor: dashboardTheme.components?.table?.rowEvenBackground || STYLE_GUIDE.COLORS.white,
              },
              '&:hover': {
                backgroundColor: dashboardTheme.components?.table?.rowHoverBackground || STYLE_GUIDE.COLORS.backgroundHover,
              },
            },
          },
        },
      },
      // Add dashboard theme for backward compatibility
      dashboardTheme,
    });
  }, [dashboardTheme]);

  return (
    <ThemeProvider theme={unifiedTheme}>
      {children}
    </ThemeProvider>
  );
};

export default UnifiedThemeProvider; 