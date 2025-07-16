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



  // Get sx props for components
  const getHeadingSx = () => {
    const typography = getComponentTypography('headings');
    return {
      fontFamily: `${typography.fontFamily} !important`,
      fontSize: typography.fontSize,
      fontWeight: parseInt(typography.fontWeight),
      // Maximum specificity overrides
      '&.MuiTypography-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Additional specificity for different Typography variants
      '&.MuiTypography-h1, &.MuiTypography-h2, &.MuiTypography-h3, &.MuiTypography-h4, &.MuiTypography-h5, &.MuiTypography-h6': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Override any inline styles
      '&[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Override theme styleOverrides
      '&.MuiTypography-root[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Force on all child elements
      '& *': {
        fontFamily: `${typography.fontFamily} !important`,
      },
    };
  };

  const getBodySx = () => {
    const typography = getComponentTypography('body');
    return {
      fontFamily: `${typography.fontFamily} !important`,
      fontSize: typography.fontSize,
      fontWeight: parseInt(typography.fontWeight),
      // Maximum specificity overrides
      '&.MuiTypography-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiTypography-body1, &.MuiTypography-body2': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Override any inline styles
      '&[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Override theme styleOverrides
      '&.MuiTypography-root[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Force on all child elements
      '& *': {
        fontFamily: `${typography.fontFamily} !important`,
      },
    };
  };

  const getButtonSx = () => {
    const typography = getComponentTypography('buttons');
    return {
      fontFamily: `${typography.fontFamily} !important`,
      fontSize: typography.fontSize,
      fontWeight: parseInt(typography.fontWeight),
      // Maximum specificity overrides
      '&.MuiButton-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiButton-text': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiButton-outlined': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiButton-contained': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Override any inline styles
      '&[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Override theme styleOverrides
      '&.MuiButton-root[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Force on all child elements
      '& *': {
        fontFamily: `${typography.fontFamily} !important`,
      },
    };
  };

  const getCardSx = () => {
    const typography = getComponentTypography('cards');
    return {
      fontFamily: `${typography.fontFamily} !important`,
      fontSize: typography.fontSize,
      fontWeight: parseInt(typography.fontWeight),
      // Maximum specificity overrides
      '&.MuiCard-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiCardContent-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiCardHeader-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Override any inline styles
      '&[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Override theme styleOverrides
      '&.MuiCard-root[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Force on all child elements
      '& *': {
        fontFamily: `${typography.fontFamily} !important`,
      },
    };
  };

  const getInputSx = () => {
    const typography = getComponentTypography('inputs');
    return {
      fontFamily: `${typography.fontFamily} !important`,
      fontSize: typography.fontSize,
      fontWeight: parseInt(typography.fontWeight),
      // Maximum specificity overrides
      '&.MuiInputBase-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiTextField-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiOutlinedInput-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiFilledInput-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Override any inline styles
      '&[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Override theme styleOverrides
      '&.MuiInputBase-root[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Force on all child elements
      '& *': {
        fontFamily: `${typography.fontFamily} !important`,
      },
    };
  };

  const getTableSx = () => {
    const typography = getComponentTypography('tables');
    return {
      fontFamily: `${typography.fontFamily} !important`,
      fontSize: typography.fontSize,
      fontWeight: parseInt(typography.fontWeight),
      // Maximum specificity overrides for all table components
      '&.MuiTable-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiTableHead-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiTableBody-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiTableRow-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiTableCell-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Override styled components specifically
      '& .MuiTableCell-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '& .MuiTableHead-root .MuiTableCell-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '& .MuiTableBody-root .MuiTableCell-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '& .MuiTableRow-root .MuiTableCell-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Override theme styleOverrides with maximum specificity
      '& .MuiTableHead-root .MuiTableCell-root[class*="MuiTableCell-head"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '& .MuiTableBody-root .MuiTableCell-root[class*="MuiTableCell-body"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Override any inline styles
      '&[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '& .MuiTableCell-root[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Override theme styleOverrides
      '&.MuiTable-root[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Force on all child elements with maximum specificity
      '& *': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '& .MuiTableCell-root *': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Override styled components with maximum specificity
      '& .MuiTableCell-root[class*="MuiTableCell"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Additional specificity for styled components
      '& .MuiTableContainer-root .MuiTable-root .MuiTableHead-root .MuiTableRow-root .MuiTableCell-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '& .MuiTableContainer-root .MuiTable-root .MuiTableBody-root .MuiTableRow-root .MuiTableCell-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
    };
  };

  const getNavigationSx = () => {
    const typography = getComponentTypography('navigation');
    return {
      fontFamily: `${typography.fontFamily} !important`,
      fontSize: typography.fontSize,
      fontWeight: parseInt(typography.fontWeight),
      // Maximum specificity overrides
      '&.MuiListItemText-primary': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiListItem-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiListItemButton-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiDrawer-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Override any inline styles
      '&[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Override theme styleOverrides
      '&.MuiListItemText-primary[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      // Force on all child elements
      '& *': {
        fontFamily: `${typography.fontFamily} !important`,
      },
    };
  };





  return {
    // Raw typography objects
    getComponentTypography,
    
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