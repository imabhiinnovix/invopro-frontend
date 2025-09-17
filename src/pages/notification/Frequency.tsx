import React, { useEffect, useState } from "react";
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
  Tooltip,
  FormHelperText,
} from "@mui/material";
import {
  Close as CloseIcon,
  AccessTime as AccessTimeIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronLeft,
  ChevronRight,
  CalendarMonthOutlined,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import useGet from "../../hooks/useGet";
import usePost from "../../hooks/usePost";
import useDelete from "../../hooks/useDelete";
import usePut from "../../hooks/usePut";
import { DELETE, GET, POST, PUT } from "../../services/apiRoutes";
import CustomRecurrence from "./Frequency/CustomRecurrence";
import { STYLE_GUIDE } from "../../styles";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import { ConfirmationDialog } from "../../components/common/deleteConfirmationDialog/ConfirmationDialog";
import ViewSchedulerDialog from "./ViewSchedulerDialog";
import {
  arraysEqual,
  transformUIToAPIFrequency,
  getExactUIFrequencyFromAPI,
  generateCustomFrequencyText,
  formatDate,
  changeCalendarMonth,
  generateCalendarDays,
} from "./Frequency/FrequencyUtility";

export default function Frequency({ fieldOptions, notificationTypeId }) {
  // State variables
  const [open, setOpen] = useState(false);
  const [allDay, setAllDay] = useState(false);
  const [modelType, setModalType] = useState("add");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [endCalendarDate, setEndCalendarDate] = useState(new Date());
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
  const [template, setTemplate] = useState("");
  const [method, setMethod] = useState("");
  const [ackRequired, setAckRequired] = useState(false);
  const [attachmentRequired, setAttachmentRequired] = useState(false);
  const [toRecipients, setToRecipients] = useState([]);
  const [ccRecipients, setCcRecipients] = useState([]);
  const [acknowledgeTo, setAcknowledgeTo] = useState([]);
  const [targetEntity, setTargetEntity] = useState("");
  const [errors, setErrors] = useState({
    template: "",
    method: "",
  });
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date(2025, 8, 1));
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [repeatAnchorEl, setRepeatAnchorEl] = useState(null);
  const [frequencyApiSuccess, setFrequencyApiSuccess] = useState(false);
  const [repeatEvery, setRepeatEvery] = useState(1);
  const [repeatPeriod, setRepeatPeriod] = useState("month");
  const [monthlyOption, setMonthlyOption] = useState("");
  const [yearlyOption, setYearlyOption] = useState("same-day");
  const [endsOption, setEndsOption] = useState("never");
  const [endDate, setEndDate] = useState(null);
  const [occurrences, setOccurrences] = useState(0);
  const [selectedDays, setSelectedDays] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [dialog, setDialog] = useState({
    open: false,
    type: "",
    rowData: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomRecurrence, setIsCustomRecurrence] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  
  // API hooks
  const createNotification = usePost(["createNotification"]);
  const deleteNotification = useDelete(["deleteNotification"]);
  const updateNotification = usePut(["updateNotification"]);
  const mediumList = useGet(["mediumList"], `${GET.MEDIUM_LIST}`, true);
  const templateList = useGet(["templateList"], `${GET.TEMPLATE_LIST}`, true);
  const { data: frequencyListData, refetch } = useGet(
    ["frequencyList", notificationTypeId],
    notificationTypeId
      ? `${GET.FREQUENCY_LIST}?notificationTypeId=${notificationTypeId}`
      : "",
    !!notificationTypeId
  );
  
  // Reset form fields
  const resetFormFields = () => {
    setSelectedDate(new Date());
    setSelectedTime(() => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
    });
    setRepeatOption("Do not repeat");
    setTemplate("");
    setMethod("");
    setAckRequired(false);
    setAttachmentRequired(false);
    setToRecipients([]);
    setCcRecipients([]);
    setAcknowledgeTo([]);
    setTargetEntity("");
    setRepeatEvery(1);
    setRepeatPeriod("month");
    setMonthlyOption("");
    setYearlyOption("same-day");
    setEndsOption("never");
    setEndDate(null);
    setOccurrences(0);
    setSelectedDays([false, false, false, false, false, false, false]);
    setErrors({
      template: "",
      method: "",
    });
    setIsCustomRecurrence(false);
  };
  
  useEffect(() => {
    if (notificationTypeId && !frequencyApiSuccess) {
      setFrequencyApiSuccess(true);
    }
  }, [notificationTypeId, frequencyApiSuccess]);
  
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
        return date
          ? new Date(date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "Not set";
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
          <Tooltip title="Edit" placement="top">
            <IconButton
              color="primary"
              aria-label="edit"
              onClick={() => handleEditReminder(params.row)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="View" placement="top">
            <IconButton
              color="primary"
              aria-label="view"
              onClick={() => handleViewReminder(params.row)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete" placement="top">
            <IconButton
              color="error"
              aria-label="delete"
              onClick={() => handleDeleteClick(params.row)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];
  
  interface RecipientData {
    customEmails?: string[];
    attributeId?: string;
    refAttributeId?: string[];
    label?: string;
  }
  
  interface FieldOption {
    attributeId: string;
    refAttributeId?: string[];
    type?: string;
    label: string;
  }
  
  const transformRecipients = (
    recipients: RecipientData[],
    fieldOptions: FieldOption[]
  ): (string | RecipientData)[] => {
    if (!recipients || !Array.isArray(recipients)) return [];
    return recipients.flatMap((recipient) => {
      if (
        recipient.customEmails &&
        Array.isArray(recipient.customEmails) &&
        recipient.customEmails.length > 0
      ) {
        return recipient.customEmails.map((email) => email);
      }
      if (recipient.attributeId) {
        const match = fieldOptions.find(
          (option) =>
            option.attributeId === recipient.attributeId &&
            arraysEqual(
              option.refAttributeId || [],
              recipient.refAttributeId || []
            )
        );
        if (match) return match;
        return {
          attributeId: recipient.attributeId,
          refAttributeId: recipient.refAttributeId || [],
          label: `Field: ${recipient.attributeId}`,
        };
      }
      return recipient;
    });
  };
  
  const transformTargetEntity = (entity, fieldOptions) => {
    if (!entity) return null;
    if (
      entity.customEmails &&
      Array.isArray(entity.customEmails) &&
      entity.customEmails.length > 0
    ) {
      return entity.customEmails[0];
    }
    if (entity.attributeId) {
      const match = fieldOptions.find(
        (option) =>
          option.attributeId === entity.attributeId &&
          arraysEqual(option.refAttributeId || [], entity.refAttributeId || [])
      );
      if (match) return match;
      return {
        attributeId: entity.attributeId,
        refAttributeId: entity.refAttributeId || [],
        label: `Field: ${entity.attributeId}`,
      };
    }
    return entity;
  };
  
  const handleEditReminder = (row) => {
    setModalType("edit");
    setSelectedReminder(row);
    if (row.schedulerStartDate) {
      setSelectedDate(new Date(row.schedulerStartDate));
    }
    if (row.triggerTime) {
      setSelectedTime(row.triggerTime);
    }
    if (row.frequency) {
      let uiFrequency = getExactUIFrequencyFromAPI(
        row,
        new Date(row.schedulerStartDate)
      );
      if (row.frequency === "daily" && row.interval === 1 && !row.maxOccurrences && !row.schedulerEndDate) {
        uiFrequency = "Daily";
      }
      setRepeatOption(uiFrequency);
      setIsCustomRecurrence(
        row.frequency === "custom" ||
          (row.interval && row.interval > 1) ||
          (row.monthOfYear !== undefined && row.dayOfYearMonth !== undefined) ||
          (row.schedulerEndDate && row.schedulerEndDate !== null) ||
          (row.maxOccurrences && row.maxOccurrences > 0) ||
          (row.daysOfWeek && row.daysOfWeek.length > 1)
      );
      if (row.interval) {
        setRepeatEvery(row.interval);
      }
      if (row.frequency === "daily") {
        setRepeatPeriod("day");
      } else if (row.frequency === "weekly") {
        setRepeatPeriod("week");
      } else if (row.frequency === "monthly") {
        setRepeatPeriod("month");
      } else if (row.frequency === "yearly") {
        setRepeatPeriod("year");
      } else if (row.frequency === "custom") {
        if (row.daysOfWeek && row.daysOfWeek.length > 0) {
          setRepeatPeriod("week");
        } else if (
          row.dayOfMonth ||
          (row.weekOfMonth && row.dayOfWeekInMonth !== undefined)
        ) {
          setRepeatPeriod("month");
        } else if (row.monthOfYear && row.dayOfYearMonth) {
          setRepeatPeriod("year");
        } else {
          setRepeatPeriod("day");
        }
      }
      if (row.schedulerEndDate) {
        setEndsOption("on");
        setEndDate(new Date(row.schedulerEndDate));
      } else if (row.maxOccurrences && row.maxOccurrences > 0) {
        setEndsOption("after");
        setOccurrences(row.maxOccurrences);
      } else {
        setEndsOption("never");
      }
      if (row.daysOfWeek && Array.isArray(row.daysOfWeek)) {
        const newSelectedDays = [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ];
        row.daysOfWeek.forEach((dayIndex) => {
          if (dayIndex >= 0 && dayIndex <= 6) {
            newSelectedDays[dayIndex] = true;
          }
        });
        setSelectedDays(newSelectedDays);
      } else {
        const newSelectedDays = [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ];
        const dayIndex = new Date(row.schedulerStartDate).getDay();
        newSelectedDays[dayIndex] = true;
        setSelectedDays(newSelectedDays);
      }
      if (row.frequency === "monthly") {
        if (row.dayOfMonth && row.dayOfMonth.length > 0) {
          setMonthlyOption(`Monthly on day ${row.dayOfMonth[0]}`);
        } else if (
          row.weekOfMonth &&
          row.weekOfMonth.length > 0 &&
          row.dayOfWeekInMonth !== undefined
        ) {
          const dayNames = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];
          const occurrenceMap = ["first", "second", "third", "fourth", "fifth"];
          const occurrence =
            row.weekOfMonth[0] === 5
              ? "last"
              : occurrenceMap[row.weekOfMonth[0] - 1];
          setMonthlyOption(
            `Monthly on the ${occurrence} ${dayNames[row.dayOfWeekInMonth]}`
          );
        }
      }
    }
    if (row.templateId) {
      setTemplate(row.templateId._id || row.templateId);
    }
    if (row.medium) {
      setMethod(row.medium._id || row.medium);
    }
    if (row.acknowledgeRequired) {
      setAckRequired(row.acknowledgeRequired);
    }
    if (row.attachmentRequired) {
      setAttachmentRequired(row.attachmentRequired);
    }
    if (row.recipients_to) {
      setToRecipients(transformRecipients(row.recipients_to, fieldOptions));
    }
    if (row.recipients_cc) {
      setCcRecipients(transformRecipients(row.recipients_cc, fieldOptions));
    }
    if (row.acknowledge_to) {
      setAcknowledgeTo(transformRecipients(row.acknowledge_to, fieldOptions));
    }
    if (row.targetEntity) {
      setTargetEntity(transformTargetEntity(row.targetEntity, fieldOptions));
    }
    setOpen(true);
  };
  
  const handleViewReminder = (row) => {
    setSelectedReminder(row);
    setViewDialogOpen(true);
  };
  
  const handleDeleteClick = (row) => {
    setDialog({
      open: true,
      type: "delete",
      rowData: row,
    });
  };
  
  const handleCloseDialog = () => {
    setDialog({
      open: false,
      type: "",
      rowData: null,
    });
  };
  
  const handleConfirmAction = async () => {
    if (dialog.type === "delete" && dialog.rowData) {
      try {
        setIsSubmitting(true);
        const response = await deleteNotification.mutateAsync({
          url: `${DELETE.DELETE_FREQUENCY}/${dialog.rowData._id}`,
        });
        if (response.success) {
          toast.success(response.message || "Scheduler deleted successfully");
          refetch();
        } else {
          toast.error(response.message || "Failed to delete scheduler");
        }
      } catch (error) {
        console.error("Error deleting scheduler:", error);
        toast.error("An error occurred while deleting the scheduler");
      } finally {
        setIsSubmitting(false);
        handleCloseDialog();
      }
    }
  };
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      template: "",
      method: "",
    };
    if (!template) {
      newErrors.template = "Template is required";
      isValid = false;
    }
    if (!method) {
      newErrors.method = "Method is required";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };
  
  // Use the imported utility functions
  const handleChangeCalendarMonth = (delta) => {
    changeCalendarMonth(setCalendarDate, delta);
  };
  
  const getGeneratedCalendarDays = () => {
    return generateCalendarDays(calendarDate, selectedDate, setDatePickerOpen);
  };
  
  const getRepeatOptions = () => {
    const dayOfWeek = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const dayOfMonth = selectedDate.getDate();
    const month = selectedDate.toLocaleDateString("en-US", { month: "long" });
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
      const isLast = lastDayOfMonth.getDate() - day < 7;
      return {
        occurrence: isLast ? "last" : numberToWord(occurrenceNum),
        weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
      };
    };
    const { occurrence, weekday } = getOrdinalOccurrence(selectedDate);
    const options = [
      "Do not repeat",
      "Daily",
      `Weekly on ${dayOfWeek}`,
      `Monthly on the ${occurrence} ${weekday}`,
      `Annually on ${month} ${dayOfMonth}`,
      "Every weekday (Monday to Friday)",
      "Custom...",
    ];
    if (isCustomRecurrence && repeatOption && !options.includes(repeatOption)) {
      options.push(repeatOption);
    }
    return options;
  };
  
  const initializeSelectedDays = () => {
    const dayIndex = selectedDate.getDay();
    const newSelectedDays = [...selectedDays];
    newSelectedDays.fill(false);
    newSelectedDays[dayIndex] = true;
    setSelectedDays(newSelectedDays);
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
  
  const handleOpenDialog = () => {
    resetFormFields();
    setOpen(true);
    setModalType("add");
  };
  
  const handleClose = () => setOpen(false);
  
// Frequency.tsx - Fix for formatDateForAPI function

const formatDateForAPI = (date) => {
  // Check if date is already a Date object
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  
  // If it's a string, try to convert it to a Date object
  if (typeof date === 'string') {
    const dateObj = new Date(date);
    // Check if the conversion resulted in a valid date
    if (!isNaN(dateObj.getTime())) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  }
  
  // If it's a timestamp (number), convert it to a Date object
  if (typeof date === 'number') {
    const dateObj = new Date(date);
    // Check if the conversion resulted in a valid date
    if (!isNaN(dateObj.getTime())) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  }
  
  // If we can't convert it to a valid date, return a fallback or throw an error
  console.error("Invalid date provided to formatDateForAPI:", date);
  return ""; // Default fallback date
};
  
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
  
  const formatTargetEntity = (entity) => {
    if (!entity) return null;
    if (typeof entity === "string") {
      if (entity.includes("@")) {
        return { customEmails: [entity] };
      } else {
        return { attributeId: entity };
      }
    } else {
      return entity;
    }
  };
  
//   const generatePayload = () => {
//     const formattedToRecipients = formatRecipients(toRecipients);
//     const formattedCcRecipients = formatRecipients(ccRecipients);
//     const formattedAcknowledgeTo = formatRecipients(acknowledgeTo);
//     const formattedTargetEntity = formatTargetEntity(targetEntity);
//     const payload = {
//       notificationTypeId,
//       frequency: transformUIToAPIFrequency(repeatOption),
//       schedulerStartDate: formatDateForAPI(selectedDate),
//       interval: repeatEvery,
//       repeatAnnually: false,
//       attachmentRequired,
//       recipients_to: formattedToRecipients,
//       recipients_cc: formattedCcRecipients,
//       medium: method,
//       templateId: template,
//       triggerTime: selectedTime,
//       isActive: "active",
//       schedulerEndDate: endDate ? formatDateForAPI(endDate) : null,
//       maxOccurrences: occurrences,
//     };
//     if (formattedAcknowledgeTo.length > 0) {
//       payload.acknowledge_to = formattedAcknowledgeTo;
//     }
//     if (formattedTargetEntity) {
//       payload.targetEntity = formattedTargetEntity;
//     }
//     if (repeatOption === "Do not repeat") {
//       return payload;
//     } else if (repeatOption === "Daily") {
//       return payload;
//     } else if (repeatOption.startsWith("Weekly on")) {
//       const dayName = repeatOption.replace("Weekly on ", "").split(" and ")[0];
//       const dayNameToIndex = (dayName) => {
//         const days = [
//           "Sunday",
//           "Monday",
//           "Tuesday",
//           "Wednesday",
//           "Thursday",
//           "Friday",
//           "Saturday",
//         ];
//         return days.indexOf(dayName);
//       };
//       payload.daysOfWeek = [dayNameToIndex(dayName)];
//     } else if (repeatOption === "Every weekday (Monday to Friday)") {
//       payload.daysOfWeek = [1, 2, 3, 4, 5];
//     } else if (repeatOption.startsWith("Monthly on day")) {
//       const dayNumber = parseInt(repeatOption.replace("Monthly on day ", ""));
//       payload.dayOfMonth = [dayNumber];
//     } else if (repeatOption.startsWith("Monthly on the")) {
//       const parts = repeatOption.replace("Monthly on the ", "").split(" ");
//       const occurrence = parts[0];
//       const weekday = parts.slice(1).join(" ");
//       const occurrenceWordToNumber = (occurrence) => {
//         const map = {
//           first: 1,
//           second: 2,
//           third: 3,
//           fourth: 4,
//           fifth: 5,
//           last: 5,
//         };
//         return map[occurrence] || 1;
//       };
//       const dayNameToIndex = (dayName) => {
//         const days = [
//           "Sunday",
//           "Monday",
//           "Tuesday",
//           "Wednesday",
//           "Thursday",
//           "Friday",
//           "Saturday",
//         ];
//         return days.indexOf(dayName);
//       };
//       payload.weekOfMonth = [occurrenceWordToNumber(occurrence)];
//       payload.dayOfWeekInMonth = dayNameToIndex(weekday);
//     } else if (repeatOption.startsWith("Annually on")) {
//       const parts = repeatOption.replace("Annually on ", "").split(" ");
//       const monthName = parts[0];
//       const dayNumber = parseInt(parts[1]);
//       const monthNames = [
//         "January",
//         "February",
//         "March",
//         "April",
//         "May",
//         "June",
//         "July",
//         "August",
//         "September",
//         "October",
//         "November",
//         "December",
//       ];
//       payload.monthOfYear = monthNames.indexOf(monthName) + 1;
//       payload.dayOfYearMonth = dayNumber;
//     }
//     if (isCustomRecurrence) {
//       if (repeatPeriod === "day") {
//         payload.frequency = "daily";
//       } else if (repeatPeriod === "week") {
//         payload.frequency = "weekly";
//         const daysArray = [];
//         if (Array.isArray(selectedDays) && selectedDays.length === 7) {
//           if (selectedDays[0]) daysArray.push(0);
//           if (selectedDays[1]) daysArray.push(1);
//           if (selectedDays[2]) daysArray.push(2);
//           if (selectedDays[3]) daysArray.push(3);
//           if (selectedDays[4]) daysArray.push(4);
//           if (selectedDays[5]) daysArray.push(5);
//           if (selectedDays[6]) daysArray.push(6);
//         }
//         if (daysArray.length === 0) {
//           daysArray.push(selectedDate.getDay());
//         }
//         payload.daysOfWeek = daysArray;
//       } else if (repeatPeriod === "month") {
//         payload.frequency = "monthly";
//         if (monthlyOption && monthlyOption.startsWith("Monthly on day")) {
//           const dayNumber = parseInt(monthlyOption.split(" ").pop());
//           payload.dayOfMonth = [dayNumber];
//         } else if (
//           monthlyOption &&
//           monthlyOption.startsWith("Monthly on the")
//         ) {
//           const parts = monthlyOption.replace("Monthly on the ", "").split(" ");
//           const occurrence = parts[0];
//           const weekday = parts.slice(1).join(" ");
//           const occurrenceWordToNumber = (occurrence) => {
//             const map = {
//               first: 1,
//               second: 2,
//               third: 3,
//               fourth: 4,
//               fifth: 5,
//               last: 5,
//             };
//             return map[occurrence] || 1;
//           };
//           const dayNameToIndex = (dayName) => {
//             const days = [
//               "Sunday",
//               "Monday",
//               "Tuesday",
//               "Wednesday",
//               "Thursday",
//               "Friday",
//               "Saturday",
//             ];
//             return days.indexOf(dayName);
//           };
//           payload.weekOfMonth = [occurrenceWordToNumber(occurrence)];
//           payload.dayOfWeekInMonth = dayNameToIndex(weekday);
//         }
//       } else if (repeatPeriod === "year") {
//         payload.frequency = "yearly";
//         if (yearlyOption === "same-day") {
//           payload.monthOfYear = selectedDate.getMonth() + 1;
//           payload.dayOfYearMonth = selectedDate.getDate();
//         }
//       }
//       if (endsOption === "on") {
//         payload.schedulerEndDate = endDate ? formatDateForAPI(endDate) : null;
//       } else if (endsOption === "after") {
//         payload.maxOccurrences = occurrences;
//       }
//     }
//     return payload;
//   };
  
// Frequency.tsx - Fix for generatePayload function

const generatePayload = () => {
  const formattedToRecipients = formatRecipients(toRecipients);
  const formattedCcRecipients = formatRecipients(ccRecipients);
  const formattedAcknowledgeTo = formatRecipients(acknowledgeTo);
  const formattedTargetEntity = formatTargetEntity(targetEntity);
  
  // Ensure selectedDate is a Date object
  const startDate = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
  
  // Ensure endDate is a Date object if it exists
  const formattedEndDate = endDate ? (endDate instanceof Date ? endDate : new Date(endDate)) : null;
  
  const payload = {
    notificationTypeId,
    frequency: transformUIToAPIFrequency(repeatOption),
    schedulerStartDate: formatDateForAPI(startDate),
    interval: repeatEvery,
    repeatAnnually: false,
    attachmentRequired,
    recipients_to: formattedToRecipients,
    recipients_cc: formattedCcRecipients,
    medium: method,
    templateId: template,
    triggerTime: selectedTime,
    isActive: "active",
    schedulerEndDate: formattedEndDate ? formatDateForAPI(formattedEndDate) : null,
    maxOccurrences: occurrences,
  };
  
  if (formattedAcknowledgeTo.length > 0) {
    payload.acknowledge_to = formattedAcknowledgeTo;
  }
  if (formattedTargetEntity) {
    payload.targetEntity = formattedTargetEntity;
  }
  
  if (repeatOption === "Do not repeat") {
    return payload;
  } else if (repeatOption === "Daily") {
    return payload;
  } else if (repeatOption.startsWith("Weekly on")) {
    const dayName = repeatOption.replace("Weekly on ", "").split(" and ")[0];
    const dayNameToIndex = (dayName) => {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      return days.indexOf(dayName);
    };
    payload.daysOfWeek = [dayNameToIndex(dayName)];
  } else if (repeatOption === "Every weekday (Monday to Friday)") {
    payload.daysOfWeek = [1, 2, 3, 4, 5];
  } else if (repeatOption.startsWith("Monthly on day")) {
    const dayNumber = parseInt(repeatOption.replace("Monthly on day ", ""));
    payload.dayOfMonth = [dayNumber];
  } else if (repeatOption.startsWith("Monthly on the")) {
    const parts = repeatOption.replace("Monthly on the ", "").split(" ");
    const occurrence = parts[0];
    const weekday = parts.slice(1).join(" ");
    const occurrenceWordToNumber = (occurrence) => {
      const map = {
        first: 1,
        second: 2,
        third: 3,
        fourth: 4,
        fifth: 5,
        last: 5,
      };
      return map[occurrence] || 1;
    };
    const dayNameToIndex = (dayName) => {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      return days.indexOf(dayName);
    };
    payload.weekOfMonth = [occurrenceWordToNumber(occurrence)];
    payload.dayOfWeekInMonth = dayNameToIndex(weekday);
  } else if (repeatOption.startsWith("Annually on")) {
    const parts = repeatOption.replace("Annually on ", "").split(" ");
    const monthName = parts[0];
    const dayNumber = parseInt(parts[1]);
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    payload.monthOfYear = monthNames.indexOf(monthName) + 1;
    payload.dayOfYearMonth = dayNumber;
  }
  
  if (isCustomRecurrence) {
    if (repeatPeriod === "day") {
      payload.frequency = "daily";
    } else if (repeatPeriod === "week") {
      payload.frequency = "weekly";
      const daysArray = [];
      if (Array.isArray(selectedDays) && selectedDays.length === 7) {
        if (selectedDays[0]) daysArray.push(0);
        if (selectedDays[1]) daysArray.push(1);
        if (selectedDays[2]) daysArray.push(2);
        if (selectedDays[3]) daysArray.push(3);
        if (selectedDays[4]) daysArray.push(4);
        if (selectedDays[5]) daysArray.push(5);
        if (selectedDays[6]) daysArray.push(6);
      }
      if (daysArray.length === 0) {
        daysArray.push(selectedDate.getDay());
      }
      payload.daysOfWeek = daysArray;
    } else if (repeatPeriod === "month") {
      payload.frequency = "monthly";
      if (monthlyOption && monthlyOption.startsWith("Monthly on day")) {
        const dayNumber = parseInt(monthlyOption.split(" ").pop());
        payload.dayOfMonth = [dayNumber];
      } else if (
        monthlyOption &&
        monthlyOption.startsWith("Monthly on the")
      ) {
        const parts = monthlyOption.replace("Monthly on the ", "").split(" ");
        const occurrence = parts[0];
        const weekday = parts.slice(1).join(" ");
        const occurrenceWordToNumber = (occurrence) => {
          const map = {
            first: 1,
            second: 2,
            third: 3,
            fourth: 4,
            fifth: 5,
            last: 5,
          };
          return map[occurrence] || 1;
        };
        const dayNameToIndex = (dayName) => {
          const days = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];
          return days.indexOf(dayName);
        };
        payload.weekOfMonth = [occurrenceWordToNumber(occurrence)];
        payload.dayOfWeekInMonth = dayNameToIndex(weekday);
      }
    } else if (repeatPeriod === "year") {
      payload.frequency = "yearly";
      if (yearlyOption === "same-day") {
        payload.monthOfYear = selectedDate.getMonth() + 1;
        payload.dayOfYearMonth = selectedDate.getDate();
      }
    }
    
    if (endsOption === "on") {
      payload.schedulerEndDate = formattedEndDate ? formatDateForAPI(formattedEndDate) : null;
    } else if (endsOption === "after") {
      payload.maxOccurrences = occurrences;
    }
  }
  
  return payload;
};
  const handleSave = async (payload = null) => {
    if (!validateForm()) {
      return;
    }
    try {
      const finalPayload = payload || generatePayload();
      let response;
      if (modelType === "edit") {
        response = await updateNotification.mutateAsync({
          url: `${PUT.UPDATE_FREQUENCY}/${selectedReminder?._id}`,
          payload: finalPayload,
        });
      } else {
        response = await createNotification.mutateAsync({
          url: `${POST.CREATE_FREQUENCY}`,
          payload: finalPayload,
        });
      }
      if (response.success) {
        toast.success(
          response.message ||
            (modelType === "edit"
              ? "Scheduler updated successfully"
              : "Scheduler created successfully")
        );
        resetFormFields();
        refetch();
      }
      handleClose();
    } catch (error) {
      console.error("Error saving scheduler:", error);
      toast.error(
        `An error occurred while ${modelType === "edit" ? "updating" : "creating"} the scheduler`
      );
    }
  };
  
  const handleRepeatClick = (e) => {
    setRepeatAnchorEl(e.currentTarget);
  };
  
  const handleRepeatSelect = (value) => {
    setRepeatOption(value);
    setRepeatAnchorEl(null);
    if (value === "Custom...") {
      setIsCustomRecurrence(true);
      // Only initialize if not in edit mode
      if (modelType !== "edit") {
        initializeSelectedDays();
      }
      setCustomRecurrenceOpen(true);
      if (repeatOption.startsWith("Weekly on")) {
        setRepeatPeriod("week");
      } else if (repeatOption === "Daily") {
        setRepeatPeriod("day");
      } else if (repeatOption.startsWith("Monthly on")) {
        setRepeatPeriod("month");
      } else if (repeatOption.startsWith("Annually on")) {
        setRepeatPeriod("year");
      }
    } else {
      setIsCustomRecurrence(false);
      setRepeatEvery(1);
      setEndsOption("never");
      setEndDate(null);
      setOccurrences(0);
      setSelectedDays([false, false, false, false, false, false, false]);
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
  
  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
            color: STYLE_GUIDE.COLORS.primaryDark,
          }}
        >
          {frequencyListData?.data?.length > 0
            ? "Scheduler Listing"
            : "Scheduler"}
        </Typography>
        <Button
          variant="contained"
          onClick={handleOpenDialog}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
          }}
        >
          Add New
        </Button>
      </Box>
      {frequencyListData?.data?.length > 0 ? (
        <Box>
          <Box
            sx={{
              border: `1px solid ${STYLE_GUIDE.COLORS.border}`,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <DataGrid
              rows={frequencyListData?.data || []}
              columns={columns}
              getRowId={(row) => row._id}
              autoHeight
              disableColumnMenu
              disableRowSelectionOnClick
              hideFooterPagination
              hideFooterSelectedRowCount
              sx={{
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: STYLE_GUIDE.COLORS.background,
                },
                "& .MuiDataGrid-row": {
                  "&:hover": {
                    backgroundColor: STYLE_GUIDE.COLORS.hover,
                  },
                },
              }}
            />
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 5,
            border: `1px dashed ${STYLE_GUIDE.COLORS.border}`,
            borderRadius: 2,
            backgroundColor: STYLE_GUIDE.COLORS.background,
            textAlign: "center",
          }}
        >
          <CalendarMonthOutlined
            sx={{ fontSize: 48, color: STYLE_GUIDE.COLORS.disabled, mb: 2 }}
          />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No Schedulers Added Yet
          </Typography>
        </Box>
      )}
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
            {modelType === "edit" ? "Edit Scheduler" : "Add Scheduler"}
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(0, 0, 0, 0.6)",
                fontWeight: 500,
                fontSize: "0.875rem",
                lineHeight: "1.4375rem",
                letterSpacing: "0.00938em",
                pl: 0.5,
              }}
            >
              Starts on
            </Typography>
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
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, pl: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Repeat</InputLabel>
              <Select
                value={repeatOption}
                onChange={(e) => handleRepeatSelect(e.target.value)}
                label="Repeat"
                sx={{
                  backgroundColor: "#f8f9fa",
                  borderRadius: 2,
                  "& .MuiSelect-select": {
                    color: "#3c4043",
                  },
                }}
              >
                {getRepeatOptions().map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Box sx={{ flex: 0.5, minWidth: "120px" }}>
                <FormControl size="small" fullWidth error={!!errors.template}>
                  <InputLabel>Template</InputLabel>
                  <Select
                    value={template}
                    onChange={(e) => {
                      setTemplate(e.target.value);
                      if (e.target.value) {
                        setErrors({ ...errors, template: "" });
                      }
                    }}
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
                  {errors.template && (
                    <FormHelperText error>{errors.template}</FormHelperText>
                  )}
                </FormControl>
              </Box>
              <Box sx={{ flex: 0.5, minWidth: "120px" }}>
                <FormControl size="small" fullWidth error={!!errors.method}>
                  <InputLabel>Method</InputLabel>
                  <Select
                    value={method}
                    onChange={(e) => {
                      setMethod(e.target.value);
                      if (e.target.value) {
                        setErrors({ ...errors, method: "" });
                      }
                    }}
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
                  {errors.method && (
                    <FormHelperText error>{errors.method}</FormHelperText>
                  )}
                </FormControl>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 2, mt: 2, alignItems: "center" }}>
              <FormControl fullWidth size="small">
                <Autocomplete
                  freeSolo
                  size="small"
                  id="target-entity-autocomplete"
                  options={fieldOptions.filter(
                    (option) => option.type === "email"
                  )}
                  getOptionLabel={(option) => {
                    if (typeof option === "string") return option;
                    return option.label || option.attributeId || "";
                  }}
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
                  getOptionLabel={(option) => {
                    if (typeof option === "string") return option;
                    return option?.label || option?.attributeId || "";
                  }}
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
                  getOptionLabel={(option) => {
                    if (typeof option === "string") return option;
                    return option.label || option.attributeId || "";
                  }}
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
                  getOptionLabel={(option) => {
                    if (typeof option === "string") return option;
                    return option.label || option.attributeId || "";
                  }}
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
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSave()}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            {modelType === "edit" ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={datePickerOpen}
        onClose={() => setDatePickerOpen(false)}
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <IconButton onClick={() => handleChangeCalendarMonth(-1)}>
              <ChevronLeft />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              {calendarDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Typography>
            <IconButton onClick={() => handleChangeCalendarMonth(1)}>
              <ChevronRight />
            </IconButton>
          </Box>
          <Grid container columns={7} sx={{ mb: 1 }}>
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <Grid item xs={1} key={day} sx={{ textAlign: "center" }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    fontSize: "0.75rem",
                  }}
                >
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>
          <Grid container columns={7}>
            {getGeneratedCalendarDays()}
          </Grid>
          <DialogActions sx={{ mt: 2, pt: 1 }}>
            <Button onClick={() => setDatePickerOpen(false)}>Cancel</Button>
            <Button
              onClick={() => setDatePickerOpen(false)}
              variant="contained"
              sx={{ ml: 1 }}
            >
              OK
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
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
        endCalendarDate={endCalendarDate}
        setEndCalendarDate={setEndCalendarDate}
        isEditMode={modelType === "edit"}
        initialData={modelType === "edit" ? selectedReminder : null}
        onSave={(days) => {
          const validDays =
            Array.isArray(days) && days.length === 7
              ? days
              : selectedDays.length === 7
                ? selectedDays
                : Array(7)
                    .fill(false)
                    .map((_, i) => i === selectedDate.getDay());
          const customFrequencyText = generateCustomFrequencyText(
            repeatEvery,
            repeatPeriod,
            validDays,
            monthlyOption,
            endDate,
            occurrences,
            endsOption,
            selectedDate
          );
          setRepeatOption(customFrequencyText);
          setIsCustomRecurrence(true);
          setSelectedDays(validDays);
          setCustomRecurrenceOpen(false);
        }}
      />
      <ViewSchedulerDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        selectedReminder={selectedReminder}
        fieldOptions={fieldOptions}
      />
      <ConfirmationDialog
        open={dialog.open}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmAction}
        title="Confirm Delete"
        content="Are you sure you want to delete this scheduler?"
        confirmText="Delete"
        confirmButtonColor="error"
        isSubmitting={isSubmitting}
      />
    </Box>
  );
}



