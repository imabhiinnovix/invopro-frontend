import '@mui/material/styles';

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
      optionBackground: string;
      optionText: string;
      optionHoverBackground: string;
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
      optionBackground: string;
      optionText: string;
      optionHoverBackground: string;
    };
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
      optionBackground: string;
      optionText: string;
      optionHoverBackground: string;
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
      optionBackground: string;
      optionText: string;
      optionHoverBackground: string;
    };
  }
} 