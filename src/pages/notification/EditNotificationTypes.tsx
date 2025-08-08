import * as React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import {  useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  FormHelperText,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import useGet from "../../hooks/useGet";
import usePost from "../../hooks/usePost";
import usePut from "../../hooks/usePut";
import { GET, POST } from "../../services/apiRoutes";
import { STYLE_GUIDE } from "../../styles";
import { useSelector } from "react-redux";
import { RootState } from "../../reducers";
import Frequency from "./Frequency";
import { useQueryClient } from "@tanstack/react-query";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";


// Debounce utility function
function debounce(func, wait) {
  let timeout;
  const debounced = (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  debounced.cancel = () => clearTimeout(timeout);
  return debounced;
}

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <Typography color="error">Something went wrong.</Typography>;
    }
    return this.props.children;
  }
}

// Custom Hook for Field Options
const useFieldOptions = (entityId, notificationTypeList) => {
  const [fieldOptions, setFieldOptions] = useState([]);

  const entityData = useMemo(() => {
    if (!entityId || !notificationTypeList.data?.data) return null;
    return notificationTypeList.data.data.find(
      (entity) => entity._id === entityId
    );
  }, [entityId, notificationTypeList.data?.data]);

  useEffect(() => {
    if (entityData?.attributes) {
      const newFieldOptions = entityData.attributes.map((attr) => ({
        value: attr.mappingName,
        label: attr.name,
        type: attr.type,
        attributeId: attr._id,
      }));
      setFieldOptions(newFieldOptions);
    } else {
      setFieldOptions([]);
    }
  }, [entityData]);

  return fieldOptions;
};

// Reusable Material-UI Select Component
const MUISelect = React.memo(
  ({
    label,
    value,
    onChange,
    options = [],
    multiple = false,
    error = false,
    helperText = "",
    disabled = false,
    loading = false,
    sx = {},
    ...props
  }) => {
    const id = useMemo(
      () => `select-${Math.random().toString(36).substr(2, 9)}`,
      []
    );

    return (
      <TextField
        select
        label={label}
        value={value}
        onChange={onChange}
        error={error}
        helperText={helperText}
        disabled={disabled || loading}
        fullWidth
        size="small"
        SelectProps={{
          multiple,
          displayEmpty: true,
          renderValue: multiple
            ? (selected) => {
                if (!selected || selected.length === 0)
                  return <em>Select...</em>;
                return (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.split(",").map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                );
              }
            : undefined,
          ...props.SelectProps,
        }}
        sx={{ ...sx }}
        {...props}
      >
        {loading ? (
          <MenuItem disabled>Loading...</MenuItem>
        ) : (
          options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))
        )}
      </TextField>
    );
  }
);

// Date Input with Time Unit Component
const DateTimeInput = React.memo(
  ({
    dateValue,
    timeUnit,
    onDateChange,
    onTimeUnitChange,
    error = false,
    helperText = "",
  }) => {
    const timeUnitOptions = [
      { value: "M", label: "Month (M)" },
      { value: "d", label: "Days (d)" },
      { value: "y", label: "Yearly (y)" },
    ];

    return (
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
        <TextField
          type="date"
          label="Select Date"
          value={dateValue}
          onChange={(e) => onDateChange(e.target.value)}
          error={error}
          helperText={helperText}
          fullWidth
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <MUISelect
          label="Time Unit"
          value={timeUnit}
          onChange={(e) => onTimeUnitChange(e.target.value)}
          options={timeUnitOptions}
          sx={{ minWidth: 150 }}
        />
      </Box>
    );
  }
);

// Boolean Select Component
const BooleanSelect = React.memo(
  ({ value, onChange, error = false, helperText = "" }) => {
    const options = [
      { value: "", label: "Select..." },
      { value: "true", label: "True" },
      { value: "false", label: "False" },
    ];

    return (
      <MUISelect
        label="Select Value"
        value={value}
        onChange={(e) => onChange(e.target.value === "true")}
        options={options}
        error={error}
        helperText={helperText}
      />
    );
  }
);

// Multi Select Component for Status, Case Type, Country Code
const MultiSelectField = React.memo(
  ({ field, operator, value, onChange, error = false, helperText = "" }) => {
    const getOptions = (fieldName) => {
      switch (fieldName) {
        case "status":
          return [
            "open",
            "rated to search",
            "rated to draft ih",
            "rated to draft oc",
            "review rate to draft",
            "filing requested",
            "submitted",
          ].map((opt) => ({ value: opt, label: opt }));
        case "case_type":
          return ["PRI", "PRO", "TRA", "DES"].map((opt) => ({
            value: opt,
            label: opt,
          }));
        case "country_code":
          return ["EP", "IN", "WO", "FAM", "US", "CN", "JP"].map((opt) => ({
            value: opt,
            label: opt,
          }));
        default:
          return [];
      }
    };

    const options = getOptions(field);
    const isMultiple = operator === "in";

    return (
      <MUISelect
        label="Select Value"
        value={value}
        onChange={(e) => {
          const newValue = isMultiple
            ? e.target.value.join(",")
            : e.target.value;
          onChange(newValue);
        }}
        options={options}
        multiple={isMultiple}
        error={error}
        helperText={helperText}
        SelectProps={{
          value: isMultiple ? (value ? value.split(",") : []) : value,
        }}
      />
    );
  }
);

// Main Value Input Component
const ValueInput = React.memo(
  ({ rule, onValueChange, onTimeUnitChange, fieldOptions, operatorList }) => {
    const field = fieldOptions.find((f) => f.value === rule.field);
    const operators =
      operatorList.data?.data?.find((op) => op.fieldType === field?.type)
        ?.operators || [];
    const selectedOperator = operators?.find(
      (op) => op.operatorKey === rule.operator
    );
    const valueRequired = selectedOperator?.valueRequired ?? true;
    const hasError = valueRequired && !rule.value;

    if (!field || !valueRequired) {
      return null;
    }

    const commonProps = {
      error: hasError,
      helperText: hasError ? "Value is required" : "",
    };

    switch (field.type) {
      case "boolean":
        return (
          <BooleanSelect
            value={rule.value}
            onChange={onValueChange}
            {...commonProps}
          />
        );
      case "select":
        if (["status", "case_type", "country_code"].includes(rule.field)) {
          return (
            <MultiSelectField
              field={rule.field}
              operator={rule.operator}
              value={rule.value}
              onChange={onValueChange}
              {...commonProps}
            />
          );
        }
      case "date":
        return (
          <DateTimeInput
            dateValue={rule.value}
            timeUnit={rule.timeUnit}
            onDateChange={onValueChange}
            onTimeUnitChange={onTimeUnitChange}
            {...commonProps}
          />
        );
      default:
        return (
          <TextField
            label="Enter Value"
            value={rule.value}
            onChange={(e) => onValueChange(e.target.value)}
            fullWidth
            size="small"
            {...commonProps}
          />
        );
    }
  }
);

