// import React, { useState, useEffect, useCallback, useRef } from "react";
// import {
//   Autocomplete,
//   TextField,
//   Button,
//   Alert,
//   Checkbox,
//   FormControlLabel,
//   Box,
//   Typography,
//   FormControl,
//   FormLabel,
//   RadioGroup,
//   Radio,
//   Select,
//   MenuItem,
//   Chip,
//   IconButton,
//   InputLabel,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Tooltip,
//   FormHelperText,
// } from "@mui/material";
// import { DataGrid, GridColDef } from "@mui/x-data-grid";
// import { GridDeleteIcon } from "@mui/x-data-grid";
// import EditIcon from "@mui/icons-material/Edit";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import useGet from "../../hooks/useGet";
// import usePost from "../../hooks/usePost";
// import usePut from "../../hooks/usePut";
// import useDelete from "../../hooks/useDelete";
// import { GET, POST, PUT, DELETE } from "../../services/apiRoutes";
// import { STYLE_GUIDE } from "../../styles";
// import { toast } from "react-toastify";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import dayjs from "dayjs";
// import { TimePicker } from "@mui/x-date-pickers/TimePicker";
// import ViewReminderDialog from "./ViewReminderDialog";

// // Constants remain the same
// const MONTHS = [
//   { id: "Jan", label: "January" },
//   { id: "Feb", label: "February" },
//   { id: "Mar", label: "March" },
//   { id: "Apr", label: "April" },
//   { id: "May", label: "May" },
//   { id: "Jun", label: "June" },
//   { id: "Jul", label: "July" },
//   { id: "Aug", label: "August" },
//   { id: "Sep", label: "September" },
//   { id: "Oct", label: "October" },
//   { id: "Nov", label: "November" },
//   { id: "Dec", label: "December" },
// ];
// const DAYS = Array.from({ length: 31 }, (_, i) => ({
//   id: (i + 1).toString(),
//   label: (i + 1).toString(),
// }));
// const WEEK_OPTIONS = [
//   { id: "First", label: "First" },
//   { id: "Second", label: "Second" },
//   { id: "Third", label: "Third" },
//   { id: "Fourth", label: "Fourth" },
//   { id: "Last", label: "Last" },
//   { id: "All", label: "All" },
// ];
// // Styles remain the same
// const styles = {
//   formRow: {
//     display: "flex",
//     gap: STYLE_GUIDE.SPACING.s4,
//     alignItems: "center",
//     flexWrap: "wrap",
//     marginBottom: STYLE_GUIDE.SPACING.s4,
//     width: "100%",
//     "@media (max-width: 600px)": {
//       flexDirection: "column",
//       alignItems: "flex-start",
//     },
//   },
//   textField: {
//     minWidth: "120px",
//     maxWidth: "300px",
//     "& .MuiInputBase-root": {
//       fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//     },
//   },
//   select: {
//     minWidth: "120px",
//     maxWidth: "300px",
//     "& .MuiInputBase-root": {
//       fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//     },
//   },
//   radio: {
//     color: STYLE_GUIDE.COLORS.purple,
//     "&.Mui-checked": {
//       color: STYLE_GUIDE.COLORS.purple,
//     },
//   },
//   chip: (selected) => ({
//     backgroundColor: selected
//       ? STYLE_GUIDE.COLORS.primaryLight
//       : STYLE_GUIDE.COLORS.white,
//     color: selected ? STYLE_GUIDE.COLORS.white : STYLE_GUIDE.COLORS.black,
//     fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//     transition: "all 0.3s",
//     "&:hover": {
//       backgroundColor: selected
//         ? STYLE_GUIDE.COLORS.primaryDark
//         : STYLE_GUIDE.COLORS.backgroundGray,
//     },
//   }),
//   output: {
//     backgroundColor: STYLE_GUIDE.COLORS.WhiteLight,
//     border: `1px solid ${STYLE_GUIDE.COLORS.borderPrimary}`,
//     borderRadius: STYLE_GUIDE.SPACING.s1,
//     padding: STYLE_GUIDE.SPACING.s4,
//     fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.mono,
//     wordBreak: "break-all",
//     fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//     color: STYLE_GUIDE.COLORS.primaryLight,
//   },
//   reminderContainer: {
//     marginBottom: STYLE_GUIDE.SPACING.s6,
//     display: "flex",
//     flexDirection: "column",
//     gap: STYLE_GUIDE.SPACING.s3,
//   },
//   dataGridContainer: {
//     width: "100%",
//     "& .MuiDataGrid-cell": {
//       fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//     },
//     "& .MuiDataGrid-columnHeader": {
//       fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//       fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
//     },
//   },
//   headerRow: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: STYLE_GUIDE.SPACING.s6,
//   },
//   viewDialogContent: {
//     display: "flex",
//     flexDirection: "column",
//     gap: STYLE_GUIDE.SPACING.s3,
//   },
//   viewDetailRow: {
//     display: "flex",
//     borderBottom: `1px solid ${STYLE_GUIDE.COLORS.borderLight}`,
//     paddingBottom: STYLE_GUIDE.SPACING.s2,
//     marginBottom: STYLE_GUIDE.SPACING.s2,
//   },
//   viewDetailLabel: {
//     fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
//     minWidth: "180px",
//     color: STYLE_GUIDE.COLORS.textDarkGray,
//   },
//   viewDetailValue: {
//     color: STYLE_GUIDE.COLORS.textPrimary,
//   },
//   errorText: {
//     color: STYLE_GUIDE.COLORS.error,
//     fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//     marginTop: STYLE_GUIDE.SPACING.s1,
//   },
// };

// // RRuleGenerator Component
// const RRuleGenerator = ({
//   onChange,
//   value,
//   config = {},
//   fieldOptions = [],
//   notificationTypeId,
// }) => {
//   const defaultConfig = {
//     repeat: ["Yearly", "Monthly", "Weekly", "Daily"],
//     yearly: "on",
//     monthly: "on",
//     end: ["Never", "After", "On date"],
//     weekStartsOnSunday: false,
//     hideError: false,
//     ...config,
//   };

//   const weekdays = defaultConfig.weekStartsOnSunday
//     ? [
//         { id: "Sunday", label: "Sunday" },
//         { id: "Monday", label: "Monday" },
//         { id: "Tuesday", label: "Tuesday" },
//         { id: "Wednesday", label: "Wednesday" },
//         { id: "Thursday", label: "Thursday" },
//         { id: "Friday", label: "Friday" },
//         { id: "Saturday", label: "Saturday" },
//       ]
//     : [
//         { id: "Monday", label: "Monday" },
//         { id: "Tuesday", label: "Tuesday" },
//         { id: "Wednesday", label: "Wednesday" },
//         { id: "Thursday", label: "Thursday" },
//         { id: "Friday", label: "Friday" },
//         { id: "Saturday", label: "Saturday" },
//         { id: "Sunday", label: "Sunday" },
//       ];

//   const dayAbbrevs = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

//   const backendDayIndices = defaultConfig.weekStartsOnSunday
//     ? {
//         Sunday: 0,
//         Monday: 1,
//         Tuesday: 2,
//         Wednesday: 3,
//         Thursday: 4,
//         Friday: 5,
//         Saturday: 6,
//       }
//     : {
//         Sunday: 0,
//         Monday: 1,
//         Tuesday: 2,
//         Wednesday: 3,
//         Thursday: 4,
//         Friday: 5,
//         Saturday: 6,
//       };

//   const mapBackendDayToUiIndex = (backendDay) => {
//     if (defaultConfig.weekStartsOnSunday) {
//       return backendDay;
//     } else {
//       if (backendDay === 0) {
//         return 6;
//       } else {
//         return backendDay - 1;
//       }
//     }
//   };

//   const [startDate, setStartDate] = useState("");
//   const [repeatType, setRepeatType] = useState("");
//   const [yearlyType, setYearlyType] = useState(
//     defaultConfig.yearly === "on the" ? "onthe" : "on"
//   );
//   const [yearlyMonths, setYearlyMonths] = useState([]);
//   const [yearlyDays, setYearlyDays] = useState([]);
//   const [yearlyWeeks, setYearlyWeeks] = useState([]);
//   const [yearlyWeekDays, setYearlyWeekDays] = useState([]);
//   const [yearlyWeekMonths, setYearlyWeekMonths] = useState([]);
//   const [monthlyType, setMonthlyType] = useState(
//     defaultConfig.monthly === "on the" ? "onthe" : "on"
//   );
//   const [monthlyDays, setMonthlyDays] = useState([]);
//   const [monthlyWeeks, setMonthlyWeeks] = useState([]);
//   const [monthlyWeekDays, setMonthlyWeekDays] = useState([]);
//   const [weeklyDays, setWeeklyDays] = useState([]);
//   const [interval, setInterval] = useState(1);
//   const [endType, setEndType] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [endAfter, setEndAfter] = useState(1);
//   const [frequencyApiSuccess, setFrequencyApiSuccess] = useState(false);
//   const [successMessage, setSuccessMessage] = useState(null);
//   const [acknowledgeChecked, setAcknowledgeChecked] = useState(false);
//   const [attachedChecked, setAttachedChecked] = useState(false);
//   const [time, setTime] = useState("");
//   const [template, setTemplate] = useState("");
//   const [method, setMethod] = useState("");
//   const [toRecipients, setToRecipients] = useState([]);
//   const [ccRecipients, setCcRecipients] = useState([]);
//   const [targetEntity, setTargetEntity] = useState(null);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [selectedReminderId, setSelectedReminderId] = useState(null);
//   const [editMode, setEditMode] = useState(false);
//   const [editingReminderId, setEditingReminderId] = useState(null);
//   const [openViewDialog, setOpenViewDialog] = useState(false);
//   const [viewingReminderId, setViewingReminderId] = useState(null);
//   const [viewingReminderData, setViewingReminderData] = useState(null);
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "info",
//   });

//   const [errors, setErrors] = useState({
//     frequency: "",
//     startDate: "",
//     endDate: "",
//     interval: "",
//     weeklyDays: "",
//     monthlyDays: "",
//     yearlyDays: "",
//     template: "",
//     method: "",
//   });

//   const isMounted = useRef(false);
//   const isInitialMount = useRef(true);
//   const previousRepeatType = useRef(repeatType);

//   const resetForm = useCallback(() => {
//     setStartDate("");
//     setRepeatType("");
//     setYearlyType(defaultConfig.yearly === "on the" ? "onthe" : "on");
//     setYearlyMonths([]);
//     setYearlyDays([]);
//     setYearlyWeeks([]);
//     setYearlyWeekDays([]);
//     setYearlyWeekMonths([]);
//     setMonthlyType(defaultConfig.monthly === "on the" ? "onthe" : "on");
//     setMonthlyDays([]);
//     setMonthlyWeeks([]);
//     setMonthlyWeekDays([]);
//     setWeeklyDays([]);
//     setInterval(1);
//     setEndType("");
//     setEndDate("");
//     setEndAfter(1);
//     setAcknowledgeChecked(false);
//     setAttachedChecked(false);
//     setTime("");
//     setTemplate("");
//     setMethod("");
//     setToRecipients([]);
//     setCcRecipients([]);
//     setTargetEntity(null);

//     setErrors({
//       frequency: "",
//       startDate: "",
//       endDate: "",
//       interval: "",
//       weeklyDays: "",
//       monthlyDays: "",
//       yearlyDays: "",
//       template: "",
//       method: "",
//     });

//     isInitialMount.current = true;
//   }, [defaultConfig.yearly, defaultConfig.monthly]);

//   // Validate form
//   const validateForm = useCallback(() => {
//     let valid = true;
//     const newErrors = {
//       frequency: "",
//       startDate: "",
//       endDate: "",
//       interval: "",
//       weeklyDays: "",
//       monthlyDays: "",
//       yearlyDays: "",
//       template: "",
//       method: "",
//     };

//     // Validate frequency
//     if (!repeatType) {
//       newErrors.frequency = "Frequency is required";
//       valid = false;
//     }

//     // Validate start date
//     if (!startDate) {
//       newErrors.startDate = "Start date is required";
//       valid = false;
//     }

//     // Validate interval
//     if (interval < 1) {
//       newErrors.interval = "Interval must be at least 1";
//       valid = false;
//     }

//     // Validate based on frequency type
//     if (repeatType === "Weekly" && weeklyDays.length === 0) {
//       newErrors.weeklyDays = "At least one day must be selected for weekly frequency";
//       valid = false;
//     }

//     if (repeatType === "Monthly") {
//       if (monthlyType === "on" && monthlyDays.length === 0) {
//         newErrors.monthlyDays = "At least one day must be selected for monthly frequency";
//         valid = false;
//       } else if (monthlyType === "onthe" && (monthlyWeeks.length === 0 || monthlyWeekDays.length === 0)) {
//         newErrors.monthlyDays = "Both week and weekday must be selected for monthly frequency";
//         valid = false;
//       }
//     }

//     if (repeatType === "Yearly") {
//       if (yearlyType === "on" && (yearlyMonths.length === 0 || yearlyDays.length === 0)) {
//         newErrors.yearlyDays = "Both month and day must be selected for yearly frequency";
//         valid = false;
//       } else if (yearlyType === "onthe" && (yearlyWeeks.length === 0 || yearlyWeekDays.length === 0 || yearlyWeekMonths.length === 0)) {
//         newErrors.yearlyDays = "Week, weekday, and month must be selected for yearly frequency";
//         valid = false;
//       }
//     }

//     // Validate end date if selected
//     if (endType === "On date" && !endDate) {
//       newErrors.endDate = "End date is required";
//       valid = false;
//     }

//     // Validate template and method
//     if (!template) {
//       newErrors.template = "Template is required";
//       valid = false;
//     }

//     if (!method) {
//       newErrors.method = "Method is required";
//       valid = false;
//     }

//     setErrors(newErrors);
//     return valid;
//   }, [
//     repeatType,
//     startDate,
//     interval,
//     weeklyDays,
//     monthlyDays,
//     monthlyType,
//     monthlyWeeks,
//     monthlyWeekDays,
//     yearlyDays,
//     yearlyMonths,
//     yearlyType,
//     yearlyWeeks,
//     yearlyWeekDays,
//     yearlyWeekMonths,
//     endType,
//     endDate,
//     template,
//     method,
//   ]);

//   const templateList = useGet(["templateList"], `${GET.TEMPLATE_LIST}`, true);
//   const mediumList = useGet(["mediumList"], `${GET.MEDIUM_LIST}`, true);
//   const createFrequency = usePost(["createFrequency"]);
//   const updateFrequency = usePut(["updateFrequency"]);
//   const deleteFrequency = useDelete(
//     ["deleteFrequency"],
//     (data) => {
//       if (data?.success) {
//         refetch();
//         handleCloseDialog();
//         setSnackbar({
//           open: true,
//           message: "Reminder deleted successfully!",
//           severity: "success",
//         });
//       } else {
//         setSnackbar({
//           open: true,
//           message: "Failed to delete reminder.",
//           severity: "error",
//         });
//       }
//     },
//     true
//   );

//   const { data: frequencyListData, refetch } = useGet(
//     ["frequencyList", notificationTypeId, frequencyApiSuccess],
//     frequencyApiSuccess
//       ? `${GET.FREQUENCY_LIST}?notificationTypeId=${notificationTypeId}`
//       : "",
//     !!frequencyApiSuccess
//   );

//   const { data: reminderData, refetch: refetchReminder } = useGet(
//     ["reminder", editingReminderId],
//     editingReminderId ? `${GET.FREQUENCY_DETAIL}/${editingReminderId}` : "",
//     !!editingReminderId
//   );

//   const { data: viewReminderData, refetch: refetchViewReminder } = useGet(
//     ["viewReminder", viewingReminderId],
//     viewingReminderId ? `${GET.FREQUENCY_DETAIL}/${viewingReminderId}` : "",
//     !!viewingReminderId
//   );

//   // useEffect Hooks
//   useEffect(() => {
//     isMounted.current = true;
//     return () => {
//       isMounted.current = false;
//     };
//   }, []);

//   useEffect(() => {
//     if (notificationTypeId) {
//       setFrequencyApiSuccess(true);
//       refetch();
//     }
//   }, [notificationTypeId, refetch]);

//   useEffect(() => {
//     if (notificationTypeId && frequencyApiSuccess) {
//       refetch();
//     }
//   }, [notificationTypeId, frequencyApiSuccess, refetch]);

//   useEffect(() => {
//     if (viewReminderData?.data && openViewDialog) {
//       setViewingReminderData(viewReminderData.data);
//     }
//   }, [viewReminderData, openViewDialog]);

//   useEffect(() => {
//     if (!reminderData?.data || !editMode) {
//       return;
//     }
//     console.log("Loading edit data:", reminderData.data);
//     const data = reminderData.data;
//     setStartDate(
//       data.schedulerStartDate
//         ? new Date(data.schedulerStartDate).toISOString().split("T")[0]
//         : ""
//     );
//     setRepeatType(
//       data.frequency
//         ? data.frequency.charAt(0).toUpperCase() + data.frequency.slice(1)
//         : ""
//     );
//     setInterval(data.interval || 1);
//     setAcknowledgeChecked(data.acknowledgeRequired || false);
//     setAttachedChecked(data.attachmentRequired || false);
//     setTime(data.triggerTime || "");
//     setTemplate(data.templateId?._id || "");
//     setMethod(data.medium?._id || "");
//     if (data.frequency === "weekly" && data.daysOfWeek?.length > 0) {
//       const dayNames = [
//         "Sunday",
//         "Monday",
//         "Tuesday",
//         "Wednesday",
//         "Thursday",
//         "Friday",
//         "Saturday",
//       ];
//       const mappedDays = data.daysOfWeek
//         .map((backendIndex) => dayNames[backendIndex])
//         .filter((dayName) => dayName);
//       setWeeklyDays(mappedDays);
//     } else {
//       setWeeklyDays([]);
//     }
//     if (data.frequency === "monthly") {
//       if (data.dayOfMonth && data.dayOfMonth.length > 0) {
//         setMonthlyType("on");
//         setMonthlyDays(data.dayOfMonth.map((d) => d.toString()));
//         setMonthlyWeeks([]);
//         setMonthlyWeekDays([]);
//       } else if (data.weekOfMonth && data.weekOfMonth.length > 0) {
//         setMonthlyType("onthe");
//         setMonthlyWeeks(
//           data.weekOfMonth.map((w) =>
//             w === -1 ? "Last" : WEEK_OPTIONS[w - 1]?.id || "First"
//           )
//         );
//         setMonthlyWeekDays(
//           data.daysOfWeek?.length > 0
//             ? data.daysOfWeek
//                 .map((d) => {
//                   const uiIndex = mapBackendDayToUiIndex(d);
//                   return weekdays[uiIndex]?.id;
//                 })
//                 .filter((d) => d)
//             : []
//         );
//         setMonthlyDays([]);
//       }
//     }
//     if (data.frequency === "yearly") {
//       if (data.dayOfMonth?.length > 0) {
//         setYearlyType("on");
//         setYearlyMonths(
//           data.monthOfYear?.length > 0
//             ? data.monthOfYear.map((m) => MONTHS[m - 1]?.id || "Jan")
//             : []
//         );
//         setYearlyDays(
//           data.dayOfMonth?.length > 0
//             ? data.dayOfMonth.map((d) => d.toString())
//             : []
//         );
//       } else if (data.weekOfMonth?.length > 0) {
//         setYearlyType("onthe");
//         setYearlyWeeks(
//           data.weekOfMonth?.length > 0
//             ? data.weekOfMonth.map((w) =>
//                 w === -1 ? "Last" : WEEK_OPTIONS[w - 1]?.id || "First"
//               )
//             : []
//         );
//         setYearlyWeekDays(
//           data.daysOfWeek?.length > 0
//             ? data.daysOfWeek
//                 .map((d) => {
//                   const uiIndex = mapBackendDayToUiIndex(d);
//                   return weekdays[uiIndex]?.id;
//                 })
//                 .filter((d) => d)
//             : []
//         );
//         setYearlyWeekMonths(
//           data.monthOfYear?.length > 0
//             ? data.monthOfYear.map((m) => MONTHS[m - 1]?.id || "Jan")
//             : []
//         );
//       }
//     }

