import React, { useState, useMemo } from "react";
import type { PageProps, Invoice, InvoiceStatus } from "../types";
import { INVOICES } from "../data/mockData";
import { riskColor, statusColor } from "../utils/helpers";
import { SectionHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Pill } from "../components/ui/Pill";
import { Tabs, SearchBox } from "../components/ui/Tabs";
import { DataTable, Column } from "../components/ui/DataTable";
import { ConfirmModal } from "../components/ui/Modal";
import { useNavigate } from "react-router-dom";


interface ForceState { open: boolean; ref: string; }

export const InvoiceReview: React.FC<PageProps> = ({ onNavigate }) => {
  const [tab, setTab] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [force, setForce] = useState<ForceState>({ open: false, ref: "" });
    

  const [selectedByTab, setSelectedByTab] = useState<Record<string, Record<string, boolean>>>({});
  const selected = selectedByTab[tab] || {};

  const navigate = useNavigate();

  const filtered = useMemo<Invoice[]>(() => {
    let rows = INVOICES;

    if (tab === "pending")
      rows = rows.filter(i => !["Approved", "Paid"].includes(i.status));

    if (tab === "violation")
      rows = rows.filter(i => i.status === "Rate Violation");

    if (tab === "approved")
      rows = rows.filter(i => ["Approved", "Paid"].includes(i.status));

    if (search)
      rows = rows.filter(i =>
        i.vendor.toLowerCase().includes(search.toLowerCase()) ||
        i.id.toLowerCase().includes(search.toLowerCase())
      );

    return rows;
  }, [tab, search]);

  const allSelected =
    filtered.length > 0 && filtered.every(r => selected[r.id]);

  const anySelected =
    Object.values(selected).some(Boolean);

  const toggleAll = () => {
    const newState: Record<string, boolean> = {};

    if (!allSelected) {
      filtered.forEach(r => {
        newState[r.id] = true;
      });
    }

    setSelectedByTab(prev => ({
      ...prev,
      [tab]: newState
    }));
  };

  const toggleOne = (id: string) => {
    setSelectedByTab(prev => ({
      ...prev,
      [tab]: {
        ...(prev[tab] || {}),
        [id]: !prev[tab]?.[id]
      }
    }));
  };

  const columns: Column<Invoice>[] = [
    {
      key: "_cb",
      label: (
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleAll}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      render: (_: any, r) => (
        <div onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={!!selected[r.id]}
            onChange={() => toggleOne(r.id as string)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )
    },
    { key:"vendor", label:"Vendor", render:v => <strong>{String(v)}</strong> },
    { key:"id", label:"Invoice No.", render:v => <span style={{ fontFamily:"monospace", color:"#3B2FD9" }}>{String(v)}</span> },
    { key:"date", label:"Invoice Date" },
    { key:"period", label:"Billing Period" },
    {
      key:"amount",
      label:"Total Amount",
      render:(v, r) => (
        <>
          <strong>${Number(v).toLocaleString()}</strong>
          <span style={{ fontSize:10, color:"#6B7280" }}> {r.currency as string}</span>
        </>
      )
    },
    { key:"items", label:"Line Items", sortable:true },
    {
      key:"matched",
      label:"Matched",
      render:v => <span style={{ color:"#16A34A", fontWeight:600 }}>{String(v)}</span>
    },
    {
      key:"flagged",
      label:"Flagged",
      render:v =>
        Number(v) > 0
          ? <span style={{ color:"#DC2626", fontWeight:700 }}>⚑ {String(v)}</span>
          : <span style={{ color:"#6B7280" }}>—</span>
    },
    { key:"risk", label:"Risk", render:v => <Pill label={String(v)} color={riskColor(v as any)} /> },
    { key:"status", label:"Status", render:v => <Pill label={String(v)} color={statusColor(v as any)} /> },
    {
      key:"_actions",
      label:"Actions",
      render:(_, r) => {
        const isFlagged = !["Approved","Paid"].includes(r.status as InvoiceStatus);

        return (
          <div style={{ display:"flex", gap:5 }}>
            <Button
              size="sm"
              variant="primary"
              onClick={e => {
                e.stopPropagation();
                navigate("/inv-detail");
              }}
            >
              Review
            </Button>

            {/* {isFlagged && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  setForce({ open:true, ref: r.id as string });
                }}
                style={{
                  background:"#7C4DFF",
                  color:"#fff",
                  border:"none",
                  borderRadius:6,
                  padding:"4px 10px",
                  fontSize:11,
                  fontWeight:700,
                  cursor:"pointer"
                }}
              >
                Force Pass
              </button>
            )} */}
          </div>
        );
      }
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <SectionHeader
        title="Invoice Review & Audit"
        subtitle="Last updated: 20 Apr 2026 01:23:47 PM"
      />

      {/* ✅ Tabs + Actions */}
      <Tabs
  active={tab}
  onChange={(t) => setTab(t)}
  tabs={[
    { id:"all", label:"All Invoices", count:INVOICES.length },
    { id:"pending", label:"Not Approved", count:INVOICES.filter(i=>!["Approved","Paid"].includes(i.status)).length },
    { id:"violation", label:"Rate Violations", count:INVOICES.filter(i=>i.status==="Rate Violation").length },
    { id:"approved", label:"Approved / Paid", count:INVOICES.filter(i=>["Approved","Paid"].includes(i.status)).length },
  ]}
/>

      <div style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 14,
  gap: 10
}}>
  {/* Search */}
  <div style={{ flex: 1, maxWidth: 320 }}>
    <SearchBox
      value={search}
      onChange={setSearch}
      placeholder="Search vendor or invoice..."
    />
  </div>

  {/* Actions */}
  <div style={{ display: "flex", gap: 8 }}>
    <Button variant="ghost">Filter</Button>

    {tab !== "approved" && (
      <Button variant="outline" disabled={!anySelected}>
        ReValidate
      </Button>
    )}
  </div>
</div>

      <DataTable<Invoice>
        columns={columns}
        rows={filtered}
        onRowClick={() => navigate("/inv-detail")}
        keyField="id"
      />

      {/* Pagination */}
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:12, fontSize:12, color:"#6B7280" }}>
        <span>Total Records: {filtered.length}</span>
        <div style={{ display:"flex", gap:4 }}>
          {[1,2,3].map(p => (
            <button key={p} style={{
              width:28,height:28,borderRadius:6,
              border:`1px solid ${p===1?"#3B2FD9":"#E4E7F0"}`,
              background:p===1?"#3B2FD9":"white",
              color:p===1?"white":"#1A1D2E",
              cursor:"pointer"
            }}>{p}</button>
          ))}
        </div>
      </div>

      <ConfirmModal
        open={force.open}
        onClose={() => setForce({ open:false, ref:"" })}
        onConfirm={() => setForce({ open:false, ref:"" })}
        title="Force Validation Pass"
        confirmLabel="Confirm Force Pass"
        confirmVariant="force"
        message={
          <>You are about to force-pass flagged record <strong>{force.ref}</strong>.</>
        }
        warning="This action is irreversible."
      />
    </div>
  );
};