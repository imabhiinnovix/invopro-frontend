import * as React from "react";
import { useState } from "react";
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
import { GET } from "../../services/apiRoutes";

const STYLE_GUIDE = {
  COLORS: {
    backgroundLight: "#f5f5f5",
    primaryDark: "#1976d2",
    white: "#ffffff",
  },
};

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
const ConditionRuleBuilder = ({ onChange }) => {
  const [notification, setNotification] = useState({
    name: "Overall Notification",
    entityId: "ObjectId()",
    conditionGroup: {
      logic: "AND",
      rules: [],
    },
  });

  const notificationTypeList = useGet<any>(
    ["notificationTypeList"],
    `${GET.Entity_List}}`,true
  );
  console.log("notificationTypeList", notificationTypeList);

  const fieldOptions = [
    { value: "due_date", label: "Due Date", type: "date" },
    { value: "date_taken", label: "Date Taken", type: "date" },
    { value: "active_switch", label: "Active Switch", type: "number" },
    { value: "is_disclosure", label: "Is Disclosure", type: "boolean" },
    { value: "status", label: "Status", type: "select" },
    { value: "alert_required", label: "Alert Required", type: "select" },
    { value: "is_critical", label: "Is Critical", type: "boolean" },
    { value: "procedure_agent", label: "Procedure Agent", type: "text" },
    { value: "local_agent", label: "Local Agent", type: "text" },
    { value: "case_type", label: "Case Type", type: "select" },
    { value: "country_code", label: "Country Code", type: "select" },
  ];

  const operatorOptions = {
    date: [
      { value: "lt", label: "Less than" },
      { value: "gt", label: "Greater than" },
      { value: "eq", label: "Equal to" },
      { value: "ne", label: "Not equal to" },
    ],
    text: [
      { value: "eq", label: "Equal to" },
      { value: "ne", label: "Not equal to" },
      { value: "contains", label: "Contains" },
      { value: "in", label: "In list" },
    ],
    number: [
      { value: "eq", label: "Equal to" },
      { value: "ne", label: "Not equal to" },
      { value: "gt", label: "Greater than" },
      { value: "lt", label: "Less than" },
    ],
    boolean: [{ value: "eq", label: "Equal to" }],
    select: [
      { value: "eq", label: "Equal to" },
      { value: "ne", label: "Not equal to" },
      { value: "in", label: "In list" },
    ],
  };

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
    const updateValue = (value) => updateRule(groupPath, index, "value", value);

    if (!field) {
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

  const RuleComponent = ({ rule, groupPath, index }) => (
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
          onChange={(e) =>
            updateRule(groupPath, index, "field", e.target.value)
          }
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
          {rule.field &&
            operatorOptions[
              fieldOptions.find((f) => f.value === rule.field)?.type
            ]?.map((op) => (
              <MenuItem key={op.value} value={op.value}>
                {op.label}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      {renderValueInput(rule, groupPath, index)}

      <IconButton
        onClick={() => removeItem(groupPath, index)}
        color="error"
        sx={{
          bgcolor: "error.light",
          "&:hover": { bgcolor: "error.main", color: "white" },
        }}
        aria-label="Remove rule"
      >
        <CloseIcon />
      </IconButton>
    </Box>
  );

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
                sx={{
                  bgcolor: "error.light",
                  "&:hover": { bgcolor: "error.main", color: "white" },
                }}
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

  React.useEffect(() => {
    onChange(notification);
  }, [notification, onChange]);

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
            <TextField
              fullWidth
              label="Entity ID"
              value={notification.entityId}
              onChange={(e) =>
                setNotification({ ...notification, entityId: e.target.value })
              }
              variant="outlined"
              size="small"
            />
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
    { value: "everyYear", label: "Every Month" },
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

  const templateOptions = ["One", "Two", "Three"];
  const methodOptions = ["SMS", "WhatsApp", "Email"];

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
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

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

      for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<Box key={`empty-${i}`} sx={{ p: 1 }} />);
      }

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
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 1,
            mb: 2,
          }}
        >
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <Box
              key={day}
              sx={{
                p: 1,
                textAlign: "center",
                fontSize: "0.75rem",
                color: "text.secondary",
              }}
            >
              {day}
            </Box>
          ))}
        </Box>
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
          alert("Please select a date for one-time reminders");
          return set;
        }
        if (
          currentReminder.type === "weekly" &&
          currentReminder.daysOfWeek.length === 0
        ) {
          alert("Please select at least one day of the week");
          return set;
        }
        if (
          currentReminder.type === "weekly" &&
          currentReminder.weekPattern.length === 0
        ) {
          alert("Please select at least one week pattern");
          return set;
        }
        if (
          currentReminder.type === "monthly" &&
          currentReminder.monthlyPattern.length === 0
        ) {
          alert("Please select at least one month");
          return set;
        }
        if (
          currentReminder.type === "monthly" &&
          !currentReminder.monthlyPattern.includes("everyYear") &&
          currentReminder.daysOfMonth.length === 0
        ) {
          alert("Please select at least one day of the month");
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
          reminder.monthlyPattern.includes("everyYear")
            ? "every month"
            : `${daysOfMonth} of ${monthLabels}`
        }`;
        if (
          reminder.monthlyPattern.includes("everyYear") &&
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

  React.useEffect(() => {
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
          <></>
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
                bgcolor: "error.light",
                "&:hover": { bgcolor: "error.main", color: "white" },
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
                      if (newValues.includes("everyYear")) {
                        updateCurrentReminder(set.id, {
                          monthlyPattern: ["everyYear"],
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
                            "everyYear"
                          ) && month.value !== "everyYear"
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
                {set.currentReminder.monthlyPattern.includes("everyYear") && (
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
                {!set.currentReminder.monthlyPattern.includes("everyYear") &&
                  set.currentReminder.monthlyPattern.length > 0 && (
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
                            ? `Selected dates: ${set.currentReminder.daysOfMonth.map((d) => new Date(d).getDate()).join(", ")}`
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
                        sx={{
                          bgcolor: "error.light",
                          "&:hover": { bgcolor: "error.main", color: "white" },
                        }}
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
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => addDropdownRow(set.id)}
                  startIcon={<AddIcon />}
                >
                  Add More
                </Button>
              </Box>
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
                      {templateOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
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
                      renderValue={(selected) => selected.join(", ")}
                    >
                      {methodOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          <Checkbox checked={row.methods.includes(option)} />
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <IconButton
                    onClick={() => removeDropdownRow(set.id, row.id)}
                    color="error"
                    sx={{
                      bgcolor: "error.light",
                      "&:hover": { bgcolor: "error.main", color: "white" },
                    }}
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

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded((prev) => ({ ...prev, [panel]: isExpanded }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = {
      notification: notificationData,
      // reminders: reminderData,
    };
    console.log("Form Submission Data:", JSON.stringify(formData, null, 2));
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
                  <ConditionRuleBuilder onChange={setNotificationData} />
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
              >
                Save
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
