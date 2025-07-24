// "use client";

// import * as React from 'react';
// import { useState } from 'react';
// import { DataGrid, GridColDef } from '@mui/x-data-grid';
// import { Box, Card, CardContent, Typography, TextField, Button, InputAdornment, Modal, Grid, FormControlLabel, Checkbox, Tooltip } from '@mui/material';
// import { useForm, Controller } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// // import { useRouter } from 'next/navigation';
// import { useDispatch } from 'react-redux';

// import SearchIcon from '@mui/icons-material/Search';
// import FilterListIcon from '@mui/icons-material/FilterList';
// import AddIcon from '@mui/icons-material/Add';
// import EditIcon from '@mui/icons-material/Edit';
// import VisibilityIcon from '@mui/icons-material/Visibility';
// import DeleteIcon from '@mui/icons-material/Delete';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import { STYLE_GUIDE } from '../../styles';

// // Zod schema for form validation
// const roleSchema = z.object({
//   name: z.string().min(1, 'Name is required'),
// });

// type RoleFormValues = z.infer<typeof roleSchema>;

// // DataGrid columns
// const columns: GridColDef[] = [
//   { field: 'id', headerName: 'ID', width: 70, disableColumnMenu: true, resizable: true },
//   { field: 'name', headerName: 'Name', width: 130, disableColumnMenu: true, resizable: true },
//   {
//     field: 'actions',
//     headerName: 'Actions',
//     width: 150,
//     disableColumnMenu: true,
//     sortable: false,
//     resizable: false,
//     renderCell: (params) => (
//       <Box sx={{ display: 'flex', gap: 1 }}>
//         <Tooltip title="Edit" arrow>
//           <Button
//             variant="text"
//             onClick={() => params.row.handleEdit(params.row)}
//             sx={{ minWidth: 'auto', color: STYLE_GUIDE?.COLORS?.primaryDark || '#3f51b5' }}
//           >
//             <EditIcon />
//           </Button>
//         </Tooltip>
//         <Tooltip title="View" arrow>
//           <Button
//             variant="text"
//             onClick={() => params.row.handleView(params.row)}
//             sx={{ minWidth: 'auto', color: STYLE_GUIDE?.COLORS?.primaryDark || '#3f51b5' }}
//           >
//             <VisibilityIcon />
//           </Button>
//         </Tooltip>
//         <Tooltip title="Delete" arrow>
//           <Button
//             variant="text"
//             onClick={() => params.row.handleDelete(params.row.id)}
//             sx={{ minWidth: 'auto', color: STYLE_GUIDE?.COLORS?.error || '#d32f2f' }}
//           >
//             <DeleteIcon />
//           </Button>
//         </Tooltip>
//       </Box>
//     ),
//   },
// ];

// // Sample permissions data (from provided JSON)
// const samplePermissions = [
//   { "_id": "679d0315cf6d35d7fefa1bb0", "name": "Create User", "resource": "POST:/user/create", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bb1", "name": "List User", "resource": "GET:/user/list", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bb2", "name": "Get User", "resource": "GET:/user/:userId", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bb3", "name": "Get Current User", "resource": "GET:/user/getCurrentUser", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bb4", "name": "Update Self User", "resource": "PUT:/user/update", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bb5", "name": "Update User", "resource": "PUT:/user/update/:userId", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bb6", "name": "Delete User", "resource": "DELETE:/user/delete/:userId", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bb7", "name": "Create Role", "resource": "POST:/role/create", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bb8", "name": "List Role", "resource": "GET:/role/list", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bb9", "name": "Get Role", "resource": "GET:/role/:id", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bba", "name": "Delete Role", "resource": "DELETE:/role/delete", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bbb", "name": "Update Role", "resource": "PUT:/role/update/:id", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bbc", "name": "Create Organization", "resource": "POST:/organization/create", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bbd", "name": "List Organization", "resource": "GET:/organization/list", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bbe", "name": "Get Organization", "resource": "GET:/organization/:id", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bbf", "name": "Update Organization", "resource": "PUT:/organization/update/:id", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bc0", "name": "Delete Organization", "resource": "DELETE:/organization/delete", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bc1", "name": "Create Doc Type", "resource": "POST:/doc/type/create", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bc2", "name": "List Doc Type", "resource": "GET:/doc/type/list", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bc3", "name": "List Doc Type Meta", "resource": "GET:/doc/type/list/meta", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bc4", "name": "List Priority for Doc Types", "resource": "GET:/doc/type/list-priority", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bc5", "name": "Get Doc", "resource": "GET:/doc/type/:id", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bc6", "name": "Type Doc", "resource": "PUT:/doc/type/update/:id", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bc7", "name": "Update Priority for Doc Types", "resource": "PUT:/doc/type/update-priority", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bc8", "name": "Delete Doc Type", "resource": "DELETE:/doc/type/delete", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bc9", "name": "Duplicate Doc Type", "resource": "POST:/doc/type/duplicate", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bca", "name": "Create Doc Category", "resource": "POST:/doc/category/create", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bcb", "name": "List Doc Category", "resource": "GET:/doc/category/list", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bcc", "name": "Get Doc Category", "resource": "GET:/doc/category/:id", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bcd", "name": "Update Doc Category", "resource": "PUT:/doc/category/update/:id", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bce", "name": "Delete Doc Category", "resource": "DELETE:/doc/category/delete", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bcf", "name": "Export Doc Type", "resource": "GET:/doc/doc-type-export", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bd0", "name": "Import Doc Type", "resource": "POST:/doc/doc-type-import", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bd1", "name": "Create Job", "resource": "POST:/job/create", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bd2", "name": "List Job", "resource": "GET:/job/list", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bd3", "name": "Get Job Captured Data", "resource": "GET:/job/docs/:jobId", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bd4", "name": "Get Job Reference File", "resource": "PUT:/job/reference-file/:jobId", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bd5", "name": "Get Job Reference Data", "resource": "GET:/job/get-reference/:jobId", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bd6", "name": "Download Job Data", "resource": "GET:/job/download-excel/:jobId", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bd7", "name": "Get Job Matched Reference Data", "resource": "GET:/job/matched-reference/:jobId", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bd8", "name": "Get Job", "resource": "GET:/job/:jobId", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bd9", "name": "List Validator Operators", "resource": "GET:/validator/operators", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bda", "name": "Process Excel for Validator", "resource": "POST:/validator/process-excel", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bdb", "name": "Create Validator", "resource": "POST:/validator/create", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bdc", "name": "List Validator", "resource": "GET:/validator/list", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bdd", "name": "Get Validator", "resource": "GET:/validator/:id", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bde", "name": "Update Validator", "resource": "PUT:/validator/update/:id", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1bdf", "name": "Validation", "resource": "POST:/validator/validate-file/:validatorId", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1be0", "name": "Download Validation Data", "resource": "POST:/validator/validate-file-download/:validatorId", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1be1", "name": "Delete Validator", "resource": "DELETE:/validator/delete/:validatorId", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1be2", "name": "Create Permission", "resource": "POST:/user/permission/create", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1be3", "name": "List Permission", "resource": "GET:/user/permission/list", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1be4", "name": "Update Permission", "resource": "PUT:/user/permission/update/:id", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1be5", "name": "Get Permission", "resource": "DELETE:/user/permission/delete/:id", "allowed": true },
//   { "_id": "679d0315cf6d35d7fefa1be6", "name": "Get Permission by role", "resource": "GET:/user/permission/:roleId", "allowed": true },
//   { "_id": "679f6343cf6d35d7fefa1c65", "name": "Download Validation Data", "resource": "GET:/validator/validate-file-download/:validationId", "allowed": true },
//   { "_id": "67bc5cb45bd79225d7801077", "name": "Create Text Conversion Job", "resource": "POST:/job/create-text-conversion", "allowed": true },
//   { "_id": "67ea60eba4d0ccbb7ca28b27", "name": "Create Attribute", "resource": "POST:/attribute/create", "allowed": true },
//   { "_id": "67ea60eba4d0ccbb7ca28b28", "name": "List Attribute", "resource": "GET:/attribute/list", "allowed": true },
//   { "_id": "67ea60eba4d0ccbb7ca28b29", "name": "Update Attribute", "resource": "PUT:/attribute/update/:id", "allowed": true },
//   { "_id": "67ea60eba4d0ccbb7ca28b2a", "name": "Get Attribute", "resource": "GET:/attribute/:id", "allowed": true },
//   { "_id": "67ea60eba4d0ccbb7ca28b2b", "name": "Search Attribute", "resource": "GET:/attribute/search", "allowed": true },
//   { "_id": "67ea60eba4d0ccbb7ca28b2c", "name": "Delete Attribute", "resource": "DELETE:/attribute/delete", "allowed": true },
//   { "_id": "67ea60eba4d0ccbb7ca28b2d", "name": "Update Doc Captured Attribute", "resource": "PUT:/doc/update-attribute/:docId", "allowed": true },
//   { "_id": "67ea60eba4d0ccbb7ca28b2e", "name": "List Doc Update History", "resource": "GET:/doc/list-update-history/:docId", "allowed": true },
// ];

