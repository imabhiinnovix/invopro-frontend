import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../storeHooks';
import { fetchDashboardList, fetchChartData, createDashboard } from './dashboardActions';
import { DashboardView } from './components/DashboardView';
import { toast } from 'react-toastify';
import axiosInstance from '../../services/axiosInstance';
import { POST } from '../../services/apiRoutes';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { DeleteConfirmationModal } from '../../components/atom/sideNav/components/DeleteConfirmationModal';
import { Dashboard as DashboardType } from './types';

const Dashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const dashboards = useAppSelector((state) => state.dashboard.dashboards);
  const currentDashboard = dashboards.find((d) => d._id === id);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [dashboardToDelete, setDashboardToDelete] = useState<DashboardType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!dashboards.length) {
      dispatch(fetchDashboardList());
    }
  }, [dispatch, dashboards.length]);

  const handleTitleChange = async (newTitle: string) => {
    try {
      await axiosInstance.post(`${POST.UPDATE_DASHBOARD}/${id}`, { name: newTitle });
      dispatch(fetchDashboardList());
      toast.success('Dashboard name updated successfully!');
    } catch (error) {
      console.error('Failed to update dashboard name:', error);
      toast.error('Failed to update dashboard name. Please try again.');
    }
  };

  const handleCreateWidget = () => {
    if (id) {
      dispatch(fetchChartData(id));
    }
  };

  const handleEdit = (dashboardId: string) => {
    navigate(`/dashboard/${dashboardId}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, dashboard: DashboardType) => {
    e.stopPropagation();
    setDashboardToDelete(dashboard);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (dashboardToDelete) {
      try {
        setIsDeleting(true);
        await axiosInstance.post(`${POST.DELETE_DASHBOARD}/${dashboardToDelete._id}`);
        dispatch(fetchDashboardList());
        toast.success('Dashboard deleted successfully!');
        setDeleteModalOpen(false);
        setDashboardToDelete(null);
      } catch (error) {
        console.error('Failed to delete dashboard:', error);
        toast.error('Failed to delete dashboard. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setDashboardToDelete(null);
  };

  const handleCreateDashboard = async () => {
    if (newDashboardName.trim()) {
      try {
        setIsCreating(true);
        const response = await dispatch(createDashboard(newDashboardName.trim())).unwrap();
        await dispatch(fetchDashboardList());
        setOpenCreateModal(false);
        setNewDashboardName('');
        toast.success(response.message || "Dashboard created successfully!");
        
        // Navigate to the newly created dashboard
        const newDashboard = response.data;
        if (newDashboard) {
          navigate(`/dashboard/${newDashboard._id}`, { 
            state: { enableEditMode: true }
          });
        }
      } catch (error) {
        console.error("Failed to create dashboard:", error);
        toast.error("Failed to create dashboard. Please try again.");
      } finally {
        setIsCreating(false);
      }
    }
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    setNewDashboardName('');
  };

  // If no ID is provided, show the dashboard list view
  if (!id) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          backgroundColor: 'white',
          p: 2,
          borderRadius: 1,
          boxShadow: 1
        }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#1a237e' }}>
            Dashboards
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateModal(true)}
            sx={{
              backgroundColor: '#1a237e',
              '&:hover': {
                backgroundColor: '#000051'
              }
            }}
          >
            Create New Dashboard
          </Button>
        </Box>
        
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: 2,
            boxShadow: 2,
            maxHeight: 'calc(100vh - 300px)',
            overflow: 'auto',
            '& .MuiTableCell-root': {
              borderBottom: '1px solid #e0e0e0',
              py: 2,
              px: 3
            }
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Created By</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Organization</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Updated At</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashboards.map((dashboard) => (
                <TableRow 
                  key={dashboard._id}
                  sx={{
                    '&:hover': {
                      backgroundColor: '#f8f9fa',
                      transition: 'background-color 0.2s'
                    },
                    cursor: 'pointer'
                  }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>{dashboard.name}</TableCell>
                  <TableCell>{dashboard.createdBy}</TableCell>
                  <TableCell>{dashboard.organizationId}</TableCell>
                  <TableCell>
                    <Chip
                      label={dashboard.isActive ? 'Active' : 'Inactive'}
                      color={dashboard.isActive ? 'success' : 'error'}
                      size="small"
                      sx={{ 
                        fontWeight: 500,
                        '& .MuiChip-label': {
                          px: 1
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>{format(new Date(dashboard.createdAt), 'MMM dd, yyyy HH:mm')}</TableCell>
                  <TableCell>{format(new Date(dashboard.updatedAt), 'MMM dd, yyyy HH:mm')}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit Dashboard">
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(dashboard._id)}
                          size="small"
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.1)'
                            }
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Dashboard">
                        <IconButton
                          color="error"
                          onClick={(e) => handleDeleteClick(e, dashboard)}
                          size="small"
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(211, 47, 47, 0.1)'
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Create Dashboard Modal */}
        <Dialog 
          open={openCreateModal} 
          onClose={handleCloseCreateModal}
          PaperProps={{
            sx: {
              borderRadius: 2,
              minWidth: '400px'
            }
          }}
        >
          <DialogTitle sx={{ 
            backgroundColor: '#f5f5f5',
            color: '#1a237e',
            fontWeight: 600
          }}>
            Create New Dashboard
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Dashboard Name"
              type="text"
              fullWidth
              variant="outlined"
              value={newDashboardName}
              onChange={(e) => setNewDashboardName(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#1a237e'
                  }
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={handleCloseCreateModal}
              sx={{ color: '#666' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateDashboard} 
              variant="contained"
              disabled={!newDashboardName.trim() || isCreating}
              sx={{
                backgroundColor: '#1a237e',
                '&:hover': {
                  backgroundColor: '#000051'
                }
              }}
            >
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          open={deleteModalOpen}
          dashboard={dashboardToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isDeleting={isDeleting}
        />
      </Box>
    );
  }

  // Show loading state while fetching dashboard data
  if (!currentDashboard) {
    return <div>Loading...</div>;
  }

  // Show specific dashboard view
  return (
    <DashboardView
      title={currentDashboard.name}
      onTitleChange={handleTitleChange}
      onCreateWidget={handleCreateWidget}
    />
  );
};

export default Dashboard;