// // Frequency.tsx
// import React, { useEffect, useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Box,
//   FormControlLabel,
//   Checkbox,
//   Paper,
//   Popper,
//   MenuList,
//   MenuItem as MuiMenuItem,
//   Typography,
//   TextField,
//   Select,
//   MenuItem,
//   FormControl,
//   IconButton,
//   Grid,
//   Chip,
//   InputLabel,
//   Autocomplete,
//   Tooltip,
//   FormHelperText,
// } from "@mui/material";
// import {
//   Close as CloseIcon,
//   AccessTime as AccessTimeIcon,
//   ExpandMore as ExpandMoreIcon,
//   ChevronLeft,
//   ChevronRight,
//   CalendarMonthOutlined,
//   Delete as DeleteIcon,
//   Edit as EditIcon,
//   Visibility as VisibilityIcon,
// } from "@mui/icons-material";
// import { TimePicker } from "@mui/x-date-pickers/TimePicker";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import dayjs from "dayjs";
// import useGet from "../../hooks/useGet";
// import usePost from "../../hooks/usePost";
// import useDelete from "../../hooks/useDelete";
// import usePut from "../../hooks/usePut";
// import { DELETE, GET, POST, PUT } from "../../services/apiRoutes";
// import CustomRecurrence from "./Frequency/CustomRecurrence";
// import { STYLE_GUIDE } from "../../styles";
// import { DataGrid, GridColDef } from "@mui/x-data-grid";
// import { toast } from "react-toastify";
// import { ConfirmationDialog } from "../../components/common/deleteConfirmationDialog/ConfirmationDialog";
// import ViewSchedulerDialog from "./ViewSchedulerDialog";
// import {
//   arraysEqual,
//   transformUIToAPIFrequency,
//   getExactUIFrequencyFromAPI,
//   generateCustomFrequencyText,
//   formatDate,
//   changeCalendarMonth,
//   generateCalendarDays,
// } from "./Frequency/FrequencyUtility";

