import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { STYLE_GUIDE } from "../styles";

export type ThemeMode = "light" | "dark";
export type ThemeColorPreset = "purple" | "red" | "green" | "blue" | "custom";

export interface AppThemeState {
  mode: ThemeMode;
  colorPreset: ThemeColorPreset;
  customColor: string;
  primaryColor: string;
}

interface AppThemeContextType {
  theme: AppThemeState;
  setMode: (mode: ThemeMode) => void;
  setColorPreset: (preset: ThemeColorPreset) => void;
  setCustomColor: (color: string) => void;
  applyTheme: () => void;
}

const THEME_STORAGE_KEY = "app_theme_preferences";

// Color presets
const COLOR_PRESETS: Record<ThemeColorPreset, string> = {
  purple: "#4F3DA9",
  red: "#DC3545",
  green: "#28A745",
  blue: "#007BFF",
  custom: "#4F3DA9", // Default to purple if custom
};

// Get initial theme from localStorage or defaults
const getInitialTheme = (): AppThemeState => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        mode: parsed.mode || "light",
        colorPreset: parsed.colorPreset || "purple",
        customColor: parsed.customColor || COLOR_PRESETS.purple,
        primaryColor:
          parsed.colorPreset === "custom"
            ? parsed.customColor || COLOR_PRESETS.purple
            : COLOR_PRESETS[parsed.colorPreset || "purple"],
      };
    }
  } catch (error) {
    console.error("Error loading theme from localStorage:", error);
  }

  return {
    mode: "light",
    colorPreset: "purple",
    customColor: COLOR_PRESETS.purple,
    primaryColor: COLOR_PRESETS.purple,
  };
};

const AppThemeContext = createContext<AppThemeContextType | undefined>(
  undefined
);

export const AppThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<AppThemeState>(getInitialTheme);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
    } catch (error) {
      console.error("Error saving theme to localStorage:", error);
    }
  }, [theme]);

  // Update primary color when preset or custom color changes
  useEffect(() => {
    const primaryColor =
      theme.colorPreset === "custom"
        ? theme.customColor
        : COLOR_PRESETS[theme.colorPreset];

    setTheme((prev) => ({
      ...prev,
      primaryColor,
    }));
  }, [theme.colorPreset, theme.customColor]);

  // Apply theme to CSS variables and update STYLE_GUIDE
  useEffect(() => {
    // Update CSS custom properties for theme
    const root = document.documentElement;
    root.style.setProperty("--theme-primary-color", theme.primaryColor);
    root.style.setProperty(
      "--theme-primary-color-light",
      `${theme.primaryColor}1A`
    );
    root.style.setProperty(
      "--theme-primary-color-dark",
      darkenColor(theme.primaryColor, 0.2)
    );

    // Update STYLE_GUIDE.COLORS.themeColor dynamically
    // Note: This is a workaround since STYLE_GUIDE is a const object
    // We'll use CSS variables in components instead
  }, [theme.primaryColor, theme.mode]);

  const setMode = (mode: ThemeMode) => {
    setTheme((prev) => ({ ...prev, mode }));
  };

  const setColorPreset = (preset: ThemeColorPreset) => {
    setTheme((prev) => ({
      ...prev,
      colorPreset: preset,
      primaryColor:
        preset === "custom" ? prev.customColor : COLOR_PRESETS[preset],
    }));
  };

  const setCustomColor = (color: string) => {
    setTheme((prev) => ({
      ...prev,
      customColor: color,
      primaryColor: prev.colorPreset === "custom" ? color : prev.primaryColor,
    }));
  };

  const applyTheme = () => {
    // Trigger a re-render by updating theme
    setTheme((prev) => ({ ...prev }));
  };

  return (
    <AppThemeContext.Provider
      value={{
        theme,
        setMode,
        setColorPreset,
        setCustomColor,
        applyTheme,
      }}
    >
      {children}
    </AppThemeContext.Provider>
  );
};

export const useAppTheme = (): AppThemeContextType => {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }
  return context;
};

// Helper function to darken a color
function darkenColor(color: string, amount: number): string {
  // Remove # if present
  const hex = color.replace("#", "");
  const num = parseInt(hex, 16);
  const r = Math.max(0, Math.floor((num >> 16) * (1 - amount)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0x00ff) * (1 - amount)));
  const b = Math.max(0, Math.floor((num & 0x0000ff) * (1 - amount)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

