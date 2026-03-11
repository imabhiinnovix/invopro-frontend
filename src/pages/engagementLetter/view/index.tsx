import * as React from "react";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import { StyledButton } from "../../../components/common";
import FilePreview from "../../../components/common/FilePreview";

import useGet from "../../../hooks/useGet";

import { GET } from "../../../services/apiRoutes";

/* -------- Vendor Interface -------- */

interface Vendor {
  _id: string;
  name: string;
}

export default function EngagementLetterView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { control, reset, setValue } = useForm();

  /* ---------------- GET LETTER ---------------- */

  const engagementLetter = useGet(
    ["engagementLetter", id],
    `${GET.Get_Engagement_Letter}/${id}`,
    true
  );

  /* ---------------- GET VENDOR LIST ---------------- */

  const vendorList = useGet<{ success: boolean; data: Vendor[] }>(
    ["vendorList"],
    GET.Vendor_List,
    true
  );

  /* ---------------- SET FORM VALUES ---------------- */

  useEffect(() => {
    const data = engagementLetter.data?.data;

    if (data) {
      reset({
        referenceNumber: data.referenceNumber,
        description: data.description,
        startDate: data.startDate?.split("T")[0],
        endDate: data.endDate?.split("T")[0] || "",
      });

      setValue("vendorId", data.vendorId?._id);
      setValue("engagementLetterStatus", data.engagementLetterStatus);

      if (data.engagementLetterFilePath) {
        setPreviewUrl(
          `${import.meta.env.VITE_INVOICIVIX_BACKEND_URL}${data.engagementLetterFilePath}`
        );
      }
    }
  }, [engagementLetter.data, reset, setValue]);

  if (engagementLetter.isLoading) return <CircularProgress />;

  return (
    <Box p={3}>
      <Typography variant="h6" mb={2}>
        View Engagement Letter
      </Typography>

      <Grid container spacing={3}>
        {/* ---------------- LEFT FORM ---------------- */}

        <Grid item xs={7}>
          <Grid container spacing={2}>

            {/* Vendor */}

            <Grid item xs={12}>
              <Controller
                name="vendorId"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel>Vendor</InputLabel>

                    <Select {...field} label="Vendor" disabled>
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

            {/* Reference Number */}

            <Grid item xs={12}>
              <Controller
                name="referenceNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Reference Number"
                    fullWidth
                    size="small"
                    disabled
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
                    disabled
                  />
                )}
              />
            </Grid>

            {/* Start Date */}

            <Grid item xs={6}>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Start Date"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    size="small"
                    disabled
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
                    disabled
                  />
                )}
              />
            </Grid>

            {/* Status */}

            <Grid item xs={12}>
              <Controller
                name="engagementLetterStatus"
                control={control}
                defaultValue=""
                render={({ field }) => (
                    <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>

                    <Select {...field} label="Status" disabled>
                        <MenuItem value="in-force">In Force</MenuItem>
                        <MenuItem value="expired">Expired</MenuItem>
                    </Select>
                    </FormControl>
                )}
                />
            </Grid>

            {/* Back Button */}

            <Grid item xs={12}>
              <Box mt={2}>
                <StyledButton
                  variant="secondary"
                  onClick={() => navigate("/engagement-letter")}
                >
                  Back
                </StyledButton>
              </Box>
            </Grid>

          </Grid>
        </Grid>

        {/* ---------------- RIGHT PREVIEW ---------------- */}

        <Grid item xs={5}>
          <FilePreview fileUrl={previewUrl} />
        </Grid>
      </Grid>
    </Box>
  );
}