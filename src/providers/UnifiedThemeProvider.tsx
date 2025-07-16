import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useAppSelector } from '../storeHooks';
import { theme as baseTheme } from '../theme/theme';
import { STYLE_GUIDE } from '../styles';
import { TypographyProvider, useTypography } from '../context/TypographyContext';

interface UnifiedThemeProviderProps {
  children: React.ReactNode;
}

const UnifiedThemeProviderInner: React.FC<UnifiedThemeProviderProps> = ({ children }) => {
  const { dashboardTheme } = useAppSelector((state) => state.dashboardTheme);
  const { typographySettings } = useTypography();
  
  // Use dashboard theme typography if available, otherwise use typography context
  const effectiveTypographySettings = dashboardTheme?.typography ? {
    fontFamily: dashboardTheme.typography.fontFamily,
    fontSize: dashboardTheme.typography.fontSize,
    fontWeight: dashboardTheme.typography.fontWeight,
  } : typographySettings;

  // Helper function to get component-specific typography
  const getComponentTypography = (componentType: 'headings' | 'body' | 'buttons' | 'cards' | 'inputs' | 'tables' | 'navigation') => {
    if (!dashboardTheme?.typography) {
      return effectiveTypographySettings;
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

  // Create a unified theme that combines the base MUI theme with the dashboard theme and typography settings
  const unifiedTheme = React.useMemo(() => {
    console.log('Creating unified theme with typography:', {
      effectiveTypographySettings,
      dashboardTheme: dashboardTheme?.typography,
      headings: getComponentTypography('headings'),
      body: getComponentTypography('body'),
    });

    const baseThemeWithTypography = {
      ...baseTheme,
      typography: {
        ...baseTheme.typography,
        fontFamily: effectiveTypographySettings.fontFamily,
        fontSize: parseInt(effectiveTypographySettings.fontSize),
        // Override specific typography variants to use the selected font
        h1: {
          ...baseTheme.typography.h1,
          fontFamily: getComponentTypography('headings').fontFamily,
          fontWeight: parseInt(getComponentTypography('headings').fontWeight),
          fontSize: getComponentTypography('headings').fontSize,
        },
        h2: {
          ...baseTheme.typography.h2,
          fontFamily: getComponentTypography('headings').fontFamily,
          fontWeight: parseInt(getComponentTypography('headings').fontWeight),
          fontSize: getComponentTypography('headings').fontSize,
        },
        h3: {
          ...baseTheme.typography.h3,
          fontFamily: getComponentTypography('headings').fontFamily,
          fontWeight: parseInt(getComponentTypography('headings').fontWeight),
          fontSize: getComponentTypography('headings').fontSize,
        },
        h4: {
          ...baseTheme.typography.h4,
          fontFamily: getComponentTypography('headings').fontFamily,
          fontWeight: parseInt(getComponentTypography('headings').fontWeight),
          fontSize: getComponentTypography('headings').fontSize,
        },
        h5: {
          ...baseTheme.typography.h5,
          fontFamily: getComponentTypography('headings').fontFamily,
          fontWeight: parseInt(getComponentTypography('headings').fontWeight),
          fontSize: getComponentTypography('headings').fontSize,
        },
        h6: {
          ...baseTheme.typography.h6,
          fontFamily: getComponentTypography('headings').fontFamily,
          fontWeight: parseInt(getComponentTypography('headings').fontWeight),
          fontSize: getComponentTypography('headings').fontSize,
        },
        body1: {
          ...baseTheme.typography.body1,
          fontFamily: getComponentTypography('body').fontFamily,
          fontSize: getComponentTypography('body').fontSize,
          fontWeight: parseInt(getComponentTypography('body').fontWeight),
        },
        body2: {
          ...baseTheme.typography.body2,
          fontFamily: getComponentTypography('body').fontFamily,
          fontSize: getComponentTypography('body').fontSize,
          fontWeight: parseInt(getComponentTypography('body').fontWeight),
        },
        button: {
          ...baseTheme.typography.button,
          fontFamily: getComponentTypography('buttons').fontFamily,
          fontWeight: parseInt(getComponentTypography('buttons').fontWeight),
        },
        caption: {
          ...baseTheme.typography.caption,
          fontFamily: getComponentTypography('body').fontFamily,
          fontWeight: parseInt(getComponentTypography('body').fontWeight),
        },
        overline: {
          ...baseTheme.typography.overline,
          fontFamily: getComponentTypography('body').fontFamily,
          fontWeight: parseInt(getComponentTypography('body').fontWeight),
        },
      },
    };

    if (!dashboardTheme) {
      return baseThemeWithTypography;
    }

    return createTheme({
      ...baseThemeWithTypography,
      palette: {
        ...baseThemeWithTypography.palette,
        primary: {
          main: dashboardTheme.colors.primary.main,
          light: dashboardTheme.colors.primary.light,
          dark: dashboardTheme.colors.primary.main, // Use main as dark fallback
          contrastText: dashboardTheme.colors.primary.contrastText,
        },
        secondary: {
          main: dashboardTheme.colors.secondary.main,
          light: dashboardTheme.colors.secondary.light,
          dark: dashboardTheme.colors.secondary.dark,
          contrastText: dashboardTheme.colors.secondary.contrastText,
        },
        background: {
          default: dashboardTheme.colors.background.default,
          paper: dashboardTheme.colors.background.paper,
        },
        text: {
          primary: dashboardTheme.colors.text.primary,
          secondary: dashboardTheme.colors.text.secondary,
          disabled: dashboardTheme.colors.text.disabled,
        },
        divider: dashboardTheme.colors.divider,
        // Custom palette properties
        border: {
          main: dashboardTheme.colors.border,
          hover: dashboardTheme.colors.borderHover,
        },
        input: {
          text: dashboardTheme.colors.inputText,
          border: dashboardTheme.colors.inputBorder,
          focusBorder: dashboardTheme.components?.input?.focusBorderColor || baseTheme.palette.primary.main,
        },
        dropdown: {
          background: dashboardTheme.colors.dropdownBg,
          optionBackground: dashboardTheme.colors.dropdownOptionBg,
          optionText: dashboardTheme.colors.dropdownOptionText,
          optionHoverBackground: dashboardTheme.colors.background.hover,
          border: dashboardTheme.colors.dropdownBorder,
          selectedText: dashboardTheme.colors.dropdownSelectedText,
          labelColor: dashboardTheme.colors.dropdownLabelColor,
          focusedBorder: dashboardTheme.colors.dropdownFocusedBorder,
          focusedLabel: dashboardTheme.colors.dropdownFocusedLabel,
        },
        table: {
          headerBackground: dashboardTheme.components?.table?.headerBackground || STYLE_GUIDE.COLORS.backgroundLightGray,
          headerText: dashboardTheme.components?.table?.headerText || STYLE_GUIDE.COLORS.textGray,
          rowOddBackground: dashboardTheme.components?.table?.rowOddBackground || STYLE_GUIDE.COLORS.backgroundDefault,
          rowEvenBackground: dashboardTheme.components?.table?.rowEvenBackground || STYLE_GUIDE.COLORS.white,
          rowHoverBackground: dashboardTheme.components?.table?.rowHoverBackground || STYLE_GUIDE.COLORS.backgroundHover,
          rowText: dashboardTheme.components?.table?.rowText || STYLE_GUIDE.COLORS.textDarkGray,
        },
        card: {
          background: dashboardTheme.colors.background.card,
          border: dashboardTheme.colors.border,
          shadow: dashboardTheme.components.card.boxShadow,
        },
        dialog: {
          background: dashboardTheme.components.dialog.backgroundColor,
          border: dashboardTheme.components.dialog.borderColor,
          shadow: dashboardTheme.components.dialog.boxShadow,
          borderRadius: dashboardTheme.components.dialog.borderRadius,
          titleColor: dashboardTheme.components.dialog.titleColor,
          titleFontSize: dashboardTheme.components.dialog.titleFontSize,
          titleFontWeight: dashboardTheme.components.dialog.titleFontWeight,
          contentColor: dashboardTheme.components.dialog.contentColor,
          contentFontSize: dashboardTheme.components.dialog.contentFontSize,
          overlayColor: dashboardTheme.components.dialog.overlayColor,
        },
        icon: {
          primary: dashboardTheme.colors.iconPrimary,
        },
      },
      components: {
        ...baseThemeWithTypography.components,
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: dashboardTheme.components?.button?.textTransform || 'none',
              fontFamily: `${getComponentTypography('buttons').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('buttons').fontWeight),
              fontSize: getComponentTypography('buttons').fontSize,
            },
            text: {
              fontFamily: `${getComponentTypography('buttons').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('buttons').fontWeight),
              fontSize: getComponentTypography('buttons').fontSize,
            },
            outlined: {
              fontFamily: `${getComponentTypography('buttons').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('buttons').fontWeight),
              fontSize: getComponentTypography('buttons').fontSize,
            },
            contained: {
              fontFamily: `${getComponentTypography('buttons').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('buttons').fontWeight),
              fontSize: getComponentTypography('buttons').fontSize,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              boxShadow: dashboardTheme.components?.card?.boxShadow || STYLE_GUIDE.SHADOWS.sm,
              backgroundColor: dashboardTheme.colors.background.card || STYLE_GUIDE.COLORS.backgroundSurface,
              fontFamily: `${getComponentTypography('cards').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('cards').fontWeight),
              fontSize: getComponentTypography('cards').fontSize,
            },
          },
        },

        MuiDialog: {
          styleOverrides: {
            paper: {
              backgroundColor: dashboardTheme.components?.dialog?.backgroundColor || STYLE_GUIDE.COLORS.white,
              border: `1px solid ${dashboardTheme.components?.dialog?.borderColor || dashboardTheme.colors.border}`,
              boxShadow: dashboardTheme.components?.dialog?.boxShadow || STYLE_GUIDE.SHADOWS.lg,
              borderRadius: dashboardTheme.components?.dialog?.borderRadius || '8px',
            },
          },
        },
        MuiDialogTitle: {
          styleOverrides: {
            root: {
              color: dashboardTheme.components?.dialog?.titleColor || dashboardTheme.colors.text.primary,
              fontSize: dashboardTheme.components?.dialog?.titleFontSize || '1.25rem',
              fontWeight: dashboardTheme.components?.dialog?.titleFontWeight || STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
              padding: '16px 24px',
              borderBottom: `1px solid ${dashboardTheme.colors.divider}`,
              fontFamily: `${getComponentTypography('headings').fontFamily} !important`,
            },
          },
        },
        MuiDialogContent: {
          styleOverrides: {
            root: {
              color: dashboardTheme.components?.dialog?.contentColor || dashboardTheme.colors.text.primary,
              fontSize: dashboardTheme.components?.dialog?.contentFontSize || '1rem',
              padding: '16px 24px',
              fontFamily: `${getComponentTypography('body').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('body').fontWeight),
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              boxShadow: dashboardTheme.components?.paper?.boxShadow || STYLE_GUIDE.SHADOWS.sm,
              backgroundColor: dashboardTheme.colors.background.paper || STYLE_GUIDE.COLORS.white,
              fontFamily: `${getComponentTypography('cards').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('cards').fontWeight),
              fontSize: getComponentTypography('cards').fontSize,
            },
          },
        },
        MuiTableRow: {
          styleOverrides: {
            root: {
              '&:nth-of-type(odd)': {
                backgroundColor: dashboardTheme.components?.table?.rowOddBackground || STYLE_GUIDE.COLORS.backgroundDefault,
              },
              '&:nth-of-type(even)': {
                backgroundColor: dashboardTheme.components?.table?.rowEvenBackground || STYLE_GUIDE.COLORS.white,
              },
              '&:hover': {
                backgroundColor: dashboardTheme.components?.table?.rowHoverBackground || STYLE_GUIDE.COLORS.backgroundHover,
              },
            },
          },
        },
        MuiTypography: {
          styleOverrides: {
            root: {
              fontFamily: `${getComponentTypography('body').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('body').fontWeight),
              fontSize: getComponentTypography('body').fontSize,
            },
            h1: {
              fontFamily: `${getComponentTypography('headings').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('headings').fontWeight),
              fontSize: getComponentTypography('headings').fontSize,
            },
            h2: {
              fontFamily: `${getComponentTypography('headings').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('headings').fontWeight),
              fontSize: getComponentTypography('headings').fontSize,
            },
            h3: {
              fontFamily: `${getComponentTypography('headings').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('headings').fontWeight),
              fontSize: getComponentTypography('headings').fontSize,
            },
            h4: {
              fontFamily: `${getComponentTypography('headings').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('headings').fontWeight),
              fontSize: getComponentTypography('headings').fontSize,
            },
            h5: {
              fontFamily: `${getComponentTypography('headings').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('headings').fontWeight),
              fontSize: getComponentTypography('headings').fontSize,
            },
            h6: {
              fontFamily: `${getComponentTypography('headings').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('headings').fontWeight),
              fontSize: getComponentTypography('headings').fontSize,
            },
            body1: {
              fontFamily: `${getComponentTypography('body').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('body').fontWeight),
              fontSize: getComponentTypography('body').fontSize,
            },
            body2: {
              fontFamily: `${getComponentTypography('body').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('body').fontWeight),
              fontSize: getComponentTypography('body').fontSize,
            },
          },
        },
        MuiInputBase: {
          styleOverrides: {
            root: {
              fontFamily: `${getComponentTypography('inputs').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('inputs').fontWeight),
              fontSize: getComponentTypography('inputs').fontSize,
            },
            input: {
              fontFamily: `${getComponentTypography('inputs').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('inputs').fontWeight),
              fontSize: getComponentTypography('inputs').fontSize,
            },
          },
        },
        MuiInputLabel: {
          styleOverrides: {
            root: {
              fontFamily: `${getComponentTypography('inputs').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('inputs').fontWeight),
              fontSize: getComponentTypography('inputs').fontSize,
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              fontFamily: `${getComponentTypography('inputs').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('inputs').fontWeight),
              fontSize: getComponentTypography('inputs').fontSize,
            },
          },
        },
        MuiListItemButton: {
          styleOverrides: {
            root: {
              fontFamily: `${getComponentTypography('navigation').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('navigation').fontWeight),
              fontSize: getComponentTypography('navigation').fontSize,
            },
          },
        },
        MuiListItemText: {
          styleOverrides: {
            root: {
              fontFamily: `${getComponentTypography('navigation').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('navigation').fontWeight),
              fontSize: getComponentTypography('navigation').fontSize,
            },
            primary: {
              fontFamily: `${getComponentTypography('navigation').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('navigation').fontWeight),
              fontSize: getComponentTypography('navigation').fontSize,
            },
            secondary: {
              fontFamily: `${getComponentTypography('navigation').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('navigation').fontWeight),
              fontSize: getComponentTypography('navigation').fontSize,
            },
          },
        },
        MuiListItem: {
          styleOverrides: {
            root: {
              fontFamily: `${getComponentTypography('navigation').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('navigation').fontWeight),
              fontSize: getComponentTypography('navigation').fontSize,
            },
          },
        },
        MuiList: {
          styleOverrides: {
            root: {
              fontFamily: `${getComponentTypography('navigation').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('navigation').fontWeight),
              fontSize: getComponentTypography('navigation').fontSize,
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              fontFamily: `${getComponentTypography('tables').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('tables').fontWeight),
              fontSize: getComponentTypography('tables').fontSize,
            },
            head: {
              backgroundColor: dashboardTheme.components?.table?.headerBackground || STYLE_GUIDE.COLORS.backgroundLightGray,
              color: dashboardTheme.components?.table?.headerText || STYLE_GUIDE.COLORS.textGray,
              fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
              fontFamily: `${getComponentTypography('tables').fontFamily} !important`,
              fontSize: getComponentTypography('tables').fontSize,
            },
            body: {
              color: dashboardTheme.components?.table?.rowText || STYLE_GUIDE.COLORS.textDarkGray,
              fontFamily: `${getComponentTypography('tables').fontFamily} !important`,
              fontWeight: parseInt(getComponentTypography('tables').fontWeight),
              fontSize: getComponentTypography('tables').fontSize,
            },
          },
        },
      },
      // Add dashboard theme for backward compatibility
      dashboardTheme,
    });
  }, [dashboardTheme, typographySettings, effectiveTypographySettings, getComponentTypography]);

  return (
    <ThemeProvider theme={unifiedTheme}>
      <style>
        {(() => {
          const headingsTypography = getComponentTypography('headings');
          const bodyTypography = getComponentTypography('body');
          const buttonsTypography = getComponentTypography('buttons');
          const cardsTypography = getComponentTypography('cards');
          const inputsTypography = getComponentTypography('inputs');
          const tablesTypography = getComponentTypography('tables');
          const navigationTypography = getComponentTypography('navigation');
          

          
          const cssString = `
            :root {
              --theme-font-family-primary: ${effectiveTypographySettings.fontFamily};
              --theme-font-family-headings: ${headingsTypography.fontFamily};
              --theme-font-family-body: ${bodyTypography.fontFamily};
              --theme-font-family-buttons: ${buttonsTypography.fontFamily};
              --theme-font-family-cards: ${cardsTypography.fontFamily};
              --theme-font-family-inputs: ${inputsTypography.fontFamily};
              --theme-font-family-tables: ${tablesTypography.fontFamily};
              --theme-font-family-navigation: ${navigationTypography.fontFamily};
            }
            
            /* Force typography on all elements */
            * {
              font-family: var(--theme-font-family-primary) !important;
            }
            
            /* Force typography on specific elements */
            body, html, #root {
              font-family: var(--theme-font-family-primary) !important;
            }
            
            /* Force typography on headings */
            h1, h2, h3, h4, h5, h6,
            .MuiTypography-h1, .MuiTypography-h2, .MuiTypography-h3, 
            .MuiTypography-h4, .MuiTypography-h5, .MuiTypography-h6 {
              font-family: var(--theme-font-family-headings) !important;
            }
            
            /* Force typography on buttons */
            button, .MuiButton-root, .MuiButtonBase-root,
            .MuiButton-text, .MuiButton-outlined, .MuiButton-contained {
              font-family: var(--theme-font-family-buttons) !important;
            }
            
            /* Force typography on inputs */
            input, textarea, .MuiInputBase-root, .MuiTextField-root,
            .MuiInputBase-input, .MuiInputLabel-root {
              font-family: var(--theme-font-family-inputs) !important;
            }
            
            /* Force typography on cards and papers */
            .MuiCard-root, .MuiPaper-root {
              font-family: var(--theme-font-family-cards) !important;
            }
            
            /* Force typography on navigation */
            nav, .MuiDrawer-root, .MuiAppBar-root,
            .MuiListItemButton-root, .MuiListItemText-root,
            .MuiListItemText-primary, .MuiListItemText-secondary,
            .MuiListItem-root, .MuiList-root {
              font-family: var(--theme-font-family-navigation) !important;
            }
            
            /* Force typography on body text */
            .MuiTypography-root,
            .MuiTypography-body1, .MuiTypography-body2,
            .MuiTypography-button, .MuiTypography-caption,
            .MuiTypography-overline, .MuiTypography-subtitle1,
            .MuiTypography-subtitle2 {
              font-family: var(--theme-font-family-body) !important;
            }
            
            /* Force typography on tables */
            .MuiTableCell-root, .MuiTableCell-head, .MuiTableCell-body,
            .MuiTable-root, .MuiTableHead-root, .MuiTableBody-root, .MuiTableRow-root,
            .MuiTableContainer-root .MuiTable-root .MuiTableCell-root,
            .MuiTableContainer-root .MuiTable-root .MuiTableHead-root .MuiTableRow-root .MuiTableCell-root,
            .MuiTableContainer-root .MuiTable-root .MuiTableBody-root .MuiTableRow-root .MuiTableCell-root,
            [class*="MuiTableCell"], div[class*="StyledTableCell"] {
              font-family: var(--theme-font-family-tables) !important;
            }
            
            /* Override any inline styles */
            [style*="font-family"] {
              font-family: var(--theme-font-family-primary) !important;
            }
          `;
          

          
          return cssString;
        })()}
      </style>
      {children}
    </ThemeProvider>
  );
};

const UnifiedThemeProvider: React.FC<UnifiedThemeProviderProps> = ({ children }) => {
  return (
    <TypographyProvider>
      <UnifiedThemeProviderInner>
        {children}
      </UnifiedThemeProviderInner>
    </TypographyProvider>
  );
};

export default UnifiedThemeProvider; 