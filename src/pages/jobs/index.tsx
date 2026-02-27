import {
  IconButton,
  Paper,
} from "@mui/material";
import { useEffect, useState } from "react";
import { PageHeader, PageCardLayout, StatusChip } from "../../components/common";
import CommonTable from "../../components/common/table";
import useGet from "../../hooks/useGet";
import { GET } from "../../services/apiRoutes";
import useFileDownload from "../../hooks/useFiledownload";
import { formatDate } from "../../utils/utils";
import { DOWNLOAD_REQUEST_POLLING_INTERVAL } from "../../utils/constants";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import { CloudDownloadOutlined } from "@mui/icons-material";

const columns = [
  {
    id: "name",
    label: "Name",
    minWidth: 170,
    sortable: true,
  },
  {
    id: "createdAt",
    label: "Created At",
    minWidth: 170,
    sortable: true,
    renderCell: (row: Record<string, unknown>) => {
      return <span>{formatDate(row.createdAt)}</span>;
    },
  },
  {
    id: "status",
    label: "Status",
    minWidth: 170,
    sortable: true,
    renderCell: (row: Record<string, unknown>) => {
      const status = row.status as string | undefined;
      return <StatusChip status={status || "unknown"} label={status || "-"} />;
    },
  },
  {
    id: "actions",
    label: "Actions",
    minWidth: 170,
    sortable: false,
    renderCell: (row: Record<string, unknown>) => {
      const status = row.status as string | undefined;
      const downloadRequestFile = row.downloadRequestFile as
        | (() => void)
        | undefined;
      if (status === "completed" && downloadRequestFile) {
        return (
          <IconButton color="primary" onClick={downloadRequestFile}>
            <CloudDownloadOutlined sx={{ fontSize: "16px" }} />
          </IconButton>
        );
      }
      return null;
    },
  },
];

const Jobs = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const downloadRequestList = useGet<any[]>(
    [`downloadRequestList`, currentPage, rowsPerPage],
    GET?.DOWNLOAD_REQUEST_LIST + `?page=${currentPage}&limit=${rowsPerPage}`,
    true
  );

  // Polling logic using useEffect
  useEffect(() => {
    const interval = setInterval(() => {
      downloadRequestList.refetch();
    }, DOWNLOAD_REQUEST_POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [downloadRequestList, currentPage, rowsPerPage]);

  useEffect(() => {
    if (downloadRequestList?.data?.pagination) {
      // setTotalPages(
      //   Math.ceil(
      //     (downloadRequestList?.data?.pagination?.totalRecords || 0) /
      //       rowsPerPage
      //   )
      // );
      setTotalRecords(downloadRequestList?.data?.pagination?.totalRecords || 0);
    }
  }, [downloadRequestList?.data?.pagination]);

  const downloadRequestFile = useFileDownload<Blob>(
    (data, fileName = "sample.xlsx") => {
      console.log("data", data);
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

  const rows = downloadRequestList?.data?.data?.map((item: any) => ({
    id: item._id,
    name: item.fileName || "",
    status: item.status || "",
    createdAt: item.createdAt ? new Date(item.createdAt).getTime() : 0,
    createdAtDisplay: item.createdAt,
    filePath: item.filePath,
    downloadRequestFile: () =>
      downloadRequestFile.mutate({
        url: GET?.DOWNLOAD_REQUEST_FILE + `/${encodeURIComponent(item._id)}`,
        fileName: item.fileName,
      }),
  }));

  return (
    <div id="jobs-list-view">
      <PageHeader
        title="Data Export Jobs"
        subtext="View and manage data export jobs."
      />
      <PageCardLayout>
        <CommonTable
            columns={columns}
            rows={rows || []}
            height="calc(100vh - 300px)"
            loading={downloadRequestList?.isPending}
            isLazyTable={true}
          />
          <Paper
            variant="outlined"
            sx={{
              border: 0,
              boxShadow: "none",
              pt: 1.5,
            }}
          >
            <CustomPagination
              paginationModel={{
                page: currentPage - 1,
                pageSize: rowsPerPage,
              }}
              setPaginationModel={(model) => {
                setCurrentPage(model.page + 1);
                setRowsPerPage(model.pageSize);
              }}
              rowCount={totalRecords || 0}
            />
          </Paper>
      </PageCardLayout>
    </div>
  );
};

export default Jobs;
