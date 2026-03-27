/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Controller, useForm } from "react-hook-form";
import { StyledButton } from "../../components/common";

import usePostMultipart from "../../hooks/usePostMultipleMultipart";
import { POST } from "../../services/apiRoutes";

import CommonDatePicker from "../../components/common/datePicker/datePicker";
import { DateTime } from "luxon";

export function ActivityInfoModal({
  open,
  onClose,
  mode,
  rowData,
  onCreated,
  onUpdated,
}: any) {
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  const { control, handleSubmit, reset, formState } = useForm<any>({
    defaultValues: {
      activityType: "",
      versionValue: "",
    },
    mode: "onChange",
  });

  // ================= CREATE =================
  const create = usePostMultipart(["createActivity"], (data) => {
    if (data?.success) {
      onCreated?.();
      onClose();
    }
  });

  // ================= UPDATE =================
  const update = usePostMultipart(["updateActivity"], (data) => {
    if (data?.success) {
      onUpdated?.();
      onClose();
    }
  });

  // ================= PREFILL =================
  useEffect(() => {
    if (open) {
      if ((isEdit || isView) && rowData) {
        reset({
          activityType: rowData.activityType,
          versionValue: rowData.versionValue
            ? DateTime.fromFormat(rowData.versionValue, "yyyy-MM").toISO()
            : "",
        });

        setExistingFiles(
          Array.isArray(rowData.activityFilePath)
            ? rowData.activityFilePath
            : rowData.activityFilePath
            ? [rowData.activityFilePath]
            : []
        );

        setSelectedFiles([]);
      } else {
        reset({
          activityType: "",
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
    fileRef.current?.click();
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
  const onSubmit = (data: any) => {
    if (!isView && selectedFiles.length === 0 && !isEdit) {
      setFileError("At least one file is required");
      return;
    }

    const payload: any = {
      activityType: data.activityType,
      versionValue: DateTime.fromISO(data.versionValue).toFormat("yyyy-LL"),
      files: selectedFiles,
    };

    if (isEdit) {
      update.mutate({
        url: `${POST.Update_Activity}/${rowData._id}`,
        payload,
      });
    } else {
      create.mutate({
        url: POST.Create_Activity,
        payload,
      });
    }
  };

  const isSaving = create.isPending || update.isPending;

  // ================= UI =================
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Box
        sx={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          p: 3,
          width: "520px",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          {isView
            ? "View Activity"
            : isEdit
            ? "Edit Activity"
            : "Upload Activity"}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            {/* Activity Type */}
            <Grid item xs={12}>
              <Controller
                name="activityType"
                control={control}
                rules={{ required: "Activity Type is required" }}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel>Activity Type *</InputLabel>
                    <Select {...field} label="Activity Type *" disabled={isView}>
                      <MenuItem value="mailBox">MailBox</MenuItem>
                      <MenuItem value="action">Action</MenuItem>
                      <MenuItem value="disclosure">Disclosure</MenuItem>
                      <MenuItem value="portfolio">Portfolio</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Version */}
            <Grid item xs={12}>
              <CommonDatePicker
                name="versionValue"
                control={control}
                views={["year", "month"]}
                label="Billing Cycle *"
                rules={{ required: "Version is required" }}
                disabled={isView}
              />
            </Grid>

            {/* Upload Button */}
            {!isView && (
              <Grid item xs={12}>
                <input
                  type="file"
                  multiple
                  ref={fileRef}
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

                    {!isView && (
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

            {/* Existing Files */}
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
                      }}
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

            {/* Error */}
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

            {!isView && (
              <StyledButton
                type="submit"
                variant="primary"
                disabled={!formState.isValid || isSaving}
              >
                {isEdit ? "Update" : "Upload"}
              </StyledButton>
            )}
          </Box>
        </form>
      </Box>
    </Modal>
  );
}