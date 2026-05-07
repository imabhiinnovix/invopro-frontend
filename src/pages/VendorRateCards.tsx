import React, { useState } from "react";

type VendorTab = "el" | "attorney" | "fa" | "invoices";

/* ─ types ─ */
interface Contract   { id: string; title: string; effective: string; expiry: string; desc: string; status: "Active" | "Expired" | "Draft"; }
interface Attorney   { name: string; title: "Partner" | "Associate" | "Paralegal"; bar: string; spec: string; rate: number; prev: number; region: string; }
interface FaCode     { code: string; desc: string; type: string; rate: number; min: number; max: number; cur: string; region: string; prev: number; }

/* ─ mock data ─ */
const CONTRACTS: Contract[] = [
  { id:"c1", title:"Master Engagement Agreement — WBD 2026", effective:"01 Jan 2026", expiry:"31 Dec 2026", desc:"USD · All regions", status:"Active" },
  { id:"c2", title:"Attorney Rate Card — 2026",              effective:"15 Jan 2026", expiry:"31 Dec 2026", desc:"12 attorneys",     status:"Active" },
  { id:"c3", title:"Cost Code Rate Card — 2026",             effective:"15 Jan 2026", expiry:"31 Dec 2026", desc:"23 activity codes",status:"Active" },
  { id:"c4", title:"Engagement Letter — WBD 2025 (Expired)", effective:"01 Jan 2025", expiry:"31 Dec 2025", desc:"Archived",         status:"Expired" },
];
const ATTORNEYS: Attorney[] = [
  { name:"James W. Harrington", title:"Partner",    bar:"US, UK", spec:"Chem, Materials",   rate:680, prev:650, region:"US"      },
  { name:"Sarah K. Humphrey",   title:"Partner",    bar:"US, EU", spec:"PCT, International",rate:650, prev:620, region:"US / EU" },
  { name:"Kumar Perumal",       title:"Associate",  bar:"US, IN", spec:"Filing, FFLG",       rate:420, prev:380, region:"US"      },
  { name:"Sriram Santhanam",    title:"Associate",  bar:"US",     spec:"Patent Drafting",    rate:400, prev:380, region:"US"      },
  { name:"Michelle Chen",       title:"Paralegal",  bar:"—",      spec:"Docketing, PLG",     rate:200, prev:195, region:"US"      },
  { name:"David Okonkwo",       title:"Associate",  bar:"US, EU", spec:"Appeals, OPP",       rate:390, prev:390, region:"EU"      },
];
const FA_CODES: FaCode[] = [
  { code:"PATA",   desc:"Patent Application Drafting",   type:"Fixed Fee", rate:500, min:400, max:800, cur:"USD", region:"US / EU", prev:480 },
  { code:"FFLG",   desc:"First Filing",                  type:"Fixed Fee", rate:500, min:400, max:600, cur:"USD", region:"US",      prev:500 },
  { code:"NFLG",   desc:"National Phase Filing",          type:"Fixed Fee", rate:500, min:350, max:650, cur:"USD", region:"All",     prev:475 },
  { code:"PPH",    desc:"Patent Prosecution Highway",     type:"Fixed Fee", rate:500, min:400, max:600, cur:"USD", region:"US / JP", prev:500 },
  { code:"PLG",    desc:"Paralegal / Docketing",          type:"Hourly",    rate:200, min:150, max:250, cur:"USD", region:"All",     prev:195 },
  { code:"PCTFLG", desc:"PCT International Filing",       type:"Fixed Fee", rate:750, min:600, max:900, cur:"USD", region:"All",     prev:720 },
  { code:"OA1",    desc:"Office Action Response (1st)",   type:"Hourly",    rate:380, min:300, max:500, cur:"USD", region:"US",      prev:380 },
  { code:"OPP",    desc:"Opposition Proceedings",         type:"Hourly",    rate:450, min:380, max:600, cur:"USD", region:"EU",      prev:430 },
];

/* ─ shared atoms ─ */
const Pill: React.FC<{ label: string; color?: "green" | "red" | "gray" | "blue" | "violet" }> = ({ label, color = "gray" }) => {
  const s: Record<string, React.CSSProperties> = {
    green:  { background: "#FCFCFC",  color: "#15803D" },
    red:    { background: "#FEE2E2",  color: "#B91C1C" },
    blue:   { background: "#DBEAFE",  color: "#1D4ED8" },
    violet: { background: "#F3E8FF",  color: "#6B21A8" },
    gray:   { background: "#F3F4F6",  color: "#374151" },
  };
  return <span style={{ ...s[color], fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, whiteSpace: "nowrap", display: "inline-block" }}>{label}</span>;
};

