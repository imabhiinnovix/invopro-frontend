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
//   Grid,
//   FormControlLabel,
//   Checkbox,
//   Snackbar,
//   Alert,
// } from "@mui/material";
// import { useForm, Controller } from "react-hook-form";
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
// import { RootState } from "../../reducers";
// import { useSelector } from "react-redux";
// import { formatPermissionName } from "../../utils/utils";

// // Define types
// interface Role {
//   _id: string;
//   organizationId: string;
//   name: string;
//   status: string;
//   permissions: string[];
// }

// interface ApiResponse {
//   success: boolean;
//   data: Role[];
//   totalCount: number;
// }

// interface RolePostPayload {
//   name: string;
//   organizationId?: string;
//   status?: string;
//   permissionIds: string[];
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
//   const { permissions } = useSelector((state: RootState) => state.userPermission);
//   const [openModal, setOpenModal] = useState(false);
//   const [modalMode, setModalMode] = useState<"add" | "edit" | "view" | "filter" | null>(null);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [deleteId, setDeleteId] = useState<string | null>(null);
//   const [editRoleId, setEditRoleId] = useState<string | null>(null);
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
//   const [snackbar, setSnackbar] = useState<{
//     open: boolean;
//     message: string;
//     severity: "error" | "success";
//   }>({
//     open: false,
//     message: "",
//     severity: "error",
//   });

//   const initialPermissions = Object.keys(permissions ?? {}).reduce((acc, resourceType) => {
//     acc[resourceType] = Object.keys(permissions[resourceType] ?? {}).reduce((permAcc, permKey) => {
//       permAcc[permKey] = false;
//       return permAcc;
//     }, {} as Record<string, boolean>);
//     return acc;
//   }, {} as Record<string, Record<string, boolean>>);
//   const [selectedPermissions, setSelectedPermissions] = useState(initialPermissions);

//   const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<RolePostPayload>({
//     defaultValues: {
//       name: "",
//       organizationId: "",
//       status: "",
//       permissionIds: [],
//     },
//     mode: "onChange",
//   });

//   // Watch the name field to determine if Save button should be enabled
//   const nameValue = watch("name");
//   const isNameValid = nameValue?.trim().length > 1;

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
//         setSnackbar({ open: true, message: "Role created successfully!", severity: "success" });
//       } else {
//         setSnackbar({ open: true, message: "Failed to create role.", severity: "error" });
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
//         setSnackbar({ open: true, message: "Role updated successfully!", severity: "success" });
//       } else {
//         setSnackbar({ open: true, message: "Failed to update role.", severity: "error" });
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
//         setSnackbar({ open: true, message: "Role deleted successfully!", severity: "success" });
//       } else {
//         setSnackbar({ open: true, message: "Failed to delete role.", severity: "error" });
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
//     const permState = { ...initialPermissions };
//     Object.keys(permState).forEach((resourceType) => {
//       Object.keys(permState[resourceType]).forEach((permKey) => {
//         const perm = permissions[resourceType]?.[permKey];
//         if (perm && row.permissions.includes(perm.permissionId)) {
//           permState[resourceType][permKey] = true;
//         }
//       });
//     });
//     setSelectedPermissions(permState);
//     reset({
//       name: row.name || "",
//       organizationId: row.organizationId || "",
//       status: row.status || "",
//       permissionIds: row.permissions || [],
//     });
//     setEditRoleId(row._id);
//     setModalMode("edit");
//     setOpenModal(true);
//   };

//   const handleView = (row: Role) => {
//     const permState = { ...initialPermissions };
//     Object.keys(permState).forEach((resourceType) => {
//       Object.keys(permState[resourceType]).forEach((permKey) => {
//         const perm = permissions[resourceType]?.[permKey];
//         if (perm && row.permissions.includes(perm.permissionId)) {
//           permState[resourceType][permKey] = true;
//         }
//       });
//     });
//     setSelectedPermissions(permState);
//     reset({
//       name: row.name || "",
//       organizationId: row.organizationId || "",
//       status: row.status || "",
//       permissionIds: row.permissions || [],
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
//     reset({
//       name: "",
//       organizationId: "",
//       status: "",
//       permissionIds: [],
//     });
//     setSelectedPermissions(initialPermissions);
//     setModalMode("add");
//     setOpenModal(true);
//   };

//   const handleFilter = () => {
//     reset({
//       name: filterValues.name,
//       organizationId: filterValues.organizationId,
//       status: filterValues.status,
//       permissionIds: [],
//     });
//     setSelectedPermissions(initialPermissions);
//     setModalMode("filter");
//     setOpenModal(true);
//   };

