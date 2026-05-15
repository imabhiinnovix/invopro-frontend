import React, { useState, useMemo, useEffect } from "react";
import useGet from "../hooks/useGet";
import { GET } from "../services/apiRoutes";
import { useSelector } from "react-redux";
import { RootState } from "../store";

type ViewMode = "monthly" | "quarterly" | "annual";

interface FirmRow { firm:string; region:string; session:string; total:number; proc:number; unproc:number; amount:number; approved:number; pending:number; flagged:number; }
interface MonthData { m:string; proc:number; unproc:number; }

// const FIRMS: FirmRow[] = [
//   { firm:"WBD",        region:"US", session:"Jan 2026", total:5,  proc:3, unproc:2, amount:139203, approved:89347, pending:49856, flagged:9 },
//   { firm:"AOMB",       region:"EU", session:"Jan 2026", total:4,  proc:4, unproc:0, amount:56109,  approved:56109, pending:0,     flagged:3 },
//   { firm:"JAH",        region:"US", session:"Jan 2026", total:3,  proc:2, unproc:1, amount:38236,  approved:28500, pending:9736,  flagged:3 },
//   { firm:"CCPIT",      region:"CN", session:"Jan 2026", total:4,  proc:4, unproc:0, amount:27197,  approved:27197, pending:0,     flagged:0 },
//   { firm:"Quicker",    region:"US", session:"Jan 2026", total:3,  proc:2, unproc:1, amount:7610,   approved:5200,  pending:2410,  flagged:2 },
//   { firm:"S Y-CHA",   region:"KR", session:"Jan 2026", total:2,  proc:1, unproc:1, amount:7150,   approved:4500,  pending:2650,  flagged:2 },
//   { firm:"Allegro",    region:"JP", session:"Feb 2026", total:2,  proc:2, unproc:0, amount:3545,   approved:3545,  pending:0,     flagged:0 },
//   { firm:"Saba",       region:"LB", session:"Jan 2026", total:2,  proc:2, unproc:0, amount:4014,   approved:4014,  pending:0,     flagged:0 },
//   { firm:"EP&C",       region:"EU", session:"Dec 2025", total:1,  proc:1, unproc:0, amount:389,    approved:389,   pending:0,     flagged:0 },
//   { firm:"Lavery",     region:"CA", session:"Dec 2025", total:2,  proc:1, unproc:1, amount:1704,   approved:900,   pending:804,   flagged:1 },
//   { firm:"Conley Rose",region:"US", session:"Dec 2025", total:2,  proc:2, unproc:0, amount:2097,   approved:2097,  pending:0,     flagged:0 },
// ];
// const MONTHLY: MonthData[] = [
//   { m:"Jan", proc:87000, unproc:52000 },{ m:"Feb", proc:102000, unproc:40000 },
//   { m:"Mar", proc:139000,unproc:25000 },{ m:"Apr", proc:95000,  unproc:38000 },
//   { m:"May", proc:88000, unproc:42000 },{ m:"Jun", proc:120000, unproc:18000 },
// ];
// const REGION_DIST = [
//   { region:"United States", pct:40, color:"#3B2FD9" },
//   { region:"Europe",        pct:25, color:"#7C4DFF" },
//   { region:"China",         pct:18, color:"#A855F7" },
//   { region:"Japan",         pct:10, color:"#0284C7" },
//   { region:"Other",         pct:7,  color:"#D97706" },
// ];

const fmt = (n: number) => "$" + n.toLocaleString();
const pct  = (a: number, b: number) => b ? Math.round(a / b * 100) : 0;

