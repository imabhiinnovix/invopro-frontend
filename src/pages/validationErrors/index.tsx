import * as React from "react";
import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Tooltip,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import SwipeUpIcon from "@mui/icons-material/SwipeUp";
import SearchIcon from "@mui/icons-material/Search";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import useGet from "../../hooks/useGet";
import usePost from "../../hooks/usePost";
import { GET, POST } from "../../services/apiRoutes";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query"; // Added import

const columns: GridColDef[] = [
  {
    field: "rowNumber",
    headerName: "RowNumber",
    width: 150,
    disableColumnMenu: true,
    resizable: true,
  },
  {
    field: "errorCode",
    headerName: "Resource Type",
    width: 150,
    disableColumnMenu: true,
    resizable: true,
  },
  {
    field: "errorMessage",
    headerName: "Error Message",
    width: 100,
    disableColumnMenu: true,
    resizable: true,
  },
  {
    field: "fileAttributeValue",
    headerName: "Attribute Value",
    width: 150,
    disableColumnMenu: true,
    resizable: true,
  },
  {
    field: "status",
    headerName: "Status",
    width: 100,
    disableColumnMenu: true,
    resizable: true,
    renderCell: (params) => (
      <Chip
        label={params.value || "Unknown"}
        size="small"
        color={params.value === "active" ? "success" : "error"}
        variant="outlined"
      />
    ),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 150,
    disableColumnMenu: true,
    sortable: false,
    resizable: false,
    renderCell: (params) => {
      return (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Take Action" arrow>
            <Button
              variant="text"
              onClick={() => params.row.handleEdit(params.row)}
              sx={{ minWidth: "auto" }}
            >
              <SwipeUpIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Discard" arrow>
            <Button
              variant="text"
              onClick={() => params.row.handleDiscard(params.row)}
              sx={{ minWidth: "auto" }}
            >
              <RemoveCircleIcon />
            </Button>
          </Tooltip>
        </Box>
      );
    },
  },
];

