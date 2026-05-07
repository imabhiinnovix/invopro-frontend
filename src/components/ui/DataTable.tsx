import React, { useState } from "react";

export interface Column<T> {
  key:     keyof T | string;
  label:   string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns:    Column<T>[];
  rows:       T[];
  onRowClick?: (row: T) => void;
  keyField?:  keyof T;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  onRowClick,
  keyField,
}: DataTableProps<T>): JSX.Element {
  const [sortKey,  setSortKey]  = useState<string | null>(null);
  const [sortAsc,  setSortAsc]  = useState<boolean>(true);

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(true); }
  };

  const sorted = sortKey
    ? [...rows].sort((a, b) => {
        const av = a[sortKey]; const bv = b[sortKey];
        return (av < bv ? -1 : av > bv ? 1 : 0) * (sortAsc ? 1 : -1);
      })
    : rows;

  return (
    <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #E4E7F0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#F8F9FF", borderBottom: "1px solid #E4E7F0" }}>
            {columns.map(col => (
              <th
                key={String(col.key)}
                onClick={() => handleSort(String(col.key), col.sortable)}
                style={{
                  padding: "10px 14px",
                  textAlign: "left",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6B7280",
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  cursor: col.sortable ? "pointer" : "default",
                  userSelect: "none",
                }}
              >
                {col.label}
                {col.sortable && sortKey === String(col.key) && (
                  <span style={{ marginLeft: 4, opacity: 0.6 }}>{sortAsc ? "↑" : "↓"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={keyField ? String(row[keyField]) : i}
              onClick={() => onRowClick?.(row)}
              style={{
                borderBottom: "1px solid #E4E7F0",
                cursor: onRowClick ? "pointer" : "default",
                background: i % 2 === 0 ? "#fff" : "#FAFBFF",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = "#EEF0FF"; }}
              onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#FAFBFF"; }}
            >
              {columns.map(col => (
                <td
                  key={String(col.key)}
                  style={{ padding: "11px 14px", verticalAlign: "middle", whiteSpace: "nowrap" }}
                >
                  {col.render
                    ? col.render(row[String(col.key)], row)
                    : String(row[String(col.key)] ?? "")}
                </td>
              ))}
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={columns.length} style={{ padding: 40, textAlign: "center", color: "#6B7280" }}>
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