//   const handleCloseModal = () => {
//     setOpenModal(false);
//     setModalMode(null);
//     setEditRoleId(null);
//     reset({
//       name: "",
//       organizationId: "",
//       status: "",
//       permissionIds: [],
//     });
//     setSelectedPermissions(initialPermissions);
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
//         setSnackbar({ open: true, message: "Failed to delete role.", severity: "error" });
//       }
//     }
//   };

//   const handleResetFilter = () => {
//     reset({
//       name: "",
//       organizationId: "",
//       status: "",
//       permissionIds: [],
//     });
//     setFilterValues({
//       name: "",
//       organizationId: "",
//       status: "",
//     });
//     setSelectedPermissions(initialPermissions);
//   };

//   const handleCheckboxChange = (resourceType: string, permKey: string) => {
//     setSelectedPermissions((prev) => ({
//       ...prev,
//       [resourceType]: {
//         ...prev[resourceType],
//         [permKey]: !prev[resourceType][permKey],
//       },
//     }));
//   };

//   const onSubmit = async (data: RolePostPayload) => {
//     if (!data.name?.trim() || data.name.trim().length <= 1) {
//       setSnackbar({ open: true, message: "Name is required and must be longer than 1 character.", severity: "error" });
//       return;
//     }

//     try {
//       if (modalMode === "filter") {
//         setFilterValues({
//           name: data.name,
//           organizationId: data.organizationId || "",
//           status: data.status || "",
//         });
//         setPaginationModel({ ...paginationModel, page: 0 });
//         handleCloseModal();
//         return;
//       }

//       const selectedPermissionIds: string[] = [];
//       Object.keys(selectedPermissions).forEach((resourceType) => {
//         Object.keys(selectedPermissions[resourceType]).forEach((permKey) => {
//           if (selectedPermissions[resourceType][permKey]) {
//             const perm = permissions[resourceType]?.[permKey];
//             if (perm) {
//               selectedPermissionIds.push(perm.permissionId);
//             }
//           }
//         });
//       });

