import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Skeleton from "@mui/material/Skeleton";
import { forwardRef, useImperativeHandle } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
  renderCell?: (row: Record<string, unknown>, index?: number) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
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
}

const CommonTable = forwardRef<HTMLTableElement, CommonTableProps>(
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
    },
    ref
  ) => {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [selectedRows, setSelectedRows] = React.useState<
      Record<string, unknown>[]
    >([]);

    // Expose resetSelection method to parent component
    useImperativeHandle(ref, () => {
      if (!rowSelection) return null;
      return {
        resetSelection: () => {
          setSelectedRows([]);
        },
      };
    });

    const handleChangePage = (event: unknown, newPage: number) => {
      setPage(newPage);
    };

    const handleChangeRowsPerPage = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      setRowsPerPage(+event.target.value);
      setPage(0);
    };

    const handleSelectAllClick = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      if (event.target.checked) {
        setSelectedRows(rows);
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

    if (loading) {
      return (
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: height }}>
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
                      {column.label}
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
    let tableRows = rows;
    if (!isLazyTable) {
      tableRows = rows.slice(
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
        <TableContainer sx={{ maxHeight: height }}>
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
                      checked={
                        rows.length > 0 && selectedRows.length === rows.length
                      }
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
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
                          ? ref
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
                            checked={isSelected}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowSelect(row);
                            }}
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => {
                        const value = row[column.id] || "-";
                        return (
                          <TableCell key={column.id} align={column.align}>
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

        {!isLazyTable && !loading && (
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
                  Total Records: {rows.length}
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
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelDisplayedRows={({ page }) => {
                const totalPages = Math.ceil(rows.length / rowsPerPage);
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
