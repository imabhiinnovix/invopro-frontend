// import React, { useState, useRef, useEffect } from "react";
// import {
//   Avatar,
//   Button,
//   TextField,
//   Grid,
//   Paper,
//   Typography,
//   Box,
//   IconButton,
//   InputAdornment,
//   Divider,
//   Card,
//   CardContent,
//   CardHeader,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Alert,
//   FormHelperText,
//   CircularProgress,
// } from "@mui/material";
// import {
//   Edit as EditIcon,
//   Save as SaveIcon,
//   Cancel as CancelIcon,
//   Delete as DeleteIcon,
//   CloudUpload as UploadIcon,
//   Visibility,
//   VisibilityOff,
// } from "@mui/icons-material";
// import useGet from "../../hooks/useGet";
// import usePut from "../../hooks/usePut";
// import useFilePostData from "../../hooks/usePostMultipart";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { GET, PUT, POST, DELETE } from "../../services/apiRoutes";
// import { useSelector, useDispatch } from "react-redux";
// import { RootState } from "../../reducers";
// import useDelete from "../../hooks/useDelete";
// import { setCurrentUser } from "../../reducers/userSlice";

// const ProfilePage = () => {
//   const userProfile = useSelector(
//     (state: RootState) => state.userPermission?.currentUser
//   );
//   console.log("userProfile", userProfile);
//   const dispatch = useDispatch();

//   const userDetailsAPI = useGet<UserResponse>(
//     ["userDetails"],
//     GET.USER_DETAILS
//   );

//   const [profile, setProfile] = useState({
//     personal: {
//       firstName: "",
//       lastName: "",
//       email: "",
//       mobile: "",
//       company: "",
//       departmentId: "",
//       designationId: "",
//     },
//     address: {
//       address: "",
//       city: "",
//       state: "",
//       country: "",
//       postalCode: "",
//     },
//     password: {
//       currentPassword: "",
//       newPassword: "",
//       confirmPassword: "",
//     },
//   });

//   const [profileImage, setProfileImage] = useState("/default-avatar.png");
//   const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
//   const [editModes, setEditModes] = useState({
//     personal: false,
//     address: false,
//     password: false,
//   });
//   const [passwordVisibility, setPasswordVisibility] = useState({
//     current: false,
//     new: false,
//     confirm: false,
//   });
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [passwordError, setPasswordError] = useState("");
//   const [fileName, setFileName] = useState<string | null>(null);
//   const [isUploading, setIsUploading] = useState(false);

//   const departmentList = useGet<{
//     success: boolean;
//     data: any[];
//   }>(["departmentList"], GET?.DEPARTMENT_LIST, true);

//   const designationList = useGet<{
//     success: boolean;
//     data: any[];
//   }>(["designationList"], GET?.DESIGNATION_LIST, true);

//   const changePassword = usePut(["changePassword"]);
//   const deleteImage = useDelete(["deleteImage"]);
//   const updateUserProfile = usePut(["updateUserProfile"]);
//   const uploadImage = useFilePostData<
//     { files: File; operation: string },
//     { message: string; data?: any }
//   >(
//     ["uploadProfileImage"],
//     (data) => {
//       console.log("dataa", data);
//       toast.success(data.message);
//     },
//     { showToast: false }
//   );

//   const filteredDesignations = selectedDepartmentId
//     ? designationList.data?.data?.filter(
//         (designation) => designation.departmentId._id === selectedDepartmentId
//       ) || []
//     : [];

//   useEffect(() => {
//     if (userProfile) {
//       setProfile({
//         personal: {
//           firstName: userProfile?.firstName || "",
//           lastName: userProfile?.lastName || "",
//           email: userProfile?.email || "",
//           mobile: userProfile?.mobile || "",
//           company: userProfile?.organizationId?.name || "",
//           departmentId: userProfile?.departmentId?._id || "",
//           designationId: userProfile?.designationId?._id || "",
//         },
//         address: {
//           address: userProfile?.address || "",
//           city: userProfile?.city || "",
//           state: userProfile?.state || "",
//           country: userProfile?.country || "",
//           postalCode: userProfile?.postalCode || "",
//         },
//         password: {
//           currentPassword: "",
//           newPassword: "",
//           confirmPassword: "",
//         },
//       });
//       setProfileImage(userProfile?.imagePath || "/default-avatar.png");
//       setSelectedDepartmentId(userProfile?.departmentId?._id || "");
//     }
//   }, [userProfile]);

//   const handleDepartmentChange = (e) => {
//     const departmentId = e.target.value;
//     setSelectedDepartmentId(departmentId);
//     handleInputChange("personal", "departmentId", departmentId);
//     handleInputChange("personal", "designationId", "");
//   };

//   const handleInputChange = (section, field, value) => {
//     setProfile((prev) => ({
//       ...prev,
//       [section]: {
//         ...prev[section],
//         [field]: value,
//       },
//     }));
//     if (section === "password") {
//       setPasswordError("");
//     }
//   };