//       if (modalMode === "add") {
//         const payload = {
//           name: data.name.trim(),
//           permissionIds: selectedPermissionIds,
//         };
//         await createRole.mutate({
//           url: `${POST.CREATE_ROLE}`,
//           payload,
//         });
//       } else if (modalMode === "edit") {
//         const payload: RolePostPayload = {
//           name: data.name.trim(),
//           organizationId: data.organizationId,
//           status: data.status,
//           permissionIds: selectedPermissionIds,
//         };
//         await updateRole.mutate({
//           url: `${PUT.UPDATE_ROLE}/${editRoleId}`,
//           payload,
//         });
//       }
//     } catch (error) {
//       console.error("Error saving role:", error);
//       setSnackbar({ open: true, message: "An error occurred while saving the role.", severity: "error" });
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
//             boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
//             p: 3,
//             width: "800px",
//             maxWidth: "90%",
//             maxHeight: "80vh",
//             overflowY: "auto",
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
//           <form onSubmit={handleSubmit(onSubmit)}>
//             <Grid container spacing={2}>
//               <Grid item xs={12}>
//                 <Controller
//                   name="name"
//                   control={control}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       label="Name *"
//                       placeholder="Enter role name"
//                       variant="outlined"
//                       fullWidth
//                       disabled={modalMode === "view"}
//                       error={!isNameValid && field.value !== ""}
//                       helperText={!isNameValid && field.value !== "" ? "Name must be longer than 1 character" : " "}
//                       sx={{
//                         "& .MuiOutlinedInput-root": { borderRadius: "8px" },
//                       }}
//                     />
//                   )}
//                 />
//               </Grid>
//               {modalMode === "filter" && (
//                 <>
//                   <Grid item xs={12}>
//                     <Controller
//                       name="organizationId"
//                       control={control}
//                       render={({ field }) => (
//                         <TextField
//                           {...field}
//                           label="Organization ID"
//                           variant="outlined"
//                           fullWidth
//                           sx={{
//                             "& .MuiOutlinedInput-root": { borderRadius: "8px" },
//                           }}
//                         />
//                       )}
//                     />
//                   </Grid>
//                   <Grid item xs={12}>
//                     <Controller
//                       name="status"
//                       control={control}
//                       render={({ field }) => (
//                         <FormControl
//                           fullWidth
//                           sx={{
//                             "& .MuiOutlinedInput-root": {
//                               borderRadius: "8px",
//                             },
//                           }}
//                         >
//                           <InputLabel>Status</InputLabel>
//                           <Select
//                             {...field}
//                             label="Status"
//                             onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.value)}
//                           >
//                             <MenuItem value="">All</MenuItem>
//                             <MenuItem value="active">Active</MenuItem>
//                             <MenuItem value="inactive">Inactive</MenuItem>
//                           </Select>
//                         </FormControl>
//                       )}
//                     />
//                   </Grid>
//                 </>
//               )}
//               {(modalMode === "add" || modalMode === "edit" || modalMode === "view") && (
//                 <Grid item xs={12}>
//                   <Typography variant="subtitle1" sx={{ mb: 2, mt: 2 }}>
//                     Permissions
//                   </Typography>
//                   {Object.keys(selectedPermissions).map((resourceType) => (
//                     <Box
//                       key={resourceType}
//                       sx={{
//                         border: `1px solid ${theme.palette.divider}`,
//                         p: 2,
//                         borderRadius: "8px",
//                         mb: 2,
//                       }}
//                     >
//                       <Typography
//                         variant="subtitle2"
//                         sx={{ mb: 1, fontWeight: 600 }}
//                       >
//                         {resourceType}
//                       </Typography>
//                       <Grid container spacing={2}>
//                         {Object.keys(selectedPermissions[resourceType]).map(
//                           (permKey) => (
//                             <Grid item xs={12} sm={6} md={4} key={permKey}>
//                               <FormControlLabel
//                                 control={
//                                   <Checkbox
//                                     checked={selectedPermissions[resourceType][permKey]}
//                                     onChange={() => handleCheckboxChange(resourceType, permKey)}
//                                     disabled={modalMode === "view"}
//                                     sx={{
//                                       color: theme.palette.primary.dark,
//                                       "&.Mui-checked": {
//                                         color: theme.palette.primary.dark,
//                                       },
//                                     }}
//                                   />
//                                 }
//                                 label={formatPermissionName(permKey)}
//                                 sx={{
//                                   "& .MuiFormControlLabel-label": {
//                                     whiteSpace: "normal",
//                                     wordBreak: "break-word",
//                                   },
//                                 }}
//                               />
//                             </Grid>
//                           )
//                         )}
//                       </Grid>
//                     </Box>
//                   ))}
//                 </Grid>
//               )}
//             </Grid>
//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "flex-end",
//                 gap: 1,
//                 mt: 3,
//               }}
//             >
//               {modalMode === "filter" ? (
//                 <>
//                   <Button
//                     variant="outlined"
//                     onClick={handleResetFilter}
//                     sx={{ borderRadius: "8px" }}
//                   >
//                     Reset
//                   </Button>
//                   <Button
//                     variant="outlined"
//                     onClick={handleCloseModal}
//                     sx={{ borderRadius: "8px" }}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     type="submit"
//                     variant="contained"
//                     sx={{ borderRadius: "8px" }}
//                     disabled={
//                       !filterValues.name &&
//                       !filterValues.organizationId &&
//                       !filterValues.status
//                     }
//                   >
//                     Apply
//                   </Button>
//                 </>
//               ) : (
//                 <>
//                   <Button
//                     variant="outlined"
//                     onClick={handleCloseModal}
//                     sx={{ borderRadius: "8px" }}
//                   >
//                     Cancel
//                   </Button>
//                   {modalMode !== "view" && (
//                     <Button
//                       type="submit"
//                       variant="contained"
//                       sx={{ borderRadius: "8px" }}
//                       disabled={!isNameValid || createRole.isLoading || updateRole.isLoading}
//                     >
//                       Save
//                     </Button>
//                   )}
//                 </>
//               )}
//             </Box>
//           </form>
//         </Box>
//       </Modal>
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
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//       >
//         <Alert
//           onClose={() => setSnackbar({ ...snackbar, open: false })}
//           severity={snackbar.severity}
//           sx={{ width: "100%" }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
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
//   Grid,
//   FormControlLabel,
//   Checkbox,
//   Snackbar,
//   Alert,
// } from "@mui/material";
// import { useForm, Controller } from "react-hook-form";
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
// import { RootState } from "../../reducers";
// import { useSelector } from "react-redux";
// import { formatPermissionName } from "../../utils/utils";

// // Define types
// interface Role {
//   _id: string;
//   organizationId: string;
//   name: string;
//   status: string;
//   permissions?: string[]; // Made optional to handle undefined cases
// }

// interface ApiResponse {
//   success: boolean;
//   data: Role[];
//   totalCount: number;
// }

