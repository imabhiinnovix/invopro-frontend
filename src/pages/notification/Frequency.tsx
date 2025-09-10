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
// import { DELETE, GET, POST, PUT } from "../../services/apiRoutes";
// import CustomRecurrence from "./Frequency/CustomRecurrence";
// import { STYLE_GUIDE } from "../../styles";
// import { DataGrid, GridColDef } from "@mui/x-data-grid";
// import { toast } from "react-toastify";
// import { ConfirmationDialog } from "../../components/common/deleteConfirmationDialog/ConfirmationDialog";
// import useDelete from "../../hooks/useDelete";
// import usePut from "../../hooks/usePut";
// import ViewSchedulerDialog from "./ViewSchedulerDialog";

// // Helper function to compare arrays
// const arraysEqual = (a, b) => {
//   if (a === b) return true;
//   if (a == null || b == null) return false;
//   if (a.length !== b.length) return false;
//   // Sort both arrays to compare regardless of order
//   const sortedA = [...a].sort();
//   const sortedB = [...b].sort();
//   for (let i = 0; i < sortedA.length; ++i) {
//     if (sortedA[i] !== sortedB[i]) return false;
//   }
//   return true;
// };

// // Transform UI frequency value to API frequency value
// const transformUIToAPIFrequency = (uiFrequency) => {
//   switch (uiFrequency) {
//     case "Do not repeat":
//       return "once";
//     case "Daily":
//       return "daily";
//     case "Every weekday (Monday to Friday)":
//       return "weekly";
//     case "Custom...":
//       return "custom";
//     default:
//       // For Weekly, Monthly, Annually options, extract the base frequency
//       if (uiFrequency.startsWith("Weekly on")) return "weekly";
//       if (uiFrequency.startsWith("Monthly on")) return "monthly";
//       if (uiFrequency.startsWith("Annually on")) return "yearly";
//       return uiFrequency; // Fallback
//   }
// };

// // Transform API frequency value to UI frequency value
// const transformAPIToUIFrequency = (apiFrequency, selectedDate) => {
//   switch (apiFrequency) {
//     case "once":
//       return "Do not repeat";
//     case "daily":
//       return "Daily";
//     case "weekly":
//       // This is a simplified version - you might need to enhance it based on your data
//       return `Weekly on ${selectedDate.toLocaleDateString("en-US", { weekday: "long" })}`;
//     case "monthly":
//       // This is a simplified version - you might need to enhance it based on your data
//       const dayOfMonth = selectedDate.getDate();
//       return `Monthly on day ${dayOfMonth}`;
//     case "yearly":
//       // This is a simplified version - you might need to enhance it based on your data
//       const month = selectedDate.toLocaleDateString("en-US", { month: "long" });
//       const day = selectedDate.getDate();
//       return `Annually on ${month} ${day}`;
//     case "custom":
//       return "Custom...";
//     default:
//       return apiFrequency; // Fallback
//   }
// };

// // Update the getExactUIFrequencyFromAPI function to handle "Every 1 day" case
// // const getExactUIFrequencyFromAPI = (row, selectedDate) => {
// //   const {
// //     frequency,
// //     daysOfWeek,
// //     dayOfMonth,
// //     weekOfMonth,
// //     dayOfWeekInMonth,
// //     monthOfYear,
// //     dayOfYearMonth,
// //     schedulerEndDate,
// //     maxOccurrences,
// //     interval = 1, // Default to 1 if not provided
// //   } = row;

// //   // Helper function to format date for display
// //   const formatDateForDisplay = (dateString) => {
// //     if (!dateString) return null;
// //     const date = new Date(dateString);
// //     return date.toLocaleDateString("en-US", {
// //       month: "short",
// //       day: "numeric",
// //       year: "numeric",
// //     });
// //   };

// //   // Helper function to format end condition
// //   const formatEndCondition = (maxOccurrences, schedulerEndDate) => {
// //     if (maxOccurrences && maxOccurrences > 0) {
// //       return `, ending after ${maxOccurrences} occurrence${maxOccurrences > 1 ? "s" : ""}`;
// //     } else if (schedulerEndDate) {
// //       const endDate = formatDateForDisplay(schedulerEndDate);
// //       return `, until ${endDate}`;
// //     }
// //     return "";
// //   };

// //   switch (frequency) {
// //     case "once":
// //       return "Do not repeat";

// //     case "daily":
// //       // Always show "Every X days" format if interval is specified, even if it's 1
// //       if (interval !== undefined) {
// //         const base = `Every ${interval} day${interval > 1 ? "s" : ""}`;
// //         return base + formatEndCondition(maxOccurrences, schedulerEndDate);
// //       }

// //       // Standard daily with end conditions (fallback if interval not specified)
// //       if (maxOccurrences && maxOccurrences > 0) {
// //         return `Daily for ${maxOccurrences} time${maxOccurrences > 1 ? "s" : ""}`;
// //       }
// //       if (schedulerEndDate) {
// //         const endDate = formatDateForDisplay(schedulerEndDate);
// //         return `Daily until ${endDate}`;
// //       }
// //       return "Daily";

// //     case "weekly":
// //       // Check if it's weekdays (Mon-Fri)
// //       if (
// //         daysOfWeek &&
// //         Array.isArray(daysOfWeek) &&
// //         daysOfWeek.length === 5 &&
// //         daysOfWeek.every((day) => [1, 2, 3, 4, 5].includes(day))
// //       ) {
// //         const base =
// //           interval > 1
// //             ? `Every ${interval} weeks on weekdays (Monday to Friday)`
// //             : "Every weekday (Monday to Friday)";
// //         return base + formatEndCondition(maxOccurrences, schedulerEndDate);
// //       }

// //       // Otherwise, get the specific day
// //       if (daysOfWeek && daysOfWeek.length > 0) {
// //         const dayNames = [
// //           "Sunday",
// //           "Monday",
// //           "Tuesday",
// //           "Wednesday",
// //           "Thursday",
// //           "Friday",
// //           "Saturday",
// //         ];
// //         const dayName = dayNames[daysOfWeek[0]];
// //         const base =
// //           interval > 1
// //             ? `Every ${interval} weeks on ${dayName}`
// //             : `Weekly on ${dayName}`;
// //         return base + formatEndCondition(maxOccurrences, schedulerEndDate);
// //       }

// //       // Fallback
// //       const fallbackWeekday = selectedDate.toLocaleDateString("en-US", {
// //         weekday: "long",
// //       });
// //       const fallbackWeeklyBase =
// //         interval > 1
// //           ? `Every ${interval} weeks on ${fallbackWeekday}`
// //           : `Weekly on ${fallbackWeekday}`;
// //       return (
// //         fallbackWeeklyBase +
// //         formatEndCondition(maxOccurrences, schedulerEndDate)
// //       );

// //     case "monthly":
// //       // Check if it's a specific day of the month
// //       if (dayOfMonth && Array.isArray(dayOfMonth) && dayOfMonth.length > 0) {
// //         const base =
// //           interval > 1
// //             ? `Every ${interval} months on day ${dayOfMonth[0]}`
// //             : `Monthly on day ${dayOfMonth[0]}`;
// //         return base + formatEndCondition(maxOccurrences, schedulerEndDate);
// //       }

// //       // Check if it's a weekday occurrence
// //       if (
// //         weekOfMonth &&
// //         Array.isArray(weekOfMonth) &&
// //         weekOfMonth.length > 0 &&
// //         dayOfWeekInMonth !== undefined
// //       ) {
// //         const dayNames = [
// //           "Sunday",
// //           "Monday",
// //           "Tuesday",
// //           "Wednesday",
// //           "Thursday",
// //           "Friday",
// //           "Saturday",
// //         ];
// //         const occurrenceMap = ["first", "second", "third", "fourth", "fifth"];
// //         const occurrence =
// //           weekOfMonth[0] === 5 ? "last" : occurrenceMap[weekOfMonth[0] - 1];

// //         const base =
// //           interval > 1
// //             ? `Every ${interval} months on the ${occurrence} ${dayNames[dayOfWeekInMonth]}`
// //             : `Monthly on the ${occurrence} ${dayNames[dayOfWeekInMonth]}`;
// //         return base + formatEndCondition(maxOccurrences, schedulerEndDate);
// //       }

// //       // Fallback
// //       const fallbackMonthDay = selectedDate.getDate();
// //       const fallbackMonthlyBase =
// //         interval > 1
// //           ? `Every ${interval} months on day ${fallbackMonthDay}`
// //           : `Monthly on day ${fallbackMonthDay}`;
// //       return (
// //         fallbackMonthlyBase +
// //         formatEndCondition(maxOccurrences, schedulerEndDate)
// //       );

// //     case "yearly":
// //       // Check if it's a specific date
// //       if (monthOfYear !== undefined && dayOfYearMonth !== undefined) {
// //         const monthNames = [
// //           "January",
// //           "February",
// //           "March",
// //           "April",
// //           "May",
// //           "June",
// //           "July",
// //           "August",
// //           "September",
// //           "October",
// //           "November",
// //           "December",
// //         ];

// //         const base =
// //           interval > 1
// //             ? `Every ${interval} years on ${monthNames[monthOfYear - 1]} ${dayOfYearMonth}`
// //             : `Annually on ${monthNames[monthOfYear - 1]} ${dayOfYearMonth}`;
// //         return base + formatEndCondition(maxOccurrences, schedulerEndDate);
// //       }

// //       // Fallback - use the selected date to determine the yearly recurrence
// //       const month = selectedDate.toLocaleDateString("en-US", { month: "long" });
// //       const day = selectedDate.getDate();

// //       const fallbackYearlyBase =
// //         interval > 1
// //           ? `Every ${interval} years on ${month} ${day}`
// //           : `Annually on ${month} ${day}`;
// //       return (
// //         fallbackYearlyBase +
// //         formatEndCondition(maxOccurrences, schedulerEndDate)
// //       );

// //     case "custom":
// //       // For custom recurrence, determine the actual frequency type
// //       let actualFrequency = "custom";
// //       let period = "";

