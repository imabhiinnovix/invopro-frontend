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
    dropdownBorder: string;
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

  // Component Styles (without spacing properties)
  components: {
    button: {
      textTransform: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
    };
    card: {
      boxShadow: string;
    };
    paper: {
      boxShadow: string;
    };
    input: {
      borderColor: string;
      focusBorderColor: string;
      focusBorderColorFallback: string;
    };
    table: {
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
    };
    header: {
      backgroundColor: string;
      textColor: string;
      boxShadow: string;
    };
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
  components: DashboardTheme['components'];
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