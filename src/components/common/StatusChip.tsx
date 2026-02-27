import { Chip, type ChipProps } from "@mui/material";

interface StatusColorConfig {
  color: string;
  bg: string;
}

const STATUS_COLORS: Record<string, StatusColorConfig> = {
  // Green family
  completed: { color: "#28a745", bg: "#E6F7ED" },
  success: { color: "#28a745", bg: "#E6F7ED" },
  active: { color: "#28a745", bg: "#E6F7ED" },
  resolved: { color: "#28a745", bg: "#E6F7ED" },
  ready: { color: "#28a745", bg: "#E6F7ED" },
  sent: { color: "#28a745", bg: "#E6F7ED" },
  validated: { color: "#6F42C1", bg: "#F0E6FF" },

  // Amber family
  pending: { color: "#E6A817", bg: "#FFF8E1" },
  processing: { color: "#E6A817", bg: "#FFF8E1" },
  warning: { color: "#E6A817", bg: "#FFF8E1" },
  acknowledged: { color: "#E6A817", bg: "#FFF8E1" },

  // Red family
  failed: { color: "#dc3545", bg: "#FDECEA" },
  error: { color: "#dc3545", bg: "#FDECEA" },
  inactive: { color: "#dc3545", bg: "#FDECEA" },
  cancelled: { color: "#dc3545", bg: "#FDECEA" },

  // Blue family
  open: { color: "#1976d2", bg: "#E3F2FD" },
  primary: { color: "#1976d2", bg: "#E3F2FD" },
};

const DEFAULT_COLOR: StatusColorConfig = { color: "#757575", bg: "#F5F5F5" };

export interface StatusChipProps {
  status: string;
  label?: string;
  size?: ChipProps["size"];
}

export default function StatusChip({ status, label, size = "small" }: StatusChipProps) {
  const config = STATUS_COLORS[status.toLowerCase()] || DEFAULT_COLOR;

  return (
    <Chip
      label={label || status}
      size={size}
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 600,
        fontSize: "12px",
        height: "24px",
        borderRadius: "20px",
      }}
    />
  );
}
