import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import FilePreview from "../../../components/common/FilePreview";
import { StyledButton } from "../../../components/common";

import useGet from "../../../hooks/useGet";
import usePostMultipart from "../../../hooks/usePostMultipart";

import { GET, POST } from "../../../services/apiRoutes";

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
  files?: File;
}

interface EngagementLetterResponse {
  success: boolean;
  message?: string;
}

export default function EngagementLetterCreate() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const { control, handleSubmit, formState } =
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

  /* ---------------- Vendor List ---------------- */

  const vendorList = useGet<{ success: boolean; data: Vendor[] }>(
    ["vendorList"],
    GET.Vendor_List,
    true
  );

  /* ---------------- Create API ---------------- */

  const createEngagementLetter = usePostMultipart<
    EngagementLetterPayload,
    EngagementLetterResponse
  >(
    ["createEngagementLetter"],
    (data) => {
      if (data?.success) {
        navigate("/engagement-letter");
      }
    },
    true
  );

  const isSaving = createEngagementLetter.isPending;

  /* ---------------- File Upload ---------------- */

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setFileError(null);
  };

  /* ---------------- Submit ---------------- */

  const onSubmit = (data: EngagementLetterPayload) => {
    if (!selectedFile) {
      setFileError("Engagement letter file is required");
      return;
    }

    const payload: EngagementLetterPayload = {
      ...data,
      files: selectedFile,
    };

    createEngagementLetter.mutate({
      url: POST.Create_Engagement_Letter,
      payload,
    });
  };

  return (
    <Box p={3}>
      <Typography variant="h6" mb={2}>
        Add Engagement Letter
      </Typography>

      <Grid container spacing={3}>
        {/* ---------------- LEFT FORM ---------------- */}

        <Grid item xs={7}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              {/* Vendor */}

              <Grid item xs={12}>
                <Controller
                  name="vendorId"
                  control={control}
                  rules={{ required: "Vendor is required" }}
                  render={({ field, fieldState }) => (
                    <FormControl
                      fullWidth
                      size="small"
                      error={!!fieldState.error}
                    >
                      <InputLabel>Vendor *</InputLabel>

                      <Select {...field} label="Vendor *">
                        {vendorList.data?.data?.map((vendor) => (
                          <MenuItem
                            key={vendor._id}
                            value={vendor._id}
                          >
                            {vendor.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Reference Number */}

              <Grid item xs={12}>
                <Controller
                  name="referenceNumber"
                  control={control}
                  rules={{
                    required: "Reference number required",
                  }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Reference Number *"
                      fullWidth
                      size="small"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
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
                      multiline
                      rows={3}
                      fullWidth
                      size="small"
                    />
                  )}
                />
              </Grid>

              {/* Start Date */}

              <Grid item xs={6}>
                <Controller
                  name="startDate"
                  control={control}
                  rules={{
                    required: "Start date required",
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      label="Start Date"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      size="small"
                    />
                  )}
                />
              </Grid>

              {/* End Date */}

              <Grid item xs={6}>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      label="End Date"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      size="small"
                    />
                  )}
                />
              </Grid>

              {/* Status */}

              <Grid item xs={12}>
                <Controller
                  name="engagementLetterStatus"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>

                      <Select {...field} label="Status">
                        <MenuItem value="in-force">
                          In Force
                        </MenuItem>

                        <MenuItem value="expired">
                          Expired
                        </MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Save Button */}

              <Grid item xs={12}>
                <StyledButton
                  variant="primary"
                  type="submit"
                  disabled={isSaving}
                >
                  Save
                </StyledButton>
              </Grid>

              {isSaving && (
                <Grid item xs={12}>
                  <CircularProgress size={24} />
                </Grid>
              )}
            </Grid>
          </form>
        </Grid>

        {/* ---------------- RIGHT PREVIEW ---------------- */}

        <Grid item xs={5}>
          <Box mb={2}>
            <input
              type="file"
              onChange={handleFileChange}
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
          </Box>

          <FilePreview fileUrl={previewUrl} />
        </Grid>
      </Grid>
    </Box>
  );
}