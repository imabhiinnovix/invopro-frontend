import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
} from '@mui/material';

interface CreateDashboardModalProps {
  open: boolean;
  onClose: () => void;
  newDashboardName: string;
  onNameChange: (name: string) => void;
  onCreate: () => void;
  isCreating: boolean;
  dashboardType: 'normal' | 'trend';
  onDashboardTypeChange: (type: 'normal' | 'trend') => void;
  timePeriod: string;
  onTimePeriodChange: (period: string) => void;
}

export const CreateDashboardModal: React.FC<CreateDashboardModalProps> = ({
  open,
  onClose,
  newDashboardName,
  onNameChange,
  onCreate,
  isCreating,
  dashboardType,
  onDashboardTypeChange,
  timePeriod,
  onTimePeriodChange,
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 2,
          minWidth: { xs: "90%", sm: "400px" },
          maxWidth: "500px",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          color: "primary.main",
          fontWeight: 600,
          fontSize: "1.25rem",
          py: 2,
        }}
      >
        Create New Dashboard
      </DialogTitle>
      <DialogContent sx={{ mt: 2, pb: 1 }}>
        <TextField
          autoFocus
          margin="dense"
          label="Dashboard Name"
          type="text"
          fullWidth
          variant="outlined"
          value={newDashboardName}
          onChange={(e) => onNameChange(e.target.value)}
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: "primary.main",
              },
              "&.Mui-focused fieldset": {
                borderColor: "primary.main",
              },
            },
          }}
        />
        <FormControl
          fullWidth
          margin="dense"
          size="small"
          sx={{
            mt: 2,
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: "primary.main",
              },
              "&.Mui-focused fieldset": {
                borderColor: "primary.main",
              },
            },
          }}
        >
          <InputLabel>Dashboard Type</InputLabel>
          <Select
            value={dashboardType}
            label="Dashboard Type"
            onChange={(e) => onDashboardTypeChange(e.target.value as "normal" | "trend")}
          >
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="trend">Trend</MenuItem>
          </Select>
        </FormControl>

        {dashboardType === "trend" && (
          <FormControl
            fullWidth
            margin="dense"
            sx={{
              mt: 2,
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "primary.main",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                },
              },
            }}
          >
            <InputLabel id="time-period-label">Time Period</InputLabel>
            <Select
              labelId="time-period-label"
              id="time-period-select"
              value={timePeriod}
              label="Time Period"
              onChange={(e) => onTimePeriodChange(e.target.value)}
              size="small"
            >
              <MenuItem value="1m">Last 1 Month</MenuItem>
              <MenuItem value="3m">Last 3 Months</MenuItem>
              <MenuItem value="6m">Last 6 Months</MenuItem>
              <MenuItem value="12m">Last 12 Months</MenuItem>
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            color: "text.secondary",
            "&:hover": {
              backgroundColor: alpha(theme.palette.grey[500], 0.1),
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onCreate}
          variant="contained"
          disabled={!newDashboardName.trim() || isCreating}
          sx={{
            backgroundColor: "primary.main",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
            "&.Mui-disabled": {
              backgroundColor: alpha(theme.palette.primary.main, 0.5),
              color: "white",
            },
          }}
        >
          {isCreating ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 