//     // Helper function to compare arrays
//     const arraysEqual = (a, b) => {
//       if (a === b) return true;
//       if (a == null || b == null) return false;
//       if (a.length !== b.length) return false;

//       // Sort both arrays to compare regardless of order
//       const sortedA = [...a].sort();
//       const sortedB = [...b].sort();

//       for (let i = 0; i < sortedA.length; ++i) {
//         if (sortedA[i] !== sortedB[i]) return false;
//       }
//       return true;
//     };

//     const toRecipients = [];
//     const ccRecipients = [];
//     if (data.recipients_to && Array.isArray(data.recipients_to)) {
//       data.recipients_to.forEach((recipient) => {
//         if (
//           recipient.customEmails &&
//           Array.isArray(recipient.customEmails) &&
//           recipient.customEmails.length > 0
//         ) {
//           recipient.customEmails.forEach((email) => {
//             toRecipients.push({
//               value: email,
//               label: email,
//               isCustom: true,
//             });
//           });
//         } else if (recipient.attributeId) {
//           const fieldOption = fieldOptions.find(
//             (opt) =>
//               opt.attributeId === recipient.attributeId &&
//               arraysEqual(opt.refAttributeId || [], recipient.refAttributeId || [])
//           );

//           if (fieldOption) {
//             toRecipients.push(fieldOption);
//           } else {
//             const fallbackOption = fieldOptions.find(
//               (opt) => opt.attributeId === recipient.attributeId
//             );
//             if (fallbackOption) {
//               toRecipients.push(fallbackOption);
//             } else {
//               toRecipients.push({
//                 value: recipient.attributeId,
//                 label: recipient.attributeId,
//               });
//             }
//           }
//         }
//       });
//     }
//     if (data.recipients_cc && Array.isArray(data.recipients_cc)) {
//       data.recipients_cc.forEach((recipient) => {
//         if (
//           recipient.customEmails &&
//           Array.isArray(recipient.customEmails) &&
//           recipient.customEmails.length > 0
//         ) {
//           recipient.customEmails.forEach((email) => {
//             ccRecipients.push({
//               value: email,
//               label: email,
//               isCustom: true,
//             });
//           });
//         } else if (recipient.attributeId) {
//           const fieldOption = fieldOptions.find(
//             (opt) =>
//               opt.attributeId === recipient.attributeId &&
//               arraysEqual(opt.refAttributeId || [], recipient.refAttributeId || [])
//           );

//           if (fieldOption) {
//             ccRecipients.push(fieldOption);
//           } else {
//             const fallbackOption = fieldOptions.find(
//               (opt) => opt.attributeId === recipient.attributeId
//             );
//             if (fallbackOption) {
//               ccRecipients.push(fallbackOption);
//             } else {
//               ccRecipients.push({
//                 value: recipient.attributeId,
//                 label: recipient.attributeId,
//               });
//             }
//           }
//         }
//       });
//     }
//     setToRecipients(toRecipients);
//     setCcRecipients(ccRecipients);
//     if (data.targetEntity) {
//       if (data.targetEntity.attributeId) {
//         const fieldOption = fieldOptions.find(
//           (opt) =>
//             opt.attributeId === data.targetEntity.attributeId &&
//             arraysEqual(opt.refAttributeId || [], data.targetEntity.refAttributeId || [])
//         );

//         if (fieldOption) {
//           setTargetEntity(fieldOption);
//         } else {
//           const fallbackOption = fieldOptions.find(
//             (opt) => opt.attributeId === data.targetEntity.attributeId
//           );
//           if (fallbackOption) {
//             setTargetEntity(fallbackOption);
//           } else {
//             setTargetEntity({
//               value: data.targetEntity.attributeId,
//               label: data.targetEntity.attributeId,
//             });
//           }
//         }
//       } else if (
//         data.targetEntity.customEmails &&
//         Array.isArray(data.targetEntity.customEmails) &&
//         data.targetEntity.customEmails.length > 0
//       ) {
//         setTargetEntity(data.targetEntity.customEmails[0]);
//       }
//     } else {
//       setTargetEntity(null);
//     }
//     if (data.maxOccurrences) {
//       setEndType("After");
//       setEndAfter(parseInt(data.maxOccurrences) || 1);
//     } else if (data.schedulerEndDate) {
//       setEndType("On date");
//       setEndDate(
//         new Date(data.schedulerEndDate).toISOString().split("T")[0] || ""
//       );
//     } else {
//       setEndType("Never");
//     }
//   }, [reminderData?.data, editMode, fieldOptions]);
//   useEffect(() => {
//     if (repeatType === "Yearly" && !isInitialMount.current) {
//       if (yearlyType === "on") {
//         setYearlyWeeks([]);
//         setYearlyWeekDays([]);
//         setYearlyWeekMonths([]);
//       } else if (yearlyType === "onthe") {
//         setYearlyMonths([]);
//         setYearlyDays([]);
//       }
//     }
//   }, [yearlyType, repeatType]);

//   useEffect(() => {
//     if (repeatType === "Monthly" && !isInitialMount.current) {
//       if (monthlyType === "on") {
//         setMonthlyWeeks([]);
//         setMonthlyWeekDays([]);
//       } else if (monthlyType === "onthe") {
//         setMonthlyDays([]);
//       }
//     }
//   }, [monthlyType, repeatType]);

//   // Handlers
//   const handleWeeklyDayToggle = useCallback(
//     (day) => {
//       setWeeklyDays((prev) => {
//         const newDays = prev.includes(day)
//           ? prev.filter((d) => d !== day)
//           : [...prev, day].sort(
//               (a, b) =>
//                 weekdays.findIndex((w) => w.id === a) -
//                 weekdays.findIndex((w) => w.id === b)
//             );
//         return newDays.length > 0 ? newDays : prev;
//       });

//       // Clear error when user selects a day
//       if (errors.weeklyDays) {
//         setErrors(prev => ({...prev, weeklyDays: ""}));
//       }
//     },
//     [weekdays, errors.weeklyDays]
//   );

//   const handleEditReminder = useCallback(
//     (reminder) => {
//       setEditingReminderId(reminder._id);
//       setEditMode(true);
//       setTimeout(() => {
//         refetchReminder();
//       }, 100);
//     },
//     [refetchReminder]
//   );

//   const handleCancelEdit = useCallback(() => {
//     setEditMode(false);
//     setEditingReminderId(null);
//     resetForm();
//   }, [resetForm]);

//   const handleViewReminder = useCallback(
//     (reminder) => {
//       setViewingReminderId(reminder._id);
//       setOpenViewDialog(true);
//       refetchViewReminder();
//     },
//     [refetchViewReminder]
//   );

//   const handleCloseViewDialog = useCallback(() => {
//     setOpenViewDialog(false);
//     setViewingReminderId(null);
//     setViewingReminderData(null);
//   }, []);

//   const handleYearlyTypeChange = (e) => {
//     const newType = e.target.value;
//     setYearlyType(newType);
//     if (newType === "on") {
//       setYearlyWeeks([]);
//       setYearlyWeekDays([]);
//       setYearlyWeekMonths([]);
//     } else if (newType === "onthe") {
//       setYearlyMonths([]);
//       setYearlyDays([]);
//     }
//   };

//   const handleMonthlyTypeChange = (e) => {
//     const newType = e.target.value;
//     setMonthlyType(newType);
//     if (newType === "on") {
//       setMonthlyWeeks([]);
//       setMonthlyWeekDays([]);
//     } else if (newType === "onthe") {
//       setMonthlyDays([]);
//     }
//   };

//   const handleAddReminder = useCallback(async () => {
//     // Validate form before submission
//     if (!validateForm()) {
//       return;
//     }

//     const rrule = generateRRule();
//     if (!rrule) {
//       setSuccessMessage("Please select valid options to generate an RRule.");
//       setTimeout(() => setSuccessMessage(null), 3000);
//       return;
//     }

//     let dayOfMonth = [];
//     let weekOfMonth = [];
//     let daysOfWeek = [];
//     let monthOfYear = [];
//     if (repeatType === "Monthly") {
//       if (monthlyType === "on") {
//         dayOfMonth = monthlyDays.map((day) => parseInt(day));
//       } else if (monthlyType === "onthe") {
//         weekOfMonth = monthlyWeeks.map((week) => {
//           if (week === "Last") return -1;
//           return WEEK_OPTIONS.findIndex((opt) => opt.id === week) + 1;
//         });
//         daysOfWeek = monthlyWeekDays
//           .map((day) => backendDayIndices[day])
//           .filter((idx) => idx !== undefined);
//       }
//     } else if (repeatType === "Weekly") {
//       daysOfWeek = weeklyDays
//         .map((day) => backendDayIndices[day])
//         .filter((idx) => idx !== undefined);
//     } else if (repeatType === "Yearly") {
//       if (yearlyType === "on") {
//         dayOfMonth = yearlyDays.map((day) => parseInt(day));
//         monthOfYear = yearlyMonths.map(
//           (m) => MONTHS.findIndex((month) => month.id === m) + 1
//         );
//       } else if (yearlyType === "onthe") {
//         weekOfMonth = yearlyWeeks.map((week) => {
//           if (week === "Last") return -1;
//           return WEEK_OPTIONS.findIndex((opt) => opt.id === week) + 1;
//         });
//         daysOfWeek = yearlyWeekDays
//           .map((day) => backendDayIndices[day])
//           .filter((idx) => idx !== undefined);
//         monthOfYear = yearlyWeekMonths.map(
//           (m) => MONTHS.findIndex((month) => month.id === m) + 1
//         );
//       }
//     }

//     const formatRecipients = (recipients) => {
//   const result = [];
//   const customEmails = [];
//   recipients.forEach((recipient) => {
//     if (typeof recipient === "string") {
//       if (recipient.includes("@")) {
//         customEmails.push(recipient);
//       } else {
//         result.push({ attributeId: recipient });
//       }
//     } else {
//       if (recipient.label && recipient.label.includes("@")) {
//         customEmails.push(recipient.label);
//       } else if (recipient.attributeId) {
//         const recipientObj = {
//           attributeId: recipient.attributeId
//         };

//         if (recipient.refAttributeId && Array.isArray(recipient.refAttributeId) && recipient.refAttributeId.length > 0) {
//           recipientObj.refAttributeId = recipient.refAttributeId;
//         }

//         result.push(recipientObj);
//       }
//     }
//   });

//   if (customEmails.length > 0) {
//     result.push({ customEmails });
//   }

//   return result;
// };

// let formattedTargetEntity = null;
// if (targetEntity) {
//   if (typeof targetEntity === "string") {
//     formattedTargetEntity = { customEmails: [targetEntity] };
//   } else if (targetEntity.attributeId) {
//     formattedTargetEntity = {
//       attributeId: targetEntity.attributeId
//     };

//     if (targetEntity.refAttributeId && Array.isArray(targetEntity.refAttributeId) && targetEntity.refAttributeId.length > 0) {
//       formattedTargetEntity.refAttributeId = targetEntity.refAttributeId;
//     }
//   }
// }
//     const payload = {
//       notificationTypeId,
//       frequency: repeatType.toLowerCase(),
//       schedulerStartDate: startDate,
//       ...(endType === "On date" && { schedulerEndDate: endDate }),
//       interval,
//       ...( dayOfMonth.length  && { dayOfMonth }),
//       ...(weekOfMonth.length > 0 && { weekOfMonth }),
//       ...(daysOfWeek.length > 0 && { daysOfWeek }),
//       ...(monthOfYear.length > 0 && { monthOfYear }),
//       repeatAnnually: repeatType === "Yearly",
//       acknowledgeRequired: acknowledgeChecked,
//       attachmentRequired: attachedChecked,
//       recipients_to: formatRecipients(toRecipients),
//       recipients_cc: formatRecipients(ccRecipients),
//       medium: method,
//       templateId: template,
//       triggerTime: time || "",
//       ...(endType === "After" && { maxOccurrences: endAfter.toString() }),
//       ...(formattedTargetEntity && { targetEntity: formattedTargetEntity }),
//     };

