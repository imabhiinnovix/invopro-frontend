import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axiosInstance from '../../../services/axiosInstance';
import { GET } from '../../../services/apiRoutes';
import { toast } from 'react-toastify';

export interface WidgetType {
  _id: string;
  name: string;
  description: string;
  chartType: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface WidgetTypeResponse {
  success: boolean;
  message: string;
  data: WidgetType[];
  totalCount: number;
}

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  minWidth: 300,
}));

interface AddChartModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (widgetType: WidgetType) => Promise<void>;
  isSubmitting?: boolean;
}

export const AddChartModal: React.FC<AddChartModalProps> = ({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [widgetTypes, setWidgetTypes] = useState<WidgetType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedType('');
    }
  }, [open]);

  useEffect(() => {
    const fetchWidgetTypes = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get<WidgetTypeResponse>(GET.WIDGET_TYPE_LIST);
        if (data.success) {
          setWidgetTypes(data.data);
        } else {
          toast.error(data.message || 'Failed to fetch widget types');
        }
      } catch (error) {
        console.error('Error fetching widget types:', error);
        toast.error('Failed to fetch widget types. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchWidgetTypes();
    }
  }, [open]);

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedType(event.target.value);
  };

  const handleSubmit = async () => {
    const selectedWidget = widgetTypes.find(type => type._id === selectedType);
    if (selectedWidget) {
      await onSubmit(selectedWidget);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Chart</DialogTitle>
      <DialogContent>
        <StyledFormControl fullWidth>
          <InputLabel id="widget-type-label">Chart Type</InputLabel>
          <Select
            labelId="widget-type-label"
            id="widget-type-select"
            value={selectedType}
            label="Chart Type"
            onChange={handleChange}
            disabled={loading || isSubmitting}
          >
            {widgetTypes.map((type) => (
              <MenuItem key={type._id} value={type._id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </StyledFormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!selectedType || loading || isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 