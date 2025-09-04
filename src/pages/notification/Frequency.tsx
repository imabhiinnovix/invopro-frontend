import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
  Paper,
  Popper,
  MenuList,
  MenuItem as MuiMenuItem,
  Typography,
  Radio,
  RadioGroup,
  TextField,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Grid,
  Chip,
  InputLabel,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import {
  Close as CloseIcon,
  AccessTime as AccessTimeIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronLeft,
  ChevronRight,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import useGet from "../../hooks/useGet";
import { GET } from "../../services/apiRoutes";

// Helper function to compare arrays
const arraysEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  // Sort both arrays to compare regardless of order
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();

  for (let i = 0; i < sortedA.length; ++i) {
    if (sortedA[i] !== sortedB[i]) return false;
  }
  return true;
};

export default function Frequency({ fieldOptions }) {
  console.log("fieldOptions:", fieldOptions);
  const [open, setOpen] = useState(false);
  const [allDay, setAllDay] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 8, 2));
  const [selectedTime, setSelectedTime] = useState("4:00 PM");
  const [repeatOption, setRepeatOption] = useState("Does not repeat");
  const [customRecurrenceOpen, setCustomRecurrenceOpen] = useState(false);

  // New state variables for additional fields
  const [template, setTemplate] = useState("");
  const [method, setMethod] = useState("");
  const [ackRequired, setAckRequired] = useState(false);
  const [attachmentRequired, setAttachmentRequired] = useState(false);
  const [toRecipients, setToRecipients] = useState([]);
  const [ccRecipients, setCcRecipients] = useState([]);
  const [targetEntity, setTargetEntity] = useState("");

  // New state for custom dates and times
  const [customDateTimes, setCustomDateTimes] = useState([]);
  const [customDateTimePickerOpen, setCustomDateTimePickerOpen] = useState(false);
  const [currentCustomDate, setCurrentCustomDate] = useState(new Date());
  const [currentCustomTime, setCurrentCustomTime] = useState(dayjs().format("hh:mm A"));
  const [customCalendarDate, setCustomCalendarDate] = useState(new Date());

  // Format recipients for saving
  const formatRecipients = (recipients) => {
    const result = [];
    const customEmails = [];

    recipients.forEach((recipient) => {
      if (typeof recipient === "string") {
        if (recipient.includes("@")) {
          customEmails.push(recipient);
        } else {
          result.push({ attributeId: recipient });
        }
      } else {
        if (recipient.label && recipient.label.includes("@")) {
          customEmails.push(recipient.label);
        } else if (recipient.attributeId) {
          const recipientObj = {
            attributeId: recipient.attributeId
          };

          if (recipient.refAttributeId && Array.isArray(recipient.refAttributeId) && recipient.refAttributeId.length > 0) {
            recipientObj.refAttributeId = recipient.refAttributeId;
          }

          result.push(recipientObj);
        }
      }
    });

    if (customEmails.length > 0) {
      result.push({ customEmails });
    }

    return result;
  };

  /* ---- date-picker ---- */
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date(2025, 8, 1));

  /* ---- time-picker ---- */
  const [timePickerOpen, setTimePickerOpen] = useState(false);

  /* ---- repeat-dropdown ---- */
  const [repeatAnchorEl, setRepeatAnchorEl] = useState(null);

  /* ---- custom recurrence form ---- */
  const [repeatEvery, setRepeatEvery] = useState(1);
  const [repeatPeriod, setRepeatPeriod] = useState("month");
  const [monthlyOption, setMonthlyOption] = useState("first-tuesday");
  const [yearlyOption, setYearlyOption] = useState("same-day");
  const [endsOption, setEndsOption] = useState("never");
  const [endDate, setEndDate] = useState("2026-09-02");
  const [occurrences, setOccurrences] = useState(12);

  /* ---- weekly days selection ---- */
  const [selectedDays, setSelectedDays] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  /* -------- helpers -------- */
  const formatDate = (d) =>
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (time) => {
    return time;
  };

  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const changeCalendarMonth = (delta) => {
    setCalendarDate((d) => {
      const next = new Date(d);
      next.setMonth(d.getMonth() + delta);
      return next;
    });
  };

  const changeCustomCalendarMonth = (delta) => {
    setCustomCalendarDate((d) => {
      const next = new Date(d);
      next.setMonth(d.getMonth() + delta);
      return next;
    });
  };

  const mediumList = useGet(["mediumList"], `${GET.MEDIUM_LIST}`, true);
  const templateList = useGet(["templateList"], `${GET.TEMPLATE_LIST}`, true);

  const generateCalendarDays = () => {
    const y = calendarDate.getFullYear();
    const m = calendarDate.getMonth();
    const first = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < first; i++)
      cells.push(<Box key={`empty-${i}`} sx={{ width: 32 }} />);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m, d);
      const isSel = date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === new Date().toDateString();
      cells.push(
        <Button
          key={d}
          onClick={() => {
            setSelectedDate(date);
            setDatePickerOpen(false);
          }}
          sx={{
            minWidth: 32,
            width: 32,
            height: 32,
            borderRadius: "50%",
            color: isSel ? "#fff" : "#3c4043",
            backgroundColor: isSel ? "#a136a1" : "transparent",
            border: isToday && !isSel ? "1px solid #bd19d2ff" : "none",
            "&:hover": { backgroundColor: isSel ? "#a136a1" : "#f1f3f4" },
          }}
        >
          {d}
        </Button>
      );
    }
    return cells;
  };

  const generateCustomCalendarDays = () => {
    const y = customCalendarDate.getFullYear();
    const m = customCalendarDate.getMonth();
    const first = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < first; i++)
      cells.push(<Box key={`custom-empty-${i}`} sx={{ width: 32 }} />);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m, d);
      const isSel = date.toDateString() === currentCustomDate.toDateString();
      cells.push(
        <Button
          key={`custom-${d}`}
          onClick={() => setCurrentCustomDate(date)}
          sx={{
            minWidth: 32,
            width: 32,
            height: 32,
            borderRadius: "50%",
            color: isSel ? "#fff" : "#3c4043",
            backgroundColor: isSel ? "#a136a1" : "transparent",
            "&:hover": { backgroundColor: isSel ? "#a136a1" : "#f1f3f4" },
          }}
        >
          {d}
        </Button>
      );
    }
    return cells;
  };

  // Generate dynamic repeat options based on selected date
  const getRepeatOptions = () => {
    const dayOfWeek = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const dayOfMonth = selectedDate.getDate();
    const month = selectedDate.toLocaleDateString("en-US", { month: "long" });
    return [
      "Does not repeat",
      "Daily",
      `Weekly on ${dayOfWeek}`,
      `Monthly on the ${getOrdinal(dayOfMonth)} ${dayOfWeek}`,
      `Annually on ${month} ${dayOfMonth}`,
      "Every weekday (Monday to Friday)",
      "Custom dates and times",
    ];
  };

  // Format selected days for display
  const formatSelectedDays = () => {
    const selected = daysOfWeek.filter((_, index) => selectedDays[index]);
    if (selected.length === 0) return "";
    if (selected.length === 1) return selected[0];
    if (selected.length === 2) return selected.join(" and ");
    return (
      selected.slice(0, -1).join(", ") + " and " + selected[selected.length - 1]
    );
  };

  // Initialize selected days when opening custom recurrence
  const initializeSelectedDays = () => {
    const dayIndex = selectedDate.getDay();
    const newSelectedDays = [...selectedDays];
    newSelectedDays.fill(false);
    newSelectedDays[dayIndex] = true;
    setSelectedDays(newSelectedDays);
  };

  // Add a new custom date and time
  const handleAddCustomDateTime = () => {
    setCustomDateTimes([
      ...customDateTimes,
      {
        date: new Date(currentCustomDate),
        time: currentCustomTime,
      },
    ]);
    setCustomDateTimePickerOpen(false);
  };

  // Remove a custom date and time
  const handleRemoveCustomDateTime = (index) => {
    const newCustomDateTimes = [...customDateTimes];
    newCustomDateTimes.splice(index, 1);
    setCustomDateTimes(newCustomDateTimes);
  };

  /* -------- handlers -------- */
  const handleOpenDialog = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSave = () => {
    const formattedToRecipients = formatRecipients(toRecipients);
    const formattedCcRecipients = formatRecipients(ccRecipients);

    // Prepare the data to be logged
    const saveData = {
      date: formatDate(selectedDate),
      time: allDay ? "All day" : selectedTime,
      repeat: repeatOption,
      template,
      method,
      ackRequired,
      attachmentRequired,
      toRecipients: formattedToRecipients,
      ccRecipients: formattedCcRecipients,
      targetEntity,
    };

    // Add custom dates if applicable
    if (repeatOption === "Custom dates and times" ||
        (repeatPeriod === "month" && monthlyOption === "custom-dates") ||
        (repeatPeriod === "year" && yearlyOption === "custom-dates")) {
      saveData.customDateTimes = customDateTimes;
    }

    console.log("Scheduler Data:", saveData);
    handleClose();
  };

  const handleRepeatClick = (e) => {
    setRepeatAnchorEl(e.currentTarget);
  };

  const handleRepeatSelect = (opt) => {
    setRepeatOption(opt);
    setRepeatAnchorEl(null);

    if (opt === "Custom...") {
      initializeSelectedDays();
      setCustomRecurrenceOpen(true);
    } else if (opt === "Custom dates and times") {
      setCustomDateTimes([]);
      setCustomRecurrenceOpen(true);
      // Set both monthly and yearly options to custom-dates
      setRepeatPeriod("month");
      setMonthlyOption("custom-dates");
      setYearlyOption("custom-dates");
    }
  };

  const handleCustomRecurrenceSave = () => {
    let txt = "";
    if (repeatPeriod === "week") {
      const days = formatSelectedDays();
      txt = `Weekly on ${days}`;
    } else if (repeatPeriod === "month") {
      if (monthlyOption === "custom-dates") {
        txt = "Custom dates and times";
      } else {
        const map = {
          "first-tuesday": "Monthly on the first Tuesday",
          "second-tuesday": "Monthly on the second Tuesday",
          "third-tuesday": "Monthly on the third Tuesday",
          "last-tuesday": "Monthly on the last Tuesday",
        };
        txt = map[monthlyOption];
      }
    } else if (repeatPeriod === "year") {
      if (yearlyOption === "custom-dates") {
        txt = "Custom dates and times";
      } else {
        const month = selectedDate.toLocaleDateString("en-US", { month: "long" });
        const dayOfMonth = selectedDate.getDate();
        txt = `Annually on ${month} ${dayOfMonth}`;
      }
    } else {
      txt = `Every ${repeatEvery} ${repeatPeriod}${repeatEvery > 1 ? "s" : ""}`;
    }

    // Add "Ends" info
    if (endsOption === "on") {
      const untilDate = new Date(endDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      txt += `, until ${untilDate}`;
    } else if (endsOption === "after") {
      txt += `, ending after ${occurrences} occurrence${
        occurrences > 1 ? "s" : ""
      }`;
    }

    setRepeatOption(txt);
    setCustomRecurrenceOpen(false);
  };

  const handleTimeChange = (newValue) => {
    if (newValue) {
      setSelectedTime(newValue.format("hh:mm A"));
    } else {
      setSelectedTime("");
    }
    setTimePickerOpen(false);
  };

  const handleCustomTimeChange = (newValue) => {
    if (newValue) {
      setCurrentCustomTime(newValue.format("hh:mm A"));
    }
  };

  const handleDayToggle = (index) => {
    const newSelectedDays = [...selectedDays];
    newSelectedDays[index] = !newSelectedDays[index];
    setSelectedDays(newSelectedDays);
  };

  // Handle period change to ensure custom dates option is set correctly
  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value;
    setRepeatPeriod(newPeriod);

    // If we're in custom dates mode, ensure the appropriate option is set
    if (repeatOption === "Custom dates and times") {
      if (newPeriod === "month") {
        setMonthlyOption("custom-dates");
      } else if (newPeriod === "year") {
        setYearlyOption("custom-dates");
      }
    }
  };

  /* -------- render -------- */
  return (
    <Box sx={{ p: 3 }}>
      <Button variant="contained" onClick={handleOpenDialog}>
        Add Scheduler{" "}
      </Button>

      {/* Main dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Add Scheduler
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            pt: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 2,
          }}
        >
          {/* Date & Time */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <AccessTimeIcon sx={{ color: "#666" }} fontSize="small" />
            <Button
              variant="outlined"
              onClick={() => setDatePickerOpen(true)}
              sx={{
                flex: 1,
                backgroundColor: "#f8f9fa",
                border: "1px solid #ddd",
                borderRadius: 2,
                color: "#3c4043",
                textTransform: "none",
                justifyContent: "flex-start",
                "&:hover": {
                  backgroundColor: "#f1f3f4",
                  border: "1px solid #ccc",
                },
              }}
            >
              {formatDate(selectedDate)}
            </Button>

            {!allDay && (
              <Button
                variant="outlined"
                onClick={() => setTimePickerOpen(true)}
                sx={{
                  minWidth: 100,
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #ddd",
                  borderRadius: 2,
                  color: "#3c4043",
                  textTransform: "none",
                  justifyContent: "flex-start",
                  "&:hover": {
                    backgroundColor: "#f1f3f4",
                    border: "1px solid #ccc",
                  },
                }}
              >
                {selectedTime}
              </Button>
            )}
          </Box>

          {/* All day + Repeat in same row */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, pl: 5 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                  size="small"
                />
              }
              label="All day"
            />

            <Button
              variant="outlined"
              onClick={handleRepeatClick}
              endIcon={<ExpandMoreIcon />}
              sx={{
                flex: 1,
                backgroundColor: "#f8f9fa",
                border: "1px solid #ddd",
                borderRadius: 2,
                color: "#3c4043",
                textTransform: "none",
                justifyContent: "space-between",
                "&:hover": {
                  backgroundColor: "#f1f3f4",
                  border: "1px solid #ccc",
                },
              }}
            >
              {repeatOption}
            </Button>

            <Popper
              open={Boolean(repeatAnchorEl)}
              anchorEl={repeatAnchorEl}
              placement="bottom-start"
              sx={{ zIndex: 1300 }}
            >
              <Paper sx={{ mt: 0.5, minWidth: 200, borderRadius: 2 }}>
                <MenuList>
                  {getRepeatOptions().map((o) => (
                    <MuiMenuItem key={o} onClick={() => handleRepeatSelect(o)}>
                      {o}
                    </MuiMenuItem>
                  ))}
                </MenuList>
              </Paper>
            </Popper>
          </Box>

          {/* Custom dates list */}
          {repeatOption === "Custom dates and times" && (
            <Box sx={{ mt: 1, pl: 5 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Scheduled dates and times:
              </Typography>

              {customDateTimes.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No dates added yet
                </Typography>
              ) : (
                <List dense>
                  {customDateTimes.map((dateTime, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={formatDate(dateTime.date)}
                        secondary={formatTime(dateTime.time)}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleRemoveCustomDateTime(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}

          {/* Additional fields section */}
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              {/* Template */}
              <Box sx={{ flex: 0.5, minWidth: "120px" }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Template</InputLabel>
                  <Select
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    label="Template"
                    displayEmpty
                    aria-label="Select template"
                  >
                    <MenuItem value="">Select Template...</MenuItem>
                    {templateList.data?.data?.map((option) => (
                      <MenuItem key={option._id} value={option._id}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Method */}
              <Box sx={{ flex: 0.5, minWidth: "120px" }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Method</InputLabel>
                  <Select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    label="Method"
                    displayEmpty
                    renderValue={(selected) =>
                      mediumList.data?.data?.find(
                        (medium) => medium._id === selected
                      )?.medium || selected
                    }
                    aria-label="Select notification method"
                  >
                    <MenuItem value="">Select Method...</MenuItem>
                    {mediumList.data?.data?.map((option) => (
                      <MenuItem key={option._id} value={option._id}>
                        {option.medium}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Checkboxes */}
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={ackRequired}
                    onChange={(e) => setAckRequired(e.target.checked)}
                    size="small"
                  />
                }
                label="Acknowledge Required"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={attachmentRequired}
                    onChange={(e) => setAttachmentRequired(e.target.checked)}
                    size="small"
                  />
                }
                label="Attachment Required"
              />
            </Box>

            {/* TO Recipients */}
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth size="small">
                <Autocomplete
                  multiple
                  freeSolo
                  size="small"
                  id="to-recipients-autocomplete"
                  options={fieldOptions.filter(
                    (option) => option.type === "email"
                  )}
                  getOptionLabel={(option) =>
                    typeof option === "string" ? option : option.label
                  }
                  isOptionEqualToValue={(option, value) => {
                    if (
                      typeof option === "string" &&
                      typeof value === "string"
                    ) {
                      return option === value;
                    }
                    if (
                      typeof option !== "string" &&
                      typeof value !== "string"
                    ) {
                      return (
                        option.attributeId === value.attributeId &&
                        arraysEqual(
                          option.refAttributeId || [],
                          value.refAttributeId || []
                        )
                      );
                    }
                    return false;
                  }}
                  value={toRecipients}
                  onChange={(event, newValue) => {
                    setToRecipients(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="TO Recipients"
                      placeholder="Type or select"
                      size="small"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={
                          typeof option === "string"
                            ? option
                            : `${option.attributeId}-${JSON.stringify(option.refAttributeId || [])}`
                        }
                        label={
                          typeof option === "string" ? option : option.label
                        }
                        {...getTagProps({ index })}
                        size="small"
                      />
                    ))
                  }
                />
              </FormControl>
            </Box>

            {/* CC Recipients */}
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth size="small">
                <Autocomplete
                  multiple
                  freeSolo
                  size="small"
                  id="cc-recipients-autocomplete"
                  options={fieldOptions.filter(
                    (option) => option.type === "email"
                  )}
                  getOptionLabel={(option) =>
                    typeof option === "string" ? option : option.label
                  }
                  isOptionEqualToValue={(option, value) => {
                    if (
                      typeof option === "string" &&
                      typeof value === "string"
                    ) {
                      return option === value;
                    }
                    if (
                      typeof option !== "string" &&
                      typeof value !== "string"
                    ) {
                      return (
                        option.attributeId === value.attributeId &&
                        arraysEqual(
                          option.refAttributeId || [],
                          value.refAttributeId || []
                        )
                      );
                    }
                    return false;
                  }}
                  value={ccRecipients}
                  onChange={(event, newValue) => {
                    setCcRecipients(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="CC Recipients"
                      placeholder="Type or select"
                      size="small"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={
                          typeof option === "string"
                            ? option
                            : `${option.attributeId}-${JSON.stringify(option.refAttributeId || [])}`
                        }
                        label={
                          typeof option === "string" ? option : option.label
                        }
                        {...getTagProps({ index })}
                        size="small"
                      />
                    ))
                  }
                />
              </FormControl>
            </Box>

            {/* Target Entity */}
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth size="small">
                <Autocomplete
                  freeSolo
                  size="small"
                  id="target-entity-autocomplete"
                  options={fieldOptions.filter(
                    (option) => option.type === "email"
                  )}
                  getOptionLabel={(option) =>
                    typeof option === "string" ? option : option.label
                  }
                  isOptionEqualToValue={(option, value) => {
                    if (
                      typeof option === "string" &&
                      typeof value === "string"
                    ) {
                      return option === value;
                    }
                    if (
                      typeof option !== "string" &&
                      typeof value !== "string"
                    ) {
                      return (
                        option.attributeId === value.attributeId &&
                        arraysEqual(
                          option.refAttributeId || [],
                          value.refAttributeId || []
                        )
                      );
                    }
                    return false;
                  }}
                  value={targetEntity}
                  onChange={(event, newValue) => {
                    setTargetEntity(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Target Entity"
                      placeholder="Type or select"
                      size="small"
                    />
                  )}
                />
              </FormControl>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Date picker */}
      <Dialog
        open={datePickerOpen}
        onClose={() => setDatePickerOpen(false)}
        maxWidth="xs"
      >
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
              backgroundColor: "#f8f9fa",
              p: 1,
              borderRadius: 1,
            }}
          >
            <IconButton onClick={() => changeCalendarMonth(-1)}>
              <ChevronLeft />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              {calendarDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Typography>
            <IconButton onClick={() => changeCalendarMonth(1)}>
              <ChevronRight />
            </IconButton>
          </Box>

          <Grid container spacing={0} columns={7}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <Grid item xs={1} key={d}>
                <Box
                  sx={{
                    textAlign: "center",
                    fontSize: 12,
                    color: "#666",
                    fontWeight: 500,
                  }}
                >
                  {d}
                </Box>
              </Grid>
            ))}
            {generateCalendarDays()}
          </Grid>

          <DialogActions>
            <Button onClick={() => setDatePickerOpen(false)}>Cancel</Button>
            <Button
              onClick={() => setDatePickerOpen(false)}
              variant="contained"
            >
              OK
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Time picker */}
      <Dialog
        open={timePickerOpen}
        onClose={() => setTimePickerOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, fontSize: "1rem" }}>Select Time</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pb: 1 }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              value={selectedTime ? dayjs(selectedTime, "hh:mm A") : null}
              onChange={handleTimeChange}
              format="hh:mm a"
              slotProps={{
                actionBar: { actions: [] },
                textField: {
                  size: "small",
                  variant: "outlined",
                  inputProps: { "aria-required": "false" },
                  "aria-label": "Select time for reminder",
                },
              }}
            />
          </LocalizationProvider>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              size="small"
              onClick={() => setTimePickerOpen(false)}
              variant="outlined"
            >
              Cancel
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Custom recurrence */}
      <Dialog
        open={customRecurrenceOpen}
        onClose={() => setCustomRecurrenceOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontSize: 18,
            fontWeight: 600,
            pb: 1,
            borderBottom: "1px solid #eee",
          }}
        >
          Custom recurrence
        </DialogTitle>

        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            pt: 3,
          }}
        >
          {/* Repeat every */}
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Repeat every
            </Typography>

            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                type="number"
                value={repeatEvery}
                onChange={(e) => setRepeatEvery(Number(e.target.value))}
                size="small"
                sx={{ width: 100 }}
                inputProps={{ min: 1 }}
              />

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <Select
                  value={repeatPeriod}
                  onChange={handlePeriodChange}
                >
                  <MenuItem value="day">day</MenuItem>
                  <MenuItem value="week">week</MenuItem>
                  <MenuItem value="month">month</MenuItem>
                  <MenuItem value="year">year</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Weekly days selection */}
          {repeatPeriod === "week" && (
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Repeat on
              </Typography>

              <Grid container spacing={1}>
                {daysOfWeek.map((day, index) => (
                  <Grid item key={day}>
                    <Chip
                      label={day.substring(0, 3)}
                      onClick={() => handleDayToggle(index)}
                      color={selectedDays[index] ? "primary" : "default"}
                      variant={selectedDays[index] ? "filled" : "outlined"}
                      clickable
                      sx={{ borderRadius: 1, minWidth: 50 }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Monthly options */}
          {repeatPeriod === "month" && (
            <FormControl fullWidth size="small">
              <Select
                value={monthlyOption}
                onChange={(e) => setMonthlyOption(e.target.value)}
              >
                <MenuItem value="first-tuesday">
                  Monthly on the first Tuesday
                </MenuItem>
                <MenuItem value="second-tuesday">
                  Monthly on the second Tuesday
                </MenuItem>
                <MenuItem value="third-tuesday">
                  Monthly on the third Tuesday
                </MenuItem>
                <MenuItem value="last-tuesday">
                  Monthly on the last Tuesday
                </MenuItem>
                <MenuItem value="custom-dates">Custom dates and times</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Yearly options */}
          {repeatPeriod === "year" && (
            <FormControl fullWidth size="small">
              <Select
                value={yearlyOption}
                onChange={(e) => setYearlyOption(e.target.value)}
              >
                <MenuItem value="same-day">On the same day each year</MenuItem>
                <MenuItem value="custom-dates">Custom dates and times</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Custom dates and times section - for both monthly and yearly */}
          {((repeatPeriod === "month" && monthlyOption === "custom-dates") ||
           (repeatPeriod === "year" && yearlyOption === "custom-dates")) && (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Select dates and times
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setCustomDateTimePickerOpen(true)}
                >
                  Add Date
                </Button>
              </Box>

              {customDateTimes.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                  No dates added yet. Click "Add Date" to schedule.
                </Typography>
              ) : (
                <List dense>
                  {customDateTimes.map((dateTime, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={formatDate(dateTime.date)}
                        secondary={formatTime(dateTime.time)}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleRemoveCustomDateTime(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}

          {/* Ends Section */}
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Ends
            </Typography>

            <RadioGroup
              value={endsOption}
              onChange={(e) => setEndsOption(e.target.value)}
            >
              <FormControlLabel
                value="never"
                control={<Radio size="small" />}
                label="Never"
              />

              <FormControlLabel
                value="on"
                control={<Radio size="small" />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    On
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setDatePickerOpen(true)}
                      sx={{
                        width: 160,
                        justifyContent: "flex-start",
                        backgroundColor: "#f9f9f9",
                        borderColor: "#ccc",
                        color: "#333",
                        textTransform: "none",
                      }}
                      disabled={endsOption !== "on"}
                    >
                      {endDate
                        ? new Date(endDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Select date"}
                    </Button>
                  </Box>
                }
              />

              <FormControlLabel
                value="after"
                control={<Radio size="small" />}
                label={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 1,
                    }}
                  >
                    After
                    <TextField
                      type="number"
                      size="small"
                      sx={{ width: 100 }}
                      value={occurrences}
                      onChange={(e) => setOccurrences(Number(e.target.value))}
                      disabled={endsOption !== "after"}
                      inputProps={{ min: 1 }}
                    />
                    occurrences
                  </Box>
                }
              />
            </RadioGroup>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #eee" }}>
          <Button onClick={() => setCustomRecurrenceOpen(false)}>Cancel</Button>
          <Button onClick={handleCustomRecurrenceSave} variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Custom date-time picker dialog */}
      <Dialog
        open={customDateTimePickerOpen}
        onClose={() => setCustomDateTimePickerOpen(false)}
        maxWidth="xs"
      >
        <DialogTitle sx={{ pb: 1 }}>Add Date and Time</DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
                backgroundColor: "#f8f9fa",
                p: 1,
                borderRadius: 1,
              }}
            >
              <IconButton onClick={() => changeCustomCalendarMonth(-1)}>
                <ChevronLeft />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {customCalendarDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </Typography>
              <IconButton onClick={() => changeCustomCalendarMonth(1)}>
                <ChevronRight />
              </IconButton>
            </Box>

            <Grid container spacing={0} columns={7}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <Grid item xs={1} key={d}>
                  <Box
                    sx={{
                      textAlign: "center",
                      fontSize: 12,
                      color: "#666",
                      fontWeight: 500,
                    }}
                  >
                    {d}
                  </Box>
                </Grid>
              ))}
              {generateCustomCalendarDays()}
            </Grid>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Select time
            </Typography>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker
                value={dayjs(currentCustomTime, "hh:mm A")}
                onChange={handleCustomTimeChange}
                format="hh:mm a"
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setCustomDateTimePickerOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddCustomDateTime} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

