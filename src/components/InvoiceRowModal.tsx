import React, { useState, useRef, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface InvoiceEditRecord {
  id:                 string;
  lawFirmRef:         string;
  sabicCaseRef:       string;
  sabicAttorney:      string[];
  sabicBusinessUnit:  string[];
  userType:           string[];
  lawFirmPersonnel:   string[];
  timeHours:          number;
  invoiceNumber:      string;
  workDate:           string;
  invoiceDate:        string;
  activityCode:       string[];
  description:        string;
  chargeType:         string[];
  serviceFees:        number;
  officialFees:       number;
  currency:           string;
  lawFirmName:        string[];
}

interface InvoiceEditModalProps {
  open:       boolean;
  mode: string;
  record?:    Partial<InvoiceEditRecord>;
  onClose:    () => void;
  onSave:     (data: InvoiceEditRecord) => void;
}

// ── Option lists ──────────────────────────────────────────────────────────────

const ATTORNEY_OPTIONS   = ["Lijun Zhou","Priya Sharma","James Harrington","Sarah Humphrey","Kumar Perumal","David Okonkwo"];
const BU_OPTIONS         = ["SBU Polymers","SBU Chemicals","SBU Performance","SBU Agri-Nutrients","Corporate R&D","Corporate"];
const USER_TYPE_OPTIONS  = ["Attorney","Paralegal"];
const LF_PERSON_OPTIONS  = ["N.Y.Kim","J.Park","S.Lee","M.Chen","T.Watanabe"];
const ACTIVITY_OPTIONS   = ["OA1E — Office Action Response","PATA — Patent Application Drafting","FFLG — First Filing","NFLG — National Phase Filing","PPH — Patent Prosecution Highway","PLG — Paralegal / Docketing","PCTFLG — PCT Filing"];
const CHARGE_TYPE_OPTIONS= ["COOF — Official Fees","COSF — Service Fees","COTF — Translation Fees","CODF — Disbursements"];
const CURRENCY_OPTIONS   = ["USD","EUR","JPY","GBP","CAD","KRW","SAR","CNY","AED"];
const LF_NAME_OPTIONS    = ["S.Y.CHA PATENT OFFICE","Womble Bond Dickinson","AOMB","CCPIT","JAH","Allegro IP Law","Saba & Co.","Quicker Law LLC","EP&C","Lavery","Conley Rose"];

// ── Default / empty record ────────────────────────────────────────────────────

const EMPTY_RECORD: InvoiceEditRecord = {
  id:                 "",
  lawFirmRef:         "",
  sabicCaseRef:       "",
  sabicAttorney:      [],
  sabicBusinessUnit:  [],
  userType:           [],
  lawFirmPersonnel:   [],
  timeHours:          0,
  invoiceNumber:      "",
  workDate:           "",
  invoiceDate:        "",
  activityCode:       [],
  description:        "",
  chargeType:         [],
  serviceFees:        0,
  officialFees:       0,
  currency:           "USD",
  lawFirmName:        [],
};

const DEMO_RECORD: Partial<InvoiceEditRecord> = {
  lawFirmRef:         "SYC2022-0603PC",
  sabicCaseRef:       "18PLAS0261-KR-PCT",
  sabicAttorney:      ["Lijun Zhou"],
  sabicBusinessUnit:  ["SBU Polymers"],
  userType:           ["Attorney"],
  lawFirmPersonnel:   ["N.Y.Kim"],
  timeHours:          0,
  invoiceNumber:      "260417030-1YKC",
  workDate:           "2026-04-13",
  invoiceDate:        "2026-04-17",
  activityCode:       ["OA1E — Office Action Response"],
  description:        "The fees involved in reporting the preliminary rejection, providing strategic advice on claim amendments to overcome the examiner's objections.",
  chargeType:         ["COOF — Official Fees"],
  serviceFees:        0,
  officialFees:       3.6,
  currency:           "USD",
  lawFirmName:        ["S.Y.CHA PATENT OFFICE"],
};

// ── CSS-in-JS tokens ──────────────────────────────────────────────────────────

const C = {
  p:        "#3B2FD9",
  border:   "#E0E0E0",
  txt:      "#1A1D2E",
  muted:    "#6B7280",
  light:    "#F8F9FF",
  tagBg:    "#F0EEFF",
  tagBd:    "#C7D2FE",
  tagTxt:   "#3B2FD9",
  err:      "#DC2626",
};

// ── TagSelect component ───────────────────────────────────────────────────────

interface TagSelectProps {
  label:      string;
  required?:  boolean;
  value:      string[];
  onChange:   (v: string[]) => void;
  options:    string[];
  placeholder?: string;
}

const TagSelect: React.FC<TagSelectProps> = ({ label, required, value, onChange, options, placeholder = "Select option" }) => {
  const [open,   setOpen]   = useState(false);
  const [query,  setQuery]  = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef  = useRef<HTMLDivElement>(null);

  const filtered = options.filter(o =>
    o.toLowerCase().includes(query.toLowerCase()) && !value.includes(o)
  );

  const addTag = (opt: string) => {
    onChange([...value, opt]);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const removeTag = (tag: string) => onChange(value.filter(v => v !== tag));

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <label style={LS.label}>{label}{required && <span style={{ color: C.err, marginLeft: 1 }}>*</span>}</label>
      <div
        ref={wrapRef}
        style={{ border: `1px solid ${open ? C.p : C.border}`, borderRadius: 4, background: "#fff", minHeight: 36, padding: "4px 28px 4px 6px", cursor: "text", position: "relative", boxShadow: open ? `0 0 0 2px rgba(59,47,217,.1)` : "none", transition: "border .15s, box-shadow .15s" }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Tags row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
          {value.map(tag => (
            <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: C.tagBg, border: `1px solid ${C.tagBd}`, color: C.tagTxt, borderRadius: 3, padding: "2px 6px", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap" }}>
              {tag}
              <span onClick={e => { e.stopPropagation(); removeTag(tag); }} style={{ cursor: "pointer", opacity: 0.7, fontSize: 13, lineHeight: 1, fontWeight: 400 }}>×</span>
            </span>
          ))}
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={value.length === 0 ? placeholder : ""}
            style={{ border: "none", outline: "none", fontSize: 13, fontFamily: "inherit", color: C.txt, flex: 1, minWidth: 80, background: "transparent", padding: "2px 0" }}
          />
        </div>

        {/* Dropdown chevron */}
        <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: C.muted }}>
          <svg width="12" height="7" viewBox="0 0 12 7" fill="none"><path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>

        {/* Dropdown list */}
        {open && filtered.length > 0 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: "calc(100% + 3px)", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 4, zIndex: 300, maxHeight: 180, overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,.1)" }}>
            {filtered.map(opt => (
              <div key={opt} onMouseDown={e => { e.preventDefault(); addTag(opt); }}
                style={{ padding: "8px 12px", fontSize: 13, cursor: "pointer", color: C.txt, transition: "background .1s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#F0EEFF")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
        {open && filtered.length === 0 && query && (
          <div style={{ position: "absolute", left: 0, right: 0, top: "calc(100% + 3px)", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 4, zIndex: 300, padding: "10px 12px", fontSize: 13, color: C.muted, boxShadow: "0 4px 12px rgba(0,0,0,.1)" }}>
            No options found
          </div>
        )}
      </div>
    </div>
  );
};

// ── Text / Number / Date input ────────────────────────────────────────────────

interface FieldProps {
  label:      string;
  required?:  boolean;
  children:   React.ReactNode;
  colSpan?:   boolean;
}
const Field: React.FC<FieldProps> = ({ label, required, children, colSpan }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 0, ...(colSpan ? { gridColumn: "1/-1" } : {}) }}>
    <label style={LS.label}>{label}{required && <span style={{ color: C.err, marginLeft: 1 }}>*</span>}</label>
    {children}
  </div>
);

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    style={{
      border: `1px solid ${C.border}`,
      borderRadius: 4,
      padding: "8px 10px",
      fontSize: 13,
      color: C.txt,
      background: "#fff",
      outline: "none",
      fontFamily: "inherit",
      width: "100%",
      height: 36,              // ✅ match TagSelect
      boxSizing: "border-box", // ✅ critical fix
      transition: "border .15s, box-shadow .15s",
      ...props.style
    }}
    onFocus={e => { e.target.style.borderColor = C.p; e.target.style.boxShadow = "0 0 0 2px rgba(59,47,217,.1)"; }}
    onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
  />
);

const DateInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
 <div style={{ position: "relative", width: "100%" }}> {/* ✅ ADD */}
    <TextInput {...props} type="date" style={{ paddingRight: 34 }} />
    <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: C.muted, pointerEvents: "none" }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
    </span>
  </div>
);

const NativeSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { options: string[] }> = ({ options, style, ...p }) => (
  <div style={{ position: "relative" }}>
    <select {...p} style={{ 
    border: `1px solid ${C.border}`,     
    borderRadius: 4,
    padding: "8px 28px 8px 10px",
    fontSize: 13,
    color: C.txt,
    background: "#fff",
    outline: "none",
    fontFamily: "inherit",
    width: "100%",
    height: 36,              // ✅ match
    boxSizing: "border-box", // ✅ match
    ...style }}
      onFocus={e => { e.target.style.borderColor = C.p; }}
      onBlur={e  => { e.target.style.borderColor = C.border; }}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: C.muted }}>
      <svg width="12" height="7" viewBox="0 0 12 7" fill="none"><path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
  </div>
);

// ── Shared label style ────────────────────────────────────────────────────────

const LS = {
  label: { fontSize: 12, color: "#1A1D2E", marginBottom: 5, fontWeight: 400, display: "block" } as React.CSSProperties,
};

const sectionStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  border: "1px solid #E0E0E0",
  borderRadius: 6,
  background: "#fff",
};

const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div style={{ marginBottom: 12 }}>
    <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
      {label}
    </label>
    {children}
  </div>
);

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    style={{
      width: "100%",
      border: `1px solid ${C.border}`,
      borderRadius: 4,
      padding: "8px 10px",      // ✅ match TextInput
      fontSize: 13,
      fontFamily: "inherit",
      outline: "none",
      resize: "vertical",
      boxSizing: "border-box",  // ✅ critical
      minHeight: 36,            // ✅ align with inputs initially
      lineHeight: "18px",       // ✅ keeps spacing clean
      ...props.style,
    }}
    onFocus={e => {
      e.currentTarget.style.borderColor = C.p;
      e.currentTarget.style.boxShadow = "0 0 0 2px rgba(59,47,217,.1)";
    }}
    onBlur={e => {
      e.currentTarget.style.borderColor = C.border;
      e.currentTarget.style.boxShadow = "none";
    }}
  />
);

