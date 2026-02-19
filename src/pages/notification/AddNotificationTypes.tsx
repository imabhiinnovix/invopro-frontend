import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import useGet from "../../hooks/useGet";
import usePost from "../../hooks/usePost";
import { GET, POST } from "../../services/apiRoutes";

import { useSelector } from "react-redux";
import Frequency from "./Frequency";

import ConditionPreview from "./ConditionPreview";
import { RootState } from "../../store";
import { PermissionsMap } from "../../utils/constants";
import { checkPermission } from "../../utils/utils";
import { PageHeader, PageCardLayout, StyledButton } from "../../components/common";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h6" color="error">
            Something went wrong. Please try refreshing the page.
          </Typography>
        </Box>
      );
    }
    return this.props.children;
  }
}

const FocusAwareInput = React.memo(
  ({ value, onChange, error, placeholder, type = "text", ...props }) => {
    const inputRef = useRef(null);
    const [localValue, setLocalValue] = useState(value);
    const isFocused = useRef(false);

    useEffect(() => {
      if (!isFocused.current) {
        setLocalValue(value);
      }
    }, [value]);

    const handleFocus = useCallback(() => {
      isFocused.current = true;
    }, []);

    const handleBlur = useCallback(() => {
      isFocused.current = false;
      onChange(localValue);
    }, [localValue, onChange]);

    const handleChange = useCallback((e) => {
      setLocalValue(e.target.value);
    }, []);

    const handleKeyDown = useCallback((e) => {
      if (e.key === "Enter") {
        e.preventDefault();
      }
    }, []);

    return (
      <TextField
        {...props}
        inputRef={inputRef}
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        type={type}
        variant="outlined"
        error={error}
      />
    );
  }
);

