import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  type SelectChangeEvent,
  Skeleton,
} from '@mui/material';
import useGet from '../../../hooks/useGet';
import { GET } from '../../../services/apiRoutes';
import { ReportRequestResponse } from './types';

// Define types for our data
interface ReportData {
  _id: string;
  reportName: string;
}

interface ReportSelectionProps {
  defaultReport?: { _id: string; reportName: string };
  defaultVersion?: { _id: string; versionValue: string };
  setViewReportRequestId: React.Dispatch<React.SetStateAction<string>>;
  setViewReportNameWithVersionValue: React.Dispatch<React.SetStateAction<string>>;
  setAllDetailData: React.Dispatch<React.SetStateAction<ReportRequestResponse | null>>;
}

export default function ReportSelection({
  defaultReport,
  defaultVersion,
  setViewReportRequestId,
  setViewReportNameWithVersionValue,
  setAllDetailData,
}: ReportSelectionProps) {
  // State for selected values
  const [selectedReport, setSelectedReport] = useState<string>(defaultReport?._id || '');
  const [selectedVersion, setSelectedVersion] = useState<string>(defaultVersion?._id || '');

  const [currentPageReport, setCurrentPageReport] = useState<number>(1);
  const [currentPageVersion, setCurrentPageVersion] = useState<number>(1);

  const [reports, setReports] = useState<ReportData[]>([]);
  const [versions, setVersions] = useState<ReportRequestResponse[]>([]);

  const perPageItem = 2;

  // Fetch reports data
  const reportList = useGet<{ success: boolean; data: ReportData[]; totalCount: number }>(
    [`reportList`, String(currentPageReport)],
    `${GET?.Custom_Report}/list` + `?page=${currentPageReport}&limit=${perPageItem}`,
    !!currentPageReport
  );

  // Fetch versions data
  const versionList = useGet<{ success: boolean; data: ReportRequestResponse[]; totalCount: number }>(
    [`versionList`, String(selectedReport), String(currentPageVersion)],
    `${GET?.Data_Source_Version}/listVersionData/${selectedReport}` +
      `?page=${currentPageVersion}&limit=${perPageItem}`,
    !!currentPageVersion && !!selectedReport
  );

  // Update reports when data changes
  useEffect(() => {
    if (reportList?.data?.data) {
      if (currentPageReport === 1) {
        setReports(reportList.data.data);
      } else {
        setReports((prev) => [...prev, ...reportList.data.data]);
      }
    }
  }, [reportList?.data]);

  // Update versions when data changes
  useEffect(() => {
    if (versionList?.data?.data) {
      if (currentPageVersion === 1) {
        setVersions(versionList.data.data);
      } else {
        setVersions((prev) => [...prev, ...versionList.data.data]);
      }
    }
  }, [versionList?.data]);

  // Handle report selection change
  const handleReportChange = (event: SelectChangeEvent<string>) => {
    const reportId = event.target.value;
    setSelectedReport(reportId);
    setSelectedVersion('');
    setVersions([]);
    setCurrentPageVersion(1);
  };

  // Handle version selection change
  const handleVersionChange = (event: SelectChangeEvent<string>) => {
    setSelectedVersion(event.target.value);
  };

  // Handle submit button click
  const handleSubmit = () => {
    if (selectedReport && selectedVersion) {
      const data = versions.find((v) => v._id === selectedVersion);
      if (data) {
        setAllDetailData(data);
        setViewReportRequestId(data._id);
        setViewReportNameWithVersionValue(`${data.customReportId?.reportName}-${data.versionValue}`);
      }
    }
  };

  const lastReportRowRef = useRef<IntersectionObserver | null>(null);

  const lastReportElementRef = useCallback(
    (node: HTMLLIElement | null) => {
      if (reportList.isFetching || reports.length >= reportList?.data?.totalCount!) return;

      // Disconnect the previous observer if it exists
      if (lastReportRowRef.current) {
        lastReportRowRef.current.disconnect();
      }

      // Create a new IntersectionObserver
      lastReportRowRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setCurrentPageReport((prevPage) => prevPage + 1);
        }
      });

      // Observe the new node if it exists
      if (node) {
        lastReportRowRef.current.observe(node);
      }
    },
    [reportList.isFetching, reports.length, reportList?.data?.totalCount]
  );

  const lastVersionRef = useRef<IntersectionObserver | null>(null);

  const lastVersionElementRef = useCallback(
    (node: HTMLLIElement | null) => {
      if (versionList.isFetching || versions.length >= versionList?.data?.totalCount!) return;

      // Disconnect the previous observer if it exists
      if (lastVersionRef.current) {
        lastVersionRef.current.disconnect();
      }

      // Create a new IntersectionObserver
      lastVersionRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setCurrentPageVersion((prevPage) => prevPage + 1);
        }
      });

      // Observe the new node if it exists
      if (node) {
        lastVersionRef.current.observe(node);
      }
    },
    [versionList.isFetching, versions.length, versionList?.data?.totalCount]
  );

  // Find the default report and version display names
  const selectedReportName =
    reports.find((r) => r._id === selectedReport)?.reportName ||
    (defaultReport && selectedReport === defaultReport._id ? defaultReport.reportName : '');

  const selectedVersionValue =
    versions.find((v) => v._id === selectedVersion)?.versionValue ||
    (defaultVersion && selectedVersion === defaultVersion._id ? defaultVersion.versionValue : '');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'flex-end' },
        gap: 2,
        p: 2,
        backgroundColor: 'white',
        borderRadius: 1,
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
      }}
    >
      <FormControl sx={{ minWidth: 200, flex: 1 }}>
        <InputLabel id="report-select-label">Report Name</InputLabel>
        <Select
          labelId="report-select-label"
          id="report-select"
          value={selectedReport}
          label="Report Name"
          renderValue={() => selectedReportName}
          onChange={handleReportChange}
        >
          {reports.map((report, i) => (
            <MenuItem key={report._id} value={report._id} ref={i === reports.length - 1 ? lastReportElementRef : null}>
              {report.reportName}
            </MenuItem>
          ))}
          {reportList.isFetching && (
            <>
              {[1, 2, 3].map((i) => (
                <MenuItem key={`skeleton-report-${i}`} disabled sx={{ opacity: 1 }}>
                  <Skeleton variant="text" width="100%" height={24} animation="wave" />
                </MenuItem>
              ))}
            </>
          )}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 200, flex: 1 }}>
        <InputLabel id="version-select-label">Version</InputLabel>
        <Select
          labelId="version-select-label"
          id="version-select"
          value={selectedVersion}
          label="Version"
          onChange={handleVersionChange}
          renderValue={() => selectedVersionValue}
          disabled={!selectedReport}
        >
          {versions.map((version, i) => (
            <MenuItem
              key={version._id}
              value={version._id}
              ref={i === versions.length - 1 ? lastVersionElementRef : null}
            >
              {version.versionValue}
            </MenuItem>
          ))}
          {versionList.isFetching && (
            <>
              {[1, 2, 3].map((i) => (
                <MenuItem key={`skeleton-version-${i}`} disabled sx={{ opacity: 1 }}>
                  <Skeleton variant="text" width="100%" height={24} animation="wave" />
                </MenuItem>
              ))}
            </>
          )}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        color="primary"
        disabled={!selectedReport || !selectedVersion}
        onClick={handleSubmit}
        sx={{
          height: 56,
          minWidth: 120,
        }}
      >
        View
      </Button>
    </Box>
  );
}
