import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  Button,
  Alert,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Select,
  MenuItem,
  Chip,
  IconButton,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Modal,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { GridDeleteIcon } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import useGet from "../../hooks/useGet";
import usePost from "../../hooks/usePost";
import usePut from "../../hooks/usePut";
import useDelete from "../../hooks/useDelete";
import { GET, POST, PUT, DELETE } from "../../services/apiRoutes";
import { STYLE_GUIDE } from "../../styles";
import { toast } from "react-toastify";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

// Constants remain the same
const MONTHS = [
  { id: "Jan", label: "January" },
  { id: "Feb", label: "February" },
  { id: "Mar", label: "March" },
  { id: "Apr", label: "April" },
  { id: "May", label: "May" },
  { id: "Jun", label: "June" },
  { id: "Jul", label: "July" },
  { id: "Aug", label: "August" },
  { id: "Sep", label: "September" },
  { id: "Oct", label: "October" },
  { id: "Nov", label: "November" },
  { id: "Dec", label: "December" },
];
const DAYS = Array.from({ length: 31 }, (_, i) => ({
  id: (i + 1).toString(),
  label: (i + 1).toString(),
}));
const WEEK_OPTIONS = [
  { id: "First", label: "First" },
  { id: "Second", label: "Second" },
  { id: "Third", label: "Third" },
  { id: "Fourth", label: "Fourth" },
  { id: "Last", label: "Last" },
  { id: "All", label: "All" },
];

// Styles remain the same
const styles = {
  formRow: {
    display: "flex",
    gap: STYLE_GUIDE.SPACING.s4,
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: STYLE_GUIDE.SPACING.s4,
    width: "100%",
    "@media (max-width: 600px)": {
      flexDirection: "column",
      alignItems: "flex-start",
    },
  },
  textField: {
    minWidth: "120px",
    maxWidth: "300px",
    "& .MuiInputBase-root": {
      fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
    },
  },
  select: {
    minWidth: "120px",
    maxWidth: "300px",
    "& .MuiInputBase-root": {
      fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
    },
  },
  radio: {
    color: STYLE_GUIDE.COLORS.purple,
    "&.Mui-checked": {
      color: STYLE_GUIDE.COLORS.purple,
    },
  },
  chip: (selected) => ({
    backgroundColor: selected
      ? STYLE_GUIDE.COLORS.primaryLight
      : STYLE_GUIDE.COLORS.white,
    color: selected ? STYLE_GUIDE.COLORS.white : STYLE_GUIDE.COLORS.black,
    fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
    transition: "all 0.3s",
    "&:hover": {
      backgroundColor: selected
        ? STYLE_GUIDE.COLORS.primaryDark
        : STYLE_GUIDE.COLORS.backgroundGray,
    },
  }),
  output: {
    backgroundColor: STYLE_GUIDE.COLORS.WhiteLight,
    border: `1px solid ${STYLE_GUIDE.COLORS.borderPrimary}`,
    borderRadius: STYLE_GUIDE.SPACING.s1,
    padding: STYLE_GUIDE.SPACING.s4,
    fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.mono,
    wordBreak: "break-all",
    fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
    color: STYLE_GUIDE.COLORS.primaryLight,
  },
  reminderContainer: {
    marginBottom: STYLE_GUIDE.SPACING.s6,
    display: "flex",
    flexDirection: "column",
    gap: STYLE_GUIDE.SPACING.s3,
  },
  dataGridContainer: {
    width: "100%",
    "& .MuiDataGrid-cell": {
      fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
    },
    "& .MuiDataGrid-columnHeader": {
      fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
      fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
    },
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: STYLE_GUIDE.SPACING.s6,
  },
  viewDialogContent: {
    display: "flex",
    flexDirection: "column",
    gap: STYLE_GUIDE.SPACING.s3,
  },
  viewDetailRow: {
    display: "flex",
    borderBottom: `1px solid ${STYLE_GUIDE.COLORS.borderLight}`,
    paddingBottom: STYLE_GUIDE.SPACING.s2,
    marginBottom: STYLE_GUIDE.SPACING.s2,
  },
  viewDetailLabel: {
    fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
    minWidth: "180px",
    color: STYLE_GUIDE.COLORS.textDarkGray,
  },
  viewDetailValue: {
    color: STYLE_GUIDE.COLORS.textPrimary,
  },
};

