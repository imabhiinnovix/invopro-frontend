import React, { useState } from "react";
import type { PageProps, UserRole } from "../types";
import { USERS, ROLES } from "../data/mockData";
import { SectionHeader, Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Pill } from "../components/ui/Pill";
import { Tabs } from "../components/ui/Tabs";
import { SearchBox } from "../components/ui/Tabs";

const PERMISSION_LABELS: Record<string, string> = {
  invoiceUpload:   "Invoice Upload",
  invoiceReview:   "Invoice Review",
  forcePass:       "Force Validation Pass",
  approveInvoice:  "Approve Invoices",
  vendorMgmt:      "Vendor Management",
  userMgmt:        "User Management",
  dashboards:      "View Dashboards",
  exportReports:   "Export Reports",
  aiAssistant:     "AI Assistant",
  onboarding:      "Onboarding",
  auditTrail:      "Audit Trail View",
  rateCard:        "Rate Card Access",
};

const ROLE_PILL_COLOR: Record<UserRole, "violet" | "blue" | "amber" | "gray"> = {
  Admin:           "violet",
  "Senior Analyst":"blue",
  Analyst:         "amber",
  Viewer:          "gray",
};

interface ToggleProps { on: boolean; onChange: (v: boolean) => void; }
const Toggle: React.FC<ToggleProps> = ({ on, onChange }) => (
  <div
    onClick={() => onChange(!on)}
    style={{ width:36, height:20, borderRadius:10, background:on?"#3B2FD9":"#6B7280", position:"relative", cursor:"pointer", transition:"background 0.2s", flexShrink:0 }}
  >
    <div style={{ position:"absolute", top:2, left:on?18:2, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"left 0.2s" }} />
  </div>
);

export const UsersRoles: React.FC<PageProps> = ({ onNavigate: _ }) => {
  const [tab,       setTab]       = useState<string>("users");
  const [search,    setSearch]    = useState<string>("");
  const [openRoles, setOpenRoles] = useState<Set<string>>(new Set(["r1"]));
  const [rolePerms, setRolePerms] = useState(
    Object.fromEntries(ROLES.map(r => [r.id, { ...r.permissions }]))
  );

  const filteredUsers = USERS.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleRoleOpen = (id: string) => {
    setOpenRoles(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const togglePerm = (roleId: string, perm: string, val: boolean) => {
    setRolePerms(prev => ({ ...prev, [roleId]: { ...prev[roleId], [perm]: val } }));
  };

  return (
    <div style={{ padding: 24 }}>
      <SectionHeader
        title="Users & Roles"
        subtitle="Manage platform users, assign roles, and control feature-level permissions"
        actions={
          <Button variant="primary">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            Invite User
          </Button>
        }
      />

      <Tabs tabs={[{ id:"users", label:"Users" }, { id:"roles", label:"Roles & Permissions" }]} active={tab} onChange={setTab} />

      {/* ── Users tab ── */}
      {tab === "users" && (
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <SearchBox value={search} onChange={setSearch} placeholder="Search users..." />
            <select style={{ border:"1.5px solid #E4E7F0", borderRadius:8, padding:"7px 12px", fontSize:13, fontFamily:"inherit", color:"#1A1D2E", background:"#fff", outline:"none", width:180 }}>
              <option>All Roles</option>
              <option>Admin</option>
              <option>Senior Analyst</option>
              <option>Analyst</option>
              <option>Viewer</option>
            </select>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {filteredUsers.map(user => (
              <div key={user.id} style={{ display:"flex", alignItems:"center", gap:14, padding:12, border:"1px solid #E4E7F0", borderRadius:10 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:user.avatarColor, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, color:"#fff", flexShrink:0 }}>
                  {user.initials}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>{user.name}</div>
                  <div style={{ fontSize:12, color:"#6B7280" }}>{user.email}</div>
                </div>
                <Pill label={user.role} color={ROLE_PILL_COLOR[user.role]} />
                <Pill label={user.status} color={user.status === "Active" ? "green" : "red"} />
                <div style={{ display:"flex", gap:6 }}>
                  <Button size="sm" variant="ghost">Edit</Button>
                  <Button size="sm" variant="ghost">Permissions</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Roles tab ── */}
      {tab === "roles" && (
        <div>
          <div style={{ marginBottom:12 }}>
            <Button variant="primary" size="sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              Add Role
            </Button>
          </div>

          {ROLES.map(role => {
            const isOpen = openRoles.has(role.id);
            const perms  = rolePerms[role.id] ?? role.permissions;
            const enabledCount = Object.values(perms).filter(Boolean).length;
            return (
              <div key={role.id} style={{ border:"1px solid #E4E7F0", borderRadius:10, overflow:"hidden", marginBottom:12 }}>
                <div
                  onClick={() => toggleRoleOpen(role.id)}
                  style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", background:"#F8F9FF", cursor:"pointer" }}
                >
                  <div>
                    <div style={{ fontWeight:700, fontSize:14 }}>{role.name}</div>
                    <div style={{ fontSize:12, color:"#6B7280" }}>{role.description} — {role.userCount} users · {enabledCount}/{Object.keys(PERMISSION_LABELS).length} permissions enabled</div>
                  </div>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <Pill label={role.name === "Admin" ? "Full Access" : role.name === "Senior Analyst" ? "Limited Admin" : role.name === "Analyst" ? "Restricted" : "Read Only"} color={ROLE_PILL_COLOR[role.name]} />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ transform:isOpen?"rotate(180deg)":"none", transition:"transform 0.2s" }}><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
                  </div>
                </div>
                {isOpen && (
                  <div style={{ padding:"14px 16px" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                      {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                        <div key={key} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", border:"1px solid #E4E7F0", borderRadius:8, fontSize:12, fontWeight:500 }}>
                          <Toggle on={Boolean(perms[key])} onChange={v => togglePerm(role.id, key, v)} />
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop:12, display:"flex", gap:8, justifyContent:"flex-end" }}>
                      <Button size="sm" variant="ghost">Reset Defaults</Button>
                      <Button size="sm" variant="primary">Save Permissions</Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
