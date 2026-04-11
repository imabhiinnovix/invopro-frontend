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
  validationErrorList: any;
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

export const ErrorsDataTable: React.FC<Props> = ({
  rows,
  loading,
  rowCount,
  paginationModel,
  setPaginationModel,
  validationErrorList,
  handleEditRow,
}) => {

  const errorMap = React.useMemo(() => {
  const map: Record<string, Record<string, any>> = {};

  const errors = validationErrorList?.data?.data || [];

  errors.forEach((err: any) => {
    const rowNum = err.rowNumber;
    const attrName = err.attributeName?.trim();

    if (!map[rowNum]) {
      map[rowNum] = {};
    }

    map[rowNum][attrName] = err;
  });

  return map;
}, [validationErrorList?.data]);

  // ✅ Flatten rowData
  const formattedRows = React.useMemo(() => {
  return rows.map((row) => ({
    ...row,
    ...row.rowData,
    __errors: errorMap[row.rowNumber] || {}, // ✅ attach errors
  }));
}, [rows, errorMap]);

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
        renderCell: (params: any) => {
          const index =
            paginationModel.page * paginationModel.pageSize +
            params.api.getRowIndexRelativeToVisibleRows(params.id) +
            1;

          return <Box>{index}</Box>;
        },
      },

      // ✅ Existing dynamic columns
      ...Object.keys(sample)
        .filter((key) => !key.includes(".") && !key.startsWith("Converted|") && !key.startsWith("Validated|"))
        .map((key) => ({
          field: key,
          headerName: key,
          minWidth: 180,
          renderCell: (params: any) => {
            const value = params.value;
            const field = params.field;
            const rowErrors = params.row.__errors || {};
            const error = rowErrors[field];

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

            // ✅ Map source → short code
            const sourceMap: Record<string, string> = {
              master: "M",
              portfolio: "P",
              validation: "V",
            };

             const getErrorColor = (type: string) => {
  switch (type) {
    case "M":
      return "#d32f2f"; // strong red
    case "P":
      return "#ff9800"; // orange
    case "V":
      return "#ffcdd2"; // light red (variant)
    default:
      return "#9e9e9e";
  }
};

const getTextColor = (type: string) => {
  return type === "V" ? "#b71c1c" : "#fff"; // darker text for light bg
}; 
const type = sourceMap[error?.errorSource];
const bgColor = type ? getErrorColor(type) : undefined;
const textColor = type ? getTextColor(type) : undefined;

// ✅ Build suffix
let suffix = "";
if (error && value !== undefined && value !== null && value !== "") {
  const mapped = sourceMap[error.errorSource];
  if (mapped) suffix = mapped;
}

// ✅ Content
const content = (
  <Box>
    <Typography component="span">
      {renderCellValue(value)}
    </Typography>

    {suffix && (
      <Typography
        component="span"
        sx={{
          ml: 0.5,
          px: 0.6,
          borderRadius: "6px",
          fontSize: "11px",
          fontWeight: 600,
          backgroundColor: bgColor,
          color: textColor,
        }}
      >
        {suffix}
      </Typography>
    )}
  </Box>
);

            // ✅ Tooltip (error message if exists)
            const tooltip = error?.errorMessage || getTooltipText(value);

            const showTooltip =
              Array.isArray(value) ||
              (typeof value === "string" && value.length > 30) ||
              !!error;

            return showTooltip ? (
              <Tooltip title={tooltip}>
                {content}
              </Tooltip>
            ) : (
              content
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
       <>
          <Typography variant="body2">
            {validationErrorList.data?.totalResolvedRecords} of{" "}
            {validationErrorList.data?.totalErrorRecords} Resolved
          </Typography>
        </>
    </PageCardLayout>
  );
};