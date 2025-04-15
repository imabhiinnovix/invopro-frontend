import React, { useState, useEffect, useRef, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Skeleton,
  Typography,
  Button,
  tableCellClasses,
} from '@mui/material';

import useGet from '../../../hooks/useGet';
import { GET } from '../../../services/apiRoutes';
import { ReportRequestResponse } from './types';
import useFileDownload from '../../../hooks/useFiledownload';
import { DateTime } from 'luxon';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import VisibilityIcon from '@mui/icons-material/Visibility';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.grey[50],
    color: theme.palette.text.primary,
    fontWeight: 600,
    fontSize: '0.813rem',
    height: '48px',
    padding: '0 16px',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: '0.875rem',
    height: '52px',
    padding: '0 16px',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: 10,
  // padding: '6px 12px',
  // marginRight: '2',
  fontSize: '0.813rem',
  fontWeight: 500,
  minWidth: '80px',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

interface AttributeOptionTableProps {
  reload: boolean; // reload is now a boolean
  setReload: React.Dispatch<React.SetStateAction<boolean>>;
  setViewReportRequestId: React.Dispatch<React.SetStateAction<string>>;
  setViewReportNameWithVersionValue: React.Dispatch<React.SetStateAction<string>>;
  setAllDetailData: React.Dispatch<React.SetStateAction<ReportRequestResponse | null>>;
  setReportDetailData: React.Dispatch<React.SetStateAction<string>>;
}

interface ReportRequestData {
  success: boolean;
  data: ReportRequestResponse[];
  totalCount: number;
}

