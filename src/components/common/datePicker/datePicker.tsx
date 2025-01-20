import React from 'react';
import { Controller } from 'react-hook-form';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateView } from '@mui/x-date-pickers/models';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';

interface CommonDatePickerProps {
  control: any; // React Hook Form control
  name: string; // Field name
  label: string; // Label for the date picker
  views: readonly DateView[]; // List of views (e.g., year, month, date)
  defaultValue?: string | null; // Default value for the date picker
  rules?: any; // Validation rules for React Hook Form
  disabled?: boolean; // Disable the date picker
}

const CommonDatePicker: React.FC<CommonDatePickerProps> = ({
  control,
  name,
  label,
  views,
  defaultValue = null,
  rules = {},
  disabled = false,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <MobileDatePicker
            label={label}
            views={views}
            value={value || null}
            onChange={(date) => onChange(date)}
            disabled={disabled}
            slotProps={{
              textField: {
                error: !!error,
                helperText: error?.message,
              },
            }}
          />
        </LocalizationProvider>
      )}
    />
  );
};

export default CommonDatePicker;