// interface RolePostPayload {
//   name: string;
//   organizationId?: string;
//   status?: string;
//   permissionIds: string[];
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
//   const { permissions } = useSelector((state: RootState) => state.userPermission);
//   const [openModal, setOpenModal] = useState(false);
//   const [modalMode, setModalMode] = useState<"add" | "edit" | "view" | "filter" | null>(null);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [deleteId, setDeleteId] = useState<string | null>(null);
//   const [editRoleId, setEditRoleId] = useState<string | null>(null);
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
//   const [snackbar, setSnackbar] = useState<{
//     open: boolean;
//     message: string;
//     severity: "error" | "success";
//   }>({
//     open: false,
//     message: "",
//     severity: "error",
//   });

//   const initialPermissions = Object.keys(permissions ?? {}).reduce((acc, resourceType) => {
//     acc[resourceType] = Object.keys(permissions[resourceType] ?? {}).reduce((permAcc, permKey) => {
//       permAcc[permKey] = false;
//       return permAcc;
//     }, {} as Record<string, boolean>);
//     return acc;
//   }, {} as Record<string, Record<string, boolean>>);
//   const [selectedPermissions, setSelectedPermissions] = useState(initialPermissions);

//   const { control, handleSubmit, reset, watch } = useForm<RolePostPayload>({
//     defaultValues: {
//       name: "",
//       organizationId: "",
//       status: "",
//       permissionIds: [],
//     },
//     mode: "onChange",
//   });

//   // Watch the name field to determine if Save button should be enabled
//   const nameValue = watch("name");
//   const isNameValid = nameValue?.trim().length > 1;

//   // Debug roleList data to check for undefined permissions
  

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
//         setSnackbar({ open: true, message: "Role created successfully!", severity: "success" });
//       } else {
//         setSnackbar({ open: true, message: "Failed to create role.", severity: "error" });
//       }
//     },
//     true
//   );

//   useEffect(() => {
//     if (roleList?.data?.data) {
//       console.log("Role List Data:", roleList.data.data);
//     }
//   }, [roleList]);
//   // PUT API for updating a role
//   const updateRole = usePut<RolePostPayload, RolePostResponse>(
//     ["updateRole"],
//     (data) => {
//       if (data?.success) {
//         setRoleReload(true);
//         handleCloseModal();
//         setSnackbar({ open: true, message: "Role updated successfully!", severity: "success" });
//       } else {
//         setSnackbar({ open: true, message: "Failed to update role.", severity: "error" });
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
//         setSnackbar({ open: true, message: "Role deleted successfully!", severity: "success" });
//       } else {
//         setSnackbar({ open: true, message: "Failed to delete role.", severity: "error" });
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
//           permissions: role.permissions || [], // Ensure permissions is always an array
//         }))
//       : [];

//   const handleEdit = (row: Role) => {
//     console.log("Editing Role:", row); // Debug row data
//     const permState = { ...initialPermissions };
//     Object.keys(permState).forEach((resourceType) => {
//       Object.keys(permState[resourceType]).forEach((permKey) => {
//         const perm = permissions[resourceType]?.[permKey];
//         if (perm && Array.isArray(row.permissions) && row.permissions.includes(perm.permissionId)) {
//           permState[resourceType][permKey] = true;
//         }
//       });
//     });
//     setSelectedPermissions(permState);
//     reset({
//       name: row.name || "",
//       organizationId: row.organizationId || "",
//       status: row.status || "",
//       permissionIds: row.permissions || [],
//     });
//     setEditRoleId(row._id);
//     setModalMode("edit");
//     setOpenModal(true);
//   };

//   const handleView = (row: Role) => {
//     console.log("Viewing Role:", row); // Debug row data
//     const permState = { ...initialPermissions };
//     Object.keys(permState).forEach((resourceType) => {
//       Object.keys(permState[resourceType]).forEach((permKey) => {
//         const perm = permissions[resourceType]?.[permKey];
//         if (perm && Array.isArray(row.permissions) && row.permissions.includes(perm.permissionId)) {
//           permState[resourceType][permKey] = true;
//         }
//       });
//     });
//     setSelectedPermissions(permState);
//     reset({
//       name: row.name || "",
//       organizationId: row.organizationId || "",
//       status: row.status || "",
//       permissionIds: row.permissions || [],
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
//     reset({
//       name: "",
//       organizationId: "",
//       status: "",
//       permissionIds: [],
//     });
//     setSelectedPermissions(initialPermissions);
//     setModalMode("add");
//     setOpenModal(true);
//   };

//   const handleFilter = () => {
//     reset({
//       name: filterValues.name,
//       organizationId: filterValues.organizationId,
//       status: filterValues.status,
//       permissionIds: [],
//     });
//     setSelectedPermissions(initialPermissions);
//     setModalMode("filter");
//     setOpenModal(true);
//   };

