import React from "react";

interface CardProps {
  children:  React.ReactNode;
  style?:    React.CSSProperties;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, style, className }) => (
  <div
    className={className}
    style={{
      background:   "#fff",
      borderRadius: 12,
      border:       "1px solid #E4E7F0",
      boxShadow:    "0 1px 4px rgba(0,0,0,.06)",
      padding:      20,
      ...style,
    }}
  >
    {children}
  </div>
);

interface SectionHeaderProps {
  title:    string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, actions }) => (
  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1A1D2E", margin: 0, letterSpacing: "-0.3px" }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>{subtitle}</p>}
    </div>
    {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
  </div>
);

interface SubHeadProps {
  title:   string;
  icon?:   React.ReactNode;
  style?:  React.CSSProperties;
}

export const SubHead: React.FC<SubHeadProps> = ({ title, icon, style }) => (
  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1A1D2E", marginBottom: 12, display: "flex", alignItems: "center", gap: 8, ...style }}>
    {icon}{title}
  </h3>
);
