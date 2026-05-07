import React, { useState } from "react";
import type { PageProps, OrgType } from "../types";
import { SectionHeader, Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select, FormGrid, FormField } from "../components/ui/FormField";
import { useNavigate } from "react-router-dom";

interface StepDotProps { num: number; done: boolean; active: boolean; }
const StepDot: React.FC<StepDotProps> = ({ num, done, active }) => (
  <div style={{ width:32, height:32, borderRadius:"50%", background:done?"#16A34A":active?"#3B2FD9":"#6B7280", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, flexShrink:0, marginTop:2 }}>
    {done ? <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> : num}
  </div>
);

export const Onboarding: React.FC<PageProps> = ({ onNavigate }) => {
  const [orgType,   setOrgType]   = useState<OrgType | "">("");
  const [step,      setStep]      = useState<number>(2); // current active step

  const navigate = useNavigate();

  const progress = Math.round((step - 1) / 4 * 100);

  const orgTypes: { type: OrgType; icon: JSX.Element; desc: string }[] = [
    { type:"Corporate", icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="#3B2FD9"><path d="M20 7h-7V3H3v18h18V7zm-9 11H5v-2h6v2zm0-4H5v-2h6v2zm0-4H5V8h6v2zm8 8h-6v-2h6v2zm0-4h-6v-2h6v2z"/></svg>, desc:"Large IP team with multiple law firms" },
    { type:"Law Firm",  icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="#A855F7"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>, desc:"External law firm managing client billing" },
    { type:"SME",       icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="#16A34A"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>, desc:"Small to medium enterprise" },
  ];

  return (
    <div style={{ padding: 24 }}>
      <SectionHeader
        title="Client Onboarding"
        subtitle="Set up a new organisation on the InVoPro platform"
        actions={<Button variant="primary">Start Onboarding</Button>}
      />

      {/* Progress bar */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#6B7280", marginBottom:6 }}>
          <span>Onboarding Progress</span>
          <span style={{ fontWeight:600, color:"#3B2FD9" }}>{progress}% complete</span>
        </div>
        <div style={{ height:6, background:"#E4E7F0", borderRadius:4, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#3B2FD9,#7C4DFF)", borderRadius:4, transition:"width 0.4s" }} />
        </div>
      </div>

      {/* Step 1 — Org type */}
      <div style={{ display:"flex", gap:16, marginBottom:24 }}>
        <StepDot num={1} done={Boolean(orgType)} active={!orgType} />
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>Organisation Type</div>
          <div style={{ fontSize:12, color:"#6B7280", marginBottom:12 }}>Select the organisation type to configure the platform appropriately</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, maxWidth:600 }}>
            {orgTypes.map(o => (
              <div
                key={o.type}
                onClick={() => { setOrgType(o.type); if (step < 2) setStep(2); }}
                style={{ border:`2px solid ${orgType===o.type?"#3B2FD9":"#E4E7F0"}`, background:orgType===o.type?"#F0EEFF":"#fff", borderRadius:12, padding:16, cursor:"pointer", textAlign:"center", transition:"all 0.2s" }}
              >
                <div style={{ width:48, height:48, borderRadius:10, background:orgType===o.type?"#EEF0FF":"#F8F9FF", margin:"0 auto 8px", display:"flex", alignItems:"center", justifyContent:"center" }}>{o.icon}</div>
                <div style={{ fontSize:13, fontWeight:700 }}>{o.type}</div>
                <div style={{ fontSize:11, color:"#6B7280", marginTop:3 }}>{o.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step 2 — Org profile */}
      <div style={{ display:"flex", gap:16, marginBottom:24 }}>
        <StepDot num={2} done={step > 2} active={step === 2} />
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>Organisation Profile</div>
          <div style={{ fontSize:12, color:"#6B7280", marginBottom:12 }}>Enter the organisation details for the platform setup</div>
          <Card style={{ maxWidth:700, marginBottom:0 }}>
            <FormGrid cols={2} style={{ marginBottom:12 }}>
              <FormField label="Organisation Name *"><Input placeholder="Company name" defaultValue="SABIC Global Technologies" /></FormField>
              <FormField label="Industry"><Select value="Chemicals & Materials" onChange={() => {}} options={["Chemicals & Materials","Technology","Healthcare","Energy"].map(v=>({value:v,label:v}))} /></FormField>
            </FormGrid>
            <FormGrid cols={3}>
              <FormField label="Country *"><Select value="Saudi Arabia" onChange={() => {}} options={["Saudi Arabia","United States","Netherlands","Japan"].map(v=>({value:v,label:v}))} /></FormField>
              <FormField label="Primary Currency"><Select value="USD" onChange={() => {}} options={["USD","EUR","SAR"].map(v=>({value:v,label:v}))} /></FormField>
              <FormField label="Time Zone"><Select value="Asia/Riyadh (UTC+3)" onChange={() => {}} options={["Asia/Riyadh (UTC+3)","US/Eastern","Europe/Amsterdam"].map(v=>({value:v,label:v}))} /></FormField>
            </FormGrid>
            <div style={{ marginTop:12 }}>
              <Button variant="primary" size="sm" onClick={() => setStep(3)}>Continue to Step 3 →</Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Step 3 — Invite admins */}
      <div style={{ display:"flex", gap:16, marginBottom:24 }}>
        <StepDot num={3} done={step > 3} active={step === 3} />
        <div style={{ flex:1, opacity: step >= 3 ? 1 : 0.5 }}>
          <div style={{ fontSize:15, fontWeight:700, marginBottom:6, color: step >= 3 ? "#1A1D2E" : "#6B7280" }}>Invite Admin Users</div>
          <div style={{ fontSize:12, color:"#6B7280", marginBottom:12 }}>Add the first administrators who will manage the platform</div>
          {step >= 3 && (
            <Card style={{ maxWidth:600, marginBottom:0 }}>
              <FormGrid cols={2} style={{ marginBottom:12 }}>
                <FormField label="Full Name"><Input placeholder="Admin full name" /></FormField>
                <FormField label="Email Address"><Input type="email" placeholder="admin@company.com" /></FormField>
              </FormGrid>
              <FormGrid cols={2} style={{ marginBottom:12 }}>
                <FormField label="Role"><Select value="" onChange={() => {}} options={["Admin","Senior Analyst","Analyst"].map(v=>({value:v,label:v}))} /></FormField>
                <FormField label="Department"><Input placeholder="IP Legal Team" /></FormField>
              </FormGrid>
              <div style={{ display:"flex", gap:8 }}>
                <Button variant="primary" size="sm"><svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>Send Invite</Button>
                <Button variant="ghost" size="sm" onClick={() => setStep(4)}>Skip for now →</Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Step 4 — Configure vendors */}
      <div style={{ display:"flex", gap:16, marginBottom:24 }}>
        <StepDot num={4} done={false} active={step === 4} />
        <div style={{ flex:1, opacity: step >= 4 ? 1 : 0.5 }}>
          <div style={{ fontSize:15, fontWeight:700, marginBottom:6, color: step >= 4 ? "#1A1D2E" : "#6B7280" }}>Configure Vendors</div>
          <div style={{ fontSize:12, color:"#6B7280", marginBottom:12 }}>Add your law firm vendors (can be done later)</div>
          {step >= 4 && (
            <Button variant="ghost" onClick={() => navigate("/vendor-create")}>+ Add First Vendor</Button>
          )}
        </div>
      </div>

      {/* Step 5 — Upload reference data */}
      <div style={{ display:"flex", gap:16, marginBottom:28 }}>
        <StepDot num={5} done={false} active={false} />
        <div style={{ flex:1, opacity: 0.5 }}>
          <div style={{ fontSize:15, fontWeight:700, marginBottom:6, color:"#6B7280" }}>Upload Reference Data</div>
          <div style={{ fontSize:12, color:"#6B7280" }}>Upload engagement letters, rate cards, and system activity data</div>
        </div>
      </div>

      {/* Completion banner */}
      <div style={{ padding:20, background:"#F8F9FF", border:"1px solid #E4E7F0", borderRadius:12, display:"flex", alignItems:"center", gap:14 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#3B2FD9"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:"#1A1D2E" }}>Organisation SABIC Global Technologies is being configured</div>
          <div style={{ fontSize:12, color:"#6B7280", marginTop:3 }}>Steps 1–2 complete · Steps 3–5 pending · Estimated setup time: 15 minutes</div>
        </div>
        <Button variant="success" size="sm" style={{ marginLeft:"auto" }}>Finish Setup</Button>
      </div>
    </div>
  );
};
