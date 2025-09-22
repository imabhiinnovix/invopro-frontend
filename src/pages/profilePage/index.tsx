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
// import { GET, PUT, POST } from "../../services/apiRoutes";
// import { useSelector } from "react-redux";
// import { RootState } from "../../reducers";

// const ProfilePage = () => {
//   // State for profile data
//   const userProfile = useSelector(
//     (state: RootState) => state.userPermission?.currentUser
//   );
//   console.log("userProfile", userProfile);
// //   const [profile, setProfile] = useState({
// //     personal: {
// //       firstName: userProfile?.firstName,
// //       lastName: userProfile?.lastName,
// //       email: userProfile?.email,
// //       phone: userProfile?.phone || "",
// //       company: userProfile?.organizationId?.name
// // ,
// //       departmentId: "", // Will store department ID
// //       designationId: "", // Will store designation ID
// //     },
// //     address: {
// //       address: "123 Main St",
// //       city: "New York",
// //       state: "NY",
// //       country: "United States",
// //     },
// //     password: {
// //       currentPassword: "",
// //       newPassword: "",
// //       confirmPassword: "",
// //     },
// //   });

//   // State for edit modes
  
//     const [profile, setProfile] = useState({
//     personal: {
//       firstName: userProfile?.firstName || "",
//       lastName: userProfile?.lastName || "",
//       email: userProfile?.email || "",
//       phone: userProfile?.phone || "",
//       company: userProfile?.organizationId?.name || "",
//       departmentId: userProfile?.departmentId?._id || "", // Store department ID
//       designationId: userProfile?.designationId?._id || "", // Store designation ID
//     },
//     address: {
//       address: userProfile?.address || "", // Use user's address if available
//       city: userProfile?.city || "", // Use user's city if available
//       state: userProfile?.state || "", // Add state field
//       country: userProfile?.country || "", // Use user's country if available
//     },
//     password: {
//       currentPassword: "",
//       newPassword: "",
//       confirmPassword: "",
//     },
//   });
//   const [editModes, setEditModes] = useState({
//     personal: false,
//     address: false,
//     password: false,
//   });

//   // State for password visibility
//   const [passwordVisibility, setPasswordVisibility] = useState({
//     current: false,
//     new: false,
//     confirm: false,
//   });

//   // State for profile image
//   const [profileImage, setProfileImage] = useState("/default-avatar.png");
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const fileInputRef = useRef(null);

//   // State for delete confirmation modal
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);

//   // State for selected department
//   const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

//   // State for password change
//   const [passwordError, setPasswordError] = useState("");

//   // State for file upload
//   const [fileName, setFileName] = useState<string | null>(null);
//   const [isUploading, setIsUploading] = useState(false);

//   // Fetch departments
//   const departmentList = useGet<{
//     success: boolean;
//     data: any[];
//   }>(["departmentList"], GET?.DEPARTMENT_LIST, true);

//   // Fetch all designations
//   const designationList = useGet<{
//     success: boolean;
//     data: any[];
//   }>(["designationList"], GET?.DESIGNATION_LIST, true);

//   // Initialize usePut hook for password change
//   const changePassword = usePut(["changePassword"]);

//   // Initialize usePut hook for image deletion (using usePut for DELETE request)
//   const deleteImage = usePut(["deleteImage"]);

//   // Initialize useFilePostData hook for image upload
//   const uploadImage = useFilePostData<
//     { files: File; operation: string },
//     { message: string; data?: any }
//   >(
//     ["uploadProfileImage"],
//     (data) => {
//       // Handle successful upload
//       toast.success("Profile picture uploaded successfully!");
//     },
//     { showToast: false } // We'll handle toasts manually
//   );

//   // Filter designations based on selected department
//   const filteredDesignations = selectedDepartmentId
//     ? designationList.data?.data?.filter(
//         (designation) => designation.departmentId._id === selectedDepartmentId
//       ) || []
//     : [];

//   // Handle department change
//   const handleDepartmentChange = (e) => {
//     const departmentId = e.target.value;
//     setSelectedDepartmentId(departmentId);
//     handleInputChange("personal", "departmentId", departmentId);
//     // Reset designation when department changes
//     handleInputChange("personal", "designationId", "");
//   };

