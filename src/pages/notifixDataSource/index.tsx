
// import * as React from "react";
// import { useState, useEffect } from "react";
// import { DataGrid, GridColDef } from "@mui/x-data-grid";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   TextField,
//   Button,
//   InputAdornment,
//   Modal,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Tooltip,
// } from "@mui/material";
// import { STYLE_GUIDE } from "../../styles"; // Adjust path as needed
// import SearchIcon from "@mui/icons-material/Search";
// import FilterListIcon from "@mui/icons-material/FilterList";
// import AddIcon from "@mui/icons-material/Add";
// import EditIcon from "@mui/icons-material/Edit";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import DeleteIcon from "@mui/icons-material/Delete";
// import axiosInstance from "../../services/axiosInstance"; // Adjust path as needed

// const generateColumns = (
//   sampleRowData: Record<string, any>,
//   handleView: (id: string) => void,
//   handleEdit: (id: string) => void,
//   handleDelete: (id: string) => void,
//   loading: boolean, // Add loading parameter
//   rows: any[] // Add rows parameter
// ): GridColDef[] => {
//   const dynamicColumns = Object.keys(sampleRowData)
//     .filter((key) => key !== "_id")
//     .map((key) => ({
//       field: key,
//       headerName: key
//         .replace(/([A-Z])/g, " $1")
//         .replace(/^./, (str) => str.toUpperCase()),
//       flex: 1,
//       renderHeader: (params) => {
//         const headerText = params.colDef.headerName || "";
//         return headerText.length > 10 ? (
//           <Tooltip title={headerText} arrow>
//             <Typography
//               sx={{
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//                 whiteSpace: "nowrap",
//               }}
//             >
//               {headerText}
//             </Typography>
//           </Tooltip>
//         ) : (
//           <Typography>{headerText}</Typography>
//         );
//       },
//       renderCell: (params) => {
//         const cellValue = params.value != null ? String(params.value) : "";
//         return cellValue.length > 10 ? (
//           <Tooltip title={cellValue} arrow>
//             <Typography
//               sx={{
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//                 whiteSpace: "nowrap",
//               }}
//             >
//               {cellValue}
//             </Typography>
//           </Tooltip>
//         ) : (
//           <Typography>{cellValue}</Typography>
//         );
//       },
//     }));

//   const actionsColumn: GridColDef = {
//     field: "actions",
//     headerName: "Actions",
//     flex: 1,
//     sortable: false,
//     renderHeader: () => <Typography>Actions</Typography>,
//     renderCell: (params) => (
//       <Box sx={{ display: "flex", gap: 1 }}>
//         <Tooltip title="View" arrow>
//           <Button
//             size="small"
//             onClick={() => handleView(params.row._id)}
//             sx={{
//               minWidth: "auto",
//               color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//             }}
//           >
//             <VisibilityIcon />
//           </Button>
//         </Tooltip>
//         <Tooltip title="Edit" arrow>
//           <Button
//             size="small"
//             onClick={() => handleEdit(params.row._id)}
//             sx={{
//               minWidth: "auto",
//               color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//             }}
//           >
//             <EditIcon />
//           </Button>
//         </Tooltip>
//         <Tooltip title="Delete" arrow>
//           <Button
//             size="small"
//             onClick={() => handleDelete(params.row._id)}
//             sx={{
//               minWidth: "auto",
//               color: STYLE_GUIDE?.COLORS?.error || "#d32f2f",
//             }}
//           >
//             <DeleteIcon />
//           </Button>
//         </Tooltip>
//       </Box>
//     ),
//   };

//   return [...dynamicColumns, actionsColumn];
// };

// export default function NotifixDataSource() {
//   const [rows, setRows] = useState<any[]>([]);
//   const [rowCount, setRowCount] = useState(0);
//   const [columns, setColumns] = useState<GridColDef[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [openModal, setOpenModal] = useState(false);
//   const [modalMode, setModalMode] = useState<
//     "add" | "edit" | "view" | "filter" | null
//   >(null);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [formData, setFormData] = useState<Record<string, any>>({ id: "" });
//   const [deleteId, setDeleteId] = useState<string | null>(null);
//   const [searchValue, setSearchValue] = useState("");

