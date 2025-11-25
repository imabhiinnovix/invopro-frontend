import {
  Chip,
  IconButton,
  Paper,
  Stack,
  TablePagination,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import CommonPageHeader from "../../components/atom/commonPageHeader";
import CommonTable from "../../components/common/table";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import useGet from "../../hooks/useGet";
import { GET } from "../../services/apiRoutes";
import useFileDownload from "../../hooks/useFiledownload";
import { formatDate } from "../../utils/utils";
import { DOWNLOAD_REQUEST_POLLING_INTERVAL } from "../../utils/constants";

const columns = [
  {
    id: "name",
    label: "Name",
    minWidth: 170,
  },
  {
    id: "createdAt",
    label: "Created At",
    minWidth: 170,
    renderCell: (row: Record<string, unknown>) => {
      return <span>{formatDate(row.createdAt)}</span>;
    },
  },
  {
    id: "status",
    label: "Status",
    minWidth: 170,
    renderCell: (row: Record<string, unknown>) => {
      return (
        <Chip
          label={row.status}
          color={
            row.status === "pending"
              ? "warning"
              : row.status === "completed"
              ? "success"
              : "error"
          }
        />
      );
    },
  },
  {
    id: "actions",
    label: "Actions",
    minWidth: 170,
    renderCell: (row: Record<string, unknown>) => {
      if (row.status === "completed") {
        return (
          <IconButton color="primary" onClick={() => row.downloadRequestFile()}>
            <CloudDownloadIcon />
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
    name: item.fileName,
    status: item.status,
    createdAt: item.createdAt,
    filePath: item.filePath,
    downloadRequestFile: () =>
      downloadRequestFile.mutate({
        url: GET?.DOWNLOAD_REQUEST_FILE + `/${encodeURIComponent(item._id)}`,
        fileName: item.fileName,
      }),
  }));

  return (
    <div className="p-4">
      <CommonPageHeader title="Data Export Jobs" actions={<></>} />
      <CommonTable
        columns={columns}
        rows={rows || []}
        height="calc(100vh - 300px)"
        loading={downloadRequestList?.isPending}
        isLazyTable={true}
      />
      <Paper>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            pl: 2,
            pr: 2,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2">
              Total Records: {totalRecords || 0}
            </Typography>
          </Stack>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={totalRecords || 0}
            rowsPerPage={rowsPerPage}
            page={currentPage - 1}
            onPageChange={(_event, value) => setCurrentPage(value + 1)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(+event.target.value);
              setCurrentPage(1);
            }}
            labelDisplayedRows={({ page }) => {
              const totalPages = Math.ceil((totalRecords || 0) / rowsPerPage);
              return `Page ${page + 1} of ${totalPages}`;
            }}
          />
        </Stack>
      </Paper>
    </div>
  );
};

export default Jobs;
