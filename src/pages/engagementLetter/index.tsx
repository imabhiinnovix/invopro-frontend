"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

import useDelete from "../../hooks/useDelete";
import { DELETE } from "../../services/apiRoutes";
import { toast } from "react-toastify";

import { EngagementLetterDataTable } from "./EngagementLetterDataTable";

import {
  PageHeader,
  PageCardLayout,
  StyledButton,
} from "../../components/common";

import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { checkPermission } from "../../utils/utils";
import { PermissionsMap } from "../../utils/constants";

interface EngagementLetter {
  _id: string;
  organizationId: string;

  vendorId?: {
    _id: string;
    name: string;
  };

  referenceNumber: string;
  description?: string;
  startDate?: string;
  endDate?: string;

  engagementLetterStatus: "in-force" | "expired";

  engagementLetterFileName?: string;
  engagementLetterFilePath?: string;
}

interface EngagementLetterPostResponse {
  success: boolean;
  data: EngagementLetter;
}

export default function EngagementLetter() {
  const navigate = useNavigate();

  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
    PermissionsMap.ENGAGEMENTLETTER,
    "create"
  );

  const shouldAllowEdit = checkPermission(
    permissions,
    PermissionsMap.ENGAGEMENTLETTER,
    "update"
  );

  const shouldAllowDelete = checkPermission(
    permissions,
    PermissionsMap.ENGAGEMENTLETTER,
    "delete"
  );

  // ================= DELETE =================

  const deleteEngagementLetter = useDelete<null, EngagementLetterPostResponse>(
    ["deleteEngagementLetter"],
    (data) => {
      if (data?.success) {
        setReload(true);
        handleCloseDialog();
        toast.success("Engagement letter deleted successfully");
      } else {
        toast.error("Error deleting engagement letter");
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
    navigate("/engagement-letter/create");
  };

  const handleEdit = (row: EngagementLetter) => {
    navigate(`/engagement-letter/edit/${row._id}`);
  };

  const handleView = (row: EngagementLetter) => {
    navigate(`/engagement-letter/view/${row._id}`);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteEngagementLetter.mutate({
        url: `${DELETE.Delete_Engagement_Letter}/${deleteId}`,
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh" }}>
      {/* <PageHeader
        title="Engagement Letters"
        subtext="View and manage engagement letters."
        action={
          shouldAllowAdd ? (
            <StyledButton
              variant="primary"
              startIcon={<AddIcon />}
              onClick={handleAdd}
            >
              Add Engagement Letter
            </StyledButton>
          ) : undefined
        }
      /> */}

      <PageCardLayout>
        <EngagementLetterDataTable
          onAdd={handleAdd}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          paginationModel={paginationModel}
          setPaginationModel={setPaginationModel}
          reload={reload}
          loading={deleteEngagementLetter.isLoading}
          shouldAllowAdd={shouldAllowAdd}
          shouldAllowEdit={shouldAllowEdit}
          shouldAllowDelete={shouldAllowDelete}
        />
      </PageCardLayout>

      {/* Delete Confirmation Dialog */}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to delete this engagement letter?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>No</Button>

          <Button
            onClick={handleConfirmDelete}
            color="error"
            disabled={deleteEngagementLetter.isLoading}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}