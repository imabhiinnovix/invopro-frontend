
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
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LoopIcon from "@mui/icons-material/Loop";
import useGet from "../../hooks/useGet";
import usePost from "../../hooks/usePost";
import { GET, POST } from "../../services/apiRoutes";
import { STYLE_GUIDE } from "../../styles";
import { useSelector } from "react-redux";
import { RootState } from "../../reducers";

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
const ConditionRuleBuilder = ({ onChange, notificationTypeList }) => {
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

  const operatorList = usePost<any, any>(["operatorList"]);

  useEffect(() => {
    operatorList.mutate({
      url: POST.OPERATOR_LIST,
      payload: { fieldType: "all" },
    });
  }, []);

  const [fieldOptions, setFieldOptions] = useState([]);

  useEffect(() => {
    if (notification.entityId && notificationTypeList.data?.data) {
      const selectedEntity = notificationTypeList.data.data.find(
        (entity) => entity._id === notification.entityId
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
  }, [notification.entityId, notificationTypeList.data]);

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

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addRule = (groupPath) => {
    const newRule = {
      id: generateId(),
      field: "",
      operator: "",
      value: "",
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

    if (!field || !valueRequired) {
      return null;
    }

    switch (field.type) {
      case "boolean":
        return (
          <FormControl fullWidth size="small">
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
          </FormControl>
        );
      case "select":
        if (rule.field === "status") {
          return rule.operator === "in" ? (
            <FormControl fullWidth size="small">
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
            </FormControl>
          ) : (
            <FormControl fullWidth size="small">
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
            </FormControl>
          );
        }
        if (rule.field === "case_type") {
          return rule.operator === "in" ? (
            <FormControl fullWidth size="small">
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
            </FormControl>
          ) : (
            <FormControl fullWidth size="small">
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
            </FormControl>
          );
        }
        if (rule.field === "country_code") {
          return rule.operator === "in" ? (
            <FormControl fullWidth size="small">
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
            </FormControl>
          ) : (
            <FormControl fullWidth size="small">
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
            </FormControl>
          );
        }
        return (
          <FormControl fullWidth size="small">
            <InputLabel>Select...</InputLabel>
            <Select
              value={rule.value}
              onChange={(e) => updateValue(e.target.value)}
              label="Select..."
            >
              <MenuItem value="">Select...</MenuItem>
              <MenuItem value="Y">Yes</MenuItem>
              <MenuItem value="N">No</MenuItem>
            </Select>
          </FormControl>
        );
      case "date":
        return (
          <TextField
            fullWidth
            size="small"
            value={rule.value}
            onChange={(e) => updateValue(e.target.value)}
            placeholder="e.g., 30d, 2023-12-31"
            variant="outlined"
          />
        );
      default:
        return (
          <TextField
            fullWidth
            size="small"
            value={rule.value}
            onChange={(e) => updateValue(e.target.value)}
            placeholder="Value"
            variant="outlined"
          />
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
                sx={{ bgcolor: "grey.100", "&:hover": { bgcolor: "grey.200" } }}
                aria-label="Toggle group collapse"
              >
                {collapsed ? <ChevronRightIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: "medium", color: "text.secondary" }}
            >
              {isRoot ? "Root Condition Group" : "Nested Group"}
            </Typography>
            <FormControl size="small">
              <InputLabel>Logic</InputLabel>
              <Select
                value={group.logic}
                onChange={(e) => updateGroupLogic(groupPath, e.target.value)}
                label="Logic"
              >
                <MenuItem value="AND">AND</MenuItem>
                <MenuItem value="OR">OR</MenuItem>
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
            >
              Rule
            </Button>
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={() => addGroup(groupPath)}
              startIcon={<AddIcon />}
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
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 1 }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        px: 2,
                        py: 0.5,
                        bgcolor: "grey.200",
                        color: "text.secondary",
                        fontWeight: "medium",
                        borderRadius: "16px",
                      }}
                    >
                      {group.logic}
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
      const conditionGroups = [];

      const flattenGroup = (group, path = []) => {
        const conditions = [];
        group.rules.forEach((rule) => {
          if (rule.logic) {
            conditionGroups.push({
              group_operator: rule.logic,
              conditions: [],
            });
            flattenGroup(rule, [...path, conditionGroups.length - 1]);
          } else {
            const fieldOption = fieldOptions.find(
              (f) => f.value === rule.field
            );
            if (fieldOption) {
              conditions.push({
                attributeId: fieldOption.attributeId,
                operator: rule.operator,
                value: rule.value,
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
      return {
        name: notification.name,
        organizationId: organizationId,
        entityId: notification.entityId,
        triggerFieldId: "",
        isActive: true,
        conditionGroups,
      };
    };

    onChange(transformNotificationData());
  }, [notification, fieldOptions, onChange, organizationId]);

  return (
    <Box
      sx={{ maxWidth: "auto", mx: "auto", p: 4, bgcolor: "background.paper" }}
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
                  setNotification({ ...notification, entityId: e.target.value })
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
      <GroupComponent group={notification.conditionGroup} isRoot={true} />
    </Box>
  );
};

// TaskReminderInterface Component
const TaskReminderInterface = ({ onChange }) => {
  const [reminderSets, setReminderSets] = useState([
    {
      id: Date.now(),
      reminders: [],
      dropdownRows: [{ id: Date.now(), template: "", methods: [] }],
      currentReminder: {
        type: "once",
        time: "09:00",
        date: "",
        daysOfMonth: [],
        daysOfWeek: [],
        weekPattern: [],
        repetition: 1,
        monthlyPattern: [],
        enabled: true,
        acknowledgement: false,
        isAttached: false,
      },
    },
  ]);

  const [showCalendar, setShowCalendar] = useState({});

  const templateList = useGet<any>(
    ["templateList"],
    `${GET.TEMPLATE_LIST}`,
    true
  );
  const mediumList = useGet<any>(["mediumList"], `${GET.MEDIUM_LIST}`, true);

  const daysOfWeek = [
    { value: 0, label: "Sun", full: "Sunday" },
    { value: 1, label: "Mon", full: "Monday" },
    { value: 2, label: "Tue", full: "Tuesday" },
    { value: 3, label: "Wed", full: "Wednesday" },
    { value: 4, label: "Thu", full: "Thursday" },
    { value: 5, label: "Fri", full: "Friday" },
    { value: 6, label: "Sat", full: "Saturday" },
  ];

  const weekPatterns = [
    { value: "every", label: "Every Week" },
    { value: "first", label: "First Week" },
    { value: "second", label: "Second Week" },
    { value: "third", label: "Third Week" },
    { value: "fourth", label: "Fourth Week" },
    { value: "last", label: "Last Week" },
  ];

  const reminderTypes = [
    { value: "once", label: "One-time", icon: CalendarTodayIcon },
    { value: "daily", label: "Daily", icon: AccessTimeIcon },
    { value: "weekly", label: "Weekly", icon: LoopIcon },
    { value: "monthly", label: "Monthly", icon: CalendarTodayIcon },
  ];

  const months = [
    { value: "everyMonth", label: "Every Month" },
    { value: "jan", label: "Jan" },
    { value: "feb", label: "Feb" },
    { value: "mar", label: "Mar" },
    { value: "apr", label: "Apr" },
    { value: "may", label: "May" },
    { value: "jun", label: "Jun" },
    { value: "jul", label: "Jul" },
    { value: "aug", label: "Aug" },
    { value: "sep", label: "Sep" },
    { value: "oct", label: "Oct" },
    { value: "nov", label: "Nov" },
    { value: "dec", label: "Dec" },
  ];

  const addDropdownRow = (setId) => {
    setReminderSets((prev) =>
      prev.map((set) =>
        set.id === setId
          ? {
              ...set,
              dropdownRows: [
                ...set.dropdownRows,
                { id: Date.now(), template: "", methods: [] },
              ],
            }
          : set
      )
    );
  };

  const updateDropdownRow = (setId, rowId, updates) => {
    setReminderSets((prev) =>
      prev.map((set) =>
        set.id === setId
          ? {
              ...set,
              dropdownRows: set.dropdownRows.map((row) =>
                row.id === rowId ? { ...row, ...updates } : row
              ),
            }
          : set
      )
    );
  };

  const removeDropdownRow = (setId, rowId) => {
    setReminderSets((prev) =>
      prev.map((set) =>
        set.id === setId
          ? {
              ...set,
              dropdownRows: set.dropdownRows.filter((row) => row.id !== rowId),
            }
          : set
      )
    );
  };

  const removeReminderSet = (setId) => {
    setReminderSets((prev) => prev.filter((set) => set.id !== setId));
  };

  const updateCurrentReminder = (setId, updates) => {
    setReminderSets((prev) =>
      prev.map((set) =>
        set.id === setId
          ? { ...set, currentReminder: { ...set.currentReminder, ...updates } }
          : set
      )
    );
  };

  const CustomCalendar = ({ setId, selectedDates, onDateSelect }) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const handleDateClick = (day) => {
      try {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const newDates = selectedDates.includes(dateStr)
          ? selectedDates.filter((d) => d !== dateStr)
          : [...selectedDates, dateStr];
        onDateSelect(setId, newDates);
      } catch (error) {
        console.error("Error selecting date:", error);
      }
    };

    const renderCalendarDays = () => {
      const days = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const isSelected = selectedDates.includes(dateStr);

        days.push(
          <Button
            key={day}
            onClick={() => handleDateClick(day)}
            sx={{
              p: 1,
              minWidth: 40,
              fontSize: "0.875rem",
              borderRadius: 1,
              bgcolor: isSelected ? "primary.main" : "transparent",
              color: isSelected ? "white" : "text.primary",
              "&:hover": {
                bgcolor: isSelected ? "primary.dark" : "grey.100",
              },
            }}
          >
            {day}
          </Button>
        );
      }

      return days;
    };

    return (
      <Box
        sx={{
          bgcolor: "background.paper",
          border: 1,
          borderColor: "grey.300",
          borderRadius: 2,
          p: 2,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            mb: 2,
            textAlign: "center",
            fontWeight: "medium",
            color: "text.primary",
          }}
        >
          Select Days of Month (1-{daysInMonth})
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 1,
          }}
        >
          {renderCalendarDays()}
        </Box>
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            onClick={() =>
              setShowCalendar((prev) => ({ ...prev, [setId]: false }))
            }
            sx={{ px: 2, py: 1 }}
          >
            Close
          </Button>
        </Box>
      </Box>
    );
  };

  const addReminder = (setId) => {
    setReminderSets((prev) =>
      prev.map((set) => {
        if (set.id !== setId) return set;
        const { currentReminder } = set;

        if (currentReminder.type === "once" && !currentReminder.date) {
          toast.error("Please select a date for one-time reminders");
          return set;
        }
        if (
          currentReminder.type === "weekly" &&
          currentReminder.daysOfWeek.length === 0
        ) {
          toast.error("Please select at least one day of the week");
          return set;
        }
        if (
          currentReminder.type === "weekly" &&
          currentReminder.weekPattern.length === 0
        ) {
          toast.error("Please select at least one week pattern");
          return set;
        }
        if (
          currentReminder.type === "monthly" &&
          currentReminder.monthlyPattern.length === 0
        ) {
          toast.error("Please select at least one month");
          return set;
        }
        if (
          currentReminder.type === "monthly" &&
          !currentReminder.monthlyPattern.includes("everyMonth") &&
          currentReminder.daysOfMonth.length === 0
        ) {
          toast.error("Please select at least one day of the month");
          return set;
        }

        const newReminder = {
          ...currentReminder,
          id: Date.now(),
          createdAt: new Date().toISOString(),
        };

        return {
          ...set,
          reminders: [...set.reminders, newReminder],
          currentReminder: {
            type: "once",
            time: "09:00",
            date: "",
            daysOfMonth: [],
            daysOfWeek: [],
            weekPattern: [],
            repetition: 1,
            monthlyPattern: [],
            enabled: true,
            acknowledgement: false,
            isAttached: false,
          },
        };
      })
    );
  };

  const removeReminder = (setId, reminderId) => {
    setReminderSets((prev) =>
      prev.map((set) =>
        set.id === setId
          ? {
              ...set,
              reminders: set.reminders.filter((r) => r.id !== reminderId),
            }
          : set
      )
    );
  };

  const toggleReminder = (setId, reminderId) => {
    setReminderSets((prev) =>
      prev.map((set) =>
        set.id === setId
          ? {
              ...set,
              reminders: set.reminders.map((r) =>
                r.id === reminderId ? { ...r, enabled: !r.enabled } : r
              ),
            }
          : set
      )
    );
  };

  const updateReminder = (setId, reminderId, updates) => {
    setReminderSets((prev) =>
      prev.map((set) =>
        set.id === setId
          ? {
              ...set,
              reminders: set.reminders.map((r) =>
                r.id === reminderId ? { ...r, ...updates } : r
              ),
            }
          : set
      )
    );
  };

  const formatReminderText = (reminder) => {
    let text = reminder.time;
    switch (reminder.type) {
      case "once":
        text += ` on ${new Date(reminder.date).toLocaleDateString()}`;
        break;
      case "daily":
        text += ` every day`;
        break;
      case "weekly":
        const days = reminder.daysOfWeek
          .map((d) => daysOfWeek[d].label)
          .join(", ");
        const patterns = reminder.weekPattern
          .map((p) =>
            weekPatterns.find((wp) => wp.value === p)?.label.toLowerCase()
          )
          .join(", ");
        text += ` every ${days} of the ${patterns} (${reminder.repetition} times/week)`;
        break;
      case "monthly":
        const monthLabels = reminder.monthlyPattern
          .map((m) => months.find((month) => month.value === m)?.label)
          .join(", ");
        const daysOfMonth =
          reminder.daysOfMonth.length > 0
            ? reminder.daysOfMonth.map((d) => new Date(d).getDate()).join(", ")
            : "no days selected";
        text += ` monthly on ${
          reminder.monthlyPattern.includes("everyMonth")
            ? "every month"
            : `${daysOfMonth} of ${monthLabels}`
        }`;
        if (
          reminder.monthlyPattern.includes("everyMonth") &&
          reminder.repetition > 1
        ) {
          text += ` (${reminder.repetition} times/month)`;
        }
        break;
      default:
        break;
    }
    return text;
  };

  useEffect(() => {
    onChange(reminderSets);
  }, [reminderSets, onChange]);

  return (
    <Box
      sx={{
        mx: "auto",
        mt: 4,
        p: 3,
        bgcolor: "background.paper",
        borderRadius: 2,
      }}
    >
      {reminderSets.map((set, index) => (
        <Box
          key={set.id}
          sx={{
            mb: 4,
            p: 3,
            bgcolor: "grey.50",
            borderRadius: 2,
            position: "relative",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "medium", color: "text.primary" }}
            >
              Reminder Set
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => addReminder(set.id)}
              startIcon={<AddIcon />}
            >
              Add Reminder
            </Button>
          </Box>

          {reminderSets.length > 1 && (
            <IconButton
              onClick={() => removeReminderSet(set.id)}
              color="error"
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
              }}
              aria-label={`Remove reminder set ${index + 1}`}
            >
              <CloseIcon />
            </IconButton>
          )}

          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: "background.paper",
              border: 1,
              borderColor: "grey.300",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: "medium", color: "text.secondary", mb: 2 }}
            >
              Add New Reminder
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Reminder Type</InputLabel>
                  <Select
                    value={set.currentReminder.type}
                    onChange={(e) =>
                      updateCurrentReminder(set.id, { type: e.target.value })
                    }
                    label="Reminder Type"
                  >
                    {reminderTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <type.icon fontSize="small" />
                          {type.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="time"
                  label="Reminder Time"
                  value={set.currentReminder.time}
                  onChange={(e) =>
                    updateCurrentReminder(set.id, { time: e.target.value })
                  }
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              {set.currentReminder.type === "once" && (
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Date"
                    value={set.currentReminder.date}
                    onChange={(e) =>
                      updateCurrentReminder(set.id, { date: e.target.value })
                    }
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              )}
            </Grid>

            {set.currentReminder.type === "weekly" && (
              <Box
                sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="caption"
                      sx={{ display: "block", mb: 1, color: "text.secondary" }}
                    >
                      Week Pattern
                    </Typography>
                    <ToggleButtonGroup
                      value={set.currentReminder.weekPattern}
                      onChange={(e, newPatterns) => {
                        if (newPatterns.includes("every")) {
                          updateCurrentReminder(set.id, {
                            weekPattern: ["every"],
                          });
                        } else {
                          updateCurrentReminder(set.id, {
                            weekPattern: newPatterns.filter(
                              (p) => p !== "every"
                            ),
                          });
                        }
                      }}
                      sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                    >
                      {weekPatterns.map((pattern) => (
                        <ToggleButton
                          key={pattern.value}
                          value={pattern.value}
                          size="small"
                          disabled={
                            set.currentReminder.weekPattern.includes("every") &&
                            pattern.value !== "every"
                          }
                          sx={{
                            px: 2,
                            py: 1,
                            borderColor:
                              set.currentReminder.weekPattern.includes(
                                pattern.value
                              )
                                ? "primary.main"
                                : "grey.300",
                            bgcolor: set.currentReminder.weekPattern.includes(
                              pattern.value
                            )
                              ? "primary.light"
                              : "background.paper",
                            "&:hover": {
                              bgcolor: set.currentReminder.weekPattern.includes(
                                pattern.value
                              )
                                ? "primary.main"
                                : "grey.200",
                            },
                          }}
                        >
                          {pattern.label}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="caption"
                      sx={{ display: "block", mb: 1, color: "text.secondary" }}
                    >
                      Days of Week
                    </Typography>
                    <ToggleButtonGroup
                      value={set.currentReminder.daysOfWeek}
                      onChange={(e, newDays) =>
                        updateCurrentReminder(set.id, {
                          daysOfWeek: newDays || [],
                        })
                      }
                      sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                    >
                      {daysOfWeek.map((day) => (
                        <ToggleButton
                          key={day.value}
                          value={day.value}
                          size="small"
                          sx={{
                            px: 2,
                            py: 1,
                            borderColor:
                              set.currentReminder.daysOfWeek.includes(day.value)
                                ? "primary.main"
                                : "grey.300",
                            bgcolor: set.currentReminder.daysOfWeek.includes(
                              day.value
                            )
                              ? "primary.light"
                              : "background.paper",
                            "&:hover": {
                              bgcolor: set.currentReminder.daysOfWeek.includes(
                                day.value
                              )
                                ? "primary.main"
                                : "grey.200",
                            },
                          }}
                        >
                          {day.label}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Grid>
                </Grid>
                {set.currentReminder.weekPattern.includes("every") && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ display: "block", mb: 1, color: "text.secondary" }}
                    >
                      Repeat Every (weeks)
                    </Typography>
                    <TextField
                      size="small"
                      type="number"
                      label="Repeat"
                      value={set.currentReminder.repetition}
                      onChange={(e) =>
                        updateCurrentReminder(set.id, {
                          repetition: parseInt(e.target.value) || 1,
                        })
                      }
                      variant="outlined"
                      InputProps={{ inputProps: { min: 1, max: 7 } }}
                      sx={{ width: 120 }}
                    />
                  </Box>
                )}
              </Box>
            )}

            {set.currentReminder.type === "monthly" && (
              <Box
                sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ display: "block", mb: 1, color: "text.secondary" }}
                  >
                    Monthly Pattern
                  </Typography>
                  <ToggleButtonGroup
                    value={set.currentReminder.monthlyPattern}
                    onChange={(e, newValues) => {
                      if (newValues.includes("everyMonth")) {
                        updateCurrentReminder(set.id, {
                          monthlyPattern: ["everyMonth"],
                          daysOfMonth: [],
                        });
                      } else {
                        updateCurrentReminder(set.id, {
                          monthlyPattern: newValues,
                        });
                      }
                    }}
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                    >
                    {months.map((month) => (
                      <ToggleButton
                        key={month.value}
                        value={month.value}
                        size="small"
                        disabled={
                          set.currentReminder.monthlyPattern.includes(
                            "everyMonth"
                          ) && month.value !== "everyMonth"
                        }
                        sx={{
                          px: 2,
                          py: 1,
                          borderColor:
                            set.currentReminder.monthlyPattern.includes(
                              month.value
                            )
                              ? "primary.main"
                              : "grey.300",
                          bgcolor: set.currentReminder.monthlyPattern.includes(
                            month.value
                          )
                            ? "primary.light"
                            : "background.paper",
                          "&:hover": {
                            bgcolor:
                              set.currentReminder.monthlyPattern.includes(
                                month.value
                              )
                                ? "primary.main"
                                : "grey.200",
                          },
                        }}
                      >
                        {month.label}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Box>
                {set.currentReminder.monthlyPattern.includes("everyMonth") && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ display: "block", mb: 1, color: "text.secondary" }}
                    >
                      Repeat Every (months)
                    </Typography>
                    <TextField
                      size="small"
                      type="number"
                      label="Repeat"
                      value={set.currentReminder.repetition}
                      onChange={(e) =>
                        updateCurrentReminder(set.id, {
                          repetition: parseInt(e.target.value) || 1,
                        })
                      }
                      variant="outlined"
                      InputProps={{ inputProps: { min: 1, max: 5 } }}
                      sx={{ width: 120 }}
                    />
                  </Box>
                )}
                {(set.currentReminder.monthlyPattern.includes("everyMonth") ||
                  (!set.currentReminder.monthlyPattern.includes("everyMonth") &&
                    set.currentReminder.monthlyPattern.length > 0)) && (
                  <Box sx={{ position: "relative" }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mb: 1,
                        color: "text.secondary",
                      }}
                    >
                      Days of Month
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          flex: 1,
                          p: 2,
                          border: 1,
                          borderColor: "grey.300",
                          borderRadius: 1,
                          bgcolor: "grey.50",
                        }}
                      >
                        {set.currentReminder.daysOfMonth.length > 0
                          ? `Selected dates: ${set.currentReminder.daysOfMonth
                              .map((d) => new Date(d).getDate())
                              .join(", ")}`
                          : "No dates selected"}
                      </Box>
                      <Button
                        variant="contained"
                        onClick={() =>
                          setShowCalendar((prev) => ({
                            ...prev,
                            [set.id]: !prev[set.id],
                          }))
                        }
                        sx={{ px: 2, py: 1 }}
                      >
                        {showCalendar[set.id]
                          ? "Hide Calendar"
                          : "Select Dates"}
                      </Button>
                    </Box>
                    {showCalendar[set.id] && (
                      <Box sx={{ position: "absolute", zIndex: 10, mt: 1 }}>
                        <CustomCalendar
                          setId={set.id}
                          selectedDates={set.currentReminder.daysOfMonth}
                          onDateSelect={(setId, dates) => {
                            updateCurrentReminder(setId, {
                              daysOfMonth: dates,
                            });
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {set.reminders.length > 0 && (
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: "medium", color: "text.secondary", mb: 2 }}
              >
                Active Reminders
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {set.reminders.map((reminder) => (
                  <Box
                    key={reminder.id}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: reminder.enabled ? "grey.300" : "grey.200",
                      bgcolor: "background.paper",
                      borderRadius: 2,
                      opacity: reminder.enabled ? 1 : 0.6,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <ToggleButton
                          value="enabled"
                          selected={reminder.enabled}
                          onChange={() => toggleReminder(set.id, reminder.id)}
                          size="small"
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: 1,
                            bgcolor: reminder.enabled
                              ? "success.main"
                              : "grey.300",
                            "&:hover": {
                              bgcolor: reminder.enabled
                                ? "success.dark"
                                : "grey.400",
                            },
                          }}
                          aria-label="Toggle reminder enabled"
                        >
                          {reminder.enabled && (
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                bgcolor: "white",
                                borderRadius: "50%",
                              }}
                            />
                          )}
                        </ToggleButton>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "medium", color: "text.primary" }}
                          >
                            {formatReminderText(reminder)}
                          </Typography>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={reminder.acknowledgement}
                                onChange={(e) =>
                                  updateReminder(set.id, reminder.id, {
                                    acknowledgement: e.target.checked,
                                  })
                                }
                                size="small"
                              />
                            }
                            label="Acknowledgement"
                            sx={{ ml: 1, mr: 2 }}
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={reminder.isAttached}
                                onChange={(e) =>
                                  updateReminder(set.id, reminder.id, {
                                    isAttached: e.target.checked,
                                  })
                                }
                                size="small"
                              />
                            }
                            label="Is Attached"
                          />
                        </Box>
                      </Box>
                      <IconButton
                        onClick={() => removeReminder(set.id, reminder.id)}
                        color="error"
                        aria-label="Remove reminder"
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
          <Box>
            <Box sx={{ mb: 3 }}>
              {/* <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => addDropdownRow(set.id)}
                  startIcon={<AddIcon />}
                >
                  Add More
                </Button>
              </Box> */}
              {set.dropdownRows.map((row) => (
                <Box
                  key={row.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                    p: 2,
                    bgcolor: "background.paper",
                    border: 1,
                    borderColor: "grey.300",
                    borderRadius: 2,
                  }}
                >
                  <FormControl fullWidth size="small">
                    <InputLabel>Template</InputLabel>
                    <Select
                      value={row.template}
                      onChange={(e) =>
                        updateDropdownRow(set.id, row.id, {
                          template: e.target.value,
                        })
                      }
                      label="Template"
                    >
                      <MenuItem value="">Select Template...</MenuItem>
                      {templateList.data?.data?.map((option) => (
                        <MenuItem key={option._id} value={option._id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small">
                    <InputLabel>Notification Methods</InputLabel>
                    <Select
                      multiple
                      value={row.methods}
                      onChange={(e) =>
                        updateDropdownRow(set.id, row.id, {
                          methods: e.target.value,
                        })
                      }
                      label="Notification Methods"
                      renderValue={(selected) =>
                        selected
                          .map(
                            (id) =>
                              mediumList.data?.data?.find(
                                (medium) => medium._id === id
                              )?.medium || id
                          )
                          .join(", ")
                      }
                    >
                      {mediumList.data?.data?.map((option) => (
                        <MenuItem key={option._id} value={option._id}>
                          <Checkbox checked={row.methods.includes(option._id)} />
                          {option.medium}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <IconButton
                    onClick={() => removeDropdownRow(set.id, row.id)}
                    color="error"
                    aria-label="Remove dropdown row"
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

// AddNotificationTypes Component
export default function AddNotificationTypes() {
  const [expanded, setExpanded] = useState({ condition: true, reminder: true });
  const [notificationData, setNotificationData] = useState({});
  const [reminderData, setReminderData] = useState([]);
  const notificationTypeList = useGet<any>(
    ["notificationTypeList"],
    `${GET.Entity_List}`,
    true
  );
  const createNotification = usePost<any, any>(["createNotification"]);
  const createFrequency = usePost<any, any>(["createFrequency"]);
  const navigate = useNavigate();

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded((prev) => ({ ...prev, [panel]: isExpanded }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = {
      notification: notificationData,
      reminders: reminderData,
    };
    console.log("Form Submission Data:", JSON.stringify(formData, null, 2));

    try {
      // Create notification type
      const notificationResponse = await createNotification.mutateAsync({
        url: `${POST.CREATE_NOTIFICATION_TYPE}`,
        payload: notificationData,
      });

      console.log("Notification created successfully:", notificationResponse);

      // Only proceed if notification creation was successful
      if (notificationResponse.success && notificationResponse.data?._id) {
        const notificationTypeId = notificationResponse.data._id;
        toast.success("Notification created successfully!");

        let allFrequenciesSuccessful = true;

        // Create frequencies for each reminder set
        for (const set of reminderData) {
          // Handle dropdownRows for template and medium
          for (const row of set.dropdownRows) {
            if (row.template && row.methods.length > 0) {
              // Create a frequency for each selected medium
              for (const medium of row.methods) {
                const frequencyPayload = {
                  notificationTypeId: notificationTypeId,
                  frequency: set.currentReminder.type,
                  interval: set.currentReminder.repetition,
                  daysOfWeek:
                    set.currentReminder.type === "weekly"
                      ? set.currentReminder.daysOfWeek
                      : [],
                  daysOfMonth:
                    set.currentReminder.type === "monthly"
                      ? set.currentReminder.daysOfMonth.map((date) =>
                          new Date(date).getDate()
                        )
                      : [],
                  specificDate:
                    set.currentReminder.type === "once"
                      ? set.currentReminder.date
                      : undefined,
                  repeatAnnually:
                    set.currentReminder.monthlyPattern.includes("everyMonth"),
                  acknowledgeRequired: set.currentReminder.acknowledgement,
                  attachmentRequired: set.currentReminder.isAttached,
                  recipients: [],
                  medium: medium,
                  templateId: row.template,
                };

                try {
                  const frequencyResponse = await createFrequency.mutateAsync({
                    url: `${POST.CREATE_FREQUENCY}`,
                    payload: frequencyPayload,
                  });

                  if (frequencyResponse.success) {
                    console.log(
                      "Frequency created successfully for set:",
                      set.id,
                      "medium:",
                      medium
                    );
                    toast.success(
                      `Frequency created successfully for set ${set.id}, medium ${medium}`
                    );
                  } else {
                    console.error(
                      "Frequency creation failed for set:",
                      set.id,
                      "medium:",
                      medium
                    );
                    allFrequenciesSuccessful = false;
                    toast.error(
                      `Failed to create frequency for set ${set.id}, medium ${medium}`
                    );
                  }
                } catch (error) {
                  console.error(
                    "Error creating frequency for set:",
                    set.id,
                    "medium:",
                    medium,
                    error
                  );
                  allFrequenciesSuccessful = false;
                  toast.error(
                    `Error creating frequency for set ${set.id}, medium ${medium}`
                  );
                }
              }
            }
          }

          // Handle actual reminders
          for (const reminder of set.reminders) {
            for (const row of set.dropdownRows) {
              if (row.template && row.methods.length > 0) {
                for (const medium of row.methods) {
                  const frequencyPayload = {
                    notificationTypeId: notificationTypeId,
                    frequency: reminder.type,
                    interval: reminder.repetition,
                    daysOfWeek:
                      reminder.type === "weekly" ? reminder.daysOfWeek : [],
                    daysOfMonth:
                      reminder.type === "monthly"
                        ? reminder.daysOfMonth.map((date) =>
                            new Date(date).getDate()
                          )
                        : [],
                    specificDate:
                      reminder.type === "once" ? reminder.date : undefined,
                    repeatAnnually:
                      reminder.monthlyPattern.includes("everyMonth"),
                    acknowledgeRequired: reminder.acknowledgement,
                    attachmentRequired: reminder.isAttached,
                    recipients: [],
                    medium: medium,
                    templateId: row.template,
                  };

                  try {
                    const frequencyResponse = await createFrequency.mutateAsync({
                      url: `${POST.CREATE_FREQUENCY}`,
                      payload: frequencyPayload,
                    });

                    if (frequencyResponse.success) {
                      console.log(
                        "Frequency created successfully for reminder:",
                        reminder.id,
                        "medium:",
                        medium
                      );
                      toast.success(
                        `Frequency created successfully for reminder ${reminder.id}, medium ${medium}`
                      );
                    } else {
                      console.error(
                        "Frequency creation failed for reminder:",
                        reminder.id,
                        "medium:",
                        medium
                      );
                      allFrequenciesSuccessful = false;
                      toast.error(
                        `Failed to create frequency for reminder ${reminder.id}, medium ${medium}`
                      );
                    }
                  } catch (error) {
                    console.error(
                      "Error creating frequency for reminder:",
                      reminder.id,
                      "medium:",
                      medium,
                      error
                    );
                    allFrequenciesSuccessful = false;
                    toast.error(
                      `Error creating frequency for reminder ${reminder.id}, medium ${medium}`
                    );
                  }
                }
              }
            }
          }
        }

        if (allFrequenciesSuccessful) {
          navigate("/notivix/notification"); // Redirect to the listing page
        } else {
          toast.error(
            "Some frequencies failed to create. Please check the details."
          );
        }
      } else {
        throw new Error("Notification creation failed or no ID returned");
      }
    } catch (error) {
      console.error("Error creating notification or frequencies:", error);
      toast.error("Failed to create notification or frequencies. Please try again.");
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
                    notificationTypeList={notificationTypeList}
                  />
                </ErrorBoundary>
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={expanded.reminder}
              onChange={handleAccordionChange("reminder")}
              sx={{ borderRadius: 2, boxShadow: 1 }}
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
                  Task Reminder Settings
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ErrorBoundary>
                  <TaskReminderInterface onChange={setReminderData} />
                </ErrorBoundary>
              </AccordionDetails>
            </Accordion>
            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                sx={{ px: 4 }}
                disabled={
                  createNotification.isLoading || createFrequency.isLoading
                }
              >
                {createNotification.isLoading || createFrequency.isLoading
                  ? "Saving..."
                  : "Save"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}