// // Sample row data with permissions
// const rows: RoleRow[] = [
//   { id: 1, name: 'Admin', permissions: { user: { "Create User": true, "List User": true }, role: { "Create Role": true } } },
//   { id: 2, name: 'Editor', permissions: { user: { "List User": true }, role: { "List Role": true } } },
//   { id: 3, name: 'Viewer', permissions: { user: { "Get User": true } } },
//   { id: 4, name: 'Manager', permissions: { user: { "Create User": true, "Update User": true }, role: { "List Role": true } } },
// ].map((row) => ({
//   ...row,
//   handleEdit: (rowData: RoleRow) => rowData,
//   handleView: (rowData: RoleRow) => rowData,
//   handleDelete: (id: number) => id,
// }));

// type RoleRow = {
//   id: number;
//   name: string | null;
//   permissions: Record<string, Record<string, boolean>> | null;
//   handleEdit?: (rowData: RoleRow) => void;
//   handleView?: (rowData: RoleRow) => void;
//   handleDelete?: (id: number) => void;
// };

// const paginationModel = { page: 0, pageSize: 10 };

// export default function Roles() {
// //   const router = useRouter();
//   const dispatch = useDispatch();

//   // Group permissions by resource category
//   const initialPermissions = samplePermissions.reduce((acc, perm) => {
//     const category = perm.resource.split('/')[1]; // e.g., 'user' from 'POST:/user/create'
//     if (!acc[category]) {
//       acc[category] = {};
//     }
//     acc[category][perm.name] = false; // Initialize unchecked
//     return acc;
//   }, {} as Record<string, Record<string, boolean>>);

//   const [selectedPermissions, setSelectedPermissions] = useState(initialPermissions);
//   const [openModal, setOpenModal] = useState(false);
//   const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | 'filter' | null>(null);
//   const [deleteId, setDeleteId] = useState<number | null>(null);
//   const [searchValue, setSearchValue] = useState('');

//   const { control, handleSubmit, reset, formState: { errors } } = useForm<RoleFormValues>({
//     resolver: zodResolver(roleSchema),
//     defaultValues: {
//       name: '',
//     },
//   });

//   const handleEdit = (row: RoleRow) => {
//     reset({
//       name: row.name || '',
//     });
//     setSelectedPermissions(row.permissions || initialPermissions);
//     setModalMode('edit');
//     setOpenModal(true);
//   };

//   const handleView = (row: RoleRow) => {
//     reset({
//       name: row.name || '',
//     });
//     setSelectedPermissions(row.permissions || initialPermissions);
//     setModalMode('view');
//     setOpenModal(true);
//   };

//   const handleDelete = (id: number) => {
//     setDeleteId(id);
//     setModalMode('delete');
//     setOpenModal(true);
//   };

//   const handleAddUser = () => {
//     reset({ name: '' });
//     setSelectedPermissions(initialPermissions);
//     setModalMode('add');
//     setOpenModal(true);
//   };

//   const handleFilter = () => {
//     reset({ name: '' });
//     setSelectedPermissions(initialPermissions);
//     setModalMode('filter');
//     setOpenModal(true);
//   };

//   const handleCloseModal = () => {
//     setOpenModal(false);
//     setModalMode(null);
//     setDeleteId(null);
//     reset();
//     setSelectedPermissions(initialPermissions);
//   };

//   const handleConfirmDelete = () => {
//     console.log(`Deleting role with ID: ${deleteId}`);
//     // Implement actual delete logic here
//     handleCloseModal();
//   };

//   const handleCheckboxChange = (category: string, action: string) => {
//     setSelectedPermissions((prev) => ({
//       ...prev,
//       [category]: {
//         ...prev[category],
//         [action]: !prev[category][action],
//       },
//     }));
//   };

//   const onSubmit = (data: RoleFormValues) => {
//     if (modalMode === 'filter') {
//       console.log('Applying filter:', { name: data.name, permissions: selectedPermissions });
//       // Implement filter logic here
//       handleCloseModal();
//       return;
//     }

//     const selectedPermissionIds: string[] = [];
//     Object.keys(selectedPermissions).forEach((category) => {
//       Object.keys(selectedPermissions[category]).forEach((action) => {
//         if (selectedPermissions[category][action]) {
//           const perm = samplePermissions.find((p) => p.name === action && p.resource.includes(category));
//           if (perm) {
//             selectedPermissionIds.push(perm._id);
//           }
//         }
//       });
//     });

//     // const requestData = {
//     //   name: data.name,
//     //   permissionIds: selectedPermissionIds,
//     //   router,
//     // };

//     // if (modalMode === 'add') {
//     //   dispatch(createRoleRequest(requestData));
//     // } else if (modalMode === 'edit') {
//     //   console.log('Editing role:', requestData);
//     //   // Implement edit logic here
//     // }
//     handleCloseModal();
//   };

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setSearchValue(value);
//     console.log(`Search value: ${value}`);
//     // Implement search logic here
//   };

//   return (
//     <Box
//       sx={{
//         flexGrow: 1,
//         p: 3,
//         ml: { xs: 0 },
//         backgroundColor: STYLE_GUIDE?.COLORS?.backgroundLight || '#f5f5f5',
//         minHeight: '100vh',
//       }}
//     >
//       <Typography
//         variant="h4"
//         sx={{
//           mb: 3,
//           fontWeight: 400,
//           color: STYLE_GUIDE?.COLORS?.primaryDark || '#3f51b5',
//         }}
//       >
//         Roles
//       </Typography>

