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

interface SaveWidgetModelProps {
  open: boolean;
  onClose: () => void;
  newChartName: string;
  onNameChange: (name: string) => void;
  onCreate: () => void;
  isCreating: boolean;
  dashboardList: any[];
  dashBoardId: string;
  onDashboardChange: (id: string) => void;
  // dashboardType: 'normal' | 'trend';

  // timePeriod: string;
  // onTimePeriodChange: (period: string) => void;
}

export const SaveWidgetModel: React.FC<SaveWidgetModelProps> = ({
  open,
  onClose,
  newChartName,
  onNameChange,
  onCreate,
  isCreating,
  dashboardList,
  dashBoardId,
  onDashboardChange,
  // timePeriod,
  // onTimePeriodChange,
}) => {
  const theme = useTheme();

  console.log('dashboardList', dashboardList);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 2,
          minWidth: { xs: '90%', sm: '400px' },
          maxWidth: '500px',
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          color: 'primary.main',
          fontWeight: 600,
          fontSize: '1.25rem',
          py: 2,
        }}
      >
        Save Chart Settings
      </DialogTitle>
      <DialogContent sx={{ mt: 2, pb: 1 }}>
        <TextField
          autoFocus
          margin="dense"
          label="Chart Name"
          type="text"
          fullWidth
          variant="outlined"
          value={newChartName}
          onChange={(e) => onNameChange(e.target.value)}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
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
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
        >
          <InputLabel>Select Dashboard*</InputLabel>
          <Select value={dashBoardId} label="Dashboard" onChange={(e) => onDashboardChange(e.target.value)}>
            {dashboardList?.map((data) => (
              <MenuItem key={data._id} value={data._id}>
                {data.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* {dashboardType === 'trend' && (
          <FormControl
            fullWidth
            margin="dense"
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
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
        )} */}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: alpha(theme.palette.grey[500], 0.1),
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onCreate}
          variant="contained"
          // disabled={!newWidgetName.trim() || isCreating}
          sx={{
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '&.Mui-disabled': {
              backgroundColor: alpha(theme.palette.primary.main, 0.5),
              color: 'white',
            },
          }}
        >
          {isCreating ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
