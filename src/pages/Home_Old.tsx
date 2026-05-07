import React from "react";
import type { PageProps, Invoice } from "../types";
import { INVOICES } from "../data/mockData";
import { fmt, riskColor, statusColor } from "../utils/helpers";
import { SectionHeader, SubHead } from "../components/ui/Card";
import { KpiCard } from "../components/ui/KpiCard";
import { Pill } from "../components/ui/Pill";
import { Button } from "../components/ui/Button";
import { DataTable, Column } from "../components/ui/DataTable";

export const Home: React.FC<PageProps> = ({ onNavigate }) => {
  const notApproved = INVOICES.filter(i => !["Approved", "Paid"].includes(i.status));
  const approved    = INVOICES.filter(i =>  ["Approved", "Paid"].includes(i.status));
  const totalBilled = INVOICES.reduce((s, i) => s + i.amount, 0);
  const totalAppr   = approved.reduce((s, i) => s + i.amount, 0);
  const violations  = INVOICES.filter(i => i.status === "Rate Violation").length;

  const columns: Column<Invoice>[] = [
    { key:"vendor",   label:"Vendor",      render:v => <strong>{String(v)}</strong> },
    { key:"id",       label:"Invoice No.", render:v => <span style={{ fontFamily:"monospace", color:"#3B2FD9", fontWeight:600 }}>{String(v)}</span> },
    { key:"month",    label:"Month" },
    { key:"amount",   label:"Amount",      render:(v, r) => <><strong>${Number(v).toLocaleString()}</strong> <span style={{ fontSize:10, color:"#6B7280" }}>{r.currency as string}</span></> },
    { key:"flagged",  label:"Flags",       render:v => Number(v) > 0
        ? <span style={{ color:"#DC2626", fontWeight:700, display:"flex", alignItems:"center", gap:4 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>{String(v)}</span>
        : <span style={{ color:"#16A34A", display:"flex", alignItems:"center", gap:4 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>0</span>
    },
    { key:"risk",     label:"Risk",        render:v => <Pill label={String(v)} color={riskColor(v as any)} /> },
    { key:"status",   label:"Status",      render:v => <Pill label={String(v)} color={statusColor(v as any)} /> },
    { key:"assignee", label:"Assigned To" },
    { key:"_actions", label:"Actions",     render:(_, r) => (
      <div style={{ display:"flex", gap:5 }}>
        <Button size="sm" variant="primary" onClick={e => { e.stopPropagation(); onNavigate("inv-detail"); }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"/></svg>Review
        </Button>
        <Button size="sm" variant="ghost" onClick={e => e.stopPropagation()}>Revalidate</Button>
      </div>
    )},
  ];

  return (
    <div style={{ padding: 24 }}>
      <SectionHeader
        title="Home"
        subtitle="Operational queue for invoice audit and compliance"
        actions={
          <Button variant="primary">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z"/></svg>
            Upload Invoice
          </Button>
        }
      />

      <div style={{ display:"flex", gap:14, marginBottom:24, flexWrap:"wrap" }}>
        <KpiCard label="Monthly Invoiced"  value={fmt(totalBilled)}   sub={`${INVOICES.length} invoices`}     color="#3B2FD9" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="#3B2FD9"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>} />
        <KpiCard label="Monthly Approved"  value={fmt(totalAppr)}     sub={`${approved.length} invoices`}     color="#16A34A" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="#16A34A"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>} />
        <KpiCard label="Not Approved"      value={notApproved.length} sub="Require action"                    color="#DC2626" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="#DC2626"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>} />
        <KpiCard label="Rate Violations"   value={violations}         sub="This month"                        color="#D97706" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="#D97706"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>} />
      </div>

      <SubHead title="Pending / Not Approved" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="#D97706"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>} />
      <div style={{ marginBottom: 24 }}>
        <DataTable<Invoice> columns={columns} rows={notApproved} onRowClick={() => onNavigate("inv-detail")} keyField="id" />
      </div>

      <SubHead title="Recently Approved / Paid" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="#16A34A"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>} />
      <DataTable<Invoice>
        columns={columns.filter(c => c.key !== "_actions")}
        rows={approved}
        onRowClick={() => onNavigate("inv-detail")}
        keyField="id"
      />
    </div>
  );
};