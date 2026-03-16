import * as React from "react";
import { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";

import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import { StyledButton } from "../../../components/common";
import FilePreview from "../../../components/common/FilePreview";

import useGet from "../../../hooks/useGet";
import usePut from "../../../hooks/usePut";

import { GET, PUT } from "../../../services/apiRoutes";

import ActivityRateCardSection from "../ActivityRateCardSection";
import AttorneyRateCardSection from "../AttorneyRateCardSection";
import FARateCardSection from "../FARateCardSection";
import usePutMultipart from "../../../hooks/usePutMultipart";

interface Vendor {
  _id: string;
  name: string;
}

function TabPanel(props: any) {
  const { children, value, index } = props;

  return (
    <div hidden={value !== index}>
      {value === index && <Box pt={2}>{children}</Box>}
    </div>
  );
}

export default function EngagementLetterEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [tabValue, setTabValue] = useState(0);

  const { control, handleSubmit, reset, setValue } = useForm();

  const handleTabChange = (_: any, newValue: number) => {
    setTabValue(newValue);
  };

  const engagementLetter = useGet(
    ["engagementLetter", id],
    `${GET.Get_Engagement_Letter}/${id}`,
    true
  );

  const vendorList = useGet<{ success: boolean; data: Vendor[] }>(
    ["vendorList"],
    GET.Vendor_List,
    true
  );

  const updateEngagementLetter = usePutMultipart(
    ["updateEngagementLetter"],
    () => navigate("/engagement-letter"),
    true
  );

  useEffect(() => {
    const data = engagementLetter.data?.data;

    if (data) {
      reset({
        referenceNumber: data.referenceNumber,
        description: data.description,
        startDate: data.startDate?.split("T")[0],
        endDate: data.endDate?.split("T")[0] || "",
        generalTerms: data.generalTerms || "",
        paymentTerms: data.paymentTerms || "",
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const onSubmit = (data: any) => {
    updateEngagementLetter.mutate({
      url: `${PUT.UPDATE_ENGAGEMENT_LETTER}${id}`,
      payload: { ...data, files: selectedFile || undefined },
    });
  };

  if (engagementLetter.isLoading) return <CircularProgress />;

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
          >
            <Tab label="Basic Info" />
            <Tab label="Activity Rate" />
            <Tab label="Attorney Rate" />
            <Tab label="FA Rate" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={2}>
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

                {/* NEW FIELD */}

                <Grid item xs={12}>
                  <Controller
                    name="generalTerms"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="General Terms & Conditions"
                        multiline
                        rows={4}
                        fullWidth
                        size="small"
                      />
                    )}
                  />
                </Grid>

                {/* NEW FIELD */}

                <Grid item xs={12}>
                  <Controller
                    name="paymentTerms"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Payment Terms & Conditions"
                        multiline
                        rows={4}
                        fullWidth
                        size="small"
                      />
                    )}
                  />
                </Grid>

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
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {engagementLetter.data?.data && (
              <ActivityRateCardSection
                vendorId={engagementLetter.data.data.vendorId?._id}
                engagementLetterId={engagementLetter.data.data._id}
                currency={engagementLetter.data.data.vendorId?.defaultCurrency}
              />
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {engagementLetter.data?.data && (
              <AttorneyRateCardSection
                vendorId={engagementLetter.data.data.vendorId?._id}
                engagementLetterId={engagementLetter.data.data._id}
                currency={engagementLetter.data.data.vendorId?.defaultCurrency}
              />
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {engagementLetter.data?.data && (
              <FARateCardSection
                vendorId={engagementLetter.data.data.vendorId?._id}
                engagementLetterId={engagementLetter.data.data._id}
                currency={engagementLetter.data.data.vendorId?.defaultCurrency}
              />
            )}
          </TabPanel>
        </Grid>

        <Grid item xs={6}>
           {/* Upload Button only in Basic Info */}
          {tabValue === 0 && (
            <Box mb={2}>
              <input
                type="file"
                id="upload-file"
                hidden
                onChange={handleFileChange}
              />

              <label htmlFor="upload-file">
                <StyledButton variant="primary" component="span">
                  Upload File
                </StyledButton>
              </label>
            </Box>
          )}

          <FilePreview fileUrl={previewUrl} />
        </Grid>
      </Grid>
    </Box>
  );
}