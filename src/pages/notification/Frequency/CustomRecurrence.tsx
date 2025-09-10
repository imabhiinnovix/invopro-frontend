
import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Grid,
  Chip,
} from "@mui/material";
import EndDatePicker from "./EndDatePicker";

const CustomRecurrence = ({
  open,
  onClose,
  repeatEvery,
  setRepeatEvery,
  repeatPeriod,
  setRepeatPeriod,
  monthlyOption,
  setMonthlyOption,
  endsOption,
  setEndsOption,
  endDate,
  setEndDate,
  occurrences,
  setOccurrences,
  selectedDays,
  setSelectedDays,
  selectedDate,
  onSave,
  setEndCalendarDate,
  endCalendarDate,
  isEditMode = false,
  initialData = null,
}) => {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Memoize the initialization function to prevent unnecessary re-renders
  const initializeFromInitialData = useCallback(() => {
    if (!isEditMode || !initialData || hasInitialized) return;
    
    console.log("Initializing CustomRecurrence in edit mode with data:", initialData);
    
    // Initialize days of week from initialData
    if (initialData.daysOfWeek && Array.isArray(initialData.daysOfWeek)) {
      const newSelectedDays = [false, false, false, false, false, false, false];
      initialData.daysOfWeek.forEach(dayIndex => {
        if (dayIndex >= 0 && dayIndex <= 6) {
          newSelectedDays[dayIndex] = true;
        }
      });
      setSelectedDays(newSelectedDays);
    }
    
    // Initialize other fields from initialData
    if (initialData.interval) {
      setRepeatEvery(initialData.interval);
    }
    
    if (initialData.schedulerEndDate) {
      setEndDate(new Date(initialData.schedulerEndDate));
      setEndsOption("on");
    } else if (initialData.maxOccurrences) {
      setOccurrences(initialData.maxOccurrences);
      setEndsOption("after");
    } else {
      setEndsOption("never");
    }
    
    // Set monthly option if applicable
    if (initialData.frequency === "monthly") {
      if (initialData.dayOfMonth && initialData.dayOfMonth.length > 0) {
        setMonthlyOption(`Monthly on day ${initialData.dayOfMonth[0]}`);
      } else if (
        initialData.weekOfMonth &&
        initialData.weekOfMonth.length > 0 &&
        initialData.dayOfWeekInMonth !== undefined
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
          initialData.weekOfMonth[0] === 5
            ? "last"
            : occurrenceMap[initialData.weekOfMonth[0] - 1];
        setMonthlyOption(
          `Monthly on the ${occurrence} ${dayNames[initialData.dayOfWeekInMonth]}`
        );
      }
    }
    
    setHasInitialized(true);
  }, [
    isEditMode, 
    initialData, 
    hasInitialized, 
    setSelectedDays, 
    setRepeatEvery, 
    setEndDate, 
    setEndsOption, 
    setOccurrences, 
    setMonthlyOption
  ]);
  
  // Initialize from props when opening in edit mode
  useEffect(() => {
    if (open) {
      if (isEditMode && initialData && !hasInitialized) {
        initializeFromInitialData();
      } else if (!isEditMode) {
        // Reset initialization flag when not in edit mode
        setHasInitialized(false);
      }
    }
  }, [open, isEditMode, initialData, hasInitialized, initializeFromInitialData]);
  
  // Reset initialization flag when dialog closes
  useEffect(() => {
    if (!open) {
      setHasInitialized(false);
    }
  }, [open]);
  
  // Helper functions
  const numberToWord = useCallback((n) => {
    const words = ["first", "second", "third", "fourth", "fifth"];
    return words[n - 1] || n;
  }, []);
  
  const getOrdinalOccurrence = useCallback((date) => {
    const day = date.getDate();
    const weekday = date.getDay();
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstWeekday = firstDayOfMonth.getDay();
    const offset = (weekday - firstWeekday + 7) % 7;
    const occurrenceNum = Math.floor((day - 1 - offset) / 7) + 1;
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const lastWeekday = lastDayOfMonth.getDay();
    const isLast = lastDayOfMonth.getDate() - day < 7;
    return {
      occurrence: isLast ? "last" : numberToWord(occurrenceNum),
      weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
    };
  }, [numberToWord]);
  
  const getMonthlyOptions = useCallback(() => {
    const dayOfMonth = selectedDate.getDate();
    const { occurrence, weekday } = getOrdinalOccurrence(selectedDate);
    return [
      `Monthly on day ${dayOfMonth}`,
      `Monthly on the ${occurrence} ${weekday}`,
    ];
  }, [selectedDate, getOrdinalOccurrence]);
  
  const formatSelectedDays = useCallback(() => {
    const selected = daysOfWeek.filter((_, index) => selectedDays[index]);
    if (selected.length === 0) {
      const currentDay = selectedDate.getDay();
      return daysOfWeek[currentDay];
    }
    if (selected.length === 1) return selected[0];
    if (selected.length === 2) return selected.join(" and ");
    return (
      selected.slice(0, -1).join(", ") + " and " + selected[selected.length - 1]
    );
  }, [selectedDays, selectedDate, daysOfWeek]);
  
  const handleDayToggle = useCallback((index) => {
    const newSelectedDays = [...selectedDays];
    newSelectedDays[index] = !newSelectedDays[index];
    setSelectedDays(newSelectedDays);
    console.log("Updated selectedDays:", newSelectedDays);
  }, [selectedDays, setSelectedDays]);
  
  const handleEndsOptionChange = useCallback((value) => {
    setEndsOption(value);
    if (value === "never") {
      setEndDate(null);
      setOccurrences(0);
    } else if (value === "on") {
      setOccurrences(0);
    } else if (value === "after") {
      setEndDate(null);
    }
  }, [setEndsOption, setEndDate, setOccurrences]);
  
  const handleCustomRecurrenceSave = useCallback(() => {
    let txt = "";
    if (repeatPeriod === "week") {
      const days = formatSelectedDays();
      txt = repeatEvery > 1 ? `Every ${repeatEvery} weeks on ${days}` : `Weekly on ${days}`;
    } else if (repeatPeriod === "month") {
      txt = monthlyOption;
    } else if (repeatPeriod === "year") {
      const month = selectedDate.toLocaleDateString("en-US", { month: "long" });
      const dayOfMonth = selectedDate.getDate();
      txt = repeatEvery > 1 
        ? `Every ${repeatEvery} years on ${month} ${dayOfMonth}` 
        : `Annually on ${month} ${dayOfMonth}`;
    } else {
      txt = `Every ${repeatEvery} ${repeatPeriod}${repeatEvery > 1 ? "s" : ""}`;
    }
    if (endsOption === "on" && endDate) {
      const untilDate = new Date(endDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      txt += `, until ${untilDate}`;
    } else if (endsOption === "after" && occurrences > 0) {
      txt += `, ending after ${occurrences} occurrence${occurrences > 1 ? "s" : ""}`;
    }
    onSave(txt, selectedDays);
    onClose();
  }, [
    repeatPeriod, 
    formatSelectedDays, 
    repeatEvery, 
    monthlyOption, 
    selectedDate, 
    endsOption, 
    endDate, 
    occurrences, 
    onSave, 
    selectedDays, 
    onClose
  ]);
  
  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
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
                  onChange={(e) => {
                    setRepeatPeriod(e.target.value);
                    if (e.target.value !== "week") {
                      setSelectedDays([
                        false,
                        false,
                        false,
                        false,
                        false,
                        false,
                        false,
                      ]);
                    }
                  }}
                >
                  <MenuItem value="day">{repeatEvery === 1 ? "day" : "days"}</MenuItem>
                  <MenuItem value="week">{repeatEvery === 1 ? "week" : "weeks"}</MenuItem>
                  <MenuItem value="month">{repeatEvery === 1 ? "month" : "months"}</MenuItem>
                  <MenuItem value="year">{repeatEvery === 1 ? "year" : "years"}</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          {repeatPeriod === "week" && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
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
          {repeatPeriod === "month" && (
            <FormControl fullWidth size="small">
              <Select
                value={monthlyOption}
                onChange={(e) => setMonthlyOption(e.target.value)}
              >
                {getMonthlyOptions().map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Ends
            </Typography>
            <RadioGroup
              value={endsOption}
              onChange={(e) => handleEndsOptionChange(e.target.value)}
            >
              <FormControlLabel value="never" control={<Radio size="small" />} label="Never" />
              <FormControlLabel
                value="on"
                control={<Radio size="small" />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    On
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setEndDatePickerOpen(true)}
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
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
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleCustomRecurrenceSave} variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>
      <EndDatePicker
        open={endDatePickerOpen}
        onClose={() => setEndDatePickerOpen(false)}
        endDate={endDate}
        setEndDate={setEndDate}
        endCalendarDate={endCalendarDate}
        setEndCalendarDate={setEndCalendarDate}
      />
    </>
  );
};

export default CustomRecurrence;


// // CustomRecurrence.js
// import React, { useState, useEffect, useCallback } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Box,
//   Typography,
//   Radio,
//   RadioGroup,
//   FormControlLabel,
//   TextField,
//   Select,
//   MenuItem,
//   FormControl,
//   Grid,
//   Chip,
// } from "@mui/material";
// import EndDatePicker from "./EndDatePicker";

// const CustomRecurrence = ({
//   open,
//   onClose,
//   repeatEvery,
//   setRepeatEvery,
//   repeatPeriod,
//   setRepeatPeriod,
//   monthlyOption,
//   setMonthlyOption,
//   endsOption,
//   setEndsOption,
//   endDate,
//   setEndDate,
//   occurrences,
//   setOccurrences,
//   selectedDays,
//   setSelectedDays,
//   selectedDate,
//   onSave,
//   setEndCalendarDate,
//   endCalendarDate,
//   isEditMode = false,
//   initialData = null,
// }) => {
//   const daysOfWeek = [
//     "Sunday",
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday",
//   ];
//   const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);
//   const [hasInitialized, setHasInitialized] = useState(false);
  
//   // Memoize the initialization function to prevent unnecessary re-renders
//   const initializeFromInitialData = useCallback(() => {
//     if (!isEditMode || !initialData || hasInitialized) return;
    
//     console.log("Initializing CustomRecurrence in edit mode with data:", initialData);
    
//     // Initialize days of week from initialData
//     if (initialData.daysOfWeek && Array.isArray(initialData.daysOfWeek)) {
//       const newSelectedDays = [false, false, false, false, false, false, false];
//       initialData.daysOfWeek.forEach(dayIndex => {
//         if (dayIndex >= 0 && dayIndex <= 6) {
//           newSelectedDays[dayIndex] = true;
//         }
//       });
//       setSelectedDays(newSelectedDays);
//     }
    
//     // Initialize other fields from initialData
//     if (initialData.interval) {
//       setRepeatEvery(initialData.interval);
//     }
    
//     if (initialData.schedulerEndDate) {
//       setEndDate(new Date(initialData.schedulerEndDate));
//       setEndsOption("on");
//     } else if (initialData.maxOccurrences) {
//       setOccurrences(initialData.maxOccurrences);
//       setEndsOption("after");
//     } else {
//       setEndsOption("never");
//     }
    
//     // Set monthly option if applicable
//     if (initialData.frequency === "monthly") {
//       if (initialData.dayOfMonth && initialData.dayOfMonth.length > 0) {
//         setMonthlyOption(`Monthly on day ${initialData.dayOfMonth[0]}`);
//       } else if (
//         initialData.weekOfMonth &&
//         initialData.weekOfMonth.length > 0 &&
//         initialData.dayOfWeekInMonth !== undefined
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
//           initialData.weekOfMonth[0] === 5
//             ? "last"
//             : occurrenceMap[initialData.weekOfMonth[0] - 1];
//         setMonthlyOption(
//           `Monthly on the ${occurrence} ${dayNames[initialData.dayOfWeekInMonth]}`
//         );
//       }
//     }
    
//     setHasInitialized(true);
//   }, [
//     isEditMode, 
//     initialData, 
//     hasInitialized, 
//     setSelectedDays, 
//     setRepeatEvery, 
//     setEndDate, 
//     setEndsOption, 
//     setOccurrences, 
//     setMonthlyOption
//   ]);
  
//   // Initialize from props when opening in edit mode
//   useEffect(() => {
//     if (open) {
//       if (isEditMode && initialData && !hasInitialized) {
//         initializeFromInitialData();
//       } else if (!isEditMode) {
//         // Reset initialization flag when not in edit mode
//         setHasInitialized(false);
//       }
//     }
//   }, [open, isEditMode, initialData, hasInitialized, initializeFromInitialData]);
  
//   // Reset initialization flag when dialog closes
//   useEffect(() => {
//     if (!open) {
//       setHasInitialized(false);
//     }
//   }, [open]);
  
//   // Helper functions
//   const numberToWord = useCallback((n) => {
//     const words = ["first", "second", "third", "fourth", "fifth"];
//     return words[n - 1] || n;
//   }, []);
  
//   const getOrdinalOccurrence = useCallback((date) => {
//     const day = date.getDate();
//     const weekday = date.getDay();
//     const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
//     const firstWeekday = firstDayOfMonth.getDay();
//     const offset = (weekday - firstWeekday + 7) % 7;
//     const occurrenceNum = Math.floor((day - 1 - offset) / 7) + 1;
//     const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
//     const lastWeekday = lastDayOfMonth.getDay();
//     const isLast = lastDayOfMonth.getDate() - day < 7;
//     return {
//       occurrence: isLast ? "last" : numberToWord(occurrenceNum),
//       weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
//     };
//   }, [numberToWord]);
  
//   const getMonthlyOptions = useCallback(() => {
//     const dayOfMonth = selectedDate.getDate();
//     const { occurrence, weekday } = getOrdinalOccurrence(selectedDate);
//     return [
//       `Monthly on day ${dayOfMonth}`,
//       `Monthly on the ${occurrence} ${weekday}`,
//     ];
//   }, [selectedDate, getOrdinalOccurrence]);
  
//   const formatSelectedDays = useCallback(() => {
//     const selected = daysOfWeek.filter((_, index) => selectedDays[index]);
//     if (selected.length === 0) {
//       const currentDay = selectedDate.getDay();
//       return daysOfWeek[currentDay];
//     }
//     if (selected.length === 1) return selected[0];
//     if (selected.length === 2) return selected.join(" and ");
//     return (
//       selected.slice(0, -1).join(", ") + " and " + selected[selected.length - 1]
//     );
//   }, [selectedDays, selectedDate, daysOfWeek]);
  
//   const handleDayToggle = useCallback((index) => {
//     const newSelectedDays = [...selectedDays];
//     newSelectedDays[index] = !newSelectedDays[index];
//     setSelectedDays(newSelectedDays);
//     console.log("Updated selectedDays:", newSelectedDays);
//   }, [selectedDays, setSelectedDays]);
  
//   const handleEndsOptionChange = useCallback((value) => {
//     setEndsOption(value);
//     if (value === "never") {
//       setEndDate(null);
//       setOccurrences(0);
//     } else if (value === "on") {
//       setOccurrences(0);
//     } else if (value === "after") {
//       setEndDate(null);
//     }
//   }, [setEndsOption, setEndDate, setOccurrences]);
  
//   const handleCustomRecurrenceSave = useCallback(() => {
//     let txt = "";
//     if (repeatPeriod === "week") {
//       const days = formatSelectedDays();
//       txt = repeatEvery > 1 ? `Every ${repeatEvery} weeks on ${days}` : `Weekly on ${days}`;
//     } else if (repeatPeriod === "month") {
//       txt = monthlyOption;
//     } else if (repeatPeriod === "year") {
//       const month = selectedDate.toLocaleDateString("en-US", { month: "long" });
//       const dayOfMonth = selectedDate.getDate();
//       txt = repeatEvery > 1 
//         ? `Every ${repeatEvery} years on ${month} ${dayOfMonth}` 
//         : `Annually on ${month} ${dayOfMonth}`;
//     } else {
//       txt = `Every ${repeatEvery} ${repeatPeriod}${repeatEvery > 1 ? "s" : ""}`;
//     }
//     if (endsOption === "on" && endDate) {
//       const untilDate = new Date(endDate).toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         year: "numeric",
//       });
//       txt += `, until ${untilDate}`;
//     } else if (endsOption === "after" && occurrences > 0) {
//       txt += `, ending after ${occurrences} occurrence${occurrences > 1 ? "s" : ""}`;
//     }
//     onSave(txt, selectedDays);
//     onClose();
//   }, [
//     repeatPeriod, 
//     formatSelectedDays, 
//     repeatEvery, 
//     monthlyOption, 
//     selectedDate, 
//     endsOption, 
//     endDate, 
//     occurrences, 
//     onSave, 
//     selectedDays, 
//     onClose
//   ]);
  
//   return (
//     <>
//       <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
//           <Box>
//             <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
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
//                   onChange={(e) => {
//                     setRepeatPeriod(e.target.value);
//                     if (e.target.value !== "week") {
//                       setSelectedDays([
//                         false,
//                         false,
//                         false,
//                         false,
//                         false,
//                         false,
//                         false,
//                       ]);
//                     }
//                   }}
//                 >
//                   <MenuItem value="day">{repeatEvery === 1 ? "day" : "days"}</MenuItem>
//                   <MenuItem value="week">{repeatEvery === 1 ? "week" : "weeks"}</MenuItem>
//                   <MenuItem value="month">{repeatEvery === 1 ? "month" : "months"}</MenuItem>
//                   <MenuItem value="year">{repeatEvery === 1 ? "year" : "years"}</MenuItem>
//                 </Select>
//               </FormControl>
//             </Box>
//           </Box>
//           {repeatPeriod === "week" && (
//             <Box>
//               <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
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
//           {repeatPeriod === "month" && (
//             <FormControl fullWidth size="small">
//               <Select
//                 value={monthlyOption}
//                 onChange={(e) => setMonthlyOption(e.target.value)}
//               >
//                 {getMonthlyOptions().map((option) => (
//                   <MenuItem key={option} value={option}>{option}</MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           )}
//           <Box>
//             <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
//               Ends
//             </Typography>
//             <RadioGroup
//               value={endsOption}
//               onChange={(e) => handleEndsOptionChange(e.target.value)}
//             >
//               <FormControlLabel value="never" control={<Radio size="small" />} label="Never" />
//               <FormControlLabel
//                 value="on"
//                 control={<Radio size="small" />}
//                 label={
//                   <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                     On
//                     <Button
//                       variant="outlined"
//                       size="small"
//                       onClick={() => setEndDatePickerOpen(true)}
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
//                   <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
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
//           <Button onClick={onClose}>Cancel</Button>
//           <Button onClick={handleCustomRecurrenceSave} variant="contained">
//             Done
//           </Button>
//         </DialogActions>
//       </Dialog>
//       <EndDatePicker
//         open={endDatePickerOpen}
//         onClose={() => setEndDatePickerOpen(false)}
//         endDate={endDate}
//         setEndDate={setEndDate}
//         endCalendarDate={endCalendarDate}
//         setEndCalendarDate={setEndCalendarDate}
//       />
//     </>
//   );
// };

// export default CustomRecurrence;