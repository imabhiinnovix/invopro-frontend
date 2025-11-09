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
import { forwardRef } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

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
    },
    ref
  ) => {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (event: unknown, newPage: number) => {
      setPage(newPage);
    };

    const handleChangeRowsPerPage = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      setRowsPerPage(+event.target.value);
      setPage(0);
    };

    if (loading) {
      return (
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: height }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
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
                      <TableCell colSpan={columns.length}>
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
        <TableContainer sx={{ maxHeight: height }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
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
                return (
                  <>
                    <TableRow
                      hover
                      onClick={() => onRowClick?.(row)}
                      role="checkbox"
                      tabIndex={-1}
                      key={row.code || row._id || index}
                      ref={
                        isLazyTable && tableRows.length === index + 1
                          ? ref
                          : null
                      }
                      sx={{
                        cursor: onRowClick ? "pointer" : "default",
                      }}
                    >
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
                  <TableCell colSpan={columns.length}>
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
              <Typography variant="body2">
                Total Records: {rows.length}
              </Typography>
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
