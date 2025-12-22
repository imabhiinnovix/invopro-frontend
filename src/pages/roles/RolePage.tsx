import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Paper,
  Chip,
  OutlinedInput,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import useGet from "../../hooks/useGet";
import usePost from "../../hooks/usePost";
import usePut from "../../hooks/usePut";
import { GET, POST, PUT } from "../../services/apiRoutes";
import { RootState } from "../../reducers";
import { useDispatch, useSelector } from "react-redux";
import {
  BackendPermission,
  formatPermissionName,
  formatPermissions,
  PermissionMap,
} from "../../utils/utils";
import { useAppSelector } from "../../storeHooks";
import { useQueryClient } from "@tanstack/react-query";
import { UserResponse } from "../../context/AuthContext";
import { setPermissions } from "../../reducers/userSlice";
import {
  RoleDetailResponse,
  RolePostPayload,
  RolePostResponse,
  RoleListResponse,
} from "../../types/permissions";
import CommonPageHeader from "../../components/atom/commonPageHeader";

interface RolePageProps {
  mode?: "add" | "edit" | "view";
}

export default function RolePage({ mode: propMode }: RolePageProps) {
  const { id: editRoleId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { name?: string };
  const theme = useUnifiedTheme();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  // Determine mode from URL if not passed as prop
  const path = window.location.pathname;
  const mode =
    propMode ||
    (path.includes("/add") ? "add" : path.includes("/edit") ? "edit" : "view");

  const userPermission = useSelector(
    (state: RootState) => state.userPermission
  );
  const permissions = userPermission?.permissions || {};
  const [isLoadingWithDelay, setIsLoadingWithDelay] = useState(false);
  const permissionsContainerRef = useRef<HTMLDivElement>(null);

  // Memoize initial permissions
  const initialPermissions = React.useMemo(() => {
    return Object.keys(permissions ?? {}).reduce(
      (acc, resourceType: string) => ({
        ...acc,
        [resourceType]: Object.keys(permissions[resourceType] ?? {}).reduce(
          (permAcc, permKey: string) => ({
            ...permAcc,
            [permKey]: { allowed: false, isChangeable: true },
          }),
          {} as Record<string, { allowed: boolean; isChangeable: boolean }>
        ),
      }),
      {} as Record<
        string,
        Record<string, { allowed: boolean; isChangeable: boolean }>
      >
    );
  }, [permissions]);

  const [selectedPermissions, setSelectedPermissions] =
    useState(initialPermissions);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState,
    getValues,
  } = useForm<RolePostPayload>({
    defaultValues: {
      name: "",
      organizationId: "",
      status: "",
      roleType: "",
      permissionIds: [],
      defaultDashboardIds: [],
    },
    mode: "onChange",
  });

  const { dashboards } = useAppSelector((state) => state.dashboard);

  const selectedRoleType = watch("roleType");
  const [permissionPage] = useState(2);

  const roleDetail = useGet<RoleDetailResponse>(
    ["roleDetail", editRoleId || ""],
    editRoleId ? `${GET.ROLE_DETAIL}/${editRoleId}?paginate=false` : "",
    !!editRoleId
  );

  const roleDefaultDashboards = useGet<{ success: boolean; data: any[] }>(
    ["roleDefaultDashboards", editRoleId || ""],
    editRoleId ? `${GET.ROLE_DEFAULT_DASHBOARD_LIST}?roleId=${editRoleId}` : "",
    !!editRoleId && (mode === "edit" || mode === "view")
  );

  useEffect(() => {
    if (mode === "add") {
      reset({
        name: "",
        organizationId: "",
        status: "active",
        roleType: "",
        permissionIds: [],
      });
      setSelectedPermissions(initialPermissions);
    }
  }, [mode, initialPermissions, reset]);

  const roleTypes = useGet<RoleListResponse>(
    ["roleTypes"],
    `${GET.Roles_List}?paginate=false`
  );

  useEffect(() => {
    if (mode === "add" && roleTypes.data?.success) {
      const userRole = roleTypes.data.data.find(
        (r: any) => r.name.toLowerCase() === "user"
      );
      if (userRole) {
        setValue("roleType", userRole._id);
      }
    }
  }, [mode, roleTypes.data, setValue]);

  const selectedRoleDetail = useGet<RoleDetailResponse>(
    ["selectedRoleDetail", selectedRoleType, permissionPage],
    selectedRoleType
      ? `${GET.ROLE_DETAIL}/${selectedRoleType}?page=${permissionPage}&limit=10`
      : "",
    !!selectedRoleType && mode !== "view"
  );

  useEffect(() => {
    if (
      mode !== "view" &&
      selectedRoleDetail.data?.success &&
      Array.isArray(selectedRoleDetail.data?.data)
    ) {
      const permissionsValue: BackendPermission[] =
        selectedRoleDetail.data.data.map((perm) => ({
          ...perm.permissionId,
          isChangeable: perm.isChangeable,
        }));
      const formatted = formatPermissions(permissionsValue);

      const permState = { ...initialPermissions };
      Object.keys(permState).forEach((resourceType) => {
        Object.keys(permState[resourceType]).forEach((permKey) => {
          permState[resourceType][permKey] = {
            allowed: formatted[resourceType]?.[permKey]?.allowed || false,
            isChangeable:
              formatted[resourceType]?.[permKey]?.isChangeable ?? true,
          };
        });
      });

      setSelectedPermissions(permState);
    }
  }, [selectedRoleDetail.data, mode, initialPermissions]);

  const filterRoleTypes = roleTypes.data?.data.filter(
    (role) =>
      role.name.toLowerCase() === "user" || role.name.toLowerCase() === "admin"
  );

  useEffect(() => {
    if (
      roleDetail.data?.success &&
      Array.isArray(roleDetail.data?.data) &&
      roleDetail.data.data.length > 0
    ) {
      const firstItem = roleDetail.data.data[0];
      const permissionsValue: BackendPermission[] = roleDetail.data.data.map(
        (perm) => ({
          ...perm.permissionId,
          isChangeable: perm.permissionId.isChangeable,
        })
      );
      const formatted = formatPermissions(permissionsValue);

      const permState = { ...initialPermissions };
      Object.keys(permState).forEach((resourceType) => {
        Object.keys(permState[resourceType]).forEach((permKey) => {
          permState[resourceType][permKey] = {
            allowed: formatted[resourceType]?.[permKey]?.allowed || false,
            isChangeable:
              formatted[resourceType]?.[permKey]?.isChangeable ?? true,
          };
        });
      });

      reset({
        name: state?.name || (firstItem.roleId as any)?.name || "",
        organizationId: (firstItem.roleId as any)?.organizationId || "",
        status: (firstItem.roleId as any)?.status || "active",
        roleType:
          state?.roleType ||
          (firstItem.roleId as any)?.roleType ||
          (firstItem.roleId as any)?._id ||
          "",
        permissionIds: permissionsValue.map((p) => p._id),
        defaultDashboardIds: getValues("defaultDashboardIds"),
      });

      setSelectedPermissions(permState);
      setIsLoadingWithDelay(false);
    } else if (
      roleDetail.isError ||
      (roleDetail.data && !roleDetail.data.success)
    ) {
      setSelectedPermissions(initialPermissions);
      setIsLoadingWithDelay(false);
    }
  }, [roleDetail.data, roleDetail.isError, initialPermissions, reset]);

  useEffect(() => {
    if (
      (mode === "edit" || mode === "view") &&
      roleDefaultDashboards.data?.success &&
      Array.isArray(roleDefaultDashboards.data.data)
    ) {
      const dashboardIds = roleDefaultDashboards.data.data.flatMap(
        (item: any) =>
          Array.isArray(item.dashboardId)
            ? item.dashboardId.map((d: any) => d._id)
            : []
      );

      setValue("defaultDashboardIds", dashboardIds);
    }
  }, [roleDefaultDashboards.data, mode, setValue]);

  console.log(
    "defaultDashboardIds",
    watch("defaultDashboardIds")
    // dashboardIds
  );

  useEffect(() => {
    if (roleDetail.isLoading && (mode === "edit" || mode === "view")) {
      setIsLoadingWithDelay(true);
    }
  }, [roleDetail.isLoading, mode]);

  const userDetailsAPI = useGet<UserResponse>(
    ["userDetails"],
    GET.USER_DETAILS
  );

  const setDefaultDashboard = usePost<
    {
      roleId: string;
      dashboardId: string[];
    },
    any
  >(["setDefaultDashboard"]);

  const updateDefaultDashboard = usePut<
    {
      dashboardId: string[];
    },
    any
  >(["updateDefaultDashboard"]);

  const createRole = usePost<RolePostPayload, RolePostResponse>(
    ["createRole"],
    async (data) => {
      if (data?.success && data.role?._id) {
        const formData = watch();
        if (
          formData.defaultDashboardIds &&
          formData.defaultDashboardIds.length > 0
        ) {
          await setDefaultDashboard.mutateAsync({
            url: POST.CREATE_ROLE_DEFAULT_DASHBOARD,
            payload: {
              roleId: data.role._id,
              dashboardId: formData.defaultDashboardIds,
            },
          });
        }
        navigate("/roles");
      }
    },
    true
  );

  const updateRole = usePut<RolePostPayload, RolePostResponse>(
    ["updateRole"],
    async (data) => {
      if (data?.success) {
        const formData = watch();
        if (
          formData.defaultDashboardIds &&
          formData.defaultDashboardIds.length > 0 &&
          editRoleId
        ) {
          await updateDefaultDashboard.mutateAsync({
            url: `${PUT.UPDATE_ROLE_DEFAULT_DASHBOARD}/${editRoleId}`,
            payload: {
              dashboardId: formData.defaultDashboardIds,
            },
          });
        }

        queryClient.invalidateQueries({ queryKey: ["userDetails"] });
        const res = await userDetailsAPI.refetch();
        if (res.data?.success) {
          dispatch(setPermissions(res.data.data.permissionIds as any));
          queryClient.invalidateQueries({
            queryKey: ["roleDetail", editRoleId],
          });
        }
        navigate("/roles");
      }
    },
    true
  );

  const handleCheckboxChange = useCallback(
    (resourceType: string, permKey: string) => {
      setSelectedPermissions((prev) => {
        const newState = {
          ...prev,
          [resourceType]: {
            ...prev[resourceType],
            [permKey]: {
              ...prev[resourceType][permKey],
              allowed: !prev[resourceType][permKey].allowed,
            },
          },
        };
        return newState;
      });
    },
    []
  );

  const onSubmit = useCallback(
    async (data: RolePostPayload) => {
      if (!data.name?.trim() || data.name.trim().length <= 1) {
        return;
      }

      try {
        const selectedPermissionIds: string[] = [];
        Object.keys(selectedPermissions).forEach((resourceType) => {
          Object.keys(selectedPermissions[resourceType]).forEach((permKey) => {
            if (selectedPermissions[resourceType][permKey].allowed) {
              const perm = permissions[resourceType]?.[permKey];
              if (perm?.permissionId) {
                selectedPermissionIds.push(perm.permissionId);
              }
            }
          });
        });

        let payload: RolePostPayload;
        if (mode === "add") {
          payload = {
            name: data.name.trim(),
            roleType: data.roleType,
            permissionIds: selectedPermissionIds,
          };
          await createRole.mutate({
            url: `${POST.CREATE_ROLE}`,
            payload,
          });
        } else if (mode === "edit") {
          payload = {
            name: data.name.trim(),
            status: data.status || "active",
            permissionIds: selectedPermissionIds,
            roleType: data.roleType,
          };
          await updateRole.mutate({
            url: `${PUT.UPDATE_ROLE}/${editRoleId}`,
            payload,
          });
        }
      } catch (error) {
        console.error("Error saving role:", error);
      }
    },
    [
      mode,
      selectedPermissions,
      permissions,
      createRole,
      updateRole,
      editRoleId,
      navigate,
    ]
  );

  const handleBack = () => {
    navigate("/roles");
  };

  return (
    <Box sx={{ p: 3 }}>
      <CommonPageHeader
        title={
          mode === "add"
            ? "Add Role"
            : mode === "edit"
            ? "Edit Role"
            : "View Role"
        }
        onBack={handleBack}
        actions={null}
      />

      <Paper sx={{ p: 3, mt: 3, borderRadius: "12px" }}>
        {(roleDetail.isLoading || isLoadingWithDelay) &&
        (mode === "edit" || mode === "view") ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : roleDetail.isError && (mode === "edit" || mode === "view") ? (
          <Typography color="error">
            Failed to load role details. Please try again.
          </Typography>
        ) : (
          <form id="role-form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="name"
                  control={control}
                  rules={{
                    required: "Name is required",
                    minLength: {
                      value: 2,
                      message: "Enter at least 2 characters",
                    },
                  }}
                  render={({ field, fieldState }) => {
                    const isDisabled =
                      mode === "view" ||
                      (mode === "edit" &&
                        ["super admin", "admin", "user"].includes(
                          state?.name?.toLowerCase()
                        ));

                    return (
                      <TextField
                        {...field}
                        disabled={isDisabled}
                        label="Role Name *"
                        placeholder="Enter role name"
                        variant="outlined"
                        fullWidth
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message || " "}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            backgroundColor: isDisabled
                              ? "rgba(0, 0, 0, 0.04)"
                              : "inherit",
                          },
                        }}
                      />
                    );
                  }}
                />
              </Grid>

              {mode !== "add" && (
                <Grid item xs={12} md={6}>
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
                          disabled={mode === "view"}
                        >
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="inactive">Inactive</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <Controller
                  name="roleType"
                  control={control}
                  rules={
                    mode === "add" ? { required: "Role Type is required" } : {}
                  }
                  render={({ field, fieldState }) => (
                    <FormControl
                      fullWidth
                      error={!!fieldState.error}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                        },
                      }}
                    >
                      <InputLabel>Role Type *</InputLabel>
                      <Select
                        {...field}
                        label="Role Type *"
                        disabled={mode === "view"}
                      >
                        {filterRoleTypes?.map((role) => (
                          <MenuItem key={role._id} value={role._id}>
                            {role.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {fieldState.error && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5, ml: 1.5 }}
                        >
                          {fieldState.error.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="defaultDashboardIds"
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
                      <InputLabel>Default Dashboards</InputLabel>
                      <Select
                        {...field}
                        multiple
                        disabled={mode === "view"}
                        label="Default Dashboards"
                        input={<OutlinedInput label="Default Dashboards" />}
                        renderValue={(selected) => (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {(selected as string[]).map((value) => {
                              const dashboard = dashboards.find(
                                (d) => d._id === value
                              );
                              return (
                                <Chip
                                  key={value}
                                  label={dashboard ? dashboard.name : value}
                                />
                              );
                            })}
                          </Box>
                        )}
                      >
                        {dashboards?.map((dashboard) => (
                          <MenuItem key={dashboard._id} value={dashboard._id}>
                            <Checkbox
                              checked={
                                (field.value as string[])?.indexOf(
                                  dashboard._id
                                ) > -1
                              }
                            />
                            {dashboard.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, fontWeight: 600 }}>
                  Permissions
                </Typography>
                {Object.keys(selectedPermissions).length === 0 ? (
                  <Typography>No permissions available.</Typography>
                ) : (
                  <Box
                    ref={permissionsContainerRef}
                    sx={{
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: "12px",
                      p: 2,
                    }}
                  >
                    {Object.keys(selectedPermissions).map((resourceType) => {
                      const hasChangeablePermissions = Object.keys(
                        selectedPermissions[resourceType]
                      ).some(
                        (permKey) =>
                          selectedPermissions[resourceType][permKey]
                            .isChangeable
                      );

                      if (!hasChangeablePermissions) {
                        return null;
                      }

                      return (
                        <Box
                          key={resourceType}
                          sx={{
                            border: `1px solid ${theme.palette.divider}`,
                            p: 2,
                            borderRadius: "8px",
                            mb: 2,
                            "&:last-child": { mb: 0 },
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              mb: 2,
                              fontWeight: 700,
                              color: theme.palette.primary.main,
                            }}
                          >
                            {resourceType}
                          </Typography>

                          <Grid container spacing={1}>
                            {Object.keys(selectedPermissions[resourceType]).map(
                              (permKey) => {
                                if (
                                  !selectedPermissions[resourceType][permKey]
                                    .isChangeable
                                )
                                  return null;
                                return (
                                  <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={3}
                                    key={permKey}
                                  >
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={
                                            selectedPermissions[resourceType][
                                              permKey
                                            ].allowed
                                          }
                                          onChange={() =>
                                            handleCheckboxChange(
                                              resourceType,
                                              permKey
                                            )
                                          }
                                          disabled={mode === "view"}
                                          sx={{
                                            color: theme.palette.primary.main,
                                            "&.Mui-checked": {
                                              color: theme.palette.primary.main,
                                            },
                                          }}
                                        />
                                      }
                                      label={formatPermissionName(permKey)}
                                    />
                                  </Grid>
                                );
                              }
                            )}
                          </Grid>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                    mt: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    sx={{ borderRadius: "8px", px: 4 }}
                  >
                    {mode === "view" ? "Back" : "Cancel"}
                  </Button>
                  {mode !== "view" && (
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={
                        !formState.isValid ||
                        createRole.isPending ||
                        updateRole.isPending
                      }
                      sx={{ borderRadius: "8px", px: 4 }}
                    >
                      {mode === "add" ? "Create Role" : "Update Role"}
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </form>
        )}
      </Paper>
    </Box>
  );
}
