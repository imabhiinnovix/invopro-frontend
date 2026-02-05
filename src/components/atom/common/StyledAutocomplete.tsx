import { forwardRef } from "react";
import {
  Autocomplete,
  AutocompleteProps,
  TextField,
  TextFieldProps,
} from "@mui/material";
import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";
import { STYLE_GUIDE } from "../../../styles";

interface StyledAutocompleteProps<
  T,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> extends Omit<
    AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>,
    "renderInput"
  > {
  label?: string;
  error?: boolean;
  helperText?: string;
  textFieldProps?: Partial<TextFieldProps>;
}

function StyledAutocompleteInner<
  T,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>(
  {
    label,
    error = false,
    helperText,
    textFieldProps = {},
    sx = {},
    ...props
  }: StyledAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const theme = useUnifiedTheme();

  const autocompleteSx = {
    "& .MuiOutlinedInput-root": {
      backgroundColor:
        STYLE_GUIDE.COLORS.inputFieldBackground ??
        theme.palette.dropdown?.background ??
        theme.palette.background.paper,
      borderRadius: "10px",
      "& fieldset": {
        borderColor:
          STYLE_GUIDE.COLORS.inputFieldBorder ??
          theme.palette.input?.border ??
          theme.palette.divider,
      },
      "&:hover fieldset": {
        borderColor: theme.palette.primary.main,
      },
      "&.Mui-focused fieldset": {
        borderColor: theme.palette.primary.main,
      },
    },
    "& .MuiInputLabel-root": {
      color: theme.palette.dropdown?.labelColor || theme.palette.text.secondary,
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: theme.palette.primary.main,
    },
    // Label color when it's above the input (shrink state)
    "& .MuiInputLabel-root.MuiInputLabel-shrink": {
      color: theme.palette.primary.main,
    },
    // Label color when input has value
    "& .MuiInputLabel-root.MuiInputLabel-shrink.Mui-focused": {
      color: theme.palette.primary.main,
    },
    // Label color when input has value but not focused
    "& .MuiInputLabel-root.MuiInputLabel-shrink:not(.Mui-focused)": {
      color: theme.palette.primary.main,
    },
    "& .MuiInputBase-input": {
      color: `${
        theme.palette.dropdown?.selectedText || theme.palette.text.primary
      } !important`,
    },
    "& .MuiAutocomplete-input": {
      color: `${
        theme.palette.dropdown?.selectedText || theme.palette.text.primary
      } !important`,
    },
    "& .MuiAutocomplete-tag": {
      color: `${
        theme.palette.dropdown?.selectedText || theme.palette.text.primary
      } !important`,
    },
    "& .MuiAutocomplete-endAdornment": {
      color: `${
        theme.palette.dropdown?.selectedText || theme.palette.text.primary
      } !important`,
    },
    "& .MuiAutocomplete-inputRoot": {
      color: `${
        theme.palette.dropdown?.selectedText || theme.palette.text.primary
      } !important`,
    },
    // Additional specific selectors to force the color
    "& .MuiAutocomplete-inputRoot input": {
      color: `${
        theme.palette.dropdown?.selectedText || theme.palette.text.primary
      } !important`,
    },
    "& .MuiAutocomplete-inputRoot .MuiAutocomplete-input": {
      color: `${
        theme.palette.dropdown?.selectedText || theme.palette.text.primary
      } !important`,
    },
    "& input": {
      color: `${
        theme.palette.dropdown?.selectedText || theme.palette.text.primary
      } !important`,
    },
    "& .MuiInputBase-root input": {
      color: `${
        theme.palette.dropdown?.selectedText || theme.palette.text.primary
      } !important`,
    },
    "& .MuiOutlinedInput-root input": {
      color: `${
        theme.palette.dropdown?.selectedText || theme.palette.text.primary
      } !important`,
    },
    ...sx,
  };

  const paperProps = {
    sx: {
      backgroundColor:
        theme.palette.dropdown?.background || theme.palette.background.paper,
      "& .MuiAutocomplete-option": {
        color: theme.palette.dropdown?.optionText || theme.palette.text.primary,
        "&:hover": {
          backgroundColor:
            theme.palette.dropdown?.optionHoverBackground ||
            theme.palette.action.hover,
        },
        "&.Mui-focused": {
          backgroundColor:
            theme.palette.dropdown?.optionHoverBackground ||
            theme.palette.action.hover,
        },
        '&[aria-selected="true"]': {
          backgroundColor:
            theme.palette.dropdown?.optionBackground ||
            theme.palette.action.selected,
          color:
            theme.palette.dropdown?.selectedText || theme.palette.primary.main,
          "&:hover": {
            backgroundColor:
              theme.palette.dropdown?.optionHoverBackground ||
              theme.palette.action.hover,
            color:
              theme.palette.dropdown?.selectedText ||
              theme.palette.primary.main,
          },
        },
      },
    },
  };

  return (
    <Autocomplete
      {...props}
      ref={ref}
      sx={autocompleteSx}
      ListboxProps={paperProps}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={error}
          helperText={helperText}
          {...textFieldProps}
        />
      )}
    />
  );
}

const StyledAutocomplete = forwardRef(StyledAutocompleteInner) as <
  T,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>(
  props: StyledAutocompleteProps<T, Multiple, DisableClearable, FreeSolo> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  }
) => React.ReactElement;

export default StyledAutocomplete;
