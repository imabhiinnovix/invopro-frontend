import { Box, Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import CommonDropdownSearch from '../../common/dropdown/searchableDropdown';
import { CustomReportRequestPayload, CustomReportRequestResponse } from './types';
import { GET } from '../../../services/apiRoutes';
import CommonDatePicker from '../../common/datePicker/datePicker';
import usePost from '../../../hooks/usePost';
import ProgressBar from '../../molecule/progressBar';
import { DateTime } from 'luxon';
import React, { useState } from 'react';
import UploadMultipleFiles from '../dataSourceVerion/uploadMultipleVersionValue';

interface GenerateReportProps {
  setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function GenerateReport({ setReload }: GenerateReportProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomReportRequestPayload>({});

  const [versionValue, setVersionValue] = useState('');
  const [reportId, setReportId] = useState('');
  const [open, setOpen] = useState(false); // 🔹 Track dialog state

  const generateReport = usePost<CustomReportRequestPayload, CustomReportRequestResponse>(
    ['generateReport'],
    (data) => {
      if (data?.success) {
        reset();
      }
      setReload(true);
    },
    true
  );

  const onSubmit = (formData: CustomReportRequestPayload) => {
    setReportId(formData.customReportId);
    setVersionValue(DateTime.fromISO(formData.versionValue).toFormat('yyyy-LL'));

    // Ensure we open dialog only if we have required values
    if (formData.customReportId && formData.versionValue) {
      setOpen(true);
    }
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" gap={2}>
        <Box flex={1} minWidth={150}>
          <CommonDropdownSearch
            control={control}
            name="customReportId"
            label="Select Report"
            apiUrl={`${GET.Custom_Report}/list`}
            labelName="reportName"
            labelValue="_id"
            rules={{ required: 'Report selection is required' }}
            error={!!errors.customReportId}
            errorMessage={errors.customReportId?.message}
            apiName="customReport"
            defaultDataUrl=""
          />
        </Box>

        <Box flex={1} minWidth={150}>
          <CommonDatePicker
            name="versionValue"
            control={control}
            views={['year', 'month']}
            label="Version Value*"
            rules={{ required: 'Version Value is required' }}
          />
        </Box>

        <Box flex={1} minWidth={150} display="flex" alignItems="center">
          {generateReport.isPending ? (
            <ProgressBar />
          ) : (
            <Button
              variant="text"
              size="large"
              type="submit"
              onClick={handleSubmit(onSubmit)}
              sx={{
                fontWeight: 'bold',
                fontSize: '1.2rem',
                width: '100%',
                bgcolor: '#007bff',
                color: '#fff',
                '&:hover': { bgcolor: '#0056b3' },
                '@media (max-width: 600px)': {
                  fontSize: '1rem',
                },
              }}
            >
              Generate Report
            </Button>
          )}
        </Box>
      </Box>

      {/* Only render UploadMultipleFiles when reportId & versionValue exist */}
      {open && reportId && versionValue && (
        <UploadMultipleFiles open={open} setOpen={setOpen} reportId={reportId} versionValue={versionValue} />
      )}
    </>
  );
}
