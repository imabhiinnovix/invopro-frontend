import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DashboardTheme } from "../types/dashboardTheme";
import { STYLE_GUIDE } from "../styles";
import { TYPOGRAPHY } from "../styles/typography";
import { createCompleteTheme } from "../utils/themeUtils";

const generateId = () => Math.random().toString(36).substr(2, 9);

const getThemeFromStorage = (): string | null => {
  try {
    return localStorage.getItem("dashboardThemeName");
  } catch (error) {
    console.error("Error reading theme from localStorage:", error);
    return null;
  }
};

const saveThemeToStorage = (themeName: string): void => {
  try {
    localStorage.setItem("dashboardThemeName", themeName);
  } catch (error) {
    console.error("Error");
  }
};

const getDefaultTheme = (): DashboardTheme => ({
  _id: generateId(),
  name: "Default Theme",
  description: "Default dashboard theme based on style guide",
  colors: {
    primary: {
      main: STYLE_GUIDE.COLORS.primary,
      light: STYLE_GUIDE.COLORS.primaryLight,
      contrastText: STYLE_GUIDE.COLORS.white,
    },
    secondary: {
      main: STYLE_GUIDE.COLORS.materialBlue,
      light: "#42a5f5",
      dark: "#1565c0",
      contrastText: STYLE_GUIDE.COLORS.white,
    },
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
  typography: {
    fontFamily: TYPOGRAPHY.fontFamily.primary,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.regular,

    headings: {
      fontFamily: TYPOGRAPHY.fontFamily.primary,
      fontSize: TYPOGRAPHY.fontSize.xxl,
      fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    },
    body: {
      fontFamily: TYPOGRAPHY.fontFamily.primary,
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.regular,
    },
    buttons: {
      fontFamily: TYPOGRAPHY.fontFamily.primary,
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    cards: {
      fontFamily: TYPOGRAPHY.fontFamily.primary,
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.regular,
    },
    inputs: {
      fontFamily: TYPOGRAPHY.fontFamily.primary,
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.regular,
    },
    tables: {
      fontFamily: TYPOGRAPHY.fontFamily.primary,
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.regular,
    },
    navigation: {
      fontFamily: TYPOGRAPHY.fontFamily.primary,
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    dialog: {
      fontFamily: "",
      fontSize: "",
      fontWeight: "",
    },
  },
  components: {
    button: {
      textTransform: "none",
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
      headerBackground: STYLE_GUIDE.COLORS.white,
      headerText: STYLE_GUIDE.COLORS.tableHeaderText,
      rowOddBackground: STYLE_GUIDE.COLORS.white,
      rowEvenBackground: STYLE_GUIDE.COLORS.white,
      rowHoverBackground: STYLE_GUIDE.COLORS.backgroundHover,
      rowText: STYLE_GUIDE.COLORS.tableBodyText,
      borderColor: STYLE_GUIDE.COLORS.tableBorder,
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
    dialog: {
      backgroundColor: STYLE_GUIDE.COLORS.white,
      borderColor: STYLE_GUIDE.COLORS.white,
      boxShadow: STYLE_GUIDE.SHADOWS.sm,
      borderRadius: STYLE_GUIDE.SPACING.s2,
      titleColor: STYLE_GUIDE.COLORS.textDarkGray,
      titleFontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
      titleFontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
      contentColor: STYLE_GUIDE.COLORS.textDarkGray,
      contentFontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
      overlayColor: STYLE_GUIDE.COLORS.WhiteLight,
      titleFontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
    },
  },
  shadows: STYLE_GUIDE.SHADOWS,
  layout: {
    maxWidth: "1200px",
  },
  customFonts: [],
  isDefault: true,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const sampleThemes: DashboardTheme[] = [getDefaultTheme()];

interface OrganizationThemeInfo {
  organizationId: string;
  organizationName: string;
  themeId: string;
  isDefault: boolean;
}

interface DashboardThemeState {
  themes: DashboardTheme[];
  dashboardTheme: DashboardTheme | null;
  currentTheme: DashboardTheme | null;
  organizationTheme: OrganizationThemeInfo | null;
  loading: boolean;
  error: string | null;
  success: string | null;
}

const getInitialCurrentTheme = (): DashboardTheme => {
  const savedThemeName = getThemeFromStorage();

  if (savedThemeName) {
    const savedTheme = sampleThemes.find(
      (theme) => theme.name === savedThemeName
    );
    if (savedTheme) {
      return savedTheme;
    }
  }

  return sampleThemes[0];
};

const initialState: DashboardThemeState = {
  themes: sampleThemes,
  dashboardTheme: getInitialCurrentTheme(),
  currentTheme: getInitialCurrentTheme(),
  organizationTheme: null,
  loading: false,
  error: null,
  success: null,
};

const dashboardThemeSlice = createSlice({
  name: "dashboardTheme",
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
    createDashboardTheme: (
      state,
      action: PayloadAction<Partial<DashboardTheme>>
    ) => {
      const newTheme: DashboardTheme = {
        ...createCompleteTheme(action.payload),
        _id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.themes.push(newTheme);
      state.success = "Theme created successfully";
    },
    updateDashboardTheme: (
      state,
      action: PayloadAction<{ id: string; themeData: Partial<DashboardTheme> }>
    ) => {
      const { id, themeData } = action.payload;
      const index = state.themes.findIndex((theme) => theme._id === id);
      if (index !== -1) {
        const updatedTheme = {
          ...createCompleteTheme({ ...state.themes[index], ...themeData }),
          _id: id,
          updatedAt: new Date().toISOString(),
        };
        state.themes[index] = updatedTheme;

        if (state.dashboardTheme && state.dashboardTheme._id === id) {
          state.dashboardTheme = updatedTheme;
        }

        state.success = "Theme updated successfully";
      }
    },
    deleteDashboardTheme: (state, action: PayloadAction<string>) => {
      const themeId = action.payload;
      state.themes = state.themes.filter((theme) => theme._id !== themeId);
      state.success = "Theme deleted successfully";
    },
    duplicateDashboardTheme: (state, action: PayloadAction<string>) => {
      const themeId = action.payload;
      const originalTheme = state.themes.find((theme) => theme._id === themeId);
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
        state.success = "Theme duplicated successfully";
      }
    },
    applyDashboardTheme: (state, action: PayloadAction<string>) => {
      const themeId = action.payload;
      const themeToApply = state.themes.find((theme) => theme._id === themeId);
      if (themeToApply) {
        state.dashboardTheme = themeToApply;
        saveThemeToStorage(themeToApply.name);
        state.success = "Theme applied successfully";
      }
    },
    resetToDefaultTheme: (state) => {
      const defaultTheme =
        state.themes.find((theme) => theme.isDefault) || state.themes[0];
      state.dashboardTheme = defaultTheme;
      state.currentTheme = defaultTheme;
      saveThemeToStorage(defaultTheme.name);
      state.success = "Reset to default theme successfully";
    },
    setDashboardTheme: (state, action: PayloadAction<DashboardTheme>) => {
      state.currentTheme = action.payload;
      state.dashboardTheme = action.payload;
      saveThemeToStorage(action.payload.name);
      state.success = "Theme applied successfully";
    },
    setOrganizationTheme: (
      state,
      action: PayloadAction<OrganizationThemeInfo>
    ) => {
      state.organizationTheme = action.payload;
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
  setDashboardTheme,
  setOrganizationTheme,
} = dashboardThemeSlice.actions;

export default dashboardThemeSlice.reducer;