const ReportRequestTable: React.FC<AttributeOptionTableProps> = ({
  reload,
  setReload,
  setViewReportRequestId,
  setViewReportNameWithVersionValue,
  setAllDetailData,
  setReportDetailData,
}) => {
  const [reportRequests, setReportRequests] = useState<ReportRequestResponse[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [downloadFileName, setDownLoadFileName] = useState('');
  const [processingRequestDataAvailable, setProcessingRequestDataAvailable] = useState(false);
  const [processingRequestCount, setProcessingRequestCount] = useState(0);

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

  const perPageItem = 10;

  const reportRequestList = useGet<ReportRequestData>(
    [`reportRequestList`, String(currentPage)],
    GET?.Custom_Report + '/listReportRequest' + `?page=${currentPage}&limit=${perPageItem}`,
    !!currentPage
  );

  const notProcessingReportRequestDetails = useGet<ReportRequestData>(
    [`notprocesssingReportRequestList`, String(processingRequestCount)],
    GET?.Custom_Report + `/listReportRequest?page=1&limit=10&status=notprocessing`,
    !!processingRequestCount
  );

  useEffect(() => {
    const processingReports = reportRequests.filter((data) => {
      const createdAt = DateTime.fromISO(data.createdAt);
      const now = DateTime.utc();
      const diff = now.diff(createdAt, ['hours']).toObject();
      return data.status === 'processing' && diff.hours! <= 1;
    });
    setProcessingRequestDataAvailable(processingReports.length > 0);
  }, [reportRequests]);

  useEffect(() => {
    if (processingRequestDataAvailable) {
      const intervalId = setInterval(() => {
        setProcessingRequestCount((prevCount) => prevCount + 1);
      }, 60000);

      return () => clearInterval(intervalId);
    } else {
      setProcessingRequestCount(0);
    }
  }, [processingRequestDataAvailable]);

  useEffect(() => {
    if (!notProcessingReportRequestDetails?.data?.data) return;

    const dataMap: Map<string, string> = new Map(
      notProcessingReportRequestDetails.data.data.map((item) => [item._id, item.status])
    );

    setReportRequests((prevRequests) =>
      prevRequests.map((data) => (dataMap.has(data._id) ? { ...data, status: dataMap.get(data._id)! } : data))
    );
  }, [notProcessingReportRequestDetails]);

  useEffect(() => {
    if (notProcessingReportRequestDetails?.data?.data) {
      const dataMap: Map<string, string> = new Map(
        notProcessingReportRequestDetails.data.data.map((item) => [item._id, item.status])
      );
      const updatedReportRequest = reportRequests.map((data) => {
        if (dataMap.has(data._id)) {
          return { ...data, status: dataMap.get(data._id)! };
        }
        return data;
      });
      setReportRequests(updatedReportRequest);
    }
  }, [notProcessingReportRequestDetails]);

  useEffect(() => {
    setCurrentPage(1);
  }, [reload]);

  useEffect(() => {
    if (currentPage === 1 && reload) {
      reportRequestList.refetch();
      setReload(false);
    }
  }, [currentPage, reload, reportRequestList, setReload]);

  useEffect(() => {
    if (reportRequestList?.data?.data) {
      if (currentPage === 1) {
        setReportRequests([...reportRequestList.data.data]);
      } else {
        setReportRequests((prev) => [...prev, ...reportRequestList.data.data]);
      }
    }
  }, [reportRequestList?.data?.data, currentPage]);

  useEffect(() => {
    setCurrentPage(currentPage);
  }, [currentPage]);

  const lastRowRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (reportRequestList.isFetching || reportRequests.length >= (reportRequestList?.data?.totalCount ?? 0)) return;

      if (lastRowRef.current) {
        lastRowRef.current.disconnect();
      }

      lastRowRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      });

      if (node) {
        lastRowRef.current.observe(node);
      }
    },
    [reportRequestList.isFetching, reportRequests.length, reportRequestList?.data?.totalCount]
  );

  if (!reportRequestList.isFetching && !reportRequests.length) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        sx={{ textAlign: 'center', marginTop: 10 }}
        alignContent="center"
        alignItems="center"
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          No report requests have been made yet.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 'inherit',
        boxShadow: 'none',
        height: 'calc(100vh - 250px)',
        '& .MuiTable-root': {
          borderCollapse: 'separate',
          borderSpacing: 0,
        },
      }}
    >
      <Table stickyHeader aria-label="report-request-table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Report Name</StyledTableCell>
            <StyledTableCell>Period</StyledTableCell>
            <StyledTableCell>Status</StyledTableCell>
            <StyledTableCell>Prepared By</StyledTableCell>
            <StyledTableCell>Prepared On</StyledTableCell>
            <StyledTableCell align="right">Action</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportRequests.map((data, dataIndex) => (
            <StyledTableRow key={data._id} ref={reportRequests.length === dataIndex + 1 ? lastElementRef : null}>
              <StyledTableCell>{data.customReportId?.reportName || '-'}</StyledTableCell>
              <StyledTableCell>{data.versionValue || '-'}</StyledTableCell>
              <StyledTableCell
                sx={{
                  color:
                    data.status === 'completed'
                      ? 'success.main'
                      : data.status === 'processing'
                      ? 'warning.main'
                      : data.status === 'failed'
                      ? 'error.main'
                      : 'text.primary',
                  fontWeight: 500,
                }}
              >
                {data.status || '-'}
              </StyledTableCell>
              <StyledTableCell>
                {`${data?.createdBy?.firstName || ''}${data?.createdBy?.lastName ? ' ' + data.createdBy.lastName : ''}`}
              </StyledTableCell>
              <StyledTableCell>{data.createdAt ? new Date(data.createdAt).toLocaleString() : '-'}</StyledTableCell>
              <StyledTableCell align="right">
                {data.status === 'completed' ? (
                  <Box>
                    <StyledButton
                      onClick={() => {
                        downloadFile(`${data.customReportId?.reportName}-${data.versionValue}.xlsx`, data._id);
                      }}
                      sx={{ mr: 1 }}
                    >
                      <DownloadForOfflineIcon />
                    </StyledButton>
                    <StyledButton
                      onClick={() => {
                        setAllDetailData(data);
                        const versionId = data?.dataSourceVersion?.[0]?.dataSourceVersionId;
                        if (versionId) {
                          setReportDetailData(versionId);
                        }
                        setViewReportRequestId(data._id);
                        setViewReportNameWithVersionValue(`${data.customReportId?.reportName}-${data.versionValue}`);
                      }}
                    >
                      <VisibilityIcon />
                    </StyledButton>
                  </Box>
                ) : (
                  '-'
                )}
              </StyledTableCell>
            </StyledTableRow>
          ))}

          {reportRequestList.isFetching &&
            Array.from({ length: 1 }, (_, index) => (
              <StyledTableRow key={index}>
                <StyledTableCell colSpan={5}>
                  <Skeleton height={52} />
                </StyledTableCell>
              </StyledTableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReportRequestTable;
