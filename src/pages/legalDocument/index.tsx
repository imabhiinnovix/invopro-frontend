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
import { LegalDocumentModal } from "./LegalDocumentModal";
import { LegalDocumentDataTable } from "./LegalDocumentDataTable";
import {
  PageHeader,
  PageCardLayout,
  StyledButton,
} from "../../components/common";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { checkPermission } from "../../utils/utils";
import { PermissionsMap } from "../../utils/constants";

interface LegalDocument {
  _id: string;
  organizationId: string;

  vendorId?: {
    _id: string;
    name: string;
  };

  documentName: string;
  documentDescription?: string;
  referenceNumber?: string;

  legalDocumentFileName?: string;
  legalDocumentFilePath?: string;

  startDate?: string;
  endDate?: string;

  status: "active" | "expired";
}

interface LegalDocumentPostResponse {
  success: boolean;
  data: LegalDocument;
}

export default function LegalDocument() {
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [rowData, setRowData] = useState<LegalDocument | null>(null);

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
    PermissionsMap.LEGALDOCUMENT,
    "create"
  );

  const shouldAllowEdit = checkPermission(
    permissions,
    PermissionsMap.LEGALDOCUMENT,
    "update"
  );

  const shouldAllowDelete = checkPermission(
    permissions,
    PermissionsMap.LEGALDOCUMENT,
    "delete"
  );

  // ================= DELETE =================
  const deleteLegalDocument = useDelete<
    null,
    LegalDocumentPostResponse
  >(
    ["deleteLegalDocument"],
    (data) => {
      if (data?.success) {
        setReload(true);
        handleCloseDialog();
        toast.success("Legal document deleted successfully");
      } else {
        toast.error("Error deleting legal document");
      }
    },
    true
  );

  useEffect(() => {
    if (reload) {
      setReload(false);
    }
  }, [reload]);

  // ================= HANDLERS =================

  const handleAdd = () => {
    setRowData(null);
    setEditId(null);
    setModalMode("add");
    setOpenModal(true);
  };

  const handleEdit = (row: LegalDocument) => {
    setRowData(row);
    setEditId(row._id);
    setModalMode("edit");
    setOpenModal(true);
  };

  const handleView = (row: LegalDocument) => {
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
      await deleteLegalDocument.mutate({
        url: `${DELETE.Delete_Legal_Document}/${deleteId}`,
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
        title="Legal Documents"
        subtext="View and manage legal documents."
        action={
          shouldAllowAdd ? (
            <StyledButton
              variant="primary"
              startIcon={<AddIcon />}
              onClick={handleAdd}
            >
              Add Legal Document
            </StyledButton>
          ) : undefined
        }
      />

      <PageCardLayout>
        <LegalDocumentDataTable
          onAdd={handleAdd}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          paginationModel={paginationModel}
          setPaginationModel={setPaginationModel}
          reload={reload}
          loading={deleteLegalDocument.isLoading}
          shouldAllowAdd={shouldAllowAdd}
          shouldAllowEdit={shouldAllowEdit}
          shouldAllowDelete={shouldAllowDelete}
        />
      </PageCardLayout>

      <LegalDocumentModal
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
            Are you sure you want to delete this legal document?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>No</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            disabled={deleteLegalDocument.isLoading}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}