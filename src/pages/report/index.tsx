import { Box, Button, Typography } from '@mui/material';
import GenerateReport from '../../components/atom/report/generateReport';
import { useState } from 'react';
import ReportRequestTable from '../../components/atom/report/reportRequestTable';
import ViewReport from '../../components/atom/report/viewReport';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { usePDF, Margin } from 'react-to-pdf';
import { ReportRequestResponse } from '../../components/atom/report/types';

export default function Report() {
  const [reload, setReload] = useState(false);
  const [viewReportRequestId, setViewReportRequestId] = useState('');
  const [reportDetailData, setReportDetailData] = useState('');

  const [allDetailData, setAllDetailData] = useState<ReportRequestResponse | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [activeTabName, setActiveTabName] = useState('');

  const [viewReportNameWithVersionValue, setViewReportNameWithVersionValue] = useState('');
  const { toPDF, targetRef } = usePDF({
    filename: `${viewReportNameWithVersionValue}.pdf`,
    page: { orientation: 'landscape', margin: Margin.SMALL },
  });

  const tabStyle = (index: number) => ({
    padding: '10px 20px',
    cursor: 'pointer',
    borderBottom: activeTab === index ? '2px solid rgb(142, 25, 210)' : '2px solid transparent',
    fontWeight: activeTab === index ? 'bold' : 'normal',
    backgroundColor: activeTab === index ? '#f0f0f0' : '#fff',
  });
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
                <Box component="span" sx={{ fontWeight: 400, mx: 1, color: 'text.secondary' }}>
                  Report Name:
                </Box>
                <Box component="span" sx={{ fontWeight: 500 }}>
                  {allDetailData?.customReportId?.reportName}
                </Box>
                <Box component="span" sx={{ fontWeight: 400, mx: 1, color: 'text.secondary' }}>
                  | Period:
                </Box>
                <Box component="span" sx={{ fontWeight: 500 }}>
                  {allDetailData?.versionValue}
                </Box>
                <Box component="span" sx={{ fontWeight: 400, mx: 1, color: 'text.secondary' }}>
                  | Created By:
                </Box>
                <Box component="span" sx={{ fontWeight: 500 }}>
                  {`${allDetailData?.createdBy?.firstName || ''}${
                    allDetailData?.createdBy?.lastName ? ' ' + allDetailData.createdBy.lastName : ''
                  }`}
                </Box>
              </Typography>
            </Box>

            <Button
              disabled={!(viewReportNameWithVersionValue && viewReportNameWithVersionValue.length > 0)}
              variant="contained"
              onClick={() => toPDF()}
            >
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
        <Box>
          <Box display="flex" borderBottom="1px solid #ccc" mb={2}>
            {allDetailData?.dataSourceVersion?.map((item, index) => (
              <div
                key={index}
                style={tabStyle(index)}
                onClick={() => {
                  setActiveTab(index);
                  setActiveTabName(item.name);
                  setViewReportRequestId(viewReportRequestId);
                  setReportDetailData(item.dataSourceVersionId);
                }}
              >
                {item.name}
              </div>
            ))}
          </Box>
          {allDetailData?.dataSourceVersion?.map(
            (item, index) =>
              activeTab === index && (
                <ViewReport
                  key={index}
                  targetRef={''}
                  reportDetailData={item.dataSourceVersionId}
                  setViewReportRequestId={setViewReportRequestId}
                  viewReportRequestId={viewReportRequestId}
                />
              )
          )}

          {/* To download pdf */}
          <Box
            sx={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '100%', marginBottom: 5 }}
            ref={targetRef}
          >
            {allDetailData?.dataSourceVersion?.map((item, index) => (
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 500,
                    color: 'text.primary',
                  }}
                >
                  <Box component="span" sx={{ fontWeight: 400, mx: 1, color: 'text.primary' }}>
                    Report Name:
                  </Box>
                  <Box component="span" sx={{ fontWeight: 500 }}>
                    {`${allDetailData?.customReportId?.reportName}-${item?.name}`}
                  </Box>
                  <Box component="span" sx={{ fontWeight: 400, mx: 1, color: 'text.primary' }}>
                    | Period:
                  </Box>
                  <Box component="span" sx={{ fontWeight: 500 }}>
                    {allDetailData?.versionValue}
                  </Box>
                  <Box component="span" sx={{ fontWeight: 400, mx: 1, color: 'text.primary' }}>
                    | Created By:
                  </Box>
                  <Box component="span" sx={{ fontWeight: 500 }}>
                    {`${allDetailData?.createdBy?.firstName || ''}${
                      allDetailData?.createdBy?.lastName ? ' ' + allDetailData.createdBy.lastName : ''
                    }`}
                  </Box>
                </Typography>
                <ViewReport
                  key={index}
                  targetRef={''}
                  reportDetailData={item.dataSourceVersionId}
                  setViewReportRequestId={setViewReportRequestId}
                  viewReportRequestId={viewReportRequestId}
                />
              </Box>
            ))}
          </Box>
        </Box>
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
            <ReportRequestTable
              setReload={setReload}
              reload={reload}
              setViewReportRequestId={setViewReportRequestId}
              setReportDetailData={setReportDetailData}
              setAllDetailData={setAllDetailData}
              setViewReportNameWithVersionValue={setViewReportNameWithVersionValue}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
