import * as React from "react";
import { useState, useEffect, useCallback, memo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import useGet from "../../hooks/useGet";
import usePost from "../../hooks/usePost";
import usePut from "../../hooks/usePut";
import { GET, POST, PUT } from "../../services/apiRoutes";

import { useSelector } from "react-redux";
import { RootState } from "../../reducers";

import Frequency from "./Frequency";
import ConditionPreview from "./ConditionPreview";
import { checkPermission } from "../../utils/utils";
import { PermissionsMap } from "../../utils/constants";
import { PageHeader, PageCardLayout, StyledButton } from "../../components/common";

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
  },
);

const ConditionRuleBuilder = ({
  onChange,
  notificationTypeList,
  fieldOptions,
  setFieldOptions,
  notificationResponse,
  initialNotification,
}) => {
  const organizationId = useSelector(
    (state: RootState) =>
      state.userPermission?.currentUser?.organizationId?._id,
  );
  const [notification, setNotification] = useState(initialNotification);
  const { list } = useSelector((state: RootState) => state.dataSource);
  const operatorList = usePost(["operatorList"]);

  const notificationRef = useRef(notification);
  const fieldOptionsRef = useRef(fieldOptions);
  const operatorListRef = useRef(operatorList);
  const [operatorsLoaded, setOperatorsLoaded] = useState(false);

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
    if (initialNotification) {
      setNotification(initialNotification);
    }
  }, [initialNotification]);

  useEffect(() => {
    operatorList.mutate({
      url: POST.OPERATOR_LIST,
      payload: { fieldType: "all" },
    });
  }, []);

  useEffect(() => {
    if (operatorList.data && !operatorList.isLoading) {
      setOperatorsLoaded(true);
    }
  }, [operatorList.data, operatorList.isLoading]);

  useEffect(() => {
    if (notification.entityId && list) {
      const selectedEntity = list.find(
        (item) => item._id === notification.entityId,
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

  const getGroupByPath = (root, path) => {
    if (path.length === 0) return root;
    let current = root;
    for (const index of path) {
      current = current.rules[index];
    }
    return current;
  };

  const validateValue = (rule) => {
    if (!rule.field || !rule.operator) return false;
    const field = fieldOptionsRef.current.find((f) => f.value === rule.field);
    const operators =
      operatorListRef.current.data?.data?.find(
        (op) => op.fieldType === field?.type,
      )?.operators || [];
    const selectedOperator = operators?.find(
      (op) => op.operatorKey === rule.operator,
    );
    return selectedOperator?.valueRequired && !rule.value;
  };

  const addRule = useCallback((groupPath) => {
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
        groupPath,
      );
      group.rules.push(newRule);
      return updatedNotification;
    });
  }, []);

  const addGroup = useCallback((groupPath) => {
    const newGroup = {
      id: generateId(),
      logic: "AND",
      rules: [],
    };

    setNotification((prev) => {
      const updatedNotification = JSON.parse(JSON.stringify(prev));
      const group = getGroupByPath(
        updatedNotification.conditionGroup,
        groupPath,
      );
      group.rules.push(newGroup);
      return updatedNotification;
    });
  }, []);

  const removeItem = useCallback((groupPath, index) => {
    setNotification((prev) => {
      const updatedNotification = JSON.parse(JSON.stringify(prev));
      const group = getGroupByPath(
        updatedNotification.conditionGroup,
        groupPath,
      );
      group.rules.splice(index, 1);
      return updatedNotification;
    });
  }, []);

  const updateRule = useCallback((groupPath, index, field, value) => {
    setNotification((prev) => {
      const updatedNotification = JSON.parse(JSON.stringify(prev));
      const group = getGroupByPath(
        updatedNotification.conditionGroup,
        groupPath,
      );

      if (group && group.rules && group.rules[index]) {
        group.rules[index][field] = value;

        if (field === "operator") {
          const selectedField = fieldOptionsRef.current.find(
            (f) => f.value === group.rules[index].field,
          );
          const operators = operatorListRef.current.data?.data?.find(
            (op) => op.fieldType === selectedField?.type,
          )?.operators;
          const selectedOperator = operators?.find(
            (op) => op.operatorKey === value,
          );
          if (selectedOperator && !selectedOperator.valueRequired) {
            group.rules[index].value = "";
            group.rules[index].timeUnit = "";
          }
        }
      }

      return updatedNotification;
    });
  }, []);

  const updateGroupLogic = useCallback((groupPath, logic) => {
    setNotification((prev) => {
      const updatedNotification = JSON.parse(JSON.stringify(prev));
      const group = getGroupByPath(
        updatedNotification.conditionGroup,
        groupPath,
      );
      if (group) {
        group.logic = logic;
      }
      return updatedNotification;
    });
  }, []);

  const renderValueInput = useCallback(
    (rule, groupPath, index) => {
      const field = fieldOptionsRef.current.find((f) => f.value === rule.field);
      if (!field) return null;
      const operators =
        operatorListRef.current.data?.data?.find(
          (op) => op.fieldType === field?.type,
        )?.operators || [];
      const selectedOperator = operators?.find(
        (op) => op.operatorKey === rule.operator,
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
                  Required
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
                  key={`input-${rule.id || index}`}
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
                    Required
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
                key={`input-${rule.id || index}`}
                fullWidth
                size="small"
                value={rule.value}
                onChange={updateValue}
                placeholder="Value"
                error={hasError}
              />
              {hasError && (
                <Typography color="error" variant="caption">
                  Required
                </Typography>
              )}
            </FormControl>
          );
      }
    },
    [updateRule, validateValue],
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
            Required
          </Typography>
        )}
      </FormControl>
    );
  }, []);

  const RuleComponent = memo(
    ({ rule, groupPath, index }) => {
      const selectedField = fieldOptionsRef.current.find(
        (f) => f.value === rule.field,
      );
      const operators =
        operatorListRef.current.data?.data?.find(
          (op) => op.fieldType === selectedField?.type,
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
    },
    (prevProps, nextProps) => {
      return (
        prevProps.rule === nextProps.rule &&
        prevProps.groupPath === nextProps.groupPath &&
        prevProps.index === nextProps.index
      );
    },
  );

  const GroupComponent = memo(({ group, groupPath = [], isRoot = false }) => {
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
            >
              Condition
            </StyledButton>
            <StyledButton
              variant="primary"
              size="small"
              onClick={() => addGroup(groupPath)}
              icon={<AddIcon />}
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
  });

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
              (f) => f.value === rule.field,
            );
            if (fieldOption && rule.field && rule.operator) {
              const condition = {
                attributeId: fieldOption.attributeId,
                operator: rule.operator,
                value: rule.value || "",
                refAttributeId: fieldOption?.refAttributeId || "",
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
              (f) => f.value === rule.field,
            );
            if (fieldOption && rule.field && rule.operator) {
              const condition = {
                attributeId: fieldOption.label,
                operator: rule.operator,
                value: rule.value || "",
                // refAttributeId: fieldOption?.refAttributeId || "",
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
        notificationRef.current.conditionGroup,
      );
      const summaryConditionGroup = transformGroupSummary(
        notificationRef.current.conditionGroup,
      );
      return {
        name: notificationRef.current.name || "",
        _id: notificationRef.current._id || "",
        organizationId: organizationId || "",
        dataSourceId: notificationRef.current.entityId || "",
        triggerFieldId: "",
        isActive: true,
        conditionGroups: conditionGroup ? [conditionGroup] : [],
        conditionSummaryGroups: summaryConditionGroup
          ? [summaryConditionGroup]
          : [],
      };
    };

    if (
      notificationRef.current &&
      notificationRef.current.conditionGroup &&
      notificationRef.current.conditionGroup.rules.length > 0 &&
      operatorsLoaded
    ) {
      const transformedData = transformNotificationData();
      onChange(transformedData);
    }
  }, [notification, onChange, organizationId, operatorsLoaded]);

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
                value={notification.name || ""}
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
                <InputLabel>Data Source</InputLabel>
                <Select
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
            </Grid>
          </Grid>
        </Box>
      </Box>
      {notification.conditionGroup && (
        <>
          <GroupComponent group={notification.conditionGroup} isRoot={true} />
          <ConditionPreview
            conditionGroup={notification.conditionGroup}
            fieldOptions={fieldOptions}
            operatorList={operatorList}
            notification={notification}
          />
        </>
      )}
    </>
  );
};

