import { Chip, IconButton } from "@mui/material";
import CommonPageHeader from "../../components/atom/commonPageHeader";
import CommonTable from "../../components/common/table";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import useGet from "../../hooks/useGet";
import { GET } from "../../services/apiRoutes";
import useFileDownload from "../../hooks/useFiledownload";

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
  const downloadRequestList = useGet<any[]>(
    [`downloadRequestList`],
    GET?.DOWNLOAD_REQUEST_LIST,
    true
  );

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
        height="calc(100vh - 100px)"
        loading={downloadRequestList?.isPending}
      />
    </div>
  );
};

export default Jobs;