/* ── atoms ── */
const Pill: React.FC<{ label: string; color?: "green" | "red" | "blue" | "gray" }> = ({ label, color = "gray" }) => {
  const s = { green: { background: "#FCFCFC", color: "#15803D" }, red: { background: "#FEE2E2", color: "#B91C1C" }, blue: { background: "#DBEAFE", color: "#1D4ED8" }, gray: { background: "#F3F4F6", color: "#374151" } };
  return <span style={{ ...s[color], fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, whiteSpace: "nowrap" as const, display: "inline-block" }}>{label}</span>;
};
const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost"; size?: "sm" }> = ({ variant = "ghost", size, children, style, ...p }) => {
  const vs = { primary: { background: "linear-gradient(135deg,#3B2FD9,#7C4DFF)", color: "#fff", border: "none" }, outline: { background: "transparent", color: "#3B2FD9", border: "1.5px solid #3B2FD9" }, ghost: { background: "transparent", color: "#6B7280", border: "1px solid #E4E7F0" } };
  return <button {...p} style={{ ...vs[variant], padding: size === "sm" ? "5px 10px" : "8px 14px", fontSize: size === "sm" ? 12 : 13, borderRadius: 8, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" as const, ...style }}>{children}</button>;
};
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E4E7F0", boxShadow: "0 1px 4px rgba(0,0,0,.05)", padding: 18, ...style }}>{children}</div>
);

