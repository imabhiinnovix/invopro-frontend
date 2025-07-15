import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useAppSelector } from '../storeHooks';
import { theme as baseTheme } from '../theme/theme';
import { DashboardTheme } from '../types/dashboardTheme';

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
          headerBackground: dashboardTheme.components?.table?.headerBackground || baseTheme.palette.table?.headerBackground || '#f5f5f5',
          headerText: dashboardTheme.components?.table?.headerText || baseTheme.palette.table?.headerText || '#666',
          rowOddBackground: dashboardTheme.components?.table?.rowOddBackground || baseTheme.palette.table?.rowOddBackground || '#fafafa',
          rowEvenBackground: dashboardTheme.components?.table?.rowEvenBackground || baseTheme.palette.table?.rowEvenBackground || '#ffffff',
          rowHoverBackground: dashboardTheme.components?.table?.rowHoverBackground || baseTheme.palette.table?.rowHoverBackground || '#f0f0f0',
          rowText: dashboardTheme.components?.table?.rowText || baseTheme.palette.table?.rowText || '#333',
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
              boxShadow: dashboardTheme.components?.card?.boxShadow || '0 2px 4px rgba(0,0,0,0.1)',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              boxShadow: dashboardTheme.components?.paper?.boxShadow || '0 2px 4px rgba(0,0,0,0.1)',
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