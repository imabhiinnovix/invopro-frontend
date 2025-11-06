import * as React from "react";
import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import { STYLE_GUIDE } from "../../styles";
import useGet from "../../hooks/useGet";
import usePost from "../../hooks/usePost";
import usePut from "../../hooks/usePut";
import useDelete from "../../hooks/useDelete";
import { GET, POST, PUT, DELETE } from "../../services/apiRoutes";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../reducers";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import {
  ApiResponse,
  DataSource,
  Permission,
  PermissionPostPayload,
  PermissionPostResponse,
} from "../../types/permissions";
import { UserResponse } from "../../context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { setPermissions } from "../../reducers/userSlice";
import { toast } from "react-toastify";
import { useComponentTypography } from "../../hooks";
import DialogContainer from "../../components/molecule/dialog";
import PrimaryButton from "../../components/common/PrimaryButton";
import { checkPermission } from "../../utils/utils";
import { PermissionsMap } from "../../utils/constants";

const columns: GridColDef[] = [
  {
    field: "name",
    headerName: "Name",
    width: 150,
    disableColumnMenu: true,
    resizable: true,
  },
  {
    field: "resourceType",
    headerName: "Resource Type",
    width: 150,
    disableColumnMenu: true,
    resizable: true,
  },
  {
    field: "status",
    headerName: "Status",
    width: 100,
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
    field: "dataSourceId",
    headerName: "Data Source",
    width: 150,
    disableColumnMenu: true,
    resizable: true,
    renderCell: (params) => params.value?.name || "-",
  },
  {
    field: "methodName",
    headerName: "Method",
    width: 100,
    disableColumnMenu: true,
    resizable: true,
    renderCell: (params) => params.row.methodName || params.row.method || "-", // Prioritize methodName, fallback to method
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 150,
    disableColumnMenu: true,
    sortable: false,
    resizable: false,
    renderCell: (params) => {
      const hasDataSourceName = !!params.row.dataSourceId?.name;
      return (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Edit" arrow>
            <Button
              variant="text"
              onClick={() =>
                hasDataSourceName && params.row.handleEdit(params.row)
              }
              sx={{ minWidth: "auto" }}
              disabled={!hasDataSourceName || !params.row.shouldAllowEdit}
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
      );
    },
  },
];

