import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    border?: {
      main: string;
      hover: string;
    };
  }
  
  interface PaletteOptions {
    border?: {
      main: string;
      hover: string;
    };
  }
}

declare module '@mui/material/styles/createPalette' {
  interface Palette {
    border?: {
      main: string;
      hover: string;
    };
  }
  
  interface PaletteOptions {
    border?: {
      main: string;
      hover: string;
    };
  }
} 