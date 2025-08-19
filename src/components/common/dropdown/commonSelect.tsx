import React from "react";
import {
  MenuItem,
  FormHelperText,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Controller } from "react-hook-form";
import ClearIcon from "@mui/icons-material/Clear";
import StyledSelect from "../../atom/common/StyledSelect";

interface CommonSelectProps {
  control: any;
  name: string;
  label: string;
  options: string[];
  defaultValue?: string | string[];
  rules?: any;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  value?: string | string[];
  setValue?: any;
  multiple?: boolean;
  clearable?: boolean; 
}

const CommonSelect: React.FC<CommonSelectProps> = ({
  control,
  name,
  label,
  options,
  defaultValue,
  rules = {},
  error = false,
  errorMessage = "",
  disabled = false,
  multiple = false,
  clearable = true, 
}) => {
  const resolvedDefaultValue =
    defaultValue !== undefined ? defaultValue : multiple ? [] : "";

  return (
    <div>
      <Controller
        name={name}
        control={control}
        defaultValue={resolvedDefaultValue}
        rules={rules}
        render={({ field }) => {
          const hasValue = multiple
            ? Array.isArray(field.value) && field.value.length > 0
            : !!field.value;

          return (
            <StyledSelect
              {...field}
              label={label}
              disabled={disabled}
              error={error}
              multiple={multiple}
              value={
                multiple
                  ? Array.isArray(field.value)
                    ? field.value
                    : []
                  : field.value || ""
              }
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(multiple ? value : value);
              }}
              endAdornment={
                clearable && hasValue ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        field.onChange(multiple ? [] : "");
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }
            >
              {options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </StyledSelect>
          );
        }}
      />
      {error && errorMessage && (
        <FormHelperText error>{errorMessage}</FormHelperText>
      )}
    </div>
  );
};

export default CommonSelect;