export default function ValidationErrors() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient(); // Added query client
  const [searchValue, setSearchValue] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
  const [openDialog, setOpenDialog] = useState(false);
  const [discardRowDialog, setDiscardRowDialog] = useState<{
    open: boolean;
    rowData: any;
  }>({ open: false, rowData: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDiscardingRow, setIsDiscardingRow] = useState(false);
  
  const discardAllSubmit = usePost(["discardAllSubmit"]);
  const discardRow = usePost(["discardRow"]);
  
  const validationErrorList = useGet<any>(
    [
      "validationErrorList",
      String(paginationModel.page + 1),
      String(paginationModel.pageSize),
      debouncedSearchValue,
    ],
    `${GET?.VALIDATION_ERROR_LIST}?page=${paginationModel.page + 1}&limit=${paginationModel.pageSize}&dataSourceVersionId=${id}&search=${encodeURIComponent(debouncedSearchValue)}`,
    true
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [searchValue]);

  // Function to handle row discard
  const handleDiscardRow = (rowData: any) => {
    console.log("Discard row clicked", rowData);
    setDiscardRowDialog({ open: true, rowData });
  };

  // Process API data for DataGrid
  const validationErrorWithIds =
    Array.isArray(validationErrorList?.data?.data) &&
    validationErrorList.data.data.length > 0
      ? validationErrorList.data.data.map((validation) => ({
          ...validation,
          id:
            validation._id || `temp-${Math.random().toString(36).substr(2, 9)}`,
          handleDiscard: handleDiscardRow,
        }))
      : [];

  // Extract dataSourceId from the first item (since all have the same ID)
  const dataSourceId =
    validationErrorWithIds.length > 0
      ? validationErrorWithIds[0].dataSourceId
      : null;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleDiscardRowCloseDialog = () => {
    setDiscardRowDialog({ open: false, rowData: null });
  };

  const handleConfirmAction = async () => {
    if (!id || !dataSourceId) {
      console.error("Missing required data for API call");
      setOpenDialog(false);
      return;
    }
    const payload = {
      action: "discardAllSubmit",
      dataSourceVersionId: id,
      dataSourceId: dataSourceId,
    };
    console.log("Payload to be sent:", payload);
    setIsSubmitting(true);
    try {
      const response = await discardAllSubmit.mutateAsync({
        url: `${POST.RESOLVE_DATA_IMPORT_ERROR}`,
        payload,
      });
      if (response?.success) {
        toast.success(response?.message || "Action completed successfully");
        // Invalidate the query to refresh the data
        queryClient.invalidateQueries(["validationErrorList"]);
      }
      
      setOpenDialog(false);
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Failed to complete the action");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscardRowConfirm = async () => {
    if (!id || !discardRowDialog.rowData) {
      console.error("Missing required data for API call");
      setDiscardRowDialog({ open: false, rowData: null });
      return;
    }
    const payload = {
      action: "discard",
      dataSourceVersionId: id,
      dataSourceId: discardRowDialog.rowData.dataSourceId,
      rowNumber: discardRowDialog.rowData.rowNumber,
    };
    console.log("Row discard payload:", payload);
    setIsDiscardingRow(true);
    try {
      const response = await discardRow.mutateAsync({
        url: `${POST.RESOLVE_DATA_IMPORT_ERROR}`,
        payload,
      });
      if (response?.success) {
        toast.success(response?.message || "Row discarded successfully");
        // Invalidate the query to refresh the data
        queryClient.invalidateQueries(["validationErrorList"]);
      }
      
      setDiscardRowDialog({ open: false, rowData: null });
    } catch (error) {
      console.error("Error discarding row:", error);
      toast.error("Failed to discard row");
    } finally {
      setIsDiscardingRow(false);
    }
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
        Validation Errors{" "}
      </Typography>
      <Card
        sx={{
          borderRadius: "8px",
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <TextField
              placeholder="Search ..."
              variant="outlined"
              size="small"
              value={searchValue}
              onChange={handleSearchChange}
              sx={{
                width: "300px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                sx={{
                  borderRadius: "8px",
                }}
              >
                Import
              </Button>
              <Button
                variant="contained"
                startIcon={<DeleteSweepIcon />}
                onClick={handleOpenDialog}
                sx={{
                  borderRadius: "8px",
                }}
              >
                Discard All & Submit
              </Button>
            </Box>
          </Box>
          <DataGrid
            rows={validationErrorWithIds}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            pageSizeOptions={[5, 10, 20]}
            disableColumnMenu
            paginationMode="server"
            sx={{
              overflow: "visible",
            }}
            rowCount={validationErrorList?.data?.totalCount || 0}
            paginationModel={paginationModel}
            slots={{
              pagination: () => (
                <CustomPagination
                  paginationModel={paginationModel}
                  setPaginationModel={setPaginationModel}
                  rowCount={validationErrorList?.data?.totalCount || 0}
                />
              ),
            }}
          />
        </CardContent>
      </Card>
      
      {/* Confirmation Dialog for Discard All & Submit */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure want to finalize action preview data?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            autoFocus
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : "OK"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirmation Dialog for Discard Row */}
      <Dialog
        open={discardRowDialog.open}
        onClose={handleDiscardRowCloseDialog}
        aria-labelledby="discard-row-dialog-title"
        aria-describedby="discard-row-dialog-description"
      >
        <DialogTitle id="discard-row-dialog-title">Confirm Discard</DialogTitle>
        <DialogContent>
          <DialogContentText id="discard-row-dialog-description">
            Are you sure you want to discard row {discardRowDialog.rowData?.rowNumber}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDiscardRowCloseDialog} disabled={isDiscardingRow}>
            Cancel
          </Button>
          <Button
            onClick={handleDiscardRowConfirm}
            autoFocus
            disabled={isDiscardingRow}
          >
            {isDiscardingRow ? <CircularProgress size={24} /> : "OK"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}