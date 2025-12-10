import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Modal,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  OutlinedInput,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import useGet from "../../hooks/useGet";
import usePut from "../../hooks/usePut";
import usePost from "../../hooks/usePost";
import { GET, POST, PUT } from "../../services/apiRoutes";
import { useSelector } from "react-redux";
import {
  DataSource,
  GroupByItem,
  TemplateFormData,
  TemplateModalProps,
  TemplatePostPayload,
  TemplatePostResponse,
  FieldSetting,
  AttachmentFieldItem,
} from "../../types/template";
import DialogContainer from "../../components/molecule/dialog";
import PrimaryButton from "../../components/common/PrimaryButton";
import { STYLE_GUIDE } from "../../styles";

export function TemplateModal({
  open,
  onClose,
  mode,
  editTemplateId,
  rowData,
  onTemplateCreated,
  onTemplateUpdated,
}: TemplateModalProps) {
  const theme = useUnifiedTheme();
  const { list } = useSelector((state) => state.dataSource);
  const updatedList =
    list?.filter((item: DataSource) => item?.isShowMenu === true) || [];

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // Form handling
  const { control, handleSubmit, reset, watch, formState, setValue } =
    useForm<TemplateFormData>({
      defaultValues: {
        name: "",
        code: "",
        subject: "",
        body: "",
        type: "",
        dataSourceId: "",
        attachmentType: "",
        attachmentFileName: "",
        attachmentFieldList: [],
        groupBy: [],
      },
      mode: "onChange",
    });

  const watchedName = watch("name");

  // Transform name to code: lowercase and replace spaces with underscores
  useEffect(() => {
    // Only auto-generate code in add mode
    if (mode === "add" && watchedName) {
      const transformedCode = watchedName.toLowerCase().replace(/\s+/g, "_");
      setValue("code", transformedCode, {
        shouldValidate: false,
        shouldDirty: false,
      });
    } else if (mode === "add" && !watchedName) {
      setValue("code", "", { shouldValidate: false, shouldDirty: false });
    }
  }, [watchedName, mode, setValue]);

  // Create and update template hooks
  const createTemplate = usePost<TemplatePostPayload, TemplatePostResponse>(
    ["createTemplate"],
    (data) => {
      if (data?.success) {
        onClose();
        setTimeout(() => {
          onTemplateCreated?.();
        }, 100);
      }
    },
    true,
    (error) => {
      console.error("❌ Error creating template:", error);
    }
  );

  const updateTemplate = usePut<TemplatePostPayload, TemplatePostResponse>(
    ["updateTemplate"],
    (data) => {
      if (data?.success) {
        onClose();
        setTimeout(() => {
          onTemplateUpdated?.();
        }, 100);
      } else {
        console.error("❌ Failed to update Template:", data?.message);
      }
    },
    true
  );

  // Quill editor modules configuration
  const modules = {
    toolbar:
      mode === "view"
        ? false
        : [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            ["link", "image"],
            ["clean"],
          ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "color",
    "background",
    "align",
    "link",
    "image",
  ];

  // Helper function to transform labels to attachment field items
  const transformLabelsToAttachmentFieldItems = (
    labels: string[]
  ): AttachmentFieldItem[] => {
    if (!selectedDataSource?.fieldSettings) {
      console.warn("Field settings not available for transformation");
      return [];
    }

    return labels
      .map((label) => {
        const fieldSetting = selectedDataSource.fieldSettings.find(
          (fs) => fs.label === label
        );
        if (fieldSetting) {
          return {
            attributeId: fieldSetting.attributeId,
            refAttributeId: fieldSetting.refAttributeId || [],
          };
        }
        return null;
      })
      .filter((item): item is AttachmentFieldItem => item !== undefined);
  };

  // Helper function to transform labels to group by items
  const transformLabelsToGroupByItems = (labels: string[]): GroupByItem[] => {
    if (!selectedDataSource?.fieldSettings) {
      console.warn("Field settings not available for transformation");
      return [];
    }

    return labels
      .map((label) => {
        const fieldSetting = selectedDataSource.fieldSettings.find(
          (fs) => fs.label === label
        );
        if (fieldSetting) {
          return {
            attributeId: fieldSetting.attributeId,
            refAttributeId: fieldSetting.refAttributeId || [],
          };
        }
        return null;
      })
      .filter((item): item is GroupByItem => item !== undefined);
  };

  // Get selected data source and its field settings
  const selectedDataSourceId = watch("dataSourceId");
  const selectedDataSource = updatedList.find(
    (ds) => ds._id === selectedDataSourceId
  );
  const availableFields = selectedDataSource?.fieldSettings || [];

  // Helper function to get field label from attributeId with null checks
  const getFieldLabel = (attributeId?: string) => {
    if (!selectedDataSource?.fieldSettings || !attributeId) return "";
    const field = selectedDataSource.fieldSettings.find(
      (fs) => fs.attributeId === attributeId
    );
    return field?.label || "";
  };

  // Helper function to get available field by label
  const getAvailableFieldByLabel = (label: string) => {
    if (!selectedDataSource?.fieldSettings) return null;
    return selectedDataSource.fieldSettings.find((fs) => fs.label === label);
  };

  // Reset form when modal opens or mode/rowData changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" || mode === "view") {
        // Extract attachment settings from the nested structure
        const attachmentSettings = rowData?.attachmentSettings?.[0] || {};

        // Transform field lists to labels with null checks and matching
        const attachmentFieldLabels =
          attachmentSettings.fieldList
            ?.map((fs) => {
              const field = availableFields.find(
                (f) => f.attributeId === fs?.attributeId
              );
              return field?.label || "";
            })
            .filter((label) => label !== "") || [];

        const groupByLabels =
          rowData?.groupBy
            ?.map((gs) => {
              const field = availableFields.find(
                (f) => f.attributeId === gs?.attributeId
              );
              return field?.label || "";
            })
            .filter((label) => label !== "") || [];

        const formData = {
          name: rowData?.name || "",
          code: rowData?.code || "",
          subject: rowData?.subject || "",
          body: rowData?.body || "",
          type: rowData?.type || "",
          dataSourceId: rowData?.dataSourceId || "",
          attachmentType: attachmentSettings.type || "",
          attachmentFileName: attachmentSettings.fileName || "",
          attachmentFieldList: attachmentFieldLabels,
          groupBy: groupByLabels,
        };

        reset(formData);
      }
    }
  }, [open, mode, rowData, reset, availableFields]);

  // Initialize form for add mode
  useEffect(() => {
    if (open && mode === "add") {
      // Reset form only when modal opens
      reset({
        name: "",
        code: "",
        subject: "",
        body: "",
        type: "",
        dataSourceId: "",
        attachmentType: "",
        attachmentFileName: "",
        attachmentFieldList: [],
        groupBy: [],
      });
    }
  }, [open, mode, reset]);

  // Helper function to get data source name
  const getDataSourceName = (id: string) => {
    return list?.find((ds: DataSource) => ds._id === id)?.name || "-";
  };

  // Get display data for view mode with null checks
  const displayData =
    mode === "view"
      ? (() => {
          if (!rowData) return null;

          const selectedDataSource = updatedList.find(
            (ds) => ds._id === rowData.dataSourceId
          );
          const availableFields = selectedDataSource?.fieldSettings || [];

          const getLabelByAttributeId = (attributeId?: string) => {
            if (!attributeId) return "";
            const field = availableFields.find(
              (f) => f.attributeId === attributeId
            );
            return field?.label || "";
          };

          const attachmentSettings = rowData.attachmentSettings?.[0] || {};

          return {
            ...rowData,
            attachmentType: attachmentSettings.type || "",
            attachmentFileName: attachmentSettings.fileName || "",
            attachmentFieldList:
              attachmentSettings.fieldList
                ?.map((fs) => getLabelByAttributeId(fs?.attributeId))
                .filter((label) => label !== "") || [],
            groupBy:
              rowData.groupBy
                ?.map((gs) => getLabelByAttributeId(gs?.attributeId))
                .filter((label) => label !== "") || [],
          };
        })()
      : null;

  const onSubmit = (data: TemplateFormData) => {
    const fieldList = transformLabelsToAttachmentFieldItems(
      data.attachmentFieldList
    );

    // Build attachmentSettings as an array
    const attachmentSettings = data.attachmentType
      ? [
          {
            type: data.attachmentType,
            fileName: data.attachmentFileName || "",
            fieldList,
          },
        ]
      : [];

    const groupBy = transformLabelsToGroupByItems(data.groupBy);

    // Add current date to subject
    let finalSubject = data.subject;
    if (mode === "add") {
      const currentDate = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      finalSubject = `${data.subject} - ${currentDate}`;
    }

    // Wrap body content in full HTML structure for email
    const fullHtmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${finalSubject}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
  </style>
</head>
<body>
  ${data.body}
</body>
</html>`;

    const payload: TemplatePostPayload = {
      name: data.name,
      code: data.code,
      subject: finalSubject,
      body: fullHtmlBody,
      type: data.type,
      dataSourceId: data.dataSourceId,
      attachmentSettings,
      groupBy,
    };

    console.log("🔍 Backend Payload:", JSON.stringify(payload, null, 2));

    if (mode === "add") {
      createTemplate.mutate({
        url: POST.CREATE_TEMPLATE,
        payload,
      });
    } else if (mode === "edit" && editTemplateId) {
      updateTemplate.mutate({
        url: `${PUT.UPDATE_TEMPLATE}/${editTemplateId}`,
        payload,
      });
    }
  };

  const handlePreview = () => {
    const formData = watch();

    // Add current date to subject for preview
    const currentDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const subjectWithDate = `${formData.subject} - ${currentDate}`;

    setPreviewData({
      ...formData,
      subject: subjectWithDate,
    });
    setShowPreview(true);
  };

  const isFormValid = formState.isValid;
  const isFormDirty = formState.isDirty;
  const isSaving = createTemplate.isLoading || updateTemplate.isLoading;

  console.log("formState", watch("body"));

  return (
    <>
      <DialogContainer
        open={open}
        onClose={onClose}
        title={
          mode === "add"
            ? "Add Template"
            : mode === "edit"
            ? "Edit Template"
            : "View Template"
        }
        actions={
          <>
            <PrimaryButton onClick={onClose} variant="outlined">
              {mode === "view" ? "Close" : "Cancel"}
            </PrimaryButton>

            {mode !== "view" && (
              <>
                <PrimaryButton
                  variant="outlined"
                  onClick={handlePreview}
                  disabled={!isFormDirty || isSaving}
                >
                  Preview
                </PrimaryButton>
                <PrimaryButton
                  onClick={handleSubmit(onSubmit)}
                  variant="contained"
                  disabled={!isFormValid || !isFormDirty || isSaving}
                >
                  {mode === "add" ? "Save Template" : "Update Template"}
                </PrimaryButton>
              </>
            )}
          </>
        }
      >
        <Box>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* Name Field */}
              <Grid item xs={12} sm={6}>
                {mode === "view" ? (
                  <>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      Name
                    </Typography>
                    <Box
                      sx={{
                        padding: 1.5,
                        borderRadius: 2,
                        backgroundColor: "#f5f5f5",
                        border: "1px solid #e0e0e0",
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      {displayData?.name || rowData?.name || "-"}
                    </Box>
                  </>
                ) : (
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: "Name is required" }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Name"
                        placeholder="Enter template name"
                        variant="outlined"
                        fullWidth
                        size="small"
                        required
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        disabled={isSaving}
                        InputProps={{
                          sx: { borderRadius: 2 },
                        }}
                      />
                    )}
                  />
                )}
              </Grid>

              {/* Code Field */}
              <Grid item xs={12} sm={6}>
                {mode === "view" ? (
                  <>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      Code
                    </Typography>
                    <Box
                      sx={{
                        padding: 1.5,
                        borderRadius: 2,
                        backgroundColor: "#f5f5f5",
                        border: "1px solid #e0e0e0",
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      {displayData?.code || rowData?.code || "-"}
                    </Box>
                  </>
                ) : (
                  <Controller
                    name="code"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Code"
                        placeholder="Auto-generated from name"
                        variant="outlined"
                        fullWidth
                        size="small"
                        // Removed disabled={mode === "add"} to allow editing in add mode
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        InputProps={{
                          sx: { borderRadius: 2 },
                        }}
                      />
                    )}
                  />
                )}
              </Grid>

              {/* Subject Field */}
              <Grid item xs={12}>
                {mode === "view" ? (
                  <>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      Subject
                    </Typography>
                    <Box
                      sx={{
                        padding: 1.5,
                        borderRadius: 2,
                        backgroundColor: "#f5f5f5",
                        border: "1px solid #e0e0e0",
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      {displayData?.subject || rowData?.subject || "-"}
                    </Box>
                  </>
                ) : (
                  <Controller
                    name="subject"
                    control={control}
                    rules={{ required: "Subject is required" }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Subject"
                        placeholder="Enter subject"
                        variant="outlined"
                        fullWidth
                        size="small"
                        required
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        disabled={isSaving}
                        InputProps={{
                          sx: { borderRadius: 2 },
                        }}
                      />
                    )}
                  />
                )}
              </Grid>

              {/* Type Field */}
              <Grid item xs={12} sm={6}>
                {mode === "view" ? (
                  <>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      Type
                    </Typography>
                    <Box
                      sx={{
                        padding: 1.5,
                        borderRadius: 2,
                        backgroundColor: "#f5f5f5",
                        border: "1px solid #e0e0e0",
                        textTransform: "capitalize",
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      {displayData?.type || rowData?.type || "-"}
                    </Box>
                  </>
                ) : (
                  <Controller
                    name="type"
                    control={control}
                    rules={{ required: "Type is required" }}
                    render={({ field, fieldState }) => (
                      <FormControl
                        fullWidth
                        error={!!fieldState.error}
                        size="small"
                      >
                        <InputLabel required>Type</InputLabel>
                        <Select
                          {...field}
                          label="Type"
                          disabled={isSaving}
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="overall">Overall</MenuItem>
                          <MenuItem value="single">Single</MenuItem>
                        </Select>
                        {fieldState.error && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 0.5, ml: 2 }}
                          >
                            {fieldState.error.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                )}
              </Grid>

              {/* Data Source Field */}
              <Grid item xs={12} sm={6}>
                {mode === "view" ? (
                  <>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      Data Source
                    </Typography>
                    <Box
                      sx={{
                        padding: 1.5,
                        borderRadius: 2,
                        backgroundColor: "#f5f5f5",
                        border: "1px solid #e0e0e0",
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      {getDataSourceName(
                        displayData?.dataSourceId || rowData?.dataSourceId || ""
                      )}
                    </Box>
                  </>
                ) : (
                  <Controller
                    name="dataSourceId"
                    control={control}
                    rules={{ required: "Data Source is required" }}
                    render={({ field, fieldState }) => (
                      <FormControl
                        fullWidth
                        error={!!fieldState.error}
                        size="small"
                      >
                        <InputLabel required>Data Source</InputLabel>
                        <Select
                          {...field}
                          label="Data Source"
                          disabled={isSaving}
                          sx={{ borderRadius: 2 }}
                        >
                          {updatedList.map((ds: DataSource) => (
                            <MenuItem key={ds._id} value={ds._id}>
                              {ds.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {fieldState.error && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 0.5, ml: 2 }}
                          >
                            {fieldState.error.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                )}
              </Grid>

              {/* Editor Section */}
              <Grid item xs={12}>
                {mode === "view" ? (
                  <>
                    <Box
                      sx={{
                        padding: 2,
                        borderRadius: 2,
                        backgroundColor: "#f5f5f5",
                        border: "1px solid #e0e0e0",
                        minHeight: "200px",
                        maxHeight: "400px",
                        overflow: "auto",
                        "& img": {
                          maxWidth: "100%",
                          height: "auto",
                        },
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                      dangerouslySetInnerHTML={{
                        __html:
                          displayData?.body ||
                          rowData?.body ||
                          "<p>No content</p>",
                      }}
                    />
                  </>
                ) : (
                  <Controller
                    name="body"
                    control={control}
                    rules={{ required: "Body content is required" }}
                    render={({ field, fieldState }) => (
                      <Box>
                        <Box
                          sx={{
                            "& .quill": {
                              borderRadius: 2,
                              border: fieldState.error
                                ? "2px solid #d32f2f"
                                : "1px solid #c4c4c4",
                            },
                            "& .ql-container": {
                              minHeight: "250px",
                              fontSize: "14px",
                              borderBottomLeftRadius: 2,
                              borderBottomRightRadius: 2,
                              fontFamily: theme.typography.fontFamily,
                            },
                            "& .ql-toolbar": {
                              borderTopLeftRadius: 2,
                              borderTopRightRadius: 2,
                              backgroundColor: "#f5f5f5",
                            },
                            "& .ql-editor": {
                              minHeight: "250px",
                            },
                            "& .ql-editor.ql-blank::before": {
                              fontStyle: "normal",
                              color: "#9e9e9e",
                            },
                          }}
                        >
                          <ReactQuill
                            theme="snow"
                            value={field.value}
                            onChange={field.onChange}
                            modules={modules}
                            formats={formats}
                            placeholder="✨ Write your template content here... You can use AI to help generate content!"
                          />
                        </Box>
                        {fieldState.error && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 1, ml: 2, display: "block" }}
                          >
                            {fieldState.error.message}
                          </Typography>
                        )}
                      </Box>
                    )}
                  />
                )}
              </Grid>

              {/* Attachment Type */}
              <Grid item xs={12} sm={4}>
                {mode === "view" ? (
                  <>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      Attachment Type
                    </Typography>
                    <Box
                      sx={{
                        padding: 1.5,
                        borderRadius: 2,
                        backgroundColor: "#f5f5f5",
                        border: "1px solid #e0e0e0",
                        textTransform: "uppercase",
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      {displayData?.attachmentType || "-"}
                    </Box>
                  </>
                ) : (
                  <Controller
                    name="attachmentType"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small">
                        <InputLabel>Attachment Type</InputLabel>
                        <Select
                          {...field}
                          label="Attachment Type"
                          disabled={isSaving}
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="excel">Excel</MenuItem>
                          <MenuItem value="csv">CSV</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                )}
              </Grid>

              {/* File Name */}
              <Grid item xs={12} sm={4}>
                {mode === "view" ? (
                  <>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      File Name
                    </Typography>
                    <Box
                      sx={{
                        padding: 1.5,
                        borderRadius: 2,
                        backgroundColor: "#f5f5f5",
                        border: "1px solid #e0e0e0",
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      {displayData?.attachmentFileName || "-"}
                    </Box>
                  </>
                ) : (
                  <Controller
                    name="attachmentFileName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="File Name"
                        placeholder="Enter file name"
                        variant="outlined"
                        fullWidth
                        size="small"
                        disabled={isSaving}
                        InputProps={{
                          sx: { borderRadius: 2 },
                        }}
                      />
                    )}
                  />
                )}
              </Grid>

              {/* Field List */}
              <Grid item xs={12} sm={4}>
                {mode === "view" ? (
                  <>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      Field List
                    </Typography>
                    <Box
                      sx={{
                        padding: 1.5,
                        borderRadius: 2,
                        backgroundColor: "#f5f5f5",
                        border: "1px solid #e0e0e0",
                        minHeight: "56px",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                        alignItems: "center",
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      {displayData?.attachmentFieldList?.length
                        ? displayData.attachmentFieldList.map(
                            (label: string, index: number) => (
                              <Chip
                                key={index}
                                label={label}
                                size="small"
                                sx={{ backgroundColor: "#e3f2fd" }}
                              />
                            )
                          )
                        : "-"}
                    </Box>
                  </>
                ) : (
                  <Controller
                    name="attachmentFieldList"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small">
                        <InputLabel>Field List</InputLabel>
                        <Select
                          {...field}
                          multiple
                          label="Field List"
                          disabled={isSaving || !selectedDataSourceId}
                          sx={{ borderRadius: 2 }}
                          input={<OutlinedInput label="Field List" />}
                          renderValue={(selected) => (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {(selected as string[]).map((value) => (
                                <Chip key={value} label={value} size="small" />
                              ))}
                            </Box>
                          )}
                        >
                          {availableFields.map((field: FieldSetting) => (
                            <MenuItem key={field.label} value={field.label}>
                              {field.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                )}
              </Grid>

              {/* Group By Section */}
              <Grid item xs={12}>
                {mode === "view" ? (
                  <>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      Group By
                    </Typography>
                    <Box
                      sx={{
                        padding: 1.5,
                        borderRadius: 2,
                        backgroundColor: "#f5f5f5",
                        border: "1px solid #e0e0e0",
                        minHeight: "56px",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                        alignItems: "center",
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      {displayData?.groupBy?.length
                        ? displayData.groupBy.map(
                            (label: string, index: number) => (
                              <Chip
                                key={index}
                                label={label}
                                size="small"
                                color="primary"
                              />
                            )
                          )
                        : "-"}
                    </Box>
                  </>
                ) : (
                  <Controller
                    name="groupBy"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small">
                        <InputLabel>Group By</InputLabel>
                        <Select
                          {...field}
                          multiple
                          label="Group By"
                          disabled={isSaving}
                          sx={{ borderRadius: 2 }}
                          input={<OutlinedInput label="Group By" />}
                          renderValue={(selected) => (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {(selected as string[]).map((value) => (
                                <Chip
                                  key={value}
                                  label={value}
                                  size="small"
                                  color="primary"
                                />
                              ))}
                            </Box>
                          )}
                        >
                          {availableFields.map((field: FieldSetting) => (
                            <MenuItem key={field.label} value={field.label}>
                              {field.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                )}
              </Grid>
            </Grid>

            {isSaving && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  my: 3,
                  gap: 2,
                }}
              >
                <CircularProgress size={32} />
                <Typography variant="body2" color="text.secondary">
                  {mode === "add"
                    ? "Creating template..."
                    : "Updating template..."}
                </Typography>
              </Box>
            )}
          </form>
        </Box>
      </DialogContainer>
      {/* Preview Modal */}
      <DialogContainer
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title="Email Template Preview"
        maxWidth="md"
        actions={
          <PrimaryButton
            onClick={() => setShowPreview(false)}
            variant="outlined"
          >
            Close Preview
          </PrimaryButton>
        }
      >
        <Box>
          {previewData && (
            <Box>
              {/* Preview Header - Compact */}
              <Box
                sx={{
                  mb: 2,
                  p: 1.5,
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, mb: 0.5 }}
                >
                  {previewData.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {previewData.type === "overall"
                    ? "Overall Report"
                    : "Single Report"}{" "}
                  •{getDataSourceName(previewData.dataSourceId)}
                </Typography>
              </Box>

              {/* Subject Preview - Compact */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 0.5 }}
                >
                  Subject
                </Typography>
                <Box
                  sx={{
                    p: 1.5,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 2,
                    border: "1px solid #e0e0e0",
                    color: theme.palette.text.primary,
                  }}
                >
                  <Typography variant="body2">{previewData.subject}</Typography>
                </Box>
              </Box>

              {/* Body Preview - Compact */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 0.5 }}
                >
                  Body Content
                </Typography>
                <Box
                  sx={{
                    p: 1.5,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 2,
                    border: "1px solid #e0e0e0",
                    minHeight: "150px",
                    maxHeight: "300px",
                    overflow: "auto",
                    fontSize: "0.875rem",
                  }}
                  dangerouslySetInnerHTML={{ __html: previewData.body }}
                />
              </Box>

              {/* Attachment Settings Preview - Compact */}
              {previewData.attachmentType && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 0.5 }}
                  >
                    Attachment Settings
                  </Typography>
                  <Box
                    sx={{
                      p: 1.5,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 2,
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Type:{" "}
                      <span
                        style={{ textTransform: "uppercase", fontWeight: 500 }}
                      >
                        {previewData.attachmentType}
                      </span>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      File Name:{" "}
                      <span style={{ fontWeight: 500 }}>
                        {previewData.attachmentFileName}
                      </span>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Fields:{" "}
                      {previewData.attachmentFieldList.length > 0
                        ? previewData.attachmentFieldList.map(
                            (field: string, index: number) => (
                              <Chip
                                key={index}
                                label={field}
                                size="small"
                                sx={{
                                  ml: 0.5,
                                  backgroundColor: "#e3f2fd",
                                  height: "24px",
                                  fontSize: "0.75rem",
                                }}
                              />
                            )
                          )
                        : "None"}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Group By Preview - Compact */}
              {previewData.groupBy.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 0.5 }}
                  >
                    Group By Fields
                  </Typography>
                  <Box
                    sx={{
                      p: 1.5,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 2,
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {previewData.groupBy.map(
                        (field: string, index: number) => (
                          <Chip
                            key={index}
                            label={field}
                            size="small"
                            color="primary"
                            sx={{ height: "24px", fontSize: "0.75rem" }}
                          />
                        )
                      )}
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </DialogContainer>
    </>
  );

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: 3,
            maxWidth: "900px",
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#888",
              borderRadius: "4px",
              "&:hover": {
                background: "#555",
              },
            },
          }}
        >
          <Box sx={{ p: 4 }}>
            <Typography
              variant="h5"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: theme.palette.primary.main,
                borderBottom: `3px solid ${theme.palette.primary.main}`,
                pb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {mode === "add" && "Add Template"}
              {mode === "edit" && "Edit Template"}
              {mode === "view" && "View Template"}
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                {/* Name Field */}
                <Grid item xs={12} sm={6}>
                  {mode === "view" ? (
                    <>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        Name
                      </Typography>
                      <Box
                        sx={{
                          padding: 1.5,
                          borderRadius: 2,
                          backgroundColor: "#f5f5f5",
                          color: theme.palette.text.primary,
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        {displayData?.name || rowData?.name || "-"}
                      </Box>
                    </>
                  ) : (
                    <Controller
                      name="name"
                      control={control}
                      rules={{ required: "Name is required" }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="Name"
                          placeholder="Enter template name"
                          variant="outlined"
                          fullWidth
                          size="small"
                          required
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          disabled={isSaving}
                          InputProps={{
                            sx: { borderRadius: 2 },
                          }}
                        />
                      )}
                    />
                  )}
                </Grid>

                {/* Code Field */}
                <Grid item xs={12} sm={6}>
                  {mode === "view" ? (
                    <>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        Code
                      </Typography>
                      <Box
                        sx={{
                          padding: 1.5,
                          borderRadius: 2,
                          backgroundColor: "#f5f5f5",
                          color: theme.palette.text.primary,
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        {displayData?.code || rowData?.code || "-"}
                      </Box>
                    </>
                  ) : (
                    <Controller
                      name="code"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="Code"
                          placeholder="Auto-generated from name"
                          variant="outlined"
                          fullWidth
                          size="small"
                          // Removed disabled={mode === "add"} to allow editing in add mode
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          InputProps={{
                            sx: { borderRadius: 2 },
                          }}
                        />
                      )}
                    />
                  )}
                </Grid>

                {/* Subject Field */}
                <Grid item xs={12}>
                  {mode === "view" ? (
                    <>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        Subject
                      </Typography>
                      <Box
                        sx={{
                          padding: 1.5,
                          borderRadius: 2,
                          backgroundColor: "#f5f5f5",
                          color: theme.palette.text.primary,
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        {displayData?.subject || rowData?.subject || "-"}
                      </Box>
                    </>
                  ) : (
                    <Controller
                      name="subject"
                      control={control}
                      rules={{ required: "Subject is required" }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="Subject"
                          placeholder="Enter subject"
                          variant="outlined"
                          fullWidth
                          size="small"
                          required
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          disabled={isSaving}
                          InputProps={{
                            sx: { borderRadius: 2 },
                          }}
                        />
                      )}
                    />
                  )}
                </Grid>

                {/* Type Field */}
                <Grid item xs={12} sm={6}>
                  {mode === "view" ? (
                    <>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        Type
                      </Typography>
                      <Box
                        sx={{
                          padding: 1.5,
                          borderRadius: 2,
                          backgroundColor: "#f5f5f5",
                          color: theme.palette.text.primary,
                          border: "1px solid #e0e0e0",
                          textTransform: "capitalize",
                        }}
                      >
                        {displayData?.type || rowData?.type || "-"}
                      </Box>
                    </>
                  ) : (
                    <Controller
                      name="type"
                      control={control}
                      rules={{ required: "Type is required" }}
                      render={({ field, fieldState }) => (
                        <FormControl
                          fullWidth
                          error={!!fieldState.error}
                          size="small"
                        >
                          <InputLabel required>Type</InputLabel>
                          <Select
                            {...field}
                            label="Type"
                            disabled={isSaving}
                            sx={{ borderRadius: 2 }}
                          >
                            <MenuItem value="overall">Overall</MenuItem>
                            <MenuItem value="single">Single</MenuItem>
                          </Select>
                          {fieldState.error && (
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{ mt: 0.5, ml: 2 }}
                            >
                              {fieldState.error.message}
                            </Typography>
                          )}
                        </FormControl>
                      )}
                    />
                  )}
                </Grid>

                {/* Data Source Field */}
                <Grid item xs={12} sm={6}>
                  {mode === "view" ? (
                    <>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        Data Source
                      </Typography>
                      <Box
                        sx={{
                          padding: 1.5,
                          borderRadius: 2,
                          backgroundColor: "#f5f5f5",
                          color: theme.palette.text.primary,
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        {getDataSourceName(
                          displayData?.dataSourceId ||
                            rowData?.dataSourceId ||
                            ""
                        )}
                      </Box>
                    </>
                  ) : (
                    <Controller
                      name="dataSourceId"
                      control={control}
                      rules={{ required: "Data Source is required" }}
                      render={({ field, fieldState }) => (
                        <FormControl
                          fullWidth
                          error={!!fieldState.error}
                          size="small"
                        >
                          <InputLabel required>Data Source</InputLabel>
                          <Select
                            {...field}
                            label="Data Source"
                            disabled={isSaving}
                            sx={{ borderRadius: 2 }}
                          >
                            {updatedList.map((ds: DataSource) => (
                              <MenuItem key={ds._id} value={ds._id}>
                                {ds.name}
                              </MenuItem>
                            ))}
                          </Select>
                          {fieldState.error && (
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{ mt: 0.5, ml: 2 }}
                            >
                              {fieldState.error.message}
                            </Typography>
                          )}
                        </FormControl>
                      )}
                    />
                  )}
                </Grid>

                {/* Editor Section */}
                <Grid item xs={12}>
                  {mode === "view" ? (
                    <>
                      <Box
                        sx={{
                          padding: 2,
                          borderRadius: 2,
                          backgroundColor: "#f5f5f5",
                          color: theme.palette.text.primary,
                          border: "1px solid #e0e0e0",
                          minHeight: "200px",
                          maxHeight: "400px",
                          overflow: "auto",
                          "& img": {
                            maxWidth: "100%",
                            height: "auto",
                          },
                        }}
                        dangerouslySetInnerHTML={{
                          __html:
                            displayData?.body ||
                            rowData?.body ||
                            "<p>No content</p>",
                        }}
                      />
                    </>
                  ) : (
                    <Controller
                      name="body"
                      control={control}
                      rules={{ required: "Body content is required" }}
                      render={({ field, fieldState }) => (
                        <Box>
                          <Box
                            sx={{
                              "& .quill": {
                                borderRadius: 2,
                                border: fieldState.error
                                  ? "2px solid #d32f2f"
                                  : "1px solid #c4c4c4",
                              },
                              "& .ql-container": {
                                minHeight: "250px",
                                fontSize: "14px",
                                borderBottomLeftRadius: 2,
                                borderBottomRightRadius: 2,
                                fontFamily: theme.typography.fontFamily,
                              },
                              "& .ql-toolbar": {
                                borderTopLeftRadius: 2,
                                borderTopRightRadius: 2,
                                backgroundColor: "#f5f5f5",
                              },
                              "& .ql-editor": {
                                minHeight: "250px",
                              },
                              "& .ql-editor.ql-blank::before": {
                                fontStyle: "normal",
                                color: "#9e9e9e",
                              },
                            }}
                          >
                            <ReactQuill
                              theme="snow"
                              value={field.value}
                              onChange={field.onChange}
                              modules={modules}
                              formats={formats}
                              placeholder="✨ Write your template content here... You can use AI to help generate content!"
                            />
                          </Box>
                          {fieldState.error && (
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{ mt: 1, ml: 2, display: "block" }}
                            >
                              {fieldState.error.message}
                            </Typography>
                          )}
                        </Box>
                      )}
                    />
                  )}
                </Grid>

                {/* Attachment Type */}
                <Grid item xs={12} sm={4}>
                  {mode === "view" ? (
                    <>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        Attachment Type
                      </Typography>
                      <Box
                        sx={{
                          padding: 1.5,
                          borderRadius: 2,
                          backgroundColor: "#f5f5f5",
                          color: theme.palette.text.primary,
                          border: "1px solid #e0e0e0",
                          textTransform: "uppercase",
                        }}
                      >
                        {displayData?.attachmentType || "-"}
                      </Box>
                    </>
                  ) : (
                    <Controller
                      name="attachmentType"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth size="small">
                          <InputLabel>Attachment Type</InputLabel>
                          <Select
                            {...field}
                            label="Attachment Type"
                            disabled={isSaving}
                            sx={{ borderRadius: 2 }}
                          >
                            <MenuItem value="excel">Excel</MenuItem>
                            <MenuItem value="csv">CSV</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  )}
                </Grid>

                {/* File Name */}
                <Grid item xs={12} sm={4}>
                  {mode === "view" ? (
                    <>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        File Name
                      </Typography>
                      <Box
                        sx={{
                          padding: 1.5,
                          borderRadius: 2,
                          backgroundColor: "#f5f5f5",
                          color: theme.palette.text.primary,
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        {displayData?.attachmentFileName || "-"}
                      </Box>
                    </>
                  ) : (
                    <Controller
                      name="attachmentFileName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="File Name"
                          placeholder="Enter file name"
                          variant="outlined"
                          fullWidth
                          size="small"
                          disabled={isSaving}
                          InputProps={{
                            sx: { borderRadius: 2 },
                          }}
                        />
                      )}
                    />
                  )}
                </Grid>

                {/* Field List */}
                <Grid item xs={12} sm={4}>
                  {mode === "view" ? (
                    <>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        Field List
                      </Typography>
                      <Box
                        sx={{
                          padding: 1.5,
                          borderRadius: 2,
                          backgroundColor: "#f5f5f5",
                          color: theme.palette.text.primary,
                          border: "1px solid #e0e0e0",
                          minHeight: "56px",
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                          alignItems: "center",
                        }}
                      >
                        {displayData?.attachmentFieldList?.length
                          ? displayData.attachmentFieldList.map(
                              (label: string, index: number) => (
                                <Chip
                                  key={index}
                                  label={label}
                                  size="small"
                                  sx={{ backgroundColor: "#e3f2fd" }}
                                />
                              )
                            )
                          : "-"}
                      </Box>
                    </>
                  ) : (
                    <Controller
                      name="attachmentFieldList"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth size="small">
                          <InputLabel>Field List</InputLabel>
                          <Select
                            {...field}
                            multiple
                            label="Field List"
                            disabled={isSaving || !selectedDataSourceId}
                            sx={{ borderRadius: 2 }}
                            input={<OutlinedInput label="Field List" />}
                            renderValue={(selected) => (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 0.5,
                                }}
                              >
                                {(selected as string[]).map((value) => (
                                  <Chip
                                    key={value}
                                    label={value}
                                    size="small"
                                  />
                                ))}
                              </Box>
                            )}
                          >
                            {availableFields.map((field: FieldSetting) => (
                              <MenuItem key={field.label} value={field.label}>
                                {field.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  )}
                </Grid>

                {/* Group By Section */}
                <Grid item xs={12}>
                  {mode === "view" ? (
                    <>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        Group By
                      </Typography>
                      <Box
                        sx={{
                          padding: 1.5,
                          borderRadius: 2,
                          backgroundColor: "#f5f5f5",
                          color: theme.palette.text?.primary,
                          border: "1px solid #e0e0e0",
                          minHeight: "56px",
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                          alignItems: "center",
                        }}
                      >
                        {displayData?.groupBy?.length
                          ? displayData.groupBy.map(
                              (label: string, index: number) => (
                                <Chip
                                  key={index}
                                  label={label}
                                  size="small"
                                  color="primary"
                                />
                              )
                            )
                          : "-"}
                      </Box>
                    </>
                  ) : (
                    <Controller
                      name="groupBy"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth size="small">
                          <InputLabel>Group By</InputLabel>
                          <Select
                            {...field}
                            multiple
                            label="Group By"
                            disabled={isSaving}
                            sx={{ borderRadius: 2 }}
                            input={<OutlinedInput label="Group By" />}
                            renderValue={(selected) => (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 0.5,
                                }}
                              >
                                {(selected as string[]).map((value) => (
                                  <Chip
                                    key={value}
                                    label={value}
                                    size="small"
                                    color="primary"
                                  />
                                ))}
                              </Box>
                            )}
                          >
                            {availableFields.map((field: FieldSetting) => (
                              <MenuItem key={field.label} value={field.label}>
                                {field.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  )}
                </Grid>
              </Grid>

              {isSaving && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    my: 3,
                    gap: 2,
                  }}
                >
                  <CircularProgress size={32} />
                  <Typography variant="body2" color="text.secondary">
                    {mode === "add"
                      ? "Creating template..."
                      : "Updating template..."}
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 4,
                  pt: 3,
                  borderTop: "1px solid #e0e0e0",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={onClose}
                  size="large"
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    textTransform: "none",
                    fontWeight: 500,
                  }}
                >
                  {mode === "view" ? "Close" : "Cancel"}
                </Button>

                {mode !== "view" && (
                  <>
                    <Button
                      variant="outlined"
                      onClick={handlePreview}
                      size="large"
                      disabled={!isFormDirty || isSaving}
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        textTransform: "none",
                        fontWeight: 500,
                      }}
                    >
                      Preview
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={!isFormValid || !isFormDirty || isSaving}
                      size="large"
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        textTransform: "none",
                        fontWeight: 500,
                        boxShadow: 3,
                        "&:hover": {
                          boxShadow: 6,
                        },
                      }}
                    >
                      {mode === "add" ? "Save Template" : "Update Template"}
                    </Button>
                  </>
                )}
              </Box>
            </form>
          </Box>
        </Paper>
      </Modal>

      {/* Preview Modal */}
      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: `2px solid ${theme.palette.primary.main}`,
            pb: 2,
            fontWeight: 600,
            color: theme.palette.primary.main,
            fontSize: "1.25rem",
          }}
        >
          Email Template Preview
        </DialogTitle>
        <DialogContent sx={{ p: 3, overflowY: "auto" }}>
          {previewData && (
            <Box>
              {/* Preview Header - Compact */}
              <Box
                sx={{
                  mb: 2,
                  p: 1.5,
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, mb: 0.5 }}
                >
                  {previewData.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {previewData.type === "overall"
                    ? "Overall Report"
                    : "Single Report"}{" "}
                  •{getDataSourceName(previewData.dataSourceId)}
                </Typography>
              </Box>

              {/* Subject Preview - Compact */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 0.5 }}
                >
                  Subject
                </Typography>
                <Box
                  sx={{
                    p: 1.5,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 2,
                    border: "1px solid #e0e0e0",
                    color: theme.palette.text.primary,
                  }}
                >
                  <Typography variant="body2">{previewData.subject}</Typography>
                </Box>
              </Box>

              {/* Body Preview - Compact */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 0.5 }}
                >
                  Body Content
                </Typography>
                <Box
                  sx={{
                    p: 1.5,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 2,
                    border: "1px solid #e0e0e0",
                    minHeight: "150px",
                    maxHeight: "300px",
                    overflow: "auto",
                    fontSize: "0.875rem",
                  }}
                  dangerouslySetInnerHTML={{ __html: previewData.body }}
                />
              </Box>

              {/* Attachment Settings Preview - Compact */}
              {previewData.attachmentType && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 0.5 }}
                  >
                    Attachment Settings
                  </Typography>
                  <Box
                    sx={{
                      p: 1.5,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 2,
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Type:{" "}
                      <span
                        style={{ textTransform: "uppercase", fontWeight: 500 }}
                      >
                        {previewData.attachmentType}
                      </span>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      File Name:{" "}
                      <span style={{ fontWeight: 500 }}>
                        {previewData.attachmentFileName}
                      </span>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Fields:{" "}
                      {previewData.attachmentFieldList.length > 0
                        ? previewData.attachmentFieldList.map(
                            (field: string, index: number) => (
                              <Chip
                                key={index}
                                label={field}
                                size="small"
                                sx={{
                                  ml: 0.5,
                                  backgroundColor: "#e3f2fd",
                                  height: "24px",
                                  fontSize: "0.75rem",
                                }}
                              />
                            )
                          )
                        : "None"}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Group By Preview - Compact */}
              {previewData.groupBy.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 0.5 }}
                  >
                    Group By Fields
                  </Typography>
                  <Box
                    sx={{
                      p: 1.5,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 2,
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {previewData.groupBy.map(
                        (field: string, index: number) => (
                          <Chip
                            key={index}
                            label={field}
                            size="small"
                            color="primary"
                            sx={{ height: "24px", fontSize: "0.75rem" }}
                          />
                        )
                      )}
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
          <Button
            onClick={() => setShowPreview(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 4,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Close Preview
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
