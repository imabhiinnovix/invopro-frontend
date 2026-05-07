import React from "react";
import { Button } from "./Button";

interface ModalProps {
  open:       boolean;
  onClose:    () => void;
  title:      string;
  subtitle?:  string;
  children:   React.ReactNode;
  footer?:    React.ReactNode;
  width?:     number;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, subtitle, children, footer, width = 480 }) => {
  if (!open) return null;
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#fff", borderRadius: 14, padding: 28, width, maxWidth: "95vw", boxShadow: "0 8px 40px rgba(0,0,0,.18)" }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 4px" }}>{title}</h3>
        {subtitle && <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 18px" }}>{subtitle}</p>}
        {children}
        {footer && (
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: "1px solid #E4E7F0" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

interface ConfirmModalProps {
  open:       boolean;
  onClose:    () => void;
  onConfirm:  () => void;
  title:      string;
  message:    React.ReactNode;
  confirmLabel?: string;
  confirmVariant?: "primary" | "danger" | "force";
  warning?:   string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open, onClose, onConfirm, title, message, confirmLabel = "Confirm", confirmVariant = "primary", warning,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    footer={
      <>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
      </>
    }
  >
    <div style={{ fontSize: 13, color: "#6B7280", marginBottom: warning ? 14 : 0 }}>{message}</div>
    {warning && (
      <div style={{ padding: "10px 12px", background: "#FFF3CD", border: "1px solid #FDE68A", borderRadius: 8, fontSize: 12, color: "#92400E", display: "flex", gap: 8, alignItems: "flex-start" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="#D97706" style={{ flexShrink: 0, marginTop: 1 }}><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
        <span>{warning}</span>
      </div>
    )}
  </Modal>
);
