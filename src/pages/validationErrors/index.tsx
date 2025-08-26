// import * as React from "react";
// import { useState, useEffect } from "react";
// import { DataGrid, GridColDef } from "@mui/x-data-grid";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   TextField,
//   InputAdornment,
//   Button,
// } from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import DeleteIcon from "@mui/icons-material/Delete";
// import Tooltip from "@mui/material/Tooltip";
// import Chip from "@mui/material/Chip";
// import useGet from "../../hooks/useGet";
// import { CustomPagination } from "../../components/common/pagination/customPagination";
// import { GET } from "../../services/apiRoutes";

// import RunCircleIcon from "@mui/icons-material/RunCircle";

// import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";

// import FileDownloadIcon from "@mui/icons-material/FileDownload";

// import { useParams, useLocation } from "react-router-dom";

// interface Validation {
//   _id: string;
//   organizationId: string;
//   name: string;
//   status: string;
//   permissions?: string[];
// }

// interface ApiResponse {
//   success: boolean;
//   data: Validation[];
//   totalCount: number;
// }

// const columns: GridColDef[] = [
//   {
//     field: "rowNumber",
//     headerName: "Row Number",
//     width: 250,
//     disableColumnMenu: true,
//     resizable: true,
//   },
//   {
//     field: "errorCode",
//     headerName: "Error Code",
//     width: 250,
//     disableColumnMenu: true,
//     resizable: true,
//   },
//   {
//     field: "errorMessage",
//     headerName: "Error Message",
//     width: 250,
//     disableColumnMenu: true,
//     resizable: true,
//   },
//   {
//     field: "fileAttributeValue",
//     headerName: "Attribute Value",
//     width: 250,
//     disableColumnMenu: true,
//     resizable: true,
//   },
//   {
//     field: "status",
//     headerName: "Status",
//     width: 250,
//     disableColumnMenu: true,
//     resizable: true,
//     renderCell: (params) => (
//       <Chip
//         label={params.value || "Unknown"}
//         size="small"
//         color={params.value === "active" ? "success" : "error"}
//         variant="outlined"
//       />
//     ),
//   },
//   {
//     field: "actions",
//     headerName: "Actions",
//     width: 250,
//     disableColumnMenu: true,
//     sortable: false,
//     resizable: false,
//     renderCell: (params) => (
//       <Box sx={{ display: "flex", gap: 1 }}>
//         <Tooltip title="Edit" arrow>
//           <Button
//             variant="text"
//             onClick={() => params.row.handleEdit(params.row)}
//             sx={{ minWidth: "auto" }}
//           >
//             <RunCircleIcon />
//           </Button>
//         </Tooltip>
//         <Tooltip title="View" arrow>
//           <Button
//             variant="text"
//             onClick={() => params.row.handleView(params.row)}
//             sx={{ minWidth: "auto" }}
//           >
//             <VisibilityIcon />
//           </Button>
//         </Tooltip>
//         <Tooltip title="Delete" arrow>
//           <Button
//             variant="text"
//             onClick={() => params.row.handleDelete(params.row._id)}
//             sx={{ minWidth: "auto", color: "error.main" }}
//             disabled={!params.row._id}
//           >
//             <DeleteIcon />
//           </Button>
//         </Tooltip>
//       </Box>
//     ),
//   },
// ];

// export default function ValidationErrors() {
//   const { id } = useParams<{ id: string }>();
//   const location = useLocation();

//   const [searchValue, setSearchValue] = useState("");
//   const [paginationModel, setPaginationModel] = useState({
//     page: 0,
//     pageSize: 10,
//   });
//   const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);

//   // Extract dataSourceVersionId from either URL param or query string
//   const getDataSourceVersionId = () => {
//     // First try to get from URL params
//     if (id) return id;

//     // If not in params, check the query string
//     const queryParams = new URLSearchParams(location.search);
//     // The query string is like "?6878fab8a1dfb7e7aabb0f00" without a key
//     // So we get the first parameter value
//     const keys = Array.from(queryParams.keys());
//     if (keys.length > 0) {
//       return keys[0]; // Return the first key which is the ID
//     }

//     return null;
//   };

//   const dataSourceVersionId = getDataSourceVersionId();

//   // Debounce search input
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedSearchValue(searchValue);
//     }, 500);
//     return () => {
//       clearTimeout(handler);
//     };
//   }, [searchValue]);

