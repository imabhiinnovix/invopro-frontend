import React from "react";

const INPUT_STYLE: React.CSSProperties = {
  border: "1.5px solid #E4E7F0",
  borderRadius: 8,
  padding: "7px 12px",
  fontSize: 13,
  color: "#1A1D2E",
  background: "#fff",
  outline: "none",
  fontFamily: "inherit",
  width: "100%",
  transition: "border 0.15s",
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, style, ...props }) => (
  <div style={{ marginBottom: label ? 0 : undefined }}>
    {label && <label style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>}
    <input
      style={{ ...INPUT_STYLE, ...style }}
      onFocus={e => (e.target.style.borderColor = "#3B2FD9")}
      onBlur={e  => (e.target.style.borderColor = "#E4E7F0")}
      {...props}
    />
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?:   string;
  options:  { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, style, ...props }) => (
  <div>
    {label && <label style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>}
    <select
      style={{ ...INPUT_STYLE, cursor: "pointer", ...style }}
      onFocus={e => (e.target.style.borderColor = "#3B2FD9")}
      onBlur={e  => (e.target.style.borderColor = "#E4E7F0")}
      {...props}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, style, ...props }) => (
  <div>
    {label && <label style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>}
    <textarea
      style={{ ...INPUT_STYLE, resize: "vertical", ...style }}
      onFocus={e => (e.target.style.borderColor = "#3B2FD9")}
      onBlur={e  => (e.target.style.borderColor = "#E4E7F0")}
      {...props}
    />
  </div>
);

interface FormGridProps {
  cols?:     2 | 3 | 4;
  children:  React.ReactNode;
  style?:    React.CSSProperties;
}

export const FormGrid: React.FC<FormGridProps> = ({ cols = 2, children, style }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 14, ...style }}>
    {children}
  </div>
);

export const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
    {children}
  </div>
);
