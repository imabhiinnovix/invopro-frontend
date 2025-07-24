import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { GET, POST, PUT } from "../../../services/apiRoutes";
import usePost from "../../../hooks/usePost";
import usePut from "../../../hooks/usePut";
import useGet from "../../../hooks/useGet";
import { STYLE_GUIDE } from "../../../styles";
import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";
import axiosInstance from "../../../services/axiosInstance";
import { debounce } from "lodash";
import { useComponentTypography } from "../../../hooks/useComponentTypography";

interface Attribute {
  _id: string;
  name: string;
  mappingName?: string;
  type?: string;
}

interface EntityFieldOption {
  label: string;
  value: {
    attributeId: string;
    refAttributeId?: string | null;
  };
}

interface Entity {
  _id: string;
  name: string;
  attributes: Attribute[];
  entityFieldOptions?: EntityFieldOption[];
}

interface FieldSetting {
  attributeId: string;
  value: string;
  filter: boolean;
  sorting: boolean;
  visible: boolean;
}

interface DataSourceRequestPayload {
  name: string;
  code: string;
  description?: string;
  versionType: string;
  isShowMenu?: boolean; // Made optional to allow undefined
  entityId: string;
  entityAttributes?: string[][];
  entityAttributeIds?: string[][];
  uniqueAttributeRules?: { _id: string; name: string }[][];
  fieldSettings?: FieldSetting[];
  _id?: string;
}

interface DataSourceResponse {
  success: boolean;
  message?: string;
}

interface CreateUpdateDataSourceProps {
  setReload: React.Dispatch<React.SetStateAction<boolean>>;
  CustomButton: React.ReactElement;
  title: string;
  data?: DataSourceRequestPayload & { entityId: Entity | string };
}