export const Home: React.FC = () => {
  const [period,    setPeriod]    = useState("Year to Date");
  const [firmFilter,setFirmFilter]= useState("All Law Firms");
  const [region,    setRegion]    = useState("All Regions");
  const [view,      setView]      = useState<ViewMode>("monthly");
  const [activeTags,setActiveTags]= useState<string[]>(["2026","YTD"]);

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [vendor, setVendor] = useState("");
  const [status, setStatus] = useState("");
  const [yearOptions, setYearOptions] = useState<string[]>([]);
  const [monthOptions, setMonthOptions] = useState<string[]>([]);



  const { list } = useSelector((state: RootState) => state.dataSource);

const listCurrentData = list?.find(
  (item) => item._id === import.meta.env.VITE_INVOICE_DATASOURCE_ID
);

useEffect(() => {
  if (!listCurrentData?.allDataSourceVersions) return;

  const versions = listCurrentData.allDataSourceVersions;
  const parsed = versions.map((v: any) => v.versionValue);

  const yearsSet = new Set<string>();
  const monthsMap: Record<string, Set<string>> = {};

  parsed.forEach((val: string) => {
    const [y, m] = val.split("-");

    yearsSet.add(y);

    if (!monthsMap[y]) {
      monthsMap[y] = new Set();
    }

    monthsMap[y].add(m);
  });

  const years = Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  setYearOptions(years);

  const latest = [...parsed].sort().reverse()[0];

  if (latest) {
    const [defaultYear, defaultMonth] = latest.split("-");
    setYear(defaultYear);
    setMonth(defaultMonth);
    setMonthOptions(Array.from(monthsMap[defaultYear] || []).sort());
  }
}, [listCurrentData]);

const analyticsAPI = useGet(
  ["dashboardAnalytics", year, month, vendor, status],
  `${GET.Data_Source_Version}/dashboard/analytics?dataSourceId=${import.meta.env.VITE_INVOICE_DATASOURCE_ID}&year=${year}&month=${month}&vendorId=${vendor}&aiStatus=${status}`,
  true
);

const analytics = analyticsAPI?.data?.data || {};

const totals = analytics.kpis || {
  totalBilled: 0,
  processed: 0,
  unprocessed: 0,
  flagged: 0,
  billingSessions: 0
};

const FIRMS = analytics.firms || [];
const MONTHLY = Object.entries(analytics.monthly || {}).map(
  ([m, val]: any) => ({
    m,
    proc: val.processed,
    unproc: val.unprocessed
  })
);

const REGION_DIST = Object.entries(analytics.regionWise || {}).map(
  ([region, value]: any) => ({
    region,
    pct: Math.round(
      (value /
        Object.values(analytics.regionWise || {}).reduce(
          (a: any, b: any) => a + b,
          0
        )) *
        100
    ),
    color: "#3B2FD9"
  })
);
  const TABLE_DATA = analytics.table || [];

  const filteredFirms = useMemo(() => {
    let rows = TABLE_DATA;
    if (firmFilter !== "All Law Firms") rows = rows.filter(r => r.firm === firmFilter);
    if (region !== "All Regions")       rows = rows.filter(r => region.includes(r.region));
    if (status === "Processed")         rows = rows.filter(r => r.unproc === 0);
    if (status === "Unprocessed")       rows = rows.filter(r => r.unproc > 0);
    if (status === "Flagged")           rows = rows.filter(r => r.flagged > 0);
    return rows;
  }, [firmFilter, region, status]);

  const maxMonth = Math.max(...MONTHLY.map(m => m.proc + m.unproc));
  const maxFirm = Math.max(...filteredFirms.map(f => f.totalAmount || 0), 1);



  return (
    <div style={{ padding: 24, fontFamily: "'Segoe UI',system-ui,sans-serif", color: "#1A1D2E" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Home — Analytics Dashboard</h2>
          <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>Law firm billing performance — processed &amp; unprocessed by firm, region, and period</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn size="sm">Export All Data</Btn>
          <Btn variant="primary" size="sm">Billing Session</Btn>
        </div>
      </div>

      {/* Filter bar */}
      <Card style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "12px 16px" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".07em" }}>Filters</span>
        <div style={{ width: 1, height: 24, background: "#E4E7F0" }} />
        {[
          { val: year,      setter: setYear,       opts: ["2026","2025","2024","All Years"] },
          { val: period,    setter: setPeriod,      opts: ["Year to Date","Q1 2026","Q2 2026","Last 6 Months","Last 12 Months"] },
          { val: firmFilter,setter: setFirmFilter,  opts: ["All Law Firms",...FIRMS.map(f => f.firm)] },
          { val: region,    setter: setRegion,      opts: ["All Regions","United States (US)","Europe (EU)","China (CN)","Japan (JP)","Korea (KR)"] },
          { val: status,    setter: setStatus,      opts: ["All Statuses","Processed","Unprocessed","Approved","Flagged","Paid"] },
          { val: view,      setter: (v: string) => setView(v as ViewMode), opts: ["monthly","quarterly","annual"] },
        ].map((f, i) => (
          <select key={i} value={f.val} onChange={e => f.setter(e.target.value)} style={{ border: "1.5px solid #E4E7F0", borderRadius: 8, padding: "6px 10px", fontSize: 13, fontFamily: "inherit", color: "#1A1D2E", background: "#fff", cursor: "pointer", outline: "none" }}>
            {f.opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginLeft: 4 }}>
          {activeTags.map(tag => (
            <span key={tag} style={{ display: "flex", alignItems: "center", gap: 4, background: "#3B2FD9", color: "#fff", borderRadius: 16, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>
              {tag}
              <span onClick={() => setActiveTags(t => t.filter(x => x !== tag))} style={{ cursor: "pointer", opacity: 0.7, fontSize: 14 }}>×</span>
            </span>
          ))}
        </div>
        <Btn size="sm" style={{ marginLeft: "auto" }} onClick={() => setActiveTags([year])}>Clear All</Btn>
        <Btn variant="primary" size="sm">Apply</Btn>
      </Card>

      {/* KPI widgets */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Total Billed",   value: fmt(totals.totalBilled),   sub: `${filteredFirms.length} firms`,    color: "#3B2FD9", accent: "#3B2FD9", badge: "+12% YoY",   bColor: "#FEE2E2", tColor: "#B91C1C" },
          { label: "Processed",      value: fmt(totals.processed),  sub: `${filteredFirms.filter(f=>f.unproc===0).length} complete`, color: "#16A34A", accent: "#16A34A", badge: "78%",       bColor: "#DCFCE7", tColor: "#15803D" },
          { label: "Unprocessed",    value: fmt(totals.unprocessed),   sub: `${filteredFirms.filter(f=>f.unproc>0).length} pending`, color: "#DC2626", accent: "#DC2626", badge: "Pending",    bColor: "#FEE2E2", tColor: "#B91C1C" },
          { label: "Flagged Items",  value: String(totals.flagged),sub: "Across firms",       color: "#D97706", accent: "#D97706", badge: "Review",     bColor: "#FEF3C7", tColor: "#92400E" },
          { label: "Billing Sessions", value: totals.billingSessions,                  sub: "Jan – Jun 2026",     color: "#0284C7", accent: "#0284C7", badge: year,         bColor: "#DBEAFE", tColor: "#1D4ED8" },
        ].map(k => (
          <div key={k.label} style={{ background: "#fff", borderRadius: 12, border: "1px solid #E4E7F0", padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,.05)", borderTop: `3px solid ${k.accent}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".08em" }}>{k.label}</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10, background: k.bColor, color: k.tColor }}>{k.badge}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: "#6B7280", marginTop: 3 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Monthly stacked bar */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#3B2FD9"><path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z"/></svg>
              Monthly Billing — Processed vs Unprocessed
            </div>
            <div style={{ display: "flex", gap: 12, fontSize: 11, alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#3B2FD9", display: "inline-block" }} />Processed</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(220,38,38,.3)", display: "inline-block" }} />Unprocessed</span>
              <Btn size="sm">Export</Btn>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 130 }}>
            {MONTHLY.map(m => {
              const hp = Math.round((m.proc   / maxMonth) * 120);
              const hu = Math.round((m.unproc / maxMonth) * 120);
              return (
                <div key={m.m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <div style={{ fontSize: 9, color: "#6B7280", fontWeight: 600 }}>${Math.round((m.proc + m.unproc) / 1000)}K</div>
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 1 }}>
                    <div style={{ width: "100%", height: hu, background: "rgba(220,38,38,.25)", borderRadius: hu > 0 ? "4px 4px 0 0" : 0 }} />
                    <div style={{ width: "100%", height: hp, background: "linear-gradient(180deg,#7C4DFF,#3B2FD9)", borderRadius: hu === 0 ? "4px 4px 0 0" : 0 }} />
                  </div>
                  <div style={{ fontSize: 10, color: "#6B7280", fontWeight: 600 }}>{m.m}</div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Region donut */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Region-Wise Spend</div>
            <Btn size="sm">Export</Btn>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg viewBox="0 0 42 42" style={{ width: 100, height: 100, flexShrink: 0 }}>
              <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#E4E7F0" strokeWidth="5"/>
              {[40, 25, 18, 10, 7].reduce((acc, pct, i) => {
                const offset = acc.offset;
                const colors = ["#3B2FD9","#7C4DFF","#A855F7","#0284C7","#D97706"];
                return { offset: offset + pct, els: [...acc.els,
                  <circle key={i} cx="21" cy="21" r="15.9" fill="transparent" stroke={colors[i]} strokeWidth="5"
                    strokeDasharray={`${pct} ${100-pct}`} strokeDashoffset={25-offset} transform="rotate(-90 21 21)" />
                ]};
              }, { offset: 0, els: [] as JSX.Element[] }).els}
              <text x="21" y="23" textAnchor="middle" fontSize="4" fontWeight="bold" fill="#1A1D2E">$487K</text>
            </svg>
            <div style={{ flex: 1 }}>
              {REGION_DIST.map(r => (
                <div key={r.region} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, marginBottom: 7 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>{r.region}</div>
                  <strong>{r.pct}%</strong>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* 3-col charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Firm horizontal bars */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Law Firm Billing</div>
          {filteredFirms.slice(0, 7).map(f => (
            <div key={f.firm} style={{ marginBottom: 9 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                <span style={{ fontWeight: 600 }}>{f.firm}</span>
                <span style={{ color: "#6B7280" }}>{fmt(f.totalAmount)}</span>
              </div>
              <div style={{ height: 6, background: "#E4E7F0", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.round(((f.totalAmount || 0) / maxFirm) * 100)}%`, background: "linear-gradient(90deg,#3B2FD9,#A855F7)", borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </Card>

        {/* Processing rate */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Processing Rate by Firm</div>
          {filteredFirms.slice(0, 7).map(f => {
            const p = pct(f.proc, f.total);
            const c = p === 100 ? "#16A34A" : p >= 60 ? "#3B2FD9" : "#DC2626";
            return (
              <div key={f.firm} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                  <span style={{ fontWeight: 600 }}>{f.firm}</span>
                  <span style={{ fontWeight: 700, color: c }}>{p}%</span>
                </div>
                <div style={{ height: 7, background: "#E4E7F0", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${p}%`, background: c, borderRadius: 4, transition: "width .4s" }} />
                </div>
              </div>
            );
          })}
        </Card>

        {/* Flagged */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Flagged Items by Firm</div>
          {filteredFirms.filter(f => f.flagged > 0).map(f => (
            <div key={f.firm} style={{ marginBottom: 9 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                <span style={{ fontWeight: 600 }}>{f.firm}</span>
                <span style={{ color: "#DC2626", fontWeight: 700 }}>⚑ {f.flagged}</span>
              </div>
              <div style={{ height: 6, background: "#E4E7F0", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.round((f.flagged / 9) * 100)}%`, background: "#DC2626", borderRadius: 3 }} />
              </div>
            </div>
          ))}
          {filteredFirms.every(f => f.flagged === 0) && <div style={{ textAlign: "center", padding: 20, color: "#16A34A", fontWeight: 600 }}>No flagged items</div>}
        </Card>
      </div>

      {/* Detail table */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Law Firm Billing Detail</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn size="sm">Export CSV</Btn>
            <Btn size="sm">Export Excel</Btn>
            <Btn variant="primary" size="sm">Export PDF</Btn>
          </div>
        </div>
        <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #E4E7F0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F8F9FF", borderBottom: "1px solid #E4E7F0" }}>
                {["Law Firm","Region","Billing Session","Invoices","Processed","Unprocessed","Total Amt","Approved","Pending","Flagged","Processing %","Status","Actions"].map(h => (
                  <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: ".07em", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredFirms.map((f, i) => {
                const p = pct(f.proc, f.total);
                const sc = p === 100 ? "green" : f.unproc > 0 ? "red" : "blue";
                const sl = p === 100 ? "Complete" : f.unproc > 0 ? "In Progress" : "Pending";
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #E4E7F0", background: i % 2 === 0 ? "#fff" : "#FAFBFF" }}>
                    <td style={{ padding: "9px 12px", fontWeight: 600, whiteSpace: "nowrap" }}>{f.firm}</td>
                    <td style={{ padding: "9px 12px" }}><span style={{ background: "#F8F9FF", border: "1px solid #E4E7F0", borderRadius: 4, padding: "1px 7px", fontSize: 11, fontWeight: 600 }}>{f.region}</span></td>
                    <td style={{ padding: "9px 12px", fontFamily: "monospace", fontSize: 12, color: "#6B7280" }}>{f.session}</td>
                    <td style={{ padding: "9px 12px", textAlign: "center" }}>{f.total}</td>
                    <td style={{ padding: "9px 12px", textAlign: "center", color: "#16A34A", fontWeight: 600 }}>{f.proc}</td>
                    <td style={{ padding: "9px 12px", textAlign: "center", color: f.unproc > 0 ? "#DC2626" : "#6B7280", fontWeight: f.unproc > 0 ? 600 : 400 }}>{f.unproc}</td>
                    <td style={{ padding: "9px 12px", fontWeight: 700 }}>{fmt(f.totalAmount)}</td>
                    <td style={{ padding: "9px 12px", color: "#16A34A", fontWeight: 600 }}>{fmt(f.approved)}</td>
                    <td style={{ padding: "9px 12px", color: f.pending > 0 ? "#DC2626" : "#6B7280" }}>{fmt(f.pending)}</td>
                    <td style={{ padding: "9px 12px", textAlign: "center", color: f.flagged > 0 ? "#DC2626" : "#6B7280", fontWeight: f.flagged > 0 ? 700 : 400 }}>{f.flagged > 0 ? `⚑ ${f.flagged}` : "—"}</td>
                    <td style={{ padding: "9px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ height: 6, flex: 1, background: "#E4E7F0", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${p}%`, background: p === 100 ? "#16A34A" : "#3B2FD9", borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: p === 100 ? "#16A34A" : "#3B2FD9", minWidth: 28 }}>{p}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "9px 12px" }}><Pill label={sl} color={sc} /></td>
                    <td style={{ padding: "9px 12px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button style={{ padding: "3px 9px", background: "#3B2FD9", color: "#fff", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>View</button>
                        <button style={{ padding: "3px 9px", background: "transparent", color: "#6B7280", border: "1px solid #E4E7F0", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Export</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, fontSize: 12, color: "#6B7280" }}>
          <span>Showing {filteredFirms.length} of {FIRMS.length} firms</span>
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2].map(p => <button key={p} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${p === 1 ? "#3B2FD9" : "#E4E7F0"}`, background: p === 1 ? "#3B2FD9" : "#fff", color: p === 1 ? "#fff" : "#1A1D2E", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{p}</button>)}
          </div>
        </div>
      </Card>
    </div>
  );
};