export default function EditNotificationTypes() {
  const { id } = useParams();
  const [expanded, setExpanded] = useState({
    condition: true,
    reminder: true,
  });

  const permissions = useSelector(
    (state: RootState) => state.userPermission.permissions,
  );
  const shouldAllowScheduler = checkPermission(
    permissions,
    PermissionsMap.NOTIFICATION_SETTING_FREQUENCY,
    "list",
  );

  const shouldAllowSchedulerCreate = checkPermission(
    permissions,
    PermissionsMap.NOTIFICATION_SETTING_FREQUENCY,
    "create",
  );
  const shouldAllowSchedulerUpdate = checkPermission(
    permissions,
    PermissionsMap.NOTIFICATION_SETTING_FREQUENCY,
    "update",
  );
  const shouldAllowSchedulerDelete = checkPermission(
    permissions,
    PermissionsMap.NOTIFICATION_SETTING_FREQUENCY,
    "delete",
  );

  const shouldAllowSchedulerGet = checkPermission(
    permissions,
    PermissionsMap.NOTIFICATION_SETTING_FREQUENCY,
    "get",
  );

  type Rule = {
    id: string;
    field: string;
    operator: string;
    value: string;
    timeUnit?: string;
  };

  type ConditionGroup = {
    id: string;
    logic: string;
    rules: Array<Rule | ConditionGroup>;
  };

  type InitialNotificationType = {
    name: string;
    entityId: string;
    conditionGroup: {
      logic: string;
      rules: Array<Rule | ConditionGroup>;
    };
    _id: string;
  } | null;

  const [notificationData, setNotificationData] = useState({});
  const [notificationTypeId, setNotificationTypeId] = useState(id);
  const [fieldOptions, setFieldOptions] = useState([]);
  const [initialNotification, setInitialNotification] =
    useState<InitialNotificationType>(null);

  const { list } = useSelector((state: RootState) => state.dataSource);
  const updatedList = list
    ? list.filter((item) => item?.isShowMenu === true)
    : [];
  const updateNotification = usePut(
    ["notificationDetails", id],
    () => {},
    true,
  );

  const notificationDataFetch = useGet(
    ["notificationDetails", id],
    id ? `${GET.NOTIFICATION_SETTING_TYPE_DETAIL}/${id}` : null,
    !!id,
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (notificationDataFetch.data?.data && list) {
      const backendData = notificationDataFetch.data.data;
      const selectedEntity = list.find(
        (item) => item._id === backendData.dataSourceId,
      );
      let newFieldOptions = [];
      if (selectedEntity?.fieldSettings) {
        newFieldOptions = selectedEntity.fieldSettings.map((setting) => ({
          label: setting.label,
          value: setting.mappedAttributeName,
          attributeId: setting.attributeId,
          type: setting?.type,
          refAttributeId: setting?.refAttributeId || [],
        }));
      }
      setFieldOptions(newFieldOptions);

      const transformConditions = (conditions) => {
        return conditions?.map((condition, index) => {
          if (
            condition.conditions &&
            Array.isArray(condition.conditions) &&
            condition.conditions.length > 0
          ) {
            return {
              id: `group-${index}`,
              logic: condition.group_operator,
              rules: transformConditions(condition.conditions),
            };
          } else {
            const matchingField = newFieldOptions.find((f) => {
              if (f.attributeId !== condition.attributeId) return false;

              const fieldRef = Array.isArray(f.refAttributeId)
                ? f.refAttributeId
                : [];
              const conditionRef = Array.isArray(condition.refAttributeId)
                ? condition.refAttributeId
                : [];

              if (fieldRef.length !== conditionRef.length) return false;

              return fieldRef.every((val, idx) => val === conditionRef[idx]);
            });

            return {
              id: `rule-${index}`,
              field: matchingField?.value || "",
              operator: condition.operator,
              value: condition.value,
              timeUnit: condition.timeUnit || "",
            };
          }
        });
      };
      const firstGroup = backendData.conditionGroups[0];
      // if (firstGroup) {
      const transformedRules = transformConditions(
        firstGroup?.conditions || [],
      );
      const newInitialNotification = {
        name: backendData.name,
        entityId: backendData.dataSourceId,
        conditionGroup: {
          logic: firstGroup?.group_operator,
          rules: transformedRules,
        },
        _id: backendData._id,
      };
      setInitialNotification(newInitialNotification);
      setNotificationTypeId(backendData._id);
      // }
    }
  }, [notificationDataFetch.data, list]);

  useEffect(() => {
    if (notificationDataFetch.error) {
      toast.error("Failed to load notification data");
      console.error(
        "Error fetching notification:",
        notificationDataFetch.error,
      );
    }
  }, [notificationDataFetch.error]);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded((prev) => ({ ...prev, [panel]: isExpanded }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!notificationData.name) {
      toast.error("Name field is required");
      return;
    }

    try {
      const response = await updateNotification.mutateAsync({
        url: `${PUT.UPDATE_NOTIFICATION_TYPE}/${id}`,
        payload: notificationData,
      });
      if (response.success) {
        setExpanded((prev) => ({ ...prev, condition: false, reminder: true }));
      } else {
        throw new Error("Notification update failed");
      }
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  if (notificationDataFetch.isLoading || !initialNotification) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <PageHeader
        title="Edit Notification Type"
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
                  notificationResponse={null}
                  initialNotification={initialNotification}
                />
              </ErrorBoundary>
              <Box
                sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}
              >
                <StyledButton
                  variant="primary"
                  type="submit"
                  disabled={updateNotification.isLoading}
                >
                  {updateNotification.isLoading ? "Updating..." : "Update"}
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