// export default function Frequency({ fieldOptions, notificationTypeId }) {
//   // State variables
//   const [open, setOpen] = useState(false);
//   const [allDay, setAllDay] = useState(false);
//   const [modelType, setModalType] = useState("add");
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [endCalendarDate, setEndCalendarDate] = useState(new Date());
//   const [selectedTime, setSelectedTime] = useState(() => {
//     const now = new Date();
//     let hours = now.getHours();
//     const minutes = now.getMinutes();
//     const ampm = hours >= 12 ? "PM" : "AM";
//     hours = hours % 12 || 12;
//     return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
//   });
//   const [repeatOption, setRepeatOption] = useState("Do not repeat");
//   const [previousRepeatOption, setPreviousRepeatOption] = useState("Do not repeat"); // Track previous selection
//   const [customRecurrenceOpen, setCustomRecurrenceOpen] = useState(false);
//   const [template, setTemplate] = useState("");
//   const [method, setMethod] = useState("");
//   const [ackRequired, setAckRequired] = useState(false);
//   const [attachmentRequired, setAttachmentRequired] = useState(false);
//   const [toRecipients, setToRecipients] = useState([]);
//   const [ccRecipients, setCcRecipients] = useState([]);
//   const [acknowledgeTo, setAcknowledgeTo] = useState([]);
//   const [targetEntity, setTargetEntity] = useState("");
//   const [errors, setErrors] = useState({
//     template: "",
//     method: "",
//   });
//   const [datePickerOpen, setDatePickerOpen] = useState(false);
//   const [calendarDate, setCalendarDate] = useState(new Date(2025, 8, 1));
//   const [timePickerOpen, setTimePickerOpen] = useState(false);
//   const [repeatAnchorEl, setRepeatAnchorEl] = useState(null);
//   const [frequencyApiSuccess, setFrequencyApiSuccess] = useState(false);
//   const [repeatEvery, setRepeatEvery] = useState(1);
//   const [repeatPeriod, setRepeatPeriod] = useState("month");
//   const [monthlyOption, setMonthlyOption] = useState("");
//   const [yearlyOption, setYearlyOption] = useState("same-day");
//   const [endsOption, setEndsOption] = useState("never");
//   const [endDate, setEndDate] = useState(null);
//   const [occurrences, setOccurrences] = useState(0);
//   const [selectedDays, setSelectedDays] = useState([
//     false,
//     false,
//     false,
//     false,
//     false,
//     false,
//     false,
//   ]);
//   const [dialog, setDialog] = useState({
//     open: false,
//     type: "",
//     rowData: null,
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isCustomRecurrence, setIsCustomRecurrence] = useState(false);
//   const [viewDialogOpen, setViewDialogOpen] = useState(false);
//   const [selectedReminder, setSelectedReminder] = useState(null);
  
