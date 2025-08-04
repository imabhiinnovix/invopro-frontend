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
  Grid,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import useGet from "../../hooks/useGet";
import usePost from "../../hooks/usePost";
import usePut from "../../hooks/usePut";
import useDelete from "../../hooks/useDelete";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import { DELETE, GET, POST, PUT } from "../../services/apiRoutes";
import { RootState } from "../../reducers";
import { useSelector } from "react-redux";
import {
  BackendPermission,
  formatPermissionName,
  formatPermissions,
  PermissionMap,
} from "../../utils/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

// Define types
interface PermissionDetail {
  _id: string;
  name: string;
  method: string;
  resourceId: string;
  dataSourceId?: string;
  resourceType: string;
  resourceCode?: string;
  status: string;
  isSuperUser: boolean;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface NotificationTypeDetail {
  _id: string;
  permissionId: PermissionDetail;
  notificationTypeId: string;
  status: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

interface NotificationType {
  _id: string;
  organizationId: string;
  name: string;
  status: string;
  permissions?: string[];
}

interface ApiResponse {
  success: boolean;
  data: NotificationType[];
  totalCount: number;
}

interface NotificationTypeDetailResponse {
  success: boolean;
  data: NotificationTypeDetail[];
  totalCount: number;
}

interface NotificationTypePostPayload {
  name: string;
  organizationId?: string;
  status?: string;
  permissionIds: string[];
}

interface NotificationTypePostResponse {
  success: boolean;
  data: NotificationType;
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
    field: "status",
    headerName: "Status",
    width: 250,
    disableColumnMenu: true,
    resizable: true,
    renderCell: (params) => (
      <Chip
        label={params.row.isActive ? "Active" : "Inactive"} // Map isActive to Active/Inactive
        size="small"
        color={params.row.isActive ? "success" : "error"} // Use isActive for color logic
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
            disabled={!params.row._id}
          >
            <DeleteIcon />
          </Button>
        </Tooltip>
      </Box>
    ),
  },
];

export default function NotificationTypes() {
  const theme = useUnifiedTheme();
  const Navigate = useNavigate();

  const queryClient = useQueryClient();
  const { permissions } = useSelector(
    (state: RootState) => state.userPermission
  );
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<
    "add" | "edit" | "view" | "filter" | null
  >(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editNotificationTypeId, setEditNotificationTypeId] = useState<
    string | null
  >(null);
  const [searchValue, setSearchValue] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
  const [notificationTypeReload, setNotificationTypeReload] = useState(false);
  const [filterValues, setFilterValues] = useState({
    name: "",
    organizationId: "",
    status: "",
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "error" | "success";
  }>({
    open: false,
    message: "",
    severity: "error",
  });
  const [formattedPermissions, setFormattedPermissions] =
    useState<PermissionMap>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingWithDelay, setIsLoadingWithDelay] = useState(false);
  const [fetchTimestamp, setFetchTimestamp] = useState(Date.now());

  const initialPermissions = Object.keys(permissions ?? {}).reduce(
    (acc, resourceType: string) => ({
      ...acc,
      [resourceType]: Object.keys(permissions[resourceType] ?? {}).reduce(
        (permAcc, permKey: string) => ({
          ...permAcc,
          [permKey]: false,
        }),
        {} as Record<string, boolean>
      ),
    }),
    {} as Record<string, Record<string, boolean>>
  );

  const [selectedPermissions, setSelectedPermissions] =
    useState(initialPermissions);

  const { control, handleSubmit, reset, watch } =
    useForm<NotificationTypePostPayload>({
      defaultValues: {
        name: "",
        organizationId: "",
        status: "",
        permissionIds: [],
      },
      mode: "onChange",
    });

  const nameValue = watch("name");
  const isNameValid = nameValue?.trim().length > 0;

  const notificationTypeDetail = useGet<NotificationTypeDetailResponse>(
    ["notificationTypeDetail", editNotificationTypeId, fetchTimestamp],
    editNotificationTypeId
      ? `${GET.NOTIFICATION_TYPE_DETAIL}/${editNotificationTypeId}`
      : null,
    !!editNotificationTypeId,
    { refetchOnWindowFocus: false }
  );

  useEffect(() => {
    if (
      isInitialLoad &&
      notificationTypeDetail.data?.success &&
      Array.isArray(notificationTypeDetail.data?.data) &&
      Object.keys(formattedPermissions).length > 0
    ) {
      const permissionsValue: BackendPermission[] =
        notificationTypeDetail.data.data.map((perm) => perm.permissionId);
      const formatted = formatPermissions(permissionsValue);
      setFormattedPermissions(formatted);

      const permState = { ...initialPermissions };
      Object.keys(permState).forEach((resourceType) => {
        Object.keys(permState[resourceType]).forEach((permKey) => {
          permState[resourceType][permKey] =
            formatted[resourceType]?.[permKey]?.allowed || false;
        });
      });
      setSelectedPermissions(permState);
      setIsInitialLoad(false);
      setIsLoadingWithDelay(false);
    } else if (
      notificationTypeDetail.isError ||
      (notificationTypeDetail.data && !notificationTypeDetail.data.success)
    ) {
      setFormattedPermissions({});
      setSelectedPermissions(initialPermissions);
      setIsInitialLoad(false);
      setIsLoadingWithDelay(false);
    } else if (
      notificationTypeDetail.data?.success &&
      Array.isArray(notificationTypeDetail.data?.data)
    ) {
      const permissionsValue: BackendPermission[] =
        notificationTypeDetail.data.data.map((perm) => perm.permissionId);
      const formatted = formatPermissions(permissionsValue);
      setFormattedPermissions(formatted);
      setIsLoadingWithDelay(false);
    }
  }, [
    notificationTypeDetail,
    permissions,
    isInitialLoad,
    formattedPermissions,
  ]);

  // Enforce loader until data is fetched and permissions are processed
  useEffect(() => {
    if (
      notificationTypeDetail.isLoading &&
      (modalMode === "edit" || modalMode === "view")
    ) {
      setIsLoadingWithDelay(true);
    }
  }, [notificationTypeDetail.isLoading, modalMode]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [searchValue]);

  // API call
  const perPageItem = paginationModel.pageSize;
  const notificationTypeList = useGet<ApiResponse>(
    [
      "notificationTypeList",
      String(paginationModel.page + 1),
      String(paginationModel.pageSize),
      debouncedSearchValue,
      String(notificationTypeReload),
      filterValues.name,
      filterValues.organizationId,
      filterValues.status,
    ],

    `${GET.NOTIFICATION_TYPE_LIST}?page=${paginationModel.page + 1}&limit=${perPageItem}&search=${encodeURIComponent(debouncedSearchValue)}&name=${encodeURIComponent(filterValues.name)}&organizationId=${encodeURIComponent(filterValues.organizationId)}&status=${encodeURIComponent(filterValues.status)}`,
    true
  );

  

  // POST API
  const createNotificationType = usePost<
    NotificationTypePostPayload,
    NotificationTypePostResponse
  >(
    ["createNotificationType"],
    (data) => {
      if (data?.success) {
        setNotificationTypeReload(true);
        handleCloseModal();
        setSnackbar({
          open: true,
          message: "Notification Type created successfully!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Failed to create notification type.",
          severity: "error",
        });
      }
    },
    true
  );

  // PUT API
  const updateNotificationType = usePut<
    NotificationTypePostPayload,
    NotificationTypePostResponse
  >(
    ["updateNotificationType"],
    (data) => {
      if (data?.success) {
        queryClient.invalidateQueries([
          "notificationTypeDetail",
          editNotificationTypeId,
        ]);
        setNotificationTypeReload(true);
        handleCloseModal();
        setSnackbar({
          open: true,
          message: "Notification Type updated successfully!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Failed to update notification type.",
          severity: "error",
        });
      }
    },
    true
  );

  // DELETE API
  const deleteNotificationType = useDelete<null, NotificationTypePostResponse>(
    ["deleteNotificationType"],
    (data) => {
      if (data?.success) {
        setNotificationTypeReload(true);
        handleCloseDialog();
        setSnackbar({
          open: true,
          message: "Notification Type deleted successfully!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Failed to delete notification type.",
          severity: "error",
        });
      }
    },
    true
  );

  // Reset notificationTypeReload after listing is fetched
  useEffect(() => {
    if (notificationTypeList?.data && notificationTypeReload) {
      setNotificationTypeReload(false);
    }
  }, [notificationTypeList, notificationTypeReload]);

  // Process API data for DataGrid
  const notificationTypesWithIds =
    Array.isArray(notificationTypeList?.data?.data) &&
    notificationTypeList.data.data.length > 0
      ? notificationTypeList.data.data.map((notificationType) => ({
          ...notificationType,
          id:
            notificationType._id ||
            `temp-${Math.random().toString(36).substr(2, 9)}`,
          permissions: notificationType.permissions || [],
        }))
      : [];

  const handleEdit = (row: NotificationType) => {
    setEditNotificationTypeId(row._id);
    setModalMode("edit");
    setSelectedPermissions(initialPermissions);
    setIsInitialLoad(true);
    setIsLoadingWithDelay(true);
    setFetchTimestamp(Date.now());
    setOpenModal(true);
    reset({
      name: row.name || "",
      organizationId: row.organizationId || "",
      status: row.status || "",
      permissionIds: [],
    });
  };

  const handleView = (row: NotificationType) => {
    setEditNotificationTypeId(row._id);
    setModalMode("view");
    setSelectedPermissions(initialPermissions);
    setIsInitialLoad(true);
    setIsLoadingWithDelay(true);
    setFetchTimestamp(Date.now());
    setOpenModal(true);
    reset({
      name: row.name || "",
      organizationId: row.organizationId || "",
      status: row.status || "",
      permissionIds: [],
    });
  };

  const handleDelete = (id: string) => {
    if (id) {
      setDeleteId(id);
      setOpenDialog(true);
    }
  };

  // const handleAddNotificationType = () => {
  //   reset({
  //     name: "",
  //     organizationId: "",
  //     status: "",
  //     permissionIds: [],
  //   });
  //   setSelectedPermissions(initialPermissions);
  //   setFormattedPermissions({});
  //   setModalMode("add");
  //   setOpenModal(true);
  // };

  const handleAddNotificationType = () => {
    Navigate("/notivix/notification-types/add");
    // setFormData({ id: "", firstName: "", lastName: "", age: "" });
    // setModalMode("add");
    // setOpenModal(true);
  };
  const handleFilter = () => {
    reset({
      name: filterValues.name,
      organizationId: filterValues.organizationId,
      status: filterValues.status,
      permissionIds: [],
    });
    setSelectedPermissions(initialPermissions);
    setModalMode("filter");
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalMode(null);
    setEditNotificationTypeId(null);
    setFormattedPermissions({});
    setSelectedPermissions(initialPermissions);
    setIsInitialLoad(true);
    setIsLoadingWithDelay(false);
    setFetchTimestamp(Date.now());
    reset({
      name: "",
      organizationId: "",
      status: "",
      permissionIds: [],
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteNotificationType.mutate({
          url: `${DELETE.DELETE_NOTIFICATION_TYPE}/${deleteId}`,
        });
      } catch (error) {
        console.error("Error deleting notification type:", error);
        setSnackbar({
          open: true,
          message: "Failed to delete notification type.",
          severity: "error",
        });
      }
    }
  };

  const handleResetFilter = () => {
    reset({
      name: "",
      organizationId: "",
      status: "",
      permissionIds: [],
    });
    setFilterValues({
      name: "",
      organizationId: "",
      status: "",
    });
    setSelectedPermissions(initialPermissions);
  };

  const handleCheckboxChange = (resourceType: string, permKey: string) => {
    setSelectedPermissions((prev) => {
      const newState = {
        ...prev,
        [resourceType]: {
          ...prev[resourceType],
          [permKey]: !prev[resourceType][permKey],
        },
      };
      return newState;
    });
  };

  const onSubmit = async (data: NotificationTypePostPayload) => {
    if (!data.name?.trim() || data.name.trim().length <= 1) {
      setSnackbar({
        open: true,
        message: "Name is required and must be longer than 1 character.",
        severity: "error",
      });
      return;
    }

    try {
      if (modalMode === "filter") {
        setFilterValues({
          name: data.name,
          organizationId: data.organizationId || "",
          status: data.status || "",
        });
        setPaginationModel({ ...paginationModel, page: 0 });
        handleCloseModal();
        return;
      }

      const selectedPermissionIds: string[] = [];
      Object.keys(selectedPermissions).forEach((resourceType) => {
        Object.keys(selectedPermissions[resourceType]).forEach((permKey) => {
          if (selectedPermissions[resourceType][permKey]) {
            const perm = permissions[resourceType]?.[permKey];
            if (perm?.permissionId) {
              selectedPermissionIds.push(perm.permissionId);
            }
          }
        });
      });

      let payload: NotificationTypePostPayload;
      if (modalMode === "add") {
        payload = {
          name: data.name.trim(),
          permissionIds: selectedPermissionIds,
        };
        await createNotificationType.mutate({
          url: `${POST.CREATE_NOTIFICATION_TYPE}`,
          payload,
        });
      } else if (modalMode === "edit") {
        payload = {
          name: data.name.trim(),
          organizationId: data.organizationId || "",
          status: data.status || "",
          permissionIds: selectedPermissionIds,
        };
        await updateNotificationType.mutate({
          url: `${PUT.UPDATE_NOTIFICATION_TYPE}/${editNotificationTypeId}`,
          payload,
        });
      }
    } catch (error) {
      console.error("Error saving notification type:", error);
      setSnackbar({
        open: true,
        message: "An error occurred while saving the notification type.",
        severity: "error",
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

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
          mb: 3,
          fontWeight: 400,
        }}
      >
        Notification Types
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
                onClick={handleAddNotificationType}
                sx={{
                  borderRadius: "8px",
                }}
              >
                Add
              </Button>
            </Box>
          </Box>
          <DataGrid
            rows={notificationTypesWithIds.map((notificationType) => ({
              ...notificationType,
              handleEdit,
              handleView,
              handleDelete,
            }))}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            disableColumnMenu
            paginationMode="server"
            sx={{
              overflow: "visible",
            }}
            loading={
              notificationTypeList.isLoading ||
              createNotificationType.isLoading ||
              updateNotificationType.isLoading ||
              deleteNotificationType.isLoading ||
              notificationTypeDetail.isLoading
            }
            rowCount={notificationTypeList?.data?.pagination?.totalRecords || 0}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            slots={{
              pagination: () => (
                <CustomPagination
                  paginationModel={paginationModel}
                  setPaginationModel={setPaginationModel}
                  rowCount={
                    notificationTypeList?.data?.pagination?.totalRecords || 0
                  }
                />
              ),
            }}
          />
        </CardContent>
      </Card>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: "8px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
            p: 3,
            width: "800px",
            maxWidth: "90%",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            {modalMode === "add"
              ? "Add Notification Type"
              : modalMode === "edit"
                ? "Edit Notification Type"
                : modalMode === "view"
                  ? "View Notification Type"
                  : "Filter Notification Types"}
          </Typography>
          {(notificationTypeDetail.isLoading || isLoadingWithDelay) &&
          (modalMode === "edit" || modalMode === "view") ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : notificationTypeDetail.isError &&
            (modalMode === "edit" || modalMode === "view") ? (
            <Typography color="error">
              Failed to load notification type details. Please try again.
            </Typography>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Name *"
                        placeholder="Enter notification type name"
                        variant="outlined"
                        fullWidth
                        disabled={modalMode === "view"}
                        error={!isNameValid && field.value !== ""}
                        helperText={
                          !isNameValid && field.value !== ""
                            ? "Name must be longer than 1 character"
                            : " "
                        }
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                        }}
                      />
                    )}
                  />
                </Grid>
                {modalMode === "filter" && (
                  <>
                    <Grid item xs={12}>
                      <Controller
                        name="organizationId"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Organization ID"
                            variant="outlined"
                            fullWidth
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "8px",
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <FormControl
                            fullWidth
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "8px",
                              },
                            }}
                          >
                            <InputLabel>Status</InputLabel>
                            <Select
                              {...field}
                              label="Status"
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? undefined
                                    : e.target.value
                                )
                              }
                            >
                              <MenuItem value="">All</MenuItem>
                              <MenuItem value="active">Active</MenuItem>
                              <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </>
                )}
                {(modalMode === "add" ||
                  modalMode === "edit" ||
                  modalMode === "view") && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 2, mt: 2 }}>
                      Permissions
                    </Typography>
                    {Object.keys(selectedPermissions).length === 0 ? (
                      <Typography>No permissions available.</Typography>
                    ) : (
                      Object.keys(selectedPermissions).map((resourceType) => (
                        <Box
                          key={resourceType}
                          sx={{
                            border: `1px solid ${theme.palette.divider}`,
                            p: 2,
                            borderRadius: "8px",
                            mb: 2,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ mb: 1, fontWeight: 600 }}
                          >
                            {resourceType}
                          </Typography>
                          <Grid container spacing={2}>
                            {Object.keys(selectedPermissions[resourceType]).map(
                              (permKey) => (
                                <Grid item xs={12} sm={6} md={4} key={permKey}>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={
                                          selectedPermissions[resourceType][
                                            permKey
                                          ]
                                        }
                                        onChange={() =>
                                          handleCheckboxChange(
                                            resourceType,
                                            permKey
                                          )
                                        }
                                        disabled={modalMode === "view"}
                                        sx={{
                                          color: theme.palette.primary.dark,
                                          "&.Mui-checked": {
                                            color: theme.palette.primary.dark,
                                          },
                                        }}
                                      />
                                    }
                                    label={formatPermissionName(permKey)}
                                    sx={{
                                      "& .MuiFormControlLabel-label": {
                                        whiteSpace: "normal",
                                        wordBreak: "break-word",
                                      },
                                    }}
                                  />
                                </Grid>
                              )
                            )}
                          </Grid>
                        </Box>
                      ))
                    )}
                  </Grid>
                )}
              </Grid>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 1,
                  mt: 3,
                }}
              >
                {modalMode === "filter" ? (
                  <>
                    <Button
                      variant="outlined"
                      onClick={handleResetFilter}
                      sx={{ borderRadius: "8px" }}
                    >
                      Reset
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleCloseModal}
                      sx={{ borderRadius: "8px" }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{ borderRadius: "8px" }}
                      disabled={
                        !filterValues.name &&
                        !filterValues.organizationId &&
                        !filterValues.status
                      }
                    >
                      Apply
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      onClick={handleCloseModal}
                      sx={{ borderRadius: "8px" }}
                    >
                      Cancel
                    </Button>
                    {modalMode !== "view" && (
                      <Button
                        type="submit"
                        variant="contained"
                        sx={{ borderRadius: "8px" }}
                        disabled={
                          !isNameValid ||
                          createNotificationType.isLoading ||
                          updateNotificationType.isLoading
                        }
                      >
                        Save
                      </Button>
                    )}
                  </>
                )}
              </Box>
            </form>
          )}
        </Box>
      </Modal>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "8px",
          },
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ borderRadius: "8px" }}>
            No
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            sx={{ borderRadius: "8px" }}
            disabled={deleteNotificationType.isLoading}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
