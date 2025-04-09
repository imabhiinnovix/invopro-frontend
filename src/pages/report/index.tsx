import { Box, Button, Typography } from '@mui/material';
import GenerateReport from '../../components/atom/report/generateReport';
import { useState } from 'react';
import ReportRequestTable from '../../components/atom/report/reportRequestTable';
import ViewReport from '../../components/atom/report/viewReport';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { usePDF } from 'react-to-pdf';

export default function Report() {
  const [reload, setReload] = useState(false);
  const [viewReportRequestId, setViewReportRequestId] = useState('');
  const { toPDF, targetRef } = usePDF({ filename: 'page.pdf' });

  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: '#F8FAFC',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: '56px',
          px: 3,
          backgroundColor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {viewReportRequestId && viewReportRequestId.length > 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.2)',
                  },
                }}
                onClick={() => {
                  setViewReportRequestId('');
                }}
              >
                <ArrowBackIcon fontSize="medium" />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                  color: 'text.primary',
                }}
              >
                Report View
              </Typography>
            </Box>

            <Button variant="contained" onClick={() => toPDF()}>
              Download PDF
            </Button>
          </Box>
        ) : (
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            Reports
          </Typography>
        )}
      </Box>

      {viewReportRequestId && viewReportRequestId.length > 0 ? (
        <ViewReport
          targetRef={targetRef}
          setViewReportRequestId={setViewReportRequestId}
          viewReportRequestId={viewReportRequestId}
        />
      ) : (
        <Box
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box
            sx={{
              backgroundColor: 'white',
              borderRadius: 1,
              p: 2,
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
            }}
          >
            <GenerateReport setReload={setReload} />
          </Box>

          <Box
            sx={{
              backgroundColor: 'white',
              borderRadius: 1,
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
            }}
          >
            <ReportRequestTable setReload={setReload} reload={reload} setViewReportRequestId={setViewReportRequestId} />
          </Box>
        </Box>
      )}
    </Box>
  );
}
