"use client";

import { useState } from "react";
import { Sparkles, MessageSquareText } from "lucide-react";
import { AIChatPanel } from "@/components/ai-chat-panel";

interface AIInsightsWidgetProps {
  insights: Array<{ text: string; color: string }>;
  pendingReminderCount: number;
}

function getInsightStyles(color: string): { background: string; dotColor: string } {
  switch (color) {
    case "urgent":
      return { background: "var(--danger-soft)", dotColor: "var(--danger)" };
    case "warning":
      return { background: "rgba(217, 119, 6, 0.08)", dotColor: "#d97706" };
    default:
      return { background: "var(--accent-soft)", dotColor: "var(--accent)" };
  }
}

export function AIInsightsWidget({ insights, pendingReminderCount }: AIInsightsWidgetProps) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      {insights.length > 0 && (
        <div style={{ borderTop: "1px solid var(--border-default)", marginTop: "20px", paddingTop: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Sparkles style={{ width: "14px", height: "14px", color: "var(--accent)" }} />
            <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>AI Insights</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {insights.slice(0, 3).map((insight, i) => {
              const styles = getInsightStyles(insight.color);
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    padding: "8px 12px",
                    borderRadius: "var(--radius-sm)",
                    background: styles.background,
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "999px",
                      background: styles.dotColor,
                      marginTop: "6px",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{insight.text}</span>
                </div>
              );
            })}
          </div>

          {/* Ask AI Assistant button */}
          <button
            onClick={() => setChatOpen(true)}
            className="relative mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            style={{
              background: "var(--accent-soft)",
              color: "var(--accent)",
              border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
            }}
          >
            <MessageSquareText className="h-4 w-4" />
            Ask AI Assistant
            {pendingReminderCount > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: "var(--accent)" }}
              >
                {pendingReminderCount > 9 ? "9+" : pendingReminderCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* AI Chat Panel */}
      <AIChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
