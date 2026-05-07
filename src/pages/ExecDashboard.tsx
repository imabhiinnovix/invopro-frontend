import React from "react";
import type { PageProps } from "../types";
import { INVOICES, MONTHLY_SPEND } from "../data/mockData";
import { fmt, fmtN } from "../utils/helpers";
import { SectionHeader, Card } from "../components/ui/Card";
import { KpiCard } from "../components/ui/KpiCard";
import { DataTable, Column } from "../components/ui/DataTable";

interface SpendRow { vendor: string; currency: string; serviceFees: number; officialFees: number; serviceFeeUsd: number; officialFeeUsd: number; }

export const ExecDashboard: React.FC<PageProps> = ({ onNavigate: _ }) => {
  const maxAmt     = Math.max(...MONTHLY_SPEND.map(m => m.amount));
  const totalSpend = MONTHLY_SPEND.reduce((s, m) => s + m.amount, 0);

  const summaryRows: SpendRow[] = INVOICES.slice(0, 5).map(i => ({
    vendor:        i.vendor,
    currency:      i.currency,
    serviceFees:   i.amount * 0.9,
    officialFees:  i.amount * 0.1,
    serviceFeeUsd: i.amount * 0.88,
    officialFeeUsd:i.amount * 0.09,
  }));

  const summaryColumns: Column<SpendRow>[] = [
    { key:"vendor",        label:"Law Firm Name" },
    { key:"currency",      label:"Currency" },
    { key:"serviceFees",   label:"Service Fees",      render:v => fmtN(Number(v)) },
    { key:"officialFees",  label:"Official Fees",     render:v => fmtN(Number(v)) },
    { key:"serviceFeeUsd", label:"Service Fees (USD)",render:v => `$${fmtN(Number(v))}` },
    { key:"officialFeeUsd",label:"Off. Fees (USD)",   render:v => `$${fmtN(Number(v))}` },
    { key:"_eye",          label:"Actions",           render:() => <button style={{ background:"none", border:"none", cursor:"pointer", color:"#6B7280" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"/></svg></button> },
  ];

  return (
    <div style={{ padding: 24 }}>
      <SectionHeader title="Executive Dashboard" subtitle="High-level financial snapshot for leadership and finance" />

      <div style={{ display:"flex", gap:14, marginBottom:24, flexWrap:"wrap" }}>
        <KpiCard label="Total IP Spend"       value={`$${(totalSpend/1000000).toFixed(2)}M`} sub="Oct 2025 – Mar 2026" color="#3B2FD9" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="#3B2FD9"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>} />
        <KpiCard label="Budget vs Actual"     value="94.2%"          sub="Within budget"       color="#16A34A" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="#16A34A"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>} />
        <KpiCard label="Outstanding Invoices" value={fmt(200000)}    sub="3 invoices pending"  color="#D97706" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="#D97706"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>} />
        <KpiCard label="Approved Unpaid"      value={fmt(45000)}     sub="2 invoices"          color="#0284C7" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="#0284C7"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>} />
        <KpiCard label="MoM Spend Change"     value="+8.2%"          sub="vs Feb 2026"         color="#DC2626" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="#DC2626"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>} />
      </div>

      {/* Charts */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:16 }}>
        {/* Bar chart */}
        <Card>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#3B2FD9"><path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z"/></svg>
            Total IP Spend by Month
          </div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:10, height:150 }}>
            {MONTHLY_SPEND.map((m, i) => {
              const h      = Math.round((m.amount / maxAmt) * 130);
              const isLast = i === MONTHLY_SPEND.length - 1;
              return (
                <div key={m.month} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <div style={{ fontSize:10, color:"#6B7280", fontWeight:600 }}>${Math.round(m.amount/1000)}K</div>
                  <div style={{ width:"100%", height:h, background:isLast?"linear-gradient(180deg,#7C4DFF,#3B2FD9)":"rgba(59,47,217,.4)", borderRadius:"4px 4px 0 0" }} />
                  <div style={{ fontSize:11, color:"#6B7280", fontWeight:600 }}>{m.month}</div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top firms */}
        <Card>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#3B2FD9"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z"/></svg>
            Top 5 Law Firms
          </div>
          {INVOICES.slice(0, 5).map((inv, i) => {
            const pct = Math.round((inv.amount / INVOICES[0].amount) * 100);
            return (
              <div key={i} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                  <span style={{ fontSize:12, fontWeight:600 }}>{inv.vendor}</span>
                  <span style={{ fontSize:12, color:"#6B7280" }}>${inv.amount.toLocaleString()}</span>
                </div>
                <div style={{ height:6, background:"#E4E7F0", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#3B2FD9,#A855F7)", borderRadius:3 }} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      {/* Summary table */}
      <Card>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#3B2FD9"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
          Invoice List Summary
        </div>
        <div style={{ display:"flex", gap:14, marginBottom:16, flexWrap:"wrap" }}>
          {[
            { label:"Service Fees",        value:"Multiple",   blue:false },
            { label:"Official Fees",       value:"Multiple",   blue:false },
            { label:"Service Fees (USD)",  value:"$27,112.22", blue:true  },
            { label:"Official Fees (USD)", value:"$1,272.08",  blue:true  },
          ].map(k => (
            <div key={k.label} style={{ flex:1, minWidth:140, border:"1px solid #E4E7F0", borderRadius:8, padding:"12px 16px" }}>
              <div style={{ fontSize:11, color:"#6B7280", marginBottom:4 }}>{k.label}</div>
              <div style={{ fontSize:18, fontWeight:700, color:k.blue?"#0284C7":"#1A1D2E" }}>{k.value}</div>
            </div>
          ))}
        </div>
        <DataTable<SpendRow> columns={summaryColumns} rows={summaryRows} />
      </Card>
    </div>
  );
};
