import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


type Tab      = "role" | "user";
type RoleLevel= "Admin" | "Manager" | "Analyst" | "Viewer";
type InviteMethod = "Email" | "SMS + Email" | "Manual";

const PERMISSIONS = [
  "Invoice Upload","Invoice Review","Force Validation Pass","Approve Invoices",
  "Vendor Management","User Management","View Dashboards","Export Reports",
  "AI Assistant","Onboarding","Audit Trail View","Rate Card Access",
  "Delete Records","Edit Line Items","System Configuration",
];
const ROLE_DEFAULTS: Record<string, string[]> = {
  Admin:          PERMISSIONS,
  "Senior Analyst":["Invoice Upload","Invoice Review","Force Validation Pass","Approve Invoices","View Dashboards","Export Reports","AI Assistant","Audit Trail View","Rate Card Access","Edit Line Items"],
  Analyst:        ["Invoice Upload","Invoice Review","View Dashboards","Export Reports","AI Assistant","Audit Trail View","Edit Line Items"],
  Viewer:         ["View Dashboards"],
};
const DEPARTMENTS = ["IP Legal","IP Docketing","IP Finance","IP Compliance","Finance","Technology"];
const LOCATIONS    = ["Riyadh, SA","Amsterdam, NL","Houston, US","Bangalore, IN"];
const AVATAR_COLORS= ["linear-gradient(135deg,#3B2FD9,#A855F7)","#0284C7","#16A34A","#D97706","#DC2626","#7C4DFF"];

const Toggle: React.FC<{ on: boolean; onChange: (v: boolean) => void }> = ({ on, onChange }) => (
  <div onClick={() => onChange(!on)} style={{ width: 38, height: 20, borderRadius: 10, background: on ? "#3B2FD9" : "#D1D5DB", position: "relative", cursor: "pointer", transition: "background .2s", flexShrink: 0 }}>
    <div style={{ position: "absolute", top: 2, left: on ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
  </div>
);

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode; span?: 2 }> = ({ label, required, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {label}{required && <span style={{ color: "#DC2626", marginLeft: 2 }}>*</span>}
    </label>
    {children}
  </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} style={{ width: "100%", border: "1.5px solid #E4E7F0", borderRadius: 8, padding: "9px 12px", fontSize: 13, fontFamily: "inherit", color: "#1A1D2E", outline: "none", background: "#fff", transition: "border .15s", ...props.style }}
    onFocus={e => (e.target.style.borderColor = "#3B2FD9")} onBlur={e => (e.target.style.borderColor = "#E4E7F0")} />
);

const Sel: React.FC<{ value: string; onChange: (v: string) => void; options: string[] }> = ({ value, onChange, options }) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", border: "1.5px solid #E4E7F0", borderRadius: 8, padding: "9px 12px", fontSize: 13, fontFamily: "inherit", color: "#1A1D2E", background: "#fff", outline: "none" }}>
    {options.map(o => <option key={o}>{o}</option>)}
  </select>
);

const SectionDivider: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: "#3B2FD9", textTransform: "uppercase", letterSpacing: "0.08em", paddingBottom: 8, borderBottom: "2px solid #3B2FD9", marginBottom: 14, marginTop: 4 }}>{title}</div>
);

