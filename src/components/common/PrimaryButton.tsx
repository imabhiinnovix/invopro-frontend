import { Button, ButtonProps, SxProps, Theme } from "@mui/material";
import { STYLE_GUIDE } from "../../styles";
import { useComponentTypography } from "../../hooks/useComponentTypography";

export default function PrimaryButton({
  icon,
  onClick,
  sx,
  children,
  ...rest
}: {
  icon?: React.ReactNode;
  onClick: () => void;
  sx?: SxProps<Theme>;
  children: React.ReactNode;
  rest?: Omit<ButtonProps, "children" | "onClick" | "sx">;
} & Omit<ButtonProps, "children" | "onClick" | "sx">) {
  const { getButtonSx } = useComponentTypography();
  const buttonSx = {
    ...getButtonSx(),
    // backgroundColor: STYLE_GUIDE.COLORS.primary,
    // color: STYLE_GUIDE.COLORS.white,
    // "&:hover": {
    //   backgroundColor: STYLE_GUIDE.COLORS.primaryDark,
    // },
    height: 40,
    borderRadius: STYLE_GUIDE.SPACING.s2,
    textTransform: "none",
    ...sx,
  };
  return (
    <Button
      variant="contained"
      startIcon={icon || undefined}
      onClick={onClick}
      sx={buttonSx as SxProps<Theme>}
      {...rest}
    >
      {children}
    </Button>
  );
}