//   const toggleEditMode = (section) => {
//     if (section === "password") {
//       setProfile((prev) => ({
//         ...prev,
//         password: {
//           currentPassword: "",
//           newPassword: "",
//           confirmPassword: "",
//         },
//       }));
//       setPasswordError("");
//     }
//     setEditModes((prev) => ({
//       ...prev,
//       [section]: !prev[section],
//     }));
//   };

//   const togglePasswordVisibility = (field) => {
//     setPasswordVisibility((prev) => ({
//       ...prev,
//       [field]: !prev[field],
//     }));
//   };

//   const validatePasswords = () => {
//     const { newPassword, confirmPassword } = profile.password;
//     if (newPassword !== confirmPassword) {
//       setPasswordError("Passwords do not match");
//       return false;
//     }
//     const hasLetter = /[a-zA-Z]/.test(newPassword);
//     const hasNumber = /[0-9]/.test(newPassword);
//     const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
//     if (newPassword.length < 8) {
//       setPasswordError("Password must be at least 8 characters long");
//       return false;
//     }
//     if (!hasLetter || !hasNumber || !hasSpecialChar) {
//       setPasswordError(
//         "Password must contain at least one letter, one number, and one special character"
//       );
//       return false;
//     }
//     setPasswordError("");
//     return true;
//   };

//   const refreshUserData = async () => {
//     const freshData = await userDetailsAPI.refetch();
//     if (freshData.data?.data) {
//       dispatch(setCurrentUser(freshData.data.data));
//     }
//   };

//   const handlePasswordChange = async (e) => {
//     e.preventDefault();
//     if (!validatePasswords()) {
//       return;
//     }
//     try {
//       const response = await changePassword.mutateAsync({
//         url: PUT.CHANGE_PASSWORD,
//         payload: {
//           oldPassword: profile.password.currentPassword,
//           newPassword: profile.password.newPassword,
//         },
//       });
//       if (response.success) {
//         toast.success("Password changed successfully!");

//         // Reset password fields and exit edit mode
//         setProfile((prev) => ({
//           ...prev,
//           password: {
//             currentPassword: "",
//             newPassword: "",
//             confirmPassword: "",
//           },
//         }));
//         setEditModes((prev) => ({
//           ...prev,
//           password: false,
//         }));

//         // Refresh user data
//         await refreshUserData();
//       } else {
//         throw new Error(response.message || "Failed to change password");
//       }
//     } catch (error) {
//       console.error("Password change error:", error);
//       toast.error(
//         error.message || "Failed to change password. Please try again."
//       );
//     }
//   };

//   const handleSaveChanges = async (section) => {
//     try {
//       const payload = {
//         firstName: profile.personal.firstName,
//         lastName: profile.personal.lastName,
//         email: profile.personal.email,
//         mobile: profile.personal.mobile,
//         departmentId: profile.personal.departmentId,
//         designationId: profile.personal.designationId,
//         address: profile.address.address,
//         city: profile.address.city,
//         state: profile.address.state,
//         country: profile.address.country,
//         postalCode: profile.address.postalCode,
//       };
//       const response = await updateUserProfile.mutateAsync({
//         url: PUT.UPDATE_CURRENT_USER,
//         payload,
//       });
//       if (response.success) {
//         toast.success("Profile updated successfully!");

//         // Exit edit mode
//         setEditModes((prev) => ({
//           ...prev,
//           [section]: false,
//         }));

