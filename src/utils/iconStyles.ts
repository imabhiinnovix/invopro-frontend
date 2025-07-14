import { DashboardTheme } from '../types/dashboardTheme';
import { STYLE_GUIDE } from '../styles';

/**
 * Get icon color from theme
 */
export const getIconColor = (currentTheme?: DashboardTheme | null): string => {
  return currentTheme?.colors?.iconPrimary || STYLE_GUIDE.COLORS.textDarkGray;
};

/**
 * Get icon styles for consistent icon coloring
 */
export const getIconStyles = (currentTheme?: DashboardTheme | null) => ({
  color: getIconColor(currentTheme),
});

/**
 * Get icon button styles with theme-aware colors
 */
export const getIconButtonStyles = (currentTheme?: DashboardTheme | null) => ({
  '& .MuiSvgIcon-root': {
    color: getIconColor(currentTheme),
  },
  '&:hover .MuiSvgIcon-root': {
    color: currentTheme?.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
  },
  '&.Mui-disabled .MuiSvgIcon-root': {
    color: currentTheme?.colors?.text?.disabled || STYLE_GUIDE.COLORS.textGray,
  },
}); 