import React from "react";
import type { PageId } from "../types";
import { useLocation, useNavigate } from "react-router-dom";

interface SidebarProps {
  active:    PageId;
  collapsed: boolean;
  onToggle:  () => void;
}

interface NavItem {
  id:     PageId;
  label:  string;
  icon:   JSX.Element;
  group?: string;
  isSep?: boolean;
}

const NAV_ITEMS: Array<NavItem | { isSep: true; group: string; id: string }> = [
  { id:"home",        label:"Home",                icon:<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>,                                         group:"" },
  { isSep:true,       group:"Invoice Information",  id:"s1" },
  { id:"upload",      label:"Data Upload",          icon:<path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>, group:"Invoice Information" },
  // { id:"inv-list",    label:"Invoice List",         icon:<path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>,                                       group:"Invoice Information" },
  { id:"inv-review",  label:"Invoice Review",       icon:<path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>, group:"Invoice Information" },
  { isSep:true,       group:"Dashboards",           id:"s2" },
  { id:"exec",        label:"Executive Dashboard",  icon:<path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99H22c-.47-4.74-4.24-8.52-8.97-8.99zm0 11.01V22c4.74-.47 8.5-4.25 8.97-9H13.03z"/>, group:"Dashboards" },
  { id:"activity",    label:"Activity Analytics",   icon:<path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99l1.5 1.5z"/>,   group:"Dashboards" },
  { id:"bench",       label:"Vendor Benchmarking",  icon:<path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z"/>, group:"Dashboards" },
  { isSep:true,       group:"Management",           id:"s3" },
  { id:"vendors",     label:"Vendors",              icon:<path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z"/>, group:"Management" },
  { id:"roles",       label:"Users & Roles",        icon:<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>, group:"Management" },
  { id:"onboard",     label:"Onboarding",           icon:<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/>, group:"Management" },
];

const SvgIcon: React.FC<{ path: JSX.Element; color?: string }> = ({ path, color = "currentColor" }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={color}>{path}</svg>
);

export const Sidebar: React.FC<SidebarProps> = ({ active, collapsed, onToggle }) => {
  const navigate = useNavigate();

  const routeMap: Record<string, string> = {
  home: "/home",
  upload: "/upload",
  "inv-review": "/invoice-review",
  "inv-detail": "/inv-detail",
  vendors: "/vendors",
  roles: "/roles",
  exec: "/exec",
  bench: "/bench",
  onboard: "/onboard",
  "add-user": "/add-user",
  "add-role": "/add-role",
  "vendor-rate-card": "/vendor-rate-card",
};
        const location = useLocation();


  return (
  <div style={{ width: collapsed ? 56 : 220, flexShrink: 0, background: "#fff", borderRight: "1px solid #E4E7F0", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, transition: "width 0.2s", overflow: "hidden", zIndex: 10 }}>
    {/* Header */}
    <div style={{ padding: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #E4E7F0", minHeight: 56 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#3B2FD9,#A855F7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 13h8v1.5H8V13zm0 3h8v1.5H8V16zm0-6h5v1.5H8V10z"/></svg>
        </div>
        {!collapsed && (
          <span style={{ fontSize: 20, fontWeight: 800, marginLeft: 8, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
            <span style={{ color: "#3B2FD9" }}>InVo</span>
            <span style={{ background: "linear-gradient(90deg,#7C4DFF,#A855F7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Pro</span>
          </span>
        )}
      </div>
      <button onClick={onToggle} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", padding: 4, display: "flex", alignItems: "center" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          {collapsed
            ? <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            : <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>}
        </svg>
      </button>
    </div>

    {/* Nav */}
    <nav style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
      
      {NAV_ITEMS.map((item) => {
        if ("isSep" in item && item.isSep) {
          return !collapsed
            ? <div key={item.id} style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", letterSpacing: "0.1em", textTransform: "uppercase", padding: "12px 8px 4px", marginTop: 4 }}>{item.group}</div>
            : <div key={item.id} style={{ height: 1, background: "#E4E7F0", margin: "8px 4px" }} />;
        }
        const navItem = item as NavItem;


        const isActive = location.pathname === routeMap[navItem.id];
        return (
          <button
            key={navItem.id}
            onClick={() => navigate(routeMap[navItem.id])}
            style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: collapsed ? "10px 0" : "9px 12px",
              justifyContent: collapsed ? "center" : "flex-start",
              borderRadius: 8, border: "none", cursor: "pointer",
              marginBottom: 2,
              background: isActive ? "#F0EEFF" : "transparent",
              color:      isActive ? "#3B2FD9"  : "#1A1D2E",
              fontWeight: isActive ? 700 : 500,
              fontSize: 13,
              borderLeft: isActive ? "3px solid #3B2FD9" : "3px solid transparent",
              transition: "all 0.15s",
              fontFamily: "inherit",
            }}
          >
            <SvgIcon path={navItem.icon} color={isActive ? "#3B2FD9" : "#6B7280"} />
            {!collapsed && <span style={{ flex: 1, textAlign: "left" }}>{navItem.label}</span>}
          </button>
        );
      })}
    </nav>

    {!collapsed && (
      <div style={{ padding: "12px 14px", borderTop: "1px solid #E4E7F0", fontSize: 11, color: "#6B7280" }}>
        Powered by <strong style={{ color: "#3B2FD9" }}>InVoPro</strong>
      </div>
    )}
  </div>
  );
};