//       <Card
//         sx={{
//           backgroundColor: STYLE_GUIDE?.COLORS?.white || '#ffffff',
//           boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
//           borderRadius: '8px',
//           overflow: 'visible',
//         }}
//       >
//         <CardContent sx={{ p: 3 }}>
//           <Box
//             sx={{
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               mb: 2,
//             }}
//           >
//             <TextField
//               placeholder="Search roles..."
//               variant="outlined"
//               size="small"
//               value={searchValue}
//               onChange={handleSearchChange}
//               sx={{
//                 width: '300px',
//                 '& .MuiOutlinedInput-root': {
//                   borderRadius: '8px',
//                   backgroundColor: STYLE_GUIDE?.COLORS?.white || '#ffffff',
//                   '& fieldset': {
//                     borderColor: STYLE_GUIDE?.COLORS?.divider || '#e0e0e0',
//                   },
//                   '&:hover fieldset': {
//                     borderColor: STYLE_GUIDE?.COLORS?.primaryDark || '#3f51b5',
//                   },
//                 },
//               }}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <SearchIcon sx={{ color: STYLE_GUIDE?.COLORS?.primaryDark || '#3f51b5' }} />
//                   </InputAdornment>
//                 ),
//               }}
//             />
//             <Box sx={{ display: 'flex', gap: 1 }}>
//               <Button
//                 variant="outlined"
//                 startIcon={<FilterListIcon />}
//                 onClick={handleFilter}
//                 sx={{
//                   borderRadius: '8px',
//                   borderColor: STYLE_GUIDE?.COLORS?.divider || '#e0e0e0',
//                   color: STYLE_GUIDE?.COLORS?.primaryDark || '#3f51b5',
//                   '&:hover': {
//                     backgroundColor: STYLE_GUIDE?.COLORS?.backgroundDefault || '#f1f5f9',
//                     borderColor: STYLE_GUIDE?.COLORS?.primaryDark || '#3f51b5',
//                   },
//                 }}
//               >
//                 Filter
//               </Button>
//               <Button
//                 variant="contained"
//                 startIcon={<AddIcon />}
//                 onClick={handleAddUser}
//                 sx={{
//                   borderRadius: '8px',
//                   backgroundColor: STYLE_GUIDE?.COLORS?.primaryDark || '#3f51b5',
//                   color: STYLE_GUIDE?.COLORS?.white || '#ffffff',
//                   '&:hover': {
//                     backgroundColor: STYLE_GUIDE?.COLORS?.primary || '#5c6bc0',
//                   },
//                 }}
//               >
//                 Add Roles
//               </Button>
//             </Box>
//           </Box>

//           <DataGrid
//             rows={rows.map((row) => ({
//               ...row,
//               handleEdit,
//               handleView,
//               handleDelete,
//             }))}
//             columns={columns}
//             initialState={{ pagination: { paginationModel } }}
//             pageSizeOptions={[5, 10]}
//             disableColumnMenu
//             sx={{
//               border: 0,
//               backgroundColor: STYLE_GUIDE?.COLORS?.white || '#ffffff',
//               overflow: 'visible',
//               '& .MuiDataGrid-columnHeaders': {
//                 backgroundColor: STYLE_GUIDE?.COLORS?.backgroundLight || '#f5f5f5',
//                 color: STYLE_GUIDE?.COLORS?.black || '#000000',
//                 fontWeight: 600,
//                 fontSize: '1rem',
//                 position: 'relative',
//                 zIndex: 1,
//               },
//               '& .MuiDataGrid-columnHeaderTitle': {
//                 fontWeight: 600,
//                 color: STYLE_GUIDE?.COLORS?.black || '#000000',
//               },
//               '& .MuiDataGrid-columnHeader': {
//                 outline: 'none',
//                 '&:focus, &:focus-within': {
//                   outline: 'none',
//                 },
//                 '& .MuiDataGrid-columnSeparator': {
//                   color: STYLE_GUIDE?.COLORS?.primaryDark || '#3f51b5',
//                   '&:hover': {
//                     color: STYLE_GUIDE?.COLORS?.primary || '#5c6bc0',
//                   },
//                 },
//               },
//               '& .MuiDataGrid-cell': {
//                 backgroundColor: STYLE_GUIDE?.COLORS?.white || '#ffffff',
//                 color: STYLE_GUIDE?.COLORS?.black || '#000000',
//                 borderBottom: `1px solid ${STYLE_GUIDE?.COLORS?.divider || '#e0e0e0'}`,
//                 borderRight: 'none',
//                 outline: 'none',
//                 '&:focus, &:focus-within': {
//                   outline: 'none',
//                 },
//               },
//               '& .MuiDataGrid-row:hover': {
//                 backgroundColor: STYLE_GUIDE?.COLORS?.backgroundDefault || '#f1f5f9',
//               },
//               '& .MuiDataGrid-footerContainer': {
//                 backgroundColor: STYLE_GUIDE?.COLORS?.white || '#ffffff',
//                 borderTop: `1px solid ${STYLE_GUIDE?.COLORS?.divider || '#e0e0e0'}`,
//                 color: STYLE_GUIDE?.COLORS?.black || '#000000',
//               },
//             }}
//           />
//         </CardContent>
//       </Card>

