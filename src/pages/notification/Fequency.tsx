

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
  Card,
  CardContent,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Select,
  MenuItem,
  Chip,
  IconButton,
} from "@mui/material";
import { STYLE_GUIDE } from "../../styles";
import { GridDeleteIcon } from "@mui/x-data-grid";

// Constants
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
];

// Styles
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
      ? STYLE_GUIDE.COLORS.materialBlue
      : STYLE_GUIDE.COLORS.white,
    color: selected ? STYLE_GUIDE.COLORS.white : STYLE_GUIDE.COLORS.black,
    fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
    transition: "all 0.3s",
    "&:hover": {
      backgroundColor: selected
        ? STYLE_GUIDE.COLORS.materialBlue
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
    color: STYLE_GUIDE.COLORS.materialBlue,
  },
  reminderContainer: {
    marginBottom: STYLE_GUIDE.SPACING.s6,
    display: "flex",
    flexDirection: "column",
    gap: STYLE_GUIDE.SPACING.s3,
  },
  reminderCard: {
    minWidth: "200px",
    maxWidth: "300px",
    border: `1px solid ${STYLE_GUIDE.COLORS.borderPrimary}`,
    borderRadius: STYLE_GUIDE.SPACING.s1,
    backgroundColor: STYLE_GUIDE.COLORS.backgroundGray,
    transition: "transform 0.2s",
    "&:hover": {
      transform: "scale(1.02)",
    },
    "@media (max-width: 600px)": {
      maxWidth: "100%",
    },
  },
  reminderText: {
    fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
    margin: `0 0 ${STYLE_GUIDE.SPACING.s1} 0`,
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: STYLE_GUIDE.SPACING.s6,
  },
};