//     console.log("Formatted payload:",payload, JSON.stringify(payload, null, 2));
//     try {
//       if (editMode) {
//         console.log("Updating reminder with ID:", editingReminderId);
//         const response = await updateFrequency.mutateAsync({
//           url: `${PUT.UPDATE_FREQUENCY}/${editingReminderId}`,
//           payload,
//         });
//         if (response.success && response.data?._id) {
//           toast.success(response.message);
//           setEditMode(false);
//           setEditingReminderId(null);
//           refetch();
//           resetForm();
//         } else {
//           throw new Error("Update failed");
//         }
//       } else {
//         console.log("Creating new reminder");
//         const response = await createFrequency.mutateAsync({
//           url: `${POST.CREATE_FREQUENCY}`,
//           payload,
//         });
//         if (response.success && response.data?._id) {
//           setFrequencyApiSuccess(response.success);
//           toast.success(response.message);
//           refetch();
//           resetForm();
//         } else {
//           toast.error(response.message);
//           throw new Error("Creation failed");
//         }
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       setSnackbar({
//         open: true,
//         message: editMode
//           ? "Failed to update reminder."
//           : "Failed to create reminder.",
//         severity: "error",
//       });
//     }
//   }, [
//     acknowledgeChecked,
//     attachedChecked,
//     ccRecipients,
//     createFrequency,
//     editMode,
//     editingReminderId,
//     endAfter,
//     endDate,
//     endType,
//     fieldOptions,
//     interval,
//     method,
//     monthlyDays,
//     monthlyType,
//     monthlyWeekDays,
//     monthlyWeeks,
//     notificationTypeId,
//     repeatType,
//     resetForm,
//     startDate,
//     targetEntity,
//     template,
//     time,
//     toRecipients,
//     updateFrequency,
//     yearlyDays,
//     yearlyMonths,
//     yearlyType,
//     yearlyWeekDays,
//     yearlyWeekMonths,
//     yearlyWeeks,
//     weeklyDays,
//     refetch,
//     backendDayIndices,
//     validateForm,
//   ]);

//   const handleDeleteReminder = useCallback((reminderId) => {
//     setSelectedReminderId(reminderId);
//     setOpenDialog(true);
//   }, []);

//   const handleCloseDialog = useCallback(() => {
//     setOpenDialog(false);
//     setSelectedReminderId(null);
//   }, []);

//   const handleConfirmDelete = useCallback(async () => {
//     if (selectedReminderId) {
//       try {
//         await deleteFrequency.mutate({
//           url: `${DELETE.DELETE_FREQUENCY}/${selectedReminderId}`,
//         });
//       } catch (error) {
//         console.error("Error deleting reminder:", error);
//         setSnackbar({
//           open: true,
//           message: "Failed to delete reminder.",
//           severity: "error",
//         });
//       }
//     }
//   }, [deleteFrequency, selectedReminderId]);

//   const parseRRule = useCallback(
//     (rruleString) => {
//       try {
//         const parts = rruleString.split(";");
//         const rules = parts.reduce((acc, part) => {
//           const [key, val] = part.split("=");
//           return { ...acc, [key]: val };
//         }, {});

//         if (rules.FREQ) {
//           const newRepeatType =
//             rules.FREQ.charAt(0) + rules.FREQ.slice(1).toLowerCase();
//           if (newRepeatType !== repeatType) {
//             setRepeatType(newRepeatType);
//           }
//         }

//         if (rules.INTERVAL) {
//           const newInterval = parseInt(rules.INTERVAL) || 1;
//           if (newInterval !== interval) {
//             setInterval(newInterval);
//           }
//         }

//         if (rules.COUNT) {
//           const newEndType = "After";
//           const newEndAfter = parseInt(rules.COUNT) || 1;
//           if (newEndType !== endType || newEndAfter !== endAfter) {
//             setEndType(newEndType);
//             setEndAfter(newEndAfter);
//           }
//         } else if (rules.UNTIL) {
//           const newEndType = "On date";
//           const until = rules.UNTIL.replace("T235959Z", "");
//           const newEndDate = `${until.slice(0, 4)}-${until.slice(4, 6)}-${until.slice(6, 8)}`;
//           if (newEndType !== endType || newEndDate !== endDate) {
//             setEndType(newEndType);
//             setEndDate(newEndDate);
//           }
//         }

//         if (rules.FREQ === "YEARLY" && rules.BYMONTH) {
//           const monthIndices = rules.BYMONTH.split(",").map((m) => parseInt(m));
//           const months = monthIndices
//             .map((index) => MONTHS[index - 1]?.id)
//             .filter((id) => id);
//           if (
//             months.length > 0 &&
//             JSON.stringify(months) !== JSON.stringify(yearlyMonths)
//           ) {
//             setYearlyMonths(months);
//           }
//           if (
//             months.length > 0 &&
//             JSON.stringify(months) !== JSON.stringify(yearlyWeekMonths)
//           ) {
//             setYearlyWeekMonths(months);
//           }
//         }

//         if (rules.FREQ === "YEARLY" && rules.BYMONTHDAY) {
//           const days = rules.BYMONTHDAY.split(",").filter((day) =>
//             DAYS.some((d) => d.id === day)
//           );
//           if (
//             days.length > 0 &&
//             JSON.stringify(days) !== JSON.stringify(yearlyDays)
//           ) {
//             setYearlyDays(days);
//           }
//         }

//         if (rules.FREQ === "YEARLY" && rules.BYDAY) {
//           const byDayRules = rules.BYDAY.split(",");
//           const weeks = [];
//           const weekDays = [];
//           byDayRules.forEach((rule) => {
//             const match = rule.match(/^([+-]?\d+)([A-Z]{2})$/);
//             if (match) {
//               const weekNum = parseInt(match[1]);
//               const week =
//                 weekNum === -1 ? "Last" : WEEK_OPTIONS[weekNum - 1]?.id;
//               const dayAbbrev = match[2];
//               const dayIndex = dayAbbrevs.indexOf(dayAbbrev);
//               const day = weekdays[dayIndex]?.id;
//               if (week && !weeks.includes(week)) weeks.push(week);
//               if (day && !weekDays.includes(day)) weekDays.push(day);
//             }
//           });
//           if (
//             weeks.length > 0 &&
//             JSON.stringify(weeks) !== JSON.stringify(yearlyWeeks)
//           ) {
//             setYearlyWeeks(weeks);
//           }
//           if (
//             weekDays.length > 0 &&
//             JSON.stringify(weekDays) !== JSON.stringify(yearlyWeekDays)
//           ) {
//             setYearlyWeekDays(weekDays);
//           }
//         }

//         if (rules.FREQ === "MONTHLY" && rules.BYMONTHDAY) {
//           const days = rules.BYMONTHDAY.split(",").filter((day) =>
//             DAYS.some((d) => d.id === day)
//           );
//           if (
//             days.length > 0 &&
//             JSON.stringify(days) !== JSON.stringify(monthlyDays)
//           ) {
//             setMonthlyDays(days);
//           }
//         }

//         if (rules.FREQ === "MONTHLY" && rules.BYDAY) {
//           const byDayRules = rules.BYDAY.split(",");
//           const weeks = [];
//           const weekDays = [];
//           byDayRules.forEach((rule) => {
//             const match = rule.match(/^([+-]?\d+)([A-Z]{2})$/);
//             if (match) {
//               const weekNum = parseInt(match[1]);
//               const week =
//                 weekNum === -1 ? "Last" : WEEK_OPTIONS[weekNum - 1]?.id;
//               const dayAbbrev = match[2];
//               const dayIndex = dayAbbrevs.indexOf(dayAbbrev);
//               const day = weekdays[dayIndex]?.id;
//               if (week && !weeks.includes(week)) weeks.push(week);
//               if (day && !weekDays.includes(day)) weekDays.push(day);
//             }
//           });
//           if (
//             weeks.length > 0 &&
//             JSON.stringify(weeks) !== JSON.stringify(monthlyWeeks)
//           ) {
//             setMonthlyWeeks(weeks);
//           }
//           if (
//             weekDays.length > 0 &&
//             JSON.stringify(weekDays) !== JSON.stringify(monthlyWeekDays)
//           ) {
//             setMonthlyWeekDays(weekDays);
//           }
//         }

//         if (rules.FREQ === "WEEKLY" && rules.BYDAY) {
//           const days = rules.BYDAY.split(",")
//             .map((dayAbbrev) => {
//               const dayIndex = dayAbbrevs.indexOf(dayAbbrev);
//               return weekdays[dayIndex]?.id;
//             })
//             .filter((id) => id);
//           if (
//             days.length > 0 &&
//             JSON.stringify(days) !== JSON.stringify(weeklyDays)
//           ) {
//             setWeeklyDays(days);
//           }
//         }
//       } catch (error) {
//         if (!defaultConfig.hideError) {
//           console.error("Error parsing RRule:", error);
//         }
//       }
//     },
//     [
//       repeatType,
//       interval,
//       endType,
//       endAfter,
//       endDate,
//       defaultConfig.hideError,
//       DAYS,
//       MONTHS,
//       WEEK_OPTIONS,
//       weekdays,
//       dayAbbrevs,
//       yearlyMonths,
//       yearlyDays,
//       yearlyWeeks,
//       yearlyWeekDays,
//       yearlyWeekMonths,
//       monthlyDays,
//       monthlyWeeks,
//       monthlyWeekDays,
//       weeklyDays,
//     ]
//   );

//   const generateRRule = useCallback(() => {
//     if (!repeatType) return "";
//     let rrule = `FREQ=${repeatType.toUpperCase()}`;

//     switch (repeatType) {
//       case "Yearly":
//         if (yearlyType === "on") {
//           const monthIndices = yearlyMonths
//             .map((m) => MONTHS.findIndex((month) => month.id === m) + 1)
//             .filter((index) => index > 0);
//           if (monthIndices.length === 0) return "";
//           rrule += `;BYMONTH=${monthIndices.join(",")}`;
//           if (yearlyDays.length > 0) {
//             rrule += `;BYMONTHDAY=${yearlyDays.join(",")}`;
//           }
//         } else {
//           const monthIndices = yearlyWeekMonths
//             .map((m) => MONTHS.findIndex((month) => month.id === m) + 1)
//             .filter((index) => index > 0);
//           if (monthIndices.length === 0) return "";
//           rrule += `;BYMONTH=${monthIndices.join(",")}`;
//           const dayRules = yearlyWeeks.flatMap((week) =>
//             yearlyWeekDays.map((day) => {
//               const weekdayIndex = weekdays.findIndex((w) => w.id === day);
//               let weekNum = WEEK_OPTIONS.findIndex((w) => w.id === week) + 1;
//               if (week === "Last") weekNum = -1;
//               const dayAbbrev =
//                 dayAbbrevs[
//                   defaultConfig.weekStartsOnSunday
//                     ? weekdayIndex
//                     : (weekdayIndex + 1) % 7
//                 ];
//               return `${weekNum}${dayAbbrev}`;
//             })
//           );
//           if (dayRules.length > 0) {
//             rrule += `;BYDAY=${dayRules.join(",")}`;
//           }
//         }
//         break;
//       case "Monthly":
//         if (monthlyType === "on") {
//           if (monthlyDays.length === 0) return "";
//           rrule += `;BYMONTHDAY=${monthlyDays.join(",")}`;
//         } else {
//           const dayRules = monthlyWeeks.flatMap((week) =>
//             monthlyWeekDays.map((day) => {
//               const weekdayIndex = weekdays.findIndex((w) => w.id === day);
//               let weekNum = WEEK_OPTIONS.findIndex((w) => w.id === week) + 1;
//               if (week === "Last") weekNum = -1;
//               const dayAbbrev =
//                 dayAbbrevs[
//                   defaultConfig.weekStartsOnSunday
//                     ? weekdayIndex
//                     : (weekdayIndex + 1) % 7
//                 ];
//               return `${weekNum}${dayAbbrev}`;
//             })
//           );
//           if (dayRules.length === 0) return "";
//           rrule += `;BYDAY=${dayRules.join(",")}`;
//         }
//         break;
//       case "Weekly":
//         if (weeklyDays.length === 0) return "";
//         const weeklyDayAbbrevs = weeklyDays.map((day) => {
//           const index = weekdays.findIndex((w) => w.id === day);
//           return dayAbbrevs[
//             defaultConfig.weekStartsOnSunday ? index : (index + 1) % 7
//           ];
//         });
//         rrule += `;BYDAY=${weeklyDayAbbrevs.join(",")}`;
//         break;
//       default:
//         break;
//     }

//     if (interval > 1) {
//       rrule += `;INTERVAL=${interval}`;
//     }

//     if (endType === "After") {
//       rrule += `;COUNT=${endAfter}`;
//     } else if (endType === "On date" && endDate) {
//       rrule += `;UNTIL=${endDate.replace(/-/g, "")}T235959Z`;
//     }

//     return rrule;
//   }, [
//     repeatType,
//     yearlyType,
//     yearlyMonths,
//     yearlyDays,
//     yearlyWeeks,
//     yearlyWeekDays,
//     yearlyWeekMonths,
//     monthlyType,
//     monthlyDays,
//     monthlyWeeks,
//     monthlyWeekDays,
//     weeklyDays,
//     interval,
//     endType,
//     endDate,
//     endAfter,
//     MONTHS,
//     WEEK_OPTIONS,
//     weekdays,
//     dayAbbrevs,
//     defaultConfig.weekStartsOnSunday,
//   ]);

//   useEffect(() => {
//     if (!isMounted.current || isInitialMount.current) return;
//     const newRRule = generateRRule();
//     onChange?.(newRRule);
//   }, [
//     generateRRule,
//     isMounted,
//     isInitialMount,
//     onChange,
//     startDate,
//     repeatType,
//     yearlyType,
//     yearlyMonths,
//     yearlyDays,
//     yearlyWeeks,
//     yearlyWeekDays,
//     yearlyWeekMonths,
//     monthlyType,
//     monthlyDays,
//     monthlyWeeks,
//     monthlyWeekDays,
//     weeklyDays,
//     interval,
//     endType,
//     endDate,
//     endAfter,
//   ]);

//   useEffect(() => {
//     if (!isMounted.current || !value) return;
//     const currentRRule = generateRRule();
//     if (value !== currentRRule) {
//       parseRRule(value);
//     }
//   }, [
//     value,
//     generateRRule,
//     isMounted,
//     parseRRule,
//     startDate,
//     repeatType,
//     yearlyType,
//     yearlyMonths,
//     yearlyDays,
//     yearlyWeeks,
//     yearlyWeekDays,
//     yearlyWeekMonths,
//     monthlyType,
//     monthlyDays,
//     monthlyWeeks,
//     monthlyWeekDays,
//     weeklyDays,
//     interval,
//     endType,
//     endDate,
//     endAfter,
//     MONTHS,
//     WEEK_OPTIONS,
//     weekdays,
//     dayAbbrevs,
//     defaultConfig.weekStartsOnSunday,
//   ]);

//   useEffect(() => {
//     if (!isMounted.current || isInitialMount.current) return;
//     if (previousRepeatType.current !== repeatType) {
//       if (repeatType === "Yearly") {
//         setYearlyType(defaultConfig.yearly === "on the" ? "onthe" : "on");
//         setYearlyMonths([]);
//         setYearlyDays([]);
//         setYearlyWeeks([]);
//         setYearlyWeekDays([]);
//         setYearlyWeekMonths([]);
//       } else if (repeatType === "Monthly") {
//         setMonthlyType(defaultConfig.monthly === "on the" ? "onthe" : "on");
//         setMonthlyDays([]);
//         setMonthlyWeeks([]);
//         setMonthlyWeekDays([]);
//       } else if (repeatType === "Weekly") {
//         setWeeklyDays([]);
//       }
//       previousRepeatType.current = repeatType;
//     }
//   }, [
//     repeatType,
//     defaultConfig.yearly,
//     defaultConfig.monthly,
//     isMounted,
//     isInitialMount,
//   ]);

//   const formatRecipientsForDisplay = useCallback(
//     (recipients) => {
//       if (!recipients || recipients.length === 0) return "None";
//       return recipients
//         .map((recipient) => {
//           if (recipient.customEmails && Array.isArray(recipient.customEmails)) {
//             return recipient.customEmails.join(", ");
//           } else if (recipient.attributeId) {
//             const fieldOption = fieldOptions.find(
//               (opt) => opt.attributeId === recipient.attributeId
//             );
//             return fieldOption ? fieldOption.label : recipient.attributeId;
//           }
//           return "Unknown";
//         })
//         .join(", ");
//     },
//     [fieldOptions]
//   );

//   const formatTargetEntityForDisplay = useCallback(
//     (targetEntity) => {
//       if (!targetEntity) return "None";
//       if (
//         targetEntity.customEmails &&
//         Array.isArray(targetEntity.customEmails) &&
//         targetEntity.customEmails.length > 0
//       ) {
//         return targetEntity.customEmails.join(", ");
//       } else if (targetEntity.attributeId) {
//         const fieldOption = fieldOptions.find(
//           (opt) => opt.attributeId === targetEntity.attributeId
//         );
//         return fieldOption ? fieldOption.label : targetEntity.attributeId;
//       }
//       return "Unknown";
//     },
//     [fieldOptions]
//   );

//   const formatRecurrenceDetails = useCallback(
//     (data) => {
//       if (!data.frequency) return "Not set";
//       let details =
//         data.frequency.charAt(0).toUpperCase() + data.frequency.slice(1);
//       if (data.interval && data.interval > 1) {
//         details += ` (every ${data.interval} `;
//         details +=
//           data.frequency === "weekly"
//             ? "weeks"
//             : data.frequency === "monthly"
//               ? "months"
//               : data.frequency === "yearly"
//                 ? "years"
//                 : "";
//         details += ")";
//       }
//       if (
//         data.frequency === "yearly" &&
//         data.monthOfYear &&
//         data.monthOfYear.length > 0
//       ) {
//         const months = data.monthOfYear
//           .map((m) => MONTHS[m - 1]?.label)
//           .filter((m) => m)
//           .join(", ");
//         details += ` in ${months}`;
//         if (data.dayOfMonth && data.dayOfMonth.length > 0) {
//           details += ` on day(s) ${data.dayOfMonth.join(", ")}`;
//         } else if (data.weekOfMonth && data.daysOfWeek) {
//           const weeks = data.weekOfMonth
//             .map((w) => (w === -1 ? "Last" : WEEK_OPTIONS[w - 1]?.label))
//             .filter((w) => w)
//             .join(", ");
//           const days = data.daysOfWeek
//             .map((d) => {
//               const uiIndex = mapBackendDayToUiIndex(d);
//               return weekdays[uiIndex]?.label;
//             })
//             .filter((d) => d)
//             .join(", ");
//           details += ` on the ${weeks} ${days}`;
//         }
//       }
//       if (
//         data.frequency === "monthly" &&
//         data.dayOfMonth &&
//         data.dayOfMonth.length > 0
//       ) {
//         details += ` on day(s) ${data.dayOfMonth.join(", ")}`;
//       } else if (
//         data.frequency === "monthly" &&
//         data.weekOfMonth &&
//         data.daysOfWeek
//       ) {
//         const weeks = data.weekOfMonth
//           .map((w) => (w === -1 ? "Last" : WEEK_OPTIONS[w - 1]?.label))
//           .filter((w) => w)
//           .join(", ");
//         const days = data.daysOfWeek
//           .map((d) => {
//             const uiIndex = mapBackendDayToUiIndex(d);
//             return weekdays[uiIndex]?.label;
//           })
//           .filter((d) => d)
//           .join(", ");
//         details += ` on the ${weeks} ${days}`;
//       }
//       if (
//         data.frequency === "weekly" &&
//         data.daysOfWeek &&
//         data.daysOfWeek.length > 0
//       ) {
//         const days = data.daysOfWeek
//           .map((d) => {
//             const uiIndex = mapBackendDayToUiIndex(d);
//             return weekdays[uiIndex]?.label;
//           })
//           .filter((d) => d)
//           .join(", ");
//         details += ` on ${days}`;
//       }
//       return details;
//     },
//     [MONTHS, WEEK_OPTIONS, weekdays, mapBackendDayToUiIndex]
//   );

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
//         return date ? new Date(date).toLocaleDateString() : "Not set";
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
//           <Tooltip title="Edit Reminder" placement="top">
//             <IconButton
//               color="primary"
//               aria-label="edit reminder"
//               onClick={() => handleEditReminder(params.row)}
//             >
//               <EditIcon />
//             </IconButton>
//           </Tooltip>
//           <Tooltip title="View Reminder" placement="top">
//             <IconButton
//               color="primary"
//               aria-label="view reminder"
//               onClick={() => handleViewReminder(params.row)}
//             >
//               <VisibilityIcon />
//             </IconButton>
//           </Tooltip>
//           <Tooltip title="Delete Reminder" placement="top">
//             <IconButton
//               color="error"
//               aria-label="delete reminder"
//               onClick={() => handleDeleteReminder(params.row._id)}
//             >
//               <GridDeleteIcon />
//             </IconButton>
//           </Tooltip>
//         </Box>
//       ),
//     },
//   ];

//   return (
//     <Box sx={{ padding: STYLE_GUIDE.SPACING.s4 }}>
//       <LocalizationProvider dateAdapter={AdapterDayjs}>
//         <Box sx={styles.formRow}>
//           <FormControl>
//             <FormLabel
//               sx={{
//                 fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
//                 color: STYLE_GUIDE.COLORS.textDarkGray,
//                 fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                 marginBottom: STYLE_GUIDE.SPACING.s2,
//               }}
//             >
//               Start Date
//             </FormLabel>
//             <TextField
//               size="small"
//               type="date"
//               value={startDate}
//               onChange={(e) => {
//                 setStartDate(e.target.value);
//                 if (errors.startDate) {
//                   setErrors(prev => ({...prev, startDate: ""}));
//                 }
//               }}
//               sx={styles.textField}
//               variant="outlined"
//               aria-label="Select start date"
//               error={!!errors.startDate}
//             />
//             {errors.startDate && (
//               <FormHelperText error>{errors.startDate}</FormHelperText>
//             )}
//           </FormControl>

//           <FormControl>
//             <FormLabel
//               sx={{
//                 fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
//                 color: STYLE_GUIDE.COLORS.textDarkGray,
//                 fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                 marginBottom: STYLE_GUIDE.SPACING.s2,
//               }}
//             >
//               Select Frequency
//             </FormLabel>
//             <Select
//               size="small"
//               aria-placeholder="select"
//               value={repeatType}
//               onChange={(e) => {
//                 setRepeatType(e.target.value);
//                 if (errors.frequency) {
//                   setErrors(prev => ({...prev, frequency: ""}));
//                 }
//               }}
//               sx={styles.select}
//               variant="outlined"
//               displayEmpty
//               aria-label="Select repeat frequency"
//               error={!!errors.frequency}
//             >
//               <MenuItem value="" disabled>
//                 Select Frequency
//               </MenuItem>
//               {defaultConfig.repeat.map((option) => (
//                 <MenuItem key={option} value={option}>
//                   {option}
//                 </MenuItem>
//               ))}
//             </Select>
//             {errors.frequency && (
//               <FormHelperText error>{errors.frequency}</FormHelperText>
//             )}
//           </FormControl>

//           <FormControl>
//             <FormLabel
//               sx={{
//                 fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
//                 color: STYLE_GUIDE.COLORS.textDarkGray,
//                 fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                 marginBottom: STYLE_GUIDE.SPACING.s2,
//               }}
//             >
//               Time (Optional)
//             </FormLabel>
//             <TimePicker
//               value={time ? dayjs(time, "hh:mm A") : null}
//               onChange={(newValue) => {
//                 if (newValue) {
//                   setTime(newValue.format("hh:mm A"));
//                 } else {
//                   setTime("");
//                 }
//               }}
//               format="hh:mm a"
//               slotProps={{
//                 actionBar: {
//                   actions: [],
//                 },
//                 textField: {
//                   size: "small",
//                   variant: "outlined",
//                   inputProps: {
//                     "aria-required": "false",
//                   },
//                   "aria-label": "Select time for reminder",
//                 },
//               }}
//             />
//           </FormControl>
//         </Box>
//       </LocalizationProvider>

//       <Box sx={{ marginBottom: STYLE_GUIDE.SPACING.s6 }}>
//         {repeatType === "Yearly" && (
//           <Box>
//             <FormControl component="fieldset">
//               <RadioGroup
//                 row
//                 name="yearlyType"
//                 value={yearlyType}
//                 onChange={handleYearlyTypeChange}
//                 sx={{ marginBottom: STYLE_GUIDE.SPACING.s3 }}
//               >
//                 <Box
//                   sx={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: STYLE_GUIDE.SPACING.s3,
//                   }}
//                 >
//                   <FormControlLabel
//                     value="on"
//                     control={<Radio sx={styles.radio} />}
//                     label="on"
//                     sx={{
//                       fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                       color: STYLE_GUIDE.COLORS.textDarkGray,
//                     }}
//                   />
//                   <Autocomplete
//                     multiple
//                     size="small"
//                     id="yearly-month-autocomplete"
//                     options={MONTHS}
//                     getOptionLabel={(option) => option.label}
//                     isOptionEqualToValue={(option, value) =>
//                       option.id === value.id
//                     }
//                     value={MONTHS.filter((m) => yearlyMonths.includes(m.id))}
//                     onChange={(event, newValue) =>
//                       setYearlyMonths(
//                         newValue.length > 3
//                           ? newValue.slice(0, 3).map((v) => v.id)
//                           : newValue.map((v) => v.id)
//                       )
//                     }
//                     disabled={yearlyType !== "on"}
//                     renderInput={(params) => (
//                       <TextField
//                         {...params}
//                         variant="outlined"
//                         label="Months"
//                         sx={styles.textField}
//                         aria-label="Select up to 3 months for yearly recurrence"
//                       />
//                     )}
//                   />
//                   <Autocomplete
//                     multiple
//                     size="small"
//                     id="yearly-day-autocomplete"
//                     options={DAYS}
//                     getOptionLabel={(option) => option.label}
//                     isOptionEqualToValue={(option, value) =>
//                       option.id === value.id
//                     }
//                     value={DAYS.filter((d) => yearlyDays.includes(d.id))}
//                     onChange={(event, newValue) => {
//                       setYearlyDays(
//                         newValue.length > 3
//                           ? newValue.slice(0, 3).map((v) => v.id)
//                           : newValue.map((v) => v.id)
//                       );
//                       if (errors.yearlyDays) {
//                         setErrors(prev => ({...prev, yearlyDays: ""}));
//                       }
//                     }}
//                     disabled={yearlyType !== "on"}
//                     renderInput={(params) => (
//                       <TextField
//                         {...params}
//                         variant="outlined"
//                         label="Days"
//                         sx={styles.textField}
//                         aria-label="Select up to 3 days for yearly recurrence"
//                       />
//                     )}
//                   />
//                 </Box>
//               </RadioGroup>

//               <RadioGroup
//                 row
//                 name="yearlyType"
//                 value={yearlyType}
//                 onChange={handleYearlyTypeChange}
//                 sx={{ marginBottom: STYLE_GUIDE.SPACING.s3 }}
//               >
//                 <Box
//                   sx={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: STYLE_GUIDE.SPACING.s3,
//                   }}
//                 >
//                   <FormControlLabel
//                     value="onthe"
//                     control={<Radio sx={styles.radio} />}
//                     label="on the "
//                     sx={{
//                       fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                       color: STYLE_GUIDE.COLORS.textDarkGray,
//                     }}
//                   />
//                   <Autocomplete
//                     multiple
//                     size="small"
//                     id="yearly-week-autocomplete"
//                     options={WEEK_OPTIONS}
//                     getOptionLabel={(option) => option.label}
//                     isOptionEqualToValue={(option, value) =>
//                       option.id === value.id
//                     }
//                     value={WEEK_OPTIONS.filter((w) =>
//                       yearlyWeeks.includes(w.id)
//                     )}
//                     onChange={(event, newValue) => {
//                       setYearlyWeeks(
//                         newValue.length > 3
//                           ? newValue.slice(0, 3).map((v) => v.id)
//                           : newValue.map((v) => v.id)
//                       );
//                       if (errors.yearlyDays) {
//                         setErrors(prev => ({...prev, yearlyDays: ""}));
//                       }
//                     }}
//                     disabled={yearlyType !== "onthe"}
//                     renderInput={(params) => (
//                       <TextField
//                         {...params}
//                         variant="outlined"
//                         label="Weeks"
//                         sx={styles.textField}
//                         aria-label="Select up to 3 weeks for yearly recurrence"
//                       />
//                     )}
//                   />
//                   <Autocomplete
//                     multiple
//                     size="small"
//                     id="yearly-weekday-autocomplete"
//                     options={weekdays}
//                     getOptionLabel={(option) => option.label}
//                     isOptionEqualToValue={(option, value) =>
//                       option.id === value.id
//                     }
//                     value={weekdays.filter((d) =>
//                       yearlyWeekDays.includes(d.id)
//                     )}
//                     onChange={(event, newValue) => {
//                       setYearlyWeekDays(
//                         newValue.length > 3
//                           ? newValue.slice(0, 3).map((v) => v.id)
//                           : newValue.map((v) => v.id)
//                       );
//                       if (errors.yearlyDays) {
//                         setErrors(prev => ({...prev, yearlyDays: ""}));
//                       }
//                     }}
//                     disabled={yearlyType !== "onthe"}
//                     renderInput={(params) => (
//                       <TextField
//                         {...params}
//                         variant="outlined"
//                         label="Weekdays"
//                         sx={styles.textField}
//                         aria-label="Select up to 3 weekdays for yearly recurrence"
//                       />
//                     )}
//                   />
//                   <Typography component="span">of</Typography>
//                   <Autocomplete
//                     multiple
//                     size="small"
//                     id="yearly-week-month-autocomplete"
//                     options={MONTHS}
//                     getOptionLabel={(option) => option.label}
//                     isOptionEqualToValue={(option, value) =>
//                       option.id === value.id
//                     }
//                     value={MONTHS.filter((m) =>
//                       yearlyWeekMonths.includes(m.id)
//                     )}
//                     onChange={(event, newValue) => {
//                       setYearlyWeekMonths(
//                         newValue.length > 3
//                           ? newValue.slice(0, 3).map((v) => v.id)
//                           : newValue.map((v) => v.id)
//                       );
//                       if (errors.yearlyDays) {
//                         setErrors(prev => ({...prev, yearlyDays: ""}));
//                       }
//                     }}
//                     disabled={yearlyType !== "onthe"}
//                     renderInput={(params) => (
//                       <TextField
//                         {...params}
//                         variant="outlined"
//                         label="Months"
//                         sx={styles.textField}
//                         aria-label="Select up to 3 months for yearly recurrence week"
//                       />
//                     )}
//                   />
//                 </Box>
//               </RadioGroup>
//             </FormControl>

//             {errors.yearlyDays && (
//               <FormHelperText error sx={{mt: 1}}>
//                 {errors.yearlyDays}
//               </FormHelperText>
//             )}
//           </Box>
//         )}

//         {repeatType === "Monthly" && (
//           <Box>
//             <FormControl component="fieldset">
//               <FormLabel
//                 component="legend"
//                 sx={{
//                   fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
//                   color: STYLE_GUIDE.COLORS.textDarkGray,
//                   fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                   marginBottom: STYLE_GUIDE.SPACING.s2,
//                 }}
//               >
//                 Monthly Recurrence
//               </FormLabel>

//               <RadioGroup
//                 row
//                 name="monthlyType"
//                 value={monthlyType}
//                 onChange={handleMonthlyTypeChange}
//                 sx={{ marginBottom: STYLE_GUIDE.SPACING.s3 }}
//               >
//                 <Box
//                   sx={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: STYLE_GUIDE.SPACING.s3,
//                   }}
//                 >
//                   <FormControlLabel
//                     value="on"
//                     control={<Radio sx={styles.radio} />}
//                     label="on"
//                     sx={{
//                       fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                       color: STYLE_GUIDE.COLORS.textDarkGray,
//                     }}
//                   />
//                   <Autocomplete
//                     multiple
//                     id="monthly-days"
//                     size="small"
//                     options={DAYS}
//                     getOptionLabel={(option) => option.label}
//                     isOptionEqualToValue={(option, value) =>
//                       option.id === value.id
//                     }
//                     value={DAYS.filter((day) => monthlyDays.includes(day.id))}
//                     onChange={(event, newValue) => {
//                       setMonthlyDays(newValue.map((v) => v.id));
//                       if (errors.monthlyDays) {
//                         setErrors(prev => ({...prev, monthlyDays: ""}));
//                       }
//                     }}
//                     disabled={monthlyType !== "on"}
//                     renderInput={(params) => (
//                       <TextField
//                         {...params}
//                         variant="outlined"
//                         label="Days"
//                         sx={styles.textField}
//                         aria-label="Select days for monthly recurrence"
//                       />
//                     )}
//                   />
//                 </Box>
//               </RadioGroup>

//               <RadioGroup
//                 row
//                 name="monthlyType"
//                 value={monthlyType}
//                 onChange={handleMonthlyTypeChange}
//                 sx={{ marginBottom: STYLE_GUIDE.SPACING.s3 }}
//               >
//                 <Box
//                   sx={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: STYLE_GUIDE.SPACING.s3,
//                   }}
//                 >
//                   <FormControlLabel
//                     value="onthe"
//                     control={<Radio sx={styles.radio} />}
//                     label="on the "
//                     sx={{
//                       fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                       color: STYLE_GUIDE.COLORS.textDarkGray,
//                     }}
//                   />
//                   <Autocomplete
//                     multiple
//                     size="small"
//                     id="monthly-weeks"
//                     options={WEEK_OPTIONS}
//                     getOptionLabel={(option) => option.label}
//                     isOptionEqualToValue={(option, value) =>
//                       option.id === value.id
//                     }
//                     value={WEEK_OPTIONS.filter((week) =>
//                       monthlyWeeks.includes(week.id)
//                     )}
//                     onChange={(event, newValue) => {
//                       setMonthlyWeeks(newValue.map((v) => v.id));
//                       if (errors.monthlyDays) {
//                         setErrors(prev => ({...prev, monthlyDays: ""}));
//                       }
//                     }}
//                     disabled={monthlyType !== "onthe"}
//                     renderInput={(params) => (
//                       <TextField
//                         {...params}
//                         variant="outlined"
//                         label="Weeks"
//                         sx={styles.textField}
//                         aria-label="Select weeks for monthly recurrence"
//                       />
//                     )}
//                   />
//                   <Autocomplete
//                     multiple
//                     size="small"
//                     id="monthly-weekdays"
//                     options={weekdays}
//                     getOptionLabel={(option) => option.label.slice(0, 3)}
//                     isOptionEqualToValue={(option, value) =>
//                       option.id === value.id
//                     }
//                     value={weekdays.filter((day) =>
//                       monthlyWeekDays.includes(day.id)
//                     )}
//                     onChange={(event, newValue) => {
//                       setMonthlyWeekDays(newValue.map((v) => v.id));
//                       if (errors.monthlyDays) {
//                         setErrors(prev => ({...prev, monthlyDays: ""}));
//                       }
//                     }}
//                     disabled={monthlyType !== "onthe"}
//                     renderInput={(params) => (
//                       <TextField
//                         {...params}
//                         variant="outlined"
//                         label="Weekdays"
//                         sx={styles.textField}
//                         aria-label="Select weekdays for monthly recurrence"
//                       />
//                     )}
//                   />
//                 </Box>
//               </RadioGroup>
//             </FormControl>

//             {errors.monthlyDays && (
//               <FormHelperText error sx={{mt: 1}}>
//                 {errors.monthlyDays}
//               </FormHelperText>
//             )}
//           </Box>
//         )}

//         {repeatType === "Weekly" && (
//           <Box>
//             <FormControl component="fieldset">
//               <FormLabel
//                 sx={{
//                   marginBottom: STYLE_GUIDE.SPACING.s2,
//                   fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
//                   color: STYLE_GUIDE.COLORS.textDarkGray,
//                   fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                 }}
//               >
//                 Repeat on:
//               </FormLabel>
//               <Box
//                 sx={{
//                   display: "flex",
//                   flexWrap: "wrap",
//                   gap: STYLE_GUIDE.SPACING.s2,
//                 }}
//               >
//                 {weekdays.map((day) => (
//                   <Chip
//                     key={day.id}
//                     label={day.label.slice(0, 3)}
//                     onClick={() => handleWeeklyDayToggle(day.id)}
//                     sx={styles.chip(weeklyDays.includes(day.id))}
//                     aria-label={`Toggle ${day.label} for weekly recurrence`}
//                   />
//                 ))}
//               </Box>

//               {errors.weeklyDays && (
//                 <FormHelperText error sx={{mt: 1}}>
//                   {errors.weeklyDays}
//                 </FormHelperText>
//               )}
//             </FormControl>
//           </Box>
//         )}
//       </Box>

//       <Box sx={styles.formRow}>
//         {repeatType !== "Daily" && (
//           <>
//             <FormControl>
//               <FormLabel
//                 sx={{
//                   fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
//                   color: STYLE_GUIDE.COLORS.textDarkGray,
//                   fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                   marginBottom: STYLE_GUIDE.SPACING.s2,
//                 }}
//               >
//                 Every
//               </FormLabel>
//               <TextField
//                 size="small"
//                 type="number"
//                 value={interval}
//                 onChange={(e) => {
//                   const value = Math.max(1, parseInt(e.target.value) || 1);
//                   setInterval(value);
//                   if (errors.interval) {
//                     setErrors(prev => ({...prev, interval: ""}));
//                   }
//                 }}
//                 inputProps={{ min: 1 }}
//                 sx={{ ...styles.textField, width: "80px" }}
//                 variant="outlined"
//                 aria-label="Set repeat interval"
//                 error={!!errors.interval}
//               />
//               {errors.interval && (
//                 <FormHelperText error>{errors.interval}</FormHelperText>
//               )}
//             </FormControl>

//             <Typography
//               component="span"
//               sx={{
//                 fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                 color: STYLE_GUIDE.COLORS.textDarkGray,
//                 alignSelf: "center",
//                 marginTop: "24px",
//               }}
//             >
//               {repeatType === "Weekly"
//                 ? "week(s)"
//                 : repeatType === "Monthly"
//                 ? "month(s)"
//                 : repeatType === "Yearly"
//                 ? "year(s)"
//                 : ""}{" "}
//               {interval > 1 ? "s" : ""}
//             </Typography>
//           </>
//         )}

//         <FormControl>
//           <FormLabel
//             sx={{
//               marginBottom: STYLE_GUIDE.SPACING.s2,
//               fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
//               color: STYLE_GUIDE.COLORS.textDarkGray,
//               fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//             }}
//           >
//             End
//           </FormLabel>
//           <Select
//             size="small"
//             value={endType}
//             onChange={(e) => setEndType(e.target.value)}
//             sx={styles.select}
//             variant="outlined"
//             displayEmpty
//             aria-label="Select end condition"
//           >
//             <MenuItem value="" disabled>
//               Select
//             </MenuItem>
//             {defaultConfig.end.map((option) => (
//               <MenuItem key={option} value={option}>
//                 {option}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>

//         {endType === "After" && (
//           <FormControl>
//             <FormLabel
//               sx={{
//                 marginBottom: STYLE_GUIDE.SPACING.s2,
//                 fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
//                 color: STYLE_GUIDE.COLORS.textDarkGray,
//                 fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//               }}
//             >
//               Occurrences
//             </FormLabel>
//             <TextField
//               size="small"
//               type="number"
//               value={endAfter}
//               onChange={(e) =>
//                 setEndAfter(Math.max(1, parseInt(e.target.value) || 1))
//               }
//               inputProps={{ min: 1 }}
//               sx={{ ...styles.textField, width: "100px" }}
//               variant="outlined"
//               aria-label="Set number of occurrences"
//             />
//           </FormControl>
//         )}

//         {endType === "On date" && (
//           <FormControl>
//             <FormLabel
//               sx={{
//                 marginBottom: STYLE_GUIDE.SPACING.s2,
//                 fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
//                 color: STYLE_GUIDE.COLORS.textDarkGray,
//                 fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//               }}
//             >
//               End Date
//             </FormLabel>
//             <TextField
//               size="small"
//               type="date"
//               value={endDate}
//               onChange={(e) => {
//                 setEndDate(e.target.value);
//                 if (errors.endDate) {
//                   setErrors(prev => ({...prev, endDate: ""}));
//                 }
//               }}
//               sx={{ ...styles.textField, width: "150px" }}
//               variant="outlined"
//               aria-label="Select end date"
//               error={!!errors.endDate}
//             />
//             {errors.endDate && (
//               <FormHelperText error>{errors.endDate}</FormHelperText>
//             )}
//           </FormControl>
//         )}
//       </Box>

//       <Box
//         component="hr"
//         sx={{
//           margin: `${STYLE_GUIDE.SPACING.s6} 0`,
//           border: "none",
//           borderTop: `1px solid ${STYLE_GUIDE.COLORS.divider}`,
//         }}
//       />

//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "flex-start",
//           gap: STYLE_GUIDE.SPACING.s2,
//           marginBottom: STYLE_GUIDE.SPACING.s4,
//           "@media (max-width: 1100px)": {
//             flexDirection: "column",
//             alignItems: "stretch",
//           },
//         }}
//       >
//         <Box sx={{ flex: 0.6, minWidth: "120px" }}>
//           <FormControl fullWidth size="small">
//             <Autocomplete
//               freeSolo
//               size="small"
//               id="target-entity-autocomplete"
//               options={fieldOptions.filter((option) => option.type === "email")}
//               getOptionLabel={(option) =>
//                 typeof option === "string" ? option : option.label
//               }
//               isOptionEqualToValue={(option, value) => {
//                 if (typeof option === "string" && typeof value === "string") {
//                   return option === value;
//                 }
//                 if (typeof option !== "string" && typeof value !== "string") {
//                   return option.attributeId === value.attributeId;
//                 }
//                 return false;
//               }}
//               value={targetEntity}
//               onChange={(event, newValue) => {
//                 setTargetEntity(newValue);
//               }}
//               renderInput={(params) => (
//                 <TextField
//                   {...params}
//                   variant="outlined"
//                   label="Target Entity"
//                   placeholder="Type or select"
//                 />
//               )}
//             />
//           </FormControl>
//         </Box>

//         <Box sx={{ flex: 0.6, minWidth: "120px" }}>
//           <FormControl fullWidth size="small">
//             <Autocomplete
//               multiple
//               freeSolo
//               size="small"
//               id="to-recipients-autocomplete"
//               options={fieldOptions.filter((option) => option.type === "email")}
//               getOptionLabel={(option) =>
//                 typeof option === "string" ? option : option.label
//               }
//               isOptionEqualToValue={(option, value) => {
//                 if (typeof option === "string" && typeof value === "string") {
//                   return option === value;
//                 }
//                 if (typeof option !== "string" && typeof value !== "string") {
//                   return option.attributeId === value.attributeId;
//                 }
//                 return false;
//               }}
//               value={toRecipients}
//               onChange={(event, newValue) => {
//                 setToRecipients(newValue);
//               }}
//               renderInput={(params) => (
//                 <TextField
//                   {...params}
//                   variant="outlined"
//                   label="TO Recipients"
//                   placeholder="Type or select"
//                 />
//               )}
//               renderTags={(value, getTagProps) =>
//                 value.map((option, index) => (
//                   <Chip
//                     key={
//                       typeof option === "string" ? option : option.attributeId
//                     }
//                     label={typeof option === "string" ? option : option.label}
//                     {...getTagProps({ index })}
//                     size="small"
//                   />
//                 ))
//               }
//             />
//           </FormControl>
//         </Box>

//         <Box sx={{ flex: 0.6, minWidth: "120px" }}>
//           <FormControl fullWidth size="small">
//             <Autocomplete
//               multiple
//               freeSolo
//               size="small"
//               id="cc-recipients-autocomplete"
//               options={fieldOptions.filter((option) => option.type === "email")}
//               getOptionLabel={(option) =>
//                 typeof option === "string" ? option : option.label
//               }
//               isOptionEqualToValue={(option, value) => {
//                 if (typeof option === "string" && typeof value === "string") {
//                   return option === value;
//                 }
//                 if (typeof option !== "string" && typeof value !== "string") {
//                   return option.attributeId === value.attributeId;
//                 }
//                 return false;
//               }}
//               value={ccRecipients}
//               onChange={(event, newValue) => {
//                 setCcRecipients(newValue);
//               }}
//               renderInput={(params) => (
//                 <TextField
//                   {...params}
//                   variant="outlined"
//                   label="CC Recipients"
//                   placeholder="Type or select"
//                 />
//               )}
//               renderTags={(value, getTagProps) =>
//                 value.map((option, index) => (
//                   <Chip
//                     key={
//                       typeof option === "string" ? option : option.attributeId
//                     }
//                     label={typeof option === "string" ? option : option.label}
//                     {...getTagProps({ index })}
//                     size="small"
//                   />
//                 ))
//               }
//             />
//           </FormControl>
//         </Box>

//         {/* Template Section */}
//         <Box sx={{ flex: 0.6, minWidth: "120px" }}>
//           <FormControl size="small" fullWidth>
//             <InputLabel>Template</InputLabel>
//             <Select
//               value={template}
//               onChange={(e) => {
//                 setTemplate(e.target.value);
//                 if (errors.template) {
//                   setErrors(prev => ({...prev, template: ""}));
//                 }
//               }}
//               label="Template"
//               aria-label="Select template"
//               error={!!errors.template}
//             >
//               <MenuItem value="">Select Template...</MenuItem>
//               {templateList.data?.data?.map((option) => (
//                 <MenuItem key={option._id} value={option._id}>
//                   {option.name}
//                 </MenuItem>
//               ))}
//             </Select>
//             {errors.template && (
//               <FormHelperText error>{errors.template}</FormHelperText>
//             )}
//           </FormControl>
//         </Box>

//         {/* Notification Method Section */}
//         <Box sx={{ flex: 0.5, minWidth: "120px" }}>
//           <FormControl size="small" fullWidth>
//             <InputLabel>Method</InputLabel>
//             <Select
//               value={method}
//               onChange={(e) => {
//                 setMethod(e.target.value);
//                 if (errors.method) {
//                   setErrors(prev => ({...prev, method: ""}));
//                 }
//               }}
//               label="Method"
//               renderValue={(selected) =>
//                 mediumList.data?.data?.find((medium) => medium._id === selected)
//                   ?.medium || selected
//               }
//               aria-label="Select notification method"
//               error={!!errors.method}
//             >
//               <MenuItem value="">Select Method...</MenuItem>
//               {mediumList.data?.data?.map((option) => (
//                 <MenuItem key={option._id} value={option._id}>
//                   {option.medium}
//                 </MenuItem>
//               ))}
//             </Select>
//             {errors.method && (
//               <FormHelperText error>{errors.method}</FormHelperText>
//             )}
//           </FormControl>
//         </Box>

//         {/* Acknowledge Checkbox */}
//         <Box
//           sx={{
//             flex: 0.6,
//             minWidth: "100px",
//             display: "flex",
//             alignItems: "center",
//           }}
//         >
//           <FormControlLabel
//             control={
//               <Checkbox
//                 checked={acknowledgeChecked}
//                 onChange={(e) => setAcknowledgeChecked(e.target.checked)}
//                 color="primary"
//               />
//             }
//             label="Acknowledge"
//             sx={{
//               fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//               color: STYLE_GUIDE.COLORS.textDarkGray,
//             }}
//           />
//         </Box>

//         {/* Attached Checkbox */}
//         <Box
//           sx={{
//             flex: 0.6,
//             minWidth: "90px",
//             display: "flex",
//             alignItems: "center",
//           }}
//         >
//           <FormControlLabel
//             control={
//               <Checkbox
//                 checked={attachedChecked}
//                 onChange={(e) => setAttachedChecked(e.target.checked)}
//                 color="primary"
//               />
//             }
//             label="Attached"
//             sx={{
//               fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//               color: STYLE_GUIDE.COLORS.textDarkGray,
//             }}
//           />
//         </Box>
//       </Box>

//       {/* Action Buttons */}
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "flex-end",
//           gap: STYLE_GUIDE.SPACING.s2,
//           marginBottom: STYLE_GUIDE.SPACING.s4,
//         }}
//       >
//         {editMode && (
//           <Button
//             variant="outlined"
//             color="primary"
//             onClick={handleCancelEdit}
//             aria-label="Cancel editing reminder"
//           >
//             Cancel
//           </Button>
//         )}
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={handleAddReminder}
//           aria-label={
//             editMode
//               ? "Save changes to reminder"
//               : "Add reminder with current settings"
//           }
//           disabled={notificationTypeId === null}
//         >
//           {editMode ? "Update Reminder" : "Add Reminder"}
//         </Button>
//       </Box>

//       <Box
//         component="hr"
//         sx={{
//           margin: `${STYLE_GUIDE.SPACING.s6} 0`,
//           border: "none",
//           borderTop: `1px solid ${STYLE_GUIDE.COLORS.divider}`,
//         }}
//       />

//       {/* Reminders List - Data Grid */}
//       {frequencyListData?.data?.length > 0 && (
//         <Box sx={styles.reminderContainer}>
//           <Typography
//             variant="h6"
//             sx={{
//               marginBottom: STYLE_GUIDE.SPACING.s3,
//               color: STYLE_GUIDE.COLORS.primaryDark,
//               fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
//             }}
//           >
//             Added Reminders:
//           </Typography>
//           <Box sx={styles.dataGridContainer}>
//             <DataGrid
//               rows={frequencyListData?.data || []}
//               columns={columns}
//               getRowId={(row) => row._id}
//               autoHeight
//               disableColumnMenu
//               disableRowSelectionOnClick
//               hideFooterPagination
//               hideFooterSelectedRowCount
//             />
//           </Box>
//         </Box>
//       )}

//       {/* Delete Confirmation Dialog */}
//       <Dialog
//         open={openDialog}
//         onClose={handleCloseDialog}
//         sx={{
//           "& .MuiDialog-paper": {
//             borderRadius: "8px",
//           },
//         }}
//       >
//         <DialogTitle>Confirm Delete</DialogTitle>
//         <DialogContent>
//           <Typography>Are you sure you want to delete this?</Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDialog} sx={{ borderRadius: "8px" }}>
//             No
//           </Button>
//           <Button
//             onClick={handleConfirmDelete}
//             color="error"
//             sx={{ borderRadius: "8px" }}
//             disabled={deleteFrequency.isLoading}
//           >
//             Yes
//           </Button>
//         </DialogActions>

//       </Dialog>

//       {/* View Reminder Dialog - Using the new component */}
//       <ViewReminderDialog
//         open={openViewDialog}
//         onClose={handleCloseViewDialog}
//         viewingReminderData={viewingReminderData}
//         formatRecurrenceDetails={formatRecurrenceDetails}
//         formatTargetEntityForDisplay={formatTargetEntityForDisplay}
//         formatRecipientsForDisplay={formatRecipientsForDisplay}
//       />

//       {/* Snackbar for notifications */}
//       {snackbar.open && (
//         <Alert
//           severity={snackbar.severity}
//           onClose={() => setSnackbar({ ...snackbar, open: false })}
//           sx={{ position: "fixed", top: 20, right: 20, zIndex: 9999 }}
//         >
//           {snackbar.message}
//         </Alert>
//       )}
//     </Box>
//   );
// };

// const SimpleRender = ({ fieldOptions, notificationTypeId }) => (
//   <RRuleGenerator
//     fieldOptions={fieldOptions}
//     notificationTypeId={notificationTypeId}
//   />
// );

// const Frequency = ({ fieldOptions, notificationTypeId }) => {
//   return (
//     <Box>
//       <SimpleRender
//         fieldOptions={fieldOptions}
//         notificationTypeId={notificationTypeId}
//       />
//     </Box>
//   );
// };

// export default Frequency;

// import React, { useState } from "react";
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
//   Radio,
//   RadioGroup,
//   TextField,
//   Select,
//   MenuItem,
//   FormControl,
//   IconButton,
//   Grid,
//   Chip,
//   InputLabel,
//   Autocomplete,
//   List,
//   ListItem,
//   ListItemText,
//   ListItemSecondaryAction,
// } from "@mui/material";
// import {
//   Close as CloseIcon,
//   AccessTime as AccessTimeIcon,
//   ExpandMore as ExpandMoreIcon,
//   ChevronLeft,
//   ChevronRight,
//   Add as AddIcon,
//   Delete as DeleteIcon,
// } from "@mui/icons-material";
// import { TimePicker } from "@mui/x-date-pickers/TimePicker";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import dayjs from "dayjs";
// import useGet from "../../hooks/useGet";
// import { GET } from "../../services/apiRoutes";

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

// export default function Frequency({ fieldOptions }) {
//   console.log("fieldOptions:", fieldOptions);
//   const [open, setOpen] = useState(false);
//   const [allDay, setAllDay] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(new Date(2025, 8, 2));
//   const [selectedTime, setSelectedTime] = useState("4:00 PM");
//   const [repeatOption, setRepeatOption] = useState("Does not repeat");
//   const [customRecurrenceOpen, setCustomRecurrenceOpen] = useState(false);

//   // New state variables for additional fields
//   const [template, setTemplate] = useState("");
//   const [method, setMethod] = useState("");
//   const [ackRequired, setAckRequired] = useState(false);
//   const [attachmentRequired, setAttachmentRequired] = useState(false);
//   const [toRecipients, setToRecipients] = useState([]);
//   const [ccRecipients, setCcRecipients] = useState([]);
//   const [targetEntity, setTargetEntity] = useState("");

//   // New state for custom dates and times
//   const [customDateTimes, setCustomDateTimes] = useState([]);
//   const [customDateTimePickerOpen, setCustomDateTimePickerOpen] = useState(false);
//   const [currentCustomDate, setCurrentCustomDate] = useState(new Date());
//   const [currentCustomTime, setCurrentCustomTime] = useState(dayjs().format("hh:mm A"));
//   const [customCalendarDate, setCustomCalendarDate] = useState(new Date());

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
//             attributeId: recipient.attributeId
//           };

//           if (recipient.refAttributeId && Array.isArray(recipient.refAttributeId) && recipient.refAttributeId.length > 0) {
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

//   /* ---- date-picker ---- */
//   const [datePickerOpen, setDatePickerOpen] = useState(false);
//   const [calendarDate, setCalendarDate] = useState(new Date(2025, 8, 1));

//   /* ---- time-picker ---- */
//   const [timePickerOpen, setTimePickerOpen] = useState(false);

//   /* ---- repeat-dropdown ---- */
//   const [repeatAnchorEl, setRepeatAnchorEl] = useState(null);

//   /* ---- custom recurrence form ---- */
//   const [repeatEvery, setRepeatEvery] = useState(1);
//   const [repeatPeriod, setRepeatPeriod] = useState("month");
//   const [monthlyOption, setMonthlyOption] = useState("first-tuesday");
//   const [yearlyOption, setYearlyOption] = useState("same-day");
//   const [endsOption, setEndsOption] = useState("never");
//   const [endDate, setEndDate] = useState("2026-09-02");
//   const [occurrences, setOccurrences] = useState(12);

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
//   const daysOfWeek = [
//     "Sunday",
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday",
//   ];

//   /* -------- helpers -------- */
//   const formatDate = (d) =>
//     d.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });

//   const formatTime = (time) => {
//     return time;
//   };

//   const getOrdinal = (n) => {
//     const s = ["th", "st", "nd", "rd"];
//     const v = n % 100;
//     return n + (s[(v - 20) % 10] || s[v] || s[0]);
//   };

//   const changeCalendarMonth = (delta) => {
//     setCalendarDate((d) => {
//       const next = new Date(d);
//       next.setMonth(d.getMonth() + delta);
//       return next;
//     });
//   };

//   const changeCustomCalendarMonth = (delta) => {
//     setCustomCalendarDate((d) => {
//       const next = new Date(d);
//       next.setMonth(d.getMonth() + delta);
//       return next;
//     });
//   };

//   const mediumList = useGet(["mediumList"], `${GET.MEDIUM_LIST}`, true);
//   const templateList = useGet(["templateList"], `${GET.TEMPLATE_LIST}`, true);

//   const generateCalendarDays = () => {
//     const y = calendarDate.getFullYear();
//     const m = calendarDate.getMonth();
//     const first = new Date(y, m, 1).getDay();
//     const daysInMonth = new Date(y, m + 1, 0).getDate();
//     const cells = [];
//     for (let i = 0; i < first; i++)
//       cells.push(<Box key={`empty-${i}`} sx={{ width: 32 }} />);
//     for (let d = 1; d <= daysInMonth; d++) {
//       const date = new Date(y, m, d);
//       const isSel = date.toDateString() === selectedDate.toDateString();
//       const isToday = date.toDateString() === new Date().toDateString();
//       cells.push(
//         <Button
//           key={d}
//           onClick={() => {
//             setSelectedDate(date);
//             setDatePickerOpen(false);
//           }}
//           sx={{
//             minWidth: 32,
//             width: 32,
//             height: 32,
//             borderRadius: "50%",
//             color: isSel ? "#fff" : "#3c4043",
//             backgroundColor: isSel ? "#a136a1" : "transparent",
//             border: isToday && !isSel ? "1px solid #bd19d2ff" : "none",
//             "&:hover": { backgroundColor: isSel ? "#a136a1" : "#f1f3f4" },
//           }}
//         >
//           {d}
//         </Button>
//       );
//     }
//     return cells;
//   };

//   const generateCustomCalendarDays = () => {
//     const y = customCalendarDate.getFullYear();
//     const m = customCalendarDate.getMonth();
//     const first = new Date(y, m, 1).getDay();
//     const daysInMonth = new Date(y, m + 1, 0).getDate();
//     const cells = [];
//     for (let i = 0; i < first; i++)
//       cells.push(<Box key={`custom-empty-${i}`} sx={{ width: 32 }} />);
//     for (let d = 1; d <= daysInMonth; d++) {
//       const date = new Date(y, m, d);
//       const isSel = date.toDateString() === currentCustomDate.toDateString();
//       cells.push(
//         <Button
//           key={`custom-${d}`}
//           onClick={() => setCurrentCustomDate(date)}
//           sx={{
//             minWidth: 32,
//             width: 32,
//             height: 32,
//             borderRadius: "50%",
//             color: isSel ? "#fff" : "#3c4043",
//             backgroundColor: isSel ? "#a136a1" : "transparent",
//             "&:hover": { backgroundColor: isSel ? "#a136a1" : "#f1f3f4" },
//           }}
//         >
//           {d}
//         </Button>
//       );
//     }
//     return cells;
//   };

//   // Generate dynamic repeat options based on selected date
//   const getRepeatOptions = () => {
//     const dayOfWeek = selectedDate.toLocaleDateString("en-US", {
//       weekday: "long",
//     });
//     const dayOfMonth = selectedDate.getDate();
//     const month = selectedDate.toLocaleDateString("en-US", { month: "long" });
//     return [
//       "Does not repeat",
//       "Daily",
//       `Weekly on ${dayOfWeek}`,
//       `Monthly on the ${getOrdinal(dayOfMonth)} ${dayOfWeek}`,
//       `Annually on ${month} ${dayOfMonth}`,
//       "Every weekday (Monday to Friday)",
//       "Custom dates and times",
//     ];
//   };

//   // Format selected days for display
//   const formatSelectedDays = () => {
//     const selected = daysOfWeek.filter((_, index) => selectedDays[index]);
//     if (selected.length === 0) return "";
//     if (selected.length === 1) return selected[0];
//     if (selected.length === 2) return selected.join(" and ");
//     return (
//       selected.slice(0, -1).join(", ") + " and " + selected[selected.length - 1]
//     );
//   };

//   // Initialize selected days when opening custom recurrence
//   const initializeSelectedDays = () => {
//     const dayIndex = selectedDate.getDay();
//     const newSelectedDays = [...selectedDays];
//     newSelectedDays.fill(false);
//     newSelectedDays[dayIndex] = true;
//     setSelectedDays(newSelectedDays);
//   };

//   // Add a new custom date and time
//   const handleAddCustomDateTime = () => {
//     setCustomDateTimes([
//       ...customDateTimes,
//       {
//         date: new Date(currentCustomDate),
//         time: currentCustomTime,
//       },
//     ]);
//     setCustomDateTimePickerOpen(false);
//   };

//   // Remove a custom date and time
//   const handleRemoveCustomDateTime = (index) => {
//     const newCustomDateTimes = [...customDateTimes];
//     newCustomDateTimes.splice(index, 1);
//     setCustomDateTimes(newCustomDateTimes);
//   };

//   /* -------- handlers -------- */
//   const handleOpenDialog = () => setOpen(true);
//   const handleClose = () => setOpen(false);
//   const handleSave = () => {
//     const formattedToRecipients = formatRecipients(toRecipients);
//     const formattedCcRecipients = formatRecipients(ccRecipients);

//     // Prepare the data to be logged
//     const saveData = {
//       date: formatDate(selectedDate),
//       time: allDay ? "All day" : selectedTime,
//       repeat: repeatOption,
//       template,
//       method,
//       ackRequired,
//       attachmentRequired,
//       toRecipients: formattedToRecipients,
//       ccRecipients: formattedCcRecipients,
//       targetEntity,
//     };

//     // Add custom dates if applicable
//     if (repeatOption === "Custom dates and times" ||
//         (repeatPeriod === "month" && monthlyOption === "custom-dates") ||
//         (repeatPeriod === "year" && yearlyOption === "custom-dates")) {
//       saveData.customDateTimes = customDateTimes;
//     }

//     console.log("Scheduler Data:", saveData);
//     handleClose();
//   };

//   const handleRepeatClick = (e) => {
//     setRepeatAnchorEl(e.currentTarget);
//   };

//   const handleRepeatSelect = (opt) => {
//     setRepeatOption(opt);
//     setRepeatAnchorEl(null);

//     if (opt === "Custom...") {
//       initializeSelectedDays();
//       setCustomRecurrenceOpen(true);
//     } else if (opt === "Custom dates and times") {
//       setCustomDateTimes([]);
//       setCustomRecurrenceOpen(true);
//       // Set both monthly and yearly options to custom-dates
//       setRepeatPeriod("month");
//       setMonthlyOption("custom-dates");
//       setYearlyOption("custom-dates");
//     }
//   };

//   const handleCustomRecurrenceSave = () => {
//     let txt = "";
//     if (repeatPeriod === "week") {
//       const days = formatSelectedDays();
//       txt = `Weekly on ${days}`;
//     } else if (repeatPeriod === "month") {
//       if (monthlyOption === "custom-dates") {
//         txt = "Custom dates and times";
//       } else {
//         const map = {
//           "first-tuesday": "Monthly on the first Tuesday",
//           "second-tuesday": "Monthly on the second Tuesday",
//           "third-tuesday": "Monthly on the third Tuesday",
//           "last-tuesday": "Monthly on the last Tuesday",
//         };
//         txt = map[monthlyOption];
//       }
//     } else if (repeatPeriod === "year") {
//       if (yearlyOption === "custom-dates") {
//         txt = "Custom dates and times";
//       } else {
//         const month = selectedDate.toLocaleDateString("en-US", { month: "long" });
//         const dayOfMonth = selectedDate.getDate();
//         txt = `Annually on ${month} ${dayOfMonth}`;
//       }
//     } else {
//       txt = `Every ${repeatEvery} ${repeatPeriod}${repeatEvery > 1 ? "s" : ""}`;
//     }

//     // Add "Ends" info
//     if (endsOption === "on") {
//       const untilDate = new Date(endDate).toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         year: "numeric",
//       });
//       txt += `, until ${untilDate}`;
//     } else if (endsOption === "after") {
//       txt += `, ending after ${occurrences} occurrence${
//         occurrences > 1 ? "s" : ""
//       }`;
//     }

//     setRepeatOption(txt);
//     setCustomRecurrenceOpen(false);
//   };

//   const handleTimeChange = (newValue) => {
//     if (newValue) {
//       setSelectedTime(newValue.format("hh:mm A"));
//     } else {
//       setSelectedTime("");
//     }
//     setTimePickerOpen(false);
//   };

//   const handleCustomTimeChange = (newValue) => {
//     if (newValue) {
//       setCurrentCustomTime(newValue.format("hh:mm A"));
//     }
//   };

//   const handleDayToggle = (index) => {
//     const newSelectedDays = [...selectedDays];
//     newSelectedDays[index] = !newSelectedDays[index];
//     setSelectedDays(newSelectedDays);
//   };

//   // Handle period change to ensure custom dates option is set correctly
//   const handlePeriodChange = (e) => {
//     const newPeriod = e.target.value;
//     setRepeatPeriod(newPeriod);

//     // If we're in custom dates mode, ensure the appropriate option is set
//     if (repeatOption === "Custom dates and times") {
//       if (newPeriod === "month") {
//         setMonthlyOption("custom-dates");
//       } else if (newPeriod === "year") {
//         setYearlyOption("custom-dates");
//       }
//     }
//   };

//   /* -------- render -------- */
//   return (
//     <Box sx={{ p: 3 }}>
//       <Button variant="contained" onClick={handleOpenDialog}>
//         Add Scheduler{" "}
//       </Button>

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
//             Add Scheduler
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
//           <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
//             <AccessTimeIcon sx={{ color: "#666" }} fontSize="small" />
//             <Button
//               variant="outlined"
//               onClick={() => setDatePickerOpen(true)}
//               sx={{
//                 flex: 1,
//                 backgroundColor: "#f8f9fa",
//                 border: "1px solid #ddd",
//                 borderRadius: 2,
//                 color: "#3c4043",
//                 textTransform: "none",
//                 justifyContent: "flex-start",
//                 "&:hover": {
//                   backgroundColor: "#f1f3f4",
//                   border: "1px solid #ccc",
//                 },
//               }}
//             >
//               {formatDate(selectedDate)}
//             </Button>

//             {!allDay && (
//               <Button
//                 variant="outlined"
//                 onClick={() => setTimePickerOpen(true)}
//                 sx={{
//                   minWidth: 100,
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
//                 {selectedTime}
//               </Button>
//             )}
//           </Box>

//           {/* All day + Repeat in same row */}
//           <Box sx={{ display: "flex", alignItems: "center", gap: 2, pl: 5 }}>
//             <FormControlLabel
//               control={
//                 <Checkbox
//                   checked={allDay}
//                   onChange={(e) => setAllDay(e.target.checked)}
//                   size="small"
//                 />
//               }
//               label="All day"
//             />

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

//           {/* Custom dates list */}
//           {repeatOption === "Custom dates and times" && (
//             <Box sx={{ mt: 1, pl: 5 }}>
//               <Typography variant="subtitle2" sx={{ mb: 1 }}>
//                 Scheduled dates and times:
//               </Typography>

//               {customDateTimes.length === 0 ? (
//                 <Typography variant="body2" color="text.secondary">
//                   No dates added yet
//                 </Typography>
//               ) : (
//                 <List dense>
//                   {customDateTimes.map((dateTime, index) => (
//                     <ListItem key={index}>
//                       <ListItemText
//                         primary={formatDate(dateTime.date)}
//                         secondary={formatTime(dateTime.time)}
//                       />
//                       <ListItemSecondaryAction>
//                         <IconButton
//                           edge="end"
//                           size="small"
//                           onClick={() => handleRemoveCustomDateTime(index)}
//                         >
//                           <DeleteIcon fontSize="small" />
//                         </IconButton>
//                       </ListItemSecondaryAction>
//                     </ListItem>
//                   ))}
//                 </List>
//               )}
//             </Box>
//           )}

//           {/* Additional fields section */}
//           <Box sx={{ mt: 1 }}>
//             <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
//               {/* Template */}
//               <Box sx={{ flex: 0.5, minWidth: "120px" }}>
//                 <FormControl size="small" fullWidth>
//                   <InputLabel>Template</InputLabel>
//                   <Select
//                     value={template}
//                     onChange={(e) => setTemplate(e.target.value)}
//                     label="Template"
//                     displayEmpty
//                     aria-label="Select template"
//                   >
//                     <MenuItem value="">Select Template...</MenuItem>
//                     {templateList.data?.data?.map((option) => (
//                       <MenuItem key={option._id} value={option._id}>
//                         {option.name}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Box>

//               {/* Method */}
//               <Box sx={{ flex: 0.5, minWidth: "120px" }}>
//                 <FormControl size="small" fullWidth>
//                   <InputLabel>Method</InputLabel>
//                   <Select
//                     value={method}
//                     onChange={(e) => setMethod(e.target.value)}
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
//                 </FormControl>
//               </Box>
//             </Box>

//             {/* Checkboxes */}
//             <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={ackRequired}
//                     onChange={(e) => setAckRequired(e.target.checked)}
//                     size="small"
//                   />
//                 }
//                 label="Acknowledge Required"
//               />
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={attachmentRequired}
//                     onChange={(e) => setAttachmentRequired(e.target.checked)}
//                     size="small"
//                   />
//                 }
//                 label="Attachment Required"
//               />
//             </Box>

//             {/* TO Recipients */}
//             <Box sx={{ mt: 2 }}>
//               <FormControl fullWidth size="small">
//                 <Autocomplete
//                   multiple
//                   freeSolo
//                   size="small"
//                   id="to-recipients-autocomplete"
//                   options={fieldOptions.filter(
//                     (option) => option.type === "email"
//                   )}
//                   getOptionLabel={(option) =>
//                     typeof option === "string" ? option : option.label
//                   }
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
//             <Box sx={{ mt: 2 }}>
//               <FormControl fullWidth size="small">
//                 <Autocomplete
//                   multiple
//                   freeSolo
//                   size="small"
//                   id="cc-recipients-autocomplete"
//                   options={fieldOptions.filter(
//                     (option) => option.type === "email"
//                   )}
//                   getOptionLabel={(option) =>
//                     typeof option === "string" ? option : option.label
//                   }
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

//             {/* Target Entity */}
//             <Box sx={{ mt: 2 }}>
//               <FormControl fullWidth size="small">
//                 <Autocomplete
//                   freeSolo
//                   size="small"
//                   id="target-entity-autocomplete"
//                   options={fieldOptions.filter(
//                     (option) => option.type === "email"
//                   )}
//                   getOptionLabel={(option) =>
//                     typeof option === "string" ? option : option.label
//                   }
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
//                   onChange={(event, newValue) => {
//                     setTargetEntity(newValue);
//                   }}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       variant="outlined"
//                       label="Target Entity"
//                       placeholder="Type or select"
//                       size="small"
//                     />
//                   )}
//                 />
//               </FormControl>
//             </Box>
//           </Box>
//         </DialogContent>

//         <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
//           <Button
//             variant="contained"
//             onClick={handleSave}
//             sx={{ textTransform: "none", borderRadius: 2 }}
//           >
//             Save
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Date picker */}
//       <Dialog
//         open={datePickerOpen}
//         onClose={() => setDatePickerOpen(false)}
//         maxWidth="xs"
//       >
//         <Box sx={{ p: 2 }}>
//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               mb: 2,
//               backgroundColor: "#f8f9fa",
//               p: 1,
//               borderRadius: 1,
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

//           <Grid container spacing={0} columns={7}>
//             {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
//               <Grid item xs={1} key={d}>
//                 <Box
//                   sx={{
//                     textAlign: "center",
//                     fontSize: 12,
//                     color: "#666",
//                     fontWeight: 500,
//                   }}
//                 >
//                   {d}
//                 </Box>
//               </Grid>
//             ))}
//             {generateCalendarDays()}
//           </Grid>

//           <DialogActions>
//             <Button onClick={() => setDatePickerOpen(false)}>Cancel</Button>
//             <Button
//               onClick={() => setDatePickerOpen(false)}
//               variant="contained"
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
//           sx={{ display: "flex", flexDirection: "column", gap: 2, pb: 1 }}
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

//       {/* Custom recurrence */}
//       <Dialog
//         open={customRecurrenceOpen}
//         onClose={() => setCustomRecurrenceOpen(false)}
//         maxWidth="sm"
//         fullWidth
//       >
//         <DialogTitle
//           sx={{
//             fontSize: 18,
//             fontWeight: 600,
//             pb: 1,
//             borderBottom: "1px solid #eee",
//           }}
//         >
//           Custom recurrence
//         </DialogTitle>

//         <DialogContent
//           sx={{
//             display: "flex",
//             flexDirection: "column",
//             gap: 3,
//             pt: 3,
//           }}
//         >
//           {/* Repeat every */}
//           <Box>
//             <Typography
//               variant="subtitle2"
//               color="text.secondary"
//               sx={{ mb: 1 }}
//             >
//               Repeat every
//             </Typography>

//             <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
//               <TextField
//                 type="number"
//                 value={repeatEvery}
//                 onChange={(e) => setRepeatEvery(Number(e.target.value))}
//                 size="small"
//                 sx={{ width: 100 }}
//                 inputProps={{ min: 1 }}
//               />

//               <FormControl size="small" sx={{ minWidth: 160 }}>
//                 <Select
//                   value={repeatPeriod}
//                   onChange={handlePeriodChange}
//                 >
//                   <MenuItem value="day">day</MenuItem>
//                   <MenuItem value="week">week</MenuItem>
//                   <MenuItem value="month">month</MenuItem>
//                   <MenuItem value="year">year</MenuItem>
//                 </Select>
//               </FormControl>
//             </Box>
//           </Box>

//           {/* Weekly days selection */}
//           {repeatPeriod === "week" && (
//             <Box>
//               <Typography
//                 variant="subtitle2"
//                 color="text.secondary"
//                 sx={{ mb: 1 }}
//               >
//                 Repeat on
//               </Typography>

//               <Grid container spacing={1}>
//                 {daysOfWeek.map((day, index) => (
//                   <Grid item key={day}>
//                     <Chip
//                       label={day.substring(0, 3)}
//                       onClick={() => handleDayToggle(index)}
//                       color={selectedDays[index] ? "primary" : "default"}
//                       variant={selectedDays[index] ? "filled" : "outlined"}
//                       clickable
//                       sx={{ borderRadius: 1, minWidth: 50 }}
//                     />
//                   </Grid>
//                 ))}
//               </Grid>
//             </Box>
//           )}

//           {/* Monthly options */}
//           {repeatPeriod === "month" && (
//             <FormControl fullWidth size="small">
//               <Select
//                 value={monthlyOption}
//                 onChange={(e) => setMonthlyOption(e.target.value)}
//               >
//                 <MenuItem value="first-tuesday">
//                   Monthly on the first Tuesday
//                 </MenuItem>
//                 <MenuItem value="second-tuesday">
//                   Monthly on the second Tuesday
//                 </MenuItem>
//                 <MenuItem value="third-tuesday">
//                   Monthly on the third Tuesday
//                 </MenuItem>
//                 <MenuItem value="last-tuesday">
//                   Monthly on the last Tuesday
//                 </MenuItem>
//                 <MenuItem value="custom-dates">Custom dates and times</MenuItem>
//               </Select>
//             </FormControl>
//           )}

//           {/* Yearly options */}
//           {repeatPeriod === "year" && (
//             <FormControl fullWidth size="small">
//               <Select
//                 value={yearlyOption}
//                 onChange={(e) => setYearlyOption(e.target.value)}
//               >
//                 <MenuItem value="same-day">On the same day each year</MenuItem>
//                 <MenuItem value="custom-dates">Custom dates and times</MenuItem>
//               </Select>
//             </FormControl>
//           )}

//           {/* Custom dates and times section - for both monthly and yearly */}
//           {((repeatPeriod === "month" && monthlyOption === "custom-dates") ||
//            (repeatPeriod === "year" && yearlyOption === "custom-dates")) && (
//             <Box>
//               <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
//                 <Typography variant="subtitle2" color="text.secondary">
//                   Select dates and times
//                 </Typography>
//                 <Button
//                   variant="outlined"
//                   size="small"
//                   startIcon={<AddIcon />}
//                   onClick={() => setCustomDateTimePickerOpen(true)}
//                 >
//                   Add Date
//                 </Button>
//               </Box>

//               {customDateTimes.length === 0 ? (
//                 <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
//                   No dates added yet. Click "Add Date" to schedule.
//                 </Typography>
//               ) : (
//                 <List dense>
//                   {customDateTimes.map((dateTime, index) => (
//                     <ListItem key={index}>
//                       <ListItemText
//                         primary={formatDate(dateTime.date)}
//                         secondary={formatTime(dateTime.time)}
//                       />
//                       <ListItemSecondaryAction>
//                         <IconButton
//                           edge="end"
//                           size="small"
//                           onClick={() => handleRemoveCustomDateTime(index)}
//                         >
//                           <DeleteIcon fontSize="small" />
//                         </IconButton>
//                       </ListItemSecondaryAction>
//                     </ListItem>
//                   ))}
//                 </List>
//               )}
//             </Box>
//           )}

//           {/* Ends Section */}
//           <Box>
//             <Typography
//               variant="subtitle2"
//               color="text.secondary"
//               sx={{ mb: 1 }}
//             >
//               Ends
//             </Typography>

//             <RadioGroup
//               value={endsOption}
//               onChange={(e) => setEndsOption(e.target.value)}
//             >
//               <FormControlLabel
//                 value="never"
//                 control={<Radio size="small" />}
//                 label="Never"
//               />

//               <FormControlLabel
//                 value="on"
//                 control={<Radio size="small" />}
//                 label={
//                   <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                     On
//                     <Button
//                       variant="outlined"
//                       size="small"
//                       onClick={() => setDatePickerOpen(true)}
//                       sx={{
//                         width: 160,
//                         justifyContent: "flex-start",
//                         backgroundColor: "#f9f9f9",
//                         borderColor: "#ccc",
//                         color: "#333",
//                         textTransform: "none",
//                       }}
//                       disabled={endsOption !== "on"}
//                     >
//                       {endDate
//                         ? new Date(endDate).toLocaleDateString("en-US", {
//                             month: "short",
//                             day: "numeric",
//                             year: "numeric",
//                           })
//                         : "Select date"}
//                     </Button>
//                   </Box>
//                 }
//               />

//               <FormControlLabel
//                 value="after"
//                 control={<Radio size="small" />}
//                 label={
//                   <Box
//                     sx={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: 1,
//                       mt: 1,
//                     }}
//                   >
//                     After
//                     <TextField
//                       type="number"
//                       size="small"
//                       sx={{ width: 100 }}
//                       value={occurrences}
//                       onChange={(e) => setOccurrences(Number(e.target.value))}
//                       disabled={endsOption !== "after"}
//                       inputProps={{ min: 1 }}
//                     />
//                     occurrences
//                   </Box>
//                 }
//               />
//             </RadioGroup>
//           </Box>
//         </DialogContent>

//         <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #eee" }}>
//           <Button onClick={() => setCustomRecurrenceOpen(false)}>Cancel</Button>
//           <Button onClick={handleCustomRecurrenceSave} variant="contained">
//             Done
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Custom date-time picker dialog */}
//       <Dialog
//         open={customDateTimePickerOpen}
//         onClose={() => setCustomDateTimePickerOpen(false)}
//         maxWidth="xs"
//       >
//         <DialogTitle sx={{ pb: 1 }}>Add Date and Time</DialogTitle>

