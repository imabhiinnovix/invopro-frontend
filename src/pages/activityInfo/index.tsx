/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";

import useDelete from "../../hooks/useDelete";
import { DELETE } from "../../services/apiRoutes";

import { ActivityInfoModal } from "./ActivityInfoModal";
import { ActivityInfoDataTable } from "./ActivityInfoDataTable";

import {
  PageHeader,
  PageCardLayout,
  StyledButton,
} from "../../components/common";

interface Activity {
  _id: string;
  activityType: string;
  versionValue: string;
  activityFileName?: string | string[];
  activityFilePath?: string | string[];
  analyze_processing_status: string;
  status: "active" | "inactive";
}

export default function ActivityInfoPage() {
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");

  const [rowData, setRowData] = useState<Activity | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [searchValue, setSearchValue] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const [reload, setReload] = useState(false);

  // ================= DELETE =================
  const deleteActivity = useDelete<any, any>(
    ["deleteActivity"],
    (data) => {
      if (data?.success) {
        toast.success("Activity deleted successfully");
        setReload(true);
        handleCloseDialog();
      }
    },
    true
  );

  useEffect(() => {
    if (reload) setReload(false);
  }, [reload]);

  // ================= HANDLERS =================
  const handleAdd = () => {
    setRowData(null);
    setEditId(null);
    setModalMode("add");
    setOpenModal(true);
  };

  const handleEdit = (row: Activity) => {
    setRowData(row);
    setEditId(row._id);
    setModalMode("edit");
    setOpenModal(true);
  };

  const handleView = (row: Activity) => {
    setRowData(row);
    setEditId(row._id);
    setModalMode("view");
    setOpenModal(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setRowData(null);
    setEditId(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteActivity.mutate({
        url: `${DELETE.Delete_Activity}/${deleteId}`,
      });
    }
  };

  const handleCreated = () => setReload(true);
  const handleUpdated = () => setReload(true);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <PageHeader
        title="Activity Info"
        subtext="Manage activity uploads"
        action={
          <StyledButton startIcon={<AddIcon />} onClick={handleAdd}>
            Add Activity
          </StyledButton>
        }
      />

      <PageCardLayout>
        <ActivityInfoDataTable
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          searchValue={searchValue}
          onSearchChange={(e) => setSearchValue(e.target.value)}
          paginationModel={paginationModel}
          setPaginationModel={setPaginationModel}
          reload={reload}
          loading={deleteActivity.isLoading}
        />
      </PageCardLayout>

      <ActivityInfoModal
        open={openModal}
        onClose={handleCloseModal}
        mode={modalMode}
        rowData={rowData}
        editId={editId}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
      />

      {/* Delete Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this activity?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>No</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}