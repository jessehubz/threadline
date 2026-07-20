"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";

interface DeadlineItem {
  id: string;
  title: string;
  dueDate: string | null;
  projectId: string;
  projectName: string;
  daysOverdue?: number;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "No date";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function DeadlinesClient({
  overdue,
  dueToday,
  dueThisWeek,
  dueLater,
}: {
  overdue: DeadlineItem[];
  dueToday: DeadlineItem[];
  dueThisWeek: DeadlineItem[];
  dueLater: DeadlineItem[];
}) {
  const [tab, setTab] = useState<"overdue" | "today" | "week" | "later">(overdue.length > 0 ? "overdue" : "today");

  const tabs: Array<{ id: "overdue" | "today" | "week" | "later"; label: string; count: number }> = [
    { id: "overdue", label: "Overdue", count: overdue.length },
    { id: "today", label: "Today", count: dueToday.length },
    { id: "week", label: "This Week", count: dueThisWeek.length },
    { id: "later", label: "Later", count: dueLater.length },
  ];
  const items = tab === "overdue" ? overdue : tab === "today" ? dueToday : tab === "week" ? dueThisWeek : dueLater;

  // Sliding pill animation
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  useEffect(() => {
    if (!tabContainerRef.current) return;
    const activeBtn = tabContainerRef.current.querySelector(`[data-tab-id="${tab}"]`) as HTMLElement | null;
    if (activeBtn) {
      const containerRect = tabContainerRef.current.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      setPillStyle({
        left: btnRect.left - containerRect.left,
        width: btnRect.width,
      });
    }
  }, [tab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!tabContainerRef.current) return;
      const activeBtn = tabContainerRef.current.querySelector(`[data-tab-id="${tab}"]`) as HTMLElement | null;
      if (activeBtn) {
        const containerRect = tabContainerRef.current.getBoundingClientRect();
        const btnRect = activeBtn.getBoundingClientRect();
        setPillStyle({
          left: btnRect.left - containerRect.left,
          width: btnRect.width,
        });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <div className="dash-sect-head" style={{ marginBottom: "18px" }}>
        <h3>Deadlines</h3>
      </div>

      <div className="dash-card">
        {/* Sliding pill tab bar */}
        <div style={{ display: "flex", alignItems: "center", padding: "16px 20px 0" }}>
          <div
            ref={tabContainerRef}
            style={{
              position: "relative",
              display: "flex",
              gap: "2px",
              background: "var(--dp-band)",
              borderRadius: "999px",
              padding: "4px",
            }}
          >
            {/* Sliding dark pill */}
            <div
              style={{
                position: "absolute",
                top: "4px",
                left: `${pillStyle.left}px`,
                width: `${pillStyle.width}px`,
                height: "calc(100% - 8px)",
                borderRadius: "999px",
                background: "var(--dp-ink)",
                transition: "left 300ms cubic-bezier(0.23, 1, 0.32, 1), width 300ms cubic-bezier(0.23, 1, 0.32, 1)",
                zIndex: 0,
              }}
            />
            {tabs.map((t) => (
              <button
                key={t.id}
                data-tab-id={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  position: "relative",
                  zIndex: 1,
                  padding: "7px 16px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  background: "transparent",
                  color: tab === t.id ? "var(--dp-bg)" : "var(--text-secondary)",
                  transition: "color 200ms ease",
                  whiteSpace: "nowrap",
                  fontFamily: "inherit",
                }}
              >
                {t.label} {t.count}
              </button>
            ))}
          </div>
          <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--dp-ink-3)" }} className="num">
            {items.length} due
          </span>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--dp-ink-3)" }}>
            <Clock style={{ width: "28px", height: "28px", margin: "0 auto 10px", opacity: 0.4 }} />
            <p style={{ fontSize: "13px" }}>
              {tab === "overdue" ? "Nothing overdue — you're on track!" : tab === "today" ? "Nothing due today — enjoy the breathing room" : tab === "week" ? "No tasks due this week" : "No upcoming deadlines"}
            </p>
          </div>
        ) : (
          <div className="dash-rowlist" style={{ paddingTop: "10px" }}>
            {items.map((item) => (
              <Link key={item.id} href={`/graph/${item.projectId}`} className="dash-trow">
                <span className={`dash-g ${tab === "overdue" ? "dash-g-rej" : "dash-g-ready"}`} />
                <div className="tbody">
                  <b>{item.title}</b>
                  <span>{item.projectName}</span>
                </div>
                <div className="tright">
                  <span className={`due num${tab === "overdue" ? " hot" : ""}`}>
                    {tab === "overdue" && item.daysOverdue !== undefined ? `${item.daysOverdue}d late` : formatDate(item.dueDate)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
