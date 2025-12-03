import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import useGet from "../../hooks/useGet";
import { GET } from "../../services/apiRoutes";
import usePut from "../../hooks/usePut";
import useDelete from "../../hooks/useDelete";
import { PUT, DELETE } from "../../services/apiRoutes";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { useState, useContext } from "react";
import { STYLE_GUIDE } from "../../styles";
import { useComponentTypography } from "../../hooks";
import ThemeTable from "../../components/atom/table/ThemeTable";
import usePost from "../../hooks/usePost";
import { POST } from "../../services/apiRoutes";
import CommonDatePicker from "../../components/common/datePicker/datePicker";
import DialogContentText from "@mui/material/DialogContentText";
import { useEffect } from "react";
import Users from "../users";
import { AuthContext } from "../../context/AuthContext";
import Autocomplete from "@mui/material/Autocomplete";
import CommonPageHeader from "../../components/atom/commonPageHeader";
import DialogContainer from "../../components/molecule/dialog";
import PrimaryButton from "../../components/common/PrimaryButton";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { checkPermission, formatDate, formatDateWithoutTime } from "../../utils/utils";
import { PermissionsMap } from "../../utils/constants";

interface ProductSubscription {
  productId: string;
  totalLicenses: string;
  licenseExpiresAt: string;
  organizationProductSubscriptionId: string;
}

interface MediumSetting {
  medium: string;
  fromAddress?: string;
  serviceName?: string;
  apiKey?: string;
  enabled: boolean;
}

interface OrganizationFormValues {
  name: string;
  description: string;
  domain: string;
  code: string;
  status: string;
  owner: string;
  productIds: string[];
  productSubscriptions: ProductSubscription[];
  mediumSettings: MediumSetting[];
}