//   const dataSourceId = "6878e3cf23a13174f84626c4"; // Replace with actual ID
//   const versionValue = "2025-07"; // Replace with actual version

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const response = await axiosInstance.get(
//           `dataSourceVersion/versionData?dataSourceId=${dataSourceId}&versionValue=${versionValue}`
//         );
//         console.log("Raw API Response:", response.data);

//         const rawData = response?.data?.data || [];
//         const totalCount = response?.data?.total || 0;

//         if (!Array.isArray(rawData)) {
//           console.error("Invalid API response: rawData is not an array", rawData);
//           setRows([]);
//           setRowCount(0);
//           setColumns([]);
//           return;
//         }

//         const formattedRows = rawData.map((item: any) => ({
//           _id: item._id || item.id, // Use reliable ID from API
//           ...item.rowData,
//         }));

//         setRows(formattedRows);
//         console.log("Formatted Rows:", formattedRows);
//         setRowCount(totalCount);

//         if (formattedRows.length > 0) {
//           const dynamicCols = generateColumns(
//             formattedRows[0],
//             handleView,
//             handleEdit,
//             handleDelete,
//             loading, // Pass loading
//             rows // Pass rows
//           );
//           setColumns(dynamicCols);
//         } else {
//           console.warn("No data available to generate columns");
//           setColumns([]);
//         }
//       } catch (error) {
//         console.error("Failed to fetch data:", error);
//         setRows([]);
//         setColumns([]);
//         setRowCount(0);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []); // Note: `rows` and `loading` are not dependencies here since columns are set only once

//   const handleView = (id: string) => {
//     console.log("Rows:", rows);
//     console.log("Searching for ID:", id);
//     const row = rows.find((r) => r._id === id);
//     if (row) {
//       console.log("Found row:", row);
//       const newFormData: Record<string, any> = { id: row._id };
//       Object.keys(row).forEach((key) => {
//         if (key !== "_id") {
//           newFormData[key] = row[key] != null ? String(row[key]) : "";
//         }
//       });
//       setFormData(newFormData);
//       setModalMode("view");
//       setOpenModal(true);
//     } else {
//       console.error(`Row with ID ${id} not found`);
//     }
//   };

//   const handleEdit = (id: string) => {
//     const row = rows.find((r) => r._id === id);
//     if (row) {
//       const newFormData: Record<string, any> = { id: row._id };
//       Object.keys(row).forEach((key) => {
//         if (key !== "_id") {
//           newFormData[key] = row[key] != null ? String(row[key]) : "";
//         }
//       });
//       setFormData(newFormData);
//       setModalMode("edit");
//       setOpenModal(true);
//     }
//   };

//   const handleDelete = (id: string) => {
//     setDeleteId(id);
//     setOpenDialog(true);
//   };

//   const handleAddNotification = () => {
//     setFormData({ id: "" });
//     setModalMode("add");
//     setOpenModal(true);
//   };

//   const handleFilter = () => {
//     setFormData({ id: "" });
//     setModalMode("filter");
//     setOpenModal(true);
//   };

//   const handleCloseModal = () => {
//     setOpenModal(false);
//     setModalMode(null);
//     setFormData({ id: "" });
//   };

//   const handleCloseDialog = () => {
//     setOpenDialog(false);
//     setDeleteId(null);
//   };

//   const handleConfirmDelete = () => {
//     console.log(`Deleting row with ID: ${deleteId}`);
//     setRows(rows.filter((row) => row._id !== deleteId));
//     handleCloseDialog();
//   };

//   const handleSave = () => {
//     if (modalMode === "add") {
//       console.log("Adding new notification: ", formData);
//     } else if (modalMode === "edit") {
//       console.log("Saving edited row: ", formData);
//     } else if (modalMode === "filter") {
//       console.log("Applying filter: ", formData);
//     }
//     handleCloseModal();
//   };

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setSearchValue(value);
//     console.log(`Search value: ${value}`);
//   };

//   const renderModalFields = () => {
//     const fields = columns
//       .filter((col) => col.field !== "actions" && col.field !== "_id")
//       .map((col) => (
//         <TextField
//           key={col.field}
//           label={col.headerName}
//           value={formData[col.field] || ""}
//           onChange={(e) =>
//             setFormData({ ...formData, [col.field]: e.target.value })
//           }
//           disabled={modalMode === "view"}
//           variant="outlined"
//           fullWidth
//           sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
//         />
//       ));

//     return fields.length > 0 ? (
//       fields
//     ) : (
//       <Typography>No fields available to display.</Typography>
//     );
//   };

//   if (loading) {
//     return <Typography>Loading...</Typography>;
//   }

//   return (
//     <Box
//       sx={{
//         flexGrow: 1,
//         p: 3,
//         ml: { xs: 0 },
//         backgroundColor: STYLE_GUIDE?.COLORS?.backgroundLight || "#f5f5f5",
//         minHeight: "100vh",
//       }}
//     >
//       <Typography
//         variant="h4"
//         sx={{
//           mb: 3,
//           fontWeight: 400,
//           color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//         }}
//       >
//         Case List
//       </Typography>

//       <Card
//         sx={{
//           backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
//           boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
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
//               placeholder="Search..."
//               variant="outlined"
//               size="small"
//               value={searchValue}
//               onChange={handleSearchChange}
//               sx={{
//                 width: "300px",
//                 "& .MuiOutlinedInput-root": {
//                   borderRadius: "8px",
//                   backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
//                   "& fieldset": {
//                     borderColor: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
//                   },
//                   "&:hover fieldset": {
//                     borderColor: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                   },
//                 },
//               }}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <SearchIcon
//                       sx={{
//                         color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                       }}
//                     />
//                   </InputAdornment>
//                 ),
//               }}
//             />

//             <Box sx={{ display: "flex", gap: 1 }}>
//               <Button
//                 variant="outlined"
//                 startIcon={<FilterListIcon />}
//                 onClick={handleFilter}
//                 sx={{
//                   borderRadius: "8px",
//                   borderColor: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
//                   color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                   "&:hover": {
//                     backgroundColor:
//                       STYLE_GUIDE?.COLORS?.backgroundDefault || "#f1f5f9",
//                     borderColor: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                   },
//                 }}
//               >
//                 Filter
//               </Button>
//               <Button
//                 variant="contained"
//                 startIcon={<AddIcon />}
//                 onClick={handleAddNotification}
//                 sx={{
//                   borderRadius: "8px",
//                   backgroundColor:
//                     STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                   color: STYLE_GUIDE?.COLORS?.white || "#ffffff",
//                   "&:hover": {
//                     backgroundColor: STYLE_GUIDE?.COLORS?.primary || "#5c6bc0",
//                   },
//                 }}
//               >
//                 Add
//               </Button>
//             </Box>
//           </Box>

//           {rows.length > 0 ? (
//             <DataGrid
//               loading={loading}
//               rows={rows}
//               columns={columns}
//               getRowId={(row) => row._id}
//               initialState={{
//                 pagination: { paginationModel: { page: 0, pageSize: 10 } },
//               }}
//               pageSizeOptions={[5, 10]}
//               disableColumnMenu
//               rowCount={rowCount}
//               paginationMode="server"
//               sx={{
//                 border: 0,
//                 backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
//                 overflow: "visible",
//                 "& .MuiDataGrid-columnHeaders": {
//                   backgroundColor:
//                     STYLE_GUIDE?.COLORS?.backgroundLight || "#f5f5f5",
//                   color: STYLE_GUIDE?.COLORS?.black || "#000000",
//                   fontWeight: 600,
//                   fontSize: "1rem",
//                   position: "relative",
//                   zIndex: 1,
//                 },
//                 "& .MuiDataGrid-columnHeaderTitle": {
//                   fontWeight: 600,
//                   color: STYLE_GUIDE?.COLORS?.black || "#000000",
//                 },
//                 "& .MuiDataGrid-columnHeader": {
//                   outline: "none",
//                   "&:focus, &:focus-within": {
//                     outline: "none",
//                   },
//                   "& .MuiDataGrid-columnSeparator": {
//                     color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                     "&:hover": {
//                       color: STYLE_GUIDE?.COLORS?.primary || "#5c6bc0",
//                     },
//                   },
//                 },
//                 "& .MuiDataGrid-cell": {
//                   backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
//                   color: STYLE_GUIDE?.COLORS?.black || "#000000",
//                   borderBottom: `1px solid ${
//                     STYLE_GUIDE?.COLORS?.divider || "#e0e0e0"
//                   }`,
//                   borderRight: "none",
//                   outline: "none",
//                   "&:focus, &:focus-within": {
//                     outline: "none",
//                   },
//                 },
//                 "& .MuiDataGrid-row:hover": {
//                   backgroundColor:
//                     STYLE_GUIDE?.COLORS?.backgroundDefault || "#f1f5f9",
//                 },
//                 "& .MuiDataGrid-footerContainer": {
//                   backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
//                   borderTop: `1px solid ${
//                     STYLE_GUIDE?.COLORS?.divider || "#e0e0e0"
//                   }`,
//                   color: STYLE_GUIDE?.COLORS?.black || "#000000",
//                 },
//               }}
//             />
//           ) : (
//             <Typography>No data available</Typography>
//           )}
//         </CardContent>
//       </Card>

//       <Modal
//         open={openModal}
//         onClose={handleCloseModal}
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       >
//         <Box
//           sx={{
//             backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
//             borderRadius: "8px",
//             boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
//             p: 3,
//             width: "600px",
//             maxWidth: "90%",
//             maxHeight: "600px",
//             overflowY: "auto",
//           }}
//         >
//           <Typography
//             variant="h6"
//             sx={{ mb: 2, color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5" }}
//           >
//             {modalMode === "add"
//               ? "Add Notification"
//               : modalMode === "edit"
//               ? "Edit Notification"
//               : modalMode === "view"
//               ? "View Notification"
//               : "Filter Notifications"}
//           </Typography>
//           <Box
//             sx={{
//               display: "grid",
//               gridTemplateColumns: "1fr 1fr",
//               gap: 2,
//             }}
//           >
//             {renderModalFields()}
//           </Box>
//           <Box
//             sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}
//           >
//             <Button
//               variant="outlined"
//               onClick={handleCloseModal}
//               sx={{
//                 borderRadius: "8px",
//                 borderColor: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
//                 color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//               }}
//             >
//               Cancel
//             </Button>
//             {modalMode !== "view" && (
//               <Button
//                 variant="contained"
//                 onClick={handleSave}
//                 sx={{
//                   borderRadius: "8px",
//                   backgroundColor:
//                     STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                   color: STYLE_GUIDE?.COLORS?.white || "#ffffff",
//                   "&:hover": {
//                     backgroundColor: STYLE_GUIDE?.COLORS?.primary || "#5c6bc0",
//                   },
//                 }}
//               >
//                 {modalMode === "filter" ? "Apply" : "Save"}
//               </Button>
//             )}
//           </Box>
//         </Box>
//       </Modal>

//       <Dialog
//         open={openDialog}
//         onClose={handleCloseDialog}
//         sx={{
//           "& .MuiDialog-paper": {
//             borderRadius: "8px",
//             backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
//           },
//         }}
//       >
//         <DialogTitle
//           sx={{ color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5" }}
//         >
//           Confirm Delete
//         </DialogTitle>
//         <DialogContent>
//           <Typography>
//             Are you sure you want to delete the notification with ID {deleteId}?
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button
//             onClick={handleCloseDialog}
//             sx={{
//               borderRadius: "8px",
//               color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//             }}
//           >
//             No
//           </Button>
//           <Button
//             onClick={handleConfirmDelete}
//             sx={{
//               borderRadius: "8px",
//               backgroundColor: STYLE_GUIDE?.COLORS?.error || "#d32f2f",
//               color: "#ffffff",
//               "&:hover": {
//                 backgroundColor: STYLE_GUIDE?.COLORS?.error || "#b71c1c",
//               },
//             }}
//           >
//             Yes
//           </Button>
//         </DialogActions>
//       </Dialog>
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
  Button,
  InputAdornment,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import { STYLE_GUIDE } from "../../styles"; // Adjust path as needed
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import axiosInstance from "../../services/axiosInstance"; // Adjust path as needed

const generateColumns = (
  sampleRowData: Record<string, any>,
  handleView: (id: string) => void,
  handleEdit: (id: string) => void,
  handleDelete: (id: string) => void,
  loading: boolean,
  rows: any[]
): GridColDef[] => {
  const dynamicColumns = Object.keys(sampleRowData)
    .filter((key) => key !== "_id")
    .map((key) => ({
      field: key,
      headerName: key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase()),
      flex: 1,
      renderHeader: (params) => {
        const headerText = params.colDef.headerName || "";
        return headerText.length > 10 ? (
          <Tooltip title={headerText} arrow>
            <Typography
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {headerText}
            </Typography>
          </Tooltip>
        ) : (
          <Typography>{headerText}</Typography>
        );
      },
      renderCell: (params) => {
        const cellValue = params.value != null ? String(params.value) : "";
        return cellValue.length > 10 ? (
          <Tooltip title={cellValue} arrow>
            <Typography
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {cellValue}
            </Typography>
          </Tooltip>
        ) : (
          <Typography>{cellValue}</Typography>
        );
      },
    }));

  const actionsColumn: GridColDef = {
    field: "actions",
    headerName: "Actions",
    flex: 1,
    sortable: false,
    renderHeader: () => <Typography>Actions</Typography>,
    renderCell: (params) => (
      <Box sx={{ display: "flex", gap: 1 }}>
        <Tooltip title="View" arrow>
          <Button
            size="small"
            onClick={() => handleView(params.row._id)}
            sx={{
              minWidth: "auto",
              color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
            }}
          >
            <VisibilityIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Edit" arrow>
          <Button
            size="small"
            onClick={() => handleEdit(params.row._id)}
            sx={{
              minWidth: "auto",
              color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
            }}
          >
            <EditIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Delete" arrow>
          <Button
            size="small"
            onClick={() => handleDelete(params.row._id)}
            sx={{
              minWidth: "auto",
              color: STYLE_GUIDE?.COLORS?.error || "#d32f2f",
            }}
          >
            <DeleteIcon />
          </Button>
        </Tooltip>
      </Box>
    ),
  };

  return [...dynamicColumns, actionsColumn];
};

