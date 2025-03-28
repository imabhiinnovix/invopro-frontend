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
  TextField,
  Box,
  Typography,
  IconButton,
  SelectChangeEvent,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import { useAppDispatch, useAppSelector } from '../../../storeHooks';
import { fetchWidgetTypes, fetchDataSources, loadMoreDataSources } from '../dashboardActions';
import { DataSource, DataSourceAttribute } from '../types';

interface Condition {
  field: string;
  operator: string;
  value: string;
}

interface Position {
  x: number;
  y: number;
  index: number;
}

interface Aggregation {
  type: string;
  attributeName: string;
}

export interface ChartFormData {
  name: string;
  dimensions: string;
  groupBy: string;
  aggregation: Aggregation;
  position: Position;
  conditions: Condition[];
  dataSourceId: string;
  widgetTypeId: string;
  dashboardId: string;
}

interface AddChartModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: ChartFormData) => Promise<void>;
  isSubmitting?: boolean;
  dashboardId: string;
}

const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    maxWidth: '800px',
    width: '100%',
    borderRadius: '12px',
  },
});

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTypography-root': {
    fontSize: '1.25rem',
    fontWeight: 600,
  },
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0,
  },
}));

const FirstFormSection = styled(FormSection)(({ theme }) => ({
  paddingTop: theme.spacing(2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 500,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));

const FormRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0,
  },
}));

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
  },
});

const StyledSelect = styled(Select)({
  borderRadius: '8px',
});

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  textTransform: 'none',
  padding: theme.spacing(1, 2),
  '&.MuiButton-contained': {
    boxShadow: 'none',
    '&:hover': {
      boxShadow: 'none',
    },
  },
}));

