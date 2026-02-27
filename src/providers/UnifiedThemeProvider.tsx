import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useAppSelector } from "../storeHooks";
import { theme as baseTheme } from "../theme/theme";
import { STYLE_GUIDE } from "../styles";
import {
  TypographyProvider,
  useTypography,
} from "../context/TypographyContext";
import { useAppTheme } from "../context/AppThemeContext";

interface UnifiedThemeProviderProps {
  children: React.ReactNode;
}

const UnifiedThemeProviderInner: React.FC<UnifiedThemeProviderProps> = ({
  children,
}) => {
  const dashboardTheme = useAppSelector(
    (state) => state.dashboardTheme.dashboardTheme
  );
  const { typographySettings } = useTypography();
  const { theme: appTheme } = useAppTheme();

  const effectiveTypographySettings = dashboardTheme?.typography
    ? {
        fontFamily: dashboardTheme.typography.fontFamily,
        fontSize: dashboardTheme.typography.fontSize,
        fontWeight: dashboardTheme.typography.fontWeight,
      }
    : typographySettings;

  const getComponentTypography = (
    componentType:
      | "headings"
      | "body"
      | "buttons"
      | "cards"
      | "inputs"
      | "tables"
      | "navigation"
      | "dialog"
  ) => {
    if (!dashboardTheme?.typography) {
      return effectiveTypographySettings;
    }

    const componentTypography = dashboardTheme.typography[componentType];
    if (componentTypography) {
      return {
        fontFamily:
          componentTypography.fontFamily ||
          dashboardTheme.typography.fontFamily,
        fontSize:
          componentTypography.fontSize || dashboardTheme.typography.fontSize,
        fontWeight:
          componentTypography.fontWeight ||
          dashboardTheme.typography.fontWeight,
      };
    }

    return {
      fontFamily: dashboardTheme.typography.fontFamily,
      fontSize: dashboardTheme.typography.fontSize,
      fontWeight: dashboardTheme.typography.fontWeight,
    };
  };

  const unifiedTheme = React.useMemo(() => {
    // Dark mode color definitions
    const isDarkMode = appTheme.mode === "dark";
    const darkBackground = {
      default: "#121212",
      paper: "#1E1E1E",
    };
    const darkText = {
      primary: "#FFFFFF",
      secondary: "rgba(255, 255, 255, 0.7)",
      disabled: "rgba(255, 255, 255, 0.5)",
    };
    const darkDivider = "rgba(255, 255, 255, 0.12)";

    const baseThemeWithTypography = {
      ...baseTheme,
      palette: {
        ...baseTheme.palette,
        mode: appTheme.mode,
        primary: {
          ...baseTheme.palette.primary,
          main: appTheme.primaryColor,
        },
        background: isDarkMode
          ? darkBackground
          : baseTheme.palette.background,
        text: isDarkMode ? darkText : baseTheme.palette.text,
        divider: isDarkMode ? darkDivider : baseTheme.palette.divider,
      },
      typography: {
        ...baseTheme.typography,
        fontFamily: effectiveTypographySettings.fontFamily,
        fontSize: parseInt(effectiveTypographySettings.fontSize),
        h1: {
          ...baseTheme.typography.h1,
          fontFamily: getComponentTypography("headings").fontFamily,
          fontWeight: parseInt(getComponentTypography("headings").fontWeight),
          fontSize: getComponentTypography("headings").fontSize,
        },
        h2: {
          ...baseTheme.typography.h2,
          fontFamily: getComponentTypography("headings").fontFamily,
          fontWeight: parseInt(getComponentTypography("headings").fontWeight),
          fontSize: getComponentTypography("headings").fontSize,
        },
        h3: {
          ...baseTheme.typography.h3,
          fontFamily: getComponentTypography("headings").fontFamily,
          fontWeight: parseInt(getComponentTypography("headings").fontWeight),
          fontSize: getComponentTypography("headings").fontSize,
        },
        h4: {
          ...baseTheme.typography.h4,
          fontFamily: getComponentTypography("headings").fontFamily,
          fontWeight: parseInt(getComponentTypography("headings").fontWeight),
          fontSize: getComponentTypography("headings").fontSize,
        },
        h5: {
          ...baseTheme.typography.h5,
          fontFamily: getComponentTypography("headings").fontFamily,
          fontWeight: parseInt(getComponentTypography("headings").fontWeight),
          fontSize: getComponentTypography("headings").fontSize,
        },
        h6: {
          ...baseTheme.typography.h6,
          fontFamily: getComponentTypography("headings").fontFamily,
          fontWeight: parseInt(getComponentTypography("headings").fontWeight),
          fontSize: getComponentTypography("headings").fontSize,
        },
        body1: {
          ...baseTheme.typography.body1,
          fontFamily: getComponentTypography("body").fontFamily,
          fontSize: getComponentTypography("body").fontSize,
          fontWeight: parseInt(getComponentTypography("body").fontWeight),
        },
        body2: {
          ...baseTheme.typography.body2,
          fontFamily: getComponentTypography("body").fontFamily,
          fontSize: getComponentTypography("body").fontSize,
          fontWeight: parseInt(getComponentTypography("body").fontWeight),
        },
        button: {
          ...baseTheme.typography.button,
          fontFamily: getComponentTypography("buttons").fontFamily,
          fontWeight: parseInt(getComponentTypography("buttons").fontWeight),
        },
        caption: {
          ...baseTheme.typography.caption,
          fontFamily: getComponentTypography("body").fontFamily,
          fontWeight: parseInt(getComponentTypography("body").fontWeight),
        },
        overline: {
          ...baseTheme.typography.overline,
          fontFamily: getComponentTypography("body").fontFamily,
          fontWeight: parseInt(getComponentTypography("body").fontWeight),
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
        mode: appTheme.mode,
        primary: {
          main: appTheme.primaryColor,
          light: dashboardTheme.colors.primary.light,
          dark: dashboardTheme.colors.primary.main,
          contrastText: dashboardTheme.colors.primary.contrastText,
        },
        secondary: {
          main: dashboardTheme.colors.secondary.main,
          light: dashboardTheme.colors.secondary.light,
          dark: dashboardTheme.colors.secondary.dark,
          contrastText: dashboardTheme.colors.secondary.contrastText,
        },
        background: isDarkMode
          ? {
              default: darkBackground.default,
              paper: darkBackground.paper,
            }
          : {
              default: dashboardTheme.colors.background.default,
              paper: dashboardTheme.colors.background.paper,
            },
        text: isDarkMode
          ? darkText
          : {
              primary: dashboardTheme.colors.text.primary,
              secondary: dashboardTheme.colors.text.secondary,
              disabled: dashboardTheme.colors.text.disabled,
            },
        divider: isDarkMode ? darkDivider : dashboardTheme.colors.divider,
        border: {
          main: dashboardTheme.colors.border,
          hover: dashboardTheme.colors.borderHover,
        },
        input: {
          text: dashboardTheme.colors.inputText,
          border: dashboardTheme.colors.inputBorder,
          focusBorder:
            dashboardTheme.components?.input?.focusBorderColor ||
            baseTheme.palette.primary.main,
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
          headerBackground:
            dashboardTheme.components?.table?.headerBackground ||
            STYLE_GUIDE.COLORS.backgroundLightGray,
          headerText:
            dashboardTheme.components?.table?.headerText ||
            STYLE_GUIDE.COLORS.textGray,
          rowOddBackground:
            dashboardTheme.components?.table?.rowOddBackground ||
            STYLE_GUIDE.COLORS.backgroundDefault,
          rowEvenBackground:
            dashboardTheme.components?.table?.rowEvenBackground ||
            STYLE_GUIDE.COLORS.white,
          rowHoverBackground:
            dashboardTheme.components?.table?.rowHoverBackground ||
            STYLE_GUIDE.COLORS.backgroundHover,
          rowText:
            dashboardTheme.components?.table?.rowText ||
            STYLE_GUIDE.COLORS.textDarkGray,
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
          titleFontFamily: dashboardTheme.components.dialog.titleFontFamily,
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
              textTransform:
                dashboardTheme.components?.button?.textTransform || "none",
              fontFamily: `${
                getComponentTypography("buttons").fontFamily
              } !important`,
              fontWeight: parseInt(
                getComponentTypography("buttons").fontWeight
              ),
              fontSize: getComponentTypography("buttons").fontSize,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-1px)",
              },
              "&:active": {
                transform: "translateY(0)",
              },
            },
            text: {
              fontFamily: `${
                getComponentTypography("buttons").fontFamily
              } !important`,
              fontWeight: parseInt(
                getComponentTypography("buttons").fontWeight
              ),
              fontSize: getComponentTypography("buttons").fontSize,
            },
            outlined: {
              fontFamily: `${
                getComponentTypography("buttons").fontFamily
              } !important`,
              fontWeight: parseInt(
                getComponentTypography("buttons").fontWeight
              ),
              fontSize: getComponentTypography("buttons").fontSize,
            },
            contained: {
              fontFamily: `${
                getComponentTypography("buttons").fontFamily
              } !important`,
              fontWeight: parseInt(
                getComponentTypography("buttons").fontWeight
              ),
              fontSize: getComponentTypography("buttons").fontSize,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              boxShadow:
                dashboardTheme.components?.card?.boxShadow ||
                STYLE_GUIDE.SHADOWS.sm,
              backgroundColor:
                dashboardTheme.colors.background.card ||
                STYLE_GUIDE.COLORS.backgroundSurface,
              fontFamily: `${
                getComponentTypography("cards").fontFamily
              } !important`,
              fontWeight: parseInt(getComponentTypography("cards").fontWeight),
              fontSize: getComponentTypography("cards").fontSize,
            },
          },
        },

        MuiDialog: {
          styleOverrides: {
            paper: {
              backgroundColor:
                dashboardTheme.components?.dialog?.backgroundColor ||
                STYLE_GUIDE.COLORS.white,
              border: `1px solid ${
                dashboardTheme.components?.dialog?.borderColor ||
                dashboardTheme.colors.border
              }`,
              boxShadow:
                dashboardTheme.components?.dialog?.boxShadow ||
                STYLE_GUIDE.SHADOWS.lg,
              borderRadius:
                dashboardTheme.components?.dialog?.borderRadius || "8px",
            },
          },
        },
        MuiDialogTitle: {
          styleOverrides: {
            root: {
              color:
                dashboardTheme.components?.dialog?.titleColor ||
                dashboardTheme.colors.text.primary,
              fontSize:
                dashboardTheme.components?.dialog?.titleFontSize || "1.25rem",
              fontWeight:
                dashboardTheme.components?.dialog?.titleFontWeight ||
                STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
              padding: "16px 24px",
              borderBottom: `1px solid ${dashboardTheme.colors.divider}`,
            },
          },
        },
        MuiDialogContent: {
          styleOverrides: {
            root: {
              color:
                dashboardTheme.components?.dialog?.contentColor ||
                dashboardTheme.colors.text.primary,
              fontSize:
                dashboardTheme.components?.dialog?.contentFontSize || "1rem",
              padding: "16px 24px",
              fontFamily: `${
                getComponentTypography("body").fontFamily
              } !important`,
              fontWeight: parseInt(getComponentTypography("body").fontWeight),
            },
          },
        },

        MuiPaper: {
          styleOverrides: {
            root: {
              boxShadow:
                dashboardTheme.components?.paper?.boxShadow ||
                STYLE_GUIDE.SHADOWS.sm,
              backgroundColor:
                dashboardTheme.colors.background.paper ||
                STYLE_GUIDE.COLORS.white,
              fontFamily: `${
                getComponentTypography("cards").fontFamily
              } !important`,
              fontWeight: parseInt(getComponentTypography("cards").fontWeight),
              fontSize: getComponentTypography("cards").fontSize,
            },
          },
        },
        MuiTableRow: {
          styleOverrides: {
            root: {
              "&:nth-of-type(odd)": {
                backgroundColor:
                  dashboardTheme.components?.table?.rowOddBackground ||
                  STYLE_GUIDE.COLORS.backgroundDefault,
              },
              "&:nth-of-type(even)": {
                backgroundColor:
                  dashboardTheme.components?.table?.rowEvenBackground ||
                  STYLE_GUIDE.COLORS.white,
              },
              "&:hover": {
                backgroundColor:
                  dashboardTheme.components?.table?.rowHoverBackground ||
                  STYLE_GUIDE.COLORS.backgroundHover,
              },
            },
          },
        },
        MuiTypography: {
          styleOverrides: {
            root: {
              fontFamily: `${
                getComponentTypography("body").fontFamily
              } !important`,
              fontWeight: parseInt(getComponentTypography("body").fontWeight),
              fontSize: getComponentTypography("body").fontSize,
            },
            h1: {
              fontFamily: `${
                getComponentTypography("headings").fontFamily
              } !important`,
              fontWeight: parseInt(
                getComponentTypography("headings").fontWeight
              ),
              fontSize: getComponentTypography("headings").fontSize,
            },
            h2: {
              fontFamily: `${
                getComponentTypography("headings").fontFamily
              } !important`,
              fontWeight: parseInt(
                getComponentTypography("headings").fontWeight
              ),
              fontSize: getComponentTypography("headings").fontSize,
            },
            h3: {
              fontFamily: `${
                getComponentTypography("headings").fontFamily
              } !important`,
              fontWeight: parseInt(
                getComponentTypography("headings").fontWeight
              ),
              fontSize: getComponentTypography("headings").fontSize,
            },
            h4: {
              fontFamily: `${
                getComponentTypography("headings").fontFamily
              } !important`,
              fontWeight: parseInt(
                getComponentTypography("headings").fontWeight
              ),
              fontSize: getComponentTypography("headings").fontSize,
            },
            h5: {
              fontFamily: `${
                getComponentTypography("headings").fontFamily
              } !important`,
              fontWeight: parseInt(
                getComponentTypography("headings").fontWeight
              ),
              fontSize: getComponentTypography("headings").fontSize,
            },
            h6: {
              fontFamily: `${
                getComponentTypography("headings").fontFamily
              } !important`,
              fontWeight: parseInt(
                getComponentTypography("headings").fontWeight
              ),
              fontSize: getComponentTypography("headings").fontSize,
            },
            body1: {
              fontFamily: `${
                getComponentTypography("body").fontFamily
              } !important`,
              fontWeight: parseInt(getComponentTypography("body").fontWeight),
              fontSize: getComponentTypography("body").fontSize,
            },
            body2: {
              fontFamily: `${
                getComponentTypography("body").fontFamily
              } !important`,
              fontWeight: parseInt(getComponentTypography("body").fontWeight),
              fontSize: getComponentTypography("body").fontSize,
            },
          },
        },
        MuiInputBase: {
          styleOverrides: {
            root: {
              fontFamily: `${
                getComponentTypography("inputs").fontFamily
              } !important`,
              fontWeight: parseInt(getComponentTypography("inputs").fontWeight),
              fontSize: getComponentTypography("inputs").fontSize,
            },
            input: {
              fontFamily: `${
                getComponentTypography("inputs").fontFamily
              } !important`,
              fontWeight: parseInt(getComponentTypography("inputs").fontWeight),
              fontSize: getComponentTypography("inputs").fontSize,
            },
          },
        },
        MuiInputLabel: {
          styleOverrides: {
            root: {
              fontFamily: `${
                getComponentTypography("inputs").fontFamily
              } !important`,
              fontWeight: parseInt(getComponentTypography("inputs").fontWeight),
              fontSize: getComponentTypography("inputs").fontSize,
            },
            outlined: {
              top: 0,
              transform: 'translate(14px, 9px) scale(1)',
              '&.MuiInputLabel-shrink': {
                transform: 'translate(14px, -6px) scale(0.75)',
              },
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              fontFamily: `${
                getComponentTypography("inputs").fontFamily
              } !important`,
              fontWeight: parseInt(getComponentTypography("inputs").fontWeight),
              fontSize: getComponentTypography("inputs").fontSize,
            },
          },
        },
        MuiListItemButton: {
          styleOverrides: {
            root: {
              fontFamily: `${
                getComponentTypography("navigation").fontFamily
              } !important`,
              fontWeight: parseInt(
                getComponentTypography("navigation").fontWeight
              ),
              fontSize: getComponentTypography("navigation").fontSize,
            },
          },
        },
        MuiListItemText: {
          styleOverrides: {
            root: {
              fontFamily: `${
                getComponentTypography("navigation").fontFamily
              } !important`,
              fontWeight: parseInt(
                getComponentTypography("navigation").fontWeight
              ),
              fontSize: getComponentTypography("navigation").fontSize,
            },
            primary: {
              fontFamily: `${
                getComponentTypography("navigation").fontFamily
              } !important`,
              fontWeight: parseInt(
                getComponentTypography("navigation").fontWeight
              ),
              fontSize: getComponentTypography("navigation").fontSize,
            },
            secondary: {
              fontFamily: `${
                getComponentTypography("navigation").fontFamily
              } !important`,
              fontWeight: parseInt(
                getComponentTypography("navigation").fontWeight
              ),
              fontSize: getComponentTypography("navigation").fontSize,
            },
          },
        },
        MuiListItem: {
          styleOverrides: {
            root: {
              fontFamily: `${
                getComponentTypography("navigation").fontFamily
              } !important`,
              fontWeight: parseInt(
                getComponentTypography("navigation").fontWeight
              ),
              fontSize: getComponentTypography("navigation").fontSize,
            },
          },
        },
        MuiList: {
          styleOverrides: {
            root: {
              fontFamily: `${
                getComponentTypography("navigation").fontFamily
              } !important`,
              fontWeight: parseInt(
                getComponentTypography("navigation").fontWeight
              ),
              fontSize: getComponentTypography("navigation").fontSize,
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              fontFamily: `${
                getComponentTypography("tables").fontFamily
              } !important`,
              fontWeight: parseInt(getComponentTypography("tables").fontWeight),
              fontSize: `${ STYLE_GUIDE.TYPOGRAPHY.fontSize.small } !important`,
            },
            head: {
              backgroundColor:
                dashboardTheme.components?.table?.headerBackground ||
                STYLE_GUIDE.COLORS.backgroundLightGray,
              color:
                dashboardTheme.components?.table?.headerText ||
                STYLE_GUIDE.COLORS.textGray,
              fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
              fontFamily: `${
                getComponentTypography("tables").fontFamily
              } !important`,
              fontSize: getComponentTypography("tables").fontSize,
            },
            body: {
              color:
                dashboardTheme.components?.table?.rowText ||
                STYLE_GUIDE.COLORS.textDarkGray,
              fontFamily: `${
                getComponentTypography("tables").fontFamily
              } !important`,
              fontWeight: parseInt(getComponentTypography("tables").fontWeight),
              fontSize: getComponentTypography("tables").fontSize,
            },
          },
        },
        // DataGrid specific styling (matches modern table design)
        MuiDataGrid: {
          defaultProps: {
            disableColumnResize: true,
            columnHeaderHeight: 48,
          },
          styleOverrides: {
            root: {
              fontFamily: `${
                getComponentTypography("tables").fontFamily
              } !important`,
              fontWeight: parseInt(getComponentTypography("tables").fontWeight),
              fontSize: getComponentTypography("tables").fontSize,
              borderRadius: "0",
              overflow: "hidden",
              backgroundColor:
                dashboardTheme.colors.background.paper ||
                STYLE_GUIDE.COLORS.white,
              // Sticky Actions column (right) – narrow, opaque so content doesn’t show through
              "& .MuiDataGrid-cell[data-field=\"actions\"]": {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              },
              "& .MuiDataGrid-columnSeparator": {
                display: "none",
              },
              "& .MuiDataGrid-main": {
                border: `1px solid ${STYLE_GUIDE.COLORS.tableBorder}`,
                borderRadius: "10px"
              },
            } as React.CSSProperties & Record<string, unknown>,
            columnHeaders: {
              height: "48px",
              minHeight: "48px !important",
              backgroundColor: `${STYLE_GUIDE.COLORS.inputFieldBackground} !important`,
              color: `${
                dashboardTheme.components?.table?.headerText ||
                STYLE_GUIDE.COLORS.tableHeaderText
              } !important`,
              borderBottom: `1px solid ${STYLE_GUIDE.COLORS.tableBorder}`,
            },
            columnHeaderTitle: {
              fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
              color: `${
                dashboardTheme.components?.table?.headerText ||
                STYLE_GUIDE.COLORS.tableHeaderText
              } !important`,
              fontFamily: `${
                getComponentTypography("tables").fontFamily
              } !important`,
              fontSize: `${STYLE_GUIDE.TYPOGRAPHY.fontSize.small} !important`,
            },
            columnHeader: {
              outline: "none",
              background: 'transparent',
              "&:focus, &:focus-within": {
                outline: "none",
              },
              "& .MuiDataGrid-columnSeparator": {
                display: "none",
              },
            },
            cell: {
              color: `${
                dashboardTheme.components?.table?.rowText ||
                STYLE_GUIDE.COLORS.tableBodyText
              } !important`,
              borderBottom: `1px solid ${STYLE_GUIDE.COLORS.tableBorder}`,
              borderRight: "none",
              outline: "none",
              fontFamily: `${
                getComponentTypography("tables").fontFamily
              } !important`,
              fontWeight: parseInt(getComponentTypography("tables").fontWeight),
              fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
            },
            row: {
              "&:nth-of-type(odd)": {
                backgroundColor: `${
                  dashboardTheme.components?.table?.rowOddBackground ||
                  STYLE_GUIDE.COLORS.white
                } !important`,
              },
              "&:nth-of-type(even)": {
                backgroundColor: `${
                  dashboardTheme.components?.table?.rowEvenBackground ||
                  STYLE_GUIDE.COLORS.white
                } !important`,
              },
              "&:hover": {
                backgroundColor: `${
                  STYLE_GUIDE.COLORS.inputFieldBackground
                } !important`,
              },
              "&.Mui-selected": {
                backgroundColor: `${STYLE_GUIDE.COLORS.inputFieldBackground} !important`,
                "&:hover": {
                  backgroundColor: `${STYLE_GUIDE.COLORS.inputFieldBackground} !important`,
                },
              },
            },
            footerContainer: {
              backgroundColor:
                dashboardTheme.colors.background.paper ||
                STYLE_GUIDE.COLORS.white,
              borderTop: `1px solid ${dashboardTheme.colors.divider}`,
              color: dashboardTheme.colors.text.primary,
              fontFamily: `${
                getComponentTypography("tables").fontFamily
              } !important`,
              fontWeight: parseInt(getComponentTypography("tables").fontWeight),
              fontSize: getComponentTypography("tables").fontSize,
            },
            pagination: {
              fontFamily: `${
                getComponentTypography("tables").fontFamily
              } !important`,
              fontWeight: parseInt(getComponentTypography("tables").fontWeight),
              fontSize: getComponentTypography("tables").fontSize,
            },
            virtualScroller: {
              backgroundColor:
                dashboardTheme.colors.background.paper ||
                STYLE_GUIDE.COLORS.white,
            },
            overlay: {
              backgroundColor:
                dashboardTheme.colors.background.paper ||
                STYLE_GUIDE.COLORS.white,
              color: dashboardTheme.colors.text.primary,
              fontFamily: `${
                getComponentTypography("tables").fontFamily
              } !important`,
              fontWeight: parseInt(getComponentTypography("tables").fontWeight),
              fontSize: getComponentTypography("tables").fontSize,
            },
          },
        },
      },
      dashboardTheme,
    });
  }, [
    dashboardTheme,
    typographySettings,
    effectiveTypographySettings,
    getComponentTypography,
    appTheme.mode,
    appTheme.primaryColor,
  ]);

  return <ThemeProvider theme={unifiedTheme}>{children}</ThemeProvider>;
};

const UnifiedThemeProvider: React.FC<UnifiedThemeProviderProps> = ({
  children,
}) => {
  return (
    <TypographyProvider>
      <UnifiedThemeProviderInner>{children}</UnifiedThemeProviderInner>
    </TypographyProvider>
  );
};

export default UnifiedThemeProvider;