//         <DialogContent sx={{ pt: 1 }}>
//           <Box sx={{ mb: 2 }}>
//             <Box
//               sx={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 mb: 1,
//                 backgroundColor: "#f8f9fa",
//                 p: 1,
//                 borderRadius: 1,
//               }}
//             >
//               <IconButton onClick={() => changeCustomCalendarMonth(-1)}>
//                 <ChevronLeft />
//               </IconButton>
//               <Typography variant="h6" sx={{ fontWeight: 500 }}>
//                 {customCalendarDate.toLocaleDateString("en-US", {
//                   month: "long",
//                   year: "numeric",
//                 })}
//               </Typography>
//               <IconButton onClick={() => changeCustomCalendarMonth(1)}>
//                 <ChevronRight />
//               </IconButton>
//             </Box>

//             <Grid container spacing={0} columns={7}>
//               {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
//                 <Grid item xs={1} key={d}>
//                   <Box
//                     sx={{
//                       textAlign: "center",
//                       fontSize: 12,
//                       color: "#666",
//                       fontWeight: 500,
//                     }}
//                   >
//                     {d}
//                   </Box>
//                 </Grid>
//               ))}
//               {generateCustomCalendarDays()}
//             </Grid>
//           </Box>

//           <Box>
//             <Typography variant="subtitle2" sx={{ mb: 1 }}>
//               Select time
//             </Typography>