export const AddChartModal: React.FC<AddChartModalProps> = ({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  dashboardId,
}) => {
  console.log("🚀 ~ dashboardId̥:", dashboardId)
  const dispatch = useAppDispatch();
  const { 
    widgetTypes, 
    dataSources, 
    widgetTypesLoading, 
    dataSourcesLoading,
    dataSourcesHasMore,
    dataSourcesPage,
    dataSourcesTotalCount
  } = useAppSelector((state) => state.dashboard);

  const [formData, setFormData] = useState<ChartFormData>({
    name: '',
    dimensions: '',
    groupBy: '',
    aggregation: {
      type: 'count',
      attributeName: '',
    },
    position: {
      x: 0,
      y: 0,
      index: 0,
    },
    conditions: [{
      field: '',
      operator: 'equals',
      value: '',
    }],
    dataSourceId: '',
    widgetTypeId: '',
    dashboardId,
  });

  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);

  useEffect(() => {
    if (!open) {
      setFormData({
        name: '',
        dimensions: '',
        groupBy: '',
        aggregation: {
          type: 'count',
          attributeName: '',
        },
        position: {
          x: 0,
          y: 0,
          index: 0,
        },
        conditions: [{
          field: '',
          operator: 'equals',
          value: '',
        }],
        dataSourceId: '',
        widgetTypeId: '',
        dashboardId,
      });
    }
  }, [open, dashboardId]);

  useEffect(() => {
    if (open) {
      dispatch(fetchWidgetTypes());
      dispatch(fetchDataSources(1));
    }
  }, [dispatch, open]);

  useEffect(() => {
    if (formData.dataSourceId) {
      const dataSource = dataSources.find((ds) => ds._id === formData.dataSourceId);
      setSelectedDataSource(dataSource || null);
    } else {
      setSelectedDataSource(null);
    }
  }, [formData.dataSourceId, dataSources]);

  const handleChange = (field: keyof ChartFormData, value: string | number | Position | Aggregation | Condition[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAggregationChange = (field: keyof Aggregation, value: string) => {
    setFormData((prev) => ({
      ...prev,
      aggregation: {
        ...prev.aggregation,
        [field]: value,
      },
    }));
  };

  const handleConditionChange = (index: number, field: keyof Condition, value: string) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) => 
        i === index ? { ...condition, [field]: value } : condition
      ),
    }));
  };

  const addCondition = () => {
    setFormData((prev) => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        { field: '', operator: 'equals', value: '' },
      ],
    }));
  };

  const removeCondition = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  };

  const handlePositionChange = (field: keyof Position, value: string) => {
    setFormData((prev) => ({
      ...prev,
      position: {
        ...prev.position,
        [field]: Number(value),
      },
    }));
  };

  const handleSelectChange = (field: keyof ChartFormData, event: SelectChangeEvent<unknown>) => {
    handleChange(field, event.target.value as string);
  };

  const handleConditionSelectChange = (index: number, field: keyof Condition, event: SelectChangeEvent<unknown>) => {
    handleConditionChange(index, field, event.target.value as string);
  };

  const handleConditionValueInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleConditionChange(index, 'value', event.target.value);
  };

  const handleDataSourceChange = (event: SelectChangeEvent<unknown>) => {
    const newDataSourceId = event.target.value as string;
    setFormData((prev) => ({
      ...prev,
      dataSourceId: newDataSourceId,
      dimensions: '',
      groupBy: '',
      aggregation: {
        ...prev.aggregation,
        attributeName: '',
      },
      conditions: [{
        field: '',
        operator: 'equals',
        value: '',
      }],
    }));
  };

  const handleAggregationTypeChange = (event: SelectChangeEvent<unknown>) => {
    handleAggregationChange('type', event.target.value as string);
  };

  const handleAggregationAttributeChange = (event: SelectChangeEvent<unknown>) => {
    handleAggregationChange('attributeName', event.target.value as string);
  };

  const handleDimensionChange = (event: SelectChangeEvent<unknown>) => {
    const newDimension = event.target.value as string;
    if (newDimension === formData.groupBy) {
      return;
    }
    handleChange('dimensions', newDimension);
  };

  const handleGroupByChange = (event: SelectChangeEvent<unknown>) => {
    const newGroupBy = event.target.value as string;
    if (newGroupBy === formData.dimensions) {
      return;
    }
    handleChange('groupBy', newGroupBy);
  };

  const handleConditionFieldChange = (index: number, event: SelectChangeEvent<unknown>) => {
    handleConditionChange(index, 'field', event.target.value as string);
  };

  const handleSubmit = async () => {
    if (formData.widgetTypeId) {
      await onSubmit({
        ...formData,
        position: {
          x: Number(formData.position.x),
          y: Number(formData.position.y),
          index: Number(formData.position.index),
        },
      });
    }
  };

  const getAttributeOptions = (): DataSourceAttribute[] => {
    return selectedDataSource?.entityId.attributes || [];
  };

  const handleClearDimension = () => {
    handleChange('dimensions', '');
  };

  const handleClearGroupBy = () => {
    handleChange('groupBy', '');
  };

  const handleDataSourceScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    if (
      target.scrollHeight - target.scrollTop === target.clientHeight &&
      !dataSourcesLoading &&
      dataSourcesHasMore &&
      dataSources.length < dataSourcesTotalCount
    ) {
      dispatch(loadMoreDataSources(dataSourcesPage + 1));
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <StyledDialogTitle>Add Chart</StyledDialogTitle>
      <StyledDialogContent>
        <FirstFormSection>
          <StyledTextField
            fullWidth
            label="Chart Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            disabled={isSubmitting}
            size="small"
          />
        </FirstFormSection>

        <FormSection>
          <FormRow>
            <FormControl fullWidth size="small">
              <InputLabel>Chart Type</InputLabel>
              <StyledSelect
                value={formData.widgetTypeId}
                label="Chart Type"
                onChange={(e) => handleSelectChange('widgetTypeId', e)}
                disabled={isSubmitting || widgetTypesLoading}
              >
                {widgetTypes.map((type) => (
                  <MenuItem key={type._id} value={type._id}>
                    {type.name}
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Data Source</InputLabel>
              <StyledSelect
                value={formData.dataSourceId}
                label="Data Source"
                onChange={handleDataSourceChange}
                disabled={isSubmitting || dataSourcesLoading}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 300,
                    },
                    onScroll: handleDataSourceScroll,
                  },
                }}
              >
                {dataSources.map((source) => (
                  <MenuItem key={source._id} value={source._id}>
                    {source.name}
                  </MenuItem>
                ))}
                {dataSourcesLoading && (
                  <MenuItem disabled>
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                      Loading...
                    </Box>
                  </MenuItem>
                )}
              </StyledSelect>
            </FormControl>
          </FormRow>
        </FormSection>

        {selectedDataSource && (
          <>
            <FormSection>
              <FormRow>
                <FormControl fullWidth size="small">
                  <InputLabel>Dimensions</InputLabel>
                  <StyledSelect
                    value={formData.dimensions}
                    label="Dimensions"
                    onChange={handleDimensionChange}
                    disabled={isSubmitting}
                    endAdornment={
                      formData.dimensions && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={handleClearDimension}
                            edge="end"
                            sx={{ mr: 1 }}
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  >
                    {getAttributeOptions().map((attr) => (
                      <MenuItem 
                        key={attr.name} 
                        value={attr.name}
                        disabled={attr.name === formData.groupBy}
                      >
                        {attr.name}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Group By</InputLabel>
                  <StyledSelect
                    value={formData.groupBy}
                    label="Group By"
                    onChange={handleGroupByChange}
                    disabled={isSubmitting}
                    endAdornment={
                      formData.groupBy && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={handleClearGroupBy}
                            edge="end"
                            sx={{ mr: 1 }}
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  >
                    {getAttributeOptions().map((attr) => (
                      <MenuItem 
                        key={attr.name} 
                        value={attr.name}
                        disabled={attr.name === formData.dimensions}
                      >
                        {attr.name}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
              </FormRow>
            </FormSection>

            <FormSection>
              <SectionTitle>Aggregation</SectionTitle>
              <FormRow>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <StyledSelect
                    value={formData.aggregation.type}
                    label="Type"
                    onChange={handleAggregationTypeChange}
                    disabled={isSubmitting}
                  >
                    <MenuItem value="Count">Count</MenuItem>
                    <MenuItem value="Sum">Sum</MenuItem>
                    <MenuItem value="Average">Average</MenuItem>
                  </StyledSelect>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Attribute Name</InputLabel>
                  <StyledSelect
                    value={formData.aggregation.attributeName}
                    label="Attribute Name"
                    onChange={handleAggregationAttributeChange}
                    disabled={isSubmitting}
                  >
                    {getAttributeOptions().map((attr) => (
                      <MenuItem key={attr.name} value={attr.name}>
                        {attr.name}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
              </FormRow>
            </FormSection>

            <FormSection>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <SectionTitle>Conditions</SectionTitle>
                <StyledButton
                  startIcon={<AddIcon />}
                  onClick={addCondition}
                  disabled={isSubmitting}
                  size="small"
                >
                  Add Condition
                </StyledButton>
              </Box>
              
              {formData.conditions.map((condition, index) => (
                <FormRow key={index}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Field</InputLabel>
                    <StyledSelect
                      value={condition.field}
                      label="Field"
                      onChange={(e) => handleConditionFieldChange(index, e)}
                      disabled={isSubmitting}
                    >
                      {getAttributeOptions().map((attr) => (
                        <MenuItem key={attr.name} value={attr.name}>
                          {attr.name}
                        </MenuItem>
                      ))}
                    </StyledSelect>
                  </FormControl>
                  <FormControl fullWidth size="small">
                    <InputLabel>Operator</InputLabel>
                    <StyledSelect
                      value={condition.operator}
                      label="Operator"
                      onChange={(e) => handleConditionSelectChange(index, 'operator', e)}
                      disabled={isSubmitting}
                    >
                      <MenuItem value="equals">Equals</MenuItem>
                      <MenuItem value="contains">Contains</MenuItem>
                      <MenuItem value="startsWith">Starts With</MenuItem>
                      <MenuItem value="endsWith">Ends With</MenuItem>
                    </StyledSelect>
                  </FormControl>
                  <StyledTextField
                    label="Value"
                    value={condition.value}
                    onChange={(e) => handleConditionValueInputChange(index, e)}
                    disabled={isSubmitting}
                    size="small"
                    fullWidth
                  />
                  <IconButton
                    onClick={() => removeCondition(index)}
                    disabled={isSubmitting || formData.conditions.length === 1}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </FormRow>
              ))}
            </FormSection>

            <FormSection>
              <SectionTitle>Position</SectionTitle>
              <FormRow>
                <StyledTextField
                  label="X"
                  type="number"
                  value={formData.position.x}
                  onChange={(e) => handlePositionChange('x', e.target.value)}
                  disabled={isSubmitting}
                  size="small"
                />
                <StyledTextField
                  label="Y"
                  type="number"
                  value={formData.position.y}
                  onChange={(e) => handlePositionChange('y', e.target.value)}
                  disabled={isSubmitting}
                  size="small"
                />
                <StyledTextField
                  label="Index"
                  type="number"
                  value={formData.position.index}
                  onChange={(e) => handlePositionChange('index', e.target.value)}
                  disabled={isSubmitting}
                  size="small"
                />
              </FormRow>
            </FormSection>
          </>
        )}
      </StyledDialogContent>

      <StyledDialogActions>
        <StyledButton onClick={onClose} disabled={isSubmitting}>
          Cancel
        </StyledButton>
        <StyledButton
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isSubmitting || !formData.widgetTypeId || !formData.dataSourceId}
        >
          {isSubmitting ? 'Creating...' : 'Create'}
        </StyledButton>
      </StyledDialogActions>
    </StyledDialog>
  );
}; 