// Rule Component
const RuleComponent = React.memo(
  ({
    rule,
    groupPath,
    index,
    fieldOptions,
    operatorList,
    updateRule,
    removeItem,
  }) => {
    const selectedField = fieldOptions.find((f) => f.value === rule.field);
    const operators =
      operatorList.data?.data?.find(
        (op) => op.fieldType === selectedField?.type
      )?.operators || [];
    const operatorOptions = operators.map((op) => ({
      value: op.operatorKey,
      label: op.operatorName,
    }));

    const handleFieldChange = useCallback(
      (e) => {
        updateRule(groupPath, index, "field", e.target.value);
        updateRule(groupPath, index, "operator", "");
        updateRule(groupPath, index, "value", "");
        updateRule(groupPath, index, "timeUnit", "");
      },
      [updateRule, groupPath, index]
    );

    const handleOperatorChange = useCallback(
      (e) => {
        updateRule(groupPath, index, "operator", e.target.value);
        const selectedOp = operators.find(
          (op) => op.operatorKey === e.target.value
        );
        if (selectedOp && !selectedOp.valueRequired) {
          updateRule(groupPath, index, "value", "");
          updateRule(groupPath, index, "timeUnit", "");
        }
      },
      [updateRule, groupPath, index, operators]
    );

    const fieldOptions_formatted = fieldOptions.map((opt) => ({
      value: opt.value,
      label: opt.label,
    }));

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
          p: 2,
          bgcolor: "grey.100",
          borderRadius: 2,
          transition: "background-color 0.2s ease",
          "&:hover": { bgcolor: "grey.200" },
        }}
      >
        <MUISelect
          label="Select Field"
          value={rule.field}
          onChange={handleFieldChange}
          options={[
            { value: "", label: "Select field..." },
            ...fieldOptions_formatted,
          ]}
          sx={{ minWidth: 200 }}
        />
        <MUISelect
          label="Select Operator"
          value={rule.operator}
          onChange={handleOperatorChange}
          options={[
            { value: "", label: "Select operator..." },
            ...operatorOptions,
          ]}
          disabled={!rule.field}
          loading={operatorList.isLoading}
          sx={{ minWidth: 180 }}
        />
        <Box sx={{ minWidth: 200, flexGrow: 1 }}>
          <ValueInput
            rule={rule}
            onValueChange={(value) =>
              updateRule(groupPath, index, "value", value)
            }
            onTimeUnitChange={(timeUnit) =>
              updateRule(groupPath, index, "timeUnit", timeUnit)
            }
            fieldOptions={fieldOptions}
            operatorList={operatorList}
          />
        </Box>
        <IconButton
          onClick={() => removeItem(groupPath, index)}
          color="error"
          aria-label="Remove rule"
          sx={{ mt: 1 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
    );
  }
);

