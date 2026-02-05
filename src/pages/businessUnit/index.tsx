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
import { STYLE_GUIDE } from "../../styles";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { checkPermission } from "../../utils/utils";
import { PermissionsMap } from "../../utils/constants";
import { BusinessUnitModal } from "./BusinessUnitModal";
import { BusinessUnitDataTable } from "./BusinessUnitDataTable";
import { PageHeader, PageCardLayout, StyledButton } from "../../components/common";
import { useQueryClient } from "@tanstack/react-query";

// Define types
interface BusinessUnitData {
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

interface BusinessUnitPostResponse {
  success: boolean;
  data: BusinessUnitData;
}

export type BUPaginationModelType = {
  page: number;
  pageSize: number;
};

export default function BusinessUnit() {
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<
    "add" | "edit" | "view" | "filter" | null
  >(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editBusinessUnitId, setEditBusinessUnitId] = useState<string | null>(
    null
  );
  const [rowData, setRowData] = useState<BusinessUnitData | null>(null);

  const [searchValue, setSearchValue] = useState("");
  const [paginationModel, setPaginationModel] = useState<BUPaginationModelType>(
    {
      page: 0,
      pageSize: 10,
    }
  );
  const [businessUnitReload, setBusinessUnitReload] = useState(false);
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
    PermissionsMap.BUSINESS_UNIT,
    "create"
  );
  const shouldAllowEdit = checkPermission(
    permissions,
    PermissionsMap.BUSINESS_UNIT,
    "update"
  );
  const shouldAllowDelete = checkPermission(
    permissions,
    PermissionsMap.BUSINESS_UNIT,
    "delete"
  );

  // DELETE API
  const deleteBusinessUnit = useDelete<BusinessUnitPostResponse>(
    ["deleteBusinessUnit"],
    (data) => {
      if (data?.success) {
        setBusinessUnitReload(true);
        handleCloseDialog();
        queryClient.invalidateQueries({ queryKey: ["businessUnitList"] });
      } else {
        toast.error("Error deleting business unit");
      }
    },
    true
  );

  useEffect(() => {
    if (businessUnitReload) {
      setBusinessUnitReload(false);
    }
  }, [businessUnitReload]);

  const handleAddBusinessUnit = () => {
    setModalMode("add");
    setOpenModal(true);
  };

  const handleEdit = (row: BusinessUnitData) => {
    setRowData(row);
    setEditBusinessUnitId(row._id);
    setModalMode("edit");
    setOpenModal(true);
  };

  const handleView = (row: BusinessUnitData) => {
    setRowData(row);
    setEditBusinessUnitId(row._id);
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
    setEditBusinessUnitId(null);
    setRowData(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteBusinessUnit.mutate({
          url: `${DELETE.DELETE_BUSINESS_UNIT}/${deleteId}`,
        });
      } catch (error) {
        toast.error("Error deleting Business Unit");
      }
    } else {
      toast.error("Invalid Business Unit ID");
    }
  };

  const handleFilterApply = (values: { name: string }) => {
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

  const handleBusinessUnitCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["businessUnitList"] });
    setBusinessUnitReload(true);
  };

  const handleBusinessUnitUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ["businessUnitList"] });
    setBusinessUnitReload(true);
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
        title="Business Unit"
        subtext="View and manage business units."
        action={
          shouldAllowAdd ? (
            <StyledButton variant="primary" startIcon={<AddIcon />} onClick={handleAddBusinessUnit}>
              Add Business Unit
            </StyledButton>
          ) : undefined
        }
      />

      <PageCardLayout>
        <BusinessUnitDataTable
        onAddBusinessUnit={handleAddBusinessUnit}
        onEditBusinessUnit={handleEdit}
        onViewBusinessUnit={handleView}
        onDeleteBusinessUnit={handleDelete}
        // onFilter={handleFilter}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        // filterValues={filterValues}
        // departmentReload={departmentReload}
        loading={deleteBusinessUnit.isPending}
        shouldAllowAdd={shouldAllowAdd}
        shouldAllowEdit={shouldAllowEdit}
        shouldAllowDelete={shouldAllowDelete}
      />
      </PageCardLayout>

      <BusinessUnitModal
        rowData={rowData}
        open={openModal}
        onClose={handleCloseModal}
        mode={modalMode}
        editBusinessUnitId={editBusinessUnitId || ""}
        filterValues={filterValues}
        onFilterApply={handleFilterApply}
        onFilterReset={handleFilterReset}
        onBusinessUnitCreated={handleBusinessUnitCreated}
        onBusinessUnitUpdated={handleBusinessUnitUpdated}
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
            disabled={deleteBusinessUnit.isPending}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
