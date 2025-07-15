import { STYLE_GUIDE } from '../styles';
import { DashboardTheme } from '../types/dashboardTheme';

/**
 * Get icon color from theme
 * @deprecated Use useUnifiedTheme().getIconColor() instead
 */
export const getIconColor = (dashboardTheme?: DashboardTheme | null): string => {
  return dashboardTheme?.colors?.iconPrimary || STYLE_GUIDE.COLORS.textDarkGray;
};

/**
 * Get icon styles for consistent icon coloring
 * @deprecated Use useUnifiedTheme() instead
 */
export const getIconStyles = (dashboardTheme?: DashboardTheme | null) => ({
  color: getIconColor(dashboardTheme),
});

/**
 * Get icon button styles with theme-aware colors
 * @deprecated Use useUnifiedTheme() instead
 */
export const getIconButtonStyles = (dashboardTheme?: DashboardTheme | null) => ({
  '& .MuiSvgIcon-root': {
    color: getIconColor(dashboardTheme),
  },
  '&:hover .MuiSvgIcon-root': {
    color: dashboardTheme?.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
  },
  '&.Mui-disabled .MuiSvgIcon-root': {
    color: dashboardTheme?.colors?.text?.disabled || STYLE_GUIDE.COLORS.textGray,
  },
}); 