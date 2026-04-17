import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Typography,
  Tooltip,
  Skeleton,
  CircularProgress,
  Checkbox, // ✅ added
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
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios"; // ✅ added
import usePost from "../../hooks/usePost";

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

  // ✅ NEW optional props (safe)
  filters?: any;
  search?: any;
  year?: any;
  month?: any;
  versionValue?: string;
}

const TARGET_DS = "699f04727df5e0efe12d5027"; // ✅

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
  filters, // ✅
  search, // ✅
  year, // ✅
  month, // ✅
}) => {
  const prevDataSourceIdRef = React.useRef<string>(dataSourceId);

  // ✅ selection state
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);

  const isTarget = dataSourceId === TARGET_DS;

  React.useEffect(() => {
    if (prevDataSourceIdRef.current !== dataSourceId) {
      const event = {
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>;
      handleSearchChange(event);
      prevDataSourceIdRef.current = dataSourceId;

      // reset selection
      setSelectedRowIds([]);
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

  const { userDetails } = useContext(AuthContext);
  const sendRevalidateRows = usePost<any, any>(
  ["sendRevalidateRows"],
  (res) => {
    if (res?.success) {
      setSelectedRowIds([]);
    }
  },
  true
);
  // ✅ Revalidate API
  const handleRevalidate = () => {
  try {
    const isSelectAll =
      selectedRowIds.length === rows.length && rows.length > 0;

    const payload = {
      dataSourceId,
      rowIds: isSelectAll ? [] : selectedRowIds,
      ...(isSelectAll
      ? {
          filters: filters || {},
          search: search || "",
          year: year || "",
          month: month || "",
        }
      : {}),
    };

    sendRevalidateRows.mutate({
      url: "/common/dataSourceVersion/revalidateCostRows",
      payload,
    });
  } catch (err) {
    console.error(err);
  }
};

const injectBeforeActions = (cols: any[], extraCol: any) =>
  cols.reduce((acc: any[], col: any) => {
    if (col.field === "actions") acc.push(extraCol);
    acc.push(col);
    return acc;
  }, []);

  const formattedColumns = React.useMemo(() => {
    const baseCols = columns.map((column) => {
      if (column.field === "actions") {
        return column;
      }

      const updatedHeaderName =
        column.headerName &&
        column.field &&
        column.field.includes("Converted")
          ? `${column.headerName} ( ${userDetails?.data.organizationId?.defaultCurrency} )`
          : column.headerName;

      return {
        ...column,
        headerName: updatedHeaderName,
        renderCell: (params: any) => {
          const value = params.value;

          if (loading && (value == null || value === "")) {
            return (
              <Box sx={{ width: "100%", py: 1 }}>
                <Skeleton variant="text" width="80%" height={20} />
                <Skeleton variant="text" width="80%" height={20} />
              </Box>
            );
          }

          if (value != null && typeof value == "number" && !isNaN(value)) {
            return Number(value).toFixed(2);
          }

          if (/\bdate\b/i.test(column.field) && value && !Array.isArray(value)) {
            try {
              return dayjs(value).format("DD-MMM-YYYY");
            } catch (error) {
              return renderCellValue(value);
            }
          }

          const cellContent = renderCellValue(value);
          const tooltipText = getTooltipText(value);

          const shouldShowTooltip =
            Array.isArray(value) ||
            (typeof value === "string" && value.length > 30);

          return shouldShowTooltip ? (
            <Tooltip title={tooltipText} arrow placement="top-start">
              <Box sx={{ width: "100%", overflow: "hidden" }}>
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

        const statusColumn = {
  field: "aiCostValidateStatus",
  headerName: "Analyze Status",
  width: 140,
  sortable: false,
  renderCell: (params: any) => {
    const value = params.row.aiCostValidateStatus;

    let color = "#1976d2"; // default blue
    let bg = "#e3f2fd";

    if (value === "error") {
      color = "#d32f2f";
      bg = "#fdecea";
    } else if (value === "completed") {
      color = "#2e7d32";
      bg = "#e8f5e9";
    } else if (value === "processing") {
      color = "#1976d2";
      bg = "#e3f2fd";
    } else if (value === "pending") {
      color = "#1976d2";
      bg = "#e3f2fd";
    }

    return (
      <Box
        sx={{
          px: 1.5,
          py: 0.5,
          borderRadius: "12px",
          fontSize: "0.75rem",
          fontWeight: 400,
          textTransform: "capitalize",
          color,
          backgroundColor: bg,
          display: "inline-block",
        }}
      >
        {value || "pending"}
      </Box>
    );
  },
};

    // ✅ inject checkbox column only for target DS
    if (!isTarget) return injectBeforeActions(baseCols, statusColumn);

    return [
      {
        field: "__select__",
        headerName: "",
        width: 60,
        sortable: false,
        renderHeader: () => {
          const isAllSelected =
            rows.length > 0 && selectedRowIds.length === rows.length;

          return (
            <Checkbox
              checked={isAllSelected}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedRowIds(rows.map((r) => r._id));
                } else {
                  setSelectedRowIds([]);
                }
              }}
            />
          );
        },
        renderCell: (params: any) => {
          const id = params.row._id;
          return (
            <Checkbox
              checked={selectedRowIds.includes(id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedRowIds((prev) => [...prev, id]);
                } else {
                  setSelectedRowIds((prev) =>
                    prev.filter((i) => i !== id)
                  );
                }
              }}
            />
          );
        },
      },
      ...injectBeforeActions(baseCols, statusColumn),
    ];
  }, [columns, loading, selectedRowIds, rows, isTarget]);

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

            {/* ✅ ReValidate Button */}
            {isTarget && (
              <StyledButton
                variant="primary"
                disabled={selectedRowIds.length === 0}
                onClick={handleRevalidate}
              >
                ReValidateCost
              </StyledButton>
            )}

            {shouldAllowAdd && (
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
            )}

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
              (loading && displayRows.length > 0 ? paginationModel.pageSize : 0)
            }
            paginationModel={paginationModelMemo}
            onPaginationModelChange={setPaginationModel}
            disableColumnMenu
            getRowHeight={() => "auto"}
            sx={{
              "& .MuiDataGrid-cell": {
                display: "flex",
                alignItems: "flex-start",
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