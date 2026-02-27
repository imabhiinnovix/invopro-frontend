import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Collapse,
  IconButton,
  CircularProgress,
} from "@mui/material";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  YearGroup,
  MonthGroup,
  CentralFile,
  CentralFilesListResponse,
  MONTH_NAMES,
} from "../types";
import { STYLE_GUIDE } from "../../../styles";
import { GET } from "../../../services/apiRoutes";
import useGet from "../../../hooks/useGet";
import { formatDate } from "../../../utils/utils";
import FilesTable from "./FilesTable";

interface FolderExplorerProps {
  data: YearGroup[];
  loading?: boolean;
  reportId: string;
  dataSourceId: string;
  isNotificationsTab: boolean;
  onView?: (file: CentralFile) => void;
  onMapping?: (file: CentralFile) => void;
  onDownload?: (file: CentralFile) => void;
  onDelete?: (file: CentralFile) => void;
}

interface FolderRowProps {
  label: string;
  count: number;
  countLabel: string;
  depth: number;
  isExpanded: boolean;
  onToggle: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size % 1 === 0 ? size : size.toFixed(1)} ${units[i]}`;
}

function FolderRow({ label, count, countLabel, isExpanded, onToggle, depth }: FolderRowProps) {
  return (
    <Box
      onClick={onToggle}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        py: 1.25,
        px: 2,
        pl: 2 + depth * 3,
        cursor: "pointer",
        borderRadius: "8px",
        transition: "background-color 0.15s ease",
        "&:hover": {
          backgroundColor: STYLE_GUIDE.COLORS.inputFieldBackground,
        },
      }}
    >
      <IconButton size="small" sx={{ p: 0 }}>
        {isExpanded ? (
          <KeyboardArrowDownIcon sx={{ fontSize: 20, color: STYLE_GUIDE.COLORS.textSecondary }} />
        ) : (
          <KeyboardArrowRightIcon sx={{ fontSize: 20, color: STYLE_GUIDE.COLORS.textSecondary }} />
        )}
      </IconButton>

      <FolderOutlinedIcon
        sx={{
          fontSize: 20,
          color: isExpanded
            ? STYLE_GUIDE.COLORS.themeColor
            : STYLE_GUIDE.COLORS.textSecondary,
        }}
      />

      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          fontSize: "14px",
          color: STYLE_GUIDE.COLORS.tableBodyText,
        }}
      >
        {label}
      </Typography>

      <Typography
        variant="caption"
        sx={{
          color: STYLE_GUIDE.COLORS.textSecondary,
          fontSize: "13px",
          ml: 0.5,
        }}
      >
        ({count} {countLabel})
      </Typography>
    </Box>
  );
}

function MonthSection({
  month,
  year,
  depth,
  reportId,
  dataSourceId,
  isNotificationsTab,
  onView,
  onMapping,
  onDownload,
  onDelete,
}: {
  month: MonthGroup;
  year: number;
  depth: number;
  reportId: string;
  dataSourceId: string;
  isNotificationsTab: boolean;
  onView?: (file: CentralFile) => void;
  onMapping?: (file: CentralFile) => void;
  onDownload?: (file: CentralFile) => void;
  onDelete?: (file: CentralFile) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const monthNumber = MONTH_NAMES.indexOf(month.month as typeof MONTH_NAMES[number]) + 1;

  const idParam = isNotificationsTab
    ? `dataSourceId=${dataSourceId}`
    : `reportId=${reportId}`;

  const filesUrl = `${GET.CENTRAL_FILES_LIST}?${idParam}&month=${monthNumber}&year=${year}&page=${paginationModel.page + 1}&limit=${paginationModel.pageSize}`;

  const filesQuery = useGet<CentralFilesListResponse>(
    ["centralFilesList", idParam, String(year), String(monthNumber), String(paginationModel.page + 1), String(paginationModel.pageSize)],
    filesUrl,
    expanded
  );

  const files: CentralFile[] = useMemo(() => {
    const raw = filesQuery.data?.data;
    if (!raw || raw.length === 0) return [];

    return raw.map((item) => ({
      _id: item._id,
      filename: item.originalFileName,
      addedDate: formatDate(item.createdAt),
      fileSize: formatFileSize(item.fileSize),
      uploadedBy: item.createdBy,
      status: item.validationStatus as CentralFile["status"],
      year: item.year,
      month: MONTH_NAMES[item.month - 1] || String(item.month),
      week: item.week ?? undefined,
    }));
  }, [filesQuery.data]);

  const totalCount = filesQuery.data?.totalCount ?? month.totalFiles;

  return (
    <Box>
      <Box
        onClick={() => setExpanded((prev) => !prev)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          py: 1,
          px: 2,
          pl: 2 + depth * 3,
          cursor: "pointer",
          borderRadius: "8px",
          "&:hover": {
            backgroundColor: STYLE_GUIDE.COLORS.inputFieldBackground,
          },
        }}
      >
        <IconButton size="small" sx={{ p: 0 }}>
          {expanded ? (
            <KeyboardArrowDownIcon sx={{ fontSize: 18, color: STYLE_GUIDE.COLORS.textSecondary }} />
          ) : (
            <KeyboardArrowRightIcon sx={{ fontSize: 18, color: STYLE_GUIDE.COLORS.textSecondary }} />
          )}
        </IconButton>

        <FolderOutlinedIcon
          sx={{
            fontSize: 18,
            color: expanded
              ? STYLE_GUIDE.COLORS.themeColor
              : STYLE_GUIDE.COLORS.textSecondary,
          }}
        />

        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            fontSize: "13px",
            color: STYLE_GUIDE.COLORS.tableBodyText,
          }}
        >
          {month.month}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            color: STYLE_GUIDE.COLORS.textSecondary,
            fontSize: "12px",
            ml: 0.5,
          }}
        >
          ({month.totalFiles} {month.totalFiles === 1 ? "file" : "files"})
        </Typography>
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ pl: 2 + (depth + 1) * 3, pr: 2, py: 1 }}>
          {filesQuery.isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <FilesTable
              files={files}
              totalCount={totalCount}
              paginationModel={paginationModel}
              setPaginationModel={setPaginationModel}
              loading={filesQuery.isFetching}
              onView={onView}
              onMapping={onMapping}
              onDownload={onDownload}
              onDelete={onDelete}
            />
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

export default function FolderExplorer({
  data,
  loading,
  reportId,
  dataSourceId,
  isNotificationsTab,
  onView,
  onMapping,
  onDownload,
  onDelete,
}: FolderExplorerProps) {
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({});

  const toggleYear = (year: number) => {
    setExpandedYears((prev) => ({ ...prev, [year]: !prev[year] }));
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 10,
        }}
      >
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 10,
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "16px",
            border: `2px solid ${STYLE_GUIDE.COLORS.themeColor}30`,
            backgroundColor: `${STYLE_GUIDE.COLORS.themeColor}08`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1,
          }}
        >
          <FolderOutlinedIcon
            sx={{
              fontSize: 36,
              color: STYLE_GUIDE.COLORS.themeColor,
              opacity: 0.7,
            }}
          />
        </Box>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            fontSize: "15px",
            color: STYLE_GUIDE.COLORS.tableBodyText,
          }}
        >
          No files uploaded yet
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: "13px",
            color: STYLE_GUIDE.COLORS.textSecondary,
          }}
        >
          Upload files to organize them by year and month
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {data.map((yearGroup) => (
        <Box key={yearGroup.year}>
          <FolderRow
            label={String(yearGroup.year)}
            count={yearGroup.months.length}
            countLabel={yearGroup.months.length === 1 ? "month" : "months"}
            depth={0}
            isExpanded={!!expandedYears[yearGroup.year]}
            onToggle={() => toggleYear(yearGroup.year)}
          />

          <Collapse in={!!expandedYears[yearGroup.year]} timeout="auto" unmountOnExit>
            {yearGroup.months.map((month) => (
              <MonthSection
                key={`${yearGroup.year}-${month.month}`}
                month={month}
                year={yearGroup.year}
                depth={1}
                reportId={reportId}
                dataSourceId={dataSourceId}
                isNotificationsTab={isNotificationsTab}
                onView={onView}
                onMapping={onMapping}
                onDownload={onDownload}
                onDelete={onDelete}
              />
            ))}
          </Collapse>
        </Box>
      ))}
    </Box>
  );
}