//         // Refresh user data
//         await refreshUserData();
//       } else {
//         throw new Error(response.message || "Failed to update profile");
//       }
//     } catch (error) {
//       console.error("Profile update error:", error);
//       toast.error(
//         error.message || "Failed to update profile. Please try again."
//       );
//     }
//   };

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (!file.type.match("image/jpeg") && !file.type.match("image/png")) {
//         toast.error("Only JPG or PNG files are allowed");
//         return;
//       }
//       if (file.size > 2 * 1024 * 1024) {
//         toast.error("Image size must be at most 2MB");
//         return;
//       }
//       setFileName(file.name);
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         setImagePreview(event.target.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleImageUploadToAPI = async () => {
//     if (!fileInputRef.current?.files?.[0]) {
//       toast.error("Please select an image first");
//       return;
//     }
//     const file = fileInputRef.current.files[0];
//     setIsUploading(true);
//     try {
//       const response = await uploadImage.mutateAsync({
//         url: `${POST.FILE_UPLOAD}`,
//         payload: {
//           files: file,
//           operation: "profile",
//         },
//       });
//       if (response.success) {
//         console.log("Upload ", response.data);
//         toast.success("Profile picture uploaded successfully!");

//         // Clear preview and file input
//         setImagePreview(null);
//         setFileName(null);
//         if (fileInputRef.current) {
//           fileInputRef.current.value = "";
//         }

//         // Refresh user data to get new image URL
//         await refreshUserData();
//       } else {
//         throw new Error(response.message || "Failed to upload profile picture");
//       }
//     } catch (error) {
//       toast.error(
//         error.message || "Failed to upload profile picture. Please try again."
//       );
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleImagePreviewDelete = () => {
//     setImagePreview(null);
//     setFileName(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   const triggerFileInput = () => {
//     fileInputRef.current?.click();
//   };

//   const handleDeleteClick = () => {
//     setDeleteModalOpen(true);
//   };

//   const handleDeleteConfirm = async () => {
//     setIsDeleting(true);
//     try {
//       const response = await deleteImage.mutateAsync({
//         url: DELETE.DELETE_USER_IMAGE,
//         method: "DELETE",
//       });
//       if (response.success) {
//         toast.success("Profile picture deleted successfully!");

//         // Clear preview and close modal
//         setImagePreview(null);
//         setFileName(null);
//         setDeleteModalOpen(false);

//         // Refresh user data
//         await refreshUserData();
//       } else {
//         throw new Error(response.message || "Failed to delete profile picture");
//       }
//     } catch (error) {
//       console.error("Image deletion error:", error);
//       toast.error(
//         error.message || "Failed to delete profile picture. Please try again."
//       );
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const handleDeleteCancel = () => {
//     setDeleteModalOpen(false);
//   };

//   const renderFormFields = (section, fields, disabledFields = []) => {
//     return fields.map((field) => {
//       const isDisabled =
//         disabledFields.includes(field.id) || !editModes[section];
//       if (field.type === "select") {
//         return (
//           <Grid item xs={12} sm={6} key={field.id}>
//             <FormControl
//               fullWidth
//               disabled={isDisabled}
//               variant={editModes[section] ? "outlined" : "filled"}
//               size="small"
//               sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
//             >
//               <InputLabel>{field.label}</InputLabel>
//               <Select
//                 value={profile[section][field.id]}
//                 label={field.label}
//                 onChange={
//                   field.id === "departmentId"
//                     ? handleDepartmentChange
//                     : (e) =>
//                         handleInputChange(section, field.id, e.target.value)
//                 }
//               >
//                 {field.options.map((option) => (
//                   <MenuItem key={option._id} value={option._id}>
//                     {option.name}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Grid>
//         );
//       } else if (field.type === "password") {
//         return (
//           <Grid item xs={12} key={field.id}>
//             <TextField
//               fullWidth
//               label={field.label}
//               type={
//                 passwordVisibility[field.visibilityField] ? "text" : "password"
//               }
//               value={profile[section][field.id]}
//               onChange={(e) =>
//                 handleInputChange(section, field.id, e.target.value)
//               }
//               disabled={isDisabled}
//               variant={editModes[section] ? "outlined" : "filled"}
//               size="small"
//               sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
//               InputProps={{
//                 endAdornment: (
//                   <InputAdornment position="end">
//                     <IconButton
//                       aria-label="toggle password visibility"
//                       onClick={() =>
//                         togglePasswordVisibility(field.visibilityField)
//                       }
//                       edge="end"
//                       disabled={isDisabled}
//                     >
//                       {passwordVisibility[field.visibilityField] ? (
//                         <VisibilityOff />
//                       ) : (
//                         <Visibility />
//                       )}
//                     </IconButton>
//                   </InputAdornment>
//                 ),
//               }}
//             />
//             {field.id === "newPassword" && (
//               <FormHelperText
//                 sx={{ color: "text.secondary", fontSize: "0.75rem", mt: 0.5 }}
//               >
//                 Password must be at least 8 characters long and contain at least
//                 one letter, one number, and one special character.
//               </FormHelperText>
//             )}
//           </Grid>
//         );
//       } else {
//         return (
//           <Grid item xs={12} sm={6} key={field.id}>
//             <TextField
//               fullWidth
//               label={field.label}
//               value={profile[section][field.id]}
//               onChange={(e) =>
//                 handleInputChange(section, field.id, e.target.value)
//               }
//               disabled={isDisabled}
//               variant={editModes[section] ? "outlined" : "filled"}
//               type={field.type || "text"}
//               size="small"
//               sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
//             />
//           </Grid>
//         );
//       }
//     });
//   };

//   const personalFields = [
//     { id: "firstName", label: "First Name" },
//     { id: "lastName", label: "Last Name" },
//     { id: "email", label: "Email" },
//     { id: "mobile", label: "Mobile" },
//     { id: "company", label: "Company" },
//     {
//       id: "departmentId",
//       label: "Department",
//       type: "select",
//       options: departmentList.data?.data || [],
//     },
//     {
//       id: "designationId",
//       label: "Designation",
//       type: "select",
//       options: filteredDesignations,
//     },
//   ];

//   const addressFields = [
//     { id: "address", label: "Address" },
//     { id: "city", label: "City" },
//     { id: "state", label: "State" },
//     { id: "country", label: "Country" },
//     { id: "postalCode", label: "Postal Code" },
//   ];

//   const passwordFields = [
//     {
//       id: "currentPassword",
//       label: "Current Password",
//       type: "password",
//       visibilityField: "current",
//     },
//     {
//       id: "newPassword",
//       label: "New Password",
//       type: "password",
//       visibilityField: "new",
//     },
//     {
//       id: "confirmPassword",
//       label: "Confirm Password",
//       type: "password",
//       visibilityField: "confirm",
//     },
//   ];

//   const isPasswordFormValid =
//     profile.password.currentPassword &&
//     profile.password.newPassword &&
//     profile.password.confirmPassword &&
//     !passwordError;

//   return (
//     <Box sx={{ p: 2 }}>
//       <Typography variant="h4" gutterBottom fontWeight={600}>
//         My Profile
//       </Typography>
//       <Grid container spacing={4}>
//         <Grid item xs={12} md={4}>
//           <Paper
//             elevation={3}
//             sx={{
//               p: 3,
//               textAlign: "center",
//               borderRadius: 3,
//               boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
//             }}
//           >
//             <Avatar
//               src={imagePreview || profileImage}
//               alt="Profile"
//               sx={{
//                 width: 150,
//                 height: 150,
//                 mx: "auto",
//                 mb: 2,
//                 border: "4px solid #f0f0f0",
//                 objectFit: "cover",
//               }}
//             />
//             <input
//               type="file"
//               ref={fileInputRef}
//               onChange={handleImageUpload}
//               accept="image/jpeg, image/png"
//               style={{ display: "none" }}
//             />
//             {!imagePreview && (
//               <>
//                 <Box
//                   sx={{
//                     display: "flex",
//                     justifyContent: "center",
//                     gap: 1,
//                     mb: 2,
//                   }}
//                 >
//                   <Button
//                     variant="outlined"
//                     startIcon={<UploadIcon />}
//                     onClick={triggerFileInput}
//                     size="small"
//                     sx={{ borderRadius: 2 }}
//                   >
//                     Upload
//                   </Button>
//                   {profileImage !== "/default-avatar.png" && (
//                     <Button
//                       variant="outlined"
//                       color="error"
//                       startIcon={<DeleteIcon />}
//                       onClick={handleDeleteClick}
//                       size="small"
//                       sx={{ borderRadius: 2 }}
//                     >
//                       Delete
//                     </Button>
//                   )}
//                 </Box>
//               </>
//             )}
//             {imagePreview && (
//               <Box
//                 sx={{
//                   display: "flex",
//                   justifyContent: "center",
//                   gap: 1,
//                   mb: 2,
//                 }}
//               >
//                 <Button
//                   variant="contained"
//                   color="primary"
//                   startIcon={
//                     isUploading ? (
//                       <CircularProgress size={20} color="inherit" />
//                     ) : (
//                       <SaveIcon />
//                     )
//                   }
//                   onClick={handleImageUploadToAPI}
//                   disabled={isUploading}
//                   size="small"
//                   sx={{ borderRadius: 2 }}
//                 >
//                   {isUploading ? "Uploading..." : "Save"}
//                 </Button>
//                 <Button
//                   variant="outlined"
//                   color="error"
//                   startIcon={<DeleteIcon />}
//                   onClick={handleImagePreviewDelete}
//                   size="small"
//                   sx={{ borderRadius: 2 }}
//                 >
//                   Cancel
//                 </Button>
//               </Box>
//             )}
//             <Typography
//               variant="caption"
//               display="block"
//               gutterBottom
//               color="text.secondary"
//             >
//               JPG/PNG, max 2MB
//             </Typography>
//           </Paper>
//         </Grid>
//         <Grid item xs={12} md={8}>
//           <Card
//             sx={{
//               mb: 3,
//               borderRadius: 3,
//               boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
//             }}
//           >
//             <CardHeader
//               title="Personal Information"
//               titleTypographyProps={{ fontWeight: 600 }}
//               action={
//                 <Button
//                   variant={editModes.personal ? "outlined" : "contained"}
//                   startIcon={editModes.personal ? <CancelIcon /> : <EditIcon />}
//                   onClick={() => toggleEditMode("personal")}
//                   size="small"
//                   sx={{ borderRadius: 2 }}
//                 >
//                   {editModes.personal ? "Cancel" : "Edit"}
//                 </Button>
//               }
//               sx={{ pb: 1 }}
//             />
//             <Divider />
//             <CardContent sx={{ pt: 2 }}>
//               <Grid container spacing={2}>
//                 {renderFormFields("personal", personalFields, [
//                   "email",
//                   "company",
//                   "departmentId",
//                   "designationId",
//                 ])}
//                 {editModes.personal && (
//                   <Grid
//                     item
//                     xs={12}
//                     sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
//                   >
//                     <Button
//                       variant="contained"
//                       color="primary"
//                       startIcon={<SaveIcon />}
//                       onClick={() => handleSaveChanges("personal")}
//                       disabled={updateUserProfile.isLoading}
//                       size="small"
//                       sx={{ borderRadius: 2 }}
//                     >
//                       {updateUserProfile.isLoading
//                         ? "Saving..."
//                         : "Save Changes"}
//                     </Button>
//                   </Grid>
//                 )}
//               </Grid>
//             </CardContent>
//           </Card>
//           <Card
//             sx={{
//               mb: 3,
//               borderRadius: 3,
//               boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
//             }}
//           >
//             <CardHeader
//               title="Address Information"
//               titleTypographyProps={{ fontWeight: 600 }}
//               action={
//                 <Button
//                   variant={editModes.address ? "outlined" : "contained"}
//                   startIcon={editModes.address ? <CancelIcon /> : <EditIcon />}
//                   onClick={() => toggleEditMode("address")}
//                   size="small"
//                   sx={{ borderRadius: 2 }}
//                 >
//                   {editModes.address ? "Cancel" : "Edit"}
//                 </Button>
//               }
//               sx={{ pb: 1 }}
//             />
//             <Divider />
//             <CardContent sx={{ pt: 2 }}>
//               <Grid container spacing={2}>
//                 {renderFormFields("address", addressFields)}
//                 {editModes.address && (
//                   <Grid
//                     item
//                     xs={12}
//                     sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
//                   >
//                     <Button
//                       variant="contained"
//                       color="primary"
//                       startIcon={<SaveIcon />}
//                       onClick={() => handleSaveChanges("address")}
//                       disabled={updateUserProfile.isLoading}
//                       size="small"
//                       sx={{ borderRadius: 2 }}
//                     >
//                       {updateUserProfile.isLoading
//                         ? "Saving..."
//                         : "Save Changes"}
//                     </Button>
//                   </Grid>
//                 )}
//               </Grid>
//             </CardContent>
//           </Card>
//           <Card
//             sx={{
//               borderRadius: 3,
//               boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
//             }}
//           >
//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 px: 2,
//                 pt: 2,
//               }}
//             >
//               <CardHeader
//                 title="Change Password"
//                 titleTypographyProps={{ fontWeight: 600 }}
//                 sx={{ p: 0 }}
//               />
//               {!editModes.password && (
//                 <Button
//                   variant="contained"
//                   startIcon={<EditIcon />}
//                   onClick={() => toggleEditMode("password")}
//                   size="small"
//                   sx={{ borderRadius: 2, mb: 1 }}
//                 >
//                   Change
//                 </Button>
//               )}
//             </Box>
//             <Divider />
//             <CardContent sx={{ pt: 2 }}>
//               {editModes.password ? (
//                 <Grid container spacing={2}>
//                   {renderFormFields("password", passwordFields)}
//                   {passwordError && (
//                     <Grid item xs={12}>
//                       <Alert severity="error">{passwordError}</Alert>
//                     </Grid>
//                   )}
//                   <Grid
//                     item
//                     xs={12}
//                     sx={{
//                       display: "flex",
//                       justifyContent: "flex-end",
//                       gap: 1,
//                       mt: 1,
//                     }}
//                   >
//                     <Button
//                       variant="contained"
//                       color="primary"
//                       startIcon={<SaveIcon />}
//                       onClick={handlePasswordChange}
//                       disabled={
//                         !isPasswordFormValid || changePassword.isLoading
//                       }
//                       size="small"
//                       sx={{ borderRadius: 2 }}
//                     >
//                       {changePassword.isLoading
//                         ? "Updating..."
//                         : "Update Password"}
//                     </Button>
//                     <Button
//                       variant="outlined"
//                       startIcon={<CancelIcon />}
//                       onClick={() => toggleEditMode("password")}
//                       size="small"
//                       sx={{ borderRadius: 2 }}
//                     >
//                       Cancel
//                     </Button>
//                   </Grid>
//                 </Grid>
//               ) : (
//                 <Grid container spacing={2}>
//                   <Grid item xs={12}>
//                     <TextField
//                       fullWidth
//                       label="Current Password"
//                       type="password"
//                       value="•••••••••"
//                       disabled
//                       variant="filled"
//                       size="small"
//                       sx={{ "& .MuiFilledInput-root": { borderRadius: 2 } }}
//                     />
//                   </Grid>
//                 </Grid>
//               )}
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>
//       <Dialog
//         open={deleteModalOpen}
//         onClose={handleDeleteCancel}
//         aria-labelledby="delete-confirmation-title"
//         aria-describedby="delete-confirmation-description"
//       >
//         <DialogTitle id="delete-confirmation-title">
//           Confirm Deletion
//         </DialogTitle>
//         <DialogContent>
//           <Typography>
//             Are you sure you want to delete your profile picture?
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button
//             onClick={handleDeleteCancel}
//             color="primary"
//             disabled={isDeleting}
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={handleDeleteConfirm}
//             color="error"
//             autoFocus
//             disabled={isDeleting}
//             startIcon={<DeleteIcon />}
//           >
//             {isDeleting ? "Deleting..." : "Delete"}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default ProfilePage;

import React, { useState, useRef, useEffect } from "react";
import {
  Avatar,
  Button,
  TextField,
  Grid,
  Paper,
  Typography,
  Box,
  IconButton,
  InputAdornment,
  Divider,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  FormHelperText,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import useGet from "../../hooks/useGet";
import usePut from "../../hooks/usePut";
import useFilePostData from "../../hooks/usePostMultipart";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GET, PUT, POST, DELETE } from "../../services/apiRoutes";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../reducers";
import useDelete from "../../hooks/useDelete";
import { setCurrentUser } from "../../reducers/userSlice";
import PrimaryButton from "../../components/common/PrimaryButton";
import DialogContainer from "../../components/molecule/dialog";

const ProfilePage = () => {
  const userProfile = useSelector(
    (state: RootState) => state.userPermission?.currentUser
  );
  console.log("userProfile", userProfile);
  const dispatch = useDispatch();

  const userDetailsAPI = useGet<UserResponse>(
    ["userDetails"],
    GET.USER_DETAILS
  );

  const [profile, setProfile] = useState({
    personal: {
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      company: "",
      departmentId: "",
      designationId: "",
    },
    address: {
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
    password: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const [profileImage, setProfileImage] = useState("/default-avatar.png");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [editModes, setEditModes] = useState({
    personal: false,
    address: false,
    password: false,
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const departmentList = useGet<{
    success: boolean;
    data: any[];
  }>(["departmentList"], GET?.DEPARTMENT_LIST, true);

  const designationList = useGet<{
    success: boolean;
    data: any[];
  }>(["designationList"], GET?.DESIGNATION_LIST, true);

  const changePassword = usePut(["changePassword"]);
  const deleteImage = useDelete(["deleteImage"]);
  const updateUserProfile = usePut(["updateUserProfile"]);
  const uploadImage = useFilePostData<
    { files: File; operation: string },
    { message: string; data?: any }
  >(
    ["uploadProfileImage"],
    (data) => {
      console.log("dataa", data);
      toast.success(data.message);
    },
    { showToast: false }
  );

  const filteredDesignations = selectedDepartmentId
    ? designationList.data?.data?.filter(
        (designation) => designation.departmentId._id === selectedDepartmentId
      ) || []
    : [];

  useEffect(() => {
    if (userProfile) {
      setProfile({
        personal: {
          firstName: userProfile?.firstName || "",
          lastName: userProfile?.lastName || "",
          email: userProfile?.email || "",
          mobile: userProfile?.mobile || "",
          company: userProfile?.organizationId?.name || "",
          departmentId: userProfile?.departmentId?._id || "",
          designationId: userProfile?.designationId?._id || "",
        },
        address: {
          address: userProfile?.address || "",
          city: userProfile?.city || "",
          state: userProfile?.state || "",
          country: userProfile?.country || "",
          postalCode: userProfile?.postalCode || "",
        },
        password: {
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        },
      });
      setProfileImage(userProfile?.imagePath || "/default-avatar.png");
      setSelectedDepartmentId(userProfile?.departmentId?._id || "");
    }
  }, [userProfile]);

  const handleDepartmentChange = (e) => {
    const departmentId = e.target.value;
    setSelectedDepartmentId(departmentId);
    handleInputChange("personal", "departmentId", departmentId);
    handleInputChange("personal", "designationId", "");
  };

  const handleInputChange = (section, field, value) => {
    // Validate mobile and postalCode fields to only accept numbers
    if (field === "mobile" || field === "postalCode") {
      // Remove any non-digit characters
      const numericValue = value.replace(/\D/g, "");
      setProfile((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: numericValue,
        },
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    }
    if (section === "password") {
      setPasswordError("");
    }
  };

  const toggleEditMode = (section) => {
    if (section === "password") {
      setProfile((prev) => ({
        ...prev,
        password: {
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        },
      }));
      setPasswordError("");
    }
    setEditModes((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validatePasswords = () => {
    const { newPassword, confirmPassword } = profile.password;
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    }
    if (!hasLetter || !hasNumber || !hasSpecialChar) {
      setPasswordError(
        "Password must contain at least one letter, one number, and one special character"
      );
      return false;
    }
    setPasswordError("");
    return true;
  };

  const refreshUserData = async () => {
    const freshData = await userDetailsAPI.refetch();
    if (freshData.data?.data) {
      dispatch(setCurrentUser(freshData.data.data));
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!validatePasswords()) {
      return;
    }
    try {
      const response = await changePassword.mutateAsync({
        url: PUT.CHANGE_PASSWORD,
        payload: {
          oldPassword: profile.password.currentPassword,
          newPassword: profile.password.newPassword,
        },
      });
      if (response.success) {
        toast.success("Password changed successfully!");

        // Reset password fields and exit edit mode
        setProfile((prev) => ({
          ...prev,
          password: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          },
        }));
        setEditModes((prev) => ({
          ...prev,
          password: false,
        }));

        // Refresh user data
        await refreshUserData();
      } else {
        throw new Error(response.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast.error(
        error.message || "Failed to change password. Please try again."
      );
    }
  };

  const handleSaveChanges = async (section) => {
    try {
      const payload = {
        firstName: profile.personal.firstName,
        lastName: profile.personal.lastName,
        email: profile.personal.email,
        mobile: profile.personal.mobile,
        departmentId: profile.personal.departmentId,
        designationId: profile.personal.designationId,
        address: profile.address.address,
        city: profile.address.city,
        state: profile.address.state,
        country: profile.address.country,
        postalCode: profile.address.postalCode,
      };
      const response = await updateUserProfile.mutateAsync({
        url: PUT.UPDATE_CURRENT_USER,
        payload,
      });
      if (response.success) {
        toast.success("Profile updated successfully!");

        // Exit edit mode
        setEditModes((prev) => ({
          ...prev,
          [section]: false,
        }));

        // Refresh user data
        await refreshUserData();
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(
        error.message || "Failed to update profile. Please try again."
      );
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match("image/jpeg") && !file.type.match("image/png")) {
        toast.error("Only JPG or PNG files are allowed");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be at most 2MB");
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUploadToAPI = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      toast.error("Please select an image first");
      return;
    }
    const file = fileInputRef.current.files[0];
    setIsUploading(true);
    try {
      const response = await uploadImage.mutateAsync({
        url: `${POST.FILE_UPLOAD}`,
        payload: {
          files: file,
          operation: "profile",
        },
      });
      if (response.success) {
        console.log("Upload ", response.data);
        toast.success("Profile picture uploaded successfully!");

        // Clear preview and file input
        setImagePreview(null);
        setFileName(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Refresh user data to get new image URL
        await refreshUserData();
      } else {
        throw new Error(response.message || "Failed to upload profile picture");
      }
    } catch (error) {
      toast.error(
        error.message || "Failed to upload profile picture. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleImagePreviewDelete = () => {
    setImagePreview(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteImage.mutateAsync({
        url: DELETE.DELETE_USER_IMAGE,
        method: "DELETE",
      });
      if (response.success) {
        toast.success("Profile picture deleted successfully!");

        // Clear preview and close modal
        setImagePreview(null);
        setFileName(null);
        setDeleteModalOpen(false);

        // Refresh user data
        await refreshUserData();
      } else {
        throw new Error(response.message || "Failed to delete profile picture");
      }
    } catch (error) {
      console.error("Image deletion error:", error);
      toast.error(
        error.message || "Failed to delete profile picture. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
  };

  const renderFormFields = (section, fields, disabledFields = []) => {
    return fields.map((field) => {
      const isDisabled =
        disabledFields.includes(field.id) || !editModes[section];
      if (field.type === "select") {
        return (
          <Grid item xs={12} sm={6} key={field.id}>
            <FormControl
              fullWidth
              disabled={isDisabled}
              variant={editModes[section] ? "outlined" : "filled"}
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              <InputLabel>{field.label}</InputLabel>
              <Select
                value={profile[section][field.id]}
                label={field.label}
                onChange={
                  field.id === "departmentId"
                    ? handleDepartmentChange
                    : (e) =>
                        handleInputChange(section, field.id, e.target.value)
                }
              >
                {field.options.map((option) => (
                  <MenuItem key={option._id} value={option._id}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        );
      } else if (field.type === "password") {
        return (
          <Grid item xs={12} key={field.id}>
            <TextField
              fullWidth
              label={field.label}
              type={
                passwordVisibility[field.visibilityField] ? "text" : "password"
              }
              value={profile[section][field.id]}
              onChange={(e) =>
                handleInputChange(section, field.id, e.target.value)
              }
              disabled={isDisabled}
              variant={editModes[section] ? "outlined" : "filled"}
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() =>
                        togglePasswordVisibility(field.visibilityField)
                      }
                      edge="end"
                      disabled={isDisabled}
                    >
                      {passwordVisibility[field.visibilityField] ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {field.id === "newPassword" && (
              <FormHelperText
                sx={{ color: "text.secondary", fontSize: "0.75rem", mt: 0.5 }}
              >
                Password must be at least 8 characters long and contain at least
                one letter, one number, and one special character.
              </FormHelperText>
            )}
          </Grid>
        );
      } else {
        return (
          <Grid item xs={12} sm={6} key={field.id}>
            <TextField
              fullWidth
              label={field.label}
              value={profile[section][field.id]}
              onChange={(e) =>
                handleInputChange(section, field.id, e.target.value)
              }
              disabled={isDisabled}
              variant={editModes[section] ? "outlined" : "filled"}
              type={field.type || "text"}
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>
        );
      }
    });
  };

  const personalFields = [
    { id: "firstName", label: "First Name" },
    { id: "lastName", label: "Last Name" },
    { id: "email", label: "Email" },
    { id: "mobile", label: "Mobile", type: "tel" },
    { id: "company", label: "Company" },
    {
      id: "departmentId",
      label: "Department",
      type: "select",
      options: departmentList.data?.data || [],
    },
    {
      id: "designationId",
      label: "Designation",
      type: "select",
      options: filteredDesignations,
    },
  ];

  const addressFields = [
    { id: "address", label: "Address" },
    { id: "city", label: "City" },
    { id: "state", label: "State" },
    { id: "country", label: "Country" },
    { id: "postalCode", label: "Postal Code", type: "tel" },
  ];

  const passwordFields = [
    {
      id: "currentPassword",
      label: "Current Password",
      type: "password",
      visibilityField: "current",
    },
    {
      id: "newPassword",
      label: "New Password",
      type: "password",
      visibilityField: "new",
    },
    {
      id: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      visibilityField: "confirm",
    },
  ];

  const isPasswordFormValid =
    profile.password.currentPassword &&
    profile.password.newPassword &&
    profile.password.confirmPassword &&
    !passwordError;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        My Profile
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            <Avatar
              src={imagePreview || profileImage}
              alt="Profile"
              sx={{
                width: 150,
                height: 150,
                mx: "auto",
                mb: 2,
                border: "4px solid #f0f0f0",
                objectFit: "cover",
              }}
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/jpeg, image/png"
              style={{ display: "none" }}
            />
            {!imagePreview && (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <PrimaryButton
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={triggerFileInput}
                  >
                    Upload
                  </PrimaryButton>
                  {profileImage !== "/default-avatar.png" && (
                    <PrimaryButton
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleDeleteClick}
                      size="small"
                    >
                      Delete
                    </PrimaryButton>
                  )}
                </Box>
              </>
            )}
            {imagePreview && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
                <PrimaryButton
                  variant="contained"
                  color="primary"
                  startIcon={
                    isUploading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  onClick={handleImageUploadToAPI}
                  disabled={isUploading}
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  {isUploading ? "Uploading..." : "Save"}
                </PrimaryButton>
                <PrimaryButton
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleImagePreviewDelete}
                >
                  Cancel
                </PrimaryButton>
              </Box>
            )}
            <Typography
              variant="caption"
              display="block"
              gutterBottom
              color="text.secondary"
            >
              JPG/PNG, max 2MB
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              mb: 3,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            <CardHeader
              title="Personal Information"
              titleTypographyProps={{ fontWeight: 600 }}
              action={
                <PrimaryButton
                  variant={editModes.personal ? "outlined" : "contained"}
                  startIcon={editModes.personal ? <CancelIcon /> : <EditIcon />}
                  onClick={() => toggleEditMode("personal")}
                >
                  {editModes.personal ? "Cancel" : "Edit"}
                </PrimaryButton>
              }
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                {renderFormFields("personal", personalFields, [
                  "email",
                  "company",
                  "departmentId",
                  "designationId",
                ])}
                {editModes.personal && (
                  <Grid
                    item
                    xs={12}
                    sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={() => handleSaveChanges("personal")}
                      disabled={updateUserProfile.isLoading}
                      size="small"
                      sx={{ borderRadius: 2 }}
                    >
                      {updateUserProfile.isLoading
                        ? "Saving..."
                        : "Save Changes"}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
          <Card
            sx={{
              mb: 3,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            <CardHeader
              title="Address Information"
              titleTypographyProps={{ fontWeight: 600 }}
              action={
                <PrimaryButton
                  variant={editModes.address ? "outlined" : "contained"}
                  startIcon={editModes.address ? <CancelIcon /> : <EditIcon />}
                  onClick={() => toggleEditMode("address")}
                >
                  {editModes.address ? "Cancel" : "Edit"}
                </PrimaryButton>
              }
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                {renderFormFields("address", addressFields)}
                {editModes.address && (
                  <Grid
                    item
                    xs={12}
                    sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
                  >
                    <PrimaryButton
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={() => handleSaveChanges("address")}
                      disabled={updateUserProfile.isLoading}
                    >
                      {updateUserProfile.isLoading
                        ? "Saving..."
                        : "Save Changes"}
                    </PrimaryButton>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 2,
                pt: 2,
              }}
            >
              <CardHeader
                title="Change Password"
                titleTypographyProps={{ fontWeight: 600 }}
                sx={{ p: 0 }}
              />
              {!editModes.password && (
                <PrimaryButton
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => toggleEditMode("password")}
                >
                  Change
                </PrimaryButton>
              )}
            </Box>
            <Divider />
            <CardContent sx={{ pt: 2 }}>
              {editModes.password ? (
                <Grid container spacing={2}>
                  {renderFormFields("password", passwordFields)}
                  {passwordError && (
                    <Grid item xs={12}>
                      <Alert severity="error">{passwordError}</Alert>
                    </Grid>
                  )}
                  <Grid
                    item
                    xs={12}
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 1,
                      mt: 1,
                    }}
                  >
                    <PrimaryButton
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handlePasswordChange}
                      disabled={
                        !isPasswordFormValid || changePassword.isLoading
                      }
                    >
                      {changePassword.isLoading
                        ? "Updating..."
                        : "Update Password"}
                    </PrimaryButton>
                    <PrimaryButton
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={() => toggleEditMode("password")}
                    >
                      Cancel
                    </PrimaryButton>
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type="password"
                      value="•••••••••"
                      disabled
                      variant="filled"
                      size="small"
                      sx={{ "& .MuiFilledInput-root": { borderRadius: 2 } }}
                    />
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <DialogContainer
        open={deleteModalOpen}
        onClose={handleDeleteCancel}
        title="Confirm Deletion"
        maxWidth="sm"
        actions={
          <>
            <PrimaryButton variant="outlined" onClick={handleDeleteCancel}>
              Cancel
            </PrimaryButton>
            <PrimaryButton
              variant="outlined"
              onClick={handleDeleteConfirm}
              color="error"
              disabled={isDeleting}
              startIcon={<DeleteIcon />}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </PrimaryButton>
          </>
        }
      >
        <Typography>
          Are you sure you want to delete your profile picture?
        </Typography>
      </DialogContainer>
    </Box>
  );
};

export default ProfilePage;
