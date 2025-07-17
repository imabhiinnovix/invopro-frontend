import { useTypography } from '../context/TypographyContext';
import { SxProps, Theme } from '@mui/material/styles';

export const useTypographySettings = () => {
  const {
    typographySettings,
    updateTypographySettings,
    resetTypographySettings,
    fontOptions,
    fontSizeOptions,
    fontWeightOptions,
  } = useTypography();

  // Utility function to get typography sx props
  const getTypographySx = (): SxProps<Theme> => ({
    fontFamily: typographySettings.fontFamily,
    fontSize: typographySettings.fontSize,
    fontWeight: typographySettings.fontWeight,
  });

  // Utility function to get typography sx props with custom overrides
  const getTypographySxWithOverrides = (overrides: Partial<{
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
  }>): SxProps<Theme> => ({
    fontFamily: overrides.fontFamily || typographySettings.fontFamily,
    fontSize: overrides.fontSize || typographySettings.fontSize,
    fontWeight: overrides.fontWeight || typographySettings.fontWeight,
  });

  // Utility function to get font family only
  const getFontFamilySx = (): SxProps<Theme> => ({
    fontFamily: typographySettings.fontFamily,
  });

  // Utility function to get font size only
  const getFontSizeSx = (): SxProps<Theme> => ({
    fontSize: typographySettings.fontSize,
  });

  // Utility function to get font weight only
  const getFontWeightSx = (): SxProps<Theme> => ({
    fontWeight: typographySettings.fontWeight,
  });

  // Utility function to get current font option label
  const getCurrentFontLabel = (): string => {
    return fontOptions.find(f => f.value === typographySettings.fontFamily)?.label || 'Custom';
  };

  // Utility function to get current font size label
  const getCurrentFontSizeLabel = (): string => {
    return fontSizeOptions.find(f => f.value === typographySettings.fontSize)?.label || 'Custom';
  };

  // Utility function to get current font weight label
  const getCurrentFontWeightLabel = (): string => {
    return fontWeightOptions.find(f => f.value === typographySettings.fontWeight)?.label || 'Custom';
  };

  return {
    // Typography settings
    typographySettings,
    
    // Update functions
    updateTypographySettings,
    resetTypographySettings,
    
    // Options
    fontOptions,
    fontSizeOptions,
    fontWeightOptions,
    
    // Utility functions
    getTypographySx,
    getTypographySxWithOverrides,
    getFontFamilySx,
    getFontSizeSx,
    getFontWeightSx,
    getCurrentFontLabel,
    getCurrentFontSizeLabel,
    getCurrentFontWeightLabel,
  };
}; 