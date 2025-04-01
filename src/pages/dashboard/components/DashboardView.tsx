import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import { AddChartModal, ChartFormData } from './AddChartModal';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../../storeHooks';
import { createWidget } from '../dashboardActions';
import { useParams, useLocation } from 'react-router-dom';
import { ChartGrid } from './ChartGrid';

const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  height: 'calc(100vh - 70px)',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#fff',
  overflow: 'hidden',
}));

const HeaderBox = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '32px',
});

const TitleWrapper = styled(Box)({
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
  padding: '8px',
  borderRadius: '4px',
});

const AddChartButton = styled(Button)({
  borderRadius: '8px',
  padding: '6px 16px',
  textTransform: 'none',
  fontWeight: 500,
});

const ChartGridContainer = styled(Box)({
  flexGrow: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '4px',
  },
});

interface DashboardViewProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  onCreateWidget: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  title,
  onTitleChange,
  onCreateWidget,
}) => {
  const dispatch = useAppDispatch();
  const { id: dashboardId } = useParams();
  const location = useLocation();
  const [editedTitle, setEditedTitle] = useState(title);
  const [isAddChartModalOpen, setIsAddChartModalOpen] = useState(false);
  const [isCreatingWidget, setIsCreatingWidget] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (location.state?.enableEditMode) {
      setIsEditMode(true);
    }
  }, [location.state]);

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditMode]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditedTitle(title);
    }
  };

  const handleEditModeToggle = () => {
    if (isEditMode) {
      if (editedTitle.trim() !== title) {
        onTitleChange(editedTitle.trim());
      }
    } else {
      setEditedTitle(title);
    }
    setIsEditMode(!isEditMode);
  };

  const handleAddChart = async (formData: ChartFormData) => {
    try {
      setIsCreatingWidget(true);
      const result = await dispatch(createWidget({
        ...formData,
        dashboardId: dashboardId || '',
      })).unwrap();
      
      if (result.success) {
        toast.success('Chart added successfully!');
        setIsAddChartModalOpen(false);
        onCreateWidget();
      } else {
        toast.error(result.message || 'Failed to add chart');
      }
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        toast.error(error.message as string);
      } else {
        toast.error('Failed to add chart');
      }
    } finally {
      setIsCreatingWidget(false);
    }
  };

  return (
    <StyledBox>
      <HeaderBox>
        {isEditMode ? (
          <TextField
            inputRef={inputRef}
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            size="small"
            sx={{ 
              width: '300px',
              '& .MuiInputBase-input': {
                fontSize: '1.5rem',
                fontWeight: 500,
              }
            }}
          />
        ) : (
          <TitleWrapper>
            <Typography 
              variant="h5" 
              component="h1" 
              fontWeight={500}
            >
              {title}
            </Typography>
          </TitleWrapper>
        )}
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {isEditMode ? (
            <>
              <AddChartButton
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setIsAddChartModalOpen(true)}
              >
                Add Chart
              </AddChartButton>
              <Button
                onClick={handleEditModeToggle}
                color="success"
                variant="contained"
                startIcon={<DoneIcon />}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 500,
                }}
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
              sx={{ 
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              Edit
            </Button>
          )}
        </Box>
      </HeaderBox>

      <ChartGridContainer>
        {dashboardId && <ChartGrid dashboardId={dashboardId} isEditMode={isEditMode} />}
      </ChartGridContainer>

      <AddChartModal
        open={isAddChartModalOpen}
        onClose={() => !isCreatingWidget && setIsAddChartModalOpen(false)}
        onSubmit={handleAddChart}
        isSubmitting={isCreatingWidget}
        dashboardId={dashboardId || ''}
      />
    </StyledBox>
  );
}; 