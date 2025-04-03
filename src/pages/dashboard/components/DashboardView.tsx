import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import { useParams, useLocation } from 'react-router-dom';
import { ChartGrid } from './ChartGrid';
import { AddChartModal } from './AddChartModal';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const { id: dashboardId } = useParams();
  const location = useLocation();

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

  const handleEditModeToggle = () => {
    if (isEditMode) {
      onTitleChange(editedTitle);
    }
    setIsEditMode(!isEditMode);
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

      <Box 
        component={Paper}
        sx={{ 
          p: 3,
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
        {dashboardId && <ChartGrid dashboardId={dashboardId} isEditMode={isEditMode} />}
      </Box>

      <AddChartModal
        open={isAddChartModalOpen}
        onClose={handleCloseModal}
        isSubmitting={false}
        dashboardId={dashboardId || ''}
      />
    </Box>
  );
}; 