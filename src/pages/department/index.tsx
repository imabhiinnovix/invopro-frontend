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
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { STYLE_GUIDE } from "../../styles";
import { DepartmentModal } from "./DepartmentModal";
import { DepartmentDataTable } from "./DepartmentDataTable";
import { PageHeader, PageCardLayout, StyledButton } from "../../components/common";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { checkPermission } from "../../utils/utils";
import { PermissionsMap } from "../../utils/constants";

// Define types
interface Department {
  _id: string;
  organizationId: string;
  name: string;
  status: string;
  permissions?: string[];
  department?: {
    _id: string;
    name: string;
    status: string;
  };
}

interface DepartmentPostResponse {
  success: boolean;
  data: Department;
}

export default function Department() {
  const queryClient = useQueryClient();

  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<
    "add" | "edit" | "view" | "filter" | null
  >(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editDepartmentId, setEditDepartmentId] = useState<string | null>(null);
  const [rowData, setRowData] = useState<Department | null>(null);

  const [searchValue, setSearchValue] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [departmentReload, setDepartmentReload] = useState(false);
  const [filterValues, setFilterValues] = useState({
    name: "",
    organizationId: "",
    status: "",
  });
  const permissions = useSelector(
    (state: RootState) => state.userPermission.permissions
  );
  const shouldAllowAdd = checkPermission(
    permissions,
    PermissionsMap.DEPARTMENT,
    "create"
  );
  const shouldAllowEdit = checkPermission(
    permissions,
    PermissionsMap.DEPARTMENT,
    "update"
  );
  const shouldAllowDelete = checkPermission(
    permissions,
    PermissionsMap.DEPARTMENT,
    "delete"
  );

  // DELETE API
  const deleteDepartment = useDelete<null, DepartmentPostResponse>(
    ["deleteDepartment"],
    (data) => {
      if (data?.success) {
        setDepartmentReload(true);
        handleCloseDialog();
      } else {
        toast.error("Error deleting department");
      }
    },
    true
  );

  useEffect(() => {
    if (departmentReload) {
      setDepartmentReload(false);
    }
  }, [departmentReload]);

  const handleAddDepartment = () => {
    setModalMode("add");
    setOpenModal(true);
  };

  const handleEdit = (row: Department) => {
    setRowData(row);
    setEditDepartmentId(row._id);
    setModalMode("edit");
    setOpenModal(true);
  };

  const handleView = (row: Department) => {
    setRowData(row);
    setEditDepartmentId(row._id);
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
    setEditDepartmentId(null);
    setRowData(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteDepartment.mutate({
          url: `${DELETE.DELETE_ROLE}/${deleteId}`,
        });
      } catch (error) {
        toast.error("Error deleting Department", error);
      }
    }
  };

  const handleFilterApply = (values: {
    name: string;
    departmentId: string;
  }) => {
    setFilterValues({
      name: values.name,
      organizationId: "",
      status: "",
    });
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

  const handleDepartmentCreated = () => {
    setDepartmentReload(true);
  };

  const handleDepartmentUpdated = () => {
    setDepartmentReload(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        ml: { xs: 0 },
        minHeight: "100vh",
      }}
    >
      <PageHeader
        title="Departments"
        subtext="View and manage departments."
        action={
          shouldAllowAdd ? (
            <StyledButton variant="primary" startIcon={<AddIcon />} onClick={handleAddDepartment}>
              Add Department
            </StyledButton>
          ) : undefined
        }
      />

      <PageCardLayout>
        <DepartmentDataTable
        onAddDepartment={handleAddDepartment}
        onEditDepartment={handleEdit}
        onViewDepartment={handleView}
        onDeleteDepartment={handleDelete}
        onFilter={handleFilter}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        filterValues={filterValues}
        departmentReload={departmentReload}
        loading={deleteDepartment.isLoading}
        shouldAllowAdd={shouldAllowAdd}
        shouldAllowEdit={shouldAllowEdit}
        shouldAllowDelete={shouldAllowDelete}
      />
      </PageCardLayout>

      <DepartmentModal
        rowData={rowData}
        open={openModal}
        onClose={handleCloseModal}
        mode={modalMode}
        editDepartmentId={editDepartmentId}
        filterValues={filterValues}
        onFilterApply={handleFilterApply}
        onFilterReset={handleFilterReset}
        onDepartmentCreated={handleDepartmentCreated}
        onDepartmentUpdated={handleDepartmentUpdated}
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
            disabled={deleteDepartment.isLoading}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
