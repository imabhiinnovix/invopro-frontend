import { DashboardTheme } from '../types/dashboardTheme';
import { STYLE_GUIDE } from '../styles';
import { TYPOGRAPHY } from '../styles/typography';

export const validateDashboardTheme = (theme: Partial<DashboardTheme>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!theme.name?.trim()) {
    errors.push('Theme name is required');
  }

  if (!theme.colors?.primary?.main) {
    errors.push('Primary color is required');
  }

  if (!theme.colors?.background?.default) {
    errors.push('Background color is required');
  }



  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  
  if (theme.colors?.primary?.main && !hexColorRegex.test(theme.colors.primary.main)) {
    errors.push('Primary color must be a valid hex color');
  }

  if (theme.colors?.secondary?.main && !hexColorRegex.test(theme.colors.secondary.main)) {
    errors.push('Secondary color must be a valid hex color');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};


export const generateLightColor = (color: string, amount: number = 0.2): string => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const newR = Math.min(255, r + (255 - r) * amount);
  const newG = Math.min(255, g + (255 - g) * amount);
  const newB = Math.min(255, b + (255 - b) * amount);

  return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
};


export const generateDarkColor = (color: string, amount: number = 0.2): string => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const newR = Math.max(0, r * (1 - amount));
  const newG = Math.max(0, g * (1 - amount));
  const newB = Math.max(0, b * (1 - amount));

  return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
};


export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const [rs, gs, bs] = [r, g, b].map(c => {
      if (c <= 0.03928) {
        return c / 12.92;
      }
      return Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);

  const brightest = Math.max(luminance1, luminance2);
  const darkest = Math.min(luminance1, luminance2);

  return (brightest + 0.05) / (darkest + 0.05);
};


export const getContrastTextColor = (backgroundColor: string): string => {
  const contrastWithWhite = getContrastRatio(backgroundColor, '#ffffff');
  const contrastWithBlack = getContrastRatio(backgroundColor, '#000000');

  return contrastWithWhite > contrastWithBlack ? '#ffffff' : '#000000';
};


