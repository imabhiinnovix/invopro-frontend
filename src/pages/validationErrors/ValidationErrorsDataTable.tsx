import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Tooltip, Button, Chip, Typography } from "@mui/material";
import SwipeUpIcon from "@mui/icons-material/SwipeUp";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import FileDownloadDoneIcon from "@mui/icons-material/FileDownloadDone";

const CustomFooter = ({
  paginationModel,
  setPaginationModel,
  rowCount,
  validationErrorList,
}) => {
  return (
    <Box
      sx={{ display: "flex", justifyContent: "space-between", padding: "8px" }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="body2">
          {validationErrorList.data?.totalActionCount} of{" "}
          {validationErrorList.data?.totalCount} Resolved
        </Typography>
      </Box>

      <CustomPagination
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        rowCount={rowCount}
      />
    </Box>
  );
};

const columns: GridColDef[] = [
  {
    field: "fileRowNumber",
    headerName: "Row Number",
    width: 140,
    disableColumnMenu: true,
    resizable: true,
  },
  {
    field: "fileName",
    headerName: "File Name",
    width: 200,
    disableColumnMenu: true,
    resizable: true,
  },
  {
    field: "errorMessage",
    headerName: "Error Message",
    width: 300,
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
    renderCell: (params) => {
      let chipColor = "default";
      let chipVariant = "outlined";

      if (params.value === "resolved") {
        chipColor = "success";
      } else if (params.value === "open") {
        chipColor = "primary";
        chipVariant = "outlined"; // This will give us the blue border
      } else {
        chipColor = "error";
      }

      return (
        <Chip
          label={params.value || "Unknown"}
          size="small"
          color={chipColor}
          variant={chipVariant}
        />
      );
    },
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 150,
    disableColumnMenu: true,
    sortable: false,
    resizable: false,
    renderCell: (params) => {
      const isDiscarded = params.row.status === "discarded";

      return (
        <Box sx={{ display: "flex", gap: 1 }}>
          {params.row.errorCode === "1005" ? (
            <Tooltip title="Resolve" arrow>
              <Button
                variant="text"
                onClick={() => params.row.handleResolve(params.row)}
                sx={{ minWidth: "auto" }}
              >
                <FileDownloadDoneIcon />
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="Take Action" arrow>
              <Button
                variant="text"
                onClick={() => params.row.handleEdit(params.row)}
                sx={{ minWidth: "auto" }}
              >
                <SwipeUpIcon />
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Discard" arrow>
            <Button
              variant="text"
              onClick={() => params.row.handleDiscard(params.row)}
              sx={{ minWidth: "auto" }}
              disabled={isDiscarded}
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
  validationErrorList?: any;
}

export const ValidationErrorsDataTable: React.FC<
  ValidationErrorsDataTableProps
> = ({
  rows,
  paginationModel,
  setPaginationModel,
  rowCount,
  validationErrorList,
}) => {
  // Conditionally render the footer only when validationErrorList.data is available
  const renderFooter = () => {
    if (validationErrorList?.data) {
      return (
        <CustomFooter
          paginationModel={paginationModel}
          setPaginationModel={setPaginationModel}
          rowCount={rowCount}
          validationErrorList={validationErrorList}
        />
      );
    }
    return null; // Don't render footer when data is not available
  };

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      initialState={{ pagination: { paginationModel } }}
      disableColumnMenu
      paginationMode="server"
      sx={{
        overflow: "visible",
      }}
      rowCount={rowCount}
      paginationModel={paginationModel}
      checkboxSelection={false}
      isRowSelectable={() => false} // Prevent any row from being selectable
      slots={{
        footer: renderFooter,
      }}
    />
  );
};
