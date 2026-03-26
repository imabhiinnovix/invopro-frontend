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
import useDelete from "../../hooks/useDelete";
import { DELETE } from "../../services/apiRoutes";
import { toast } from "react-toastify";
import { PaymentInfoModal } from "./PaymentInfoModal";
import { PaymentInfoDataTable } from "./PaymentInfoDataTable";
import {
  PageHeader,
  PageCardLayout,
  StyledButton,
} from "../../components/common";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { checkPermission } from "../../utils/utils";
import { PermissionsMap } from "../../utils/constants";

export default function PaymentInfo() {
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [rowData, setRowData] = useState<any>(null);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [reload, setReload] = useState(false);

  const permissions = useSelector(
    (state: RootState) => state.userPermission.permissions
  );

  const shouldAllowAdd = checkPermission(
    permissions,
    PermissionsMap.PAYMENT,
    "create"
  );

  const shouldAllowEdit = checkPermission(
    permissions,
    PermissionsMap.PAYMENT,
    "update"
  );

  const shouldAllowDelete = checkPermission(
    permissions,
    PermissionsMap.PAYMENT,
    "delete"
  );

  const deletePayment = useDelete(
    ["deletePayment"],
    (data) => {
      if (data?.success) {
        setReload(true);
        handleCloseDialog();
        toast.success("Payment deleted successfully");
      } else {
        toast.error("Error deleting payment");
      }
    },
    true
  );

  useEffect(() => {
    if (reload) setReload(false);
  }, [reload]);

  const handleAdd = () => {
    setRowData(null);
    setEditId(null);
    setModalMode("add");
    setOpenModal(true);
  };

  const handleEdit = (row: any) => {
    setRowData(row);
    setEditId(row._id);
    setModalMode("edit");
    setOpenModal(true);
  };

  const handleView = (row: any) => {
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
    setEditId(null);
    setRowData(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deletePayment.mutate({
        url: `${DELETE.Delete_Payment}/${deleteId}`,
      });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Payment Info"
        subtext="Manage vendor payments"
        action={
          shouldAllowAdd && (
            <StyledButton startIcon={<AddIcon />} onClick={handleAdd}>
              Add Payment
            </StyledButton>
          )
        }
      />

      <PageCardLayout>
        <PaymentInfoDataTable
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          paginationModel={paginationModel}
          setPaginationModel={setPaginationModel}
          reload={reload}
          loading={deletePayment.isLoading}
          shouldAllowEdit={shouldAllowEdit}
          shouldAllowDelete={shouldAllowDelete}
        />
      </PageCardLayout>

      <PaymentInfoModal
        rowData={rowData}
        open={openModal}
        onClose={handleCloseModal}
        mode={modalMode}
        editId={editId}
        onCreated={() => setReload(true)}
        onUpdated={() => setReload(true)}
      />

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Delete this payment?</Typography>
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