//   // API hooks
//   const createNotification = usePost(["createNotification"]);
//   const deleteNotification = useDelete(["deleteNotification"]);
//   const updateNotification = usePut(["updateNotification"]);
//   const mediumList = useGet(["mediumList"], `${GET.MEDIUM_LIST}`, true);
//   const templateList = useGet(["templateList"], `${GET.TEMPLATE_LIST}`, true);
//   const { data: frequencyListData, refetch } = useGet(
//     ["frequencyList", notificationTypeId],
//     notificationTypeId
//       ? `${GET.FREQUENCY_LIST}?notificationTypeId=${notificationTypeId}`
//       : "",
//     !!notificationTypeId
//   );
  
//   // Reset form fields
//   const resetFormFields = () => {
//     setSelectedDate(new Date());
//     setSelectedTime(() => {
//       const now = new Date();
//       let hours = now.getHours();
//       const minutes = now.getMinutes();
//       const ampm = hours >= 12 ? "PM" : "AM";
//       hours = hours % 12 || 12;
//       return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
//     });
//     setRepeatOption("Do not repeat");
//     setPreviousRepeatOption("Do not repeat"); // Reset previous selection
//     setTemplate("");
//     setMethod("");
//     setAckRequired(false);
//     setAttachmentRequired(false);
//     setToRecipients([]);
//     setCcRecipients([]);
//     setAcknowledgeTo([]);
//     setTargetEntity("");
//     setRepeatEvery(1);
//     setRepeatPeriod("month");
//     setMonthlyOption("");
//     setYearlyOption("same-day");
//     setEndsOption("never");
//     setEndDate(null);
//     setOccurrences(0);
//     setSelectedDays([false, false, false, false, false, false, false]);
//     setErrors({
//       template: "",
//       method: "",
//     });
//     setIsCustomRecurrence(false);
//   };
  
//   useEffect(() => {
//     if (notificationTypeId && !frequencyApiSuccess) {
//       setFrequencyApiSuccess(true);
//     }
//   }, [notificationTypeId, frequencyApiSuccess]);
  
//   const columns: GridColDef[] = [
//     {
//       field: "frequency",
//       headerName: "Frequency",
//       width: 120,
//       valueGetter: (params) => params || "-",
//     },
//     {
//       field: "schedulerStartDate",
//       headerName: "Start Date",
//       width: 150,
//       valueGetter: (params) => {
//         const date = params;
//         return date
//           ? new Date(date).toLocaleDateString("en-GB", {
//               day: "2-digit",
//               month: "2-digit",
//               year: "numeric",
//             })
//           : "Not set";
//       },
//     },
//     {
//       field: "acknowledgeRequired",
//       headerName: "Acknowledge Required",
//       width: 150,
//       valueGetter: (params) => (params ? "Yes" : "No"),
//     },
//     {
//       field: "attachmentRequired",
//       headerName: "Attachment Required",
//       width: 150,
//       valueGetter: (params) => (params ? "Yes" : "No"),
//     },
//     {
//       field: "templateId",
//       headerName: "Template",
//       width: 180,
//       valueGetter: (params) => {
//         const template = params?.name;
//         return template || "-";
//       },
//     },
//     {
//       field: "medium",
//       headerName: "Notification Method",
//       width: 180,
//       valueGetter: (params) => {
//         const medium = params?.medium;
//         return medium || "-";
//       },
//     },
//     {
//       field: "actions",
//       headerName: "Actions",
//       width: 200,
//       sortable: false,
//       renderCell: (params) => (
//         <Box sx={{ display: "flex", gap: 1 }}>
//           <Tooltip title="Edit" placement="top">
//             <IconButton
//               color="primary"
//               aria-label="edit"
//               onClick={() => handleEditReminder(params.row)}
//             >
//               <EditIcon />
//             </IconButton>
//           </Tooltip>
//           <Tooltip title="View" placement="top">
//             <IconButton
//               color="primary"
//               aria-label="view"
//               onClick={() => handleViewReminder(params.row)}
//             >
//               <VisibilityIcon />
//             </IconButton>
//           </Tooltip>
//           <Tooltip title="Delete" placement="top">
//             <IconButton
//               color="error"
//               aria-label="delete"
//               onClick={() => handleDeleteClick(params.row)}
//             >
//               <DeleteIcon />
//             </IconButton>
//           </Tooltip>
//         </Box>
//       ),
//     },
//   ];
  
