import React, { useState, useRef } from 'react';
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
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';

const ProfilePage = () => {
  // State for profile data
  const [profile, setProfile] = useState({
    personal: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      company: 'Acme Corporation',
      designation: 'Manager',
      department: 'Engineering',
    },
    address: {
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'United States',
    },
  });

  // State for edit modes
  const [editModes, setEditModes] = useState({
    personal: false,
    address: false,
    photo: false,
  });

  // State for profile image
  const [profileImage, setProfileImage] = useState('/default-avatar.png');
  const fileInputRef = useRef(null);

  // Designation options
  const designationOptions = [
    'Manager',
    'Developer',
    'Designer',
    'Analyst',
    'Consultant',
    'Director',
    'Executive',
    'Specialist',
    'Coordinator',
    'Other',
  ];

  // Department options
  const departmentOptions = [
    'Engineering',
    'Marketing',
    'Sales',
    'Human Resources',
    'Finance',
    'Operations',
    'Customer Support',
    'Research & Development',
    'Legal',
    'Other',
  ];

  // Country options (simplified for example)
  const countryOptions = [
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'Germany',
    'France',
    'Japan',
    'India',
    'China',
    'Other',
  ];

  // Handle input changes
  const handleInputChange = (section, field, value) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // Toggle edit mode
  const toggleEditMode = (section) => {
    setEditModes(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
        alert('Only JPG or PNG files are allowed');
        return;
      }

      // Validate file size (max 450x450)
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        if (img.width > 450 || img.height > 450) {
          alert('Image dimensions must be at most 450x450 pixels');
          return;
        }

        // Create preview URL
        const reader = new FileReader();
        reader.onload = (event) => {
          setProfileImage(event.target.result);
          toggleEditMode('photo');
        };
        reader.readAsDataURL(file);
      };
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Handle image delete
  const handleImageDelete = () => {
    setProfileImage('/default-avatar.png');
    toggleEditMode('photo');
  };

  // Render form fields
  const renderFormFields = (section, fields) => {
    return fields.map((field) => {
      if (field.type === 'select') {
        return (
          <Grid item xs={12} sm={6} key={field.id}>
            <FormControl fullWidth disabled={!editModes[section]} variant={editModes[section] ? "outlined" : "filled"}>
              <InputLabel>{field.label}</InputLabel>
              <Select
                value={profile[section][field.id]}
                label={field.label}
                onChange={(e) => handleInputChange(section, field.id, e.target.value)}
              >
                {field.options.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        );
      } else {
        return (
          <Grid item xs={12} sm={6} key={field.id}>
            <TextField
              fullWidth
              label={field.label}
              value={profile[section][field.id]}
              onChange={(e) => handleInputChange(section, field.id, e.target.value)}
              disabled={!editModes[section]}
              variant={editModes[section] ? "outlined" : "filled"}
              type={field.type || 'text'}
            />
          </Grid>
        );
      }
    });
  };

  // Section configuration
  const personalFields = [
    { id: 'firstName', label: 'First Name' },
    { id: 'lastName', label: 'Last Name' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Phone' },
    { id: 'company', label: 'Company' },
    { 
      id: 'designation', 
      label: 'Designation', 
      type: 'select',
      options: designationOptions 
    },
    { 
      id: 'department', 
      label: 'Department', 
      type: 'select',
      options: departmentOptions 
    },
  ];

  const addressFields = [
    { id: 'address', label: 'Address' },
    { id: 'city', label: 'City' },
    { id: 'state', label: 'State' },
    { 
      id: 'country', 
      label: 'Country', 
      type: 'select',
      options: countryOptions 
    },
  ];

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>
      
      <Grid container spacing={4}>
        {/* Profile Image Section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              src={profileImage}
              alt="Profile"
              sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
            />
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/jpeg, image/png"
              style={{ display: 'none' }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={triggerFileInput}
                disabled={editModes.photo}
              >
                Upload
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleImageDelete}
                disabled={editModes.photo}
              >
                Delete
              </Button>
            </Box>
            
            <Typography variant="caption" display="block" gutterBottom>
              JPG/PNG, max 450×450 pixels
            </Typography>
            
            {editModes.photo && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={() => toggleEditMode('photo')}
                >
                  Update
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => toggleEditMode('photo')}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Form Sections */}
        <Grid item xs={12} md={8}>
          {/* Personal Information Section */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Personal Information"
              action={
                <Button
                  variant={editModes.personal ? "outlined" : "contained"}
                  startIcon={editModes.personal ? <CancelIcon /> : <EditIcon />}
                  onClick={() => toggleEditMode('personal')}
                >
                  {editModes.personal ? 'Cancel' : 'Edit'}
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                {renderFormFields('personal', personalFields)}
                {editModes.personal && (
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={() => toggleEditMode('personal')}
                    >
                      Save Changes
                    </Button>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
          
          {/* Address Information Section */}
          <Card>
            <CardHeader
              title="Address Information"
              action={
                <Button
                  variant={editModes.address ? "outlined" : "contained"}
                  startIcon={editModes.address ? <CancelIcon /> : <EditIcon />}
                  onClick={() => toggleEditMode('address')}
                >
                  {editModes.address ? 'Cancel' : 'Edit'}
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                {renderFormFields('address', addressFields)}
                {editModes.address && (
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={() => toggleEditMode('address')}
                    >
                      Save Changes
                    </Button>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;