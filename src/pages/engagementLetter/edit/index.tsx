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
  Collapse,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import { StyledButton } from "../../../components/common";
import FilePreview from "../../../components/common/FilePreview";

import useGet from "../../../hooks/useGet";
import usePut from "../../../hooks/usePut";

import { GET, PUT } from "../../../services/apiRoutes";

import ActivityRateCardSection from "../ActivityRateCardSection";

/* -------- Vendor Interface -------- */

interface Vendor {
  _id: string;
  name: string;
}

export default function EngagementLetterEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [showBasicDetails, setShowBasicDetails] = useState(true);

  const { control, handleSubmit, reset, setValue } = useForm();

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

  /* ---------------- UPDATE API ---------------- */

  const updateEngagementLetter = usePut(
    ["updateEngagementLetter"],
    () => navigate("/engagement-letter"),
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

  /* ---------------- FILE CHANGE ---------------- */

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  /* ---------------- SUBMIT ---------------- */

  const onSubmit = (data: any) => {
    updateEngagementLetter.mutate({
      url: `${PUT.UPDATE_ENGAGEMENT_LETTER}${id}`,
      payload: { ...data, files: selectedFile || undefined },
    });
  };

  if (engagementLetter.isLoading) return <CircularProgress />;

  return (
    <Box p={3}>
      {/* Toggle Header */}

      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <IconButton
          size="small"
          onClick={() => setShowBasicDetails((prev) => !prev)}
        >
          <ExpandMoreIcon
            sx={{
              transform: showBasicDetails ? "rotate(180deg)" : "rotate(90deg)",
              transition: "0.3s",
            }}
          />
        </IconButton>

        <Typography variant="h6">
          Basic Details
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* ---------------- LEFT FORM ---------------- */}

        <Grid item xs={7}>
          <Collapse in={showBasicDetails}>
            <form onSubmit={handleSubmit(onSubmit)}>
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

                        <Select {...field} label="Vendor">
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
                    defaultValue=""
                    render={({ field }) => (
                      <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>

                        <Select {...field} label="Status">
                          <MenuItem value="in-force">In Force</MenuItem>
                          <MenuItem value="expired">Expired</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                {/* Buttons */}

                <Grid item xs={12}>
                  <Box mt={2} display="flex" gap={1}>
                    <StyledButton
                      variant="secondary"
                      onClick={() => navigate("/engagement-letter")}
                    >
                      Cancel
                    </StyledButton>

                    <StyledButton type="submit" variant="primary">
                      Update
                    </StyledButton>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Collapse>

          {/* Activity Rate Card */}

          {engagementLetter.data?.data && (
            <ActivityRateCardSection
              vendorId={engagementLetter.data.data.vendorId?._id}
              engagementLetterId={engagementLetter.data.data._id}
              currency={engagementLetter.data.data.vendorId?.defaultCurrency}
            />
          )}
        </Grid>

        {/* ---------------- RIGHT PREVIEW ---------------- */}

        <Grid item xs={5}>
          <Box mb={2}>
            <input type="file" onChange={handleFileChange} />
          </Box>

          <FilePreview fileUrl={previewUrl} />
        </Grid>
      </Grid>
    </Box>
  );
}