//   // Handle input changes
//   const handleInputChange = (section, field, value) => {
//     setProfile((prev) => ({
//       ...prev,
//       [section]: {
//         ...prev[section],
//         [field]: value,
//       },
//     }));

//     // Clear password error when user types in password fields
//     if (section === "password") {
//       setPasswordError("");
//     }
//   };

//   // Toggle edit mode
//   const toggleEditMode = (section) => {
//     // Special handling for password section
//     if (section === "password") {
//       // If entering edit mode, clear the current password field for user input
//       if (!editModes.password) {
//         setProfile((prev) => ({
//           ...prev,
//           password: {
//             currentPassword: "",
//             newPassword: "",
//             confirmPassword: "",
//           },
//         }));
//         setPasswordError("");
//       } else {
//         // If exiting edit mode, reset password fields
//         setProfile((prev) => ({
//           ...prev,
//           password: {
//             currentPassword: "",
//             newPassword: "",
//             confirmPassword: "",
//           },
//         }));
//         setPasswordError("");
//       }
//     }

//     setEditModes((prev) => ({
//       ...prev,
//       [section]: !prev[section],
//     }));
//   };

//   // Toggle password visibility
//   const togglePasswordVisibility = (field) => {
//     setPasswordVisibility((prev) => ({
//       ...prev,
//       [field]: !prev[field],
//     }));
//   };

//   // Validate passwords
//   const validatePasswords = () => {
//     const { newPassword, confirmPassword } = profile.password;

//     if (newPassword !== confirmPassword) {
//       setPasswordError("Passwords do not match");
//       return false;
//     }

//     // Check password strength
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

//   // Handle password change
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
//         // Exit edit mode after successful password change
//         setTimeout(() => {
//           toggleEditMode("password");
//         }, 1500);
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

//   // Handle image upload
//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Validate file type
//       if (!file.type.match("image/jpeg") && !file.type.match("image/png")) {
//         toast.error("Only JPG or PNG files are allowed");
//         return;
//       }

//       // Validate file size (2MB = 2 * 1024 * 1024 bytes)
//       if (file.size > 2 * 1024 * 1024) {
//         toast.error("Image size must be at most 2MB");
//         return;
//       }

//       // Set file name and create preview
//       setFileName(file.name);

