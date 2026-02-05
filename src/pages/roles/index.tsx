import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import useDelete from "../../hooks/useDelete";
import { DELETE } from "../../services/apiRoutes";
import { RoleDataTable } from "./RoleDataTable";
import { RoleModal } from "./RoleModal";
import { toast } from "react-toastify";
import { STYLE_GUIDE } from "../../styles";
import { PageHeader, PageCardLayout, StyledButton } from "../../components/common";
import DialogContainer from "../../components/molecule/dialog";
import PrimaryButton from "../../components/common/PrimaryButton";
import { PermissionsMap } from "../../utils/constants";
import { checkPermission } from "../../utils/utils";
import { RootState } from "../../store";
import { useSelector } from "react-redux";

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
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "filter" | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
  const navigate = useNavigate();
  const permissions = useSelector(
    (state: RootState) => state.userPermission.permissions
  );
  const shouldAllowAdd = checkPermission(
    permissions,
    PermissionsMap.ROLE as any,
    "create"
  );
  const shouldAllowEdit = checkPermission(
    permissions,
    PermissionsMap.ROLE as any,
    "update"
  );
  const shouldAllowDelete = checkPermission(
    permissions,
    PermissionsMap.ROLE as any,
    "delete"
  );

  // DELETE API
  const deleteRole = useDelete<RolePostResponse>(
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
    navigate("/roles/add");
  };

  const handleEdit = (row: Role) => {
    navigate(`/roles/edit/${row._id}`, {
      state: { name: row.name, roleType: row.roleType },
    });
  };

  const handleView = (row: Role) => {
    navigate(`/roles/view/${row._id}`, {
      state: { name: row.name, roleType: row.roleType },
    });
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
      } catch (error: any) {
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
      <PageHeader
        title="Roles"
        subtext="Manage roles and permissions."
        action={
          shouldAllowAdd ? (
            <StyledButton
              variant="primary"
              icon={<AddIcon sx={{ fontSize: "16px" }} />}
              onClick={handleAddRole}
            >
              Add Role
            </StyledButton>
          ) : undefined
        }
      />

      <PageCardLayout>
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
        loading={deleteRole.isPending}
        shouldAllowEdit={shouldAllowEdit}
        shouldAllowDelete={shouldAllowDelete}
      />
      </PageCardLayout>

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
              disabled={deleteRole.isPending}
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
