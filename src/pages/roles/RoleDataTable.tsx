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
import EditOutlined from "@mui/icons-material/EditOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import useGet from "../../hooks/useGet";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import { GET } from "../../services/apiRoutes";
import { toast } from "react-toastify";
import { ActionIconButton } from "../../components/common";
import SearchField from "../../components/common/SearchField";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { checkPermission } from "../../utils/utils";
import { PermissionsMap } from "../../utils/constants";

interface Role {
  _id: string;
  organizationId: string;
  name: string;
  status: string;
  permissions?: string[];
}

interface ApiResponse {
  success: boolean;
  data: Role[];
  totalCount: number;
}

const columns: GridColDef[] = [
  {
    field: "name",
    headerName: "Name",
    flex: 1,
    minWidth: 200,
    disableColumnMenu: true,
    resizable: true,
    sortable: true,
  },
  {
    field: "status",
    headerName: "Status",
    minWidth: 120,
    width: 150,
    disableColumnMenu: true,
    resizable: true,
    sortable: true,
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
    minWidth: 140,
    flex: 0,
    disableColumnMenu: true,
    sortable: false,
    resizable: false,
    renderCell: (params) => (
      <Box sx={{ display: "flex", gap: 1 }}>
        <Tooltip title="Edit" arrow>
          <ActionIconButton
            onClick={() =>
              params.row.shouldAllowEdit && params.row.handleEdit(params.row)
            }
            disabled={!params.row.shouldAllowEdit}
          >
            <EditOutlined />
          </ActionIconButton>
        </Tooltip>
        <Tooltip title="View" arrow>
          <ActionIconButton onClick={() => params.row.handleView(params.row)}>
            <VisibilityIcon />
          </ActionIconButton>
        </Tooltip>
        <Tooltip title="Delete" arrow>
          <ActionIconButton
            onClick={() => params.row.handleDelete(params.row._id)}
            disabled={
              !params.row._id ||
              !params.row.shouldAllowDelete ||
              ["super admin", "admin", "user"].includes(
                params.row.name?.toLowerCase()
              )
            }
          >
            <DeleteOutlined />
          </ActionIconButton>
        </Tooltip>
      </Box>
    ),
  },
];

interface RoleDataTableProps {
  onAddRole: () => void;
  onEditRole: (row: Role) => void;
  onViewRole: (row: Role) => void;
  onDeleteRole: (id: string) => void;
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
  roleReload: boolean;
  loading: boolean;
  shouldAllowEdit: boolean;
  shouldAllowDelete: boolean;
}

export function RoleDataTable({
  onAddRole,
  onEditRole,
  onViewRole,
  onDeleteRole,
  onFilter,
  searchValue,
  onSearchChange,
  paginationModel,
  setPaginationModel,
  filterValues,
  roleReload,
  loading,
  shouldAllowEdit,
  shouldAllowDelete,
}: RoleDataTableProps) {
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

  const roleList = useGet<ApiResponse>(
    [
      "roleList",
      String(paginationModel.page + 1),
      String(paginationModel.pageSize),
      debouncedSearchValue,
      String(roleReload),
      filterValues.name,
      filterValues.organizationId,
      filterValues.status,
    ],
    `${GET.ROLE_LIST}?page=${
      paginationModel.page + 1
    }&limit=${perPageItem}&search=${encodeURIComponent(
      debouncedSearchValue
    )}&name=${encodeURIComponent(
      filterValues.name
    )}&organizationId=${encodeURIComponent(
      filterValues.organizationId
    )}&status=${encodeURIComponent(filterValues.status)}`,
    true
  );

  const rolesWithIds =
    Array.isArray(roleList?.data?.data) && roleList.data.data.length > 0
      ? roleList.data.data.map((role) => ({
          ...role,
          id: role._id || `temp-${Math.random().toString(36).substr(2, 9)}`,
          permissions: role.permissions || [],
          handleEdit: onEditRole,
          handleView: onViewRole,
          handleDelete: onDeleteRole,
          shouldAllowEdit: shouldAllowEdit,
          shouldAllowDelete: shouldAllowDelete,
        }))
      : [];

  return (
    <>
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
          handleSearchChange={onSearchChange}
        />

        {/* <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddRole}
            sx={{ borderRadius: "8px" }}
          >
            Add
          </Button>
        </Box> */}
      </Box>

      <DataGrid
        rows={rolesWithIds}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[10, 20]}
        disableColumnMenu
        disableVirtualization
        paginationMode="server"
        sx={{ overflow: "visible", width: "100%" }}
        loading={loading || roleList.isLoading}
        rowCount={roleList?.data?.totalCount}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        slots={{
          pagination: () => (
            <CustomPagination
              paginationModel={paginationModel}
              setPaginationModel={setPaginationModel}
              rowCount={roleList?.data?.totalCount || 0}
            />
          ),
        }}
      />
    </>
  );
}