//   const handleCloseModal = () => {
//     setOpenModal(false);
//     setModalMode(null);
//     setEditRoleId(null);
//     reset({
//       name: "",
//       organizationId: "",
//       status: "",
//       permissionIds: [],
//     });
//     setSelectedPermissions(initialPermissions);
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
//         setSnackbar({ open: true, message: "Failed to delete role.", severity: "error" });
//       }
//     }
//   };

//   const handleResetFilter = () => {
//     reset({
//       name: "",
//       organizationId: "",
//       status: "",
//       permissionIds: [],
//     });
//     setFilterValues({
//       name: "",
//       organizationId: "",
//       status: "",
//     });
//     setSelectedPermissions(initialPermissions);
//   };

//   const handleCheckboxChange = (resourceType: string, permKey: string) => {
//     setSelectedPermissions((prev) => ({
//       ...prev,
//       [resourceType]: {
//         ...prev[resourceType],
//         [permKey]: !prev[resourceType][permKey],
//       },
//     }));
//   };

//   const onSubmit = async (data: RolePostPayload) => {
//     if (!data.name?.trim() || data.name.trim().length <= 1) {
//       setSnackbar({ open: true, message: "Name is required and must be longer than 1 character.", severity: "error" });
//       return;
//     }

//     try {
//       if (modalMode === "filter") {
//         setFilterValues({
//           name: data.name,
//           organizationId: data.organizationId || "",
//           status: data.status || "",
//         });
//         setPaginationModel({ ...paginationModel, page: 0 });
//         handleCloseModal();
//         return;
//       }

//       const selectedPermissionIds: string[] = [];
//       Object.keys(selectedPermissions).forEach((resourceType) => {
//         Object.keys(selectedPermissions[resourceType]).forEach((permKey) => {
//           if (selectedPermissions[resourceType][permKey]) {
//             const perm = permissions[resourceType]?.[permKey];
//             if (perm) {
//               selectedPermissionIds.push(perm.permissionId);
//             }
//           }
//         });
//       });

