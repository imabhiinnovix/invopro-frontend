import React, { useEffect } from "react";

interface ToastProps {
  message:  string;
  visible:  boolean;
  onHide:   () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, visible, onHide }) => {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onHide, 3000);
      return () => clearTimeout(t);
    }
  }, [visible, onHide]);

  return (
    <div style={{
      position:  "fixed",
      bottom:    24,
      left:      "50%",
      transform: `translateX(-50%) translateY(${visible ? 0 : 80}px)`,
      background: "#1A1D2E",
      color:     "#fff",
      padding:   "10px 20px",
      borderRadius: 24,
      fontSize:  13,
      fontWeight: 600,
      zIndex:    100,
      transition: "transform 0.3s",
      display:   "flex",
      alignItems: "center",
      gap:       8,
      pointerEvents: visible ? "auto" : "none",
    }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      {message}
    </div>
  );
};