const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost"; size?: "sm" }> = ({ variant = "ghost", size, children, style, ...props }) => {
  const vs: Record<string, React.CSSProperties> = {
    primary: { background: "linear-gradient(135deg,#3B2FD9,#7C4DFF)", color: "#fff", border: "none" },
    outline: { background: "transparent", color: "#3B2FD9", border: "1.5px solid #3B2FD9" },
    ghost:   { background: "transparent", color: "#6B7280", border: "1px solid #E4E7F0" },
  };
  return <button {...props} style={{ ...vs[variant], padding: size === "sm" ? "5px 11px" : "8px 16px", fontSize: size === "sm" ? 12 : 13, borderRadius: 8, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" as const, ...style }}>{children}</button>;
};

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E4E7F0", boxShadow: "0 1px 4px rgba(0,0,0,.05)", padding: 20, marginBottom: 16, ...style }}>{children}</div>
);

const Th: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <th style={{ padding: "9px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: ".07em", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const, background: "#F8F9FF", borderBottom: "1px solid #E4E7F0" }}>{children}</th>
);
const Td: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <td style={{ padding: "9px 12px", verticalAlign: "middle", whiteSpace: "nowrap" as const, borderBottom: "1px solid #E4E7F0", fontSize: 13, ...style }}>{children}</td>
);