// RRuleGenerator Component
const RRuleGenerator = ({
  onChange,
  value,
  config = {},
  fieldOptions = [],
  notificationTypeId,
}) => {
  const defaultConfig = {
    repeat: ["Yearly", "Monthly", "Weekly", "Daily"],
    yearly: "on",
    monthly: "on",
    end: ["Never", "After", "On date"],
    weekStartsOnSunday: false,
    hideError: false,
    ...config,
  };
  const weekdays = defaultConfig.weekStartsOnSunday
    ? [
        { id: "Sunday", label: "Sunday" },
        { id: "Monday", label: "Monday" },
        { id: "Tuesday", label: "Tuesday" },
        { id: "Wednesday", label: "Wednesday" },
        { id: "Thursday", label: "Thursday" },
        { id: "Friday", label: "Friday" },
        { id: "Saturday", label: "Saturday" },
      ]
    : [
        { id: "Monday", label: "Monday" },
        { id: "Tuesday", label: "Tuesday" },
        { id: "Wednesday", label: "Wednesday" },
        { id: "Thursday", label: "Thursday" },
        { id: "Friday", label: "Friday" },
        { id: "Saturday", label: "Saturday" },
        { id: "Sunday", label: "Sunday" },
      ];
  const dayAbbrevs = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  const backendDayIndices = defaultConfig.weekStartsOnSunday
    ? {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      }
    : {
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
        Sunday: 0,
      };

  // State
  const [startDate, setStartDate] = useState("");
  const [repeatType, setRepeatType] = useState("");
  const [yearlyType, setYearlyType] = useState(
    defaultConfig.yearly === "on the" ? "onthe" : "on"
  );
  const [yearlyMonths, setYearlyMonths] = useState([]);
  const [yearlyDays, setYearlyDays] = useState([]);
  const [yearlyWeeks, setYearlyWeeks] = useState([]);
  const [yearlyWeekDays, setYearlyWeekDays] = useState([]);
  const [yearlyWeekMonths, setYearlyWeekMonths] = useState([]);
  const [monthlyType, setMonthlyType] = useState(
    defaultConfig.monthly === "on the" ? "onthe" : "on"
  );
  const [monthlyDays, setMonthlyDays] = useState([]);
  const [monthlyWeeks, setMonthlyWeeks] = useState([]);
  const [monthlyWeekDays, setMonthlyWeekDays] = useState([]);
  const [weeklyDays, setWeeklyDays] = useState([]);
  const [interval, setInterval] = useState(1);
  const [endType, setEndType] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endAfter, setEndAfter] = useState(1);
  const [frequencyApiSuccess, setFrequencyApiSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [acknowledgeChecked, setAcknowledgeChecked] = useState(false);
  const [attachedChecked, setAttachedChecked] = useState(false);
  const [time, setTime] = useState("");
  // Updated state for recipients
  const [template, setTemplate] = useState("");
  const [method, setMethod] = useState("");
  const [toRecipients, setToRecipients] = useState([]);
  const [ccRecipients, setCcRecipients] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReminderId, setSelectedReminderId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState(null);

  // New states for view functionality
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewingReminderId, setViewingReminderId] = useState(null);
  const [viewingReminderData, setViewingReminderData] = useState(null);

  // Reset form function
  const resetForm = () => {
    setStartDate("");
    setRepeatType("");
    setYearlyType(defaultConfig.yearly === "on the" ? "onthe" : "on");
    setYearlyMonths([]);
    setYearlyDays([]);
    setYearlyWeeks([]);
    setYearlyWeekDays([]);
    setYearlyWeekMonths([]);
    setMonthlyType(defaultConfig.monthly === "on the" ? "onthe" : "on");
    setMonthlyDays([]);
    setMonthlyWeeks([]);
    setMonthlyWeekDays([]);
    setWeeklyDays([]);
    setInterval(1);
    setEndType("");
    setEndDate("");
    setEndAfter(1);
    setAcknowledgeChecked(false);
    setAttachedChecked(false);
    setTime("");
    setTemplate("");
    setMethod("");
    setToRecipients([]);
    setCcRecipients([]);
  };

  // API Hooks
  const templateList = useGet(["templateList"], `${GET.TEMPLATE_LIST}`, true);
  const mediumList = useGet(["mediumList"], `${GET.MEDIUM_LIST}`, true);
  const createFrequency = usePost(["createFrequency"]);
  const updateFrequency = usePut(["updateFrequency"]);
  const deleteFrequency = useDelete(
    ["deleteFrequency"],
    (data) => {
      if (data?.success) {
        refetch();
        handleCloseDialog();
        setSnackbar({
          open: true,
          message: "Reminder deleted successfully!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Failed to delete reminder.",
          severity: "error",
        });
      }
    },
    true
  );
  const { data: frequencyListData, refetch } = useGet(
    ["frequencyList", notificationTypeId, frequencyApiSuccess],
    frequencyApiSuccess
      ? `${GET.FREQUENCY_LIST}?notificationTypeId=${notificationTypeId}`
      : "",
    !!frequencyApiSuccess
  );
  const { data: reminderData, refetch: refetchReminder } = useGet(
    ["reminder", editingReminderId],
    editingReminderId ? `${GET.FREQUENCY_DETAIL}/${editingReminderId}` : "",
    !!editingReminderId
  );

  // New API hook for viewing reminder details
  const { data: viewReminderData, refetch: refetchViewReminder } = useGet(
    ["viewReminder", viewingReminderId],
    viewingReminderId ? `${GET.FREQUENCY_DETAIL}/${viewingReminderId}` : "",
    !!viewingReminderId
  );

  useEffect(() => {
    if (notificationTypeId) {
      setFrequencyApiSuccess(true);
      refetch();
    }
  }, [notificationTypeId, refetch]);
  useEffect(() => {
    if (notificationTypeId && frequencyApiSuccess) {
      refetch();
    }
  }, [notificationTypeId, frequencyApiSuccess, refetch]);

  // Effect to handle view reminder data
  useEffect(() => {
    if (viewReminderData?.data && openViewDialog) {
      setViewingReminderData(viewReminderData.data);
    }
  }, [viewReminderData, openViewDialog]);

 
