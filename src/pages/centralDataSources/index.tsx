import { useState, useMemo, useCallback, useEffect } from "react";
import { Box } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { DateTime } from "luxon";
import { PageHeader, PageCardLayout, StyledButton } from "../../components/common";
import ScrollableTabNavigation from "../../components/atom/report/scrollableTab";
import { STYLE_GUIDE } from "../../styles";
import { GET, DELETE, POST } from "../../services/apiRoutes";
import useGet from "../../hooks/useGet";
import useDelete from "../../hooks/useDelete";
import useFileDownload from "../../hooks/useFiledownload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axiosInstance from "../../services/axiosInstance";
import {
  DATA_SOURCE_TABS,
  MONTH_NAMES,
  YearGroup,
  CentralFile,
  CentralFilesListResponse,
  FolderSummaryResponse,
} from "./types";
import FolderExplorer from "./components/FolderExplorer";
import SearchSortToolbar from "./components/SearchSortToolbar";
import SearchResultsTable, { SearchResultFile } from "./components/SearchResultsTable";
import UploadFilesModal from "./components/UploadFilesModal";
import FileViewModal from "./components/FileViewModal";
import ConfirmDialog from "../report-settings/components/ConfirmDialog";
import { formatDate } from "../../utils/utils";

const TYPE_FILTER_OPTIONS = DATA_SOURCE_TABS.map((tab) => ({
  label: tab.tabName,
  value: tab.key,
}));

