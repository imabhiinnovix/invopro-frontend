import React, { useEffect, useState } from "react";
import {
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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import { useAppDispatch, useAppSelector } from "../../../storeHooks";
import { fetchWidgetTypes, fetchAllDataSources, saveWidgets, fetchChartData } from "../dashboardActions";
import { DataSource, DataSourceAttribute, ChartResponse, WidgetDataResponse, Operator, OperatorType, OperatorListResponse } from "../types";
import { toast } from "react-toastify";
import axiosInstance from "../../../services/axiosInstance";
import { GET } from "../../../services/apiRoutes";
import { v4 as uuidv4 } from "uuid";

interface Condition {
  field: string;
  operator: string;
  value: string;
  _id?: string;
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
  isSubmitting: boolean;
  dashboardId: string;
  initialData?: ChartResponse;
  onSave?: (formData: ChartFormData) => Promise<void>;
  isTrend?: boolean;
}

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  "&:last-child": {
    marginBottom: 0,
  },
}));

const FirstFormSection = styled(FormSection)(({ theme }) => ({
  paddingTop: theme.spacing(2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: 500,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));

const FormRow = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  "&:last-child": {
    marginBottom: 0,
  },
}));

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
  },
});

const StyledSelect = styled(Select)({
  borderRadius: "8px",
});

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  textTransform: "none",
  padding: theme.spacing(1, 2),
  "&.MuiButton-contained": {
    boxShadow: "none",
    "&:hover": {
      boxShadow: "none",
    },
  },
}));

const ConditionsSection = styled(FormSection)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "8px",
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
}));

const ConfigurationPanel = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.background.paper,
}));

const ConfigurationHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.paper,
  zIndex: 1,
}));

const ConfigurationContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  overflowY: 'auto',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const ConfigurationFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  zIndex: 1,
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
}));

