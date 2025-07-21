import React, { useEffect, useLayoutEffect } from "react";
import {
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { Controller } from "react-hook-form";
import StyledSelect from "../../atom/common/StyledSelect";

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
  value?: string;
  setValue?: any;
}

const CommonSelect: React.FC<CommonSelectProps> = ({
  control,
  name,
  label,
  options,
  defaultValue = "",
  rules = {},
  error = false,
  errorMessage = "",
  disabled = false,
}) => {
  return (
    <div>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        rules={rules}
        render={({ field }) => (
          <StyledSelect
            {...field}
            label={label}
            disabled={disabled}
            error={error}
          >
            {options.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </StyledSelect>
        )}
      />
      {error && errorMessage && (
        <FormHelperText error>{errorMessage}</FormHelperText>
      )}
    </div>
  );
};

export default CommonSelect;
