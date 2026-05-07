import React, { useState } from "react";
import type { AuditEntry, AuditLogType } from "../types";
import { Button } from "./ui/Button";
import { auditDotColor, auditTypeColor, auditTypeLabel } from "../utils/helpers";

interface AuditTrailProps {
  entries:        AuditEntry[];
  onAddComment:   () => void;
  caseNumber: string;
}

const FILTERS: { id: AuditLogType | "all"; label: string }[] = [
  { id: "all",        label: "All"          },
  { id: "upload",     label: "Uploads"      },
  { id: "validation", label: "Validation"   },
  { id: "edit",       label: "Analyst Edits"},
  { id: "approval",   label: "Approvals"    },
  { id: "payment",    label: "Payment"      },
];

export const AuditTrail: React.FC<AuditTrailProps> = ({ entries, caseNumber, onAddComment }) => {
  const [filter, setFilter] = useState<AuditLogType | "all">("all");

  const visible = filter === "all" ? entries : entries.filter(e => e.type === filter);

  return (
    <div style={{ marginTop: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1A1D2E", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#3B2FD9"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
          Audit Trail &amp; Activity Log {caseNumber}
        </h3>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="ghost" size="sm">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2z"/></svg>
            Export Log
          </Button>
          {/* <Button variant="primary" size="sm" onClick={onAddComment}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
            Add Comment
          </Button> */}
        </div>
      </div>

      {/* Filter chips */}
      {/* <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as AuditLogType | "all")}
            style={{
              border:       `1px solid ${filter === f.id ? "#3B2FD9" : "#E4E7F0"}`,
              background:   filter === f.id ? "#3B2FD9" : "#fff",
              color:        filter === f.id ? "#fff"    : "#6B7280",
              borderRadius: 20,
              padding:      "3px 12px",
              fontSize:     12,
              cursor:       "pointer",
              fontFamily:   "inherit",
              transition:   "all 0.15s",
            }}
          >
            {f.label}
          </button>
        ))}
      </div> */}

      {/* Log entries */}
      <div>
        {visible.map((entry, i) => (
          <div key={entry.id} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid #E4E7F0", position: "relative" }}>
            {/* Dot + connector line */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: auditDotColor(entry.type), flexShrink: 0 }} />
              {i < visible.length - 1 && (
                <div style={{ width: 2, flex: 1, background: "#E4E7F0", marginTop: 4 }} />
              )}
            </div>

            {/* Body */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: auditTypeColor(entry.type) }}>
                  {auditTypeLabel(entry.type)}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#3B2FD9" }}>{entry.actor}</span>
                <span style={{ fontSize: 11, color: "#6B7280" }}>{entry.time}</span>
              </div>
              <div style={{ fontSize: 13, color: "#1A1D2E", marginBottom: 5 }}>{entry.message}</div>
              <span style={{ fontSize: 11, color: "#6B7280", fontFamily: "monospace", background: "#F8F9FF", borderRadius: 4, padding: "3px 8px", display: "inline-block" }}>
                {entry.meta}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
