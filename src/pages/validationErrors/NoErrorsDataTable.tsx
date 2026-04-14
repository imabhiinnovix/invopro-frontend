import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Typography,
  Tooltip,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import dayjs from "dayjs";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import { PageCardLayout } from "../../components/common";

interface Props {
  rows: any[];
  loading: boolean;
  rowCount: number;
  paginationModel: any;
  setPaginationModel: any;
  handleEditRow: (row: any) => void;
}

const renderCellValue = (value: any) => {
  if (value == null) return "";

  if (Array.isArray(value)) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {value.map((item: any, index: number) => (
          <Typography key={index} variant="body2">
            {String(item)}
          </Typography>
        ))}
      </Box>
    );
  }

  return String(value);
};

const getTooltipText = (value: any) => {
  if (Array.isArray(value)) return value.join("\n");
  return String(value);
};

export const NoErrorsDataTable: React.FC<Props> = ({
  rows,
  loading,
  rowCount,
  paginationModel,
  setPaginationModel,
  handleEditRow,
}) => {
  // ✅ Flatten rowData
  const formattedRows = React.useMemo(() => {
    return rows.map((row) => ({
      ...row,
      ...row.rowData,
    }));
  }, [rows]);

  // ✅ Dynamic Columns
  const dynamicColumns: GridColDef[] = React.useMemo(() => {
    if (!rows.length) return [];

    const sample = rows[0]?.rowData || {};

    const cols: GridColDef[] = [
      // ✅ NEW: Row Number Column (FIRST)
      {
        field: "rowNumber",
        headerName: "Row Number",
        minWidth: 120,
        sortable: false,
        // renderCell: (params: any) => {
        //   const index =
        //     paginationModel.page * paginationModel.pageSize +
        //     params.api.getRowIndexRelativeToVisibleRows(params.id) +
        //     1;

        //   return <Box>{index}</Box>;
        // },
          renderCell: (params: any) => {
          return <Box>{params.row.rowNumber}</Box>; // ✅ use backend value
        },
      },

      // ✅ Existing dynamic columns
      ...Object.keys(sample)
        .filter((key) => key !== "rowNumber" && !key.includes(".") && !key.startsWith("Converted|") && !key.startsWith("Validated|"))
        .map((key) => ({
          field: key,
          headerName: key,
          minWidth: 180,
          renderCell: (params: any) => {
            const value = params.value;

            if (loading && (value == null || value === "")) {
              return <Skeleton width="80%" />;
            }

            if (typeof value === "number") {
              return value.toFixed(2);
            }

            if (/\bdate\b/i.test(key) && value) {
              try {
                return dayjs(value).format("DD-MMM-YYYY");
              } catch {
                return renderCellValue(value);
              }
            }

            const content = renderCellValue(value);
            const tooltip = getTooltipText(value);

            const showTooltip =
              Array.isArray(value) ||
              (typeof value === "string" && value.length > 30);

            return showTooltip ? (
              <Tooltip title={tooltip}>
                <Box>{content}</Box>
              </Tooltip>
            ) : (
              <Box>{content}</Box>
            );
          },
        })),
    ];

    return cols;
  }, [rows, loading, paginationModel]);

  // ✅ Loading Rows
  const displayRows = React.useMemo(() => {
    if (loading) {
      return Array.from({ length: paginationModel.pageSize }, (_, i) => ({
        _id: `loading-${i}`,
      }));
    }
    return formattedRows;
  }, [formattedRows, loading, paginationModel.pageSize]);

  return (
    <PageCardLayout>
      {dynamicColumns.length > 0 ? (
        <DataGrid
          rows={displayRows}
          columns={dynamicColumns}
          getRowId={(row) => row._id}
          paginationMode="server"
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          disableColumnMenu
          getRowHeight={() => "auto"}
          sx={{ height: "calc(100vh - 280px)", cursor: "pointer" }}

          // ✅ NEW: Row click = Take Action
          onRowClick={(params) => handleEditRow(params.row)}

          slots={{
            pagination: () => (
              <CustomPagination
                paginationModel={paginationModel}
                setPaginationModel={setPaginationModel}
                rowCount={rowCount}
              />
            ),
          }}
        />
      ) : loading ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Typography align="center">No Data Available</Typography>
      )}
    </PageCardLayout>
  );
};