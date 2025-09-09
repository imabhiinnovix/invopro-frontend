import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

// Helper function to determine the exact UI frequency from API data
const getExactUIFrequencyFromAPI = (row, selectedDate) => {
  const {
    frequency,
    daysOfWeek,
    dayOfMonth,
    weekOfMonth,
    dayOfWeekInMonth,
    monthOfYear,
    dayOfYearMonth,
  } = row;
  switch (frequency) {
    case "once":
      return "Do not repeat";
    case "daily":
      return "Daily";
    case "weekly":
      // Check if it's weekdays (Mon-Fri)
      if (
        daysOfWeek &&
        Array.isArray(daysOfWeek) &&
        daysOfWeek.length === 5 &&
        daysOfWeek.every((day) => [1, 2, 3, 4, 5].includes(day))
      ) {
        return "Every weekday (Monday to Friday)";
      }
      // Otherwise, get the specific day
      if (daysOfWeek && daysOfWeek.length > 0) {
        const dayNames = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        return `Weekly on ${dayNames[daysOfWeek[0]]}`;
      }
      return `Weekly on ${selectedDate.toLocaleDateString("en-US", { weekday: "long" })}`;
    case "monthly":
      // Check if it's a specific day of the month
      if (dayOfMonth && Array.isArray(dayOfMonth) && dayOfMonth.length > 0) {
        return `Monthly on day ${dayOfMonth[0]}`;
      }
      // Check if it's a weekday occurrence
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
        return `Monthly on the ${occurrence} ${dayNames[dayOfWeekInMonth]}`;
      }
      // Fallback
      return `Monthly on day ${selectedDate.getDate()}`;
    case "yearly":
      // Check if it's a specific date
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
        return `Annually on ${monthNames[monthOfYear - 1]} ${dayOfYearMonth}`;
      }
      // Fallback
      const month = selectedDate.toLocaleDateString("en-US", { month: "long" });
      const day = selectedDate.getDate();
      return `Annually on ${month} ${day}`;
    case "custom":
      return "Custom...";
    default:
      return frequency; // Fallback
  }
};

// Helper function to get field label from fieldOptions
const getFieldLabel = (attributeId, refAttributeId, fieldOptions) => {
  if (!fieldOptions || !Array.isArray(fieldOptions))
    return `Field: ${attributeId}`;

  const match = fieldOptions.find(
    (option) =>
      option.attributeId === attributeId &&
      JSON.stringify(option.refAttributeId || []) ===
        JSON.stringify(refAttributeId || [])
  );

  return match ? match.label : `Field: ${attributeId}`;
};

interface ViewSchedulerDialogProps {
  open: boolean;
  onClose: () => void;
  selectedReminder: any;
  fieldOptions: any[];
}

