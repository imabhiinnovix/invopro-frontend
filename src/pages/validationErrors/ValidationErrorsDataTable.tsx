import * as React from "react";
import {
  Box,
  Tooltip,
  Button,
  Chip,
  Typography,
  Stack,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import SwipeUpIcon from "@mui/icons-material/SwipeUp";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import FileDownloadDoneIcon from "@mui/icons-material/FileDownloadDone";
import CommonTable, { CommonTableRef } from "../../components/common/table";
import PrimaryButton from "../../components/common/PrimaryButton";
import { useEffect, useRef, useMemo } from "react";

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
  const tableRef = useRef<CommonTableRef>(null);
  const loading =
    validationErrorList?.isLoading || validationErrorList?.isFetching || false;

  const displayRows = useMemo(() => {
    if (rows.length > 0) {
      return rows;
    }
    if (loading) {
      return Array.from({ length: paginationModel.pageSize }, (_, i) => ({
        _id: `loading-placeholder-${i}`,
        fileRowNumber: "",
        fileName: "",
        errorMessage: "",
        fileAttributeValue: "",
        status: "",
      }));
    }
    return [];
  }, [rows, loading, paginationModel.pageSize]);

  const columns = useMemo(
    () => [
      {
        id: "fileRowNumber",
        label: "Row Number",
        minWidth: 140,
        sortable: true,
        renderCell: (row: Record<string, unknown>) => {
          if (
            loading &&
            (row.fileRowNumber == null || row.fileRowNumber === "")
          ) {
            return (
              <Box sx={{ width: "100%", py: 1 }}>
                <Skeleton variant="text" width="80%" height={20} />
              </Box>
            );
          }
          return row.fileRowNumber || "-";
        },
      },
      {
        id: "fileName",
        label: "File Name",
        minWidth: 200,
        sortable: true,
        renderCell: (row: Record<string, unknown>) => {
          if (loading && (row.fileName == null || row.fileName === "")) {
            return (
              <Box sx={{ width: "100%", py: 1 }}>
                <Skeleton variant="text" width="80%" height={20} />
              </Box>
            );
          }
          return row.fileName || "-";
        },
      },
      {
        id: "errorMessage",
        label: "Error Message",
        minWidth: 300,
        sortable: true,
        renderCell: (row: Record<string, unknown>) => {
          if (
            loading &&
            (row.errorMessage == null || row.errorMessage === "")
          ) {
            return (
              <Box sx={{ width: "100%", py: 1 }}>
                <Skeleton variant="text" width="80%" height={20} />
                <Skeleton variant="text" width="60%" height={20} />
              </Box>
            );
          }
          return row.errorMessage || "-";
        },
      },
      {
        id: "fileAttributeValue",
        label: "Attribute Value",
        minWidth: 150,
        sortable: true,
        renderCell: (row: Record<string, unknown>) => {
          if (
            loading &&
            (row.fileAttributeValue == null || row.fileAttributeValue === "")
          ) {
            return (
              <Box sx={{ width: "100%", py: 1 }}>
                <Skeleton variant="text" width="80%" height={20} />
              </Box>
            );
          }
          return row.fileAttributeValue || "-";
        },
      },
      {
        id: "status",
        label: "Status",
        minWidth: 100,
        sortable: true,
        renderCell: (row: Record<string, unknown>) => {
          if (loading && (row.status == null || row.status === "")) {
            return (
              <Box sx={{ width: "100%", py: 1 }}>
                <Skeleton
                  variant="rectangular"
                  width={80}
                  height={24}
                  sx={{ borderRadius: 1 }}
                />
              </Box>
            );
          }

          let chipColor: "default" | "success" | "primary" | "error" =
            "default";
          let chipVariant: "outlined" | "filled" = "outlined";

          if (row.status === "resolved") {
            chipColor = "success";
          } else if (row.status === "open") {
            chipColor = "primary";
            chipVariant = "outlined"; // This will give us the blue border
          } else {
            chipColor = "error";
          }

          return (
            <Chip
              label={(row.status as string) || "Unknown"}
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
        minWidth: 150,
        sortable: false,
        renderCell: (row: Record<string, unknown>) => {
          if (row._id?.toString().startsWith("loading-placeholder-")) {
            return (
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  py: 1,
                }}
              >
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton variant="circular" width={32} height={32} />
              </Box>
            );
          }

          const isDiscarded = row.status === "discarded";
          const isResolved = row.status === "resolved";
          const handleResolve = row.handleResolve as
            | ((row: Record<string, unknown>) => void)
            | undefined;
          const handleEdit = row.handleEdit as
            | ((row: Record<string, unknown>) => void)
            | undefined;
          const handleDiscard = row.handleDiscard as
            | ((row: Record<string, unknown>) => void)
            | undefined;

          return (
            <Box sx={{ display: "flex", gap: 1 }}>
              {row.errorCode === "1005" ? (
                <Tooltip title="Resolve" arrow>
                  <Button
                    variant="text"
                    onClick={() => handleResolve?.(row)}
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
                    onClick={() => handleEdit?.(row)}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDiscard?.(row);
                  }}
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
    ],
    [loading, isLatest]
  );

  useEffect(() => {
    if (resetSelections) {
      tableRef.current?.resetSelection();
      setResetSelections(false);
    }
  }, [resetSelections, setResetSelections]);

  if (loading && columns.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 400px)",
          width: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <CommonTable
      ref={tableRef}
      columns={columns}
      rows={displayRows}
      loading={false}
      height="calc(100vh - 400px)"
      totalCount={rowCount}
      page={paginationModel.page}
      rowsPerPage={paginationModel.pageSize}
      onPageChange={(page) => setPaginationModel({ ...paginationModel, page })}
      onRowsPerPageChange={(pageSize) =>
        setPaginationModel({ page: 0, pageSize })
      }
      customFooterLeftComponent={
        <>
          <Typography variant="body2">
            {validationErrorList.data?.totalActionCount} of{" "}
            {validationErrorList.data?.totalCount} Resolved
          </Typography>
        </>
      }
      rowSelection={isLatest === false ? false : true}
      rowSelectionCondition={(row) => (row.status === "open" ? true : false)}
      bulkAction={(selectedRows) => (
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <PrimaryButton
            onClick={() => handleDiscardSelectedRows?.(selectedRows)}
            disabled={isLatest === false}
          >
            Discard {selectedRows.length} items
          </PrimaryButton>
        </Stack>
      )}
    />
  );
};
