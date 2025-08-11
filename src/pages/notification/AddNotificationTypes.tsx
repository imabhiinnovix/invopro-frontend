import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import useGet from "../../hooks/useGet";
import usePost from "../../hooks/usePost";
import { GET, POST } from "../../services/apiRoutes";
import { STYLE_GUIDE } from "../../styles";
import { useSelector } from "react-redux";
import { RootState } from "../../reducers";
import Frequency from "./Frequency";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

// ConditionRuleBuilder Component
const ConditionRuleBuilder = ({
  onChange,
  notificationTypeList,
  fieldOptions,
  notificationResponse,
}) => {
  const organizationId = useSelector(
    (state: RootState) => state.userPermission?.currentUser?.organizationId?._id
  );
  const [notification, setNotification] = useState({
    name: "",
    entityId: "",
    conditionGroup: {
      logic: "AND",
      rules: [],
    },
  });

  const operatorList = usePost(["operatorList"]);

  useEffect(() => {
    operatorList.mutate({
      url: POST.OPERATOR_LIST,
      payload: { fieldType: "all" },
    });
  }, []);

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

  const addRule = (groupPath) => {
    const newRule = {
      id: generateId(),
      field: "",
      operator: "",
      value: "",
      timeUnit: "",
    };
    const updatedNotification = { ...notification };
    const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
    group.rules.push(newRule);
    setNotification(updatedNotification);
  };

  const addGroup = (groupPath) => {
    const newGroup = {
      id: generateId(),
      logic: "AND",
      rules: [],
    };
    const updatedNotification = { ...notification };
    const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
    group.rules.push(newGroup);
    setNotification(updatedNotification);
  };

  const removeItem = (groupPath, index) => {
    const updatedNotification = { ...notification };
    const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
    group.rules.splice(index, 1);
    setNotification(updatedNotification);
  };

  const updateRule = (groupPath, index, field, value) => {
    const updatedNotification = { ...notification };
    const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
    group.rules[index][field] = value;
    if (field === "operator") {
      const selectedField = fieldOptions.find(
        (f) => f.value === group.rules[index].field
      );
      const operators = operatorList.data?.data?.find(
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
    setNotification(updatedNotification);
  };

  const updateGroupLogic = (groupPath, logic) => {
    const updatedNotification = { ...notification };
    const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
    group.logic = logic;
    setNotification(updatedNotification);
  };

  const getGroupByPath = (root, path) => {
    if (path.length === 0) return root;
    let current = root;
    for (const index of path) {
      current = current.rules[index];
    }
    return current;
  };

  const validateValue = (rule) => {
    const field = fieldOptions.find((f) => f.value === rule.field);
    const operators =
      operatorList.data?.data?.find((op) => op.fieldType === field?.type)
        ?.operators || [];
    const selectedOperator = operators?.find(
      (op) => op.operatorKey === rule.operator
    );
    return selectedOperator?.valueRequired && !rule.value;
  };

  const renderValueInput = (rule, groupPath, index) => {
    const field = fieldOptions.find((f) => f.value === rule.field);
    const operators =
      operatorList.data?.data?.find((op) => op.fieldType === field?.type)
        ?.operators || [];
    const selectedOperator = operators?.find(
      (op) => op.operatorKey === rule.operator
    );
    const valueRequired = selectedOperator?.valueRequired ?? true;
    const updateValue = (value) => updateRule(groupPath, index, "value", value);
    const updateTimeUnit = (value) =>
      updateRule(groupPath, index, "timeUnit", value);

    if (!field || !valueRequired) {
      return null;
    }

    switch (field.type) {
      case "boolean":
        return (
          <FormControl fullWidth size="small" error={validateValue(rule)}>
            <InputLabel>Select...</InputLabel>
            <Select
              value={rule.value}
              onChange={(e) => updateValue(e.target.value === "true")}
              label="Select..."
            >
              <MenuItem value="">Select...</MenuItem>
              <MenuItem value="true">True</MenuItem>
              <MenuItem value="false">False</MenuItem>
            </Select>
            {validateValue(rule) && (
              <Typography color="error" variant="caption">
                Value is required
              </Typography>
            )}
          </FormControl>
        );
      case "select":
        if (rule.field === "status") {
          return rule.operator === "in" ? (
            <FormControl fullWidth size="small" error={validateValue(rule)}>
              <InputLabel>Select...</InputLabel>
              <Select
                multiple
                value={rule.value ? rule.value.split(",") : []}
                onChange={(e) => updateValue(e.target.value.join(","))}
                label="Select..."
                sx={{ minHeight: 80 }}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {validateValue(rule) && (
                <Typography color="error" variant="caption">
                  Value is required
                </Typography>
              )}
            </FormControl>
          ) : (
            <FormControl fullWidth size="small" error={validateValue(rule)}>
              <InputLabel>Select...</InputLabel>
              <Select
                value={rule.value}
                onChange={(e) => updateValue(e.target.value)}
                label="Select..."
              >
                <MenuItem value="">Select...</MenuItem>
                {statusOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {validateValue(rule) && (
                <Typography color="error" variant="caption">
                  Value is required
                </Typography>
              )}
            </FormControl>
          );
        }
        if (rule.field === "case_type") {
          return rule.operator === "in" ? (
            <FormControl fullWidth size="small" error={validateValue(rule)}>
              <InputLabel>Select...</InputLabel>
              <Select
                multiple
                value={rule.value ? rule.value.split(",") : []}
                onChange={(e) => updateValue(e.target.value.join(","))}
                label="Select..."
                sx={{ minHeight: 80 }}
              >
                {caseTypeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {validateValue(rule) && (
                <Typography color="error" variant="caption">
                  Value is required
                </Typography>
              )}
            </FormControl>
          ) : (
            <FormControl fullWidth size="small" error={validateValue(rule)}>
              <InputLabel>Select...</InputLabel>
              <Select
                value={rule.value}
                onChange={(e) => updateValue(e.target.value)}
                label="Select..."
              >
                <MenuItem value="">Select...</MenuItem>
                {caseTypeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {validateValue(rule) && (
                <Typography color="error" variant="caption">
                  Value is required
                </Typography>
              )}
            </FormControl>
          );
        }
        if (rule.field === "country_code") {
          return rule.operator === "in" ? (
            <FormControl fullWidth size="small" error={validateValue(rule)}>
              <InputLabel>Select...</InputLabel>
              <Select
                multiple
                value={rule.value ? rule.value.split(",") : []}
                onChange={(e) => updateValue(e.target.value.join(","))}
                label="Select..."
                sx={{ minHeight: 80 }}
              >
                {countryCodeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {validateValue(rule) && (
                <Typography color="error" variant="caption">
                  Value is required
                </Typography>
              )}
            </FormControl>
          ) : (
            <FormControl fullWidth size="small" error={validateValue(rule)}>
              <InputLabel>Select...</InputLabel>
              <Select
                value={rule.value}
                onChange={(e) => updateValue(e.target.value)}
                label="Select..."
              >
                <MenuItem value="">Select...</MenuItem>
                {countryCodeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {validateValue(rule) && (
                <Typography color="error" variant="caption">
                  Value is required
                </Typography>
              )}
            </FormControl>
          );
        }
        return (
          <FormControl fullWidth size="small" error={validateValue(rule)}>
            <TextField
              fullWidth
              size="small"
              value={rule.value}
              onChange={(e) => updateValue(e.target.value)}
              placeholder="Value"
              variant="outlined"
              error={validateValue(rule)}
              sx={{
                marginTop: validateValue(rule) ? "22px" : 0,
              }}
            />
            {validateValue(rule) && (
              <Typography color="error" variant="caption">
                Value is required
              </Typography>
            )}
          </FormControl>
        );
      case "date":
        return (
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <FormControl fullWidth size="small" error={validateValue(rule)}>
              <TextField
                fullWidth
                size="small"
                type="date"
                value={rule.value}
                onChange={(e) => updateValue(e.target.value)}
                placeholder="Select date"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                error={validateValue(rule)}
                sx={{
                  marginTop: validateValue(rule) ? "22px" : 0,
                }}
              />
              {validateValue(rule) && (
                <Typography color="error" variant="caption">
                  Value is required
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
                <MenuItem value="">Select...</MenuItem>
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
          <FormControl fullWidth size="small" error={validateValue(rule)}>
            <TextField
              fullWidth
              size="small"
              value={rule.value}
              onChange={(e) => updateValue(e.target.value)}
              placeholder="Value"
              variant="outlined"
              error={validateValue(rule)}
              sx={{
                marginTop: validateValue(rule) ? "22px" : 0,
              }}
            />
            {validateValue(rule) && (
              <Typography color="error" variant="caption">
                Value is required
              </Typography>
            )}
          </FormControl>
        );
    }
  };

  const RuleComponent = ({ rule, groupPath, index }) => {
    const selectedField = fieldOptions.find((f) => f.value === rule.field);
    const operators =
      operatorList.data?.data?.find(
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
            <MenuItem value="">Select field...</MenuItem>
            {fieldOptions.map((option) => (
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
            <MenuItem value="">Select operator...</MenuItem>
            {operatorList.isLoading ? (
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
  };

  const GroupComponent = ({ group, groupPath = [], isRoot = false }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
      <Box
        sx={{
          border: isRoot ? "2px solid" : "1px solid",
          borderColor: isRoot ? "primary.light" : "grey.300",
          borderRadius: 2,
          p: 3,
          width: isRoot ? "auto" : "auto",
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
              Condition{" "}
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
              Group Condition
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
  };

  useEffect(() => {
    const transformNotificationData = () => {
      const transformGroup = (group) => {
        const result = {
          group_operator: group.logic,
          conditions: [],
        };

        group.rules.forEach((rule) => {
          if (rule.logic) {
            // Handle nested group
            result.conditions.push(transformGroup(rule));
          } else {
            // Handle rule
            const fieldOption = fieldOptions.find(
              (f) => f.value === rule.field
            );
            if (fieldOption && rule.field && rule.operator) {
              const condition = {
                attributeId: fieldOption.attributeId,
                operator: rule.operator,
                value: rule.value || "",
              };
              if (fieldOption.type === "date" && rule.timeUnit) {
                condition.timeUnit = rule.timeUnit;
              }
              result.conditions.push(condition);
            }
          }
        });

        // Only return the group if it has conditions or nested groups
        return result.conditions.length > 0 ? result : null;
      };

      const conditionGroup = transformGroup(notification.conditionGroup);

      return {
        name: notification.name || "",
        organizationId: organizationId || "",
        entityId: notification.entityId || "",
        triggerFieldId: "",
        isActive: true,
        conditionGroups: conditionGroup ? [conditionGroup] : [],
      };
    };

    const transformedData = transformNotificationData();
    onChange(transformedData);
  }, [notification, fieldOptions, onChange, organizationId]);

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
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Entity</InputLabel>
                <Select
                  value={notification.entityId}
                  onChange={(e) =>
                    setNotification({
                      ...notification,
                      entityId: e.target.value,
                    })
                  }
                  label="Entity"
                >
                  <MenuItem value="">Select Entity...</MenuItem>
                  {notificationTypeList.data?.data?.map((entity) => (
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
      <GroupComponent group={notification.conditionGroup} isRoot={true} />
    </>
  );
};

// AddNotificationTypes Component
export default function AddNotificationTypes() {
  const [expanded, setExpanded] = useState({ condition: true, reminder: true });
  const [notificationData, setNotificationData] = useState({});
  const [fieldOptions, setFieldOptions] = useState([]);
  const [notificationTypeId, setNotificationTypeId] = useState(null);

  const notificationTypeList = useGet(
    ["notificationTypeList"],
    `${GET.Entity_List}`,
    true
  );
  const createNotification = usePost(["createNotification"]);
  const notificationResponse = usePost(["notificationResponse"]);
  const navigate = useNavigate();

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded((prev) => ({ ...prev, [panel]: isExpanded }));
  };

  useEffect(() => {
    if (notificationData.entityId && notificationTypeList.data?.data) {
      const selectedEntity = notificationTypeList.data.data.find(
        (entity) => entity._id === notificationData.entityId
      );
      if (selectedEntity && selectedEntity.attributes) {
        const newFieldOptions = selectedEntity.attributes.map((attr) => ({
          value: attr.mappingName,
          label: attr.name,
          type: attr.type,
          attributeId: attr._id,
        }));
        setFieldOptions(newFieldOptions);
      } else {
        setFieldOptions([]);
      }
    } else {
      setFieldOptions([]);
    }
  }, [notificationData.entityId, notificationTypeList.data]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = {
      notification: notificationData,
    };
    console.log("Form Submission Data:", JSON.stringify(formData, null, 2));

    try {
      const response = await createNotification.mutateAsync({
        url: `${POST.CREATE_NOTIFICATION_TYPE}`,
        payload: notificationData,
      });

      console.log("Notification created successfully:", response);

      if (response.success && response.data?._id) {
        setNotificationTypeId(response.data?._id);
        toast.success("Notification created successfully!");
        setExpanded((prev) => ({ ...prev, condition: false }));
      } else {
        throw new Error("Notification creation failed or no ID returned");
      }
    } catch (error) {
      console.error("Error creating notification:", error);
      toast.error("Failed to create notification. Please try again.");
    }
  };

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
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 400,
          color: STYLE_GUIDE.COLORS.primaryDark,
        }}
      >
        Add Notification Types
      </Typography>
      <Card
        sx={{
          backgroundColor: STYLE_GUIDE.COLORS.white,
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ mb: 2 }} />
            <Accordion
              expanded={expanded.condition}
              onChange={(event, isExpanded) =>
                handleAccordionChange("condition")(event, isExpanded)
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
                  <ConditionRuleBuilder
                    onChange={setNotificationData}
                    notificationTypeList={notificationTypeList}
                    fieldOptions={fieldOptions}
                    notificationResponse={notificationResponse.data?.data}
                  />
                </ErrorBoundary>
                <Box
                  sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{ px: 4 }}
                    disabled={createNotification.isLoading}
                  >
                    {createNotification.isLoading ? "Saving..." : "Save"}
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={expanded.reminder && notificationTypeId !== null}
              onChange={(event, isExpanded) =>
                handleAccordionChange("reminder")(event, isExpanded)
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
