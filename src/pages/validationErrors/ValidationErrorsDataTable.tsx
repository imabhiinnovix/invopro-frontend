import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Tooltip,
  Button,
  Chip,
} from "@mui/material";
import SwipeUpIcon from "@mui/icons-material/SwipeUp";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { CustomPagination } from "../../components/common/pagination/customPagination";

const columns: GridColDef[] = [
  {
    field: "rowNumber",
    headerName: "RowNumber",
    width: 150,
    disableColumnMenu: true,
    resizable: true,
  },
  {
    field: "errorCode",
    headerName: "Resource Type",
    width: 150,
    disableColumnMenu: true,
    resizable: true,
  },
  {
    field: "errorMessage",
    headerName: "Error Message",
    width: 100,
    disableColumnMenu: true,
    resizable: true,
  },
  {
    field: "fileAttributeValue",
    headerName: "Attribute Value",
    width: 150,
    disableColumnMenu: true,
    resizable: true,
  },
  {
    field: "status",
    headerName: "Status",
    width: 100,
    disableColumnMenu: true,
    resizable: true,
    renderCell: (params) => (
      <Chip
        label={params.value || "Unknown"}
        size="small"
        color={params.value === "active" ? "success" : "error"}
        variant="outlined"
      />
    ),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 150,
    disableColumnMenu: true,
    sortable: false,
    resizable: false,
    renderCell: (params) => {
      return (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Take Action" arrow>
            <Button
              variant="text"
              onClick={() => params.row.handleEdit(params.row)}
              sx={{ minWidth: "auto" }}
            >
              <SwipeUpIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Discard" arrow>
            <Button
              variant="text"
              onClick={() => params.row.handleDiscard(params.row)}
              sx={{ minWidth: "auto" }}
            >
              <RemoveCircleIcon />
            </Button>
          </Tooltip>
        </Box>
      );
    },
  },
];

interface ValidationErrorsDataTableProps {
  rows: any[];
  paginationModel: { page: number; pageSize: number };
  setPaginationModel: (model: { page: number; pageSize: number }) => void;
  rowCount: number;
}

export const ValidationErrorsDataTable: React.FC<ValidationErrorsDataTableProps> = ({
  rows,
  paginationModel,
  setPaginationModel,
  rowCount,
}) => {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      initialState={{ pagination: { paginationModel } }}
      pageSizeOptions={[5, 10, 20]}
      disableColumnMenu
      paginationMode="server"
      sx={{
        overflow: "visible",
      }}
      rowCount={rowCount}
      paginationModel={paginationModel}
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
  );
};