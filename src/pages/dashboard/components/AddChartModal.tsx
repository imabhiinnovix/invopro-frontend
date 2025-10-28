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
  CardContent,
  Card,
  FormHelperText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import { useAppDispatch, useAppSelector } from "../../../storeHooks";
import {
  fetchWidgetTypes,
  fetchAllDataSources,
  saveWidgets,
  fetchChartData,
} from "../dashboardActions";
import {
  ChartResponse,
  DataSource,
  DataSourceAttribute,
  WidgetDataResponse,
  ErrorResponse,
  Operator,
  OperatorType,
  OperatorListResponse,
  Dashboard,
  FieldConfig,
  Condition,
} from "../../../types/dashboard";
import { toast } from "react-toastify";
import axiosInstance from "../../../services/axiosInstance";
import { GET } from "../../../services/apiRoutes";
import { v4 as uuidv4 } from "uuid";
import { DateTime } from "luxon";
import { STYLE_GUIDE } from "../../../styles";
import axios from "axios";
import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";
import { arrayToString, toArray } from "../../../utils/utils";

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
  dimensions: string | string[];
  groupBy: string | string[];
  aggregation: Aggregation;
  position: Position;
  conditions: Condition[];
  dataSourceId: string;
  widgetTypeId: string;
  dashboardId: string;
  isIncremental: boolean;
}

interface AddChartModalProps {
  open: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  dashboardId: string;
  initialData?: ChartResponse;
  onSave?: (formData: ChartFormData) => Promise<void>;
  isTrend?: boolean;
  currentDashboard?: Dashboard;
  startVersionValue?: string;
  endVersionValue?: string;
  versionValue?: string;
  isNaturalLangauage?: boolean;
  setOpenSaveChart?: (open: boolean) => void;
  setChartSaveSettingData?: (chart: ChartResponse) => void;
  setNewSaveChartName?: (name: string) => void;
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
  fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
  fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
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

const StyledSelect = styled(Select)({
  borderRadius: STYLE_GUIDE.SPACING.s2,
});

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: STYLE_GUIDE.SPACING.s2,
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
  borderRadius: STYLE_GUIDE.SPACING.s2,
  padding: STYLE_GUIDE.SPACING.s4,
  backgroundColor: theme.palette.background.default,
}));

const ConfigurationPanel = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  backgroundColor: theme.palette.background.paper,
}));

const ConfigurationHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: theme.palette.background.paper,
  zIndex: 1,
}));

const ConfigurationContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  overflowY: "auto",
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
}));

const ConfigurationFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  zIndex: 1,
  display: "flex",
  justifyContent: "flex-end",
  gap: theme.spacing(2),
}));

type IfElseWrapperProps = {
  condition: boolean;
  ifWrapper: (children: React.ReactNode) => JSX.Element;
  elseWrapper: (children: React.ReactNode) => JSX.Element;
  children: React.ReactNode;
};

const IfElseWrapper: React.FC<IfElseWrapperProps> = ({
  condition,
  ifWrapper,
  elseWrapper,
  children,
}) => (condition ? ifWrapper(children) : elseWrapper(children));

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  minHeight: 500,
  display: "flex",
  flexDirection: "column",
  borderRadius: STYLE_GUIDE.SPACING.s2,
  boxShadow: theme.palette.card?.shadow || theme.shadows[1],
  transition: "all 0.3s ease-in-out",
  backgroundColor:
    theme.palette.card?.background || STYLE_GUIDE.COLORS.backgroundSurface,
  border: `1px solid ${theme.palette.card?.border || theme.palette.divider}`,
  "&:hover": {
    boxShadow: theme.shadows[3],
    transform: "translateY(-2px)",
  },
}));