// //       if (monthOfYear !== undefined && dayOfYearMonth !== undefined) {
// //         actualFrequency = "yearly";
// //         period = "years";
// //       } else if (
// //         dayOfMonth !== undefined ||
// //         (weekOfMonth !== undefined && dayOfWeekInMonth !== undefined)
// //       ) {
// //         actualFrequency = "monthly";
// //         period = "months";
// //       } else if (daysOfWeek !== undefined && daysOfWeek.length > 0) {
// //         actualFrequency = "weekly";
// //         period = "weeks";
// //       } else {
// //         actualFrequency = "daily";
// //         period = "days";
// //       }

// //       // Format the base string with interval - always show interval for custom recurrences
// //       const base = `Every ${interval} ${period}`;

// //       // Add specific details if available
// //       let details = "";
// //       if (actualFrequency === "weekly" && daysOfWeek && daysOfWeek.length > 0) {
// //         const dayNames = [
// //           "Sunday",
// //           "Monday",
// //           "Tuesday",
// //           "Wednesday",
// //           "Thursday",
// //           "Friday",
// //           "Saturday",
// //         ];
// //         details = " on " + daysOfWeek.map((day) => dayNames[day]).join(", ");
// //       } else if (
// //         actualFrequency === "monthly" &&
// //         dayOfMonth &&
// //         dayOfMonth.length > 0
// //       ) {
// //         details = ` on day ${dayOfMonth[0]}`;
// //       } else if (
// //         actualFrequency === "yearly" &&
// //         monthOfYear !== undefined &&
// //         dayOfYearMonth !== undefined
// //       ) {
// //         const monthNames = [
// //           "January",
// //           "February",
// //           "March",
// //           "April",
// //           "May",
// //           "June",
// //           "July",
// //           "August",
// //           "September",
// //           "October",
// //           "November",
// //           "December",
// //         ];
// //         details = ` on ${monthNames[monthOfYear - 1]} ${dayOfYearMonth}`;
// //       }

// //       return (
// //         base + details + formatEndCondition(maxOccurrences, schedulerEndDate)
// //       );

// //     default:
// //       return frequency; // Fallback
// //   }
// // };

// // Update the getExactUIFrequencyFromAPI function to handle "Every 1 day" case
// const getExactUIFrequencyFromAPI = (row, selectedDate) => {
//   const {
//     frequency,
//     daysOfWeek,
//     dayOfMonth,
//     weekOfMonth,
//     dayOfWeekInMonth,
//     monthOfYear,
//     dayOfYearMonth,
//     schedulerEndDate,
//     maxOccurrences,
//     interval = 1, // Default to 1 if not provided
//   } = row;

//   // Helper function to format date for display
//   const formatDateForDisplay = (dateString) => {
//     if (!dateString) return null;
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });
//   };

//   // Helper function to format end condition
//   const formatEndCondition = (maxOccurrences, schedulerEndDate) => {
//     if (maxOccurrences && maxOccurrences > 0) {
//       return `, ending after ${maxOccurrences} occurrence${maxOccurrences > 1 ? "s" : ""}`;
//     } else if (schedulerEndDate) {
//       const endDate = formatDateForDisplay(schedulerEndDate);
//       return `, until ${endDate}`;
//     }
//     return "";
//   };

//   switch (frequency) {
//     case "once":
//       return "Do not repeat";

//     case "daily":
//       // Always show "Every X days" format if interval is specified, even if it's 1
//       if (interval !== undefined) {
//         const base = `Every ${interval} day${interval > 1 ? "s" : ""}`;
//         return base + formatEndCondition(maxOccurrences, schedulerEndDate);
//       }

//       // Standard daily with end conditions (fallback if interval not specified)
//       if (maxOccurrences && maxOccurrences > 0) {
//         return `Daily for ${maxOccurrences} time${maxOccurrences > 1 ? "s" : ""}`;
//       }
//       if (schedulerEndDate) {
//         const endDate = formatDateForDisplay(schedulerEndDate);
//         return `Daily until ${endDate}`;
//       }
//       return "Daily";

//     case "weekly":
//       // Check if it's weekdays (Mon-Fri)
//       if (
//         daysOfWeek &&
//         Array.isArray(daysOfWeek) &&
//         daysOfWeek.length === 5 &&
//         daysOfWeek.every((day) => [1, 2, 3, 4, 5].includes(day))
//       ) {
//         const base =
//           interval > 1
//             ? `Every ${interval} weeks on weekdays (Monday to Friday)`
//             : "Every weekday (Monday to Friday)";
//         return base + formatEndCondition(maxOccurrences, schedulerEndDate);
//       }

//       // Handle multiple days of the week
//       if (daysOfWeek && Array.isArray(daysOfWeek) && daysOfWeek.length > 0) {
//         const dayNames = [
//           "Sunday",
//           "Monday",
//           "Tuesday",
//           "Wednesday",
//           "Thursday",
//           "Friday",
//           "Saturday",
//         ];
//         // Map daysOfWeek to their names and format the string
//         const selectedDayNames = daysOfWeek
//           .filter((day) => day >= 0 && day <= 6) // Ensure valid day indices
//           .map((day) => dayNames[day])
//           .sort((a, b) => {
//             // Sort days in natural order (Sunday to Saturday)
//             const order = [
//               "Sunday",
//               "Monday",
//               "Tuesday",
//               "Wednesday",
//               "Thursday",
//               "Friday",
//               "Saturday",
//             ];
//             return order.indexOf(a) - order.indexOf(b);
//           });
//         const formattedDays =
//           selectedDayNames.length > 1
//             ? `${selectedDayNames.slice(0, -1).join(", ")} and ${selectedDayNames.slice(-1)}`
//             : selectedDayNames[0];
//         const base =
//           interval > 1
//             ? `Every ${interval} weeks on ${formattedDays}`
//             : `Weekly on ${formattedDays}`;
//         return base + formatEndCondition(maxOccurrences, schedulerEndDate);
//       }

//       // Fallback
//       const fallbackWeekday = selectedDate.toLocaleDateString("en-US", {
//         weekday: "long",
//       });
//       const fallbackWeeklyBase =
//         interval > 1
//           ? `Every ${interval} weeks on ${fallbackWeekday}`
//           : `Weekly on ${fallbackWeekday}`;
//       return (
//         fallbackWeeklyBase +
//         formatEndCondition(maxOccurrences, schedulerEndDate)
//       );

//     case "monthly":
//       // Check if it's a specific day of the month
//       if (dayOfMonth && Array.isArray(dayOfMonth) && dayOfMonth.length > 0) {
//         const base =
//           interval > 1
//             ? `Every ${interval} months on day ${dayOfMonth[0]}`
//             : `Monthly on day ${dayOfMonth[0]}`;
//         return base + formatEndCondition(maxOccurrences, schedulerEndDate);
//       }

//       // Check if it's a weekday occurrence
//       if (
//         weekOfMonth &&
//         Array.isArray(weekOfMonth) &&
//         weekOfMonth.length > 0 &&
//         dayOfWeekInMonth !== undefined
//       ) {
//         const dayNames = [
//           "Sunday",
//           "Monday",
//           "Tuesday",
//           "Wednesday",
//           "Thursday",
//           "Friday",
//           "Saturday",
//         ];
//         const occurrenceMap = ["first", "second", "third", "fourth", "fifth"];
//         const occurrence =
//           weekOfMonth[0] === 5 ? "last" : occurrenceMap[weekOfMonth[0] - 1];

//         const base =
//           interval > 1
//             ? `Every ${interval} months on the ${occurrence} ${dayNames[dayOfWeekInMonth]}`
//             : `Monthly on the ${occurrence} ${dayNames[dayOfWeekInMonth]}`;
//         return base + formatEndCondition(maxOccurrences, schedulerEndDate);
//       }

//       // Fallback
//       const fallbackMonthDay = selectedDate.getDate();
//       const fallbackMonthlyBase =
//         interval > 1
//           ? `Every ${interval} months on day ${fallbackMonthDay}`
//           : `Monthly on day ${fallbackMonthDay}`;
//       return (
//         fallbackMonthlyBase +
//         formatEndCondition(maxOccurrences, schedulerEndDate)
//       );

//     case "yearly":
//       // Check if it's a specific date
//       if (monthOfYear !== undefined && dayOfYearMonth !== undefined) {
//         const monthNames = [
//           "January",
//           "February",
//           "March",
//           "April",
//           "May",
//           "June",
//           "July",
//           "August",
//           "September",
//           "October",
//           "November",
//           "December",
//         ];

//         const base =
//           interval > 1
//             ? `Every ${interval} years on ${monthNames[monthOfYear - 1]} ${dayOfYearMonth}`
//             : `Annually on ${monthNames[monthOfYear - 1]} ${dayOfYearMonth}`;
//         return base + formatEndCondition(maxOccurrences, schedulerEndDate);
//       }

//       // Fallback - use the selected date to determine the yearly recurrence
//       const month = selectedDate.toLocaleDateString("en-US", { month: "long" });
//       const day = selectedDate.getDate();

//       const fallbackYearlyBase =
//         interval > 1
//           ? `Every ${interval} years on ${month} ${day}`
//           : `Annually on ${month} ${day}`;
//       return (
//         fallbackYearlyBase +
//         formatEndCondition(maxOccurrences, schedulerEndDate)
//       );

//     case "custom":
//       // For custom recurrence, determine the actual frequency type
//       let actualFrequency = "custom";
//       let period = "";

//       if (monthOfYear !== undefined && dayOfYearMonth !== undefined) {
//         actualFrequency = "yearly";
//         period = "years";
//       } else if (
//         dayOfMonth !== undefined ||
//         (weekOfMonth !== undefined && dayOfWeekInMonth !== undefined)
//       ) {
//         actualFrequency = "monthly";
//         period = "months";
//       } else if (daysOfWeek !== undefined && daysOfWeek.length > 0) {
//         actualFrequency = "weekly";
//         period = "weeks";
//       } else {
//         actualFrequency = "daily";
//         period = "days";
//       }

//       // Format the base string with interval - always show interval for custom recurrences
//       const base = `Every ${interval} ${period}`;

