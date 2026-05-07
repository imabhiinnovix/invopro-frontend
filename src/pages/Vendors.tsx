import { useState } from "react";
import type { PageId } from "../types";
import { VENDORS } from "../data/mockData";
import { SectionHeader, Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { Pill } from "../components/ui/Pill";
import { SearchBox } from "../components/ui/Tabs";
import { useNavigate } from "react-router-dom";

export function Vendors({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const rows = VENDORS.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  const cols = [
    {
      key: "name",
      label: "Name",
      render: (v: unknown) => <strong>{String(v)}</strong>
    },
    {
      key: "code",
      label: "Code",
      render: (v: unknown) => (
        <span style={{ fontFamily: "monospace", fontSize: 11, color: "#3B2FD9" }}>
          {String(v)}
        </span>
      )
    },
    { key: "region", label: "Region" },
    {
      key: "taxId",
      label: "Tax ID",
      render: (v: unknown) => (
        <span style={{ fontFamily: "monospace", fontSize: 11 }}>
          {String(v)}
        </span>
      )
    },
    {
      key: "status",
      label: "Status",
      render: () => <Pill label="active" color="green" />
    },
    { key: "updatedAt", label: "Updated At" },
    {
      key: "_act",
      label: "Actions",
      render: (_: unknown) => (
        <div style={{ display: "flex", gap: 8 }}>
          
          {/* EDIT ICON (same as original) */}
          <button
            onClick={() => navigate("/vendor-create")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6B7280"
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>
            </svg>
          </button>

          {/* VIEW ICON (same as original) */}
          <button
          onClick={(e) => {
    e.stopPropagation(); // ✅ IMPORTANT (prevents row click firing twice)
    navigate("/vendor-rate-card", row);
  }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6B7280"
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"/>
            </svg>
          </button>

        </div>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <SectionHeader
        title="Vendors"
        subtitle="View and manage all law firm vendors and their contracts"
        actions={
          <Button
            variant="primary"
            onClick={() => navigate("/vendor-create")}
          >
            {/* ORIGINAL + ICON */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Create Vendor
          </Button>
        }
      />

      <Card>
        <div style={{ marginBottom: 14 }}>
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search vendors..."
          />
        </div>

<DataTable
  columns={cols as any}
  rows={rows}
  keyField="id"
  onRowClick={(row: any) => navigate("/vendor-rate-card", row)}  // ✅
/>      </Card>
    </div>
  );
}