//   interface RecipientData {
//     customEmails?: string[];
//     attributeId?: string;
//     refAttributeId?: string[];
//     label?: string;
//   }
  
//   interface FieldOption {
//     attributeId: string;
//     refAttributeId?: string[];
//     type?: string;
//     label: string;
//   }
  
//   const transformRecipients = (
//     recipients: RecipientData[],
//     fieldOptions: FieldOption[]
//   ): (string | RecipientData)[] => {
//     if (!recipients || !Array.isArray(recipients)) return [];
//     return recipients.flatMap((recipient) => {
//       if (
//         recipient.customEmails &&
//         Array.isArray(recipient.customEmails) &&
//         recipient.customEmails.length > 0
//       ) {
//         return recipient.customEmails.map((email) => email);
//       }
//       if (recipient.attributeId) {
//         const match = fieldOptions.find(
//           (option) =>
//             option.attributeId === recipient.attributeId &&
//             arraysEqual(
//               option.refAttributeId || [],
//               recipient.refAttributeId || []
//             )
//         );
//         if (match) return match;
//         return {
//           attributeId: recipient.attributeId,
//           refAttributeId: recipient.refAttributeId || [],
//           label: `Field: ${recipient.attributeId}`,
//         };
//       }
//       return recipient;
//     });
//   };
  
//   const transformTargetEntity = (entity, fieldOptions) => {
//     if (!entity) return null;
//     if (
//       entity.customEmails &&
//       Array.isArray(entity.customEmails) &&
//       entity.customEmails.length > 0
//     ) {
//       return entity.customEmails[0];
//     }
//     if (entity.attributeId) {
//       const match = fieldOptions.find(
//         (option) =>
//           option.attributeId === entity.attributeId &&
//           arraysEqual(option.refAttributeId || [], entity.refAttributeId || [])
//       );
//       if (match) return match;
//       return {
//         attributeId: entity.attributeId,
//         refAttributeId: entity.refAttributeId || [],
//         label: `Field: ${entity.attributeId}`,
//       };
//     }
//     return entity;
//   };
  
//   const handleEditReminder = (row) => {
//     setModalType("edit");
//     setSelectedReminder(row);
//     if (row.schedulerStartDate) {
//       setSelectedDate(new Date(row.schedulerStartDate));
//     }
//     if (row.triggerTime) {
//       setSelectedTime(row.triggerTime);
//     }
//     if (row.frequency) {
//       let uiFrequency = getExactUIFrequencyFromAPI(
//         row,
//         new Date(row.schedulerStartDate)
//       );
//       if (row.frequency === "daily" && row.interval === 1 && !row.maxOccurrences && !row.schedulerEndDate) {
//         uiFrequency = "Daily";
//       }
//       setRepeatOption(uiFrequency);
//       setPreviousRepeatOption(uiFrequency); // Set the previous selection
//       setIsCustomRecurrence(
//         row.frequency === "custom" ||
//           (row.interval && row.interval > 1) ||
//           (row.monthOfYear !== undefined && row.dayOfYearMonth !== undefined) ||
//           (row.schedulerEndDate && row.schedulerEndDate !== null) ||
//           (row.maxOccurrences && row.maxOccurrences > 0) ||
//           (row.daysOfWeek && row.daysOfWeek.length > 1)
//       );
//       if (row.interval) {
//         setRepeatEvery(row.interval);
//       }
//       if (row.frequency === "daily") {
//         setRepeatPeriod("day");
//       } else if (row.frequency === "weekly") {
//         setRepeatPeriod("week");
//       } else if (row.frequency === "monthly") {
//         setRepeatPeriod("month");
//       } else if (row.frequency === "yearly") {
//         setRepeatPeriod("year");
//       } else if (row.frequency === "custom") {
//         if (row.daysOfWeek && row.daysOfWeek.length > 0) {
//           setRepeatPeriod("week");
//         } else if (
//           row.dayOfMonth ||
//           (row.weekOfMonth && row.dayOfWeekInMonth !== undefined)
//         ) {
//           setRepeatPeriod("month");
//         } else if (row.monthOfYear && row.dayOfYearMonth) {
//           setRepeatPeriod("year");
//         } else {
//           setRepeatPeriod("day");
//         }
//       }
//       if (row.schedulerEndDate) {
//         setEndsOption("on");
//         setEndDate(new Date(row.schedulerEndDate));
//       } else if (row.maxOccurrences && row.maxOccurrences > 0) {
//         setEndsOption("after");
//         setOccurrences(row.maxOccurrences);
//       } else {
//         setEndsOption("never");
//       }
//       if (row.daysOfWeek && Array.isArray(row.daysOfWeek)) {
//         const newSelectedDays = [
//           false,
//           false,
//           false,
//           false,
//           false,
//           false,
//           false,
//         ];
//         row.daysOfWeek.forEach((dayIndex) => {
//           if (dayIndex >= 0 && dayIndex <= 6) {
//             newSelectedDays[dayIndex] = true;
//           }
//         });
//         setSelectedDays(newSelectedDays);
//       } else {
//         const newSelectedDays = [
//           false,
//           false,
//           false,
//           false,
//           false,
//           false,
//           false,
//         ];
//         const dayIndex = new Date(row.schedulerStartDate).getDay();
//         newSelectedDays[dayIndex] = true;
//         setSelectedDays(newSelectedDays);
//       }
//       if (row.frequency === "monthly") {
//         if (row.dayOfMonth && row.dayOfMonth.length > 0) {
//           setMonthlyOption(`Monthly on day ${row.dayOfMonth[0]}`);
//         } else if (
//           row.weekOfMonth &&
//           row.weekOfMonth.length > 0 &&
//           row.dayOfWeekInMonth !== undefined
//         ) {
//           const dayNames = [
//             "Sunday",
//             "Monday",
//             "Tuesday",
//             "Wednesday",
//             "Thursday",
//             "Friday",
//             "Saturday",
//           ];
//           const occurrenceMap = ["first", "second", "third", "fourth", "fifth"];
//           const occurrence =
//             row.weekOfMonth[0] === 5
//               ? "last"
//               : occurrenceMap[row.weekOfMonth[0] - 1];
//           setMonthlyOption(
//             `Monthly on the ${occurrence} ${dayNames[row.dayOfWeekInMonth]}`
//           );
//         }
//       }
//     }
//     if (row.templateId) {
//       setTemplate(row.templateId._id || row.templateId);
//     }
//     if (row.medium) {
//       setMethod(row.medium._id || row.medium);
//     }
//     if (row.acknowledgeRequired) {
//       setAckRequired(row.acknowledgeRequired);
//     }
//     if (row.attachmentRequired) {
//       setAttachmentRequired(row.attachmentRequired);
//     }
//     if (row.recipients_to) {
//       setToRecipients(transformRecipients(row.recipients_to, fieldOptions));
//     }
//     if (row.recipients_cc) {
//       setCcRecipients(transformRecipients(row.recipients_cc, fieldOptions));
//     }
//     if (row.acknowledge_to) {
//       setAcknowledgeTo(transformRecipients(row.acknowledge_to, fieldOptions));
//     }
//     if (row.targetEntity) {
//       setTargetEntity(transformTargetEntity(row.targetEntity, fieldOptions));
//     }
//     setOpen(true);
//   };
  
//   const handleViewReminder = (row) => {
//     setSelectedReminder(row);
//     setViewDialogOpen(true);
//   };
  
//   const handleDeleteClick = (row) => {
//     setDialog({
//       open: true,
//       type: "delete",
//       rowData: row,
//     });
//   };
  
//   const handleCloseDialog = () => {
//     setDialog({
//       open: false,
//       type: "",
//       rowData: null,
//     });
//   };
  
//   const handleConfirmAction = async () => {
//     if (dialog.type === "delete" && dialog.rowData) {
//       try {
//         setIsSubmitting(true);
//         const response = await deleteNotification.mutateAsync({
//           url: `${DELETE.DELETE_FREQUENCY}/${dialog.rowData._id}`,
//         });
//         if (response.success) {
//           toast.success(response.message || "Scheduler deleted successfully");
//           refetch();
//         } else {
//           toast.error(response.message || "Failed to delete scheduler");
//         }
//       } catch (error) {
//         console.error("Error deleting scheduler:", error);
//         toast.error("An error occurred while deleting the scheduler");
//       } finally {
//         setIsSubmitting(false);
//         handleCloseDialog();
//       }
//     }
//   };
  
//   const validateForm = () => {
//     let isValid = true;
//     const newErrors = {
//       template: "",
//       method: "",
//     };
//     if (!template) {
//       newErrors.template = "Template is required";
//       isValid = false;
//     }
//     if (!method) {
//       newErrors.method = "Method is required";
//       isValid = false;
//     }
//     setErrors(newErrors);
//     return isValid;
//   };
  
//   // Use the imported utility functions
//   const handleChangeCalendarMonth = (delta) => {
//     changeCalendarMonth(setCalendarDate, delta);
//   };
  
//   const getGeneratedCalendarDays = () => {
//     return generateCalendarDays(calendarDate, selectedDate, setDatePickerOpen);
//   };
  
//   const getRepeatOptions = () => {
//     const dayOfWeek = selectedDate.toLocaleDateString("en-US", {
//       weekday: "long",
//     });
//     const dayOfMonth = selectedDate.getDate();
//     const month = selectedDate.toLocaleDateString("en-US", { month: "long" });
//     const numberToWord = (n) => {
//       const words = ["first", "second", "third", "fourth", "fifth"];
//       return words[n - 1] || n;
//     };
//     const getOrdinalOccurrence = (date) => {
//       const day = date.getDate();
//       const weekday = date.getDay();
//       const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
//       const firstWeekday = firstDayOfMonth.getDay();
//       const offset = (weekday - firstWeekday + 7) % 7;
//       const occurrenceNum = Math.floor((day - 1 - offset) / 7) + 1;
//       const lastDayOfMonth = new Date(
//         date.getFullYear(),
//         date.getMonth() + 1,
//         0
//       );
//       const lastWeekday = lastDayOfMonth.getDay();
//       const isLast = lastDayOfMonth.getDate() - day < 7;
//       return {
//         occurrence: isLast ? "last" : numberToWord(occurrenceNum),
//         weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
//       };
//     };
//     const { occurrence, weekday } = getOrdinalOccurrence(selectedDate);
//     const options = [
//       "Do not repeat",
//       "Daily",
//       `Weekly on ${dayOfWeek}`,
//       `Monthly on the ${occurrence} ${weekday}`,
//       `Annually on ${month} ${dayOfMonth}`,
//       "Every weekday (Monday to Friday)",
//       "Custom...",
//     ];
//     if (isCustomRecurrence && repeatOption && !options.includes(repeatOption)) {
//       options.push(repeatOption);
//     }
//     return options;
//   };
  
