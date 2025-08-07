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

  const getTypographySx = (): SxProps<Theme> => ({
    fontFamily: typographySettings.fontFamily,
    fontSize: typographySettings.fontSize,
    fontWeight: typographySettings.fontWeight,
  });

  const getTypographySxWithOverrides = (overrides: Partial<{
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
  }>): SxProps<Theme> => ({
    fontFamily: overrides.fontFamily || typographySettings.fontFamily,
    fontSize: overrides.fontSize || typographySettings.fontSize,
    fontWeight: overrides.fontWeight || typographySettings.fontWeight,
  });

  const getFontFamilySx = (): SxProps<Theme> => ({
    fontFamily: typographySettings.fontFamily,
  });

  const getFontSizeSx = (): SxProps<Theme> => ({
    fontSize: typographySettings.fontSize,
  });

  const getFontWeightSx = (): SxProps<Theme> => ({
    fontWeight: typographySettings.fontWeight,
  });

  const getCurrentFontLabel = (): string => {
    return fontOptions.find(f => f.value === typographySettings.fontFamily)?.label || 'Custom';
  };

  const getCurrentFontSizeLabel = (): string => {
    return fontSizeOptions.find(f => f.value === typographySettings.fontSize)?.label || 'Custom';
  };

  const getCurrentFontWeightLabel = (): string => {
    return fontWeightOptions.find(f => f.value === typographySettings.fontWeight)?.label || 'Custom';
  };

  return {
    typographySettings,
    updateTypographySettings,
    resetTypographySettings,
    fontOptions,
    fontSizeOptions,
    fontWeightOptions,
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