import { useTheme } from '@mui/material/styles';

/**
 * Unified theme hook that provides access to both MUI theme and dashboard theme
 * This replaces the need for separate useTheme() and useDashboardTheme() calls
 */
export const useUnifiedTheme = () => {
  const theme = useTheme();
  
  // Access dashboard theme from the unified theme
  const dashboardTheme = theme.dashboardTheme;
  
  return {
    // MUI theme properties
    palette: theme.palette,
    spacing: theme.spacing,
    breakpoints: theme.breakpoints,
    typography: theme.typography,
    shadows: theme.shadows,
    
    // Custom palette properties (from dashboard theme)
    border: theme.palette.border,
    input: theme.palette.input,
    dropdown: theme.palette.dropdown,
    table: theme.palette.table,
    icon: theme.palette.icon,
    
    // Full dashboard theme for backward compatibility
    dashboardTheme,
    
    // Helper methods
    getIconColor: () => theme.palette.icon?.primary || '#000000',
    getInputTextColor: () => theme.palette.input?.text || theme.palette.text.primary,
    getInputBorderColor: () => theme.palette.input?.border || theme.palette.divider,
    getDropdownBackground: () => theme.palette.dropdown?.background || theme.palette.background.paper,
  };
};

// Type for the unified theme
export type UnifiedTheme = ReturnType<typeof useUnifiedTheme>; 