//   const initializeSelectedDays = () => {
//     const dayIndex = selectedDate.getDay();
//     const newSelectedDays = [...selectedDays];
//     newSelectedDays.fill(false);
//     newSelectedDays[dayIndex] = true;
//     setSelectedDays(newSelectedDays);
//     const numberToWord = (n) => {
//       const words = ["first", "second", "third", "fourth", "fifth"];
//       return words[n - 1] || n;
//     };
//     const getOrdinalOccurrence = (date) => {
//       const day = date.getDate();
//       const weekday = date.getDay();
//       const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
//       const firstWeekday = firstDayOfMonth.getDay();
//       const offset = (weekday - firstWeekday + 7) % 7;
//       const occurrenceNum = Math.floor((day - 1 - offset) / 7) + 1;
//       const lastDayOfMonth = new Date(
//         date.getFullYear(),
//         date.getMonth() + 1,
//         0
//       );
//       const lastWeekday = lastDayOfMonth.getDay();
//       const isLast = lastDayOfMonth.getDate() - day < 7;
//       return {
//         occurrence: isLast ? "last" : numberToWord(occurrenceNum),
//         weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
//       };
//     };
//     const { occurrence, weekday } = getOrdinalOccurrence(selectedDate);
//     const monthlyOptions = [
//       `Monthly on day ${selectedDate.getDate()}`,
//       `Monthly on the ${occurrence} ${weekday}`,
//     ];
//     setMonthlyOption(monthlyOptions[0]);
//   };
  
//   const handleOpenDialog = () => {
//     resetFormFields();
//     setOpen(true);
//     setModalType("add");
//   };
  
//   const handleClose = () => setOpen(false);
  
//   const formatDateForAPI = (date) => {
//     // Check if date is already a Date object
//     if (date instanceof Date) {
//       const year = date.getFullYear();
//       const month = String(date.getMonth() + 1).padStart(2, "0");
//       const day = String(date.getDate()).padStart(2, "0");
//       return `${year}-${month}-${day}`;
//     }
    
//     // If it's a string, try to convert it to a Date object
//     if (typeof date === 'string') {
//       const dateObj = new Date(date);
//       // Check if the conversion resulted in a valid date
//       if (!isNaN(dateObj.getTime())) {
//         const year = dateObj.getFullYear();
//         const month = String(dateObj.getMonth() + 1).padStart(2, "0");
//         const day = String(dateObj.getDate()).padStart(2, "0");
//         return `${year}-${month}-${day}`;
//       }
//     }
    
//     // If it's a timestamp (number), convert it to a Date object
//     if (typeof date === 'number') {
//       const dateObj = new Date(date);
//       // Check if the conversion resulted in a valid date
//       if (!isNaN(dateObj.getTime())) {
//         const year = dateObj.getFullYear();
//         const month = String(dateObj.getMonth() + 1).padStart(2, "0");
//         const day = String(dateObj.getDate()).padStart(2, "0");
//         return `${year}-${month}-${day}`;
//       }
//     }
    
//     // If we can't convert it to a valid date, return a fallback or throw an error
//     console.error("Invalid date provided to formatDateForAPI:", date);
//     return ""; // Default fallback date
//   };
  
//   const formatRecipients = (recipients) => {
//     const result = [];
//     const customEmails = [];
//     recipients.forEach((recipient) => {
//       if (typeof recipient === "string") {
//         if (recipient.includes("@")) {
//           customEmails.push(recipient);
//         } else {
//           result.push({ attributeId: recipient });
//         }
//       } else {
//         if (recipient.label && recipient.label.includes("@")) {
//           customEmails.push(recipient.label);
//         } else if (recipient.attributeId) {
//           const recipientObj = {
//             attributeId: recipient.attributeId,
//           };
//           if (
//             recipient.refAttributeId &&
//             Array.isArray(recipient.refAttributeId) &&
//             recipient.refAttributeId.length > 0
//           ) {
//             recipientObj.refAttributeId = recipient.refAttributeId;
//           }
//           result.push(recipientObj);
//         }
//       }
//     });
//     if (customEmails.length > 0) {
//       result.push({ customEmails });
//     }
//     return result;
//   };
  
//   const formatTargetEntity = (entity) => {
//     if (!entity) return null;
//     if (typeof entity === "string") {
//       if (entity.includes("@")) {
//         return { customEmails: [entity] };
//       } else {
//         return { attributeId: entity };
//       }
//     } else {
//       return entity;
//     }
//   };
  
//   const generatePayload = () => {
//     const formattedToRecipients = formatRecipients(toRecipients);
//     const formattedCcRecipients = formatRecipients(ccRecipients);
//     const formattedAcknowledgeTo = formatRecipients(acknowledgeTo);
//     const formattedTargetEntity = formatTargetEntity(targetEntity);
    
//     // Ensure selectedDate is a Date object
//     const startDate = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
    
//     // Ensure endDate is a Date object if it exists
//     const formattedEndDate = endDate ? (endDate instanceof Date ? endDate : new Date(endDate)) : null;
    
//     const payload = {
//       notificationTypeId,
//       frequency: transformUIToAPIFrequency(repeatOption),
//       schedulerStartDate: formatDateForAPI(startDate),
//       interval: repeatEvery,
//       repeatAnnually: false,
//       attachmentRequired,
//       recipients_to: formattedToRecipients,
//       recipients_cc: formattedCcRecipients,
//       medium: method,
//       templateId: template,
//       triggerTime: selectedTime,
//       isActive: "active",
//       schedulerEndDate: formattedEndDate ? formatDateForAPI(formattedEndDate) : null,
//       maxOccurrences: occurrences,
//     };
    
//     if (formattedAcknowledgeTo.length > 0) {
//       payload.acknowledge_to = formattedAcknowledgeTo;
//     }
//     if (formattedTargetEntity) {
//       payload.targetEntity = formattedTargetEntity;
//     }
    
//     if (repeatOption === "Do not repeat") {
//       return payload;
//     } else if (repeatOption === "Daily") {
//       return payload;
//     } else if (repeatOption.startsWith("Weekly on")) {
//       const dayName = repeatOption.replace("Weekly on ", "").split(" and ")[0];
//       const dayNameToIndex = (dayName) => {
//         const days = [
//           "Sunday",
//           "Monday",
//           "Tuesday",
//           "Wednesday",
//           "Thursday",
//           "Friday",
//           "Saturday",
//         ];
//         return days.indexOf(dayName);
//       };
//       payload.daysOfWeek = [dayNameToIndex(dayName)];
//     } else if (repeatOption === "Every weekday (Monday to Friday)") {
//       payload.daysOfWeek = [1, 2, 3, 4, 5];
//     } else if (repeatOption.startsWith("Monthly on day")) {
//       const dayNumber = parseInt(repeatOption.replace("Monthly on day ", ""));
//       payload.dayOfMonth = [dayNumber];
//     } else if (repeatOption.startsWith("Monthly on the")) {
//       const parts = repeatOption.replace("Monthly on the ", "").split(" ");
//       const occurrence = parts[0];
//       const weekday = parts.slice(1).join(" ");
//       const occurrenceWordToNumber = (occurrence) => {
//         const map = {
//           first: 1,
//           second: 2,
//           third: 3,
//           fourth: 4,
//           fifth: 5,
//           last: 5,
//         };
//         return map[occurrence] || 1;
//       };
//       const dayNameToIndex = (dayName) => {
//         const days = [
//           "Sunday",
//           "Monday",
//           "Tuesday",
//           "Wednesday",
//           "Thursday",
//           "Friday",
//           "Saturday",
//         ];
//         return days.indexOf(dayName);
//       };
//       payload.weekOfMonth = [occurrenceWordToNumber(occurrence)];
//       payload.dayOfWeekInMonth = dayNameToIndex(weekday);
//     } else if (repeatOption.startsWith("Annually on")) {
//       const parts = repeatOption.replace("Annually on ", "").split(" ");
//       const monthName = parts[0];
//       const dayNumber = parseInt(parts[1]);
//       const monthNames = [
//         "January",
//         "February",
//         "March",
//         "April",
//         "May",
//         "June",
//         "July",
//         "August",
//         "September",
//         "October",
//         "November",
//         "December",
//       ];
//       payload.monthOfYear = monthNames.indexOf(monthName) + 1;
//       payload.dayOfYearMonth = dayNumber;
//     }
    
//     if (isCustomRecurrence) {
//       if (repeatPeriod === "day") {
//         payload.frequency = "daily";
//       } else if (repeatPeriod === "week") {
//         payload.frequency = "weekly";
//         const daysArray = [];
//         if (Array.isArray(selectedDays) && selectedDays.length === 7) {
//           if (selectedDays[0]) daysArray.push(0);
//           if (selectedDays[1]) daysArray.push(1);
//           if (selectedDays[2]) daysArray.push(2);
//           if (selectedDays[3]) daysArray.push(3);
//           if (selectedDays[4]) daysArray.push(4);
//           if (selectedDays[5]) daysArray.push(5);
//           if (selectedDays[6]) daysArray.push(6);
//         }
//         if (daysArray.length === 0) {
//           daysArray.push(selectedDate.getDay());
//         }
//         payload.daysOfWeek = daysArray;
//       } else if (repeatPeriod === "month") {
//         payload.frequency = "monthly";
//         if (monthlyOption && monthlyOption.startsWith("Monthly on day")) {
//           const dayNumber = parseInt(monthlyOption.split(" ").pop());
//           payload.dayOfMonth = [dayNumber];
//         } else if (
//           monthlyOption &&
//           monthlyOption.startsWith("Monthly on the")
//         ) {
//           const parts = monthlyOption.replace("Monthly on the ", "").split(" ");
//           const occurrence = parts[0];
//           const weekday = parts.slice(1).join(" ");
//           const occurrenceWordToNumber = (occurrence) => {
//             const map = {
//               first: 1,
//               second: 2,
//               third: 3,
//               fourth: 4,
//               fifth: 5,
//               last: 5,
//             };
//             return map[occurrence] || 1;
//           };
//           const dayNameToIndex = (dayName) => {
//             const days = [
//               "Sunday",
//               "Monday",
//               "Tuesday",
//               "Wednesday",
//               "Thursday",
//               "Friday",
//               "Saturday",
//             ];
//             return days.indexOf(dayName);
//           };
//           payload.weekOfMonth = [occurrenceWordToNumber(occurrence)];
//           payload.dayOfWeekInMonth = dayNameToIndex(weekday);
//         }
//       } else if (repeatPeriod === "year") {
//         payload.frequency = "yearly";
//         if (yearlyOption === "same-day") {
//           payload.monthOfYear = selectedDate.getMonth() + 1;
//           payload.dayOfYearMonth = selectedDate.getDate();
//         }
//       }
      
//       if (endsOption === "on") {
//         payload.schedulerEndDate = formattedEndDate ? formatDateForAPI(formattedEndDate) : null;
//       } else if (endsOption === "after") {
//         payload.maxOccurrences = occurrences;
//       }
//     }
    
//     return payload;
//   };
  