//       // Create preview URL
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         setImagePreview(event.target.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // Handle image upload to API
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
//         // If the API returns an image URL, use it
//         if (response.data && response.data.imageUrl) {
//           setProfileImage(response.data.imageUrl);
//         } else {
//           // Otherwise, keep the preview
//           if (imagePreview) {
//             setProfileImage(imagePreview);
//           }
//         }

//         // toast.success("Profile picture uploaded successfully!");
//         setImagePreview(null);
//         setFileName(null);
//         // Reset file input
//         if (fileInputRef.current) {
//           fileInputRef.current.value = "";
//         }
//       } else {
//         throw new Error(response.message || "Failed to upload profile picture");
//       }
//     } catch (error) {
//       console.error("Image upload error:", error);
//       toast.error(
//         error.message || "Failed to upload profile picture. Please try again."
//       );
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   // Handle image preview deletion
//   const handleImagePreviewDelete = () => {
//     setImagePreview(null);
//     setFileName(null);
//     // Reset file input
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   // Trigger file input click
//   const triggerFileInput = () => {
//     fileInputRef.current.click();
//   };

//   // Handle delete button click (opens confirmation modal)
//   const handleDeleteClick = () => {
//     setDeleteModalOpen(true);
//   };

//   // Handle image delete confirmation
//   const handleDeleteConfirm = async () => {
//     setIsDeleting(true);

//     try {
//       // Make DELETE API call to /common/user/image
//       const response = await deleteImage.mutateAsync({
//         url: DELETE.USER_IMAGE,
//         method: "DELETE", // Explicitly set method to DELETE
//       });

//       if (response.success) {
//         // Reset to default avatar
//         setProfileImage("/default-avatar.png");
//         setImagePreview(null);
//         setFileName(null);
//         setDeleteModalOpen(false);
//         toast.success("Profile picture deleted successfully");
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

//   // Handle delete cancellation
//   const handleDeleteCancel = () => {
//     setDeleteModalOpen(false);
//   };

//   // Render form fields
//   const renderFormFields = (section, fields) => {
//     return fields.map((field) => {
//       if (field.type === "select") {
//         return (
//           <Grid item xs={12} sm={6} key={field.id}>
//             <FormControl
//               fullWidth
//               disabled={!editModes[section]}
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
//               disabled={!editModes[section]}
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
//                       disabled={!editModes[section]}
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
//             {/* Add password requirements helper text for new password field */}
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
//               disabled={!editModes[section]}
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

//   // Section configuration
//   const personalFields = [
//     { id: "firstName", label: "First Name" },
//     { id: "lastName", label: "Last Name" },
//     { id: "email", label: "Email" },
//     { id: "phone", label: "Phone" },
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

//   // Check if password form is valid
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
//         {/* Profile Image Section */}
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

//             {/* Show upload and delete buttons when no image is selected */}
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
//                   <Button
//                     variant="outlined"
//                     color="error"
//                     startIcon={<DeleteIcon />}
//                     onClick={handleDeleteClick}
//                     size="small"
//                     sx={{ borderRadius: 2 }}
//                   >
//                     Delete
//                   </Button>
//                 </Box>
//               </>
//             )}

//             {/* Show save and cancel buttons when image is selected */}
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

//         {/* Form Sections */}
//         <Grid item xs={12} md={8}>
//           {/* Personal Information Section */}
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
//                 {renderFormFields("personal", personalFields)}
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
//                       onClick={() => toggleEditMode("personal")}
//                       size="small"
//                       sx={{ borderRadius: 2 }}
//                     >
//                       Save Changes
//                     </Button>
//                   </Grid>
//                 )}
//               </Grid>
//             </CardContent>
//           </Card>

//           {/* Address Information Section */}
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
//                       onClick={() => toggleEditMode("address")}
//                       size="small"
//                       sx={{ borderRadius: 2 }}
//                     >
//                       Save Changes
//                     </Button>
//                   </Grid>
//                 )}
//               </Grid>
//             </CardContent>
//           </Card>

//           {/* Change Password Section */}

//           <Card
//             sx={{
//               borderRadius: 3,
//               boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
//             }}
//           >
//             {/* Header */}
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
//                 titleTypographyProps={{
//                   fontWeight: 600,
//                 }}
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

//             {/* Body */}
//             <CardContent sx={{ pt: 2 }}>
//               {editModes.password ? (
//                 // Edit Mode
//                 <Grid container spacing={2}>
//                   {renderFormFields("password", passwordFields)}

//                   {/* Password Error Message */}
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
//                 // View Mode
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
//                       sx={{
//                         "& .MuiFilledInput-root": { borderRadius: 2 },
//                       }}
//                     />
//                   </Grid>
//                 </Grid>
//               )}
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Delete Confirmation Modal */}
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
import { GET, PUT, POST, DELETE } from "../../services/apiRoutes"; // Added DELETE import
import { useSelector } from "react-redux";
import { RootState } from "../../reducers";