const FormFooter: React.FC<{ onSave: () => void; saveLabel: string }> = ({ onSave, saveLabel }) => (
  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 16, borderTop: "1px solid #E4E7F0", marginTop: 8 }}>
    <button style={{ padding: "8px 16px", border: "1px solid #E4E7F0", borderRadius: 8, background: "transparent", color: "#6B7280", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit" }}>Discard</button>
    <button style={{ padding: "8px 16px", border: "1.5px solid #3B2FD9", borderRadius: 8, background: "transparent", color: "#3B2FD9", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit" }}>Save Draft</button>
    <button onClick={onSave} style={{ padding: "8px 16px", background: "linear-gradient(135deg,#3B2FD9,#7C4DFF)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
      {saveLabel}
    </button>
  </div>
);

export const AddRole: React.FC<{ onBack?: () => void }> = ({ onBack }) => {  const [roleName,  setRoleName]  = useState("");
  const [roleLevel, setRoleLevel] = useState<RoleLevel>("Manager");
  const [description, setDescription] = useState("Review and approve invoices, manage rate cards");
  const [perms, setPerms] = useState<Record<string, boolean>>(
    Object.fromEntries(PERMISSIONS.map(p => [p, ROLE_DEFAULTS["Senior Analyst"].includes(p)]))
  );

  const navigate = useNavigate();


  

  const toggle = (p: string) => setPerms(prev => ({ ...prev, [p]: !prev[p] }));
  const enabledCount = Object.values(perms).filter(Boolean).length;

  

  return (
    <div style={{ padding: 24 }}>
      <button
  onClick={() => navigate(-1)}
  style={{
    marginBottom: 10,
    color: "#3B2FD9",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontWeight: 600
  }}
>
  ← Back to List
</button>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Create Role</h2>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E4E7F0", padding: 20, marginBottom: 16 }}>
        <SectionDivider title="Role Details" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <Field label="Role Name" required>
            <Input value={roleName} onChange={e => setRoleName(e.target.value)} placeholder="e.g. Senior Analyst" />
          </Field>
          <Field label="Role Level">
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              {(["Admin","Manager","Analyst","Viewer"] as RoleLevel[]).map(l => (
                <button key={l} onClick={() => setRoleLevel(l)} style={{ flex: 1, padding: "8px", border: `1.5px solid ${roleLevel === l ? "#3B2FD9" : "#E4E7F0"}`, borderRadius: 8, cursor: "pointer", textAlign: "center", fontSize: 12, fontWeight: 600, color: roleLevel === l ? "#3B2FD9" : "#6B7280", background: roleLevel === l ? "#F0EEFF" : "#fff", fontFamily: "inherit" }}>{l}</button>
              ))}
            </div>
          </Field>
        </div>
        <Field label="Description">
          <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of this role's responsibilities" />
        </Field>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E4E7F0", padding: 20 }}>
        <SectionDivider title={`Feature Permissions — ${enabledCount}/${PERMISSIONS.length} enabled`} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {PERMISSIONS.map(p => (
            <div key={p} onClick={() => toggle(p)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 13px", border: `1px solid ${perms[p] ? "#3B2FD9" : "#E4E7F0"}`, borderRadius: 8, cursor: "pointer", background: perms[p] ? "#F0EEFF" : "#fff", transition: "all .15s" }}>
              <Toggle on={perms[p]} onChange={v => setPerms(prev => ({ ...prev, [p]: v }))} />
              <span style={{ fontSize: 12, fontWeight: 500 }}>{p}</span>
            </div>
          ))}
        </div>
        <FormFooter onSave={() => alert("Role created!")} saveLabel="Create Role" />
      </div>
    </div>
  );
};

export const AddUser: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const [firstName,    setFirstName]    = useState("");
  const [lastName,     setLastName]     = useState("");
  const [email,        setEmail]        = useState("");
  const [phone,        setPhone]        = useState("");
  const [department,   setDepartment]   = useState("IP Legal");
  const [jobTitle,     setJobTitle]     = useState("");
  const [location,     setLocation]     = useState("Riyadh, SA");
  const [role,         setRole]         = useState("Senior Analyst");
  const [avatarColor,  setAvatarColor]  = useState(AVATAR_COLORS[0]);
  const [inviteMethod, setInviteMethod] = useState<InviteMethod>("Email");
  const [forceChange,  setForceChange]  = useState(true);

  const initials = ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase() || "?";
  const rolePerms = ROLE_DEFAULTS[role] ?? [];
  const navigate = useNavigate();

  
  return (
    <div style={{ padding: 24 }}>
      <button
  onClick={() => navigate(-1)}
  style={{
    marginBottom: 10,
    color: "#3B2FD9",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontWeight: 600
  }}
>
  ← Back to List
</button>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Invite User</h2>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E4E7F0", padding: 20, marginBottom: 16 }}>
        <SectionDivider title="User Profile" />
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", marginBottom: 20 }}>
          {/* Avatar */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Avatar</label>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: avatarColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#fff", position: "relative" }}>
              {initials}
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 22, height: 22, background: "#3B2FD9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/></svg>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              {AVATAR_COLORS.map((c, i) => (
                <div key={i} onClick={() => setAvatarColor(c)} style={{ width: 22, height: 22, borderRadius: "50%", background: c, cursor: "pointer", border: avatarColor === c ? "2px solid #333" : "2px solid transparent", transform: avatarColor === c ? "scale(1.1)" : "none", transition: "all .15s" }} />
              ))}
            </div>
          </div>
          {/* Fields */}
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="First Name" required><Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" /></Field>
            <Field label="Last Name" required><Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" /></Field>
            <Field label="Work Email" required><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@company.com" /></Field>
            <Field label="Phone"><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 000 0000" /></Field>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <Field label="Department" required><Sel value={department} onChange={setDepartment} options={DEPARTMENTS} /></Field>
          <Field label="Job Title"><Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. IP Analyst" /></Field>
          <Field label="Office Location"><Sel value={location} onChange={setLocation} options={LOCATIONS} /></Field>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E4E7F0", padding: 20, marginBottom: 16 }}>
        <SectionDivider title="Access & Role Assignment" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
          <Field label="Assign Role" required>
            <Sel value={role} onChange={setRole} options={["Admin","Senior Analyst","Analyst","Viewer"]} />
            <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>Controls all feature-level permissions</div>
          </Field>
          <Field label="Billing Region Access"><Sel value="All Regions" onChange={() => {}} options={["All Regions","US Only","EU Only","Asia Pacific"]} /></Field>
          <Field label="Vendor Access"><Sel value="All Vendors" onChange={() => {}} options={["All Vendors","Assigned Vendors Only"]} /></Field>
        </div>
        <div style={{ background: "#F8F9FF", border: "1px solid #E4E7F0", borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#3B2FD9", marginBottom: 10 }}>{role} — Permission Preview</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {rolePerms.map(p => <span key={p} style={{ background: "#DBEAFE", color: "#1D4ED8", fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20 }}>{p}</span>)}
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E4E7F0", padding: 20 }}>
        <SectionDivider title="Invitation Settings" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Send Invitation Via">
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              {(["Email","SMS + Email","Manual"] as InviteMethod[]).map(m => (
                <button key={m} onClick={() => setInviteMethod(m)} style={{ padding: "7px 14px", border: `1.5px solid ${inviteMethod === m ? "#3B2FD9" : "#E4E7F0"}`, borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, color: inviteMethod === m ? "#3B2FD9" : "#6B7280", background: inviteMethod === m ? "#F0EEFF" : "#fff", fontFamily: "inherit" }}>{m}</button>
              ))}
            </div>
          </Field>
          <Field label="Access Expiry"><Sel value="No Expiry" onChange={() => {}} options={["No Expiry","30 Days","90 Days","1 Year","Custom Date"]} /></Field>
          <Field label="Temporary Password">
            <Input type="password" value="AutoGenerated" readOnly style={{ color: "#6B7280" }} />
          </Field>
          <Field label="Force Password Change on First Login">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
              <Toggle on={forceChange} onChange={setForceChange} />
              <span style={{ fontSize: 13 }}>{forceChange ? "Yes — required" : "No"}</span>
            </div>
          </Field>
        </div>
        <FormFooter onSave={() => alert("User invited!")} saveLabel="Send Invitation" />
      </div>
    </div>
  );
};

export const AddRoleAddUser: React.FC<{ onBack?: () => void }> = ({ onBack }) => {  const [tab, setTab] = useState<Tab>("role");

  
  return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", color: "#1A1D2E" }}>
      {onBack && (
  <button
    onClick={onBack}
    style={{
      margin: "20px 24px 0",
      color: "#3B2FD9",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontWeight: 600
    }}
  >
    ← Back to List
  </button>
)}
      <div style={{ padding: "0 24px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, paddingTop: 24, marginBottom: 4 }}>Users &amp; Roles</h2>
        <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 20 }}>Manage platform users and role-based access control</p>
        <div style={{ display: "flex", borderBottom: "2px solid #E4E7F0", marginBottom: 0 }}>
          {([["role","Add / Edit Role"],["user","Add / Invite User"]] as [Tab, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ border: "none", background: "none", cursor: "pointer", padding: "10px 20px", fontSize: 14, fontWeight: tab === id ? 700 : 500, color: tab === id ? "#3B2FD9" : "#6B7280", borderBottom: `2px solid ${tab === id ? "#3B2FD9" : "transparent"}`, marginBottom: -2, fontFamily: "inherit" }}>{label}</button>
          ))}
        </div>
      </div>
      {tab === "role"
  ? <AddRole onBack={onBack} />
  : <AddUser onBack={onBack} />
}
    </div>
  );
};