export const AddChartModal: React.FC<AddChartModalProps> = ({
  open,
  onClose,
  isSubmitting,
  dashboardId,
  initialData,
  onSave,
  isTrend,
  currentDashboard,
  startVersionValue,
  endVersionValue,
  versionValue,
  isNaturalLangauage,
  setOpenSaveChart,
  setChartSaveSettingData,
  setNewSaveChartName,
}) => {
  const theme = useUnifiedTheme();

  const dispatch = useAppDispatch();
  const { widgetTypes, dataSources, widgetTypesLoading, dataSourcesLoading } =
    useAppSelector((state) => state.dashboard);


  const [formData, setFormData] = useState<ChartFormData>({
  name: initialData?.name || `Chart - ${new Date().toLocaleString()}`,
  dimensions: arrayToString(initialData?.dimensions),
  groupBy: arrayToString(initialData?.groupBy),
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
  isIncremental: initialData?.isIncremental || false,
});

  const [selectedDataSource, setSelectedDataSource] =
    useState<DataSource | null>(null);
  const [operators, setOperators] = useState<OperatorType[]>([]);
  const [fieldTypes, setFieldTypes] = useState<{ [key: string]: string }>({});
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  

  useEffect(() => {
  if (open && initialData) {
    if (!formData.name && !formData.dimensions && !formData.groupBy) {
      setFormData({
        name: initialData.name,
        dimensions: arrayToString(initialData.dimensions),
        groupBy: arrayToString(initialData.groupBy),
        aggregation: initialData.aggregation,
        position: initialData?.position || { x: 0, y: 0, index: 0 },
        conditions: initialData.conditions,
        dataSourceId: initialData.dataSourceId?._id || "",
        widgetTypeId: initialData.widgetTypeId?._id || "",
        dashboardId,
        isIncremental: initialData.isIncremental || false,
      });

      if (initialData.dataSourceId?._id) {
        dispatch(fetchAllDataSources()).then(() => {
          const dataSource = dataSources.find(
            (ds) => ds._id === initialData.dataSourceId?._id
          );
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
      aggregation: { type: "count", attributeName: "" },
      position: { x: 0, y: 0, index: 0 },
      conditions: [],
      dataSourceId: "",
      widgetTypeId: "",
      dashboardId,
      isIncremental: false,
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
    value: string | boolean | number | Position | Aggregation | Condition[]
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
    // Find the field in fieldSettings using mappedAttributeName
    const fieldSetting = selectedDataSource?.fieldSettings?.find(
      (field) => field.mappedAttributeName === fieldName
    );

    if (fieldSetting) {
      setFieldTypes((prev) => ({
        ...prev,
        [index]: fieldSetting.type,
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

    if (fieldType === "date") {
      // Format date to YYYY-MM-DD
      const formattedDate = formatDateToYYYYMMDD(value);
      handleConditionChange(index, "value", formattedDate);
    } else {
      handleConditionChange(index, "value", value);
    }
  };

  const formatDateToYYYYMMDD = (dateString: string): string => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleDataSourceChange = (event: SelectChangeEvent<unknown>) => {
    const selectedDs = dataSources.find((ds) => ds._id === event.target.value);
    if (selectedDs) {
      console.log("selectedDs", selectedDs);
      setSelectedDataSource(selectedDs);
      setFormData((prev) => ({
        ...prev,
        dataSourceId: event.target.value as string,
        dimensions: [],
        groupBy: [],
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

  
  // Updated to use fieldSettings
  const handleFieldErrors = (errors?: ErrorResponse[]) => {
  if (errors && errors.length > 0) {
    const newFieldErrors: { [key: string]: string } = {};
    errors.forEach((err: ErrorResponse) => {
      if (err.fieldName && err.message) {
        newFieldErrors[err.fieldName] = err.message;
      }
    });
    setFieldErrors(newFieldErrors);
  }
};

const handleAxiosError = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.data) {
    handleFieldErrors(error.response.data.errors);
    const errorMessage =
      error.response.data.message ||
      error.response.data.error ||
      "Failed to add chart";
    toast.error(errorMessage);
  } else if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    toast.error((error as { message: string }).message);
  } else {
    toast.error("Failed to add chart");
  }
};
 

 
// 🔹 Normalizer (make sure it's declared above handleSubmit)
// const toArray = (value?: string | string[]): string[] => {
//   if (Array.isArray(value)) return value;
//   if (typeof value === "string" && value.trim() !== "") {
//     return value.split(",").map((g) => g.trim()).filter(Boolean);
//   }
//   return [];
// };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setFieldErrors({});

  try {
    const dashboardType =
      currentDashboard?.settings?.dashboardType || "normal";

    const formattedVersionValue = versionValue
      ? DateTime.fromISO(versionValue).toFormat("yyyy-LL")
      : "";

    const dimensionsArray = isTrend
      ? versionValue
        ? ["versionValue"]
        : []
      : toArray(formData.dimensions);

    const groupByArray = toArray(formData.groupBy);

    if (onSave) {
      await onSave({
        ...formData,
        dimensions: dimensionsArray,
        groupBy: groupByArray,
      });
    } else {
      // Call widget API
      const widgetResponse = await axiosInstance.post<WidgetDataResponse>(
        GET.DASHBOARD_WIDGET_DATA,
        {
          dataSourceId: formData.dataSourceId,
          entityId: selectedDataSource?.entityId._id,
          dimensions: dimensionsArray,
          groupBy: groupByArray,
          conditions: formData.conditions.map((condition) => ({
            ...condition,
            _id: condition._id || uuidv4(),
          })),
          aggregation: formData.aggregation,
          widgetType:
            widgetTypes.find((wt) => wt._id === formData.widgetTypeId)
              ?.chartType || "",
          dashboardFilters:
            dashboardType === "trend"
              ? {
                  startVersionValue: startVersionValue || "",
                  endVersionValue: endVersionValue || "",
                  versionValue: "",
                  dynamicVersionValue: "",
                }
              : {
                  startVersionValue: "",
                  endVersionValue: "",
                  versionValue: formattedVersionValue,
                  dynamicVersionValue: formattedVersionValue ? "" : "1m",
                },
          dashBoardType: dashboardType,
          isIncremental: formData.isIncremental || false,
        }
      );

      if (widgetResponse.data.success) {
        // Save widget
        const saveResponse = await dispatch(
          saveWidgets({
            widgets: [
              {
                dashboardId: dashboardId,
                widgetTypeId: formData.widgetTypeId,
                name: formData.name,
                dimensions: dimensionsArray,
                groupBy: groupByArray,
                aggregation: formData.aggregation,
                position: formData.position,
                conditions: formData.conditions.map((condition) => ({
                  field: condition.field,
                  operator: condition.operator,
                  value: condition.value,
                })),
                dataSourceId: formData.dataSourceId,
                entityId: selectedDataSource?.entityId._id || "",
                isIncremental: formData.isIncremental || false,
              },
            ],
          })
        ).unwrap();

        if (saveResponse.success) {
          await dispatch(
            fetchChartData({
              dashboardId,
              dashboardType,
              startVersionValue:
                dashboardType === "trend" ? startVersionValue : "",
              endVersionValue:
                dashboardType === "trend" ? endVersionValue : "",
              versionValue:
                dashboardType === "trend" ? "" : formattedVersionValue,
              dynamicVersionValue:
                dashboardType === "trend"
                  ? ""
                  : formattedVersionValue
                  ? ""
                  : "1m",
            })
          );
          toast.success("Chart saved successfully!");
          onClose();
        } else {
          handleFieldErrors(saveResponse.errors);
          toast.error(saveResponse.message || "Failed to save chart");
        }
      } else {
        handleFieldErrors(widgetResponse.data.errors);
        toast.error(widgetResponse.data.message || "Failed to add chart");
      }
    }
  } catch (error) {
    handleAxiosError(error);
  }
};

  const getAttributeOptions = (): DataSourceAttribute[] => {
    return (
      selectedDataSource?.fieldSettings?.map((field) => ({
        name: field.mappedAttributeName, 
        type: field.type || "string",
        label: field.label,
      })) || []
    );
  };

  const handleClearDimension = () => {
    handleChange("dimensions", "");
  };

  const handleClearGroupBy = () => {
    handleChange("groupBy", "");
  };

  const fetchOperators = async () => {
    try {
      const response = await axiosInstance.post<OperatorListResponse>(
        GET.OPERATOR_LIST,
        {
          fieldType: "all",
        }
      );
      if (response.data.success) {
        setOperators(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch operators:", error);
    }
  };

  // Updated to use fieldSettings
  const getOperatorsForField = (fieldName: string): Operator[] => {
    const fieldSetting = selectedDataSource?.fieldSettings?.find(
      (field) => field.mappedAttributeName === fieldName
    );
    if (!fieldSetting) return [];

    const fieldType = fieldSetting.type;
    const operatorType = operators.find((op) => op.fieldType === fieldType);
    return operatorType?.operators || [];
  };

  const getSelectedWidgetType = () => {
    return widgetTypes.find((type) => type._id === formData.widgetTypeId);
  };

  const getVisibleFields = (): FieldConfig[] => {
    const selectedType = getSelectedWidgetType();
    if (!selectedType?.fieldConfig) return [];

    return selectedType.fieldConfig.filter((field) => field.display === true);
  };

  const renderDynamicField = (fieldConfig: FieldConfig) => {
    const { fieldName, label, type, required, multiple } = fieldConfig;

    switch (fieldName) {
      case "dimensions":
        const visibleFields = getVisibleFields();
        const groupByField = visibleFields.find(
          (f) => f.fieldName === "groupBy"
        );

        if (groupByField) {
          return (
            <FormSection key="dimensions-groupby">
              <FormRow>
                <FormControl fullWidth size="small">
                  <InputLabel>{label}</InputLabel>
                  <StyledSelect
                    value={formData.dimensions}
                    label={label}
                    onChange={handleDimensionChange}
                    disabled={isSubmitting || isTrend}
                    error={!!fieldErrors["Dimension"]}
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
                      <MenuItem value="versionValue">Period</MenuItem>
                    ) : (
                      getAttributeOptions().map((attr) => (
                        <MenuItem
                          key={attr.name}
                          value={attr.name}
                          disabled={attr.name === formData.groupBy}
                        >
                          {attr.label} {/* Show label to user */}
                        </MenuItem>
                      ))
                    )}
                  </StyledSelect>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>{groupByField.label}</InputLabel>
                  <StyledSelect
                    value={formData.groupBy}
                    label={groupByField.label}
                    onChange={handleGroupByChange}
                    disabled={isSubmitting}
                    error={!!fieldErrors["GroupBy"]}
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
                        {attr.label} {/* Show label to user */}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
              </FormRow>
              {fieldErrors["GroupBy"] && (
                <FormHelperText error>{fieldErrors["GroupBy"]}</FormHelperText>
              )}
            </FormSection>
          );
        } else {
          return (
            <FormSection key={fieldName}>
              <FormRow>
                <FormControl fullWidth size="small">
                  <InputLabel>{label}</InputLabel>
                  <StyledSelect
                    value={formData.dimensions}
                    label={label}
                    onChange={handleDimensionChange}
                    disabled={isSubmitting || isTrend}
                    error={!!fieldErrors["Dimension"]}
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
                      <MenuItem value="versionValue">Period</MenuItem>
                    ) : (
                      getAttributeOptions().map((attr) => {
                        console.log("Field option:", attr); // Debug log
                        return (
                          <MenuItem
                            key={attr.name}
                            value={attr.name}
                            disabled={attr.name === formData.groupBy}
                          >
                            {attr.label} {/* Show label to user */}
                          </MenuItem>
                        );
                      })
                    )}
                  </StyledSelect>
                </FormControl>
              </FormRow>
              {fieldErrors["Dimension"] && (
                <FormHelperText error>
                  {fieldErrors["Dimension"]}
                </FormHelperText>
              )}
            </FormSection>
          );
        }

      case "groupBy":
        const visibleFieldsList = getVisibleFields();
        const dimensionsField = visibleFieldsList.find(
          (f) => f.fieldName === "dimensions"
        );
        if (dimensionsField) {
          return null;
        }

        return (
          <FormSection key={fieldName}>
            <FormRow>
              <FormControl fullWidth size="small">
                <InputLabel>{label}</InputLabel>
                <StyledSelect
                  value={formData.groupBy}
                  label={label}
                  onChange={handleGroupByChange}
                  disabled={isSubmitting}
                  error={!!fieldErrors["GroupBy"]}
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
                      {attr.label} {/* Show label to user */}
                    </MenuItem>
                  ))}
                </StyledSelect>
              </FormControl>
            </FormRow>
            {fieldErrors["GroupBy"] && (
              <FormHelperText error>{fieldErrors["GroupBy"]}</FormHelperText>
            )}
          </FormSection>
        );

      case "aggregation":
        return (
          <FormSection key={fieldName}>
            <SectionTitle>{label}</SectionTitle>
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
                      {attr.label} {/* Show label to user */}
                    </MenuItem>
                  ))}
                </StyledSelect>
              </FormControl>
            </FormRow>
          </FormSection>
        );

      case "conditions":
        return (
          <ConditionsSection key={fieldName}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <SectionTitle>{label}</SectionTitle>
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
                        {attr.label} {/* Show label to user */}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Operator</InputLabel>
                  <StyledSelect
                    value={condition.operator}
                    label="Operator"
                    onChange={(e) =>
                      handleConditionSelectChange(index, "operator", e)
                    }
                    disabled={isSubmitting || !condition.field}
                  >
                    {getOperatorsForField(condition.field).map((operator) => (
                      <MenuItem key={operator._id} value={operator.operatorKey}>
                        {operator.operatorName}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
                {fieldTypes[index] === "date" ? (
                  <TextField
                    label="Value"
                    type="date"
                    value={condition.value}
                    onChange={(e) => handleConditionValueInputChange(index, e)}
                    disabled={
                      isSubmitting ||
                      !condition.operator ||
                      !getOperatorsForField(condition.field).find(
                        (op) => op.operatorKey === condition.operator
                      )?.valueRequired
                    }
                    size="small"
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: STYLE_GUIDE.SPACING.s2,
                        alignItems: "flex-start",
                        mb: 2,
                        paddingRight: STYLE_GUIDE.SPACING.s2,
                        fontSize: "14px",
                        backgroundColor:
                          theme.dashboardTheme?.colors?.background?.paper ||
                          "#ffffff",
                        "& fieldset": {
                          borderColor:
                            theme.getInputBorderColor() ||
                            STYLE_GUIDE.COLORS.darkBackground,
                        },
                        "&:hover fieldset": {
                          borderColor:
                            theme.border?.hover ||
                            STYLE_GUIDE.COLORS.darkBorderHover,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor:
                            theme.input?.focusBorder ||
                            STYLE_GUIDE.COLORS.inputFocusFallback,
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color:
                          theme.palette.text.secondary ||
                          STYLE_GUIDE.COLORS.darkBorderFocus,
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color:
                          theme.input?.focusBorder ||
                          STYLE_GUIDE.COLORS.inputFocusFallback,
                      },
                      "& .MuiInputBase-input": {
                        color: `${theme.getInputTextColor() || theme.palette.text.primary} !important`,
                      },
                      "& .MuiInputBase-input::placeholder": {
                        color: `${theme.palette.text.secondary || "#666"} !important`,
                      },
                      "& .MuiInputBase-input:-webkit-autofill": {
                        WebkitTextFillColor: `${theme.getInputTextColor() || theme.palette.text.primary} !important`,
                        WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || "#ffffff"} inset !important`,
                      },
                    }}
                  />
                ) : (
                  <TextField
                    label="Value"
                    value={condition.value}
                    onChange={(e) => handleConditionValueInputChange(index, e)}
                    disabled={
                      isSubmitting ||
                      !condition.operator ||
                      !getOperatorsForField(condition.field).find(
                        (op) => op.operatorKey === condition.operator
                      )?.valueRequired
                    }
                    size="small"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: STYLE_GUIDE.SPACING.s2,
                        alignItems: "flex-start",
                        mb: 2,
                        paddingRight: STYLE_GUIDE.SPACING.s2,
                        fontSize: "14px",
                        backgroundColor:
                          theme.dashboardTheme?.colors?.background?.paper ||
                          "#ffffff",
                        "& fieldset": {
                          borderColor:
                            theme.getInputBorderColor() ||
                            STYLE_GUIDE.COLORS.darkBackground,
                        },
                        "&:hover fieldset": {
                          borderColor:
                            theme.border?.hover ||
                            STYLE_GUIDE.COLORS.darkBorderHover,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor:
                            theme.input?.focusBorder ||
                            STYLE_GUIDE.COLORS.inputFocusFallback,
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color:
                          theme.palette.text.secondary ||
                          STYLE_GUIDE.COLORS.darkBorderFocus,
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color:
                          theme.input?.focusBorder ||
                          STYLE_GUIDE.COLORS.inputFocusFallback,
                      },
                      "& .MuiInputBase-input": {
                        color: `${theme.getInputTextColor() || theme.palette.text.primary} !important`,
                      },
                      "& .MuiInputBase-input::placeholder": {
                        color: `${theme.palette.text.secondary || "#666"} !important`,
                      },
                      "& .MuiInputBase-input:-webkit-autofill": {
                        WebkitTextFillColor: `${theme.getInputTextColor() || theme.palette.text.primary} !important`,
                        WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || "#ffffff"} inset !important`,
                      },
                    }}
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
        );

      default:
        return null;
    }
  };

  if (!open) return null;

  return (
    <IfElseWrapper
      condition={!!isNaturalLangauage}
      ifWrapper={(children) => (
        <StyledCard>
          <CardContent
            sx={{
              flexGrow: 1,
              p: STYLE_GUIDE.SPACING.s6,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            {children}
          </CardContent>
        </StyledCard>
      )}
      elseWrapper={(children) => (
        <ConfigurationPanel>{children}</ConfigurationPanel>
      )}
    >
      {!isNaturalLangauage && (
        <ConfigurationHeader>
          <Typography
            variant="h6"
            fontWeight={STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold}
          >
            {initialData ? "Edit Chart" : "Add New Chart"}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <ClearIcon />
          </IconButton>
        </ConfigurationHeader>
      )}

      <ConfigurationContent>
        <FirstFormSection>
          <TextField
            fullWidth
            label="Chart Name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            disabled={isSubmitting}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: STYLE_GUIDE.SPACING.s2,
                alignItems: "flex-start",
                mb: 2,
                paddingRight: STYLE_GUIDE.SPACING.s2,
                fontSize: "14px",
                backgroundColor:
                  theme.dashboardTheme?.colors?.background?.paper || "#ffffff",
                "& fieldset": {
                  borderColor:
                    theme.getInputBorderColor() ||
                    STYLE_GUIDE.COLORS.darkBackground,
                },
                "&:hover fieldset": {
                  borderColor:
                    theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
                },
                "&.Mui-focused fieldset": {
                  borderColor:
                    theme.input?.focusBorder ||
                    theme.input?.focusBorderFallback ||
                    STYLE_GUIDE.COLORS.inputFocusFallback,
                },
              },
              "& .MuiInputLabel-root": {
                color:
                  theme.palette.text.secondary ||
                  STYLE_GUIDE.COLORS.darkBorderFocus,
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color:
                  theme.input?.focusBorder ||
                  theme.input?.focusBorderFallback ||
                  STYLE_GUIDE.COLORS.inputFocusFallback,
              },
              "& .MuiInputBase-input": {
                color: `${theme.getInputTextColor() || theme.palette.text.primary} !important`,
              },
              "& .MuiInputBase-input::placeholder": {
                color: `${theme.palette.text.secondary || "#666"} !important`,
              },
              "& .MuiInputBase-input:-webkit-autofill": {
                WebkitTextFillColor: `${theme.getInputTextColor() || theme.palette.text.primary} !important`,
                WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || "#ffffff"} inset !important`,
              },
            }}
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
            {getVisibleFields().length > 0 ? (
              getVisibleFields().map((fieldConfig) =>
                renderDynamicField(fieldConfig)
              )
            ) : (
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
                        error={!!fieldErrors["Dimension"]}
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
                          <MenuItem value="versionValue">Period</MenuItem>
                        ) : (
                          getAttributeOptions().map((attr) => (
                            <MenuItem
                              key={attr.name}
                              value={attr.name}
                              disabled={attr.name === formData.groupBy}
                            >
                              {attr.label} {/* Show label to user */}
                            </MenuItem>
                          ))
                        )}
                      </StyledSelect>
                      {fieldErrors["Dimension"] && (
                        <FormHelperText error>
                          {fieldErrors["Dimension"]}
                        </FormHelperText>
                      )}
                    </FormControl>

                    <FormControl fullWidth size="small">
                      <InputLabel>Group By</InputLabel>
                      <StyledSelect
                        value={formData.groupBy}
                        label="Group By"
                        onChange={handleGroupByChange}
                        disabled={isSubmitting}
                        error={!!fieldErrors["GroupBy"]}
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
                            {attr.label} {/* Show label to user */}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                      {fieldErrors["GroupBy"] && (
                        <FormHelperText error>
                          {fieldErrors["GroupBy"]}
                        </FormHelperText>
                      )}
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
                            {attr.label} {/* Show label to user */}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </FormControl>
                  </FormRow>
                </FormSection>

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
                              {attr.label} {/* Show label to user */}
                            </MenuItem>
                          ))}
                        </StyledSelect>
                      </FormControl>
                      <FormControl fullWidth size="small">
                        <InputLabel>Operator</InputLabel>
                        <StyledSelect
                          value={condition.operator}
                          label="Operator"
                          onChange={(e) =>
                            handleConditionSelectChange(index, "operator", e)
                          }
                          disabled={isSubmitting || !condition.field}
                        >
                          {getOperatorsForField(condition.field).map(
                            (operator) => (
                              <MenuItem
                                key={operator._id}
                                value={operator.operatorKey}
                              >
                                {operator.operatorName}
                              </MenuItem>
                            )
                          )}
                        </StyledSelect>
                      </FormControl>
                      {fieldTypes[index] === "date" ? (
                        <TextField
                          label="Value"
                          type="date"
                          value={condition.value}
                          onChange={(e) =>
                            handleConditionValueInputChange(index, e)
                          }
                          disabled={
                            isSubmitting ||
                            !condition.operator ||
                            !getOperatorsForField(condition.field).find(
                              (op) => op.operatorKey === condition.operator
                            )?.valueRequired
                          }
                          size="small"
                          fullWidth
                          InputLabelProps={{
                            shrink: true,
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: STYLE_GUIDE.SPACING.s2,
                              alignItems: "flex-start",
                              mb: 2,
                              paddingRight: STYLE_GUIDE.SPACING.s2,
                              fontSize: "14px",
                              backgroundColor:
                                theme.dashboardTheme?.colors?.background
                                  ?.paper || "#ffffff",
                              "& fieldset": {
                                borderColor:
                                  theme.getInputBorderColor() ||
                                  STYLE_GUIDE.COLORS.darkBackground,
                              },
                              "&:hover fieldset": {
                                borderColor:
                                  theme.border?.hover ||
                                  STYLE_GUIDE.COLORS.darkBorderHover,
                              },
                              "&.Mui-focused fieldset": {
                                borderColor:
                                  theme.input?.focusBorder ||
                                  theme.input?.focusBorderFallback ||
                                  STYLE_GUIDE.COLORS.inputFocusFallback,
                              },
                            },
                            "& .MuiInputLabel-root": {
                              color:
                                theme.palette.text.secondary ||
                                STYLE_GUIDE.COLORS.darkBorderFocus,
                            },
                            "& .MuiInputLabel-root.Mui-focused": {
                              color:
                                theme.input?.focusBorder ||
                                theme.input?.focusBorderFallback ||
                                STYLE_GUIDE.COLORS.inputFocusFallback,
                            },
                            "& .MuiInputBase-input": {
                              color: `${theme.getInputTextColor() || theme.palette.text.primary} !important`,
                            },
                            "& .MuiInputBase-input::placeholder": {
                              color: `${theme.palette.text.secondary || "#666"} !important`,
                            },
                            "& .MuiInputBase-input:-webkit-autofill": {
                              WebkitTextFillColor: `${theme.getInputTextColor() || theme.palette.text.primary} !important`,
                              WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || "#ffffff"} inset !important`,
                            },
                          }}
                        />
                      ) : (
                        <TextField
                          label="Value"
                          value={condition.value}
                          onChange={(e) =>
                            handleConditionValueInputChange(index, e)
                          }
                          disabled={
                            isSubmitting ||
                            !condition.operator ||
                            !getOperatorsForField(condition.field).find(
                              (op) => op.operatorKey === condition.operator
                            )?.valueRequired
                          }
                          size="small"
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: STYLE_GUIDE.SPACING.s2,
                              alignItems: "flex-start",
                              mb: 2,
                              paddingRight: STYLE_GUIDE.SPACING.s2,
                              fontSize: "14px",
                              backgroundColor:
                                theme.dashboardTheme?.colors?.background
                                  ?.paper || "#ffffff",
                              "& fieldset": {
                                borderColor:
                                  theme.getInputBorderColor() ||
                                  STYLE_GUIDE.COLORS.darkBackground,
                              },
                              "&:hover fieldset": {
                                borderColor:
                                  theme.border?.hover ||
                                  STYLE_GUIDE.COLORS.darkBorderHover,
                              },
                              "&.Mui-focused fieldset": {
                                borderColor:
                                  theme.input?.focusBorder ||
                                  theme.input?.focusBorderFallback ||
                                  STYLE_GUIDE.COLORS.inputFocusFallback,
                              },
                            },
                            "& .MuiInputLabel-root": {
                              color:
                                theme.palette.text.secondary ||
                                STYLE_GUIDE.COLORS.darkBorderFocus,
                            },
                            "& .MuiInputLabel-root.Mui-focused": {
                              color:
                                theme.input?.focusBorder ||
                                theme.input?.focusBorderFallback ||
                                STYLE_GUIDE.COLORS.inputFocusFallback,
                            },
                            "& .MuiInputBase-input": {
                              color: `${theme.getInputTextColor() || theme.palette.text.primary} !important`,
                            },
                            "& .MuiInputBase-input::placeholder": {
                              color: `${theme.palette.text.secondary || "#666"} !important`,
                            },
                            "& .MuiInputBase-input:-webkit-autofill": {
                              WebkitTextFillColor: `${theme.getInputTextColor() || theme.palette.text.primary} !important`,
                              WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || "#ffffff"} inset !important`,
                            },
                          }}
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

            {isTrend && (
              <FormSection>
                <SectionTitle>Incremental Settings</SectionTitle>
                <FormRow>
                  <FormControl fullWidth size="small">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        id="isIncremental"
                        checked={formData.isIncremental}
                        onChange={(e) =>
                          handleChange("isIncremental", e.target.checked)
                        }
                        style={{ marginRight: STYLE_GUIDE.SPACING.s2 }}
                      />
                      <label htmlFor="isIncremental">Incremental</label>
                    </Box>
                  </FormControl>
                </FormRow>
              </FormSection>
            )}
          </>
        )}
      </ConfigurationContent>
      {!isNaturalLangauage ? (
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
            sx={{
              fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
              fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
            }}
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
      ) : (
        <Box
          display="flex"
          gap={STYLE_GUIDE.SPACING.s4}
          pb={STYLE_GUIDE.SPACING.s4}
        >
          <Button
            variant="contained"
            fullWidth
            sx={{
              flex: 1,
              height: 56,
              fontSize: 16,
              backgroundColor: STYLE_GUIDE.COLORS.white,
              fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
              color: STYLE_GUIDE.COLORS.black,
              "&:hover": {
                backgroundColor: STYLE_GUIDE.COLORS.backgroundDefault,
              },
            }}
            onClick={handleSubmit}
          >
            Preview Changes
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              flex: 1,
              color: STYLE_GUIDE.COLORS.white,
              height: 56,
              fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
              fontSize: STYLE_GUIDE.SPACING.s4,
            }}
            onClick={() => {
              if (
                initialData &&
                setOpenSaveChart &&
                setChartSaveSettingData &&
                setNewSaveChartName
              ) {
                setOpenSaveChart(true);
                setChartSaveSettingData(initialData);
                setNewSaveChartName(initialData.name);
              }
            }}
          >
            Add to Dashboard
          </Button>
        </Box>
      )}
    </IfElseWrapper>
  );
};