// ── Validation ────────────────────────────────────────────────────────────────

interface Errors { lawFirmRef?: string; sabicCaseRef?: string; invoiceDate?: string; lawFirmName?: string; }

const validate = (data: InvoiceEditRecord): Errors => {
  const e: Errors = {};
  if (!data.lawFirmRef.trim())    e.lawFirmRef   = "Required";
  if (!data.sabicCaseRef.trim())  e.sabicCaseRef = "Required";
  if (!data.invoiceDate)          e.invoiceDate  = "Required";
  if (!data.lawFirmName.length)   e.lawFirmName  = "Required";
  return e;
};

// ── Main Modal component ──────────────────────────────────────────────────────

export const InvoiceRowModal: React.FC<InvoiceEditModalProps> = ({ open, mode, record, onClose, onSave }) => {
  const [form,   setForm]   = useState<InvoiceEditRecord>({ ...EMPTY_RECORD, ...record });
  const [errors, setErrors] = useState<Errors>({});
  const [forcePass, setForcePass] = useState(false);
const [forceReason, setForceReason] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  // Re-sync when record prop changes
  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY_RECORD, ...record });
      setErrors({});
      // Scroll body to top on open
      setTimeout(() => bodyRef.current?.scrollTo({ top: 0 }), 0);
    }
  }, [open, record]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const set = useCallback(<K extends keyof InvoiceEditRecord>(key: K, val: InvoiceEditRecord[K]) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key as keyof Errors]) setErrors(e => ({ ...e, [key]: undefined }));
  }, [errors]);

  const handleSave = () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(form);
  };

  if (!open) return null;

  const errStyle: React.CSSProperties = { fontSize: 11, color: C.err, marginTop: 3 };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(30,27,75,.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      >
        {/* Modal */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="invpro-edit-title"
          onClick={e => e.stopPropagation()}
          style={{ background: "#fff", borderRadius: 6, width: "100%", maxWidth: 820, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,.28)", overflow: "hidden" }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            <span id="invpro-edit-title" style={{ fontSize: 16, fontWeight: 600, color: C.txt }}>Edit</span>
            <button
              onClick={onClose}
              aria-label="Close modal"
              style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, color: C.muted, fontSize: 20, lineHeight: 1, transition: "background .15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#F0F0F0")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              ×
            </button>
          </div>

          {/* Scrollable body */}
          <div
  ref={bodyRef}
  style={{
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",   // ✅ IMPORTANT
    padding: "20px 22px"
  }}
>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" }}>

              {/* Law Firm Reference Number */}
              <Field label="Law Firm Reference Number" required>
                <TextInput value={form.lawFirmRef} onChange={e => set("lawFirmRef", e.target.value)} placeholder="e.g. SYC2022-0603PC"
                  style={errors.lawFirmRef ? { borderColor: C.err } : {}} />
                {errors.lawFirmRef && <span style={errStyle}>{errors.lawFirmRef}</span>}
              </Field>

              {/* SABIC Case Reference Number */}
              <Field label="SABIC Case Reference Number" required>
                <TextInput value={form.sabicCaseRef} onChange={e => set("sabicCaseRef", e.target.value)} placeholder="e.g. 18PLAS0261-KR-PCT"
                  style={errors.sabicCaseRef ? { borderColor: C.err } : {}} />
                {errors.sabicCaseRef && <span style={errStyle}>{errors.sabicCaseRef}</span>}
              </Field>

              {/* SABIC Attorney */}
              <TagSelect label="SABIC Attorney" value={form.sabicAttorney} onChange={v => set("sabicAttorney", v)} options={ATTORNEY_OPTIONS} />

              {/* SABIC Business Unit */}
              <TagSelect label="SABIC Business Unit" value={form.sabicBusinessUnit} onChange={v => set("sabicBusinessUnit", v)} options={BU_OPTIONS} />

              {/* User Type */}
              <TagSelect label="User Type (Attorney/Paralegal)" value={form.userType} onChange={v => set("userType", v)} options={USER_TYPE_OPTIONS} placeholder="Type or select" />

              {/* Law Firm Personnel */}
              <TagSelect label="Law Firm Personnel/User" value={form.lawFirmPersonnel} onChange={v => set("lawFirmPersonnel", v)} options={LF_PERSON_OPTIONS} placeholder="Type or select" />

              {/* Time (hours) */}
              <Field label="Time (hours)">
                <TextInput type="number" value={form.timeHours} min={0} step={0.25} onChange={e => set("timeHours", parseFloat(e.target.value) || 0)} />
              </Field>

              {/* Invoice Number */}
              <Field label="Invoice Number">
                <TextInput value={form.invoiceNumber} onChange={e => set("invoiceNumber", e.target.value)} placeholder="e.g. 260417030-1YKC" />
              </Field>

              {/* Work Date */}
              <Field label="Work Date" required>
                <DateInput value={form.workDate} onChange={e => set("workDate", e.target.value)} />
              </Field>

              {/* Invoice Date */}
              <Field label="Invoice Date" required>
                <DateInput value={form.invoiceDate} onChange={e => set("invoiceDate", e.target.value)}
                  style={errors.invoiceDate ? { borderColor: C.err } : {}} />
                {errors.invoiceDate && <span style={errStyle}>{errors.invoiceDate}</span>}
              </Field>

              {/* Activity (Cost Code) */}
              <TagSelect label="Activity (SABIC Cost Code)" value={form.activityCode} onChange={v => set("activityCode", v)} options={ACTIVITY_OPTIONS} />

              {/* Description */}
              <Field label="Description / Narrative">
                <textarea
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                  rows={3}
                  style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: "8px 10px", fontSize: 13, color: C.txt, background: "#fff", outline: "none", fontFamily: "inherit", resize: "vertical", minHeight: 70, transition: "border .15s" }}
                  onFocus={e => { e.target.style.borderColor = C.p; e.target.style.boxShadow = "0 0 0 2px rgba(59,47,217,.1)"; }}
                  onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
                />
              </Field>

              {/* Charge Type */}
              <TagSelect label="Charge type (SABIC Cost code Type)" value={form.chargeType} onChange={v => set("chargeType", v)} options={CHARGE_TYPE_OPTIONS} />

              {/* Service Fees */}
              <Field label="Service Fees">
                <TextInput type="number" value={form.serviceFees} min={0} step={0.01} onChange={e => set("serviceFees", parseFloat(e.target.value) || 0)} />
              </Field>

              {/* Official Fees */}
              <Field label="Official Fees">
                <TextInput type="number" value={form.officialFees} min={0} step={0.01} onChange={e => set("officialFees", parseFloat(e.target.value) || 0)} />
              </Field>

              {/* Currency */}
              <Field label="Currency">
                <NativeSelect value={form.currency} onChange={e => set("currency", e.target.value)} options={CURRENCY_OPTIONS} />
              </Field>

              {/* Law Firm Name — full width */}
              <div style={{ gridColumn: "1/-1" }}>
                <TagSelect label="Law Firm Name" required value={form.lawFirmName} onChange={v => { set("lawFirmName", v); if (errors.lawFirmName) setErrors(e => ({ ...e, lawFirmName: undefined })); }} options={LF_NAME_OPTIONS} />
                {errors.lawFirmName && <span style={errStyle}>{errors.lawFirmName}</span>}
              </div>
               {/* Comment Field */}
