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
  Snackbar,
  Grid,
  Alert,
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
import useDelete from "../../hooks/useDelete";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import { DELETE, GET } from "../../services/apiRoutes";
import { RootState } from "../../reducers";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { STYLE_GUIDE } from "../../styles";
import { useComponentTypography } from "../../hooks";
import CommonPageHeader from "../../components/atom/commonPageHeader";
import PrimaryButton from "../../components/common/PrimaryButton";
import SearchField from "../../components/common/SearchField";
import DialogContainer from "../../components/molecule/dialog";

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
        label={params.row.status}
        size="small"
        color={params.row.status === "active" ? "success" : "error"}
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
        {/* <Tooltip title="View" arrow>
          <Button
            variant="text"
            onClick={() => params.row.handleView(params.row)}
            sx={{ minWidth: "auto" }}
          >
            <VisibilityIcon />
          </Button>
        </Tooltip> */}
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
  const { permissions } = useSelector(
    (state: RootState) => state.userPermission
  );
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<"filter" | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
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

  const { getHeadingSx } = useComponentTypography();

  const { control, handleSubmit, reset } = useForm<NotificationTypePostPayload>(
    {
      defaultValues: {
        name: "",
        organizationId: "",
        status: "",
        permissionIds: [],
      },
      mode: "onChange",
    }
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
    `${GET.NOTIFICATION_TYPE_LIST}?page=${
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

  const deleteNotificationType = useDelete<null, NotificationTypePostResponse>(
    ["deleteNotificationType"],
    (data) => {
      if (data?.success) {
        setNotificationTypeReload(true);
        handleCloseDialog();
      } else {
        toast.error("Error");
      }
    },
    true
  );

  useEffect(() => {
    if (notificationTypeList?.data && notificationTypeReload) {
      setNotificationTypeReload(false);
    }
  }, [notificationTypeList, notificationTypeReload]);

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
    Navigate(`/notification-types/edit/${row._id}`);
  };

  const handleView = (row: NotificationType) => {
    Navigate(`/notification-types/view/${row._id}`);
  };

  const handleDelete = (id: string) => {
    if (id) {
      setDeleteId(id);
      setOpenDialog(true);
    }
  };

  const handleAddNotificationType = () => {
    Navigate("/notification-types/add");
  };

  const handleFilter = () => {
    reset({
      name: filterValues.name,
      organizationId: filterValues.organizationId,
      status: filterValues.status,
      permissionIds: [],
    });
    setModalMode("filter");
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalMode(null);
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
        toast.error("Error deleting notification type:", error);
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
  };

  const onSubmit = async (data: NotificationTypePostPayload) => {
    setFilterValues({
      name: data.name,
      organizationId: data.organizationId || "",
      status: data.status || "",
    });
    setPaginationModel({ ...paginationModel, page: 0 });
    handleCloseModal();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  return (
    <Box sx={{ p: STYLE_GUIDE.SPACING.s2 }}>
      <CommonPageHeader
        title="Notification Types"
        actions={
          <PrimaryButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNotificationType}
          >
            Add Notification Type
          </PrimaryButton>
        }
      />
      {/* <Typography
        variant="h4"
        sx={{
          ...getHeadingSx(),
          mb: STYLE_GUIDE?.SPACING?.s3,
        }}
      >
        Notification Types
      </Typography> */}
      <Card sx={{ borderRadius: "8px", overflow: "visible" }}>
        <CardContent sx={{ p: STYLE_GUIDE.SPACING.s3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: STYLE_GUIDE.SPACING.s3,
            }}
          >
            <SearchField
              searchValue={searchValue}
              handleSearchChange={handleSearchChange}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={handleFilter}
                sx={{ borderRadius: "8px" }}
              >
                Filter
              </Button>
              {/* <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNotificationType}
                sx={{ borderRadius: "8px" }}
              >
                Add
              </Button> */}
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
            sx={{ overflow: "visible", height: "calc(100vh - 280px)" }}
            loading={
              notificationTypeList.isLoading || deleteNotificationType.isLoading
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
      <DialogContainer
        open={openModal}
        onClose={handleCloseModal}
        title="Filter Notification Types"
        maxWidth="sm"
        actions={
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
              onClick={handleSubmit(onSubmit)}
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
        }
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: STYLE_GUIDE.SPACING.s3,
          }}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Name"
                placeholder="Enter notification type name"
                variant="outlined"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                }}
              />
            )}
          />

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
                  "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                }}
              />
            )}
          />

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                }}
              >
                <InputLabel>Status</InputLabel>
                <Select
                  {...field}
                  label="Status"
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? undefined : e.target.value
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
        </form>
      </DialogContainer>
      <DialogContainer
        open={openDialog}
        onClose={handleCloseDialog}
        title="Confirm Delete"
        maxWidth="xs"
        actions={
          <>
            <Button
              onClick={handleCloseDialog}
              sx={{ borderRadius: "8px" }}
              variant="outlined"
            >
              No
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="contained"
              color="error"
              sx={{ borderRadius: "8px" }}
              disabled={deleteNotificationType.isLoading}
            >
              Yes
            </Button>
          </>
        }
      >
        <Typography>Are you sure you want to delete this?</Typography>
      </DialogContainer>
    </Box>
  );
}
