// import { useState } from "react";
// import {
//   Controller,
//   Control,
//   FieldValues,
//   Path,
//   PathValue,
//   RegisterOptions,
// } from "react-hook-form";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
// import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
// import { DateView } from "@mui/x-date-pickers/models";
// import { DateTime } from "luxon";
// import { Theme } from "@mui/material";
// import { SxProps } from "@mui/material";

// interface CommonDatePickerProps<T extends FieldValues> {
//   control: Control<T>;
//   name: Path<T>;
//   label: string;
//   views: readonly DateView[];
//   defaultValue?: PathValue<T, Path<T>>;
//   rules?: RegisterOptions<T>;
//   disabled?: boolean;
//   sx?: SxProps<Theme>;
// }

// const CommonDatePicker = <T extends FieldValues>(
//   props: CommonDatePickerProps<T>
// ) => {
//   const {
//     control,
//     name,
//     label,
//     views,
//     defaultValue = null,
//     rules = {},
//     disabled = false,
//     sx,
//   } = props;

//   const [tempDate, setTempDate] = useState<DateTime | null>(
//     defaultValue ? DateTime.fromISO(defaultValue as string) : null
//   );

//   return (
//     <Controller
//       name={name}
//       control={control}
//       defaultValue={(defaultValue as PathValue<T, Path<T>>) || undefined}
//       rules={rules}
//       render={({ field: { onChange, value }, fieldState: { error } }) => {
//         const currentValue = value ? DateTime.fromISO(value as string) : null;

//         return (
//           <LocalizationProvider dateAdapter={AdapterLuxon}>
//             <MobileDatePicker
//               label={label}
//               views={views}
//               value={tempDate || currentValue || null}
//               onChange={(date) => setTempDate(date)}
//               disabled={disabled}
//               closeOnSelect={false}
//               onAccept={() => onChange(tempDate?.toISO())}
//               onClose={() => setTempDate(null)}
//               slotProps={{
//                 textField: {
//                   error: !!error,
//                   helperText: error?.message,
//                 },
//               }}
//               sx={sx}
//             />
//           </LocalizationProvider>
//         );
//       }}
//     />
//   );
// };

// export default CommonDatePicker;


import { useState } from "react";
import {
  Controller,
  Control,
  FieldValues,
  Path,
  PathValue,
  RegisterOptions,
} from "react-hook-form";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { DateView } from "@mui/x-date-pickers/models";
import { DateTime } from "luxon";
import { Theme } from "@mui/material";
import { SxProps } from "@mui/material";

interface CommonDatePickerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  views: readonly DateView[];
  defaultValue?: PathValue<T, Path<T>>;
  rules?: RegisterOptions<T>;
  disabled?: boolean;
  sx?: SxProps<Theme>;
  disableFuture?: boolean; 
}

const CommonDatePicker = <T extends FieldValues>(
  props: CommonDatePickerProps<T>
) => {
  const {
    control,
    name,
    label,
    views,
    defaultValue = null,
    rules = {},
    disabled = false,
    sx,
    disableFuture = false, 
  } = props;

  const [tempDate, setTempDate] = useState<DateTime | null>(
    defaultValue ? DateTime.fromISO(defaultValue as string) : null
  );

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={(defaultValue as PathValue<T, Path<T>>) || undefined}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const currentValue = value ? DateTime.fromISO(value as string) : null;

        return (
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <MobileDatePicker
              label={label}
              views={views}
              value={tempDate || currentValue || null}
              onChange={(date) => setTempDate(date)}
              disabled={disabled}
              disableFuture={disableFuture}
              maxDate={disableFuture ? DateTime.now() : undefined}
              closeOnSelect={false}
              onAccept={() => onChange(tempDate?.toISO())}
              onClose={() => setTempDate(null)}
              slotProps={{
                textField: {
                  error: !!error,
                  helperText: error?.message,
                },
              }}
              sx={sx}
            />
          </LocalizationProvider>
        );
      }}
    />
  );
};

export default CommonDatePicker;
