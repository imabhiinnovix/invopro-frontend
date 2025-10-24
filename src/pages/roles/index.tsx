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

import useDelete from "../../hooks/useDelete";
import { DELETE } from "../../services/apiRoutes";
import { useQueryClient } from "@tanstack/react-query";
import { RoleDataTable } from "./RoleDataTable";
import { RoleModal } from "./RoleModal";
import { toast } from "react-toastify";
import { STYLE_GUIDE } from "../../styles";
import { useComponentTypography } from "../../hooks";
import CommonPageHeader from "../../components/atom/commonPageHeader";
import DialogContainer from "../../components/molecule/dialog";
import PrimaryButton from "../../components/common/PrimaryButton";

// Define types
interface Role {
  _id: string;
  organizationId: string;
  name: string;
  status: string;
  permissions?: string[];
}

interface RolePostResponse {
  success: boolean;
  data: Role;
}

export default function Roles() {
  const queryClient = useQueryClient();

  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<
    "add" | "edit" | "view" | "filter" | null
  >(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [rowData, setRowData] = useState<string | null>(null);

  const [searchValue, setSearchValue] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [roleReload, setRoleReload] = useState(false);
  const [filterValues, setFilterValues] = useState({
    name: "",
    organizationId: "",
    status: "",
  });
  const { getHeadingSx } = useComponentTypography();

  // DELETE API
  const deleteRole = useDelete<null, RolePostResponse>(
    ["deleteRole"],
    (data) => {
      if (data?.success) {
        setRoleReload(true);
        handleCloseDialog();
      } else {
        toast.error("Error deleting role");
      }
    },
    true
  );

  useEffect(() => {
    if (roleReload) {
      setRoleReload(false);
    }
  }, [roleReload]);

  const handleAddRole = () => {
    setModalMode("add");
    setOpenModal(true);
  };

  const handleEdit = (row: Role) => {
    setRowData(row?.name);
    setEditRoleId(row._id);
    setModalMode("edit");
    setOpenModal(true);
  };

  const handleView = (row: Role) => {
    setRowData(row?.name);

    setEditRoleId(row._id);
    setModalMode("view");
    setOpenModal(true);
  };

  const handleDelete = (id: string) => {
    if (id) {
      setDeleteId(id);
      setOpenDialog(true);
    }
  };

  const handleFilter = () => {
    setModalMode("filter");
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalMode(null);
    setEditRoleId(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteRole.mutate({
          url: `${DELETE.DELETE_ROLE}/${deleteId}`,
        });
      } catch (error) {
        toast.error("Error deleting role", error);
      }
    }
  };

  const handleFilterApply = (values: {
    name: string;
    organizationId: string;
    status: string;
  }) => {
    setFilterValues(values);
    setPaginationModel({ ...paginationModel, page: 0 });
    handleCloseModal();
  };

  const handleFilterReset = () => {
    setFilterValues({
      name: "",
      organizationId: "",
      status: "",
    });
  };

  const handleRoleCreated = () => {
    setRoleReload(true);
  };

  const handleRoleUpdated = () => {
    setRoleReload(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  return (
    <Box
      sx={{
        p: STYLE_GUIDE?.SPACING?.s2,
      }}
    >
      <CommonPageHeader
        title="Roles"
        actions={
          <Button variant="contained" color="primary" onClick={handleAddRole}>
            Add Role
          </Button>
        }
      />

      <RoleDataTable
        onAddRole={handleAddRole}
        onEditRole={handleEdit}
        onViewRole={handleView}
        onDeleteRole={handleDelete}
        onFilter={handleFilter}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        filterValues={filterValues}
        roleReload={roleReload}
        loading={deleteRole.isLoading}
      />

      <RoleModal
        rowData={rowData}
        open={openModal}
        onClose={handleCloseModal}
        mode={modalMode}
        editRoleId={editRoleId}
        filterValues={filterValues}
        onFilterApply={handleFilterApply}
        onFilterReset={handleFilterReset}
        onRoleCreated={handleRoleCreated}
        onRoleUpdated={handleRoleUpdated}
      />

      <DialogContainer
        open={openDialog}
        onClose={handleCloseDialog}
        title="Confirm Delete"
        maxWidth="xs"
        actions={
          <>
            <PrimaryButton
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{ borderRadius: "8px" }}
            >
              No
            </PrimaryButton>
            <PrimaryButton
              onClick={handleConfirmDelete}
              color="error"
              disabled={deleteRole.isLoading}
              sx={{ borderRadius: "8px" }}
            >
              Yes
            </PrimaryButton>
          </>
        }
      >
        <Typography>Are you sure you want to delete this?</Typography>
      </DialogContainer>
    </Box>
  );
}
