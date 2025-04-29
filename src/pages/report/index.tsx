import { Box, Button, Table, TableBody, TableCell, TableRow, Tooltip, Typography } from '@mui/material';
import GenerateReport from '../../components/atom/report/generateReport';
import { useEffect, useRef, useState } from 'react';
import ReportRequestTable from '../../components/atom/report/reportRequestTable';
import ViewReport from '../../components/atom/report/viewReport';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { ReportRequestResponse } from '../../components/atom/report/types';
import { DateTime } from 'luxon';
import html2pdf from 'html2pdf.js';
import ReportSelection from '../../components/atom/report/changeReportFromViewReport';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ScrollableTabNavigation from '../../components/atom/report/scrollableTab';
import SimCardDownloadIcon from '@mui/icons-material/SimCardDownload';
import useFileDownload from '../../hooks/useFiledownload';
import { GET } from '../../services/apiRoutes';

export default function Report() {
  const [reload, setReload] = useState(false);
  const [viewReportRequestId, setViewReportRequestId] = useState('');

  const [maxHeight, setMaxHeight] = useState<number>(0);

  const headerRef = useRef<HTMLDivElement>(null);
  const tabRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const [allDetailData, setAllDetailData] = useState<ReportRequestResponse | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [downloadFileName, setDownLoadFileName] = useState('');
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const [viewReportNameWithVersionValue, setViewReportNameWithVersionValue] = useState('');
  const exportFile = useFileDownload<Blob>((data) => {
    const blob = new Blob([data], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = downloadFileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  });

  const downloadFile = (fileName: string, fileId: string) => {
    setDownLoadFileName(fileName);
    exportFile.mutate({
      url: `${GET?.Custom_Report}/download/${fileId}`,
    });
  };
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

  const handleDownloadPdf = () => {
    if (!targetRef.current || !viewReportNameWithVersionValue) return;
    setIsPdfLoading(true);

    setTimeout(() => {
      setIsPdfLoading(false);
    }, 500);
    const opt = {
      margin: 0.5,
      filename: `${viewReportNameWithVersionValue}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
    };

    html2pdf().set(opt).from(targetRef.current.innerHTML).save();
  };

  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: '#F8FAFC',
        minHeight: 'calc(100vh - 64px)',
        p: 1,
      }}
    >
      <Box ref={headerRef}>
        {viewReportRequestId && viewReportRequestId.length > 0 ? (
          <>
            <Box
              sx={{
                cursor: 'pointer',
                // transition: 'transform 0.2s ease-in-out',
                // '&:hover': {
                //   transform: 'scale(1.2)',
                // },
              }}
              onClick={() => {
                setViewReportRequestId('');
              }}
            >
              <ArrowBackIcon fontSize="medium" />
            </Box>
            <ReportSelection
              defaultReport={{
                _id: allDetailData?.customReportId?._id || '',
                reportName: allDetailData?.customReportId?.reportName || '',
              }}
              defaultVersion={{ _id: allDetailData?._id || '', versionValue: allDetailData?.versionValue || '' }}
              setViewReportRequestId={setViewReportRequestId}
              setAllDetailData={setAllDetailData}
              setViewReportNameWithVersionValue={setViewReportNameWithVersionValue}
            />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 500,
                    color: 'text.primary',
                  }}
                >
                  <Box component="span" fontWeight="bold">
                    {allDetailData?.customReportId?.reportName || ''}
                  </Box>{' '}
                  Report for the period{' '}
                  <Box component="span" fontWeight="bold">
                    {allDetailData?.versionValue
                      ? DateTime.fromFormat(allDetailData.versionValue, 'yyyy-MM').toFormat('LLLL yyyy')
                      : ''}
                  </Box>{' '}
                  created by{' '}
                  {`${allDetailData?.createdBy?.firstName || ''}${
                    allDetailData?.createdBy?.lastName ? ' ' + allDetailData.createdBy.lastName : ''
                  }`}{' '}
                  at{' '}
                  {allDetailData?.createdAt
                    ? DateTime.fromISO(allDetailData.createdAt).toFormat('dd LLL yyyy hh:mm a')
                    : ''}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                {isPdfLoading ? (
                  <Box
                    sx={{
                      width: 27,
                      height: 27,
                      borderRadius: '50%',
                      border: '3px solid #f3f3f3',
                      borderTop: '3px solid #3498db',
                      animation: 'spin 1s linear infinite',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                      },
                    }}
                  />
                ) : (
                  <Tooltip title="Download Pdf" arrow>
                    <Button
                      variant="contained"
                      disabled={!(viewReportNameWithVersionValue && viewReportNameWithVersionValue.length > 0)}
                      onClick={handleDownloadPdf}
                    >
                      <PictureAsPdfIcon />
                    </Button>
                  </Tooltip>
                )}

                {exportFile.isPending ? (
                  <Box
                    sx={{
                      width: 27,
                      height: 27,
                      borderRadius: '50%',
                      border: '3px solid #f3f3f3',
                      borderTop: '3px solid #3498db',
                      animation: 'spin 1s linear infinite',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                      },
                    }}
                  />
                ) : (
                  <Tooltip title="Download Excel" arrow>
                    <Button
                      variant="contained"
                      onClick={() => {
                        downloadFile(
                          `${allDetailData?.customReportId?.reportName}-${allDetailData?.versionValue}.xlsx`,
                          allDetailData?._id || ''
                        );
                      }}
                      sx={{ mr: 1 }}
                    >
                      <SimCardDownloadIcon />
                    </Button>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </>
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
          <ScrollableTabNavigation
            tabs={allDetailData?.dataSourceVersion || []}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabStyle={tabStyle}
          />
          {allDetailData?.dataSourceVersion?.map(
            (item, index) =>
              activeTab === index && (
                <ViewReport
                  key={index}
                  dataSourceVersionId={item.dataSourceVersionId}
                  versionCode={item.versionCode}
                  mappingFuctionName={item.mappingFuctionName}
                  versionValue={allDetailData.versionValue.split('-')[0]}
                  sheetCode={item.sheetCode}
                  designCode={item.designCode}
                  customReportId={allDetailData.customReportId._id}
                  maxHeight={maxHeight}
                  isView={true}
                />
              )
          )}

          {/* To download pdf */}
          <Box
            sx={{
              display: 'none',
              marginBottom: 5,
            }}
            ref={targetRef}
          >
            {allDetailData?.dataSourceVersion?.map((item, index) => (
              <Box key={index}>
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
                  <Box sx={{ display: 'flex', mt: 1, mb: 1 }}>
                    <Box sx={{ fontWeight: 600 }}>Sheet Name: </Box>
                    <Box>{item.sheetName}</Box>
                  </Box>
                  {!!item.allowPdfDownload ? (
                    <ViewReport
                      key={index}
                      dataSourceVersionId={item.dataSourceVersionId}
                      versionCode={item.versionCode}
                      mappingFuctionName={item.mappingFuctionName}
                      versionValue={allDetailData.versionValue.split('-')[0]}
                      sheetCode={item.sheetCode}
                      designCode={item.designCode}
                      customReportId={allDetailData.customReportId._id}
                    />
                  ) : (
                    <Box sx={{ mt: 30 }}>
                      This sheet cannot be converted to PDF. Please refer to the Excel file for the available data.
                    </Box>
                  )}
                </Box>

                <Box className="html2pdf__page-break" />
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
              setAllDetailData={setAllDetailData}
              setViewReportNameWithVersionValue={setViewReportNameWithVersionValue}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
