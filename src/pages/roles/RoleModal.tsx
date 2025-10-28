import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Modal,
  Grid,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
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
import { useQueryClient } from "@tanstack/react-query";
import { UserResponse } from "../../context/AuthContext";
import { setPermissions } from "../../reducers/userSlice";
import { STYLE_GUIDE } from "../../styles";
import {
  RoleDetailResponse,
  RoleModalProps,
  RolePostPayload,
  RolePostResponse,
} from "../../types/permissions";
import DialogContainer from "../../components/molecule/dialog";

export function RoleModal({
  open,
  onClose,
  mode,
  editRoleId,
  filterValues,
  onFilterApply,
  onFilterReset,
  onRoleCreated,
  onRoleUpdated,

  rows,
  rowData,
}: RoleModalProps) {
  const theme = useUnifiedTheme();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const { permissions } = useSelector(
    (state: RootState) => state.userPermission
  );
  const [formattedPermissions, setFormattedPermissions] =
    useState<PermissionMap>({});
  const [isLoadingWithDelay, setIsLoadingWithDelay] = useState(false);
  const [visibleResourceTypes, setVisibleResourceTypes] = useState(5);
  const permissionsContainerRef = useRef<HTMLDivElement>(null);

  // Memoize initial permissions
  const initialPermissions = React.useMemo(() => {
    return Object.keys(permissions ?? {}).reduce(
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
  }, [permissions]);

  const [selectedPermissions, setSelectedPermissions] =
    useState(initialPermissions);

  const { control, handleSubmit, reset, watch, formState } =
    useForm<RolePostPayload>({
      defaultValues: {
        name: "",
        organizationId: "",
        status: "",
        permissionIds: [],
      },
      mode: "onChange",
    });

  const roleDetail = useGet<RoleDetailResponse>(
    ["roleDetail", editRoleId],
    editRoleId ? `${GET.ROLE_DETAIL}/${editRoleId}?paginate=false` : null,
    !!editRoleId
  );

  // Handle scroll to load more resource types
  const handleScroll = useCallback(() => {
    const container = permissionsContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setVisibleResourceTypes((prev) =>
        Math.min(prev + 5, Object.keys(selectedPermissions).length)
      );
    }
  }, [selectedPermissions]);

  useEffect(() => {
    const container = permissionsContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    if (open) {
      setVisibleResourceTypes(5);
    }
  }, [open, mode]);

  useEffect(() => {
    if (open) {
      reset({
        name: rowData || "",
        organizationId: "",
        status: "",
        permissionIds: [],
      });
      setSelectedPermissions(initialPermissions);
    }
  }, [open, rowData, initialPermissions, reset]);

  useEffect(() => {
    if (roleDetail.data?.success && Array.isArray(roleDetail.data?.data)) {
      const permissionsValue: BackendPermission[] = roleDetail.data.data.map(
        (perm) => perm.permissionId
      );
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
      setIsLoadingWithDelay(false);
    } else if (
      roleDetail.isError ||
      (roleDetail.data && !roleDetail.data.success)
    ) {
      setFormattedPermissions({});
      setSelectedPermissions(initialPermissions);
      setIsLoadingWithDelay(false);
    }
  }, [roleDetail.data, roleDetail.isError, initialPermissions]);

  useEffect(() => {
    if (roleDetail.isLoading && (mode === "edit" || mode === "view")) {
      setIsLoadingWithDelay(true);
    }
  }, [roleDetail.isLoading, mode]);
  const userDetailsAPI = useGet<UserResponse>(
    ["userDetails"],
    GET.USER_DETAILS
  );

  const createRole = usePost<RolePostPayload, RolePostResponse>(
    ["createRole"],
    (data) => {
      if (data?.success) {
        onRoleCreated();
        onClose();
      } else {
        console.log("Failed ");
      }
    },
    true
  );

  // PUT API
  const updateRole = usePut<RolePostPayload, RolePostResponse>(
    ["updateRole"],
    async (data) => {
      if (data?.success) {
        queryClient.invalidateQueries({ queryKey: ["userDetails"] });

        const res = await userDetailsAPI.refetch();
        if (res.data?.success) {
          dispatch(setPermissions(res.data.data.permissionIds));
          queryClient.invalidateQueries(["roleDetail", editRoleId]);
        }
        onRoleUpdated();
        onClose();
      } else {
        console.log("Failed ");
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
            [permKey]: !prev[resourceType][permKey],
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
        if (mode === "filter") {
          onFilterApply({
            name: data.name,
            organizationId: data.organizationId || "",
            status: data.status || "",
          });
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

        let payload: RolePostPayload;
        if (mode === "add") {
          payload = {
            name: data.name.trim(),
            permissionIds: selectedPermissionIds,
          };
          await createRole.mutate({
            url: `${POST.CREATE_ROLE}`,
            payload,
          });
        } else if (mode === "edit") {
          payload = {
            name: data.name.trim(),
            organizationId: data.organizationId || "",
            status: data.status || "",
            permissionIds: selectedPermissionIds,
          };
          await updateRole.mutate({
            url: `${PUT.UPDATE_ROLE}/${editRoleId}`,
            payload,
          });
        }
      } catch (error) {
        console.error("Error saving role:", error);
        // Handle error
      }
    },
    [
      mode,
      selectedPermissions,
      permissions,
      createRole,
      updateRole,
      editRoleId,
      onFilterApply,
    ]
  );

  const handleResetFilter = useCallback(() => {
    reset({
      name: "",
      organizationId: "",
      status: "",
      permissionIds: [],
    });
    onFilterReset();
  }, [reset, onFilterReset]);

  return (
    <DialogContainer
      open={open}
      onClose={onClose}
      title={
        mode === "add"
          ? "Add Role"
          : mode === "edit"
          ? "Edit Role"
          : "View Role"
      }
      actions={
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              mt: 3,
            }}
          >
            {mode === "filter" ? (
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
                  onClick={onClose}
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
            ) : (
              <>
                <Button
                  variant="outlined"
                  onClick={onClose}
                  sx={{ borderRadius: "8px" }}
                >
                  Cancel
                </Button>
                {mode !== "view" && (
                  <Button
                    type="submit"
                    onClick={handleSubmit(onSubmit)}
                    variant="contained"
                    sx={{ borderRadius: "8px" }}
                    disabled={
                      !formState.isValid ||
                      createRole.isLoading ||
                      updateRole.isLoading
                    }
                  >
                    Save
                  </Button>
                )}
              </>
            )}
          </Box>
        </>
      }
    >
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {mode === "view" ? (
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
                  disabled={mode === "view"}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Name *"
                      placeholder="Enter role name"
                      variant="outlined"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message || " "}
                      sx={{
                        "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                      }}
                    />
                  )}
                />
              ) : (
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
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Name *"
                      placeholder="Enter role name"
                      variant="outlined"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message || " "}
                      sx={{
                        "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                      }}
                    />
                  )}
                />
              )}
            </Grid>
            {mode === "filter" && (
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
                </Grid>
              </>
            )}
            {(mode === "add" || mode === "edit" || mode === "view") && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2, mt: 2 }}>
                  Permissions
                </Typography>
                {Object.keys(selectedPermissions).length === 0 ? (
                  <Typography>No permissions available.</Typography>
                ) : (
                  <Box
                    ref={permissionsContainerRef}
                    sx={{
                      maxHeight: "400px",
                      overflowY: "auto",
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: "8px",
                      p: 1,
                    }}
                  >
                    {Object.keys(selectedPermissions)
                      .slice(0, visibleResourceTypes)
                      .map((resourceType) => (
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
                                        disabled={mode === "view"}
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
                      ))}
                    {visibleResourceTypes <
                      Object.keys(selectedPermissions).length && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          py: 2,
                        }}
                      >
                        <CircularProgress size={24} />
                      </Box>
                    )}
                  </Box>
                )}
              </Grid>
            )}
          </Grid>
        </form>
      )}
    </DialogContainer>
  );
}
