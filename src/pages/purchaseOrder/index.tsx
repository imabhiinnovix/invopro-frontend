/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useState, useEffect } from "react";
import { Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";
import { PageHeader, PageCardLayout, StyledButton } from "../../components/common";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { checkPermission } from "../../utils/utils";
import { PermissionsMap } from "../../utils/constants";

import useDelete from "../../hooks/useDelete";
import { DELETE } from "../../services/apiRoutes";

import { PurchaseOrderModal } from "./PurchaseOrderModal";
import { PurchaseOrderDataTable } from "./PurchaseOrderDataTable";

export default function PurchaseOrder() {
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [rowData, setRowData] = useState<any>(null);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [reload, setReload] = useState(false);

  const permissions = useSelector((state: RootState) => state.userPermission.permissions);

  const shouldAllowAdd = checkPermission(permissions, PermissionsMap.PURCHASE_ORDER, "create");
  const shouldAllowEdit = checkPermission(permissions, PermissionsMap.PURCHASE_ORDER, "update");
  const shouldAllowDelete = checkPermission(permissions, PermissionsMap.PURCHASE_ORDER, "delete");

  const deletePO = useDelete(
    ["deletePO"],
    (data) => {
      if (data?.success) {
        setReload(true);
        handleCloseDialog();
        toast.success("PO deleted successfully");
      } else {
        toast.error("Error deleting PO");
      }
    },
    true
  );

  useEffect(() => {
    if (reload) setReload(false);
  }, [reload]);

  const handleAdd = () => { setRowData(null); setEditId(null); setModalMode("add"); setOpenModal(true); };
  const handleEdit = (row: any) => { setRowData(row); setEditId(row._id); setModalMode("edit"); setOpenModal(true); };
  const handleView = (row: any) => { setRowData(row); setEditId(row._id); setModalMode("view"); setOpenModal(true); };
  const handleDelete = (id: string) => { setDeleteId(id); setOpenDialog(true); };

  const handleCloseModal = () => { setOpenModal(false); setEditId(null); setRowData(null); };
  const handleCloseDialog = () => { setOpenDialog(false); setDeleteId(null); };
  const handleConfirmDelete = async () => { if (deleteId) await deletePO.mutate({ url: `${DELETE.Delete_PO}/${deleteId}` }); };

  return (
    <Box>
      <PageHeader
        title="Purchase Orders"
        subtext="Manage vendor purchase orders"
        action={
          shouldAllowAdd && (
            <StyledButton startIcon={<AddIcon />} onClick={handleAdd}>
              Add PO
            </StyledButton>
          )
        }
      />

      <PageCardLayout>
        <PurchaseOrderDataTable
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          paginationModel={paginationModel}
          setPaginationModel={setPaginationModel}
          reload={reload}
          loading={deletePO.isLoading}
          shouldAllowEdit={shouldAllowEdit}
          shouldAllowDelete={shouldAllowDelete}
        />
      </PageCardLayout>

      <PurchaseOrderModal
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
          <Typography>Delete this PO?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>No</Button>
          <Button onClick={handleConfirmDelete} color="error">Yes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}