interface ReportListItem {
  _id: string;
  reportName: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size % 1 === 0 ? size : size.toFixed(1)} ${units[i]}`;
}

export default function CentralDataSources() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState<DateTime | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<CentralFile | null>(null);
  const [viewFile, setViewFile] = useState<CentralFile | null>(null);
  const [searchPaginationModel, setSearchPaginationModel] = useState({ page: 0, pageSize: 10 });

  const queryClient = useQueryClient();

  // Debounce search input (500ms, min 3 chars)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue.length === 0) {
        setDebouncedSearch("");
      } else if (searchValue.length < 3) {
        setDebouncedSearch("");
      } else {
        setDebouncedSearch(searchValue);
      }
      setSearchPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchValue]);

  const isFilterActive =
    debouncedSearch.length >= 3 ||
    selectedType !== "all" ||
    selectedPeriod !== null;

  const currentTabKey = DATA_SOURCE_TABS[activeTab]?.key;
  const isNotificationsTab = currentTabKey === "notifications";

  const reportListQuery = useGet<{
    success: boolean;
    data: ReportListItem[];
    totalCount: number;
  }>(
    ["reportListForDataSources"],
    `${GET.Custom_Report}/list?page=1&limit=50`,
    true
  );

  const currentTabName = DATA_SOURCE_TABS[activeTab]?.tabName;

  const reportId = useMemo(() => {
    const reports = reportListQuery.data?.data;
    if (!reports || reports.length === 0) return "";

    const tabName = currentTabName.toLowerCase();
    const matched = reports.find(
      (r) => r.reportName.toLowerCase() === tabName
    );
    if (matched) return matched._id;

    const partial = reports.find(
      (r) =>
        r.reportName.toLowerCase().includes(tabName) ||
        tabName.includes(r.reportName.toLowerCase())
    );
    return partial?._id ?? "";
  }, [reportListQuery.data, currentTabName]);

  const dataSourceListQuery = useGet<{
    success: boolean;
    data: { _id: string; name: string }[];
  }>(
    ["dataSourceListForCentral"],
    GET.DATA_SOURCE_LIST,
    isNotificationsTab || selectedType === "notifications"
  );

  const dataSourceId = useMemo(() => {
    const list = dataSourceListQuery.data?.data;
    if (list && list.length > 0) {
      return list[0]._id;
    }
    return "";
  }, [dataSourceListQuery.data]);

  // --- Folder view data ---
  const folderSummaryUrl = useMemo(() => {
    if (isNotificationsTab && dataSourceId) {
      return `${GET.CENTRAL_FILES_FOLDER_SUMMARY}?dataSourceId=${dataSourceId}`;
    }
    if (!isNotificationsTab && reportId) {
      return `${GET.CENTRAL_FILES_FOLDER_SUMMARY}?reportId=${reportId}`;
    }
    return "";
  }, [isNotificationsTab, reportId, dataSourceId]);

  const folderSummaryQuery = useGet<FolderSummaryResponse>(
    ["centralFilesFolderSummary", currentTabKey, folderSummaryUrl],
    folderSummaryUrl,
    !!folderSummaryUrl
  );

  const rawFolderData: YearGroup[] = useMemo(() => {
    const summaryData = folderSummaryQuery.data?.data;
    if (!summaryData || summaryData.length === 0) return [];

    return summaryData.map((yearItem) => ({
      year: yearItem.year,
      months: yearItem.months
        .map((monthItem) => ({
          month: MONTH_NAMES[monthItem.month - 1] || `Month ${monthItem.month}`,
          totalFiles: monthItem.totalFiles,
          files: [],
        }))
        .sort((a, b) => {
          const aIdx = MONTH_NAMES.indexOf(a.month as typeof MONTH_NAMES[number]);
          const bIdx = MONTH_NAMES.indexOf(b.month as typeof MONTH_NAMES[number]);
          return bIdx - aIdx;
        }),
    }));
  }, [folderSummaryQuery.data]);

  const filteredData: YearGroup[] = useMemo(() => {
    if (!selectedPeriod) return rawFolderData;

    const filterYear = selectedPeriod.year;
    const filterMonth = MONTH_NAMES[selectedPeriod.month - 1];

    return rawFolderData
      .filter((yg) => yg.year === filterYear)
      .map((yg) => ({
        ...yg,
        months: yg.months.filter((mg) => mg.month === filterMonth),
      }))
      .filter((yg) => yg.months.length > 0);
  }, [rawFolderData, selectedPeriod]);

  const resolveTypeId = useMemo(() => {
    if (selectedType === "all" || selectedType === "notifications") return null;
    const reports = reportListQuery.data?.data;
    if (!reports) return null;
    const tab = DATA_SOURCE_TABS.find((t) => t.key === selectedType);
    if (!tab) return null;
    const tabName = tab.tabName.toLowerCase();
    const matched = reports.find((r) => r.reportName.toLowerCase() === tabName);
    if (matched) return matched._id;
    const partial = reports.find(
      (r) =>
        r.reportName.toLowerCase().includes(tabName) ||
        tabName.includes(r.reportName.toLowerCase())
    );
    return partial?._id ?? null;
  }, [selectedType, reportListQuery.data]);

  // --- Search / flat view data ---
  const searchUrl = useMemo(() => {
    if (!isFilterActive) return "";

    const params = new URLSearchParams();
    params.set("page", String(searchPaginationModel.page + 1));
    params.set("limit", String(searchPaginationModel.pageSize));

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    }
    if (selectedPeriod) {
      params.set("year", String(selectedPeriod.year));
      params.set("month", String(selectedPeriod.month));
    }
    if (selectedType === "notifications" && dataSourceId) {
      params.set("dataSourceId", dataSourceId);
    } else if (selectedType !== "all" && resolveTypeId) {
      params.set("reportId", resolveTypeId);
    }

    return `${GET.CENTRAL_FILES_LIST}?${params.toString()}`;
  }, [isFilterActive, debouncedSearch, selectedPeriod, selectedType, resolveTypeId, dataSourceId, searchPaginationModel]);

  const searchQuery = useGet<CentralFilesListResponse>(
    ["centralFilesSearch", searchUrl],
    searchUrl,
    isFilterActive && !!searchUrl
  );

  const reportNameMap = useMemo(() => {
    const reports = reportListQuery.data?.data;
    if (!reports) return new Map<string, string>();
    return new Map(reports.map((r) => [r._id, r.reportName]));
  }, [reportListQuery.data]);

  const searchResults: SearchResultFile[] = useMemo(() => {
    const raw = searchQuery.data?.data;
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
      category: item.dataSourceId
        ? "Notifications"
        : reportNameMap.get(item.reportId) || "Unknown",
    }));
  }, [searchQuery.data, reportNameMap]);

  const searchTotalCount = searchQuery.data?.totalCount ?? 0;

  // --- Handlers ---
  const handleTabChange = useCallback((index: number) => {
    setActiveTab(index);
    setSearchValue("");
    setSelectedType("all");
    setSelectedPeriod(null);
  }, []);

  const handleReset = () => {
    setSearchValue("");
    setDebouncedSearch("");
    setSelectedType("all");
    setSelectedPeriod(null);
    setSearchPaginationModel({ page: 0, pageSize: 10 });
  };

  const downloadFile = useFileDownload<Blob>(
    (data, fileName = "file") => {
      const blob = new Blob([data], { type: "application/octet-stream" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  );

  const deleteCentralFile = useDelete(
    ["deleteCentralFile"],
    () => {
      queryClient.invalidateQueries({ queryKey: ["centralFilesFolderSummary"] });
      queryClient.invalidateQueries({ queryKey: ["centralFilesList"] });
      queryClient.invalidateQueries({ queryKey: ["centralFilesSearch"] });
      setFileToDelete(null);
    },
    true
  );

  const handleView = (file: CentralFile) => {
    setViewFile(file);
  };

  const handleMapping = (file: CentralFile) => {
    console.log("Mapping file:", file);
  };

  const handleDownload = (file: CentralFile) => {
    downloadFile.mutate({
      url: `${GET.CENTRAL_FILES_DOWNLOAD}?centralFileId=${file._id}`,
      fileName: file.filename,
    });
  };

  const handleDelete = (file: CentralFile) => {
    setFileToDelete(file);
  };

  const handleConfirmDelete = () => {
    if (fileToDelete) {
      deleteCentralFile.mutate({
        url: `${DELETE.DELETE_CENTRAL_FILE}/${fileToDelete._id}`,
      });
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axiosInstance.post(
        POST.CENTRAL_FILES_UPLOAD,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Files uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["centralFilesFolderSummary"] });
      queryClient.invalidateQueries({ queryKey: ["centralFilesList"] });
      queryClient.invalidateQueries({ queryKey: ["centralFilesSearch"] });
      setUploadModalOpen(false);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Upload failed";
      toast.error(message);
    },
  });

  const handleUploadFiles = (files: File[], uploadedBy: string) => {
    const now = new Date();
    const formData = new FormData();

    files.forEach((file) => formData.append("files", file));
    formData.append("year", String(now.getFullYear()));
    formData.append("month", String(now.getMonth() + 1));
    formData.append("mapping", JSON.stringify({}));
    formData.append("uploadedBy", uploadedBy);

    if (isNotificationsTab) {
      formData.append("dataSourceId", dataSourceId);
    } else {
      formData.append("reportId", reportId);
    }

    uploadMutation.mutate(formData);
  };

  return (
    <Box sx={{ p: STYLE_GUIDE.SPACING.s2 }}>
      <PageHeader
        title="Data Sources"
        subtext="Upload and manage your raw data files for report generation"
        action={
          <StyledButton
            variant="primary"
            icon={<CloudUploadIcon />}
            onClick={() => setUploadModalOpen(true)}
          >
            Upload Files
          </StyledButton>
        }
      />

      <PageCardLayout>
        <SearchSortToolbar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          typeOptions={TYPE_FILTER_OPTIONS}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          isFilterActive={isFilterActive}
          onReset={handleReset}
        />

        {isFilterActive ? (
          <SearchResultsTable
            files={searchResults}
            totalCount={searchTotalCount}
            paginationModel={searchPaginationModel}
            setPaginationModel={setSearchPaginationModel}
            loading={searchQuery.isFetching}
            onView={handleView}
            onMapping={handleMapping}
            onDownload={handleDownload}
            onDelete={handleDelete}
            onReset={handleReset}
          />
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <ScrollableTabNavigation
                tabs={DATA_SOURCE_TABS}
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                fullWidth
                themed
              />
            </Box>

            <FolderExplorer
              data={filteredData}
              loading={folderSummaryQuery.isLoading}
              reportId={reportId}
              dataSourceId={dataSourceId}
              isNotificationsTab={isNotificationsTab}
              onView={handleView}
              onMapping={handleMapping}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          </>
        )}
      </PageCardLayout>

      <UploadFilesModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        tabName={currentTabName}
        onUpload={handleUploadFiles}
        isUploading={uploadMutation.isPending}
      />

      <FileViewModal
        file={viewFile}
        open={!!viewFile}
        onClose={() => setViewFile(null)}
        tabName={currentTabName}
      />

      <ConfirmDialog
        open={!!fileToDelete}
        title="Delete File"
        description={`Are you sure you want to delete "${fileToDelete?.filename}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setFileToDelete(null)}
        buttonText="Delete"
      />
    </Box>
  );
}