export default function Organization() {
  const { isSuperUser } = useContext(AuthContext);
  const permissions = useSelector(
    (state: RootState) => state.userPermission.permissions
  );
  const shouldAllowCreate = checkPermission(
    permissions,
    PermissionsMap.ORGANIZATION,
    "create"
  );
  const shouldAllowEdit = checkPermission(
    permissions,
    PermissionsMap.ORGANIZATION,
    "update"
  );
  const shouldAllowDelete = checkPermission(
    permissions,
    PermissionsMap.ORGANIZATION,
    "delete"
  );

  const shouldAllowUserList = checkPermission(
    permissions,
    PermissionsMap.USER,
    "list"
  );

  const shouldAllowUserCreate = checkPermission(
    permissions,
    PermissionsMap.USER,
    "create"
  );

  const shouldAllowUserEdit = checkPermission(
    permissions,
    PermissionsMap.USER,
    "update"
  );

  const shouldAllowUserDelete = checkPermission(
    permissions,
    PermissionsMap.USER,
    "delete"
  );

  const shouldAllowMediumAdd = checkPermission(
    permissions,
    PermissionsMap.NOTIFICATION_MEDIUM_SETTING,
    "create"
  );

  const shouldAllowMediumEdit = checkPermission(
    permissions,
    PermissionsMap.NOTIFICATION_MEDIUM_SETTING,
    "update"
  );

  const shouldAllowMediumDelete = checkPermission(
    permissions,
    PermissionsMap.NOTIFICATION_MEDIUM_SETTING,
    "delete"
  );

  const shouldAllowMediumList = checkPermission(
    permissions,
    PermissionsMap.NOTIFICATION_MEDIUM_SETTING,
    "list"
  );

  const shouldAllowProductListing = checkPermission(
    permissions,
    PermissionsMap.PRODUCT,
    "list"
  );

  const shouldAllowProductSubscriptionListing = checkPermission(
    permissions,
    PermissionsMap.PRODUCT_SUBSCRIPTION,
    "list"
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
    getValues,
  } = useForm<OrganizationFormValues>({
    defaultValues: {
      name: "",
      description: "",
      domain: "",
      code: "",
      status: "",
      owner: "",
      productIds: [],
      productSubscriptions: [],
      mediumSettings: [],
    },
    mode: "onChange",
  });

  const { fields, replace, remove, append } =
    useFieldArray<OrganizationFormValues>({
      control,
      name: "productSubscriptions",
    });

  const {
    fields: mediumFields,
    replace: replaceMedium,
    remove: removeMedium,
    append: appendMedium,
  } = useFieldArray<OrganizationFormValues>({
    control,
    name: "mediumSettings",
  });

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [productAccessOpen, setProductAccessOpen] = useState(false);
  const [productAccessOrgId, setProductAccessOrgId] = useState<string | null>(
    null
  );
  const [showUsers, setShowUsers] = useState(false);
  const [selectedOrganizationForUsers, setSelectedOrganizationForUsers] =
    useState<any>(null);
  const [showMediumDropdown, setShowMediumDropdown] = useState(false);
  const [editingMediumId, setEditingMediumId] = useState<string | null>(null);
  const [organizationIdForMedium, setOrganizationIdForMedium] = useState<
    string | null
  >(null);
  const [_forceUpdate, setForceUpdate] = useState(0);

  const theme = useUnifiedTheme();

  const { data, isLoading, error, refetch } = useGet<{
    success: boolean;
    data: any[];
    totalCount: number;
  }>(["organizationList"], GET.Organization_List, true);

  const deleteOrg = useDelete<any>(
    ["organizationList"],
    () => {
      setDeleteOpen(false);
      setSelectedOrg(null);
      refetch();
    },
    true
  );

  const updateOrg = usePut<any, any>(
    ["organizationList"],
    () => {
      setEditOpen(false);
      setSelectedOrg(null);
      refetch();
    },
    true
  );

  const createOrg = usePost<any, any>(
    ["organizationList"],
    () => {
      setCreateOpen(false);
      refetch();
    },
    true
  );

  const createMedium = usePost<any, any>(["organizationList"], () => {}, true);

  const updateMedium = usePut<any, any>(["organizationList"], () => {}, true);

  const deleteMedium = useDelete<any>(
    ["organizationList"],
    () => {
      refetch();
    },
    true
  );

  const {
    data: productAccessData,
    isLoading: productAccessLoading,
    error: productAccessError,
    refetch: refetchProductAccess,
  } = useGet<{ success: boolean; data: any[]; totalCount: number }>(
    ["productAccess", productAccessOrgId || ""],
    productAccessOrgId
      ? `${GET.Product_Subscription_List}?organizationId=${productAccessOrgId}`
      : "",
    !!productAccessOrgId
  );

  const handleEditOpen = (org: any) => {
    setSelectedOrg(org);
    setEditOpen(true);
    setProductAccessOrgId(org._id);
    setValue("name", org.name || "");
    setValue("description", org.description || "");
    setValue("domain", org.domain || "");
    setValue("status", org.status || "inactive");
    setValue("owner", org.owner?._id || "");

    const isUserSuperUser = isSuperUser();
    const organizationIdForUsers = isUserSuperUser ? org._id : null;

    setOrganizationIdForMedium(organizationIdForUsers);

    replaceMedium([]);

    if (org.mediumSettings && Array.isArray(org.mediumSettings)) {
      setValue("mediumSettings", org.mediumSettings);
      replaceMedium(org.mediumSettings);
    }
    setShowMediumDropdown(false);
    refetchProductAccess();
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setSelectedOrg(null);
    setShowMediumDropdown(false);
    setOrganizationIdForMedium(null);
    setEditingMediumId(null);
    replaceMedium([]);
  };

  const handleDeleteOpen = (org: any) => {
    setSelectedOrg(org);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setSelectedOrg(null);
  };

  const handleDeleteConfirm = () => {
    if (selectedOrg?._id) {
      deleteOrg.mutate({
        url: `${DELETE.Delete_Organization}/${selectedOrg._id}`,
      });
    }
  };

  const handleEditSubmit = async (formData: any) => {
    setFormLoading(true);
    try {
      const { productIds, mediumSettings, ...rest } = formData;
      await updateOrg.mutateAsync({
        url: `${PUT.UPDATE_ORGANIZATION}${selectedOrg._id}`,
        payload: {
          ...rest,
          code: selectedOrg.code,
          status: rest.status === "active" ? "active" : "inactive",
          owner: rest.owner,
        },
      });

      if (formData.mediumSettings && formData.mediumSettings.length > 0) {
        const notivixProduct = formData.productSubscriptions.find((ps: any) => {
          const product = productOptions.find((p) => p._id === ps.productId);
          return product && product.name?.toLowerCase() === "notivix";
        });

        if (notivixProduct) {
          await createMedium.mutateAsync({
            url: `${POST.CREATE_MEDIUM}`,
            payload: {
              productId: notivixProduct.productId,
              mediumSettings: formData.mediumSettings.map((ms: any) => ({
                medium: ms.medium,
                fromAddress: ms.fromAddress,
                serviceName: ms.serviceName,
                apiKey: ms.apiKey,
                enabled: ms.enabled,
              })),
            },
          });
        }
      }

      replaceMedium([]);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateOpen = () => {
    reset({
      name: "",
      description: "",
      domain: "",
      code: "",
      owner: "",
      productIds: [],
      productSubscriptions: [],
      mediumSettings: [],
    });
    setCreateOpen(true);
    setShowMediumDropdown(false);
    // Ensure medium fields are cleared
    replaceMedium([]);
  };
  const handleCreateClose = () => {
    setCreateOpen(false);
    setShowMediumDropdown(false);
    // Clear medium fields when closing
    replaceMedium([]);
  };

  const handleCreateSubmit = async (formData: any) => {
    setCreateLoading(true);
    try {
      const createResponse = await createOrg.mutateAsync({
        url: POST.Create_Organization,
        payload: {
          name: formData.name,
          description: formData.description,
          domain: formData.domain,
          code: formData.code,
          productSubscriptions: formData.productSubscriptions.map(
            (ps: any) => ({
              productId: ps.productId,
              totalLicenses: Number(ps.totalLicenses),
              licenseExpiresAt: ps.licenseExpiresAt
            })
          ),
        },
      });

      if (
        formData.mediumSettings &&
        formData.mediumSettings.length > 0 &&
        createResponse.data?._id
      ) {
        const notivixProduct = formData.productSubscriptions.find((ps: any) => {
          const product = productOptions.find((p) => p._id === ps.productId);
          return product && product.name?.toLowerCase() === "notivix";
        });

        if (notivixProduct) {
          await createMedium.mutateAsync({
            url: POST.CREATE_MEDIUM,
            payload: {
              productId: notivixProduct.productId,
              mediumSettings: formData.mediumSettings.map((ms: any) => ({
                medium: ms.medium,
                fromAddress: ms.fromAddress,
                serviceName: ms.serviceName,
                apiKey: ms.apiKey,
                enabled: ms.enabled,
              })),
            },
          });
        }
      }

      replaceMedium([]);
    } finally {
      setCreateLoading(false);
    }
  };

  const { getHeadingSx } = useComponentTypography();

  const { data: productListData } = useGet<{
    success: boolean;
    data: any[];
    totalCount: number;
  }>(["productList"], GET.Product_List, true);
  const productOptions = productListData?.data || [];

  const { data: mediumListDataWithOrg } = useGet<any>(
    ["mediumList", organizationIdForMedium || ""],
    organizationIdForMedium
      ? `${GET.MEDIUM_LIST}?organizationId=${organizationIdForMedium}&productId=6870c9e335f4e90221de9ed1`
      : `${GET.MEDIUM_LIST}`,
    Boolean(editOpen && selectedOrg)
  );

  const selectedProductIds = watch("productIds") || [];
  useEffect(() => {
    const formValues = getValues();
    const newFields = selectedProductIds.map((id) => {
      const filled = formValues.productSubscriptions?.find(
        (f: any) => f.productId === id
      );
      const existing = fields.find((f: any) => (f as any).productId === id);
      return (
        filled ||
        existing || { productId: id, totalLicenses: "", licenseExpiresAt: "" }
      );
    });
    replace(newFields);
  }, [selectedProductIds]);

  const handleProductAccessView = (orgId: string) => {
    setProductAccessOrgId(orgId);
    setProductAccessOpen(true);
    refetchProductAccess();
  };

  const handleProductAccessClose = () => {
    setProductAccessOpen(false);
    setProductAccessOrgId(null);
  };

  useEffect(() => {
    if (
      editOpen &&
      selectedOrg &&
      productAccessData &&
      Array.isArray(productAccessData.data) &&
      productAccessOrgId === selectedOrg._id
    ) {
      const productSubs = productAccessData.data.map((item: any) => ({
        productId: item.productId?._id || item.productId,
        totalLicenses: String(item.totalLicenses || ""),
        licenseExpiresAt: item.licenseExpiresAt || "",
        organizationProductSubscriptionId: item?._id
      }));
      const productIds = productSubs.map((ps: any) => ps.productId);
      setValue("productIds", productIds);
      setValue("productSubscriptions", productSubs);
      replace(productSubs);
    }
  }, [editOpen, selectedOrg, productAccessData, productAccessOrgId]);

  const handleRowClick = (org: any, _rowIndex: number) => {
    if (!shouldAllowUserList) return;
    const isUserSuperUser = isSuperUser();

    const organizationIdForUsers = isUserSuperUser ? org._id : null;

    setSelectedOrganizationForUsers({
      ...org,
      organizationIdForUsers,
    });
    setShowUsers(true);
  };

  const handleBackToOrganizations = () => {
    setShowUsers(false);
    setSelectedOrganizationForUsers(null);
  };

  return (
    <Box
      sx={{
        p: STYLE_GUIDE?.SPACING?.s2,
      }}
    >
      <CommonPageHeader
        title={showUsers ? "User Details" : "Organizations Details"}
        onBack={showUsers ? handleBackToOrganizations : undefined}
        actions={
          showUsers
            ? undefined
            : shouldAllowCreate && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCreateOpen}
                >
                  Create
                </Button>
              )
        }
      />
      {showUsers ? (
        <Users
          organizationId={selectedOrganizationForUsers?.organizationIdForUsers}
          shouldAllowUserCreate={shouldAllowUserCreate}
          shouldAllowUserEdit={shouldAllowUserEdit}
          shouldAllowUserDelete={shouldAllowUserDelete}
          shouldAllowProductSubscriptionListing={
            shouldAllowProductSubscriptionListing
          }
        />
      ) : (
        <>
          <Box>
            {isLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 100,
                }}
              >
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error">
                Failed to load organizations.
              </Typography>
            ) : (
              <ThemeTable
                columns={[
                  { key: "name", label: "Name" },
                  { key: "code", label: "Code" },
                  { key: "status", label: "Status" },
                  { key: "owner", label: "Owner" },
                  { key: "description", label: "Description" },
                  { key: "createdAt", label: "Created At" },
                  { key: "updatedAt", label: "Updated At" },
                  { key: "productAccess", label: "Product Access" },
                  { key: "action", label: "Action" },
                ]}
                rows={
                  data?.data?.map((org) => ({
                    _id: org._id,
                    name: org.name,
                    code: org.code,
                    status: org.status,
                    owner: org.owner
                      ? `${org.owner.firstName || ""} ${
                          org.owner.lastName || ""
                        }`.trim()
                      : "-",
                    description: org.description,
                    createdAt: formatDate(org.createdAt),
                    updatedAt: formatDate(org.updatedAt),
                    productAccess: (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductAccessView(org._id);
                        }}
                      >
                        View
                      </Button>
                    ),
                    action: (
                      <>
                        <IconButton
                          disabled={!shouldAllowEdit}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditOpen(org);
                          }}
                          size="small"
                          title="Edit"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          disabled={!shouldAllowDelete}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOpen(org);
                          }}
                          size="small"
                          title="Delete"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    ),
                  })) || []
                }
                stickyHeader={true}
                onRowClick={handleRowClick}
                sx={{
                  p: 0,
                }}
              />
            )}
          </Box>

          <DialogContainer
            open={editOpen}
            onClose={handleEditClose}
            title="Edit Organization"
            maxWidth="md"
            fullWidth
            actions={
              <>
                <PrimaryButton
                  type="submit"
                  variant="contained"
                  onClick={handleSubmit(handleEditSubmit)}
                  disabled={
                    !isValid ||
                    fields.length === 0 ||
                    fields.some((f, idx) => {
                      const err =
                        errors.productSubscriptions &&
                        (errors.productSubscriptions as any)[idx];
                      return err && (err.totalLicenses || err.licenseExpiresAt);
                    })
                  }
                >
                  {formLoading ? "Saving..." : "Save"}
                </PrimaryButton>
              </>
            }
          >
            <DialogContent>
              {selectedOrg && (
                <form
                  onSubmit={handleSubmit(handleEditSubmit)}
                  style={{ marginTop: 8 }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Controller
                        name="name"
                        control={control}
                        rules={{ required: "Name is required" }}
                        defaultValue={selectedOrg.name}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Name"
                            fullWidth
                            margin="normal"
                            error={!!errors.name}
                            helperText={errors.name?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name="description"
                        control={control}
                        defaultValue={selectedOrg.description || ""}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Description"
                            fullWidth
                            margin="normal"
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name="domain"
                        control={control}
                        rules={{ required: "Domain is required" }}
                        defaultValue={selectedOrg.domain || ""}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Domain"
                            fullWidth
                            margin="normal"
                            error={!!errors.domain}
                            helperText={errors.domain?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      {(() => {
                        const usedProductIds = fields.map(
                          (f: any) => (f as any).productId
                        );
                        const availableProducts = productOptions.filter(
                          (p) => !usedProductIds.includes(p._id)
                        );
                        if (availableProducts.length === 0) return null;
                        return (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              mb: 2,
                            }}
                          >
                            <FormControl sx={{ minWidth: 200 }} size="small">
                              <InputLabel id="add-product-label">
                                Add Product
                              </InputLabel>
                              <Select
                                labelId="add-product-label"
                                value={""}
                                label="Add Product"
                                onChange={(e) => {
                                  const productId = e.target.value;
                                  if (!productId) return;
                                  append({
                                    productId,
                                    totalLicenses: "",
                                    licenseExpiresAt: "",
                                  });
                                }}
                              >
                                <MenuItem value="" disabled>
                                  Select product to add
                                </MenuItem>
                                {availableProducts.map((product) => (
                                  <MenuItem
                                    key={product._id}
                                    value={product._id}
                                  >
                                    {product.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <Typography variant="body2" color="textSecondary">
                              Add a new product subscription
                            </Typography>
                          </Box>
                        );
                      })()}
                    </Grid>

                    {(fields || []).map((field, idx) => (
                      <Grid
                        container
                        spacing={2}
                        alignItems="flex-end"
                        key={field.id}
                        sx={{
                          m: 2,
                          width: "100%",
                          border: "1px solid #eee",
                          borderRadius: STYLE_GUIDE.SPACING.s1,
                        }}
                      >
                        <Grid item xs={3}>
                          <Controller
                            name={`productSubscriptions.${idx}.productId`}
                            control={control}
                            rules={{ required: "Product is required" }}
                            render={({ field }) => (
                              <FormControl fullWidth margin="dense">
                                <InputLabel>Product</InputLabel>
                                <Select {...field} label="Product">
                                  {productOptions.map((product) => (
                                    <MenuItem
                                      key={product._id}
                                      value={product._id}
                                    >
                                      {product.name}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            )}
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <Controller
                            name={`productSubscriptions.${idx}.totalLicenses`}
                            control={control}
                            rules={{
                              required: "Total Licenses is required",
                              min: { value: 1, message: "Must be at least 1" },
                            }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Total Licenses"
                                type="number"
                                fullWidth
                                margin="dense"
                                error={
                                  !!errors.productSubscriptions &&
                                  (errors.productSubscriptions as any)[idx]
                                    ?.totalLicenses
                                }
                                helperText={
                                  (errors.productSubscriptions &&
                                    (errors.productSubscriptions as any)[idx]
                                      ?.totalLicenses?.message) ||
                                  ""
                                }
                                inputProps={{ min: 1 }}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <Controller
                            name={`productSubscriptions.${idx}.licenseExpiresAt`}
                            control={control}
                            rules={{
                              required: "License Expiry Date is required",
                            }}
                            render={({ field }) => (
                              <CommonDatePicker
                                {...field}
                                control={control}
                                label="License Expiry Date"
                                views={["year", "month", "day"]}
                                sx={{ marginTop: 1 }}
                              />
                            )}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={2}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <IconButton
                            aria-label="Remove"
                            color="error"
                            onClick={() => remove(idx)}
                            disabled={fields.length === 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    ))}

                  {(() => {
  const hasNotivixProduct = fields.some((field: any) => {
    const product = productOptions.find((p) => p._id === field.productId);
    return product && product.name?.toLowerCase() === "notivix";
  });

  if (!hasNotivixProduct) return null;

  return (
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
        Channel Settings for Notivix
      </Typography>

      {/* ------------------------------------------------------------------
          WE NOW HANDLE FLAT API RESPONSE → GROUP BY LATEST MEDIUM
      ------------------------------------------------------------------- */}
      {mediumListDataWithOrg?.data?.length > 0 && (() => {
        const flatList = mediumListDataWithOrg.data;

        // GROUP BY MEDIUM AND PICK LATEST updatedAt
        const latestMediumMap: Record<string, any> = {};

        flatList.forEach((item: any) => {
          if (
            !latestMediumMap[item.medium] ||
            new Date(item.updatedAt) > new Date(latestMediumMap[item.medium].updatedAt)
          ) {
            latestMediumMap[item.medium] = item;
          }
        });

        const mediumList = Object.values(latestMediumMap);

        return (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Existing Medium Settings:
            </Typography>

            {mediumList.map((medium: any, idx: number) => {
              const mediumId = medium._id;
              const isEditing = editingMediumId === mediumId;

              return (
                <Grid
                  container
                  spacing={2}
                  key={mediumId}
                  sx={{
                    m: 2,
                    width: "100%",
                    border: "1px solid #eee",
                    borderRadius: STYLE_GUIDE.SPACING.s1,
                    p: 2,
                  }}
                >
                  {/* MEDIUM NAME */}
                  <Grid item xs={2}>
                    <FormControl fullWidth margin="dense">
                      <InputLabel>Medium</InputLabel>
                      <Select value={medium.medium} disabled label="Medium">
                        {["email", "sms", "whatsapp", "inapp"].map((m) => (
                          <MenuItem key={m} value={m}>
                            {m}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* FROM ADDRESS */}
                  <Grid item xs={3}>
                    <TextField
                      label="From Address"
                      value={medium.fromAddress || ""}
                      fullWidth
                      margin="dense"
                      disabled={!isEditing}
                      onChange={(e) => {
                        if (isEditing) {
                          medium.fromAddress = e.target.value;
                          setForceUpdate((p) => p + 1);
                        }
                      }}
                    />
                  </Grid>

                  {/* SERVICE NAME */}
                  <Grid item xs={3}>
                    <TextField
                      label="Service Name"
                      value={medium.serviceName || ""}
                      fullWidth
                      margin="dense"
                      disabled={!isEditing}
                      onChange={(e) => {
                        if (isEditing) {
                          medium.serviceName = e.target.value;
                          setForceUpdate((p) => p + 1);
                        }
                      }}
                    />
                  </Grid>

                  {/* API KEY */}
                  <Grid item xs={3}>
                    <TextField
                      label="API Key"
                      value={medium.apiKey || ""}
                      type="password"
                      fullWidth
                      margin="dense"
                      disabled={!isEditing}
                      onChange={(e) => {
                        if (isEditing) {
                          medium.apiKey = e.target.value;
                          setForceUpdate((p) => p + 1);
                        }
                      }}
                    />
                  </Grid>

                  {/* ACTION BUTTONS */}
                  <Grid
                    item
                    xs={1}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconButton
                      aria-label={isEditing ? "Save" : "Edit"}
                      color={isEditing ? "default" : "primary"}
                      onClick={async () => {
                        if (isEditing) {
                          await updateMedium.mutateAsync({
                            url: `${PUT.UPDATE_MEDIUM}/${medium._id}`,
                            payload: {
                              productId: "6870c9e335f4e90221de9ed1",
                              medium: medium.medium,
                              fromAddress: medium.fromAddress,
                              serviceName: medium.serviceName,
                              apiKey: medium.apiKey,
                              enabled: medium.enabled,
                            },
                          });

                          setEditingMediumId(null);
                        } else {
                          setEditingMediumId(mediumId);
                        }
                      }}
                    >
                      {isEditing ? <SaveIcon /> : <EditIcon />}
                    </IconButton>

                    <IconButton
                      aria-label="Delete"
                      color="error"
                      onClick={() => {
                        deleteMedium.mutate({
                          url: `/notification-setting/medium/delete/${medium._id}`,
                        });
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>

                  {/* ENABLED SWITCH */}
                  <Grid
                    item
                    xs={12}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mt: 1,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={medium.enabled}
                          disabled={!isEditing}
                          onChange={(e) => {
                            if (isEditing) {
                              medium.enabled = e.target.checked;
                              setForceUpdate((p) => p + 1);
                            }
                          }}
                        />
                      }
                      label="Enabled"
                    />
                  </Grid>
                </Grid>
              );
            })}
          </Box>
        );
      })()}

      {/* ----------------------------------  
            ADD MEDIUM (UNCHANGED)
      ---------------------------------- */}
      {(() => {
        const usedMediums = mediumFields.map((f: any) => f.medium);
        const availableMediums = ["email", "sms", "whatsapp", "inapp"].filter(
          (m) => !usedMediums.includes(m)
        );

        if (availableMediums.length === 0) return null;

        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            {!showMediumDropdown ? (
              <Button
                variant="outlined"
                startIcon={<span>+</span>}
                onClick={() => setShowMediumDropdown(true)}
                sx={{ minWidth: 200 }}
                disabled={!shouldAllowMediumAdd}
              >
                Add Medium
              </Button>
            ) : (
              <FormControl sx={{ minWidth: 200 }} size="small">
                <InputLabel id="add-medium-label">Add Medium</InputLabel>
                <Select
                  labelId="add-medium-label"
                  value={""}
                  label="Add Medium"
                  onChange={(e) => {
                    const medium = e.target.value;
                    if (!medium) return;

                    appendMedium({
                      medium,
                      fromAddress: "",
                      serviceName: "",
                      apiKey: "",
                      enabled: true,
                    });

                    setShowMediumDropdown(false);
                  }}
                >
                  <MenuItem value="" disabled>
                    Select medium to add
                  </MenuItem>
                  {availableMediums.map((medium) => (
                    <MenuItem key={medium} value={medium}>
                      {medium}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        );
      })()}
    </Grid>
  );
})()}



                    {(mediumFields || []).map((field: any, idx) => (
                      <Grid
                        container
                        spacing={2}
                        key={field.id}
                        sx={{
                          m: 2,
                          width: "100%",
                          border: "1px solid #eee",
                          borderRadius: STYLE_GUIDE.SPACING.s1,
                          p: 2,
                        }}
                      >
                        <Grid item xs={2}>
                          <Controller
                            name={`mediumSettings.${idx}.medium`}
                            control={control}
                            rules={{ required: "Medium is required" }}
                            render={({ field }) => (
                              <FormControl fullWidth margin="dense">
                                <InputLabel>Medium</InputLabel>
                                <Select {...field} label="Medium" disabled>
                                  {["email", "sms", "whatsapp", "inapp"].map(
                                    (medium) => (
                                      <MenuItem key={medium} value={medium}>
                                        {medium}
                                      </MenuItem>
                                    )
                                  )}
                                </Select>
                              </FormControl>
                            )}
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <Controller
                            name={`mediumSettings.${idx}.fromAddress`}
                            control={control}
                            rules={{ required: "From Address is required" }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="From Address"
                                fullWidth
                                margin="dense"
                                error={
                                  !!errors.mediumSettings &&
                                  (errors.mediumSettings as any)[idx]
                                    ?.fromAddress
                                }
                                helperText={
                                  (errors.mediumSettings &&
                                    (errors.mediumSettings as any)[idx]
                                      ?.fromAddress?.message) ||
                                  ""
                                }
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <Controller
                            name={`mediumSettings.${idx}.serviceName`}
                            control={control}
                            rules={{ required: "Service Name is required" }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Service Name"
                                fullWidth
                                margin="dense"
                                error={
                                  !!errors.mediumSettings &&
                                  (errors.mediumSettings as any)[idx]
                                    ?.serviceName
                                }
                                helperText={
                                  (errors.mediumSettings &&
                                    (errors.mediumSettings as any)[idx]
                                      ?.serviceName?.message) ||
                                  ""
                                }
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <Controller
                            name={`mediumSettings.${idx}.apiKey`}
                            control={control}
                            rules={{ required: "API Key is required" }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="API Key"
                                type="password"
                                fullWidth
                                margin="dense"
                                error={
                                  !!errors.mediumSettings &&
                                  (errors.mediumSettings as any)[idx]?.apiKey
                                }
                                helperText={
                                  (errors.mediumSettings &&
                                    (errors.mediumSettings as any)[idx]?.apiKey
                                      ?.message) ||
                                  ""
                                }
                              />
                            )}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={1}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <IconButton
                            aria-label="Remove"
                            color="error"
                            onClick={() => removeMedium(idx)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mt: 1,
                          }}
                        >
                          <Controller
                            name={`mediumSettings.${idx}.enabled`}
                            control={control}
                            render={({ field: { value, onChange } }) => (
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={value}
                                    onChange={onChange}
                                    color="primary"
                                  />
                                }
                                label="Enabled"
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    ))}

                    <Grid item xs={12}>
                      <Controller
                        name="status"
                        control={control}
                        defaultValue={
                          selectedOrg.status === "active"
                            ? "active"
                            : "inactive"
                        }
                        render={({ field: { value, onChange } }) => (
                          <FormControlLabel
                            control={
                              <Switch
                                checked={value === "active"}
                                onChange={(_, checked) =>
                                  onChange(checked ? "active" : "inactive")
                                }
                                color="primary"
                              />
                            }
                            label={value === "active" ? "Active" : "Inactive"}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </form>
              )}
            </DialogContent>
          </DialogContainer>

          <DialogContainer
            open={deleteOpen}
            onClose={handleDeleteClose}
            title={"Delete Organization"}
            maxWidth="sm"
            actions={
              <>
                <PrimaryButton
                  onClick={handleDeleteConfirm}
                  color="error"
                  variant="contained"
                  disabled={deleteOrg.isPending}
                >
                  {deleteOrg.isPending ? "Deleting..." : "Delete"}
                </PrimaryButton>
              </>
            }
          >
            <Typography>
              Are you sure you want to delete this organization?
            </Typography>
          </DialogContainer>

          <DialogContainer
            open={createOpen}
            onClose={handleCreateClose}
            maxWidth="md"
            title="Create Organization"
            actions={
              <>
                <PrimaryButton
                  type="submit"
                  variant="contained"
                  onClick={handleSubmit(handleCreateSubmit)}
                  disabled={!isValid || createLoading}
                >
                  {createLoading ? "Creating..." : "Create"}
                </PrimaryButton>
              </>
            }
          >
            <form
              onSubmit={handleSubmit(handleCreateSubmit)}
              style={{ marginTop: 8 }}
              noValidate
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: "Name is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Name"
                        fullWidth
                        margin="normal"
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="description"
                    control={control}
                    rules={{ required: "Description is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Description"
                        fullWidth
                        margin="normal"
                        error={!!errors.description}
                        helperText={errors.description?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="domain"
                    control={control}
                    rules={{ required: "Domain is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Domain"
                        fullWidth
                        margin="normal"
                        error={!!errors.domain}
                        helperText={errors.domain?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="code"
                    control={control}
                    rules={{ required: "Code is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Code"
                        fullWidth
                        margin="normal"
                        error={!!errors.code}
                        helperText={errors.code?.message}
                      />
                    )}
                  />
                </Grid>
                {shouldAllowProductListing && (
                  <Grid item xs={12}>
                    <Controller
                      name="productIds"
                      control={control}
                      rules={{ required: "At least one product is required" }}
                      render={({ field }) => (
                        <Autocomplete
                          multiple
                          options={productOptions}
                          getOptionLabel={(option) => option.name}
                          value={productOptions.filter((option) =>
                            field.value?.includes(option._id)
                          )}
                          onChange={(_, newValue) => {
                            field.onChange(
                              newValue.map((option) => option._id)
                            );
                          }}
                          isOptionEqualToValue={(option, value) =>
                            option._id === value._id
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Products"
                              margin="normal"
                              error={!!errors.productIds}
                              helperText={errors.productIds?.message}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>
                )}
                {(fields || []).map((field, idx) => (
                  <Grid
                    container
                    spacing={2}
                    alignItems="flex-end"
                    key={field.id}
                    sx={{
                      m: 2,
                      width: "100%",
                      border: "1px solid #eee",
                      borderRadius: STYLE_GUIDE.SPACING.s1,
                    }}
                  >
                    <Grid item xs={3}>
                      <Controller
                        name={`productSubscriptions.${idx}.productId`}
                        control={control}
                        rules={{ required: "Product is required" }}
                        render={({ field }) => (
                          <FormControl fullWidth margin="dense">
                            <InputLabel>Product</InputLabel>
                            <Select {...field} label="Product" disabled>
                              {productOptions.map((product) => (
                                <MenuItem key={product._id} value={product._id}>
                                  {product.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Controller
                        name={`productSubscriptions.${idx}.totalLicenses`}
                        control={control}
                        rules={{
                          required: "Total Licenses is required",
                          min: { value: 1, message: "Must be at least 1" },
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Total Licenses"
                            type="number"
                            fullWidth
                            margin="dense"
                            error={
                              !!errors.productSubscriptions &&
                              (errors.productSubscriptions as any)[idx]
                                ?.totalLicenses
                            }
                            helperText={
                              (errors.productSubscriptions &&
                                (errors.productSubscriptions as any)[idx]
                                  ?.totalLicenses?.message) ||
                              ""
                            }
                            inputProps={{ min: 1 }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Controller
                        name={`productSubscriptions.${idx}.licenseExpiresAt`}
                        control={control}
                        rules={{
                          required: "License Expiry Date is required",
                        }}
                        render={({ field }) => (
                          <CommonDatePicker
                            {...field}
                            control={control}
                            label="License Expiry Date"
                            views={["year", "month", "day"]}
                            sx={{ marginTop: 1 }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                ))}

                {(() => {
                  const hasNotivixProduct = fields.some((field: any) => {
                    const product = productOptions.find(
                      (p) => p._id === field.productId
                    );
                    return product && product.name?.toLowerCase() === "notivix";
                  });

                  if (!hasNotivixProduct) return null;

                  return (
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                        Medium Settings for Notivix
                      </Typography>
                      {(() => {
                        const usedMediums = mediumFields.map(
                          (f: any) => f.medium
                        );
                        const availableMediums = [
                          "email",
                          "sms",
                          "whatsapp",
                          "inapp",
                        ].filter((m) => !usedMediums.includes(m));
                        if (availableMediums.length === 0) return null;
                        return (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              mb: 2,
                            }}
                          >
                            {!showMediumDropdown ? (
                              <Button
                                variant="outlined"
                                startIcon={<span>+</span>}
                                onClick={() => setShowMediumDropdown(true)}
                                sx={{ minWidth: 200 }}
                              >
                                Add Medium
                              </Button>
                            ) : (
                              <FormControl sx={{ minWidth: 200 }} size="small">
                                <InputLabel id="add-medium-label">
                                  Add Medium
                                </InputLabel>
                                <Select
                                  labelId="add-medium-label"
                                  value={""}
                                  label="Add Medium"
                                  onChange={(e) => {
                                    const medium = e.target.value;
                                    if (!medium) return;
                                    appendMedium({
                                      medium,
                                      fromAddress: "",
                                      serviceName: "",
                                      apiKey: "",
                                      enabled: true,
                                    });
                                    setShowMediumDropdown(false);
                                  }}
                                >
                                  <MenuItem value="" disabled>
                                    Select medium to add
                                  </MenuItem>
                                  {availableMediums.map((medium) => (
                                    <MenuItem key={medium} value={medium}>
                                      {medium}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            )}
                          </Box>
                        );
                      })()}
                    </Grid>
                  );
                })()}

                {(mediumFields || []).map((field: any, idx) => (
                  <Grid
                    container
                    spacing={2}
                    key={field.id}
                    sx={{
                      m: 2,
                      width: "100%",
                      border: "1px solid #eee",
                      borderRadius: STYLE_GUIDE.SPACING.s1,
                      p: 2,
                    }}
                  >
                    <Grid item xs={2}>
                      <Controller
                        name={`mediumSettings.${idx}.medium`}
                        control={control}
                        rules={{ required: "Medium is required" }}
                        render={({ field }) => (
                          <FormControl fullWidth margin="dense">
                            <InputLabel>Medium</InputLabel>
                            <Select {...field} label="Medium" disabled>
                              {["email", "sms", "whatsapp", "inapp"].map(
                                (medium) => (
                                  <MenuItem key={medium} value={medium}>
                                    {medium}
                                  </MenuItem>
                                )
                              )}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Controller
                        name={`mediumSettings.${idx}.fromAddress`}
                        control={control}
                        rules={{ required: "From Address is required" }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="From Address"
                            fullWidth
                            margin="dense"
                            error={
                              !!errors.mediumSettings &&
                              (errors.mediumSettings as any)[idx]?.fromAddress
                            }
                            helperText={
                              (errors.mediumSettings &&
                                (errors.mediumSettings as any)[idx]?.fromAddress
                                  ?.message) ||
                              ""
                            }
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Controller
                        name={`mediumSettings.${idx}.serviceName`}
                        control={control}
                        rules={{ required: "Service Name is required" }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Service Name"
                            fullWidth
                            margin="dense"
                            error={
                              !!errors.mediumSettings &&
                              (errors.mediumSettings as any)[idx]?.serviceName
                            }
                            helperText={
                              (errors.mediumSettings &&
                                (errors.mediumSettings as any)[idx]?.serviceName
                                  ?.message) ||
                              ""
                            }
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Controller
                        name={`mediumSettings.${idx}.apiKey`}
                        control={control}
                        rules={{ required: "API Key is required" }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="API Key"
                            type="password"
                            fullWidth
                            margin="dense"
                            error={
                              !!errors.mediumSettings &&
                              (errors.mediumSettings as any)[idx]?.apiKey
                            }
                            helperText={
                              (errors.mediumSettings &&
                                (errors.mediumSettings as any)[idx]?.apiKey
                                  ?.message) ||
                              ""
                            }
                          />
                        )}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={1}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconButton
                        aria-label="Remove"
                        color="error"
                        onClick={() => removeMedium(idx)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                    {/* Second row for Enabled toggle */}
                    <Grid
                      item
                      xs={12}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mt: 1,
                      }}
                    >
                      <Controller
                        name={`mediumSettings.${idx}.enabled`}
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <FormControlLabel
                            control={
                              <Switch
                                checked={value}
                                onChange={onChange}
                                color="primary"
                              />
                            }
                            label="Enabled"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            </form>
          </DialogContainer>

          {/* Product Access Modal */}
          <DialogContainer
            open={productAccessOpen}
            onClose={handleProductAccessClose}
            maxWidth="sm"
            fullWidth
            title="Product Access"
            actions={<Button onClick={handleProductAccessClose}>Close</Button>}
          >
            {productAccessLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 100,
                }}
              >
                <CircularProgress />
              </Box>
            ) : productAccessError ? (
              <DialogContentText color="error.main">
                {typeof productAccessError === "string"
                  ? productAccessError
                  : "Failed to fetch product access"}
              </DialogContentText>
            ) : !productAccessData?.data?.length ? (
              <DialogContentText>No product access found.</DialogContentText>
            ) : (
              <Box>
                {(productAccessData?.data || []).map((item: any) => (
                  <Box
                    key={item._id}
                    sx={{
                      mb: 2,
                      p: 2,
                      border: "1px solid #eee",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="subtitle2">
                      {item.productId?.name || "-"}
                    </Typography>
                    <Typography variant="body2">
                      Total Licenses: {item.totalLicenses}
                    </Typography>
                    <Typography variant="body2">
                      License Expires At:{" "}
                      {item.licenseExpiresAt
                        ? formatDateWithoutTime(item.licenseExpiresAt)
                        : "-"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </DialogContainer>
        </>
      )}
    </Box>
  );
}
