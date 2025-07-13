import React, { useState, useEffect, useRef, useCallback } from "react";
import { styled } from "@mui/material/styles";
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
  Tooltip,
  tableCellClasses,
} from "@mui/material";
import { useDashboardTheme } from "../../../context/DashboardThemeProvider";

import useGet from '../../../hooks/useGet';
import { GET } from '../../../services/apiRoutes';
import { ReportRequestResponse } from './types';
import useFileDownload from '../../../hooks/useFiledownload';
import { DateTime } from 'luxon';
import SimCardDownloadIcon from '@mui/icons-material/SimCardDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { STYLE_GUIDE } from '../../../styles';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';


const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.table?.headerBackground || theme.palette.background.default,
    color: theme.palette.table?.headerText || theme.palette.text.primary,
    fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
    fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
    height: "48px",
    padding: "0 16px",
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
    height: "52px",
    padding: "0 16px",
    borderBottom: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
  }}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateY(-1px)',
    transition: 'all 0.2s ease-in-out',
    boxShadow: theme.shadows[1],
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius:  STYLE_GUIDE.SPACING.s2,
  padding: '6px 12px',
  marginRight: '8px',
  fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
  fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
  minWidth: '80px',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[2],
  },
  "&:active": {
    transform: 'translateY(0)',
  },
}));

