import { useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Box, Card, CardContent, Typography, TextField, Button, Modal, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Chip, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useUnifiedTheme } from '../../hooks/useUnifiedTheme';
import { STYLE_GUIDE } from '../../styles';
import { GET } from '../../services/apiRoutes';
import useGet from '../../hooks/useGet';
import { UserListResponse, User } from './types';

interface UsersProps {
  organizationId?: string;
}



const columns: GridColDef[] = [
  // { field: 'id', headerName: 'ID', width: 70, disableColumnMenu: true, resizable: true },
  { field: 'firstName', headerName: 'First Name', width: 130, disableColumnMenu: true, resizable: true },
  { field: 'lastName', headerName: 'Last Name', width: 130, disableColumnMenu: true, resizable: true },
  { field: 'email', headerName: 'Email', width: 200, disableColumnMenu: true, resizable: true },
  { 
    field: 'mobile', 
    headerName: 'Mobile', 
    width: 130, 
    disableColumnMenu: true, 
    resizable: true,
    valueFormatter: (params: any) => params.value ? params.value.toString() : '-'
  },
  {
    field: 'roleNames',
    headerName: 'Roles',
    width: 200,
    disableColumnMenu: true,
    resizable: true,
    renderCell: (params: any) => (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {params.value?.map((roleName: string) => (
          <Chip key={roleName} label={roleName} size="small" variant="outlined" />
        )) || '-'}
      </Box>
    ),
  },
  // {
  //   field: 'organizationId',
  //   headerName: 'Organization',
  //   width: 150,
  //   disableColumnMenu: true,
  //   resizable: true,
  //   renderCell: (params: any) => params.value ? params.value.slice(-8) : '-',
  // },
  {
    field: 'status',
    headerName: 'Status',
    width: 100,
    disableColumnMenu: true,
    resizable: true,
    renderCell: (params: any) => (
      <Chip 
        label={params.value} 
        size="small" 
        color={params.value === 'active' ? 'success' : 'error'}
        variant="outlined"
      />
    ),
  },
  {
    field: 'isVerified',
    headerName: 'Verified',
    width: 100,
    disableColumnMenu: true,
    resizable: true,
    renderCell: (params: any) => (
      <Chip 
        label={params.value ? 'Yes' : 'No'} 
        size="small" 
        color={params.value ? 'success' : 'warning'}
        variant="outlined"
      />
    ),
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 150,
    disableColumnMenu: true,
    sortable: false,
    resizable: false,
    renderCell: (params: any) => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Edit" arrow>
          <Button
            variant="text"
            onClick={() => params.row.handleEdit(params.row)}
            sx={{ minWidth: 'auto' }}
          >
            <EditIcon />
          </Button>
        </Tooltip>
        {/* <Tooltip title="View" arrow>
          <Button
            variant="text"
            onClick={() => params.row.handleView(params.row)}
            sx={{ minWidth: 'auto' }}
          >
            <VisibilityIcon />
          </Button>
        </Tooltip> */}
        <Tooltip title="Delete" arrow>
          <Button
            variant="text"
            onClick={() => params.row.handleDelete(params.row.id)}
            sx={{ minWidth: 'auto', color: 'error.main' }}
          >
            <DeleteIcon />
          </Button>
        </Tooltip>
      </Box>
    ),
  },
];


