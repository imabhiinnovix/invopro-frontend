


// EndDatePicker.js
import React from "react";
import {
  Dialog,
  DialogActions,
  Button,
  Box,
  IconButton,
  Grid,
  Typography,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

const EndDatePicker = ({
  open,
  onClose,
  endDate,
  setEndDate,
  endCalendarDate,
  setEndCalendarDate,
}) => {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const changeEndCalendarMonth = (delta) => {
    setEndCalendarDate((d) => {
      const next = new Date(d);
      next.setMonth(d.getMonth() + delta);
      return next;
    });
  };

  const generateEndCalendarDays = () => {
    const y = endCalendarDate.getFullYear();
    const m = endCalendarDate.getMonth();
    const first = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells = [];
    
    // Empty slots
    for (let i = 0; i < first; i++) {
      cells.push(
        <Grid item xs={1} key={`end-empty-${i}`} sx={{ textAlign: "center" }}>
          <Box sx={{ width: 32, height: 32 }} />
        </Grid>
      );
    }
    
    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m, d);
      const isSel = date.toDateString() === new Date(endDate).toDateString();
      const isToday = date.toDateString() === new Date().toDateString();
      
      cells.push(
        <Grid item xs={1} key={`end-${d}`} sx={{ textAlign: "center" }}>
          <Button
            onClick={() => {
              // FIXED: Format the date properly as YYYY-MM-DD
              const formattedDate = [
                date.getFullYear(),
                String(date.getMonth() + 1).padStart(2, "0"),
                String(date.getDate()).padStart(2, "0"),
              ].join("-");
              
              // FIXED: Update both the endDate and endCalendarDate
              setEndDate(formattedDate);
              setEndCalendarDate(date); // This ensures the calendar shows the selected date
              onClose();
            }}
            sx={{
              minWidth: 32,
              width: 32,
              height: 32,
              borderRadius: "50%",
              fontSize: "0.8rem",
              color: isSel ? "#fff" : "#3c4043",
              backgroundColor: isSel ? "#a136a1" : "transparent",
              border: isToday && !isSel ? "1px solid #bd19d2ff" : "none",
              "&:hover": { backgroundColor: isSel ? "#a136a1" : "#f1f3f4" },
            }}
          >
            {d}
          </Button>
        </Grid>
      );
    }
    return cells;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs">
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
          <IconButton onClick={() => changeEndCalendarMonth(-1)}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            {endCalendarDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </Typography>
          <IconButton onClick={() => changeEndCalendarMonth(1)}>
            <ChevronRight />
          </IconButton>
        </Box>
        <Grid container spacing={0} columns={7}>
          {daysOfWeek.map((d) => (
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
          {generateEndCalendarDays()}
        </Grid>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onClose} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default EndDatePicker;