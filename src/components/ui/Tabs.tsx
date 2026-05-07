import React from "react";

interface Tab {
  id:     string;
  label:  string;
  count?: number;
}

interface TabsProps {
  tabs:     Tab[];
  active:   string;
  onChange: (id: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, active, onChange }) => (
  <div style={{ display: "flex", borderBottom: "2px solid #E4E7F0", marginBottom: 20 }}>
    {tabs.map(t => (
      <button
        key={t.id}
        onClick={() => onChange(t.id)}
        style={{
          border:       "none",
          background:   "none",
          cursor:       "pointer",
          padding:      "10px 18px",
          fontSize:     13,
          fontWeight:   active === t.id ? 700 : 500,
          color:        active === t.id ? "#3B2FD9" : "#6B7280",
          borderBottom: active === t.id ? "2px solid #3B2FD9" : "2px solid transparent",
          marginBottom: -2,
          transition:   "all 0.15s",
          display:      "flex",
          alignItems:   "center",
          gap:          6,
          fontFamily:   "inherit",
          whiteSpace:   "nowrap",
        }}
      >
        {t.label}
        {t.count != null && (
          <span
            style={{
              background:   active === t.id ? "#3B2FD9" : "#E4E7F0",
              color:        active === t.id ? "#fff"    : "#6B7280",
              borderRadius: 20,
              padding:      "1px 7px",
              fontSize:     10,
              fontWeight:   700,
            }}
          >
            {t.count}
          </span>
        )}
      </button>
    ))}
  </div>
);

interface SearchBoxProps {
  value:       string;
  onChange:    (value: string) => void;
  placeholder?: string;
  width?:      number | string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({ value, onChange, placeholder = "Search...", width = 280 }) => (
  <div style={{ position: "relative", display: "inline-block" }}>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#6B7280"
      style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        border:      "1.5px solid #E4E7F0",
        borderRadius: 8,
        padding:     "7px 12px 7px 30px",
        fontSize:    13,
        color:       "#1A1D2E",
        background:  "#fff",
        outline:     "none",
        fontFamily:  "inherit",
        width,
        transition:  "border 0.15s",
      }}
      onFocus={e => (e.target.style.borderColor = "#3B2FD9")}
      onBlur={e  => (e.target.style.borderColor = "#E4E7F0")}
    />
  </div>
);