// Custom Pagination Component
const CustomPagination = ({ paginationModel, setPaginationModel, rowCount }) => {
  const totalPages = Math.ceil(rowCount / paginationModel.pageSize);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        p: 1,
        backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
        borderTop: `1px solid ${STYLE_GUIDE?.COLORS?.divider || "#e0e0e0"}`,
      }}
    >
      <Button
        disabled={paginationModel.page === 0}
        onClick={() =>
          setPaginationModel({ ...paginationModel, page: 0 })
        }
        sx={{ minWidth: "auto", mx: 1 }}
      >
        <FirstPageIcon />
      </Button>
      <Button
        disabled={paginationModel.page === 0}
        onClick={() =>
          setPaginationModel({
            ...paginationModel,
            page: paginationModel.page - 1,
          })
        }
        sx={{ minWidth: "auto", mx: 1 }}
      >
        <Typography>{"<"}</Typography>
      </Button>
      <Typography sx={{ mx: 2 }}>
        Page {paginationModel.page + 1} of {totalPages}
      </Typography>
      <Button
        disabled={paginationModel.page >= totalPages - 1}
        onClick={() =>
          setPaginationModel({
            ...paginationModel,
            page: paginationModel.page + 1,
          })
        }
        sx={{ minWidth: "auto", mx: 1 }}
      >
        <Typography>{">"}</Typography>
      </Button>
      <Button
        disabled={paginationModel.page >= totalPages - 1}
        onClick={() =>
          setPaginationModel({
            ...paginationModel,
            page: totalPages - 1,
          })
        }
        sx={{ minWidth: "auto", mx: 1 }}
      >
        <LastPageIcon />
      </Button>
    </Box>
  );
};