export default function Users({ organizationId }: UsersProps) {
  const theme = useUnifiedTheme();
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const usersQuery = useGet<UserListResponse>(
    ['users', organizationId || 'all'],
    organizationId ? `${GET.User_List}?organizationId=${organizationId}` : GET.User_List,
    true
  );

    
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    organizationId: '',
    roleIds: [] as string[],
    organizationProductSubscriptionIds: [] as string[],
    isVerified: false,
    status: 'active' as 'active' | 'inactive',
  });

  const handleEdit = (row: any) => {
    setFormData({
      firstName: row.firstName,
      lastName: row.lastName || '',
      email: row.email,
      mobile: row.mobile?.toString() || '',
      organizationId: row.organizationId || '',
      roleIds: row.roleIds,
      organizationProductSubscriptionIds: row.organizationProductSubscriptionIds,
      isVerified: row.isVerified,
      status: row.status,
    });
    setModalMode('edit');
    setOpenModal(true);
  };

  const handleView = (row: any) => {
    setFormData({
      firstName: row.firstName,
      lastName: row.lastName || '',
      email: row.email,
      mobile: row.mobile?.toString() || '',
      organizationId: row.organizationId || '',
      roleIds: row.roleIds,
      organizationProductSubscriptionIds: row.organizationProductSubscriptionIds,
      isVerified: row.isVerified,
      status: row.status,
    });
    setModalMode('view');
    setOpenModal(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleAddUser = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      organizationId: '',
      roleIds: [],
      organizationProductSubscriptionIds: [],
      isVerified: false,
      status: 'active',
    });
    setModalMode('add');
    setOpenModal(true);
  };



  const handleCloseModal = () => {
    setOpenModal(false);
    setModalMode(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      organizationId: '',
      roleIds: [],
      organizationProductSubscriptionIds: [],
      isVerified: false,
      status: 'active',
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    console.log(`Deleting user with ID: ${deleteId}`);
    handleCloseDialog();
  };

    const handleSave = async () => {
    handleCloseModal();
  };

  const transformedUsers = usersQuery.data?.data?.map((user: User) => ({
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    mobile: '',
    organizationId: user.organizationId,
    roleIds: user.roleIds.map(role => role._id),
    roleNames: user.roleIds.map(role => role.name),
    organizationProductSubscriptionIds: user.organizationProductSubscriptionIds.map(sub => sub._id),
    isVerified: user.isVerified,
    status: user.status,
    handleEdit,
    handleView,
    handleDelete,
  }));



  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 3,
        ml: { xs: 0 },
        minHeight: '100vh',
      }}
    >
      <Card
        sx={{
          borderRadius: '8px',
          overflow: 'visible',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddUser}
              sx={{
                borderRadius: '8px',
              }}
            >
              Add User
            </Button>
          </Box>

          {usersQuery.isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading users...</Typography>
            </Box>
          ) : usersQuery.error ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography color="error" sx={{ mb: 2 }}>
                {usersQuery.error instanceof Error ? usersQuery.error.message : 'Failed to fetch users'}
              </Typography>
            </Box>
          ) : !transformedUsers || transformedUsers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No users found.
              </Typography>
            </Box>
          ) : (
            <DataGrid
              rows={transformedUsers}
              columns={columns}
              disableColumnMenu
              sx={{
                overflow: 'visible',
              }}
            />
          )}
        </CardContent>
      </Card>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper || STYLE_GUIDE.COLORS.white,
            borderRadius: '8px',
            p: 3,
            width: '700px',
            maxWidth: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            {modalMode === 'add' ? 'Add User' :
              modalMode === 'edit' ? 'Edit User' : 'View User'}
          </Typography>
          
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
            }}
          >
            <TextField
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              disabled={modalMode === 'view'}
              variant="outlined"
              fullWidth
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              disabled={modalMode === 'view'}
              variant="outlined"
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={modalMode === 'view'}
              variant="outlined"
              fullWidth
              required
              type="email"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              label="Mobile"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              disabled={modalMode === 'view'}
              variant="outlined"
              fullWidth
              type="tel"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              label="Organization ID"
              value={formData.organizationId}
              onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
              disabled={modalMode === 'view'}
              variant="outlined"
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                disabled={modalMode === 'view'}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Role IDs (comma separated)"
              value={formData.roleIds.join(', ')}
              onChange={(e) => setFormData({ ...formData, roleIds: e.target.value.split(',').map(id => id.trim()).filter(Boolean) })}
              disabled={modalMode === 'view'}
              variant="outlined"
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              label="Subscription IDs (comma separated)"
              value={formData.organizationProductSubscriptionIds.join(', ')}
              onChange={(e) => setFormData({ ...formData, organizationProductSubscriptionIds: e.target.value.split(',').map(id => id.trim()).filter(Boolean) })}
              disabled={modalMode === 'view'}
              variant="outlined"
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isVerified}
                  onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                  disabled={modalMode === 'view'}
                />
              }
              label="Verified"
              sx={{ gridColumn: 'span 2' }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handleCloseModal}
              sx={{
                borderRadius: '8px',
              }}
            >
              Cancel
            </Button>
            {modalMode !== 'view' && (
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  borderRadius: '8px',
                }}
              >
                 Save
              </Button>
            )}
          </Box>
        </Box>
      </Modal>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '8px',
          },
        }}
      >
        <DialogTitle>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the user with ID {deleteId}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            sx={{
              borderRadius: '8px',
            }}
          >
            No
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            sx={{
              borderRadius: '8px',
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}