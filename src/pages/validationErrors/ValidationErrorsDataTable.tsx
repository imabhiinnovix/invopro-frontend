import * as React from "react";
import {
  Box,
  Tooltip,
  Button,
  Typography,
  Stack,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import SwipeUpIcon from "@mui/icons-material/SwipeUp";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import FileDownloadDoneIcon from "@mui/icons-material/FileDownloadDone";
import CommonTable, { CommonTableRef } from "../../components/common/table";
import { StyledButton, StatusChip } from "../../components/common";
import { useEffect, useRef, useMemo } from "react";
import { formatDate } from "../../utils/utils";

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
        id: "createdAt",
        label: "Created At",
        minWidth: 200,
        sortable: true,
        renderCell: (row: Record<string, unknown>) => {
          return row.createdAt ? formatDate(row.createdAt as string) : "-";
        },
      },
      {
        id: "updatedAt",
        label: "Updated At",
        minWidth: 200,
        // { id: "createdAt", label: "Created At", minWidth: 170 },
        sortable: true,
        renderCell: (row: Record<string, unknown>) => {
          return row.updatedAt ? formatDate(row.updatedAt as string) : "-";
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

          return (
            <StatusChip
              status={(row.status as string) || "unknown"}
              label={(row.status as string) || "Unknown"}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResolve?.(row);
                    }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit?.(row);
                    }}
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
    [loading, isLatest],
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
          <StyledButton
            variant="primary"
            onClick={() => handleDiscardSelectedRows?.(selectedRows)}
            disabled={isLatest === false}
          >
            Discard {selectedRows.length} items
          </StyledButton>
        </Stack>
      )}
    />
  );
};
