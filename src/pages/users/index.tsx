import * as React from 'react';
import { useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Box, Card, CardContent, Typography, TextField, Button, InputAdornment, Modal, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { useUnifiedTheme } from '../../hooks/useUnifiedTheme';
import { STYLE_GUIDE } from '../../styles';
const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70, disableColumnMenu: true, resizable: true },
  { field: 'email', headerName: 'Email', width: 130, disableColumnMenu: true, resizable: true },
  { field: 'roles', headerName: 'Roles', width: 130, disableColumnMenu: true, resizable: true },

  {
    field: 'actions',
    headerName: 'Actions',
    width: 150,
    disableColumnMenu: true,
    sortable: false,
    resizable: false,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Delete" arrow>

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

type UserRow = {
  id: number;
  email: string | null;
  roles: string | null;
  handleEdit?: (rowData: UserRow) => void;
  handleView?: (rowData: UserRow) => void;
  handleDelete?: (id: number) => void;
};

const rows: UserRow[] = [
  { id: 1, lastName: 'Snow', email: 'Jon', roles: "primary" },
  { id: 2, lastName: 'Lannister', email: 'Cersei', roles: null },
  { id: 3, lastName: 'Lannister', email: 'Jaime', roles: "primary" },
  { id: 4, lastName: 'Stark', email: 'Arya', roles: null },
  { id: 5, lastName: 'Targaryen', email: 'Daenerys', roles: null },
  { id: 6, lastName: 'Melisandre', email: null, roles: "primary" },
  { id: 7, lastName: 'Clifford', email: 'Ferrara', roles: null },
  { id: 8, lastName: 'Frances', email: 'Rossini', roles: null },
  { id: 9, lastName: 'Roxie', email: 'Harvey', roles: "primary" },
].map((row) => ({
  ...row,
  handleEdit: (rowData: UserRow) => rowData,
  handleView: (rowData: UserRow) => rowData,
  handleDelete: (id: number) => id,
}));

const paginationModel = { page: 0, pageSize: 10 };

export default function Users() {
  const theme = useUnifiedTheme();
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | 'filter' | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ id: '', email: '', roles: '' });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchValue, setSearchValue] = useState('');

  const handleEdit = (row: UserRow) => {
    setFormData({
      id: row.id.toString(),
      email: row.email || '',
      roles: row.roles || '',
    });
    setModalMode('edit');
    setOpenModal(true);
  };

  const handleView = (row: UserRow) => {
    setFormData({
      id: row.id.toString(),
      email: row.email || '',
      roles: row.roles || '',
    });
    setModalMode('view');
    setOpenModal(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleAddUser = () => {
    setFormData({ id: '', email: '', roles: '', });
    setModalMode('add');
    setOpenModal(true);
  };

  const handleFilter = () => {
    setFormData({ id: '', email: '', roles: '' });
    setModalMode('filter');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalMode(null);
    setFormData({ id: '', email: '', roles: '', });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  const handleConfirmDelete = () => {
    console.log(`Deleting row with ID: ${deleteId}`);
    // Implement actual delete logic here
    handleCloseDialog();
  };

  const handleSave = () => {
    if (modalMode === 'add') {
      console.log(`Adding new User: `, formData);
      // Implement add logic here
    } else if (modalMode === 'edit') {
      console.log(`Saving edited row: `, formData);
      // Implement save logic here
    } else if (modalMode === 'filter') {
      console.log(`Applying filter: `, formData);
      // Implement filter logic here
    }
    handleCloseModal();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    console.log(`Search value: ${value}`);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 3,
        ml: { xs: 0 }, // Adjust for SideNav width
        minHeight: '100vh',
      }}
    >
      {/* Heading */}
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 400,
        }}
      >
        Users
      </Typography>

      {/* Card containing controls and table */}
      <Card
        sx={{
          borderRadius: '8px',
          overflow: 'visible',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Controls: Search on left, Filter and Add buttons on right */}
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
              placeholder="Search users..."
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
                onClick={handleAddUser}
                sx={{
                  borderRadius: '8px',
                }}
              >
                Add User
              </Button>
            </Box>
          </Box>

          {/* Table */}
          <DataGrid
            rows={rows.map((row) => ({
              ...row,
              handleEdit,
              handleView,
              handleDelete,
            }))}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            pageSizeOptions={[5, 10]}
            disableColumnMenu
            sx={{
              overflow: 'visible',
              // '& .MuiDataGrid-columnHeaders': {
              //   backgroundColor: `${theme.palette.table?.headerBackground || STYLE_GUIDE.COLORS.backgroundLightGray} !important`,
              //   color: `${theme.palette.table?.headerText || STYLE_GUIDE.COLORS.textGray} !important`,
              // },
              // '& .MuiDataGrid-row:nth-of-type(odd)': {
              //   backgroundColor: `${theme.palette.table?.rowOddBackground || STYLE_GUIDE.COLORS.backgroundDefault} !important`,
              // },
              // '& .MuiDataGrid-row:nth-of-type(even)': {
              //   backgroundColor: `${theme.palette.table?.rowEvenBackground || STYLE_GUIDE.COLORS.white} !important`,
              // },
              // '& .MuiDataGrid-row:hover': {
              //   backgroundColor: `${theme.palette.table?.rowHoverBackground || STYLE_GUIDE.COLORS.backgroundHover} !important`,
              // },
            }}
          />
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
            width: '600px',
            maxWidth: '90%',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            {modalMode === 'add' ? 'Add User' :
              modalMode === 'edit' ? 'Edit User' :
                modalMode === 'view' ? 'View User' : 'Filter Users'}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
            }}
          >
            <TextField
              label="ID"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              disabled={modalMode === 'edit' || modalMode === 'view'}
              variant="outlined"
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              style={{ display: modalMode === 'add' ? 'none' : 'block' }}
            />
            <TextField
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={modalMode === 'view'}
              variant="outlined"
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              label="Roles"
              value={formData.roles}
              onChange={(e) => setFormData({ ...formData, roles: e.target.value })}
              disabled={modalMode === 'view'}
              variant="outlined"
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
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
                {modalMode === 'filter' ? 'Apply' : 'Save'}
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