<div style={{ gridColumn: "1/-1" }}>
  <FormField label="Comment *">
    <TextArea rows={4} placeholder="Enter your comment or general note..." />
  </FormField>
</div>

{/* Force Pass Section */}
{mode === "edit" && (
  <div style={{ gridColumn: "1/-1" }}>
    <div style={sectionStyle}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        <input
          type="checkbox"
          checked={forcePass}
          onChange={() => setForcePass(!forcePass)}
        />
        Force Pass
      </label>

      {forcePass && (
        <div style={{ marginTop: 16 }}>
          <FormField label="Reason / Justification">
            <TextArea
              rows={4}
              value={forceReason}
              onChange={(e: any) => setForceReason(e.target.value)}
              placeholder="Provide reason for override"
            />
          </FormField>
        </div>
      )}
    </div>
  </div>
)}
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: "12px 22px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end", flexShrink: 0, background: "#fff" }}>
            <button
              onClick={handleSave}
              style={{ background: C.p, color: "#fff", border: "none", borderRadius: 4, padding: "9px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "opacity .15s" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = ".88")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Demo wrapper (shows modal open by default with prefilled data) ─────────────

export default function InvoiceEditModalDemo() {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", background: "#E8EAF0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
      {/* Simulated background page */}
      <div style={{ color: "#9CA3AF" }}>Analytics Dashboard (background)</div>

      <button
        onClick={() => setOpen(true)}
        style={{ position: "fixed", bottom: 24, right: 24, background: C.p, color: "#fff", border: "none", borderRadius: 6, padding: "10px 18px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}
      >
        Open Edit Modal
      </button>

      <InvoiceEditModal
        open={open}
        record={DEMO_RECORD}
        onClose={() => setOpen(false)}
        onSave={data => {
          console.log("Saved:", data);
          setOpen(false);
        }}
      />
    </div>
  );
}