//   // API call
//   const perPageItem = paginationModel.pageSize;
//   const validationList = useGet<ApiResponse>(
//     [
//       "validationList",
//       String(paginationModel.page + 1),
//       String(paginationModel.pageSize),
//       debouncedSearchValue,

//       dataSourceVersionId || "", // Add dataSourceVersionId to dependency array
//     ],
//     // Use the extracted dataSourceVersionId
//     dataSourceVersionId
//       ? `${GET.VALIDATION_ERROR_LIST}?dataSourceVersionId=${dataSourceVersionId}&page=${paginationModel.page + 1}&limit=${perPageItem}&search=${encodeURIComponent(debouncedSearchValue)}   `
//       : "",
//     !!dataSourceVersionId // Only make the API call if we have a valid ID
//   );

//   // Process API data for DataGrid
//   const validationsWithIds =
//     Array.isArray(validationList?.data?.data) &&
//     validationList.data.data.length > 0
//       ? validationList.data.data.map((validation) => ({
//           ...validation,
//           id:
//             validation._id || `temp-${Math.random().toString(36).substr(2, 9)}`,
//           permissions: validation.permissions || [],
//           handleEdit: (row: Validation) => {
//             setEditValidationId(row._id);},
//           handleView: (row: Validation) => {
//             setEditValidationId(row._id);
//           },
//           handleDelete: (id: string) => {
//             if (id) {
//               setDeleteId(id);
//             }
//           },
//         }))
//       : [];

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchValue(e.target.value);
//     setPaginationModel({ ...paginationModel, page: 0 });
//   };


//   return (
//     <Box
//       sx={{
//         flexGrow: 1,
//         p: 3,
//         ml: { xs: 0 },
//         minHeight: "100vh",
//       }}
//     >
//       <Typography
//         variant="h4"
//         sx={{
//           mb: 3,
//           fontWeight: 400,
//         }}
//       >
//         Validation Errors
//       </Typography>
//       <Card
//         sx={{
//           borderRadius: "8px",
//           overflow: "visible",
//         }}
//       >
//         <CardContent sx={{ p: 3 }}>
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               mb: 2,
//             }}
//           >
//             <TextField
//               placeholder="Search ..."
//               variant="outlined"
//               size="small"
//               value={searchValue}
//               onChange={handleSearchChange}
//               sx={{
//                 width: "300px",
//                 "& .MuiOutlinedInput-root": {
//                   borderRadius: "8px",
//                 },
//               }}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <SearchIcon />
//                   </InputAdornment>
//                 ),
//               }}
//             />
//             <Box sx={{ display: "flex", gap: 1 }}>
//               <Button
//                 variant="contained"
//                 startIcon={<DeleteSweepIcon />}
//                 // onClick={handleAddValidation}
//                 sx={{
//                   borderRadius: "8px",
//                 }}
//               >
//                 Discard All & Submit{" "}
//               </Button>
//               <Button
//                 variant="contained"
//                 startIcon={<FileDownloadIcon />}
//                 // onClick={handleAddValidation}
//                 sx={{
//                   borderRadius: "8px",
//                 }}
//               >
//                 Export{" "}
//               </Button>
//             </Box>
//           </Box>
//           <DataGrid
//             rows={validationsWithIds}
//             columns={columns}
//             initialState={{ pagination: { paginationModel } }}
//             pageSizeOptions={[10, 20]}
//             disableColumnMenu
//             paginationMode="server"
//             sx={{
//               overflow: "visible",
//             }}
//             loading={validationList.isLoading}
//             rowCount={validationList?.data?.totalCount || 0}
//             paginationModel={paginationModel}
//             onPaginationModelChange={setPaginationModel}
//             slots={{
//               pagination: () => (
//                 <CustomPagination
//                   paginationModel={paginationModel}
//                   setPaginationModel={setPaginationModel}
//                   rowCount={validationList?.data?.totalCount || 0}
//                 />
//               ),
//             }}
//           />
//         </CardContent>
//       </Card>
//     </Box>
//   );
// }


import * as React from "react";
import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import useGet from "../../hooks/useGet";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import { GET } from "../../services/apiRoutes";
import RunCircleIcon from "@mui/icons-material/RunCircle";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useParams, useLocation } from "react-router-dom";

interface Validation {
  _id: string;
  organizationId: string;
  name: string;
  status: string;
  permissions?: string[];
}

