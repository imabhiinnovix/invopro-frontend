import { Chip, IconButton } from "@mui/material";
import CommonPageHeader from "../../components/atom/commonPageHeader";
import CommonTable from "../../components/common/table";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

const sampleData = [
  {
    id: 1,
    name: "Data Export Job 1",
    status: "Pending",
    createdAt: "2021-01-01",
    updatedAt: "2021-01-01",
  },
  {
    id: 2,
    name: "Data Export Job 2",
    status: "Completed",
    createdAt: "2021-01-01",
    updatedAt: "2021-01-01",
  },
  {
    id: 3,
    name: "Data Export Job 3",
    status: "Failed",
    createdAt: "2021-01-01",
    updatedAt: "2021-01-01",
  },
  {
    id: 4,
    name: "Data Export Job 4",
    status: "Cancelled",
    createdAt: "2021-01-01",
    updatedAt: "2021-01-01",
  },
];

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
            row.status === "Pending"
              ? "warning"
              : row.status === "Completed"
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
      if (row.status === "Completed") {
        return (
          <IconButton color="primary">
            <CloudDownloadIcon />
          </IconButton>
        );
      }
      return null;
    },
  },
];

const Jobs = () => {
  return (
    <div>
      <CommonPageHeader title="Data Export Jobs" actions={<></>} />
      <CommonTable
        columns={columns}
        rows={sampleData}
        height="calc(100vh - 100px)"
      />
    </div>
  );
};

export default Jobs;