//             <LocalizationProvider dateAdapter={AdapterDayjs}>
//               <TimePicker
//                 value={dayjs(currentCustomTime, "hh:mm A")}
//                 onChange={handleCustomTimeChange}
//                 format="hh:mm a"
//                 slotProps={{
//                   textField: {
//                     size: "small",
//                     fullWidth: true,
//                   },
//                 }}
//               />
//             </LocalizationProvider>
//           </Box>
//         </DialogContent>

//         <DialogActions>
//           <Button onClick={() => setCustomDateTimePickerOpen(false)}>
//             Cancel
//           </Button>
//           <Button onClick={handleAddCustomDateTime} variant="contained">
//             Add
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }

//more complex 1,2 case

//3 rd case
// import React, { useState } from "react";
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
//   Radio,
//   RadioGroup,
//   TextField,
//   Select,
//   MenuItem,
//   FormControl,
//   IconButton,
//   Grid,
//   Chip,
//   InputLabel,
//   Autocomplete,
//   List,
//   ListItem,
//   ListItemText,
//   ListItemSecondaryAction,
// } from "@mui/material";
// import {
//   Close as CloseIcon,
//   AccessTime as AccessTimeIcon,
//   ExpandMore as ExpandMoreIcon,
//   ChevronLeft,
//   ChevronRight,
//   Add as AddIcon,
//   Delete as DeleteIcon,
// } from "@mui/icons-material";
// import { TimePicker } from "@mui/x-date-pickers/TimePicker";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import dayjs from "dayjs";
// import useGet from "../../hooks/useGet";
// import { GET } from "../../services/apiRoutes";

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

