import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import { AddChartModal, WidgetType } from './AddChartModal';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../../storeHooks';
import { createWidget } from '../dashboardActions';

const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  height: 'calc(100vh - 70px)',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#fff',
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

interface DashboardViewProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  dashboardId: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  title,
  onTitleChange,
  dashboardId,
}) => {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [isAddChartModalOpen, setIsAddChartModalOpen] = useState(false);
  const [isCreatingWidget, setIsCreatingWidget] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editedTitle.trim() !== title) {
      onTitleChange(editedTitle.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (editedTitle.trim() !== title) {
        onTitleChange(editedTitle.trim());
      }
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedTitle(title);
    }
  };

  const handleAddChart = async (widgetType: WidgetType) => {
    try {
      setIsCreatingWidget(true);
      const result = await dispatch(createWidget({
        dashboardId,
        widgetTypeId: widgetType._id
      })).unwrap();
      
      if (result.success) {
        toast.success('Chart added successfully!');
        setIsAddChartModalOpen(false);
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
        {isEditing ? (
          <TextField
            inputRef={inputRef}
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleBlur}
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
          <TitleWrapper onDoubleClick={handleDoubleClick}>
            <Typography variant="h5" component="h1" fontWeight={500}>
              {title}
            </Typography>
          </TitleWrapper>
        )}
        
        <AddChartButton
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setIsAddChartModalOpen(true)}
        >
          Add Chart
        </AddChartButton>
      </HeaderBox>

      {/* Content area will be added later */}
      <Box sx={{ flexGrow: 1 }} />

      <AddChartModal
        open={isAddChartModalOpen}
        onClose={() => !isCreatingWidget && setIsAddChartModalOpen(false)}
        onSubmit={handleAddChart}
        isSubmitting={isCreatingWidget}
      />
    </StyledBox>
  );
}; 