"use client";

import { Sparkles } from "lucide-react";

/**
 * Verbatim design-preview12 .helper strip — a quiet, flat card mirroring the
 * topbar's Assistant entry point. Mounted once in the dashboard layout so it
 * appears at the bottom of every inner page, not just /dashboard.
 */
export function AssistantHelperStrip() {
  const openAiChat = () => {
    window.dispatchEvent(new CustomEvent("open-ai-chat"));
  };

  return (
    <div
      onClick={openAiChat}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") openAiChat(); }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        background: "var(--dp-band-2)",
        boxShadow: "inset 0 0 0 0.5px var(--dp-hair-soft)",
        borderRadius: "var(--dp-r-lg)",
        padding: "15px 20px",
        margin: "44px 0",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          width: "32px", height: "32px", borderRadius: "10px",
          background: "var(--dp-ink)", color: "var(--dp-bg)",
          display: "grid", placeItems: "center", flexShrink: 0,
        }}
      >
        <Sparkles style={{ width: "15px", height: "15px" }} />
      </span>
      <span style={{ fontSize: "13.5px", fontWeight: 650, color: "var(--text-primary)" }}>Assistant</span>
      <span style={{ fontSize: "13px", color: "var(--dp-ink-2)", flex: 1 }}>
        Describe a goal — get a ready dependency map.
      </span>
      <span
        style={{
          marginLeft: "auto", flexShrink: 0, fontSize: "13px", fontWeight: 600,
          padding: "7px 14px", borderRadius: "var(--dp-r-sm)",
          boxShadow: "inset 0 0 0 1px var(--dp-hair)", color: "var(--text-primary)",
        }}
      >
        Open Assistant
      </span>
    </div>
  );
}