// export default function Frequency({ fieldOptions }) {
//   console.log("fieldOptions:", fieldOptions);
//   const [open, setOpen] = useState(false);
//   const [allDay, setAllDay] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(new Date(2025, 8, 2));
//   const [selectedTime, setSelectedTime] = useState("4:00 PM");
//   const [repeatOption, setRepeatOption] = useState("Does not repeat");
//   const [customRecurrenceOpen, setCustomRecurrenceOpen] = useState(false);

//   // New state variables for additional fields
//   const [template, setTemplate] = useState("");
//   const [method, setMethod] = useState("");
//   const [ackRequired, setAckRequired] = useState(false);
//   const [attachmentRequired, setAttachmentRequired] = useState(false);
//   const [toRecipients, setToRecipients] = useState([]);
//   const [ccRecipients, setCcRecipients] = useState([]);
//   const [targetEntity, setTargetEntity] = useState("");

//   // New state for custom dates and times
//   const [customDateTimes, setCustomDateTimes] = useState([]);
//   const [customDateTimePickerOpen, setCustomDateTimePickerOpen] =
//     useState(false);
//   const [currentCustomDate, setCurrentCustomDate] = useState(new Date());
//   const [currentCustomTime, setCurrentCustomTime] = useState(
//     dayjs().format("hh:mm A")
//   );
//   const [customCalendarDate, setCustomCalendarDate] = useState(new Date());

//   // New state for custom months
//   const [customMonths, setCustomMonths] = useState(Array(12).fill(false));

//   // New state for yearly pattern
//   const [yearlyPattern, setYearlyPattern] = useState({
//     month: 2, // Default to February (2nd month)
//     week: 2, // Default to 2nd week
//     days: [false, true, false, false, false, true, false], // Default to Monday and Saturday
//   });

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

//   /* ---- date-picker ---- */
//   const [datePickerOpen, setDatePickerOpen] = useState(false);
//   const [calendarDate, setCalendarDate] = useState(new Date(2025, 8, 1));

//   /* ---- time-picker ---- */
//   const [timePickerOpen, setTimePickerOpen] = useState(false);

//   /* ---- repeat-dropdown ---- */
//   const [repeatAnchorEl, setRepeatAnchorEl] = useState(null);

//   /* ---- custom recurrence form ---- */
//   const [repeatEvery, setRepeatEvery] = useState(1);
//   const [repeatPeriod, setRepeatPeriod] = useState("month");
//   const [monthlyOption, setMonthlyOption] = useState("first-tuesday");
//   const [yearlyOption, setYearlyOption] = useState("same-day");
//   const [endsOption, setEndsOption] = useState("never");
//   const [endDate, setEndDate] = useState("2026-09-02");
//   const [occurrences, setOccurrences] = useState(12);

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
//   const daysOfWeek = [
//     "Sunday",
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday",
//   ];

//   const monthsOfYear = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];

//   const weeksOfMonth = [
//     "First week",
//     "Second week",
//     "Third week",
//     "Fourth week",
//     "Last week",
//   ];

//   /* -------- helpers -------- */
//   const formatDate = (d) =>
//     d.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });

//   const formatTime = (time) => {
//     return time;
//   };

//   const getOrdinal = (n) => {
//     const s = ["th", "st", "nd", "rd"];
//     const v = n % 100;
//     return n + (s[(v - 20) % 10] || s[v] || s[0]);
//   };

//   const changeCalendarMonth = (delta) => {
//     setCalendarDate((d) => {
//       const next = new Date(d);
//       next.setMonth(d.getMonth() + delta);
//       return next;
//     });
//   };

//   const changeCustomCalendarMonth = (delta) => {
//     setCustomCalendarDate((d) => {
//       const next = new Date(d);
//       next.setMonth(d.getMonth() + delta);
//       return next;
//     });
//   };

//   const mediumList = useGet(["mediumList"], `${GET.MEDIUM_LIST}`, true);
//   const templateList = useGet(["templateList"], `${GET.TEMPLATE_LIST}`, true);

//   const generateCalendarDays = () => {
//     const y = calendarDate.getFullYear();
//     const m = calendarDate.getMonth();
//     const first = new Date(y, m, 1).getDay();
//     const daysInMonth = new Date(y, m + 1, 0).getDate();
//     const cells = [];
//     for (let i = 0; i < first; i++)
//       cells.push(<Box key={`empty-${i}`} sx={{ width: 32 }} />);
//     for (let d = 1; d <= daysInMonth; d++) {
//       const date = new Date(y, m, d);
//       const isSel = date.toDateString() === selectedDate.toDateString();
//       const isToday = date.toDateString() === new Date().toDateString();
//       cells.push(
//         <Button
//           key={d}
//           onClick={() => {
//             setSelectedDate(date);
//             setDatePickerOpen(false);
//           }}
//           sx={{
//             minWidth: 32,
//             width: 32,
//             height: 32,
//             borderRadius: "50%",
//             color: isSel ? "#fff" : "#3c4043",
//             backgroundColor: isSel ? "#a136a1" : "transparent",
//             border: isToday && !isSel ? "1px solid #bd19d2ff" : "none",
//             "&:hover": { backgroundColor: isSel ? "#a136a1" : "#f1f3f4" },
//           }}
//         >
//           {d}
//         </Button>
//       );
//     }
//     return cells;
//   };

//   const generateCustomCalendarDays = () => {
//     const y = customCalendarDate.getFullYear();
//     const m = customCalendarDate.getMonth();
//     const first = new Date(y, m, 1).getDay();
//     const daysInMonth = new Date(y, m + 1, 0).getDate();
//     const cells = [];
//     for (let i = 0; i < first; i++)
//       cells.push(<Box key={`custom-empty-${i}`} sx={{ width: 32 }} />);
//     for (let d = 1; d <= daysInMonth; d++) {
//       const date = new Date(y, m, d);
//       const isSel = date.toDateString() === currentCustomDate.toDateString();
//       cells.push(
//         <Button
//           key={`custom-${d}`}
//           onClick={() => setCurrentCustomDate(date)}
//           sx={{
//             minWidth: 32,
//             width: 32,
//             height: 32,
//             borderRadius: "50%",
//             color: isSel ? "#fff" : "#3c4043",
//             backgroundColor: isSel ? "#a136a1" : "transparent",
//             "&:hover": { backgroundColor: isSel ? "#a136a1" : "#f1f3f4" },
//           }}
//         >
//           {d}
//         </Button>
//       );
//     }
//     return cells;
//   };