const ProfilePage = () => {
  // State for profile data
  const userProfile = useSelector(
    (state: RootState) => state.userPermission?.currentUser
  );
  console.log("userProfile", userProfile);

  // Initialize state with empty values
  const [profile, setProfile] = useState({
    personal: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      departmentId: "",
      designationId: "",
    },
    address: {
      address: "",
      city: "",
      state: "",
      country: "",
    },
    password: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // State for profile image
  const [profileImage, setProfileImage] = useState("/default-avatar.png");
  
  // State for selected department
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

  // Update profile state when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setProfile({
        personal: {
          firstName: userProfile?.firstName || "",
          lastName: userProfile?.lastName || "",
          email: userProfile?.email || "",
          phone: userProfile?.phone || "",
          company: userProfile?.organizationId?.name || "",
          departmentId: userProfile?.departmentId?._id || "",
          designationId: userProfile?.designationId?._id || "",
        },
        address: {
          address: userProfile?.address || "",
          city: userProfile?.city || "",
          state: userProfile?.state || "",
          country: userProfile?.country || "",
        },
        password: {
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        },
      });
      
      // Set profile image
      setProfileImage(userProfile?.imagePath || "/default-avatar.png");
      
      // Set selected department
      setSelectedDepartmentId(userProfile?.departmentId?._id || "");
    }
  }, [userProfile]);

  // State for edit modes
  const [editModes, setEditModes] = useState({
    personal: false,
    address: false,
    password: false,
  });

  // State for password visibility
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef(null);

  // State for delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // State for password change
  const [passwordError, setPasswordError] = useState("");

  // State for file upload
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch departments
  const departmentList = useGet<{
    success: boolean;
    data: any[];
  }>(["departmentList"], GET?.DEPARTMENT_LIST, true);

  // Fetch all designations
  const designationList = useGet<{
    success: boolean;
    data: any[];
  }>(["designationList"], GET?.DESIGNATION_LIST, true);

  // Initialize usePut hook for password change
  const changePassword = usePut(["changePassword"]);

  // Initialize usePut hook for image deletion (using usePut for DELETE request)
  const deleteImage = usePut(["deleteImage"]);

  // Initialize useFilePostData hook for image upload
  const uploadImage = useFilePostData<
    { files: File; operation: string },
    { message: string; data?: any }
  >(
    ["uploadProfileImage"],
    (data) => {
      // Handle successful upload
      toast.success("Profile picture uploaded successfully!");
    },
    { showToast: false } // We'll handle toasts manually
  );

  // Filter designations based on selected department
  const filteredDesignations = selectedDepartmentId
    ? designationList.data?.data?.filter(
        (designation) => designation.departmentId._id === selectedDepartmentId
      ) || []
    : [];

  // Handle department change
  const handleDepartmentChange = (e) => {
    const departmentId = e.target.value;
    setSelectedDepartmentId(departmentId);
    handleInputChange("personal", "departmentId", departmentId);
    // Reset designation when department changes
    handleInputChange("personal", "designationId", "");
  };

  // Handle input changes
  const handleInputChange = (section, field, value) => {
    setProfile((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    // Clear password error when user types in password fields
    if (section === "password") {
      setPasswordError("");
    }
  };

  // Toggle edit mode
  const toggleEditMode = (section) => {
    // Special handling for password section
    if (section === "password") {
      // If entering edit mode, clear the current password field for user input
      if (!editModes.password) {
        setProfile((prev) => ({
          ...prev,
          password: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          },
        }));
        setPasswordError("");
      } else {
        // If exiting edit mode, reset password fields
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
    }

    setEditModes((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Validate passwords
  const validatePasswords = () => {
    const { newPassword, confirmPassword } = profile.password;

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }

    // Check password strength
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

  // Handle password change
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
        // Exit edit mode after successful password change
        setTimeout(() => {
          toggleEditMode("password");
        }, 1500);
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

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match("image/jpeg") && !file.type.match("image/png")) {
        toast.error("Only JPG or PNG files are allowed");
        return;
      }

      // Validate file size (2MB = 2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be at most 2MB");
        return;
      }

      // Set file name and create preview
      setFileName(file.name);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image upload to API
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
        // If the API returns an image URL, use it
        if (response.data && response.data.imageUrl) {
          setProfileImage(response.data.imageUrl);
        } else {
          // Otherwise, keep the preview
          if (imagePreview) {
            setProfileImage(imagePreview);
          }
        }

        // toast.success("Profile picture uploaded successfully!");
        setImagePreview(null);
        setFileName(null);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        throw new Error(response.message || "Failed to upload profile picture");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(
        error.message || "Failed to upload profile picture. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Handle image preview deletion
  const handleImagePreviewDelete = () => {
    setImagePreview(null);
    setFileName(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Handle delete button click (opens confirmation modal)
  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  // Handle image delete confirmation
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);

    try {
      // Make DELETE API call to /common/user/image
      const response = await deleteImage.mutateAsync({
        url: DELETE.USER_IMAGE,
        method: "DELETE", // Explicitly set method to DELETE
      });

      if (response.success) {
        // Reset to default avatar
        setProfileImage("/default-avatar.png");
        setImagePreview(null);
        setFileName(null);
        setDeleteModalOpen(false);
        toast.success("Profile picture deleted successfully");
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

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
  };

  // Render form fields
  const renderFormFields = (section, fields) => {
    return fields.map((field) => {
      if (field.type === "select") {
        return (
          <Grid item xs={12} sm={6} key={field.id}>
            <FormControl
              fullWidth
              disabled={!editModes[section]}
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
              disabled={!editModes[section]}
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
                      disabled={!editModes[section]}
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
            {/* Add password requirements helper text for new password field */}
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
              disabled={!editModes[section]}
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

  // Section configuration
  const personalFields = [
    { id: "firstName", label: "First Name" },
    { id: "lastName", label: "Last Name" },
    { id: "email", label: "Email" },
    { id: "phone", label: "Phone" },
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

  // Check if password form is valid
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
        {/* Profile Image Section */}
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

            {/* Show upload and delete buttons when no image is selected */}
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
                  <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={triggerFileInput}
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    Upload
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDeleteClick}
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    Delete
                  </Button>
                </Box>
              </>
            )}

            {/* Show save and cancel buttons when image is selected */}
            {imagePreview && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
                <Button
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
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleImagePreviewDelete}
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  Cancel
                </Button>
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

        {/* Form Sections */}
        <Grid item xs={12} md={8}>
          {/* Personal Information Section */}
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
                <Button
                  variant={editModes.personal ? "outlined" : "contained"}
                  startIcon={editModes.personal ? <CancelIcon /> : <EditIcon />}
                  onClick={() => toggleEditMode("personal")}
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  {editModes.personal ? "Cancel" : "Edit"}
                </Button>
              }
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                {renderFormFields("personal", personalFields)}
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
                      onClick={() => toggleEditMode("personal")}
                      size="small"
                      sx={{ borderRadius: 2 }}
                    >
                      Save Changes
                    </Button>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Address Information Section */}
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
                <Button
                  variant={editModes.address ? "outlined" : "contained"}
                  startIcon={editModes.address ? <CancelIcon /> : <EditIcon />}
                  onClick={() => toggleEditMode("address")}
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  {editModes.address ? "Cancel" : "Edit"}
                </Button>
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
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={() => toggleEditMode("address")}
                      size="small"
                      sx={{ borderRadius: 2 }}
                    >
                      Save Changes
                    </Button>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Change Password Section */}

          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            {/* Header */}
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
                titleTypographyProps={{
                  fontWeight: 600,
                }}
                sx={{ p: 0 }}
              />

              {!editModes.password && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => toggleEditMode("password")}
                  size="small"
                  sx={{ borderRadius: 2, mb: 1 }}
                >
                  Change
                </Button>
              )}
            </Box>

            <Divider />

            {/* Body */}
            <CardContent sx={{ pt: 2 }}>
              {editModes.password ? (
                // Edit Mode
                <Grid container spacing={2}>
                  {renderFormFields("password", passwordFields)}

                  {/* Password Error Message */}
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
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handlePasswordChange}
                      disabled={
                        !isPasswordFormValid || changePassword.isLoading
                      }
                      size="small"
                      sx={{ borderRadius: 2 }}
                    >
                      {changePassword.isLoading
                        ? "Updating..."
                        : "Update Password"}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={() => toggleEditMode("password")}
                      size="small"
                      sx={{ borderRadius: 2 }}
                    >
                      Cancel
                    </Button>
                  </Grid>
                </Grid>
              ) : (
                // View Mode
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
                      sx={{
                        "& .MuiFilledInput-root": { borderRadius: 2 },
                      }}
                    />
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModalOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-confirmation-title"
        aria-describedby="delete-confirmation-description"
      >
        <DialogTitle id="delete-confirmation-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your profile picture?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteCancel}
            color="primary"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            autoFocus
            disabled={isDeleting}
            startIcon={<DeleteIcon />}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;