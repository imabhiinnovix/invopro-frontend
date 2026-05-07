import { useState, useMemo } from "react";
import type { PageId } from "../types";
import { INVOICES } from "../data/mockData";
import { SectionHeader, Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Pill } from "../components/ui/Pill";
import { DataTable } from "../components/ui/DataTable";
import { SearchBox } from "../components/ui/Tabs";
import { statusColor } from "../utils/helpers";

export function InvoiceList({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  const [search, setSearch] = useState("");

  // ✅ selection state
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const rows = useMemo(() =>
    INVOICES.filter(i =>
      i.vendor.toLowerCase().includes(search.toLowerCase()) ||
      i.id.toLowerCase().includes(search.toLowerCase())
    ),
  [search]);

  // ✅ selection helpers
  const allSelected =
    rows.length > 0 && rows.every(r => selected[r.id]);

  const anySelected =
    Object.values(selected).some(Boolean);

  const toggleAll = () => {
    const newState: Record<string, boolean> = {};

    if (!allSelected) {
      rows.forEach(r => {
        newState[r.id] = true;
      });
    }

    setSelected(newState);
  };

  const toggleOne = (id: string) => {
    setSelected(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const cols = [
    // ✅ checkbox column
    {
      key:"_cb",
      label: (
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleAll}
          onClick={(e) => e.stopPropagation()}
          style={{ cursor:"pointer" }}
        />
      ),
      render: (_:any, r:any) => (
        <div onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={!!selected[r.id]}
            onChange={() => toggleOne(r.id)}
            onClick={(e) => e.stopPropagation()}
            style={{ cursor:"pointer" }}
          />
        </div>
      )
    },

    { key:"vendor", label:"Law Firm Name", render:(v:any) => <strong>{v}</strong> },
    { key:"id", label:"Invoice No.", render:(v:any) => <span style={{ fontFamily:"monospace", color:"#3B2FD9" }}>{v}</span> },
    { key:"period", label:"Billing Period", render:(v:any) => <span style={{ color:"#3B2FD9" }}>{v}</span> },
    { key:"assignee", label:"Attorney" },
    { key:"region", label:"Region" },
    { key:"currency", label:"Currency" },
    { key:"amount", label:"Amount", render:(v:any) => <strong>${Number(v).toLocaleString()}</strong> },
    { key:"status", label:"Status", render:(v:any) => <Pill label={v} color={statusColor(v)} /> },
  ];

  return (
    <div style={{ padding:24 }}>
      <SectionHeader
        title="Invoice List"
        subtitle="Last updated: 20 Apr 2026 01:23:47 PM"
        actions={
          <div style={{ display:"flex",gap:8 }}>
            <Button variant="ghost">Filter</Button>

            {/* ✅ enable only when selected */}
            <Button variant="outline" disabled={!anySelected}>
              ReValidate
            </Button>

            <Button variant="primary">Import</Button>
            <Button variant="ghost">Export</Button>
          </div>
        }
      />

      <Card>
        <div style={{ marginBottom:14 }}>
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search vendor or invoice..."
          />
        </div>

        <DataTable
          columns={cols as any}
          rows={rows}
          onRowClick={() => onNavigate("inv-detail")}
          keyField="id"
        />

        <div style={{
          display:"flex",
          justifyContent:"space-between",
          alignItems:"center",
          marginTop:12,
          fontSize:12,
          color:"#6B7280"
        }}>
          <span>Total Records: {rows.length}</span>

          <div style={{ display:"flex", gap:4 }}>
            {[1,2,3].map(p => (
              <button
                key={p}
                style={{
                  width:28,
                  height:28,
                  borderRadius:6,
                  border:`1px solid ${p===1?"#3B2FD9":"#E4E7F0"}`,
                  background:p===1?"#3B2FD9":"white",
                  color:p===1?"white":"#1A1D2E",
                  cursor:"pointer",
                  fontSize:12,
                  fontWeight:600
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}