const ConditionRuleBuilder = ({
  onChange,
  notificationTypeList,
  fieldOptions,
  setFieldOptions,
  notificationResponse,
}) => {
  const organizationId = useSelector(
    (state) => state.userPermission?.currentUser?.organizationId?._id
  );
  const [notification, setNotification] = useState({
    name: "",
    entityId: "",
    conditionGroup: {
      logic: "AND",
      rules: [],
    },
  });
  const { list } = useSelector((state) => state.dataSource);
  const operatorList = usePost(["operatorList"]);

  const notificationRef = useRef(notification);
  const fieldOptionsRef = useRef(fieldOptions);
  const operatorListRef = useRef(operatorList);
  const activeInputRef = useRef(null);

  // Check if datasource is selected
  const isDataSourceSelected = Boolean(notification.entityId);

  useEffect(() => {
    notificationRef.current = notification;
  }, [notification]);

  useEffect(() => {
    fieldOptionsRef.current = fieldOptions;
  }, [fieldOptions]);

  useEffect(() => {
    operatorListRef.current = operatorList;
  }, [operatorList]);

  useEffect(() => {
    operatorList.mutate({
      url: POST.OPERATOR_LIST,
      payload: { fieldType: "all" },
    });
  }, []);

  useEffect(() => {
    if (notification.entityId && list) {
      const selectedEntity = list.find(
        (item) => item._id === notification.entityId
      );

      if (selectedEntity?.fieldSettings) {
        const newFieldOptions = selectedEntity.fieldSettings.map((setting) => ({
          label: setting.label,
          value: setting.mappedAttributeName,
          attributeId: setting.attributeId,
          type: setting?.type,
          refAttributeId: setting?.refAttributeId,
        }));
        setFieldOptions(newFieldOptions);
      } else {
        setFieldOptions([]);
      }
    } else {
      setFieldOptions([]);
    }
  }, [notification.entityId, list, setFieldOptions]);

  const statusOptions = [
    "open",
    "rated to search",
    "rated to draft ih",
    "rated to draft oc",
    "review rate to draft",
    "filing requested",
    "submitted",
  ];
  const caseTypeOptions = ["PRI", "PRO", "TRA", "DES"];
  const countryCodeOptions = ["EP", "IN", "WO", "FAM", "US", "CN", "JP"];
  const timeUnitOptions = [
    { value: "M", label: "Month" },
    { value: "d", label: "Days" },
    { value: "y", label: "Yearly" },
  ];

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const getGroupByPath = useCallback((root, path) => {
    if (path.length === 0) return root;
    let current = root;
    for (const index of path) {
      if (!current.rules) return null;
      current = current.rules[index];
    }
    return current;
  }, []);

  const addRule = useCallback(
    (groupPath) => {
      if (!isDataSourceSelected) return;

      const newRule = {
        id: generateId(),
        field: "",
        operator: "",
        value: "",
        timeUnit: "",
      };

      setNotification((prev) => {
        const updatedNotification = JSON.parse(JSON.stringify(prev));
        const group = getGroupByPath(
          updatedNotification.conditionGroup,
          groupPath
        );
        if (group) {
          group.rules.push(newRule);
        }
        return updatedNotification;
      });
    },
    [getGroupByPath, isDataSourceSelected]
  );

  const addGroup = useCallback(
    (groupPath) => {
      if (!isDataSourceSelected) return;

      const newGroup = {
        id: generateId(),
        logic: "AND",
        rules: [],
      };

      setNotification((prev) => {
        const updatedNotification = JSON.parse(JSON.stringify(prev));
        const group = getGroupByPath(
          updatedNotification.conditionGroup,
          groupPath
        );
        if (group) {
          group.rules.push(newGroup);
        }
        return updatedNotification;
      });
    },
    [getGroupByPath, isDataSourceSelected]
  );

  const removeItem = useCallback(
    (groupPath, index) => {
      setNotification((prev) => {
        const updatedNotification = JSON.parse(JSON.stringify(prev));
        const group = getGroupByPath(
          updatedNotification.conditionGroup,
          groupPath
        );
        if (group && group.rules) {
          group.rules.splice(index, 1);
        }
        return updatedNotification;
      });
    },
    [getGroupByPath]
  );

  const updateRule = useCallback(
    (groupPath, index, field, value) => {
      setNotification((prev) => {
        const updatedNotification = JSON.parse(JSON.stringify(prev));
        const group = getGroupByPath(
          updatedNotification.conditionGroup,
          groupPath
        );

        if (group && group.rules && group.rules[index]) {
          group.rules[index][field] = value;

          if (field === "operator") {
            const selectedField = fieldOptionsRef.current.find(
              (f) => f.value === group.rules[index].field
            );
            const operators = operatorListRef.current.data?.data?.find(
              (op) => op.fieldType === selectedField?.type
            )?.operators;
            const selectedOperator = operators?.find(
              (op) => op.operatorKey === value
            );
            if (selectedOperator && !selectedOperator.valueRequired) {
              group.rules[index].value = "";
              group.rules[index].timeUnit = "";
            }
          }
        }

        return updatedNotification;
      });
    },
    [getGroupByPath]
  );

  const updateGroupLogic = useCallback(
    (groupPath, logic) => {
      setNotification((prev) => {
        const updatedNotification = JSON.parse(JSON.stringify(prev));
        const group = getGroupByPath(
          updatedNotification.conditionGroup,
          groupPath
        );
        if (group) {
          group.logic = logic;
        }
        return updatedNotification;
      });
    },
    [getGroupByPath]
  );

  const validateValue = useCallback((rule) => {
    if (!rule.field || !rule.operator) return false;
    const field = fieldOptionsRef.current.find((f) => f.value === rule.field);
    const operators =
      operatorListRef.current.data?.data?.find(
        (op) => op.fieldType === field?.type
      )?.operators || [];
    const selectedOperator = operators?.find(
      (op) => op.operatorKey === rule.operator
    );
    return selectedOperator?.valueRequired && !rule.value;
  }, []);

  const renderValueInput = useCallback(
    (rule, groupPath, index) => {
      const field = fieldOptionsRef.current.find((f) => f.value === rule.field);
      if (!field) return null;
      const operators =
        operatorListRef.current.data?.data?.find(
          (op) => op.fieldType === field?.type
        )?.operators || [];
      const selectedOperator = operators?.find(
        (op) => op.operatorKey === rule.operator
      );
      const valueRequired = selectedOperator?.valueRequired ?? true;

      if (!valueRequired) return null;
      const updateValue = (value) =>
        updateRule(groupPath, index, "value", value);
      const updateTimeUnit = (value) =>
        updateRule(groupPath, index, "timeUnit", value);
      const hasError = validateValue(rule);

      switch (field.type) {
        case "boolean":
          return (
            <FormControl fullWidth size="small" error={hasError}>
              <InputLabel>Select...</InputLabel>
              <Select
                value={rule.value}
                onChange={(e) => updateValue(e.target.value === "true")}
                label="Select..."
              >
                {/* <MenuItem value="">Select...</MenuItem> */}
                <MenuItem value="true">True</MenuItem>
                <MenuItem value="false">False</MenuItem>
              </Select>
              {hasError && (
                <Typography color="error" variant="caption">
                  Required{" "}
                </Typography>
              )}
            </FormControl>
          );
        case "select":
          return renderSelectField(rule, updateValue, hasError);
        case "date":
        case "date-range":
          return (
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <FormControl fullWidth size="small" error={hasError}>
                <FocusAwareInput
                  fullWidth
                  size="small"
                  type="text"
                  value={rule.value}
                  onChange={updateValue}
                  placeholder="Select date"
                  error={hasError}
                />
                {hasError && (
                  <Typography color="error" variant="caption">
                    Required{" "}
                  </Typography>
                )}
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Time Unit</InputLabel>
                <Select
                  value={rule.timeUnit}
                  onChange={(e) => updateTimeUnit(e.target.value)}
                  label="Time Unit"
                >
                  {/* <MenuItem value="">Select...</MenuItem> */}
                  {timeUnitOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          );
        default:
          return (
            <FormControl fullWidth size="small" error={hasError}>
              <FocusAwareInput
                fullWidth
                size="small"
                value={rule.value}
                onChange={updateValue}
                placeholder="Value"
                error={hasError}
              />
              {hasError && (
                <Typography color="error" variant="caption">
                  Required{" "}
                </Typography>
              )}
            </FormControl>
          );
      }
    },
    [updateRule, validateValue]
  );

  const renderSelectField = useCallback((rule, updateValue, hasError) => {
    const getOptions = () => {
      switch (rule.field) {
        case "status":
          return statusOptions;
        case "case_type":
          return caseTypeOptions;
        case "country_code":
          return countryCodeOptions;
        default:
          return [];
      }
    };
    const options = getOptions();
    const isMultiple = rule.operator === "in";
    return (
      <FormControl fullWidth size="small" error={hasError}>
        <InputLabel>Select...</InputLabel>
        <Select
          multiple={isMultiple}
          value={
            isMultiple ? (rule.value ? rule.value.split(",") : []) : rule.value
          }
          onChange={(e) =>
            updateValue(isMultiple ? e.target.value.join(",") : e.target.value)
          }
          label="Select..."
          sx={isMultiple ? { minHeight: 80 } : {}}
        >
          {/* {!isMultiple && <MenuItem value="">Select...</MenuItem>} */}
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
        {hasError && (
          <Typography color="error" variant="caption">
            Required 4
          </Typography>
        )}
      </FormControl>
    );
  }, []);

  const RuleComponent = React.memo(({ rule, groupPath, index }) => {
    const selectedField = fieldOptionsRef.current.find(
      (f) => f.value === rule.field
    );
    const operators =
      operatorListRef.current.data?.data?.find(
        (op) => op.fieldType === selectedField?.type
      )?.operators || [];

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2,
          bgcolor: "grey.100",
          borderRadius: 2,
        }}
      >
        <FormControl fullWidth size="small">
          <InputLabel>Select field...</InputLabel>
          <Select
            value={rule.field}
            onChange={(e) => {
              updateRule(groupPath, index, "field", e.target.value);
              updateRule(groupPath, index, "operator", "");
              updateRule(groupPath, index, "value", "");
              updateRule(groupPath, index, "timeUnit", "");
            }}
            label="Select field..."
          >
            {/* <MenuItem value="">Select field...</MenuItem> */}
            {fieldOptionsRef.current.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth size="small" disabled={!rule.field}>
          <InputLabel>Select operator...</InputLabel>
          <Select
            value={rule.operator}
            onChange={(e) =>
              updateRule(groupPath, index, "operator", e.target.value)
            }
            label="Select operator..."
          >
            {/* <MenuItem value="">Select operator...</MenuItem> */}
            {operatorListRef.current.isLoading ? (
              <MenuItem disabled>Loading operators...</MenuItem>
            ) : (
              operators.map((op) => (
                <MenuItem key={op._id} value={op.operatorKey}>
                  {op.operatorName}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        {renderValueInput(rule, groupPath, index)}
        <IconButton
          onClick={() => removeItem(groupPath, index)}
          color="error"
          aria-label="Remove rule"
        >
          <CloseIcon />
        </IconButton>
      </Box>
    );
  });

  const GroupComponent = React.memo(
    ({ group, groupPath = [], isRoot = false }) => {
      const [collapsed, setCollapsed] = useState(false);

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
                {isRoot ? "Condition Group" : "Nested Group"}
              </Typography>
              <FormControl size="small">
                <InputLabel>Logic</InputLabel>
                <Select
                  value={group.logic}
                  onChange={(e) => updateGroupLogic(groupPath, e.target.value)}
                  label="Logic"
                  sx={{ fontSize: "0.85rem" }}
                >
                  <MenuItem value="AND">ALL</MenuItem>
                  <MenuItem value="OR">ANY</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <StyledButton
                variant="primary"
                size="small"
                onClick={() => addRule(groupPath)}
                icon={<AddIcon />}
                disabled={!isDataSourceSelected}
              >
                Condition
              </StyledButton>
              <StyledButton
                variant="primary"
                size="small"
                onClick={() => addGroup(groupPath)}
                icon={<AddIcon />}
                disabled={!isDataSourceSelected}
                sx={{
                  backgroundColor: "#2e7d32",
                  "&:hover": { backgroundColor: "#1b5e20" },
                }}
              >
                Group Condition
              </StyledButton>
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
                    <Box sx={{ py: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          pl: 1,
                          fontSize: "0.75rem",
                          color: "text.secondary",
                          fontWeight: "medium",
                          bgcolor: "grey.100",
                          borderRadius: "12px",
                          px: 1.5,
                          py: 0.5,
                          display: "inline-block",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {group.logic === "AND" ? "ALL" : "ANY"}
                      </Typography>
                    </Box>
                  )}
                  {rule.logic ? (
                    <GroupComponent
                      group={rule}
                      groupPath={[...groupPath, index]}
                    />
                  ) : (
                    <RuleComponent
                      rule={rule}
                      groupPath={groupPath}
                      index={index}
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

  useEffect(() => {
    const transformNotificationData = () => {
      const transformGroup = (group) => {
        const result = {
          group_operator: group.logic,
          conditions: [],
        };
        group.rules.forEach((rule) => {
          if (rule.logic) {
            const nestedGroup = transformGroup(rule);
            if (nestedGroup) {
              result.conditions.push(nestedGroup);
            }
          } else {
            const fieldOption = fieldOptionsRef.current.find(
              (f) => f.value === rule.field
            );
            if (fieldOption && rule.field && rule.operator) {
              const condition = {
                attributeId: fieldOption.attributeId,
                operator: rule.operator,
                value: rule.value || "",
                refAttributeId: fieldOption.refAttributeId,
              };
              if (
                (fieldOption.type === "date" ||
                  fieldOption.type === "date-range") &&
                rule.timeUnit
              ) {
                condition.timeUnit = rule.timeUnit;
              }
              result.conditions.push(condition);
            }
          }
        });
        return result.conditions.length > 0 ? result : null;
      };
      const transformGroupSummary = (group) => {
        const result = {
          group_operator: group.logic,
          conditions: [],
        };
        group.rules.forEach((rule) => {
          if (rule.logic) {
            const nestedGroup = transformGroupSummary(rule);
            if (nestedGroup) {
              result.conditions.push(nestedGroup);
            }
          } else {
            const fieldOption = fieldOptionsRef.current.find(
              (f) => f.value === rule.field
            );
            if (fieldOption && rule.field && rule.operator) {
              const condition = {
                attributeId: fieldOption.label,
                operator: rule.operator,
                value: rule.value || "",
                // refAttributeId: fieldOption.refAttributeId,
              };
              if (
                (fieldOption.type === "date" ||
                  fieldOption.type === "date-range") &&
                rule.timeUnit
              ) {
                condition.timeUnit = rule.timeUnit;
              }
              result.conditions.push(condition);
            }
          }
        });
        return result.conditions.length > 0 ? result : null;
      };
      const conditionGroup = transformGroup(
        notificationRef.current.conditionGroup
      );
      const conditionGroupSummary = transformGroupSummary(
        notificationRef.current.conditionGroup
      );
      return {
        name: notificationRef.current.name || "",
        organizationId: organizationId || "",
        dataSourceId: notificationRef.current.entityId || "",
        triggerFieldId: "",
        isActive: true,
        conditionGroups: conditionGroup ? [conditionGroup] : [],
        conditionSummaryGroups: conditionGroupSummary
          ? [conditionGroupSummary]
          : [],
      };
    };
    const transformedData = transformNotificationData();
    onChange(transformedData);
  }, [notification, onChange, organizationId]);

  return (
    <>
      <Box
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          p: 4,
          bgcolor: "background.paper",
          borderRadius: 2,
        }}
      >
        <Box sx={{ mb: 4, p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Name"
                value={notification.name}
                onChange={(e) =>
                  setNotification({ ...notification, name: e.target.value })
                }
                variant="outlined"
                size="small"
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small" required>
                <InputLabel id="data-source-label">Data Source</InputLabel>
                <Select
                  labelId="data-source-label"
                  value={notification.entityId || ""}
                  onChange={(e) =>
                    setNotification({
                      ...notification,
                      entityId: e.target.value,
                    })
                  }
                  label="Data Source"
                >
                  {/* <MenuItem value="">Select DataSource...</MenuItem> */}
                  {notificationTypeList?.map((entity) => (
                    <MenuItem key={entity._id} value={entity._id}>
                      {entity.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {!isDataSourceSelected && (
                <Box
                  sx={{
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: "12px" }}>
                    select a Data Source to enable condition building
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      </Box>
      <GroupComponent group={notification.conditionGroup} isRoot={true} />
      <ConditionPreview
        conditionGroup={notification.conditionGroup}
        fieldOptions={fieldOptions}
        operatorList={operatorList}
        notification={notification}
      />
    </>
  );
};

// Main AddNotificationTypes Component
export default function AddNotificationTypes() {
  const [expanded, setExpanded] = useState({
    condition: true,
    reminder: true,
  });
  
  const permissions = useSelector(
    (state: RootState) => state.userPermission.permissions
  );
  const shouldAllowScheduler = checkPermission(
    permissions,
    PermissionsMap.NOTIFICATION_SETTING_FREQUENCY,
    "list"
  );

  const shouldAllowSchedulerCreate = checkPermission(
    permissions,
    PermissionsMap.NOTIFICATION_SETTING_FREQUENCY,
    "create"
  );
  const shouldAllowSchedulerUpdate = checkPermission(
    permissions,
    PermissionsMap.NOTIFICATION_SETTING_FREQUENCY,
    "update"
  );
  const shouldAllowSchedulerDelete = checkPermission(
    permissions,
    PermissionsMap.NOTIFICATION_SETTING_FREQUENCY,
    "delete"
  );

  const shouldAllowSchedulerGet = checkPermission(
    permissions,
    PermissionsMap.NOTIFICATION_SETTING_FREQUENCY,
    "get"
  );

  const [notificationData, setNotificationData] = useState({});
  const [notificationTypeId, setNotificationTypeId] = useState(null);
  const [fieldOptions, setFieldOptions] = useState([]);

  const { list } = useSelector((state) => state.dataSource);
  const updatedList = list
    ? list.filter((item) => item?.isShowMenu === true)
    : [];
  const createNotification = usePost(["createNotification"], () => {}, true);
  const notificationResponse = usePost(["notificationResponse"]);
  const navigate = useNavigate();

  // Check if datasource is selected
  const isDataSourceSelected = Boolean(notificationData.dataSourceId);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded((prev) => ({ ...prev, [panel]: isExpanded }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!notificationData.name) {
      toast.error("Name field is required");
      return;
    }

    if (!notificationData.dataSourceId) {
      toast.error("Data Source is required");
      return;
    }

    const formData = {
      notification: notificationData,
    };
    try {
      const response = await createNotification.mutateAsync({
        url: `${POST.CREATE_NOTIFICATION_TYPE}`,
        payload: notificationData,
      });
      if (response.success && response.data?._id) {
        setNotificationTypeId(response.data?._id);
        setExpanded((prev) => ({ ...prev, condition: false, reminder: true }));
      } else {
        throw new Error("Notification creation failed or no ID returned");
      }
    } catch (error) {
      console.error(
        error.message || "Failed to create notification. Please try again."
      );
    }
  };

  return (
    <ErrorBoundary>
      <PageHeader
        title="Add Notification Type"
        onBack={() => navigate("/notification")}
      />

      <PageCardLayout>
        <Box component="form" onSubmit={handleSubmit}>
          <Accordion
            expanded={expanded.condition}
            onChange={handleAccordionChange("condition")}
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
                <ConditionRuleBuilder
                  onChange={setNotificationData}
                  notificationTypeList={updatedList}
                  fieldOptions={fieldOptions}
                  setFieldOptions={setFieldOptions}
                  notificationResponse={notificationResponse.data?.data}
                />
              </ErrorBoundary>
              <Box
                sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}
              >
                <StyledButton
                  variant="primary"
                  type="submit"
                  disabled={
                    createNotification.isLoading || !isDataSourceSelected
                  }
                >
                  {createNotification.isLoading ? "Saving..." : "Save"}
                </StyledButton>
              </Box>
            </AccordionDetails>
          </Accordion>
          <Accordion
            expanded={expanded.reminder && notificationTypeId !== null}
            onChange={handleAccordionChange("reminder")}
            sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}
            disabled={notificationTypeId === null || !shouldAllowScheduler}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="reminder-content"
              id="reminder-header"
              sx={{
                bgcolor: notificationTypeId ? "grey.50" : "grey.200",
                borderRadius: 2,
                opacity: notificationTypeId ? 1 : 0.6,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "text.primary" }}
              >
                Scheduler {!notificationTypeId}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ErrorBoundary>
                <Frequency
                  fieldOptions={fieldOptions}
                  notificationTypeId={notificationTypeId}
                  shouldAllowSchedulerGet={shouldAllowSchedulerGet}
                  shouldAllowSchedulerCreate={shouldAllowSchedulerCreate}
                  shouldAllowSchedulerUpdate={shouldAllowSchedulerUpdate}
                  shouldAllowSchedulerDelete={shouldAllowSchedulerDelete}
                />
              </ErrorBoundary>
            </AccordionDetails>
          </Accordion>
        </Box>
      </PageCardLayout>
    </ErrorBoundary>
  );
}
