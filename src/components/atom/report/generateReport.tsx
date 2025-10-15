import { Box, Button, Typography, Card, CardContent } from "@mui/material";
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
import { STYLE_GUIDE } from "../../../styles";
import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";
import { useComponentTypography } from "../../../hooks/useComponentTypography";

interface GenerateReportProps {
  setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function GenerateReport({ setReload }: GenerateReportProps) {
  const theme = useUnifiedTheme();
  const { getHeadingSx } = useComponentTypography();
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
      <Card
        sx={{
          borderRadius: 1,
          boxShadow: theme.shadows[1],
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: STYLE_GUIDE.SPACING.s4,
            p: STYLE_GUIDE.SPACING.s6,
          }}
        >
          <Typography
            sx={{
              ...getHeadingSx(),
              fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
              color: theme.palette.text.primary,
              fontSize: 14,
            }}
          >
            Generate New Report
          </Typography>

          <Box
            display="flex"
            flexDirection={{ xs: "column", md: "row" }}
            alignItems="center"
            gap={STYLE_GUIDE.SPACING.s4}
            sx={{
              "& .MuiFormControl-root": {
                flex: 1,
                minWidth: { xs: "100%", md: "200px" },
              },
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
              label="Period*"
              disableFuture={true}
              rules={{ required: "Period is required" }}
            />

            <Box
              display="flex"
              alignItems={{ xs: "stretch", md: "flex-start" }}
              sx={{
                minWidth: { xs: "100%", md: "200px" },
              }}
            >
              {generateReport.isPending ? (
                <ProgressBar />
              ) : (
                <Button
                  variant="contained"
                  size="small"
                  type="submit"
                  onClick={handleSubmit(onSubmit)}
                  sx={{
                    width: "100%",
                    height: "40px",
                    textTransform: "none",
                    fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                    borderRadius: 1,
                    boxShadow: "none",
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    "&:hover": {
                      bgcolor: theme.palette.primary.dark,
                      boxShadow: STYLE_GUIDE.SHADOWS.none,
                    },
                  }}
                >
                  Generate Report
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

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
