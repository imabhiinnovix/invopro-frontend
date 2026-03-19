import * as React from "react";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Modal,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useForm, Controller } from "react-hook-form";
import { StyledButton } from "../../components/common";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import useGet from "../../hooks/useGet";
import usePostMultipart from "../../hooks/usePostMultipleMultipart";
import { GET, POST } from "../../services/apiRoutes";
import CommonDatePicker from "../../components/common/datePicker/datePicker";
import { DateTime } from "luxon";

interface Vendor {
  _id: string;
  name: string;
}

interface VendorInvoicePayload {
  vendorId: string;
  versionValue: string;
  status: "active";
  files?: File[];
}

interface VendorInvoiceResponse {
  success: boolean;
}

interface VendorInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  onUpdated?: () => void;
  mode: "add" | "edit" | "view";
  rowData?: any;
}

export function VendorInvoiceModal({
  open,
  onClose,
  onCreated,
  onUpdated,
  mode,
  rowData,
}: VendorInvoiceModalProps) {
  const theme = useUnifiedTheme();

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { control, handleSubmit, reset, formState } =
    useForm<VendorInvoicePayload>({
      defaultValues: {
        vendorId: "",
        versionValue: "",
      },
      mode: "onChange",
    });

  // ================= GET VENDOR =================
  const vendorList = useGet<{ success: boolean; data: Vendor[] }>(
    ["vendorList"],
    GET.Vendor_List,
    true
  );

  // ================= CREATE =================
  const createVendorInvoice = usePostMultipart<
    VendorInvoicePayload,
    VendorInvoiceResponse
  >(
    ["createVendorInvoice"],
    (data) => {
      if (data?.success) {
        onCreated?.();
        onClose();
      }
    },
    true
  );

  // ================= UPDATE =================
  const updateVendorInvoice = usePostMultipart<
    VendorInvoicePayload,
    VendorInvoiceResponse
  >(
    ["updateVendorInvoice"],
    (data) => {
      if (data?.success) {
        onUpdated?.();
        onClose();
      }
    },
    true
  );

  // ================= PREFILL =================
  useEffect(() => {
    if (open) {
      if ((isEditMode || isViewMode) && rowData) {
        reset({
          vendorId: rowData.vendorId?._id || "",
          versionValue: rowData.versionValue
            ? DateTime.fromFormat(rowData.versionValue, "yyyy-MM").toISO()
            : "",
        });

        setExistingFiles(
          Array.isArray(rowData.filePath)
            ? rowData.filePath
            : rowData.filePath
            ? [rowData.filePath]
            : []
        );

        setSelectedFiles([]);
      } else {
        reset({
          vendorId: "",
          versionValue: "",
        });
        setSelectedFiles([]);
        setExistingFiles([]);
      }

      setFileError(null);
    }
  }, [open, rowData]);

  // ================= FILE HANDLING =================
  const handleOpenFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    setSelectedFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      const newFiles = files.filter((f) => !existing.has(f.name));
      return [...prev, ...newFiles];
    });

    setFileError(null);
    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    const updated = [...selectedFiles];
    updated.splice(index, 1);
    setSelectedFiles(updated);
  };

  // ================= SUBMIT =================
  const onSubmit = (data: VendorInvoicePayload) => {
    if (!isViewMode && selectedFiles.length === 0 && !isEditMode) {
      setFileError("At least one file is required");
      return;
    }

    const formattedVersion = DateTime.fromISO(data.versionValue).toFormat("yyyy-LL");

    const payload: any = {
      vendorId: data.vendorId,
      versionValue: formattedVersion,
      status: "active",
      files: selectedFiles,
    };

    if (isEditMode) {
      updateVendorInvoice.mutate({
        url: `${POST.Update_Vendor_Invoice}/${rowData._id}`,
        payload,
      });
    } else {
      createVendorInvoice.mutate({
        url: POST.Create_Vendor_Invoice,
        payload,
      });
    }
  };

  const isSaving =
    createVendorInvoice.isPending || updateVendorInvoice.isPending;

  const isFormValid = formState.isValid;

  // ================= UI =================
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
          {mode === "view"
            ? "View Vendor Invoice"
            : mode === "edit"
            ? "Edit Vendor Invoice"
            : "Upload Vendor Invoices"}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            {/* Vendor */}
            <Grid item xs={12}>
              <Controller
                name="vendorId"
                control={control}
                rules={{ required: "Vendor is required" }}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel>Vendor *</InputLabel>
                    <Select {...field} label="Vendor *" disabled={isViewMode}>
                      {vendorList.data?.data?.map((vendor) => (
                        <MenuItem key={vendor._id} value={vendor._id}>
                          {vendor.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Period */}
            <Grid item xs={12}>
              <CommonDatePicker
                name="versionValue"
                control={control}
                views={["year", "month"]}
                label="Period *"
                rules={{ required: "Period is required" }}
                disabled={isViewMode}
              />
            </Grid>

            {/* Upload */}
            {!isViewMode && (
              <Grid item xs={12}>
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />

                <StyledButton
                  variant="primary"
                  onClick={handleOpenFileDialog}
                >
                  Upload Files
                </StyledButton>
              </Grid>
            )}

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <Grid item xs={12}>
                {selectedFiles.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      background: "#f5f5f5",
                      px: 1,
                      py: 0.5,
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="caption">{file.name}</Typography>

                    {!isViewMode && (
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Grid>
            )}

            {/* Existing Files (VIEW/EDIT) */}
            {existingFiles.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2">
                  Uploaded Files
                </Typography>

                {existingFiles.map((file, index) => {
                  const name = file.split("/").pop();

                  return (
                    <Box
                      key={index}
                      sx={{
                        background: "#e3f2fd",
                        px: 1,
                        py: 0.5,
                        mb: 0.5,
                        cursor: "pointer",
                      }}
                      // onClick={() => window.open(file, "_blank")}
                    >
                      <Typography variant="caption" color="primary">
                         <a
                          href={`${import.meta.env.VITE_INVOICIVIX_BACKEND_URL}${file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {name}
                        </a>
                      </Typography>
                    </Box>
                  );
                })}
              </Grid>
            )}

            {fileError && (
              <Grid item xs={12}>
                <Typography variant="caption" color="error">
                  {fileError}
                </Typography>
              </Grid>
            )}
          </Grid>

          {isSaving && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 1 }}
          >
            <StyledButton variant="secondary" onClick={onClose}>
              Close
            </StyledButton>

            {!isViewMode && (
              <StyledButton
                type="submit"
                variant="primary"
                disabled={!isFormValid || isSaving}
              >
                {isEditMode ? "Update" : "Upload"}
              </StyledButton>
            )}
          </Box>
        </form>
      </Box>
    </Modal>
  );
}