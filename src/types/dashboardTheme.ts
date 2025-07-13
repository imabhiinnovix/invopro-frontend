export interface DashboardTheme {
  _id?: string;
  name: string;
  description?: string;
  createdBy?: string;
  organizationId?: string;
  isDefault?: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  
  // Color Palette
  colors: {
    primary: {
      main: string;
      light: string;
      contrastText: string;
    };
    secondary: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    // New customizations
    inputText: string;
    inputBorder: string;
    dropdownBg: string;
    dropdownOptionBg: string;
    dropdownOptionText: string;

    background: {
      default: string;
      paper: string;
      surface: string;
      hover: string;
      card: string;
      dropdown: string;
    };
    text: {
      primary: string;
      secondary: string;
      disabled: string;
      hint: string;
    };
    divider: string;
    border: string;
    borderHover: string;
  };

  // Typography
  typography: {
    fontFamily: {
      primary: string;
      secondary: string;
      mono: string;
      serif: string;
    };
    fontSize: {
      xs: string;
      small: string;
      base: string;
      large: string;
      xl: string;
      xxl: string;
      xxxl: string;
      xxxxl: string;
      display: string;
      hero: string;
    };
    fontWeight: {
      thin: string;
      extraLight: string;
      light: string;
      regular: string;
      medium: string;
      semiBold: string;
      bold: string;
      extraBold: string;
      black: string;
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
      loose: string;
    };
    letterSpacing: {
      tight: string;
      normal: string;
      wide: string;
      wider: string;
      widest: string;
    };
  };

  // Component Styles
  components: {
    button: {
      borderRadius: string;
      textTransform: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
      fontSize: string;
      fontWeight: string;
      padding: {
        small: string;
        medium: string;
        large: string;
      };
      minHeight: {
        small: string;
        medium: string;
        large: string;
      };
    };
    card: {
      borderRadius: string;
      boxShadow: string;
      padding: string;
    };
    paper: {
      borderRadius: string;
      boxShadow: string;
    };
    input: {
      borderRadius: string;
      fontSize: string;
      padding: string;
      borderColor: string;
      focusBorderColor: string;
    };
    table: {
      borderRadius: string;
      boxShadow: string;
      headerBackground: string;
      headerText: string;
      rowOddBackground: string;
      rowEvenBackground: string;
      rowHoverBackground: string;
      rowText: string;
      borderColor: string;
    };
    navigation: {
      backgroundColor: string;
      textColor: string;
      activeBackground: string;
      activeTextColor: string;
      hoverBackground: string;
      hoverTextColor: string;
    };
    sidebar: {
      backgroundColor: string;
      textColor: string;
      activeBackground: string;
      activeTextColor: string;
      hoverBackground: string;
      hoverTextColor: string;
      width: string;
    };
    header: {
      backgroundColor: string;
      textColor: string;
      height: string;
      boxShadow: string;
    };
  };

  // Spacing
  spacing: {
    s0: string;
    s1: string;
    s2: string;
    s3: string;
    s4: string;
    s5: string;
    s6: string;
    s7: string;
    s8: string;
    s9: string;
    s10: string;
    s11: string;
    s12: string;
    s13: string;
    s14: string;
    s15: string;
  };

  // Shadows
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };

  // Layout
  layout: {
    maxWidth: string;
    containerPadding: string;
    gridGap: string;
  };
}

export interface DashboardThemeListResponse {
  success: boolean;
  message: string;
  data: DashboardTheme[];
  totalCount: number;
}

export interface CreateDashboardThemeResponse {
  success: boolean;
  message: string;
  data: DashboardTheme;
}

export interface DashboardThemeFormData {
  name: string;
  description?: string;
  colors: DashboardTheme['colors'];
  typography: DashboardTheme['typography'];
  components: DashboardTheme['components'];
  spacing: DashboardTheme['spacing'];
  shadows: DashboardTheme['shadows'];
  layout: DashboardTheme['layout'];
}

export interface ThemePreviewData {
  theme: DashboardTheme;
  onUpdate: (theme: DashboardTheme) => void;
  onDelete: (themeId: string) => void;
  onDuplicate: (themeId: string) => void;
  onApply: (theme: DashboardTheme) => void;
}

export interface CreateDashboardThemeDialogProps {
  open: boolean;
  onClose: () => void;
  theme?: DashboardTheme | null;
} 