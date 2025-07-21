



import React, { useEffect, useState, useRef } from "react";
import { useForm, useFieldArray, FieldError } from "react-hook-form";
import ExcelJS from "exceljs";
import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Stack,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import FileUploadButton from "../file/fileUploadButton";
import { GET, POST } from "../../../services/apiRoutes";
import ProgressBar from "../../molecule/progressBar";
import usePost from "../../../hooks/usePost";
import usePut from "../../../hooks/usePut";
import { EntityRequestPayload, EntityResponse } from "./types";
import CommonSelect from "../../common/dropdown/commonSelect";
import CommonDropdownSearch from "../../common/dropdown/searchableDropdown";
import { toast } from "react-toastify";
import axiosInstance from "../../../services/axiosInstance";
import { STYLE_GUIDE } from "../../../styles";
import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";

interface CreateUpdateEntityProps {
  setReloadEntity: React.Dispatch<React.SetStateAction<boolean>>;
  CustomButton: React.ReactElement;
  title: string;
  data?: EntityRequestPayload;
}

const CreateUpdateEntity: React.FC<CreateUpdateEntityProps> = ({
  setReloadEntity,
  CustomButton,
  title,
  data,
}) => {
  console.log("CreateUpdateEntity data:", data);
  const theme = useUnifiedTheme();
  const [open, setOpen] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);
  const [_file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileUploadLoader, setFileUploadLoader] = useState(false);
  const {
    control,
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm<EntityRequestPayload>({
    defaultValues: {
      name: data?.name ?? "",
      description: data?.description ?? "",
      attributes: data?.attributes?.map((attr) => ({
        name: attr.name ?? "",
        mappingName: attr.mappingName ?? "",
        type: attr.type ?? "",
        required: attr.required ?? "Not Mandatory",
        optionAttributeId: attr.optionAttributeId ?? "",
        refEntityId: "",
        refEntityField: "",
        relationType: "",
        validation: attr.validation ?? [],
        transformations: attr.transformations ?? [],
        cleaner: attr.cleaner ?? [],
      })) ?? [
        {
          name: "",
          mappingName: "",
          type: "",
          required: "",
          optionAttributeId: "",
          refEntityId: "",
          refEntityField: "",
          relationType: "",
          validation: [],
          transformations: [],
          cleaner: [],
        },
      ],
    },
  });

  useEffect(() => {
    reset({
      name: data?.name ?? "",
      description: data?.description ?? "",
      attributes: data?.attributes?.map((attr) => ({
        name: attr.name ?? "",
        mappingName: attr.mappingName ?? "",
        type: attr.type ?? "",
        required: attr.required ? "Mandatory" : "Not Mandatory",
        optionAttributeId: attr.optionAttributeId ?? "",
        refEntityId: attr.referenceEntitySetting?.refEntityId?._id ?? "",
        refEntityField: attr.referenceEntitySetting?.refEntityField?.name ?? "", // Use name instead of _id
        relationType: attr.referenceEntitySetting?.relationType ?? "",
        validation: attr.validation ?? [],
        transformations: attr.transformations ?? [],
        cleaner: attr.cleaner ?? [],
      })) ?? [
        {
          name: "",
          mappingName: "",
          type: "",
          required: "",
          optionAttributeId: "",
          refEntityId: "",
          refEntityField: "",
          relationType: "",
          validation: [],
          transformations: [],
          cleaner: [],
        },
      ],
    });
    console.log("Form reset with refEntityId:", data?.attributes?.[0]?.referenceEntitySetting?.refEntityId?._id);
    console.log("Form reset with refEntityField:", data?.attributes?.[0]?.referenceEntitySetting?.refEntityField?.name);
  }, [data, reset]);

  useEffect(() => {
    if (open) {
      setIsFormReady(true);
    } else {
      setIsFormReady(false);
    }
  }, [open]);

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "attributes",
  });
  const [referenceEntityNames, setReferenceEntityNames] = useState<{
    [key: number]: string[];
  }>({});
  console.log("referenceEntityNames:", referenceEntityNames);
  const [referenceEntityTypes, setReferenceEntityTypes] = useState<{
    [key: number]: string[];
  }>({});
  const attributes = watch("attributes");
  const prevEntityIdsRef = useRef<string[]>([]);

  const referenceEntityIdsString = attributes?.map((attr) => attr.refEntityId).join(",") || "";

  useEffect(() => {
    if (open && isFormReady) {
      console.log("Fetching reference entities for attributes:", attributes);
      attributes?.forEach((attribute, index) => {
        const entityId = attribute?.refEntityId;
        console.log(`Processing entityId: ${entityId} for index: ${index}`);
        
        if (
          !entityId ||
          entityId === prevEntityIdsRef.current[index] ||
          !/^[a-f\d]{24}$/i.test(entityId)
        ) {
          console.log(`Skipping fetch for entityId: ${entityId}, index: ${index}`);
          setReferenceEntityNames((prev) => ({ ...prev, [index]: [] }));
          setReferenceEntityTypes((prev) => ({ ...prev, [index]: [] }));
          return;
        }

        console.log(`Fetching entity data for ID: ${entityId}`);
        axiosInstance
          .get(`/entities/${entityId}`)
          .then((res) => {
            console.log(`Response for entityId ${entityId}:`, res.data);
            const namesArr = res.data?.data?.attributes?.map((f: any) => f.name) || [];
            const typesArr = res.data?.data?.attributes?.map((f: any) => f._id) || [];

            console.log(`Setting names for index ${index}:`, namesArr);
            console.log(`Setting types for index ${index}:`, typesArr);
            setReferenceEntityNames((prev) => ({
              ...prev,
              [index]: namesArr,
            }));
            setReferenceEntityTypes((prev) => ({
              ...prev,
              [index]: typesArr,
            }));
          })
          .catch((error) => {
            console.error(`Failed to fetch entity ${entityId}:`, error);
            toast.error(`Failed to load reference entity data for ID ${entityId}`);
            setReferenceEntityNames((prev) => ({ ...prev, [index]: [] }));
            setReferenceEntityTypes((prev) => ({ ...prev, [index]: [] }));
          });
      });

      prevEntityIdsRef.current = attributes?.map((attr) => attr.refEntityId) || [];
    }
  }, [open, isFormReady, attributes, referenceEntityIdsString]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);

      if (
        !selectedFile.name.endsWith(".xlsx") &&
        !selectedFile.name.endsWith(".xls")
      ) {
        toast.error("Please upload a valid Excel file.");
        setFileName(null);
        setFile(null);
        setFileUploadLoader(false);
        return;
      }

      const reader = new FileReader();
      setFileUploadLoader(true);

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;

          const workbook = new ExcelJS.Workbook();
          try {
            await workbook.xlsx.load(arrayBuffer);
          } catch {
            toast.error(
              "Failed to load the Excel file. Ensure the file is valid."
            );
            setFileName(null);
            setFile(null);
            setFileUploadLoader(false);
            return;
          }

          if (!workbook.worksheets || workbook.worksheets.length === 0) {
            toast.error("No sheets found in the Excel file.");
            setFileName(null);
            setFile(null);
            setFileUploadLoader(false);
            return;
          }

          const worksheet = workbook.worksheets[0];
          const headers: {
            name: string;
            mappingName: string;
            type: string;
            optionAttributeId: string;
            refEntityId: string;
            refEntityField: string;
            relationType: string;
            validation: unknown[];
            transformations: unknown[];
            cleaner: unknown[];
            required: string;
          }[] = [];
          const uniqueNames = new Set<string>();

          worksheet.getRow(1).eachCell((cell, _colNumber) => {
            if (cell.value) {
              const actualHeaderName = cell.value.toString().trim();
              const cleanedName = cell.value
                .toString()
                .replace(/[^a-zA-Z0-9/]/g, "")
                .replace(/\//g, " or ")
                .replace(/\s+/g, " ")
                .trim();

              if (!uniqueNames.has(cleanedName)) {
                uniqueNames.add(cleanedName);
                headers.push({
                  name: cleanedName,
                  mappingName: actualHeaderName,
                  type: "text",
                  optionAttributeId: "",
                  refEntityId: "",
                  refEntityField: "",
                  relationType: "",
                  validation: [],
                  transformations: [],
                  cleaner: [],
                  required: "Not Mandatory",
                });
              }
            }
          });

          worksheet.getRow(2).eachCell((cell, colNumber) => {
            if (headers[colNumber - 1] != undefined) {
              const firstValue = cell.value;
              let type = "text";
              if (typeof firstValue === "number") {
                type = "number";
              } else if (firstValue instanceof Date) {
                type = "date";
              }
              headers[colNumber - 1].type = type;
            }
          });

          if (headers.length > 0) {
            replace(headers);
          } else {
            toast.error("Headers not found.");
            setFileName(null);
            setFile(null);
          }
          setFileUploadLoader(false);
        } catch (e) {
          toast.error(
            "Something went wrong while processing the file. Please try again."
          );
          setFileName(null);
          setFile(null);
          setFileUploadLoader(false);
          return;
        }
      };

      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const createEntity = usePost<EntityRequestPayload, EntityResponse>(
    ["createEntity"],
    (data) => {
      if (data?.success) {
        setReloadEntity(true);
        setFile(null);
        setFileName(null);
        setOpen(false);
        reset();
      }
    },
    true
  );

  const updateEntity = usePut<EntityRequestPayload, EntityResponse>(
    ["updateEntity"],
    (data) => {
      if (data?.success) {
        setReloadEntity(true);
        setFile(null);
        setFileName(null);
        setOpen(false);
        reset();
      }
    },
    true
  );

  const onSubmit = (formData: EntityRequestPayload) => {
    console.log("Form Data123:", formData);

    const isReferenceDataLoaded = attributes.every(
      (_, index) => referenceEntityNames[index] && referenceEntityTypes[index]
    );

    if (!isReferenceDataLoaded) {
      toast.error("Reference entity data is still loading. Please wait.");
      return;
    }

    const newAttributes = formData.attributes?.map((data, index) => {
      const { refEntityId, refEntityField, relationType, ...rest } = data;

      const updated = {
        ...rest,
        required: data.required === "Mandatory" ? true : false,
      };

      if (!["option", "multioption"].includes(data.type)) {
        updated.optionAttributeId = "";
      }

      if (refEntityId && refEntityField && relationType) {
        const selectedName = refEntityField;
        const typeIndex = referenceEntityNames[index]?.indexOf(selectedName);
        const selectedType =
          typeIndex !== -1 && typeIndex !== undefined
            ? referenceEntityTypes[index]?.[typeIndex] || ""
            : "";

        updated.referenceEntitySetting = {
          refEntityId,
          refEntityField: selectedType,
          relationType,
        };
      }

      return updated;
    });

    const newFormData = { ...formData, attributes: newAttributes };
    console.log("newFormData:", newFormData);

    if (data && data._id) {
      console.log("Updating entity with ID:", data._id);
      updateEntity.mutate({
        url: `${POST.UPDATE_ENTITY}/${data._id}`,
        payload: newFormData,
      });
    } else {
      createEntity.mutate({ url: POST.CREATE_ENTITY, payload: newFormData });
    }
  };

  const handleCancel = () => {
    setFile(null);
    setFileName(null);
    setOpen(false);
    setFileUploadLoader(false);
    reset();
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
            fontWeight:
              theme.palette.dialog?.titleFontWeight ||
              STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
            fontSize: theme.palette.dialog?.titleFontSize || "20px",
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
              <TextField
                label="Entity Name*"
                fullWidth
                {...register("name", {
                  required: "Entity Name is required",
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message: "Entity Name must contain only letters",
                  },
                })}
                error={!!errors.name}
                helperText={errors.name?.message}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: STYLE_GUIDE.SPACING.s2,
                    alignItems: "flex-start",
                    paddingRight: STYLE_GUIDE.SPACING.s2,
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
                  "& .MuiInputBase-input": {
                    color: `${theme.dashboardTheme?.colors?.inputText || theme.palette.text.primary} !important`,
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: `${theme.dashboardTheme?.colors?.text?.secondary || "#666"} !important`,
                  },
                  "& .MuiInputBase-input:-webkit-autofill": {
                    WebkitTextFillColor: `${theme.dashboardTheme?.colors?.inputText || theme.palette.text.primary} !important`,
                    WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || "#ffffff"} inset !important`,
                  },
                }}
              />

              <TextField
                label="Entity Description"
                fullWidth
                multiline
                rows={4}
                {...register("description")}
                error={!!errors.description}
                helperText={errors.description?.message}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: STYLE_GUIDE.SPACING.s2,
                    alignItems: "flex-start",
                    paddingRight: STYLE_GUIDE.SPACING.s2,
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
                  "& .MuiInputBase-input": {
                    color: `${theme.dashboardTheme?.colors?.inputText || theme.palette.text.primary} !important`,
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: `${theme.dashboardTheme?.colors?.text?.secondary || "#666"} !important`,
                  },
                  "& .MuiInputBase-input:-webkit-autofill": {
                    WebkitTextFillColor: `${theme.dashboardTheme?.colors?.inputText || theme.palette.text.primary} !important`,
                    WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || "#ffffff"} inset !important`,
                  },
                }}
              />

              {fileUploadLoader ? (
                <ProgressBar />
              ) : (
                <FileUploadButton
                  fileName={fileName}
                  onFileChange={handleFileChange}
                  buttonName={"Upload File"}
                />
              )}

              <Divider sx={{ my: 3 }} />

              {fields.map((attribute, index) => (
                <Box
                  key={attribute.id}
                  sx={{
                    mb: 3,
                    pointerEvents: fileUploadLoader ? "none" : "auto",
                    opacity: fileUploadLoader ? 0.5 : 1,
                  }}
                >
                  <Typography variant="h6" mb={2}>
                    Attribute {index + 1}
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      label="Attribute Name"
                      fullWidth
                      {...register(`attributes.${index}.name`, {
                        required: "Attribute Name is required",
                      })}
                      error={!!errors.attributes?.[index]?.name}
                      helperText={errors.attributes?.[index]?.name?.message}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: STYLE_GUIDE.SPACING.s2,
                          alignItems: "flex-start",
                          paddingRight: STYLE_GUIDE.SPACING.s2,
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
                        "& .MuiInputBase-input": {
                          color: `${theme.dashboardTheme?.colors?.inputText || theme.palette.text.primary} !important`,
                        },
                        "& .MuiInputBase-input::placeholder": {
                          color: `${theme.dashboardTheme?.colors?.text?.secondary || "#666"} !important`,
                        },
                        "& .MuiInputBase-input:-webkit-autofill": {
                          WebkitTextFillColor: `${theme.dashboardTheme?.colors?.inputText || theme.palette.text.primary} !important`,
                          WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || "#ffffff"} inset !important`,
                        },
                      }}
                    />

                    <TextField
                      label="File Attribute Name"
                      fullWidth
                      {...register(`attributes.${index}.mappingName`, {
                        required: "File Attribute Name is required",
                      })}
                      error={!!errors.attributes?.[index]?.mappingName}
                      helperText={
                        errors.attributes?.[index]?.mappingName?.message
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: STYLE_GUIDE.SPACING.s2,
                          alignItems: "flex-start",
                          paddingRight: STYLE_GUIDE.SPACING.s2,
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
                        "& .MuiInputBase-input": {
                          color: `${theme.dashboardTheme?.colors?.inputText || theme.palette.text.primary} !important`,
                        },
                        "& .MuiInputBase-input::placeholder": {
                          color: `${theme.dashboardTheme?.colors?.text?.secondary || "#666"} !important`,
                        },
                        "& .MuiInputBase-input:-webkit-autofill": {
                          WebkitTextFillColor: `${theme.dashboardTheme?.colors?.inputText || theme.palette.text.primary} !important`,
                          WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || "#ffffff"} inset !important`,
                        },
                      }}
                    />

                    <CommonSelect
                      control={control}
                      name={`attributes.${index}.type`}
                      label="Attribute Type"
                      options={[
                        "number",
                        "text",
                        "date",
                        "boolean",
                        "richtext",
                        "reference",
                        "url",
                        "option",
                        "multioption",
                        "email",
                      ]}
                      defaultValue={attribute.type || ""}
                      rules={{ required: "Attribute Type is required" }}
                      error={!!errors.attributes?.[index]?.type}
                      errorMessage={
                        (errors.attributes?.[index]?.type as FieldError)?.message
                      }
                    />

                    {attributes &&
                      ["option", "multioption"].includes(
                        attributes[index]?.type || ""
                      ) && (
                        <CommonDropdownSearch
                          control={control}
                          name={`attributes.${index}.optionAttributeId`}
                          label="Attribute Options"
                          apiUrl={`${GET.Attribute_Option_List}`}
                          labelName="attributeName"
                          labelValue="_id"
                          defaultValue={attribute.optionAttributeId || ""}
                          rules={{ required: "Attribute Option is required" }}
                          error={
                            !!errors.attributes?.[index]?.optionAttributeId
                          }
                          errorMessage={
                            (
                              errors.attributes?.[index]
                                ?.optionAttributeId as FieldError
                            )?.message
                          }
                          apiName="attributeOption"
                          defaultDataUrl={`${GET.Attribute_Option_Get}`}
                        />
                      )}

                    <CommonSelect
                      control={control}
                      name={`attributes.${index}.required`}
                      label="Attribute Validation"
                      options={["Mandatory", "Not Mandatory"]}
                      defaultValue={attribute.required || "Not Mandatory"}
                      rules={{ required: "Attribute Validation is required" }}
                      error={!!errors.attributes?.[index]?.required}
                      helperText={
                        (errors.attributes?.[index]?.required as FieldError)
                          ?.message
                      }
                    />

                    <CommonDropdownSearch
                      control={control}
                      name={`attributes.${index}.refEntityId`}
                      label="Reference Entity ID"
                      apiUrl={`${GET.Entity_List}`}
                      labelName="name"
                      labelValue="_id"
                      defaultValue={attribute.refEntityId || ""}
                      rules={{ required: false }}
                      error={!!errors.attributes?.[index]?.refEntityId}
                      errorMessage={
                        (
                          errors.attributes?.[index]
                            ?.refEntityId as FieldError
                        )?.message
                      }
                      apiName="entities"
                      defaultDataUrl={`${GET.Entity_List}`}
                    />

                    <CommonSelect
                      control={control}
                      name={`attributes.${index}.refEntityField`}
                      label="Reference Entity Field"
                      options={referenceEntityNames[index]?.length ? referenceEntityNames[index] : ["No fields available"]}
                      defaultValue={attribute.refEntityField || ""}
                      rules={{ required: false }}
                      error={!!errors.attributes?.[index]?.refEntityField}
                      helperText={
                        referenceEntityNames[index]?.length
                          ? (errors.attributes?.[index]?.refEntityField as FieldError)?.message
                          : "No reference fields available for this entity"
                      }
                      disabled={!referenceEntityNames[index]?.length}
                    />

                    <CommonSelect
                      control={control}
                      name={`attributes.${index}.relationType`}
                      label="Reference Relation Type"
                      options={["many_to_one", "one_to_one", "self"]}
                      defaultValue={attribute.relationType || ""}
                      rules={{ required: false }}
                      error={!!errors.attributes?.[index]?.relationType}
                      helperText={
                        (
                          errors.attributes?.[index]
                            ?.relationType as FieldError
                        )?.message
                      }
                    />
                  </Stack>

                  <IconButton
                    color="error"
                    onClick={() => remove(index)}
                    sx={{ mt: 2, display: "flex", alignSelf: "flex-start" }}
                  >
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                </Box>
              ))}

              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => {
                  const newIndex = fields.length;
                  append({
                    name: "",
                    mappingName: "",
                    type: "",
                    required: "",
                    optionAttributeId: "",
                    refEntityId: "",
                    refEntityField: "",
                    relationType: "",
                    validation: [],
                    transformations: [],
                    cleaner: [],
                  });
                  setReferenceEntityNames((prev) => ({ ...prev, [newIndex]: [] }));
                  setReferenceEntityTypes((prev) => ({ ...prev, [newIndex]: [] }));
                }}
              >
                Add Attribute
              </Button>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          {createEntity.isPending || updateEntity.isPending ? (
            <ProgressBar />
          ) : (
            <>
              <Button
                onClick={handleCancel}
                color="error"
                sx={{ fontSize: 18, fontWeight: "bold", p: 1, pl: 2, pr: 2 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                variant="contained"
                color="primary"
                sx={{ fontSize: 18, fontWeight: "bold", p: 1, pl: 2, pr: 2 }}
              >
                Save Entity
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateUpdateEntity;


