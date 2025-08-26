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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import useGet from "../../hooks/useGet";
import { GET } from "../../services/apiRoutes";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import { useParams } from "react-router-dom";

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
      const hasDataSourceName = !!params.row.dataSourceId?.name;
      return (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Edit" arrow>
            <Button
              variant="text"
              onClick={() =>
                hasDataSourceName && params.row.handleEdit(params.row)
              }
              sx={{ minWidth: "auto" }}
              disabled={!hasDataSourceName}
            >
              <EditIcon />
            </Button>
          </Tooltip>
          <Tooltip title="View" arrow>
            <Button
              variant="text"
              onClick={() => params.row.handleView(params.row)}
              sx={{ minWidth: "auto" }}
            >
              <VisibilityIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Delete" arrow>
            <Button
              variant="text"
              onClick={() => params.row.handleDelete(params.row._id)}
              sx={{ minWidth: "auto", color: "error.main" }}
              disabled={!params.row._id}
            >
              <DeleteIcon />
            </Button>
          </Tooltip>
        </Box>
      );
    },
  },
];

export default function ValidationErrors() {
  const { id } = useParams<{ id: string }>();
  const [searchValue, setSearchValue] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [searchValue]);

  const perPageItem = paginationModel.pageSize;
  console.log("id", id);
  const validationErrorList = useGet<any>(
    [
      "validationErrorList",
      String(paginationModel.page + 1),
      String(paginationModel.pageSize),
      debouncedSearchValue,
    ],
    `${GET?.VALIDATION_ERROR_LIST}?page=${paginationModel.page + 1}&limit=${perPageItem}&dataSourceVersionId=${id}&search=${encodeURIComponent(debouncedSearchValue)}`,
    true
  );

  // Process API data for DataGrid
  const validationErrorWithIds =
    Array.isArray(validationErrorList?.data?.data) &&
    validationErrorList.data.data.length > 0
      ? validationErrorList.data.data.map((validation) => ({
          ...validation,
          id:
            validation._id || `temp-${Math.random().toString(36).substr(2, 9)}`,
        }))
      : [];

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

  const handleConfirmAction = () => {
    setOpenDialog(false);
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
            rows={validationErrorWithIds.map((validation) => ({
              ...validation,
            }))}
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

      {/* Confirmation Dialog */}
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
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleConfirmAction} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
