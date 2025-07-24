import * as React from "react";
import { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import { STYLE_GUIDE } from "../../styles";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";

const columns: GridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    width: 70,
    disableColumnMenu: true,
    resizable: true,
  },
  {
    field: "firstName",
    headerName: "First Name",
    width: 130,
    disableColumnMenu: true,
    resizable: true,
  },
  {
    field: "lastName",
    headerName: "Last Name",
    width: 130,
    disableColumnMenu: true,
    resizable: true,
  },
  {
    field: "age",
    headerName: "Age",
    type: "number",
    width: 150, // Increased to avoid resize handle overlap
    disableColumnMenu: true,
    resizable: true,
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 150,
    disableColumnMenu: true,
    sortable: false,
    resizable: false, // Actions column typically not resizable
    renderCell: (params) => (
      <Box sx={{ display: "flex", gap: 1 }}>
        <Tooltip title="Edit" arrow>
          <Button
            variant="text"
            onClick={() => params.row.handleEdit(params.row)}
            sx={{
              minWidth: "auto",
              color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
            }}
          >
            <EditIcon />
          </Button>
        </Tooltip>
        <Tooltip title="View" arrow>
          <Button
            variant="text"
            onClick={() => params.row.handleView(params.row)}
            sx={{
              minWidth: "auto",
              color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
            }}
          >
            <VisibilityIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Delete" arrow>
          <Button
            variant="text"
            onClick={() => params.row.handleDelete(params.row.id)}
            sx={{
              minWidth: "auto",
              color: STYLE_GUIDE?.COLORS?.error || "#d32f2f",
            }}
          >
            <DeleteIcon />
          </Button>
        </Tooltip>
      </Box>
    ),
  },
];

type NotificationRow = {
  id: number;
  firstName: string | null;
  lastName: string;
  age: number | null;
  handleEdit?: (rowData: NotificationRow) => void;
  handleView?: (rowData: NotificationRow) => void;
  handleDelete?: (id: number) => void;
};

