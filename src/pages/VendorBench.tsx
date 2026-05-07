import React from "react";
import type { PageProps } from "../types";
import { BENCH_DATA } from "../data/mockData";
import { SectionHeader, Card } from "../components/ui/Card";
import { Pill } from "../components/ui/Pill";
import { DataTable, Column } from "../components/ui/DataTable";
import { indexColor, rankColor } from "../utils/helpers";
import type { BenchEntry } from "../types";

export const VendorBench: React.FC<PageProps> = ({ onNavigate: _ }) => {
  const sorted = [...BENCH_DATA].sort((a, b) => a.index - b.index);

  const benchCols: Column<BenchEntry>[] = [
    { key:"vendor",      label:"Vendor",          render:v => <strong>{String(v)}</strong>, sortable:true },
    { key:"filing",      label:"Filing Avg",      render:v => <span style={{ fontFamily:"monospace" }}>${Number(v).toLocaleString()}</span>, sortable:true },
    { key:"prosecution", label:"Prosecution Avg", render:v => <span style={{ fontFamily:"monospace" }}>${Number(v).toLocaleString()}</span>, sortable:true },
    { key:"renewal",     label:"Renewal Avg",     render:v => <span style={{ fontFamily:"monospace" }}>${Number(v).toLocaleString()}</span>, sortable:true },
    { key:"index",       label:"Cost Index",      render:v => <span style={{ color:indexColor(Number(v)), fontWeight:700, fontSize:14 }}>{String(v)}</span>, sortable:true },
  ];

  const activities = [
    { name:"Filing",        amount:125000, growth:"+12%", color:"#3B2FD9" },
    { name:"Prosecution",   amount:87000,  growth:"+5%",  color:"#7C4DFF" },
    { name:"Office Actions",amount:64000,  growth:"+18%", color:"#A855F7" },
    { name:"Renewals",      amount:41000,  growth:"-3%",  color:"#0284C7" },
    { name:"Paralegal",     amount:22000,  growth:"+2%",  color:"#16A34A" },
  ];
  const maxA = Math.max(...activities.map(a => a.amount));

  const heatRows = [
    { activity:"Filing",       WBD:2100, AOMB:2500, CCPIT:1900, JAH:2300, Allegro:1800, avg:2120 },
    { activity:"Office Action",WBD:1400, AOMB:1700, CCPIT:1300, JAH:1600, Allegro:1200, avg:1440 },
    { activity:"Renewal",      WBD:800,  AOMB:950,  CCPIT:700,  JAH:870,  Allegro:650,  avg:794  },
  ];
  type HeatRow = typeof heatRows[0];

  const heatCols: Column<HeatRow>[] = [
    { key:"activity", label:"Activity" },
    ...["WBD","AOMB","CCPIT","JAH","Allegro"].map(v => ({
      key: v as keyof HeatRow,
      label: v,
      render: (val: unknown) => {
        const n = Number(val);
        const bg = n > 2000 ? "#FEE2E2" : n < 1500 ? "#DCFCE7" : "#FEF9C3";
        return <span style={{ background:bg, borderRadius:4, padding:"2px 8px", fontSize:12, fontWeight:600 }}>${n.toLocaleString()}</span>;
      },
    })),
    { key:"avg", label:"Avg", render:v => <strong style={{ color:"#3B2FD9" }}>${Number(v).toLocaleString()}</strong> },
  ];

  return (
    <div style={{ padding: 24 }}>
      <SectionHeader title="Vendor Benchmarking & Activity Analytics" subtitle="Compare law firms across cost and performance metrics" />

      {/* Activity spend */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <Card>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#3B2FD9"><path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z"/></svg>
            Spend by Activity
          </div>
          {activities.map(a => {
            const pct = Math.round((a.amount / maxA) * 100);
            const pos = a.growth.startsWith("+");
            return (
              <div key={a.name} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
                  <span style={{ fontSize:12, fontWeight:600 }}>{a.name}</span>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <span style={{ fontSize:11, color:pos?"#16A34A":"#DC2626", fontWeight:600 }}>{a.growth}</span>
                    <span style={{ fontSize:12, color:"#6B7280" }}>${a.amount.toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ height:8, background:"#E4E7F0", borderRadius:4, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:a.color, borderRadius:4 }} />
                </div>
              </div>
            );
          })}
        </Card>

        <Card>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#DC2626"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
            Cost-Heavy Areas
          </div>
          {[
            { color:"#DC2626", bg:"#DC262615", icon:<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>, label:"Highest spend",  value:"Filing — $125,000" },
            { color:"#D97706", bg:"#D9770615", icon:<path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59z"/>,                                                             label:"Fastest growing",value:"Office Actions +18%" },
            { color:"#0284C7", bg:"#0284C715", icon:<path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59z"/>,                                                             label:"Highest variance",value:"Office Actions (±22%)" },
            { color:"#DC2626", bg:"#DC262615", icon:<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>,                                                label:"Exceeding budget",value:"Filing (+12%), OA (+18%)" },
          ].map((item, i) => (
            <div key={i} style={{ display:"flex", gap:10, padding:"10px 0", borderBottom:i<3?"1px solid #E4E7F0":"none", alignItems:"flex-start" }}>
              <div style={{ width:28, height:28, borderRadius:6, background:item.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill={item.color}>{item.icon}</svg>
              </div>
              <div>
                <div style={{ fontSize:11, color:"#6B7280", fontWeight:600 }}>{item.label}</div>
                <div style={{ fontSize:13, fontWeight:700, marginTop:2 }}>{item.value}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Heatmap table */}
      <Card style={{ marginBottom:16 }}>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#3B2FD9"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
          Average Cost per Activity per Vendor
        </div>
        <DataTable<HeatRow> columns={heatCols} rows={heatRows} />
      </Card>

      {/* Bench table */}
      <Card style={{ marginBottom:16 }}>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#3B2FD9"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
          Vendor Cost Comparison
        </div>
        <DataTable<BenchEntry> columns={benchCols} rows={BENCH_DATA} keyField="vendor" />
      </Card>

      {/* Ranking + regions */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#D97706"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z"/></svg>
            Vendor Ranking
          </div>
          {sorted.map((v, i) => (
            <div key={v.vendor} style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 0", borderBottom:"1px solid #E4E7F0" }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:rankColor(i+1), color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:12, flexShrink:0 }}>{i+1}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700 }}>{v.vendor}</div>
                <div style={{ fontSize:11, color:"#6B7280" }}>Cost Index: {v.index}</div>
              </div>
              <Pill label={i < 2 ? "Efficient" : i >= 4 ? "Expensive" : "Average"} color={i < 2 ? "green" : i >= 4 ? "red" : "amber"} />
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#3B2FD9"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>
            Region-Wise Rate Benchmarking
          </div>
          {[
            { region:"United States", filing:"$2,350", oa:"$1,650", renewal:"$820" },
            { region:"Europe",        filing:"$2,100", oa:"$1,500", renewal:"$780" },
            { region:"China",         filing:"$1,950", oa:"$1,300", renewal:"$720" },
            { region:"Japan",         filing:"$2,600", oa:"$1,850", renewal:"$910" },
            { region:"South Korea",   filing:"$2,200", oa:"$1,550", renewal:"$800" },
          ].map((r, i, arr) => (
            <div key={r.region} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:i<arr.length-1?"1px solid #E4E7F0":"none", fontSize:12 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#6B7280"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
              <span style={{ fontWeight:700, width:110, flexShrink:0 }}>{r.region}</span>
              <span style={{ color:"#6B7280" }}>Filing: <strong>{r.filing}</strong></span>
              <span style={{ color:"#6B7280" }}>OA: <strong>{r.oa}</strong></span>
              <span style={{ color:"#6B7280" }}>Renewal: <strong>{r.renewal}</strong></span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};
