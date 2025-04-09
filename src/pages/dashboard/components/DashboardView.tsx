import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import { useParams, useLocation } from 'react-router-dom';
import { ChartGrid } from './ChartGrid';
import { AddChartModal, ChartFormData } from './AddChartModal';
import { useAppDispatch, useAppSelector } from '../../../storeHooks';
import { updateWidget, saveWidgets } from '../dashboardActions';
import { toast } from 'react-toastify';
import { ChartResponse, TemporaryChart } from '../types';

interface DashboardViewProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  title,
  onTitleChange,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [isAddChartModalOpen, setIsAddChartModalOpen] = useState(false);
  const [isEditChartModalOpen, setIsEditChartModalOpen] = useState(false);
  const [selectedChart, setSelectedChart] = useState<ChartResponse | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { id: dashboardId } = useParams();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const temporaryCharts = useAppSelector((state) => state.dashboard.temporaryCharts);

  useEffect(() => {
    if (location.state?.enableEditMode) {
      setIsEditMode(true);
    }
  }, [location.state]);

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditMode]);

  const handleEditModeToggle = async () => {
    if (isEditMode) {
      // Save title first if it has changed
      if (editedTitle !== title) {
        onTitleChange(editedTitle);
      }
      
      // Save temporary charts only if there are any
      if (temporaryCharts.length > 0) {
        try {
          const result = await dispatch(saveWidgets({
            widgets: temporaryCharts.map((chart: TemporaryChart) => ({
              dashboardId: chart.dashboardId,
              widgetTypeId: chart.widgetTypeId?._id || '',
              name: chart.name,
              dimensions: chart.dimensions.join(','),
              groupBy: chart.groupBy,
              aggregation: chart.aggregation,
              position: chart.position,
              conditions: chart.conditions,
              dataSourceId: chart.dataSourceId?._id || '',
              entityId: chart.dataSourceId?.entityId || ''
            }))
          })).unwrap();

          if (result.success) {
            toast.success('Charts saved successfully!');
          } else {
            toast.error(result.message || 'Failed to save charts');
          }
        } catch (error) {
          if (typeof error === 'object' && error !== null && 'message' in error) {
            toast.error(error.message as string);
          } else {
            toast.error('Failed to save charts');
          }
        }
      }
      
      setIsEditMode(false);
    } else {
      setIsEditMode(!isEditMode);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onTitleChange(editedTitle);
      setIsEditMode(false);
    }
  };

  const handleCloseModal = () => {
    setIsAddChartModalOpen(false);
  };

  const handleEditChart = (chart: ChartResponse) => {
    setSelectedChart(chart);
    setIsEditChartModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditChartModalOpen(false);
    setSelectedChart(null);
  };

  const handleChartUpdate = async (formData: ChartFormData) => {
    if (!selectedChart) return;
    
    try {
      const result = await dispatch(updateWidget({
        ...formData,
        _id: selectedChart._id,
        dashboardId: dashboardId || ''
      })).unwrap();
      
      if (result.success) {
        toast.success('Chart updated successfully!');
        handleCloseEditModal();
      } else {
        toast.error(result.message || 'Failed to update chart');
      }
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        toast.error(error.message as string);
      } else {
        toast.error('Failed to update chart');
      }
    }
  };

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <Box 
        component={Paper} 
        sx={{ 
          p: 3,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}
      >
        <Box sx={{ flex: 1, mr: 2 }}>
          {isEditMode ? (
            <TextField
              inputRef={inputRef}
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              size="small"
              fullWidth
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: '1.5rem',
                  fontWeight: 500,
                },
              }}
            />
          ) : (
            <Typography 
              variant="h5" 
              component="h1"
              fontWeight={500}
            >
              {title}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {isEditMode ? (
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setIsAddChartModalOpen(true)}
              >
                Add Chart
              </Button>
              <Button
                onClick={handleEditModeToggle}
                color="success"
                variant="contained"
                startIcon={<DoneIcon />}
              >
                Save
              </Button>
            </>
          ) : (
            <Button
              onClick={handleEditModeToggle}
              color="primary"
              variant="contained"
              startIcon={<EditIcon />}
            >
              Edit
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        flex: 1,
        overflow: 'hidden',
        gap: 3,
        height: 'calc(100% - 100px)'
      }}>
        <Box 
          component={Paper}
          sx={{ 
            flex: 1,
            overflow: 'auto',
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(auto-fit, minmax(400px, 1fr))',
              md: 'repeat(auto-fit, minmax(450px, 1fr))',
              lg: 'repeat(auto-fit, minmax(500px, 1fr))'
            },
            gap: 3,
            p: 3,
            transition: 'all 0.3s ease',
            ...((isAddChartModalOpen || isEditChartModalOpen) && {
              flex: '1 1 70%',
            }),
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '4px'
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent'
            }
          }}
        >
          {dashboardId && (
            <ChartGrid 
              dashboardId={dashboardId} 
              isEditMode={isEditMode} 
              onEditChart={handleEditChart}
            />
          )}
        </Box>

        {(isAddChartModalOpen || isEditChartModalOpen) && (
          <Box
            component={Paper}
            sx={{
              width: '400px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
              height: '100%'
            }}
          >
            {isAddChartModalOpen && (
              <AddChartModal
                open={isAddChartModalOpen}
                onClose={handleCloseModal}
                isSubmitting={false}
                dashboardId={dashboardId || ''}
              />
            )}
            {isEditChartModalOpen && selectedChart && (
              <AddChartModal
                open={isEditChartModalOpen}
                onClose={handleCloseEditModal}
                isSubmitting={false}
                dashboardId={dashboardId || ''}
                initialData={selectedChart}
                onSave={handleChartUpdate}
              />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}; 