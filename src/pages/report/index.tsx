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
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import { GET } from '../../services/apiRoutes';
import { useUnifiedTheme } from '../../hooks/useUnifiedTheme';
import { useComponentTypography } from '../../hooks/useComponentTypography';
import useFileDownload from '../../hooks/useFiledownload';

export default function Report() {
  const theme = useUnifiedTheme();
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
  const [intermediateDownloadRequestId, setIntermediateDownloadRequestId] = useState('');
  const [regularDownloadRequestId, setRegularDownloadRequestId] = useState('');
  const [viewReportNameWithVersionValue, setViewReportNameWithVersionValue] = useState('');

  const { getHeadingSx, getButtonSx } = useComponentTypography();

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

    setIntermediateDownloadRequestId('');
    setRegularDownloadRequestId('');
  });

  const downloadFile = (fileName: string, fileId: string) => {
    setRegularDownloadRequestId(fileId);
    setDownLoadFileName(fileName);
    exportFile.mutate({
      url: `${GET?.Custom_Report}/download/${fileId}`,
    });
  };

  const intermediateDownloadFile = (fileName: string, fileId: string) => {
    setIntermediateDownloadRequestId(fileId);
    setDownLoadFileName(fileName);
    exportFile.mutate({
      url: `${GET?.Custom_Report}/download/${fileId}?isIntermediate=true`,
    });
  };

  const tabStyle = (index: number) => ({
    padding: '10px 20px',
    cursor: 'pointer',
    borderBottom: activeTab === index ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
    fontWeight: activeTab === index ? 'bold' : 'normal',
    // backgroundColor: activeTab === index ? theme.palette.primary.light : theme.palette.background.paper,
    color: activeTab === index ? theme.palette.primary.main : theme.palette.text.primary,
    '&:hover': {
      backgroundColor: activeTab === index ? theme.palette.primary.light : theme.palette.action.hover,
    },
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
        backgroundColor: theme.palette.background.paper,
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
                color: theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.main,
                },
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
                  Report for the period of {' '}
                  <Box component="span" fontWeight="bold">
                    {allDetailData?.versionValue
                      ? DateTime.fromFormat(allDetailData.versionValue, 'yyyy-MM').toFormat('LLLL yyyy')
                      : ''}
                  </Box>{' '}
                ,created by{' '}
                  {`${allDetailData?.createdBy?.firstName || ''}${
                    allDetailData?.createdBy?.lastName ? ' ' + allDetailData.createdBy.lastName : ''
                  }`}{' '}
                  on{' '}
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
                          variant="text"
                      disabled={!(viewReportNameWithVersionValue && viewReportNameWithVersionValue.length > 0)}
                      onClick={handleDownloadPdf}
                                                sx={{ minWidth: "auto" }}

                      // sx={{
                      //   ...getButtonSx(),
                      //   bgcolor: theme.palette.primary.main,
                      //   color: theme.palette.primary.contrastText,
                      //   '&:hover': {
                      //     bgcolor: theme.palette.primary.dark,
                      //     boxShadow: theme.shadows[3],
                      //   },
                      //   '&:disabled': {
                      //     bgcolor: theme.palette.action.disabledBackground,
                      //     color: theme.palette.action.disabled,
                      //   },
                      // }}
                    >
                      <PictureAsPdfIcon 
                     
                      // sx={{ color: theme.getIconColor() }}
                       />
                    </Button>
                  </Tooltip>
                )}

                {allDetailData?.status === 'completed' && allDetailData?.intermediateReportId && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                    }}
                  >
                    {exportFile.isPending &&
                    !!intermediateDownloadRequestId &&
                    intermediateDownloadRequestId === allDetailData._id ? (
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
                          mr: 1,
                        }}
                      />
                    ) : (
                      <Tooltip title="Intermediate Download" arrow>
                        <Button
                          variant="text"
                                                    sx={{ minWidth: "auto" }}

                          onClick={() => {
                            intermediateDownloadFile(
                              `${allDetailData.customReportId?.reportName}-intermediate-${allDetailData.versionValue}.xlsx`,
                              allDetailData._id
                            );
                          }}
                          // sx={{ ...getButtonSx(), mr: 1 }}
                        >
                          <DownloadForOfflineIcon 
                          // sx={{ color: theme.getIconColor() }}
                           />
                        </Button>
                      </Tooltip>
                    )}
                  </Box>
                )}

                {exportFile.isPending &&
                !!regularDownloadRequestId &&
                regularDownloadRequestId === allDetailData?._id ? (
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
                      variant="text"
                                                sx={{ minWidth: "auto" }}

                      onClick={() => {
                        downloadFile(
                          `${allDetailData?.customReportId?.reportName}-${allDetailData?.versionValue}.xlsx`,
                          allDetailData?._id || ''
                        );
                      }}
                      // sx={{
                      //   ...getButtonSx(),
                      //   mr: 1,
                      //   bgcolor: theme.palette.success.main,
                      //   color: theme.palette.success.contrastText,
                      //   '&:hover': {
                      //     bgcolor: theme.palette.success.dark,
                      //     transform: 'translateY(-1px)',
                      //     boxShadow: theme.shadows[3],
                      //   },
                      // }}
                    >
                      <SimCardDownloadIcon 
                      // sx={{ color: theme.getIconColor() }}
                       />
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
              ...getHeadingSx(),
              fontSize: getHeadingSx().fontSize,
              fontWeight: getHeadingSx().fontWeight,
              color: theme.palette.text.primary,
            }}
          >
            Reports
          </Typography>
        )}
      </Box>

      {viewReportRequestId && viewReportRequestId.length > 0 ? (
        <Box ref={tabRef}>
          <ScrollableTabNavigation
            tabs={(allDetailData?.dataSourceVersion ?? []).filter((tab) => !tab.isIntermediate)}
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
            {allDetailData?.dataSourceVersion
              ?.filter((item) => !!item.allowPdfDownload) // Only include sheets that allow PDF download
              .map((item, index, filteredArray) => (
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
                  </Box>

                  {index < filteredArray.length - 1 && <Box className="html2pdf__page-break" />}
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
              backgroundColor: theme.palette.background.paper,
              borderRadius: 1,
              p: 2,
              boxShadow: theme.shadows[1],
            }}
          >
            <GenerateReport setReload={setReload} />
          </Box>

          <Box
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 1,
              boxShadow: theme.shadows[1],
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
