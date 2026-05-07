import React from "react";

type ButtonVariant = "primary" | "outline" | "ghost" | "success" | "danger" | "force";
type ButtonSize    = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?:    ButtonSize;
  children: React.ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary: { background: "linear-gradient(135deg,#3B2FD9,#7C4DFF)", color: "#fff", border: "none" },
  outline: { background: "transparent", color: "#3B2FD9", border: "1.5px solid #3B2FD9" },
  ghost:   { background: "transparent", color: "#6B7280",  border: "1px solid #E4E7F0" },
  success: { background: "#16A34A", color: "#fff", border: "none" },
  danger:  { background: "#DC2626", color: "#fff", border: "none" },
  force:   { background: "#7C4DFF", color: "#fff", border: "none" },
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  disabled,
  style,
  ...props
}) => (
  <button
    disabled={disabled}
    style={{
      ...VARIANT_STYLES[variant],
      cursor: disabled ? "not-allowed" : "pointer",
      borderRadius: 8,
      fontWeight: 600,
      fontSize: size === "sm" ? 12 : 13,
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: size === "sm" ? "5px 12px" : "8px 16px",
      transition: "all 0.15s",
      opacity: disabled ? 0.5 : 1,
      fontFamily: "inherit",
      whiteSpace: "nowrap",
      ...style,
    }}
    {...props}
  >
    {children}
  </button>
);