export const createCompleteTheme = (baseTheme: Partial<DashboardTheme>): DashboardTheme => {
  const defaultTheme = {
    name: baseTheme.name || 'New Theme',
    description: baseTheme.description || '',
    colors: {
      primary: {
        main: baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
        light: baseTheme.colors?.primary?.light || generateLightColor(baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary),
        contrastText: baseTheme.colors?.primary?.contrastText || getContrastTextColor(baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary),
      },
      secondary: {
        main: baseTheme.colors?.secondary?.main || STYLE_GUIDE.COLORS.materialBlue,
        light: baseTheme.colors?.secondary?.light || generateLightColor(baseTheme.colors?.secondary?.main || STYLE_GUIDE.COLORS.materialBlue),
        dark: baseTheme.colors?.secondary?.dark || generateDarkColor(baseTheme.colors?.secondary?.main || STYLE_GUIDE.COLORS.materialBlue),
        contrastText: baseTheme.colors?.secondary?.contrastText || getContrastTextColor(baseTheme.colors?.secondary?.main || STYLE_GUIDE.COLORS.materialBlue),
      },
      inputText: baseTheme.colors?.inputText || STYLE_GUIDE.COLORS.textDarkGray,
      inputBorder: baseTheme.colors?.inputBorder || STYLE_GUIDE.COLORS.borderGray,
      dropdownBg: baseTheme.colors?.dropdownBg || STYLE_GUIDE.COLORS.white,
      dropdownBorder: baseTheme.colors?.dropdownBorder || STYLE_GUIDE.COLORS.borderGray,
      dropdownOptionBg: baseTheme.colors?.dropdownOptionBg || STYLE_GUIDE.COLORS.backgroundHover,
      dropdownOptionText: baseTheme.colors?.dropdownOptionText || STYLE_GUIDE.COLORS.textDarkGray,
      dropdownSelectedText: baseTheme.colors?.dropdownSelectedText || STYLE_GUIDE.COLORS.primary,
      dropdownLabelColor: baseTheme.colors?.dropdownLabelColor || STYLE_GUIDE.COLORS.textMediumGray,
      dropdownFocusedBorder: baseTheme.colors?.dropdownFocusedBorder || STYLE_GUIDE.COLORS.primary,
      dropdownFocusedLabel: baseTheme.colors?.dropdownFocusedLabel || STYLE_GUIDE.COLORS.primary,
      iconPrimary: baseTheme.colors?.iconPrimary || '#000000',
      background: {
        default: baseTheme.colors?.background?.default || STYLE_GUIDE.COLORS.backgroundDefault,
        paper: baseTheme.colors?.background?.paper || STYLE_GUIDE.COLORS.white,
        surface: baseTheme.colors?.background?.surface || STYLE_GUIDE.COLORS.backgroundSurface,
        hover: baseTheme.colors?.background?.hover || STYLE_GUIDE.COLORS.backgroundHover,
        card: baseTheme.colors?.background?.card || STYLE_GUIDE.COLORS.backgroundSurface,
        dropdown: baseTheme.colors?.background?.dropdown || STYLE_GUIDE.COLORS.white,
      },
      text: {
        primary: baseTheme.colors?.text?.primary || STYLE_GUIDE.COLORS.textDarkGray,
        secondary: baseTheme.colors?.text?.secondary || STYLE_GUIDE.COLORS.textMediumGray,
        disabled: baseTheme.colors?.text?.disabled || STYLE_GUIDE.COLORS.textGray,
        hint: baseTheme.colors?.text?.hint || STYLE_GUIDE.COLORS.textMediumGray,
      },
      divider: baseTheme.colors?.divider || STYLE_GUIDE.COLORS.divider,
      border: baseTheme.colors?.border || STYLE_GUIDE.COLORS.borderGray,
      borderHover: baseTheme.colors?.borderHover || STYLE_GUIDE.COLORS.materialPurpleDark,
    },
    typography: baseTheme.typography || {
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
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        fontSize: TYPOGRAPHY.fontSize.small,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
      },
    },
    components: baseTheme.components || {
      button: {
        textTransform: 'none',
      },
      card: {
        boxShadow: STYLE_GUIDE.SHADOWS.sm,
      },
      dialog: {
        backgroundColor: STYLE_GUIDE.COLORS.white,
        borderColor: STYLE_GUIDE.COLORS.borderGray,
        boxShadow: STYLE_GUIDE.SHADOWS.lg,
        borderRadius: '8px',
        titleColor: STYLE_GUIDE.COLORS.textDarkGray,
        titleFontFamily: baseTheme.typography?.dialog?.fontFamily || baseTheme.typography?.fontFamily || TYPOGRAPHY.fontFamily.primary,
        titleFontSize: baseTheme.typography?.dialog?.fontSize || '12px',
        titleFontWeight: baseTheme.typography?.dialog?.fontWeight || STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
        contentColor: STYLE_GUIDE.COLORS.textDarkGray,
        contentFontSize: '12px',
        overlayColor: 'rgba(0, 0, 0, 0.5)',
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
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: baseTheme.colors?.inputBorder || STYLE_GUIDE.COLORS.borderGray,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: baseTheme.colors?.borderHover || STYLE_GUIDE.COLORS.borderGray,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
            },
            '& input': {
              color: baseTheme.colors?.inputText || STYLE_GUIDE.COLORS.textDarkGray,
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            borderColor: baseTheme.colors?.inputBorder || STYLE_GUIDE.COLORS.borderGray,
            color: baseTheme.colors?.inputText || baseTheme.colors?.text?.primary || STYLE_GUIDE.COLORS.textDarkGray,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            color: (baseTheme.components as any)?.table?.headerText || STYLE_GUIDE.COLORS.textGray,
            backgroundColor: (baseTheme.components as any)?.table?.headerBackground || STYLE_GUIDE.COLORS.backgroundLightGray,
          },
          body: {
            color: (baseTheme.components as any)?.table?.rowText || STYLE_GUIDE.COLORS.textDarkGray,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: baseTheme.colors?.dropdownBg || STYLE_GUIDE.COLORS.white,
              '& fieldset': {
                borderColor: baseTheme.colors?.inputBorder || STYLE_GUIDE.COLORS.borderGray,
              },
              '&:hover fieldset': {
                borderColor: baseTheme.colors?.borderHover || STYLE_GUIDE.COLORS.borderGray,
              },
              '&.Mui-focused fieldset': {
                borderColor: baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
              },
            },
            '& .MuiInputLabel-root': {
              color: baseTheme.colors?.dropdownLabelColor || baseTheme.colors?.text?.secondary || STYLE_GUIDE.COLORS.textDarkGray,
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: baseTheme.colors?.dropdownFocusedLabel || baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink': {
              color: baseTheme.colors?.dropdownFocusedLabel || baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink.Mui-focused': {
              color: baseTheme.colors?.dropdownFocusedLabel || baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink:not(.Mui-focused)': {
              color: baseTheme.colors?.dropdownFocusedLabel || baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
            },
            '& .MuiInputBase-input': {
              color: baseTheme.colors?.dropdownSelectedText || baseTheme.colors?.text?.primary || STYLE_GUIDE.COLORS.textDarkGray,
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: baseTheme.colors?.inputBorder || STYLE_GUIDE.COLORS.borderGray,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: baseTheme.colors?.borderHover || STYLE_GUIDE.COLORS.borderGray,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
            },
            '& input': {
              color: baseTheme.colors?.dropdownSelectedText || baseTheme.colors?.text?.primary || STYLE_GUIDE.COLORS.textDarkGray,
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: baseTheme.colors?.dropdownBg || STYLE_GUIDE.COLORS.white,
              '& fieldset': {
                borderColor: baseTheme.colors?.inputBorder || STYLE_GUIDE.COLORS.borderGray,
              },
              '&:hover fieldset': {
                borderColor: baseTheme.colors?.borderHover || STYLE_GUIDE.COLORS.borderGray,
              },
              '&.Mui-focused fieldset': {
                borderColor: baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
              },
            },
            '& .MuiInputLabel-root': {
              color: baseTheme.colors?.dropdownLabelColor || baseTheme.colors?.text?.secondary || STYLE_GUIDE.COLORS.textDarkGray,
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: baseTheme.colors?.dropdownFocusedLabel || baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink': {
              color: baseTheme.colors?.dropdownFocusedLabel || baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink.Mui-focused': {
              color: baseTheme.colors?.dropdownFocusedLabel || baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink:not(.Mui-focused)': {
              color: baseTheme.colors?.dropdownFocusedLabel || baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
            },
            '& .MuiSelect-select': {
              color: baseTheme.colors?.dropdownSelectedText || baseTheme.colors?.text?.primary || STYLE_GUIDE.COLORS.textDarkGray,
            },
          },
          select: {
            borderColor: baseTheme.colors?.inputBorder || STYLE_GUIDE.COLORS.borderGray,
            color: baseTheme.colors?.dropdownSelectedText || baseTheme.colors?.text?.primary || STYLE_GUIDE.COLORS.textDarkGray,
            backgroundColor: baseTheme.colors?.dropdownBg || STYLE_GUIDE.COLORS.white,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            border: `1px solid ${baseTheme.colors?.inputBorder || STYLE_GUIDE.COLORS.borderGray}`,
            color: baseTheme.colors?.dropdownOptionText || baseTheme.colors?.text?.primary || STYLE_GUIDE.COLORS.textDarkGray,
            backgroundColor: baseTheme.colors?.dropdownBg || STYLE_GUIDE.COLORS.white,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${baseTheme.colors?.inputBorder || STYLE_GUIDE.COLORS.borderGray}`,
            color: baseTheme.colors?.dropdownOptionText || baseTheme.colors?.text?.primary || STYLE_GUIDE.COLORS.textDarkGray,
            backgroundColor: baseTheme.colors?.dropdownOptionBg || STYLE_GUIDE.COLORS.backgroundHover,
            '&:hover': {
              backgroundColor: baseTheme.colors?.background?.hover || STYLE_GUIDE.COLORS.backgroundHover,
              borderColor: baseTheme.colors?.borderHover || STYLE_GUIDE.COLORS.borderGray,
            },
            '&.Mui-selected': {
              backgroundColor: baseTheme.colors?.dropdownOptionBg || STYLE_GUIDE.COLORS.backgroundHover,
              color: baseTheme.colors?.dropdownSelectedText || baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
              '&:hover': {
                backgroundColor: baseTheme.colors?.background?.hover || STYLE_GUIDE.COLORS.backgroundHover,
                color: baseTheme.colors?.dropdownSelectedText || baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
              },
            },
            '&.Mui-selected .MuiTypography-root': {
              color: baseTheme.colors?.dropdownSelectedText || baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
            },
            '&.Mui-selected span': {
              color: baseTheme.colors?.dropdownSelectedText || baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
            },
            '&.Mui-selected div': {
              color: baseTheme.colors?.dropdownSelectedText || baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
            },
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: baseTheme.colors?.dropdownBg || STYLE_GUIDE.COLORS.white,
              '& fieldset': {
                borderColor: baseTheme.colors?.inputBorder || STYLE_GUIDE.COLORS.borderGray,
              },
              '&:hover fieldset': {
                borderColor: baseTheme.colors?.borderHover || STYLE_GUIDE.COLORS.borderGray,
              },
              '&.Mui-focused fieldset': {
                borderColor: baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
              },
            },
            '& .MuiInputLabel-root': {
              color: baseTheme.colors?.dropdownLabelColor || baseTheme.colors?.text?.secondary || STYLE_GUIDE.COLORS.textDarkGray,
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: baseTheme.colors?.dropdownFocusedLabel || baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink': {
              color: baseTheme.colors?.dropdownFocusedLabel || baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink.Mui-focused': {
              color: baseTheme.colors?.dropdownFocusedLabel || baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink:not(.Mui-focused)': {
              color: baseTheme.colors?.dropdownFocusedLabel || baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
            },
            '& .MuiInputBase-input': {
              color: `${baseTheme.colors?.dropdownSelectedText || baseTheme.colors?.text?.primary || STYLE_GUIDE.COLORS.textDarkGray} !important`,
            },
            '& .MuiAutocomplete-input': {
              color: `${baseTheme.colors?.dropdownSelectedText || baseTheme.colors?.text?.primary || STYLE_GUIDE.COLORS.textDarkGray} !important`,
            },
            '& .MuiAutocomplete-tag': {
              color: `${baseTheme.colors?.dropdownSelectedText || baseTheme.colors?.text?.primary || STYLE_GUIDE.COLORS.textDarkGray} !important`,
            },
            '& .MuiAutocomplete-endAdornment': {
              color: `${baseTheme.colors?.dropdownSelectedText || baseTheme.colors?.text?.primary || STYLE_GUIDE.COLORS.textDarkGray} !important`,
            },
            '& .MuiAutocomplete-inputRoot': {
              color: `${baseTheme.colors?.dropdownSelectedText || baseTheme.colors?.text?.primary || STYLE_GUIDE.COLORS.textDarkGray} !important`,
            },
            '& .MuiAutocomplete-inputRoot input': {
              color: `${baseTheme.colors?.dropdownSelectedText || baseTheme.colors?.text?.primary || STYLE_GUIDE.COLORS.textDarkGray} !important`,
            },
            '& .MuiAutocomplete-inputRoot .MuiAutocomplete-input': {
              color: `${baseTheme.colors?.dropdownSelectedText || baseTheme.colors?.text?.primary || STYLE_GUIDE.COLORS.textDarkGray} !important`,
            },
            '& input': {
              color: `${baseTheme.colors?.dropdownSelectedText || baseTheme.colors?.text?.primary || STYLE_GUIDE.COLORS.textDarkGray} !important`,
            },
            '& .MuiInputBase-root input': {
              color: `${baseTheme.colors?.dropdownSelectedText || baseTheme.colors?.text?.primary || STYLE_GUIDE.COLORS.textDarkGray} !important`,
            },
            '& .MuiOutlinedInput-root input': {
              color: `${baseTheme.colors?.dropdownSelectedText || baseTheme.colors?.text?.primary || STYLE_GUIDE.COLORS.textDarkGray} !important`,
            },
          },
          paper: {
            border: `1px solid ${baseTheme.colors?.inputBorder || STYLE_GUIDE.COLORS.borderGray}`,
            color: baseTheme.colors?.dropdownOptionText || baseTheme.colors?.text?.primary || STYLE_GUIDE.COLORS.textDarkGray,
            backgroundColor: baseTheme.colors?.dropdownBg || STYLE_GUIDE.COLORS.white,
          },
          option: {
            borderBottom: `1px solid ${baseTheme.colors?.inputBorder || STYLE_GUIDE.COLORS.borderGray}`,
            color: baseTheme.colors?.dropdownOptionText || baseTheme.colors?.text?.primary || STYLE_GUIDE.COLORS.textDarkGray,
            backgroundColor: baseTheme.colors?.dropdownOptionBg || STYLE_GUIDE.COLORS.backgroundHover,
            '&:hover': {
              backgroundColor: baseTheme.colors?.background?.hover || STYLE_GUIDE.COLORS.backgroundHover,
              borderColor: baseTheme.colors?.borderHover || STYLE_GUIDE.COLORS.borderGray,
            },
            '&[aria-selected="true"]': {
              backgroundColor: baseTheme.colors?.dropdownOptionBg || STYLE_GUIDE.COLORS.backgroundHover,
              color: baseTheme.colors?.dropdownSelectedText || baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
              '&:hover': {
                backgroundColor: baseTheme.colors?.background?.hover || STYLE_GUIDE.COLORS.backgroundHover,
                color: baseTheme.colors?.dropdownSelectedText || baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
              },
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: baseTheme.colors?.dropdownLabelColor || baseTheme.colors?.text?.secondary || STYLE_GUIDE.COLORS.textDarkGray,
            '&.Mui-focused': {
              color: baseTheme.colors?.dropdownFocusedLabel || baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
            },
            '&.MuiInputLabel-shrink': {
              color: baseTheme.colors?.dropdownFocusedLabel || baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
            },
            '&.MuiInputLabel-shrink.Mui-focused': {
              color: baseTheme.colors?.dropdownFocusedLabel || baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
            },
            '&.MuiInputLabel-shrink:not(.Mui-focused)': {
              color: baseTheme.colors?.dropdownFocusedLabel || baseTheme.colors?.primary?.main || STYLE_GUIDE.COLORS.primary,
            },
          },
        },
      },

    },
    
    shadows: baseTheme.shadows || STYLE_GUIDE.SHADOWS,
    layout: baseTheme.layout || {
      maxWidth: '1200px',
    },
  };

  return defaultTheme as DashboardTheme;
};

export const exportThemeAsCSS = (theme: DashboardTheme): string => {
  const cssVars = [
    `/* Dashboard Theme: ${theme.name} */`,
    `:root {`,
    `  /* Colors */`,
    `  --color-primary: ${theme.colors.primary.main};`,
    `  --color-primary-light: ${theme.colors.primary.light};`,

    `  --color-secondary: ${theme.colors.secondary.main};`,

    `  --color-background: ${theme.colors.background.default};`,
    `  --color-surface: ${theme.colors.background.paper};`,
    `  --color-text-primary: ${theme.colors.text.primary};`,
    `  --color-text-secondary: ${theme.colors.text.secondary};`,
    `  --color-divider: ${theme.colors.divider};`,
    `  --color-border: ${theme.colors.border};`,
    ``,
    `  /* Typography */`,
    `  --font-family-primary: ${STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary};`,
    `  --font-family-secondary: ${STYLE_GUIDE.TYPOGRAPHY.fontFamily.secondary};`,
    `  --font-size-base: ${STYLE_GUIDE.TYPOGRAPHY.fontSize.base};`,
    `  --font-size-small: ${STYLE_GUIDE.TYPOGRAPHY.fontSize.small};`,
    `  --font-size-large: ${STYLE_GUIDE.TYPOGRAPHY.fontSize.large};`,
    `  --font-weight-regular: ${STYLE_GUIDE.TYPOGRAPHY.fontWeight.regular};`,
    `  --font-weight-medium: ${STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium};`,
    `  --font-weight-bold: ${STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold};`,
    ``,
    `  /* Spacing */`,
    `  --spacing-s0: ${STYLE_GUIDE.SPACING.s0};`,
    `  --spacing-s2: ${STYLE_GUIDE.SPACING.s2};`,
    `  --spacing-s4: ${STYLE_GUIDE.SPACING.s4};`,
    `  --spacing-s6: ${STYLE_GUIDE.SPACING.s6};`,
    ``,
    `  /* Shadows */`,
    `  --shadow-sm: ${theme.shadows.sm};`,
    `  --shadow-md: ${theme.shadows.md};`,
    `  --shadow-lg: ${theme.shadows.lg};`,
    ``,
    `  /* Components */`,
    `  --border-radius: ${STYLE_GUIDE.SPACING.s2};`,
    `  --card-shadow: ${theme.components.card.boxShadow};`,
    `  --input-border-color: ${theme.components.input.borderColor};`,
    `  --input-focus-border-color: ${theme.components.input.focusBorderColor};`,
    `  --table-header-background: ${theme.components.table.headerBackground};`,
    `  --table-header-text: ${theme.components.table.headerText};`,
    `}`,
  ].join('\n');

  return cssVars;
};

export const importThemeFromCSS = (cssContent: string): Partial<DashboardTheme> => {
  const theme: Partial<DashboardTheme> = {
    name: 'Imported Theme',
    colors: {
      primary: { main: '#000000', light: '#000000', contrastText: '#ffffff' },
      secondary: { main: '#000000', light: '#000000', dark: '#000000', contrastText: '#ffffff' },
      inputText: '#000000',
      inputBorder: '#000000',
      dropdownBg: '#ffffff',
      dropdownBorder: '#000000',
      dropdownOptionBg: '#ffffff',
      dropdownOptionText: '#000000',
      dropdownSelectedText: '#000000',
      dropdownLabelColor: '#000000',
      dropdownFocusedBorder: '#000000',
      dropdownFocusedLabel: '#000000',
      background: { default: '#ffffff', paper: '#ffffff', surface: '#ffffff', hover: '#ffffff', card: '#ffffff', dropdown: '#ffffff' },
      text: { primary: '#000000', secondary: '#000000', disabled: '#000000', hint: '#000000' },
      divider: '#000000',
      border: '#000000',
      borderHover: '#000000',
      iconPrimary: '#000000'
    },
  };

  const colorMatches = cssContent.match(/--color-(\w+):\s*([^;]+);/g);
  if (colorMatches) {
    colorMatches.forEach(match => {
      const [, name, value] = match.match(/--color-(\w+):\s*([^;]+);/) || [];
      if (name && value) {
        switch (name) {
          case 'primary':
            theme.colors!.primary!.main = value.trim();
            break;
          case 'secondary':
            theme.colors!.secondary!.main = value.trim();
            break;
          case 'background':
            theme.colors!.background!.default = value.trim();
            break;
        }
      }
    });
  }

  return theme;
}; 