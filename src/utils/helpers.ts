import type { InvoiceStatus, RiskLevel, PillColor } from "../types";

export const fmt = (n: number): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export const fmtN = (n: number): string =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export const fmtK = (n: number): string =>
  n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : `$${Math.round(n / 1000)}K`;

export const riskColor = (r: RiskLevel): PillColor =>
  r === "High" ? "red" : r === "Medium" ? "amber" : "green";

export const statusColor = (s: InvoiceStatus): PillColor => {
  if (["Approved", "Paid"].includes(s)) return "green";
  if (["Rate Violation", "Analyst Review"].includes(s)) return "red";
  if (s === "Revalidation Needed") return "amber";
  return "blue";
};

export const auditDotColor = (type: string): string => {
  const map: Record<string, string> = {
    upload:     "#0284C7",
    validation: "#D97706",
    edit:       "#3B2FD9",
    approval:   "#16A34A",
    payment:    "#16A34A",
  };
  return map[type] ?? "#6B7280";
};

export const auditTypeColor = (type: string): string => {
  const map: Record<string, string> = {
    upload:     "#0284C7",
    validation: "#D97706",
    edit:       "#3B2FD9",
    approval:   "#16A34A",
    payment:    "#16A34A",
  };
  return map[type] ?? "#6B7280";
};

export const auditTypeLabel = (type: string): string => {
  const map: Record<string, string> = {
    upload:     "Upload",
    validation: "Validation",
    edit:       "Analyst Edit",
    approval:   "Approval Action",
    payment:    "Payment Status",
  };
  return map[type] ?? type;
};

export const indexColor = (index: number): string => {
  if (index > 100) return "#DC2626";
  if (index < 80)  return "#16A34A";
  return "#D97706";
};

export const rankColor = (rank: number): string => {
  const colors = ["#16A34A", "#22C55E", "#D97706", "#F59E0B", "#DC2626", "#EF4444"];
  return colors[rank - 1] ?? "#6B7280";
};

export const genId = (): string => Math.random().toString(36).slice(2, 9);
