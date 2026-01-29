import * as React from "react";
import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Switch from "@mui/material/Switch";
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
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import useGet from "../../hooks/useGet";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import { DELETE, GET } from "../../services/apiRoutes";
import { toast } from "react-toastify";
import { formatDate } from "../../utils/utils";

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
    sortable: true,
  },
  {
    field: "userId",
    headerName: "Created By",
    width: 250,
    disableColumnMenu: true,
    resizable: true,
    sortable: true,
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
    sortable: true,
    renderCell: (params) => {
      return params.row.updatedAt ? formatDate(params.row.updatedAt) : "-";
    },
  },
  {
    field: "status",
    headerName: "Enable/Disable",
    width: 180,
    disableColumnMenu: true,
    resizable: true,
    sortable: true,
    renderCell: (params) => {
      // Normalize status strings here (use 'active' / 'in-active')
      const serverStatus = String(params.row.status || "").toLowerCase();
      const [checked, setChecked] = React.useState(serverStatus === "active");
      const [loading, setLoading] = React.useState(false);

      // ALWAYS sync when params.row.status changes (fixes virtualization / reused cells)
      React.useEffect(() => {
        const s = String(params.row.status || "").toLowerCase();
        setChecked(s === "active");
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [params.row.status, params.id]); // keep in sync when row data or id changes

      const handleToggle = async () => {
        if (loading) return;
        const prevChecked = checked;
        const newChecked = !checked;
        const newStatus = newChecked ? "active" : "in-active"; // use consistent names

        // optimistic UI
        setChecked(newChecked);
        setLoading(true);

        try {
          await params.row.deleteTemplate.mutate(
            {
              // send status as query param since DELETE doesn't accept body
              url: `${DELETE.DELETE_TEMPLATE}/${params.row._id}?status=${newStatus}`,
            },
            {
              onSuccess: (res: any) => {
                if (res?.success) {
                  // toast.success(
                  //   `Template ${newStatus === "active" ? "activated" : "deactivated"} successfully`
                  // );
                  // update the row in the grid so other cells read the new status
                  params.api.updateRows([{ ...params.row, status: newStatus }]);
                } else {
                  toast.error(res?.message || "Failed to update status");
                  setChecked(prevChecked); // revert
                }
              },
              onError: () => {
                toast.error("Error updating template status");
                setChecked(prevChecked); // revert
              },
              onSettled: () => setLoading(false),
            }
          );
        } catch (err) {
          toast.error("Something went wrong");
          setChecked(prevChecked);
          setLoading(false);
        }
      };
      const isDisabled =
        loading || !params.row.shouldAllowEdit || !params.row.shouldAllowDelete;
      return (
        <Switch
          checked={checked}
          onChange={handleToggle}
          color="success"
          disabled={isDisabled}
          // add a stable key to help React reuse correctly if needed
          key={`${params.id}-status-switch`}
        />
      );
    },
  },
  {
    field: "actions",
    headerName: "Actions",
    minWidth: 100,
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
        {/* <Tooltip title="Delete" arrow>
          <Button
            variant="text"
            onClick={() => params.row.handleDelete(params.row._id)}
            sx={{ minWidth: "auto", color: "error.main" }}
            disabled={!params.row._id || !params.row.shouldAllowDelete}
          >
            <DeleteOutlined />
          </Button>
        </Tooltip> */}
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
  deleteTemplate: any;
  setTemplateReload: any;
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
  deleteTemplate,
  setTemplateReload,
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
          deleteTemplate,
          setTemplateReload,
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
          disableVirtualization
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
