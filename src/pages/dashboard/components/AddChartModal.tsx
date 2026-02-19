import React, { useEffect, useState, useMemo } from "react";
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
  ListSubheader,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
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
import { StyledButton } from "../../../components/common";
import axios from "axios";
import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";
import { arrayToString, toArray } from "../../../utils/utils";
import useGet from "../../../hooks/useGet";

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
  plotType: string | string[];
  name: string;
  description: string;
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

type DataSourceWithVisibility = DataSource & {
  visibility?: "primary" | "secondary" | string;
};

interface GroupedDataSources {
  primary: DataSource[];
  secondary: DataSource[];
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

const LocalStyledButton = styled(Button)(({ theme }) => ({
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

  const groupedDataSources = useMemo<GroupedDataSources>(() => {
    const primary: DataSource[] = [];
    const secondary: DataSource[] = [];

    dataSources.forEach((source) => {
      const sourceWithVisibility =
        source as unknown as DataSourceWithVisibility;
      const visibility = sourceWithVisibility.visibility?.toLowerCase();

      if (visibility === "primary") {
        primary.push(source);
      } else if (visibility === "secondary") {
        secondary.push(source);
      }
    });

    return { primary, secondary };
  }, [dataSources]);

  const { data: plotTypes } = useGet<{
    success: boolean;
    data: string[];
  }>([`plotTypes`], GET.GET_DASHBOARD_WIDGET_PLOT_TYPES);

  const [formData, setFormData] = useState<ChartFormData>({
    name: initialData?.name || `Chart - ${new Date().toLocaleString()}`,
    description: initialData?.description || "",
    plotType: arrayToString(initialData?.plotType) || "",
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
  const [showMoreOptions, setShowMoreOptions] = useState<
    Record<string, boolean>
  >({
    dataSource: false,
    dimensions: false,
    groupBy1: false,
    groupBy2: false,
    groupBy3: false,
    aggregationAttribute1: false,
    aggregationAttribute2: false,
    filtersField1: false,
    filtersField2: false,
    xAxis1: false,
    xAxis2: false,
  });

  const toggleMoreOptions = (dropdownKey: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setShowMoreOptions((prev) => ({
      ...prev,
      [dropdownKey]: !prev[dropdownKey],
    }));
  };

  useEffect(() => {
    if (open && initialData) {
      setShowMoreOptions({
        dataSource: true,
        dimensions: true,
        groupBy1: true,
        groupBy2: true,
        groupBy3: true,
        aggregationAttribute1: true,
        aggregationAttribute2: true,
        filtersField1: true,
        filtersField2: true,
        xAxis1: true,
        xAxis2: true,
      })
      if (!formData.name && !formData.dimensions && !formData.groupBy) {
        setFormData({
          name: initialData.name,
          description: initialData?.description || "",
          dimensions: arrayToString(initialData.dimensions),
          groupBy: arrayToString(initialData.groupBy),
          plotType: arrayToString(initialData.plotType),
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
        description: "",
        dimensions: "",
        groupBy: "",
        plotType: "",
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

  const countCharacters = (text: string): number => {
    if (!text) return 0;

    const trimmed = text.trim();
    return trimmed.length;
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

    if (fieldType === "date" || fieldType === "date-range") {
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

  const handleDataSourceChange = (event: SelectChangeEvent<string>) => {
    const selectedId = event.target.value;

    const selectedDs = dataSources.find((ds) => ds._id === selectedId);

    if (!selectedDs) return;

    setSelectedDataSource(selectedDs);

    setFormData((prev) => ({
      ...prev,
      dataSourceId: selectedId,
      dimensions: [],
      groupBy: [],
      aggregation: {
        ...prev.aggregation,
        attributeName: "",
      },
      conditions: [],
    }));
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

  const handlePlotTypeChange = (event: SelectChangeEvent<unknown>) => {
    const newPlotType = event.target.value as string;
    handleChange("plotType", newPlotType);
  };

  const handleClearPlotType = () => {
    handleChange("plotType", "");
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

    const descriptionCount = countCharacters(formData.description);
    if (descriptionCount > 1000) {
      setFieldErrors({
        description: `Description exceeds the maximum character limit of 1000 characters. Current: ${descriptionCount} characters.`,
      });
      toast.error(
        `Description exceeds the maximum character limit of 1000 characters. Please reduce it to 1000 characters or less.`
      );
      return;
    }

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
      const plotType = toArray(formData.plotType);
      if (onSave) {
        await onSave({
          ...formData,
          dimensions: dimensionsArray,
          groupBy: groupByArray,
          plotType: plotType,
        });
        // onClose();
      } else {
        // Call widget API
        const widgetResponse = await axiosInstance.post<WidgetDataResponse>(
          GET.DASHBOARD_WIDGET_DATA,
          {
            dataSourceId: formData.dataSourceId,
            entityId: selectedDataSource?.entityId._id,
            dimensions: dimensionsArray,
            groupBy: groupByArray,
            plotType: plotType,
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
                  description: formData.description,
                  dimensions: dimensionsArray,
                  groupBy: groupByArray,
                  plotType: plotType,
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

  const groupedAttributeOptions = useMemo(() => {
    const primary: DataSourceAttribute[] = [];
    const secondary: DataSourceAttribute[] = [];

    selectedDataSource?.fieldSettings?.forEach((field) => {
      const attr: DataSourceAttribute = {
        name: field.mappedAttributeName,
        type: field.type || "string",
        label: field.label,
      };

      const visibility = field.visibility?.toLowerCase();

      if (visibility === "primary") {
        primary.push(attr);
      } else if (visibility === "secondary") {
        secondary.push(attr);
      }
    });

    return { primary, secondary };
  }, [selectedDataSource?.fieldSettings]);

  const isGroupByOrDimensionOfDateType = () => {
    const groupBy = formData.groupBy;
    const dimensions = formData.dimensions;

    const groupByDateType = ["date", "date-range"].includes(
      selectedDataSource?.fieldSettings?.find(
        (f) => f.mappedAttributeName === groupBy
      )?.type
    );

    const dimensionsDateType = ["date", "date-range"].includes(
      selectedDataSource?.fieldSettings?.find(
        (f) => f.mappedAttributeName === dimensions
      )?.type
    );

    // console.log("groupByDateType", groupByDateType);
    // console.log("dimensionsDateType", dimensionsDateType);
    return groupByDateType || dimensionsDateType;
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

    const operatorList =
      operatorType?.fieldType === "date" ||
      operatorType?.fieldType === "date-range"
        ? operatorType?.operators.filter((opr) =>
            ["before", "after", "on", "noton", "blank", "notblank"].includes(
              opr.operatorKey
            )
          ) || []
        : operatorType?.operators || [];
    return operatorList || [];
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
                  <InputLabel>X-Axis</InputLabel>
                  <StyledSelect
                    value={formData.dimensions}
                    label="X-Axis"
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
                    {isTrend && (
                      <MenuItem value="versionValue">Period</MenuItem>
                    )}

                    {!isTrend &&
                      groupedAttributeOptions.primary.map((attr) => (
                        <MenuItem
                          key={`primary-${attr.name}`}
                          value={attr.name}
                          disabled={attr.name === formData.groupBy}
                        >
                          {attr.label}
                        </MenuItem>
                      ))}
                    {!isTrend &&
                      groupedAttributeOptions.secondary.length > 0 && (
                        <Box
                          component="li"
                          role="option"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            toggleMoreOptions("xAxis1", e);
                          }}
                          sx={{
                            padding: "6px 16px",
                            minHeight: "auto",
                            fontWeight: 600,
                            color: "primary.main",
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "action.hover",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>More...</span>
                            {showMoreOptions.xAxis1 ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </Box>
                        </Box>
                      )}
                    {!isTrend &&
                      showMoreOptions.xAxis1 &&
                      groupedAttributeOptions.secondary.map((attr) => (
                        <MenuItem
                          key={`secondary-${attr.name}`}
                          value={attr.name}
                          disabled={attr.name === formData.groupBy}
                          sx={{ pl: 4 }}
                        >
                          {attr.label}
                        </MenuItem>
                      ))}
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
                    {groupedAttributeOptions.primary.map((attr) => (
                      <MenuItem
                        key={`primary-${attr.name}`}
                        value={attr.name}
                        disabled={attr.name === formData.dimensions}
                      >
                        {attr.label}
                      </MenuItem>
                    ))}
                    {groupedAttributeOptions.secondary.length > 0 && (
                      <Box
                        component="li"
                        role="option"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          toggleMoreOptions("groupBy2", e);
                        }}
                        sx={{
                          padding: "6px 16px",
                          minHeight: "auto",
                          fontWeight: 600,
                          color: "primary.main",
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "action.hover",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>More...</span>
                          {showMoreOptions.groupBy2 ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </Box>
                      </Box>
                    )}
                    {showMoreOptions.groupBy2 &&
                      groupedAttributeOptions.secondary.map((attr) => (
                        <MenuItem
                          key={`secondary-${attr.name}`}
                          value={attr.name}
                          disabled={attr.name === formData.dimensions}
                          sx={{ pl: 4 }}
                        >
                          {attr.label}
                        </MenuItem>
                      ))}
                  </StyledSelect>
                </FormControl>
              </FormRow>
              {isGroupByOrDimensionOfDateType() && (
                <FormRow>
                  <FormControl fullWidth size="small">
                    <InputLabel>Plot Type</InputLabel>
                    <StyledSelect
                      value={formData.plotType || null}
                      label={"Plot Type"}
                      onChange={handlePlotTypeChange}
                      disabled={isSubmitting}
                      error={!!fieldErrors["Plot Type"]}
                      endAdornment={
                        formData.plotType && (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={handleClearPlotType}
                              edge="end"
                              sx={{ mr: 1 }}
                            >
                              <ClearIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    >
                      {plotTypes?.data?.map((plotType) => (
                        <MenuItem
                          key={plotType.type}
                          value={plotType.type}
                          // disabled={plotType.type === formData.dimensions}
                        >
                          {plotType.label}
                        </MenuItem>
                      ))}
                    </StyledSelect>
                  </FormControl>
                </FormRow>
              )}
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
                  <InputLabel>X-Axis</InputLabel>
                  <StyledSelect
                    value={formData.dimensions}
                    label={"X-Axis"}
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
                    {isTrend && (
                      <MenuItem value="versionValue">Period</MenuItem>
                    )}
                    {!isTrend &&
                      groupedAttributeOptions.primary.map((attr) => (
                        <MenuItem
                          key={`primary-${attr.name}`}
                          value={attr.name}
                          disabled={attr.name === formData.groupBy}
                        >
                          {attr.label}
                        </MenuItem>
                      ))}
                    {!isTrend &&
                      groupedAttributeOptions.secondary.length > 0 && (
                        <Box
                          component="li"
                          role="option"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            toggleMoreOptions("xAxis2", e);
                          }}
                          sx={{
                            padding: "6px 16px",
                            minHeight: "auto",
                            fontWeight: 600,
                            color: "primary.main",
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "action.hover",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>More...</span>
                            {showMoreOptions.xAxis2 ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </Box>
                        </Box>
                      )}
                    {!isTrend &&
                      showMoreOptions.xAxis2 &&
                      groupedAttributeOptions.secondary.map((attr) => (
                        <MenuItem
                          key={`secondary-${attr.name}`}
                          value={attr.name}
                          disabled={attr.name === formData.groupBy}
                          sx={{ pl: 4 }}
                        >
                          {attr.label}
                        </MenuItem>
                      ))}
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
                  {groupedAttributeOptions.primary.map((attr) => (
                    <MenuItem
                      key={`primary-${attr.name}`}
                      value={attr.name}
                      disabled={attr.name === formData.dimensions}
                    >
                      {attr.label}
                    </MenuItem>
                  ))}
                  {groupedAttributeOptions.secondary.length > 0 && (
                    <Box
                      component="li"
                      role="option"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        toggleMoreOptions("groupByOther", e);
                      }}
                      sx={{
                        padding: "6px 16px",
                        minHeight: "auto",
                        fontWeight: 600,
                        color: "primary.main",
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>More...</span>
                        {showMoreOptions.groupByOther ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </Box>
                    </Box>
                  )}
                  {showMoreOptions.groupByOther &&
                    groupedAttributeOptions.secondary.map((attr) => (
                      <MenuItem
                        key={`secondary-${attr.name}`}
                        value={attr.name}
                        disabled={attr.name === formData.dimensions}
                        sx={{ pl: 4 }}
                      >
                        {attr.label}
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
            <SectionTitle>Y-Axis</SectionTitle>
            <FormRow>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <StyledSelect
                  value={formData.aggregation.type}
                  label="Type"
                  onChange={handleAggregationTypeChange}
                  disabled={isSubmitting}
                >
                  <MenuItem value="distinctCount">Distinct Count</MenuItem>
                  <MenuItem value="Count">Total Count</MenuItem>
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
                  {groupedAttributeOptions.primary.map((attr) => (
                    <MenuItem key={`primary-${attr.name}`} value={attr.name}>
                      {attr.label}
                    </MenuItem>
                  ))}
                  {groupedAttributeOptions.secondary.length > 0 && (
                    <Box
                      component="li"
                      role="option"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        toggleMoreOptions("aggregationAttribute1", e);
                      }}
                      sx={{
                        padding: "6px 16px",
                        minHeight: "auto",
                        fontWeight: 600,
                        color: "primary.main",
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>More...</span>
                        {showMoreOptions.aggregationAttribute1 ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </Box>
                    </Box>
                  )}
                  {showMoreOptions.aggregationAttribute1 &&
                    groupedAttributeOptions.secondary.map((attr) => (
                      <MenuItem
                        key={`secondary-${attr.name}`}
                        value={attr.name}
                        sx={{ pl: 4 }}
                      >
                        {attr.label}
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
              <LocalStyledButton
                startIcon={<AddIcon />}
                onClick={addCondition}
                disabled={isSubmitting}
                size="small"
              >
                Add Filters
              </LocalStyledButton>
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
                    {groupedAttributeOptions.primary.map((attr) => (
                      <MenuItem key={`primary-${attr.name}`} value={attr.name}>
                        {attr.label}
                      </MenuItem>
                    ))}
                    {groupedAttributeOptions.secondary.length > 0 && (
                      <Box
                        component="li"
                        role="option"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          toggleMoreOptions("filtersField1", e);
                        }}
                        sx={{
                          padding: "6px 16px",
                          minHeight: "auto",
                          fontWeight: 600,
                          color: "primary.main",
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "action.hover",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>More...</span>
                          {showMoreOptions.filtersField1 ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </Box>
                      </Box>
                    )}
                    {showMoreOptions.filtersField1 &&
                      groupedAttributeOptions.secondary.map((attr) => (
                        <MenuItem
                          key={`secondary-${attr.name}`}
                          value={attr.name}
                          sx={{ pl: 4 }}
                        >
                          {attr.label}
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
                {fieldTypes[index] === "date" ||
                fieldTypes[index] === "date-range" ? (
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
                        color: `${
                          theme.getInputTextColor() ||
                          theme.palette.text.primary
                        } !important`,
                      },
                      "& .MuiInputBase-input::placeholder": {
                        color: `${
                          theme.palette.text.secondary || "#666"
                        } !important`,
                      },
                      "& .MuiInputBase-input:-webkit-autofill": {
                        WebkitTextFillColor: `${
                          theme.getInputTextColor() ||
                          theme.palette.text.primary
                        } !important`,
                        WebkitBoxShadow: `0 0 0 1000px ${
                          theme.dashboardTheme?.colors?.background?.paper ||
                          "#ffffff"
                        } inset !important`,
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
                        color: `${
                          theme.getInputTextColor() ||
                          theme.palette.text.primary
                        } !important`,
                      },
                      "& .MuiInputBase-input::placeholder": {
                        color: `${
                          theme.palette.text.secondary || "#666"
                        } !important`,
                      },
                      "& .MuiInputBase-input:-webkit-autofill": {
                        WebkitTextFillColor: `${
                          theme.getInputTextColor() ||
                          theme.palette.text.primary
                        } !important`,
                        WebkitBoxShadow: `0 0 0 1000px ${
                          theme.dashboardTheme?.colors?.background?.paper ||
                          "#ffffff"
                        } inset !important`,
                      },
                    }}
                  />
                )}
                <IconButton
                  onClick={() => removeCondition(index)}
                  disabled={isSubmitting}
                  size="small"
                >
                  <DeleteOutlined />
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
                color: `${
                  theme.getInputTextColor() || theme.palette.text.primary
                } !important`,
              },
              "& .MuiInputBase-input::placeholder": {
                color: `${theme.palette.text.secondary || "#666"} !important`,
              },
              "& .MuiInputBase-input:-webkit-autofill": {
                WebkitTextFillColor: `${
                  theme.getInputTextColor() || theme.palette.text.primary
                } !important`,
                WebkitBoxShadow: `0 0 0 1000px ${
                  theme.dashboardTheme?.colors?.background?.paper || "#ffffff"
                } inset !important`,
              },
            }}
          />
          <Box>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              disabled={isSubmitting}
              size="small"
              multiline
              rows={3}
              error={
                countCharacters(formData.description) > 1000 ||
                !!fieldErrors["description"]
              }
              helperText={
                fieldErrors["description"] ||
                (countCharacters(formData.description) > 1000
                  ? `Character limit exceeded. Maximum 1000 characters allowed. (${countCharacters(
                      formData.description
                    )} / 1000 characters)`
                  : `${countCharacters(formData.description)} / 1000 characters`)
              }
              FormHelperTextProps={{
                sx: {
                  textAlign: "right",
                },
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
                  color: `${
                    theme.getInputTextColor() || theme.palette.text.primary
                  } !important`,
                },
                "& .MuiInputBase-input::placeholder": {
                  color: `${theme.palette.text.secondary || "#666"} !important`,
                },
                "& .MuiInputBase-input:-webkit-autofill": {
                  WebkitTextFillColor: `${
                    theme.getInputTextColor() || theme.palette.text.primary
                  } !important`,
                  WebkitBoxShadow: `0 0 0 1000px ${
                    theme.dashboardTheme?.colors?.background?.paper || "#ffffff"
                  } inset !important`,
                },
              }}
            />
          </Box>
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
                MenuProps={{
                  disableAutoFocusItem: true,
                  keepMounted: true,
                }}
              >
                {dataSourcesLoading && (
                  <MenuItem disabled>
                    <Box sx={{ width: "100%", textAlign: "center" }}>
                      Loading...
                    </Box>
                  </MenuItem>
                )}
                {!dataSourcesLoading &&
                  groupedDataSources.primary.map((source) => (
                    <MenuItem key={source._id} value={source._id}>
                      {source.name}
                    </MenuItem>
                  ))}
                {!dataSourcesLoading &&
                  groupedDataSources.secondary.length > 0 && (
                    <Box
                      component="li"
                      role="option"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        toggleMoreOptions("dataSource", e);
                      }}
                      sx={{
                        padding: "6px 16px",
                        minHeight: "auto",
                        fontWeight: 600,
                        color: "primary.main",
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>More...</span>
                        {showMoreOptions.dataSource ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </Box>
                    </Box>
                  )}
                {!dataSourcesLoading &&
                  showMoreOptions.dataSource &&
                  groupedDataSources.secondary.map((source) => (
                    <MenuItem
                      key={source._id}
                      value={source._id}
                      sx={{ pl: 4 }}
                    >
                      {source.name}
                    </MenuItem>
                  ))}
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
                        {isTrend && (
                          <MenuItem value="versionValue">Period</MenuItem>
                        )}
                        {!isTrend &&
                          groupedAttributeOptions.primary.map((attr) => (
                            <MenuItem
                              key={`primary-${attr.name}`}
                              value={attr.name}
                              disabled={attr.name === formData.groupBy}
                            >
                              {attr.label}
                            </MenuItem>
                          ))}
                        {!isTrend &&
                          groupedAttributeOptions.secondary.length > 0 && (
                            <Box
                              component="li"
                              role="option"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                toggleMoreOptions("dimensions", e);
                              }}
                              sx={{
                                padding: "6px 16px",
                                minHeight: "auto",
                                fontWeight: 600,
                                color: "primary.main",
                                cursor: "pointer",
                                "&:hover": {
                                  backgroundColor: "action.hover",
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  width: "100%",
                                  justifyContent: "space-between",
                                }}
                              >
                                <span>More...</span>
                                {showMoreOptions.dimensions ? (
                                  <ExpandLessIcon />
                                ) : (
                                  <ExpandMoreIcon />
                                )}
                              </Box>
                            </Box>
                          )}
                        {!isTrend &&
                          showMoreOptions.dimensions &&
                          groupedAttributeOptions.secondary.map((attr) => (
                            <MenuItem
                              key={`secondary-${attr.name}`}
                              value={attr.name}
                              disabled={attr.name === formData.groupBy}
                              sx={{ pl: 4 }}
                            >
                              {attr.label}
                            </MenuItem>
                          ))}
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
                        {groupedAttributeOptions.primary.map((attr) => (
                          <MenuItem
                            key={`primary-${attr.name}`}
                            value={attr.name}
                            disabled={attr.name === formData.dimensions}
                          >
                            {attr.label}
                          </MenuItem>
                        ))}
                        {groupedAttributeOptions.secondary.length > 0 && (
                          <Box
                            component="li"
                            role="option"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              toggleMoreOptions("groupBy3", e);
                            }}
                            sx={{
                              padding: "6px 16px",
                              minHeight: "auto",
                              fontWeight: 600,
                              color: "primary.main",
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "action.hover",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                                justifyContent: "space-between",
                              }}
                            >
                              <span>More...</span>
                              {showMoreOptions.groupBy3 ? (
                                <ExpandLessIcon />
                              ) : (
                                <ExpandMoreIcon />
                              )}
                            </Box>
                          </Box>
                        )}
                        {showMoreOptions.groupBy3 &&
                          groupedAttributeOptions.secondary.map((attr) => (
                            <MenuItem
                              key={`secondary-${attr.name}`}
                              value={attr.name}
                              disabled={attr.name === formData.dimensions}
                              sx={{ pl: 4 }}
                            >
                              {attr.label}
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
                        <MenuItem value="distinctCount">
                          Distinct Count
                        </MenuItem>
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
                        {groupedAttributeOptions.primary.map((attr) => (
                          <MenuItem
                            key={`primary-${attr.name}`}
                            value={attr.name}
                          >
                            {attr.label}
                          </MenuItem>
                        ))}
                        {groupedAttributeOptions.secondary.length > 0 && (
                          <Box
                            component="li"
                            role="option"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              toggleMoreOptions("aggregationAttribute2", e);
                            }}
                            sx={{
                              padding: "6px 16px",
                              minHeight: "auto",
                              fontWeight: 600,
                              color: "primary.main",
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "action.hover",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                                justifyContent: "space-between",
                              }}
                            >
                              <span>More...</span>
                              {showMoreOptions.aggregationAttribute2 ? (
                                <ExpandLessIcon />
                              ) : (
                                <ExpandMoreIcon />
                              )}
                            </Box>
                          </Box>
                        )}
                        {showMoreOptions.aggregationAttribute2 &&
                          groupedAttributeOptions.secondary.map((attr) => (
                            <MenuItem
                              key={`secondary-${attr.name}`}
                              value={attr.name}
                              sx={{ pl: 4 }}
                            >
                              {attr.label}
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
                    <LocalStyledButton
                      startIcon={<AddIcon />}
                      onClick={addCondition}
                      disabled={isSubmitting}
                      size="small"
                    >
                      Add Filters
                    </LocalStyledButton>
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
                          {groupedAttributeOptions.primary.map((attr) => (
                            <MenuItem
                              key={`primary-${attr.name}`}
                              value={attr.name}
                            >
                              {attr.label}
                            </MenuItem>
                          ))}
                          {groupedAttributeOptions.secondary.length > 0 && (
                            <Box
                              component="li"
                              role="option"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                toggleMoreOptions("filtersField2", e);
                              }}
                              sx={{
                                padding: "6px 16px",
                                minHeight: "auto",
                                fontWeight: 600,
                                color: "primary.main",
                                cursor: "pointer",
                                "&:hover": {
                                  backgroundColor: "action.hover",
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  width: "100%",
                                  justifyContent: "space-between",
                                }}
                              >
                                <span>More...</span>
                                {showMoreOptions.filtersField2 ? (
                                  <ExpandLessIcon />
                                ) : (
                                  <ExpandMoreIcon />
                                )}
                              </Box>
                            </Box>
                          )}
                          {showMoreOptions.filtersField2 &&
                            groupedAttributeOptions.secondary.map((attr) => (
                              <MenuItem
                                key={`secondary-${attr.name}`}
                                value={attr.name}
                                sx={{ pl: 4 }}
                              >
                                {attr.label}
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
                      {fieldTypes[index] === "date" ||
                      fieldTypes[index] === "date-range" ? (
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
                              color: `${
                                theme.getInputTextColor() ||
                                theme.palette.text.primary
                              } !important`,
                            },
                            "& .MuiInputBase-input::placeholder": {
                              color: `${
                                theme.palette.text.secondary || "#666"
                              } !important`,
                            },
                            "& .MuiInputBase-input:-webkit-autofill": {
                              WebkitTextFillColor: `${
                                theme.getInputTextColor() ||
                                theme.palette.text.primary
                              } !important`,
                              WebkitBoxShadow: `0 0 0 1000px ${
                                theme.dashboardTheme?.colors?.background
                                  ?.paper || "#ffffff"
                              } inset !important`,
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
                              color: `${
                                theme.getInputTextColor() ||
                                theme.palette.text.primary
                              } !important`,
                            },
                            "& .MuiInputBase-input::placeholder": {
                              color: `${
                                theme.palette.text.secondary || "#666"
                              } !important`,
                            },
                            "& .MuiInputBase-input:-webkit-autofill": {
                              WebkitTextFillColor: `${
                                theme.getInputTextColor() ||
                                theme.palette.text.primary
                              } !important`,
                              WebkitBoxShadow: `0 0 0 1000px ${
                                theme.dashboardTheme?.colors?.background
                                  ?.paper || "#ffffff"
                              } inset !important`,
                            },
                          }}
                        />
                      )}
                      <IconButton
                        onClick={() => removeCondition(index)}
                        disabled={isSubmitting}
                        size="small"
                      >
                        <DeleteOutlined />
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
          <StyledButton variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </StyledButton>
          <StyledButton
            variant="primary"
            onClick={handleSubmit}
            disabled={
              isSubmitting || 
              !formData.widgetTypeId || 
              !formData.dataSourceId ||
              !formData.dimensions || 
              !formData.aggregation.type || 
              !formData.aggregation.attributeName
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
      ) : (
        <Box
          display="flex"
          gap={STYLE_GUIDE.SPACING.s4}
          pb={STYLE_GUIDE.SPACING.s4}
        >
          <StyledButton
            variant="secondary"
            onClick={handleSubmit}
            sx={{ flex: 1 }}
          >
            Preview Changes
          </StyledButton>
          <StyledButton
            variant="primary"
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
            sx={{ flex: 1 }}
          >
            Add to Dashboard
          </StyledButton>
        </Box>
      )}
    </IfElseWrapper>
  );
};
