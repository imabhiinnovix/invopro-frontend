import { useAppSelector } from '../storeHooks';
import { useTypographySettings } from './useTypographySettings';

export const useComponentTypography = () => {
  const { dashboardTheme } = useAppSelector((state) => state.dashboardTheme);
  const { typographySettings } = useTypographySettings();

  // Helper function to get component-specific typography
  const getComponentTypography = (componentType: 'headings' | 'body' | 'buttons' | 'cards' | 'inputs' | 'tables' | 'navigation') => {
    if (!dashboardTheme?.typography) {
      return typographySettings;
    }

    const componentTypography = dashboardTheme.typography[componentType];
    if (componentTypography) {
      return {
        fontFamily: componentTypography.fontFamily || dashboardTheme.typography.fontFamily,
        fontSize: componentTypography.fontSize || dashboardTheme.typography.fontSize,
        fontWeight: componentTypography.fontWeight || dashboardTheme.typography.fontWeight,
      };
    }

    return {
      fontFamily: dashboardTheme.typography.fontFamily,
      fontSize: dashboardTheme.typography.fontSize,
      fontWeight: dashboardTheme.typography.fontWeight,
    };
  };

  // Utility functions for common components
  const getHeadingTypography = () => getComponentTypography('headings');
  const getBodyTypography = () => getComponentTypography('body');
  const getButtonTypography = () => getComponentTypography('buttons');
  const getCardTypography = () => getComponentTypography('cards');
  const getInputTypography = () => getComponentTypography('inputs');
  const getTableTypography = () => getComponentTypography('tables');
  const getNavigationTypography = () => getComponentTypography('navigation');

  // Get sx props for components
  const getHeadingSx = () => {
    const typography = getHeadingTypography();
    return {
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: parseInt(typography.fontWeight),
    };
  };

  const getBodySx = () => {
    const typography = getBodyTypography();
    return {
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: parseInt(typography.fontWeight),
    };
  };

  const getButtonSx = () => {
    const typography = getButtonTypography();
    return {
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: parseInt(typography.fontWeight),
    };
  };

  const getCardSx = () => {
    const typography = getCardTypography();
    return {
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: parseInt(typography.fontWeight),
    };
  };

  const getInputSx = () => {
    const typography = getInputTypography();
    return {
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: parseInt(typography.fontWeight),
    };
  };

  const getTableSx = () => {
    const typography = getTableTypography();
    return {
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: parseInt(typography.fontWeight),
    };
  };

  const getNavigationSx = () => {
    const typography = getNavigationTypography();
    return {
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: parseInt(typography.fontWeight),
    };
  };

  return {
    // Raw typography objects
    getComponentTypography,
    getHeadingTypography,
    getBodyTypography,
    getButtonTypography,
    getCardTypography,
    getInputTypography,
    getTableTypography,
    getNavigationTypography,
    
    // Sx props for components
    getHeadingSx,
    getBodySx,
    getButtonSx,
    getCardSx,
    getInputSx,
    getTableSx,
    getNavigationSx,
    
    // Current theme info
    hasDashboardTheme: !!dashboardTheme?.typography,
    currentTheme: dashboardTheme,
  };
}; 