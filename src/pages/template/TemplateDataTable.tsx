import * as React from "react";
import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  InputAdornment,
  Tooltip,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import useGet from "../../hooks/useGet";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import { GET } from "../../services/apiRoutes";
import { toast } from "react-toastify";

interface Template {
  _id: string;
  organizationId: string;
  name: string;
  status: string;
  permissions?: string[];
}

interface ApiResponse {
  success: boolean;
  data: Template[];
  totalCount: number;
}

const columns: GridColDef[] = [
  {
    field: "name",
    headerName: "Name",
    width: 250,
    disableColumnMenu: true,
    resizable: true,
  },
  {
    field: "userId",
    headerName: "Created By",
    width: 250,
    disableColumnMenu: true,
    resizable: true,
    renderCell: (params) => {
        return params.row.userId
          ? `${params.row.userId?.firstName} ${params.row.userId?.lastName}`
          : "-";
      },
  },
  {
    field: "updatedAt",
    headerName: "Updated At",
    width: 250,
    disableColumnMenu: true,
    resizable: true,
  },
  {
    field: "status",
    headerName: "Status",
    width: 250,
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
    width: 250,
    disableColumnMenu: true,
    sortable: false,
    resizable: false,
    renderCell: (params) => (
      <Box sx={{ display: "flex", gap: 1 }}>
        <Tooltip title="Edit" arrow>
          <Button
            variant="text"
            onClick={() => params.row.handleEdit(params.row)}
            sx={{ minWidth: "auto" }}
            disabled={!params.row.shouldAllowEdit}
          >
            <EditIcon />
          </Button>
        </Tooltip>
        <Tooltip title="View" arrow>
          <Button
            variant="text"
            onClick={() => params.row.handleView(params.row)}
            sx={{ minWidth: "auto" }}
          >
            <VisibilityIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Delete" arrow>
          <Button
            variant="text"
            onClick={() => params.row.handleDelete(params.row._id)}
            sx={{ minWidth: "auto", color: "error.main" }}
            disabled={!params.row._id || !params.row.shouldAllowDelete}
          >
            <DeleteIcon />
          </Button>
        </Tooltip>
      </Box>
    ),
  },
];

interface TemplateDataTableProps {
  onAddTemplate: () => void;
  onEditTemplate: (row: Template) => void;
  onViewTemplate: (row: Template) => void;
  onDeleteTemplate: (id: string) => void;
  onFilter: () => void;
  searchValue: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  paginationModel: { page: number; pageSize: number };
  setPaginationModel: (model: { page: number; pageSize: number }) => void;
  filterValues: {
    name: string;
    organizationId: string;
    status: string;
  };
  templateReload: boolean;
  loading: boolean;
  shouldAllowAdd: boolean;
  shouldAllowEdit: boolean;
  shouldAllowDelete: boolean;
}

export function TemplateDataTable({
  shouldAllowAdd,
  shouldAllowEdit,
  shouldAllowDelete,
  onAddTemplate,
  onEditTemplate,
  onViewTemplate,
  onDeleteTemplate,
  onFilter,
  searchValue,
  onSearchChange,
  paginationModel,
  setPaginationModel,
  filterValues,
  templateReload,
  loading,
}: TemplateDataTableProps) {
  const theme = useUnifiedTheme();
  const perPageItem = paginationModel.pageSize;

  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue.length === 0) {
        setDebouncedSearchValue("");
      } else if (searchValue.length < 3) {
        toast.warning("Please enter at least 3 characters");
        setDebouncedSearchValue("");
      } else {
        setDebouncedSearchValue(searchValue);
      }
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchValue]);

  const templateList = useGet<ApiResponse>(
    [
      "templateList",
      String(paginationModel.page + 1),
      String(paginationModel.pageSize),
      debouncedSearchValue,
      String(templateReload),
      filterValues.name,
      filterValues.organizationId,
      filterValues.status,
    ],
    `${GET.TEMPLATE_LIST}?page=${
      paginationModel.page + 1
    }&limit=${perPageItem}&search=${encodeURIComponent(debouncedSearchValue)}
    `,
    true
  );

  const templatesWithIds =
    Array.isArray(templateList?.data?.data) && templateList.data.data.length > 0
      ? templateList.data.data.map((template) => ({
          ...template,
          id: template._id || `temp-${Math.random().toString(36).substr(2, 9)}`,
          permissions: template.permissions || [],
          handleEdit: onEditTemplate,
          handleView: onViewTemplate,
          handleDelete: onDeleteTemplate,
          shouldAllowEdit,
          shouldAllowDelete,
        }))
      : [];

  return (
    <Card sx={{ borderRadius: "8px", overflow: "visible" }}>
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
            placeholder="Search ..."
            variant="outlined"
            size="small"
            value={searchValue}
            onChange={onSearchChange}
            sx={{
              width: "300px",
              "& .MuiOutlinedInput-root": { borderRadius: "8px" },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddTemplate}
              sx={{ borderRadius: "8px" }}
              disabled={!shouldAllowAdd}
            >
              Add
            </Button>
          </Box>
        </Box>

        <DataGrid
          rows={templatesWithIds}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[10, 20]}
          disableColumnMenu
          paginationMode="server"
          sx={{ overflow: "visible" }}
          loading={loading || templateList.isLoading}
          rowCount={templateList?.data?.totalCount || 0}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          slots={{
            pagination: () => (
              <CustomPagination
                paginationModel={paginationModel}
                setPaginationModel={setPaginationModel}
                rowCount={templateList?.data?.pagination?.totalRecords || 0}
              />
            ),
          }}
        />
      </CardContent>
    </Card>
  );
}
