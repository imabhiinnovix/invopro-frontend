

// import * as React from "react";
// import { useState, useEffect } from "react";
// import {
//   Box,
//   Typography,
//   TextField,
//   Button,
//   Modal,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Grid,
//   FormControlLabel,
//   Checkbox,
//   Snackbar,
//   Alert,
//   CircularProgress,
// } from "@mui/material";
// import { useForm, Controller } from "react-hook-form";
// import { useQueryClient } from "@tanstack/react-query";
// import useGet from "../../hooks/useGet";
// import usePost from "../../hooks/usePost";
// import usePut from "../../hooks/usePut";
// import useDelete from "../../hooks/useDelete";
// import { DELETE, GET, POST, PUT } from "../../services/apiRoutes";
// import {
//   BackendPermission,
//   formatPermissionName,
//   formatPermissions,
//   PermissionMap,
// } from "../../utils/utils";
// import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";

// interface PermissionDetail {
//   _id: string;
//   name: string;
//   method: string;
//   resourceId: string;
//   dataSourceId?: string;
//   resourceType: string;
//   resourceCode?: string;
//   status: string;
//   isSuperUser: boolean;
//   organizationId?: string;
//   createdAt: string;
//   updatedAt: string;
//   __v: number;
// }

// interface RoleDetail {
//   _id: string;
//   permissionId: PermissionDetail;
//   roleId: string;
//   status: string;
//   __v: number;
//   createdAt: string;
//   updatedAt: string;
// }

// interface Role {
//   _id: string;
//   organizationId: string;
//   name: string;
//   status: string;
//   permissions?: string[];
// }

// interface RoleDetailResponse {
//   success: boolean;
//   data: RoleDetail[];
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

// interface ModalValidationProps {
//   openModal: boolean;
//   setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
//   modalMode: "add" | "edit" | "view" | "filter" | null;
//   setModalMode: React.Dispatch<
//     React.SetStateAction<"add" | "edit" | "view" | "filter" | null>
//   >;
//   editRoleId: string | null;
//   setEditRoleId: React.Dispatch<React.SetStateAction<string | null>>;
//   deleteId: string | null;
//   setDeleteId: React.Dispatch<React.SetStateAction<string | null>>;
//   setRoleReload: React.Dispatch<React.SetStateAction<boolean>>;
//   filterValues: { name: string; organizationId: string; status: string };
//   setFilterValues: React.Dispatch<
//     React.SetStateAction<{ name: string; organizationId: string; status: string }>
//   >;
//   permissions: Record<string, Record<string, BackendPermission>>;
// }

// export default function ModalValidation({
//   openModal,
//   setOpenModal,
//   modalMode,
//   setModalMode,
//   editRoleId,
//   setEditRoleId,
//   deleteId,
//   setDeleteId,
//   setRoleReload,
//   filterValues,
//   setFilterValues,
//   permissions,
// }: ModalValidationProps) {
//   const theme = useUnifiedTheme();
//   const queryClient = useQueryClient();
//   const [snackbar, setSnackbar] = useState<{
//     open: boolean;
//     message: string;
//     severity: "error" | "success";
//   }>({
//     open: false,
//     message: "",
//     severity: "error",
//   });
//   const [formattedPermissions, setFormattedPermissions] =
//     useState<PermissionMap>({});
//   const [isInitialLoad, setIsInitialLoad] = useState(true);
//   const [isLoadingWithDelay, setIsLoadingWithDelay] = useState(false);
//   const [fetchTimestamp, setFetchTimestamp] = useState(Date.now());

//   const initialPermissions = Object.keys(permissions ?? {}).reduce(
//     (acc, resourceType: string) => ({
//       ...acc,
//       [resourceType]: Object.keys(permissions[resourceType] ?? {}).reduce(
//         (permAcc, permKey: string) => ({
//           ...permAcc,
//           [permKey]: false,
//         }),
//         {} as Record<string, boolean>
//       ),
//     }),
//     {} as Record<string, Record<string, boolean>>
//   );

