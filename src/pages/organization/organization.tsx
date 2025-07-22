
import { useContext } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { STYLE_GUIDE } from '../../styles';
import { AuthContext } from '../../context/AuthContext';
import useGet from '../../hooks/useGet';
import { GET } from '../../services/apiRoutes';

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

  const { userDetails } = useContext(AuthContext);
  console.log('User Details:', userDetails);

  const { data, isLoading, error } = useGet<{ success: boolean; data: any[]; totalCount: number }>(
    ['organizationList'],
    GET.Organization_List,
    true
  );

  const onSubmit = (data: any) => {
    console.log('Form Data:', data);
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

      {/* Organization List Table */}
      <Card sx={{ mb: 4, backgroundColor: STYLE_GUIDE?.COLORS?.white || '#fff' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Organization List</Typography>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 100 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">Failed to load organizations.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Updated At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.data?.map((org) => (
                    <TableRow key={org._id}>
                      <TableCell>{org.name}</TableCell>
                      <TableCell>{org.code}</TableCell>
                      <TableCell>{org.status}</TableCell>
                      <TableCell>{org.owner?.firstName} {org.owner?.lastName}</TableCell>
                      <TableCell>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(org.updatedAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Card
        sx={{
          backgroundColor: STYLE_GUIDE?.COLORS?.white || '#ffffff',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          overflow: 'visible',
          mx: 'auto',
        }}
      >
        
      </Card>
    </Box>
  );
}