//       // Add specific details if available
//       let details = "";
//       if (actualFrequency === "weekly" && daysOfWeek && daysOfWeek.length > 0) {
//         const dayNames = [
//           "Sunday",
//           "Monday",
//           "Tuesday",
//           "Wednesday",
//           "Thursday",
//           "Friday",
//           "Saturday",
//         ];
//         const selectedDayNames = daysOfWeek
//           .filter((day) => day >= 0 && day <= 6) // Ensure valid day indices
//           .map((day) => dayNames[day])
//           .sort((a, b) => {
//             // Sort days in natural order (Sunday to Saturday)
//             const order = [
//               "Sunday",
//               "Monday",
//               "Tuesday",
//               "Wednesday",
//               "Thursday",
//               "Friday",
//               "Saturday",
//             ];
//             return order.indexOf(a) - order.indexOf(b);
//           });
//         const formattedDays =
//           selectedDayNames.length > 1
//             ? `${selectedDayNames.slice(0, -1).join(", ")} and ${selectedDayNames.slice(-1)}`
//             : selectedDayNames[0];
//         details = ` on ${formattedDays}`;
//       } else if (
//         actualFrequency === "monthly" &&
//         dayOfMonth &&
//         dayOfMonth.length > 0
//       ) {
//         details = ` on day ${dayOfMonth[0]}`;
//       } else if (
//         actualFrequency === "yearly" &&
//         monthOfYear !== undefined &&
//         dayOfYearMonth !== undefined
//       ) {
//         const monthNames = [
//           "January",
//           "February",
//           "March",
//           "April",
//           "May",
//           "June",
//           "July",
//           "August",
//           "September",
//           "October",
//           "November",
//           "December",
//         ];
//         details = ` on ${monthNames[monthOfYear - 1]} ${dayOfYearMonth}`;
//       }

//       return (
//         base + details + formatEndCondition(maxOccurrences, schedulerEndDate)
//       );

//     default:
//       return frequency; // Fallback
//   }
// };

// export default function Frequency({ fieldOptions, notificationTypeId }) {
//   // console.log("fieldOptions:", fieldOptions);
//   console.log("notificationTypeId", notificationTypeId);
//   const [open, setOpen] = useState(false);
//   const [allDay, setAllDay] = useState(false);
//   const [modelType, setModalType] = useState("add");
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [endCalendarDate, setEndCalendarDate] = useState(new Date());
//   console.log("endCalendarDate", endCalendarDate);
//   const [selectedTime, setSelectedTime] = useState(() => {
//     const now = new Date();
//     let hours = now.getHours();
//     const minutes = now.getMinutes();
//     const ampm = hours >= 12 ? "PM" : "AM";
//     hours = hours % 12 || 12;
//     return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
//   });
//   const [repeatOption, setRepeatOption] = useState("Do not repeat");
//   const [customRecurrenceOpen, setCustomRecurrenceOpen] = useState(false);
//   // New state variables for additional fields
//   const [template, setTemplate] = useState("");
//   const [method, setMethod] = useState("");
//   const [ackRequired, setAckRequired] = useState(false);
//   const [attachmentRequired, setAttachmentRequired] = useState(false);
//   type Recipient =
//     | {
//         attributeId?: string;
//         refAttributeId?: string[];
//         label?: string;
//         customEmails?: string[];
//       }
//     | string;
//   const [toRecipients, setToRecipients] = useState<Recipient[]>([]);
//   const [ccRecipients, setCcRecipients] = useState<Recipient[]>([]);
//   const [acknowledgeTo, setAcknowledgeTo] = useState<Recipient[]>([]);
//   const [targetEntity, setTargetEntity] = useState("");
//   // Error states for validation
//   const [errors, setErrors] = useState({
//     template: "",
//     method: "",
//   });
//   /* ---- date-picker ---- */
//   const [datePickerOpen, setDatePickerOpen] = useState(false);
//   const [calendarDate, setCalendarDate] = useState(new Date(2025, 8, 1));
//   /* ---- time-picker ---- */
//   const [timePickerOpen, setTimePickerOpen] = useState(false);
//   /* ---- repeat-dropdown ---- */
//   const [repeatAnchorEl, setRepeatAnchorEl] = useState(null);
//   const [frequencyApiSuccess, setFrequencyApiSuccess] = useState(false);
//   /* ---- custom recurrence form ---- */
//   const [repeatEvery, setRepeatEvery] = useState(1);
//   const [repeatPeriod, setRepeatPeriod] = useState("month");
//   console.log("rrrr", repeatPeriod);
//   const [monthlyOption, setMonthlyOption] = useState("");
//   const [yearlyOption, setYearlyOption] = useState("same-day");
//   const [endsOption, setEndsOption] = useState("never");
//   const [endDate, setEndDate] = useState(null);
//   const [occurrences, setOccurrences] = useState(0);
//   /* ---- weekly days selection ---- */
//   const [selectedDays, setSelectedDays] = useState([
//     false,
//     false,
//     false,
//     false,
//     false,
//     false,
//     false,
//   ]);
//   // Inside Frequency.jsx, ensure these state variables are defined

//   console.log("selectedDays", selectedDays);
//   // State for delete confirmation dialog
//   const [dialog, setDialog] = useState({
//     open: false,
//     type: "",
//     rowData: null,
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   // NEW: Add state to track if recurrence is custom
//   const [isCustomRecurrence, setIsCustomRecurrence] = useState(false);
//   // NEW: State for view dialog
//   const [viewDialogOpen, setViewDialogOpen] = useState(false);
//   const [selectedReminder, setSelectedReminder] = useState(null);
//   console.log("selectedReminder", selectedReminder);
//   // Add the usePost hook for creating and deleting notifications
//   const createNotification = usePost(["createNotification"]);
//   const deleteNotification = useDelete(["deleteNotification"]);
//   const updateNotification = usePut(["updateNotification"]);
//   const mediumList = useGet(["mediumList"], `${GET.MEDIUM_LIST}`, true);
//   const templateList = useGet(["templateList"], `${GET.TEMPLATE_LIST}`, true);
//   const { data: frequencyListData, refetch } = useGet(
//     ["frequencyList", notificationTypeId, frequencyApiSuccess],
//     frequencyApiSuccess
//       ? `${GET.FREQUENCY_LIST}?notificationTypeId=${notificationTypeId}`
//       : "",
//     !!frequencyApiSuccess
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
//     // Reset errors
//     setErrors({
//       template: "",
//       method: "",
//     });
//     // NEW: Reset custom recurrence flag
//     setIsCustomRecurrence(false);
//   };
//   useEffect(() => {
//     if (notificationTypeId) {
//       setFrequencyApiSuccess(true);
//       refetch();
//     }
//   }, [notificationTypeId, refetch]);
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
//   // Helper function to transform API recipient objects to Autocomplete format
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
//       // Handle custom emails
//       if (
//         recipient.customEmails &&
//         Array.isArray(recipient.customEmails) &&
//         recipient.customEmails.length > 0
//       ) {
//         return recipient.customEmails.map((email) => email);
//       }
//       // Handle attribute-based recipients
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
//         // If no match found, create a minimal object with label
//         return {
//           attributeId: recipient.attributeId,
//           refAttributeId: recipient.refAttributeId || [],
//           label: `Field: ${recipient.attributeId}`,
//         };
//       }
//       // Fallback
//       return recipient;
//     });
//   };
//   // Helper function to transform single target entity
//   const transformTargetEntity = (entity, fieldOptions) => {
//     if (!entity) return null;
//     // Handle custom emails
//     if (
//       entity.customEmails &&
//       Array.isArray(entity.customEmails) &&
//       entity.customEmails.length > 0
//     ) {
//       return entity.customEmails[0]; // Return first email as string
//     }
//     // Handle attribute-based entity
//     if (entity.attributeId) {
//       const match = fieldOptions.find(
//         (option) =>
//           option.attributeId === entity.attributeId &&
//           arraysEqual(option.refAttributeId || [], entity.refAttributeId || [])
//       );
//       if (match) return match;
//       // If no match found, create a minimal object with label
//       return {
//         attributeId: entity.attributeId,
//         refAttributeId: entity.refAttributeId || [],
//         label: `Field: ${entity.attributeId}`,
//       };
//     }
//     // Fallback
//     return entity;
//   };

//   // const handleEditReminder = (row) => {
//   //   setModalType("edit");
//   //   setSelectedReminder(row);

//   //   // Populate form with existing data
//   //   if (row.schedulerStartDate) {
//   //     setSelectedDate(new Date(row.schedulerStartDate));
//   //   }
//   //   if (row.triggerTime) {
//   //     setSelectedTime(row.triggerTime);
//   //   }

//   //   // Transform API frequency to UI frequency
//   //   if (row.frequency) {
//   //     const uiFrequency = getExactUIFrequencyFromAPI(
//   //       row,
//   //       new Date(row.schedulerStartDate)
//   //     );
//   //     setRepeatOption(uiFrequency);

//   //     // Set custom recurrence flag if needed
//   //     setIsCustomRecurrence(
//   //       row.frequency === "custom" ||
//   //         // Also set it as custom if it has custom recurrence parameters
//   //         (row.interval && row.interval > 1) ||
//   //         (row.monthOfYear !== undefined && row.dayOfYearMonth !== undefined) ||
//   //         (row.schedulerEndDate && row.schedulerEndDate !== null) ||
//   //         (row.maxOccurrences && row.maxOccurrences > 0)
//   //     );

//   //     // Set custom recurrence parameters
//   //     if (row.interval) {
//   //       setRepeatEvery(row.interval);
//   //     }

//   //     // Determine the period from the frequency
//   //     if (row.frequency === "daily") {
//   //       setRepeatPeriod("day");
//   //     } else if (row.frequency === "weekly") {
//   //       setRepeatPeriod("week");
//   //     } else if (row.frequency === "monthly") {
//   //       setRepeatPeriod("month");
//   //     } else if (row.frequency === "yearly") {
//   //       setRepeatPeriod("year");
//   //     } else if (row.frequency === "custom") {
//   //       // For custom, determine the period from the recurrence parameters
//   //       if (row.daysOfWeek) {
//   //         setRepeatPeriod("week");
//   //       } else if (
//   //         row.dayOfMonth ||
//   //         (row.weekOfMonth && row.dayOfWeekInMonth !== undefined)
//   //       ) {
//   //         setRepeatPeriod("month");
//   //       } else if (row.monthOfYear && row.dayOfYearMonth) {
//   //         setRepeatPeriod("year");
//   //       } else {
//   //         setRepeatPeriod("day");
//   //       }
//   //     }

