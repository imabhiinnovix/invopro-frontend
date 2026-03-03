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

interface LegalDocumentPayload {
  vendorId: string;
  documentName: string;
  documentDescription: string;
  referenceNumber?: string;
  startDate?: string;
  endDate?: string;
  status: "active" | "expired";
  files?: File;
}

interface LegalDocumentResponse {
  success: boolean;
  data?: any;
  message?: string;
}

interface LegalDocument {
  _id: string;
  vendorId?: {
    _id: string;
    name: string;
  };
  documentName: string;
  documentDescription: string;
  referenceNumber?: string;
  startDate?: string;
  endDate?: string;
  status: "active" | "expired";
  legalDocumentFileName?: string;
  legalDocumentFilePath?: string;
}

interface LegalDocumentModalProps {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit" | "view";
  editId?: string | null;
  rowData?: LegalDocument | null;
  onCreated?: () => void;
  onUpdated?: () => void;
}

export function LegalDocumentModal({
  open,
  onClose,
  mode,
  editId,
  rowData,
  onCreated,
  onUpdated,
}: LegalDocumentModalProps) {
  const theme = useUnifiedTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState } =
    useForm<LegalDocumentPayload>({
      defaultValues: {
        vendorId: "",
        documentName: "",
        documentDescription: "",
        referenceNumber: "",
        startDate: "",
        endDate: "",
        status: "active",
      },
      mode: "onChange",
    });

  const vendorList = useGet<{ success: boolean; data: Vendor[] }>(
    ["vendorList"],
    GET.Vendor_List,
    true
  );

  const createLegalDocument = usePostMultipart<
    LegalDocumentPayload,
    LegalDocumentResponse
  >(
    ["createLegalDocument"],
    (data) => {
      if (data?.success) {
        onCreated?.();
        onClose();
      }
    },
    true
  );

  const updateLegalDocument = usePut<
    LegalDocumentPayload,
    LegalDocumentResponse
  >(
    ["updateLegalDocument"],
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
          documentName: rowData?.documentName || "",
          documentDescription: rowData?.documentDescription || "",
          referenceNumber: rowData?.referenceNumber || "",
          startDate: rowData?.startDate?.split("T")[0] || "",
          endDate: rowData?.endDate?.split("T")[0] || "",
          status: rowData?.status || "active",
        });
      } else {
        reset({
          vendorId: "",
          documentName: "",
          documentDescription: "",
          referenceNumber: "",
          startDate: "",
          endDate: "",
          status: "active",
        });
      }
      setSelectedFile(null);
      setFileError(null);
    }
  }, [open, mode, rowData, reset]);

  const onSubmit = (data: LegalDocumentPayload) => {
    // ✅ File required only in ADD mode
    if (mode === "add" && !selectedFile) {
      setFileError("Document file is required");
      return;
    }

    setFileError(null);

    const payload: LegalDocumentPayload = {
      ...data,
      files: selectedFile || undefined,
    };

    if (mode === "add") {
      createLegalDocument.mutate({
        url: POST.Create_Legal_Document,
        payload,
      });
    } else if (mode === "edit" && editId) {
      updateLegalDocument.mutate({
        url: `${PUT.UPDATE_LEGAL_DOCUMENT}${editId}`,
        payload,
      });
    }
  };

  const isSaving =
    createLegalDocument.isPending || updateLegalDocument.isLoading;

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
          width: "520px",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          {mode === "add"
            ? "Add Legal Document"
            : mode === "edit"
            ? "Edit Legal Document"
            : "View Legal Document"}
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
                  render={({ field }) => (
                    <FormControl fullWidth size="small">
                      <InputLabel>Vendor *</InputLabel>
                      <Select {...field} label="Vendor *">
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

            {/* Document Name */}
            <Grid item xs={12}>
              <Controller
                name="documentName"
                control={control}
                rules={{ required: "Document name is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Document Name *"
                    fullWidth
                    size="small"
                    disabled={mode === "view" || isSaving}
                  />
                )}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <Controller
                name="documentDescription"
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

            {/* Reference Number */}
            <Grid item xs={12}>
              <Controller
                name="referenceNumber"
                control={control}
                rules={{ required: "Reference number is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Reference Number *"
                    fullWidth
                    size="small"
                    disabled={mode === "view" || isSaving}
                    required
                  />
                )}
              />
            </Grid>

            {/* Dates */}
            <Grid item xs={6}>
              <Controller
                name="startDate"
                control={control}
                rules={{ required: "Start Date is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Start Date"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    disabled={mode === "view" || isSaving}
                    required
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

            {/* Status */}
            <Grid item xs={12}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      {...field}
                      label="Status"
                      disabled={mode === "view" || isSaving}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="expired">Expired</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* File Upload */}
            <Grid item xs={12}>
              {mode === "view" ? (
                rowData?.legalDocumentFilePath ? (
                  <a
                    href={`${import.meta.env.VITE_INVOICIVIX_BACKEND_URL}${rowData.legalDocumentFilePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Document
                  </a>
                ) : (
                  "-"
                )
              ) : (
                <>
                  <input
                    type="file"
                    onChange={(e) => {
                      setSelectedFile(e.target.files?.[0] || null);
                      setFileError(null);
                    }}
                    disabled={isSaving}
                  />

                  {fileError && (
                    <Typography
                      variant="caption"
                      color="error"
                      display="block"
                    >
                      {fileError}
                    </Typography>
                  )}

                  {rowData?.legalDocumentFileName &&
                    mode === "edit" && (
                      <Typography
                        variant="caption"
                        display="block"
                      >
                        Current File: {rowData.legalDocumentFileName}
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
              <StyledButton
                type="submit"
                variant="primary"
                disabled={
                  (!isFormValid ||
                    (!isFormDirty && mode === "edit")) ||
                  isSaving
                }
              >
                Save
              </StyledButton>
            )}
          </Box>
        </form>
      </Box>
    </Modal>
  );
}