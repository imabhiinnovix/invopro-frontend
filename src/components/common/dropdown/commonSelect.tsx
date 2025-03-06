import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import {
  Control,
  Controller,
  FieldValues,
  Path,
  PathValue,
  UseFormSetValue,
} from "react-hook-form";
import { CustomReportData } from "../../atom/dataSourceVerion/uploadMultipleVersionValue";

interface CommonSelectProps<T extends FieldValues> {
  control: Control<T>; 
  name: Path<T>;
  label: string;
  options: string[];
  defaultValue?: PathValue<T, Path<T>>;
  rules?: Record<string, unknown>;
  error?: boolean; 
  errorMessage?: string;
  disabled?: boolean;
  value?: string;
  setValue?: UseFormSetValue<CustomReportData>;
}

const CommonSelect = <T extends FieldValues>({
  control,
  name,
  label,
  options,
  defaultValue,
  rules = {},
  error = false,
  errorMessage = "",
  disabled = false,
}: CommonSelectProps<T>): JSX.Element => {
  return (
    <FormControl fullWidth error={error} disabled={disabled}>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue as PathValue<T, Path<T>>}
        rules={rules}
        render={({ field }) => (
          <Select {...field} labelId={`${name}-label`} label={label} id={name}>
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