//   //     // Set the end conditions
//   //     if (row.schedulerEndDate) {
//   //       setEndsOption("on");
//   //       setEndDate(new Date(row.schedulerEndDate));
//   //     } else if (row.maxOccurrences && row.maxOccurrences > 0) {
//   //       setEndsOption("after");
//   //       setOccurrences(row.maxOccurrences);
//   //     } else {
//   //       setEndsOption("never");
//   //     }

//   //     // Properly handle selected days for weekly recurrence when editing
//   //     if (row.daysOfWeek && Array.isArray(row.daysOfWeek)) {
//   //       const newSelectedDays = [
//   //         false, // Sunday
//   //         false, // Monday
//   //         false, // Tuesday
//   //         false, // Wednesday
//   //         false, // Thursday
//   //         false, // Friday
//   //         false, // Saturday
//   //       ];

//   //       // Set the selected days based on the daysOfWeek array
//   //       row.daysOfWeek.forEach((dayIndex) => {
//   //         // Ensure dayIndex is within valid range (0-6)
//   //         if (dayIndex >= 0 && dayIndex <= 6) {
//   //           newSelectedDays[dayIndex] = true;
//   //         }
//   //       });

//   //       setSelectedDays(newSelectedDays);
//   //     }

//   //     // For monthly, set the monthly option
//   //     if (row.frequency === "monthly") {
//   //       if (row.dayOfMonth && row.dayOfMonth.length > 0) {
//   //         setMonthlyOption(`Monthly on day ${row.dayOfMonth[0]}`);
//   //       } else if (
//   //         row.weekOfMonth &&
//   //         row.weekOfMonth.length > 0 &&
//   //         row.dayOfWeekInMonth !== undefined
//   //       ) {
//   //         const dayNames = [
//   //           "Sunday",
//   //           "Monday",
//   //           "Tuesday",
//   //           "Wednesday",
//   //           "Thursday",
//   //           "Friday",
//   //           "Saturday",
//   //         ];
//   //         const occurrenceMap = ["first", "second", "third", "fourth", "fifth"];
//   //         const occurrence =
//   //           row.weekOfMonth[0] === 5
//   //             ? "last"
//   //             : occurrenceMap[row.weekOfMonth[0] - 1];
//   //         setMonthlyOption(
//   //           `Monthly on the ${occurrence} ${dayNames[row.dayOfWeekInMonth]}`
//   //         );
//   //       }
//   //     }
//   //   }

//   //   if (row.templateId) {
//   //     setTemplate(row.templateId._id || row.templateId);
//   //   }
//   //   if (row.medium) {
//   //     setMethod(row.medium._id || row.medium);
//   //   }
//   //   if (row.acknowledgeRequired) {
//   //     setAckRequired(row.acknowledgeRequired);
//   //   }
//   //   if (row.attachmentRequired) {
//   //     setAttachmentRequired(row.attachmentRequired);
//   //   }

//   //   // Transform recipients using the helper functions
//   //   if (row.recipients_to) {
//   //     setToRecipients(transformRecipients(row.recipients_to, fieldOptions));
//   //   }
//   //   if (row.recipients_cc) {
//   //     setCcRecipients(transformRecipients(row.recipients_cc, fieldOptions));
//   //   }
//   //   if (row.acknowledge_to) {
//   //     setAcknowledgeTo(transformRecipients(row.acknowledge_to, fieldOptions));
//   //   }
//   //   if (row.targetEntity) {
//   //     setTargetEntity(transformTargetEntity(row.targetEntity, fieldOptions));
//   //   }

//   //   // Open the dialog
//   //   setOpen(true);
//   // };
//   // Handle view button click

//   const handleEditReminder = (row) => {
//     setModalType("edit");
//     setSelectedReminder(row);

//     // Populate form with existing data
//     if (row.schedulerStartDate) {
//       setSelectedDate(new Date(row.schedulerStartDate));
//     }
//     if (row.triggerTime) {
//       setSelectedTime(row.triggerTime);
//     }

//     // Transform API frequency to UI frequency
//     if (row.frequency) {
//       const uiFrequency = getExactUIFrequencyFromAPI(
//         row,
//         new Date(row.schedulerStartDate)
//       );
//       setRepeatOption(uiFrequency);

//       // Set custom recurrence flag if needed
//       setIsCustomRecurrence(
//         row.frequency === "custom" ||
//           // Also set it as custom if it has custom recurrence parameters
//           (row.interval && row.interval > 1) ||
//           (row.monthOfYear !== undefined && row.dayOfYearMonth !== undefined) ||
//           (row.schedulerEndDate && row.schedulerEndDate !== null) ||
//           (row.maxOccurrences && row.maxOccurrences > 0) ||
//           (row.daysOfWeek && row.daysOfWeek.length > 1) // Include multi-day weekly recurrences
//       );

//       // Set custom recurrence parameters
//       if (row.interval) {
//         setRepeatEvery(row.interval);
//       }

//       // Determine the period from the frequency
//       if (row.frequency === "daily") {
//         setRepeatPeriod("day");
//       } else if (row.frequency === "weekly") {
//         setRepeatPeriod("week");
//       } else if (row.frequency === "monthly") {
//         setRepeatPeriod("month");
//       } else if (row.frequency === "yearly") {
//         setRepeatPeriod("year");
//       } else if (row.frequency === "custom") {
//         // For custom, determine the period from the recurrence parameters
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

//       // Set the end conditions
//       if (row.schedulerEndDate) {
//         setEndsOption("on");
//         setEndDate(new Date(row.schedulerEndDate));
//       } else if (row.maxOccurrences && row.maxOccurrences > 0) {
//         setEndsOption("after");
//         setOccurrences(row.maxOccurrences);
//       } else {
//         setEndsOption("never");
//       }

//       // Handle selected days for weekly recurrence
//       if (row.daysOfWeek && Array.isArray(row.daysOfWeek)) {
//         const newSelectedDays = [
//           false, // Sunday
//           false, // Monday
//           false, // Tuesday
//           false, // Wednesday
//           false, // Thursday
//           false, // Friday
//           false, // Saturday
//         ];
//         row.daysOfWeek.forEach((dayIndex) => {
//           if (dayIndex >= 0 && dayIndex <= 6) {
//             newSelectedDays[dayIndex] = true;
//           }
//         });
//         setSelectedDays(newSelectedDays);
//       } else {
//         // Fallback to current day if no daysOfWeek
//         const newSelectedDays = [
//           false, // Sunday
//           false, // Monday
//           false, // Tuesday
//           false, // Wednesday
//           false, // Thursday
//           false, // Friday
//           false, // Saturday
//         ];
//         const dayIndex = new Date(row.schedulerStartDate).getDay();
//         newSelectedDays[dayIndex] = true;
//         setSelectedDays(newSelectedDays);
//       }

//       // For monthly, set the monthly option
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

//     // Transform recipients using the helper functions
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

//     // Open the dialog
//     setOpen(true);
//   };

//   const handleViewReminder = (row) => {
//     setSelectedReminder(row);
//     setViewDialogOpen(true);
//   };
//   // Handle delete button click
//   const handleDeleteClick = (row) => {
//     setDialog({
//       open: true,
//       type: "delete",
//       rowData: row,
//     });
//   };
//   // Handle confirmation dialog close
//   const handleCloseDialog = () => {
//     setDialog({
//       open: false,
//       type: "",
//       rowData: null,
//     });
//   };
//   // Handle confirmation dialog confirm action
//   const handleConfirmAction = async () => {
//     console.log("dialog-----", dialog);
//     if (dialog.type === "delete" && dialog.rowData) {
//       try {
//         setIsSubmitting(true);
//         const response = await deleteNotification.mutateAsync({
//           url: `${DELETE.DELETE_FREQUENCY}/${dialog.rowData._id}`,
//         });
//         if (response.success) {
//           toast.success(response.message || "Scheduler deleted successfully");
//           refetch(); // Refresh the list
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
//   // Validate form
//   const validateForm = () => {
//     let isValid = true;
//     const newErrors = {
//       template: "",
//       method: "",
//     };
//     // Validate template
//     if (!template) {
//       newErrors.template = "Template is required";
//       isValid = false;
//     }
//     // Validate method
//     if (!method) {
//       newErrors.method = "Method is required";
//       isValid = false;
//     }
//     setErrors(newErrors);
//     return isValid;
//   };
//   /* -------- helpers -------- */
//   const formatDate = (d) =>
//     d.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });
//   const changeCalendarMonth = (delta) => {
//     setCalendarDate((d) => {
//       const next = new Date(d);
//       next.setMonth(d.getMonth() + delta);
//       return next;
//     });
//   };
//   // Generate dynamic repeat options based on selected date
//   const generateCalendarDays = () => {
//     const y = calendarDate.getFullYear();
//     const m = calendarDate.getMonth();
//     const first = new Date(y, m, 1).getDay();
//     const daysInMonth = new Date(y, m + 1, 0).getDate();
//     const cells = [];
//     const today = new Date();
//     // Empty cells for offset
//     for (let i = 0; i < first; i++) {
//       cells.push(<Grid item xs={1} key={`empty-${i}`} />);
//     }
//     // Day cells
//     for (let d = 1; d <= daysInMonth; d++) {
//       const date = new Date(y, m, d);
//       const isSel = date.toDateString() === selectedDate.toDateString();
//       const isToday = date.toDateString() === today.toDateString();
//       const isCurrentMonth = date.getMonth() === calendarDate.getMonth();
//       cells.push(
//         <Grid item xs={1} key={d} sx={{ textAlign: "center" }}>
//           <Button
//             onClick={() => {
//               setSelectedDate(date);
//               setDatePickerOpen(false);
//             }}
//             sx={(theme) => ({
//               width: 36,
//               height: 36,
//               minWidth: 36,
//               borderRadius: "50%",
//               fontSize: "0.875rem",
//               color: isSel
//                 ? "#fff"
//                 : isCurrentMonth
//                   ? theme.palette.text.primary
//                   : theme.palette.text.disabled,
//               backgroundColor: isSel
//                 ? theme.palette.primary.main
//                 : "transparent",
//               border:
//                 isToday && !isSel
//                   ? `1px solid ${theme.palette.primary.main}`
//                   : "none",
//               fontWeight: isSel ? 600 : 400,
//               "&:hover": {
//                 backgroundColor: isSel
//                   ? theme.palette.primary.main
//                   : theme.palette.action.hover,
//               },
//             })}
//           >
//             {d}
//           </Button>
//         </Grid>
//       );
//     }
//     return cells;
//   };
//   const getRepeatOptions = () => {
//     const dayOfWeek = selectedDate.toLocaleDateString("en-US", {
//       weekday: "long",
//     });
//     const dayOfMonth = selectedDate.getDate();
//     const month = selectedDate.toLocaleDateString("en-US", { month: "long" });
//     // Helper function to get ordinal occurrence
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
//       const lastOffset = (lastWeekday - weekday + 7) % 7;
//       const isLast = lastDayOfMonth.getDate() - day < 7;
//       return {
//         occurrence: isLast ? "last" : numberToWord(occurrenceNum),
//         weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
//       };
//     };
//     const { occurrence, weekday } = getOrdinalOccurrence(selectedDate);
//     return [
//       "Do not repeat",
//       "Daily",
//       `Weekly on ${dayOfWeek}`,
//       `Monthly on the ${occurrence} ${weekday}`,
//       `Annually on ${month} ${dayOfMonth}`,
//       "Every weekday (Monday to Friday)",
//       "Custom...",
//     ];
//   };
//   // Initialize selected days when opening custom recurrence
//   const initializeSelectedDays = () => {
//     const dayIndex = selectedDate.getDay();
//     const newSelectedDays = [...selectedDays];
//     newSelectedDays.fill(false);
//     newSelectedDays[dayIndex] = true;
//     setSelectedDays(newSelectedDays);
//     // Set default monthly option
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
//       const lastOffset = (lastWeekday - weekday + 7) % 7;
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
//   /* -------- handlers -------- */
//   const handleOpenDialog = () => {
//     resetFormFields();
//     setOpen(true);
//     setModalType("add");
//   };
//   const handleClose = () => setOpen(false);
//   // Helper function to format date as YYYY-MM-DD
//   const formatDateForAPI = (date) => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };
//   // Format recipients for saving
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
//   // Format target entity for API
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
//   console.log("endCalendarDate----", endCalendarDate);

