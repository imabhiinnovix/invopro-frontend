import React, { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "../types";
import { AI_RESPONSES } from "../data/mockData";
import { genId } from "../utils/helpers";

interface AIAssistantProps {
  open:     boolean;
  onClose:  () => void;
}

const SUGGESTIONS = [
  "What is the total amount billed by WBD in January 2026?",
  "Which cases have no email evidence in the docket?",
  "Show rate violations across all vendors this month",
  "What are the key terms in the WBD engagement letter?",
  "Which law firm has the highest cost index?",
];

export const AIAssistant: React.FC<AIAssistantProps> = ({ open, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "init", role: "ai", html: "Hi! I can help you analyse invoices, query engagement letter data, extract analytics, and answer questions about your billing records. Try asking me something:" },
  ]);
  const [input,   setInput]   = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const msgsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: genId(), role: "user", html: text };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const response = AI_RESPONSES[text] ??
        `I'm analysing the data for "<em>${text}</em>"...<br>This query searches across invoices, engagement letters, and analytics. For a full integration, connect to the InVoPro API backend.`;
      setMessages(m => [...m, { id: genId(), role: "ai", html: response }]);
      setLoading(false);
    }, 800);
  };

  return (
    <div style={{
      position:  "fixed",
      right:     0,
      top:       0,
      height:    "100vh",
      width:     380,
      background: "#fff",
      borderLeft: "1px solid #E4E7F0",
      boxShadow:  "-4px 0 20px rgba(0,0,0,.1)",
      display:    "flex",
      flexDirection: "column",
      zIndex:    50,
      transform: `translateX(${open ? 0 : 100}%)`,
      transition: "transform 0.3s",
    }}>
      {/* Header */}
      <div style={{ padding: "16px 18px", borderBottom: "1px solid #E4E7F0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg,#3B2FD9,#7C4DFF)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "#fff" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
          AI Data Assistant
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 10, background: "rgba(255,255,255,.2)", color: "#fff", padding: "2px 8px", borderRadius: 10 }}>GPT-4o</span>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", cursor: "pointer", color: "#fff", width: 28, height: 28, borderRadius: 6, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
      </div>

      {/* Messages */}
      <div ref={msgsRef} style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            alignSelf:    msg.role === "user" ? "flex-end" : "flex-start",
            background:   msg.role === "user" ? "#3B2FD9" : "#F8F9FF",
            color:        msg.role === "user" ? "#fff"    : "#1A1D2E",
            borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
            border:       msg.role === "user" ? "none" : "1px solid #E4E7F0",
            padding:      "10px 14px",
            maxWidth:     "85%",
            fontSize:     13,
            lineHeight:   1.5,
          }}
            dangerouslySetInnerHTML={{ __html: msg.html }}
          />
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", background: "#F8F9FF", border: "1px solid #E4E7F0", borderRadius: "12px 12px 12px 2px", padding: "10px 14px", fontSize: 13, color: "#6B7280" }}>
            Thinking…
          </div>
        )}

        {/* Suggestion chips — only show after initial message */}
        {messages.length === 1 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "4px 0" }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => sendMessage(s)} style={{ background: "#EEF0FF", color: "#3B2FD9", border: "1px solid #E4E7F0", borderRadius: 16, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                {s.length > 40 ? s.slice(0, 40) + "…" : s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: "14px 16px", borderTop: "1px solid #E4E7F0", display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") sendMessage(input); }}
          placeholder="Ask about invoices, analytics, contracts..."
          style={{ flex: 1, border: "1.5px solid #E4E7F0", borderRadius: 20, padding: "8px 14px", fontSize: 13, outline: "none", fontFamily: "inherit", transition: "border 0.15s" }}
          onFocus={e => (e.target.style.borderColor = "#3B2FD9")}
          onBlur={e  => (e.target.style.borderColor = "#E4E7F0")}
        />
        <button
          onClick={() => sendMessage(input)}
          style={{ width: 36, height: 36, borderRadius: "50%", background: "#3B2FD9", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  );
};