const CreateUpdateDataSource: React.FC<CreateUpdateDataSourceProps> = ({
  setReload,
  CustomButton,
  title,
  data,
}) => {
  const theme = useUnifiedTheme();
  const { getDialogTitleSx } = useComponentTypography();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(data?.code ?? "");
  const [name, setName] = useState(data?.name ?? "");
  const [entityAttributes, setEntityAttributes] = useState<Attribute[]>([]);
  const [entityFieldOptions, setEntityFieldOptions] = useState<
    EntityFieldOption[]
  >([]);
  const [entityName, setEntityName] = useState<string>(
    typeof data?.entityId === "string" ? "" : data?.entityId?.name || ""
  );
  const [isLoadingEntity, setIsLoadingEntity] = useState(false);
  const [isLoadingEntities, setIsLoadingEntities] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);

  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DataSourceRequestPayload>({
    defaultValues: {
      name: data?.name ?? "",
      code: data?.code ?? "",
      description: data?.description ?? "",
      versionType: data?.versionType ?? "",
      isShowMenu: data?.isShowMenu, // Undefined in create mode, use data.isShowMenu in update mode
      entityId:
        typeof data?.entityId === "string"
          ? data.entityId
          : (data?.entityId?._id ?? ""),
      entityAttributes: data?.uniqueAttributeRules?.length
        ? data.uniqueAttributeRules.map((rule) => rule.map((attr) => attr.name))
        : [[""]],
      entityAttributeIds: data?.uniqueAttributeRules?.length
        ? data.uniqueAttributeRules.map((rule) => rule.map((attr) => attr._id))
        : [[""]],
      fieldSettings: data?.fieldSettings?.length
        ? data.fieldSettings.map((setting) => ({
            attributeId: setting.attributeId,
            value: setting.label || setting.value || "",
            filter: setting.isFilterEnable || setting.filter || false,
            sorting: setting.isSortingEnable || setting.sorting || false,
            visible: setting.isDisplayEnable || setting.visible || false,
          }))
        : [
            {
              attributeId: "",
              value: "",
              filter: false,
              sorting: false,
              visible: false,
            },
          ],
    },
  });

  const {
    fields: attributeFields,
    append: appendAttribute,
    remove: removeAttribute,
    replace: replaceAttributes,
  } = useFieldArray({
    control,
    name: "entityAttributes",
  });

  const {
    fields: settingFields,
    append: appendSetting,
    remove: removeSetting,
    replace: replaceSettings,
  } = useFieldArray({
    control,
    name: "fieldSettings",
  });

  const entityId = watch("entityId");

  // Fetch entities for dropdown
  useEffect(() => {
    if (!open) {
      setEntities([]);
      return;
    }
    setIsLoadingEntities(true);
    setError(null);

    axiosInstance
      .get(GET.Entity_List)
      .then((response) => {
        const data = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setEntities(data);
        if (!data.length) {
          setError("No entities available. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error fetching entities:", error);
        setError(
          error.response?.data?.message ||
            "Failed to fetch entities. Please try again."
        );
      })
      .finally(() => {
        setIsLoadingEntities(false);
      });
  }, [open]);

  // Fetch entity details
  const entityDetails = useGet<{
    success: boolean;
    data: {
      _id: string;
      name: string;
      attributes: Attribute[];
      entityFieldOptions?: EntityFieldOption[];
    };
    message?: string;
  }>(
    [`entityDetails`, entityId],
    `${GET.Get_Entity_By_Id}/${entityId}`,
    !!(open && entityId)
  );

  // Handle entity details response and derive entityFieldOptions
  useEffect(() => {
    if (!open || !entityId) {
      setEntityAttributes([]);
      setEntityFieldOptions([]);
      if (!data?.entityId) {
        setEntityName("");
      }
      return;
    }

    if (entityDetails.isSuccess && entityDetails.data?.data) {
      const entityData = entityDetails.data.data;
      setEntityName(entityData.name || "");
      setEntityAttributes(
        Array.isArray(entityData.attributes) ? entityData.attributes : []
      );

      // Derive entityFieldOptions from attributes if not provided
      const derivedFieldOptions =
        entityData.attributes?.map((attr) => ({
          label: attr.name || attr.mappingName || "",
          value: {
            attributeId: attr._id,
            refAttributeId: attr.referenceEntitySetting?.refEntityField || null,
          },
        })) || [];

      setEntityFieldOptions(
        Array.isArray(entityData.entityFieldOptions) &&
          entityData.entityFieldOptions.length > 0
          ? entityData.entityFieldOptions
          : derivedFieldOptions
      );

      // Reset fields only if entityId has changed
      if (
        !data?.entityId ||
        (typeof data.entityId === "string"
          ? data.entityId !== entityId
          : data.entityId._id !== entityId)
      ) {
        replaceAttributes([[""]]);
        replaceSettings([
          {
            attributeId: "",
            value: "",
            filter: false,
            sorting: false,
            visible: false,
          },
        ]);
      }
    }

    if (entityDetails.isError) {
      console.error("Error fetching entity details:", entityDetails.error);
      setError(
        entityDetails.error?.response?.data?.message ||
          "Failed to fetch entity details. Please try again."
      );
    }
  }, [
    open,
    entityId,
    entityDetails.isSuccess,
    entityDetails.isError,
    entityDetails.data,
    entityDetails.error,
    replaceAttributes,
    replaceSettings,
    data?.entityId,
  ]);

  // Prefill form when dialog opens
  useEffect(() => {
    if (open && data) {
      reset({
        name: data.name ?? "",
        code: data.code ?? "",
        description: data.description ?? "",
        versionType: data.versionType ?? "",
        isShowMenu: data.isShowMenu, // Prefill with data.isShowMenu (undefined in create mode)
        entityId:
          typeof data.entityId === "string"
            ? data.entityId
            : (data?.entityId?._id ?? ""),
        entityAttributes: data.uniqueAttributeRules?.length
          ? data.uniqueAttributeRules.map((rule) =>
              rule.map((attr) => attr.name)
            )
          : [[""]],
        entityAttributeIds: data.uniqueAttributeRules?.length
          ? data.uniqueAttributeRules.map((rule) =>
              rule.map((attr) => attr._id)
            )
          : [[""]],
        fieldSettings: data.fieldSettings?.length
          ? data.fieldSettings.map((setting) => ({
              attributeId: setting.attributeId,
              value: setting.label || setting.value || "",
              filter: setting.isFilterEnable || setting.filter || false,
              sorting: setting.isSortingEnable || setting.sorting || false,
              visible: setting.isDisplayEnable || setting.visible || false,
            }))
          : [
              {
                attributeId: "",
                value: "",
                filter: false,
                sorting: false,
                visible: false,
              },
            ],
      });

      setCode(data.code ?? "");
      setName(data.name ?? "");
      setEntityName(
        typeof data.entityId === "string" ? "" : data.entityId?.name || ""
      );

      if (data.entityId && typeof data.entityId !== "string") {
        setEntityAttributes(data.entityId.attributes || []);
        const derivedFieldOptions =
          data.entityId.attributes?.map((attr) => ({
            label: attr.name || attr.mappingName || "",
            value: {
              attributeId: attr._id,
              refAttributeId:
                attr.referenceEntitySetting?.refEntityField || null,
            },
          })) || [];
        setEntityFieldOptions(
          data.entityId.entityFieldOptions?.length
            ? data.entityId.entityFieldOptions
            : derivedFieldOptions
        );
      }
    }
  }, [open, data, reset]);

  const debouncedSetCode = debounce((value: string) => {
    setCode(value);
  }, 500);

  const debouncedSetName = debounce((value: string) => {
    setName(value);
  }, 500);

  const codeAvailability = useGet<{
    success: boolean;
    available: boolean;
    message: string;
  }>(
    [`codeAvailability`, code],
    `${GET?.Data_Source_Code}/${code}`,
    !!code && /^[a-zA-Z0-9_]+$/.test(code) && !data?.code
  );

  const nameAvailability = useGet<{
    success: boolean;
    available: boolean;
    message: string;
  }>(
    [`nameAvailability`, name],
    `${GET?.Data_Source_Name}/${name}`,
    !!name && !data?.name
  );

  const createDataSource = usePost<
    DataSourceRequestPayload,
    DataSourceResponse
  >(
    ["createDataSource"],
    (response) => {
      if (response?.success) {
        setCode("");
        setName("");
        setReload(true);
        setOpen(false);
        reset();
      } else {
        setError(response?.message || "Failed to create data source.");
      }
    },
    true
  );

  const updateDataSource = usePut<DataSourceRequestPayload, DataSourceResponse>(
    ["updateDataSource"],
    (response) => {
      if (response?.success) {
        setCode("");
        setName("");
        setReload(true);
        setOpen(false);
        reset();
      } else {
        setError(response?.message || "Failed to update data source.");
      }
    },
    true
  );

  const onSubmit = (formData: DataSourceRequestPayload) => {
    const attributeSets =
      formData.entityAttributes?.map((attributes) => {
        const attrNames = attributes
          .filter((attr) => attr !== "" && attr !== null && attr !== undefined)
          .map((attr) => {
            if (typeof attr === "object" && attr !== null && "name" in attr) {
              return attr.name;
            }
            return typeof attr === "string" ? attr : "";
          })
          .filter((name) => name !== "")
          .sort();
        return attrNames.join(",");
      }) || [];

    const uniqueAttributeSets = new Set(
      attributeSets.filter((set) => set !== "")
    );
    if (
      attributeSets.filter((set) => set !== "").length !==
      uniqueAttributeSets.size
    ) {
      setValidationError(
        "Duplicate unique attribute combinations detected in Unique Attributes."
      );
      return;
    }

    const selectedAttributes =
      formData.fieldSettings?.map((setting) => setting.attributeId) || [];
    const uniqueSelectedAttributes = new Set(selectedAttributes);
    if (selectedAttributes.length !== uniqueSelectedAttributes.size) {
      setValidationError(
        "Duplicate attributes selected in Field Settings. Each attribute must be unique."
      );
      return;
    }

    const hasInvalidSettings = formData.fieldSettings?.some(
      (setting) => !setting.attributeId || !setting.value
    );
    if (hasInvalidSettings) {
      setValidationError(
        "All Field Settings must have a selected attribute and a value."
      );
      return;
    }

    const updatedEntityAttributeIds =
      formData.entityAttributes?.map((attributes) => {
        if (!Array.isArray(attributes)) {
          console.error("Invalid attributes format:", attributes);
          return [];
        }

        return attributes
          .filter(
            (attribute) =>
              attribute !== "" && attribute !== null && attribute !== undefined
          )
          .map((attribute) => {
            if (
              typeof attribute === "object" &&
              attribute !== null &&
              "_id" in attribute
            ) {
              return attribute._id;
            }
            if (typeof attribute === "string") {
              const attr = entityAttributes.find((a) => a.name === attribute);
              return attr?._id || "";
            }
            return "";
          })
          .filter((id) => id !== "" && typeof id === "string");
      }) || [];

   const updatedUniqueAttributeRules =
  (formData.entityAttributes || []).map((attributes) => {
    if (!Array.isArray(attributes)) {
      return [];
    }

    return attributes
      .filter(
        (attribute) =>
          attribute !== "" && attribute !== null && attribute !== undefined
      )
      .map((attribute) => {
        if (typeof attribute === "object" && attribute !== null && "_id" in attribute) {
          return attribute._id;
        }
        if (typeof attribute === "string") {
          const attr = entityAttributes.find((a) => a.name === attribute);
          return attr?._id || "";
        }
        return "";
      })
      .filter((id) => typeof id === "string" && id !== "");
  });


    const updatedFieldSettings =
      formData.fieldSettings?.map((setting) => {
        const option = entityFieldOptions.find(
          (opt) =>
            opt.value.attributeId === setting.attributeId ||
            opt.value.refAttributeId === setting.attributeId
        );

        return {
          attributeId: option?.value.attributeId || setting.attributeId,
          refAttributeId: option?.value.refAttributeId || null,
          label: setting.value,
          isFilterEnable: !!setting.filter,
          isSortingEnable: !!setting.sorting,
          isDisplayEnable: !!setting.visible,
        };
      }) || [];

    const updatedFormData = {
      ...formData,
      entityAttributeIds: updatedEntityAttributeIds,
      uniqueAttributeRules: updatedUniqueAttributeRules,
      fieldSettings: updatedFieldSettings,
      isShowMenu: formData.isShowMenu === "true" ? true : false, // Default to false if undefined
    };

    if (data && data._id) {
      updateDataSource.mutate({
        url: `${PUT.UPDATE_DATA_SOURCE}/${data._id}`,
        payload: updatedFormData,
      });
    } else {
      createDataSource.mutate({
        url: POST.CREATE_DATA_SOURCE,
        payload: updatedFormData,
      });
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setCode("");
    setName("");
    setEntityAttributes([]);
    setEntityFieldOptions([]);
    setEntityName("");
    setError(null);
    setValidationError(null);
    reset();
  };

  const handleAddMoreAttribute = () => {
    appendAttribute([""]);
  };

  const handleAddMoreSetting = () => {
    appendSetting({
      attributeId: "",
      value: "",
      filter: false,
      sorting: false,
      visible: false,
    });
  };

  return (
    <>
      <Box onClick={() => setOpen(true)}>{CustomButton}</Box>

      <Dialog
        fullWidth
        maxWidth="lg"
        open={open}
        onClose={handleCancel}
        PaperProps={{
          sx: {
            backgroundColor:
              theme.palette.dialog?.background || STYLE_GUIDE.COLORS.white,
            border: `1px solid ${theme.palette.dialog?.border || theme.palette.border?.main || STYLE_GUIDE.COLORS.borderGray}`,
            borderRadius: theme.palette.dialog?.borderRadius || "8px",
            boxShadow: theme.palette.dialog?.shadow || STYLE_GUIDE.SHADOWS.lg,
          },
        }}
      >
        <DialogTitle
          sx={{
            ...getDialogTitleSx(),
            color:
              theme.palette.dialog?.titleColor ||
              STYLE_GUIDE.COLORS.textDarkGray,
          }}
        >
          {title}
        </DialogTitle>
        <DialogContent
          sx={{
            color:
              theme.palette.dialog?.contentColor ||
              STYLE_GUIDE.COLORS.textDarkGray,
            fontSize: theme.palette.dialog?.contentFontSize || "1rem",
            borderTop: `1px solid ${theme.palette.divider}`,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={3}>
              {entityName && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Selected Entity: <strong>{entityName}</strong>
                </Typography>
              )}
              {(isLoadingEntity || isLoadingEntities) && (
                <CircularProgress sx={{ alignSelf: "center" }} />
              )}
              <TextField
                label="Data Source Name*"
                fullWidth
                {...register("name", {
                  required: "Data source name is required",
                })}
                onChange={(event) => {
                  debouncedSetName(event.target.value);
                  setValue("name", event.target.value);
                }}
                onBlur={(event) => {
                  const sanitizedCode = event.target.value
                    .toLowerCase()
                    .replace(/[^a-zA-Z0-9_]/g, "");
                  debouncedSetCode(sanitizedCode);
                  setValue("code", sanitizedCode);
                }}
                error={!!errors.name}
                helperText={
                  errors.name?.message ||
                  (nameAvailability.isFetched &&
                  name.length > 0 &&
                  !data?.name ? (
                    nameAvailability.data?.available ? (
                      <Typography
                        sx={{ color: STYLE_GUIDE.COLORS.bootstrapSuccess }}
                      >
                        Name is available
                      </Typography>
                    ) : (
                      <Typography
                        sx={{ color: STYLE_GUIDE.COLORS.bootstrapDanger }}
                      >
                        {nameAvailability.data?.message ||
                          "Name is not available"}
                      </Typography>
                    )
                  ) : (
                    ""
                  ))
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: STYLE_GUIDE.SPACING.s2,
                    fontSize: "14px",
                    backgroundColor:
                      theme.dashboardTheme?.colors?.background?.paper ||
                      "#ffffff",
                    "& fieldset": {
                      borderColor:
                        theme.dashboardTheme?.colors?.inputBorder ||
                        STYLE_GUIDE.COLORS.darkBackground,
                    },
                    "&:hover fieldset": {
                      borderColor:
                        theme.dashboardTheme?.colors?.borderHover ||
                        STYLE_GUIDE.COLORS.darkBorderHover,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor:
                        theme.dashboardTheme?.components?.input
                          ?.focusBorderColor ||
                        theme.dashboardTheme?.components?.input
                          ?.focusBorderColorFallback ||
                        STYLE_GUIDE.COLORS.inputFocusFallback,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color:
                      theme.dashboardTheme?.colors?.text?.secondary ||
                      STYLE_GUIDE.COLORS.darkBorderFocus,
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color:
                      theme.dashboardTheme?.components?.input
                        ?.focusBorderColor ||
                      theme.dashboardTheme?.components?.input
                        ?.focusBorderColorFallback ||
                      STYLE_GUIDE.COLORS.inputFocusFallback,
                  },
                }}
              />

              <TextField
                label="Data Source Description"
                fullWidth
                multiline
                rows={4}
                {...register("description")}
                error={!!errors.description}
                helperText={errors.description?.message}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: STYLE_GUIDE.SPACING.s2,
                    fontSize: "14px",
                    backgroundColor:
                      theme.dashboardTheme?.colors?.background?.paper ||
                      "#ffffff",
                    "& fieldset": {
                      borderColor:
                        theme.dashboardTheme?.colors?.inputBorder ||
                        STYLE_GUIDE.COLORS.darkBackground,
                    },
                    "&:hover fieldset": {
                      borderColor:
                        theme.dashboardTheme?.colors?.borderHover ||
                        STYLE_GUIDE.COLORS.darkBorderHover,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor:
                        theme.dashboardTheme?.components?.input
                          ?.focusBorderColor ||
                        theme.dashboardTheme?.components?.input
                          ?.focusBorderColorFallback ||
                        STYLE_GUIDE.COLORS.inputFocusFallback,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color:
                      theme.dashboardTheme?.colors?.text?.secondary ||
                      STYLE_GUIDE.COLORS.darkBorderFocus,
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color:
                      theme.dashboardTheme?.components?.input
                        ?.focusBorderColor ||
                      theme.dashboardTheme?.components?.input
                        ?.focusBorderColorFallback ||
                      STYLE_GUIDE.COLORS.inputFocusFallback,
                  },
                }}
              />

              <Autocomplete
                options={entities}
                getOptionLabel={(option) => option.name || ""}
                value={
                  Array.isArray(entities)
                    ? entities.find((e) => e._id === entityId) || null
                    : null
                }
                onChange={(event, newValue) => {
                  setValue("entityId", newValue?._id || "");
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Entity*"
                    error={!!errors.entityId}
                    helperText={errors.entityId?.message}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isLoadingEntities ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                loading={isLoadingEntities}
              />

              {attributeFields.map((field, index) => (
                <Box key={field.id} sx={{ mb: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" mb={1}>
                        Unique {index + 1} Attributes
                      </Typography>

                      <Autocomplete
                        multiple
                        options={entityAttributes}
                        getOptionLabel={(option) => option.name || ""}
                        isOptionEqualToValue={(option, value) =>
                          option._id === value._id
                        }
                        value={
                          Array.isArray(watch(`entityAttributes.${index}`))
                            ? watch(`entityAttributes.${index}`)
                                .map((name) =>
                                  entityAttributes.find(
                                    (attr) => attr.name === name
                                  )
                                )
                                .filter(
                                  (attr): attr is Attribute =>
                                    attr !== undefined
                                )
                            : []
                        }
                        onChange={(event, newValue) => {
                          setValue(
                            `entityAttributes.${index}`,
                            newValue.map((attr) => attr.name),
                            { shouldValidate: true }
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={`Select Unique Attribute ${index + 1}*`}
                            error={!!errors.entityAttributes?.[index]}
                            helperText={
                              errors.entityAttributes?.[index]?.message
                            }
                          />
                        )}
                        disabled={!entityId || isLoadingEntity}
                      />
                    </Box>
                    {attributeFields.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => removeAttribute(index)}
                      >
                        <RemoveCircleOutlineIcon />
                      </IconButton>
                    )}
                  </Stack>
                </Box>
              ))}

              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleAddMoreAttribute}
                sx={{ whiteSpace: "nowrap", mt: 2 }}
                disabled={!entityId || isLoadingEntity}
              >
                Add More Attributes
              </Button>

              <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
                Field Settings
              </Typography>

              {settingFields.map((field, index) => {
                const currentAttributeId = watch(
                  `fieldSettings.${index}.attributeId`
                );
                const selectedOption =
                  entityFieldOptions.find(
                    (opt) =>
                      opt.value.attributeId === currentAttributeId ||
                      opt.value.refAttributeId === currentAttributeId
                  ) || null;

                return (
                  <Box
                    key={field.id}
                    sx={{
                      mb: 3,
                      p: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={2} mb={2}>
                          <Autocomplete
                            options={entityFieldOptions}
                            getOptionLabel={(option) => option.label || ""}
                            isOptionEqualToValue={(option, value) => {
                              if (!option || !value) return false;
                              const optionId =
                                option.value?.attributeId ||
                                option.value?.refAttributeId;
                              const valueId =
                                value.value?.attributeId ||
                                value.value?.refAttributeId;
                              return optionId === valueId;
                            }}
                            value={selectedOption}
                            onChange={(event, newValue) => {
                              const attributeId =
                                newValue?.value?.attributeId ||
                                newValue?.value?.refAttributeId ||
                                "";
                              setValue(
                                `fieldSettings.${index}.attributeId`,
                                attributeId
                              );
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Field*"
                                error={
                                  !!errors.fieldSettings?.[index]?.attributeId
                                }
                                helperText={
                                  errors.fieldSettings?.[index]?.attributeId
                                    ?.message
                                }
                              />
                            )}
                            disabled={!entityId || isLoadingEntity}
                            sx={{ flex: 1 }}
                            clearOnBlur={false}
                            handleHomeEndKeys={true}
                          />

                          <TextField
                            label="Show Label*"
                            {...register(`fieldSettings.${index}.value`, {
                              required: "Show label is required",
                            })}
                            error={!!errors.fieldSettings?.[index]?.value}
                            helperText={
                              errors.fieldSettings?.[index]?.value?.message
                            }
                            sx={{ flex: 1 }}
                          />
                        </Stack>

                        <Stack direction="row" spacing={2}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...register(`fieldSettings.${index}.filter`)}
                                defaultChecked={field.filter}
                              />
                            }
                            label="Filter"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...register(`fieldSettings.${index}.sorting`)}
                                defaultChecked={field.sorting}
                              />
                            }
                            label="Sorting"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...register(`fieldSettings.${index}.visible`)}
                                defaultChecked={field.visible}
                              />
                            }
                            label="Visible"
                          />
                        </Stack>
                      </Box>

                      {settingFields.length > 1 && (
                        <IconButton
                          color="error"
                          onClick={() => removeSetting(index)}
                        >
                          <RemoveCircleOutlineIcon />
                        </IconButton>
                      )}
                    </Stack>
                  </Box>
                );
              })}

              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleAddMoreSetting}
                sx={{ whiteSpace: "nowrap", mt: 2 }}
                disabled={!entityId || isLoadingEntity}
              >
                Add Entity Setting
              </Button>

              <TextField
                label="Data Source Code(Unique Code)*"
                fullWidth
                {...register("code", {
                  required: "Data source code is required",
                  pattern: {
                    value: /^(?!.*(\$|\0|^system\.|\.system\.))[\w]+$/,
                    message:
                      'Data source code should not contain special characters, null characters, space or restricted prefixes (e.g., "system." or ".system.")',
                  },
                })}
                onChange={(event) => {
                  const sanitizedCode = event.target.value
                    .toLowerCase()
                    .replace(/[^a-zA-Z0-9_]/g, "");
                  debouncedSetCode(sanitizedCode);
                  setValue("code", sanitizedCode);
                }}
                error={!!errors.code}
                disabled={!!data?.code}
                helperText={
                  errors.code?.message ||
                  (codeAvailability.isFetched &&
                  code.length > 0 &&
                  !data?.code ? (
                    codeAvailability.data?.available ? (
                      <Typography
                        sx={{ color: STYLE_GUIDE.COLORS.bootstrapSuccess }}
                      >
                        Code is available
                      </Typography>
                    ) : (
                      <Typography
                        sx={{ color: STYLE_GUIDE.COLORS.bootstrapDanger }}
                      >
                        {codeAvailability.data?.message ||
                          "Code is not available"}
                      </Typography>
                    )
                  ) : (
                    ""
                  ))
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: STYLE_GUIDE.SPACING.s2,
                    fontSize: "14px",
                    backgroundColor:
                      theme.dashboardTheme?.colors?.background?.paper ||
                      "#ffffff",
                    "& fieldset": {
                      borderColor:
                        theme.dashboardTheme?.colors?.inputBorder ||
                        STYLE_GUIDE.COLORS.darkBackground,
                    },
                    "&:hover fieldset": {
                      borderColor:
                        theme.dashboardTheme?.colors?.borderHover ||
                        STYLE_GUIDE.COLORS.darkBorderHover,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor:
                        theme.dashboardTheme?.components?.input
                          ?.focusBorderColor ||
                        theme.dashboardTheme?.components?.input
                          ?.focusBorderColorFallback ||
                        STYLE_GUIDE.COLORS.inputFocusFallback,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color:
                      theme.dashboardTheme?.colors?.text?.secondary ||
                      STYLE_GUIDE.COLORS.darkBorderFocus,
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color:
                      theme.dashboardTheme?.components?.input
                        ?.focusBorderColor ||
                      theme.dashboardTheme?.components?.input
                        ?.focusBorderColorFallback ||
                      STYLE_GUIDE.COLORS.inputFocusFallback,
                  },
                }}
              />

              <FormControl fullWidth error={!!errors.versionType}>
                <InputLabel>Version Type</InputLabel>
                <Select
                  {...register("versionType", {
                    required: "Version type is required",
                  })}
                  value={watch("versionType") || ""}
                  onChange={(event) =>
                    setValue("versionType", event.target.value)
                  }
                  label="Version Type"
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="number">Number</MenuItem>
                </Select>
                {errors.versionType && (
                  <Typography color="error">
                    {errors.versionType.message}
                  </Typography>
                )}
              </FormControl>

              <FormControl fullWidth error={!!errors.isShowMenu}>
                <InputLabel>Show in Menu</InputLabel>
                <Select
                  {...register("isShowMenu", {
                    required: "Show in Menu is required",
                  })}
                  value={
                    watch("isShowMenu") === undefined
                      ? ""
                      : watch("isShowMenu")
                        ? "true"
                        : "false"
                  }
                  onChange={(event) =>
                    setValue("isShowMenu", event.target.value === "true")
                  }
                  label="Show in Menu"
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </Select>
                {errors.isShowMenu && (
                  <Typography color="error">
                    {errors.isShowMenu.message}
                  </Typography>
                )}
              </FormControl>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          {createDataSource.isPending || updateDataSource.isPending ? (
            <CircularProgress />
          ) : (
            <>
              <Button
                onClick={handleCancel}
                color="error"
                sx={{
                  fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
                  fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
                  p: STYLE_GUIDE.SPACING.s2,
                  pl: STYLE_GUIDE.SPACING.s4,
                  pr: STYLE_GUIDE.SPACING.s4,
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={handleSubmit(onSubmit)}
                sx={{
                  fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
                  fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
                  p: STYLE_GUIDE.SPACING.s2,
                  pl: STYLE_GUIDE.SPACING.s4,
                  pr: STYLE_GUIDE.SPACING.s4,
                }}
              >
                Save Data Source
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!validationError}
        autoHideDuration={6000}
        onClose={() => setValidationError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setValidationError(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {validationError}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateUpdateDataSource;