/* ─ Main component ─ */
export const VendorRateCards: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeTab,    setActiveTab]    = useState<VendorTab>("el");
  const [expandedEL,   setExpandedEL]   = useState<Set<string>>(new Set());

  const titleColor = (delta: number) => delta > 0 ? "#DC2626" : delta < 0 ? "#16A34A" : "#6B7280";
  const deltaLabel = (curr: number, prev: number) => {
    const d = curr - prev;
    return d === 0 ? "No change" : `${d > 0 ? "+" : ""}$${d}`;
  };

  return (
    <div style={{ padding: 24, fontFamily: "'Segoe UI',system-ui,sans-serif", color: "#1A1D2E" }}>
      {/* Back */}
      {onBack && <div style={{ marginBottom: 14 }}><Btn onClick={onBack}>← Back to Vendors</Btn></div>}

      {/* Vendor header */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 16, borderBottom: "1px solid #E4E7F0", marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 10, background: "linear-gradient(135deg,#3B2FD9,#7C4DFF)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: 800, flexShrink: 0 }}>WBD</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Womble Bond Dickinson (US) LLP</div>
            <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>WOMB-US-2026-VEN-001 · United States · USD</div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Pill label="Active" color="green" />
              <Pill label="3 Contracts" color="blue" />
              <Pill label="EIN-47-3821045" color="gray" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn size="sm">Edit Vendor</Btn>
            <Btn variant="primary" size="sm">+ Add Contract</Btn>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {[
            { label: "Total Billed (2026)", value: "$487,203",   sub: "Jan – Jun 2026",    color: "#3B2FD9" },
            { label: "Active Contracts",     value: "3",          sub: "All current",        color: "#16A34A" },
            { label: "Attorneys on File",    value: "12",         sub: "4 partners",         color: "#1A1D2E" },
            { label: "Cost Index",           value: "82",         sub: "Below avg",          color: "#16A34A" },
            { label: "Avg CPL (Filing)",     value: "$2,100",     sub: "Per application",    color: "#1A1D2E" },
          ].map(k => (
            <div key={k.label} style={{ flex: 1, minWidth: 130, border: "1px solid #E4E7F0", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{k.sub}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #E4E7F0", marginBottom: 20 }}>
        {([
          { id: "el",       label: "Engagement Letters" },
          { id: "attorney", label: "Attorney Rate Card"  },
          { id: "fa",       label: "FA / Cost Code Rate Card" },
          { id: "invoices", label: "Invoice Activity"    },
        ] as { id: VendorTab; label: string }[]).map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ border: "none", background: "none", cursor: "pointer", padding: "10px 18px", fontSize: 13, fontWeight: activeTab === t.id ? 700 : 500, color: activeTab === t.id ? "#3B2FD9" : "#6B7280", borderBottom: `2px solid ${activeTab === t.id ? "#3B2FD9" : "transparent"}`, marginBottom: -2, fontFamily: "inherit" }}>{t.label}</button>
        ))}
      </div>

      {/* ── ENGAGEMENT LETTERS ── */}
      {activeTab === "el" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Active Contracts &amp; Engagement Letters</div>
            <Btn variant="primary" size="sm">+ Upload New</Btn>
          </div>
          {CONTRACTS.map(c => {
            const isOpen = expandedEL.has(c.id);
            return (
              <div key={c.id} onClick={() => setExpandedEL(prev => { const n = new Set(prev); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n; })}
                style={{ border: "1px solid #E4E7F0", borderRadius: 10, padding: 16, marginBottom: 10, background: "#fff", cursor: "pointer", opacity: c.status === "Expired" ? 0.6 : 1, transition: "box-shadow .15s", boxShadow: isOpen ? "0 2px 8px rgba(0,0,0,.1)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{c.title}</div>
                  <div style={{ display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
                    <Pill label={c.status} color={c.status === "Active" ? "green" : "red"} />
                    <Btn size="sm">Edit</Btn><Btn size="sm">Download</Btn>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#6B7280", display: "flex", gap: 16, marginTop: 6, flexWrap: "wrap" }}>
                  <span>Effective: {c.effective}</span><span>Expires: {c.expiry}</span><span>{c.desc}</span>
                </div>
                {isOpen && c.status === "Active" && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #E4E7F0" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#3B2FD9", textTransform: "uppercase", letterSpacing: ".08em", paddingBottom: 8, borderBottom: "2px solid #3B2FD9", marginBottom: 12 }}>Key Contract Terms</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {[
                        ["Billing Cycle","Monthly invoicing, net 45 days"],
                        ["Dispute Window","30 days from invoice receipt"],
                        ["Early Payment Discount","2% if settled within 10 business days"],
                        ["Rate Review","Annual review in November"],
                        ["Scope","Patent prosecution, filing, OA, renewals"],
                        ["Governing Law","State of Delaware, United States"],
                      ].map(([k, v]) => (
                        <div key={k} style={{ fontSize: 12, background: "#F8F9FF", borderRadius: 6, padding: "6px 10px", borderLeft: "3px solid #3B2FD9" }}>
                          <strong>{k}:</strong> {v}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── ATTORNEY RATE CARD ── */}
      {activeTab === "attorney" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Attorney Rate Card — WBD 2026</div>
            <div style={{ display: "flex", gap: 8 }}><Btn size="sm">Filter by Region</Btn><Btn variant="outline" size="sm">+ Add Attorney</Btn><Btn size="sm">Export</Btn></div>
          </div>
          <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #E4E7F0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr>
                <Th>Attorney Name</Th><Th>Title</Th><Th>Bar</Th><Th>Specialisation</Th>
                <Th>Rate (USD/hr)</Th><Th>Prev Rate</Th><Th>Change</Th><Th>Region</Th>
                <Th>Effective</Th><Th>Status</Th><Th>Actions</Th>
              </tr></thead>
              <tbody>
                {ATTORNEYS.map((a, i) => {
                  const delta = a.rate - a.prev;
                  return (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#FAFBFF" }}>
                      <Td><strong>{a.name}</strong></Td>
                      <Td><Pill label={a.title} color={a.title === "Partner" ? "violet" : a.title === "Associate" ? "blue" : "gray"} /></Td>
                      <Td style={{ color: "#6B7280" }}>{a.bar}</Td>
                      <Td>{a.spec}</Td>
                      <Td><strong style={{ color: "#3B2FD9" }}>${a.rate}</strong></Td>
                      <Td style={{ color: "#6B7280" }}>${a.prev}</Td>
                      <Td><span style={{ fontSize: 11, fontWeight: 700, color: titleColor(delta) }}>{deltaLabel(a.rate, a.prev)}</span></Td>
                      <Td>{a.region}</Td>
                      <Td style={{ color: "#6B7280", fontSize: 12 }}>01 Jan 2026</Td>
                      <Td><Pill label="Active" color="green" /></Td>
                      <Td><div style={{ display: "flex", gap: 4 }}><Btn size="sm">Edit</Btn><Btn size="sm">History</Btn></div></Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── FA / COST CODE RATE CARD ── */}
      {activeTab === "fa" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>FA &amp; Cost Code Rate Card — WBD 2026</div>
            <div style={{ display: "flex", gap: 8 }}>
              <select style={{ border: "1.5px solid #E4E7F0", borderRadius: 8, padding: "6px 10px", fontSize: 12, fontFamily: "inherit" }}>
                <option>All Rate Types</option><option>Fixed Fee</option><option>Hourly</option>
              </select>
              <Btn variant="outline" size="sm">+ Add Code</Btn><Btn size="sm">Export</Btn>
            </div>
          </div>
          <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #E4E7F0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr>
                <Th>Code</Th><Th>Activity Description</Th><Th>Rate Type</Th>
                <Th>Rate (USD)</Th><Th>Min</Th><Th>Max</Th><Th>Currency</Th>
                <Th>Region</Th><Th>Prev Rate</Th><Th>Change</Th><Th>Status</Th><Th>Actions</Th>
              </tr></thead>
              <tbody>
                {FA_CODES.map((f, i) => {
                  const delta = f.rate - f.prev;
                  return (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#FAFBFF" }}>
                      <Td><span style={{ background: "#EEF0FF", color: "#3B2FD9", borderRadius: 4, padding: "2px 7px", fontSize: 11, fontWeight: 700, fontFamily: "monospace" }}>{f.code}</span></Td>
                      <Td>{f.desc}</Td>
                      <Td><Pill label={f.type} color="gray" /></Td>
                      <Td><strong style={{ color: "#3B2FD9" }}>${f.rate}</strong></Td>
                      <Td style={{ color: "#6B7280" }}>${f.min}</Td>
                      <Td style={{ color: "#6B7280" }}>${f.max}</Td>
                      <Td>{f.cur}</Td>
                      <Td style={{ fontSize: 12 }}>{f.region}</Td>
                      <Td style={{ color: "#6B7280" }}>${f.prev}</Td>
                      <Td><span style={{ fontSize: 11, fontWeight: 700, color: titleColor(delta) }}>{deltaLabel(f.rate, f.prev)}</span></Td>
                      <Td><Pill label="Active" color="green" /></Td>
                      <Td><div style={{ display: "flex", gap: 4 }}><Btn size="sm">Edit</Btn><Btn size="sm">History</Btn></div></Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── INVOICE ACTIVITY ── */}
      {activeTab === "invoices" && (
        <div>
          <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
            {[
              { label: "Total Invoiced", value: "$139,203", sub: "Jan 2026",    color: "#3B2FD9" },
              { label: "Approved",       value: "$89,347",  sub: "23 items",    color: "#16A34A" },
              { label: "Held / Flagged", value: "$49,855",  sub: "9 items",     color: "#DC2626" },
              { label: "YTD Billed",     value: "$487,203", sub: "Jan–Jun 2026",color: "#1A1D2E" },
            ].map(k => (
              <div key={k.label} style={{ flex: 1, minWidth: 130, border: "1px solid #E4E7F0", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>{k.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: k.color }}>{k.value}</div>
                <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{k.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #E4E7F0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr><Th>Invoice No.</Th><Th>Period</Th><Th>Date</Th><Th>Amount</Th><Th>Currency</Th><Th>Items</Th><Th>Matched</Th><Th>Flagged</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
              <tbody>
                {[
                  { id:"INV-1021", period:"Jan 2026", date:"15 Mar 2026", amt:139203, cur:"USD", items:32, matched:23, flagged:9,  status:"Analyst Review" },
                  { id:"INV-0945", period:"Dec 2025", date:"12 Jan 2026", amt:98450,  cur:"USD", items:28, matched:28, flagged:0,  status:"Approved"       },
                  { id:"INV-0871", period:"Nov 2025", date:"10 Dec 2025", amt:112600, cur:"USD", items:34, matched:34, flagged:0,  status:"Paid"           },
                ].map((inv, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#FAFBFF" }}>
                    <Td><span style={{ fontFamily: "monospace", color: "#3B2FD9", fontWeight: 600 }}>{inv.id}</span></Td>
                    <Td>{inv.period}</Td><Td style={{ color: "#6B7280" }}>{inv.date}</Td>
                    <Td><strong>${inv.amt.toLocaleString()}</strong></Td><Td>{inv.cur}</Td>
                    <Td>{inv.items}</Td>
                    <Td style={{ color: "#16A34A", fontWeight: 600 }}>{inv.matched}</Td>
                    <Td style={{ color: inv.flagged > 0 ? "#DC2626" : "#6B7280", fontWeight: inv.flagged > 0 ? 700 : 400 }}>{inv.flagged > 0 ? `⚑ ${inv.flagged}` : "—"}</Td>
                    <Td><Pill label={inv.status} color={["Approved","Paid"].includes(inv.status) ? "green" : inv.status === "Analyst Review" ? "red" : "blue"} /></Td>
                    <Td><Btn variant={inv.status === "Analyst Review" ? "primary" : "ghost"} size="sm">{inv.status === "Analyst Review" ? "Review" : "View"}</Btn></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
