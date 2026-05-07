import React from "react";

interface KpiCardProps {
  label:   string;
  value:   string | number;
  sub?:    string;
  color?:  string;
  icon:    React.ReactNode;
}

export const KpiCard: React.FC<KpiCardProps> = ({ label, value, sub, color = "#3B2FD9", icon }) => (
  <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E4E7F0", boxShadow: "0 1px 4px rgba(0,0,0,.06)", padding: "16px 18px", flex: 1, minWidth: 150 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
    </div>
    <div style={{ fontSize: 26, fontWeight: 700, color, letterSpacing: "-0.5px" }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>{sub}</div>}
  </div>
);
