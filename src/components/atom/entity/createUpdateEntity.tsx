import React, { useEffect, useState, useRef } from "react";
import { useForm, useFieldArray, FieldError, useWatch } from "react-hook-form";
import ExcelJS from "exceljs";
import {
  Box,
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
import { StyledButton } from "../../common";
import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";
import { useComponentTypography } from "../../../hooks/useComponentTypography";
import DialogContainer from "../../molecule/dialog";

interface CreateUpdateEntityProps {
  setReloadEntity: React.Dispatch<React.SetStateAction<boolean>>;
  CustomButton: React.ReactElement;
  title: string;
  data?: EntityRequestPayload;
}

interface FormAttribute {
  name: string;
  mappingName: string;
  type:
    | ""
    | "number"
    | "text"
    | "date"
    | "boolean"
    | "richtext"
    | "text-with-option"
    | "url"
    | "option"
    | "multioption"
    | "date-range"
    | "user";
  required: string;
  optionAttributeId: string;
  refEntityId: string;
  refEntityField: string;
  relationType: string;
  validation: string[];
  transformations: string[];
  cleaner: string[];
  isReferenceEditable: boolean | "HIDE" | "VIEW" | "EDIT";
  isOptionFixed: "Yes" | "No";
}

interface FormEntityRequestPayload {
  name: string;
  description: string;
  attributes: FormAttribute[];
}

interface AttributeFieldProps {
  index: number;
  attribute: any;
  control: any;
  register: any;
  errors: any;
  remove: (index: number) => void;
  referenceEntityNames: { [key: number]: string[] };
  referenceEntityTypes: { [key: number]: string[] };
  isLoadingReferences: { [key: number]: boolean };
  setValue: any;
  fileUploadLoader: boolean;
}

const AttributeField: React.FC<AttributeFieldProps> = ({
  index,
  attribute,
  control,
  register,
  errors,
  remove,
  referenceEntityNames,
  referenceEntityTypes,
  isLoadingReferences,
  setValue,
  fileUploadLoader,
}) => {
  const watchedType = useWatch({
    control,
    name: `attributes.${index}.type`,
    defaultValue: attribute.type || "",
  });

  const refEntityId = useWatch({
    control,
    name: `attributes.${index}.refEntityId`,
  });

  useEffect(() => {
    if (!refEntityId) {
      setValue(`attributes.${index}.refEntityField`, "");
    }
  }, [refEntityId, index, setValue]);

  return (
    <Box
      sx={{
        mb: 3,
        pointerEvents: fileUploadLoader ? "none" : "auto",
        opacity: fileUploadLoader ? 0.5 : 1,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Attribute {index + 1}</Typography>
        <StyledButton
          variant="secondary"
          color="error"
          onClick={() => remove(index)}
        >
          <Box
            gap={STYLE_GUIDE.SPACING.s2}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <RemoveCircleOutlineIcon /> Remove Attribute
          </Box>
        </StyledButton>
      </Stack>
      <Stack spacing={2}>
        <TextField
          label="Attribute Name"
          fullWidth
          {...register(`attributes.${index}.name`, {
            required: "Attribute Name is required",
          })}
          error={!!errors.attributes?.[index]?.name}
          helperText={errors.attributes?.[index]?.name?.message}
        />
        <TextField
          label="File Attribute Name"
          fullWidth
          {...register(`attributes.${index}.mappingName`, {
            required: "File Attribute Name is required",
          })}
          error={!!errors.attributes?.[index]?.mappingName}
          helperText={errors.attributes?.[index]?.mappingName?.message}
        />
        <CommonSelect
          control={control}
          name={`attributes.${index}.type`}
          label="Attribute Type"
          options={[
            "number",
            "text",
            "date",
            "date-range",
            "boolean",
            "richtext",
            "text-with-option",
            "url",
            "option",
            "multioption",
            "email",
          ]}
          defaultValue={attribute.type || ""}
        />
        {["option", "multioption", "text-with-option"].includes(
          watchedType,
        ) && (
          <>
            <CommonSelect
              control={control}
              name={`attributes.${index}.isOptionFixed`}
              label="List Fixed"
              options={["Yes", "No"]}
              defaultValue={attribute.isOptionFixed || "No"}
              clearable={false}
            />
            <CommonDropdownSearch
              control={control}
              name={`attributes.${index}.optionAttributeId`}
              label="Attribute Options"
              apiUrl={`${GET.Attribute_Option_List}`}
              labelName="attributeName"
              labelValue="_id"
              defaultValue={attribute.optionAttributeId || ""}
              apiName="attributeOption"
              defaultDataUrl={`${GET.Attribute_Option_Get}`}
            />
          </>
        )}
        <CommonSelect
          control={control}
          name={`attributes.${index}.required`}
          label="Attribute Validation"
          options={["Mandatory", "Not Mandatory"]}
          defaultValue={attribute.required || "Not Mandatory"}
          rules={{ required: "Attribute Validation is required" }}
          error={!!errors.attributes?.[index]?.required}
          errorMessage={
            (errors.attributes?.[index]?.required as FieldError)?.message
          }
        />
        <CommonSelect
          control={control}
          name={`attributes.${index}.isReferenceEditable`}
          label="Reference Editable"
          options={["EDIT", "VIEW", "HIDE"]}
          defaultValue={attribute.isReferenceEditable || "HIDE"}
          // rules={{ required: "Editable is required" }}
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
            (errors.attributes?.[index]?.refEntityId as FieldError)?.message
          }
          apiName="entities"
          defaultDataUrl={`${GET.Entity_List}`}
        />
        <CommonSelect
          control={control}
          name={`attributes.${index}.refEntityField`}
          label="Reference Entity Field"
          options={
            referenceEntityNames[index]?.length
              ? referenceEntityNames[index]
              : ["No fields available"]
          }
          defaultValue={attribute.refEntityField || ""}
          rules={{ required: false }}
          error={!!errors.attributes?.[index]?.refEntityField}
          errorMessage={
            referenceEntityNames[index]?.length
              ? (errors.attributes?.[index]?.refEntityField as FieldError)
                  ?.message
              : "No reference fields available for this entity"
          }
          disabled={
            isLoadingReferences[index] || !referenceEntityNames[index]?.length
          }
          helperText={
            isLoadingReferences[index] ? "Loading fields..." : undefined
          }
          clearable
        />
        <CommonSelect
          control={control}
          name={`attributes.${index}.relationType`}
          label="Reference Relation Type"
          options={[
            "many_to_one",
            "one_to_one",
            "self",
            "mapping_one_to_one",
            "mapping_many_to_one",
          ]}
          defaultValue={attribute.relationType || ""}
          rules={{ required: false }}
          error={!!errors.attributes?.[index]?.relationType}
          errorMessage={
            (errors.attributes?.[index]?.relationType as FieldError)?.message
          }
        />
      </Stack>
    </Box>
  );
};

const CreateUpdateEntity: React.FC<CreateUpdateEntityProps> = ({
  setReloadEntity,
  CustomButton,
  title,
  data,
}) => {
  const theme = useUnifiedTheme();
  const { getDialogTitleSx } = useComponentTypography();
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
    setValue,
    formState: { errors },
  } = useForm<FormEntityRequestPayload>({
    defaultValues: {
      name: "",
      description: "",
      attributes: [
        {
          name: "",
          mappingName: "",
          type: "",
          required: "Not Mandatory",
          optionAttributeId: "",
          refEntityId: "",
          refEntityField: "",
          relationType: "",
          validation: [],
          transformations: [],
          cleaner: [],
          isReferenceEditable: "HIDE",
          isOptionFixed: "No",
        },
      ],
    },
  });

  useEffect(() => {
    if (open && data) {
      reset({
        name: data?.name ?? "",
        description: data?.description ?? "",
        attributes: data?.attributes?.map((attr) => ({
          name: attr.name ?? "",
          mappingName: attr.mappingName ?? "",
          type: attr.type ?? "",
          required: attr.required ? "Mandatory" : "Not Mandatory",
          optionAttributeId: attr.optionAttributeId ?? "",
          isOptionFixed: attr.isOptionFixed === true ? "Yes" : "No",
          _id: attr._id ?? "",
          refEntityId:
            typeof attr.referenceEntitySetting?.refEntityId === "object"
              ? ((attr.referenceEntitySetting?.refEntityId as any)?._id ?? "")
              : (attr.referenceEntitySetting?.refEntityId ?? ""),
          refEntityField:
            typeof attr.referenceEntitySetting?.refEntityField === "object"
              ? ((attr.referenceEntitySetting?.refEntityField as any)?.name ??
                "")
              : (attr.referenceEntitySetting?.refEntityField ?? ""),
          relationType: attr.referenceEntitySetting?.relationType ?? "",
          validation: attr.validation ?? [],
          transformations: attr.transformations ?? [],
          cleaner: attr.cleaner ?? [],
          isReferenceEditable: attr.isReferenceEditable || "HIDE",
        })) ?? [
          {
            name: "",
            mappingName: "",
            type: "",
            required: "Not Mandatory",
            optionAttributeId: "",
            isOptionFixed: "No",
            refEntityId: "",
            refEntityField: "",
            relationType: "",
            validation: [],
            transformations: [],
            cleaner: [],
            isReferenceEditable: "HIDE",
          },
        ],
      });
      console.log(
        "Form reset complete, attributes length:",
        data?.attributes?.length || 1,
      );
    }
  }, [open, data, reset]);

  useEffect(() => {
    if (open) {
      setIsFormReady(true);
    } else {
      setIsFormReady(false);
      reset({
        name: "",
        description: "",
        attributes: [
          {
            name: "",
            mappingName: "",
            type: "",
            required: "Not Mandatory",
            optionAttributeId: "",
            isOptionFixed: "No",
            refEntityId: "",
            refEntityField: "",
            relationType: "",
            validation: [],
            transformations: [],
            cleaner: [],
            isReferenceEditable: "HIDE",
          },
        ],
      });
    }
  }, [open, reset]);

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "attributes",
  });

  useEffect(() => {}, [fields]);

  const [referenceEntityNames, setReferenceEntityNames] = useState<{
    [key: number]: string[];
  }>({});
  const [referenceEntityTypes, setReferenceEntityTypes] = useState<{
    [key: number]: string[];
  }>({});
  const [isLoadingReferences, setIsLoadingReferences] = useState<{
    [key: number]: boolean;
  }>({});
  const attributes = watch("attributes");
  const prevEntityIdsRef = useRef<string[]>([]);
  const referenceEntityIdsString =
    attributes
      ?.map((attr) =>
        typeof attr.refEntityId === "object"
          ? (attr.refEntityId as any)?._id
          : attr.refEntityId,
      )
      .join(",") || "";

  useEffect(() => {
    if (open && isFormReady) {
      attributes?.forEach((attribute, index) => {
        const entityId =
          typeof attribute?.refEntityId === "object"
            ? (attribute?.refEntityId as any)?._id
            : attribute?.refEntityId;
        if (
          !entityId ||
          entityId === prevEntityIdsRef.current[index] ||
          !/^[a-f\d]{24}$/i.test(entityId)
        ) {
          if (!referenceEntityNames[index]) {
            setReferenceEntityNames((prev) => ({ ...prev, [index]: [] }));
          }
          if (!referenceEntityTypes[index]) {
            setReferenceEntityTypes((prev) => ({ ...prev, [index]: [] }));
          }
          setIsLoadingReferences((prev) => ({ ...prev, [index]: false }));
          return;
        }
        setIsLoadingReferences((prev) => ({ ...prev, [index]: true }));
        axiosInstance
          .get(`/common/entities/${entityId}`)
          .then((res) => {
            const namesArr =
              res.data?.data?.attributes?.map((f: any) => f.name || "") || [];
            const typesArr =
              res.data?.data?.attributes?.map((f: any) => f._id || "") || [];
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
            toast.error(
              `Failed to load reference entity data for ID ${entityId}`,
            );
            setReferenceEntityNames((prev) => ({ ...prev, [index]: [] }));
            setReferenceEntityTypes((prev) => ({ ...prev, [index]: [] }));
          })
          .finally(() => {
            setIsLoadingReferences((prev) => ({ ...prev, [index]: false }));
          });
      });
      prevEntityIdsRef.current =
        attributes?.map((attr) =>
          typeof attr.refEntityId === "object"
            ? (attr.refEntityId as any)?._id
            : attr.refEntityId,
        ) || [];
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
              "Failed to load the Excel file. Ensure the file is valid.",
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
          const headers: FormAttribute[] = [];
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
                  isOptionFixed: "No",
                  refEntityId: "",
                  refEntityField: "",
                  relationType: "",
                  validation: [],
                  transformations: [],
                  cleaner: [],
                  required: "Not Mandatory",
                  isReferenceEditable: "HIDE",
                });
              }
            }
          });
          worksheet.getRow(2).eachCell((cell, colNumber) => {
            if (headers[colNumber - 1] != undefined) {
              const firstValue = cell.value;
              let type: FormAttribute["type"] = "text";
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
            "Something went wrong while processing the file. Please try again.",
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
    true,
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
    true,
  );

  const onSubmit = (formData: FormEntityRequestPayload) => {
    const isReferenceDataLoaded = attributes?.every(
      (_, index) => referenceEntityNames[index] && referenceEntityTypes[index],
    );
    if (!isReferenceDataLoaded) {
      toast.error("Reference entity data is still loading. Please wait.");
      return;
    }

    const newAttributes = formData.attributes?.map((data, index) => {
      const {
        refEntityId,
        refEntityField,
        relationType,
        isOptionFixed,
        ...rest
      } = data;
      const updated: any = {
        ...rest,
        required: data.required === "Mandatory" ? true : false,
        isReferenceEditable: data.isReferenceEditable || "HIDE",
      };

      if (["option", "multioption", "text-with-option"].includes(data.type)) {
        updated.isOptionFixed = isOptionFixed === "Yes" ? true : false;
      } else {
        updated.optionAttributeId = "";
        updated.isOptionFixed = false;
      }

      if (refEntityId && refEntityField && relationType) {
        const selectedName = refEntityField;
        const typeIndex = referenceEntityNames[index]?.indexOf(selectedName);
        const selectedType =
          typeIndex !== -1 && typeIndex !== undefined
            ? referenceEntityTypes[index]?.[typeIndex] || ""
            : refEntityField;
        updated.referenceEntitySetting = {
          refEntityId,
          refEntityField: selectedType,
          relationType,
        };
      }
      return updated;
    });

    const newFormData = { ...formData, attributes: newAttributes };

    if (data && data._id) {
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

      <DialogContainer
        open={open}
        onClose={handleCancel}
        title={title}
        actions={
          <>
            {createEntity.isPending || updateEntity.isPending ? (
              <ProgressBar />
            ) : (
              <>
                <StyledButton
                  variant="primary"
                  type="submit"
                  onClick={handleSubmit(onSubmit)}
                  disabled={attributes?.some(
                    (_, index) => isLoadingReferences[index],
                  )}
                >
                  Save Entity
                </StyledButton>
              </>
            )}
          </>
        }
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
            />
            <TextField
              label="Entity Description"
              fullWidth
              multiline
              rows={4}
              {...register("description")}
              error={!!errors.description}
              helperText={errors.description?.message}
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
              <AttributeField
                key={attribute.id}
                index={index}
                attribute={attribute}
                control={control}
                register={register}
                errors={errors}
                remove={remove}
                referenceEntityNames={referenceEntityNames}
                referenceEntityTypes={referenceEntityTypes}
                isLoadingReferences={isLoadingReferences}
                setValue={setValue}
                fileUploadLoader={fileUploadLoader}
              />
            ))}
            <StyledButton
              variant="secondary"
              icon={<AddCircleOutlineIcon />}
              onClick={() => {
                const newIndex = fields.length;
                append({
                  name: "",
                  mappingName: "",
                  type: "",
                  required: "Not Mandatory",
                  optionAttributeId: "",
                  refEntityId: "",
                  refEntityField: "",
                  relationType: "",
                  validation: [],
                  transformations: [],
                  cleaner: [],
                  isReferenceEditable: "HIDE",
                  isOptionFixed: "No",
                });
                setReferenceEntityNames((prev) => ({
                  ...prev,
                  [newIndex]: [],
                }));
                setReferenceEntityTypes((prev) => ({
                  ...prev,
                  [newIndex]: [],
                }));
                setIsLoadingReferences((prev) => ({
                  ...prev,
                  [newIndex]: false,
                }));
              }}
            >
              Add Attribute
            </StyledButton>
          </Stack>
        </Box>
      </DialogContainer>
    </>
  );

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
            border: `1px solid ${
              theme.palette.dialog?.border ||
              theme.palette.border?.main ||
              STYLE_GUIDE.COLORS.borderGray
            }`,
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
                    backgroundColor: STYLE_GUIDE.COLORS.white,
                    "& fieldset": {
                      borderColor: STYLE_GUIDE.COLORS.darkBackground,
                    },
                    "&:hover fieldset": {
                      borderColor: STYLE_GUIDE.COLORS.darkBorderHover,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: STYLE_GUIDE.COLORS.inputFocusFallback,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: STYLE_GUIDE.COLORS.darkBorderFocus,
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: STYLE_GUIDE.COLORS.inputFocusFallback,
                  },
                  "& .MuiInputBase-input": {
                    color: `${STYLE_GUIDE.COLORS.textDarkGray} !important`,
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: `${STYLE_GUIDE.COLORS.textSecondary} !important`,
                  },
                  "& .MuiInputBase-input:-webkit-autofill": {
                    WebkitTextFillColor: `${STYLE_GUIDE.COLORS.textDarkGray} !important`,
                    WebkitBoxShadow: `0 0 0 1000px ${STYLE_GUIDE.COLORS.white} inset !important`,
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
                    backgroundColor: STYLE_GUIDE.COLORS.white,
                    "& fieldset": {
                      borderColor: STYLE_GUIDE.COLORS.darkBackground,
                    },
                    "&:hover fieldset": {
                      borderColor: STYLE_GUIDE.COLORS.darkBorderHover,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: STYLE_GUIDE.COLORS.inputFocusFallback,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: STYLE_GUIDE.COLORS.darkBorderFocus,
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: STYLE_GUIDE.COLORS.inputFocusFallback,
                  },
                  "& .MuiInputBase-input": {
                    color: `${STYLE_GUIDE.COLORS.textDarkGray} !important`,
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: `${STYLE_GUIDE.COLORS.textSecondary} !important`,
                  },
                  "& .MuiInputBase-input:-webkit-autofill": {
                    WebkitTextFillColor: `${STYLE_GUIDE.COLORS.textDarkGray} !important`,
                    WebkitBoxShadow: `0 0 0 1000px ${STYLE_GUIDE.COLORS.white} inset !important`,
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
                <AttributeField
                  key={attribute.id}
                  index={index}
                  attribute={attribute}
                  control={control}
                  register={register}
                  errors={errors}
                  remove={remove}
                  referenceEntityNames={referenceEntityNames}
                  referenceEntityTypes={referenceEntityTypes}
                  isLoadingReferences={isLoadingReferences}
                  setValue={setValue}
                  fileUploadLoader={fileUploadLoader}
                />
              ))}
              <StyledButton
                variant="primary"
                icon={<AddCircleOutlineIcon />}
                onClick={() => {
                  const newIndex = fields.length;
                  append({
                    name: "",
                    mappingName: "",
                    type: "",
                    required: "Not Mandatory",
                    optionAttributeId: "",
                    isOptionFixed: "No",
                    refEntityId: "",
                    refEntityField: "",
                    relationType: "",
                    validation: [],
                    transformations: [],
                    cleaner: [],
                    isReferenceEditable: "HIDE",
                  });
                  setReferenceEntityNames((prev) => ({
                    ...prev,
                    [newIndex]: [],
                  }));
                  setReferenceEntityTypes((prev) => ({
                    ...prev,
                    [newIndex]: [],
                  }));
                  setIsLoadingReferences((prev) => ({
                    ...prev,
                    [newIndex]: false,
                  }));
                }}
              >
                Add Attribute
              </StyledButton>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          {createEntity.isPending || updateEntity.isPending ? (
            <ProgressBar />
          ) : (
            <>
              <StyledButton variant="secondary" onClick={handleCancel}>
                Cancel
              </StyledButton>
              <StyledButton
                variant="primary"
                type="submit"
                onClick={handleSubmit(onSubmit)}
                disabled={attributes?.some(
                  (_, index) => isLoadingReferences[index],
                )}
              >
                Save Entity
              </StyledButton>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateUpdateEntity;