//       <Modal
//         open={openModal}
//         onClose={handleCloseModal}
//         sx={{
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}
//       >
//         <Box
//           sx={{
//             backgroundColor: STYLE_GUIDE?.COLORS?.white || '#ffffff',
//             borderRadius: '8px',
//             boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
//             p: 3,
//             width: '600px',
//             maxWidth: '90%',
//             maxHeight: '80vh',
//             overflowY: 'auto',
//           }}
//         >
//           {modalMode === 'delete' ? (
//             <>
//               <Typography variant="h6" sx={{ mb: 2, color: STYLE_GUIDE?.COLORS?.primaryDark || '#3f51b5' }}>
//                 Confirm Delete
//               </Typography>
//               <Typography>
//                 Are you sure you want to delete the role with ID {deleteId}?
//               </Typography>
//               <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
//                 <Button
//                   onClick={handleCloseModal}
//                   sx={{
//                     borderRadius: '8px',
//                     color: STYLE_GUIDE?.COLORS?.primaryDark || '#3f51b5',
//                   }}
//                 >
//                   No
//                 </Button>
//                 <Button
//                   onClick={handleConfirmDelete}
//                   sx={{
//                     borderRadius: '8px',
//                     backgroundColor: STYLE_GUIDE?.COLORS?.error || '#d32f2f',
//                     color: STYLE_GUIDE?.COLORS?.white || '#ffffff',
//                     '&:hover': {
//                       backgroundColor: STYLE_GUIDE?.COLORS?.errorDark || '#b71c1c',
//                     },
//                   }}
//                 >
//                   Yes
//                 </Button>
//               </Box>
//             </>
//           ) : (
//             <>
//               <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                 <Button
//                   startIcon={<ArrowBackIcon />}
//                 //   onClick={() => router.push('/role')}
//                   sx={{
//                     mr: 2,
//                     color: STYLE_GUIDE?.COLORS?.primaryDark || '#3f51b5',
//                   }}
//                 >
//                   {/* Back */}
//                 </Button>
//                 <Typography variant="h6" sx={{ color: STYLE_GUIDE?.COLORS?.primaryDark || '#3f51b5' }}>
//                   {modalMode === 'add' ? 'Add Role' :
//                    modalMode === 'edit' ? 'Edit Role' :
//                    modalMode === 'view' ? 'View Role' : 'Filter Roles'}
//                 </Typography>
//               </Box>
//               <form onSubmit={handleSubmit(onSubmit)}>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12}>
//                     <Controller
//                       name="name"
//                       control={control}
//                       render={({ field }) => (
//                         <TextField
//                           {...field}
//                           label="Name"
//                           variant="outlined"
//                           fullWidth
//                           disabled={modalMode === 'view'}
//                           error={!!errors.name}
//                           helperText={errors.name?.message}
//                           sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
//                         />
//                       )}
//                     />
//                   </Grid>
//                   {modalMode !== 'filter' && (
//                     <Grid item xs={12}>
//                       <Typography variant="subtitle1" sx={{ mb: 2, mt: 2, color: STYLE_GUIDE?.COLORS?.primaryDark || '#3f51b5' }}>
//                         Permissions
//                       </Typography>
//                       {Object.keys(selectedPermissions).map((category) => (
//                         <Box key={category} sx={{ border: `1px solid ${STYLE_GUIDE?.COLORS?.divider || '#e0e0e0'}`, p: 2, borderRadius: '8px', mb: 2 }}>
//                           <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
//                             {category.charAt(0).toUpperCase() + category.slice(1)}
//                           </Typography>
//                           <Grid container spacing={2}>
//                             {Object.keys(selectedPermissions[category]).map((action) => (
//                               <Grid item xs={12} sm={4} key={action}>
//                                 <FormControlLabel
//                                   control={
//                                     <Checkbox
//                                       checked={selectedPermissions[category][action]}
//                                       onChange={() => handleCheckboxChange(category, action)}
//                                       disabled={modalMode === 'view'}
//                                       sx={{
//                                         color: STYLE_GUIDE?.COLORS?.primaryDark || '#3f51b5',
//                                         '&.Mui-checked': {
//                                           color: STYLE_GUIDE?.COLORS?.primaryDark || '#3f51b5',
//                                         },
//                                       }}
//                                     />
//                                   }
//                                   label={action}
//                                 />
//                               </Grid>
//                             ))}
//                           </Grid>
//                         </Box>
//                       ))}
//                     </Grid>
//                   )}
//                 </Grid>
//                 <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
//                   <Button
//                     variant="outlined"
//                     onClick={handleCloseModal}
//                     sx={{
//                       borderRadius: '8px',
//                       borderColor: STYLE_GUIDE?.COLORS?.divider || '#e0e0e0',
//                       color: STYLE_GUIDE?.COLORS?.primaryDark || '#3f51b5',
//                     }}
//                   >
//                     Cancel
//                   </Button>
//                   {modalMode !== 'view' && (
//                     <Button
//                       type="submit"
//                       variant="contained"
//                       sx={{
//                         borderRadius: '8px',
//                         backgroundColor: STYLE_GUIDE?.COLORS?.primaryDark || '#3f51b5',
//                         color: STYLE_GUIDE?.COLORS?.white || '#ffffff',
//                         '&:hover': {
//                           backgroundColor: STYLE_GUIDE?.COLORS?.primary || '#5c6bc0',
//                         },
//                       }}
//                     >
//                       {modalMode === 'filter' ? 'Apply' : 'Save'}
//                     </Button>
//                   )}
//                 </Box>
//               </form>
//             </>
//           )}
//         </Box>
//       </Modal>
//     </Box>
//   );
// }

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
//   Chip,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
// } from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search";
// import FilterListIcon from "@mui/icons-material/FilterList";
// import AddIcon from "@mui/icons-material/Add";
// import EditIcon from "@mui/icons-material/Edit";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import DeleteIcon from "@mui/icons-material/Delete";
// import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
// import useGet from "../../hooks/useGet";
// import usePost from "../../hooks/usePost";
// import usePut from "../../hooks/usePut";
// import useDelete from "../../hooks/useDelete";
// import { CustomPagination } from "../../components/common/pagination/customPagination";
// import { DELETE, GET, POST, PUT } from "../../services/apiRoutes";
// import { useSelector } from "react-redux";
// import { RootState } from "../../reducers";

// // Define types
// interface Role {
//   _id: string;
//   organizationId: string;
//   name: string;
//   status: string;
// }

// interface ApiResponse {
//   success: boolean;
//   data: Role[];
//   totalCount: number;
// }

// interface RolePostPayload {
//   name: string;
//   organizationId: string;
//   status: string;
// }

// interface RolePostResponse {
//   success: boolean;
//   data: Role;
// }

// const columns: GridColDef[] = [
//   {
//     field: "organizationId",
//     headerName: "Organization ID",
//     width: 150,
//     disableColumnMenu: true,
//     resizable: true,
//   },
//   {
//     field: "name",
//     headerName: "Name",
//     width: 150,
//     disableColumnMenu: true,
//     resizable: true,
//   },
//   {
//     field: "status",
//     headerName: "Status",
//     width: 100,
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
//     width: 150,
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
//             <EditIcon />
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

// export default function Roles() {
//   const theme = useUnifiedTheme();
//   const [openModal, setOpenModal] = useState(false);
//   const [modalMode, setModalMode] = useState<
//     "add" | "edit" | "view" | "filter" | null
//   >(null);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [deleteId, setDeleteId] = useState<string | null>(null);
//   const [searchValue, setSearchValue] = useState("");
//   const [paginationModel, setPaginationModel] = useState({
//     page: 0,
//     pageSize: 10,
//   });
//   const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
//   const [roleReload, setRoleReload] = useState(false);
//   const [filterValues, setFilterValues] = useState({
//     name: "",
//     organizationId: "",
//     status: "",
//   });

//   const { currentUser } = useSelector(
//     (state: RootState) => state.userPermission
//   );
//   console.log("Data Source:", currentUser.permissionIds);

//   // Form data for modal
//   const [formData, setFormData] = useState({
//     id: "",
//     name: "",
//     organizationId: "",
//     status: "",
//   });

//   // Debounce search input
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedSearchValue(searchValue);
//     }, 500);
//     return () => {
//       clearTimeout(handler);
//     };
//   }, [searchValue]);

//   // API call for listing roles
//   const perPageItem = paginationModel.pageSize;
//   const roleList = useGet<ApiResponse>(
//     [
//       "roleList",
//       String(paginationModel.page + 1),
//       debouncedSearchValue,
//       String(roleReload),
//       filterValues.name,
//       filterValues.organizationId,
//       filterValues.status,
//     ],
//     `${GET.ROLE_LIST}?page=${paginationModel.page + 1}&limit=${perPageItem}&search=${encodeURIComponent(debouncedSearchValue)}&name=${encodeURIComponent(filterValues.name)}&organizationId=${encodeURIComponent(filterValues.organizationId)}&status=${encodeURIComponent(filterValues.status)}`,
//     true
//   );

//   // POST API for creating a role
//   const createRole = usePost<RolePostPayload, RolePostResponse>(
//     ["createRole"],
//     (data) => {
//       if (data?.success) {
//         setRoleReload(true);
//         handleCloseModal();
//       }
//     },
//     true
//   );

//   // PUT API for updating a role
//   const updateRole = usePut<RolePostPayload, RolePostResponse>(
//     ["updateRole"],
//     (data) => {
//       if (data?.success) {
//         setRoleReload(true);
//         handleCloseModal();
//       }
//     },
//     true
//   );

//   // DELETE API for deleting a role
//   const deleteRole = useDelete<null, RolePostResponse>(
//     ["deleteRole"],
//     (data) => {
//       if (data?.success) {
//         setRoleReload(true);
//         handleCloseDialog();
//       }
//     },
//     true
//   );

