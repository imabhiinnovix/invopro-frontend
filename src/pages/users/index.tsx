import { useContext, useState, useMemo } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Tooltip,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Autocomplete,
  InputAdornment,
  IconButton,
} from "@mui/material";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { STYLE_GUIDE } from "../../styles";
import { ActionIconButton } from "../../components/common";
import { GET, POST, PUT, DELETE } from "../../services/apiRoutes";
import useGet from "../../hooks/useGet";
import usePost from "../../hooks/usePost";
import usePut from "../../hooks/usePut";
import useDelete from "../../hooks/useDelete";
import {
  UserListResponse,
  User,
  CreateUserPayload,
  CreateUserResponse,
  RoleListResponse,
  ProductSubscriptionListResponse,
} from "./types";
import { Department } from "../designation/DesignationModal";
import DialogContainer from "../../components/molecule/dialog";
import { StyledButton } from "../../components/common";
import { BusinessUnitDataApiResponse } from "../businessUnit/BusinessUnitDataTable";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import { useDispatch } from "react-redux";
import { setUserListStale } from "../../reducers/userSlice";
import { AuthContext } from "../../context/AuthContext";
import { useForm } from "react-hook-form";
import LocationAutocomplete, {
  validateLocationValues,
} from "../../components/common/location/LocationAutocomplete";
import { State, City } from "country-state-city";
import { useEffect } from "react";

interface UsersProps {
  organizationId?: string;
  shouldAllowUserCreate: boolean;
  shouldAllowUserEdit: boolean;
  shouldAllowUserDelete: boolean;
  shouldAllowProductSubscriptionListing: boolean;
}

interface UserRowData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  organizationId: string;
  roleIds: string[];
  roleNames: string[];
  organizationProductSubscriptionIds: string[];
  departmentId?: string;
  departmentName?: string;
  designationId?: string;
  designationName?: string;
  isVerified: boolean;
  status: "active" | "inactive";
  handleEdit: (row: UserRowData) => void;
  handleView: (row: UserRowData) => void;
  handleDelete: (id: string) => void;
  shouldAllowUserEdit: boolean;
  shouldAllowUserDelete: boolean;
  businessUnit?: string[];
}