useEffect(() => {
    if (reminderData?.data && editMode) {
      const data = reminderData.data;
      setStartDate(
        data.schedulerStartDate
          ? new Date(data.schedulerStartDate).toISOString().split("T")[0]
          : ""
      );
      setRepeatType(
        data.frequency
          ? data.frequency.charAt(0).toUpperCase() + data.frequency.slice(1)
          : ""
      );
      setInterval(data.interval || 1);
      setAcknowledgeChecked(data.acknowledgeRequired || false);
      setAttachedChecked(data.attachmentRequired || false);
      setTime(data.triggerTime || "");
      // Set template and method
      setTemplate(data.templateId?._id || "");
      setMethod(data.medium?._id || "");
      // Set TO and CC recipients
      const toRecipients = [];
      const ccRecipients = [];
      // Process recipients_to
      if (data.recipients_to && Array.isArray(data.recipients_to)) {
        data.recipients_to.forEach((recipient) => {
          if (recipient.customEmails && Array.isArray(recipient.customEmails)) {
            recipient.customEmails.forEach((email) => {
              toRecipients.push({
                value: email,
                label: email,
                isCustom: true,
              });
            });
          } else if (recipient.attributeId) {
            const fieldOption = fieldOptions.find(
              (opt) => opt.attributeId === recipient.attributeId
            );
            if (fieldOption) {
              toRecipients.push(fieldOption);
            } else {
              toRecipients.push({
                value: recipient.attributeId,
                label: recipient.attributeId,
              });
            }
          }
        });
      }
      // Process recipients_cc
      if (data.recipients_cc && Array.isArray(data.recipients_cc)) {
        data.recipients_cc.forEach((recipient) => {
          if (recipient.customEmails && Array.isArray(recipient.customEmails)) {
            recipient.customEmails.forEach((email) => {
              ccRecipients.push({
                value: email,
                label: email,
                isCustom: true,
              });
            });
          } else if (recipient.attributeId) {
            const fieldOption = fieldOptions.find(
              (opt) => opt.attributeId === recipient.attributeId
            );
            if (fieldOption) {
              ccRecipients.push(fieldOption);
            } else {
              ccRecipients.push({
                value: recipient.attributeId,
                label: recipient.attributeId,
              });
            }
          }
        });
      }
      setToRecipients(toRecipients);
      setCcRecipients(ccRecipients);
      // Handle end conditions
      if (data.maxOccurrences) {
        setEndType("After");
        setEndAfter(parseInt(data.maxOccurrences) || 1);
      } else if (data.schedulerEndDate) {
        setEndType("On date");
        setEndDate(
          new Date(data.schedulerEndDate).toISOString().split("T")[0] || ""
        );
      } else {
        setEndType("Never");
      }
      // Handle recurrence details
      if (data.frequency === "yearly" && data.dayOfMonth?.length > 0) {
        setYearlyType("on");
        setYearlyMonths(
          data.monthOfYear?.length > 0
            ? data.monthOfYear.map((m) => MONTHS[m - 1]?.id || "Jan")
            : []
        );
        setYearlyDays(
          data.dayOfMonth?.length > 0
            ? data.dayOfMonth.map((d) => d.toString())
            : []
        );
      } else if (data.frequency === "yearly" && data.weekOfMonth?.length > 0) {
        setYearlyType("onthe");
        setYearlyWeeks(
          data.weekOfMonth?.length > 0
            ? data.weekOfMonth.map((w) =>
                w === -1 ? "Last" : WEEK_OPTIONS[w - 1]?.id || "First"
              )
            : []
        );
        setYearlyWeekDays(
          data.daysOfWeek?.length > 0
            ? data.daysOfWeek
                .map(
                  (d) =>
                    weekdays[defaultConfig.weekStartsOnSunday ? d : d % 7]?.id
                )
                .filter((d) => d)
            : []
        );
        setYearlyWeekMonths(
          data.monthOfYear?.length > 0
            ? data.monthOfYear.map((m) => MONTHS[m - 1]?.id || "Jan")
            : []
        );
      }
      // Updated monthly recurrence handling
      if (data.frequency === "monthly") {
        // Prioritize "on" pattern if dayOfMonth exists
        if (data.dayOfMonth && data.dayOfMonth.length > 0) {
          setMonthlyType("on");
          setMonthlyDays(
            data.dayOfMonth.map((d) => d.toString())
          );
          // Clear the "on the" related states
          setMonthlyWeeks([]);
          setMonthlyWeekDays([]);
        } 
        // Use "on the" pattern if weekOfMonth exists
        else if (data.weekOfMonth && data.weekOfMonth.length > 0) {
          setMonthlyType("onthe");
          setMonthlyWeeks(
            data.weekOfMonth.map((w) =>
              w === -1 ? "Last" : WEEK_OPTIONS[w - 1]?.id || "First"
            )
          );
          setMonthlyWeekDays(
            data.daysOfWeek?.length > 0
              ? data.daysOfWeek
                  .map(
                    (d) =>
                      weekdays[defaultConfig.weekStartsOnSunday ? d : d % 7]?.id
                  )
                  .filter((d) => d)
              : []
          );
          // Clear the "on" related state
          setMonthlyDays([]);
        }
        // Fallback if neither exists
        else {
          setMonthlyType("on");
          setMonthlyDays([]);
          setMonthlyWeeks([]);
          setMonthlyWeekDays([]);
        }
      }
      if (data.frequency === "weekly" && data.daysOfWeek?.length > 0) {
        setWeeklyDays(
          data.daysOfWeek
            .map(
              (d) => weekdays[defaultConfig.weekStartsOnSunday ? d : d % 7]?.id
            )
            .filter((d) => d) || []
        );
      }
    }
  }, [reminderData, editMode, fieldOptions]);
  // Handlers
  const handleWeeklyDayToggle = (day) => {
    setWeeklyDays((prev) => {
      const newDays = prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort(
            (a, b) =>
              weekdays.findIndex((w) => w.id === a) -
              weekdays.findIndex((w) => w.id === b)
          );
      return newDays.length > 0 ? newDays : prev;
    });
  };

  const handleEditReminder = (reminder) => {
    setEditingReminderId(reminder._id);
    setEditMode(true);
    refetchReminder();
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditingReminderId(null);
    resetForm();
  };

  // New handler for view button
  const handleViewReminder = (reminder) => {
    setViewingReminderId(reminder._id);
    setOpenViewDialog(true);
    refetchViewReminder();
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setViewingReminderId(null);
    setViewingReminderData(null);
  };

  const handleAddReminder = async () => {
    const rrule = generateRRule();
    if (!rrule) {
      setSuccessMessage("Please select valid options to generate an RRule.");
      setTimeout(() => setSuccessMessage(null), 3000);
      return;
    }
    if (!template || !method) {
      setSuccessMessage("Please select a template and notification method.");
      setTimeout(() => setSuccessMessage(null), 3000);
      return;
    }

    let dayOfMonth = [];
    let weekOfMonth = [];
    let daysOfWeek = [];
    let monthOfYear = [];

    if (repeatType === "Monthly") {
      if (monthlyType === "on") {
        // Convert selected days to numbers
        dayOfMonth = monthlyDays.map((day) => parseInt(day));
      } else if (monthlyType === "onthe") {
        // Convert week selections to numbers (First=1, Second=2, etc., Last=-1)
        weekOfMonth = monthlyWeeks.map((week) => {
          if (week === "Last") return -1;
          return WEEK_OPTIONS.findIndex((opt) => opt.id === week) + 1;
        });
        // Convert weekday names to numbers using backend indices
        daysOfWeek = monthlyWeekDays
          .map((day) => backendDayIndices[day])
          .filter((idx) => idx !== undefined);
      }
    } else if (repeatType === "Weekly") {
      daysOfWeek = weeklyDays
        .map((day) => backendDayIndices[day])
        .filter((idx) => idx !== undefined);
    } else if (repeatType === "Yearly") {
      if (yearlyType === "on") {
        dayOfMonth = yearlyDays.map((day) => parseInt(day));
        monthOfYear = yearlyMonths.map(
          (m) => MONTHS.findIndex((month) => month.id === m) + 1
        );
      } else if (yearlyType === "onthe") {
        weekOfMonth = yearlyWeeks.map((week) => {
          if (week === "Last") return -1;
          return WEEK_OPTIONS.findIndex((opt) => opt.id === week) + 1;
        });
        daysOfWeek = yearlyWeekDays
          .map((day) => backendDayIndices[day])
          .filter((idx) => idx !== undefined);
        monthOfYear = yearlyWeekMonths.map(
          (m) => MONTHS.findIndex((month) => month.id === m) + 1
        );
      }
    }

    // Format recipients according to backend requirements
    const formatRecipients = (recipients) => {
      const result = [];
      const customEmails = [];
      const attributeIds = [];
      recipients.forEach((recipient) => {
        if (typeof recipient === "string") {
          // Check if it's an email format (contains '@')
          if (recipient.includes("@")) {
            customEmails.push(recipient);
          } else {
            attributeIds.push(recipient);
          }
        } else {
          // For objects, check if the label contains '@'
          if (recipient.label && recipient.label.includes("@")) {
            customEmails.push(recipient.label);
          } else {
            attributeIds.push(recipient.attributeId);
          }
        }
      });
      // Add all custom emails as a single object with array
      if (customEmails.length > 0) {
        result.push({ customEmails });
      }
      // Add each attribute ID as a separate object
      attributeIds.forEach((id) => {
        result.push({ attributeId: id });
      });
      return result;
    };
    const payload = {
      notificationTypeId,
      frequency: repeatType.toLowerCase(),
      schedulerStartDate: startDate,
      ...(endType === "On date" && { schedulerEndDate: endDate }),
      interval,

      ...(dayOfMonth.length > 0 && { dayOfMonth }),
      ...(weekOfMonth.length > 0 && { weekOfMonth }),
      ...(daysOfWeek.length > 0 && { daysOfWeek }),
      ...(monthOfYear.length > 0 && { monthOfYear }),
      repeatAnnually: repeatType === "Yearly",
      acknowledgeRequired: acknowledgeChecked,
      attachmentRequired: attachedChecked,
      recipients_to: formatRecipients(toRecipients),
      recipients_cc: formatRecipients(ccRecipients),
      medium: method,
      templateId: template,
      triggerTime: time || "",
      ...(endType === "After" && { maxOccurrences: endAfter.toString() }),
    };
    // Log the formatted payload for debugging
    console.log("Formatted payload:", JSON.stringify(payload, null, 2));
    try {
      if (editMode) {
        console.log("Updating reminder with ID:", editingReminderId);
        const response = await updateFrequency.mutateAsync({
          url: `${PUT.UPDATE_FREQUENCY}/${editingReminderId}`,
          payload,
        });
        if (response.success && response.data?._id) {
          toast.success(response.message);
          setEditMode(false);
          setEditingReminderId(null);
          refetch();
          resetForm();
        } else {
          throw new Error("Update failed");
        }
      } else {
        console.log("Creating new reminder");
        const response = await createFrequency.mutateAsync({
          url: `${POST.CREATE_FREQUENCY}`,
          payload,
        });
        if (response.success && response.data?._id) {
          setFrequencyApiSuccess(response.success);
          toast.success(response.message);
          refetch();
          resetForm();
        } else {
          toast.error(response.message);
          throw new Error("Creation failed");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setSnackbar({
        open: true,
        message: editMode
          ? "Failed to update reminder."
          : "Failed to create reminder.",
        severity: "error",
      });
    }
  };

  const handleDeleteReminder = (reminderId) => {
    setSelectedReminderId(reminderId);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReminderId(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedReminderId) {
      try {
        await deleteFrequency.mutate({
          url: `${DELETE.DELETE_FREQUENCY}/${selectedReminderId}`,
        });
      } catch (error) {
        console.error("Error deleting reminder:", error);
        setSnackbar({
          open: true,
          message: "Failed to delete reminder.",
          severity: "error",
        });
      }
    }
  };

  const parseRRule = (rruleString) => {
    try {
      const parts = rruleString.split(";");
      const rules = parts.reduce((acc, part) => {
        const [key, val] = part.split("=");
        return { ...acc, [key]: val };
      }, {});
      if (rules.FREQ) {
        setRepeatType(rules.FREQ.charAt(0) + rules.FREQ.slice(1).toLowerCase());
      }
      if (rules.INTERVAL) {
        setInterval(parseInt(rules.INTERVAL) || 1);
      }
      if (rules.COUNT) {
        setEndType("After");
        setEndAfter(parseInt(rules.COUNT) || 1);
      } else if (rules.UNTIL) {
        setEndType("On date");
        const until = rules.UNTIL.replace("T235959Z", "");
        setEndDate(
          `${until.slice(0, 4)}-${until.slice(4, 6)}-${until.slice(6, 8)}`
        );
      }
      if (rules.FREQ === "YEARLY" && rules.BYMONTH) {
        const monthIndices = rules.BYMONTH.split(",").map((m) => parseInt(m));
        const months = monthIndices
          .map((index) => MONTHS[index - 1]?.id)
          .filter((id) => id);
        setYearlyMonths(months.length > 0 ? months : []);
        setYearlyWeekMonths(months.length > 0 ? months : []);
      }
      if (rules.FREQ === "YEARLY" && rules.BYMONTHDAY) {
        const days = rules.BYMONTHDAY.split(",").filter((day) =>
          DAYS.some((d) => d.id === day)
        );
        setYearlyDays(days.length > 0 ? days : []);
      }
      if (rules.FREQ === "YEARLY" && rules.BYDAY) {
        const byDayRules = rules.BYDAY.split(",");
        const weeks = [];
        const weekDays = [];
        byDayRules.forEach((rule) => {
          const match = rule.match(/^([+-]?\d+)([A-Z]{2})$/);
          if (match) {
            const weekNum = parseInt(match[1]);
            const week =
              weekNum === -1 ? "Last" : WEEK_OPTIONS[weekNum - 1]?.id;
            const dayAbbrev = match[2];
            const dayIndex = dayAbbrevs.indexOf(dayAbbrev);
            const day = weekdays[dayIndex]?.id;
            if (week && !weeks.includes(week)) weeks.push(week);
            if (day && !weekDays.includes(day)) weekDays.push(day);
          }
        });
        setYearlyWeeks(weeks.length > 0 ? weeks : []);
        setYearlyWeekDays(weekDays.length > 0 ? weekDays : []);
      }
      if (rules.FREQ === "MONTHLY" && rules.BYMONTHDAY) {
        const days = rules.BYMONTHDAY.split(",").filter((day) =>
          DAYS.some((d) => d.id === day)
        );
        setMonthlyDays(days.length > 0 ? days : []);
      }
      if (rules.FREQ === "MONTHLY" && rules.BYDAY) {
        const byDayRules = rules.BYDAY.split(",");
        const weeks = [];
        const weekDays = [];
        byDayRules.forEach((rule) => {
          const match = rule.match(/^([+-]?\d+)([A-Z]{2})$/);
          if (match) {
            const weekNum = parseInt(match[1]);
            const week =
              weekNum === -1 ? "Last" : WEEK_OPTIONS[weekNum - 1]?.id;
            const dayAbbrev = match[2];
            const dayIndex = dayAbbrevs.indexOf(dayAbbrev);
            const day = weekdays[dayIndex]?.id;
            if (week && !weeks.includes(week)) weeks.push(week);
            if (day && !weekDays.includes(day)) weekDays.push(day);
          }
        });
        setMonthlyWeeks(weeks.length > 0 ? weeks : []);
        setMonthlyWeekDays(weekDays.length > 0 ? weekDays : []);
      }
      if (rules.FREQ === "WEEKLY" && rules.BYDAY) {
        const days = rules.BYDAY.split(",")
          .map((dayAbbrev) => {
            const dayIndex = dayAbbrevs.indexOf(dayAbbrev);
            return weekdays[dayIndex]?.id;
          })
          .filter((id) => id);
        setWeeklyDays(days.length > 0 ? days : []);
      }
    } catch (error) {
      if (!defaultConfig.hideError) {
        console.error("Error parsing RRule:", error);
      }
    }
  };

  const generateRRule = () => {
    if (!repeatType) return "";
    let rrule = `FREQ=${repeatType.toUpperCase()}`;
    switch (repeatType) {
      case "Yearly":
        if (yearlyType === "on") {
          const monthIndices = yearlyMonths
            .map((m) => MONTHS.findIndex((month) => month.id === m) + 1)
            .filter((index) => index > 0);
          if (monthIndices.length === 0) return "";
          rrule += `;BYMONTH=${monthIndices.join(",")}`;
          if (yearlyDays.length > 0) {
            rrule += `;BYMONTHDAY=${yearlyDays.join(",")}`;
          }
        } else {
          const monthIndices = yearlyWeekMonths
            .map((m) => MONTHS.findIndex((month) => month.id === m) + 1)
            .filter((index) => index > 0);
          if (monthIndices.length === 0) return "";
          rrule += `;BYMONTH=${monthIndices.join(",")}`;
          const dayRules = yearlyWeeks.flatMap((week) =>
            yearlyWeekDays.map((day) => {
              const weekdayIndex = weekdays.findIndex((w) => w.id === day);
              let weekNum = WEEK_OPTIONS.findIndex((w) => w.id === week) + 1;
              if (week === "Last") weekNum = -1;
              const dayAbbrev =
                dayAbbrevs[
                  defaultConfig.weekStartsOnSunday
                    ? weekdayIndex
                    : (weekdayIndex + 1) % 7
                ];
              return `${weekNum}${dayAbbrev}`;
            })
          );
          if (dayRules.length > 0) {
            rrule += `;BYDAY=${dayRules.join(",")}`;
          }
        }
        break;
      case "Monthly":
        if (monthlyType === "on") {
          if (monthlyDays.length === 0) return "";
          rrule += `;BYMONTHDAY=${monthlyDays.join(",")}`;
        } else {
          const dayRules = monthlyWeeks.flatMap((week) =>
            monthlyWeekDays.map((day) => {
              const weekdayIndex = weekdays.findIndex((w) => w.id === day);
              let weekNum = WEEK_OPTIONS.findIndex((w) => w.id === week) + 1;
              if (week === "Last") weekNum = -1;
              const dayAbbrev =
                dayAbbrevs[
                  defaultConfig.weekStartsOnSunday
                    ? weekdayIndex
                    : (weekdayIndex + 1) % 7
                ];
              return `${weekNum}${dayAbbrev}`;
            })
          );
          if (dayRules.length === 0) return "";
          rrule += `;BYDAY=${dayRules.join(",")}`;
        }
        break;
      case "Weekly":
        if (weeklyDays.length === 0) return "";
        const weeklyDayAbbrevs = weeklyDays.map((day) => {
          const index = weekdays.findIndex((w) => w.id === day);
          return dayAbbrevs[
            defaultConfig.weekStartsOnSunday ? index : (index + 1) % 7
          ];
        });
        rrule += `;BYDAY=${weeklyDayAbbrevs.join(",")}`;
        break;
      default:
        break;
    }
    if (interval > 1) {
      rrule += `;INTERVAL=${interval}`;
    }
    if (endType === "After") {
      rrule += `;COUNT=${endAfter}`;
    } else if (endType === "On date" && endDate) {
      rrule += `;UNTIL=${endDate.replace(/-/g, "")}T235959Z`;
    }
    return rrule;
  };

  useEffect(() => {
    if (value && value !== generateRRule()) {
      parseRRule(value);
    }
  }, [value]);

  useEffect(() => {
    const newRRule = generateRRule();
    onChange?.(newRRule);
  }, [
    startDate,
    repeatType,
    yearlyType,
    yearlyMonths,
    yearlyDays,
    yearlyWeeks,
    yearlyWeekDays,
    yearlyWeekMonths,
    monthlyType,
    monthlyDays,
    monthlyWeeks,
    monthlyWeekDays,
    weeklyDays,
    interval,
    endType,
    endDate,
    endAfter,
  ]);

  // Helper function to format recipients for display
  const formatRecipientsForDisplay = (recipients) => {
    if (!recipients || recipients.length === 0) return "None";

    return recipients
      .map((recipient) => {
        if (recipient.customEmails) {
          return recipient.customEmails.join(", ");
        } else if (recipient.attributeId) {
          const fieldOption = fieldOptions.find(
            (opt) => opt.attributeId === recipient.attributeId
          );
          return fieldOption ? fieldOption.label : recipient.attributeId;
        }
        return "Unknown";
      })
      .join(", ");
  };

  // Helper function to format recurrence details for display
  const formatRecurrenceDetails = (data) => {
    if (!data.frequency) return "Not set";

    let details =
      data.frequency.charAt(0).toUpperCase() + data.frequency.slice(1);

    if (data.interval && data.interval > 1) {
      details += ` (every ${data.interval} `;
      details +=
        data.frequency === "weekly"
          ? "weeks"
          : data.frequency === "monthly"
            ? "months"
            : data.frequency === "yearly"
              ? "years"
              : "";
      details += ")";
    }

    if (
      data.frequency === "yearly" &&
      data.monthOfYear &&
      data.monthOfYear.length > 0
    ) {
      const months = data.monthOfYear
        .map((m) => MONTHS[m - 1]?.label)
        .filter((m) => m)
        .join(", ");
      details += ` in ${months}`;

      if (data.dayOfMonth && data.dayOfMonth.length > 0) {
        details += ` on day(s) ${data.dayOfMonth.join(", ")}`;
      } else if (data.weekOfMonth && data.daysOfWeek) {
        const weeks = data.weekOfMonth
          .map((w) => (w === -1 ? "Last" : WEEK_OPTIONS[w - 1]?.label))
          .filter((w) => w)
          .join(", ");

        const days = data.daysOfWeek
          .map(
            (d) => weekdays[defaultConfig.weekStartsOnSunday ? d : d % 7]?.label
          )
          .filter((d) => d)
          .join(", ");

        details += ` on the ${weeks} ${days}`;
      }
    }

    if (
      data.frequency === "monthly" &&
      data.dayOfMonth &&
      data.dayOfMonth.length > 0
    ) {
      details += ` on day(s) ${data.dayOfMonth.join(", ")}`;
    } else if (
      data.frequency === "monthly" &&
      data.weekOfMonth &&
      data.daysOfWeek
    ) {
      const weeks = data.weekOfMonth
        .map((w) => (w === -1 ? "Last" : WEEK_OPTIONS[w - 1]?.label))
        .filter((w) => w)
        .join(", ");

      const days = data.daysOfWeek
        .map(
          (d) => weekdays[defaultConfig.weekStartsOnSunday ? d : d % 7]?.label
        )
        .filter((d) => d)
        .join(", ");

      details += ` on the ${weeks} ${days}`;
    }

    if (
      data.frequency === "weekly" &&
      data.daysOfWeek &&
      data.daysOfWeek.length > 0
    ) {
      const days = data.daysOfWeek
        .map(
          (d) => weekdays[defaultConfig.weekStartsOnSunday ? d : d % 7]?.label
        )
        .filter((d) => d)
        .join(", ");
      details += ` on ${days}`;
    }

    return details;
  };

  // Define columns for DataGrid
  const columns: GridColDef[] = [
    {
      field: "frequency",
      headerName: "Frequency",
      width: 120,
      valueGetter: (params) => params || "-",
    },
    {
      field: "schedulerStartDate",
      headerName: "Start Date",
      width: 150,
      valueGetter: (params) => {
        const date = params;
        return date ? new Date(date).toLocaleDateString() : "Not set";
      },
    },
    {
      field: "acknowledgeRequired",
      headerName: "Acknowledge Required",
      width: 150,
      valueGetter: (params) => (params ? "Yes" : "No"),
    },
    {
      field: "attachmentRequired",
      headerName: "Attachment Required",
      width: 150,
      valueGetter: (params) => (params ? "Yes" : "No"),
    },
    {
      field: "templateId",
      headerName: "Template",
      width: 180,
      valueGetter: (params) => {
        const template = params?.name;
        return template || "-";
      },
    },
    {
      field: "medium",
      headerName: "Notification Method",
      width: 180,
      valueGetter: (params) => {
        const medium = params?.medium;
        return medium || "-";
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Edit Reminder" placement="top">
            <IconButton
              color="primary"
              aria-label="edit reminder"
              onClick={() => handleEditReminder(params.row)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Reminder" placement="top">
            <IconButton
              color="primary"
              aria-label="view reminder"
              onClick={() => handleViewReminder(params.row)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Reminder" placement="top">
            <IconButton
              color="error"
              aria-label="delete reminder"
              onClick={() => handleDeleteReminder(params.row._id)}
            >
              <GridDeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ padding: STYLE_GUIDE.SPACING.s4 }}>
      {/* Header Row */}
      <Box sx={{ marginBottom: STYLE_GUIDE.SPACING.s6 }}>
        <Typography variant="h2">Reminder</Typography>
      </Box>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {/* Start and Repeat Section */}
        <Box sx={styles.formRow}>
          <FormControl>
            <FormLabel
              sx={{
                fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                color: STYLE_GUIDE.COLORS.textDarkGray,
                fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                marginBottom: STYLE_GUIDE.SPACING.s2,
              }}
            >
              Start Date
            </FormLabel>
            <TextField
              size="small"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              sx={styles.textField}
              variant="outlined"
              aria-label="Select start date"
            />
          </FormControl>
          <FormControl>
            <FormLabel
              sx={{
                fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                color: STYLE_GUIDE.COLORS.textDarkGray,
                fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                marginBottom: STYLE_GUIDE.SPACING.s2,
              }}
            >
              Select Frequency
            </FormLabel>
            <Select
              size="small"
              aria-placeholder="select"
              value={repeatType}
              onChange={(e) => setRepeatType(e.target.value)}
              sx={styles.select}
              variant="outlined"
              displayEmpty
              aria-label="Select repeat frequency"
            >
              <MenuItem value="" disabled>
                Select Frequency
              </MenuItem>
              {defaultConfig.repeat.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel
              sx={{
                fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                color: STYLE_GUIDE.COLORS.textDarkGray,
                fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                marginBottom: STYLE_GUIDE.SPACING.s2,
              }}
            >
              Time (Optional)
            </FormLabel>
            <TimePicker
              value={time ? dayjs(time, "hh:mm A") : null}
              onChange={(newValue) => {
                if (newValue) {
                  // ✅ Send with AM/PM to backend
                  setTime(newValue.format("hh:mm A"));
                } else {
                  setTime("");
                }
              }}
              format="hh:mm a" // ✅ Show AM/PM in UI
              slotProps={{
                actionBar: {
                  actions: [],
                },
                textField: {
                  size: "small",
                  variant: "outlined",
                  inputProps: {
                    "aria-required": "false",
                  },
                  "aria-label": "Select time for reminder",
                },
              }}
            />
          </FormControl>
        </Box>
      </LocalizationProvider>
      {/* Repeat Details Section */}
      <Box sx={{ marginBottom: STYLE_GUIDE.SPACING.s6 }}>
        {repeatType === "Yearly" && (
          <Box>
            <FormControl component="fieldset">
              <RadioGroup
                row
                name="yearlyType"
                value={yearlyType}
                onChange={(e) => setYearlyType(e.target.value)}
                sx={{ marginBottom: STYLE_GUIDE.SPACING.s3 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: STYLE_GUIDE.SPACING.s3,
                  }}
                >
                  <FormControlLabel
                    value="on"
                    control={<Radio sx={styles.radio} />}
                    label="on"
                    sx={{
                      fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                      color: STYLE_GUIDE.COLORS.textDarkGray,
                    }}
                  />
                  <Autocomplete
                    multiple
                    size="small"
                    id="yearly-month-autocomplete"
                    options={MONTHS}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    value={MONTHS.filter((m) => yearlyMonths.includes(m.id))}
                    onChange={(event, newValue) =>
                      setYearlyMonths(
                        newValue.length > 3
                          ? newValue.slice(0, 3).map((v) => v.id)
                          : newValue.map((v) => v.id)
                      )
                    }
                    disabled={yearlyType === "onthe"}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Months"
                        sx={styles.textField}
                        aria-label="Select up to 3 months for yearly recurrence"
                      />
                    )}
                  />
                  <Autocomplete
                    multiple
                    size="small"
                    id="yearly-day-autocomplete"
                    options={DAYS}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    value={DAYS.filter((d) => yearlyDays.includes(d.id))}
                    onChange={(event, newValue) =>
                      setYearlyDays(
                        newValue.length > 3
                          ? newValue.slice(0, 3).map((v) => v.id)
                          : newValue.map((v) => v.id)
                      )
                    }
                    disabled={yearlyType === "onthe"}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Days"
                        sx={styles.textField}
                        aria-label="Select up to 3 days for yearly recurrence"
                      />
                    )}
                  />
                </Box>
              </RadioGroup>
              <RadioGroup
                row
                name="yearlyType"
                value={yearlyType}
                onChange={(e) => setYearlyType(e.target.value)}
                sx={{ marginBottom: STYLE_GUIDE.SPACING.s3 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: STYLE_GUIDE.SPACING.s3,
                  }}
                >
                  <FormControlLabel
                    value="onthe"
                    control={<Radio sx={styles.radio} />}
                    label="on the "
                    sx={{
                      fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                      color: STYLE_GUIDE.COLORS.textDarkGray,
                    }}
                  />
                  <Autocomplete
                    multiple
                    size="small"
                    id="yearly-week-autocomplete"
                    options={WEEK_OPTIONS}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    value={WEEK_OPTIONS.filter((w) =>
                      yearlyWeeks.includes(w.id)
                    )}
                    onChange={(event, newValue) =>
                      setYearlyWeeks(
                        newValue.length > 3
                          ? newValue.slice(0, 3).map((v) => v.id)
                          : newValue.map((v) => v.id)
                      )
                    }
                    disabled={yearlyType === "on"}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Weeks"
                        sx={styles.textField}
                        aria-label="Select up to 3 weeks for yearly recurrence"
                      />
                    )}
                  />
                  <Autocomplete
                    multiple
                    size="small"
                    id="yearly-weekday-autocomplete"
                    options={weekdays}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    value={weekdays.filter((d) =>
                      yearlyWeekDays.includes(d.id)
                    )}
                    onChange={(event, newValue) =>
                      setYearlyWeekDays(
                        newValue.length > 3
                          ? newValue.slice(0, 3).map((v) => v.id)
                          : newValue.map((v) => v.id)
                      )
                    }
                    disabled={yearlyType === "on"}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Weekdays"
                        sx={styles.textField}
                        aria-label="Select up to 3 weekdays for yearly recurrence"
                      />
                    )}
                  />
                  <Typography component="span">of</Typography>
                  <Autocomplete
                    multiple
                    size="small"
                    id="yearly-week-month-autocomplete"
                    options={MONTHS}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    value={MONTHS.filter((m) =>
                      yearlyWeekMonths.includes(m.id)
                    )}
                    onChange={(event, newValue) =>
                      setYearlyWeekMonths(
                        newValue.length > 3
                          ? newValue.slice(0, 3).map((v) => v.id)
                          : newValue.map((v) => v.id)
                      )
                    }
                    disabled={yearlyType === "on"}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Months"
                        sx={styles.textField}
                        aria-label="Select up to 3 months for yearly recurrence week"
                      />
                    )}
                  />
                </Box>
              </RadioGroup>
            </FormControl>
          </Box>
        )}
        {repeatType === "Monthly" && (
          <Box>
            <FormControl component="fieldset">
              <FormLabel
                component="legend"
                sx={{
                  fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                  color: STYLE_GUIDE.COLORS.textDarkGray,
                  fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                  marginBottom: STYLE_GUIDE.SPACING.s2,
                }}
              >
                Monthly Recurrence
              </FormLabel>
              <RadioGroup
                row
                name="monthlyType"
                value={monthlyType}
                onChange={(e) => setMonthlyType(e.target.value)}
                sx={{ marginBottom: STYLE_GUIDE.SPACING.s3 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: STYLE_GUIDE.SPACING.s3,
                  }}
                >
                  <FormControlLabel
                    value="on"
                    control={<Radio sx={styles.radio} />}
                    label="on"
                    sx={{
                      fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                      color: STYLE_GUIDE.COLORS.textDarkGray,
                    }}
                  />
                  <Autocomplete
                    multiple
                    id="monthly-days"
                    size="small"
                    options={DAYS}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    value={DAYS.filter((day) => monthlyDays.includes(day.id))}
                    onChange={(event, newValue) =>
                      setMonthlyDays(newValue.map((v) => v.id))
                    }
                    disabled={monthlyType === "onthe"}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Days"
                        sx={styles.textField}
                        aria-label="Select days for monthly recurrence"
                      />
                    )}
                  />
                </Box>
              </RadioGroup>
              <RadioGroup
                row
                name="monthlyType"
                value={monthlyType}
                onChange={(e) => setMonthlyType(e.target.value)}
                sx={{ marginBottom: STYLE_GUIDE.SPACING.s3 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: STYLE_GUIDE.SPACING.s3,
                  }}
                >
                  <FormControlLabel
                    value="onthe"
                    control={<Radio sx={styles.radio} />}
                    label="on the "
                    sx={{
                      fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                      color: STYLE_GUIDE.COLORS.textDarkGray,
                    }}
                  />
                  <Autocomplete
                    multiple
                    size="small"
                    id="monthly-weeks"
                    options={WEEK_OPTIONS}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    value={WEEK_OPTIONS.filter((week) =>
                      monthlyWeeks.includes(week.id)
                    )}
                    onChange={(event, newValue) =>
                      setMonthlyWeeks(newValue.map((v) => v.id))
                    }
                    disabled={monthlyType === "on"}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Weeks"
                        sx={styles.textField}
                        aria-label="Select weeks for monthly recurrence"
                      />
                    )}
                  />
                  <Autocomplete
                    multiple
                    size="small"
                    id="monthly-weekdays"
                    options={weekdays}
                    getOptionLabel={(option) => option.label.slice(0, 3)}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    value={weekdays.filter((day) =>
                      monthlyWeekDays.includes(day.id)
                    )}
                    onChange={(event, newValue) =>
                      setMonthlyWeekDays(newValue.map((v) => v.id))
                    }
                    disabled={monthlyType === "on"}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Weekdays"
                        sx={styles.textField}
                        aria-label="Select weekdays for monthly recurrence"
                      />
                    )}
                  />
                </Box>
              </RadioGroup>
            </FormControl>
          </Box>
        )}
        {repeatType === "Weekly" && (
          <Box>
            <FormControl component="fieldset">
              <FormLabel
                sx={{
                  marginBottom: STYLE_GUIDE.SPACING.s2,
                  fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                  color: STYLE_GUIDE.COLORS.textDarkGray,
                  fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                }}
              >
                Repeat on:
              </FormLabel>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: STYLE_GUIDE.SPACING.s2,
                }}
              >
                {weekdays.map((day) => (
                  <Chip
                    key={day.id}
                    label={day.label.slice(0, 3)}
                    onClick={() => handleWeeklyDayToggle(day.id)}
                    sx={styles.chip(weeklyDays.includes(day.id))}
                    aria-label={`Toggle ${day.label} for weekly recurrence`}
                  />
                ))}
              </Box>
            </FormControl>
          </Box>
        )}
      </Box>
      {/* Repeat Every and End Section - Single Row */}
      <Box sx={styles.formRow}>
        {repeatType !== "Daily" && (
          <>
            <FormControl>
              <FormLabel
                sx={{
                  fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                  color: STYLE_GUIDE.COLORS.textDarkGray,
                  fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                  marginBottom: STYLE_GUIDE.SPACING.s2,
                }}
              >
                Every
              </FormLabel>
              <TextField
                size="small"
                type="number"
                value={interval}
                onChange={(e) =>
                  setInterval(Math.max(1, parseInt(e.target.value) || 1))
                }
                inputProps={{ min: 1 }}
                sx={{ ...styles.textField, width: "80px" }}
                variant="outlined"
                aria-label="Set repeat interval"
              />
            </FormControl>
            <Typography
              component="span"
              sx={{
                fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                color: STYLE_GUIDE.COLORS.textDarkGray,
                alignSelf: "center",
                marginTop: "24px",
              }}
            >
              {repeatType === "Weekly"
                ? "week(s)"
                : repeatType === "Monthly"
                  ? "month(s)"
                  : repeatType === "Yearly"
                    ? "year(s)"
                    : ""}{" "}
              {interval > 1 ? "s" : ""}
            </Typography>
          </>
        )}
        {/* End Section */}
        <FormControl>
          <FormLabel
            sx={{
              marginBottom: STYLE_GUIDE.SPACING.s2,
              fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
              color: STYLE_GUIDE.COLORS.textDarkGray,
              fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
            }}
          >
            End
          </FormLabel>
          <Select
            size="small"
            value={endType}
            onChange={(e) => setEndType(e.target.value)}
            sx={styles.select}
            variant="outlined"
            displayEmpty
            aria-label="Select end condition"
          >
            <MenuItem value="" disabled>
              Select
            </MenuItem>
            {defaultConfig.end.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {endType === "After" && (
          <FormControl>
            <FormLabel
              sx={{
                marginBottom: STYLE_GUIDE.SPACING.s2,
                fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                color: STYLE_GUIDE.COLORS.textDarkGray,
                fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
              }}
            >
              Occurrences
            </FormLabel>
            <TextField
              size="small"
              type="number"
              value={endAfter}
              onChange={(e) =>
                setEndAfter(Math.max(1, parseInt(e.target.value) || 1))
              }
              inputProps={{ min: 1 }}
              sx={{ ...styles.textField, width: "100px" }}
              variant="outlined"
              aria-label="Set number of occurrences"
            />
          </FormControl>
        )}
        {endType === "On date" && (
          <FormControl>
            <FormLabel
              sx={{
                marginBottom: STYLE_GUIDE.SPACING.s2,
                fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                color: STYLE_GUIDE.COLORS.textDarkGray,
                fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
              }}
            >
              End Date
            </FormLabel>
            <TextField
              size="small"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              sx={{ ...styles.textField, width: "150px" }}
              variant="outlined"
              aria-label="Select end date"
            />
          </FormControl>
        )}
      </Box>
      <Box
        component="hr"
        sx={{
          margin: `${STYLE_GUIDE.SPACING.s6} 0`,
          border: "none",
          borderTop: `1px solid ${STYLE_GUIDE.COLORS.divider}`,
        }}
      />
      {/* Recipients, Template, Method, and Checkboxes */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: STYLE_GUIDE.SPACING.s2,
          marginBottom: STYLE_GUIDE.SPACING.s4,
          "@media (max-width: 1100px)": {
            flexDirection: "column",
            alignItems: "stretch",
          },
        }}
      >
        {/* TO Recipients Section */}
        <Box sx={{ flex: 0.5, minWidth: "120px" }}>
          <FormControl fullWidth size="small">
            <Autocomplete
              multiple
              freeSolo
              size="small"
              id="to-recipients-autocomplete"
              options={fieldOptions.filter((option) => option.type === "email")}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.label
              }
              isOptionEqualToValue={(option, value) => {
                if (typeof option === "string" && typeof value === "string") {
                  return option === value;
                }
                if (typeof option !== "string" && typeof value !== "string") {
                  return option.attributeId === value.attributeId;
                }
                return false;
              }}
              value={toRecipients}
              onChange={(event, newValue) => {
                // Keep strings as strings and objects as objects
                setToRecipients(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="TO Recipients"
                  placeholder="Type or select"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={
                      typeof option === "string" ? option : option.attributeId
                    }
                    label={typeof option === "string" ? option : option.label}
                    {...getTagProps({ index })}
                    size="small"
                  />
                ))
              }
            />
          </FormControl>
        </Box>
        {/* CC Recipients Section */}
        <Box sx={{ flex: 0.7, minWidth: "120px" }}>
          <FormControl fullWidth size="small">
            <Autocomplete
              multiple
              freeSolo
              size="small"
              id="cc-recipients-autocomplete"
              options={fieldOptions.filter((option) => option.type === "email")}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.label
              }
              isOptionEqualToValue={(option, value) => {
                if (typeof option === "string" && typeof value === "string") {
                  return option === value;
                }
                if (typeof option !== "string" && typeof value !== "string") {
                  return option.attributeId === value.attributeId;
                }
                return false;
              }}
              value={ccRecipients}
              onChange={(event, newValue) => {
                // Keep strings as strings and objects as objects
                setCcRecipients(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="CC Recipients"
                  placeholder="Type or select"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={
                      typeof option === "string" ? option : option.attributeId
                    }
                    label={typeof option === "string" ? option : option.label}
                    {...getTagProps({ index })}
                    size="small"
                  />
                ))
              }
            />
          </FormControl>
        </Box>
        {/* Template Section */}
        <Box sx={{ flex: 0.7, minWidth: "120px" }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Template</InputLabel>
            <Select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              label="Template"
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
        {/* Notification Method Section */}
        <Box sx={{ flex: 0.5, minWidth: "120px" }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Method</InputLabel>
            <Select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              label="Method"
              renderValue={(selected) =>
                mediumList.data?.data?.find((medium) => medium._id === selected)
                  ?.medium || selected
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
        {/* Acknowledge Checkbox */}
        <Box
          sx={{
            flex: 0.6,
            minWidth: "100px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={acknowledgeChecked}
                onChange={(e) => setAcknowledgeChecked(e.target.checked)}
                color="primary"
              />
            }
            label="Acknowledge"
            sx={{
              fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
              color: STYLE_GUIDE.COLORS.textDarkGray,
            }}
          />
        </Box>
        {/* Attached Checkbox */}
        <Box
          sx={{
            flex: 0.6,
            minWidth: "90px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={attachedChecked}
                onChange={(e) => setAttachedChecked(e.target.checked)}
                color="primary"
              />
            }
            label="Attached"
            sx={{
              fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
              color: STYLE_GUIDE.COLORS.textDarkGray,
            }}
          />
        </Box>
      </Box>
      {/* Action Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: STYLE_GUIDE.SPACING.s2,
          marginBottom: STYLE_GUIDE.SPACING.s4,
        }}
      >
        {editMode && (
          <Button
            variant="outlined"
            color="primary"
            onClick={handleCancelEdit}
            aria-label="Cancel editing reminder"
          >
            Cancel
          </Button>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddReminder}
          aria-label={
            editMode
              ? "Save changes to reminder"
              : "Add reminder with current settings"
          }
          disabled={notificationTypeId === null}
        >
          {editMode ? "Update Reminder" : "Add Reminder"}
        </Button>
      </Box>
      <Box
        component="hr"
        sx={{
          margin: `${STYLE_GUIDE.SPACING.s6} 0`,
          border: "none",
          borderTop: `1px solid ${STYLE_GUIDE.COLORS.divider}`,
        }}
      />
      {/* Reminders List - Data Grid */}
      {frequencyListData?.data?.length > 0 && (
        <Box sx={styles.reminderContainer}>
          <Typography
            variant="h6"
            sx={{
              marginBottom: STYLE_GUIDE.SPACING.s3,
              color: STYLE_GUIDE.COLORS.primaryDark,
              fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
            }}
          >
            Added Reminders:
          </Typography>
          <Box sx={styles.dataGridContainer}>
            <DataGrid
              rows={frequencyListData?.data || []}
              columns={columns}
              getRowId={(row) => row._id}
              autoHeight
              disableColumnMenu
              disableRowSelectionOnClick
              hideFooterPagination
              hideFooterSelectedRowCount
            />
          </Box>
        </Box>
      )}
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "8px",
          },
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ borderRadius: "8px" }}>
            No
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            sx={{ borderRadius: "8px" }}
            disabled={deleteFrequency.isLoading}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Reminder Dialog */}
      <Modal
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        aria-labelledby="reminder-details-title"
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          mt: 4,
        }}
      >
        <Box
          sx={{
            backgroundColor: "background.paper",
            borderRadius: "8px",
            maxWidth: "800px",
            width: "100%",
            boxShadow: 24,
            p: 3,
            outline: "none",
          }}
        >
          <Typography id="reminder-details-title" variant="h6" mb={2}>
            Reminder Details
          </Typography>

          {viewingReminderData ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
              {[
                {
                  label: "Frequency",
                  value: formatRecurrenceDetails(viewingReminderData),
                },
                {
                  label: "Start Date",
                  value: viewingReminderData.schedulerStartDate
                    ? new Date(
                        viewingReminderData.schedulerStartDate
                      ).toLocaleDateString()
                    : "Not set",
                },
                viewingReminderData.schedulerEndDate && {
                  label: "End Date",
                  value: new Date(
                    viewingReminderData.schedulerEndDate
                  ).toLocaleDateString(),
                },
                viewingReminderData.maxOccurrences && {
                  label: "Max Occurrences",
                  value: viewingReminderData.maxOccurrences,
                },
                viewingReminderData.triggerTime && {
                  label: "Trigger Time",
                  value: viewingReminderData.triggerTime,
                },
                {
                  label: "Acknowledge Required",
                  value: viewingReminderData.acknowledgeRequired ? "Yes" : "No",
                },
                {
                  label: "Attachment Required",
                  value: viewingReminderData.attachmentRequired ? "Yes" : "No",
                },
                {
                  label: "Template",
                  value: viewingReminderData.templateId?.name || "Not set",
                },
                {
                  label: "Notification Method",
                  value: viewingReminderData.medium?.medium || "Not set",
                },
                {
                  label: "TO Recipients",
                  value: formatRecipientsForDisplay(
                    viewingReminderData.recipients_to
                  ),
                },
                {
                  label: "CC Recipients",
                  value: formatRecipientsForDisplay(
                    viewingReminderData.recipients_cc
                  ),
                },
              ]
                .filter(Boolean)
                .map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      flex: "1 1 calc(50% - 16px)", // Mimics Grid's xs={12} sm={6}
                      minWidth: "200px", // Ensures responsiveness
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "14px",
                        color: "#666",
                        fontWeight: 500,
                      }}
                    >
                      {item.label}
                    </label>
                    <div
                      style={{
                        padding: "14px 12px",
                        borderRadius: "8px",
                        backgroundColor: "#ebe8e8ff",
                        textTransform: "uppercase",
                        color: "#3f3e3eff",
                      }}
                    >
                      {item.value || "-"}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div>Loading reminder details...</div>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleCloseViewDialog}
              aria-label="Cancel editing reminder"
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

// Example Components
const SimpleRender = ({ fieldOptions, notificationTypeId }) => (
  <RRuleGenerator
    fieldOptions={fieldOptions}
    notificationTypeId={notificationTypeId}
  />
);

// App Component
const Frequency = ({ fieldOptions, notificationTypeId }) => {
  return (
    <Box>
      <SimpleRender
        fieldOptions={fieldOptions}
        notificationTypeId={notificationTypeId}
      />
    </Box>
  );
};

export default Frequency;