// RRuleGenerator Component
const RRuleGenerator = ({ onChange, value, config = {} }) => {
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
  const [startDate, setStartDate] = useState("2019-03-02");
  const [repeatType, setRepeatType] = useState("Yearly");
  const [yearlyType, setYearlyType] = useState(
    defaultConfig.yearly === "on the" ? "onthe" : "on"
  );
  const [yearlyMonths, setYearlyMonths] = useState(["Jan"]);
  const [yearlyDays, setYearlyDays] = useState(["1"]);
  const [yearlyWeeks, setYearlyWeeks] = useState(["First"]);
  const [yearlyWeekDays, setYearlyWeekDays] = useState(["Monday"]);
  const [yearlyWeekMonths, setYearlyWeekMonths] = useState(["Jan"]);
  const [monthlyType, setMonthlyType] = useState(
    defaultConfig.monthly === "on the" ? "onthe" : "on"
  );
  const [monthlyDays, setMonthlyDays] = useState(["1"]);
  const [monthlyWeeks, setMonthlyWeeks] = useState(["First"]);
  const [monthlyWeekDays, setMonthlyWeekDays] = useState(["Monday"]);
  const [weeklyDays, setWeeklyDays] = useState(["Monday"]);
  const [interval, setInterval] = useState(1);
  const [endType, setEndType] = useState("Never");
  const [endDate, setEndDate] = useState("");
  const [endAfter, setEndAfter] = useState(1);
  const [reminders, setReminders] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [acknowledgeChecked, setAcknowledgeChecked] = useState(false);
  const [attachedChecked, setAttachedChecked] = useState(false);
  const [time, setTime] = useState("");

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

  const handleAddReminder = () => {
    const rrule = generateRRule();
    if (!rrule) return; // Prevent adding invalid RRules

    // Construct backend payload
    const daysOfWeek =
      repeatType === "Weekly"
        ? weeklyDays
            .map((day) => backendDayIndices[day])
            .filter((idx) => idx !== undefined)
        : [];

    const payload = {
      notificationTypeId: "688b6f5cf132ba976670bec9",
      frequency: repeatType.toLowerCase(),
      schedulerStartDate: startDate,
      schedulerEndDate: endType === "On date" ? endDate : null,
      interval: interval,
      daysOfWeek: daysOfWeek,
      repeatAnnually: repeatType === "Yearly",
      acknowledgeRequired: acknowledgeChecked,
      attachmentRequired: attachedChecked,
      recipients: [
        {
          attributeId: "64fe1a3c6b7e2a4c5d123456",
          referenceAttributeId: "64fe1a3c6b7e2a4c5d654321",
        },
        {
          attributeId: "64fe1a3c6b7e2a4c5d789012",
        },
      ],
      medium: "688cc48ed9b9b226b6c9fa74",
      templateId: "688cbb33ae49efcf4814c09e",
      time: time || "",
      occurance: endType === "After" ? endAfter.toString() : "",
    };

    // Log the payload to the console
    console.log("Backend Payload:", JSON.stringify(payload, null, 2));

    // Add reminder to local state
    const newReminder = {
      rrule,
      startDate,
      endDate: endType === "On date" ? endDate : null,
      acknowledgeRequired: acknowledgeChecked,
      attachmentRequired: attachedChecked,
      time: time || "",
    };
    setReminders((prev) => [...prev, newReminder]);

    // Show success message
    setSuccessMessage("Reminder added successfully!");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Log checkbox states
  useEffect(() => {
    console.log("Checkbox States:", { acknowledgeChecked, attachedChecked });
  }, [acknowledgeChecked, attachedChecked]);

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
        setYearlyMonths(months.length > 0 ? months : ["Jan"]);
        setYearlyWeekMonths(months.length > 0 ? months : ["Jan"]);
      }
      if (rules.FREQ === "YEARLY" && rules.BYMONTHDAY) {
        const days = rules.BYMONTHDAY.split(",").filter((day) =>
          DAYS.some((d) => d.id === day)
        );
        setYearlyDays(days.length > 0 ? days : ["1"]);
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
        setYearlyWeeks(weeks.length > 0 ? weeks : ["First"]);
        setYearlyWeekDays(weekDays.length > 0 ? weekDays : ["Monday"]);
      }
      if (rules.FREQ === "MONTHLY" && rules.BYMONTHDAY) {
        const days = rules.BYMONTHDAY.split(",").filter((day) =>
          DAYS.some((d) => d.id === day)
        );
        setMonthlyDays(days.length > 0 ? days : ["1"]);
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
        setMonthlyWeeks(weeks.length > 0 ? weeks : ["First"]);
        setMonthlyWeekDays(weekDays.length > 0 ? weekDays : ["Monday"]);
      }
      if (rules.FREQ === "WEEKLY" && rules.BYDAY) {
        const days = rules.BYDAY.split(",")
          .map((dayAbbrev) => {
            const dayIndex = dayAbbrevs.indexOf(dayAbbrev);
            return weekdays[dayIndex]?.id;
          })
          .filter((id) => id);
        setWeeklyDays(days.length > 0 ? days : ["Monday"]);
      }
    } catch (error) {
      if (!defaultConfig.hideError) {
        console.error("Error parsing RRule:", error);
      }
    }
  };

  const generateRRule = () => {
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

  return (
    <Box sx={{ padding: STYLE_GUIDE.SPACING.s4 }}>
      <Box sx={styles.headerRow}>
        <Typography variant="h2">Reminder</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddReminder}
          aria-label="Add reminder with current settings"
          disabled={!generateRRule()}
        >
          Add Reminder
        </Button>
      </Box>

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
            Start
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
            Repeat
          </FormLabel>
          <Select
            size="small"
            value={repeatType}
            onChange={(e) => setRepeatType(e.target.value)}
            sx={styles.select}
            variant="outlined"
            aria-label="Select repeat frequency"
          >
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
            Time
          </FormLabel>
          <TextField
            size="small"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            variant="outlined"
            sx={styles.textField}
            aria-label="Select time for reminder"
          />
        </FormControl>
      </Box>

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
        {repeatType !== "Daily" && (
          <Box sx={styles.formRow}>
            <FormControl>
              <FormLabel
                sx={{
                  fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                  color: STYLE_GUIDE.COLORS.textDarkGray,
                  fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                }}
              >
                Repeat every
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
              }}
            >
              {repeatType.toLowerCase()}
              {interval > 1 ? "s" : ""}
            </Typography>
          </Box>
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

      {/* End Section */}
      <Box
        sx={{
          ...styles.formRow,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        {/* <FormControl>
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
            aria-label="Select end condition"
          >
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
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              sx={{ ...styles.textField, width: "150px" }}
              variant="outlined"
              aria-label="Select end date"
            />
          </FormControl>
        )} */}
        <Box sx={{ display: "flex", gap: STYLE_GUIDE.SPACING.s4 }}>
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
              aria-label="Select end condition"
            >
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
        <Box sx={{ display: "flex", gap: STYLE_GUIDE.SPACING.s4 }}>
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
              marginTop: STYLE_GUIDE.SPACING.s5,
            }}
          />
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
              marginTop: STYLE_GUIDE.SPACING.s5,
            }}
          />
        </Box>
      </Box>

      <Box
        component="hr"
        sx={{
          margin: `${STYLE_GUIDE.SPACING.s6} 0`,
          border: "none",
          borderTop: `1px solid ${STYLE_GUIDE.COLORS.divider}`,
        }}
      />

      {/* Reminders List */}
      {reminders.length > 0 && (
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: STYLE_GUIDE.SPACING.s2,
            }}
          >
            {reminders.map((reminder, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: STYLE_GUIDE.SPACING.s3,
                  border: `1px solid ${STYLE_GUIDE.COLORS.borderGray}`,
                  borderRadius: STYLE_GUIDE.SPACING.s11,
                  backgroundColor: STYLE_GUIDE.COLORS.white,
                }}
              >
                {/* LEFT SIDE - Reminder Info */}
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: "4px" }}
                >
                  <Typography variant="body2" sx={styles.reminderText}>
                    <strong>RRule:</strong> {reminder.rrule}
                  </Typography>
                  <Typography variant="body2" sx={styles.reminderText}>
                    <strong>Start Date:</strong> {reminder.startDate}
                  </Typography>
                  {reminder.endDate && (
                    <Typography variant="body2" sx={styles.reminderText}>
                      <strong>End Date:</strong> {reminder.endDate}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={styles.reminderText}>
                    <strong>Time:</strong> {reminder.time || "Not set"}
                  </Typography>
                  <Typography variant="body2" sx={styles.reminderText}>
                    <strong>Acknowledge Required:</strong>{" "}
                    {reminder.acknowledgeRequired ? "Yes" : "No"}
                  </Typography>
                  <Typography variant="body2" sx={styles.reminderText}>
                    <strong>Attachment Required:</strong>{" "}
                    {reminder.attachmentRequired ? "Yes" : "No"}
                  </Typography>
                </Box>

                {/* RIGHT SIDE - Action Buttons */}
                <Box sx={{ display: "flex", gap: STYLE_GUIDE.SPACING.s2 }}>
                  <IconButton
                    color="primary"
                    aria-label="edit reminder"
                    // onClick={() => handleEditReminder(index)}
                  >
                    {/* <GridEditIcon /> */}
                    Edit
                  </IconButton>
                  <IconButton
                    color="error"
                    aria-label="delete reminder"
                    // onClick={() => handleDeleteReminder(index)}
                  >
                    {/* <GridDeleteIcon /> */}
                    Delete
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

// Example Components
const SimpleRender = () => (
  <RRuleGenerator
    onChange={(rrule) => console.log(`RRule changed, now it's ${rrule}`)}
  />
);

// App Component
const Frequency = () => {
  return (
    <Box>
      <SimpleRender />
    </Box>
  );
};

export default Frequency;
