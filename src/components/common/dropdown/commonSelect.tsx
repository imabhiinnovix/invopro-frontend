import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { Controller } from 'react-hook-form';

interface CommonSelectProps {
  control: any; // React Hook Form control
  name: string; // Field name
  label: string; // Label for the select
  options: string[]; // List of options
  defaultValue?: string; // Default value for the select
  rules?: any; // Validation rules
  error?: boolean; // Error state
  errorMessage?: string; // Error message
  disabled?: boolean;
}

const CommonSelect: React.FC<CommonSelectProps> = ({
  control,
  name,
  label,
  options,
  defaultValue = '',
  rules = {},
  error = false,
  errorMessage = '',
  disabled = false,
}) => {
  console.log(defaultValue);
  return (
    <FormControl fullWidth error={error} disabled={disabled}>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        rules={rules}
        render={({ field }) => (
          <Select {...field} labelId={`${name}-label`} label={label}>
            {options.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        )}
      />
      <FormHelperText>{errorMessage}</FormHelperText>
    </FormControl>
  );
};

export default CommonSelect;