//       if (modalMode === "add") {
//         const payload = {
//           name: data.name.trim(),
//           permissionIds: selectedPermissionIds,
//         };
//         await createRole.mutate({
//           url: `${POST.CREATE_ROLE}`,
//           payload,
//         });
//       } else if (modalMode === "edit") {
//         const payload: RolePostPayload = {
//           name: data.name.trim(),
//           organizationId: data.organizationId,
//           status: data.status,
//           permissionIds: selectedPermissionIds,
//         };
//         await updateRole.mutate({
//           url: `${PUT.UPDATE_ROLE}/${editRoleId}`,
//           payload,
//         });
//       }
//     } catch (error) {
//       console.error("Error saving role:", error);
//       setSnackbar({ open: true, message: "An error occurred while saving the role.", severity: "error" });
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
//             boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
//             p: 3,
//             width: "800px",
//             maxWidth: "90%",
//             maxHeight: "80vh",
//             overflowY: "auto",
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
//           <form onSubmit={handleSubmit(onSubmit)}>
//             <Grid container spacing={2}>
//               <Grid item xs={12}>
//                 <Controller
//                   name="name"
//                   control={control}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       label="Name *"
//                       placeholder="Enter role name"
//                       variant="outlined"
//                       fullWidth
//                       disabled={modalMode === "view"}
//                       error={!isNameValid && field.value !== ""}
//                       helperText={!isNameValid && field.value !== "" ? "Name must be longer than 1 character" : " "}
//                       sx={{
//                         "& .MuiOutlinedInput-root": { borderRadius: "8px" },
//                       }}
//                     />
//                   )}
//                 />
//               </Grid>
//               {modalMode === "filter" && (
//                 <>
//                   <Grid item xs={12}>
//                     <Controller
//                       name="organizationId"
//                       control={control}
//                       render={({ field }) => (
//                         <TextField
//                           {...field}
//                           label="Organization ID"
//                           variant="outlined"
//                           fullWidth
//                           sx={{
//                             "& .MuiOutlinedInput-root": { borderRadius: "8px" },
//                           }}
//                         />
//                       )}
//                     />
//                   </Grid>
//                   <Grid item xs={12}>
//                     <Controller
//                       name="status"
//                       control={control}
//                       render={({ field }) => (
//                         <FormControl
//                           fullWidth
//                           sx={{
//                             "& .MuiOutlinedInput-root": {
//                               borderRadius: "8px",
//                             },
//                           }}
//                         >
//                           <InputLabel>Status</InputLabel>
//                           <Select
//                             {...field}
//                             label="Status"
//                             onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.value)}
//                           >
//                             <MenuItem value="">All</MenuItem>
//                             <MenuItem value="active">Active</MenuItem>
//                             <MenuItem value="inactive">Inactive</MenuItem>
//                           </Select>
//                         </FormControl>
//                       )}
//                     />
//                   </Grid>
//                 </>
//               )}
//               {(modalMode === "add" || modalMode === "edit" || modalMode === "view") && (
//                 <Grid item xs={12}>
//                   <Typography variant="subtitle1" sx={{ mb: 2, mt: 2 }}>
//                     Permissions
//                   </Typography>
//                   {Object.keys(selectedPermissions).map((resourceType) => (
//                     <Box
//                       key={resourceType}
//                       sx={{
//                         border: `1px solid ${theme.palette.divider}`,
//                         p: 2,
//                         borderRadius: "8px",
//                         mb: 2,
//                       }}
//                     >
//                       <Typography
//                         variant="subtitle2"
//                         sx={{ mb: 1, fontWeight: 600 }}
//                       >
//                         {resourceType}
//                       </Typography>
//                       <Grid container spacing={2}>
//                         {Object.keys(selectedPermissions[resourceType]).map(
//                           (permKey) => (
//                             <Grid item xs={12} sm={6} md={4} key={permKey}>
//                               <FormControlLabel
//                                 control={
//                                   <Checkbox
//                                     checked={selectedPermissions[resourceType][permKey]}
//                                     onChange={() => handleCheckboxChange(resourceType, permKey)}
//                                     disabled={modalMode === "view"}
//                                     sx={{
//                                       color: theme.palette.primary.dark,
//                                       "&.Mui-checked": {
//                                         color: theme.palette.primary.dark,
//                                       },
//                                     }}
//                                   />
//                                 }
//                                 label={formatPermissionName(permKey)}
//                                 sx={{
//                                   "& .MuiFormControlLabel-label": {
//                                     whiteSpace: "normal",
//                                     wordBreak: "break-word",
//                                   },
//                                 }}
//                               />
//                             </Grid>
//                           )
//                         )}
//                       </Grid>
//                     </Box>
//                   ))}
//                 </Grid>
//               )}
//             </Grid>
//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "flex-end",
//                 gap: 1,
//                 mt: 3,
//               }}
//             >
//               {modalMode === "filter" ? (
//                 <>
//                   <Button
//                     variant="outlined"
//                     onClick={handleResetFilter}
//                     sx={{ borderRadius: "8px" }}
//                   >
//                     Reset
//                   </Button>
//                   <Button
//                     variant="outlined"
//                     onClick={handleCloseModal}
//                     sx={{ borderRadius: "8px" }}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     type="submit"
//                     variant="contained"
//                     sx={{ borderRadius: "8px" }}
//                     disabled={
//                       !filterValues.name &&
//                       !filterValues.organizationId &&
//                       !filterValues.status
//                     }
//                   >
//                     Apply
//                   </Button>
//                 </>
//               ) : (
//                 <>
//                   <Button
//                     variant="outlined"
//                     onClick={handleCloseModal}
//                     sx={{ borderRadius: "8px" }}
//                   >
//                     Cancel
//                   </Button>
//                   {modalMode !== "view" && (
//                     <Button
//                       type="submit"
//                       variant="contained"
//                       sx={{ borderRadius: "8px" }}
//                       disabled={!isNameValid || createRole.isLoading || updateRole.isLoading}
//                     >
//                       Save
//                     </Button>
//                   )}
//                 </>
//               )}
//             </Box>
//           </form>
//         </Box>
//       </Modal>
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
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//       >
//         <Alert
//           onClose={() => setSnackbar({ ...snackbar, open: false })}
//           severity={snackbar.severity}
//           sx={{ width: "100%" }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// }

//detai id 


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
  Snackbar,
  Alert,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
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
import { useSelector } from "react-redux";
import { formatPermissionName } from "../../utils/utils";

// Define types
interface PermissionDetail {
  _id: string;
  name: string;
  method: string;
  resourceId: string;
  dataSourceId?: string;
  resourceType: string;
  resourceCode?: string;
  status: string;
  isSuperUser: boolean;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface RoleDetail {
  _id: string;
  permissionId: PermissionDetail;
  roleId: string;
  status: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

interface Role {
  _id: string;
  organizationId: string;
  name: string;
  status: string;
  permissions?: string[];
}

interface ApiResponse {
  success: boolean;
  data: Role[];
  totalCount: number;
}

interface RoleDetailResponse {
  success: boolean;
  data: RoleDetail[];
  totalCount: number;
}

interface RolePostPayload {
  name: string;
  organizationId?: string;
  status?: string;
  permissionIds: string[];
}

interface RolePostResponse {
  success: boolean;
  data: Role;
}

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
  const { permissions } = useSelector((state: RootState) => state.userPermission);
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view" | "filter" | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
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
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "error" | "success";
  }>({
    open: false,
    message: "",
    severity: "error",
  });
  const [formattedRoleDetails, setFormattedRoleDetails] = useState<RoleDetail[]>([]);

