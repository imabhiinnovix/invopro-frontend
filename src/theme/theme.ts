import { createTheme } from '@mui/material/styles';
import { STYLE_GUIDE } from '../styles';
import './themeAugmentation';

// Define common values for reuse
const commonValues = {
  boxShadow: STYLE_GUIDE.SHADOWS.sm,
  colors: {
    primary: {
      main: STYLE_GUIDE.COLORS.primary,
      light: STYLE_GUIDE.COLORS.primaryLight,
      dark: STYLE_GUIDE.COLORS.primaryDark,
      contrastText: STYLE_GUIDE.COLORS.white,
    },
    background: {
      default: STYLE_GUIDE.COLORS.backgroundDefault,
      paper: STYLE_GUIDE.COLORS.white,
    },
    divider: STYLE_GUIDE.COLORS.divider,
  }
};

export const theme = createTheme({
  palette: {
    primary: commonValues.colors.primary,
    background: commonValues.colors.background,
    divider: commonValues.colors.divider,
    border: {
      main: STYLE_GUIDE.COLORS.borderGray,
      hover: STYLE_GUIDE.COLORS.materialPurpleDark,
    },
    input: {
      text: STYLE_GUIDE.COLORS.textDarkGray,
      border: STYLE_GUIDE.COLORS.borderGray,
      focusBorder: STYLE_GUIDE.COLORS.primary,
    },
    dropdown: {
      background: STYLE_GUIDE.COLORS.white,
      optionBackground: STYLE_GUIDE.COLORS.backgroundHover,
      optionText: STYLE_GUIDE.COLORS.textDarkGray,
      optionHoverBackground: STYLE_GUIDE.COLORS.backgroundLightGray,
      border: STYLE_GUIDE.SPACING.s1,
      selectedText: STYLE_GUIDE.COLORS.textDarkGray,
      labelColor: STYLE_GUIDE.COLORS.textDarkGray,
      focusedBorder: STYLE_GUIDE.COLORS.primary,
      focusedLabel: STYLE_GUIDE.COLORS.primary
    },
    table: {
      headerBackground: STYLE_GUIDE.COLORS.white,
      headerText: STYLE_GUIDE.COLORS.tableHeaderText,
      rowOddBackground: STYLE_GUIDE.COLORS.white,
      rowEvenBackground: STYLE_GUIDE.COLORS.white,
      rowHoverBackground: STYLE_GUIDE.COLORS.backgroundHover,
      rowText: STYLE_GUIDE.COLORS.tableBodyText,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: commonValues.boxShadow,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: commonValues.boxShadow,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          border: `1px solid ${STYLE_GUIDE.COLORS.tableBorder}`,
          backgroundColor: STYLE_GUIDE.COLORS.white,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: STYLE_GUIDE.COLORS.white,
          '& .MuiTableCell-root': {
            backgroundColor: STYLE_GUIDE.COLORS.white,
            color: STYLE_GUIDE.COLORS.textSecondary,
            fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.regular,
            borderBottom: `1px solid ${STYLE_GUIDE.COLORS.tableBorder}`,
            padding: '11px 16px',
            fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: STYLE_GUIDE.COLORS.tableBodyText,
          borderBottom: `1px solid ${STYLE_GUIDE.COLORS.tableBorder}`,
          padding: '14px 16px',
          fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          backgroundColor: STYLE_GUIDE.COLORS.white,
          '&:nth-of-type(odd), &:nth-of-type(even)': {
            backgroundColor: STYLE_GUIDE.COLORS.white,
          },
          '&:hover': {
            backgroundColor: STYLE_GUIDE.COLORS.backgroundHover,
          },
          '&.Mui-selected': {
            backgroundColor: `${commonValues.colors.primary.light}15`,
            '&:hover': {
              backgroundColor: `${commonValues.colors.primary.light}25`,
            },
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: STYLE_GUIDE.COLORS.backgroundHover,
          },
          '&.Mui-selected': {
            backgroundColor: STYLE_GUIDE.COLORS.backgroundHover,
            color: commonValues.colors.primary.main,
            '&:hover': {
              backgroundColor: STYLE_GUIDE.COLORS.backgroundHover,
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: STYLE_GUIDE.COLORS.white,
            '& fieldset': {
              borderColor: STYLE_GUIDE.COLORS.borderGray,
            },
            '&:hover fieldset': {
              borderColor: STYLE_GUIDE.COLORS.primary,
            },
            '&.Mui-focused fieldset': {
              borderColor: STYLE_GUIDE.COLORS.primary,
            },
          },
          '& .MuiInputLabel-root': {
            color: STYLE_GUIDE.COLORS.textDarkGray,
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: STYLE_GUIDE.COLORS.primary,
          },
          '& .MuiSelect-select': {
            color: STYLE_GUIDE.COLORS.textDarkGray,
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: STYLE_GUIDE.COLORS.backgroundLightGray,
          },
          '&.Mui-selected': {
            backgroundColor: STYLE_GUIDE.COLORS.backgroundHover,
            '&:hover': {
              backgroundColor: STYLE_GUIDE.COLORS.backgroundLightGray,
            },
          },
        },
      },
    },
    // DataGrid: apply table design so DataGrid tables (e.g. Notifications) are styled even when dashboardTheme is null
    MuiDataGrid: {
      styleOverrides: {
        root: {
          fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
          fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
          border: `1px solid ${STYLE_GUIDE.COLORS.tableBorder}`,
          borderRadius: '10px',
          overflow: 'hidden',
          backgroundColor: STYLE_GUIDE.COLORS.white,
          // Sticky Actions column (right) – narrow, opaque so content doesn’t show through
          '& .MuiDataGrid-cell[data-field="actions"]': {
            position: 'sticky',
            right: 0,
            backgroundColor: '#ffffff !important',
            zIndex: 3,
            minWidth: 100,
            width: 'unset',
            maxWidth: 'unset',
            borderLeft: 'none',
            borderRight: 'none',
          },
          '& .MuiDataGrid-row:hover .MuiDataGrid-cell[data-field="actions"]': {
            backgroundColor: `${STYLE_GUIDE.COLORS.backgroundHover} !important`,
          },
          '& .MuiDataGrid-columnHeaders [data-field="actions"]': {
            position: 'sticky',
            right: 0,
            backgroundColor: '#ffffff !important',
            zIndex: 4,
            minWidth: 100,
            width: 'unset',
            maxWidth: 'unset',
            borderLeft: 'none',
            borderRight: 'none',
          },
          // Hide column separator lines over the Actions column (left and right)
          '& .MuiDataGrid-columnHeaders [data-field="actions"] .MuiDataGrid-columnSeparator': {
            display: 'none',
          },
          '& .MuiDataGrid-columnHeader:has(+ .MuiDataGrid-columnHeader[data-field="actions"]) .MuiDataGrid-columnSeparator': {
            display: 'none',
          },
          // Action column icons/buttons use theme primary (dynamic when theme changes)
          '& .MuiDataGrid-cell[data-field="actions"] .MuiButton-root:not(.MuiButton-colorError)': {
            color: `${STYLE_GUIDE.COLORS.primary} !important`,
          },
          '& .MuiDataGrid-cell[data-field="actions"] .MuiButton-root:not(.MuiButton-colorError):hover': {
            backgroundColor: `${STYLE_GUIDE.COLORS.primary}14 !important`,
          },
          '& .MuiDataGrid-cell[data-field="actions"] .MuiIconButton-root:not(.MuiIconButton-colorError)': {
            color: `${STYLE_GUIDE.COLORS.primary} !important`,
          },
          '& .MuiDataGrid-cell[data-field="actions"] .MuiIconButton-root:not(.MuiIconButton-colorError):hover': {
            backgroundColor: `${STYLE_GUIDE.COLORS.primary}14 !important`,
          },
        } as React.CSSProperties & Record<string, unknown>,
        columnHeaders: {
          backgroundColor: `${STYLE_GUIDE.COLORS.white} !important`,
          color: `${STYLE_GUIDE.COLORS.tableHeaderText} !important`,
          fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
          fontSize: `${STYLE_GUIDE.TYPOGRAPHY.fontSize.small} !important`,
          borderBottom: `1px solid ${STYLE_GUIDE.COLORS.tableBorder}`,
        },
        columnHeaderTitle: {
          fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
          color: `${STYLE_GUIDE.COLORS.tableHeaderText} !important`,
          fontSize: `${STYLE_GUIDE.TYPOGRAPHY.fontSize.small} !important`,
        },
        cell: {
          color: `${STYLE_GUIDE.COLORS.tableBodyText} !important`,
          borderBottom: `1px solid ${STYLE_GUIDE.COLORS.tableBorder}`,
          borderRight: 'none',
          fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
        },
        row: {
          backgroundColor: `${STYLE_GUIDE.COLORS.white} !important`,
          '&:hover': { backgroundColor: `${STYLE_GUIDE.COLORS.backgroundHover} !important` },
        } as React.CSSProperties & Record<string, unknown>,
        footerContainer: {
          backgroundColor: STYLE_GUIDE.COLORS.white,
          borderTop: `1px solid ${STYLE_GUIDE.COLORS.tableBorder}`,
          color: STYLE_GUIDE.COLORS.tableBodyText,
          fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
        },
        virtualScroller: {
          backgroundColor: STYLE_GUIDE.COLORS.white,
        },
      },
    },
  },
});

// Export common values for use in styled components or sx props
export const themeValues = commonValues; 