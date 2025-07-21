import '@mui/material/styles';
import { DashboardTheme } from '../types/dashboardTheme';

declare module '@mui/material/styles' {
  interface Palette {
    border?: {
      main: string;
      hover: string;
    };
    input?: {
      text: string;
      border: string;
      focusBorder: string;
    };
    dropdown?: {
      background: string;
      border: string;
      optionBackground: string;
      optionText: string;
      optionHoverBackground: string;
      selectedText: string;
      labelColor: string;
      focusedBorder: string;
      focusedLabel: string;
    };
    table?: {
      headerBackground: string;
      headerText: string;
      rowOddBackground: string;
      rowEvenBackground: string;
      rowHoverBackground: string;
      rowText: string;
    };
    card?: {
      background: string;
      border: string;
      shadow: string;
    };
    dialog?: {
      background: string;
      border: string;
      shadow: string;
      borderRadius: string;
      titleColor: string;
      titleFontFamily: string;
      titleFontSize: string;
      titleFontWeight: string;
      contentColor: string;
      contentFontSize: string;
      overlayColor: string;
    };
    icon?: {
      primary: string;
    };
  }
  
  interface PaletteOptions {
    border?: {
      main: string;
      hover: string;
    };
    input?: {
      text: string;
      border: string;
      focusBorder: string;
    };
    dropdown?: {
      background: string;
      border: string;
      optionBackground: string;
      optionText: string;
      optionHoverBackground: string;
      selectedText: string;
      labelColor: string;
      focusedBorder: string;
      focusedLabel: string;
    };
    table?: {
      headerBackground: string;
      headerText: string;
      rowOddBackground: string;
      rowEvenBackground: string;
      rowHoverBackground: string;
      rowText: string;
    };
    card?: {
      background: string;
      border: string;
      shadow: string;
    };
    dialog?: {
      background: string;
      border: string;
      shadow: string;
      borderRadius: string;
      titleColor: string;
      titleFontFamily: string;
      titleFontSize: string;
      titleFontWeight: string;
      contentColor: string;
      contentFontSize: string;
      overlayColor: string;
    };
    icon?: {
      primary: string;
    };
  }

  interface Theme {
    dashboardTheme: DashboardTheme;
  }

  interface ThemeOptions {
    dashboardTheme?: DashboardTheme;
  }
}

declare module '@mui/material/styles/createPalette' {
  interface Palette {
    border?: {
      main: string;
      hover: string;
    };
    input?: {
      text: string;
      border: string;
      focusBorder: string;
    };
    dropdown?: {
      background: string;
      border: string;
      optionBackground: string;
      optionText: string;
      optionHoverBackground: string;
      selectedText: string;
      labelColor: string;
      focusedBorder: string;
      focusedLabel: string;
    };
    table?: {
      headerBackground: string;
      headerText: string;
      rowOddBackground: string;
      rowEvenBackground: string;
      rowHoverBackground: string;
      rowText: string;
    };
    card?: {
      background: string;
      border: string;
      shadow: string;
    };
    dialog?: {
      background: string;
      border: string;
      shadow: string;
      borderRadius: string;
      titleColor: string;
      titleFontFamily: string;
      titleFontSize: string;
      titleFontWeight: string;
      contentColor: string;
      contentFontSize: string;
      overlayColor: string;
    };
    icon?: {
      primary: string;
    };
  }
  
  interface PaletteOptions {
    border?: {
      main: string;
      hover: string;
    };
    input?: {
      text: string;
      border: string;
      focusBorder: string;
    };
    dropdown?: {
      background: string;
      border?: string;
      optionBackground: string;
      optionText: string;
      optionHoverBackground: string;
      selectedText: string;
      labelColor: string;
      focusedBorder: string;
      focusedLabel: string;
    };
    table?: {
      headerBackground: string;
      headerText: string;
      rowOddBackground: string;
      rowEvenBackground: string;
      rowHoverBackground: string;
      rowText: string;
    };
    card?: {
      background: string;
      border: string;
      shadow: string;
    };
    dialog?: {
      background: string;
      border: string;
      shadow: string;
      borderRadius: string;
      titleColor: string;
      titleFontFamily: string;
      titleFontSize: string;
      titleFontWeight: string;
      contentColor: string;
      contentFontSize: string;
      overlayColor: string;
    };
    icon?: {
      primary: string;
    };
  }
} 