//   // Generate payload for API
//   // const generatePayload = () => {
//   //   const formattedToRecipients = formatRecipients(toRecipients);
//   //   const formattedCcRecipients = formatRecipients(ccRecipients);
//   //   const formattedAcknowledgeTo = formatRecipients(acknowledgeTo);
//   //   const formattedTargetEntity = formatTargetEntity(targetEntity);

//   //   // Base payload for all frequencies
//   //   const payload = {
//   //     notificationTypeId,
//   //     frequency: transformUIToAPIFrequency(repeatOption),
//   //     schedulerStartDate: formatDateForAPI(selectedDate),
//   //     interval: repeatEvery,
//   //     repeatAnnually: false,
//   //     attachmentRequired,
//   //     recipients_to: formattedToRecipients,
//   //     recipients_cc: formattedCcRecipients,
//   //     medium: method,
//   //     templateId: template,
//   //     triggerTime: selectedTime,
//   //     isActive: "active",
//   //     schedulerEndDate: endDate,
//   //     maxOccurrences: occurrences,
//   //   };

//   //   // Add acknowledge_to if there are acknowledge recipients
//   //   if (formattedAcknowledgeTo.length > 0) {
//   //     payload.acknowledge_to = formattedAcknowledgeTo;
//   //   }

//   //   // Add targetEntity if it's set
//   //   if (formattedTargetEntity) {
//   //     payload.targetEntity = formattedTargetEntity;
//   //   }

//   //   // Handle different frequency options
//   //   if (repeatOption === "Do not repeat") {
//   //     // For "once", we don't need any recurrence-specific fields
//   //     return payload;
//   //   } else if (repeatOption === "Daily") {
//   //     // Daily recurrence is already set in the base payload
//   //     return payload;
//   //   } else if (repeatOption.startsWith("Weekly on")) {
//   //     // Extract day name from "Weekly on [dayName]"
//   //     const dayName = repeatOption.replace("Weekly on ", "");
//   //     const dayNameToIndex = (dayName) => {
//   //       const days = [
//   //         "Sunday",
//   //         "Monday",
//   //         "Tuesday",
//   //         "Wednesday",
//   //         "Thursday",
//   //         "Friday",
//   //         "Saturday",
//   //       ];
//   //       return days.indexOf(dayName);
//   //     };
//   //     payload.daysOfWeek = [dayNameToIndex(dayName)];
//   //   } else if (repeatOption === "Every weekday (Monday to Friday)") {
//   //     payload.daysOfWeek = [1, 2, 3, 4, 5]; // Monday to Friday
//   //   } else if (repeatOption.startsWith("Monthly on day")) {
//   //     // Extract day number from "Monthly on day [number]"
//   //     const dayNumber = parseInt(repeatOption.replace("Monthly on day ", ""));
//   //     payload.dayOfMonth = [dayNumber];
//   //   } else if (repeatOption.startsWith("Monthly on the")) {
//   //     // Extract occurrence and weekday from "Monthly on the [occurrence] [weekday]"
//   //     const parts = repeatOption.replace("Monthly on the ", "").split(" ");
//   //     const occurrence = parts[0];
//   //     const weekday = parts.slice(1).join(" "); // Handle multi-word day names
//   //     const occurrenceWordToNumber = (occurrence) => {
//   //       const map = {
//   //         first: 1,
//   //         second: 2,
//   //         third: 3,
//   //         fourth: 4,
//   //         fifth: 5,
//   //         last: 5,
//   //       };
//   //       return map[occurrence] || 1;
//   //     };
//   //     const dayNameToIndex = (dayName) => {
//   //       const days = [
//   //         "Sunday",
//   //         "Monday",
//   //         "Tuesday",
//   //         "Wednesday",
//   //         "Thursday",
//   //         "Friday",
//   //         "Saturday",
//   //       ];
//   //       return days.indexOf(dayName);
//   //     };
//   //     payload.weekOfMonth = [occurrenceWordToNumber(occurrence)];
//   //     payload.dayOfWeekInMonth = dayNameToIndex(weekday);
//   //   } else if (repeatOption.startsWith("Annually on")) {
//   //     // Extract month and day from "Annually on [month] [day]"
//   //     const parts = repeatOption.replace("Annually on ", "").split(" ");
//   //     const monthName = parts[0];
//   //     const dayNumber = parseInt(parts[1]);
//   //     // Convert month name to number (1-12)
//   //     const monthNames = [
//   //       "January",
//   //       "February",
//   //       "March",
//   //       "April",
//   //       "May",
//   //       "June",
//   //       "July",
//   //       "August",
//   //       "September",
//   //       "October",
//   //       "November",
//   //       "December",
//   //     ];
//   //     payload.monthOfYear = monthNames.indexOf(monthName) + 1; // 1-12
//   //     payload.dayOfYearMonth = dayNumber;
//   //   } else if (isCustomRecurrence) {
//   //     console.log("here", isCustomRecurrence);
//   //     // Handle custom recurrence based on period
//   //     if (repeatPeriod === "day") {
//   //       payload.frequency = "daily";
//   //     } else if (repeatPeriod === "week") {
//   //       console.log("here", isCustomRecurrence);

//   //       payload.frequency = "weekly";
//   //       // Handle selected days for weekly recurrence
//   //       const daysArray = [];
//   //       // Check if selectedDays is an array and has the expected length
//   //       if (Array.isArray(selectedDays) && selectedDays.length === 7) {
//   //         // Explicitly check each day of the week
//   //         if (selectedDays[0]) daysArray.push(0); // Sunday
//   //         if (selectedDays[1]) daysArray.push(1); // Monday
//   //         if (selectedDays[2]) daysArray.push(2); // Tuesday
//   //         if (selectedDays[3]) daysArray.push(3); // Wednesday
//   //         if (selectedDays[4]) daysArray.push(4); // Thursday
//   //         if (selectedDays[5]) daysArray.push(5); // Friday
//   //         if (selectedDays[6]) daysArray.push(6); // Saturday
//   //       }

//   //       // If no days are selected, default to the current day
//   //       if (daysArray.length === 0) {
//   //         daysArray.push(selectedDate.getDay());
//   //       }

//   //       payload.daysOfWeek = daysArray;
//   //     } else if (repeatPeriod === "month") {
//   //       payload.frequency = "monthly";
//   //       if (monthlyOption && monthlyOption.startsWith("Monthly on day")) {
//   //         // Day-based monthly recurrence
//   //         const dayNumber = parseInt(monthlyOption.split(" ").pop());
//   //         payload.dayOfMonth = [dayNumber];
//   //       } else if (
//   //         monthlyOption &&
//   //         monthlyOption.startsWith("Monthly on the")
//   //       ) {
//   //         // Weekday-based monthly recurrence
//   //         const parts = monthlyOption.replace("Monthly on the ", "").split(" ");
//   //         const occurrence = parts[0];
//   //         const weekday = parts.slice(1).join(" ");
//   //         const occurrenceWordToNumber = (occurrence) => {
//   //           const map = {
//   //             first: 1,
//   //             second: 2,
//   //             third: 3,
//   //             fourth: 4,
//   //             fifth: 5,
//   //             last: 5,
//   //           };
//   //           return map[occurrence] || 1;
//   //         };
//   //         const dayNameToIndex = (dayName) => {
//   //           const days = [
//   //             "Sunday",
//   //             "Monday",
//   //             "Tuesday",
//   //             "Wednesday",
//   //             "Thursday",
//   //             "Friday",
//   //             "Saturday",
//   //           ];
//   //           return days.indexOf(dayName);
//   //         };
//   //         payload.weekOfMonth = [occurrenceWordToNumber(occurrence)];
//   //         payload.dayOfWeekInMonth = dayNameToIndex(weekday);
//   //       }
//   //     } else if (repeatPeriod === "year") {
//   //       payload.frequency = "yearly";
//   //       if (yearlyOption === "same-day") {
//   //         // Same day each year
//   //         payload.monthOfYear = selectedDate.getMonth() + 1; // 1-12
//   //         payload.dayOfYearMonth = selectedDate.getDate();
//   //       }
//   //     }

