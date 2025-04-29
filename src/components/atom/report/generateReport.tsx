import { Box, Button, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import CommonDropdownSearch from "../../common/dropdown/searchableDropdown";
import {
  CustomReportRequestPayload,
  CustomReportRequestResponse,
} from "./types";
import { GET } from "../../../services/apiRoutes";
import CommonDatePicker from "../../common/datePicker/datePicker";
import usePost from "../../../hooks/usePost";
import ProgressBar from "../../molecule/progressBar";
import { DateTime } from "luxon";
import React, { useState } from "react";
import UploadMultipleFiles from "../dataSourceVerion/uploadMultipleVersionValue";

interface GenerateReportProps {
  setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function GenerateReport({ setReload }: GenerateReportProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomReportRequestPayload>({});

  const [versionValue, setVersionValue] = useState("");
  const [reportId, setReportId] = useState("");
  const [open, setOpen] = useState(false);

  const generateReport = usePost<
    CustomReportRequestPayload,
    CustomReportRequestResponse
  >(
    ["generateReport"],
    () => {
      // if (data?.success) {
      //   reset();
      // }
      // setReload(true);
    },
    true
  );

  const onSubmit = (formData: CustomReportRequestPayload) => {
    setReportId(formData.customReportId);
    setVersionValue(
      DateTime.fromISO(formData.versionValue).toFormat("yyyy-LL")
    );

    if (formData.customReportId && formData.versionValue) {
      setOpen(true);
    }
  };

  return (
    <>
      <Box>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            mb: 2,
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          Generate New Report
        </Typography>
        
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', md: 'row' }}
          gap={2}
          sx={{
            '& .MuiFormControl-root': {
              flex: 1,
              minWidth: { xs: '100%', md: '200px' }
            }
          }}
        >
          <CommonDropdownSearch
            control={control}
            name="customReportId"
            label="Select Report"
            apiUrl={`${GET.Custom_Report}/list`}
            labelName="reportName"
            labelValue="_id"
            rules={{ required: "Report selection is required" }}
            error={!!errors.customReportId}
            errorMessage={errors.customReportId?.message}
            apiName="customReport"
            defaultDataUrl=""
          />

          <CommonDatePicker
            name="versionValue"
            control={control}
            views={["year", "month"]}
            label="Version Value*"
            rules={{ required: "Version Value is required" }}
          />

          <Box 
            display="flex" 
            alignItems={{ xs: 'stretch', md: 'flex-start' }}
            sx={{ 
              minWidth: { xs: '100%', md: '200px' }
            }}
          >
            {generateReport.isPending ? (
              <ProgressBar />
            ) : (
              <Button
                variant="contained"
                size="large"
                type="submit"
                onClick={handleSubmit(onSubmit)}
                sx={{
                  width: '100%',
                  height: '56px',
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  borderRadius: 1,
                  boxShadow: 'none',
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    boxShadow: 'none',
                  }
                }}
              >
                Generate Report
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {reportId && versionValue && (
        <UploadMultipleFiles
          open={open}
          setOpen={setOpen}
          reportId={reportId}
          versionValue={versionValue}
          setReload={setReload}
        />
      )}
    </>
  );
}