export const AddChartModal: React.FC<AddChartModalProps> = ({
  open,
  onClose,
  isSubmitting,
  dashboardId,
  initialData,
  onSave,
  isTrend,
}) => {
  const dispatch = useAppDispatch();
  const {
    widgetTypes,
    dataSources,
    widgetTypesLoading,
    dataSourcesLoading,
  } = useAppSelector((state) => state.dashboard);

  const [formData, setFormData] = useState<ChartFormData>({
    name: initialData?.name || "",
    dimensions: Array.isArray(initialData?.dimensions)
      ? initialData.dimensions.join(", ")
      : "",
    groupBy: Array.isArray(initialData?.groupBy)
      ? initialData.groupBy.join(", ")
      : "",
    aggregation: initialData?.aggregation || {
      type: "count",
      attributeName: "",
    },
    position: initialData?.position || {
      x: 0,
      y: 0,
      index: 0,
    },
    conditions: initialData?.conditions || [],
    dataSourceId: initialData?.dataSourceId?._id || "",
    widgetTypeId: initialData?.widgetTypeId?._id || "",
    dashboardId,
  });

  const [selectedDataSource, setSelectedDataSource] =
    useState<DataSource | null>(null);

  const [operators, setOperators] = useState<OperatorType[]>([]);
  const [fieldTypes, setFieldTypes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (open && initialData) {
      // Only set initial data if formData is empty (first load)
      if (!formData.name && !formData.dimensions && !formData.groupBy) {
        setFormData({
          name: initialData.name,
          dimensions: Array.isArray(initialData.dimensions)
            ? initialData.dimensions.join(", ")
            : "",
          groupBy: Array.isArray(initialData.groupBy)
            ? initialData.groupBy.join(", ")
            : "",
          aggregation: initialData.aggregation,
          position: initialData.position,
          conditions: initialData.conditions,
          dataSourceId: initialData.dataSourceId?._id || "",
          widgetTypeId: initialData.widgetTypeId?._id || "",
          dashboardId,
        });

        if (initialData.dataSourceId?._id) {
          dispatch(fetchAllDataSources()).then(() => {
            const dataSource = dataSources.find(ds => ds._id === initialData.dataSourceId?._id);
            if (dataSource) {
              setSelectedDataSource(dataSource);
            }
          });
        }
      }
    } else if (!open) {
      setFormData({
        name: "",
        dimensions: "",
        groupBy: "",
        aggregation: {
          type: "count",
          attributeName: "",
        },
        position: {
          x: 0,
          y: 0,
          index: 0,
        },
        conditions: [],
        dataSourceId: "",
        widgetTypeId: "",
        dashboardId,
      });
    }
  }, [open, initialData, dashboardId, dispatch, dataSources]);

  useEffect(() => {
    if (open) {
      dispatch(fetchWidgetTypes());
      dispatch(fetchAllDataSources());
      fetchOperators();
    }
  }, [dispatch, open]);

  useEffect(() => {
    if (formData.dataSourceId) {
      const dataSource = dataSources.find(
        (ds) => ds._id === formData.dataSourceId
      );
      setSelectedDataSource(dataSource || null);
    } else {
      setSelectedDataSource(null);
    }
  }, [formData.dataSourceId, dataSources]);

  useEffect(() => {
    if (isTrend && open) {
      setFormData((prev) => ({
        ...prev,
        dimensions: "versionValue",
      }));
    }
  }, [isTrend, open, formData.dataSourceId]);

  const handleChange = (
    field: keyof ChartFormData,
    value: string | number | Position | Aggregation | Condition[]
  ) => {
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

  const handleConditionChange = (
    index: number,
    field: keyof Condition,
    value: string
  ) => {
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
        { field: "", operator: "equals", value: "" },
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

  const handleSelectChange = (
    field: keyof ChartFormData,
    event: SelectChangeEvent<unknown>
  ) => {
    handleChange(field, event.target.value as string);
  };

  const handleConditionSelectChange = (
    index: number,
    field: keyof Condition,
    event: SelectChangeEvent<unknown>
  ) => {
    handleConditionChange(index, field, event.target.value as string);
  };

  const handleConditionFieldChange = (
    index: number,
    event: SelectChangeEvent<unknown>
  ) => {
    const fieldName = event.target.value as string;
    const attribute = selectedDataSource?.entityId.attributes.find(attr => attr.name === fieldName);
    
    if (attribute) {
      setFieldTypes(prev => ({
        ...prev,
        [index]: attribute.type
      }));
    }
    
    handleConditionChange(index, "field", fieldName);
    handleConditionChange(index, "operator", "");
    handleConditionChange(index, "value", "");
  };

  const handleConditionValueInputChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    const fieldType = fieldTypes[index];
    
    if (fieldType === 'date') {
      // Format date to YYYY-MM-DD
      const formattedDate = formatDateToYYYYMMDD(value);
      handleConditionChange(index, "value", formattedDate);
    } else {
      handleConditionChange(index, "value", value);
    }
  };

  const formatDateToYYYYMMDD = (dateString: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const handleDataSourceChange = (event: SelectChangeEvent<unknown>) => {
    const selectedDs = dataSources.find(
      (ds) => ds._id === event.target.value
    );
    if (selectedDs) {
      setSelectedDataSource(selectedDs);
      setFormData((prev) => ({
        ...prev,
        dataSourceId: event.target.value as string,
        dimensions: "",
        groupBy: "",
        aggregation: {
          ...prev.aggregation,
          attributeName: "",
        },
        conditions: [],
      }));
    }
  };

  const handleAggregationTypeChange = (event: SelectChangeEvent<unknown>) => {
    handleAggregationChange("type", event.target.value as string);
  };

  const handleAggregationAttributeChange = (
    event: SelectChangeEvent<unknown>
  ) => {
    handleAggregationChange("attributeName", event.target.value as string);
  };

  const handleDimensionChange = (event: SelectChangeEvent<unknown>) => {
    const newDimension = event.target.value as string;
    handleChange("dimensions", newDimension);
  };

  const handleGroupByChange = (event: SelectChangeEvent<unknown>) => {
    const newGroupBy = event.target.value as string;
    handleChange("groupBy", newGroupBy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dimensionsToSend = isTrend ? "versionValue" : formData.dimensions;

      if (onSave) {
        await onSave({
          ...formData,
          dimensions: dimensionsToSend,
        });
      } else {
        // Get widget data using getWidgetData API
        const widgetResponse = await axiosInstance.post<WidgetDataResponse>(
          GET.DASHBOARD_WIDGET_DATA,
          {
            dataSourceId: formData.dataSourceId,
            entityId: selectedDataSource?.entityId._id,
            dimensions: [dimensionsToSend],
            groupBy: formData.groupBy ? formData.groupBy.split(',').map(g => g.trim()) : [],
            conditions: formData.conditions.map(condition => ({
              ...condition,
              _id: condition._id || uuidv4()
            })),
            aggregation: formData.aggregation,
            widgetType: widgetTypes.find(wt => wt._id === formData.widgetTypeId)?.chartType || ''
          }
        );

        if (widgetResponse.data.success) {
          // Save the widget directly
          const saveResponse = await dispatch(saveWidgets({
            widgets: [{
              dashboardId: dashboardId,
              widgetTypeId: formData.widgetTypeId,
              name: formData.name,
              dimensions: dimensionsToSend,
              groupBy: formData.groupBy ? formData.groupBy.split(',').map(g => g.trim()) : [],
              aggregation: formData.aggregation,
              position: formData.position,
              conditions: formData.conditions.map(condition => ({
                field: condition.field,
                operator: condition.operator,
                value: condition.value
              })),
              dataSourceId: formData.dataSourceId,
              entityId: selectedDataSource?.entityId._id || ''
            }]
          })).unwrap();

          if (saveResponse.success) {
            // Fetch updated chart list
            await dispatch(fetchChartData(dashboardId));
            toast.success('Chart saved successfully!');
            onClose();
          } else {
            toast.error(saveResponse.message || 'Failed to save chart');
          }
        } else {
          toast.error(widgetResponse.data.message || 'Failed to add chart');
        }
      }
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        toast.error(error.message as string);
      } else {
        toast.error('Failed to add chart');
      }
    }
  };

  const getAttributeOptions = (): DataSourceAttribute[] => {
    return selectedDataSource?.entityId.attributes || [];
  };

  const handleClearDimension = () => {
    handleChange("dimensions", "");
  };

  const handleClearGroupBy = () => {
    handleChange("groupBy", "");
  };

  const fetchOperators = async () => {
    try {
      const response = await axiosInstance.post<OperatorListResponse>(GET.OPERATOR_LIST, {
        fieldType: "all"
      });
      if (response.data.success) {
        setOperators(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch operators:", error);
    }
  };

  const getOperatorsForField = (fieldName: string): Operator[] => {
    const attribute = selectedDataSource?.entityId.attributes.find(attr => attr.name === fieldName);
    console.log("🚀 ~ attribute̥:", operators)
    if (!attribute) return [];
    
    const fieldType = attribute.type;
    const operatorType = operators.find(op => op.fieldType === fieldType);
    return operatorType?.operators || [];
  };

  if (!open) return null;

  return (
    <ConfigurationPanel>
      <ConfigurationHeader>
        <Typography variant="h6" fontWeight={600}>
          {initialData ? "Edit Chart" : "Add New Chart"}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <ClearIcon />
        </IconButton>
      </ConfigurationHeader>

      <ConfigurationContent>
        <FirstFormSection>
          <StyledTextField
            fullWidth
            label="Chart Name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
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
                onChange={(e) => handleSelectChange("widgetTypeId", e)}
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
              <InputLabel id="data-source-label">Data Source</InputLabel>
              <StyledSelect
                labelId="data-source-label"
                value={formData.dataSourceId}
                onChange={handleDataSourceChange}
                label="Data Source"
                disabled={dataSourcesLoading}
              >
                {dataSources.map((source) => (
                  <MenuItem key={source._id} value={source._id}>
                    {source.name}
                  </MenuItem>
                ))}
                {dataSourcesLoading && (
                  <MenuItem disabled>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        width: "100%",
                      }}
                    >
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
                    disabled={isSubmitting || isTrend}
                    endAdornment={
                      formData.dimensions && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={handleClearDimension}
                            edge="end"
                            sx={{ mr: 1 }}
                            disabled={isTrend}
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  >
                    {isTrend ? (
                      <MenuItem value="versionValue">versionValue</MenuItem>
                    ) : (
                      getAttributeOptions().map((attr) => (
                        <MenuItem
                          key={attr.name}
                          value={attr.name}
                          disabled={attr.name === formData.groupBy}
                        >
                          {attr.name}
                        </MenuItem>
                      ))
                    )}
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

            {/* Position section commented out
            <FormSection>
              <SectionTitle>Position</SectionTitle>
              <FormRow>
                <StyledTextField
                  label="X"
                  type="number"
                  value={formData.position.x}
                  onChange={(e) => handlePositionChange("x", e.target.value)}
                  disabled={isSubmitting}
                  size="small"
                />
                <StyledTextField
                  label="Y"
                  type="number"
                  value={formData.position.y}
                  onChange={(e) => handlePositionChange("y", e.target.value)}
                  disabled={isSubmitting}
                  size="small"
                />
                <StyledTextField
                  label="Index"
                  type="number"
                  value={formData.position.index}
                  onChange={(e) =>
                    handlePositionChange("index", e.target.value)
                  }
                  disabled={isSubmitting}
                  size="small"
                />
              </FormRow>
            </FormSection>
            */}

            <ConditionsSection>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <SectionTitle>Filters</SectionTitle>
                <StyledButton
                  startIcon={<AddIcon />}
                  onClick={addCondition}
                  disabled={isSubmitting}
                  size="small"
                >
                  Add Filters
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
                      onChange={(e) => handleConditionSelectChange(index, "operator", e)}
                      disabled={isSubmitting || !condition.field}
                    >
                      {getOperatorsForField(condition.field).map((operator) => (
                        <MenuItem key={operator._id} value={operator.operatorKey}>
                          {operator.operatorName}
                        </MenuItem>
                      ))}
                    </StyledSelect>
                  </FormControl>
                  {fieldTypes[index] === 'date' ? (
                    <StyledTextField
                      label="Value"
                      type="date"
                      value={condition.value}
                      onChange={(e) => handleConditionValueInputChange(index, e)}
                      disabled={isSubmitting || !condition.operator || !getOperatorsForField(condition.field).find(op => op.operatorKey === condition.operator)?.valueRequired}
                      size="small"
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  ) : (
                    <StyledTextField
                      label="Value"
                      value={condition.value}
                      onChange={(e) => handleConditionValueInputChange(index, e)}
                      disabled={isSubmitting || !condition.operator || !getOperatorsForField(condition.field).find(op => op.operatorKey === condition.operator)?.valueRequired}
                      size="small"
                      fullWidth
                    />
                  )}
                  <IconButton
                    onClick={() => removeCondition(index)}
                    disabled={isSubmitting}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </FormRow>
              ))}
            </ConditionsSection>
          </>
        )}
      </ConfigurationContent>

      <ConfigurationFooter>
        <StyledButton onClick={onClose} disabled={isSubmitting}>
          Cancel
        </StyledButton>
        <StyledButton
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={
            isSubmitting || !formData.widgetTypeId || !formData.dataSourceId
          }
        >
          {isSubmitting
            ? initialData
              ? "Updating..."
              : "Creating..."
            : initialData
            ? "Update"
            : "Create"}
        </StyledButton>
      </ConfigurationFooter>
    </ConfigurationPanel>
  );
};
