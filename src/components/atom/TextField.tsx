import TextFieldPrimary from "@mui/material/TextField";
import { IconButton, InputAdornment } from "@mui/material";
import { useState, forwardRef } from "react";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
// import { STYLE_GUIDE } from "../../styles";
// import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";

interface TextFieldProps {
  label: string;
  placeholder: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  isPasswordField?: boolean;
  name?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, placeholder, required, isPasswordField, ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    //   const theme = useUnifiedTheme();
    const type = isPasswordField && !showPassword ? "password" : "text";
    return (
      <TextFieldPrimary
        fullWidth
        label={label}
        placeholder={placeholder}
        required={required}
        type={type}
        inputRef={ref}
        //   sx={{}}
        // size="small"
        slotProps={
          isPasswordField
            ? {
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {/* Replace with your icon logic */}
                        {showPassword ? (
                          <VisibilityIcon />
                        ) : (
                          <VisibilityOffIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }
            : {}
        }
        {...rest}
      />
    );
  }
);

TextField.displayName = "TextField";

export default TextField;