// Group Component
const GroupComponent = React.memo(
  ({
    group,
    groupPath = [],
    isRoot = false,
    fieldOptions,
    operatorList,
    addRule,
    addGroup,
    removeItem,
    updateRule,
    updateGroupLogic,
  }) => {
    const [collapsed, setCollapsed] = useState(false);
    const logicOptions = [
      { value: "AND", label: "AND" },
      { value: "OR", label: "OR" },
    ];

    return (
      <Box
        sx={{
          border: isRoot ? "2px solid" : "1px solid",
          borderColor: isRoot ? "primary.light" : "grey.300",
          borderRadius: 2,
          p: 3,
          bgcolor: isRoot ? "background.paper" : "inherit",
          boxShadow: isRoot ? 3 : 1,
          transition: "all 0.3s ease-in-out",
          "&:hover": { boxShadow: 4 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {!isRoot && (
              <IconButton
                onClick={() => setCollapsed(!collapsed)}
                sx={{
                  bgcolor: "grey.100",
                  "&:hover": { bgcolor: "grey.200" },
                  transition: "background-color 0.2s ease",
                }}
                aria-label="Toggle group collapse"
              >
                {collapsed ? <ChevronRightIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: "medium",
                color: "text.secondary",
                fontSize: "0.9rem",
              }}
            >
              {isRoot ? "Root Condition Group" : "Nested Group"}
            </Typography>
            <MUISelect
              label="Logic"
              value={group.logic}
              onChange={(e) => updateGroupLogic(groupPath, e.target.value)}
              options={logicOptions}
              sx={{ minWidth: 100, fontSize: "0.85rem" }}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => addRule(groupPath)}
              startIcon={<AddIcon />}
              sx={{
                fontSize: "0.85rem",
                borderRadius: 1,
                px: 2,
                py: 0.5,
                transition: "all 0.2s ease",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              Rule
            </Button>
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={() => addGroup(groupPath)}
              startIcon={<AddIcon />}
              sx={{
                fontSize: "0.85rem",
                borderRadius: 1,
                px: 2,
                py: 0.5,
                transition: "all 0.2s ease",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              Group
            </Button>
            {!isRoot && (
              <IconButton
                onClick={() => {
                  const parentPath = groupPath.slice(0, -1);
                  const index = groupPath[groupPath.length - 1];
                  removeItem(parentPath, index);
                }}
                color="error"
                aria-label="Remove group"
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </Box>
        {!collapsed && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {group.rules.map((rule, index) => (
              <Box key={rule.id || index}>
                {index > 0 && (
                  <Box sx={{ py: 1, textAlign: "left" }}>
                    <Chip
                      label={group.logic}
                      size="small"
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: "medium",
                        bgcolor: "primary.light",
                        color: "primary.contrastText",
                        borderRadius: "12px",
                        py: 0.5,
                        display: "inline-block",
                        transition: "all 0.2s ease",
                      }}
                    />
                  </Box>
                )}
                {rule.logic ? (
                  <GroupComponent
                    group={rule}
                    groupPath={[...groupPath, index]}
                    fieldOptions={fieldOptions}
                    operatorList={operatorList}
                    addRule={addRule}
                    addGroup={addGroup}
                    removeItem={removeItem}
                    updateRule={updateRule}
                    updateGroupLogic={updateGroupLogic}
                  />
                ) : (
                  <RuleComponent
                    rule={rule}
                    groupPath={groupPath}
                    index={index}
                    fieldOptions={fieldOptions}
                    operatorList={operatorList}
                    updateRule={updateRule}
                    removeItem={removeItem}
                  />
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    );
  }
);

// Main Form Header Component
const NotificationFormHeader = React.memo(
  ({ notification, setNotification, notificationTypeList }) => {
    const entityOptions = useMemo(() => {
      if (!notificationTypeList.data?.data) return [];
      return notificationTypeList.data.data.map((entity) => ({
        value: entity._id,
        label: entity.name,
      }));
    }, [notificationTypeList.data?.data]);

    const handleNameChange = useCallback(
      (e) => {
        setNotification((prev) => ({ ...prev, name: e.target.value }));
      },
      [setNotification]
    );

    const handleEntityChange = useCallback(
      (e) => {
        setNotification((prev) => ({ ...prev, entityId: e.target.value }));
      },
      [setNotification]
    );

    return (
      <Box sx={{ mb: 4, p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Notification Name"
              value={notification.name}
              onChange={handleNameChange}
              fullWidth
              size="small"
              required
              error={!notification.name}
              helperText={!notification.name ? "Name is required" : ""}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MUISelect
              label="Select Entity"
              value={notification.entityId}
              onChange={handleEntityChange}
              options={[
                { value: "", label: "Select Entity..." },
                ...entityOptions,
              ]}
              error={!notification.entityId}
              helperText={!notification.entityId ? "Entity is required" : ""}
            />
          </Grid>
        </Grid>
      </Box>
    );
  }
);

// ConditionRuleBuilder Component
const ConditionRuleBuilder = React.memo(
  ({
    onChange,
    notificationTypeList,
    fieldOptions,
    initialConditionGroup,
    initialNotificationData,
  }) => {
    const organizationId = useSelector(
      (state: RootState) =>
        state.userPermission?.currentUser?.organizationId?._id
    );

    const [notification, setNotification] = useState({
      name: initialNotificationData?.name || "",
      entityId: initialNotificationData?.entityId || "",
      conditionGroup: initialConditionGroup || { logic: "AND", rules: [] },
    });

    const operatorList = usePost(["operatorList"]);

    useEffect(() => {
      operatorList.mutate({
        url: POST.OPERATOR_LIST,
        payload: { fieldType: "all" },
      });
    }, []);

    useEffect(() => {
      if (initialNotificationData && initialNotificationData !== notification) {
        setNotification((prev) => ({
          ...prev,
          name: initialNotificationData.name || prev.name,
          entityId: initialNotificationData.entityId || prev.entityId,
        }));
      }
    }, [initialNotificationData]);

    useEffect(() => {
      if (
        initialConditionGroup &&
        initialConditionGroup !== notification.conditionGroup
      ) {
        setNotification((prev) => ({
          ...prev,
          conditionGroup: initialConditionGroup,
        }));
      }
    }, [initialConditionGroup]);

    const transformAndEmitData = useCallback(() => {
      const conditionGroups = [];

      const flattenGroup = (group) => {
        const conditions = [];
        group.rules.forEach((rule) => {
          if (rule.logic) {
            conditionGroups.push({
              group_operator: rule.logic,
              conditions: [],
            });
            flattenGroup(rule);
          } else {
            const fieldOption = fieldOptions.find(
              (f) => f.value === rule.field
            );
            if (fieldOption && rule.operator && rule.field) {
              conditions.push({
                attributeId: fieldOption.attributeId,
                operator: rule.operator,
                value: rule.value || "",
                timeUnit: rule.timeUnit || "",
              });
            }
          }
        });
        if (conditions.length > 0) {
          conditionGroups.push({
            group_operator: group.logic,
            conditions,
          });
        }
      };

      flattenGroup(notification.conditionGroup);

      const transformedData = {
        name: notification.name,
        organizationId: organizationId,
        entityId: notification.entityId,
        triggerFieldId: "",
        isActive: true,
        conditionGroups,
      };

      onChange(transformedData);
    }, [
      notification.name,
      notification.entityId,
      notification.conditionGroup,
      fieldOptions,
      organizationId,
      onChange,
    ]);

    const debouncedEmit = useCallback(
      debounce(() => {
        transformAndEmitData();
      }, 300),
      [transformAndEmitData]
    );

    useEffect(() => {
      debouncedEmit();
      return () => {
        debouncedEmit.cancel();
      };
    }, [notification, debouncedEmit]);

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const getGroupByPath = (root, path) => {
      if (path.length === 0) return root;
      let current = root;
      for (const index of path) {
        current = current.rules[index];
      }
      return current;
    };

    const addRule = useCallback((groupPath) => {
      setNotification((prev) => {
        const updated = JSON.parse(JSON.stringify(prev));
        const group = getGroupByPath(updated.conditionGroup, groupPath);
        group.rules.push({
          id: generateId(),
          field: "",
          operator: "",
          value: "",
          timeUnit: "",
        });
        return updated;
      });
    }, []);

    const addGroup = useCallback((groupPath) => {
      setNotification((prev) => {
        const updated = JSON.parse(JSON.stringify(prev));
        const group = getGroupByPath(updated.conditionGroup, groupPath);
        group.rules.push({
          id: generateId(),
          logic: "AND",
          rules: [],
        });
        return updated;
      });
    }, []);

    const removeItem = useCallback((groupPath, index) => {
      setNotification((prev) => {
        const updated = JSON.parse(JSON.stringify(prev));
        const group = getGroupByPath(updated.conditionGroup, groupPath);
        group.rules.splice(index, 1);
        return updated;
      });
    }, []);

    const updateRule = useCallback((groupPath, index, field, value) => {
      setNotification((prev) => {
        const updated = JSON.parse(JSON.stringify(prev));
        const group = getGroupByPath(updated.conditionGroup, groupPath);
        group.rules[index][field] = value;
        return updated;
      });
    }, []);

    const updateGroupLogic = useCallback((groupPath, logic) => {
      setNotification((prev) => {
        const updated = JSON.parse(JSON.stringify(prev));
        const group = getGroupByPath(updated.conditionGroup, groupPath);
        group.logic = logic;
        return updated;
      });
    }, []);

    return (
      <Box
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          p: 4,
          bgcolor: "background.paper",
          borderRadius: 2,
        }}
      >
        <NotificationFormHeader
          notification={notification}
          setNotification={setNotification}
          notificationTypeList={notificationTypeList}
        />
        <GroupComponent
          group={notification.conditionGroup}
          isRoot={true}
          fieldOptions={fieldOptions}
          operatorList={operatorList}
          addRule={addRule}
          addGroup={addGroup}
          removeItem={removeItem}
          updateRule={updateRule}
          updateGroupLogic={updateGroupLogic}
        />
      </Box>
    );
  }
);

// Main EditNotificationTypes Component
export default function EditNotificationTypes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState({ condition: true, reminder: true });
  const [notificationData, setNotificationData] = useState({});
  const [notificationTypeId, setNotificationTypeId] = useState<string | null>(
    id || null
  );
  const [initialConditionGroup, setInitialConditionGroup] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const notificationTypeList = useGet(
    ["notificationTypeList"],
    `${GET.Entity_List}`,
    true,
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

  const notificationDetails = useGet(
    ["notificationDetails", id],
    id ? `/notivix/notification-setting/type/${id}` : null,
    !!id,
    {
      staleTime: 0, // Disable stale time to force fresh fetch
      cacheTime: 0, // Clear cache immediately after unmount
      refetchOnMount: "always", // Force refetch on mount
    }
  );

  const updateNotification = usePut(["updateNotification"]);

  const fieldOptions = useFieldOptions(
    notificationData.entityId,
    notificationTypeList
  );

  // Invalidate query on mount or when id changes
  useEffect(() => {
    if (id) {
      queryClient.invalidateQueries(["notificationDetails", id]);
      // Reset state to ensure fresh data is loaded
      setIsDataLoaded(false);
      setNotificationData({});
      setInitialConditionGroup(null);
      setNotificationTypeId(id);
    }
  }, [id, queryClient]);

  const transformBackendToConditionGroup = useCallback(
    (conditionGroups, availableFieldOptions) => {
      if (!conditionGroups || conditionGroups.length === 0) {
        return { logic: "AND", rules: [] };
      }

      const rootGroup = {
        logic: conditionGroups[0].group_operator || "AND",
        rules: [],
      };

      conditionGroups.forEach((group) => {
        group.conditions.forEach((condition) => {
          const fieldOption = availableFieldOptions.find(
            (f) => f.attributeId === condition.attributeId
          );
          if (fieldOption) {
            rootGroup.rules.push({
              id: Math.random().toString(36).substr(2, 9),
              field: fieldOption.value,
              operator: condition.operator,
              value: condition.value,
              timeUnit: condition.timeUnit || "",
            });
          }
        });
      });

      return rootGroup;
    },
    []
  );

  useEffect(() => {
    if (
      notificationDetails.data?.success &&
      notificationDetails.data?.data &&
      !isDataLoaded
    ) {
      const data = notificationDetails.data.data;
      const newNotificationData = {
        name: data.name || "",
        organizationId: data.organizationId || "",
        entityId: data.entityId || "",
        triggerFieldId: "",
        isActive: data.isActive || true,
        conditionGroups: data.conditionGroups || [],
      };

      setNotificationData(newNotificationData);
      setIsDataLoaded(true);
    }
  }, [notificationDetails.data, isDataLoaded]);

  useEffect(() => {
    if (
      isDataLoaded &&
      fieldOptions.length > 0 &&
      notificationData.conditionGroups &&
      notificationData.conditionGroups.length > 0 &&
      !initialConditionGroup
    ) {
      const transformedGroup = transformBackendToConditionGroup(
        notificationData.conditionGroups,
        fieldOptions
      );
      setInitialConditionGroup(transformedGroup);
    }
  }, [
    isDataLoaded,
    fieldOptions,
    notificationData.conditionGroups,
    initialConditionGroup,
    transformBackendToConditionGroup,
  ]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!notificationData.name || !notificationData.entityId) {
        toast.error("Name and Entity are required fields.");
        return;
      }

      try {
        const response = await updateNotification.mutateAsync({
          url: `/notivix/notification-setting/type/update/${id}`,
          payload: notificationData,
        });

        if (response.success) {
          toast.success("Notification updated successfully!");
          // Invalidate notification details query after successful update
          queryClient.invalidateQueries(["notificationDetails", id]);
          navigate("/notivix/notification-types");
        } else {
          throw new Error("Notification update failed");
        }
      } catch (error) {
        console.error("Error updating notification:", error);
        toast.error("Failed to update notification. Please try again.");
      }
    },
    [notificationData, id, navigate, updateNotification, queryClient]
  );

  if (notificationDetails.isLoading || !isDataLoaded) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading notification details...</Typography>
      </Box>
    );
  }

  if (notificationDetails.isError) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography color="error" variant="h6">
          Failed to load notification type details. Please try again.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 3,
        ml: { xs: 0 },
        backgroundColor: STYLE_GUIDE.COLORS.backgroundLight,
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{ display: "flex", justifyContent: "left", }}
      >
        <ArrowBackIosIcon sx={{ mt: 0.5, cursor: "pointer" }} onClick={() => navigate("/notivix/notification")} />


        <Typography
          variant="h4"
          sx={{
            mb: 3,
            fontWeight: 400,
            color: STYLE_GUIDE.COLORS.primaryDark,
          }}
        >
          Edit Notification Type
        </Typography>
      </Box>

      <Card
        sx={{
          backgroundColor: STYLE_GUIDE.COLORS.white,
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Accordion
              expanded={expanded.condition}
              onChange={(event, isExpanded) =>
                setExpanded((prev) => ({ ...prev, condition: isExpanded }))
              }
              sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="condition-content"
                id="condition-header"
                sx={{ bgcolor: "grey.50", borderRadius: 2 }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "text.primary" }}
                >
                  Condition Rule Builder
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ErrorBoundary>
                  {isDataLoaded && fieldOptions.length > 0 ? (
                    <ConditionRuleBuilder
                      onChange={setNotificationData}
                      notificationTypeList={notificationTypeList}
                      fieldOptions={fieldOptions}
                      initialConditionGroup={initialConditionGroup}
                      initialNotificationData={notificationData}
                    />
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        py: 4,
                      }}
                    >
                      <CircularProgress />
                      <Typography sx={{ ml: 2 }}>
                        Loading form data...
                      </Typography>
                    </Box>
                  )}
                </ErrorBoundary>
                <Box
                  sx={{
                    mt: 4,
                    display: "flex",
                    justifyContent: "right",
                  }}
                >
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => navigate("/notivix/notification-types")}
                    sx={{ px: 4, borderRadius: 1, mr: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{ px: 4, borderRadius: 1 }}
                    disabled={updateNotification.isLoading || !isDataLoaded}
                  >
                    {updateNotification.isLoading ? "Updating..." : "Update"}
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={expanded.reminder && notificationTypeId !== null}
              onChange={(event, isExpanded) =>
                setExpanded((prev) => ({ ...prev, reminder: isExpanded }))
              }
              sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}
              disabled={notificationTypeId === null}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="reminder-content"
                id="reminder-header"
                sx={{ bgcolor: "grey.50", borderRadius: 2 }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "text.primary" }}
                >
                  Reminder Task
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ErrorBoundary>
                  <Frequency
                    fieldOptions={fieldOptions}
                    notificationTypeId={notificationTypeId}
                  />
                </ErrorBoundary>
              </AccordionDetails>
            </Accordion>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

// import * as React from "react";
// import { useState, useEffect, useMemo, useCallback } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { toast } from "react-toastify";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   TextField,
//   Select,
//   MenuItem,
//   Button,
//   IconButton,
//   FormControl,
//   InputLabel,
//   Grid,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   CircularProgress,
//   FormHelperText,
//   Chip,
// } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import CloseIcon from "@mui/icons-material/Close";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// import useGet from "../../hooks/useGet";
// import usePost from "../../hooks/usePost";
// import usePut from "../../hooks/usePut";
// import { GET, POST } from "../../services/apiRoutes";
// import { STYLE_GUIDE } from "../../styles";
// import { useSelector } from "react-redux";
// import { RootState } from "../../reducers";
// import Frequency from "./Frequency";
// import { useQueryClient } from "@tanstack/react-query";

// // Debounce utility function
// function debounce(func, wait) {
//   let timeout;
//   const debounced = (...args) => {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func(...args), wait);
//   };
//   debounced.cancel = () => clearTimeout(timeout);
//   return debounced;
// }

// // Error Boundary Component
// class ErrorBoundary extends React.Component {
//   state = { hasError: false };

//   static getDerivedStateFromError(error) {
//     return { hasError: true };
//   }

//   render() {
//     if (this.state.hasError) {
//       return <Typography color="error">Something went wrong.</Typography>;
//     }
//     return this.props.children;
//   }
// }

// // Custom Hook for Field Options
// const useFieldOptions = (entityId, notificationTypeList) => {
//   const [fieldOptions, setFieldOptions] = useState([]);

//   const entityData = useMemo(() => {
//     if (!entityId || !notificationTypeList.data?.data) return null;
//     return notificationTypeList.data.data.find(entity => entity._id === entityId);
//   }, [entityId, notificationTypeList.data?.data]);

//   useEffect(() => {
//     if (entityData?.attributes) {
//       const newFieldOptions = entityData.attributes.map((attr) => ({
//         value: attr.mappingName,
//         label: attr.name,
//         type: attr.type,
//         attributeId: attr._id,
//       }));
//       setFieldOptions(newFieldOptions);
//     } else {
//       setFieldOptions([]);
//     }
//   }, [entityData]);

//   return fieldOptions;
// };

// // Reusable Material-UI Select Component
// const MUISelect = React.memo(({
//   label,
//   value,
//   onChange,
//   options = [],
//   multiple = false,
//   error = false,
//   helperText = "",
//   disabled = false,
//   loading = false,
//   sx = {},
//   ...props
// }) => {
//   const id = useMemo(() => `select-${Math.random().toString(36).substr(2, 9)}`, []);

//   return (
//     <TextField
//       select
//       label={label}
//       value={value}
//       onChange={onChange}
//       error={error}
//       helperText={helperText}
//       disabled={disabled || loading}
//       fullWidth
//       size="small"
//       SelectProps={{
//         multiple,
//         displayEmpty: true,
//         renderValue: multiple
//           ? (selected) => {
//               if (!selected || selected.length === 0) return <em>Select...</em>;
//               return (
//                 <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
//                   {selected.split(",").map((value) => (
//                     <Chip key={value} label={value} size="small" />
//                   ))}
//                 </Box>
//               );
//             }
//           : undefined,
//         ...props.SelectProps,
//       }}
//       sx={{ ...sx }}
//       {...props}
//     >
//       {loading ? (
//         <MenuItem disabled>Loading...</MenuItem>
//       ) : (
//         options.map((option) => (
//           <MenuItem key={option.value} value={option.value}>
//             {option.label}
//           </MenuItem>
//         ))
//       )}
//     </TextField>
//   );
// });

// // Date Input with Time Unit Component
// const DateTimeInput = React.memo(({
//   dateValue,
//   timeUnit,
//   onDateChange,
//   onTimeUnitChange,
//   error = false,
//   helperText = "",
// }) => {
//   const timeUnitOptions = [
//     { value: "M", label: "Month (M)" },
//     { value: "d", label: "Days (d)" },
//     { value: "y", label: "Yearly (y)" },
//   ];

//   return (
//     <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
//       <TextField
//         type="date"
//         label="Select Date"
//         value={dateValue}
//         onChange={(e) => onDateChange(e.target.value)}
//         error={error}
//         helperText={helperText}
//         fullWidth
//         size="small"
//         InputLabelProps={{ shrink: true }}
//       />
//       <MUISelect
//         label="Time Unit"
//         value={timeUnit}
//         onChange={(e) => onTimeUnitChange(e.target.value)}
//         options={timeUnitOptions}
//         sx={{ minWidth: 150 }}
//       />
//     </Box>
//   );
// });

// // Boolean Select Component
// const BooleanSelect = React.memo(({ value, onChange, error = false, helperText = "" }) => {
//   const options = [
//     { value: "", label: "Select..." },
//     { value: "true", label: "True" },
//     { value: "false", label: "False" },
//   ];

//   return (
//     <MUISelect
//       label="Select Value"
//       value={value}
//       onChange={(e) => onChange(e.target.value === "true")}
//       options={options}
//       error={error}
//       helperText={helperText}
//     />
//   );
// });

// // Multi Select Component for Status, Case Type, Country Code
// const MultiSelectField = React.memo(({
//   field,
//   operator,
//   value,
//   onChange,
//   error = false,
//   helperText = "",
// }) => {
//   const getOptions = (fieldName) => {
//     switch (fieldName) {
//       case "status":
//         return [
//           "open", "rated to search", "rated to draft ih", "rated to draft oc",
//           "review rate to draft", "filing requested", "submitted"
//         ].map(opt => ({ value: opt, label: opt }));
//       case "case_type":
//         return ["PRI", "PRO", "TRA", "DES"].map(opt => ({ value: opt, label: opt }));
//       case "country_code":
//         return ["EP", "IN", "WO", "FAM", "US", "CN", "JP"].map(opt => ({ value: opt, label: opt }));
//       default:
//         return [];
//     }
//   };

//   const options = getOptions(field);
//   const isMultiple = operator === "in";

//   return (
//     <MUISelect
//       label="Select Value"
//       value={value}
//       onChange={(e) => {
//         const newValue = isMultiple ? e.target.value.join(",") : e.target.value;
//         onChange(newValue);
//       }}
//       options={options}
//       multiple={isMultiple}
//       error={error}
//       helperText={helperText}
//       SelectProps={{
//         value: isMultiple ? (value ? value.split(",") : []) : value,
//       }}
//     />
//   );
// });

// // Main Value Input Component
// const ValueInput = React.memo(({ rule, onValueChange, onTimeUnitChange, fieldOptions, operatorList }) => {
//   const field = fieldOptions.find((f) => f.value === rule.field);
//   const operators = operatorList.data?.data?.find((op) => op.fieldType === field?.type)?.operators || [];
//   const selectedOperator = operators?.find((op) => op.operatorKey === rule.operator);
//   const valueRequired = selectedOperator?.valueRequired ?? true;
//   const hasError = valueRequired && !rule.value;

//   if (!field || !valueRequired) {
//     return null;
//   }

//   const commonProps = {
//     error: hasError,
//     helperText: hasError ? "Value is required" : "",
//   };

//   switch (field.type) {
//     case "boolean":
//       return (
//         <BooleanSelect
//           value={rule.value}
//           onChange={onValueChange}
//           {...commonProps}
//         />
//       );
//     case "select":
//       if (["status", "case_type", "country_code"].includes(rule.field)) {
//         return (
//           <MultiSelectField
//             field={rule.field}
//             operator={rule.operator}
//             value={rule.value}
//             onChange={onValueChange}
//             {...commonProps}
//           />
//         );
//       }
//     case "date":
//       return (
//         <DateTimeInput
//           dateValue={rule.value}
//           timeUnit={rule.timeUnit}
//           onDateChange={onValueChange}
//           onTimeUnitChange={onTimeUnitChange}
//           {...commonProps}
//         />
//       );
//     default:
//       return (
//         <TextField
//           label="Enter Value"
//           value={rule.value}
//           onChange={(e) => onValueChange(e.target.value)}
//           fullWidth
//           size="small"
//           {...commonProps}
//         />
//       );
//   }
// });

// // Rule Component
// const RuleComponent = React.memo(({
//   rule,
//   groupPath,
//   index,
//   fieldOptions,
//   operatorList,
//   updateRule,
//   removeItem,
// }) => {
//   const selectedField = fieldOptions.find((f) => f.value === rule.field);
//   const operators = operatorList.data?.data?.find((op) => op.fieldType === selectedField?.type)?.operators || [];
//   const operatorOptions = operators.map(op => ({ value: op.operatorKey, label: op.operatorName }));

//   const handleFieldChange = useCallback((e) => {
//     updateRule(groupPath, index, "field", e.target.value);
//     updateRule(groupPath, index, "operator", "");
//     updateRule(groupPath, index, "value", "");
//     updateRule(groupPath, index, "timeUnit", "");
//   }, [updateRule, groupPath, index]);

//   const handleOperatorChange = useCallback((e) => {
//     updateRule(groupPath, index, "operator", e.target.value);
//     const selectedOp = operators.find(op => op.operatorKey === e.target.value);
//     if (selectedOp && !selectedOp.valueRequired) {
//       updateRule(groupPath, index, "value", "");
//       updateRule(groupPath, index, "timeUnit", "");
//     }
//   }, [updateRule, groupPath, index, operators]);

//   const fieldOptions_formatted = fieldOptions.map(opt => ({ value: opt.value, label: opt.label }));

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         alignItems: "flex-start",
//         gap: 2,
//         p: 2,
//         bgcolor: "grey.100",
//         borderRadius: 2,
//         transition: "background-color 0.2s ease",
//         "&:hover": { bgcolor: "grey.200" },
//       }}
//     >
//       <MUISelect
//         label="Select Field"
//         value={rule.field}
//         onChange={handleFieldChange}
//         options={[{ value: "", label: "Select field..." }, ...fieldOptions_formatted]}
//         sx={{ minWidth: 200 }}
//       />
//       <MUISelect
//         label="Select Operator"
//         value={rule.operator}
//         onChange={handleOperatorChange}
//         options={[{ value: "", label: "Select operator..." }, ...operatorOptions]}
//         disabled={!rule.field}
//         loading={operatorList.isLoading}
//         sx={{ minWidth: 180 }}
//       />
//       <Box sx={{ minWidth: 200, flexGrow: 1 }}>
//         <ValueInput
//           rule={rule}
//           onValueChange={(value) => updateRule(groupPath, index, "value", value)}
//           onTimeUnitChange={(timeUnit) => updateRule(groupPath, index, "timeUnit", timeUnit)}
//           fieldOptions={fieldOptions}
//           operatorList={operatorList}
//         />
//       </Box>
//       <IconButton
//         onClick={() => removeItem(groupPath, index)}
//         color="error"
//         aria-label="Remove rule"
//         sx={{ mt: 1 }}
//       >
//         <CloseIcon />
//       </IconButton>
//     </Box>
//   );
// });

// // Group Component
// const GroupComponent = React.memo(({
//   group,
//   groupPath = [],
//   isRoot = false,
//   fieldOptions,
//   operatorList,
//   addRule,
//   addGroup,
//   removeItem,
//   updateRule,
//   updateGroupLogic,
// }) => {
//   const [collapsed, setCollapsed] = useState(false);
//   const logicOptions = [
//     { value: "AND", label: "AND" },
//     { value: "OR", label: "OR" },
//   ];

//   return (
//     <Box
//       sx={{
//         border: isRoot ? "2px solid" : "1px solid",
//         borderColor: isRoot ? "primary.light" : "grey.300",
//         borderRadius: 2,
//         p: 3,
//         bgcolor: isRoot ? "background.paper" : "inherit",
//         boxShadow: isRoot ? 3 : 1,
//         transition: "all 0.3s ease-in-out",
//         "&:hover": { boxShadow: 4 },
//       }}
//     >
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           mb: 3,
//         }}
//       >
//         <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//           {!isRoot && (
//             <IconButton
//               onClick={() => setCollapsed(!collapsed)}
//               sx={{
//                 bgcolor: "grey.100",
//                 "&:hover": { bgcolor: "grey.200" },
//                 transition: "background-color 0.2s ease",
//               }}
//               aria-label="Toggle group collapse"
//             >
//               {collapsed ? <ChevronRightIcon /> : <ExpandMoreIcon />}
//             </IconButton>
//           )}
//           <Typography
//             variant="subtitle2"
//             sx={{
//               fontWeight: "medium",
//               color: "text.secondary",
//               fontSize: "0.9rem",
//             }}
//           >
//             {isRoot ? "Root Condition Group" : "Nested Group"}
//           </Typography>
//           <MUISelect
//             label="Logic"
//             value={group.logic}
//             onChange={(e) => updateGroupLogic(groupPath, e.target.value)}
//             options={logicOptions}
//             sx={{ minWidth: 100, fontSize: "0.85rem" }}
//           />
//         </Box>
//         <Box sx={{ display: "flex", gap: 1 }}>
//           <Button
//             variant="contained"
//             color="primary"
//             size="small"
//             onClick={() => addRule(groupPath)}
//             startIcon={<AddIcon />}
//             sx={{
//               fontSize: "0.85rem",
//               borderRadius: 1,
//               px: 2,
//               py: 0.5,
//               transition: "all 0.2s ease",
//               "&:hover": { transform: "scale(1.05)" },
//             }}
//           >
//             Rule
//           </Button>
//           <Button
//             variant="contained"
//             color="success"
//             size="small"
//             onClick={() => addGroup(groupPath)}
//             startIcon={<AddIcon />}
//             sx={{
//               fontSize: "0.85rem",
//               borderRadius: 1,
//               px: 2,
//               py: 0.5,
//               transition: "all 0.2s ease",
//               "&:hover": { transform: "scale(1.05)" },
//             }}
//           >
//             Group
//           </Button>
//           {!isRoot && (
//             <IconButton
//               onClick={() => {
//                 const parentPath = groupPath.slice(0, -1);
//                 const index = groupPath[groupPath.length - 1];
//                 removeItem(parentPath, index);
//               }}
//               color="error"
//               aria-label="Remove group"
//             >
//               <CloseIcon />
//             </IconButton>
//           )}
//         </Box>
//       </Box>
//       {!collapsed && (
//         <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//           {group.rules.map((rule, index) => (
//             <Box key={rule.id || index}>
//               {index > 0 && (
//                 <Box sx={{ py: 1, textAlign: "center" }}>
//                   <Chip
//                     label={group.logic}
//                     size="small"
//                     sx={{
//                       fontSize: "0.75rem",
//                       fontWeight: "medium",
//                       bgcolor: "primary.light",
//                       color: "primary.contrastText",
//                     }}
//                   />
//                 </Box>
//               )}
//               {rule.logic ? (
//                 <GroupComponent
//                   group={rule}
//                   groupPath={[...groupPath, index]}
//                   fieldOptions={fieldOptions}
//                   operatorList={operatorList}
//                   addRule={addRule}
//                   addGroup={addGroup}
//                   removeItem={removeItem}
//                   updateRule={updateRule}
//                   updateGroupLogic={updateGroupLogic}
//                 />
//               ) : (
//                 <RuleComponent
//                   rule={rule}
//                   groupPath={groupPath}
//                   index={index}
//                   fieldOptions={fieldOptions}
//                   operatorList={operatorList}
//                   updateRule={updateRule}
//                   removeItem={removeItem}
//                 />
//               )}
//             </Box>
//           ))}
//         </Box>
//       )}
//     </Box>
//   );
// });

// // Main Form Header Component
// const NotificationFormHeader = React.memo(({ notification, setNotification, notificationTypeList }) => {
//   const entityOptions = useMemo(() => {
//     if (!notificationTypeList.data?.data) return [];
//     return notificationTypeList.data.data.map(entity => ({
//       value: entity._id,
//       label: entity.name,
//     }));
//   }, [notificationTypeList.data?.data]);

//   const handleNameChange = useCallback((e) => {
//     setNotification((prev) => ({ ...prev, name: e.target.value }));
//   }, [setNotification]);

//   const handleEntityChange = useCallback((e) => {
//     setNotification((prev) => ({ ...prev, entityId: e.target.value }));
//   }, [setNotification]);

//   return (
//     <Box sx={{ mb: 4, p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
//       <Grid container spacing={3}>
//         <Grid item xs={12} sm={6}>
//           <TextField
//             label="Notification Name"
//             value={notification.name}
//             onChange={handleNameChange}
//             fullWidth
//             size="small"
//             required
//             error={!notification.name}
//             helperText={!notification.name ? "Name is required" : ""}
//           />
//         </Grid>
//         <Grid item xs={12} sm={6}>
//           <MUISelect
//             label="Select Entity"
//             value={notification.entityId}
//             onChange={handleEntityChange}
//             options={[{ value: "", label: "Select Entity..." }, ...entityOptions]}
//             error={!notification.entityId}
//             helperText={!notification.entityId ? "Entity is required" : ""}
//           />
//         </Grid>
//       </Grid>
//     </Box>
//   );
// });

// // ConditionRuleBuilder Component
// const ConditionRuleBuilder = React.memo(({
//   onChange,
//   notificationTypeList,
//   fieldOptions,
//   initialConditionGroup,
//   initialNotificationData,
// }) => {
//   const organizationId = useSelector(
//     (state: RootState) => state.userPermission?.currentUser?.organizationId?._id
//   );

//   const [notification, setNotification] = useState({
//     name: initialNotificationData?.name || "",
//     entityId: initialNotificationData?.entityId || "",
//     conditionGroup: initialConditionGroup || { logic: "AND", rules: [] },
//   });

//   const operatorList = usePost(["operatorList"]);

//   useEffect(() => {
//     operatorList.mutate({
//       url: POST.OPERATOR_LIST,
//       payload: { fieldType: "all" },
//     });
//   }, []);

//   useEffect(() => {
//     if (initialNotificationData && initialNotificationData !== notification) {
//       setNotification((prev) => ({
//         ...prev,
//         name: initialNotificationData.name || prev.name,
//         entityId: initialNotificationData.entityId || prev.entityId,
//       }));
//     }
//   }, [initialNotificationData]);

//   useEffect(() => {
//     if (initialConditionGroup && initialConditionGroup !== notification.conditionGroup) {
//       setNotification((prev) => ({
//         ...prev,
//         conditionGroup: initialConditionGroup,
//       }));
//     }
//   }, [initialConditionGroup]);

//   const transformAndEmitData = useCallback(() => {
//     const conditionGroups = [];

//     const flattenGroup = (group) => {
//       const conditions = [];
//       group.rules.forEach((rule) => {
//         if (rule.logic) {
//           conditionGroups.push({
//             group_operator: rule.logic,
//             conditions: [],
//           });
//           flattenGroup(rule);
//         } else {
//           const fieldOption = fieldOptions.find((f) => f.value === rule.field);
//           if (fieldOption && rule.operator && rule.field) {
//             conditions.push({
//               attributeId: fieldOption.attributeId,
//               operator: rule.operator,
//               value: rule.value || "",
//               timeUnit: rule.timeUnit || "",
//             });
//           }
//         }
//       });
//       if (conditions.length > 0) {
//         conditionGroups.push({
//           group_operator: group.logic,
//           conditions,
//         });
//       }
//     };

//     flattenGroup(notification.conditionGroup);

//     const transformedData = {
//       name: notification.name,
//       organizationId: organizationId,
//       entityId: notification.entityId,
//       triggerFieldId: "",
//       isActive: true,
//       conditionGroups,
//     };

//     onChange(transformedData);
//   }, [notification.name, notification.entityId, notification.conditionGroup, fieldOptions, organizationId, onChange]);

//   const debouncedEmit = useCallback(
//     debounce(() => {
//       transformAndEmitData();
//     }, 300),
//     [transformAndEmitData]
//   );

//   useEffect(() => {
//     debouncedEmit();
//     return () => {
//       debouncedEmit.cancel();
//     };
//   }, [notification, debouncedEmit]);

//   const generateId = () => Math.random().toString(36).substr(2, 9);

//   const getGroupByPath = (root, path) => {
//     if (path.length === 0) return root;
//     let current = root;
//     for (const index of path) {
//       current = current.rules[index];
//     }
//     return current;
//   };

//   const addRule = useCallback((groupPath) => {
//     setNotification((prev) => {
//       const updated = JSON.parse(JSON.stringify(prev));
//       const group = getGroupByPath(updated.conditionGroup, groupPath);
//       group.rules.push({
//         id: generateId(),
//         field: "",
//         operator: "",
//         value: "",
//         timeUnit: "",
//       });
//       return updated;
//     });
//   }, []);

//   const addGroup = useCallback((groupPath) => {
//     setNotification((prev) => {
//       const updated = JSON.parse(JSON.stringify(prev));
//       const group = getGroupByPath(updated.conditionGroup, groupPath);
//       group.rules.push({
//         id: generateId(),
//         logic: "AND",
//         rules: [],
//       });
//       return updated;
//     });
//   }, []);

//   const removeItem = useCallback((groupPath, index) => {
//     setNotification((prev) => {
//       const updated = JSON.parse(JSON.stringify(prev));
//       const group = getGroupByPath(updated.conditionGroup, groupPath);
//       group.rules.splice(index, 1);
//       return updated;
//     });
//   }, []);

//   const updateRule = useCallback((groupPath, index, field, value) => {
//     setNotification((prev) => {
//       const updated = JSON.parse(JSON.stringify(prev));
//       const group = getGroupByPath(updated.conditionGroup, groupPath);
//       group.rules[index][field] = value;
//       return updated;
//     });
//   }, []);

//   const updateGroupLogic = useCallback((groupPath, logic) => {
//     setNotification((prev) => {
//       const updated = JSON.parse(JSON.stringify(prev));
//       const group = getGroupByPath(updated.conditionGroup, groupPath);
//       group.logic = logic;
//       return updated;
//     });
//   }, []);

//   return (
//     <Box sx={{ maxWidth: "1200px", mx: "auto", p: 4, bgcolor: "background.paper", borderRadius: 2 }}>
//       <NotificationFormHeader
//         notification={notification}
//         setNotification={setNotification}
//         notificationTypeList={notificationTypeList}
//       />
//       <GroupComponent
//         group={notification.conditionGroup}
//         isRoot={true}
//         fieldOptions={fieldOptions}
//         operatorList={operatorList}
//         addRule={addRule}
//         addGroup={addGroup}
//         removeItem={removeItem}
//         updateRule={updateRule}
//         updateGroupLogic={updateGroupLogic}
//       />
//     </Box>
//   );
// });

// // Main EditNotificationTypes Component
// export default function EditNotificationTypes() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const [expanded, setExpanded] = useState({ condition: true, reminder: true });
//   const [notificationData, setNotificationData] = useState({});
//   const [notificationTypeId, setNotificationTypeId] = useState<string | null>(id || null);
//   const [initialConditionGroup, setInitialConditionGroup] = useState(null);
//   const [isDataLoaded, setIsDataLoaded] = useState(false);

//   const notificationTypeList = useGet(
//     ["notificationTypeList"],
//     `${GET.Entity_List}`,
//     true,
//     {
//       staleTime: 5 * 60 * 1000,
//       cacheTime: 10 * 60 * 1000,
//     }
//   );

//   const notificationDetails = useGet(
//     ["notificationDetails", id],
//     id ? `/notivix/notification-setting/type/${id}` : null,
//     !!id,
//     {
//       staleTime: 0,
//       cacheTime: 0,
//       refetchOnMount: "always",
//     }
//   );

//   const updateNotification = usePut(["updateNotification"]);

//   const fieldOptions = useFieldOptions(notificationData.entityId, notificationTypeList);

//   const transformBackendToConditionGroup = useCallback((conditionGroups, availableFieldOptions) => {
//     if (!conditionGroups || conditionGroups.length === 0) {
//       return { logic: "AND", rules: [] };
//     }

//     // Create a root group that will hold all backend groups as nested groups
//     const rootGroup = {
//       logic: "AND", // Root group defaults to AND, combining all sub-groups
//       rules: [],
//     };

//     // Map each backend group to a UI group
//     conditionGroups.forEach((group, groupIndex) => {
//       const uiGroup = {
//         id: Math.random().toString(36).substr(2, 9),
//         logic: group.group_operator || "AND",
//         rules: [],
//       };

//       // Map conditions to rules
//       group.conditions.forEach((condition) => {
//         const fieldOption = availableFieldOptions.find(
//           (f) => f.attributeId === condition.attributeId
//         );
//         if (fieldOption) {
//           uiGroup.rules.push({
//             id: Math.random().toString(36).substr(2, 9),
//             field: fieldOption.value,
//             operator: condition.operator,
//             value: condition.value,
//             timeUnit: condition.timeUnit || "",
//           });
//         }
//       });

//       // Only add the group if it has rules or is explicitly needed
//       if (uiGroup.rules.length > 0 || group.conditions.length === 0) {
//         rootGroup.rules.push(uiGroup);
//       }
//     });

//     return rootGroup;
//   }, []);

//   useEffect(() => {
//     if (
//       notificationDetails.data?.success &&
//       notificationDetails.data?.data &&
//       !isDataLoaded
//     ) {
//       const data = notificationDetails.data.data;
//       const newNotificationData = {
//         name: data.name || "",
//         organizationId: data.organizationId || "",
//         entityId: data.entityId || "",
//         triggerFieldId: "",
//         isActive: data.isActive || true,
//         conditionGroups: data.conditionGroups || [],
//       };

//       setNotificationData(newNotificationData);
//       setIsDataLoaded(true);
//     }
//   }, [notificationDetails.data, isDataLoaded]);

//   useEffect(() => {
//     if (
//       isDataLoaded &&
//       fieldOptions.length > 0 &&
//       notificationData.conditionGroups &&
//       notificationData.conditionGroups.length > 0 &&
//       !initialConditionGroup
//     ) {
//       const transformedGroup = transformBackendToConditionGroup(
//         notificationData.conditionGroups,
//         fieldOptions
//       );
//       setInitialConditionGroup(transformedGroup);
//     }
//   }, [isDataLoaded, fieldOptions, notificationData.conditionGroups, initialConditionGroup, transformBackendToConditionGroup]);

//   useEffect(() => {
//     if (id) {
//       queryClient.invalidateQueries(["notificationDetails", id]);
//       setIsDataLoaded(false);
//       setNotificationData({});
//       setInitialConditionGroup(null);
//       setNotificationTypeId(id);
//     }
//   }, [id, queryClient]);

//   const handleSubmit = useCallback(async (event) => {
//     event.preventDefault();
//     if (!notificationData.name || !notificationData.entityId) {
//       toast.error("Name and Entity are required fields.");
//       return;
//     }

//     try {
//       const response = await updateNotification.mutateAsync({
//         url: `/notivix/notification-setting/type/update/${id}`,
//         payload: notificationData,
//       });

//       if (response.success) {
//         toast.success("Notification updated successfully!");
//         queryClient.invalidateQueries(["notificationDetails", id]);
//         navigate("/notivix/notification-types");
//       } else {
//         throw new Error("Notification update failed");
//       }
//     } catch (error) {
//       console.error("Error updating notification:", error);
//       toast.error("Failed to update notification. Please try again.");
//     }
//   }, [notificationData, id, navigate, updateNotification, queryClient]);

//   if (notificationDetails.isLoading || !isDataLoaded) {
//     return (
//       <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
//         <CircularProgress />
//         <Typography sx={{ ml: 2 }}>Loading notification details...</Typography>
//       </Box>
//     );
//   }

//   if (notificationDetails.isError) {
//     return (
//       <Box sx={{ textAlign: "center", py: 4 }}>
//         <Typography color="error" variant="h6">
//           Failed to load notification type details. Please try again.
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box
//       sx={{
//         flexGrow: 1,
//         p: 3,
//         ml: { xs: 0 },
//         backgroundColor: STYLE_GUIDE.COLORS.backgroundLight,
//         minHeight: "100vh",
//       }}
//     >
//       <Typography
//         variant="h4"
//         sx={{
//           mb: 3,
//           fontWeight: 400,
//           color: STYLE_GUIDE.COLORS.primaryDark,
//         }}
//       >
//         Edit Notification Type
//       </Typography>
//       <Card
//         sx={{
//           backgroundColor: STYLE_GUIDE.COLORS.white,
//           borderRadius: 2,
//           boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
//         }}
//       >
//         <CardContent sx={{ p: 3 }}>
//           <Box component="form" onSubmit={handleSubmit}>
//             <Accordion
//               expanded={expanded.condition}
//               onChange={(event, isExpanded) => setExpanded((prev) => ({ ...prev, condition: isExpanded }))}
//               sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}
//             >
//               <AccordionSummary
//                 expandIcon={<ExpandMoreIcon />}
//                 aria-controls="condition-content"
//                 id="condition-header"
//                 sx={{ bgcolor: "grey.50", borderRadius: 2 }}
//               >
//                 <Typography
//                   variant="h6"
//                   sx={{ fontWeight: "bold", color: "text.primary" }}
//                 >
//                   Condition Rule Builder
//                 </Typography>
//               </AccordionSummary>
//               <AccordionDetails>
//                 <ErrorBoundary>
//                   {isDataLoaded && fieldOptions.length > 0 ? (
//                     <ConditionRuleBuilder
//                       onChange={setNotificationData}
//                       notificationTypeList={notificationTypeList}
//                       fieldOptions={fieldOptions}
//                       initialConditionGroup={initialConditionGroup}
//                       initialNotificationData={notificationData}
//                     />
//                   ) : (
//                     <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
//                       <CircularProgress />
//                       <Typography sx={{ ml: 2 }}>Loading form data...</Typography>
//                     </Box>
//                   )}
//                 </ErrorBoundary>
//                 <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
//                   <Button
//                     variant="outlined"
//                     color="secondary"
//                     onClick={() => navigate("/notivix/notification-types")}
//                     sx={{ px: 4, borderRadius: 1 }}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     type="submit"
//                     variant="contained"
//                     color="primary"
//                     size="large"
//                     sx={{ px: 4, borderRadius: 1 }}
//                     disabled={updateNotification.isLoading || !isDataLoaded}
//                   >
//                     {updateNotification.isLoading ? "Updating..." : "Update"}
//                   </Button>
//                 </Box>
//               </AccordionDetails>
//             </Accordion>
//             <Accordion
//               expanded={expanded.reminder && notificationTypeId !== null}
//               onChange={(event, isExpanded) => setExpanded((prev) => ({ ...prev, reminder: isExpanded }))}
//               sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}
//               disabled={notificationTypeId === null}
//             >
//               <AccordionSummary
//                 expandIcon={<ExpandMoreIcon />}
//                 aria-controls="reminder-content"
//                 id="reminder-header"
//                 sx={{ bgcolor: "grey.50", borderRadius: 2 }}
//               >
//                 <Typography
//                   variant="h6"
//                   sx={{ fontWeight: "bold", color: "text.primary" }}
//                 >
//                   Reminder Task
//                 </Typography>
//               </AccordionSummary>
//               <AccordionDetails>
//                 <ErrorBoundary>
//                   <Frequency
//                     fieldOptions={fieldOptions}
//                     notificationTypeId={notificationTypeId}
//                   />
//                 </ErrorBoundary>
//               </AccordionDetails>
//             </Accordion>
//           </Box>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// }