interface AttributeOptionTableProps {
  reload: boolean; // reload is now a boolean
  setReload: React.Dispatch<React.SetStateAction<boolean>>;
  setViewReportRequestId: React.Dispatch<React.SetStateAction<string>>;
  setViewReportNameWithVersionValue: React.Dispatch<
    React.SetStateAction<string>
  >;
  setAllDetailData: React.Dispatch<
    React.SetStateAction<ReportRequestResponse | null>
  >;
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
}) => {
  const { currentTheme } = useDashboardTheme();
  const [reportRequests, setReportRequests] = useState<ReportRequestResponse[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [downloadFileName, setDownLoadFileName] = useState("");
  const [processingRequestDataAvailable, setProcessingRequestDataAvailable] =
    useState(false);
  const [processingRequestCount, setProcessingRequestCount] = useState(0);
  const [downloadRequestId, setDownloadRequestId] = useState("");
  const [intermediateDownloadRequestId, setIntermediateDownloadRequestId] = useState("");

  const exportFile = useFileDownload<Blob>((data) => {
    const blob = new Blob([data], { type: "application/octet-stream" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = downloadFileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  });

  const downloadFile = (fileName: string, fileId: string) => {
    setDownloadRequestId(fileId);
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

  const perPageItem = 10;

  const reportRequestList = useGet<ReportRequestData>(
    [`reportRequestList`, String(currentPage)],
    GET?.Custom_Report +
      "/listReportRequest" +
      `?page=${currentPage}&limit=${perPageItem}`,
    !!currentPage
  );

  const notProcessingReportRequestDetails = useGet<ReportRequestData>(
    [`notprocesssingReportRequestList`, String(processingRequestCount)],
    GET?.Custom_Report +
      `/listReportRequest?page=1&limit=10&status=notprocessing`,
    !!processingRequestCount
  );

  useEffect(() => {
    const processingReports = reportRequests.filter((data) => {
      const createdAt = DateTime.fromISO(data.createdAt);
      const now = DateTime.utc();
      const diff = now.diff(createdAt, ["hours"]).toObject();
      return data.status === "processing" && diff.hours! <= 1;
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
      notProcessingReportRequestDetails.data.data.map((item) => [
        item._id,
        item.status,
      ])
    );

    setReportRequests((prevRequests) =>
      prevRequests.map((data) =>
        dataMap.has(data._id)
          ? { ...data, status: dataMap.get(data._id)! }
          : data
      )
    );
  }, [notProcessingReportRequestDetails]);

  useEffect(() => {
    if (notProcessingReportRequestDetails?.data?.data) {
      const dataMap: Map<string, string> = new Map(
        notProcessingReportRequestDetails.data.data.map((item) => [
          item._id,
          item.status,
        ])
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
      if (
        reportRequestList.isFetching ||
        reportRequests.length >= (reportRequestList?.data?.totalCount ?? 0)
      )
        return;

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
    [
      reportRequestList.isFetching,
      reportRequests.length,
      reportRequestList?.data?.totalCount,
    ]
  );

  if (!reportRequestList.isFetching && !reportRequests.length) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        sx={{ textAlign: "center", marginTop: 10 }}
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
        borderRadius: "inherit",
        boxShadow: "none",
        height: "calc(100vh - 250px)",
        "& .MuiTable-root": {
          borderCollapse: "separate",
          borderSpacing: 0,
        },
      }}
    >
      <Table stickyHeader aria-label="report-request-table">
        <TableHead>
          <TableRow>
            <StyledTableCell sx={{ fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold }}>Report Name</StyledTableCell>
            <StyledTableCell sx={{ fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold }}>Period</StyledTableCell>
            <StyledTableCell sx={{ fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold }}>Status</StyledTableCell>
            <StyledTableCell sx={{ fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold }}>Prepared By</StyledTableCell>
            <StyledTableCell sx={{ fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold }}>Prepared On</StyledTableCell>
            <StyledTableCell sx={{ fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold }} align="right">Action</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportRequests.map((data, dataIndex) => (
            <StyledTableRow
              key={data._id}
              ref={
                reportRequests.length === dataIndex + 1 ? lastElementRef : null
              }
              sx={{
                backgroundColor: dataIndex % 2 === 0 
                  ? currentTheme?.components?.table?.rowOddBackground || '#f1f5f9'
                  : currentTheme?.components?.table?.rowEvenBackground || '#ffffff',
                '&:hover': {
                  backgroundColor: currentTheme?.components?.table?.rowHoverBackground || '#f0f0f0',
                }
              }}
            >
              <StyledTableCell sx={{ color: currentTheme?.components?.table?.rowText || '#34495e' }}>
                {data.customReportId?.reportName || "-"}
              </StyledTableCell>
              <StyledTableCell sx={{ color: currentTheme?.components?.table?.rowText || '#34495e' }}>{data.versionValue || "-"}</StyledTableCell>
              <StyledTableCell
                sx={{
                  color:
                    data.status === "completed"
                      ? "success.main"
                      : data.status === "processing"
                      ? "warning.main"
                      : data.status === "failed"
                      ? "error.main"
                      : "text.primary",
                  fontWeight: 500,
                }}
              >
                {data.status || "-"}
              </StyledTableCell>
              <StyledTableCell sx={{ color: currentTheme?.components?.table?.rowText || '#34495e' }}>
                {`${data?.createdBy?.firstName || ""}${
                  data?.createdBy?.lastName ? " " + data.createdBy.lastName : ""
                }`}
              </StyledTableCell>
              <StyledTableCell sx={{ color: currentTheme?.components?.table?.rowText || '#34495e' }}>
                {data.createdAt
                  ? new Date(data.createdAt).toLocaleString()
                  : "-"}
              </StyledTableCell>
              <StyledTableCell align="right" sx={{display: 'flex'}}>
                {data.status === "completed" ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                    }}
                  >
                    {exportFile.isPending &&
                    !!downloadRequestId &&
                    downloadRequestId === data._id ? (
                      <Box
                        sx={{
                          width: 27,
                          height: 27,
                          borderRadius: "50%",
                          border: "3px solid #f3f3f3",
                          borderTop: "3px solid #3498db",
                          animation: "spin 1s linear infinite",
                          "@keyframes spin": {
                            "0%": { transform: "rotate(0deg)" },
                            "100%": { transform: "rotate(360deg)" },
                          },
                          mr: 1,
                        }}
                      />
                    ) : (
                      <Tooltip title="Download Excel" arrow>
                        <StyledButton
                          onClick={() => {
                            downloadFile(
                              `${data.customReportId?.reportName}-${data.versionValue}.xlsx`,
                              data._id
                            );
                          }}
                          sx={{ mr: 1 }}
                        >
                          <SimCardDownloadIcon />
                        </StyledButton>
                      </Tooltip>
                    )}
                    <Tooltip title="View Report" arrow>
                      <StyledButton
                        onClick={() => {
                          setAllDetailData(data);
                          setViewReportRequestId(data._id);
                          setViewReportNameWithVersionValue(
                            `${data.customReportId?.reportName}-${data.versionValue}`
                          );
                        }}
                      >
                        <VisibilityIcon />
                      </StyledButton>
                    </Tooltip>
                  </Box>
                ) : (
                  "-"
                )}
                {data.status === "completed" && data.intermediateReportId && (
                   <Box
                   sx={{
                     display: "flex",
                     justifyContent: "flex-end",
                     alignItems: "center",
                   }}
                 >
                  {exportFile.isPending &&
                  !!intermediateDownloadRequestId &&
                  intermediateDownloadRequestId === data._id ? (
                    <Box
                      sx={{
                        width: 27,
                        height: 27,
                        borderRadius: "50%",
                        border: "3px solid #f3f3f3",
                        borderTop: "3px solid #3498db",
                        animation: "spin 1s linear infinite",
                        "@keyframes spin": {
                          "0%": { transform: "rotate(0deg)" },
                          "100%": { transform: "rotate(360deg)" },
                        },
                        mr: 1,
                      }}
                    />
                  ) : (
                    <Tooltip title="Intermediate Download" arrow>
                      <StyledButton
                        onClick={() => {
                          intermediateDownloadFile(
                            `${data.customReportId?.reportName}-intermediate-${data.versionValue}.xlsx`,
                            data._id
                          );
                        }}
                        sx={{ mr: 1 }}
                      >
                        <DownloadForOfflineIcon />
                      </StyledButton>
                    </Tooltip>
                  )}
                  </Box>
                )}
              </StyledTableCell>
            </StyledTableRow>
          ))}

          {reportRequestList.isFetching &&
            Array.from({ length: 1 }, (_, index) => (
              <StyledTableRow 
                key={index}
                sx={{
                  backgroundColor: currentTheme?.components?.table?.rowOddBackground || '#f1f5f9',
                }}
              >
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