//   // Generate dynamic repeat options based on selected date
//   const getRepeatOptions = () => {
//     const dayOfWeek = selectedDate.toLocaleDateString("en-US", {
//       weekday: "long",
//     });
//     const dayOfMonth = selectedDate.getDate();
//     const month = selectedDate.toLocaleDateString("en-US", { month: "long" });
//     return [
//       "Does not repeat",
//       "Daily",
//       `Weekly on ${dayOfWeek}`,
//       `Monthly on the ${getOrdinal(dayOfMonth)} ${dayOfWeek}`,
//       `Annually on ${month} ${dayOfMonth}`,
//       "Every weekday (Monday to Friday)",
//       "Custom",
//     ];
//   };

//   // Format selected days for display
//   const formatSelectedDays = () => {
//     const selected = daysOfWeek.filter((_, index) => selectedDays[index]);
//     if (selected.length === 0) return "";
//     if (selected.length === 1) return selected[0];
//     if (selected.length === 2) return selected.join(" and ");
//     return (
//       selected.slice(0, -1).join(", ") + " and " + selected[selected.length - 1]
//     );
//   };

//   // Format selected months for display
//   const formatSelectedMonths = () => {
//     const selected = monthsOfYear.filter((_, index) => customMonths[index]);
//     if (selected.length === 0) return "";
//     if (selected.length === 1) return selected[0];
//     if (selected.length === 2) return selected.join(" and ");
//     return (
//       selected.slice(0, -1).join(", ") + " and " + selected[selected.length - 1]
//     );
//   };

//   // Format selected days for yearly pattern
//   const formatSelectedDaysForYearlyPattern = () => {
//     const selected = daysOfWeek.filter((_, index) => yearlyPattern.days[index]);
//     if (selected.length === 0) return "";
//     if (selected.length === 1) return selected[0];
//     if (selected.length === 2) return selected.join(" and ");
//     return (
//       selected.slice(0, -1).join(", ") + " and " + selected[selected.length - 1]
//     );
//   };

//   // Initialize selected days when opening custom recurrence
//   const initializeSelectedDays = () => {
//     const dayIndex = selectedDate.getDay();
//     const newSelectedDays = [...selectedDays];
//     newSelectedDays.fill(false);
//     newSelectedDays[dayIndex] = true;
//     setSelectedDays(newSelectedDays);
//   };

//   // Add a new custom date and time
//   const handleAddCustomDateTime = () => {
//     setCustomDateTimes([
//       ...customDateTimes,
//       {
//         date: new Date(currentCustomDate),
//         time: currentCustomTime,
//       },
//     ]);
//     setCustomDateTimePickerOpen(false);
//   };

//   // Remove a custom date and time
//   const handleRemoveCustomDateTime = (index) => {
//     const newCustomDateTimes = [...customDateTimes];
//     newCustomDateTimes.splice(index, 1);
//     setCustomDateTimes(newCustomDateTimes);
//   };

//   // Toggle month selection
//   const handleMonthToggle = (index) => {
//     const newCustomMonths = [...customMonths];
//     newCustomMonths[index] = !newCustomMonths[index];
//     setCustomMonths(newCustomMonths);
//   };

//   // Toggle day selection for yearly pattern
//   const handleDayToggleForYearlyPattern = (index) => {
//     const newYearlyPattern = { ...yearlyPattern };
//     newYearlyPattern.days[index] = !newYearlyPattern.days[index];
//     setYearlyPattern(newYearlyPattern);
//   };

//   // Handle month change for yearly pattern
//   const handleMonthChangeForYearlyPattern = (e) => {
//     const newYearlyPattern = { ...yearlyPattern };
//     newYearlyPattern.month = Number(e.target.value);
//     setYearlyPattern(newYearlyPattern);
//   };

//   // Handle week change for yearly pattern
//   const handleWeekChangeForYearlyPattern = (e) => {
//     const newYearlyPattern = { ...yearlyPattern };
//     newYearlyPattern.week = Number(e.target.value);
//     setYearlyPattern(newYearlyPattern);
//   };

//   /* -------- handlers -------- */
//   const handleOpenDialog = () => setOpen(true);
//   const handleClose = () => setOpen(false);
//   const handleSave = () => {
//     const formattedToRecipients = formatRecipients(toRecipients);
//     const formattedCcRecipients = formatRecipients(ccRecipients);

//     // Prepare the data to be logged
//     const saveData = {
//       date: formatDate(selectedDate),
//       time: allDay ? "All day" : selectedTime,
//       repeat: repeatOption,
//       template,
//       method,
//       ackRequired,
//       attachmentRequired,
//       toRecipients: formattedToRecipients,
//       ccRecipients: formattedCcRecipients,
//       targetEntity,
//     };

//     // Add custom dates if applicable
//     if (repeatOption === "Custom") {
//       if (repeatPeriod === "month") {
//         saveData.customDateTimes = customDateTimes;
//       } else if (repeatPeriod === "year") {
//         if (yearlyOption === "custom-dates") {
//           saveData.customMonths = customMonths;
//         } else if (yearlyOption === "custom-pattern") {
//           saveData.yearlyPattern = yearlyPattern;
//         }
//       }
//     }

//     console.log("Scheduler Data:", saveData);
//     handleClose();
//   };

//   const handleRepeatClick = (e) => {
//     setRepeatAnchorEl(e.currentTarget);
//   };

//   const handleRepeatSelect = (opt) => {
//     setRepeatOption(opt);
//     setRepeatAnchorEl(null);

//     // if (opt === "Custom...") {
//     //   initializeSelectedDays();
//     //   setCustomRecurrenceOpen(true);
//     // } else
//        if (opt === "Custom") {
//       setCustomDateTimes([]);
//       setCustomMonths(Array(12).fill(false));
//       setCustomRecurrenceOpen(true);
//       setRepeatPeriod("month");
//       setMonthlyOption("custom-dates");
//     }
//   };

//   const handleCustomRecurrenceSave = () => {
//     let txt = "";
//     if (repeatPeriod === "week") {
//       const days = formatSelectedDays();
//       txt = `Weekly on ${days}`;
//     } else if (repeatPeriod === "month") {
//       if (monthlyOption === "custom-dates") {
//         txt = "Custom";
//       } else {
//         const map = {
//           "first-tuesday": "Monthly on the first Tuesday",
//           "second-tuesday": "Monthly on the second Tuesday",
//           "third-tuesday": "Monthly on the third Tuesday",
//           "last-tuesday": "Monthly on the last Tuesday",
//         };
//         txt = map[monthlyOption];
//       }
//     } else if (repeatPeriod === "year") {
//       if (yearlyOption === "same-day") {
//         const month = selectedDate.toLocaleDateString("en-US", {
//           month: "long",
//         });
//         const dayOfMonth = selectedDate.getDate();
//         txt = `Annually on ${month} ${dayOfMonth}`;
//       } else if (yearlyOption === "custom-dates") {
//         const months = formatSelectedMonths();
//         txt = `Annually in ${months}`;
//       } else if (yearlyOption === "custom-pattern") {
//         const monthName = monthsOfYear[yearlyPattern.month - 1];
//         const weekName = weeksOfMonth[yearlyPattern.week - 1];
//         const days = formatSelectedDaysForYearlyPattern();
//         txt = `Annually in ${monthName}, ${weekName.toLowerCase()} on ${days}`;
//       }
//     } else {
//       txt = `Every ${repeatEvery} ${repeatPeriod}${repeatEvery > 1 ? "s" : ""}`;
//     }

//     // Add "Ends" info
//     if (endsOption === "on") {
//       const untilDate = new Date(endDate).toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         year: "numeric",
//       });
//       txt += `, until ${untilDate}`;
//     } else if (endsOption === "after") {
//       txt += `, ending after ${occurrences} occurrence${
//         occurrences > 1 ? "s" : ""
//       }`;
//     }

//     setRepeatOption(txt);
//     setCustomRecurrenceOpen(false);
//   };

//   const handleTimeChange = (newValue) => {
//     if (newValue) {
//       setSelectedTime(newValue.format("hh:mm A"));
//     } else {
//       setSelectedTime("");
//     }
//     setTimePickerOpen(false);
//   };

//   const handleCustomTimeChange = (newValue) => {
//     if (newValue) {
//       setCurrentCustomTime(newValue.format("hh:mm A"));
//     }
//   };

//   const handleDayToggle = (index) => {
//     const newSelectedDays = [...selectedDays];
//     newSelectedDays[index] = !newSelectedDays[index];
//     setSelectedDays(newSelectedDays);
//   };

//   // Handle period change to ensure custom dates option is set correctly
//   const handlePeriodChange = (e) => {
//     const newPeriod = e.target.value;
//     setRepeatPeriod(newPeriod);

//     // Reset options when changing period
//     if (newPeriod === "month") {
//       setMonthlyOption("custom-dates");
//       setYearlyOption("same-day");
//     } else if (newPeriod === "year") {
//       setMonthlyOption("first-tuesday");
//       setYearlyOption("custom-dates");
//     }
//   };

//   /* -------- render -------- */
//   return (
//     <Box sx={{ p: 3 }}>
//       <Button variant="contained" onClick={handleOpenDialog}>
//         Add Scheduler{" "}
//       </Button>

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
//             Add Scheduler
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
//           <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
//             <AccessTimeIcon sx={{ color: "#666" }} fontSize="small" />
//             <Button
//               variant="outlined"
//               onClick={() => setDatePickerOpen(true)}
//               sx={{
//                 flex: 1,
//                 backgroundColor: "#f8f9fa",
//                 border: "1px solid #ddd",
//                 borderRadius: 2,
//                 color: "#3c4043",
//                 textTransform: "none",
//                 justifyContent: "flex-start",
//                 "&:hover": {
//                   backgroundColor: "#f1f3f4",
//                   border: "1px solid #ccc",
//                 },
//               }}
//             >
//               {formatDate(selectedDate)}
//             </Button>

//             {!allDay && (
//               <Button
//                 variant="outlined"
//                 onClick={() => setTimePickerOpen(true)}
//                 sx={{
//                   minWidth: 100,
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
//                 {selectedTime}
//               </Button>
//             )}
//           </Box>

//           {/* All day + Repeat in same row */}
//           <Box sx={{ display: "flex", alignItems: "center", gap: 2, pl: 5 }}>
//             <FormControlLabel
//               control={
//                 <Checkbox
//                   checked={allDay}
//                   onChange={(e) => setAllDay(e.target.checked)}
//                   size="small"
//                 />
//               }
//               label="All day"
//             />

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

//           {/* Custom dates list */}
//           {repeatOption === "Custom" && (
//             <Box sx={{ mt: 1, pl: 5 }}>
//               <Typography variant="subtitle2" sx={{ mb: 1 }}>
//                 {repeatPeriod === "month" && "Scheduled dates and times:"}
//                 {repeatPeriod === "year" &&
//                   yearlyOption === "custom-dates" &&
//                   "Scheduled months:"}
//                 {repeatPeriod === "year" &&
//                   yearlyOption === "custom-pattern" &&
//                   "Scheduled pattern:"}
//               </Typography>

//               {repeatPeriod === "month" && customDateTimes.length === 0 && (
//                 <Typography variant="body2" color="text.secondary">
//                   No dates added yet
//                 </Typography>
//               )}

//               {repeatPeriod === "year" &&
//                 yearlyOption === "custom-dates" &&
//                 customMonths.every((month) => !month) && (
//                   <Typography variant="body2" color="text.secondary">
//                     No months selected yet
//                   </Typography>
//                 )}

//               {repeatPeriod === "month" && customDateTimes.length > 0 && (
//                 <List dense>
//                   {customDateTimes.map((dateTime, index) => (
//                     <ListItem key={index}>
//                       <ListItemText
//                         primary={formatDate(dateTime.date)}
//                         secondary={formatTime(dateTime.time)}
//                       />
//                       <ListItemSecondaryAction>
//                         <IconButton
//                           edge="end"
//                           size="small"
//                           onClick={() => handleRemoveCustomDateTime(index)}
//                         >
//                           <DeleteIcon fontSize="small" />
//                         </IconButton>
//                       </ListItemSecondaryAction>
//                     </ListItem>
//                   ))}
//                 </List>
//               )}

//               {repeatPeriod === "year" && yearlyOption === "custom-dates" && (
//                 <Box>
//                   <Grid container spacing={1}>
//                     {monthsOfYear.map((month, index) => (
//                       <Grid item key={month}>
//                         <Chip
//                           label={month.substring(0, 3)}
//                           onClick={() => handleMonthToggle(index)}
//                           color={customMonths[index] ? "primary" : "default"}
//                           variant={customMonths[index] ? "filled" : "outlined"}
//                           clickable
//                           sx={{ borderRadius: 1, minWidth: 50 }}
//                         />
//                       </Grid>
//                     ))}
//                   </Grid>
//                 </Box>
//               )}

//               {repeatPeriod === "year" && yearlyOption === "custom-pattern" && (
//                 <Box>
//                   <Typography variant="body2" sx={{ mb: 1 }}>
//                     {monthsOfYear[yearlyPattern.month - 1]},{" "}
//                     {weeksOfMonth[yearlyPattern.week - 1].toLowerCase()} on{" "}
//                     {formatSelectedDaysForYearlyPattern()}
//                   </Typography>
//                 </Box>
//               )}
//             </Box>
//           )}

//           {/* Additional fields section */}
//           <Box sx={{ mt: 1 }}>
//             <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
//               {/* Template */}
//               <Box sx={{ flex: 0.5, minWidth: "120px" }}>
//                 <FormControl size="small" fullWidth>
//                   <InputLabel>Template</InputLabel>
//                   <Select
//                     value={template}
//                     onChange={(e) => setTemplate(e.target.value)}
//                     label="Template"
//                     displayEmpty
//                     aria-label="Select template"
//                   >
//                     <MenuItem value="">Select Template...</MenuItem>
//                     {templateList.data?.data?.map((option) => (
//                       <MenuItem key={option._id} value={option._id}>
//                         {option.name}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Box>

//               {/* Method */}
//               <Box sx={{ flex: 0.5, minWidth: "120px" }}>
//                 <FormControl size="small" fullWidth>
//                   <InputLabel>Method</InputLabel>
//                   <Select
//                     value={method}
//                     onChange={(e) => setMethod(e.target.value)}
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
//                 </FormControl>
//               </Box>
//             </Box>

//             {/* Checkboxes */}
//             <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={ackRequired}
//                     onChange={(e) => setAckRequired(e.target.checked)}
//                     size="small"
//                   />
//                 }
//                 label="Acknowledge Required"
//               />
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={attachmentRequired}
//                     onChange={(e) => setAttachmentRequired(e.target.checked)}
//                     size="small"
//                   />
//                 }
//                 label="Attachment Required"
//               />
//             </Box>

//             {/* TO Recipients */}
//             <Box sx={{ mt: 2 }}>
//               <FormControl fullWidth size="small">
//                 <Autocomplete
//                   multiple
//                   freeSolo
//                   size="small"
//                   id="to-recipients-autocomplete"
//                   options={fieldOptions.filter(
//                     (option) => option.type === "email"
//                   )}
//                   getOptionLabel={(option) =>
//                     typeof option === "string" ? option : option.label
//                   }
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
//             <Box sx={{ mt: 2 }}>
//               <FormControl fullWidth size="small">
//                 <Autocomplete
//                   multiple
//                   freeSolo
//                   size="small"
//                   id="cc-recipients-autocomplete"
//                   options={fieldOptions.filter(
//                     (option) => option.type === "email"
//                   )}
//                   getOptionLabel={(option) =>
//                     typeof option === "string" ? option : option.label
//                   }
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

//             {/* Target Entity */}
//             <Box sx={{ mt: 2 }}>
//               <FormControl fullWidth size="small">
//                 <Autocomplete
//                   freeSolo
//                   size="small"
//                   id="target-entity-autocomplete"
//                   options={fieldOptions.filter(
//                     (option) => option.type === "email"
//                   )}
//                   getOptionLabel={(option) =>
//                     typeof option === "string" ? option : option.label
//                   }
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
//                   onChange={(event, newValue) => {
//                     setTargetEntity(newValue);
//                   }}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       variant="outlined"
//                       label="Target Entity"
//                       placeholder="Type or select"
//                       size="small"
//                     />
//                   )}
//                 />
//               </FormControl>
//             </Box>
//           </Box>
//         </DialogContent>

//         <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
//           <Button
//             variant="contained"
//             onClick={handleSave}
//             sx={{ textTransform: "none", borderRadius: 2 }}
//           >
//             Save
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Date picker */}
//       <Dialog
//         open={datePickerOpen}
//         onClose={() => setDatePickerOpen(false)}
//         maxWidth="xs"
//       >
//         <Box sx={{ p: 2 }}>
//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               mb: 2,
//               backgroundColor: "#f8f9fa",
//               p: 1,
//               borderRadius: 1,
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

//           <Grid container spacing={0} columns={7}>
//             {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
//               <Grid item xs={1} key={d}>
//                 <Box
//                   sx={{
//                     textAlign: "center",
//                     fontSize: 12,
//                     color: "#666",
//                     fontWeight: 500,
//                   }}
//                 >
//                   {d}
//                 </Box>
//               </Grid>
//             ))}
//             {generateCalendarDays()}
//           </Grid>

//           <DialogActions>
//             <Button onClick={() => setDatePickerOpen(false)}>Cancel</Button>
//             <Button
//               onClick={() => setDatePickerOpen(false)}
//               variant="contained"
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
//           sx={{ display: "flex", flexDirection: "column", gap: 2, pb: 1 }}
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

//       {/* Custom recurrence */}
//       <Dialog
//         open={customRecurrenceOpen}
//         onClose={() => setCustomRecurrenceOpen(false)}
//         maxWidth="sm"
//         fullWidth
//       >
//         <DialogTitle
//           sx={{
//             fontSize: 18,
//             fontWeight: 600,
//             pb: 1,
//             borderBottom: "1px solid #eee",
//           }}
//         >
//           Custom recurrence
//         </DialogTitle>

//         <DialogContent
//           sx={{
//             display: "flex",
//             flexDirection: "column",
//             gap: 3,
//             pt: 3,
//           }}
//         >
//           {/* Repeat every */}
//           <Box>
//             <Typography
//               variant="subtitle2"
//               color="text.secondary"
//               sx={{ mb: 1 }}
//             >
//               Repeat every
//             </Typography>

//             <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
//               <TextField
//                 type="number"
//                 value={repeatEvery}
//                 onChange={(e) => setRepeatEvery(Number(e.target.value))}
//                 size="small"
//                 sx={{ width: 100 }}
//                 inputProps={{ min: 1 }}
//               />

//               <FormControl size="small" sx={{ minWidth: 160 }}>
//                 <Select value={repeatPeriod} onChange={handlePeriodChange}>
//                   <MenuItem value="day">day</MenuItem>
//                   <MenuItem value="week">week</MenuItem>
//                   <MenuItem value="month">month</MenuItem>
//                   <MenuItem value="year">year</MenuItem>
//                 </Select>
//               </FormControl>
//             </Box>
//           </Box>

//           {/* Weekly days selection */}
//           {repeatPeriod === "week" && (
//             <Box>
//               <Typography
//                 variant="subtitle2"
//                 color="text.secondary"
//                 sx={{ mb: 1 }}
//               >
//                 Repeat on
//               </Typography>

//               <Grid container spacing={1}>
//                 {daysOfWeek.map((day, index) => (
//                   <Grid item key={day}>
//                     <Chip
//                       label={day.substring(0, 3)}
//                       onClick={() => handleDayToggle(index)}
//                       color={selectedDays[index] ? "primary" : "default"}
//                       variant={selectedDays[index] ? "filled" : "outlined"}
//                       clickable
//                       sx={{ borderRadius: 1, minWidth: 50 }}
//                     />
//                   </Grid>
//                 ))}
//               </Grid>
//             </Box>
//           )}

