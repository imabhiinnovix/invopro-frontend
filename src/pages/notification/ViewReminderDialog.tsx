

import React from "react";
import {
  Box,
  Typography,
  Modal,
} from "@mui/material";
import { StyledButton } from "../../components/common";

const ViewReminderDialog = ({ 
  open, 
  onClose, 
  viewingReminderData,
  formatRecurrenceDetails,
  formatTargetEntityForDisplay,
  formatRecipientsForDisplay
}) => {
  // Debug: Log the viewingReminderData to verify fields
  console.log("Viewing Reminder Data:", viewingReminderData);

  return (
    <Modal
      open={open}
      onClose={onClose}
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
                value: viewingReminderData?.schedulerStartDate
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
                label: "Sent To (Group)",
                value: formatTargetEntityForDisplay(
                  viewingReminderData.targetEntity
                ),
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
              {
                label: "Acknowledge To",
                value: formatRecipientsForDisplay(
                  viewingReminderData.acknowledge_to
                ),
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
            ]
              .filter(Boolean)
              .map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: "1 1 calc(50% - 16px)",
                    minWidth: "200px",
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
          <StyledButton variant="secondary" onClick={onClose}>
            Close
          </StyledButton>
        </Box>
      </Box>
    </Modal>
  );
};

export default ViewReminderDialog;