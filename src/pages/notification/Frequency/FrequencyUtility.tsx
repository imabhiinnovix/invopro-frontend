

import { Button, Grid } from "@mui/material";

// Helper function to compare arrays
export const arraysEqual = (a, b) => {
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
export const transformUIToAPIFrequency = (uiFrequency) => {
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
// FrequencyUtility.tsx - Fix for formatDateForDisplay in getExactUIFrequencyFromAPI

export const getExactUIFrequencyFromAPI = (row, selectedDate) => {
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
    
    // Check if it's already a Date object
    if (dateString instanceof Date) {
      return dateString.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    
    // If it's a string, try to convert it to a Date object
    if (typeof dateString === 'string') {
      const date = new Date(dateString);
      // Check if the conversion resulted in a valid date
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    }
    
    // If it's a timestamp (number), convert it to a Date object
    if (typeof dateString === 'number') {
      const date = new Date(dateString);
      // Check if the conversion resulted in a valid date
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    }
    
    // If we can't convert it to a valid date, return a fallback or null
    return null;
  };
  
  const formatEndCondition = (maxOccurrences, schedulerEndDate) => {
    if (maxOccurrences && maxOccurrences > 0) {
      return `, ending after ${maxOccurrences} occurrence${maxOccurrences > 1 ? "s" : ""}`;
    } else if (schedulerEndDate) {
      const endDate = formatDateForDisplay(schedulerEndDate);
      return endDate ? `, until ${endDate}` : "";
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
        return endDate ? `Daily until ${endDate}` : "Daily";
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
// FrequencyUtility.tsx - Fix for formatDateForDisplay function

export const generateCustomFrequencyText = (
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
    
    // Check if date is already a Date object
    if (date instanceof Date) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    
    // If it's a string, try to convert it to a Date object
    if (typeof date === 'string') {
      const dateObj = new Date(date);
      // Check if the conversion resulted in a valid date
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    }
    
    // If it's a timestamp (number), convert it to a Date object
    if (typeof date === 'number') {
      const dateObj = new Date(date);
      // Check if the conversion resulted in a valid date
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    }
    
    // If we can't convert it to a valid date, return a fallback or null
    return null;
  };
  
  const formatEndCondition = (maxOccurrences, schedulerEndDate) => {
    if (maxOccurrences && maxOccurrences > 0) {
      return `, ending after ${maxOccurrences} occurrence${maxOccurrences > 1 ? "s" : ""}`;
    } else if (schedulerEndDate) {
      const endDateStr = formatDateForDisplay(schedulerEndDate);
      return endDateStr ? `, until ${endDateStr}` : "";
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
// Date utility functions
// FrequencyUtility.tsx - Fix for formatDate function

export const formatDate = (d) => {
  if (!d) return "Invalid Date";
  
  // Check if it's already a Date object
  if (d instanceof Date) {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  
  // If it's a string, try to convert it to a Date object
  if (typeof d === 'string') {
    const date = new Date(d);
    // Check if the conversion resulted in a valid date
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }
  
  // If it's a timestamp (number), convert it to a Date object
  if (typeof d === 'number') {
    const date = new Date(d);
    // Check if the conversion resulted in a valid date
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }
  
  // If we can't convert it to a valid date, return a fallback
  return "Invalid Date";
};

export const changeCalendarMonth = (setCalendarDate, delta) => {
  setCalendarDate((d) => {
    const next = new Date(d);
    next.setMonth(d.getMonth() + delta);
    return next;
  });
};

export const generateCalendarDays = (calendarDate, selectedDate, setSelectedDate, setDatePickerOpen) => {
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


// FrequencyUtility.tsx
// import { Button, Grid } from "@mui/material";

// // Helper function to compare arrays
// export const arraysEqual = (a, b) => {
//   if (a === b) return true;
//   if (a == null || b == null) return false;
//   if (a.length !== b.length) return false;
//   const sortedA = [...a].sort();
//   const sortedB = [...b].sort();
//   for (let i = 0; i < sortedA.length; ++i) {
//     if (sortedA[i] !== sortedB[i]) return false;
//   }
//   return true;
// };

// // Transform UI frequency value to API frequency value
// export const transformUIToAPIFrequency = (uiFrequency) => {
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
//       if (uiFrequency.startsWith("Weekly on")) return "weekly";
//       if (uiFrequency.startsWith("Monthly on")) return "monthly";
//       if (uiFrequency.startsWith("Annually on")) return "yearly";
//       return uiFrequency;
//   }
// };

// // Transform API frequency value to UI frequency value
// export const getExactUIFrequencyFromAPI = (row, selectedDate) => {
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
//     interval = 1,
//   } = row;
  
//   const formatDateForDisplay = (dateString) => {
//     if (!dateString) return null;
    
//     // Check if it's already a Date object
//     if (dateString instanceof Date) {
//       return dateString.toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         year: "numeric",
//       });
//     }
    
//     // If it's a string, try to convert it to a Date object
//     if (typeof dateString === 'string') {
//       const date = new Date(dateString);
//       // Check if the conversion resulted in a valid date
//       if (!isNaN(date.getTime())) {
//         return date.toLocaleDateString("en-US", {
//           month: "short",
//           day: "numeric",
//           year: "numeric",
//         });
//       }
//     }
    
//     // If it's a timestamp (number), convert it to a Date object
//     if (typeof dateString === 'number') {
//       const date = new Date(dateString);
//       // Check if the conversion resulted in a valid date
//       if (!isNaN(date.getTime())) {
//         return date.toLocaleDateString("en-US", {
//           month: "short",
//           day: "numeric",
//           year: "numeric",
//         });
//       }
//     }
    
//     // If we can't convert it to a valid date, return a fallback or null
//     return null;
//   };
  
//   const formatEndCondition = (maxOccurrences, schedulerEndDate) => {
//     if (maxOccurrences && maxOccurrences > 0) {
//       return `, ending after ${maxOccurrences} occurrence${maxOccurrences > 1 ? "s" : ""}`;
//     } else if (schedulerEndDate) {
//       const endDate = formatDateForDisplay(schedulerEndDate);
//       return endDate ? `, until ${endDate}` : "";
//     }
//     return "";
//   };
  
//   switch (frequency) {
//     case "once":
//       return "Do not repeat";
//     case "daily":
//       if (interval !== undefined) {
//         const base = `Every ${interval} day${interval > 1 ? "s" : ""}`;
//         return base + formatEndCondition(maxOccurrences, schedulerEndDate);
//       }
//       if (maxOccurrences && maxOccurrences > 0) {
//         return `Daily for ${maxOccurrences} time${maxOccurrences > 1 ? "s" : ""}`;
//       }
//       if (schedulerEndDate) {
//         const endDate = formatDateForDisplay(schedulerEndDate);
//         return endDate ? `Daily until ${endDate}` : "Daily";
//       }
//       return "Daily";
//     case "weekly":
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
//         const selectedDayNames = daysOfWeek
//           .filter((day) => day >= 0 && day <= 6)
//           .map((day) => dayNames[day])
//           .sort((a, b) => {
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
//       if (dayOfMonth && Array.isArray(dayOfMonth) && dayOfMonth.length > 0) {
//         const base =
//           interval > 1
//             ? `Every ${interval} months on day ${dayOfMonth[0]}`
//             : `Monthly on day ${dayOfMonth[0]}`;
//         return base + formatEndCondition(maxOccurrences, schedulerEndDate);
//       }
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
//       const base = `Every ${interval} ${period}`;
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
//           .filter((day) => day >= 0 && day <= 6)
//           .map((day) => dayNames[day])
//           .sort((a, b) => {
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
//       return frequency;
//   }
// };

// // Generate custom frequency text based on current state
// export const generateCustomFrequencyText = (
//   repeatEvery,
//   repeatPeriod,
//   selectedDays,
//   monthlyOption,
//   endDate,
//   occurrences,
//   endsOption,
//   selectedDate
// ) => {
//   const formatDateForDisplay = (date) => {
//     if (!date) return null;
    
//     // Check if date is already a Date object
//     if (date instanceof Date) {
//       return date.toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         year: "numeric",
//       });
//     }
    
//     // If it's a string, try to convert it to a Date object
//     if (typeof date === 'string') {
//       const dateObj = new Date(date);
//       // Check if the conversion resulted in a valid date
//       if (!isNaN(dateObj.getTime())) {
//         return dateObj.toLocaleDateString("en-US", {
//           month: "short",
//           day: "numeric",
//           year: "numeric",
//         });
//       }
//     }
    
//     // If it's a timestamp (number), convert it to a Date object
//     if (typeof date === 'number') {
//       const dateObj = new Date(date);
//       // Check if the conversion resulted in a valid date
//       if (!isNaN(dateObj.getTime())) {
//         return dateObj.toLocaleDateString("en-US", {
//           month: "short",
//           day: "numeric",
//           year: "numeric",
//         });
//       }
//     }
    
//     // If we can't convert it to a valid date, return a fallback or null
//     return null;
//   };
  
//   const formatEndCondition = (maxOccurrences, schedulerEndDate) => {
//     if (maxOccurrences && maxOccurrences > 0) {
//       return `, ending after ${maxOccurrences} occurrence${maxOccurrences > 1 ? "s" : ""}`;
//     } else if (schedulerEndDate) {
//       const endDateStr = formatDateForDisplay(schedulerEndDate);
//       return endDateStr ? `, until ${endDateStr}` : "";
//     }
//     return "";
//   };
  
//   let base = "";
//   let details = "";
//   const dayNames = [
//     "Sunday",
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday",
//   ];
  
//   if (repeatPeriod === "day") {
//     base = `Every ${repeatEvery} day${repeatEvery > 1 ? "s" : ""}`;
//   } else if (repeatPeriod === "week") {
//     let selectedDayNames = [];
//     if (Array.isArray(selectedDays) && selectedDays.length === 7) {
//       selectedDayNames = selectedDays
//         .map((isSelected, index) => (isSelected ? dayNames[index] : null))
//         .filter(Boolean)
//         .sort((a, b) => {
//           const order = [
//             "Sunday",
//             "Monday",
//             "Tuesday",
//             "Wednesday",
//             "Thursday",
//             "Friday",
//             "Saturday",
//           ];
//           return order.indexOf(a) - order.indexOf(b);
//         });
//     } else {
//       selectedDayNames = [dayNames[selectedDate.getDay()]];
//     }
//     const formattedDays =
//       selectedDayNames.length > 1
//         ? `${selectedDayNames.slice(0, -1).join(", ")} and ${selectedDayNames.slice(-1)}`
//         : selectedDayNames[0] || dayNames[selectedDate.getDay()];
//     base = `Every ${repeatEvery} week${repeatEvery > 1 ? "s" : ""}`;
//     details = ` on ${formattedDays}`;
//   } else if (repeatPeriod === "month") {
//     base = `Every ${repeatEvery} month${repeatEvery > 1 ? "s" : ""}`;
//     if (monthlyOption && monthlyOption.startsWith("Monthly on day")) {
//       const dayNumber = parseInt(monthlyOption.split(" ").pop());
//       details = ` on day ${dayNumber}`;
//     } else if (monthlyOption && monthlyOption.startsWith("Monthly on the")) {
//       details = ` on the ${monthlyOption.replace("Monthly on the ", "")}`;
//     }
//   } else if (repeatPeriod === "year") {
//     const month = selectedDate.toLocaleDateString("en-US", { month: "long" });
//     const day = selectedDate.getDate();
//     base = `Every ${repeatEvery} year${repeatEvery > 1 ? "s" : ""}`;
//     details = ` on ${month} ${day}`;
//   }
  
//   return base + details + formatEndCondition(occurrences, endDate);
// };

// // Date utility functions
// export const formatDate = (d) => {
//   if (!d) return "Invalid Date";
  
//   // Check if it's already a Date object
//   if (d instanceof Date) {
//     return d.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });
//   }
  
//   // If it's a string, try to convert it to a Date object
//   if (typeof d === 'string') {
//     const date = new Date(d);
//     // Check if the conversion resulted in a valid date
//     if (!isNaN(date.getTime())) {
//       return date.toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         year: "numeric",
//       });
//     }
//   }
  
//   // If it's a timestamp (number), convert it to a Date object
//   if (typeof d === 'number') {
//     const date = new Date(d);
//     // Check if the conversion resulted in a valid date
//     if (!isNaN(date.getTime())) {
//       return date.toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         year: "numeric",
//       });
//     }
//   }
  
//   // If we can't convert it to a valid date, return a fallback
//   return "Invalid Date";
// };

// export const changeCalendarMonth = (setCalendarDate, delta) => {
//   setCalendarDate((d) => {
//     const next = new Date(d);
//     next.setMonth(d.getMonth() + delta);
//     return next;
//   });
// };

// export const generateCalendarDays = (calendarDate, selectedDate, setDatePickerOpen) => {
//   const y = calendarDate.getFullYear();
//   const m = calendarDate.getMonth();
//   const first = new Date(y, m, 1).getDay();
//   const daysInMonth = new Date(y, m + 1, 0).getDate();
//   const cells = [];
//   const today = new Date();
  
//   for (let i = 0; i < first; i++) {
//     cells.push(<Grid item xs={1} key={`empty-${i}`} />);
//   }
  
//   for (let d = 1; d <= daysInMonth; d++) {
//     const date = new Date(y, m, d);
//     const isSel = date.toDateString() === selectedDate.toDateString();
//     const isToday = date.toDateString() === today.toDateString();
//     const isCurrentMonth = date.getMonth() === calendarDate.getMonth();
    
//     cells.push(
//       <Grid item xs={1} key={d} sx={{ textAlign: "center" }}>
//         <Button
//           onClick={() => {
//             setSelectedDate(date);
//             setDatePickerOpen(false);
//           }}
//           sx={(theme) => ({
//             width: 36,
//             height: 36,
//             minWidth: 36,
//             borderRadius: "50%",
//             fontSize: "0.875rem",
//             color: isSel
//               ? "#fff"
//               : isCurrentMonth
//                 ? theme.palette.text.primary
//                 : theme.palette.text.disabled,
//             backgroundColor: isSel
//               ? theme.palette.primary.main
//               : "transparent",
//             border:
//               isToday && !isSel
//                 ? `1px solid ${theme.palette.primary.main}`
//                 : "none",
//             fontWeight: isSel ? 600 : 400,
//             "&:hover": {
//               backgroundColor: isSel
//                 ? theme.palette.primary.main
//                 : theme.palette.action.hover,
//             },
//           })}
//         >
//           {d}
//         </Button>
//       </Grid>
//     );
//   }
  
//   return cells;
// };

