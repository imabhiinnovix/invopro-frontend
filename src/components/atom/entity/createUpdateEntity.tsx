import React, { useEffect, useState } from "react";
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
import { EntityRequestPayload, EntityResponse } from "./types";
import CommonSelect from "../../common/dropdown/commonSelect";
import CommonDropdownSearch from "../../common/dropdown/searchableDropdown";
import usePut from "../../../hooks/usePut";
import { toast } from "react-toastify";
import { STYLE_GUIDE } from '../../../styles';
import { useUnifiedTheme } from '../../../hooks/useUnifiedTheme';

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
  
  const theme = useUnifiedTheme();
  const [open, setOpen] = useState(false);
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
      attributes: data?.attributes ?? [
        {
          name: "",
          mappingName: "",
          type: "",
          required: "", // Default to empty string for consistency
          optionAttributeId: "",
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
      attributes: data?.attributes ?? [
        {
          name: "",
          mappingName: "",
          type: "",
          required: "",
          optionAttributeId: "",
          validation: [],
          transformations: [],
          cleaner: [],
        },
      ],
    });
  }, [data, reset]);

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "attributes",
  });

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
          } catch (error) {
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
          const headers: any[] = [];
          const uniqueNames = new Set<string>(); // Track unique names

          // Read the first row (headers) and remove duplicates
          worksheet.getRow(1).eachCell((cell, _colNumber) => {
            if (cell.value) {
              const actualHeaderName = cell.value.toString().trim();
              const cleanedName = cell.value
                .toString()
                .replace(/[^a-zA-Z0-9/]/g, "") // Remove special characters except '/'
                .replace(/\//g, " or ") // Replace '/' with ' or '
                .replace(/\s+/g, " ") // Normalize multiple spaces
                .trim();

              if (!uniqueNames.has(cleanedName)) {
                uniqueNames.add(cleanedName);
                headers.push({
                  name: cleanedName,
                  mappingName: actualHeaderName,
                  type: "text",
                  optionAttributeId: "",
                  validation: [],
                  transformations: [],
                  cleaner: [],
                  required: "Not Mandatory",
                });
              }
            }
          });

          // Read the second row (for type inference)
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
    const newAttributes = formData.attributes?.map((data) => {
      if (!["option", "multioption"].includes(data.type)) {
        return {
          ...data, // Corrected spread operator
          optionAttributeId: "", // Adding the optionAttributeId property
          required: data.required === "Mandatory" ? true : false,
        };
      } else {
        return {
          ...data,
          required: data.required === "Mandatory" ? true : false,
        };
      }
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
    reset(); // Reset form on cancel
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
            backgroundColor: theme.palette.dialog?.background || STYLE_GUIDE.COLORS.white,
            border: `1px solid ${theme.palette.dialog?.border || theme.palette.border?.main || STYLE_GUIDE.COLORS.borderGray}`,
            borderRadius: theme.palette.dialog?.borderRadius || '8px',
            boxShadow: theme.palette.dialog?.shadow || STYLE_GUIDE.SHADOWS.lg,
          }
        }}
      >
        <DialogTitle 
          sx={{
            fontWeight: theme.palette.dialog?.titleFontWeight || STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
            fontSize: theme.palette.dialog?.titleFontSize || '20px',
            color: theme.palette.dialog?.titleColor || STYLE_GUIDE.COLORS.textDarkGray,
          }}
        >
          {title}
        </DialogTitle>
        <DialogContent sx={{
          color: theme.palette.dialog?.contentColor || STYLE_GUIDE.COLORS.textDarkGray,
          fontSize: theme.palette.dialog?.contentFontSize || '1rem',
          borderTop: `1px solid ${theme.palette.divider}`,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={3}>
              {/* Entity Name */}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: STYLE_GUIDE.SPACING.s2, alignItems: 'flex-start', paddingRight: STYLE_GUIDE.SPACING.s2, fontSize: '14px', backgroundColor: theme.dashboardTheme?.colors?.background?.paper || '#ffffff', '& fieldset': { borderColor: theme.dashboardTheme?.colors?.inputBorder || STYLE_GUIDE.COLORS.darkBackground, }, '&:hover fieldset': { borderColor: theme.dashboardTheme?.colors?.borderHover || STYLE_GUIDE.COLORS.darkBorderHover, }, '&.Mui-focused fieldset': { borderColor: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback, }, }, '& .MuiInputLabel-root': { color: theme.dashboardTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus, }, '& .MuiInputLabel-root.Mui-focused': { color: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback, }, '& .MuiInputBase-input': { color: `${theme.dashboardTheme?.colors?.inputText || theme.palette.text.primary} !important`, }, '& .MuiInputBase-input::placeholder': { color: `${theme.dashboardTheme?.colors?.text?.secondary || '#666'} !important`, }, '& .MuiInputBase-input:-webkit-autofill': { WebkitTextFillColor: `${theme.dashboardTheme?.colors?.inputText || theme.palette.text.primary} !important`, WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || '#ffffff'} inset !important`, }, }}
              />

              {/* Entity Description */}
              <TextField
                label="Entity Description"
                fullWidth
                multiline
                rows={4}
                {...register("description")}
                error={!!errors.description}
                helperText={errors.description?.message}
               sx={{ '& .MuiOutlinedInput-root': { borderRadius: STYLE_GUIDE.SPACING.s2, alignItems: 'flex-start', paddingRight: STYLE_GUIDE.SPACING.s2, fontSize: '14px', backgroundColor: theme.dashboardTheme?.colors?.background?.paper || '#ffffff', '& fieldset': { borderColor: theme.dashboardTheme?.colors?.inputBorder || STYLE_GUIDE.COLORS.darkBackground, }, '&:hover fieldset': { borderColor: theme.dashboardTheme?.colors?.borderHover || STYLE_GUIDE.COLORS.darkBorderHover, }, '&.Mui-focused fieldset': { borderColor: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback, }, }, '& .MuiInputLabel-root': { color: theme.dashboardTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus, }, '& .MuiInputLabel-root.Mui-focused': { color: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback, }, '& .MuiInputBase-input': { color: `${theme.dashboardTheme?.colors?.inputText || theme.palette.text.primary} !important`, }, '& .MuiInputBase-input::placeholder': { color: `${theme.dashboardTheme?.colors?.text?.secondary || '#666'} !important`, }, '& .MuiInputBase-input:-webkit-autofill': { WebkitTextFillColor: `${theme.dashboardTheme?.colors?.inputText || theme.palette.text.primary} !important`, WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || '#ffffff'} inset !important`, }, }}
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

              {/* Attributes Section */}
              {fields.map((attribute, index) => {
                return (
                  <Box
                    key={attribute.id}
                    sx={{
                      mb: 3,
                      pointerEvents: fileUploadLoader ? "none" : "auto", // Disable interactions when isPending is true
                      opacity: fileUploadLoader ? 0.5 : 1,
                    }}
                  >
                    <Typography variant="h6" mb={2}>
                      Attribute {index + 1}
                    </Typography>
                    <Stack spacing={2}>
                      {/* Attribute Name */}
                      <TextField
                        label="Attribute Name"
                        fullWidth
                        {...register(`attributes.${index}.name`, {
                          required: "Attribute Name is required",
                        })}
                        error={!!errors.attributes?.[index]?.name}
                        helperText={errors.attributes?.[index]?.name?.message}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: STYLE_GUIDE.SPACING.s2, alignItems: 'flex-start', paddingRight: STYLE_GUIDE.SPACING.s2, fontSize: '14px', backgroundColor: theme.dashboardTheme?.colors?.background?.paper || '#ffffff', '& fieldset': { borderColor: theme.dashboardTheme?.colors?.inputBorder || STYLE_GUIDE.COLORS.darkBackground, }, '&:hover fieldset': { borderColor: theme.dashboardTheme?.colors?.borderHover || STYLE_GUIDE.COLORS.darkBorderHover, }, '&.Mui-focused fieldset': { borderColor: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback, }, }, '& .MuiInputLabel-root': { color: theme.dashboardTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus, }, '& .MuiInputLabel-root.Mui-focused': { color: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback, }, '& .MuiInputBase-input': { color: `${theme.dashboardTheme?.colors?.inputText || theme.palette.text.primary} !important`, }, '& .MuiInputBase-input::placeholder': { color: `${theme.dashboardTheme?.colors?.text?.secondary || '#666'} !important`, }, '& .MuiInputBase-input:-webkit-autofill': { WebkitTextFillColor: `${theme.dashboardTheme?.colors?.inputText || theme.palette.text.primary} !important`, WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || '#ffffff'} inset !important`, }, }}
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
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: STYLE_GUIDE.SPACING.s2, alignItems: 'flex-start', paddingRight: STYLE_GUIDE.SPACING.s2, fontSize: '14px', backgroundColor: theme.dashboardTheme?.colors?.background?.paper || '#ffffff', '& fieldset': { borderColor: theme.dashboardTheme?.colors?.inputBorder || STYLE_GUIDE.COLORS.darkBackground, }, '&:hover fieldset': { borderColor: theme.dashboardTheme?.colors?.borderHover || STYLE_GUIDE.COLORS.darkBorderHover, }, '&.Mui-focused fieldset': { borderColor: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback, }, }, '& .MuiInputLabel-root': { color: theme.dashboardTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus, }, '& .MuiInputLabel-root.Mui-focused': { color: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback, }, '& .MuiInputBase-input': { color: `${theme.dashboardTheme?.colors?.inputText || theme.palette.text.primary} !important`, }, '& .MuiInputBase-input::placeholder': { color: `${theme.dashboardTheme?.colors?.text?.secondary || '#666'} !important`, }, '& .MuiInputBase-input:-webkit-autofill': { WebkitTextFillColor: `${theme.dashboardTheme?.colors?.inputText || theme.palette.text.primary} !important`, WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || '#ffffff'} inset !important`, }, }}
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
                          "url",
                          "option",
                          "multioption",
                          "email",
                          // 'user',
                        ]}
                        defaultValue={attribute.type || ""}
                        rules={{ required: "Attribute Type is required" }}
                        error={!!errors.attributes?.[index]?.type}
                        errorMessage={
                          (errors.attributes?.[index]?.type as FieldError)
                            ?.message
                        }
                      />

                      {watch("attributes") &&
                        ["option", "multioption"].includes(
                          watch("attributes")?.[index]?.type!
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
                        defaultValue={"Mandatory"}
                        rules={{ required: "Attribute Validation is required" }}
                        error={!!errors.attributes?.[index]?.required}
                        errorMessage={
                          (errors.attributes?.[index]?.required as FieldError)
                            ?.message
                        }
                      />
                    </Stack>

                    {/* Remove Attribute Button */}
                    <IconButton
                      color="error"
                      onClick={() => remove(index)}
                      sx={{ mt: 2, display: "flex", alignSelf: "flex-start" }}
                    >
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  </Box>
                );
              })}

              {/* Add Attribute Button */}
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() =>
                  append({
                    name: "",
                    mappingName: "",
                    type: "",
                    required: "",
                    optionAttributeId: "",
                    validation: [],
                    transformations: [],
                    cleaner: [],
                  })
                }
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
              {" "}
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
