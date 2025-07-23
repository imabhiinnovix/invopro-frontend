

import * as React from 'react';
import { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Box, Card, CardContent, Typography, TextField, Button, InputAdornment, Modal, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Chip, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { useUnifiedTheme } from '../../hooks/useUnifiedTheme';
import { STYLE_GUIDE } from '../../styles';
import useGet from '../../hooks/useGet';
import usePost from '../../hooks/usePost';
import usePut from '../../hooks/usePut';

import { GET, POST, PUT, DELETE } from '../../services/apiRoutes';
import { useSelector } from 'react-redux';
import { RootState } from '../../reducers';
import useDelete from '../../hooks/useDelete';

// Define the expected response type for the API
interface Permission {
  _id: string;
  name: string;
  resourceType: string;
  status: 'active' | 'inactive';
  dataSourceId: string;
  method: string;
  organizationId: string;
  isSuperUser: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  success: boolean;
  data: Permission[];
  totalCount: number;
}

// Define response type for POST, PUT, and DELETE APIs// Define response type for POST, PUT, and DELETE APIs

interface PermissionPostResponse {
  success: boolean;
  data: any; 
}

interface PermissionPostPayload {
  name: string;
  method: string;
  dataSourceId: string;
  resourceType?: string;
}

interface DataSource {
  _id: string;
  name: string;
}

// Custom Pagination Component
type CustomPaginationProps = {
  paginationModel: { page: number; pageSize: number };
  setPaginationModel: (model: { page: number; pageSize: number }) => void;
  rowCount: number;
};

const CustomPagination: React.FC<CustomPaginationProps> = ({ paginationModel, setPaginationModel, rowCount }) => {
  const totalPages = Math.ceil(rowCount / paginationModel.pageSize) || 1;
  const pageSizeOptions = [5, 10, 20];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        p: 1,
        backgroundColor: STYLE_GUIDE?.COLORS?.white || '#ffffff',
        borderTop: `1px solid ${STYLE_GUIDE?.COLORS?.divider || '#e0e0e0'}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
        <Typography sx={{ mr: 1 }}>Rows per page:</Typography>
        <Select
          value={paginationModel.pageSize}
          onChange={(e) =>
            setPaginationModel({
              ...paginationModel,
              pageSize: Number(e.target.value),
              page: 0,
            })
          }
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              backgroundColor: STYLE_GUIDE?.COLORS?.white || '#ffffff',
              '& fieldset': {
                borderColor: STYLE_GUIDE?.COLORS?.divider || '#e0e0e0',
              },
              '&:hover fieldset': {
                borderColor: STYLE_GUIDE?.COLORS?.primaryDark || '#3f51b5',
              },
            },
          }}
        >
          {pageSizeOptions.map((size) => (
            <MenuItem key={size} value={size}>
              {size}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <Tooltip title="First Page" arrow>
        <span>
          <Button
            disabled={paginationModel.page === 0}
            onClick={() => setPaginationModel({ ...paginationModel, page: 0 })}
            sx={{
              minWidth: 'auto',
              mx: 1,
              color: STYLE_GUIDE?.COLORS?.primaryDark || '#3f51b5',
              '&:hover': {
                backgroundColor: STYLE_GUIDE?.COLORS?.backgroundDefault || '#f1f5f9',
              },
              '&.Mui-disabled': {
                color: STYLE_GUIDE?.COLORS?.divider || '#e0e0e0',
              },
            }}
          >
            <Typography>{'<<'}</Typography>
          </Button>
        </span>
      </Tooltip>
      <Tooltip title="Previous Page" arrow>
        <span>
          <Button
            disabled={paginationModel.page === 0}
            onClick={() =>
              setPaginationModel({
                ...paginationModel,
                page: paginationModel.page - 1,
              })
            }
            sx={{
              minWidth: 'auto',
              mx: 1,
              color: STYLE_GUIDE?.COLORS?.primaryDark || '#3f51b5',
              '&:hover': {
                backgroundColor: STYLE_GUIDE?.COLORS?.backgroundDefault || '#f1f5f9',
              },
              '&.Mui-disabled': {
                color: STYLE_GUIDE?.COLORS?.divider || '#e0e0e0',
              },
            }}
          >
            <Typography>{'<'}</Typography>
          </Button>
        </span>
      </Tooltip>
      <Typography sx={{ mx: 2 }}>
        Page {paginationModel.page + 1} of {totalPages}
      </Typography>
      <Tooltip title="Next Page" arrow>
        <span>
          <Button
            disabled={paginationModel.page >= totalPages - 1}
            onClick={() =>
              setPaginationModel({
                ...paginationModel,
                page: paginationModel.page + 1,
              })
            }
            sx={{
              minWidth: 'auto',
              mx: 1,
              color: STYLE_GUIDE?.COLORS?.primaryDark || '#3f51b5',
              '&:hover': {
                backgroundColor: STYLE_GUIDE?.COLORS?.backgroundDefault || '#f1f5f9',
              },
              '&.Mui-disabled': {
                color: STYLE_GUIDE?.COLORS?.divider || '#e0e0e0',
              },
            }}
          >
            <Typography>{'>'}</Typography>
          </Button>
        </span>
      </Tooltip>
      <Tooltip title="Last Page" arrow>
        <span>
          <Button
            disabled={paginationModel.page >= totalPages - 1}
            onClick={() =>
              setPaginationModel({
                ...paginationModel,
                page: totalPages - 1,
              })
            }
            sx={{
              minWidth: 'auto',
              mx: 1,
              color: STYLE_GUIDE?.COLORS?.primaryDark || '#3f51b5',
              '&:hover': {
                backgroundColor: STYLE_GUIDE?.COLORS?.backgroundDefault || '#f1f5f9',
              },
              '&.Mui-disabled': {
                color: STYLE_GUIDE?.COLORS?.divider || '#e0e0e0',
              },
            }}
          >
            <Typography>{'>>'}</Typography>
          </Button>
        </span>
      </Tooltip>
    </Box>
  );
};

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', width: 150, disableColumnMenu: true, resizable: true },
  { field: 'resourceType', headerName: 'Resource Type', width: 150, disableColumnMenu: true, resizable: true },
  {
    field: 'status',
    headerName: 'Status',
    width: 100,
    disableColumnMenu: true,
    resizable: true,
    renderCell: (params) => (
      <Chip
        label={params.value || 'Unknown'}
        size="small"
        color={params.value === 'active' ? 'success' : 'error'}
        variant="outlined"
      />
    ),
  },
  {
    field: 'dataSourceId',
    headerName: 'Data Source ID',
    width: 150,
    disableColumnMenu: true,
    resizable: true,
    renderCell: (params) => (params.value ? params.value.slice(-8) : '-'),
  },
  { field: 'method', headerName: 'Method', width: 100, disableColumnMenu: true, resizable: true },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 150,
    disableColumnMenu: true,
    sortable: false,
    resizable: false,
    renderCell: (params) => (
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
        <Tooltip title="View" arrow>
          <Button
            variant="text"
            onClick={() => params.row.handleView(params.row)}
            sx={{ minWidth: 'auto' }}
          >
            <VisibilityIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Delete" arrow>
          <Button
            variant="text"
            onClick={() => params.row.handleDelete(params.row._id)}
            sx={{ minWidth: 'auto', color: 'error.main' }}
            disabled={!params.row._id}
          >
            <DeleteIcon />
          </Button>
        </Tooltip>
      </Box>
    ),
  },
];

export default function Permissions() {
  const theme = useUnifiedTheme();
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | 'filter' | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
  const [permissionReload, setPermissionReload] = useState(false); // State to trigger listing reload
  const dataSource = useSelector((state: RootState) => state.dataSource.list);

  

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [searchValue]);

  // Form data for modal
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    dataSourceId: '',
    method: '',
  });

  // API call 
  const perPageItem = paginationModel.pageSize;
  const permissionList = useGet<ApiResponse>(
    ['permissionList', String(paginationModel.page + 1), debouncedSearchValue, String(permissionReload)],
    `${GET?.PERMISSION_List}?page=${paginationModel.page + 1}&limit=${perPageItem}&search=${encodeURIComponent(debouncedSearchValue)}`,
    true
  );

  // POST API 
  const createPermission = usePost<PermissionPostPayload, PermissionPostResponse>(
    ['createPermission'],
    (data) => {
      if (data?.success) {
        setPermissionReload(true); // Trigger listing reload
        handleCloseModal();
      }
    },
    true
  );

  // PUT API 
  const updatePermission = usePut<PermissionPostPayload, PermissionPostResponse>(
    ['updatePermission'],
    (data) => {
      if (data?.success) {
        setPermissionReload(true); 
        handleCloseModal();
      }
    },
    true
  );

  // DELETE API 
  const deletePermission = useDelete<null, PermissionPostResponse>(
    ['deletePermission'],
    (data) => {
      if (data?.success) {
        setPermissionReload(true); 
        handleCloseDialog();
      }
    },
    true
  );

  useEffect(() => {
    if (permissionList?.data && permissionReload) {
      setPermissionReload(false);
    }
  }, [permissionList, permissionReload]);

  
  const permissionsWithIds = Array.isArray(permissionList?.data?.data) && permissionList.data.data.length > 0
    ? permissionList.data.data.map((permission) => ({
        ...permission,
        id: permission._id || `temp-${Math.random().toString(36).substr(2, 9)}`,
      }))
    : [];

  const handleEdit = (row: Permission) => {
    setFormData({
      id: row._id || '',
      name: row.name || '',
      dataSourceId: row.dataSourceId || '',
      method: row.method || '',
    });
    setModalMode('edit');
    setOpenModal(true);
  };

  const handleView = (row: Permission) => {
    setFormData({
      id: row._id || '',
      name: row.name || '',
      dataSourceId: row.dataSourceId || '',
      method: row.method || '',
    });
    setModalMode('view');
    setOpenModal(true);
  };

  const handleDelete = (id: string) => {
    if (id) {
      setDeleteId(id);
      setOpenDialog(true);
    }
  };

  const handleAddPermission = () => {
    setFormData({
      id: '',
      name: '',
      dataSourceId: '',
      method: '',
    });
    setModalMode('add');
    setOpenModal(true);
  };

  const handleFilter = () => {
    setModalMode('filter');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalMode(null);
    setFormData({
      id: '',
      name: '',
      dataSourceId: '',
      method: '',
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        console.log(`Deleting permission with ID: ${deleteId}`);
        await deletePermission.mutate({
          url: `${DELETE.PERMISSION_DELETE}/${deleteId}`, 
          payload: null, 
        });
      } catch (error) {
        console.error('Error deleting permission:', error);
      }
    }
  };

  const handleSave = async () => {
    try {
      if (modalMode === 'add') {
        console.log('Add permission payload:', {
          name: formData.name,
          method: formData.method,
          dataSourceId: formData.dataSourceId,
        });
        await createPermission.mutate({
          url: POST.PERMISSION_CREATE,
          payload: {
            name: formData.name,
            method: formData.method,
            dataSourceId: formData.dataSourceId,
          },
        });
      } else if (modalMode === 'edit') {
        console.log('Edit permission payload:', {
          id: formData.id,
          name: formData.name,
          method: formData.method,
          dataSourceId: formData.dataSourceId,
          resourceType: 'Data Source',
        });
        await updatePermission.mutate({
          url: `${PUT.PERMISSION_UPDATE}/${formData.id}`,
          payload: {
            name: formData.name,
            method: formData.method,
            dataSourceId: formData.dataSourceId,
            resourceType: 'Data Source',
          },
        });
      } else if (modalMode === 'filter') {
        console.log('Apply filter:', formData);
      }
    } catch (error) {
      console.error('Error saving permission:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const dataSourceOptions: { id: string; name: string }[] = Array.isArray(dataSource)
    ? dataSource.map((ds: DataSource) => ({
        id: ds._id,
        name: ds.name,
      }))
    : [];

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 3,
        ml: { xs: 0 },
        minHeight: '100vh',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 400,
        }}
      >
        Permissions
      </Typography>

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
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            {/* Search Bar */}
            <TextField
              placeholder="Search ..."
              variant="outlined"
              size="small"
              value={searchValue}
              onChange={handleSearchChange}
              sx={{
                width: '300px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
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

            {/* Filter and Add Buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={handleFilter}
                sx={{
                  borderRadius: '8px',
                }}
              >
                Filter
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddPermission}
                sx={{
                  borderRadius: '8px',
                }}
              >
                Add
              </Button>
            </Box>
          </Box>

          {/* Table */}
          <DataGrid
            rows={permissionsWithIds.map((permission) => ({
              ...permission,
              handleEdit,
              handleView,
              handleDelete,
            }))}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            pageSizeOptions={[5, 10, 20]}
            disableColumnMenu
            sx={{
              overflow: 'visible',
            }}
            loading={permissionList.isLoading || createPermission.isLoading || updatePermission.isLoading || deletePermission.isLoading}
            rowCount={permissionList?.data?.totalCount || 0}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            slots={{
              pagination: () => (
                <CustomPagination
                  paginationModel={paginationModel}
                  setPaginationModel={setPaginationModel}
                  rowCount={permissionList?.data?.totalCount || 0}
                />
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Modal */}
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
            width: '500px',
            maxWidth: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            {modalMode === 'add'
              ? 'Add Permission'
              : modalMode === 'edit'
                ? 'Edit Permission'
                : modalMode === 'view'
                  ? 'View Permission'
                  : 'Filter Permissions'}
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 2,
            }}
          >
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={modalMode === 'view'}
              variant="outlined"
              fullWidth
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />

            <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
              <InputLabel>Data Source</InputLabel>
              <Select
                value={formData.dataSourceId}
                onChange={(e) => setFormData({ ...formData, dataSourceId: e.target.value })}
                disabled={modalMode === 'view'}
                label="Data Source"
                required
              >
                <MenuItem value="" disabled>
                  Select Data Source
                </MenuItem>
                {dataSourceOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
              <InputLabel>Method</InputLabel>
              <Select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                disabled={modalMode === 'view'}
                label="Method"
                required
              >
                <MenuItem value="" disabled>
                  Select Method
                </MenuItem>
                <MenuItem value="GET">GET</MenuItem>
                <MenuItem value="UPDATE">UPDATE</MenuItem>
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
                sx={{
                  borderRadius: '8px',
                }}
                disabled={!formData.name || !formData.dataSourceId || !formData.method || createPermission.isLoading || updatePermission.isLoading}
              >
                {modalMode === 'filter' ? 'Apply' : 'Save'}
              </Button>
            )}
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '8px',
          },
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the Permission with ID {deleteId?.slice(-8) || 'Unknown'}?
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
            disabled={deletePermission.isLoading}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
