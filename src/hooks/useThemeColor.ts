import { useAppTheme } from "../context/AppThemeContext";
import { STYLE_GUIDE } from "../styles";

/**
 * Hook to get the current theme color dynamically
 * This allows components to use the theme color that can be changed by the user
 */
export const useThemeColor = () => {
  const { theme } = useAppTheme();

  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Helper function to darken a color
  const darkenColor = (color: string, amount: number): string => {
    const hex = color.replace("#", "");
    const num = parseInt(hex, 16);
    const r = Math.max(0, Math.floor((num >> 16) * (1 - amount)));
    const g = Math.max(0, Math.floor(((num >> 8) & 0x00ff) * (1 - amount)));
    const b = Math.max(0, Math.floor((num & 0x0000ff) * (1 - amount)));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  };

  return {
    primary: theme.primaryColor,
    primaryLight: hexToRgba(theme.primaryColor, 0.1),
    primaryDark: darkenColor(theme.primaryColor, 0.2),
    // For backward compatibility, also provide as themeColor
    themeColor: theme.primaryColor,
    themeColorLight: hexToRgba(theme.primaryColor, 0.1),
    themeColorDark: darkenColor(theme.primaryColor, 0.2),
    mode: theme.mode,
  };
};

/**
 * Get theme color from CSS variable or fallback to STYLE_GUIDE
 * This is useful for styled components or places where hooks can't be used
 */
export const getThemeColor = (): string => {
  if (typeof window !== "undefined") {
    const cssColor = getComputedStyle(document.documentElement).getPropertyValue(
      "--theme-primary-color"
    );
    if (cssColor) {
      return cssColor.trim();
    }
  }
  return STYLE_GUIDE.COLORS.themeColor;
};