//   // Reset roleReload after listing is fetched
//   useEffect(() => {
//     if (roleList?.data && roleReload) {
//       setRoleReload(false);
//     }
//   }, [roleList, roleReload]);

//   // Process API data for DataGrid
//   const rolesWithIds =
//     Array.isArray(roleList?.data?.data) && roleList.data.data.length > 0
//       ? roleList.data.data.map((role) => ({
//           ...role,
//           id: role._id || `temp-${Math.random().toString(36).substr(2, 9)}`,
//         }))
//       : [];

//   const handleEdit = (row: Role) => {
//     setFormData({
//       id: row._id || "",
//       name: row.name || "",
//       organizationId: row.organizationId || "",
//       status: row.status || "",
//     });
//     setModalMode("edit");
//     setOpenModal(true);
//   };

//   const handleView = (row: Role) => {
//     setFormData({
//       id: row._id || "",
//       name: row.name || "",
//       organizationId: row.organizationId || "",
//       status: row.status || "",
//     });
//     setModalMode("view");
//     setOpenModal(true);
//   };

//   const handleDelete = (id: string) => {
//     if (id) {
//       setDeleteId(id);
//       setOpenDialog(true);
//     }
//   };

//   const handleAddRole = () => {
//     setFormData({
//       id: "",
//       name: "",
//       organizationId: "",
//       status: "",
//     });
//     setModalMode("add");
//     setOpenModal(true);
//   };

//   const handleFilter = () => {
//     setFormData({
//       id: "",
//       name: filterValues.name,
//       organizationId: filterValues.organizationId,
//       status: filterValues.status,
//     });
//     setModalMode("filter");
//     setOpenModal(true);
//   };

//   const handleCloseModal = () => {
//     setOpenModal(false);
//     setModalMode(null);
//     setFormData({
//       id: "",
//       name: "",
//       organizationId: "",
//       status: "",
//     });
//   };

//   const handleCloseDialog = () => {
//     setOpenDialog(false);
//     setDeleteId(null);
//   };

//   const handleConfirmDelete = async () => {
//     if (deleteId) {
//       try {
//         await deleteRole.mutate({
//           url: `${DELETE.DELETE_ROLE}/${deleteId}`,
//           payload: null,
//         });
//       } catch (error) {
//         console.error("Error deleting role:", error);
//       }
//     }
//   };

//   const handleResetFilter = () => {
//     setFormData({
//       id: "",
//       name: "",
//       organizationId: "",
//       status: "",
//     });
//   };

//   const handleApplyFilter = () => {
//     setFilterValues({
//       name: formData.name,
//       organizationId: formData.organizationId,
//       status: formData.status,
//     });
//     setPaginationModel({ ...paginationModel, page: 0 });
//     handleCloseModal();
//   };

//   const handleSave = async () => {
//     try {
//       if (modalMode === "add") {
//         await createRole.mutate({
//           url: `${POST.CREATE_ROLE}`,
//           payload: {
//             name: formData.name,
//             organizationId: formData.organizationId,
//             status: formData.status,
//           },
//         });
//       } else if (modalMode === "edit") {
//         await updateRole.mutate({
//           url: `${PUT.UPDATE_ROLE}/${formData.id}`,
//           payload: {
//             name: formData.name,
//             organizationId: formData.organizationId,
//             status: formData.status,
//           },
//         });
//       } else if (modalMode === "filter") {
//         handleApplyFilter();
//       }
//     } catch (error) {
//       console.error("Error saving role:", error);
//     }
//   };

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
//         Roles
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
//             {/* Search Bar */}
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

//             {/* Filter and Add Buttons */}
//             <Box sx={{ display: "flex", gap: 1 }}>
//               <Button
//                 variant="outlined"
//                 startIcon={<FilterListIcon />}
//                 onClick={handleFilter}
//                 sx={{
//                   borderRadius: "8px",
//                 }}
//               >
//                 Filter
//               </Button>
//               <Button
//                 variant="contained"
//                 startIcon={<AddIcon />}
//                 onClick={handleAddRole}
//                 sx={{
//                   borderRadius: "8px",
//                 }}
//               >
//                 Add
//               </Button>
//             </Box>
//           </Box>

//           {/* Table */}
//           <DataGrid
//             rows={rolesWithIds.map((role) => ({
//               ...role,
//               handleEdit,
//               handleView,
//               handleDelete,
//             }))}
//             columns={columns}
//             initialState={{ pagination: { paginationModel } }}
//             pageSizeOptions={[5, 10, 20]}
//             disableColumnMenu
//             sx={{
//               overflow: "visible",
//             }}
//             loading={
//               roleList.isLoading ||
//               createRole.isLoading ||
//               updateRole.isLoading ||
//               deleteRole.isLoading
//             }
//             rowCount={roleList?.data?.totalCount || 0}
//             paginationModel={paginationModel}
//             onPaginationModelChange={setPaginationModel}
//             slots={{
//               pagination: () => (
//                 <CustomPagination
//                   paginationModel={paginationModel}
//                   setPaginationModel={setPaginationModel}
//                   rowCount={roleList?.data?.totalCount || 0}
//                 />
//               ),
//             }}
//           />
//         </CardContent>
//       </Card>

//       {/* Modal for Add/Edit/View/Filter */}
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
//             backgroundColor: theme.palette.background.paper,
//             borderRadius: "8px",
//             p: 3,
//             width: "500px",
//             maxWidth: "90%",
//             maxHeight: "90vh",
//             overflow: "auto",
//           }}
//         >
//           <Typography variant="h6" sx={{ mb: 2 }}>
//             {modalMode === "add"
//               ? "Add Role"
//               : modalMode === "edit"
//                 ? "Edit Role"
//                 : modalMode === "view"
//                   ? "View Role"
//                   : "Filter Roles"}
//           </Typography>

//           <Box
//             sx={{
//               display: "grid",
//               gridTemplateColumns: "1fr",
//               gap: 2,
//             }}
//           >
//             <TextField
//               label="Name"
//               value={formData.name}
//               onChange={(e) =>
//                 setFormData({ ...formData, name: e.target.value })
//               }
//               disabled={modalMode === "view"}
//               variant="outlined"
//               fullWidth
//               required={modalMode === "add" || modalMode === "edit"}
//               sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
//             />
//             <TextField
//               label="Organization ID"
//               value={formData.organizationId}
//               onChange={(e) =>
//                 setFormData({ ...formData, organizationId: e.target.value })
//               }
//               disabled={modalMode === "view"}
//               variant="outlined"
//               fullWidth
//               required={modalMode === "add" || modalMode === "edit"}
//               sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
//             />
//             {(modalMode === "add" ||
//               modalMode === "edit" ||
//               modalMode === "view") && (
//               <FormControl
//                 fullWidth
//                 sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
//               >
//                 <InputLabel>Status</InputLabel>
//                 <Select
//                   value={formData.status}
//                   onChange={(e) =>
//                     setFormData({ ...formData, status: e.target.value })
//                   }
//                   disabled={modalMode === "view"}
//                   label="Status"
//                   required={modalMode === "add" || modalMode === "edit"}
//                 >
//                   <MenuItem value="active">Active</MenuItem>
//                   <MenuItem value="inactive">Inactive</MenuItem>
//                 </Select>
//               </FormControl>
//             )}
//             {modalMode === "filter" && (
//               <FormControl
//                 fullWidth
//                 sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
//               >
//                 <InputLabel>Status</InputLabel>
//                 <Select
//                   value={formData.status}
//                   onChange={(e) =>
//                     setFormData({ ...formData, status: e.target.value })
//                   }
//                   label="Status"
//                 >
//                   <MenuItem value="">All</MenuItem>
//                   <MenuItem value="active">Active</MenuItem>
//                   <MenuItem value="inactive">Inactive</MenuItem>
//                 </Select>
//               </FormControl>
//             )}
//           </Box>