interface ApiResponse {
  success: boolean;
  data: Validation[];
  totalCount: number;
}

const columns: GridColDef[] = [
  {
    field: "rowNumber",
    headerName: "Row Number",
    width: 250,
    disableColumnMenu: true,
    resizable: true,
  },
  {
    field: "errorCode",
    headerName: "Error Code",
    width: 250,
    disableColumnMenu: true,
    resizable: true,
  },
  {
    field: "errorMessage",
    headerName: "Error Message",
    width: 250,
    disableColumnMenu: true,
    resizable: true,
  },
  {
    field: "fileAttributeValue",
    headerName: "Attribute Value",
    width: 250,
    disableColumnMenu: true,
    resizable: true,
  },
  {
    field: "status",
    headerName: "Status",
    width: 250,
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
    width: 250,
    disableColumnMenu: true,
    sortable: false,
    resizable: false,
    renderCell: (params) => (
      <Box sx={{ display: "flex", gap: 1 }}>
        <Tooltip title="Edit" arrow>
          <Button
            variant="text"
            onClick={() => params.row.handleEdit(params.row)}
            sx={{ minWidth: "auto" }}
          >
            <RunCircleIcon />
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
    ),
  },
];

export default function ValidationErrors() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
  const [openDialog, setOpenDialog] = useState(false); // State for dialog visibility
  const [editValidationId, setEditValidationId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Extract dataSourceVersionId from either URL param or query string
  const getDataSourceVersionId = () => {
    // First try to get from URL params
    if (id) return id;
    // If not in params, check the query string
    const queryParams = new URLSearchParams(location.search);
    // The query string is like "?6878fab8a1dfb7e7aabb0f00" without a key
    // So we get the first parameter value
    const keys = Array.from(queryParams.keys());
    if (keys.length > 0) {
      return keys[0]; // Return the first key which is the ID
    }
    return null;
  };

  const dataSourceVersionId = getDataSourceVersionId();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [searchValue]);

  // API call
  const perPageItem = paginationModel.pageSize;
  const validationList = useGet<ApiResponse>(
    [
      "validationList",
      String(paginationModel.page + 1),
      String(paginationModel.pageSize),
      debouncedSearchValue,
      dataSourceVersionId || "", // Add dataSourceVersionId to dependency array
    ],
    // Use the extracted dataSourceVersionId
    dataSourceVersionId
      ? `${GET.VALIDATION_ERROR_LIST}?dataSourceVersionId=${dataSourceVersionId}&page=${paginationModel.page + 1}&limit=${perPageItem}&search=${encodeURIComponent(debouncedSearchValue)}   `
      : "",
    !!dataSourceVersionId // Only make the API call if we have a valid ID
  );

  // Process API data for DataGrid
  const validationsWithIds =
    Array.isArray(validationList?.data?.data) &&
    validationList.data.data.length > 0
      ? validationList.data.data.map((validation) => ({
          ...validation,
          id:
            validation._id || `temp-${Math.random().toString(36).substr(2, 9)}`,
          permissions: validation.permissions || [],
          handleEdit: (row: Validation) => {
            setEditValidationId(row._id);
          },
          handleView: (row: Validation) => {
            setEditValidationId(row._id);
          },
          handleDelete: (id: string) => {
            if (id) {
              setDeleteId(id);
            }
          },
        }))
      : [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  // Handle dialog actions
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmAction = () => {
    // Add your discard all and submit logic here
    console.log("Discard all and submit confirmed");
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
        Validation Errors
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
                startIcon={<DeleteSweepIcon />}
                onClick={handleOpenDialog} // Open dialog on click
                sx={{
                  borderRadius: "8px",
                }}
              >
                Discard All & Submit
              </Button>
              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                sx={{
                  borderRadius: "8px",
                }}
              >
                Export
              </Button>
            </Box>
          </Box>
          <DataGrid
            rows={validationsWithIds}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            pageSizeOptions={[10, 20]}
            disableColumnMenu
            paginationMode="server"
            sx={{
              overflow: "visible",
            }}
            loading={validationList.isLoading}
            rowCount={validationList?.data?.totalCount || 0}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            slots={{
              pagination: () => (
                <CustomPagination
                  paginationModel={paginationModel}
                  setPaginationModel={setPaginationModel}
                  rowCount={validationList?.data?.totalCount || 0}
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