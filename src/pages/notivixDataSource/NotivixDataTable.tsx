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
  handleFilter: () => void;
  listCurrentData: any;
  dataSourceId: string;
}

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
  handleFilter,
  dataSourceId,
}) => {
  const paginationModelMemo = React.useMemo(
    () => ({
      page: paginationModel.page,
      pageSize: paginationModel.pageSize,
    }),
    [paginationModel.page, paginationModel.pageSize]
  );
  return (
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
              onClick={handleFilter}
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
                backgroundColor: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
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
            columns={columns}
            getRowId={(row) => row._id}
            paginationMode="server"
            rowCount={rowCount}
            paginationModel={paginationModelMemo}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 20]}
            disableColumnMenu
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
  );
};