  const initialPermissions = Object.keys(permissions ?? {}).reduce((acc, resourceType) => {
    acc[resourceType] = Object.keys(permissions[resourceType] ?? {}).reduce((permAcc, permKey) => {
      permAcc[permKey] = false;
      return permAcc;
    }, {} as Record<string, boolean>);
    return acc;
  }, {} as Record<string, Record<string, boolean>>);
  const [selectedPermissions, setSelectedPermissions] = useState(initialPermissions);

  const { control, handleSubmit, reset, watch } = useForm<RolePostPayload>({
    defaultValues: {
      name: "",
      organizationId: "",
      status: "",
      permissionIds: [],
    },
    mode: "onChange",
  });

  // Watch the name field to determine if Save button should be enabled
  const nameValue = watch("name");
  const isNameValid = nameValue?.trim().length > 1;

  // Fetch role details for edit
  const roleDetail = useGet<RoleDetailResponse>(
    ["roleDetail", editRoleId],
    editRoleId ? `${GET.ROLE_DETAIL}/${editRoleId}` : null,
    !!editRoleId
  );

  // Format and save role details when fetched
  useEffect(() => {
    if (roleDetail?.data?.success && roleDetail.data.data) {
      const formattedData = roleDetail.data.data.map((detail) => ({
        ...detail,
        permissionId: {
          ...detail.permissionId,
          name: formatPermissionName(detail.permissionId.name),
        },
      }));
      setFormattedRoleDetails(formattedData);
      console.log("Formatted Role Details:", formattedData);
    }
  }, [roleDetail]);

  

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
        setSnackbar({ open: true, message: "Role created successfully!", severity: "success" });
      } else {
        setSnackbar({ open: true, message: "Failed to create role.", severity: "error" });
      }
    },
    true
  );
  // Debug roleList data to check for undefined permissions
  useEffect(() => {
    if (roleList?.data?.data) {
      console.log("Role List Data:", roleList.data.data);
    }
  }, [roleList]);

  // PUT API for updating a role
  const updateRole = usePut<RolePostPayload, RolePostResponse>(
    ["updateRole"],
    (data) => {
      if (data?.success) {
        setRoleReload(true);
        handleCloseModal();
        setSnackbar({ open: true, message: "Role updated successfully!", severity: "success" });
      } else {
        setSnackbar({ open: true, message: "Failed to update role.", severity: "error" });
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
        setSnackbar({ open: true, message: "Role deleted successfully!", severity: "success" });
      } else {
        setSnackbar({ open: true, message: "Failed to delete role.", severity: "error" });
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
          permissions: role.permissions || [],
        }))
      : [];

  const handleEdit = (row: Role) => {
    console.log("Editing Role:", row);
    setEditRoleId(row._id);
    setModalMode("edit");
    setOpenModal(true);

    // Use role details from API if available, otherwise fallback to row data
    const permState = { ...initialPermissions };
    const permissionIds = Array.isArray(formattedRoleDetails) && formattedRoleDetails.length > 0
      ? formattedRoleDetails.map((detail) => detail.permissionId._id)
      : (row.permissions || []);

    Object.keys(permState).forEach((resourceType) => {
      Object.keys(permState[resourceType]).forEach((permKey) => {
        const perm = permissions[resourceType]?.[permKey];
        if (perm && permissionIds.includes(perm.permissionId)) {
          permState[resourceType][permKey] = true;
        }
      });
    });

    setSelectedPermissions(permState);
    reset({
      name: row.name || "",
      organizationId: row.organizationId || "",
      status: row.status || "",
      permissionIds: permissionIds,
    });
  };

  const handleView = (row: Role) => {
    console.log("Viewing Role:", row);
    setEditRoleId(row._id); // Trigger API call for details
    setModalMode("view");
    setOpenModal(true);

    // Use role details from API if available, otherwise fallback to row data
    const permState = { ...initialPermissions };
    const permissionIds = Array.isArray(formattedRoleDetails) && formattedRoleDetails.length > 0
      ? formattedRoleDetails.map((detail) => detail.permissionId._id)
      : (row.permissions || []);

    Object.keys(permState).forEach((resourceType) => {
      Object.keys(permState[resourceType]).forEach((permKey) => {
        const perm = permissions[resourceType]?.[permKey];
        if (perm && permissionIds.includes(perm.permissionId)) {
          permState[resourceType][permKey] = true;
        }
      });
    });

    setSelectedPermissions(permState);
    reset({
      name: row.name || "",
      organizationId: row.organizationId || "",
      status: row.status || "",
      permissionIds: permissionIds,
    });
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
    setEditRoleId(null);
    setFormattedRoleDetails([]);
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
        setSnackbar({ open: true, message: "Failed to delete role.", severity: "error" });
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
    setFilterValues({
      name: "",
      organizationId: "",
      status: "",
    });
    setSelectedPermissions(initialPermissions);
  };

  const handleCheckboxChange = (resourceType: string, permKey: string) => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [resourceType]: {
        ...prev[resourceType],
        [permKey]: !prev[resourceType][permKey],
      },
    }));
  };

  const onSubmit = async (data: RolePostPayload) => {
    if (!data.name?.trim() || data.name.trim().length <= 1) {
      setSnackbar({ open: true, message: "Name is required and must be longer than 1 character.", severity: "error" });
      return;
    }

    try {
      if (modalMode === "filter") {
        setFilterValues({
          name: data.name,
          organizationId: data.organizationId || "",
          status: data.status || "",
        });
        setPaginationModel({ ...paginationModel, page: 0 });
        handleCloseModal();
        return;
      }

      const selectedPermissionIds: string[] = [];
      Object.keys(selectedPermissions).forEach((resourceType) => {
        Object.keys(selectedPermissions[resourceType]).forEach((permKey) => {
          if (selectedPermissions[resourceType][permKey]) {
            const perm = permissions[resourceType]?.[permKey];
            if (perm) {
              selectedPermissionIds.push(perm.permissionId);
            }
          }
        });
      });

      if (modalMode === "add") {
        const payload = {
          name: data.name.trim(),
          permissionIds: selectedPermissionIds,
        };
        await createRole.mutate({
          url: `${POST.CREATE_ROLE}`,
          payload,
        });
      } else if (modalMode === "edit") {
        const payload: RolePostPayload = {
          name: data.name.trim(),
          organizationId: data.organizationId,
          status: data.status,
          permissionIds: selectedPermissionIds,
        };
        await updateRole.mutate({
          url: `${PUT.UPDATE_ROLE}/${editRoleId}`,
          payload,
        });
      }
    } catch (error) {
      console.error("Error saving role:", error);
      setSnackbar({ open: true, message: "An error occurred while saving the role.", severity: "error" });
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
              deleteRole.isLoading ||
              roleDetail.isLoading
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
            width: "800px",
            maxWidth: "90%",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
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
                      label="Name *"
                      placeholder="Enter role name"
                      variant="outlined"
                      fullWidth
                      disabled={modalMode === "view"}
                      error={!isNameValid && field.value !== ""}
                      helperText={!isNameValid && field.value !== "" ? "Name must be longer than 1 character" : " "}
                      sx={{
                        "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                      }}
                    />
                  )}
                />
              </Grid>
              {modalMode === "filter" && (
                <>
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
                          sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <FormControl
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "8px",
                            },
                          }}
                        >
                          <InputLabel>Status</InputLabel>
                          <Select
                            {...field}
                            label="Status"
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.value)}
                          >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                </>
              )}
              {(modalMode === "add" || modalMode === "edit" || modalMode === "view") && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 2, mt: 2 }}>
                    Permissions
                  </Typography>
                  {Object.keys(selectedPermissions).map((resourceType) => (
                    <Box
                      key={resourceType}
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        p: 2,
                        borderRadius: "8px",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        {resourceType}
                      </Typography>
                      <Grid container spacing={2}>
                        {Object.keys(selectedPermissions[resourceType]).map(
                          (permKey) => (
                            <Grid item xs={12} sm={6} md={4} key={permKey}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={selectedPermissions[resourceType][permKey]}
                                    onChange={() => handleCheckboxChange(resourceType, permKey)}
                                    disabled={modalMode === "view"}
                                    sx={{
                                      color: theme.palette.primary.dark,
                                      "&.Mui-checked": {
                                        color: theme.palette.primary.dark,
                                      },
                                    }}
                                  />
                                }
                                label={formatPermissionName(permKey)}
                                sx={{
                                  "& .MuiFormControlLabel-label": {
                                    whiteSpace: "normal",
                                    wordBreak: "break-word",
                                  },
                                }}
                              />
                            </Grid>
                          )
                        )}
                      </Grid>
                    </Box>
                  ))}
                </Grid>
              )}
            </Grid>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 3,
              }}
            >
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
                      disabled={!isNameValid || createRole.isLoading || updateRole.isLoading}
                    >
                      Save
                    </Button>
                  )}
                </>
              )}
            </Box>
          </form>
        </Box>
      </Modal>
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
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
