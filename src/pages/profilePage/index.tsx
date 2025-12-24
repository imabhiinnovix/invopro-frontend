import React, { useState, useRef, useEffect, useContext } from "react";
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
import { checkPermission } from "../../utils/utils";
import { PermissionsMap } from "../../utils/constants";
import { AuthContext } from "../../context/AuthContext";

const ProfilePage = () => {
  const userProfile = useSelector(
    (state: RootState) => state.userPermission?.currentUser
  );
  const dispatch = useDispatch();
  const { refreshUserDetails } = useContext(AuthContext);

  const userDetailsAPI = useGet<UserResponse>(
    ["userDetails"],
    GET.USER_DETAILS
  );

  const permissions = useSelector(
    (state: RootState) => state.userPermission.permissions
  );
  const shouldAllowDelete = checkPermission(
    permissions,
    PermissionsMap.USER_PROFILE_IMAGE,
    "delete"
  );
  const shouldAllowView = checkPermission(
    permissions,
    PermissionsMap.USER_PROFILE_IMAGE,
    "get"
  );
  // const shouldAllowUpload = checkPermission(
  //   permissions,
  //   PermissionsMap.FILE_UPLOAD,
  //   "upload"
  // );

  const [profile, setProfile] = useState({
    personal: {
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      company: "",
      departmentId: "",
      designationId: "",
      businessUnit: [],
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

  const [originalProfile, setOriginalProfile] = useState({
    personal: {
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      company: "",
      departmentId: "",
      designationId: "",
      businessUnit: [],
    },
    address: {
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
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
  const [isEditingProfilePic, setIsEditingProfilePic] = useState(false);

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
      const newProfile = {
        personal: {
          firstName: userProfile?.firstName || "",
          lastName: userProfile?.lastName || "",
          email: userProfile?.email || "",
          mobile: userProfile?.mobile || "",
          company: userProfile?.organizationId?.name || "",
          departmentId: userProfile?.departmentId?._id || "",
          designationId: userProfile?.designationId?._id || "",
          businessUnit:
            userProfile?.businessUnit?.map((unit) => unit.name)?.join(", ") ||
            "",
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
      };

      setProfile(newProfile);
      setOriginalProfile({
        personal: { ...newProfile.personal },
        address: { ...newProfile.address },
      });
      if (shouldAllowView) {
        setProfileImage(userProfile?.imagePath || "/default-avatar.png");
      }
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
    if (field === "mobile" || field === "postalCode") {
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
    } else {
      // Save current values as original when entering edit mode
      if (!editModes[section]) {
        setOriginalProfile((prev) => ({
          ...prev,
          [section]: { ...profile[section] },
        }));
      }
    }
    setEditModes((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCancel = (section) => {
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
    } else {
      // Restore original values
      setProfile((prev) => ({
        ...prev,
        [section]: { ...originalProfile[section] },
      }));
    }
    setEditModes((prev) => ({
      ...prev,
      [section]: false,
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
    refreshUserDetails();
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

        setEditModes((prev) => ({
          ...prev,
          [section]: false,
        }));

        // Update originalProfile with saved values
        setOriginalProfile((prev) => ({
          ...prev,
          [section]: { ...profile[section] },
        }));

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
        // toast.success("Profile picture uploaded successfully!");

        setImagePreview(null);
        setFileName(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

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
      setIsEditingProfilePic(false);
    }
  };

  const handleImagePreviewDelete = () => {
    setImagePreview(null);
    setFileName(null);
    setIsEditingProfilePic(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
    setIsEditingProfilePic(false);
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

        setImagePreview(null);
        setFileName(null);
        setDeleteModalOpen(false);

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

  const renderFormFields = (section, fields, disabledFields: string[] = []) => {
    return fields.map((field) => {
      const isDisabled =
        disabledFields.includes(field.id) || !editModes[section];
      if (field.type === "select") {
        return (
          <Grid item xs={12} sm={6} key={field.id}>
            <FormControl
              fullWidth
              disabled={isDisabled}
              variant={
                editModes[section] && !isDisabled ? "outlined" : "filled"
              }
              size="small"
              sx={{
                "& .MuiFilledInput-root": {
                  backgroundColor: isDisabled ? "#f7f7f7" : undefined,
                  borderRadius: 2,
                  "&:before": {
                    border: "none",
                  },
                  "&:after": {
                    border: "none",
                  },
                },

                "& .MuiFilledInput-root.Mui-disabled": {
                  backgroundColor: "#f0f0f0 !important",
                  color: "#333",
                  WebkitTextFillColor: "#333 !important",
                  "&:before": {
                    border: "none",
                  },
                },

                "& .MuiInputLabel-root.Mui-disabled": {
                  color: "#777",
                  "&:before": {
                    border: "none",
                  },
                },
              }}
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
              sx={{
                "& .MuiFilledInput-root": {
                  backgroundColor: isDisabled ? "#f7f7f7" : undefined,
                  borderRadius: 2,
                  "&:before": {
                    border: "none",
                  },
                },

                "& .MuiFilledInput-root.Mui-disabled": {
                  backgroundColor: "#f0f0f0 !important",
                  color: "#333",
                  WebkitTextFillColor: "#333 !important",
                  "&:before": {
                    border: "none",
                  },
                },

                "& .MuiInputLabel-root.Mui-disabled": {
                  color: "#777",
                  "&:before": {
                    border: "none",
                  },
                },
              }}
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
              multiline
              maxRows={1}
              label={field.label}
              value={profile[section][field.id]}
              onChange={(e) =>
                handleInputChange(section, field.id, e.target.value)
              }
              disabled={isDisabled}
              variant={
                editModes[section] && !isDisabled ? "outlined" : "filled"
              }
              type={field.type || "text"}
              size="small"
              sx={{
                "& .MuiFilledInput-root": {
                  backgroundColor: isDisabled ? "#f7f7f7" : undefined,
                  borderRadius: 2,
                  "&:before": {
                    border: "none",
                  },
                  "&:after": {
                    border: "none",
                  },
                },
                "& .MuiFilledInput-root.Mui-disabled": {
                  backgroundColor: "#f0f0f0 !important",
                  color: "#333",
                  WebkitTextFillColor: "#333 !important",
                  "&:before": {
                    border: "none",
                  },
                },
                "& .MuiInputLabel-root.Mui-disabled": {
                  color: "#777",
                  "&:before": {
                    border: "none",
                  },
                },
              }}
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
    { id: "company", label: "Organization" },
    {
      id: "businessUnit",
      label: "Business Unit",
    },
    { id: "mobile", label: "Mobile", type: "tel" },
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

            {!imagePreview && !isEditingProfilePic && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
                {/* {shouldAllowUpload && ( */}
                <PrimaryButton
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditingProfilePic(true)}
                >
                  Edit
                </PrimaryButton>
                {/* )} */}
              </Box>
            )}
            {!imagePreview && isEditingProfilePic && (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  {/* {shouldAllowUpload && ( */}
                  <PrimaryButton
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={triggerFileInput}
                  >
                    Upload
                  </PrimaryButton>
                  {/* )} */}
                  {profileImage !== "/default-avatar.png" &&
                    shouldAllowDelete && (
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
                    startIcon={<CancelIcon />}
                    onClick={() => setIsEditingProfilePic(false)}
                    size="small"
                  >
                    Cancel
                  </PrimaryButton>
                </Box>
              </>
            )}
            {imagePreview && !isEditingProfilePic && (
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
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditingProfilePic(true)}
                >
                  Edit
                </PrimaryButton>
              </Box>
            )}
            {imagePreview && isEditingProfilePic && (
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
                  onClick={() =>
                    editModes.personal
                      ? handleCancel("personal")
                      : toggleEditMode("personal")
                  }
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
                  "firstName",
                  "lastName",
                  "email",
                  "company",
                  "businessUnit",
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
                  onClick={() =>
                    editModes.address
                      ? handleCancel("address")
                      : toggleEditMode("address")
                  }
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
            <CardHeader
              title="Change Password"
              titleTypographyProps={{ fontWeight: 600 }}
              action={
                !editModes.password ? (
                  <PrimaryButton
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => toggleEditMode("password")}
                  >
                    Change
                  </PrimaryButton>
                ) : (
                  <></>
                )
              }
              sx={{ pb: 1 }}
            />
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
                      onClick={() => handleCancel("password")}
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
                      sx={{
                        "& .MuiFilledInput-root": {
                          borderRadius: 2,
                          "&:before": {
                            border: "none",
                          },
                          "&:after": {
                            border: "none",
                          },
                        },

                        "& .MuiFilledInput-root.Mui-disabled": {
                          backgroundColor: "#f0f0f0 !important",
                          color: "#333",
                          WebkitTextFillColor: "#333 !important",
                        },

                        "& .MuiInputLabel-root.Mui-disabled": {
                          color: "#777",
                        },
                      }}
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
            {/* <PrimaryButton variant="outlined" onClick={handleDeleteCancel}>
              Cancel
            </PrimaryButton> */}
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
