import React from "react";
import type { PillColor } from "../../types";

interface PillProps {
  label: string;
  color?: PillColor;
}

const PILL_STYLES: Record<PillColor, React.CSSProperties> = {
  green:  { background: "#FCFCFC",  color: "#15803D" },
  red:    { background: "#FEE2E2",  color: "#B91C1C" },
  amber:  { background: "#FEF3C7",  color: "#92400E" },
  blue:   { background: "#DBEAFE",  color: "#1D4ED8" },
  gray:   { background: "#F3F4F6",  color: "#374151" },
  violet: { background: "#F3E8FF",  color: "#6B21A8" },
};

export const Pill: React.FC<PillProps> = ({ label, color = "gray" }) => (
  <span
    style={{
      ...PILL_STYLES[color],
      fontSize: 11,
      fontWeight: 600,
      padding: "2px 10px",
      borderRadius: 20,
      whiteSpace: "nowrap",
      letterSpacing: "0.03em",
      display: "inline-block",
    }}
  >
    {label}
  </span>
);
