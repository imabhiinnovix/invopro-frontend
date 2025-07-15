import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DashboardTheme } from '../types/dashboardTheme';
import { STYLE_GUIDE } from '../styles';
import { createCompleteTheme } from '../utils/themeUtils';

// Helper function to generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper function to get theme from localStorage
const getThemeFromStorage = (): string | null => {
  try {
    return localStorage.getItem('dashboardThemeName');
  } catch (error) {
    console.error('Error reading theme from localStorage:', error);
    return null;
  }
};

// Helper function to save theme to localStorage
const saveThemeToStorage = (themeName: string): void => {
  try {
    localStorage.setItem('dashboardThemeName', themeName);
  } catch (error) {
    console.error('Error saving theme to localStorage:', error);
  }
};



// Default theme based on style guide
const getDefaultTheme = (): DashboardTheme => ({
  _id: generateId(),
  name: 'Default Theme',
  description: 'Default dashboard theme based on style guide',
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
    // New input and dropdown colors
    inputText: STYLE_GUIDE.COLORS.textDarkGray,
    inputBorder: STYLE_GUIDE.COLORS.borderGray,
    dropdownBg: STYLE_GUIDE.COLORS.white,
    dropdownBorder: STYLE_GUIDE.COLORS.borderGray,
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
  components: {
    button: {
      textTransform: 'none',
    },
    card: {
      boxShadow: STYLE_GUIDE.SHADOWS.sm,
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
  isDefault: true,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Sample themes for testing - using createCompleteTheme to ensure all properties are set
const sampleThemes: DashboardTheme[] = [
  getDefaultTheme(),
  {
    ...createCompleteTheme({
      name: 'Dark Theme',
      description: 'A dark theme for better contrast',
      colors: {
        primary: {
          main: '#bb86fc',
          light: '#d4a4fc',
          contrastText: '#000000',
        },
        secondary: {
          main: '#dc004e',
          light: '#ff5983',
          dark: '#9a0036',
          contrastText: '#ffffff',
        },
        background: {
          default: '#121212',
          paper: '#1e1e1e',
          surface: '#2d2d2d',
          hover: '#3d3d3d',
          card: '#2d2d2d',
          dropdown: '#1e1e1e',
        },
        text: {
          primary: '#ffffff',
          secondary: '#b3b3b3',
          disabled: '#666666',
          hint: '#888888',
        },
        divider: '#333333',
        border: '#444444',
        borderHover: '#555555',
        inputText: '#ffffff',
        inputBorder: '#666666',
        dropdownBg: '#1e1e1e',
        dropdownBorder: '#666666',
        dropdownOptionBg: '#2d2d2d',
        dropdownOptionText: '#ffffff',
        dropdownSelectedText: '#bb86fc',
        dropdownLabelColor: '#b3b3b3',
        dropdownFocusedBorder: '#bb86fc',
        dropdownFocusedLabel: '#bb86fc',
        iconPrimary: '#ffffff',
      },
    }),
    _id: generateId(),
    isDefault: false,
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    ...createCompleteTheme({
      name: 'Sebic',
      description: 'Professional blue theme for corporate use',
      colors: {
        primary: {
          main: '#1976d2',
          light: '#42a5f5',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#dc004e',
          light: '#ff5983',
          dark: '#9a0036',
          contrastText: '#ffffff',
        },
        inputText: '#1565c0',
        inputBorder: '#1976d2',
        dropdownBg: '#f8f9ff',
        dropdownBorder: '#1976d2',
        dropdownOptionBg: '#e3f2fd',
        dropdownOptionText: '#1565c0',
        dropdownSelectedText: '#1976d2',
        dropdownLabelColor: '#666666',
        dropdownFocusedBorder: '#1976d2',
        dropdownFocusedLabel: '#1976d2',
        iconPrimary: '#1976d2',
        border: '#1976d2',
        borderHover: '#1565c0',
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
      },
    }),
    _id: generateId(),
    isDefault: false,
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initial state
interface DashboardThemeState {
  themes: DashboardTheme[];
  dashboardTheme: DashboardTheme | null;
  loading: boolean;
  error: string | null;
  success: string | null;
}

// Helper function to get initial current theme
const getInitialCurrentTheme = (): DashboardTheme => {
  const savedThemeName = getThemeFromStorage();
  
  if (savedThemeName) {
    // Find the saved theme by name
    const savedTheme = sampleThemes.find(theme => theme.name === savedThemeName);
    if (savedTheme) {
      return savedTheme;
    }
  }
  
  // Return default theme if no saved theme found or theme doesn't exist
  return sampleThemes[0];
};

const initialState: DashboardThemeState = {
  themes: sampleThemes,
  dashboardTheme: getInitialCurrentTheme(),
  loading: false,
  error: null,
  success: null,
};

// Slice
const dashboardThemeSlice = createSlice({
  name: 'dashboardTheme',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setCurrentTheme: (state, action: PayloadAction<DashboardTheme | null>) => {
      state.dashboardTheme = action.payload;
    },
    // Local actions for theme management
    createDashboardTheme: (state, action: PayloadAction<Partial<DashboardTheme>>) => {
      const newTheme: DashboardTheme = {
        ...createCompleteTheme(action.payload),
        _id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.themes.push(newTheme);
      state.success = 'Theme created successfully';
    },
    updateDashboardTheme: (state, action: PayloadAction<{ id: string; themeData: Partial<DashboardTheme> }>) => {
      const { id, themeData } = action.payload;
      const index = state.themes.findIndex(theme => theme._id === id);
      if (index !== -1) {
        const updatedTheme = {
          ...createCompleteTheme({ ...state.themes[index], ...themeData }),
          _id: id,
          updatedAt: new Date().toISOString(),
        };
        state.themes[index] = updatedTheme;
        
        // If the updated theme is the current theme, update dashboardTheme as well
        if (state.dashboardTheme && state.dashboardTheme._id === id) {
          state.dashboardTheme = updatedTheme;
        }
        
        state.success = 'Theme updated successfully';
      }
    },
    deleteDashboardTheme: (state, action: PayloadAction<string>) => {
      const themeId = action.payload;
      state.themes = state.themes.filter(theme => theme._id !== themeId);
      state.success = 'Theme deleted successfully';
    },
    duplicateDashboardTheme: (state, action: PayloadAction<string>) => {
      const themeId = action.payload;
      const originalTheme = state.themes.find(theme => theme._id === themeId);
      if (originalTheme) {
        const duplicatedTheme: DashboardTheme = {
          ...originalTheme,
          _id: generateId(),
          name: `${originalTheme.name} (Copy)`,
          isDefault: false,
          isActive: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.themes.push(duplicatedTheme);
        state.success = 'Theme duplicated successfully';
      }
    },
    applyDashboardTheme: (state, action: PayloadAction<string>) => {
      const themeId = action.payload;
      const themeToApply = state.themes.find(theme => theme._id === themeId);
      if (themeToApply) {
        state.dashboardTheme = themeToApply;
        // Save theme name to localStorage
        saveThemeToStorage(themeToApply.name);
        state.success = 'Theme applied successfully';
      }
    },
    resetToDefaultTheme: (state) => {
      const defaultTheme = state.themes.find(theme => theme.isDefault) || state.themes[0];
      state.dashboardTheme = defaultTheme;
      // Save default theme name to localStorage
      saveThemeToStorage(defaultTheme.name);
      state.success = 'Reset to default theme successfully';
    },
  },
});

export const { 
  clearError, 
  clearSuccess, 
  setCurrentTheme,
  createDashboardTheme,
  updateDashboardTheme,
  deleteDashboardTheme,
  duplicateDashboardTheme,
  applyDashboardTheme,
  resetToDefaultTheme,
} = dashboardThemeSlice.actions;

export default dashboardThemeSlice.reducer; 