import React, { useContext, useState, useRef, useEffect } from "react";
import { Button } from "./ui/Button";
import { AuthContext } from "../context/AuthContext";

interface TopbarProps {
  title:       string;
  onAIToggle:  () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ title, onAIToggle }) => {
const { userDetails, logout } = useContext(AuthContext);
const [openMenu, setOpenMenu] = useState(false);
const menuRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setOpenMenu(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

return (
<div style={{ height: 52, background: "#fff", borderBottom: "1px solid #E4E7F0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 9 }}>
    <span style={{ fontSize: 15, fontWeight: 600, color: "#1A1D2E" }}>{title}</span>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Button variant="ghost" onClick={onAIToggle} style={{ gap: 6 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
        AI Assistant
        <span style={{ background: "#EEF0FF", color: "#3B2FD9", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 10, letterSpacing: "0.05em" }}>AI</span>
      </Button>
      <span style={{ fontSize: 12, color: "#6B7280" }}>Login as</span>
<div
  ref={menuRef}
  style={{ position: "relative" }}
>
  <div
    onClick={() => setOpenMenu(!openMenu)}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: "#F8F9FF",
      borderRadius: 8,
      padding: "5px 12px",
      border: "1px solid #E4E7F0",
      cursor: "pointer"
    }}
  >
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: "linear-gradient(135deg,#3B2FD9,#A855F7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: 11,
        fontWeight: 700
      }}
    >
      {`${userDetails?.data?.firstName?.[0] || ""}${userDetails?.data?.lastName?.[0] || ""}`.toUpperCase()}
    </div>

    <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1D2E" }}>
      {userDetails?.data?.firstName || "SABIC"}{" "}
      {userDetails?.data?.lastName || "Admin"}
    </span>

    <svg width="10" height="10" viewBox="0 0 24 24" fill="#6B7280">
      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
    </svg>
  </div>

  {openMenu && (
  <div
    style={{
      position: "absolute",
      top: "calc(100% + 8px)",
      right: 0,
      width: 220,
      background: "#fff",
      border: "1px solid #E5E7EB",
      borderRadius: 10,
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      overflow: "hidden",
      zIndex: 1000
    }}
  >
    <div
      style={{
        padding: "14px 16px",
        borderBottom: "1px solid #F3F4F6"
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#111827",
          marginBottom: 4
        }}
      >
        {userDetails?.data?.firstName} {userDetails?.data?.lastName}
      </div>

      <div
        style={{
          fontSize: 12,
          color: "#6B7280",
          wordBreak: "break-word"
        }}
      >
        {userDetails?.data?.email}
      </div>
    </div>

    <button
      onClick={logout}
      style={{
        width: "100%",
        padding: "12px 16px",
        border: "none",
        background: "#fff",
        textAlign: "center",
        cursor: "pointer",
        color: "#DC2626",
        fontSize: 13,
        fontWeight: 500,
        transition: "background 0.2s"
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
    >
      Logout
    </button>
  </div>
)}
</div>
    </div>
  </div>
  );
};