export default function Permissions() {
  const theme = useUnifiedTheme();
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<
    "add" | "edit" | "view" | "filter" | null
  >(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
  const [filterValues, setFilterValues] = useState({
    name: "",
    dataSourceId: "",
    resourceType: "",
  });
  const { getHeadingSx } = useComponentTypography();
  const permissions = useSelector(
    (state: RootState) => state.userPermission.permissions
  );
  const shouldAllowAdd = checkPermission(
    permissions,
    PermissionsMap.PERMISSION,
    "create"
  );
  const shouldAllowEdit = checkPermission(
    permissions,
    PermissionsMap.PERMISSION,
    "update"
  );
  const shouldAllowDelete = checkPermission(
    permissions,
    PermissionsMap.PERMISSION,
    "delete"
  );

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

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    dataSourceId: "",
    method: "",
    methodName: "",
    resourceType: "",
    code: "",
  });

  const perPageItem = paginationModel.pageSize;
  const permissionList = useGet<ApiResponse>(
    [
      "permissionList",
      String(paginationModel.page + 1),
      String(paginationModel.pageSize),
      debouncedSearchValue,
      filterValues.name,
      filterValues.dataSourceId,
      filterValues.resourceType,
    ],
    `${GET?.PERMISSION_LIST}?page=${
      paginationModel.page + 1
    }&limit=${perPageItem}&search=${encodeURIComponent(
      debouncedSearchValue
    )}&name=${encodeURIComponent(
      filterValues.name
    )}&dataSourceId=${encodeURIComponent(
      filterValues.dataSourceId
    )}&resourceType=${encodeURIComponent(filterValues.resourceType)}`,
    true
  );
  // Get Datasource
  const dataSourceApiList = useGet<any>(
    ["dataSourceApiList"],
    `${GET?.DATASOURCE_API_LIST}?isAllowPermission=true&paginate=false`,
    true
  );
  const dataSource = dataSourceApiList?.data?.data;

  const userDetailsAPI = useGet<UserResponse>(
    ["userDetails"],
    GET.USER_DETAILS
  );

  // POST API
  const createPermission = usePost<
    PermissionPostPayload,
    PermissionPostResponse
  >(
    ["createPermission"],
    async (data) => {
      if (data?.success) {
        setPaginationModel({ ...paginationModel, page: 0 });
        permissionList.refetch();

        queryClient.invalidateQueries({ queryKey: ["userDetails"] });

        const res = await userDetailsAPI.refetch();
        if (res.data?.success) {
          dispatch(setPermissions(res.data.data.permissionIds));
        }

        handleCloseModal();
      }
    },
    true
  );

  // PUT API
  const updatePermission = usePut<
    PermissionPostPayload,
    PermissionPostResponse
  >(
    ["updatePermission"],
    async (data) => {
      if (data?.success) {
        setPaginationModel({ ...paginationModel, page: 0 });
        permissionList.refetch();

        queryClient.invalidateQueries({ queryKey: ["userDetails"] });

        const res = await userDetailsAPI.refetch();
        if (res.data?.success) {
          dispatch(setPermissions(res.data.data.permissionIds));
        }
        handleCloseModal();
      }
    },
    true
  );

  // DELETE API
  const deletePermission = useDelete<PermissionPostResponse>(
    ["deletePermission"],
    async (data) => {
      if (data?.success) {
        setPaginationModel({ ...paginationModel, page: 0 });
        permissionList.refetch();
        queryClient.invalidateQueries({ queryKey: ["userDetails"] });

        const res = await userDetailsAPI.refetch();
        if (res.data?.success) {
          dispatch(setPermissions(res.data.data.permissionIds));
        }
        handleCloseDialog();
      }
    },
    true
  );

  // Process API data for DataGrid
  const permissionsWithIds =
    Array.isArray(permissionList?.data?.data) &&
    permissionList.data.data.length > 0
      ? permissionList.data.data.map((permission) => ({
          ...permission,
          id:
            permission._id || `temp-${Math.random().toString(36).substr(2, 9)}`,
        }))
      : [];

  const handleEdit = (row: Permission) => {
    setFormData({
      id: row._id || "",
      name: row.name || "",
      dataSourceId: row.dataSourceId?._id || "",
      method: row.method || "",
      methodName: row.methodName || row.method || "",
      resourceType: row.resourceType || "",
      code: (row.dataSourceId as any)?.code || "",
    });
    setModalMode("edit");
    setOpenModal(true);
  };

  const handleView = (row: Permission) => {
    setFormData({
      id: row._id || "",
      name: row.name || "",
      dataSourceId: row.dataSourceId?._id || "",
      method: row.method || "",
      methodName: row.methodName || row.method || "",
      resourceType: row.resourceType || "",
      code: (row.dataSourceId as any)?.code || "",
    });
    setModalMode("view");
    setOpenModal(true);
  };

  const handleDelete = (id: string) => {
    if (id) {
      setDeleteId(id);
      setOpenDialog(true);
    }
  };

  const handleAddPermission = () => {
    setFormData({
      id: "",
      name: "",
      dataSourceId: "",
      method: "",
      methodName: "",
      resourceType: "",
      code: "",
    });
    setModalMode("add");
    setOpenModal(true);
  };

  const handleFilter = () => {
    setFormData({
      id: "",
      name: filterValues.name,
      dataSourceId: filterValues.dataSourceId,
      resourceType: filterValues.resourceType,
      method: "",
      methodName: "",
      code: "",
    });
    setModalMode("filter");
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalMode(null);
    setFormData({
      id: "",
      name: "",
      dataSourceId: "",
      method: "",
      methodName: "",
      resourceType: "",
      code: "",
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await deletePermission.mutate({
          url: `${DELETE.DELETE_PERMISSION}/${deleteId}`,
        });
      } catch (error) {
        console.error("Error deleting permission:", error);
      }
    }
  };

  const handleResetFilter = () => {
    setFormData({
      ...formData,
      name: "",
      dataSourceId: "",
      resourceType: "",
      method: "",
      methodName: "",
      code: "",
    });
  };

  const handleApplyFilter = () => {
    setFilterValues({
      name: formData.name,
      dataSourceId: formData.dataSourceId,
      resourceType: formData.resourceType,
    });
    setPaginationModel({ ...paginationModel, page: 0 });
    handleCloseModal();
  };

  const handleSave = async () => {
    try {
      if (modalMode === "add") {
        await createPermission.mutate({
          url: POST.CREATE_PERMISSION,
          payload: {
            name: formData.name,
            method: formData.methodName || formData.method,
            methodName: formData.methodName || formData.method,
            dataSourceId: formData.dataSourceId,
            code: formData.code,
          },
        });
      } else if (modalMode === "edit") {
        await updatePermission.mutate({
          url: `${PUT.UPDATE_PERMISSION}/${formData.id}`,
          payload: {
            name: formData.name,
            method: formData.methodName || formData.method,
            methodName: formData.methodName || formData.method,
            dataSourceId: formData.dataSourceId,
            code: formData.code,
          },
        });
      } else if (modalMode === "filter") {
        handleApplyFilter();
      }
    } catch (error) {
      console.error("Error saving permission:", error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleDataSourceChange = (e: SelectChangeEvent<string>) => {
    const selectedDataSource = dataSourceOptions.find(
      (option) => option.id === e.target.value
    );
    setFormData({
      ...formData,
      dataSourceId: e.target.value,
      code: selectedDataSource?.code || "",
    });
  };

  const handleMethodChange = (e: SelectChangeEvent<string>) => {
    setFormData({
      ...formData,
      method: e.target.value.toUpperCase(),
      methodName: e.target.value,
    });
  };

  const dataSourceOptions: { id: string; name: string; code: string }[] =
    Array.isArray(dataSource)
      ? dataSource.map((ds: any) => {
          return {
            id: ds._id,
            name: ds.name,
            code: ds.code || "",
          };
        })
      : [];

  const resourceTypeOptions = Array.isArray(permissionList?.data?.data)
    ? [
        ...new Set(
          permissionList.data.data.map((permission) => permission.resourceType)
        ),
      ].sort()
    : ["Data Source"];

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 3,
        ml: { xs: 0 },
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          ...getHeadingSx(),
          mb: STYLE_GUIDE?.SPACING?.s3,
        }}
      >
        Permissions
      </Typography>

      <Card
        sx={{
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
              placeholder="Search ..."
              variant="outlined"
              size="small"
              value={searchValue}
              onChange={handleSearchChange}
              sx={{
                width: "300px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
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
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={handleFilter}
                sx={{
                  borderRadius: "8px",
                }}
              >
                Filter
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddPermission}
                disabled={!shouldAllowAdd}
                sx={{
                  borderRadius: "8px",
                }}
              >
                Add
              </Button>
            </Box>
          </Box>

          <DataGrid
            rows={permissionsWithIds.map((permission) => ({
              ...permission,
              handleEdit,
              handleView,
              handleDelete,
              shouldAllowEdit,
              shouldAllowDelete,
            }))}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            pageSizeOptions={[5, 10, 20]}
            disableColumnMenu
            paginationMode="server"
            sx={{
              overflow: "visible",
            }}
            loading={
              permissionList.isLoading ||
              createPermission.isPending ||
              updatePermission.isPending ||
              deletePermission.isPending
            }
            rowCount={permissionList?.data?.totalCount || 0}
            paginationModel={paginationModel}
            slots={{
              pagination: () => (
                <CustomPagination
                  paginationModel={paginationModel}
                  setPaginationModel={setPaginationModel}
                  rowCount={permissionList?.data?.totalCount || 0}
                />
              ),
            }}
          />
        </CardContent>
      </Card>

      <DialogContainer
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        title={
          modalMode === "add"
            ? "Add Permission"
            : modalMode === "edit"
            ? "Edit Permission"
            : modalMode === "view"
            ? "View Permission"
            : "Filter Permission"
        }
        actions={
          <>
            {modalMode === "filter" ? (
              <>
                <PrimaryButton variant="outlined" onClick={handleResetFilter}>
                  Reset
                </PrimaryButton>
                <PrimaryButton variant="outlined" onClick={handleCloseModal}>
                  Cancel
                </PrimaryButton>
                <PrimaryButton
                  variant="contained"
                  onClick={handleSave}
                  disabled={
                    !formData.name &&
                    !formData.dataSourceId &&
                    !formData.resourceType &&
                    !filterValues.name &&
                    !filterValues.dataSourceId &&
                    !filterValues.resourceType
                  }
                >
                  Apply
                </PrimaryButton>
              </>
            ) : (
              <>
                <PrimaryButton variant="outlined" onClick={handleCloseModal}>
                  Cancel
                </PrimaryButton>
                {modalMode !== "view" && (
                  <PrimaryButton
                    variant="contained"
                    onClick={handleSave}
                    disabled={
                      !formData.name ||
                      !formData.dataSourceId ||
                      !formData.methodName ||
                      createPermission.isPending ||
                      updatePermission.isPending
                    }
                  >
                    Save
                  </PrimaryButton>
                )}
              </>
            )}
          </>
        }
      >
        <>
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            variant="outlined"
            disabled={modalMode === "view"}
            fullWidth
            required
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />

          <FormControl
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          >
            <InputLabel>Data Source</InputLabel>
            <Select
              value={formData.dataSourceId}
              disabled={modalMode === "view"}
              onChange={handleDataSourceChange}
              label="Data Source"
              required
            >
              {dataSourceOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          >
            <InputLabel>Method</InputLabel>
            <Select
              value={formData.methodName}
              disabled={modalMode === "view"}
              onChange={handleMethodChange}
              label="Method"
              required
            >
              <MenuItem value="list">LIST</MenuItem>
              <MenuItem value="create">CREATE</MenuItem>
              <MenuItem value="delete">DELETE</MenuItem>
              <MenuItem value="update">UPDATE</MenuItem>
              {/* <MenuItem value="view">VIEW</MenuItem> */}
            </Select>
          </FormControl>
        </>
      </DialogContainer>

      <DialogContainer
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        title="Confirm Delete"
        actions={
          <>
            <PrimaryButton variant="outlined" onClick={handleCloseDialog}>
              No
            </PrimaryButton>
            <PrimaryButton
              onClick={handleConfirmDelete}
              color="error"
              disabled={deletePermission.isPending}
            >
              Yes
            </PrimaryButton>
          </>
        }
      >
        <Typography>
          Are you sure you want to delete the Permission ?
        </Typography>
      </DialogContainer>
    </Box>
  );
}
