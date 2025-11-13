import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Tooltip, Button, Chip, Typography, Stack } from "@mui/material";
import SwipeUpIcon from "@mui/icons-material/SwipeUp";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import FileDownloadDoneIcon from "@mui/icons-material/FileDownloadDone";
import CommonTable from "../../components/common/table";
import PrimaryButton from "../../components/common/PrimaryButton";
import { useEffect, useRef } from "react";

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

interface ValidationErrorsDataTableProps {
  rows: any[];
  paginationModel: { page: number; pageSize: number };
  setPaginationModel: (model: { page: number; pageSize: number }) => void;
  rowCount: number;
  validationErrorList?: any;
  handleDiscardSelectedRows?: (selectedRows: any[]) => void;
  resetSelections: boolean;
  setResetSelections: (reset: boolean) => void;
  isLatest?: boolean;
}

export const ValidationErrorsDataTable: React.FC<
  ValidationErrorsDataTableProps
> = ({
  rows,
  paginationModel,
  setPaginationModel,
  rowCount,
  validationErrorList,
  handleDiscardSelectedRows,
  resetSelections,
  setResetSelections,
  isLatest,
}) => {
  const tableRef = useRef(null);

  const columns: GridColDef[] = [
    {
      id: "fileRowNumber",
      label: "Row Number",
      width: 140,
      disableColumnMenu: true,
      resizable: true,
    },
    {
      id: "fileName",
      label: "File Name",
      width: 200,
      disableColumnMenu: true,
      resizable: true,
    },
    {
      id: "errorMessage",
      label: "Error Message",
      width: 300,
      disableColumnMenu: true,
      resizable: true,
    },
    {
      id: "fileAttributeValue",
      label: "Attribute Value",
      width: 150,
      disableColumnMenu: true,
      resizable: true,
    },
    {
      id: "status",
      label: "Status",
      width: 100,
      disableColumnMenu: true,
      resizable: true,
      renderCell: (row: Record<string, unknown>) => {
        let chipColor = "default";
        let chipVariant = "outlined";

        if (row.status === "resolved") {
          chipColor = "success";
        } else if (row.status === "open") {
          chipColor = "primary";
          chipVariant = "outlined"; // This will give us the blue border
        } else {
          chipColor = "error";
        }
        // console.log("row", row);

        return (
          <Chip
            label={row.status || "Unknown"}
            size="small"
            color={chipColor}
            variant={chipVariant}
          />
        );
      },
    },
    {
      id: "actions",
      label: "Actions",
      width: 150,
      disableColumnMenu: true,
      sortable: false,
      resizable: false,
      renderCell: (row: Record<string, unknown>) => {
        const isDiscarded = row.status === "discarded";
        const isResolved = row.status === "resolved";

        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            {row.errorCode === "1005" ? (
              <Tooltip title="Resolve" arrow>
                <Button
                  variant="text"
                  onClick={() => row.handleResolve(row)}
                  sx={{ minWidth: "auto" }}
                  disabled={isLatest === false}
                >
                  <FileDownloadDoneIcon />
                </Button>
              </Tooltip>
            ) : (
              <Tooltip title="Take Action" arrow>
                <Button
                  variant="text"
                  onClick={() => row.handleEdit(row)}
                  sx={{ minWidth: "auto" }}
                  disabled={isResolved || isLatest === false}
                >
                  <SwipeUpIcon />
                </Button>
              </Tooltip>
            )}
            <Tooltip title="Discard" arrow>
              <Button
                variant="text"
                onClick={() => row.handleDiscard(row)}
                sx={{ minWidth: "auto" }}
                disabled={isDiscarded || isResolved || isLatest === false}
              >
                <RemoveCircleIcon />
              </Button>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

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
    return null;
  };

  useEffect(() => {
    if (resetSelections) {
      tableRef.current?.resetSelection();
      setResetSelections(false);
    }
  }, [resetSelections]);

  return (
    <CommonTable
      ref={tableRef}
      columns={columns}
      rows={rows || []}
      loading={false}
      height="calc(100vh - 400px)"
      customFooterLeftComponent={
        <>
          <Typography variant="body2">
            {validationErrorList.data?.totalActionCount} of{" "}
            {validationErrorList.data?.totalCount} Resolved
          </Typography>
        </>
      }
      rowSelection={true}
      bulkAction={(selectedRows) => (
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <PrimaryButton
            onClick={() => handleDiscardSelectedRows?.(selectedRows)}
          >
            Discard {selectedRows.length} items
          </PrimaryButton>
        </Stack>
      )}
    />
  );

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
      isRowSelectable={() => false}
      slots={{
        footer: renderFooter,
      }}
    />
  );
};
