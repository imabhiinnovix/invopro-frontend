import { useState } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Box, Card, CardContent, Typography, TextField, Button, Modal, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Chip, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useUnifiedTheme } from '../../hooks/useUnifiedTheme';
import { STYLE_GUIDE } from '../../styles';
import { GET, POST, PUT, DELETE } from '../../services/apiRoutes';
import useGet from '../../hooks/useGet';
import usePost from '../../hooks/usePost';
import usePut from '../../hooks/usePut';
import useDelete from '../../hooks/useDelete';
import { UserListResponse, User, CreateUserPayload, CreateUserResponse, RoleListResponse, ProductSubscriptionListResponse } from './types';

interface UsersProps {
  organizationId?: string;
}

interface UserRowData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  organizationId: string;
  roleIds: string[];
  roleNames: string[];
  organizationProductSubscriptionIds: string[];
  isVerified: boolean;
  status: 'active' | 'inactive';
  handleEdit: (row: UserRowData) => void;
  handleView: (row: UserRowData) => void;
  handleDelete: (id: string) => void;
}



const columns: GridColDef[] = [
  // { field: 'id', headerName: 'ID', width: 70, disableColumnMenu: true, resizable: true },
  { field: 'firstName', headerName: 'First Name', width: 200, disableColumnMenu: true, resizable: true },
  { field: 'lastName', headerName: 'Last Name', width: 200, disableColumnMenu: true, resizable: true },
  { field: 'email', headerName: 'Email', width: 200, disableColumnMenu: true, resizable: true },
  { 
    field: 'mobile', 
    headerName: 'Mobile', 
    width: 200, 
    disableColumnMenu: true, 
    resizable: true,
    valueFormatter: (params: { value: unknown }) => params?.value ? params?.value.toString() : '-'
  },
  {
    field: 'roleNames',
    headerName: 'Roles',
    width: 200,
    disableColumnMenu: true,
    resizable: true,
    renderCell: (params: GridRenderCellParams) => (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', width: '100%', height: '100%', alignItems: 'center' }}>
        {(params.value as string[])?.map((roleName: string) => (
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
    renderCell: (params: GridRenderCellParams) => (
      <Chip 
        label={params.value as string} 
        size="small" 
        color={(params.value as string) === 'active' ? 'success' : 'error'}
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
    renderCell: (params: GridRenderCellParams) => (
      <Chip 
        label={(params.value as boolean) ? 'Yes' : 'No'} 
        size="small" 
        color={(params.value as boolean) ? 'success' : 'warning'}
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
    renderCell: (params: GridRenderCellParams) => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Edit" arrow>
          <Button
            variant="text"
            onClick={() => (params.row as UserRowData).handleEdit(params.row as UserRowData)}
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
            onClick={() => (params.row as UserRowData).handleDelete((params.row as UserRowData).id)}
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
  const [userIdForEdit, setUserIdForEdit] = useState<string | null>(null);
  
  const usersQuery = useGet<UserListResponse>(
    ['users', organizationId || 'all'],
    organizationId ? `${GET.User_List}?organizationId=${organizationId}` : GET.User_List,
    true
  );

  const rolesQuery = useGet<RoleListResponse>(
    ['roles', organizationId || 'all'],
    organizationId ? `${GET.Roles_List}?organizationId=${organizationId}` : GET.Roles_List,
    true
  );

  const productSubscriptionsQuery = useGet<ProductSubscriptionListResponse>(
    ['productSubscriptions', organizationId || 'all'],
    organizationId ? `${GET.Product_Subscription_List}?organizationId=${organizationId}` : GET.Product_Subscription_List,
    true
  );

  const createUserMutation = usePost<CreateUserPayload, CreateUserResponse>(
    ['users', organizationId || 'all'],
    () => {
      usersQuery.refetch();
      handleCloseModal();
    },
    true
  );
    
  const updateUserMutation = usePut<CreateUserPayload, CreateUserResponse>(
    ['users', organizationId || 'all'],
    () => {
      usersQuery.refetch();
      handleCloseModal();
    },
    true
  );

  const deleteUserMutation = useDelete<any>(
    ['users', organizationId || 'all'],
    () => {
      usersQuery.refetch();
      handleCloseDialog();
    },
    true
  );

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    mobile: '',
    organizationId: '',
    roleIds: [] as string[],
    organizationProductSubscriptionIds: [] as string[],
    status: 'active' as 'active' | 'inactive',
  });

  const handleEdit = (row: UserRowData) => {
    setFormData({
      firstName: row.firstName,
      lastName: row.lastName === '-' ? '' : row.lastName,
      email: row.email,
      password: '',
      mobile: row.mobile?.toString() || '',
      organizationId: row.organizationId || '',
      roleIds: row.roleIds,
      organizationProductSubscriptionIds: row.organizationProductSubscriptionIds,
      status: row.status,
    });
    setModalMode('edit');
    setUserIdForEdit(row.id);
    setOpenModal(true);
  };

  const handleView = (row: UserRowData) => {
    setFormData({
      firstName: row.firstName,
      lastName: row.lastName || '',
      email: row.email,
      password: '',
      mobile: row.mobile?.toString() || '',
      organizationId: row.organizationId || '',
      roleIds: row.roleIds,
      organizationProductSubscriptionIds: row.organizationProductSubscriptionIds,
      status: row.status,
    });
    setModalMode('view');
    setOpenModal(true);
  };

  const handleDelete = (id: string) => {
    setUserIdForEdit(id);
    setOpenDialog(true);
  };

  const handleAddUser = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      mobile: '',
      organizationId: '',
      roleIds: [],
      organizationProductSubscriptionIds: [],
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
      password: '',
      mobile: '',
      organizationId: '',
      roleIds: [],
      organizationProductSubscriptionIds: [],
      status: 'active',
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setUserIdForEdit(null);
  };

  const handleConfirmDelete = async () => {
    if (userIdForEdit) {
      deleteUserMutation.mutate({
        url: `${DELETE.Delete_User}/${userIdForEdit}`,
        payload: { organizationId: organizationId || '' },
      });
    } else {
      handleCloseDialog();
    }
  };

  const handleSave = async () => {
    if (modalMode === 'add') {
      const payload: CreateUserPayload = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        roleIds: formData.roleIds,
        organizationProductSubscriptionIds: formData.organizationProductSubscriptionIds,
        mobile: formData.mobile,
        organizationId: organizationId || undefined,
      };
      createUserMutation.mutate({
        url: POST.Create_User,
        payload,
      });
    } else if (modalMode === 'edit' && userIdForEdit) {
      const updatePayload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        organizationId: organizationId || undefined,
        roleIds: formData.roleIds,
        organizationProductSubscriptionIds: formData.organizationProductSubscriptionIds,
        mobile: formData.mobile,
      };
      if (formData.password) {
        updatePayload.password = formData.password;
      }
      updateUserMutation.mutate({
        url: `${PUT.UPDATE_USER}${userIdForEdit}`,
        payload: updatePayload,
      });
    } else {
      handleCloseModal();
    }
  };

  const transformedUsers: UserRowData[] = usersQuery.data?.data?.map((user: User) => ({
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName === "" ? '-' : user.lastName,
    email: user.email,
    mobile: user.mobile === "" ? '-' : user.mobile,
    organizationId: user.organizationId,
    roleIds: user.roleIds.map(role => role._id),
    roleNames: user.roleIds.map(role => role.name),
    organizationProductSubscriptionIds: user.organizationProductSubscriptionIds.map(sub => sub._id),
    isVerified: user.isVerified,
    status: user.status as 'active' | 'inactive',
    handleEdit,
    handleView,
    handleDelete,
  })) || [];

  const isAddMode = modalMode === 'add';
  const isFormValid =
    !!formData.firstName.trim() &&
    !!formData.email.trim() &&
    (!isAddMode || !!formData.password.trim()) &&
    formData.roleIds.length > 0 &&
    formData.organizationProductSubscriptionIds.length > 0;

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
            {modalMode === 'add' && (
              <TextField
                label="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                variant="outlined"
                fullWidth
                required
                type="password"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            )}
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
            {!organizationId && (
              <TextField
                label="Organization ID"
                value={formData.organizationId}
                onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                disabled={modalMode === 'view'}
                variant="outlined"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            )}
            <FormControl fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
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
            <FormControl fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
              <InputLabel>Roles</InputLabel>
              <Select
                multiple
                value={formData.roleIds}
                onChange={(e) => setFormData({ ...formData, roleIds: e.target.value as string[] })}
                disabled={modalMode === 'view'}
                label="Roles"
              >
                {rolesQuery.data?.data?.map((role) => (
                  <MenuItem key={role._id} value={role._id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
              <InputLabel>Product Subscriptions</InputLabel>
              <Select
                multiple
                value={formData.organizationProductSubscriptionIds}
                onChange={(e) => setFormData({ ...formData, organizationProductSubscriptionIds: e.target.value as string[] })}
                disabled={modalMode === 'view'}
                label="Product Subscriptions"
              >
                {productSubscriptionsQuery.data?.data?.map((subscription) => (
                  <MenuItem key={subscription._id} value={subscription._id}>
                    {subscription.productId.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
                disabled={createUserMutation.isPending || updateUserMutation.isPending || !isFormValid}
                sx={{
                  borderRadius: '8px',
                }}
              >
                {createUserMutation.isPending || updateUserMutation.isPending ? <CircularProgress size={20} /> : 'Save'}
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
            Are you sure you want to delete the user?
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
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? <CircularProgress size={20} /> : 'Yes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}