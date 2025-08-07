import { useTheme } from '@mui/material/styles';

export const useUnifiedTheme = () => {
  const theme = useTheme();
  
  const dashboardTheme = theme.dashboardTheme;
  
  return {
    palette: theme.palette,
    spacing: theme.spacing,
    breakpoints: theme.breakpoints,
    typography: theme.typography,
    shadows: theme.shadows,
    border: theme.palette.border,
    input: theme.palette.input,
    dropdown: theme.palette.dropdown,
    table: theme.palette.table,
    icon: theme.palette.icon,
    dashboardTheme,
    getIconColor: () => theme.palette.icon?.primary || '#000000',
    getInputTextColor: () => theme.palette.input?.text || theme.palette.text.primary,
    getInputBorderColor: () => theme.palette.input?.border || theme.palette.divider,
    getDropdownBackground: () => theme.palette.dropdown?.background || theme.palette.background.paper,
  };
};

export type UnifiedTheme = ReturnType<typeof useUnifiedTheme>; 