export default function Users({
  organizationId,
  shouldAllowUserCreate,
  shouldAllowUserEdit,
  shouldAllowUserDelete,
  shouldAllowProductSubscriptionListing,
}: UsersProps) {
  const { userDetails } = useContext(AuthContext);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "firstName",
        headerName: "First Name",
        width: 200,
        disableColumnMenu: true,
        resizable: true,
        sortable: true,
      },
      {
        field: "lastName",
        headerName: "Last Name",
        width: 200,
        disableColumnMenu: true,
        resizable: true,
        sortable: true,
      },
      {
        field: "email",
        headerName: "Email",
        width: 200,
        disableColumnMenu: true,
        resizable: true,
        sortable: true,
      },
      {
        field: "mobile",
        headerName: "Mobile",
        width: 200,
        disableColumnMenu: true,
        resizable: true,
        sortable: true,
        valueFormatter: (params: { value: unknown }) => (params ? params : "-"),
      },
      {
        field: "roleNames",
        headerName: "Roles",
        width: 200,
        disableColumnMenu: true,
        resizable: true,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Box
            sx={{
              display: "flex",
              gap: STYLE_GUIDE.SPACING.s1,
              flexWrap: "wrap",
              width: "100%",
              height: "100%",
              alignItems: "center",
            }}
          >
            {(params.value as string[])?.map((roleName: string) => (
              <Chip
                key={roleName}
                label={roleName}
                size="small"
                variant="outlined"
              />
            )) || "-"}
          </Box>
        ),
      },
      {
        field: "departmentName",
        headerName: "Department",
        width: 200,
        disableColumnMenu: true,
        resizable: true,
        sortable: true,
        renderCell: (params: GridRenderCellParams) => (
          <Typography variant="body2">{params.value || "-"}</Typography>
        ),
      },
      {
        field: "designationName",
        headerName: "Designation",
        width: 200,
        disableColumnMenu: true,
        resizable: true,
        sortable: true,
        renderCell: (params: GridRenderCellParams) => (
          <Typography variant="body2">{params.value || "-"}</Typography>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 100,
        disableColumnMenu: true,
        resizable: true,
        sortable: true,
        renderCell: (params: GridRenderCellParams) => (
          <Chip
            label={params.value as string}
            size="small"
            color={(params.value as string) === "active" ? "success" : "error"}
            variant="outlined"
          />
        ),
      },
      {
        field: "isVerified",
        headerName: "Verified",
        width: 100,
        disableColumnMenu: true,
        resizable: true,
        sortable: true,
        renderCell: (params: GridRenderCellParams) => (
          <Chip
            label={(params.value as boolean) ? "Yes" : "No"}
            size="small"
            color={(params.value as boolean) ? "success" : "warning"}
            variant="outlined"
          />
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        minWidth: 100,
        disableColumnMenu: true,
        sortable: false,
        resizable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: "flex", gap: STYLE_GUIDE.SPACING.s2 }}>
            <Tooltip title="Edit" arrow>
              <ActionIconButton
                onClick={() =>
                  (params.row as UserRowData).handleEdit(
                    params.row as UserRowData
                  )
                }
                disabled={!(params.row as UserRowData).shouldAllowUserEdit}
              >
                <EditOutlined />
              </ActionIconButton>
            </Tooltip>
            <Tooltip title="Delete" arrow>
              <ActionIconButton
                onClick={() =>
                  (params.row as UserRowData).handleDelete(
                    (params.row as UserRowData).id
                  )
                }
                disabled={
                  !(params.row as UserRowData).shouldAllowUserDelete ||
                  (params.row as UserRowData).id === userDetails?.data?._id
                }
              >
                <DeleteOutlined />
              </ActionIconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [userDetails]
  );
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view" | null>(
    null
  );
  const dispatch = useDispatch();
  const [openDialog, setOpenDialog] = useState(false);
  const [userIdForEdit, setUserIdForEdit] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const validatePassword = (password: string) => {
    if (password.length < 8) return "Password must be at least 8 characters";
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])\S+$/;
    if (!regex.test(password))
      return "Password must contain at least one uppercase, one lowercase, one number and one special character";
    return "";
  };

  const usersQuery = useGet<UserListResponse>(
    ["users", organizationId || "all", String(paginationModel.page + 1)],
    organizationId
      ? `${GET.USER_LIST}?organizationId=${organizationId}&page=${
          paginationModel.page + 1
        }&limit=${paginationModel.pageSize}`
      : `${GET.USER_LIST}?page=${paginationModel.page + 1}&limit=${
          paginationModel.pageSize
        }`,
    true
  );

  const rolesQuery = useGet<RoleListResponse>(
    ["roles", organizationId || "all"],
    organizationId
      ? `${GET.Roles_List}?organizationId=${organizationId}&paginate=false`
      : `${GET.Roles_List}?paginate=false`,
    true
  );

  const productSubscriptionsQuery = useGet<ProductSubscriptionListResponse>(
    ["productSubscriptions", organizationId || "all"],
    organizationId
      ? `${GET.Product_Subscription_List}?organizationId=${organizationId}`
      : GET.Product_Subscription_List,
    true
  );

  const departmentList = useGet<{
    success: boolean;
    data: Department[];
  }>(["departmentList"], GET?.DEPARTMENT_LIST, true);

  const designationList = useGet<{
    success: boolean;
    data: Array<{ _id: string; name: string; departmentId: { _id: string } }>;
  }>(["designationList"], GET?.DESIGNATION_LIST, true);

  const businessUnitListForUser = useGet<BusinessUnitDataApiResponse>(
    ["businessUnitListForUser"],
    `${GET.BUSINESS_UNIT_LIST}?paginate=false`,
    true
  );

  const createUserMutation = usePost<CreateUserPayload, CreateUserResponse>(
    ["users", organizationId || "all", String(paginationModel.page + 1)],
    async () => {
      dispatch(setUserListStale(true));
      handleCloseModal();
    },
    true
  );

  const updateUserMutation = usePut<CreateUserPayload, CreateUserResponse>(
    ["users", organizationId || "all", String(paginationModel.page + 1)],
    async () => {
      dispatch(setUserListStale(true));
      handleCloseModal();
    },
    true
  );

  const deleteUserMutation = useDelete<{ success: boolean; message: string }>(
    ["users", organizationId || "all", String(paginationModel.page + 1)],
    async () => {
      dispatch(setUserListStale(true));
      handleCloseDialog();
    },
    true
  );

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    mobile: "",
    organizationId: "",
    roleIds: [] as string[],
    organizationProductSubscriptionIds: [] as string[],
    departmentId: "",
    designationId: "",
    status: "active" as "active" | "inactive",
    businessUnit: [] as string[],
    address: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
  });

  const {
    control: formControl,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      address: "",
      country: "",
      state: "",
      city: "",
      postalCode: "",
    },
  });

  const selectedCountry = watch("country");
  const selectedState = watch("state");
  const currentCity = watch("city");

  useEffect(() => {
    if (selectedCountry) {
      if (selectedState) {
        try {
          const states = State.getStatesOfCountry(selectedCountry);
          const stateExists = states.some(
            (s) => s.isoCode === selectedState || s.name === selectedState
          );
          if (!stateExists) {
            reset((prevValues) => ({
              ...prevValues,
              state: "",
              city: "",
            }));
            setFormData((prev) => ({
              ...prev,
              state: "",
              city: "",
            }));
          }
        } catch {
          reset((prevValues) => ({
            ...prevValues,
            state: "",
            city: "",
          }));
          setFormData((prev) => ({
            ...prev,
            state: "",
            city: "",
          }));
        }
      }
    } else {
      reset((prevValues) => ({
        ...prevValues,
        state: "",
        city: "",
      }));
      setFormData((prev) => ({
        ...prev,
        state: "",
        city: "",
      }));
    }
  }, [selectedCountry, selectedState, reset]);

  useEffect(() => {
    if (selectedState && selectedCountry) {
      if (currentCity) {
        try {
          const cities = City.getCitiesOfState(selectedCountry, selectedState);
          const cityExists = cities.some((c) => c.name === currentCity);
          if (!cityExists) {
            reset((prevValues) => ({
              ...prevValues,
              city: "",
            }));
            setFormData((prev) => ({
              ...prev,
              city: "",
            }));
          }
        } catch {
          reset((prevValues) => ({
            ...prevValues,
            city: "",
          }));
          setFormData((prev) => ({
            ...prev,
            city: "",
          }));
        }
      }
    } else if (!selectedState) {
      reset((prevValues) => ({
        ...prevValues,
        city: "",
      }));
      setFormData((prev) => ({
        ...prev,
        city: "",
      }));
    }
  }, [selectedState, selectedCountry, currentCity, reset]);

  const handleEdit = (
    row: UserRowData & {
      address?: string;
      country?: string;
      state?: string;
      city?: string;
      postalCode?: string;
    }
  ) => {
    const { country, state, city } = validateLocationValues(
      row.country,
      row.state,
      row.city
    );

    setFormData({
      firstName: row.firstName,
      lastName: row.lastName === "-" ? "" : row.lastName,
      email: row.email,
      password: "",
      mobile: row.mobile?.toString() || "",
      organizationId: row.organizationId || "",
      roleIds: row.roleIds || [],
      organizationProductSubscriptionIds:
        row.organizationProductSubscriptionIds || [],
      departmentId: row.departmentId || "",
      designationId: row.designationId || "",
      status: row.status,
      businessUnit:
        Array.isArray(row?.businessUnit) && row.businessUnit.length > 0
          ? row.businessUnit
          : ["all"],
      address: row.address || "",
      country: country,
      state: state,
      city: city,
      postalCode: row.postalCode || "",
    });
    reset({
      address: row.address || "",
      country: country,
      state: state,
      city: city,
      postalCode: row.postalCode || "",
    });
    setModalMode("edit");
    setUserIdForEdit(row.id);
    setOpenModal(true);
  };

  const handleView = (
    row: UserRowData & {
      address?: string;
      country?: string;
      state?: string;
      city?: string;
      postalCode?: string;
    }
  ) => {
    const { country, state, city } = validateLocationValues(
      row.country,
      row.state,
      row.city
    );

    setFormData({
      firstName: row.firstName,
      lastName: row.lastName || "",
      email: row.email,
      password: "",
      mobile: row.mobile?.toString() || "",
      organizationId: row.organizationId || "",
      roleIds: row.roleIds || [],
      organizationProductSubscriptionIds:
        row.organizationProductSubscriptionIds || [],
      departmentId: row.departmentId || "",
      designationId: row.designationId || "",
      status: row.status,
      businessUnit:
        Array.isArray(row?.businessUnit) && row.businessUnit.length > 0
          ? row.businessUnit
          : ["all"],
      address: row.address || "",
      country: country,
      state: state,
      city: city,
      postalCode: row.postalCode || "",
    });
    reset({
      address: row.address || "",
      country: country,
      state: state,
      city: city,
      postalCode: row.postalCode || "",
    });
    setModalMode("view");
    setOpenModal(true);
  };

  const handleDelete = (id: string) => {
    setUserIdForEdit(id);
    setOpenDialog(true);
  };

  const handleAddUser = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      mobile: "",
      organizationId: "",
      roleIds: [],
      organizationProductSubscriptionIds: [],
      departmentId: "",
      designationId: "",
      status: "active",
      businessUnit: ["all"],
      address: "",
      country: "",
      state: "",
      city: "",
      postalCode: "",
    });
    reset({
      address: "",
      country: "",
      state: "",
      city: "",
      postalCode: "",
    });
    setModalMode("add");
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalMode(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      mobile: "",
      organizationId: "",
      roleIds: [],
      organizationProductSubscriptionIds: [],
      departmentId: "",
      designationId: "",
      status: "active",
      businessUnit: ["all"],
      address: "",
      country: "",
      state: "",
      city: "",
      postalCode: "",
    });
    reset({
      address: "",
      country: "",
      state: "",
      city: "",
      postalCode: "",
    });
    setPasswordError("");
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setUserIdForEdit(null);
  };

  const handleConfirmDelete = async () => {
    if (userIdForEdit) {
      deleteUserMutation.mutate({
        url: `${DELETE.Delete_User}/${userIdForEdit}`,
        payload: { organizationId: organizationId || "" },
      });
    } else {
      handleCloseDialog();
    }
  };

  const handleSave = async () => {
    const countryValue = watch("country") || formData.country || "";
    const stateValue = watch("state") || formData.state || "";
    const cityValue = watch("city") || formData.city || "";

    const { country, state, city } = validateLocationValues(
      countryValue,
      stateValue,
      cityValue
    );

    const addressData = {
      address: watch("address") || formData.address || "",
      country: country,
      state: state,
      city: city,
      postalCode: watch("postalCode") || formData.postalCode || "",
    };

    if (modalMode === "add") {
      const payload: CreateUserPayload = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        roleIds: formData.roleIds,
        organizationProductSubscriptionIds:
          formData.organizationProductSubscriptionIds,
        mobile: formData.mobile,
        organizationId: organizationId || undefined,
        departmentId: formData.departmentId || undefined,
        designationId: formData.designationId || undefined,
        businessUnit: formData.businessUnit.includes("all")
          ? []
          : formData.businessUnit,
        address: addressData.address || undefined,
        country: addressData.country || undefined,
        state: addressData.state || undefined,
        city: addressData.city || undefined,
        postalCode: addressData.postalCode || undefined,
      };
      createUserMutation.mutate({
        url: POST.Create_User,
        payload,
      });
    } else if (modalMode === "edit" && userIdForEdit) {
      const updatePayload: Record<string, unknown> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        organizationId: organizationId || undefined,
        roleIds: formData.roleIds,
        organizationProductSubscriptionIds:
          formData.organizationProductSubscriptionIds,
        mobile: formData.mobile,
        departmentId: formData.departmentId || undefined,
        designationId: formData.designationId || undefined,
        businessUnit: formData.businessUnit.includes("all")
          ? []
          : formData.businessUnit,
        address: addressData.address || undefined,
        country: addressData.country || undefined,
        state: addressData.state || undefined,
        city: addressData.city || undefined,
        postalCode: addressData.postalCode || undefined,
      };
      if (formData.password) {
        updatePayload.password = formData.password;
      }
      updateUserMutation.mutate({
        url: `${PUT.UPDATE_USER}${userIdForEdit}`,
        payload: updatePayload as unknown as CreateUserPayload,
      });
    } else {
      handleCloseModal();
    }
  };

  const transformedUsers: UserRowData[] =
    usersQuery.data?.data?.map((user: User) => {
      // Find the department and designation objects from the fetched lists
      const department = departmentList.data?.data?.find(
        (dept) => dept._id === user.departmentId
      );
      const designation = designationList.data?.data?.find(
        (design) => design._id === user.designationId
      );

      return {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName === "" ? "-" : user.lastName,
        email: user.email,
        mobile: user.mobile === "" ? "-" : user.mobile,
        organizationId: user.organizationId,
        roleIds: user.roleIds?.map((role) => role._id) || [],
        roleNames: user.roleIds?.map((role) => role.name) || [],
        organizationProductSubscriptionIds:
          user.organizationProductSubscriptionIds?.map((sub) => sub._id) || [],
        departmentId: user.departmentId,
        departmentName: department?.name,
        designationId: user.designationId,
        designationName: designation?.name,
        isVerified: user.isVerified,
        status: user.status as "active" | "inactive",
        businessUnit: user.businessUnit || [],
        address: user.address,
        country: user.country,
        state: user.state,
        city: user.city,
        postalCode: user.postalCode,
        handleEdit,
        handleView,
        handleDelete,
        shouldAllowUserEdit,
        shouldAllowUserDelete,
      };
    }) || [];

  // Filter designations based on selected department
  const filteredDesignations = formData.departmentId
    ? (designationList.data?.data || []).filter(
        (designation) => designation.departmentId._id === formData.departmentId
      )
    : [];

  const isAddMode = modalMode === "add";
  const isFormValid =
    !!formData.firstName.trim() &&
    !!formData.email.trim() &&
    (!isAddMode || !!formData.password.trim()) &&
    formData.roleIds.length > 0 &&
    formData.organizationProductSubscriptionIds.length > 0 &&
    !passwordError;

  return (
    <Box
      sx={{
        p: STYLE_GUIDE.SPACING.s6,
      }}
    >
      <Card
        sx={{
          borderRadius: STYLE_GUIDE.SPACING.s2,
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: STYLE_GUIDE.SPACING.s6 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              mb: STYLE_GUIDE.SPACING.s3,
            }}
          >
            <Button
              variant="contained"
              onClick={handleAddUser}
              disabled={!shouldAllowUserCreate}
              sx={{
                borderRadius: STYLE_GUIDE.SPACING.s2,
              }}
            >
              Add User
            </Button>
          </Box>

          {usersQuery.isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: STYLE_GUIDE.SPACING.s8,
              }}
            >
              <CircularProgress />
              <Typography sx={{ ml: STYLE_GUIDE.SPACING.s3 }}>
                Loading users...
              </Typography>
            </Box>
          ) : usersQuery.error ? (
            <Box sx={{ textAlign: "center", py: STYLE_GUIDE.SPACING.s6 }}>
              <Typography color="error" sx={{ mb: STYLE_GUIDE.SPACING.s3 }}>
                {usersQuery.error instanceof Error
                  ? usersQuery.error.message
                  : "Failed to fetch users"}
              </Typography>
            </Box>
          ) : !transformedUsers || transformedUsers.length === 0 ? (
            <Box sx={{ textAlign: "center", py: STYLE_GUIDE.SPACING.s8 }}>
              <Typography variant="body1" color="text.secondary">
                No users found.
              </Typography>
            </Box>
          ) : (
            <DataGrid
              rows={transformedUsers}
              columns={columns}
              disableColumnMenu
              disableVirtualization
              sx={{
                overflow: "visible",
              }}
              loading={usersQuery.isLoading}
              paginationModel={paginationModel}
              initialState={{ pagination: { paginationModel } }}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[10, 20, 50]}
              paginationMode="server"
              rowCount={usersQuery?.data?.totalCount}
              slots={{
                pagination: () => (
                  <CustomPagination
                    paginationModel={paginationModel}
                    setPaginationModel={setPaginationModel}
                    rowCount={usersQuery?.data?.totalCount || 0}
                  />
                ),
              }}
            />
          )}
        </CardContent>
      </Card>

      <DialogContainer
        open={openModal}
        onClose={handleCloseModal}
        title={
          modalMode === "add"
            ? "Add User"
            : modalMode === "edit"
            ? "Edit User"
            : "View User"
        }
        maxWidth="md"
        actions={
          <>
            {modalMode !== "view" && (
              <StyledButton
                variant="primary"
                onClick={handleSave}
                disabled={
                  createUserMutation.isPending ||
                  updateUserMutation.isPending ||
                  !isFormValid
                }
              >
                {createUserMutation.isPending ||
                updateUserMutation.isPending ? (
                  <CircularProgress size={20} />
                ) : (
                  "Save"
                )}
              </StyledButton>
            )}
          </>
        }
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "2fr 2fr",
            gap: STYLE_GUIDE.SPACING.s6,
            padding: STYLE_GUIDE.SPACING.s4,
          }}
        >
          <TextField
            label="First Name"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            disabled={modalMode === "view"}
            variant="outlined"
            fullWidth
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: STYLE_GUIDE.SPACING.s2,
              },
            }}
          />
          <TextField
            label="Last Name"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            disabled={modalMode === "view"}
            variant="outlined"
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: STYLE_GUIDE.SPACING.s2,
              },
            }}
          />
          <TextField
            label="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            disabled={modalMode === "view"}
            variant="outlined"
            fullWidth
            required
            type="email"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: STYLE_GUIDE.SPACING.s2,
              },
            }}
          />
          {modalMode !== "view" && (
            <TextField
              label="Password"
              value={formData.password}
              onChange={(e) => {
                const newPassword = e.target.value;
                setFormData({ ...formData, password: newPassword });
              }}
              onBlur={() => {
                if (formData.password) {
                  setPasswordError(validatePassword(formData.password));
                } else {
                  setPasswordError("");
                }
              }}
              variant="outlined"
              fullWidth
              required
              error={!!passwordError}
              helperText={passwordError}
              type={showPassword ? "text" : "password"}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: STYLE_GUIDE.SPACING.s2,
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
          <TextField
            label="Mobile"
            value={formData.mobile}
            onChange={(e) => {
              const value = e.target.value;
              // Only allow numbers
              if (value === "" || /^\d+$/.test(value)) {
                setFormData({ ...formData, mobile: value });
              }
            }}
            onKeyPress={(e) => {
              // Prevent non-numeric characters from being entered
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }}
            disabled={modalMode === "view"}
            variant="outlined"
            fullWidth
            type="tel"
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: STYLE_GUIDE.SPACING.s2,
              },
            }}
          />
          {!organizationId && (
            <TextField
              label="Organization ID"
              value={formData.organizationId}
              onChange={(e) =>
                setFormData({ ...formData, organizationId: e.target.value })
              }
              disabled={modalMode === "view"}
              variant="outlined"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: STYLE_GUIDE.SPACING.s2,
                },
                display: "none",
              }}
            />
          )}
          <FormControl
            fullWidth
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: STYLE_GUIDE.SPACING.s2,
              },
            }}
          >
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as "active" | "inactive",
                })
              }
              disabled={modalMode === "view"}
              label="Status"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
          <Autocomplete
            sx={{
              height: 56,
            }}
            options={rolesQuery.data?.data || []}
            getOptionLabel={(option) => option.name}
            value={
              rolesQuery.data?.data?.find((role) =>
                formData.roleIds.includes(role._id)
              ) || null
            }
            onChange={(_, newValue) => {
              setFormData({
                ...formData,
                roleIds: newValue ? [newValue._id] : [],
              });
            }}
            disabled={modalMode === "view"}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Roles"
                required
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: STYLE_GUIDE.SPACING.s2,
                  },
                }}
              />
            )}
          />
          {shouldAllowProductSubscriptionListing && (
            <Autocomplete
              sx={{
                height: 56,
              }}
              multiple
              options={productSubscriptionsQuery.data?.data || []}
              getOptionLabel={(option) => option.productId.name}
              value={
                productSubscriptionsQuery.data?.data?.filter((sub) =>
                  formData.organizationProductSubscriptionIds.includes(sub._id)
                ) || []
              }
              onChange={(_, newValue) =>
                setFormData({
                  ...formData,
                  organizationProductSubscriptionIds: newValue.map(
                    (sub) => sub._id
                  ),
                })
              }
              disabled={modalMode === "view"}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Product Subscriptions"
                  required
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: STYLE_GUIDE.SPACING.s2,
                    },
                  }}
                />
              )}
            />
          )}
          {/* Department Autocomplete */}
          <Autocomplete
            sx={{
              height: 56,
            }}
            options={departmentList.data?.data || []}
            getOptionLabel={(option) => option.name}
            value={
              departmentList.data?.data?.find(
                (dept) => dept._id === formData.departmentId
              ) || null
            }
            onChange={(_, newValue) => {
              setFormData({
                ...formData,
                departmentId: newValue?._id || "",
                designationId: "", // Reset designation when department changes
              });
            }}
            disabled={modalMode === "view"}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Department"
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: STYLE_GUIDE.SPACING.s2,
                  },
                }}
              />
            )}
          />

          {/* Designation Autocomplete - filtered by selected department */}
          <Autocomplete
            sx={{
              height: 56,
            }}
            options={filteredDesignations || []}
            getOptionLabel={(option) => option.name}
            value={
              filteredDesignations?.find(
                (designation) => designation._id === formData.designationId
              ) || null
            }
            onChange={(_, newValue) => {
              setFormData({
                ...formData,
                designationId: newValue?._id || "",
              });
            }}
            disabled={modalMode === "view" || !formData.departmentId}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Designation"
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: STYLE_GUIDE.SPACING.s2,
                  },
                }}
              />
            )}
          />

          <Autocomplete
            sx={{
              height: 56,
            }}
            multiple
            options={[
              { _id: "all", name: "All" },
              ...(businessUnitListForUser?.data?.data || []),
            ]}
            getOptionLabel={(option) => option.name}
            value={
              formData.businessUnit.includes("all")
                ? [{ _id: "all", name: "All" }]
                : businessUnitListForUser?.data?.data?.filter((sub) =>
                    formData.businessUnit.includes(sub._id)
                  ) || []
            }
            onChange={(_, newValue, _reason, details) => {
              const selectedId = details?.option?._id;

              let businessUnit: string[];

              if (selectedId === "all") {
                businessUnit = ["all"];
              } else {
                businessUnit = newValue
                  .map((o) => o._id)
                  .filter((id) => id !== "all");
              }

              setFormData((prev) => ({
                ...prev,
                businessUnit,
              }));
            }}
            disabled={modalMode === "view"}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Business Unit"
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: STYLE_GUIDE.SPACING.s2,
                  },
                }}
              />
            )}
          />
          <TextField
            label="Address"
            value={watch("address") || formData.address}
            onChange={(e) => {
              setFormData({ ...formData, address: e.target.value });
            }}
            disabled={modalMode === "view"}
            variant="outlined"
            fullWidth
            multiline
            rows={2}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: STYLE_GUIDE.SPACING.s2,
              },
            }}
          />

          <LocationAutocomplete
            control={formControl}
            name="country"
            label="Country"
            locationType="country"
            errors={{}}
          />

          <LocationAutocomplete
            control={formControl}
            name="state"
            label="State"
            locationType="state"
            selectedCountry={selectedCountry || formData.country}
            errors={{}}
          />

          <LocationAutocomplete
            control={formControl}
            name="city"
            label="City"
            locationType="city"
            selectedCountry={selectedCountry || formData.country}
            selectedState={selectedState || formData.state}
            errors={{}}
          />
          <TextField
            label="Postal Code"
            value={watch("postalCode") || formData.postalCode}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || /^\d+$/.test(value)) {
                setFormData({ ...formData, postalCode: value });
              }
            }}
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }}
            disabled={modalMode === "view"}
            variant="outlined"
            fullWidth
            type="tel"
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: STYLE_GUIDE.SPACING.s2,
              },
            }}
          />
        </Box>
      </DialogContainer>

      <DialogContainer
        open={openDialog}
        onClose={handleCloseDialog}
        title={"Confirm Delete"}
        maxWidth="sm"
        actions={
          <>
            <StyledButton
              variant="primary"
              onClick={handleConfirmDelete}
              color="error"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <CircularProgress size={20} />
              ) : (
                "Yes"
              )}
            </StyledButton>
          </>
        }
      >
        <Typography>Are you sure you want to delete the user?</Typography>
      </DialogContainer>
    </Box>
  );
}
