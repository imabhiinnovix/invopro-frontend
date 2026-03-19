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
import { VendorInvoiceModal } from "./VendorInvoiceModal";
import { VendorInvoiceDataTable } from "./VendorInvoiceDataTable";
import {
  PageHeader,
  PageCardLayout,
  StyledButton,
} from "../../components/common";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { checkPermission } from "../../utils/utils";
import { PermissionsMap } from "../../utils/constants";

interface VendorInvoice {
  _id: string;
  organizationId: string;
  vendorId?: { _id: string; name: string };
  versionValue: string;
  status: "active" | "inactive";
  fileName?: string | string[];
  filePath?: string | string[];
}

interface VendorInvoicePostResponse {
  success: boolean;
  data: VendorInvoice;
}

export default function VendorInvoicePage() {
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [rowData, setRowData] = useState<VendorInvoice | null>(null);

  const [searchValue, setSearchValue] = useState("");
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
    PermissionsMap.VENDORINVOICE,
    "create"
  );

  const shouldAllowEdit = checkPermission(
    permissions,
    PermissionsMap.VENDORINVOICE,
    "update"
  );

  const shouldAllowDelete = checkPermission(
    permissions,
    PermissionsMap.VENDORINVOICE,
    "delete"
  );

  // ================= DELETE =================
  const deleteVendorInvoice = useDelete<null, VendorInvoicePostResponse>(
    ["deleteVendorInvoice"],
    (data) => {
      if (data?.success) {
        setReload(true);
        handleCloseDialog();
        toast.success("Vendor invoice deleted successfully");
      } else {
        toast.error("Error deleting vendor invoice");
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

  const handleEdit = (row: VendorInvoice) => {
    setRowData(row);
    setEditId(row._id);
    setModalMode("edit");
    setOpenModal(true);
  };

  const handleView = (row: VendorInvoice) => {
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
      await deleteVendorInvoice.mutate({
        url: `${DELETE.Delete_Vendor_Invoice}/${deleteId}`,
      });
    }
  };

  const handleCreated = () => setReload(true);
  const handleUpdated = () => setReload(true);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh" }}>
      <PageHeader
        title="Vendor Invoices"
        subtext="View and manage vendor invoices."
        action={
          shouldAllowAdd ? (
            <StyledButton
              variant="primary"
              startIcon={<AddIcon />}
              onClick={handleAdd}
            >
              Add Vendor Invoice
            </StyledButton>
          ) : undefined
        }
      />

      <PageCardLayout>
        <VendorInvoiceDataTable
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          paginationModel={paginationModel}
          setPaginationModel={setPaginationModel}
          reload={reload}
          loading={deleteVendorInvoice.isLoading}
          shouldAllowEdit={shouldAllowEdit}
          shouldAllowDelete={shouldAllowDelete}
        />
      </PageCardLayout>

      <VendorInvoiceModal
        rowData={rowData}
        open={openModal}
        onClose={handleCloseModal}
        mode={modalMode}
        editId={editId}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this vendor invoice?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>No</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            disabled={deleteVendorInvoice.isLoading}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}