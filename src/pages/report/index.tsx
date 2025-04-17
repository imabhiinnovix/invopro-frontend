import { Box, Button, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import GenerateReport from '../../components/atom/report/generateReport';
import { useEffect, useRef, useState } from 'react';
import ReportRequestTable from '../../components/atom/report/reportRequestTable';
import ViewReport from '../../components/atom/report/viewReport';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { usePDF, Margin } from 'react-to-pdf';
import { ReportRequestResponse } from '../../components/atom/report/types';
import { DateTime } from 'luxon';

export default function Report() {
  const [reload, setReload] = useState(false);
  const [viewReportRequestId, setViewReportRequestId] = useState('');
  const [reportDetailData, setReportDetailData] = useState('');
  const [maxHeight, setMaxHeight] = useState<number>(0);

  const headerRef = useRef<HTMLDivElement>(null);
  const tabRef = useRef<HTMLDivElement>(null);
  const viewPdfRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (headerRef.current && tabRef.current && window.innerHeight) {
      const headerHeight = headerRef.current?.clientHeight || 0;
      const tabHeight = tabRef.current?.clientHeight || 0;
      const total = headerHeight + tabHeight;
      const leftHeight = window.innerHeight ? window.innerHeight : 0 - total - 30;
      if (leftHeight > 0) {
        setMaxHeight(leftHeight);
      }
    }
  }, [headerRef.current, tabRef.current, window.innerHeight]);

  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: '#F8FAFC',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <Box
        ref={headerRef}
        sx={{
          display: 'flex',
          alignItems: 'center',
          // height: '56px',
          px: 3,
          py: 1,
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
                {`${allDetailData?.customReportId?.reportName || ''} Report for the period ${
                  allDetailData?.versionValue
                    ? DateTime.fromFormat(allDetailData.versionValue, 'yyyy-MM').toFormat('LLLL yyyy')
                    : ''
                } created by ${`${allDetailData?.createdBy?.firstName || ''}${
                  allDetailData?.createdBy?.lastName ? ' ' + allDetailData.createdBy.lastName : ''
                }`} at ${
                  allDetailData?.createdAt
                    ? DateTime.fromISO(allDetailData.createdAt).toFormat('dd LLL yyyy hh:mm a')
                    : ''
                }`}
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
        <Box ref={tabRef}>
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
                  maxHeight={maxHeight}
                  isZoom={true}
                />
              )
          )}

          {/* To download pdf */}

          <Box
            sx={{
              // position: 'absolute',
              top: '-9999px',
              left: '-9999px',
              width: '100%',
              marginBottom: 5,
            }}
            ref={targetRef}
          >
            {allDetailData?.dataSourceVersion?.map((item, index) => (
              <Box
                key={index}
                ref={viewPdfRef}
                marginTop={index === 0 ? '0px' : `${794 - (viewPdfRef?.current?.clientHeight || 0)}px`}
              >
                {index === 0 && (
                  <Table
                    size="small"
                    sx={{
                      width: 'auto',
                      mb: 2,
                      ml: 0,
                      pl: 0,
                    }}
                  >
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, borderBottom: 'none', pr: 1, whiteSpace: 'nowrap' }}>
                          Report Name:
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500, borderBottom: 'none' }}>
                          {allDetailData?.customReportId?.reportName}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, borderBottom: 'none', pr: 1, whiteSpace: 'nowrap' }}>
                          Period:
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500, borderBottom: 'none' }}>
                          {allDetailData?.versionValue}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, borderBottom: 'none', pr: 1, whiteSpace: 'nowrap' }}>
                          Created By:
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500, borderBottom: 'none' }}>
                          {`${allDetailData?.createdBy?.firstName || ''}${
                            allDetailData?.createdBy?.lastName ? ' ' + allDetailData.createdBy.lastName : ''
                          }`}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}

                <Box>
                  <Typography sx={{ display: 'flex' }}>
                    <Box sx={{ fontWeight: 600 }}>Sheet Name:</Box>
                    <Box>{item.name}</Box>
                  </Typography>
                  <ViewReport
                    key={index}
                    targetRef={''}
                    reportDetailData={item.dataSourceVersionId}
                    setViewReportRequestId={setViewReportRequestId}
                    viewReportRequestId={viewReportRequestId}
                  />
                </Box>
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