const ViewSchedulerDialog: React.FC<ViewSchedulerDialogProps> = ({
  open,
  onClose,
  selectedReminder,
  fieldOptions,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
          Scheduler Details
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {selectedReminder && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {/* Frequency Information */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", minWidth: 200 }}
              >
                Frequency:
              </Typography>
              <Typography variant="body1">
                {getExactUIFrequencyFromAPI(
                  selectedReminder,
                  new Date(selectedReminder.schedulerStartDate)
                )}
              </Typography>
            </Box>

            {/* Date and Time Information */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", minWidth: 200 }}
              >
                Start Date:
              </Typography>
              <Typography variant="body1">
                {selectedReminder.schedulerStartDate
                  ? new Date(
                      selectedReminder.schedulerStartDate
                    ).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "Not set"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", minWidth: 200 }}
              >
                End Date:
              </Typography>
              <Typography variant="body1">
                {selectedReminder.schedulerEndDate
                  ? new Date(
                      selectedReminder.schedulerEndDate
                    ).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "No end date"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", minWidth: 200 }}
              >
                Trigger Time:
              </Typography>
              <Typography variant="body1">
                {selectedReminder.triggerTime || "-"}
              </Typography>
            </Box>

            {/* Template and Method Information */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", minWidth: 200 }}
              >
                Template:
              </Typography>
              <Typography variant="body1">
                {selectedReminder.templateId?.name || "-"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", minWidth: 200 }}
              >
                Notification Method:
              </Typography>
              <Typography variant="body1">
                {selectedReminder.medium?.medium || "-"}
              </Typography>
            </Box>

            {/* Requirements */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", minWidth: 200 }}
              >
                Acknowledge Required:
              </Typography>
              <Typography variant="body1">
                {selectedReminder.acknowledgeRequired ? "Yes" : "No"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", minWidth: 200 }}
              >
                Attachment Required:
              </Typography>
              <Typography variant="body1">
                {selectedReminder.attachmentRequired ? "Yes" : "No"}
              </Typography>
            </Box>

            {/* Recurrence Details */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", minWidth: 200 }}
              >
                Max Occurrences:
              </Typography>
              <Typography variant="body1">
                {selectedReminder.maxOccurrences || "No limit"}
              </Typography>
            </Box>

            {/* Recipients */}
            <Box sx={{ mt: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
                TO Recipients:
              </Typography>
              {selectedReminder.recipients_to &&
              selectedReminder.recipients_to.length > 0 ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {selectedReminder.recipients_to.map((recipient, index) => (
                    <Chip
                      key={`to-${index}`}
                      label={
                        recipient.customEmails &&
                        recipient.customEmails.length > 0
                          ? recipient.customEmails.join(", ")
                          : getFieldLabel(
                              recipient.attributeId,
                              recipient.refAttributeId,
                              fieldOptions
                            )
                      }
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No TO recipients
                </Typography>
              )}
            </Box>

            <Box sx={{ mt: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
                CC Recipients:
              </Typography>
              {selectedReminder.recipients_cc &&
              selectedReminder.recipients_cc.length > 0 ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {selectedReminder.recipients_cc.map((recipient, index) => (
                    <Chip
                      key={`cc-${index}`}
                      label={
                        recipient.customEmails &&
                        recipient.customEmails.length > 0
                          ? recipient.customEmails.join(", ")
                          : getFieldLabel(
                              recipient.attributeId,
                              recipient.refAttributeId,
                              fieldOptions
                            )
                      }
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No CC recipients
                </Typography>
              )}
            </Box>

            <Box sx={{ mt: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
                Acknowledge To:
              </Typography>
              {selectedReminder.acknowledge_to &&
              selectedReminder.acknowledge_to.length > 0 ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {selectedReminder.acknowledge_to.map((recipient, index) => (
                    <Chip
                      key={`ack-${index}`}
                      label={
                        recipient.customEmails &&
                        recipient.customEmails.length > 0
                          ? recipient.customEmails.join(", ")
                          : getFieldLabel(
                              recipient.attributeId,
                              recipient.refAttributeId,
                              fieldOptions
                            )
                      }
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No acknowledge recipients
                </Typography>
              )}
            </Box>

            <Box sx={{}}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Sent To (Group):
              </Typography>
              {selectedReminder.targetEntity ? (
                <Chip
                  label={
                    selectedReminder.targetEntity.customEmails &&
                    selectedReminder.targetEntity.customEmails.length > 0
                      ? selectedReminder.targetEntity.customEmails.join(", ")
                      : getFieldLabel(
                          selectedReminder.targetEntity.attributeId,
                          selectedReminder.targetEntity.refAttributeId,
                          fieldOptions
                        )
                  }
                  size="small"
                  variant="outlined"
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No target entity
                </Typography>
              )}
            </Box>

            {/* Additional Information */}
            {/* <Box sx={{ display: "flex", gap: 2 }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", minWidth: 200 }}
              >
                Status:
              </Typography>
              <Typography variant="body1">
                {selectedReminder.isActive === "active" ? "Active" : "Inactive"}
              </Typography>
            </Box> */}

            {/* <Box sx={{ display: "flex", gap: 2 }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", minWidth: 200 }}
              >
                Created At:
              </Typography>
              <Typography variant="body1">
                {selectedReminder.createdAt
                  ? new Date(selectedReminder.createdAt).toLocaleString(
                      "en-US",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )
                  : "-"}
              </Typography>
            </Box> */}

            {/* <Box sx={{ display: "flex", gap: 2 }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", minWidth: 200 }}
              >
                Last Updated:
              </Typography>
              <Typography variant="body1">
                {selectedReminder.updatedAt
                  ? new Date(selectedReminder.updatedAt).toLocaleString(
                      "en-US",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )
                  : "-"}
              </Typography>
            </Box> */}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="primary"
          onClick={onClose}
          aria-label="Close reminder details"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewSchedulerDialog;
