import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import { STYLE_GUIDE } from "../../styles";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import ImportFile from "../../components/common/importFile/ImportFile";
import dayjs from "dayjs";

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

  const formattedColumns = React.useMemo(() => {
    return columns.map((column) => {
      if (column.field === "actions") {
        return column;
      }

      return {
        ...column,
        renderCell: (params: any) => {
          const value = params.value;

          if (
            column.field.toLowerCase().includes("date") &&
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
  }, [columns]);

  return (
    <>
      <Card
        sx={{
          backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <TextField
              placeholder="Search..."
              variant="outlined"
              size="small"
              value={searchValue}
              onChange={handleSearchChange}
              sx={{
                width: "300px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
                  "& fieldset": {
                    borderColor: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
                  },
                  "&:hover fieldset": {
                    borderColor: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{
                        color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                      }}
                    />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={handleOpenFiltersModal}
                sx={{
                  borderRadius: "8px",
                  borderColor: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
                  color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                  "&:hover": {
                    backgroundColor:
                      STYLE_GUIDE?.COLORS?.backgroundDefault || "#f1f5f9",
                    borderColor: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                  },
                }}
              >
                Filter
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNotification}
                sx={{
                  borderRadius: "8px",
                  backgroundColor:
                    STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                  color: STYLE_GUIDE?.COLORS?.white || "#ffffff",
                  "&:hover": {
                    backgroundColor: STYLE_GUIDE?.COLORS?.primary || "#5c6bc0",
                  },
                }}
              >
                Add
              </Button>
              <ImportFile
                title="Import"
                dataSourceId={dataSourceId}
                CustomButton={
                  <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    sx={{
                      borderRadius: "8px",
                      backgroundColor:
                        STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                      color: STYLE_GUIDE?.COLORS?.white || "#ffffff",
                      "&:hover": {
                        backgroundColor:
                          STYLE_GUIDE?.COLORS?.primary || "#5c6bc0",
                      },
                    }}
                  >
                    Import
                  </Button>
                }
              />
            </Box>
          </Box>
          {rows.length > 0 ? (
            <DataGrid
              loading={loading}
              rows={rows}
              columns={formattedColumns}
              getRowId={(row) => row._id}
              paginationMode="server"
              rowCount={rowCount}
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
        </CardContent>
      </Card>
    </>
  );
};