//   //     // Handle end conditions for custom recurrence
//   //     if (endsOption === "on") {
//   //       payload.schedulerEndDate = endDate;
//   //     } else if (endsOption === "after") {
//   //       payload.maxOccurrences = occurrences;
//   //     }
//   //   }

//   //   return payload;
//   // };

//   // Generate payload for API
//   const generatePayload = () => {
//     const formattedToRecipients = formatRecipients(toRecipients);
//     const formattedCcRecipients = formatRecipients(ccRecipients);
//     const formattedAcknowledgeTo = formatRecipients(acknowledgeTo);
//     const formattedTargetEntity = formatTargetEntity(targetEntity);

//     // Base payload for all frequencies
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
//       schedulerEndDate: endDate,
//       maxOccurrences: occurrences,
//     };

//     // Add acknowledge_to if there are acknowledge recipients
//     if (formattedAcknowledgeTo.length > 0) {
//       payload.acknowledge_to = formattedAcknowledgeTo;
//     }

//     // Add targetEntity if it's set
//     if (formattedTargetEntity) {
//       payload.targetEntity = formattedTargetEntity;
//     }

//     // Handle different frequency options
//     if (repeatOption === "Do not repeat") {
//       // For "once", we don't need any recurrence-specific fields
//       return payload;
//     } else if (repeatOption === "Daily") {
//       // Daily recurrence is already set in the base payload
//       return payload;
//     } else if (repeatOption.startsWith("Weekly on")) {
//       // Extract day name from "Weekly on [dayName]"
//       const dayName = repeatOption.replace("Weekly on ", "");
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
//       payload.daysOfWeek = [1, 2, 3, 4, 5]; // Monday to Friday
//     } else if (repeatOption.startsWith("Monthly on day")) {
//       // Extract day number from "Monthly on day [number]"
//       const dayNumber = parseInt(repeatOption.replace("Monthly on day ", ""));
//       payload.dayOfMonth = [dayNumber];
//     } else if (repeatOption.startsWith("Monthly on the")) {
//       // Extract occurrence and weekday from "Monthly on the [occurrence] [weekday]"
//       const parts = repeatOption.replace("Monthly on the ", "").split(" ");
//       const occurrence = parts[0];
//       const weekday = parts.slice(1).join(" "); // Handle multi-word day names
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
//       // Extract month and day from "Annually on [month] [day]"
//       const parts = repeatOption.replace("Annually on ", "").split(" ");
//       const monthName = parts[0];
//       const dayNumber = parseInt(parts[1]);
//       // Convert month name to number (1-12)
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
//       payload.monthOfYear = monthNames.indexOf(monthName) + 1; // 1-12
//       payload.dayOfYearMonth = dayNumber;
//     }

//     // Handle custom recurrence parameters if isCustomRecurrence is true
//     if (isCustomRecurrence) {
//       if (repeatPeriod === "day") {
//         payload.frequency = "daily";
//       } else if (repeatPeriod === "week") {
//         payload.frequency = "weekly";
//         // Handle selected days for weekly recurrence
//         const daysArray = [];
//         if (Array.isArray(selectedDays) && selectedDays.length === 7) {
//           if (selectedDays[0]) daysArray.push(0); // Sunday
//           if (selectedDays[1]) daysArray.push(1); // Monday
//           if (selectedDays[2]) daysArray.push(2); // Tuesday
//           if (selectedDays[3]) daysArray.push(3); // Wednesday
//           if (selectedDays[4]) daysArray.push(4); // Thursday
//           if (selectedDays[5]) daysArray.push(5); // Friday
//           if (selectedDays[6]) daysArray.push(6); // Saturday
//         }
//         // If no days are selected, default to the current day
//         if (daysArray.length === 0) {
//           daysArray.push(selectedDate.getDay());
//         }
//         payload.daysOfWeek = daysArray;
//       } else if (repeatPeriod === "month") {
//         payload.frequency = "monthly";
//         if (monthlyOption && monthlyOption.startsWith("Monthly on day")) {
//           // Day-based monthly recurrence
//           const dayNumber = parseInt(monthlyOption.split(" ").pop());
//           payload.dayOfMonth = [dayNumber];
//         } else if (
//           monthlyOption &&
//           monthlyOption.startsWith("Monthly on the")
//         ) {
//           // Weekday-based monthly recurrence
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
//           // Same day each year
//           payload.monthOfYear = selectedDate.getMonth() + 1; // 1-12
//           payload.dayOfYearMonth = selectedDate.getDate();
//         }
//       }

//       // Handle end conditions for custom recurrence
//       if (endsOption === "on") {
//         payload.schedulerEndDate = endDate;
//       } else if (endsOption === "after") {
//         payload.maxOccurrences = occurrences;
//       }
//     }

//     return payload;
//   };
//   // Update handleSave function
//   const handleSave = async () => {
//     // Validate form before submission
//     if (!validateForm()) {
//       return;
//     }
//     try {
//       // Generate the payload
//       const payload = generatePayload();
//       console.log("Scheduler Data:", payload);
//       let response;
//       if (modelType === "edit") {
//         // Update operation
//         response = await updateNotification.mutateAsync({
//           url: `${PUT.UPDATE_FREQUENCY}/${selectedReminder?._id}`,
//           payload: payload,
//         });
//       } else {
//         // Create operation
//         response = await createNotification.mutateAsync({
//           url: `${POST.CREATE_FREQUENCY}`,
//           payload: payload,
//         });
//       }
//       console.log("API Response:", response);
//       if (response.success) {
//         toast.success(
//           response.message ||
//             (modelType === "edit"
//               ? "Scheduler updated successfully"
//               : "Scheduler created successfully")
//         );
//         resetFormFields();
//       }
//       // Close the dialog and refresh the list
//       handleClose();
//       refetch();
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
//   // const handleRepeatSelect = (opt) => {
//   //   setRepeatOption(opt);
//   //   setRepeatAnchorEl(null);
//   //   if (opt === "Custom...") {
//   //     setIsCustomRecurrence(true); // FIXED: Set custom flag
//   //     initializeSelectedDays();
//   //     setCustomRecurrenceOpen(true);
//   //   } else {
//   //     setIsCustomRecurrence(false); // FIXED: Reset custom flag
//   //   }
//   // };
//   // Inside Frequency.jsx, update the handleRepeatSelect function

//   // Update handleRepeatSelect function
//   const handleRepeatSelect = (value) => {
//     setRepeatOption(value);
//     if (value === "Custom...") {
//       setIsCustomRecurrence(true);
//       // Preserve repeatPeriod and selectedDays based on current state
//       if (repeatOption.startsWith("Weekly on")) {
//         setRepeatPeriod("week"); // Ensure weekly context
//       } else if (repeatOption === "Daily") {
//         setRepeatPeriod("day");
//       } else if (repeatOption.startsWith("Monthly on")) {
//         setRepeatPeriod("month");
//       } else if (repeatOption.startsWith("Annually on")) {
//         setRepeatPeriod("year");
//       }
//       // Do not reset selectedDays here to preserve the edit state
//     } else {
//       setIsCustomRecurrence(false);
//       // Reset custom parameters when switching away from custom
//       setRepeatEvery(1);
//       setEndsOption("never");
//       setEndDate(null);
//       setOccurrences(0);
//       setSelectedDays([false, false, false, false, false, false, false]);
//       // Generate payload for non-custom options
//       const payload = generatePayload();
//       handleSaveReminder(payload); // Save the updated reminder
//     }
//   };
//   // Ensure the CustomRecurrence dialog is rendered
//   const renderCustomRecurrence = () => {
//     return (
//       <CustomRecurrence
//         open={isCustomRecurrence}
//         onClose={() => setIsCustomRecurrence(false)}
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
//         onSave={(txt, days) => {
//           setRepeatOption(txt);
//           setSelectedDays(days);
//           setIsCustomRecurrence(false);
//         }}
//         setEndCalendarDate={setEndCalendarDate}
//         endCalendarDate={endCalendarDate}
//       />
//     );
//   };