//           <Box
//             sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}
//           >
//             {modalMode === "filter" ? (
//               <>
//                 <Button
//                   variant="outlined"
//                   onClick={handleResetFilter}
//                   sx={{ borderRadius: "8px" }}
//                 >
//                   Reset
//                 </Button>
//                 <Button
//                   variant="outlined"
//                   onClick={handleCloseModal}
//                   sx={{ borderRadius: "8px" }}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   variant="contained"
//                   onClick={handleSave}
//                   sx={{ borderRadius: "8px" }}
//                   disabled={
//                     !formData.name &&
//                     !formData.organizationId &&
//                     !formData.status &&
//                     !filterValues.name &&
//                     !filterValues.organizationId &&
//                     !filterValues.status
//                   }
//                 >
//                   Apply
//                 </Button>
//               </>
//             ) : (
//               <>
//                 <Button
//                   variant="outlined"
//                   onClick={handleCloseModal}
//                   sx={{ borderRadius: "8px" }}
//                 >
//                   Cancel
//                 </Button>
//                 {modalMode !== "view" && (
//                   <Button
//                     variant="contained"
//                     onClick={handleSave}
//                     sx={{ borderRadius: "8px" }}
//                     disabled={
//                       !formData.name ||
//                       !formData.organizationId ||
//                       !formData.status ||
//                       createRole.isLoading ||
//                       updateRole.isLoading
//                     }
//                   >
//                     Save
//                   </Button>
//                 )}
//               </>
//             )}
//           </Box>
//         </Box>
//       </Modal>

//       {/* Delete Confirmation Dialog */}
//       <Dialog
//         open={openDialog}
//         onClose={handleCloseDialog}
//         sx={{
//           "& .MuiDialog-paper": {
//             borderRadius: "8px",
//           },
//         }}
//       >
//         <DialogTitle>Confirm Delete</DialogTitle>
//         <DialogContent>
//           <Typography>
//             Are you sure you want to delete the role with ID{" "}
//             {deleteId?.slice(-8) || "Unknown"}?
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDialog} sx={{ borderRadius: "8px" }}>
//             No
//           </Button>
//           <Button
//             onClick={handleConfirmDelete}
//             color="error"
//             sx={{ borderRadius: "8px" }}
//             disabled={deleteRole.isLoading}
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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import useGet from "../../hooks/useGet";
import usePost from "../../hooks/usePost";
import usePut from "../../hooks/usePut";
import useDelete from "../../hooks/useDelete";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import { DELETE, GET, POST, PUT } from "../../services/apiRoutes";
import { RootState } from "../../reducers";

// Zod schema for form validation
const roleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
  status: z.enum(["active", "inactive"], { required_error: "Status is required" }),
});

// Define types
interface Role {
  _id: string;
  organizationId: string;
  name: string;
  status: string;
  permissions: string[];
}

interface ApiResponse {
  success: boolean;
  data: Role[];
  totalCount: number;
}

interface RolePostPayload {
  name: string;
  organizationId: string;
  status: string;
  permissionIds: string[];
}

interface RolePostResponse {
  success: boolean;
  data: Role;
}

interface Permission {
  _id: string;
  name: string;
  resource: string;
  allowed: boolean;
}

