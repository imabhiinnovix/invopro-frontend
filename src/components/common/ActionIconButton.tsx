import * as React from "react";
import { IconButton, IconButtonProps, useTheme } from "@mui/material";

/**
 * Icon button for table/list actions (View, Edit, Delete).
 * Default: text color. Hover: theme primary background, white icon.
 * Uses forwardRef so it can be wrapped by MUI Tooltip (which forwards a ref to its child).
 */
export const ActionIconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function ActionIconButton({ children, sx, ...rest }, ref) {
    const theme = useTheme();

    return (
      <IconButton
        ref={ref}
        size="small"
        sx={{
          color: theme.palette.text.primary,
          borderRadius: "8px",
          "&:hover": {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText || "#fff",
            "& .MuiSvgIcon-root": {
              color: "inherit",
            },
          },
          "& .MuiSvgIcon-root": {
            fontSize: "16px",
          },
          ...sx,
        }}
        {...rest}
      >
        {children}
      </IconButton>
    );
  }
);

export default ActionIconButton;
