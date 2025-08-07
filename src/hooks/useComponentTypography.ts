import { useAppSelector } from '../storeHooks';
import { useTypographySettings } from './useTypographySettings';

export const useComponentTypography = () => {
  const { dashboardTheme } = useAppSelector((state) => state.dashboardTheme);
  const { typographySettings } = useTypographySettings();

  const getComponentTypography = (componentType: 'headings' | 'body' | 'buttons' | 'cards' | 'inputs' | 'tables' | 'navigation' | 'dialog') => {
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


  const getHeadingSx = () => {
    const typography = getComponentTypography('headings');
    return {
      fontFamily: `${typography.fontFamily} !important`,
      fontSize: typography.fontSize,
      fontWeight: parseInt(typography.fontWeight),
      '&.MuiTypography-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiTypography-h1, &.MuiTypography-h2, &.MuiTypography-h3, &.MuiTypography-h4, &.MuiTypography-h5, &.MuiTypography-h6': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiTypography-root[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
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
      '&.MuiTypography-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiTypography-body1, &.MuiTypography-body2': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiTypography-root[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
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
      '&[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiButton-root[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
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
      '&.MuiCard-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiCardContent-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiCardHeader-root': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiCard-root[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
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
      '&[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiInputBase-root[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
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
      '& .MuiTableHead-root .MuiTableCell-root[class*="MuiTableCell-head"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '& .MuiTableBody-root .MuiTableCell-root[class*="MuiTableCell-body"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '& .MuiTableCell-root[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiTable-root[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '& *': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '& .MuiTableCell-root *': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '& .MuiTableCell-root[class*="MuiTableCell"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
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
      '&[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiListItemText-primary[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '& *': {
        fontFamily: `${typography.fontFamily} !important`,
      },
    };
  };

  const getDialogTitleSx = () => {
    const typography = getComponentTypography('dialog');
    return {
      fontFamily: `${typography.fontFamily} !important`,
      fontSize: typography.fontSize,
      fontWeight: parseInt(typography.fontWeight),
      '&.MuiDialogTitle-root': {
        fontFamily: `${typography.fontFamily} !important`,
        fontSize: `${typography.fontSize} !important`,
        fontWeight: `${typography.fontWeight} !important`,
      },
      '&.MuiTypography-root': {
        fontFamily: `${typography.fontFamily} !important`,
        fontSize: `${typography.fontSize} !important`,
        fontWeight: `${typography.fontWeight} !important`,
      },
      '&[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&[style*="font-size"]': {
        fontSize: `${typography.fontSize} !important`,
      },
      '&[style*="font-weight"]': {
        fontWeight: `${typography.fontWeight} !important`,
      },
      '&.MuiDialogTitle-root[style*="font-family"]': {
        fontFamily: `${typography.fontFamily} !important`,
      },
      '&.MuiDialogTitle-root[style*="font-size"]': {
        fontSize: `${typography.fontSize} !important`,
      },
      '&.MuiDialogTitle-root[style*="font-weight"]': {
        fontWeight: `${typography.fontWeight} !important`,
      },
      '& *': {
        fontFamily: `${typography.fontFamily} !important`,
        fontSize: `${typography.fontSize} !important`,
        fontWeight: `${typography.fontWeight} !important`,
      },
      '& .MuiTypography-root': {
        fontFamily: `${typography.fontFamily} !important`,
        fontSize: `${typography.fontSize} !important`,
        fontWeight: `${typography.fontWeight} !important`,
      },
      '&.MuiDialogTitle-root.MuiTypography-root': {
        fontFamily: `${typography.fontFamily} !important`,
        fontSize: `${typography.fontSize} !important`,
        fontWeight: `${typography.fontWeight} !important`,
      },
    };
  };





  return {
    getComponentTypography,
    getHeadingSx,
    getBodySx,
    getButtonSx,
    getCardSx,
    getInputSx,
    getTableSx,
    getNavigationSx,
    getDialogTitleSx,
    hasDashboardTheme: !!dashboardTheme?.typography,
    currentTheme: dashboardTheme,
  };
}; 