// Sample permissions data
const samplePermissions: Permission[] = [
  { "_id": "679d0315cf6d35d7fefa1bb0", "name": "Create User", "resource": "POST:/user/create", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bb1", "name": "List User", "resource": "GET:/user/list", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bb2", "name": "Get User", "resource": "GET:/user/:userId", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bb3", "name": "Get Current User", "resource": "GET:/user/getCurrentUser", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bb4", "name": "Update Self User", "resource": "PUT:/user/update", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bb5", "name": "Update User", "resource": "PUT:/user/update/:userId", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bb6", "name": "Delete User", "resource": "DELETE:/user/delete/:userId", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bb7", "name": "Create Role", "resource": "POST:/role/create", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bb8", "name": "List Role", "resource": "GET:/role/list", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bb9", "name": "Get Role", "resource": "GET:/role/:id", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bba", "name": "Delete Role", "resource": "DELETE:/role/delete", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bbb", "name": "Update Role", "resource": "PUT:/role/update/:id", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bbc", "name": "Create Organization", "resource": "POST:/organization/create", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bbd", "name": "List Organization", "resource": "GET:/organization/list", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bbe", "name": "Get Organization", "resource": "GET:/organization/:id", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bbf", "name": "Update Organization", "resource": "PUT:/organization/update/:id", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bc0", "name": "Delete Organization", "resource": "DELETE:/organization/delete", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bc1", "name": "Create Doc Type", "resource": "POST:/doc/type/create", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bc2", "name": "List Doc Type", "resource": "GET:/doc/type/list", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bc3", "name": "List Doc Type Meta", "resource": "GET:/doc/type/list/meta", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bc4", "name": "List Priority for Doc Types", "resource": "GET:/doc/type/list-priority", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bc5", "name": "Get Doc", "resource": "GET:/doc/type/:id", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bc6", "name": "Type Doc", "resource": "PUT:/doc/type/update/:id", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bc7", "name": "Update Priority for Doc Types", "resource": "PUT:/doc/type/update-priority", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bc8", "name": "Delete Doc Type", "resource": "DELETE:/doc/type/delete", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bc9", "name": "Duplicate Doc Type", "resource": "POST:/doc/type/duplicate", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bca", "name": "Create Doc Category", "resource": "POST:/doc/category/create", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bcb", "name": "List Doc Category", "resource": "GET:/doc/category/list", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bcc", "name": "Get Doc Category", "resource": "GET:/doc/category/:id", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bcd", "name": "Update Doc Category", "resource": "PUT:/doc/category/update/:id", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bce", "name": "Delete Doc Category", "resource": "DELETE:/doc/category/delete", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bcf", "name": "Export Doc Type", "resource": "GET:/doc/doc-type-export", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bd0", "name": "Import Doc Type", "resource": "POST:/doc/doc-type-import", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bd1", "name": "Create Job", "resource": "POST:/job/create", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bd2", "name": "List Job", "resource": "GET:/job/list", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bd3", "name": "Get Job Captured Data", "resource": "GET:/job/docs/:jobId", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bd4", "name": "Get Job Reference File", "resource": "PUT:/job/reference-file/:jobId", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bd5", "name": "Get Job Reference Data", "resource": "GET:/job/get-reference/:jobId", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bd6", "name": "Download Job Data", "resource": "GET:/job/download-excel/:jobId", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bd7", "name": "Get Job Matched Reference Data", "resource": "GET:/job/matched-reference/:jobId", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bd8", "name": "Get Job", "resource": "GET:/job/:jobId", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bd9", "name": "List Validator Operators", "resource": "GET:/validator/operators", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bda", "name": "Process Excel for Validator", "resource": "POST:/validator/process-excel", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bdb", "name": "Create Validator", "resource": "POST:/validator/create", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bdc", "name": "List Validator", "resource": "GET:/validator/list", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bdd", "name": "Get Validator", "resource": "GET:/validator/:id", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bde", "name": "Update Validator", "resource": "PUT:/validator/update/:id", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1bdf", "name": "Validation", "resource": "POST:/validator/validate-file/:validatorId", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1be0", "name": "Download Validation Data", "resource": "POST:/validator/validate-file-download/:validatorId", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1be1", "name": "Delete Validator", "resource": "DELETE:/validator/delete/:validatorId", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1be2", "name": "Create Permission", "resource": "POST:/user/permission/create", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1be3", "name": "List Permission", "resource": "GET:/user/permission/list", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1be4", "name": "Update Permission", "resource": "PUT:/user/permission/update/:id", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1be5", "name": "Get Permission", "resource": "DELETE:/user/permission/delete/:id", "allowed": true },
  { "_id": "679d0315cf6d35d7fefa1be6", "name": "Get Permission by role", "resource": "GET:/user/permission/:roleId", "allowed": true },
  { "_id": "679f6343cf6d35d7fefa1c65", "name": "Download Validation Data", "resource": "GET:/validator/validate-file-download/:validationId", "allowed": true },
  { "_id": "67bc5cb45bd79225d7801077", "name": "Create Text Conversion Job", "resource": "POST:/job/create-text-conversion", "allowed": true },
  { "_id": "67ea60eba4d0ccbb7ca28b27", "name": "Create Attribute", "resource": "POST:/attribute/create", "allowed": true },
  { "_id": "67ea60eba4d0ccbb7ca28b28", "name": "List Attribute", "resource": "GET:/attribute/list", "allowed": true },
  { "_id": "67ea60eba4d0ccbb7ca28b29", "name": "Update Attribute", "resource": "PUT:/attribute/update/:id", "allowed": true },
  { "_id": "67ea60eba4d0ccbb7ca28b2a", "name": "Get Attribute", "resource": "GET:/attribute/:id", "allowed": true },
  { "_id": "67ea60eba4d0ccbb7ca28b2b", "name": "Search Attribute", "resource": "GET:/attribute/search", "allowed": true },
  { "_id": "67ea60eba4d0ccbb7ca28b2c", "name": "Delete Attribute", "resource": "DELETE:/attribute/delete", "allowed": true },
  { "_id": "67ea60eba4d0ccbb7ca28b2d", "name": "Update Doc Captured Attribute", "resource": "PUT:/doc/update-attribute/:docId", "allowed": true },
  { "_id": "67ea60eba4d0ccbb7ca28b2e", "name": "List Doc Update History", "resource": "GET:/doc/list-update-history/:docId", "allowed": true },
];

 // Group permissions by resource category
const initialPermissions = currentUser.permissionIds.reduce((acc, perm) => {
  const category = perm.resource.split('/')[1];
  if (!acc[category]) {
    acc[category] = {};
  }
  acc[category][perm.name] = false;
  return acc;
}, {} as Record<string, Record<string, boolean>>);

const columns: GridColDef[] = [
  {
    field: "organizationId",
    headerName: "Organization ID",
    width: 150,
    disableColumnMenu: true,
    resizable: true,
  },
  {
    field: "name",
    headerName: "Name",
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
    renderCell: (params) => (
      <Box sx={{ display: "flex", gap: 1 }}>
        <Tooltip title="Edit" arrow>
          <Button
            variant="text"
            onClick={() => params.row.handleEdit(params.row)}
            sx={{ minWidth: "auto" }}
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
    ),
  },
];

export default function Roles() {
  const theme = useUnifiedTheme();
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view" | "filter" | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
  const [roleReload, setRoleReload] = useState(false);
  const [filterValues, setFilterValues] = useState({
    name: "",
    organizationId: "",
    status: "",
  });
  const [selectedPermissions, setSelectedPermissions] = useState(initialPermissions);
 const { currentUser } = useSelector(
    (state: RootState) => state.userPermission
  );

  const { control, handleSubmit, reset, formState: { errors } } = useForm<RolePostPayload>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      organizationId: "",
      status: "",
      permissionIds: [],
    },
  });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [searchValue]);

  // API call for listing roles
  const perPageItem = paginationModel.pageSize;
  const roleList = useGet<ApiResponse>(
    [
      "roleList",
      String(paginationModel.page + 1),
      debouncedSearchValue,
      String(roleReload),
      filterValues.name,
      filterValues.organizationId,
      filterValues.status,
    ],
    `${GET.ROLE_LIST}?page=${paginationModel.page + 1}&limit=${perPageItem}&search=${encodeURIComponent(debouncedSearchValue)}&name=${encodeURIComponent(filterValues.name)}&organizationId=${encodeURIComponent(filterValues.organizationId)}&status=${encodeURIComponent(filterValues.status)}`,
    true
  );

  // POST API for creating a role
  const createRole = usePost<RolePostPayload, RolePostResponse>(
    ["createRole"],
    (data) => {
      if (data?.success) {
        setRoleReload(true);
        handleCloseModal();
      }
    },
    true
  );

  // PUT API for updating a role
  const updateRole = usePut<RolePostPayload, RolePostResponse>(
    ["updateRole"],
    (data) => {
      if (data?.success) {
        setRoleReload(true);
        handleCloseModal();
      }
    },
    true
  );

  // DELETE API for deleting a role
  const deleteRole = useDelete<null, RolePostResponse>(
    ["deleteRole"],
    (data) => {
      if (data?.success) {
        setRoleReload(true);
        handleCloseDialog();
      }
    },
    true
  );

  // Reset roleReload after listing is fetched
  useEffect(() => {
    if (roleList?.data && roleReload) {
      setRoleReload(false);
    }
  }, [roleList, roleReload]);

  // Process API data for DataGrid
  const rolesWithIds =
    Array.isArray(roleList?.data?.data) && roleList.data.data.length > 0
      ? roleList.data.data.map((role) => ({
          ...role,
          id: role._id || `temp-${Math.random().toString(36).substr(2, 9)}`,
        }))
      : [];

  const handleEdit = (row: Role) => {
    const permState = { ...initialPermissions };
    Object.keys(permState).forEach((category) => {
      Object.keys(permState[category]).forEach((action) => {
        const perm = samplePermissions.find((p) => p.name === action && p.resource.includes(category));
        if (perm && row.permissions.includes(perm._id)) {
          permState[category][action] = true;
        }
      });
    });
    setSelectedPermissions(permState);
    reset({
      name: row.name || "",
      organizationId: row.organizationId || "",
      status: row.status || "",
      permissionIds: row.permissions || [],
    });
    setModalMode("edit");
    setOpenModal(true);
  };

  const handleView = (row: Role) => {
    const permState = { ...initialPermissions };
    Object.keys(permState).forEach((category) => {
      Object.keys(permState[category]).forEach((action) => {
        const perm = samplePermissions.find((p) => p.name === action && p.resource.includes(category));
        if (perm && row.permissions.includes(perm._id)) {
          permState[category][action] = true;
        }
      });
    });
    setSelectedPermissions(permState);
    reset({
      name: row.name || "",
      organizationId: row.organizationId || "",
      status: row.status || "",
      permissionIds: row.permissions || [],
    });
    setModalMode("view");
    setOpenModal(true);
  };

  const handleDelete = (id: string) => {
    if (id) {
      setDeleteId(id);
      setOpenDialog(true);
    }
  };

  const handleAddRole = () => {
    reset({
      name: "",
      organizationId: "",
      status: "",
      permissionIds: [],
    });
    setSelectedPermissions(initialPermissions);
    setModalMode("add");
    setOpenModal(true);
  };

  const handleFilter = () => {
    reset({
      name: filterValues.name,
      organizationId: filterValues.organizationId,
      status: filterValues.status,
      permissionIds: [],
    });
    setSelectedPermissions(initialPermissions);
    setModalMode("filter");
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalMode(null);
    reset({
      name: "",
      organizationId: "",
      status: "",
      permissionIds: [],
    });
    setSelectedPermissions(initialPermissions);
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
          payload: null,
        });
      } catch (error) {
        console.error("Error deleting role:", error);
      }
    }
  };

  const handleResetFilter = () => {
    reset({
      name: "",
      organizationId: "",
      status: "",
      permissionIds: [],
    });
    setSelectedPermissions(initialPermissions);
  };

  const handleCheckboxChange = (category: string, action: string) => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [action]: !prev[category][action],
      },
    }));
  };

  const onSubmit = async (data: RolePostPayload) => {
    try {
      if (modalMode === "filter") {
        setFilterValues({
          name: data.name,
          organizationId: data.organizationId,
          status: data.status,
        });
        setPaginationModel({ ...paginationModel, page: 0 });
        handleCloseModal();
        return;
      }

      const selectedPermissionIds: string[] = [];
      Object.keys(selectedPermissions).forEach((category) => {
        Object.keys(selectedPermissions[category]).forEach((action) => {
          if (selectedPermissions[category][action]) {
            const perm = samplePermissions.find((p) => p.name === action && p.resource.includes(category));
            if (perm) {
              selectedPermissionIds.push(perm._id);
            }
          }
        });
      });

      const payload: RolePostPayload = {
        name: data.name,
        organizationId: data.organizationId,
        status: data.status,
        permissionIds: selectedPermissionIds,
      };

      if (modalMode === "add") {
        await createRole.mutate({
        url: `${POST.CREATE_ROLE}`,
          payload,
        });
      } else if (modalMode === "edit") {
        await updateRole.mutate({
          url: `${PUT.UPDATE_ROLE}/${data.id}`,
          payload,
        });
      }
    } catch (error) {
      console.error("Error saving role:", error);
    }
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
            {/* Search Bar */}
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

            {/* Filter and Add Buttons */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={handleFilter}
                sx={{
                  borderRadius: "8px",
                }}
              >
                Filter
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddRole}
                sx={{
                  borderRadius: "8px",
                }}
              >
                Add
              </Button>
            </Box>
          </Box>

          {/* Table */}
          <DataGrid
            rows={rolesWithIds.map((role) => ({
              ...role,
              handleEdit,
              handleView,
              handleDelete,
            }))}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            pageSizeOptions={[5, 10, 20]}
            disableColumnMenu
            sx={{
              overflow: "visible",
            }}
            loading={
              roleList.isLoading ||
              createRole.isLoading ||
              updateRole.isLoading ||
              deleteRole.isLoading
            }
            rowCount={roleList?.data?.totalCount || 0}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            slots={{
              pagination: () => (
                <CustomPagination
                  paginationModel={paginationModel}
                  setPaginationModel={setPaginationModel}
                  rowCount={roleList?.data?.totalCount || 0}
                />
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Modal for Add/Edit/View/Filter */}
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
            backgroundColor: theme.palette.background.paper,
            borderRadius: "8px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
            p: 3,
            width: "600px",
            maxWidth: "90%",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          {modalMode === "delete" ? (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Confirm Delete
              </Typography>
              <Typography>
                Are you sure you want to delete the role with ID {deleteId?.slice(-8) || "Unknown"}?
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}>
                <Button
                  onClick={handleCloseModal}
                  sx={{
                    borderRadius: "8px",
                  }}
                >
                  No
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  sx={{
                    borderRadius: "8px",
                    backgroundColor: "error.main",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "error.dark",
                    },
                  }}
                >
                  Yes
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {modalMode === "add"
                  ? "Add Role"
                  : modalMode === "edit"
                    ? "Edit Role"
                    : modalMode === "view"
                      ? "View Role"
                      : "Filter Roles"}
              </Typography>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Name"
                          variant="outlined"
                          fullWidth
                          disabled={modalMode === "view"}
                          error={!!errors.name}
                          helperText={errors.name?.message}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="organizationId"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Organization ID"
                          variant="outlined"
                          fullWidth
                          disabled={modalMode === "view"}
                          error={!!errors.organizationId}
                          helperText={errors.organizationId?.message}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                        />
                      )}
                    />
                  </Grid>
                  {(modalMode === "add" || modalMode === "edit" || modalMode === "view") && (
                    <Grid item xs={12}>
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                              {...field}
                              disabled={modalMode === "view"}
                              label="Status"
                              error={!!errors.status}
                            >
                              <MenuItem value="active">Active</MenuItem>
                              <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                  )}
                  {modalMode === "filter" && (
                    <Grid item xs={12}>
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                              {...field}
                              label="Status"
                            >
                              <MenuItem value="">All</MenuItem>
                              <MenuItem value="active">Active</MenuItem>
                              <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                  )}
                  {modalMode !== "filter" && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ mb: 2, mt: 2 }}>
                        Permissions
                      </Typography>
                      {Object.keys(selectedPermissions).map((category) => (
                        <Box
                          key={category}
                          sx={{
                            border: `1px solid ${theme.palette.divider}`,
                            p: 2,
                            borderRadius: "8px",
                            mb: 2,
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </Typography>
                          <Grid container spacing={2}>
                            {Object.keys(selectedPermissions[category]).map((action) => (
                              <Grid item xs={12} sm={4} key={action}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={selectedPermissions[category][action]}
                                      onChange={() => handleCheckboxChange(category, action)}
                                      disabled={modalMode === "view"}
                                      sx={{
                                        color: theme.palette.primary.dark,
                                        "&.Mui-checked": {
                                          color: theme.palette.primary.dark,
                                        },
                                      }}
                                    />
                                  }
                                  label={action}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      ))}
                    </Grid>
                  )}
                </Grid>
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}>
                  {modalMode === "filter" ? (
                    <>
                      <Button
                        variant="outlined"
                        onClick={handleResetFilter}
                        sx={{ borderRadius: "8px" }}
                      >
                        Reset
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handleCloseModal}
                        sx={{ borderRadius: "8px" }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        sx={{ borderRadius: "8px" }}
                        disabled={
                          !filterValues.name &&
                          !filterValues.organizationId &&
                          !filterValues.status
                        }
                      >
                        Apply
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        onClick={handleCloseModal}
                        sx={{ borderRadius: "8px" }}
                      >
                        Cancel
                      </Button>
                      {modalMode !== "view" && (
                        <Button
                          type="submit"
                          variant="contained"
                          sx={{ borderRadius: "8px" }}
                          disabled={createRole.isLoading || updateRole.isLoading}
                        >
                          Save
                        </Button>
                      )}
                    </>
                  )}
                </Box>
              </form>
            </>
          )}
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
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
          <Typography>
            Are you sure you want to delete the role with ID{" "}
            {deleteId?.slice(-8) || "Unknown"}?
          </Typography>
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