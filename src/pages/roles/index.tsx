import * as React from "react";
import { useState, useEffect } from "react";
import { Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert } from "@mui/material";

import useDelete from "../../hooks/useDelete";
import { DELETE } from "../../services/apiRoutes";
import { useQueryClient } from "@tanstack/react-query";
import { RoleDataTable } from "./RoleDataTable";
import { RoleModal } from "./RoleModal";

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
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "error" | "success";
  }>({
    open: false,
    message: "",
    severity: "error",
  });
  
 
  // DELETE API
  const deleteRole = useDelete<null, RolePostResponse>(
    ["deleteRole"],
    (data) => {
      if (data?.success) {
        setRoleReload(true);
        handleCloseDialog();
        setSnackbar({
          open: true,
          message: "Role deleted successfully!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Failed to delete role.",
          severity: "error",
        });
      }
    },
    true
  );
  
  // Reset roleReload after listing is fetched
  useEffect(() => {
    if (roleReload) {
      setRoleReload(false);
    }
  }, [roleReload]);
  
  const handleAddRole = () => {
    setModalMode("add");
    setOpenModal(true);
  };
  console.log("rowww",rowData)
  
  const handleEdit = (row: Role) => {
    setRowData(row?.name)
    setEditRoleId(row._id);
    setModalMode("edit");
    setOpenModal(true);
  };
  
  const handleView = (row: Role) => {
        setRowData(row?.name)

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
        console.error("Error deleting role:", error);
        setSnackbar({
          open: true,
          message: "Failed to delete role.",
          severity: "error",
        });
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
    setSnackbar({
      open: true,
      message: "Role created successfully!",
      severity: "success",
    });
  };
  
  const handleRoleUpdated = () => {
    setRoleReload(true);
    setSnackbar({
      open: true,
      message: "Role updated successfully!",
      severity: "success",
    });
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };
  
  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 3,
        ml: { xs: 0 },
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 400,
        }}
      >
        Roles
      </Typography>
      
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
      
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "8px",
          },
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ borderRadius: "8px" }}>
            No
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            sx={{ borderRadius: "8px" }}
            disabled={deleteRole.isLoading}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      
     
    </Box>
  );
}
