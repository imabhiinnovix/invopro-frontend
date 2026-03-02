import * as React from "react";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Modal,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { StyledButton } from "../../components/common";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import useGet from "../../hooks/useGet";
import usePut from "../../hooks/usePut";
import usePostMultipart from "../../hooks/usePostMultipart";
import { GET, POST, PUT } from "../../services/apiRoutes";

interface Vendor {
  _id: string;
  name: string;
}

interface EngagementLetterPayload {
  vendorId: string;
  referenceNumber: string;
  description: string;
  startDate: string;
  endDate: string;
  engagementLetterStatus: "in-force" | "expired";
  files?: File; // ✅ include optional files here
}

interface EngagementLetterResponse {
  success: boolean;
  data?: any;
  message?: string;
}

interface EngagementLetter {
  _id: string;
  vendorId?: {
    _id: string;
    name: string;
  };
  referenceNumber: string;
  description: string;
  startDate: string;
  endDate: string;
  engagementLetterStatus: "in-force" | "expired";
  engagementLetterFileName?: string;
  engagementLetterFilePath?: string;
}

interface EngagementLetterModalProps {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit" | "view";
  editId?: string | null;
  rowData?: EngagementLetter | null;
  onCreated?: () => void;
  onUpdated?: () => void;
}

export function EngagementLetterModal({
  open,
  onClose,
  mode,
  editId,
  rowData,
  onCreated,
  onUpdated,
}: EngagementLetterModalProps) {
  const theme = useUnifiedTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { control, handleSubmit, reset, formState } =
    useForm<EngagementLetterPayload>({
      defaultValues: {
        vendorId: "",
        referenceNumber: "",
        description: "",
        startDate: "",
        endDate: "",
        engagementLetterStatus: "in-force",
      },
      mode: "onChange",
    });

  // Vendor list
  const vendorList = useGet<{ success: boolean; data: Vendor[] }>(
    ["vendorList"],
    GET.Vendor_List,
    true
  );

  // ✅ CREATE using multipart hook
  const createEngagementLetter = usePostMultipart<
    EngagementLetterPayload,
    EngagementLetterResponse
  >(
    ["createEngagementLetter"],
    (data) => {
      if (data?.success) {
        onCreated?.();
        onClose();
      }
    },
    true
  );

  // UPDATE using existing PUT hook
  const updateEngagementLetter = usePut<EngagementLetterPayload, EngagementLetterResponse>(
    ["updateEngagementLetter"],
    (data) => {
      if (data?.success) {
        onUpdated?.();
        onClose();
      }
    },
    true
  );

  useEffect(() => {
    if (open) {
      if (mode === "edit" || mode === "view") {
        reset({
          vendorId: rowData?.vendorId?._id || "",
          referenceNumber: rowData?.referenceNumber || "",
          description: rowData?.description || "",
          startDate: rowData?.startDate?.split("T")[0] || "",
          endDate: rowData?.endDate?.split("T")[0] || "",
          engagementLetterStatus: rowData?.engagementLetterStatus || "in-force",
        });
      } else {
        reset({
          vendorId: "",
          referenceNumber: "",
          description: "",
          startDate: "",
          endDate: "",
          engagementLetterStatus: "in-force",
        });
      }
      setSelectedFile(null);
    }
  }, [open, mode, rowData, reset]);

  const onSubmit = (data: EngagementLetterPayload) => {
    const payload: EngagementLetterPayload = {
      ...data,
      files: selectedFile || undefined, // ✅ add file to payload
    };

    if (mode === "add") {
      createEngagementLetter.mutate({
        url: POST.Create_Engagement_Letter,
        payload,
      });
    } else if (mode === "edit" && editId) {
      updateEngagementLetter.mutate({
        url: `${PUT.UPDATE_ENGAGEMENT_LETTER}${editId}`,
        payload,
      });
    }
  };

  const isSaving = createEngagementLetter.isPending || updateEngagementLetter.isLoading;
  const isFormValid = formState.isValid;
  const isFormDirty = formState.isDirty;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderRadius: "8px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
          p: 3,
          width: "500px",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          {mode === "add" ? "Add Engagement Letter" : mode === "edit" ? "Edit Engagement Letter" : "View Engagement Letter"}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            {/* Vendor */}
            <Grid item xs={12}>
              {mode === "view" ? (
                <Box sx={{ p: 1.5, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
                  {rowData?.vendorId?.name || "-"}
                </Box>
              ) : (
                <Controller
                  name="vendorId"
                  control={control}
                  rules={{ required: "Vendor is required" }}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth size="small" error={!!fieldState.error}>
                      <InputLabel>Vendor *</InputLabel>
                      <Select {...field} label="Vendor *" disabled={isSaving}>
                        {vendorList.data?.data?.map((vendor) => (
                          <MenuItem key={vendor._id} value={vendor._id}>
                            {vendor.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              )}
            </Grid>

            {/* Reference Number */}
            <Grid item xs={12}>
              <Controller
                name="referenceNumber"
                control={control}
                rules={{ required: "Reference number is required" }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Reference Number *"
                    fullWidth
                    size="small"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message || " "}
                    disabled={mode === "view" || isSaving}
                  />
                )}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                    disabled={mode === "view" || isSaving}
                  />
                )}
              />
            </Grid>

            {/* Dates */}
            <Grid item xs={6}>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Start Date"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    disabled={mode === "view" || isSaving}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="End Date"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    disabled={mode === "view" || isSaving}
                  />
                )}
              />
            </Grid>

            {/* Engagement Status */}
            <Grid item xs={12}>
              <Controller
                name="engagementLetterStatus"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel>Engagement Status</InputLabel>
                    <Select {...field} label="Engagement Status" disabled={mode === "view" || isSaving}>
                      <MenuItem value="in-force">In Force</MenuItem>
                      <MenuItem value="expired">Expired</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* File Upload */}
            <Grid item xs={12}>
              {mode === "view" ? (
                rowData?.engagementLetterFilePath ? (
                  <a href={rowData.engagementLetterFilePath} target="_blank" rel="noopener noreferrer">
                    View Engagement Letter File
                  </a>
                ) : (
                  "-"
                )
              ) : (
                <>
                  <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} disabled={isSaving} />
                  {rowData?.engagementLetterFileName && (
                    <Typography variant="caption" display="block">
                      Current File: {rowData.engagementLetterFileName}
                    </Typography>
                  )}
                </>
              )}
            </Grid>
          </Grid>

          {isSaving && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}>
            <StyledButton variant="secondary" onClick={onClose}>
              Cancel
            </StyledButton>

            {mode !== "view" && (
              <StyledButton type="submit" variant="primary" disabled={!isFormValid || !isFormDirty || isSaving}>
                Save
              </StyledButton>
            )}
          </Box>
        </form>
      </Box>
    </Modal>
  );
}