import * as React from "react";
import { useState, useEffect } from "react";
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

// Define the FieldSetting interface
interface FieldSetting {
  attributeId: string;
  refAttributeId: string[];
  label: string;
  isFilterEnable?: boolean;
  isDashboardFilter?: boolean;
  isSortingEnable?: boolean;
  isDisplayEnable?: boolean;
  isDerived?: boolean;
  type?: string;
  mappedAttributeName?: string;
  optionAttributeId?: string | null;
}

interface Template {
  _id: string;
  name: string;
  code: string;
  subject: string;
  body: string;
  type: string;
  dataSourceId: string;
  attachmentType?: string;
  attachmentFileName?: string;
  attachmentFieldList?: FieldSetting[];
  groupBy?: FieldSetting[];
  status: string;
}

interface DataSource {
  _id: string;
  name: string;
  fieldSettings?: FieldSetting[];
  isShowMenu?: boolean;
}

interface TemplateFormData {
  name: string;
  code: string;
  subject: string;
  body: string;
  type: string;
  dataSourceId: string;
  attachmentType: string;
  attachmentFileName: string;
  attachmentFieldList: string[]; // Store labels as strings
  groupBy: string[]; // Store labels as strings
}

interface AttachmentFieldItem {
  attributeId: string;
  refAttributeId?: string[];
}

interface AttachmentSettings {
  type: string;
  fileName: string;
  fieldList: AttachmentFieldItem[];
}

interface GroupByItem {
  attributeId: string;
  refAttributeId: string[];
}

interface TemplatePostPayload extends TemplateFormData {
  attachmentSettings: AttachmentSettings;
  groupBy: GroupByItem[];
}

interface TemplatePostResponse {
  success: boolean;
  data?: any;
  message?: string;
}