//   const [selectedPermissions, setSelectedPermissions] =
//     useState(initialPermissions);

//   const { control, handleSubmit, reset, watch } = useForm<RolePostPayload>({
//     defaultValues: {
//       name: "",
//       organizationId: "",
//       status: "",
//       permissionIds: [],
//     },
//     mode: "onChange",
//   });

//   const nameValue = watch("name");
//   const isNameValid = nameValue?.trim().length > 0;

//   const roleDetail = useGet<RoleDetailResponse>(
//     ["roleDetail", editRoleId, fetchTimestamp],
//     editRoleId ? `${GET.ROLE_DETAIL}/${editRoleId}` : null,
//     !!editRoleId,
//     { refetchOnWindowFocus: false }
//   );

//   useEffect(() => {
//     if (
//       isInitialLoad &&
//       roleDetail.data?.success &&
//       Array.isArray(roleDetail.data?.data) &&
//       Object.keys(formattedPermissions).length > 0
//     ) {
//       const permissionsValue: BackendPermission[] = roleDetail.data.data.map(
//         (perm) => perm.permissionId
//       );
//       const formatted = formatPermissions(permissionsValue);
//       setFormattedPermissions(formatted);

//       const permState = { ...initialPermissions };
//       Object.keys(permState).forEach((resourceType) => {
//         Object.keys(permState[resourceType]).forEach((permKey) => {
//           permState[resourceType][permKey] =
//             formatted[resourceType]?.[permKey]?.allowed || false;
//         });
//       });
//       setSelectedPermissions(permState);
//       setIsInitialLoad(false);
//       setIsLoadingWithDelay(false);
//     } else if (
//       roleDetail.isError ||
//       (roleDetail.data && !roleDetail.data.success)
//     ) {
//       setFormattedPermissions({});
//       setSelectedPermissions(initialPermissions);
//       setIsInitialLoad(false);
//       setIsLoadingWithDelay(false);
//     } else if (
//       roleDetail.data?.success &&
//       Array.isArray(roleDetail.data?.data)
//     ) {
//       const permissionsValue: BackendPermission[] = roleDetail.data.data.map(
//         (perm) => perm.permissionId
//       );
//       const formatted = formatPermissions(permissionsValue);
//       setFormattedPermissions(formatted);
//       setIsLoadingWithDelay(false);
//     }
//   }, [roleDetail, permissions, isInitialLoad, formattedPermissions]);

//   // Enforce loader until data is fetched and permissions are processed
//   useEffect(() => {
//     if (
//       roleDetail.isLoading &&
//       (modalMode === "edit" || modalMode === "view")
//     ) {
//       setIsLoadingWithDelay(true);
//     }
//   }, [roleDetail.isLoading, modalMode]);

//   // POST API
//   const createRole = usePost<RolePostPayload, RolePostResponse>(
//     ["createRole"],
//     (data) => {
//       if (data?.success) {
//         setRoleReload(true);
//         handleCloseModal();
//         setSnackbar({
//           open: true,
//           message: "Role created successfully!",
//           severity: "success",
//         });
//       } else {
//         setSnackbar({
//           open: true,
//           message: "Failed to create role.",
//           severity: "error",
//         });
//       }
//     },
//     true
//   );

//   // PUT API
//   const updateRole = usePut<RolePostPayload, RolePostResponse>(
//     ["updateRole"],
//     (data) => {
//       if (data?.success) {
//         queryClient.invalidateQueries(["roleDetail", editRoleId]);
//         setRoleReload(true);
//         handleCloseModal();
//         setSnackbar({
//           open: true,
//           message: "Role updated successfully!",
//           severity: "success",
//         });
//       } else {
//         setSnackbar({
//           open: true,
//           message: "Failed to update role.",
//           severity: "error",
//         });
//       }
//     },
//     true
//   );

