import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Typography,
  Tooltip,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import { STYLE_GUIDE } from "../../styles";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import ImportFile from "../../components/common/importFile/ImportFile";
import dayjs from "dayjs";
import SearchField from "../../components/common/SearchField";
import { PageCardLayout, StyledButton } from "../../components/common";
import IosShareIcon from "@mui/icons-material/IosShare";


interface TableSectionProps {
  rows: any[];
  columns: GridColDef[];
  loading: boolean;
  rowCount: number;
  paginationModel: { page: number; pageSize: number };
  setPaginationModel: React.Dispatch<
    React.SetStateAction<{ page: number; pageSize: number }>
  >;
  searchValue: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleView: (id: string) => void;
  handleEdit: (id: string) => void;
  handleDelete: (id: string) => void;
  handleAddNotification: () => void;
  handleOpenFiltersModal: () => void;
  listCurrentData: any;
  dataSourceId: string;
  shouldAllowAdd: boolean;
  shouldAllowImport: boolean;
  handleExport: () => void;
}

const renderCellValue = (value: any) => {
  if (value == null) return "";

  if (Array.isArray(value)) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, py: 1 }}>
        {value.map((item, index) => (
          <Typography
            key={index}
            variant="body2"
            sx={{
              fontSize: "0.875rem",
              lineHeight: 1.2,
              wordBreak: "break-word",
            }}
          >
            {String(item)}
          </Typography>
        ))}
      </Box>
    );
  }

  return String(value);
};

const getTooltipText = (value: any) => {
  if (Array.isArray(value)) {
    return value.join("\n");
  }
  return String(value);
};