interface TemplateModalProps {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit" | "view";
  editTemplateId?: string;
  rowData?: Template | null;
  onTemplateCreated?: () => void;
  onTemplateUpdated?: () => void;
}

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

  // Watch name field for transformation
  const watchedName = watch("name");

  // Transform name to code: lowercase and replace spaces with underscores
  useEffect(() => {
    if (watchedName) {
      const transformedCode = watchedName.toLowerCase().replace(/\s+/g, "_");
      // Only update code if it's empty or in add mode, or if code hasn't been manually edited
      if (!formState.dirtyFields.code || mode === "add") {
        setValue("code", transformedCode, { shouldValidate: true });
      }
    } else {
      // If name is empty, set code to empty
      if (!formState.dirtyFields.code || mode === "add") {
        setValue("code", "", { shouldValidate: true });
      }
    }
  }, [watchedName, setValue, formState.dirtyFields, mode]);

  // Create and update template mutations

  // const createTemplate = usePost<TemplatePostPayload, TemplatePostResponse>(
  //   ["createTemplate"],
  //   (data) => {
  //           console.log("Create designation response:", data);

  //     if (data?.success) {

  //       console.log("✅ Template created successfully:", data);
  //       onTemplateCreated?.();
  //       onClose();
  //     } else {
  //       console.error("❌ Failed to create Template:", data?.message);
  //     }
  //   },
  //   true,
  //   (error) => {
  //     // Handle specific error cases if needed
  //     console.error("❌ Error creating template:", error);
  //   }
  // );
  // const updateTemplate = usePut<TemplatePostPayload, TemplatePostResponse>(
  //   ["updateTemplate"],
  //   (data) => {
  //     if (data?.success) {
  //       console.log("✅ Template updated successfully:", data);
  //       onTemplateUpdated?.();
  //       onClose();
  //     } else {
  //       console.error("❌ Failed to update Template:", data?.message);
  //     }
  //   },
  //   true
  // );
  // Update the createTemplate and updateTemplate hooks in TemplateModal

  const createTemplate = usePost<TemplatePostPayload, TemplatePostResponse>(
    ["createTemplate"],
    (data) => {
      console.log("✅ Create template response:", data);

      // ✅ Only execute if truly successful
      if (data?.success) {
        console.log("✅ Template created successfully");

        // Close modal first
        onClose();

        // Then trigger reload
        setTimeout(() => {
          onTemplateCreated?.();
        }, 100);
      } else {
        console.error("❌ Failed to create Template:", data?.message);
        // Error toast will be handled by usePost hook
      }
    },
    true, // Show toast
    (error) => {
      console.error("❌ Error creating template:", error);
      // Error handling is done in usePost, but you can add additional logic here
    }
  );

  const updateTemplate = usePut<TemplatePostPayload, TemplatePostResponse>(
    ["updateTemplate"],
    (data) => {
      console.log("✅ Update template response:", data);

      // ✅ Only execute if truly successful
      if (data?.success) {
        console.log("✅ Template updated successfully");

        // Close modal first
        onClose();

        // Then trigger reload
        setTimeout(() => {
          onTemplateUpdated?.();
        }, 100);
      } else {
        console.error("❌ Failed to update Template:", data?.message);
        // Error toast will be handled by usePut hook
      }
    },
    true // Show toast
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

  // Reset form when modal opens or mode/rowData changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" || mode === "view") {
        // Pre-fill form with existing data
        const formData = {
          name: rowData?.name || "",
          code: rowData?.code || "",
          subject: rowData?.subject || "",
          body: rowData?.body || "",
          type: rowData?.type || "",
          dataSourceId: rowData?.dataSourceId || "",
          attachmentType: rowData?.attachmentType || "",
          attachmentFileName: rowData?.attachmentFileName || "",
          attachmentFieldList:
            rowData?.attachmentFieldList?.map((fs) => fs.label) || [],
          groupBy: rowData?.groupBy?.map((fs) => fs.label) || [],
        };

        console.log(
          `📝 ${mode === "edit" ? "Edit" : "View"} mode - Loading data:`,
          formData
        );
        reset(formData);
      } else {
        // Clear form for add mode
        console.log("🆕 Add mode - Initializing empty form");
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
    }
  }, [open, mode, rowData, reset]);

  // Get selected data source and its field settings
  const selectedDataSourceId = watch("dataSourceId");
  const selectedDataSource = updatedList.find(
    (ds) => ds._id === selectedDataSourceId
  );
  const availableFields = selectedDataSource?.fieldSettings || [];

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

  // const onSubmit = (data: TemplateFormData) => {
  //   console.log("\n╔════════════════════════════════════════╗");
  //   console.log("║   TEMPLATE FORM SUBMISSION             ║");
  //   console.log("╚════════════════════════════════════════╝");
  //   console.log(`📋 Mode: ${mode.toUpperCase()}`);
  //   console.log(`🆔 Template ID: ${editTemplateId || "N/A (New)"}`);
  //   console.log("\n📝 Form Data:");
  //   console.log("  Name:", data.name);
  //   console.log("  Code:", data.code);
  //   console.log("  Subject:", data.subject);
  //   console.log("  Body (HTML):", data.body);
  //   console.log("  Type:", data.type);
  //   console.log("  Data Source ID:", data.dataSourceId);
  //   console.log("\n📎 Attachment Settings:");
  //   console.log("  Type:", data.attachmentType || "Not specified");
  //   console.log("  File Name:", data.attachmentFileName || "Not specified");
  //   console.log(
  //     "  Field List:",
  //     data.attachmentFieldList.length
  //       ? data.attachmentFieldList
  //       : "None selected"
  //   );
  //   console.log(
  //     "\n📊 Group By:",
  //     data.groupBy.length ? data.groupBy : "None selected"
  //   );
  //   console.log("════════════════════════════════════════\n");

  //   const fieldList = transformLabelsToAttachmentFieldItems(
  //     data.attachmentFieldList
  //   );

  //   // Build attachmentSettings as an array
  //   const attachmentSettings = data.attachmentType
  //     ? [
  //         {
  //           type: data.attachmentType,
  //           fileName: data.attachmentFileName || "",
  //           fieldList,
  //         },
  //       ]
  //     : [];

  //   const groupBy = transformLabelsToGroupByItems(data.groupBy);

  //   const payload: TemplatePostPayload = {
  //     name: data.name,
  //     code: data.code,
  //     subject: data.subject,
  //     body: data.body,
  //     type: data.type,
  //     dataSourceId: data.dataSourceId,
  //     attachmentSettings, // ✅ now always an array
  //     groupBy,
  //   };

  //   console.log("🔍 Backend Payload:", JSON.stringify(payload, null, 2));

  //   if (mode === "add") {
  //     console.log("🚀 Creating new template...");
  //     createTemplate.mutate({
  //       url: POST.CREATE_TEMPLATE,
  //       payload,
  //     });
  //   } else if (mode === "edit" && editTemplateId) {
  //     console.log("🔄 Updating template...");
  //     updateTemplate.mutate({
  //       url: `${PUT.UPDATE_TEMPLATE}/${editTemplateId}`,
  //       payload,
  //     });
  //   }
  // };
  // const onSubmit = (data: TemplateFormData) => {
  //     console.log("\n╔════════════════════════════════════════╗");
  //     console.log("║   TEMPLATE FORM SUBMISSION             ║");
  //     console.log("╚════════════════════════════════════════╝");
  //     console.log(`📋 Mode: ${mode.toUpperCase()}`);
  //     console.log(`🆔 Template ID: ${editTemplateId || "N/A (New)"}`);
  //     console.log("\n📝 Form Data:");
  //     console.log("  Name:", data.name);
  //     console.log("  Code:", data.code);
  //     console.log("  Subject:", data.subject);
  //     console.log("  Body (HTML):", data.body);
  //     console.log("  Type:", data.type);
  //     console.log("  Data Source ID:", data.dataSourceId);
  //     console.log("\n📎 Attachment Settings:");
  //     console.log("  Type:", data.attachmentType || "Not specified");
  //     console.log("  File Name:", data.attachmentFileName || "Not specified");
  //     console.log(
  //       "  Field List:",
  //       data.attachmentFieldList.length
  //         ? data.attachmentFieldList
  //         : "None selected"
  //     );
  //     console.log(
  //       "\n📊 Group By:",
  //       data.groupBy.length ? data.groupBy : "None selected"
  //     );
  //     console.log("════════════════════════════════════════\n");

  //     const fieldList = transformLabelsToAttachmentFieldItems(
  //       data.attachmentFieldList
  //     );

  //     const groupBy = transformLabelsToGroupByItems(data.groupBy);

  //     // Build attachmentSettings - check what format your backend expects
  //     const attachmentSettings = data.attachmentType
  //       ? {
  //           type: data.attachmentType,
  //           fileName: data.attachmentFileName || "",
  //           fieldList,
  //         }
  //       : undefined;

  //     const payload: any = {
  //       name: data.name,
  //       code: data.code,
  //       subject: data.subject,
  //       body: data.body,
  //       type: data.type,
  //       dataSourceId: data.dataSourceId,
  //       groupBy,
  //     };

  //     // Only add attachmentSettings if it exists
  //     if (attachmentSettings) {
  //       payload.attachmentSettings = attachmentSettings;
  //     }

  //     console.log("🔍 Backend Payload:", JSON.stringify(payload, null, 2));

  //     if (mode === "add") {
  //       console.log("🚀 Creating new template...");
  //       createTemplate.mutate({
  //         url: POST.CREATE_TEMPLATE,
  //         payload,
  //       });
  //     } else if (mode === "edit" && editTemplateId) {
  //       console.log("🔄 Updating template...");
  //       updateTemplate.mutate({
  //         url: `${PUT.UPDATE_TEMPLATE}/${editTemplateId}`,
  //         payload,
  //       });
  //     }
  //   };


  const onSubmit = (data: TemplateFormData) => {
    console.log("\n╔════════════════════════════════════════╗");
    console.log("║   TEMPLATE FORM SUBMISSION             ║");
    console.log("╚════════════════════════════════════════╝");
    console.log(`📋 Mode: ${mode.toUpperCase()}`);
    console.log(`🆔 Template ID: ${editTemplateId || "N/A (New)"}`);
    console.log("\n📝 Form Data:");
    console.log("  Name:", data.name);
    console.log("  Code:", data.code);
    console.log("  Subject:", data.subject);
    console.log("  Body (HTML):", data.body);
    console.log("  Type:", data.type);
    console.log("  Data Source ID:", data.dataSourceId);
    console.log("\n📎 Attachment Settings:");
    console.log("  Type:", data.attachmentType || "Not specified");
    console.log("  File Name:", data.attachmentFileName || "Not specified");
    console.log(
      "  Field List:",
      data.attachmentFieldList.length
        ? data.attachmentFieldList
        : "None selected"
    );
    console.log(
      "\n📊 Group By:",
      data.groupBy.length ? data.groupBy : "None selected"
    );
    console.log("════════════════════════════════════════\n");

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

    // ✅ Add current date to subject
    const currentDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }); // Format: DD/MM/YYYY
    
    const subjectWithDate = `${data.subject} - ${currentDate}`;

    const payload: TemplatePostPayload = {
      name: data.name,
      code: data.code,
      subject: subjectWithDate, // ✅ Subject with date appended
      body: data.body,
      type: data.type,
      dataSourceId: data.dataSourceId,
      attachmentSettings, // ✅ now always an array
      groupBy,
    };

    console.log("🔍 Backend Payload:", JSON.stringify(payload, null, 2));
    console.log(`📅 Subject with Date: ${subjectWithDate}`);

    if (mode === "add") {
      console.log("🚀 Creating new template...");
      createTemplate.mutate({
        url: POST.CREATE_TEMPLATE,
        payload,
      });
    } else if (mode === "edit" && editTemplateId) {
      console.log("🔄 Updating template...");
      updateTemplate.mutate({
        url: `${PUT.UPDATE_TEMPLATE}/${editTemplateId}`,
        payload,
      });
    }
  };
  const isFormValid = formState.isValid;
  const isFormDirty = formState.isDirty;
  const isSaving = createTemplate.isLoading || updateTemplate.isLoading;

  // Helper function to get data source name
  const getDataSourceName = (id: string) => {
    // Use the Redux state instead of API call to avoid 404 error
    return list?.find((ds: DataSource) => ds._id === id)?.name || "-";
  };

  return (
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
            {mode === "add" && "➕ Create New Template"}
            {mode === "edit" && "✏️ Edit Template"}
            {mode === "view" && "👁️ View Template"}
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* Basic Information Section */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  📋 Basic Information
                </Typography>
              </Grid>

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
                      {rowData?.name || "-"}
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
                      {rowData?.code || "-"}
                    </Box>
                  </>
                ) : (
                  <Controller
                    name="code"
                    control={control}
                    // rules={{ required: "Code is required" }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Code"
                        placeholder="Auto-generated from name"
                        variant="outlined"
                        fullWidth
                        size="small"
                        disabled={mode === "add"} // Only disabled in add mode
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
                      {rowData?.subject || "-"}
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
                      {rowData?.type || "-"}
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
                      {getDataSourceName(rowData?.dataSourceId || "")}
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

              {/* Attachment Settings Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  📎 Attachment Settings
                </Typography>
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
                      {rowData?.attachmentType || "-"}
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
                      {rowData?.attachmentFileName || "-"}
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
                      {rowData?.attachmentFieldList?.length
                        ? rowData.attachmentFieldList.map(
                            (field: FieldSetting) => (
                              <Chip
                                key={field.attributeId}
                                label={field.label}
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
                      sx={{ mb: 1, fontWeight: 600 }}
                    >
                      Group By
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
                      {rowData?.groupBy?.length
                        ? rowData.groupBy.map((group: FieldSetting) => (
                            <Chip
                              key={group.attributeId}
                              label={group.label}
                              size="small"
                              color="primary"
                            />
                          ))
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

              {/* Editor Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  📝 Body Content
                </Typography>
              </Grid>

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
                        __html: rowData?.body || "<p>No content</p>",
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
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={!isFormValid || !isFormDirty || isSaving}
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
                  {mode === "add" ? "Create Template" : "Update Template"}
                </Button>
              )}
            </Box>
          </form>
        </Box>
      </Paper>
    </Modal>
  );
}