//   // DELETE API
//   const deleteRole = useDelete<null, RolePostResponse>(
//     ["deleteRole"],
//     (data) => {
//       if (data?.success) {
//         setRoleReload(true);
//         handleCloseDialog();
//         setSnackbar({
//           open: true,
//           message: "Role deleted successfully!",
//           severity: "success",
//         });
//       } else {
//         setSnackbar({
//           open: true,
//           message: "Failed to delete role.",
//           severity: "error",
//         });
//       }
//     },
//     true
//   );

//   const handleCloseModal = () => {
//     setOpenModal(false);
//     setModalMode(null);
//     setEditRoleId(null);
//     setFormattedPermissions({});
//     setSelectedPermissions(initialPermissions);
//     setIsInitialLoad(true);
//     setIsLoadingWithDelay(false);
//     setFetchTimestamp(Date.now());
//     reset({
//       name: "",
//       organizationId: "",
//       status: "",
//       permissionIds: [],
//     });
//   };

//   const handleCloseDialog = () => {
//     setDeleteId(null);
//   };

//   const handleConfirmDelete = async () => {
//     if (deleteId) {
//       try {
//         await deleteRole.mutate({
//           url: `${DELETE.DELETE_ROLE}/${deleteId}`,
//         });
//       } catch (error) {
//         console.error("Error deleting role:", error);
//         setSnackbar({
//           open: true,
//           message: "Failed to delete role.",
//           severity: "error",
//         });
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
//     setSelectedPermissions((prev) => {
//       const newState = {
//         ...prev,
//         [resourceType]: {
//           ...prev[resourceType],
//           [permKey]: !prev[resourceType][permKey],
//         },
//       };
//       return newState;
//     });
//   };

//   const onSubmit = async (data: RolePostPayload) => {
//     if (!data.name?.trim() || data.name.trim().length <= 1) {
//       setSnackbar({
//         open: true,
//         message: "Name is required and must be longer than 1 character.",
//         severity: "error",
//       });
//       return;
//     }

//     try {
//       if (modalMode === "filter") {
//         setFilterValues({
//           name: data.name,
//           organizationId: data.organizationId || "",
//           status: data.status || "",
//         });
//         handleCloseModal();
//         return;
//       }

//       const selectedPermissionIds: string[] = [];
//       Object.keys(selectedPermissions).forEach((resourceType) => {
//         Object.keys(selectedPermissions[resourceType]).forEach((permKey) => {
//           if (selectedPermissions[resourceType][permKey]) {
//             const perm = permissions[resourceType]?.[permKey];
//             if (perm?.permissionId) {
//               selectedPermissionIds.push(perm.permissionId);
//             }
//           }
//         });
//       });

//       let payload: RolePostPayload;
//       if (modalMode === "add") {
//         payload = {
//           name: data.name.trim(),
//           permissionIds: selectedPermissionIds,
//         };
//         await createRole.mutate({
//           url: `${POST.CREATE_ROLE}`,
//           payload,
//         });
//       } else if (modalMode === "edit") {
//         payload = {
//           name: data.name.trim(),
//           organizationId: data.organizationId || "",
//           status: data.status || "",
//           permissionIds: selectedPermissionIds,
//         };
//         await updateRole.mutate({
//           url: `${PUT.UPDATE_ROLE}/${editRoleId}`,
//           payload,
//         });
//       }
//     } catch (error) {
//       console.error("Error saving role:", error);
//       setSnackbar({
//         open: true,
//         message: "An error occurred while saving the role.",
//         severity: "error",
//       });
//     }
//   };