export default function NotifixDataSource() {
  const [rows, setRows] = useState<any[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<
    "add" | "edit" | "view" | "filter" | null
  >(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({ id: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const dataSourceId = "6878e3cf23a13174f84626c4";
  const versionValue = "2025-07";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `dataSourceVersion/versionData?dataSourceId=${dataSourceId}&versionValue=${versionValue}&page=${
            paginationModel.page + 1
          }&limit=${paginationModel.pageSize}`
        );
        console.log("Raw API Response:", response.data);

        const rawData = response?.data?.data || [];
        const totalCount = response?.data?.totalCount || 0;

        if (!Array.isArray(rawData)) {
          console.error("Invalid API response: rawData is not an array", rawData);
          setRows([]);
          setRowCount(0);
          setColumns([]);
          return;
        }

        const formattedRows = rawData.map((item: any) => ({
          _id: item._id || item.id,
          ...item.rowData,
        }));

        setRows(formattedRows);
        console.log("Formatted Rows:", formattedRows);
        setRowCount(totalCount);

        if (formattedRows.length > 0) {
          const dynamicCols = generateColumns(
            formattedRows[0],
            handleView,
            handleEdit,
            handleDelete,
            loading,
            rows
          );
          setColumns(dynamicCols);
        } else {
          console.warn("No data available to generate columns");
          setColumns([]);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setRows([]);
        setColumns([]);
        setRowCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [paginationModel]);

  const handleView = (id: string) => {
    const row = rows.find((r) => r._id === id);
    if (row) {
      const newFormData: Record<string, any> = { id: row._id };
      Object.keys(row).forEach((key) => {
        if (key !== "_id") {
          newFormData[key] = row[key] != null ? String(row[key]) : "";
        }
      });
      setFormData(newFormData);
      setModalMode("view");
      setOpenModal(true);
    } else {
      console.error(`Row with ID ${id} not found`);
    }
  };

  const handleEdit = (id: string) => {
    const row = rows.find((r) => r._id === id);
    if (row) {
      const newFormData: Record<string, any> = { id: row._id };
      Object.keys(row).forEach((key) => {
        if (key !== "_id") {
          newFormData[key] = row[key] != null ? String(row[key]) : "";
        }
      });
      setFormData(newFormData);
      setModalMode("edit");
      setOpenModal(true);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleAddNotification = () => {
    setFormData({ id: "" });
    setModalMode("add");
    setOpenModal(true);
  };

  const handleFilter = () => {
    setFormData({ id: "" });
    setModalMode("filter");
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalMode(null);
    setFormData({ id: "" });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  const handleConfirmDelete = () => {
    console.log(`Deleting row with ID: ${deleteId}`);
    setRows(rows.filter((row) => row._id !== deleteId));
    setRowCount((prev) => prev - 1);
    handleCloseDialog();
  };

  const handleSave = () => {
    if (modalMode === "add") {
      console.log("Adding new notification: ", formData);
    } else if (modalMode === "edit") {
      console.log("Saving edited row: ", formData);
    } else if (modalMode === "filter") {
      console.log("Applying filter: ", formData);
    }
    handleCloseModal();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    console.log(`Search value: ${value}`);
  };

  const renderModalFields = () => {
    const fields = columns
      .filter((col) => col.field !== "actions" && col.field !== "_id")
      .map((col) => (
        <TextField
          key={col.field}
          label={col.headerName}
          value={formData[col.field] || ""}
          onChange={(e) =>
            setFormData({ ...formData, [col.field]: e.target.value })
          }
          disabled={modalMode === "view"}
          variant="outlined"
          fullWidth
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
        />
      ));

    return fields.length > 0 ? (
      fields
    ) : (
      <Typography>No fields available to display.</Typography>
    );
  };

  if (loading && rows.length === 0) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 3,
        ml: { xs: 0 },
        backgroundColor: STYLE_GUIDE?.COLORS?.backgroundLight || "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 400,
          color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
        }}
      >
        Case List
      </Typography>

      <Card
        sx={{
          backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
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
              placeholder="Search..."
              variant="outlined"
              size="small"
              value={searchValue}
              onChange={handleSearchChange}
              sx={{
                width: "300px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
                  "& fieldset": {
                    borderColor: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
                  },
                  "&:hover fieldset": {
                    borderColor: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{
                        color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                      }}
                    />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={handleFilter}
                sx={{
                  borderRadius: "8px",
                  borderColor: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
                  color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                  "&:hover": {
                    backgroundColor:
                      STYLE_GUIDE?.COLORS?.backgroundDefault || "#f1f5f9",
                    borderColor: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                  },
                }}
              >
                Filter
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNotification}
                sx={{
                  borderRadius: "8px",
                  backgroundColor:
                    STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                  color: STYLE_GUIDE?.COLORS?.white || "#ffffff",
                  "&:hover": {
                    backgroundColor: STYLE_GUIDE?.COLORS?.primary || "#5c6bc0",
                  },
                }}
              >
                Add
              </Button>
            </Box>
          </Box>

          {rows.length > 0 ? (
            <DataGrid
              loading={loading}
              rows={rows}
              columns={columns}
              getRowId={(row) => row._id}
              paginationMode="server"
              rowCount={rowCount}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 20]}
              components={{
                Pagination: () => (
                  <CustomPagination
                    paginationModel={paginationModel}
                    setPaginationModel={setPaginationModel}
                    rowCount={rowCount}
                  />
                ),
              }}
              sx={{
                border: 0,
                backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
                overflow: "visible",
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor:
                    STYLE_GUIDE?.COLORS?.backgroundLight || "#f5f5f5",
                  color: STYLE_GUIDE?.COLORS?.black || "#000000",
                  fontWeight: 600,
                  fontSize: "1rem",
                  position: "relative",
                  zIndex: 1,
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: 600,
                  color: STYLE_GUIDE?.COLORS?.black || "#000000",
                },
                "& .MuiDataGrid-columnHeader": {
                  outline: "none",
                  "&:focus, &:focus-within": {
                    outline: "none",
                  },
                  "& .MuiDataGrid-columnSeparator": {
                    color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                    "&:hover": {
                      color: STYLE_GUIDE?.COLORS?.primary || "#5c6bc0",
                    },
                  },
                },
                "& .MuiDataGrid-cell": {
                  backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
                  color: STYLE_GUIDE?.COLORS?.black || "#000000",
                  borderBottom: `1px solid ${
                    STYLE_GUIDE?.COLORS?.divider || "#e0e0e0"
                  }`,
                  borderRight: "none",
                  outline: "none",
                  "&:focus, &:focus-within": {
                    outline: "none",
                  },
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor:
                    STYLE_GUIDE?.COLORS?.backgroundDefault || "#f1f5f9",
                },
                "& .MuiDataGrid-footerContainer": {
                  backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
                  borderTop: `1px solid ${
                    STYLE_GUIDE?.COLORS?.divider || "#e0e0e0"
                  }`,
                  color: STYLE_GUIDE?.COLORS?.black || "#000000",
                },
              }}
            />
          ) : (
            <Typography>No data available</Typography>
          )}
        </CardContent>
      </Card>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
            borderRadius: "8px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
            p: 3,
            width: "600px",
            maxWidth: "90%",
            maxHeight: "600px",
            overflowY: "auto",
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 2, color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5" }}
          >
            {modalMode === "add"
              ? "Add Notification"
              : modalMode === "edit"
              ? "Edit Notification"
              : modalMode === "view"
              ? "View Notification"
              : "Filter Notifications"}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
            }}
          >
            {renderModalFields()}
          </Box>
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}
          >
            <Button
              variant="outlined"
              onClick={handleCloseModal}
              sx={{
                borderRadius: "8px",
                borderColor: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
                color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
              }}
            >
              Cancel
            </Button>
            {modalMode !== "view" && (
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  borderRadius: "8px",
                  backgroundColor:
                    STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                  color: STYLE_GUIDE?.COLORS?.white || "#ffffff",
                  "&:hover": {
                    backgroundColor: STYLE_GUIDE?.COLORS?.primary || "#5c6bc0",
                  },
                }}
              >
                {modalMode === "filter" ? "Apply" : "Save"}
              </Button>
            )}
          </Box>
        </Box>
      </Modal>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "8px",
            backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
          },
        }}
      >
        <DialogTitle
          sx={{ color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5" }}
        >
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the notification with ID {deleteId}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            sx={{
              borderRadius: "8px",
              color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
            }}
          >
            No
          </Button>
          <Button
            onClick={handleConfirmDelete}
            sx={{
              borderRadius: "8px",
              backgroundColor: STYLE_GUIDE?.COLORS?.error || "#d32f2f",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: STYLE_GUIDE?.COLORS?.error || "#b71c1c",
              },
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}