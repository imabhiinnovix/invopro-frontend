import { Button, ButtonProps, SxProps, Theme } from "@mui/material";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import { useComponentTypography } from "../../hooks/useComponentTypography";
import { STYLE_GUIDE } from "../../styles";

export type ButtonVariantType = "primary" | "secondary";

export interface StyledButtonProps extends Omit<ButtonProps, "variant"> {
  variant?: ButtonVariantType;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const StyledButton = ({
  variant = "primary",
  icon,
  endIcon,
  sx,
  children,
  ...rest
}: StyledButtonProps) => {
  const themeUnified = useUnifiedTheme();
  const { getButtonSx } = useComponentTypography();

  const baseStyles: SxProps<Theme> = {
    ...getButtonSx(),
    gap: '6px',
    textTransform: "none",
    fontWeight: 500,
    fontSize: "14px",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    height: "40px",
    transition: "all 0.2s ease-in-out",
  };

  const primaryStyles: SxProps<Theme> = {
    ...baseStyles,
    backgroundColor: themeUnified.palette.primary.main,
    color: themeUnified.palette.primary.contrastText || STYLE_GUIDE.COLORS.white,
    boxShadow: `0 2px 8px ${themeUnified.palette.primary.main}33`,
    "&:hover": {
      boxShadow: `0 4px 12px ${themeUnified.palette.primary.main}4D`,
      transform: "translateY(-1px)",
    },
    "&:active": {
      transform: "translateY(0)",
      boxShadow: `0 1px 4px ${themeUnified.palette.primary.main}33`,
    },
    "&:disabled": {
      backgroundColor: STYLE_GUIDE.COLORS.backgroundHover,
      color: STYLE_GUIDE.COLORS.textSecondary,
      boxShadow: "none",
    },
  };

  const secondaryStyles: SxProps<Theme> = {
    ...baseStyles,
    backgroundColor: "transparent",
    color: STYLE_GUIDE.COLORS.black, // #020817
    border: `1px solid rgb(229, 231, 235)`,
    boxShadow: "none",
    "&:hover": {
      borderColor: themeUnified.palette.primary.main,
      color: themeUnified.palette.primary.main,
      transform: "translateY(-1px)",
    },
    "&:active": {
      transform: "translateY(0)",
      backgroundColor: STYLE_GUIDE.COLORS.backgroundDefault,
    },
    "&:disabled": {
      backgroundColor: "transparent",
      color: STYLE_GUIDE.COLORS.textSecondary,
      borderColor: STYLE_GUIDE.COLORS.borderGray,
    },
  };

  const buttonStyles =
    variant === "secondary" ? secondaryStyles : primaryStyles;

  return (
    <Button
      variant={variant === "secondary" ? "outlined" : "contained"}
      startIcon={icon}
      endIcon={endIcon}
      sx={{ ...buttonStyles, ...sx } as SxProps<Theme>}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default StyledButton;