//   // In the return statement, include the CustomRecurrence dialog
//   return (
//     <>
//       {/* Other JSX elements, e.g., the repeat dropdown */}
//       <Select
//         value={repeatOption}
//         onChange={(e) => handleRepeatSelect(e.target.value)}
//         // ... other Select props
//       >
//         <MenuItem value="Do not repeat">Do not repeat</MenuItem>
//         <MenuItem value="Daily">Daily</MenuItem>
//         <MenuItem value="Weekly on Sunday">Weekly on Sunday</MenuItem>
//         <MenuItem value="Weekly on Monday">Weekly on Monday</MenuItem>
//         <MenuItem value="Weekly on Tuesday">Weekly on Tuesday</MenuItem>
//         <MenuItem value="Weekly on Wednesday">Weekly on Wednesday</MenuItem>
//         <MenuItem value="Weekly on Thursday">Weekly on Thursday</MenuItem>
//         <MenuItem value="Weekly on Friday">Weekly on Friday</MenuItem>
//         <MenuItem value="Weekly on Saturday">Weekly on Saturday</MenuItem>
//         <MenuItem value="Custom...">Custom...</MenuItem>
//         {/* Other MenuItem options */}
//       </Select>
//       {/* Other form fields */}
//       {renderCustomRecurrence()}
//       {/* Other dialogs or components */}
//     </>
//   );
//   const handleTimeChange = (newValue) => {
//     if (newValue) {
//       setSelectedTime(newValue.format("hh:mm A"));
//     } else {
//       setSelectedTime("");
//     }
//     setTimePickerOpen(false);
//   };
//   /* -------- render -------- */
//   return (
//     <Box sx={{ p: 3 }}>
//       {/* Header with title and button */}
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
//           {frequencyListData?.data?.length > 0 ? "Scheduler Listing" : ""}
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
//       {/* Listing section */}
//       {frequencyListData?.data?.length > 0 ? (
//         <Box>
//           {/* <Typography
//             variant="h6"
//             sx={{
//               marginBottom: STYLE_GUIDE.SPACING.s3,
//               color: STYLE_GUIDE.COLORS.primaryDark,
//               fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
//             }}
//           >
//             Scheduler Listing:
//           </Typography> */}
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
//           {/* <Typography variant="body2" color="textSecondary">
//             Click on "Add Scheduler" to create your first notification schedule
//           </Typography> */}
//         </Box>
//       )}
//       {/* Main dialog */}
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
//           {/* Date & Time */}
//           <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
//             <Typography
//               variant="body2"
//               sx={{
//                 color: "rgba(0, 0, 0, 0.6)",
//                 fontWeight: 500,
//                 fontSize: "0.875rem",
//                 lineHeight: "1.4375rem",
//                 letterSpacing: "0.00938em",
//                 pl: 0.5, // Small padding to align with other form labels
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
//           {/* All day + Repeat in same row */}
//           <Box sx={{ display: "flex", alignItems: "center", gap: 2, pl: 4 }}>
//             <Button
//               variant="outlined"
//               onClick={handleRepeatClick}
//               endIcon={<ExpandMoreIcon />}
//               sx={{
//                 flex: 1,
//                 backgroundColor: "#f8f9fa",
//                 border: "1px solid #ddd",
//                 borderRadius: 2,
//                 color: "#3c4043",
//                 textTransform: "none",
//                 justifyContent: "space-between",
//                 "&:hover": {
//                   backgroundColor: "#f1f3f4",
//                   border: "1px solid #ccc",
//                 },
//               }}
//             >
//               {repeatOption}
//             </Button>
//             <Popper
//               open={Boolean(repeatAnchorEl)}
//               anchorEl={repeatAnchorEl}
//               placement="bottom-start"
//               sx={{ zIndex: 1300 }}
//             >
//               <Paper sx={{ mt: 0.5, minWidth: 200, borderRadius: 2 }}>
//                 <MenuList>
//                   {getRepeatOptions().map((o) => (
//                     <MuiMenuItem key={o} onClick={() => handleRepeatSelect(o)}>
//                       {o}
//                     </MuiMenuItem>
//                   ))}
//                 </MenuList>
//               </Paper>
//             </Popper>
//           </Box>
//           {/* Additional fields section */}
//           <Box sx={{ mt: 1 }}>
//             <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
//               {/* Template */}
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
//               {/* Method */}
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
//             {/* Checkboxes */}
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
//             {/* Acknowledge To */}
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
//             {/* TO Recipients */}
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
//             {/* CC Recipients */}
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
//             Cancel{" "}
//           </Button>
//           <Button
//             variant="contained"
//             onClick={handleSave}
//             sx={{ textTransform: "none", borderRadius: 2 }}
//           >
//             {modelType === "edit" ? "Update" : "Save"}
//           </Button>
//         </DialogActions>
//       </Dialog>
//       {/* Date picker */}
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
//             <IconButton onClick={() => changeCalendarMonth(-1)}>
//               <ChevronLeft />
//             </IconButton>
//             <Typography variant="h6" sx={{ fontWeight: 500 }}>
//               {calendarDate.toLocaleDateString("en-US", {
//                 month: "long",
//                 year: "numeric",
//               })}
//             </Typography>
//             <IconButton onClick={() => changeCalendarMonth(1)}>
//               <ChevronRight />
//             </IconButton>
//           </Box>
//           {/* Weekday headers */}
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
//           {/* Calendar days */}
//           <Grid container columns={7}>
//             {generateCalendarDays()}
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
//       {/* Time picker */}
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

//       {/* Custom Recurrence Component */}
//       <CustomRecurrence
//         open={customRecurrenceOpen}
//         onClose={() => setCustomRecurrenceOpen(false)}
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
//         // FIXED: Updated to handle the selectedDays array
//         onSave={(txt, days) => {
//           setRepeatOption(txt);
//           setIsCustomRecurrence(true);
//           // Update the selectedDays state with the latest selection
//           if (days) {
//             setSelectedDays(days);
//           }
//           setCustomRecurrenceOpen(false);
//         }}
//       />
//       {/* View Scheduler Dialog Component */}
//       <ViewSchedulerDialog
//         open={viewDialogOpen}
//         onClose={() => setViewDialogOpen(false)}
//         selectedReminder={selectedReminder}
//         fieldOptions={fieldOptions}
//       />
//       {/* Confirmation Dialog for Delete */}
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

// Helper function to compare arrays
const arraysEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  for (let i = 0; i < sortedA.length; ++i) {
    if (sortedA[i] !== sortedB[i]) return false;
  }
  return true;
};

// Transform UI frequency value to API frequency value
const transformUIToAPIFrequency = (uiFrequency) => {
  switch (uiFrequency) {
    case "Do not repeat":
      return "once";
    case "Daily":
      return "daily";
    case "Every weekday (Monday to Friday)":
      return "weekly";
    case "Custom...":
      return "custom";
    default:
      if (uiFrequency.startsWith("Weekly on")) return "weekly";
      if (uiFrequency.startsWith("Monthly on")) return "monthly";
      if (uiFrequency.startsWith("Annually on")) return "yearly";
      return uiFrequency;
  }
};

// Transform API frequency value to UI frequency value
const getExactUIFrequencyFromAPI = (row, selectedDate) => {
  const {
    frequency,
    daysOfWeek,
    dayOfMonth,
    weekOfMonth,
    dayOfWeekInMonth,
    monthOfYear,
    dayOfYearMonth,
    schedulerEndDate,
    maxOccurrences,
    interval = 1,
  } = row;

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatEndCondition = (maxOccurrences, schedulerEndDate) => {
    if (maxOccurrences && maxOccurrences > 0) {
      return `, ending after ${maxOccurrences} occurrence${maxOccurrences > 1 ? "s" : ""}`;
    } else if (schedulerEndDate) {
      const endDate = formatDateForDisplay(schedulerEndDate);
      return `, until ${endDate}`;
    }
    return "";
  };

  switch (frequency) {
    case "once":
      return "Do not repeat";
    case "daily":
      if (interval !== undefined) {
        const base = `Every ${interval} day${interval > 1 ? "s" : ""}`;
        return base + formatEndCondition(maxOccurrences, schedulerEndDate);
      }
      if (maxOccurrences && maxOccurrences > 0) {
        return `Daily for ${maxOccurrences} time${maxOccurrences > 1 ? "s" : ""}`;
      }
      if (schedulerEndDate) {
        const endDate = formatDateForDisplay(schedulerEndDate);
        return `Daily until ${endDate}`;
      }
      return "Daily";
    case "weekly":
      if (
        daysOfWeek &&
        Array.isArray(daysOfWeek) &&
        daysOfWeek.length === 5 &&
        daysOfWeek.every((day) => [1, 2, 3, 4, 5].includes(day))
      ) {
        const base =
          interval > 1
            ? `Every ${interval} weeks on weekdays (Monday to Friday)`
            : "Every weekday (Monday to Friday)";
        return base + formatEndCondition(maxOccurrences, schedulerEndDate);
      }
      if (daysOfWeek && Array.isArray(daysOfWeek) && daysOfWeek.length > 0) {
        const dayNames = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const selectedDayNames = daysOfWeek
          .filter((day) => day >= 0 && day <= 6)
          .map((day) => dayNames[day])
          .sort((a, b) => {
            const order = [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ];
            return order.indexOf(a) - order.indexOf(b);
          });
        const formattedDays =
          selectedDayNames.length > 1
            ? `${selectedDayNames.slice(0, -1).join(", ")} and ${selectedDayNames.slice(-1)}`
            : selectedDayNames[0];
        const base =
          interval > 1
            ? `Every ${interval} weeks on ${formattedDays}`
            : `Weekly on ${formattedDays}`;
        return base + formatEndCondition(maxOccurrences, schedulerEndDate);
      }
      const fallbackWeekday = selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
      });
      const fallbackWeeklyBase =
        interval > 1
          ? `Every ${interval} weeks on ${fallbackWeekday}`
          : `Weekly on ${fallbackWeekday}`;
      return (
        fallbackWeeklyBase +
        formatEndCondition(maxOccurrences, schedulerEndDate)
      );
    case "monthly":
      if (dayOfMonth && Array.isArray(dayOfMonth) && dayOfMonth.length > 0) {
        const base =
          interval > 1
            ? `Every ${interval} months on day ${dayOfMonth[0]}`
            : `Monthly on day ${dayOfMonth[0]}`;
        return base + formatEndCondition(maxOccurrences, schedulerEndDate);
      }
      if (
        weekOfMonth &&
        Array.isArray(weekOfMonth) &&
        weekOfMonth.length > 0 &&
        dayOfWeekInMonth !== undefined
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
          weekOfMonth[0] === 5 ? "last" : occurrenceMap[weekOfMonth[0] - 1];
        const base =
          interval > 1
            ? `Every ${interval} months on the ${occurrence} ${dayNames[dayOfWeekInMonth]}`
            : `Monthly on the ${occurrence} ${dayNames[dayOfWeekInMonth]}`;
        return base + formatEndCondition(maxOccurrences, schedulerEndDate);
      }
      const fallbackMonthDay = selectedDate.getDate();
      const fallbackMonthlyBase =
        interval > 1
          ? `Every ${interval} months on day ${fallbackMonthDay}`
          : `Monthly on day ${fallbackMonthDay}`;
      return (
        fallbackMonthlyBase +
        formatEndCondition(maxOccurrences, schedulerEndDate)
      );
    case "yearly":
      if (monthOfYear !== undefined && dayOfYearMonth !== undefined) {
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
        const base =
          interval > 1
            ? `Every ${interval} years on ${monthNames[monthOfYear - 1]} ${dayOfYearMonth}`
            : `Annually on ${monthNames[monthOfYear - 1]} ${dayOfYearMonth}`;
        return base + formatEndCondition(maxOccurrences, schedulerEndDate);
      }
      const month = selectedDate.toLocaleDateString("en-US", { month: "long" });
      const day = selectedDate.getDate();
      const fallbackYearlyBase =
        interval > 1
          ? `Every ${interval} years on ${month} ${day}`
          : `Annually on ${month} ${day}`;
      return (
        fallbackYearlyBase +
        formatEndCondition(maxOccurrences, schedulerEndDate)
      );
    case "custom":
      let actualFrequency = "custom";
      let period = "";
      if (monthOfYear !== undefined && dayOfYearMonth !== undefined) {
        actualFrequency = "yearly";
        period = "years";
      } else if (
        dayOfMonth !== undefined ||
        (weekOfMonth !== undefined && dayOfWeekInMonth !== undefined)
      ) {
        actualFrequency = "monthly";
        period = "months";
      } else if (daysOfWeek !== undefined && daysOfWeek.length > 0) {
        actualFrequency = "weekly";
        period = "weeks";
      } else {
        actualFrequency = "daily";
        period = "days";
      }
      const base = `Every ${interval} ${period}`;
      let details = "";
      if (actualFrequency === "weekly" && daysOfWeek && daysOfWeek.length > 0) {
        const dayNames = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const selectedDayNames = daysOfWeek
          .filter((day) => day >= 0 && day <= 6)
          .map((day) => dayNames[day])
          .sort((a, b) => {
            const order = [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ];
            return order.indexOf(a) - order.indexOf(b);
          });
        const formattedDays =
          selectedDayNames.length > 1
            ? `${selectedDayNames.slice(0, -1).join(", ")} and ${selectedDayNames.slice(-1)}`
            : selectedDayNames[0];
        details = ` on ${formattedDays}`;
      } else if (
        actualFrequency === "monthly" &&
        dayOfMonth &&
        dayOfMonth.length > 0
      ) {
        details = ` on day ${dayOfMonth[0]}`;
      } else if (
        actualFrequency === "yearly" &&
        monthOfYear !== undefined &&
        dayOfYearMonth !== undefined
      ) {
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
        details = ` on ${monthNames[monthOfYear - 1]} ${dayOfYearMonth}`;
      }
      return (
        base + details + formatEndCondition(maxOccurrences, schedulerEndDate)
      );
    default:
      return frequency;
  }
};