export const NotivixDataTable: React.FC<TableSectionProps> = ({
  rows,
  columns,
  loading,
  rowCount,
  paginationModel,
  setPaginationModel,
  searchValue,
  handleSearchChange,
  handleAddNotification,
  handleOpenFiltersModal,
  dataSourceId,
  shouldAllowAdd,
  shouldAllowImport,
  handleExport,
  defaultCurrency
}) => {
  // Use ref to track previous dataSourceId
  const prevDataSourceIdRef = React.useRef<string>(dataSourceId);

  // Reset search value when dataSourceId changes
  React.useEffect(() => {
    // Only reset if dataSourceId has actually changed
    if (prevDataSourceIdRef.current !== dataSourceId) {
      // Create a synthetic event to trigger handleSearchChange
      const event = {
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>;
      handleSearchChange(event);

      // Update the ref to current dataSourceId
      prevDataSourceIdRef.current = dataSourceId;
    }
  }, [dataSourceId, handleSearchChange]);

  const paginationModelMemo = React.useMemo(
    () => ({
      page: paginationModel.page,
      pageSize: paginationModel.pageSize,
    }),
    [paginationModel.page, paginationModel.pageSize]
  );

  const displayRows = React.useMemo(() => {
    if (loading && columns.length > 0) {
      return Array.from({ length: paginationModel.pageSize }, (_, i) => ({
        _id: `loading-placeholder-${i}`,
      }));
    }
    if (rows.length > 0) {
      return rows;
    }
    return [];
  }, [rows, columns.length, loading, paginationModel.pageSize]);

  const formattedColumns = React.useMemo(() => {
    return columns.map((column) => {
      if (column.field === "actions") {
        return column;
      }
    // Append currency in header if "Converted" present
    const updatedHeaderName =
      column.headerName && column.field && column.field.includes("Converted")
        ? `${column.headerName} ( ${defaultCurrency} )`
        : column.headerName;

      return {
        ...column,
        headerName: updatedHeaderName,
        renderCell: (params: any) => {
          const value = params.value;

          if (loading && (value == null || value === "")) {
            return (
              <Box
                sx={{
                  width: "100%",
                  py: 1,
                }}
              >
                <Skeleton variant="text" width="80%" height={20} />
                <Skeleton variant="text" width="80%" height={20} />
              </Box>
            );
          }
          
          // NUMBER → toFixed(2)
          if (value != null && !isNaN(value)) {
            return Number(value).toFixed(2);
          }

          if (
            /\bdate\b/i.test(column.field) &&
            value &&
            !Array.isArray(value)
          ) {
            try {
              return dayjs(value).format("DD-MMM-YYYY");
            } catch (error) {
              console.error("Error formatting date:", error);
              return renderCellValue(value);
            }
          }

          const cellContent = renderCellValue(value);
          const tooltipText = getTooltipText(value);

          const shouldShowTooltip =
            Array.isArray(value) ||
            (typeof value === "string" && value.length > 30);

          return shouldShowTooltip ? (
            <Tooltip
              title={tooltipText}
              arrow
              placement="top-start"
              sx={{
                maxWidth: "none",
                "& .MuiTooltip-tooltip": {
                  whiteSpace: "pre-line",
                  maxWidth: "400px",
                },
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  overflow: "hidden",
                  cursor: "help",
                }}
              >
                {cellContent}
              </Box>
            </Tooltip>
          ) : (
            <Box sx={{ width: "100%" }}>{cellContent}</Box>
          );
        },
        ...(column.field !== "actions" && {
          minWidth: 150,
        }),
      };
    });
  }, [columns, loading]);

  return (
    <>
      <PageCardLayout>
        <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <SearchField
              searchValue={searchValue}
              handleSearchChange={handleSearchChange}
            />

            <Box sx={{ display: "flex", gap: 1 }}>
              <StyledButton
                variant="secondary"
                icon={<FilterListIcon sx={{ fontSize: "16px" }} />}
                onClick={handleOpenFiltersModal}
              >
                Filter
              </StyledButton>
              {/* {shouldAllowAdd && (
                <StyledButton
                  variant="primary"
                  icon={<AddIcon sx={{ fontSize: "16px" }} />}
                  onClick={handleAddNotification}
                >
                  Add
                </StyledButton>
              )}
              {shouldAllowImport && (
                <ImportFile
                  title="Import"
                  dataSourceId={dataSourceId}
                  CustomButton={
                    <StyledButton
                      variant="primary"
                      icon={<AddIcon sx={{ fontSize: "16px" }} />}
                    >
                      Import
                    </StyledButton>
                  }
                />
              )} */}
              <StyledButton
                variant="primary"
                icon={<IosShareIcon sx={{ fontSize: "16px" }} />}
                onClick={handleExport}
              >
                Export
              </StyledButton>
            </Box>
          </Box>
          {formattedColumns.length > 0 ? (
            <DataGrid
              loading={false}
              rows={displayRows}
              columns={formattedColumns}
              getRowId={(row) => row._id}
              disableVirtualization
              paginationMode="server"
              rowCount={
                rowCount ||
                (loading && displayRows.length > 0
                  ? paginationModel.pageSize
                  : 0)
              }
              paginationModel={paginationModelMemo}
              onPaginationModelChange={setPaginationModel}
              disableColumnMenu
              getRowHeight={() => "auto"}
              sx={{
                "& .MuiDataGrid-cell": {
                  display: "flex",
                  alignItems: "flex-start",
                  paddingY: 1,
                  lineHeight: 1.4,
                },
                "& .MuiDataGrid-row": {
                  "&:hover": {
                    backgroundColor:
                      STYLE_GUIDE?.COLORS?.backgroundLight || "#f5f5f5",
                  },
                },
                height: "calc(100vh - 280px)",
              }}
              slots={{
                pagination: () => (
                  <CustomPagination
                    paginationModel={paginationModelMemo}
                    setPaginationModel={setPaginationModel}
                    rowCount={rowCount}
                  />
                ),
              }}
            />
          ) : loading && formattedColumns.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "calc(100vh - 280px)",
                width: "100%",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 4,
                textAlign: "center",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: STYLE_GUIDE?.COLORS?.black || "#000000",
                  mb: 1,
                  opacity: 0.6,
                }}
              >
                No Data Available
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: STYLE_GUIDE?.COLORS?.black || "#000000",
                  opacity: 0.6,
                }}
              >
                No records found.
              </Typography>
            </Box>
          )}
      </PageCardLayout>
    </>
  );
};