const rows: NotificationRow[] = [
  { id: 1, lastName: "Snow", firstName: "Jon", age: 35 },
  { id: 2, lastName: "Lannister", firstName: "Cersei", age: 42 },
  { id: 3, lastName: "Lannister", firstName: "Jaime", age: 45 },
  { id: 4, lastName: "Stark", firstName: "Arya", age: 16 },
  { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
  { id: 6, lastName: "Melisandre", firstName: null, age: 150 },
  { id: 7, lastName: "Clifford", firstName: "Ferrara", age: 44 },
  { id: 8, lastName: "Frances", firstName: "Rossini", age: 36 },
  { id: 9, lastName: "Roxie", firstName: "Harvey", age: 65 },
].map((row) => ({
  ...row,
  handleEdit: (rowData: NotificationRow) => rowData,
  handleView: (rowData: NotificationRow) => rowData,
  handleDelete: (id: number) => id,
}));

const paginationModel = { page: 0, pageSize: 10 };

export default function NotificationSettings() {
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<
    "add" | "edit" | "view" | "filter" | null
  >(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    age: "",
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchValue, setSearchValue] = useState("");

  const handleEdit = (row: NotificationRow) => {
    setFormData({
      id: row.id.toString(),
      firstName: row.firstName || "",
      lastName: row.lastName || "",
      age: row.age != null ? row.age.toString() : "",
    });
    setModalMode("edit");
    setOpenModal(true);
  };

  const handleView = (row: NotificationRow) => {
    setFormData({
      id: row.id.toString(),
      firstName: row.firstName || "",
      lastName: row.lastName || "",
      age: row.age != null ? row.age.toString() : "",
    });
    setModalMode("view");
    setOpenModal(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleAddNotification = () => {
    setFormData({ id: "", firstName: "", lastName: "", age: "" });
    setModalMode("add");
    setOpenModal(true);
  };

  const handleFilter = () => {
    setFormData({ id: "", firstName: "", lastName: "", age: "" });
    setModalMode("filter");
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalMode(null);
    setFormData({ id: "", firstName: "", lastName: "", age: "" });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  const handleConfirmDelete = () => {
    console.log(`Deleting row with ID: ${deleteId}`);
    // Implement actual delete logic here
    handleCloseDialog();
  };

  const handleSave = () => {
    if (modalMode === "add") {
      console.log(`Adding new notification: `, formData);
      // Implement add logic here
    } else if (modalMode === "edit") {
      console.log(`Saving edited row: `, formData);
      // Implement save logic here
    } else if (modalMode === "filter") {
      console.log(`Applying filter: `, formData);
      // Implement filter logic here
    }
    handleCloseModal();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    console.log(`Search value: ${value}`);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 3,
        ml: { xs: 0 }, // Adjust for SideNav width
        backgroundColor: STYLE_GUIDE?.COLORS?.backgroundLight || "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Heading */}
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 400,
          color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
        }}
      >
        Notification Settings
      </Typography>

      {/* Card containing controls and table */}
      <Card
        sx={{
          backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Controls: Search on left, Filter and Add buttons on right */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            {/* Search Bar */}
            <TextField
              placeholder="Search notifications..."
              variant="outlined"
              size="small"
              value={searchValue}
              onChange={handleSearchChange}
              sx={{
                width: "300px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
                  "& fieldset": {
                    borderColor: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
                  },
                  "&:hover fieldset": {
                    borderColor: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{
                        color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                      }}
                    />
                  </InputAdornment>
                ),
              }}
            />

            {/* Filter and Add Buttons */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={handleFilter}
                sx={{
                  borderRadius: "8px",
                  borderColor: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
                  color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                  "&:hover": {
                    backgroundColor:
                      STYLE_GUIDE?.COLORS?.backgroundDefault || "#f1f5f9",
                    borderColor: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                  },
                }}
              >
                Filter
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNotification}
                sx={{
                  borderRadius: "8px",
                  backgroundColor:
                    STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                  color: STYLE_GUIDE?.COLORS?.white || "#ffffff",
                  "&:hover": {
                    backgroundColor: STYLE_GUIDE?.COLORS?.primary || "#5c6bc0",
                  },
                }}
              >
                Add Notification
              </Button>
            </Box>
          </Box>

          {/* Table */}
          <DataGrid
            rows={rows.map((row) => ({
              ...row,
              handleEdit,
              handleView,
              handleDelete,
            }))}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            pageSizeOptions={[5, 10]}
            disableColumnMenu
            paginationMode="server"
            sx={{
              border: 0,
              backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
              overflow: "visible", // Ensure resize handles are not clipped
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor:
                  STYLE_GUIDE?.COLORS?.backgroundLight || "#f5f5f5",
                color: STYLE_GUIDE?.COLORS?.black || "#000000",
                fontWeight: 600,
                fontSize: "1rem",
                position: "relative",
                zIndex: 1, // Ensure headers are above cells
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 600,
                color: STYLE_GUIDE?.COLORS?.black || "#000000",
              },
              "& .MuiDataGrid-columnHeader": {
                outline: "none",
                "&:focus, &:focus-within": {
                  outline: "none",
                },
                "& .MuiDataGrid-columnSeparator": {
                  color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5", // Visible resize handle
                  "&:hover": {
                    color: STYLE_GUIDE?.COLORS?.primary || "#5c6bc0",
                  },
                },
              },
              "& .MuiDataGrid-cell": {
                backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
                color: STYLE_GUIDE?.COLORS?.black || "#000000",
                borderBottom: `1px solid ${STYLE_GUIDE?.COLORS?.divider || "#e0e0e0"}`,
                borderRight: "none",
                outline: "none",
                "&:focus, &:focus-within": {
                  outline: "none",
                },
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor:
                  STYLE_GUIDE?.COLORS?.backgroundDefault || "#f1f5f9",
              },
              "& .MuiDataGrid-footerContainer": {
                backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
                borderTop: `1px solid ${STYLE_GUIDE?.COLORS?.divider || "#e0e0e0"}`,
                color: STYLE_GUIDE?.COLORS?.black || "#000000",
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Unified Add/Edit/View/Filter Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
            borderRadius: "8px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
            p: 3,
            width: "600px",
            maxWidth: "90%",
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 2, color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5" }}
          >
            {modalMode === "add"
              ? "Add Notification"
              : modalMode === "edit"
                ? "Edit Notification"
                : modalMode === "view"
                  ? "View Notification"
                  : "Filter Notifications"}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
            }}
          >
            <TextField
              label="ID"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              disabled={modalMode === "edit" || modalMode === "view"}
              variant="outlined"
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              style={{ display: modalMode === "add" ? "none" : "block" }}
            />
            <TextField
              label="First Name"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              disabled={modalMode === "view"}
              variant="outlined"
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            />
            <TextField
              label="Last Name"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              disabled={modalMode === "view"}
              variant="outlined"
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            />
            <TextField
              label="Age"
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: e.target.value })
              }
              disabled={modalMode === "view"}
              type="number"
              variant="outlined"
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            />
          </Box>
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}
          >
            <Button
              variant="outlined"
              onClick={handleCloseModal}
              sx={{
                borderRadius: "8px",
                borderColor: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
                color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
              }}
            >
              Cancel
            </Button>
            {modalMode !== "view" && (
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  borderRadius: "8px",
                  backgroundColor:
                    STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                  color: STYLE_GUIDE?.COLORS?.white || "#ffffff",
                  "&:hover": {
                    backgroundColor: STYLE_GUIDE?.COLORS?.primary || "#5c6bc0",
                  },
                }}
              >
                {modalMode === "filter" ? "Apply" : "Save"}
              </Button>
            )}
          </Box>
        </Box>
      </Modal>

      {/* Delete Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "8px",
            backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
          },
        }}
      >
        <DialogTitle
          sx={{ color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5" }}
        >
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the notification with ID {deleteId}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            sx={{
              borderRadius: "8px",
              color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
            }}
          >
            No
          </Button>
          <Button
            onClick={handleConfirmDelete}
            sx={{
              borderRadius: "8px",
              backgroundColor: STYLE_GUIDE?.COLORS?.error || "#d32f2f",
              color: "#000000",
              "&:hover": {
                backgroundColor: STYLE_GUIDE?.COLORS?.error || "#b71c1c",
              },
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