//   return (
//     <>
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
//           {(roleDetail.isLoading || isLoadingWithDelay) &&
//           (modalMode === "edit" || modalMode === "view") ? (
//             <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
//               <CircularProgress />
//             </Box>
//           ) : roleDetail.isError &&
//             (modalMode === "edit" || modalMode === "view") ? (
//             <Typography color="error">
//               Failed to load role details. Please try again.
//             </Typography>
//           ) : (
//             <form onSubmit={handleSubmit(onSubmit)}>
//               <Grid container spacing={2}>
//                 <Grid item xs={12}>
//                   {modalMode === "view" ? (
//                     <>
//                       <label
//                         style={{
//                           display: "block",
//                           marginBottom: "4px",
//                           fontSize: "14px",
//                           color: "#666",
//                           fontWeight: 500,
//                         }}
//                       >
//                         Name
//                       </label>
//                       <div
//                         style={{
//                           padding: "14px 12px",
//                           borderRadius: "8px",
//                           display: "flex",
//                           alignItems: "center",
//                           backgroundColor: "#ebe8e8ff",
//                           color: "#3f3e3eff",
//                         }}
//                       >
//                         {control._formValues?.name || "-"}
//                       </div>
//                     </>
//                   ) : (
//                     <Controller
//                       name="name"
//                       control={control}
//                       render={({ field }) => (
//                         <TextField
//                           {...field}
//                           label="Name *"
//                           placeholder="Enter role name"
//                           variant="outlined"
//                           fullWidth
//                           error={!isNameValid && field.value !== ""}
//                           helperText={
//                             !isNameValid && field.value !== ""
//                               ? "Name must be longer than 1 character"
//                               : " "
//                           }
//                           sx={{
//                             "& .MuiOutlinedInput-root": { borderRadius: "8px" },
//                           }}
//                         />
//                       )}
//                     />
//                   )}
//                 </Grid>
//                 {modalMode === "filter" && (
//                   <>
//                     <Grid item xs={12}>
//                       <Controller
//                         name="organizationId"
//                         control={control}
//                         render={({ field }) => (
//                           <TextField
//                             {...field}
//                             label="Organization ID"
//                             variant="outlined"
//                             fullWidth
//                             sx={{
//                               "& .MuiOutlinedInput-root": {
//                                 borderRadius: "8px",
//                               },
//                             }}
//                           />
//                         )}
//                       />
//                     </Grid>
//                     <Grid item xs={12}>
//                       <Controller
//                         name="status"
//                         control={control}
//                         render={({ field }) => (
//                           <FormControl
//                             fullWidth
//                             sx={{
//                               "& .MuiOutlinedInput-root": {
//                                 borderRadius: "8px",
//                               },
//                             }}
//                           >
//                             <InputLabel>Status</InputLabel>
//                             <Select
//                               {...field}
//                               label="Status"
//                               onChange={(e) =>
//                                 field.onChange(
//                                   e.target.value === ""
//                                     ? undefined
//                                     : e.target.value
//                                 )
//                               }
//                             >
//                               <MenuItem value="">All</MenuItem>
//                               <MenuItem value="active">Active</MenuItem>
//                               <MenuItem value="inactive">Inactive</MenuItem>
//                             </Select>
//                           </FormControl>
//                         )}
//                       />
//                     </Grid>
//                   </>
//                 )}
//                 {(modalMode === "add" ||
//                   modalMode === "edit" ||
//                   modalMode === "view") && (
//                   <Grid item xs={12}>
//                     <Typography variant="subtitle1" sx={{ mb: 2, mt: 2 }}>
//                       Permissions
//                     </Typography>
//                     {Object.keys(selectedPermissions).length === 0 ? (
//                       <Typography>No permissions available.</Typography>
//                     ) : (
//                       Object.keys(selectedPermissions).map((resourceType) => (
//                         <Box
//                           key={resourceType}
//                           sx={{
//                             border: `1px solid ${theme.palette.divider}`,
//                             p: 2,
//                             borderRadius: "8px",
//                             mb: 2,
//                           }}
//                         >
//                           <Typography
//                             variant="subtitle2"
//                             sx={{ mb: 1, fontWeight: 600 }}
//                           >
//                             {resourceType}
//                           </Typography>
//                           <Grid container spacing={2}>
//                             {Object.keys(selectedPermissions[resourceType]).map(
//                               (permKey) => (
//                                 <Grid item xs={12} sm={6} md={4} key={permKey}>
//                                   <FormControlLabel
//                                     control={
//                                       <Checkbox
//                                         checked={
//                                           selectedPermissions[resourceType][
//                                             permKey
//                                           ]
//                                         }
//                                         onChange={() =>
//                                           handleCheckboxChange(
//                                             resourceType,
//                                             permKey
//                                           )
//                                         }
//                                         disabled={modalMode === "view"}
//                                         sx={{
//                                           color: theme.palette.primary.dark,
//                                           "&.Mui-checked": {
//                                             color: theme.palette.primary.dark,
//                                           },
//                                         }}
//                                       />
//                                     }
//                                     label={formatPermissionName(permKey)}
//                                     sx={{
//                                       "& .MuiFormControlLabel-label": {
//                                         whiteSpace: "normal",
//                                         wordBreak: "break-word",
//                                       },
//                                     }}
//                                   />
//                                 </Grid>
//                               )
//                             )}
//                           </Grid>
//                         </Box>
//                       ))
//                     )}
//                   </Grid>
//                 )}
//               </Grid>
//               <Box
//                 sx={{
//                   display: "flex",
//                   justifyContent: "flex-end",
//                   gap: 1,
//                   mt: 3,
//                 }}
//               >
//                 {modalMode === "filter" ? (
//                   <>
//                     <Button
//                       variant="outlined"
//                       onClick={handleResetFilter}
//                       sx={{ borderRadius: "8px" }}
//                     >
//                       Reset
//                     </Button>
//                     <Button
//                       variant="outlined"
//                       onClick={handleCloseModal}
//                       sx={{ borderRadius: "8px" }}
//                     >
//                       Cancel
//                     </Button>
//                     <Button
//                       type="submit"
//                       variant="contained"
//                       sx={{ borderRadius: "8px" }}
//                       disabled={
//                         !filterValues.name &&
//                         !filterValues.organizationId &&
//                         !filterValues.status
//                       }
//                     >
//                       Apply
//                     </Button>
//                   </>
//                 ) : (
//                   <>
//                     <Button
//                       variant="outlined"
//                       onClick={handleCloseModal}
//                       sx={{ borderRadius: "8px" }}
//                     >
//                       Cancel
//                     </Button>
//                     {modalMode !== "view" && (
//                       <Button
//                         type="submit"
//                         variant="contained"
//                         sx={{ borderRadius: "8px" }}
//                         disabled={
//                           !isNameValid ||
//                           createRole.isLoading ||
//                           updateRole.isLoading
//                         }
//                       >
//                         Save
//                       </Button>
//                     )}
//                   </>
//                 )}
//               </Box>
//             </form>
//           )}
//         </Box>
//       </Modal>
//       <Dialog
//         open={!!deleteId}
//         onClose={handleCloseDialog}
//         sx={{
//           "& .MuiDialog-paper": {
//             borderRadius: "8px",
//           },
//         }}
//       >
//         <DialogTitle>Confirm Delete</DialogTitle>
//         <DialogContent>
//           <Typography>Are you sure you want to delete this?</Typography>
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
//     </>
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
  const [refreshKey, setRefreshKey] = useState(0);
  
  const discardAllSubmit = usePost(["discardAllSubmit"]);
  const discardRow = usePost(["discardRow"]);
  
  const validationErrorList = useGet<any>(
    [
      "validationErrorList",
      String(paginationModel.page + 1),
      String(paginationModel.pageSize),
      debouncedSearchValue,
      refreshKey,
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
        setRefreshKey(prevKey => prevKey + 1);
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
        setRefreshKey(prevKey => prevKey + 1);
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