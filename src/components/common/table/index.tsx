import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Skeleton from "@mui/material/Skeleton";
import { forwardRef, useImperativeHandle } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import { useTheme } from "@mui/material/styles";
import { STYLE_GUIDE } from "../../../styles";

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
  renderCell?: (row: Record<string, unknown>, index?: number) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
  sortable?: boolean;
}

export interface CommonTableRef {
  resetSelection: () => void;
}

interface CommonTableProps {
  columns: Column[];
  rows: Record<string, unknown>[];
  loading: boolean;
  height?: string | number;
  collpasible?: (
    row: Record<string, unknown>,
    index?: number
  ) => React.ReactNode;
  isLazyTable?: boolean;
  isLazyLoading?: boolean;
  onRowClick?: (row: Record<string, unknown>) => void;
  customFooterLeftComponent?: React.ReactNode;
  customFooterRightComponent?: React.ReactNode;
  rowSelection?: boolean;
  bulkAction?: (selectedRows: Record<string, unknown>[]) => React.ReactNode;
  lastElementRef?: (node: HTMLTableRowElement | null) => void;
  rowSelectionCondition?: (row: Record<string, unknown>) => boolean;
  totalCount?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
}

const CommonTable = forwardRef<CommonTableRef, CommonTableProps>(
  (
    {
      columns,
      rows,
      loading,
      height = "440px",
      collpasible,
      isLazyTable,
      isLazyLoading,
      onRowClick,
      customFooterLeftComponent,
      rowSelection = false,
      bulkAction,
      lastElementRef,
      rowSelectionCondition,
      totalCount,
      page: controlledPage,
      rowsPerPage: controlledRowsPerPage,
      onPageChange,
      onRowsPerPageChange,
    },
    ref
  ) => {
    const theme = useTheme();
    const isServerSidePagination = totalCount !== undefined;
    const [pageState, setPageState] = React.useState(0);
    const [rowsPerPageState, setRowsPerPageState] = React.useState(10);

    const page = isServerSidePagination ? controlledPage ?? 0 : pageState;
    const rowsPerPage = isServerSidePagination
      ? controlledRowsPerPage ?? 10
      : rowsPerPageState;

    const [selectedRows, setSelectedRows] = React.useState<
      Record<string, unknown>[]
    >([]);
    const [sortBy, setSortBy] = React.useState<string | null>(null);
    const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
      "asc"
    );

    // Expose resetSelection method to parent component
    useImperativeHandle(ref, () => {
      return {
        resetSelection: () => {
          setSelectedRows([]);
        },
      };
    });

    const handleChangePage = (_event: unknown, newPage: number) => {
      if (isServerSidePagination) {
        onPageChange?.(newPage);
      } else {
        setPageState(newPage);
      }
    };

    const handleChangeRowsPerPage = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const newRowsPerPage = +event.target.value;
      if (isServerSidePagination) {
        onRowsPerPageChange?.(newRowsPerPage);
      } else {
        setRowsPerPageState(newRowsPerPage);
        setPageState(0);
      }
    };

    const handleSelectAllClick = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      if (event.target.checked) {
        let filteredRows = rows;
        if (rowSelectionCondition) {
          filteredRows = rows.filter(rowSelectionCondition);
        }
        setSelectedRows(filteredRows);
      } else {
        setSelectedRows([]);
      }
    };

    const handleRowSelect = (row: Record<string, unknown>) => {
      const selectedIndex = selectedRows.findIndex(
        (selectedRow) =>
          (selectedRow._id && selectedRow._id === row._id) ||
          (selectedRow.code && selectedRow.code === row.code) ||
          selectedRow === row
      );
      let newSelected: Record<string, unknown>[] = [];

      if (selectedIndex === -1) {
        newSelected = [...selectedRows, row];
      } else {
        newSelected = selectedRows.filter(
          (_, index) => index !== selectedIndex
        );
      }

      setSelectedRows(newSelected);
    };

    const isRowSelected = (row: Record<string, unknown>) => {
      return selectedRows.some(
        (selectedRow) =>
          (selectedRow._id && selectedRow._id === row._id) ||
          (selectedRow.code && selectedRow.code === row.code) ||
          selectedRow === row
      );
    };

    const handleSort = (columnId: string) => {
      const column = columns.find((col) => col.id === columnId);
      if (!column || !column.sortable) return;

      if (sortBy === columnId) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortBy(columnId);
        setSortDirection("asc");
      }
      // setPage(0);
    };

    const sortRows = (rowsToSort: Record<string, unknown>[]) => {
      if (!sortBy) return rowsToSort;

      return [...rowsToSort].sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        let comparison = 0;
        if (typeof aValue === "string" && typeof bValue === "string") {
          comparison = aValue.localeCompare(bValue, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        } else if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue;
        } else {
          comparison = String(aValue).localeCompare(String(bValue), undefined, {
            numeric: true,
            sensitivity: "base",
          });
        }

        return sortDirection === "asc" ? comparison : -comparison;
      });
    };

    if (loading) {
      return (
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: height, overflow: "auto" }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  {rowSelection && (
                    <TableCell padding="checkbox">
                      <Checkbox disabled />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{ minWidth: column.minWidth }}
                    >
                      {column.sortable ? (
                        <TableSortLabel disabled>{column.label}</TableSortLabel>
                      ) : (
                        column.label
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <TableRow key={index}>
                      <TableCell
                        colSpan={columns.length + (rowSelection ? 1 : 0)}
                      >
                        <Skeleton sx={{ width: "100%" }} height={40} />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      );
    }
    const sortedRows = sortRows(rows);

    let tableRows = sortedRows;
    if (!isLazyTable && !isServerSidePagination) {
      tableRows = sortedRows.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      );
    }

    return (
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        {rowSelection && bulkAction && selectedRows.length > 0 && (
          <Box sx={{ p: 2, backgroundColor: "action.selected" }}>
            {bulkAction(selectedRows)}
          </Box>
        )}
        <TableContainer sx={{ maxHeight: height, overflow: "auto" }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {rowSelection && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        selectedRows.length > 0 &&
                        selectedRows.length < rows.length
                      }
                      // checked={
                      //   rows.length > 0 && selectedRows.length === rows.length
                      // }
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                )}
                {columns.map((column) => {
                  const isActionsColumn = column.id === "actions";
                  return (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{ minWidth: column.minWidth }}
                      sortDirection={sortBy === column.id ? sortDirection : false}
                      sx={
                        isActionsColumn
                          ? {
                              position: "sticky",
                              right: 0,
                              backgroundColor:
                                theme.palette.table?.headerBackground ||
                                STYLE_GUIDE.COLORS.white,
                              zIndex: 2,
                              minWidth: 100,
                              width: "unset",
                              maxWidth: "unset",
                            }
                          : undefined
                      }
                    >
                      {column.sortable ? (
                        <TableSortLabel
                          active={sortBy === column.id}
                          direction={
                            sortBy === column.id ? sortDirection : "asc"
                          }
                          onClick={() => handleSort(column.id)}
                          sx={{
                            "& .MuiTableSortLabel-icon": {
                              opacity: sortBy === column.id ? 1 : 0.3,
                            },
                          }}
                        >
                          {column.label}
                        </TableSortLabel>
                      ) : (
                        column.label
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableRows.map((row, index) => {
                const isSelected = isRowSelected(row);
                const rowKey = String(row.code || row._id || index);
                return (
                  <>
                    <TableRow
                      hover
                      onClick={() => {
                        if (
                          rowSelectionCondition &&
                          !rowSelectionCondition(row)
                        ) {
                          return;
                        }
                        if (rowSelection) {
                          handleRowSelect(row);
                        } else {
                          onRowClick?.(row);
                        }
                      }}
                      role="checkbox"
                      tabIndex={-1}
                      key={rowKey}
                      ref={
                        isLazyTable && tableRows.length === index + 1
                          ? lastElementRef
                          : null
                      }
                      selected={isSelected}
                      sx={{
                        cursor:
                          rowSelection || onRowClick ? "pointer" : "default",
                      }}
                    >
                      {rowSelection && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            disabled={
                              rowSelectionCondition &&
                              !rowSelectionCondition(row)
                            }
                            checked={isSelected}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                rowSelectionCondition &&
                                !rowSelectionCondition(row)
                              ) {
                                return;
                              }
                              handleRowSelect(row);
                            }}
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => {
                        const value = row[column.id] || "-";
                        const isActionsColumn = column.id === "actions";
                        return (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            sx={
                              isActionsColumn
                                ? {
                                    position: "sticky",
                                    right: 0,
                                    backgroundColor:
                                      theme.palette.background?.paper ||
                                      STYLE_GUIDE.COLORS.white,
                                    zIndex: 1,
                                    minWidth: 100,
                                    width: "unset",
                                    maxWidth: "unset",
                                    "&:hover": {
                                      backgroundColor:
                                        theme.palette.table?.rowHoverBackground ||
                                        STYLE_GUIDE.COLORS.backgroundHover,
                                    },
                                  }
                                : undefined
                            }
                          >
                            {column.renderCell
                              ? column.renderCell(row, index)
                              : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    {collpasible ? collpasible(row, index) : null}
                  </>
                );
              })}
              {isLazyLoading && (
                <TableRow>
                  <TableCell colSpan={columns.length + (rowSelection ? 1 : 0)}>
                    <Skeleton height={40} />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {(!isLazyTable || isServerSidePagination) && !loading && (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            px={1}
          >
            {customFooterLeftComponent ? (
              customFooterLeftComponent
            ) : (
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2">
                  Total Records:{" "}
                  {isServerSidePagination ? totalCount : sortedRows.length}
                </Typography>
                {rowSelection && selectedRows.length > 0 && (
                  <Typography variant="body2" color="primary">
                    {selectedRows.length} selected
                  </Typography>
                )}
              </Stack>
            )}
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={isServerSidePagination ? totalCount : sortedRows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelDisplayedRows={({ page }) => {
                const totalItems = isServerSidePagination
                  ? totalCount
                  : sortedRows.length;
                const totalPages = Math.ceil(totalItems / rowsPerPage);
                return `Page ${page + 1} of ${totalPages}`;
              }}
            />
          </Stack>
        )}
      </Paper>
    );
  }
);

export default CommonTable;
