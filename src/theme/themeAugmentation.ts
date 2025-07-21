import '@mui/material/styles';
import React from 'react';
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

  interface Components {
    MuiDataGrid?: {
      styleOverrides?: {
        root?: React.CSSProperties;
        columnHeaders?: React.CSSProperties;
        columnHeaderTitle?: React.CSSProperties;
        columnHeader?: React.CSSProperties;
        cell?: React.CSSProperties;
        row?: React.CSSProperties;
        footerContainer?: React.CSSProperties;
        pagination?: React.CSSProperties;
        virtualScroller?: React.CSSProperties;
        overlay?: React.CSSProperties;
      };
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