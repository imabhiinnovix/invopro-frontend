import { ButtonProps, SxProps, Theme } from "@mui/material";
import StyledButton from "./StyledButton";

/**
 * Secondary Button - Outlined style with theme color
 * @deprecated Use StyledButton with variant="secondary" instead
 */
export default function SecondaryButton({
  icon,
  onClick,
  sx,
  children,
  ...rest
}: {
  icon?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  sx?: SxProps<Theme>;
  children: React.ReactNode;
  rest?: Omit<ButtonProps, "children" | "onClick" | "sx">;
} & Omit<ButtonProps, "children" | "onClick" | "sx">) {
  return (
    <StyledButton
      variant="secondary"
      icon={icon}
      onClick={onClick}
      sx={sx}
      {...rest}
    >
      {children}
    </StyledButton>
  );
}