// Generate custom frequency text based on current state
const generateCustomFrequencyText = (
  repeatEvery,
  repeatPeriod,
  selectedDays,
  monthlyOption,
  endDate,
  occurrences,
  endsOption,
  selectedDate
) => {
  const formatDateForDisplay = (date) => {
    if (!date) return null;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatEndCondition = (maxOccurrences, schedulerEndDate) => {
    if (maxOccurrences && maxOccurrences > 0) {
      return `, ending after ${maxOccurrences} occurrence${maxOccurrences > 1 ? "s" : ""}`;
    } else if (schedulerEndDate) {
      const endDateStr = formatDateForDisplay(schedulerEndDate);
      return `, until ${endDateStr}`;
    }
    return "";
  };

  let base = "";
  let details = "";
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  if (repeatPeriod === "day") {
    base = `Every ${repeatEvery} day${repeatEvery > 1 ? "s" : ""}`;
  } else if (repeatPeriod === "week") {
    // const selectedDayNames = selectedDays
    //   .map((isSelected, index) => (isSelected ? dayNames[index] : null))
    //   .filter(Boolean)
    //   .sort((a, b) => {
    //     const order = [
    //       "Sunday",
    //       "Monday",
    //       "Tuesday",
    //       "Wednesday",
    //       "Thursday",
    //       "Friday",
    //       "Saturday",
    //     ];
    //     return order.indexOf(a) - order.indexOf(b);
    //   });
    let selectedDayNames = [];
  if (Array.isArray(selectedDays) && selectedDays.length === 7) {
    selectedDayNames = selectedDays
      .map((isSelected, index) => (isSelected ? dayNames[index] : null))
     .filter(Boolean)
      .sort((a, b) => {
        const order = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
         "Friday",
          "Saturday",
        ];
        return order.indexOf(a) - order.indexOf(b);
      });
  } else {
    // Fallback to selectedDate's day if selectedDays is invalid
    selectedDayNames = [dayNames[selectedDate.getDay()]];
 }
    const formattedDays =
      selectedDayNames.length > 1
        ? `${selectedDayNames.slice(0, -1).join(", ")} and ${selectedDayNames.slice(-1)}`
        : selectedDayNames[0] || dayNames[selectedDate.getDay()];
    base = `Every ${repeatEvery} week${repeatEvery > 1 ? "s" : ""}`;
    details = ` on ${formattedDays}`;
  } else if (repeatPeriod === "month") {
    base = `Every ${repeatEvery} month${repeatEvery > 1 ? "s" : ""}`;
    if (monthlyOption && monthlyOption.startsWith("Monthly on day")) {
      const dayNumber = parseInt(monthlyOption.split(" ").pop());
      details = ` on day ${dayNumber}`;
    } else if (monthlyOption && monthlyOption.startsWith("Monthly on the")) {
      details = ` on the ${monthlyOption.replace("Monthly on the ", "")}`;
    }
  } else if (repeatPeriod === "year") {
    const month = selectedDate.toLocaleDateString("en-US", { month: "long" });
    const day = selectedDate.getDate();
    base = `Every ${repeatEvery} year${repeatEvery > 1 ? "s" : ""}`;
    details = ` on ${month} ${day}`;
  }

  return base + details + formatEndCondition(occurrences, endDate);
};

export default function Frequency({ fieldOptions, notificationTypeId }) {
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
  type Recipient =
    | {
        attributeId?: string;
        refAttributeId?: string[];
        label?: string;
        customEmails?: string[];
      }
    | string;
  const [toRecipients, setToRecipients] = useState<Recipient[]>([]);
  const [ccRecipients, setCcRecipients] = useState<Recipient[]>([]);
  const [acknowledgeTo, setAcknowledgeTo] = useState<Recipient[]>([]);
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

  const createNotification = usePost(["createNotification"]);
  const deleteNotification = useDelete(["deleteNotification"]);
  const updateNotification = usePut(["updateNotification"]);
  const mediumList = useGet(["mediumList"], `${GET.MEDIUM_LIST}`, true);
  const templateList = useGet(["templateList"], `${GET.TEMPLATE_LIST}`, true);
  const { data: frequencyListData, refetch } = useGet(
    ["frequencyList", notificationTypeId, frequencyApiSuccess],
    frequencyApiSuccess
      ? `${GET.FREQUENCY_LIST}?notificationTypeId=${notificationTypeId}`
      : "",
    !!frequencyApiSuccess
  );

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
    if (notificationTypeId) {
      setFrequencyApiSuccess(true);
      refetch();
    }
  }, [notificationTypeId, refetch]);

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
      const uiFrequency = getExactUIFrequencyFromAPI(
        row,
        new Date(row.schedulerStartDate)
      );
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
    const today = new Date();
    for (let i = 0; i < first; i++) {
      cells.push(<Grid item xs={1} key={`empty-${i}`} />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m, d);
      const isSel = date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === today.toDateString();
      const isCurrentMonth = date.getMonth() === calendarDate.getMonth();
      cells.push(
        <Grid item xs={1} key={d} sx={{ textAlign: "center" }}>
          <Button
            onClick={() => {
              setSelectedDate(date);
              setDatePickerOpen(false);
            }}
            sx={(theme) => ({
              width: 36,
              height: 36,
              minWidth: 36,
              borderRadius: "50%",
              fontSize: "0.875rem",
              color: isSel
                ? "#fff"
                : isCurrentMonth
                  ? theme.palette.text.primary
                  : theme.palette.text.disabled,
              backgroundColor: isSel
                ? theme.palette.primary.main
                : "transparent",
              border:
                isToday && !isSel
                  ? `1px solid ${theme.palette.primary.main}`
                  : "none",
              fontWeight: isSel ? 600 : 400,
              "&:hover": {
                backgroundColor: isSel
                  ? theme.palette.primary.main
                  : theme.palette.action.hover,
              },
            })}
          >
            {d}
          </Button>
        </Grid>
      );
    }
    return cells;
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
      const lastOffset = (lastWeekday - weekday + 7) % 7;
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
    // Ensure the current repeatOption is included if it's a custom option
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

  const handleOpenDialog = () => {
    resetFormFields();
    setOpen(true);
    setModalType("add");
  };

  const handleClose = () => setOpen(false);

  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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

  const generatePayload = () => {
    const formattedToRecipients = formatRecipients(toRecipients);
    const formattedCcRecipients = formatRecipients(ccRecipients);
    const formattedAcknowledgeTo = formatRecipients(acknowledgeTo);
    const formattedTargetEntity = formatTargetEntity(targetEntity);

    const payload = {
      notificationTypeId,
      frequency: transformUIToAPIFrequency(repeatOption),
      schedulerStartDate: formatDateForAPI(selectedDate),
      interval: repeatEvery,
      repeatAnnually: false,
      attachmentRequired,
      recipients_to: formattedToRecipients,
      recipients_cc: formattedCcRecipients,
      medium: method,
      templateId: template,
      triggerTime: selectedTime,
      isActive: "active",
      schedulerEndDate: endDate,
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
        payload.schedulerEndDate = endDate;
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
      }
      handleClose();
      refetch();
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
      initializeSelectedDays();
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
          {frequencyListData?.data?.length > 0 ? "Scheduler Listing" : "Scheduler"}
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
            {generateCalendarDays()}
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
      {/* <CustomRecurrence
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
        onSave={(days) => {
          const customFrequencyText = generateCustomFrequencyText(
            repeatEvery,
            repeatPeriod,
            days || selectedDays,
            monthlyOption,
            endDate,
            occurrences,
            endsOption,
            selectedDate
          );
          setRepeatOption(customFrequencyText);
          setIsCustomRecurrence(true);
          if (days) {
            setSelectedDays(days);
          }
          setCustomRecurrenceOpen(false);
          const payload = generatePayload();
          handleSave(payload);
        }}
      /> */}
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
   onSave={(days) => {
     // Ensure days is an array, default to selectedDays or initialize based on selectedDate
     const validDays = Array.isArray(days) && days.length === 7
       ? days
       : selectedDays.length === 7
        ? selectedDays
        : Array(7).fill(false).map((_, i) => i === selectedDate.getDay());
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
    if (Array.isArray(days) && days.length === 7) {
     setSelectedDays(days);
      }
      setCustomRecurrenceOpen(false);
      const payload = generatePayload();
      handleSave(payload);
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