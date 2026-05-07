import React, { useState } from "react";
import type { PageProps, Currency } from "../types";
import { VENDORS } from "../data/mockData";
import { SectionHeader, Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select, FormGrid, FormField } from "../components/ui/FormField";
import { Pill } from "../components/ui/Pill";
import { useNavigate } from "react-router-dom";

const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value:"USD", label:"USD — US Dollar"      },
  { value:"EUR", label:"EUR — Euro"           },
  { value:"JPY", label:"JPY — Japanese Yen"   },
  { value:"GBP", label:"GBP — British Pound"  },
  { value:"CAD", label:"CAD — Canadian Dollar"},
];

const COUNTRY_OPTIONS = ["United States","Netherlands","China","Japan","South Korea","Saudi Arabia","Canada","Lebanon"].map(v=>({value:v,label:v}));

interface VendorCreateProps extends PageProps { vendorId?: string; }

export const VendorCreate: React.FC<VendorCreateProps> = ({ onNavigate, vendorId }) => {
  const existing = vendorId ? VENDORS.find(v => v.id === vendorId) : undefined;
  const isEdit   = Boolean(existing);

  const [logoUploaded, setLogoUploaded] = useState<boolean>(false);

  const navigate = useNavigate();

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Button variant="ghost" onClick={() => navigate("/vendors")}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to Vendors
        </Button>
      </div>

      <SectionHeader
        title={isEdit ? `Edit Vendor — ${existing?.name}` : "Create Vendor"}
        subtitle="Register a new law firm vendor with complete details, bank information, and contracts"
        actions={
          <div style={{ display:"flex", gap:8 }}>
            <Button variant="ghost">Save Draft</Button>
            <Button variant="primary">{isEdit ? "Save Changes" : "Create Vendor"}</Button>
          </div>
        }
      />

      {/* Basic Info */}
      <Card style={{ marginBottom: 16 }}>
        <SectionDivider title="Basic Information" icon="fa-user" />
        <div style={{ display:"flex", gap:20, marginBottom:16, alignItems:"flex-start" }}>
          {/* Logo upload */}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:"#6B7280", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Vendor Logo</label>
            <div
              onClick={() => setLogoUploaded(true)}
              style={{ width:80, height:80, borderRadius:12, border:`2px ${logoUploaded?"solid #16A34A":"dashed #E4E7F0"}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", background:logoUploaded?"#F8F9FF":"#F8F9FF", transition:"all 0.2s", gap:4 }}
            >
              {logoUploaded
                ? <svg width="24" height="24" viewBox="0 0 24 24" fill="#16A34A"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                : <><svg width="22" height="22" viewBox="0 0 24 24" fill="#6B7280"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg><span style={{ fontSize:10, color:"#6B7280", textAlign:"center" }}>Upload Logo</span></>
              }
            </div>
          </div>
          {/* Main fields */}
          <div style={{ flex:1 }}>
            <FormGrid cols={3} style={{ marginBottom:12 }}>
              <FormField label="Vendor Name *"><Input placeholder="e.g. Womble Bond Dickinson LLP" defaultValue={existing?.name} /></FormField>
              <FormField label="Email Address *"><Input type="email" placeholder="billing@lawfirm.com" defaultValue={existing?.email} /></FormField>
              <FormField label="Phone Number"><Input placeholder="+1 202 555 0100" defaultValue={existing?.phone} /></FormField>
            </FormGrid>
            <FormGrid cols={2}>
              <FormField label="Tax ID / EIN"><Input placeholder="EIN-XX-XXXXXXX" defaultValue={existing?.taxId} /></FormField>
              <FormField label="VAT / GST Number"><Input placeholder="VAT-XXXXXXXXX" defaultValue={existing?.vatGst} /></FormField>
            </FormGrid>
          </div>
        </div>
      </Card>

      {/* Address */}
      <Card style={{ marginBottom: 16 }}>
        <SectionDivider title="Address & Jurisdiction" icon="fa-location-dot" />
        <FormGrid cols={3} style={{ marginBottom:12 }}>
          <FormField label="Street Address"><Input placeholder="123 Law Street, Suite 400" defaultValue={existing?.address} /></FormField>
          <FormField label="City"><Input placeholder="Washington DC" defaultValue={existing?.city} /></FormField>
          <FormField label="State / Province"><Input placeholder="DC" defaultValue={existing?.state} /></FormField>
        </FormGrid>
        <FormGrid cols={3}>
          <FormField label="Country"><Select options={COUNTRY_OPTIONS} value={existing?.country ?? ""} onChange={() => {}} /></FormField>
          <FormField label="Postal Code"><Input placeholder="20001" defaultValue={existing?.postalCode} /></FormField>
          <FormField label="Default Billing Currency"><Select options={CURRENCY_OPTIONS} value={existing?.defaultCurrency ?? "USD"} onChange={() => {}} /></FormField>
        </FormGrid>
      </Card>

      {/* Primary Bank */}
      <Card style={{ marginBottom: 16 }}>
        <SectionDivider title="Primary Bank Information" icon="fa-building-columns" />
        <FormGrid cols={4} style={{ marginBottom:12 }}>
          <FormField label="Bank Name"><Input placeholder="JPMorgan Chase" defaultValue={existing?.primaryBank?.bankName} /></FormField>
          <FormField label="Account Name"><Input placeholder="Firm Operating Account" defaultValue={existing?.primaryBank?.accountName} /></FormField>
          <FormField label="Account Number"><Input placeholder="••••••••7621" defaultValue={existing?.primaryBank?.accountNumber} /></FormField>
          <FormField label="Routing / SWIFT / IBAN"><Input placeholder="CHASUS33 / IBAN US..." defaultValue={existing?.primaryBank?.swiftIban} /></FormField>
        </FormGrid>
        <FormGrid cols={3}>
          <FormField label="Bank Address"><Input placeholder="383 Madison Ave, New York" defaultValue={existing?.primaryBank?.bankAddress} /></FormField>
          <FormField label="Bank Country"><Select options={COUNTRY_OPTIONS} value={existing?.primaryBank?.bankCountry ?? ""} onChange={() => {}} /></FormField>
          <FormField label="Currency"><Select options={CURRENCY_OPTIONS} value={existing?.primaryBank?.currency ?? "USD"} onChange={() => {}} /></FormField>
        </FormGrid>
      </Card>

      {/* Intermediary Bank */}
      <Card style={{ marginBottom: 16 }}>
        <SectionDivider title="Intermediary Bank" icon="fa-money-bill-transfer" subtitle="Optional — for international wires" />
        <FormGrid cols={4}>
          <FormField label="Intermediary Bank Name"><Input placeholder="Citibank N.A." /></FormField>
          <FormField label="SWIFT / BIC Code"><Input placeholder="CITIUS33" /></FormField>
          <FormField label="ABA Routing"><Input placeholder="021000089" /></FormField>
          <FormField label="Correspondent Account"><Input placeholder="36838373" /></FormField>
        </FormGrid>
      </Card>

      {/* Engagement Letters & Contracts */}
      <Card>
        <SectionDivider title="Engagement Letters & Contracts" icon="fa-file-contract" />
        {(existing?.contracts ?? []).map(contract => (
          <div key={contract.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", border:"1px solid #E4E7F0", borderRadius:8, marginBottom:8, background:"#fff" }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600 }}>{contract.title}</div>
              <div style={{ fontSize:11, color:"#6B7280" }}>Effective: {contract.effective} · Expires: {contract.expiry} · {contract.description}</div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <Pill label={contract.status} color={contract.status === "Active" ? "green" : "gray"} />
              <Button size="sm" variant="ghost">View</Button>
              <Button size="sm" variant="ghost">Edit</Button>
            </div>
          </div>
        ))}
        <DropZone label="Upload New Contract / Engagement Letter" subLabel="PDF, DOCX, XLSX accepted" />
      </Card>
    </div>
  );
};

/* ── Local helpers ── */
const SectionDivider: React.FC<{ title: string; icon?: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div style={{ fontSize:12, fontWeight:700, color:"#3B2FD9", textTransform:"uppercase", letterSpacing:"0.08em", paddingBottom:8, borderBottom:"2px solid #3B2FD9", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
    {title}
    {subtitle && <span style={{ fontSize:11, color:"#6B7280", fontWeight:400, textTransform:"none" }}>({subtitle})</span>}
  </div>
);

const DropZone: React.FC<{ label: string; subLabel?: string }> = ({ label, subLabel }) => {
  const [uploaded, setUploaded] = useState(false);
  return (
    <div
      onClick={() => setUploaded(true)}
      style={{ border:`2px dashed ${uploaded?"#16A34A":"#3B2FD9"}`, borderRadius:10, padding:22, textAlign:"center", background:"#F8F9FF", cursor:"pointer", transition:"all 0.2s" }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill={uploaded?"#16A34A":"#3B2FD9"} style={{ display:"block", margin:"0 auto 6px" }}>
        {uploaded
          ? <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          : <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>}
      </svg>
      <div style={{ fontSize:13, fontWeight:600, color:uploaded?"#16A34A":"#3B2FD9" }}>{uploaded ? "File uploaded successfully" : label}</div>
      {subLabel && !uploaded && <div style={{ fontSize:11, color:"#6B7280", marginTop:3 }}>{subLabel}</div>}
    </div>
  );
};
