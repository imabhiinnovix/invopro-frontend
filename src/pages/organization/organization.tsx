
import * as React from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Grid } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { STYLE_GUIDE } from '../../styles';

export default function Organization() {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      notificationEmail: '',
      logoUrl: '',
      taxId: '',
      panNumber: '',
    },
  });

  const onSubmit = (data) => {
    console.log('Form Data:', data);
    // Replace with your API call or logic
    alert('Form submitted successfully!');
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 3,
        ml: { xs: 0 },
        backgroundColor: STYLE_GUIDE?.COLORS?.backgroundLight || '#f5f5f5',
        minHeight: '100vh',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 400,
          color: STYLE_GUIDE?.COLORS?.primaryDark || '#3f51b5',
        }}
      >
        Organization Details
      </Typography>

      <Card
        sx={{
          backgroundColor: STYLE_GUIDE?.COLORS?.white || '#ffffff',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          overflow: 'visible',
        //   maxWidth: 600,
          mx: 'auto',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Name is required', minLength: { value: 3, message: 'Minimum 3 characters' } }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Name"
                      variant="outlined"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="notificationEmail"
                  control={control}
                  rules={{
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Notification Email"
                      variant="outlined"
                      fullWidth
                      error={!!errors.notificationEmail}
                      helperText={errors.notificationEmail?.message}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="logoUrl"
                  control={control}
                  rules={{
                    pattern: { value: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/, message: 'Invalid URL format' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Logo URL (Optional)"
                      variant="outlined"
                      fullWidth
                      error={!!errors.logoUrl}
                      helperText={errors.logoUrl?.message}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="taxId"
                  control={control}
                  rules={{
                    required: 'Tax ID is required',
                    pattern: { value: /^[A-Za-z0-9]{8,15}$/, message: 'Tax ID must be 8-15 alphanumeric characters' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Tax ID"
                      variant="outlined"
                      fullWidth
                      error={!!errors.taxId}
                      helperText={errors.taxId?.message}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="panNumber"
                  control={control}
                  rules={{
                    required: 'PAN Number is required',
                    pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Invalid PAN format (e.g., AAAAA9999A)' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="PAN Number"
                      variant="outlined"
                      fullWidth
                      error={!!errors.panNumber}
                      helperText={errors.panNumber?.message}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  borderRadius: '8px',
                  backgroundColor: STYLE_GUIDE?.COLORS?.primaryDark || '#3f51b5',
                  color: STYLE_GUIDE?.COLORS?.white || '#ffffff',
                  '&:hover': {
                    backgroundColor: STYLE_GUIDE?.COLORS?.primary || '#5c6bc0',
                  },
                }}
              >
                Save
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