//           {/* Monthly options */}
//           {repeatPeriod === "month" && (
//             <FormControl fullWidth size="small">
//               <Select
//                 value={monthlyOption}
//                 onChange={(e) => setMonthlyOption(e.target.value)}
//               >
//                 <MenuItem value="first-tuesday">
//                   Monthly on the first Tuesday
//                 </MenuItem>
//                 <MenuItem value="second-tuesday">
//                   Monthly on the second Tuesday
//                 </MenuItem>
//                 <MenuItem value="third-tuesday">
//                   Monthly on the third Tuesday
//                 </MenuItem>
//                 <MenuItem value="last-tuesday">
//                   Monthly on the last Tuesday
//                 </MenuItem>
//                 <MenuItem value="custom-dates">Custom</MenuItem>
//               </Select>
//             </FormControl>
//           )}

//           {/* Yearly options */}
//           {repeatPeriod === "year" && (
//             <FormControl fullWidth size="small">
//               <Select
//                 value={yearlyOption}
//                 onChange={(e) => setYearlyOption(e.target.value)}
//               >
//                 <MenuItem value="same-day">On the same day each year</MenuItem>
//                 <MenuItem value="custom-dates">
//                   Specific months each year
//                 </MenuItem>
//                 <MenuItem value="custom-pattern">
//                   Custom pattern (month, week, days)
//                 </MenuItem>
//               </Select>
//             </FormControl>
//           )}

//           {/* Custom dates and times section - for monthly */}
//           {repeatPeriod === "month" && monthlyOption === "custom-dates" && (
//             <Box>
//               <Box
//                 sx={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   mb: 1,
//                 }}
//               >
//                 <Typography variant="subtitle2" color="text.secondary">
//                   Select dates and times
//                 </Typography>
//                 <Button
//                   variant="outlined"
//                   size="small"
//                   startIcon={<AddIcon />}
//                   onClick={() => setCustomDateTimePickerOpen(true)}
//                 >
//                   Add Date
//                 </Button>
//               </Box>

//               {customDateTimes.length === 0 ? (
//                 <Typography
//                   variant="body2"
//                   color="text.secondary"
//                   sx={{ textAlign: "center", py: 2 }}
//                 >
//                   No dates added yet. Click "Add Date" to schedule.
//                 </Typography>
//               ) : (
//                 <List dense>
//                   {customDateTimes.map((dateTime, index) => (
//                     <ListItem key={index}>
//                       <ListItemText
//                         primary={formatDate(dateTime.date)}
//                         secondary={formatTime(dateTime.time)}
//                       />
//                       <ListItemSecondaryAction>
//                         <IconButton
//                           edge="end"
//                           size="small"
//                           onClick={() => handleRemoveCustomDateTime(index)}
//                         >
//                           <DeleteIcon fontSize="small" />
//                         </IconButton>
//                       </ListItemSecondaryAction>
//                     </ListItem>
//                   ))}
//                 </List>
//               )}
//             </Box>
//           )}

//           {/* Custom months section - for yearly */}
//           {repeatPeriod === "year" && yearlyOption === "custom-dates" && (
//             <Box>
//               <Typography
//                 variant="subtitle2"
//                 color="text.secondary"
//                 sx={{ mb: 1 }}
//               >
//                 Select months
//               </Typography>

//               <Grid container spacing={1}>
//                 {monthsOfYear.map((month, index) => (
//                   <Grid item key={month}>
//                     <Chip
//                       label={month.substring(0, 3)}
//                       onClick={() => handleMonthToggle(index)}
//                       color={customMonths[index] ? "primary" : "default"}
//                       variant={customMonths[index] ? "filled" : "outlined"}
//                       clickable
//                       sx={{ borderRadius: 1, minWidth: 50 }}
//                     />
//                   </Grid>
//                 ))}
//               </Grid>
//             </Box>
//           )}

//           {/* Custom pattern section - for yearly */}
//           {repeatPeriod === "year" && yearlyOption === "custom-pattern" && (
//             <Box>
//               <Typography
//                 variant="subtitle2"
//                 color="text.secondary"
//                 sx={{ mb: 1 }}
//               >
//                 Select pattern
//               </Typography>

//               <Box
//                 sx={{
//                   display: "flex",
//                   flexDirection: "row",
//                   justifyContent: "space-between",
//                   gap: 2,
//                 }}
//               >
//                 <Box sx={{ flex: 1 }}>
//                   <Typography variant="body2" sx={{ mb: 1 }}>
//                     Month:
//                   </Typography>
//                   <FormControl size="small" fullWidth>
//                     <Select
//                       value={yearlyPattern.month}
//                       onChange={handleMonthChangeForYearlyPattern}
//                     >
//                       {monthsOfYear.map((month, index) => (
//                         <MenuItem key={month} value={index + 1}>
//                           {month}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </Box>

//                 <Box sx={{ flex: 1 }}>
//                   <Typography variant="body2" sx={{ mb: 1 }}>
//                     Week:
//                   </Typography>
//                   <FormControl size="small" fullWidth>
//                     <Select
//                       value={yearlyPattern.week}
//                       onChange={handleWeekChangeForYearlyPattern}
//                     >
//                       {weeksOfMonth.map((week, index) => (
//                         <MenuItem key={week} value={index + 1}>
//                           {week}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </Box>
//               </Box>

//               <Box>
//                 <Typography variant="body2" sx={{ mb: 1 }}>
//                   Days:
//                 </Typography>
//                 <Grid container spacing={1}>
//                   {daysOfWeek.map((day, index) => (
//                     <Grid item key={day}>
//                       <Chip
//                         label={day.substring(0, 3)}
//                         onClick={() => handleDayToggleForYearlyPattern(index)}
//                         color={
//                           yearlyPattern.days[index] ? "primary" : "default"
//                         }
//                         variant={
//                           yearlyPattern.days[index] ? "filled" : "outlined"
//                         }
//                         clickable
//                         sx={{ borderRadius: 1, minWidth: 50 }}
//                       />
//                     </Grid>
//                   ))}
//                 </Grid>
//               </Box>
//             </Box>
//           )}

//           {/* Ends Section */}
//           <Box>
//             <Typography
//               variant="subtitle2"
//               color="text.secondary"
//               sx={{ mb: 1 }}
//             >
//               Ends
//             </Typography>

//             <RadioGroup
//               value={endsOption}
//               onChange={(e) => setEndsOption(e.target.value)}
//             >
//               <FormControlLabel
//                 value="never"
//                 control={<Radio size="small" />}
//                 label="Never"
//               />

//               <FormControlLabel
//                 value="on"
//                 control={<Radio size="small" />}
//                 label={
//                   <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                     On
//                     <Button
//                       variant="outlined"
//                       size="small"
//                       onClick={() => setDatePickerOpen(true)}
//                       sx={{
//                         width: 160,
//                         justifyContent: "flex-start",
//                         backgroundColor: "#f9f9f9",
//                         borderColor: "#ccc",
//                         color: "#333",
//                         textTransform: "none",
//                       }}
//                       disabled={endsOption !== "on"}
//                     >
//                       {endDate
//                         ? new Date(endDate).toLocaleDateString("en-US", {
//                             month: "short",
//                             day: "numeric",
//                             year: "numeric",
//                           })
//                         : "Select date"}
//                     </Button>
//                   </Box>
//                 }
//               />

//               <FormControlLabel
//                 value="after"
//                 control={<Radio size="small" />}
//                 label={
//                   <Box
//                     sx={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: 1,
//                       mt: 1,
//                     }}
//                   >
//                     After
//                     <TextField
//                       type="number"
//                       size="small"
//                       sx={{ width: 100 }}
//                       value={occurrences}
//                       onChange={(e) => setOccurrences(Number(e.target.value))}
//                       disabled={endsOption !== "after"}
//                       inputProps={{ min: 1 }}
//                     />
//                     occurrences
//                   </Box>
//                 }
//               />
//             </RadioGroup>
//           </Box>
//         </DialogContent>

//         <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #eee" }}>
//           <Button onClick={() => setCustomRecurrenceOpen(false)}>Cancel</Button>
//           <Button onClick={handleCustomRecurrenceSave} variant="contained">
//             Done
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Custom date-time picker dialog */}
//       <Dialog
//         open={customDateTimePickerOpen}
//         onClose={() => setCustomDateTimePickerOpen(false)}
//         maxWidth="xs"
//       >
//         <DialogTitle sx={{ pb: 1 }}>Add Date and Time</DialogTitle>

//         <DialogContent sx={{ pt: 1 }}>
//           <Box sx={{ mb: 2 }}>
//             <Box
//               sx={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 mb: 1,
//                 backgroundColor: "#f8f9fa",
//                 p: 1,
//                 borderRadius: 1,
//               }}
//             >
//               <IconButton onClick={() => changeCustomCalendarMonth(-1)}>
//                 <ChevronLeft />
//               </IconButton>
//               <Typography variant="h6" sx={{ fontWeight: 500 }}>
//                 {customCalendarDate.toLocaleDateString("en-US", {
//                   month: "long",
//                   year: "numeric",
//                 })}
//               </Typography>
//               <IconButton onClick={() => changeCustomCalendarMonth(1)}>
//                 <ChevronRight />
//               </IconButton>
//             </Box>

//             <Grid container spacing={0} columns={7}>
//               {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
//                 <Grid item xs={1} key={d}>
//                   <Box
//                     sx={{
//                       textAlign: "center",
//                       fontSize: 12,
//                       color: "#666",
//                       fontWeight: 500,
//                     }}
//                   >
//                     {d}
//                   </Box>
//                 </Grid>
//               ))}
//               {generateCustomCalendarDays()}
//             </Grid>
//           </Box>

//           <Box>
//             <Typography variant="subtitle2" sx={{ mb: 1 }}>
//               Select time
//             </Typography>

//             <LocalizationProvider dateAdapter={AdapterDayjs}>
//               <TimePicker
//                 value={dayjs(currentCustomTime, "hh:mm A")}
//                 onChange={handleCustomTimeChange}
//                 format="hh:mm a"
//                 slotProps={{
//                   textField: {
//                     size: "small",
//                     fullWidth: true,
//                   },
//                 }}
//               />
//             </LocalizationProvider>
//           </Box>
//         </DialogContent>

//         <DialogActions>
//           <Button onClick={() => setCustomDateTimePickerOpen(false)}>
//             Cancel
//           </Button>
//           <Button onClick={handleAddCustomDateTime} variant="contained">
//             Add
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }

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
  const [customDateTimePickerOpen, setCustomDateTimePickerOpen] =
    useState(false);
  const [currentCustomDate, setCurrentCustomDate] = useState(new Date());
  const [currentCustomTime, setCurrentCustomTime] = useState(
    dayjs().format("hh:mm A")
  );
  const [customCalendarDate, setCustomCalendarDate] = useState(new Date());

  // New state for custom months
  const [customMonths, setCustomMonths] = useState(Array(12).fill(false));

  // New state for yearly pattern
  const [yearlyPattern, setYearlyPattern] = useState({
    month: 2, // Default to February (2nd month)
    week: 2, // Default to 2nd week
    days: [false, true, false, false, false, true, false], // Default to Monday and Saturday
  });

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

  /* ---- date-picker ---- */
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date(2025, 8, 1));
  const [datePickerPurpose, setDatePickerPurpose] = useState("main"); // "main" or "end"

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

  const monthsOfYear = [
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

  const weeksOfMonth = [
    "First week",
    "Second week",
    "Third week",
    "Fourth week",
    "Last week",
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
            if (datePickerPurpose === "main") {
              setSelectedDate(date);
            } else if (datePickerPurpose === "end") {
              // Format the date as YYYY-MM-DD
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const day = String(date.getDate()).padStart(2, "0");
              setEndDate(`${year}-${month}-${day}`);
            }
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
      "Custom",
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

  // Format selected months for display
  const formatSelectedMonths = () => {
    const selected = monthsOfYear.filter((_, index) => customMonths[index]);
    if (selected.length === 0) return "";
    if (selected.length === 1) return selected[0];
    if (selected.length === 2) return selected.join(" and ");
    return (
      selected.slice(0, -1).join(", ") + " and " + selected[selected.length - 1]
    );
  };

  // Format selected days for yearly pattern
  const formatSelectedDaysForYearlyPattern = () => {
    const selected = daysOfWeek.filter((_, index) => yearlyPattern.days[index]);
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

  // Toggle month selection
  const handleMonthToggle = (index) => {
    const newCustomMonths = [...customMonths];
    newCustomMonths[index] = !newCustomMonths[index];
    setCustomMonths(newCustomMonths);
  };

  // Toggle day selection for yearly pattern
  const handleDayToggleForYearlyPattern = (index) => {
    const newYearlyPattern = { ...yearlyPattern };
    newYearlyPattern.days[index] = !newYearlyPattern.days[index];
    setYearlyPattern(newYearlyPattern);
  };

  // Handle month change for yearly pattern
  const handleMonthChangeForYearlyPattern = (e) => {
    const newYearlyPattern = { ...yearlyPattern };
    newYearlyPattern.month = Number(e.target.value);
    setYearlyPattern(newYearlyPattern);
  };

  // Handle week change for yearly pattern
  const handleWeekChangeForYearlyPattern = (e) => {
    const newYearlyPattern = { ...yearlyPattern };
    newYearlyPattern.week = Number(e.target.value);
    setYearlyPattern(newYearlyPattern);
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
    if (repeatOption === "Custom") {
      if (repeatPeriod === "month") {
        saveData.customDateTimes = customDateTimes;
      } else if (repeatPeriod === "year") {
        if (yearlyOption === "custom-dates") {
          saveData.customMonths = customMonths;
        } else if (yearlyOption === "custom-pattern") {
          saveData.yearlyPattern = yearlyPattern;
        }
      }
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

    // if (opt === "Custom...") {
    //   initializeSelectedDays();
    //   setCustomRecurrenceOpen(true);
    // } else
    if (opt === "Custom") {
      setCustomDateTimes([]);
      setCustomMonths(Array(12).fill(false));
      setCustomRecurrenceOpen(true);
      setRepeatPeriod("month");
      setMonthlyOption("custom-dates");
    }
  };

  const handleCustomRecurrenceSave = () => {
    let txt = "";
    if (repeatPeriod === "week") {
      const days = formatSelectedDays();
      txt = `Weekly on ${days}`;
    } else if (repeatPeriod === "month") {
      if (monthlyOption === "custom-dates") {
        txt = "Custom";
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
      if (yearlyOption === "same-day") {
        const month = selectedDate.toLocaleDateString("en-US", {
          month: "long",
        });
        const dayOfMonth = selectedDate.getDate();
        txt = `Annually on ${month} ${dayOfMonth}`;
      } else if (yearlyOption === "custom-dates") {
        const months = formatSelectedMonths();
        txt = `Annually in ${months}`;
      } else if (yearlyOption === "custom-pattern") {
        const monthName = monthsOfYear[yearlyPattern.month - 1];
        const weekName = weeksOfMonth[yearlyPattern.week - 1];
        const days = formatSelectedDaysForYearlyPattern();
        txt = `Annually in ${monthName}, ${weekName.toLowerCase()} on ${days}`;
      }
    } else {
      txt = `Every ${repeatEvery} ${repeatPeriod}${repeatEvery > 1 ? "s" : ""}`;
    }

    // Add "Ends" info
    if (endsOption === "on") {
      const untilDate = new Date(endDate);
      txt += `, until ${untilDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
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

    // Reset options when changing period
    if (newPeriod === "month") {
      setMonthlyOption("custom-dates");
      setYearlyOption("same-day");
    } else if (newPeriod === "year") {
      setMonthlyOption("first-tuesday");
      setYearlyOption("custom-dates");
    }
  };

  // Handle opening date picker for main date
  const handleMainDatePickerOpen = () => {
    setDatePickerPurpose("main");
    setDatePickerOpen(true);
  };

  // Handle opening date picker for end date
  const handleEndDatePickerOpen = () => {
    setDatePickerPurpose("end");
    setDatePickerOpen(true);
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
              onClick={handleMainDatePickerOpen}
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
          {repeatOption === "Custom" && (
            <Box sx={{ mt: 1, pl: 5 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {repeatPeriod === "month" && "Scheduled dates and times:"}
                {repeatPeriod === "year" &&
                  yearlyOption === "custom-dates" &&
                  "Scheduled months:"}
                {repeatPeriod === "year" &&
                  yearlyOption === "custom-pattern" &&
                  "Scheduled pattern:"}
              </Typography>

              {repeatPeriod === "month" && customDateTimes.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No dates added yet
                </Typography>
              )}

              {repeatPeriod === "year" &&
                yearlyOption === "custom-dates" &&
                customMonths.every((month) => !month) && (
                  <Typography variant="body2" color="text.secondary">
                    No months selected yet
                  </Typography>
                )}

              {repeatPeriod === "month" && customDateTimes.length > 0 && (
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

              {repeatPeriod === "year" && yearlyOption === "custom-dates" && (
                <Box>
                  <Grid container spacing={1}>
                    {monthsOfYear.map((month, index) => (
                      <Grid item key={month}>
                        <Chip
                          label={month.substring(0, 3)}
                          onClick={() => handleMonthToggle(index)}
                          color={customMonths[index] ? "primary" : "default"}
                          variant={customMonths[index] ? "filled" : "outlined"}
                          clickable
                          sx={{ borderRadius: 1, minWidth: 50 }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {repeatPeriod === "year" && yearlyOption === "custom-pattern" && (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {monthsOfYear[yearlyPattern.month - 1]},{" "}
                    {weeksOfMonth[yearlyPattern.week - 1].toLowerCase()} on{" "}
                    {formatSelectedDaysForYearlyPattern()}
                  </Typography>
                </Box>
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
                <Select value={repeatPeriod} onChange={handlePeriodChange}>
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
                <MenuItem value="custom-dates">Custom</MenuItem>
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
                <MenuItem value="custom-dates">
                  Specific months each year
                </MenuItem>
                <MenuItem value="custom-pattern">
                  Custom pattern (month, week, days)
                </MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Custom dates and times section - for monthly */}
          {repeatPeriod === "month" && monthlyOption === "custom-dates" && (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
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
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 2 }}
                >
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

          {/* Custom months section - for yearly */}
          {repeatPeriod === "year" && yearlyOption === "custom-dates" && (
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Select months
              </Typography>

              <Grid container spacing={1}>
                {monthsOfYear.map((month, index) => (
                  <Grid item key={month}>
                    <Chip
                      label={month.substring(0, 3)}
                      onClick={() => handleMonthToggle(index)}
                      color={customMonths[index] ? "primary" : "default"}
                      variant={customMonths[index] ? "filled" : "outlined"}
                      clickable
                      sx={{ borderRadius: 1, minWidth: 50 }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Custom pattern section - for yearly */}
          {repeatPeriod === "year" && yearlyOption === "custom-pattern" && (
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Select pattern
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "row",justifyContent: "space-between", gap: 2 }}>
                <Box sx={{flex:1}}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Month:
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={yearlyPattern.month}
                      onChange={handleMonthChangeForYearlyPattern}
                    >
                      {monthsOfYear.map((month, index) => (
                        <MenuItem key={month} value={index + 1}>
                          {month}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Week:
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={yearlyPattern.week}
                      onChange={handleWeekChangeForYearlyPattern}
                    >
                      {weeksOfMonth.map((week, index) => (
                        <MenuItem key={week} value={index + 1}>
                          {week}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Days:
                </Typography>
                <Grid container spacing={1}>
                  {daysOfWeek.map((day, index) => (
                    <Grid item key={day}>
                      <Chip
                        label={day.substring(0, 3)}
                        onClick={() => handleDayToggleForYearlyPattern(index)}
                        color={
                          yearlyPattern.days[index] ? "primary" : "default"
                        }
                        variant={
                          yearlyPattern.days[index] ? "filled" : "outlined"
                        }
                        clickable
                        sx={{ borderRadius: 1, minWidth: 50 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
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
                      onClick={handleEndDatePickerOpen}
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