//   const handleSave = async (payload = null) => {
//     if (!validateForm()) {
//       return;
//     }
//     try {
//       const finalPayload = payload || generatePayload();
//       let response;
//       if (modelType === "edit") {
//         response = await updateNotification.mutateAsync({
//           url: `${PUT.UPDATE_FREQUENCY}/${selectedReminder?._id}`,
//           payload: finalPayload,
//         });
//       } else {
//         response = await createNotification.mutateAsync({
//           url: `${POST.CREATE_FREQUENCY}`,
//           payload: finalPayload,
//         });
//       }
//       if (response.success) {
//         toast.success(
//           response.message ||
//             (modelType === "edit"
//               ? "Scheduler updated successfully"
//               : "Scheduler created successfully")
//         );
//         resetFormFields();
//         refetch();
//       }
//       handleClose();
//     } catch (error) {
//       console.error("Error saving scheduler:", error);
//       toast.error(
//         `An error occurred while ${modelType === "edit" ? "updating" : "creating"} the scheduler`
//       );
//     }
//   };
  
//   const handleRepeatClick = (e) => {
//     setRepeatAnchorEl(e.currentTarget);
//   };
  
//   const handleRepeatSelect = (value) => {
//     // Store the current selection before changing it
//     setPreviousRepeatOption(repeatOption);
    
//     setRepeatOption(value);
//     setRepeatAnchorEl(null);
    
//     if (value === "Custom...") {
//       setIsCustomRecurrence(true);
//       // Only initialize if not in edit mode
//       if (modelType !== "edit") {
//         initializeSelectedDays();
//       }
//       setCustomRecurrenceOpen(true);
//       if (repeatOption.startsWith("Weekly on")) {
//         setRepeatPeriod("week");
//       } else if (repeatOption === "Daily") {
//         setRepeatPeriod("day");
//       } else if (repeatOption.startsWith("Monthly on")) {
//         setRepeatPeriod("month");
//       } else if (repeatOption.startsWith("Annually on")) {
//         setRepeatPeriod("year");
//       }
//     } else {
//       setIsCustomRecurrence(false);
//       setRepeatEvery(1);
//       setEndsOption("never");
//       setEndDate(null);
//       setOccurrences(0);
//       setSelectedDays([false, false, false, false, false, false, false]);
//     }
//   };
  
//   const handleTimeChange = (newValue) => {
//     if (newValue) {
//       setSelectedTime(newValue.format("hh:mm A"));
//     } else {
//       setSelectedTime("");
//     }
//     setTimePickerOpen(false);
//   };
  
