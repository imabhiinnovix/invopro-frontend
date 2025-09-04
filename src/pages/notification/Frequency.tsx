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
  TextField,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Grid,
  Chip,
  InputLabel,
  Autocomplete,
} from "@mui/material";
import {
  Close as CloseIcon,
  AccessTime as AccessTimeIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronLeft,
  ChevronRight,
  CalendarMonthOutlined,
} from "@mui/icons-material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import useGet from "../../hooks/useGet";
import { GET } from "../../services/apiRoutes";
import CustomRecurrence from "./Frequency/CustomRecurrence";

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
  // console.log("fieldOptions:", fieldOptions);
  const [open, setOpen] = useState(false);
  const [allDay, setAllDay] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(() => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  });
  const [repeatOption, setRepeatOption] = useState("Do not repeat");
  const [customRecurrenceOpen, setCustomRecurrenceOpen] = useState(false);

  // New state variables for additional fields
  const [template, setTemplate] = useState("");
  const [method, setMethod] = useState("");
  const [ackRequired, setAckRequired] = useState(false);
  const [attachmentRequired, setAttachmentRequired] = useState(false);
  const [toRecipients, setToRecipients] = useState([]);
  const [ccRecipients, setCcRecipients] = useState([]);
  const [acknowledgeTo, setAcknowledgeTo] = useState([]);
  const [targetEntity, setTargetEntity] = useState("");

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
  const [monthlyOption, setMonthlyOption] = useState("");
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

  const mediumList = useGet(["mediumList"], `${GET.MEDIUM_LIST}`, true);
  const templateList = useGet(["templateList"], `${GET.TEMPLATE_LIST}`, true);

  /* -------- helpers -------- */
  const formatDate = (d) =>
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const changeCalendarMonth = (delta) => {
    setCalendarDate((d) => {
      const next = new Date(d);
      next.setMonth(d.getMonth() + delta);
      return next;
    });
  };

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

  // Generate dynamic repeat options based on selected date
  const getRepeatOptions = () => {
    const dayOfWeek = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const dayOfMonth = selectedDate.getDate();
    const month = selectedDate.toLocaleDateString("en-US", { month: "long" });

    // Helper function to get ordinal occurrence
    const numberToWord = (n) => {
      const words = ["first", "second", "third", "fourth", "fifth"];
      return words[n - 1] || n;
    };

    const getOrdinalOccurrence = (date) => {
      const day = date.getDate();
      const weekday = date.getDay();
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const firstWeekday = firstDayOfMonth.getDay();
      const offset = (weekday - firstWeekday + 7) % 7;
      const occurrenceNum = Math.floor((day - 1 - offset) / 7) + 1;
      const lastDayOfMonth = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0
      );
      const lastWeekday = lastDayOfMonth.getDay();
      const lastOffset = (lastWeekday - weekday + 7) % 7;
      const isLast = lastDayOfMonth.getDate() - day < 7;
      return {
        occurrence: isLast ? "last" : numberToWord(occurrenceNum),
        weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
      };
    };

    const { occurrence, weekday } = getOrdinalOccurrence(selectedDate);

    return [
      "Does not repeat",
      "Daily",
      `Weekly on ${dayOfWeek}`,
      `Monthly on the ${occurrence} ${weekday}`,
      `Annually on ${month} ${dayOfMonth}`,
      "Every weekday (Monday to Friday)",
      "Custom...",
    ];
  };

  // Initialize selected days when opening custom recurrence
  const initializeSelectedDays = () => {
    const dayIndex = selectedDate.getDay();
    const newSelectedDays = [...selectedDays];
    newSelectedDays.fill(false);
    newSelectedDays[dayIndex] = true;
    setSelectedDays(newSelectedDays);

    // Set default monthly option
    const numberToWord = (n) => {
      const words = ["first", "second", "third", "fourth", "fifth"];
      return words[n - 1] || n;
    };

    const getOrdinalOccurrence = (date) => {
      const day = date.getDate();
      const weekday = date.getDay();
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const firstWeekday = firstDayOfMonth.getDay();
      const offset = (weekday - firstWeekday + 7) % 7;
      const occurrenceNum = Math.floor((day - 1 - offset) / 7) + 1;
      const lastDayOfMonth = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0
      );
      const lastWeekday = lastDayOfMonth.getDay();
      const lastOffset = (lastWeekday - weekday + 7) % 7;
      const isLast = lastDayOfMonth.getDate() - day < 7;
      return {
        occurrence: isLast ? "last" : numberToWord(occurrenceNum),
        weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
      };
    };

    const { occurrence, weekday } = getOrdinalOccurrence(selectedDate);
    const monthlyOptions = [
      `Monthly on day ${selectedDate.getDate()}`,
      `Monthly on the ${occurrence} ${weekday}`,
    ];
    setMonthlyOption(monthlyOptions[0]);
  };

  /* -------- handlers -------- */
  const handleOpenDialog = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSave = () => {
    const formattedToRecipients = formatRecipients(toRecipients);
    const formattedCcRecipients = formatRecipients(ccRecipients);
    const formattedAcknowledgeTo = formatRecipients(acknowledgeTo);

    // Prepare the data to be logged
    const saveData = {
      date: formatDate(selectedDate),
      // time: allDay ? "All day" : selectedTime,
      repeat: repeatOption,
      template,
      method,
      ackRequired,
      attachmentRequired,
      toRecipients: formattedToRecipients,
      ccRecipients: formattedCcRecipients,
      acknowledgeTo: formattedAcknowledgeTo,
      targetEntity,
    };
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
    }
  };

  const handleTimeChange = (newValue) => {
    if (newValue) {
      setSelectedTime(newValue.format("hh:mm A"));
    } else {
      setSelectedTime("");
    }
    setTimePickerOpen(false);
  };

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
            attributeId: recipient.attributeId,
          };
          if (
            recipient.refAttributeId &&
            Array.isArray(recipient.refAttributeId) &&
            recipient.refAttributeId.length > 0
          ) {
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

  /* -------- render -------- */
  return (
    <Box sx={{ p: 3, display: "flex", justifySelf: "flex-end" }}>
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
            <CalendarMonthOutlined sx={{ color: "#666" }} fontSize="small" />
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
              <>
                <AccessTimeIcon sx={{ color: "#666" }} fontSize="small" />
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
              </>
            )}
          </Box>

          {/* All day + Repeat in same row */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, pl: 4 }}>
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
            <Box sx={{ display: "flex", gap: 2, mt: 2, alignItems: "center" }}>
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
                  onChange={(event, newValue) => setTargetEntity(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Sent To (Group)"
                      placeholder="Type or select"
                      size="small"
                    />
                  )}
                />
              </FormControl>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={attachmentRequired}
                      onChange={(e) => setAttachmentRequired(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Attachment"
                  sx={{ mb: "35px !important" }}
                />
              </Box>
            </Box>

            {/* Acknowledge To */}
            <Box sx={{ mt: 1 }}>
              <FormControl fullWidth size="small">
                <Autocomplete
                  multiple
                  freeSolo
                  size="small"
                  id="acknowledge-to"
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
                  value={acknowledgeTo}
                  onChange={(event, newValue) => {
                    setAcknowledgeTo(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Acknowledge To"
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

            {/* TO Recipients */}
            <Box sx={{ mt: 1 }}>
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
            <Box sx={{ mt: 1 }}>
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
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Cancel{" "}
          </Button>
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
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pb: 1,
            mt: 2,
          }}
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

      {/* Custom Recurrence Component */}
      <CustomRecurrence
        open={customRecurrenceOpen}
        onClose={() => setCustomRecurrenceOpen(false)}
        repeatEvery={repeatEvery}
        setRepeatEvery={setRepeatEvery}
        repeatPeriod={repeatPeriod}
        setRepeatPeriod={setRepeatPeriod}
        monthlyOption={monthlyOption}
        setMonthlyOption={setMonthlyOption}
        endsOption={endsOption}
        setEndsOption={setEndsOption}
        endDate={endDate}
        setEndDate={setEndDate}
        occurrences={occurrences}
        setOccurrences={setOccurrences}
        selectedDays={selectedDays}
        setSelectedDays={setSelectedDays}
        selectedDate={selectedDate}
        onSave={(txt) => {
          setRepeatOption(txt);
          setCustomRecurrenceOpen(false);
        }}
      />
    </Box>
  );
}