//   return (
//     <Box sx={{ p: 3 }}>
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           mb: 3,
//         }}
//       >
//         <Typography
//           variant="h5"
//           sx={{
//             fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
//             color: STYLE_GUIDE.COLORS.primaryDark,
//           }}
//         >
//           {frequencyListData?.data?.length > 0
//             ? "Scheduler Listing"
//             : "Scheduler"}
//         </Typography>
//         <Button
//           variant="contained"
//           onClick={handleOpenDialog}
//           sx={{
//             textTransform: "none",
//             borderRadius: 2,
//             fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
//           }}
//         >
//           Add New
//         </Button>
//       </Box>
//       {frequencyListData?.data?.length > 0 ? (
//         <Box>
//           <Box
//             sx={{
//               border: `1px solid ${STYLE_GUIDE.COLORS.border}`,
//               borderRadius: 2,
//               overflow: "hidden",
//             }}
//           >
//             <DataGrid
//               rows={frequencyListData?.data || []}
//               columns={columns}
//               getRowId={(row) => row._id}
//               autoHeight
//               disableColumnMenu
//               disableRowSelectionOnClick
//               hideFooterPagination
//               hideFooterSelectedRowCount
//               sx={{
//                 "& .MuiDataGrid-columnHeaders": {
//                   backgroundColor: STYLE_GUIDE.COLORS.background,
//                 },
//                 "& .MuiDataGrid-row": {
//                   "&:hover": {
//                     backgroundColor: STYLE_GUIDE.COLORS.hover,
//                   },
//                 },
//               }}
//             />
//           </Box>
//         </Box>
//       ) : (
//         <Box
//           sx={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             justifyContent: "center",
//             p: 5,
//             border: `1px dashed ${STYLE_GUIDE.COLORS.border}`,
//             borderRadius: 2,
//             backgroundColor: STYLE_GUIDE.COLORS.background,
//             textAlign: "center",
//           }}
//         >
//           <CalendarMonthOutlined
//             sx={{ fontSize: 48, color: STYLE_GUIDE.COLORS.disabled, mb: 2 }}
//           />
//           <Typography variant="h6" color="textSecondary" gutterBottom>
//             No Schedulers Added Yet
//           </Typography>
//         </Box>
//       )}
//       <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
//         <DialogTitle
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             pb: 1,
//             borderBottom: "1px solid #e0e0e0",
//           }}
//         >
//           <Typography variant="h6" sx={{ fontWeight: 500 }}>
//             {modelType === "edit" ? "Edit Scheduler" : "Add Scheduler"}
//           </Typography>
//           <IconButton onClick={handleClose} size="small">
//             <CloseIcon />
//           </IconButton>
//         </DialogTitle>
//         <DialogContent
//           sx={{
//             pt: 2,
//             display: "flex",
//             flexDirection: "column",
//             gap: 2,
//             mt: 2,
//           }}
//         >
//           <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
//             <Typography
//               variant="body2"
//               sx={{
//                 color: "rgba(0, 0, 0, 0.6)",
//                 fontWeight: 500,
//                 fontSize: "0.875rem",
//                 lineHeight: "1.4375rem",
//                 letterSpacing: "0.00938em",
//                 pl: 0.5,
//               }}
//             >
//               Starts on
//             </Typography>
//             <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
//               <CalendarMonthOutlined sx={{ color: "#666" }} fontSize="small" />
//               <Button
//                 variant="outlined"
//                 onClick={() => setDatePickerOpen(true)}
//                 sx={{
//                   flex: 1,
//                   backgroundColor: "#f8f9fa",
//                   border: "1px solid #ddd",
//                   borderRadius: 2,
//                   color: "#3c4043",
//                   textTransform: "none",
//                   justifyContent: "flex-start",
//                   "&:hover": {
//                     backgroundColor: "#f1f3f4",
//                     border: "1px solid #ccc",
//                   },
//                 }}
//               >
//                 {formatDate(selectedDate)}
//               </Button>
//               {!allDay && (
//                 <>
//                   <AccessTimeIcon sx={{ color: "#666" }} fontSize="small" />
//                   <Button
//                     variant="outlined"
//                     onClick={() => setTimePickerOpen(true)}
//                     sx={{
//                       minWidth: 100,
//                       backgroundColor: "#f8f9fa",
//                       border: "1px solid #ddd",
//                       borderRadius: 2,
//                       color: "#3c4043",
//                       textTransform: "none",
//                       justifyContent: "flex-start",
//                       "&:hover": {
//                         backgroundColor: "#f1f3f4",
//                         border: "1px solid #ccc",
//                       },
//                     }}
//                   >
//                     {selectedTime}
//                   </Button>
//                 </>
//               )}
//             </Box>
//           </Box>
//           <Box sx={{ display: "flex", alignItems: "center", gap: 2, pl: 4 }}>
//             <FormControl fullWidth size="small">
//               <InputLabel>Repeat</InputLabel>
//               <Select
//                 value={repeatOption}
//                 onChange={(e) => handleRepeatSelect(e.target.value)}
//                 label="Repeat"
//                 sx={{
//                   backgroundColor: "#f8f9fa",
//                   borderRadius: 2,
//                   "& .MuiSelect-select": {
//                     color: "#3c4043",
//                   },
//                 }}
//               >
//                 {getRepeatOptions().map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Box>
//           <Box sx={{ mt: 1 }}>
//             <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
//               <Box sx={{ flex: 0.5, minWidth: "120px" }}>
//                 <FormControl size="small" fullWidth error={!!errors.template}>
//                   <InputLabel>Template</InputLabel>
//                   <Select
//                     value={template}
//                     onChange={(e) => {
//                       setTemplate(e.target.value);
//                       if (e.target.value) {
//                         setErrors({ ...errors, template: "" });
//                       }
//                     }}
//                     label="Template"
//                     displayEmpty
//                     aria-label="Select template"
//                   >
//                     {templateList.data?.data?.map((option) => (
//                       <MenuItem key={option._id} value={option._id}>
//                         {option.name}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                   {errors.template && (
//                     <FormHelperText error>{errors.template}</FormHelperText>
//                   )}
//                 </FormControl>
//               </Box>
//               <Box sx={{ flex: 0.5, minWidth: "120px" }}>
//                 <FormControl size="small" fullWidth error={!!errors.method}>
//                   <InputLabel>Method</InputLabel>
//                   <Select
//                     value={method}
//                     onChange={(e) => {
//                       setMethod(e.target.value);
//                       if (e.target.value) {
//                         setErrors({ ...errors, method: "" });
//                       }
//                     }}
//                     label="Method"
//                     displayEmpty
//                     renderValue={(selected) =>
//                       mediumList.data?.data?.find(
//                         (medium) => medium._id === selected
//                       )?.medium || selected
//                     }
//                     aria-label="Select notification method"
//                   >
//                     <MenuItem value="">Select Method...</MenuItem>
//                     {mediumList.data?.data?.map((option) => (
//                       <MenuItem key={option._id} value={option._id}>
//                         {option.medium}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                   {errors.method && (
//                     <FormHelperText error>{errors.method}</FormHelperText>
//                   )}
//                 </FormControl>
//               </Box>
//             </Box>
//             <Box sx={{ display: "flex", gap: 2, mt: 2, alignItems: "center" }}>
//               <FormControl fullWidth size="small">
//                 <Autocomplete
//                   freeSolo
//                   size="small"
//                   id="target-entity-autocomplete"
//                   options={fieldOptions.filter(
//                     (option) => option.type === "email"
//                   )}
//                   getOptionLabel={(option) => {
//                     if (typeof option === "string") return option;
//                     return option.label || option.attributeId || "";
//                   }}
//                   isOptionEqualToValue={(option, value) => {
//                     if (
//                       typeof option === "string" &&
//                       typeof value === "string"
//                     ) {
//                       return option === value;
//                     }
//                     if (
//                       typeof option !== "string" &&
//                       typeof value !== "string"
//                     ) {
//                       return (
//                         option.attributeId === value.attributeId &&
//                         arraysEqual(
//                           option.refAttributeId || [],
//                           value.refAttributeId || []
//                         )
//                       );
//                     }
//                     return false;
//                   }}
//                   value={targetEntity}
//                   onChange={(event, newValue) => setTargetEntity(newValue)}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       variant="outlined"
//                       label="Sent To (Group)"
//                       placeholder="Type or select"
//                       size="small"
//                     />
//                   )}
//                 />
//               </FormControl>
//               <Box sx={{ display: "flex", alignItems: "center" }}>
//                 <FormControlLabel
//                   control={
//                     <Checkbox
//                       checked={attachmentRequired}
//                       onChange={(e) => setAttachmentRequired(e.target.checked)}
//                       size="small"
//                     />
//                   }
//                   label="Attachment"
//                   sx={{ mb: "35px !important" }}
//                 />
//               </Box>
//             </Box>
//             <Box sx={{ mt: 1 }}>
//               <FormControl fullWidth size="small">
//                 <Autocomplete
//                   multiple
//                   freeSolo
//                   size="small"
//                   id="acknowledge-to"
//                   options={fieldOptions.filter(
//                     (option) => option.type === "email"
//                   )}
//                   getOptionLabel={(option) => {
//                     if (typeof option === "string") return option;
//                     return option?.label || option?.attributeId || "";
//                   }}
//                   isOptionEqualToValue={(option, value) => {
//                     if (
//                       typeof option === "string" &&
//                       typeof value === "string"
//                     ) {
//                       return option === value;
//                     }
//                     if (
//                       typeof option !== "string" &&
//                       typeof value !== "string"
//                     ) {
//                       return (
//                         option.attributeId === value.attributeId &&
//                         arraysEqual(
//                           option.refAttributeId || [],
//                           value.refAttributeId || []
//                         )
//                       );
//                     }
//                     return false;
//                   }}
//                   value={acknowledgeTo}
//                   onChange={(event, newValue) => {
//                     setAcknowledgeTo(newValue);
//                   }}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       variant="outlined"
//                       label="Acknowledge To"
//                       placeholder="Type or select"
//                       size="small"
//                     />
//                   )}
//                   renderTags={(value, getTagProps) =>
//                     value.map((option, index) => (
//                       <Chip
//                         key={
//                           typeof option === "string"
//                             ? option
//                             : `${option.attributeId}-${JSON.stringify(option.refAttributeId || [])}`
//                         }
//                         label={
//                           typeof option === "string" ? option : option.label
//                         }
//                         {...getTagProps({ index })}
//                         size="small"
//                       />
//                     ))
//                   }
//                 />
//               </FormControl>
//             </Box>
//             <Box sx={{ mt: 1 }}>
//               <FormControl fullWidth size="small">
//                 <Autocomplete
//                   multiple
//                   freeSolo
//                   size="small"
//                   id="to-recipients-autocomplete"
//                   options={fieldOptions.filter(
//                     (option) => option.type === "email"
//                   )}
//                   getOptionLabel={(option) => {
//                     if (typeof option === "string") return option;
//                     return option.label || option.attributeId || "";
//                   }}
//                   isOptionEqualToValue={(option, value) => {
//                     if (
//                       typeof option === "string" &&
//                       typeof value === "string"
//                     ) {
//                       return option === value;
//                     }
//                     if (
//                       typeof option !== "string" &&
//                       typeof value !== "string"
//                     ) {
//                       return (
//                         option.attributeId === value.attributeId &&
//                         arraysEqual(
//                           option.refAttributeId || [],
//                           value.refAttributeId || []
//                         )
//                       );
//                     }
//                     return false;
//                   }}
//                   value={toRecipients}
//                   onChange={(event, newValue) => {
//                     setToRecipients(newValue);
//                   }}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       variant="outlined"
//                       label="TO Recipients"
//                       placeholder="Type or select"
//                       size="small"
//                     />
//                   )}
//                   renderTags={(value, getTagProps) =>
//                     value.map((option, index) => (
//                       <Chip
//                         key={
//                           typeof option === "string"
//                             ? option
//                             : `${option.attributeId}-${JSON.stringify(option.refAttributeId || [])}`
//                         }
//                         label={
//                           typeof option === "string" ? option : option.label
//                         }
//                         {...getTagProps({ index })}
//                         size="small"
//                       />
//                     ))
//                   }
//                 />
//               </FormControl>
//             </Box>
//             <Box sx={{ mt: 1 }}>
//               <FormControl fullWidth size="small">
//                 <Autocomplete
//                   multiple
//                   freeSolo
//                   size="small"
//                   id="cc-recipients-autocomplete"
//                   options={fieldOptions.filter(
//                     (option) => option.type === "email"
//                   )}
//                   getOptionLabel={(option) => {
//                     if (typeof option === "string") return option;
//                     return option.label || option.attributeId || "";
//                   }}
//                   isOptionEqualToValue={(option, value) => {
//                     if (
//                       typeof option === "string" &&
//                       typeof value === "string"
//                     ) {
//                       return option === value;
//                     }
//                     if (
//                       typeof option !== "string" &&
//                       typeof value !== "string"
//                     ) {
//                       return (
//                         option.attributeId === value.attributeId &&
//                         arraysEqual(
//                           option.refAttributeId || [],
//                           value.refAttributeId || []
//                         )
//                       );
//                     }
//                     return false;
//                   }}
//                   value={ccRecipients}
//                   onChange={(event, newValue) => {
//                     setCcRecipients(newValue);
//                   }}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       variant="outlined"
//                       label="CC Recipients"
//                       placeholder="Type or select"
//                       size="small"
//                     />
//                   )}
//                   renderTags={(value, getTagProps) =>
//                     value.map((option, index) => (
//                       <Chip
//                         key={
//                           typeof option === "string"
//                             ? option
//                             : `${option.attributeId}-${JSON.stringify(option.refAttributeId || [])}`
//                         }
//                         label={
//                           typeof option === "string" ? option : option.label
//                         }
//                         {...getTagProps({ index })}
//                         size="small"
//                       />
//                     ))
//                   }
//                 />
//               </FormControl>
//             </Box>
//           </Box>
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
//           <Button
//             variant="outlined"
//             onClick={handleClose}
//             sx={{ textTransform: "none", borderRadius: 2 }}
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="contained"
//             onClick={() => handleSave()}
//             sx={{ textTransform: "none", borderRadius: 2 }}
//           >
//             {modelType === "edit" ? "Update" : "Save"}
//           </Button>
//         </DialogActions>
//       </Dialog>
//       <Dialog
//         open={datePickerOpen}
//         onClose={() => setDatePickerOpen(false)}
//         maxWidth="xs"
//         PaperProps={{
//           sx: {
//             borderRadius: 2,
//             overflow: "hidden",
//           },
//         }}
//       >
//         <Box sx={{ p: 2 }}>
//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               mb: 2,
//             }}
//           >
//             <IconButton onClick={() => handleChangeCalendarMonth(-1)}>
//               <ChevronLeft />
//             </IconButton>
//             <Typography variant="h6" sx={{ fontWeight: 500 }}>
//               {calendarDate.toLocaleDateString("en-US", {
//                 month: "long",
//                 year: "numeric",
//               })}
//             </Typography>
//             <IconButton onClick={() => handleChangeCalendarMonth(1)}>
//               <ChevronRight />
//             </IconButton>
//           </Box>
//           <Grid container columns={7} sx={{ mb: 1 }}>
//             {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
//               <Grid item xs={1} key={day} sx={{ textAlign: "center" }}>
//                 <Typography
//                   variant="caption"
//                   sx={{
//                     fontWeight: 600,
//                     color: "text.secondary",
//                     fontSize: "0.75rem",
//                   }}
//                 >
//                   {day}
//                 </Typography>
//               </Grid>
//             ))}
//           </Grid>
//           <Grid container columns={7}>
//             {getGeneratedCalendarDays()}
//           </Grid>
//           <DialogActions sx={{ mt: 2, pt: 1 }}>
//             <Button onClick={() => setDatePickerOpen(false)}>Cancel</Button>
//             <Button
//               onClick={() => setDatePickerOpen(false)}
//               variant="contained"
//               sx={{ ml: 1 }}
//             >
//               OK
//             </Button>
//           </DialogActions>
//         </Box>
//       </Dialog>
//       <Dialog
//         open={timePickerOpen}
//         onClose={() => setTimePickerOpen(false)}
//         maxWidth="xs"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: 2,
//             p: 1,
//           },
//         }}
//       >
//         <DialogTitle sx={{ pb: 1, fontSize: "1rem" }}>Select Time</DialogTitle>
//         <DialogContent
//           sx={{
//             display: "flex",
//             flexDirection: "column",
//             gap: 2,
//             pb: 1,
//             mt: 2,
//           }}
//         >
//           <LocalizationProvider dateAdapter={AdapterDayjs}>
//             <TimePicker
//               value={selectedTime ? dayjs(selectedTime, "hh:mm A") : null}
//               onChange={handleTimeChange}
//               format="hh:mm a"
//               slotProps={{
//                 actionBar: { actions: [] },
//                 textField: {
//                   size: "small",
//                   variant: "outlined",
//                   inputProps: { "aria-required": "false" },
//                   "aria-label": "Select time for reminder",
//                 },
//               }}
//             />
//           </LocalizationProvider>
//           <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
//             <Button
//               size="small"
//               onClick={() => setTimePickerOpen(false)}
//               variant="outlined"
//             >
//               Cancel
//             </Button>
//           </Box>
//         </DialogContent>
//       </Dialog>
//       <CustomRecurrence
//         open={customRecurrenceOpen}
//         onClose={() => {
//           // When closing without saving, revert to the previous selection
//           setRepeatOption(previousRepeatOption);
//           setCustomRecurrenceOpen(false);
//         }}
//         repeatEvery={repeatEvery}
//         setRepeatEvery={setRepeatEvery}
//         repeatPeriod={repeatPeriod}
//         setRepeatPeriod={setRepeatPeriod}
//         monthlyOption={monthlyOption}
//         setMonthlyOption={setMonthlyOption}
//         endsOption={endsOption}
//         setEndsOption={setEndsOption}
//         endDate={endDate}
//         setEndDate={setEndDate}
//         occurrences={occurrences}
//         setOccurrences={setOccurrences}
//         selectedDays={selectedDays}
//         setSelectedDays={setSelectedDays}
//         selectedDate={selectedDate}
//         endCalendarDate={endCalendarDate}
//         setEndCalendarDate={setEndCalendarDate}
//         isEditMode={modelType === "edit"}
//         initialData={modelType === "edit" ? selectedReminder : null}
//         onSave={(days) => {
//           const validDays =
//             Array.isArray(days) && days.length === 7
//               ? days
//               : selectedDays.length === 7
//                 ? selectedDays
//                 : Array(7)
//                     .fill(false)
//                     .map((_, i) => i === selectedDate.getDay());
//           const customFrequencyText = generateCustomFrequencyText(
//             repeatEvery,
//             repeatPeriod,
//             validDays,
//             monthlyOption,
//             endDate,
//             occurrences,
//             endsOption,
//             selectedDate
//           );
//           setRepeatOption(customFrequencyText);
//           setIsCustomRecurrence(true);
//           setSelectedDays(validDays);
//           setCustomRecurrenceOpen(false);
//           // Update the previous selection to the new custom frequency
//           setPreviousRepeatOption(customFrequencyText);
//         }}
//       />
//       <ViewSchedulerDialog
//         open={viewDialogOpen}
//         onClose={() => setViewDialogOpen(false)}
//         selectedReminder={selectedReminder}
//         fieldOptions={fieldOptions}
//       />
//       <ConfirmationDialog
//         open={dialog.open}
//         onClose={handleCloseDialog}
//         onConfirm={handleConfirmAction}
//         title="Confirm Delete"
//         content="Are you sure you want to delete this scheduler?"
//         confirmText="Delete"
//         confirmButtonColor="error"
//         isSubmitting={isSubmitting}
//       />
//     </Box>
//   );
// }

