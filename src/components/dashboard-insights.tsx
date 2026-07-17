"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  LayoutList,
  X,
  ArrowRight,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TaskItem {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  projectId: string;
  projectName: string;
  assigneeName: string | null;
  assigneeInitials: string;
  daysOverdue?: number;
}

interface DashboardInsightsProps {
  activeTasks: number;
  inProgressTasks: number;
  blockedTasksCount: number;
  dueToday: TaskItem[];
  dueThisWeek: TaskItem[];
  overdue: TaskItem[];
  dueLater: TaskItem[];
  projects: Array<{ id: string; name: string }>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null) {
  if (!dateStr) return "No date";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getStatusColor(status: string): string {
  switch (status) {
    case "NOT_STARTED": return "var(--text-muted)";
    case "IN_PROGRESS": return "#3b82f6";
    case "BLOCKED": return "#ef4444";
    case "AWAITING_APPROVAL": return "#f59e0b";
    case "REJECTED": return "#ef4444";
    case "COMPLETE": return "#22c55e";
    default: return "var(--text-muted)";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "NOT_STARTED": return "Not Started";
    case "IN_PROGRESS": return "In Progress";
    case "BLOCKED": return "Blocked";
    case "AWAITING_APPROVAL": return "Awaiting Approval";
    case "REJECTED": return "Rejected";
    case "COMPLETE": return "Complete";
    default: return status;
  }
}

function getStatusDotBg(status: string): string {
  switch (status) {
    case "NOT_STARTED": return "rgba(107,114,128,0.15)";
    case "IN_PROGRESS": return "rgba(59,130,246,0.12)";
    case "BLOCKED": return "rgba(239,68,68,0.12)";
    case "AWAITING_APPROVAL": return "rgba(245,158,11,0.12)";
    case "REJECTED": return "rgba(239,68,68,0.12)";
    case "COMPLETE": return "rgba(34,197,94,0.12)";
    default: return "var(--bg-muted)";
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DashboardInsights({
  activeTasks,
  inProgressTasks,
  blockedTasksCount,
  dueToday,
  dueThisWeek,
  overdue,
  dueLater,
  projects,
}: DashboardInsightsProps) {
  const [planningOpen, setPlanningOpen] = useState(false);

  // Compute "not started" from active - inProgress - blocked (approx)
  const notStartedTasks = Math.max(0, activeTasks - inProgressTasks - blockedTasksCount);

  // All tasks for the planning view (next 7 days = overdue + today + this week)
  const planningTasks = [...overdue, ...dueToday, ...dueThisWeek, ...dueLater];

  // Group planning tasks by project
  const tasksByProject = new Map<string, TaskItem[]>();
  for (const task of planningTasks) {
    const list = tasksByProject.get(task.projectId) || [];
    list.push(task);
    tasksByProject.set(task.projectId, list);
  }

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "20px",
          marginBottom: "0",
        }}
      >
        {/* ─── A. Finish Today ─── */}
        <FinishTodaySection dueToday={dueToday} />

        {/* ─── B. Overview Panel ─── */}
        <OverviewPanel
          activeTasks={activeTasks}
          inProgressTasks={inProgressTasks}
          blockedTasksCount={blockedTasksCount}
          notStartedTasks={notStartedTasks}
          overdueCount={overdue.length}
          dueThisWeekCount={dueThisWeek.length}
        />

        {/* ─── C. Planning View Button ─── */}
        <button
          onClick={() => setPlanningOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            width: "100%",
            padding: "14px 24px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-default)",
            background: "var(--bg-elevated)",
            color: "var(--text-primary)",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "border-color .18s ease, background .18s ease, transform .18s ease, box-shadow .18s ease",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.borderColor = "var(--accent)";
            el.style.background = "var(--accent-soft)";
            el.style.color = "var(--accent)";
            el.style.transform = "translateY(-2px)";
            el.style.boxShadow = "var(--shadow-md)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.borderColor = "var(--border-default)";
            el.style.background = "var(--bg-elevated)";
            el.style.color = "var(--text-primary)";
            el.style.transform = "translateY(0)";
            el.style.boxShadow = "none";
          }}
        >
          <LayoutList style={{ width: "16px", height: "16px" }} />
          Open Planning View
          <ArrowRight style={{ width: "14px", height: "14px", opacity: 0.6 }} />
        </button>
      </div>

      {/* ─── Planning Modal ─── */}
      {planningOpen && (
        <PlanningModal
          tasksByProject={tasksByProject}
          projects={projects}
          onClose={() => setPlanningOpen(false)}
        />
      )}
    </>
  );
}

// ─── Finish Today Section ────────────────────────────────────────────────────

function FinishTodaySection({ dueToday }: { dueToday: TaskItem[] }) {
  if (dueToday.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "14px 20px",
          borderRadius: "var(--radius-lg)",
          background: "rgba(34,197,94,0.05)",
          border: "1px solid rgba(34,197,94,0.15)",
        }}
      >
        <CheckCircle2 style={{ width: "16px", height: "16px", color: "#22c55e", flexShrink: 0 }} />
        <span style={{ fontSize: "13.5px", color: "var(--text-secondary)", fontWeight: 500 }}>
          Nothing due today — you&apos;re ahead!
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "16px 20px",
        borderRadius: "var(--radius-lg)",
        background: "rgba(245,158,11,0.04)",
        border: "1px solid rgba(245,158,11,0.15)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
        <Clock style={{ width: "14px", height: "14px", color: "#f59e0b" }} />
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Finish Today ({dueToday.length})
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {dueToday.slice(0, 5).map((task) => (
          <Link
            key={task.id}
            href={`/graph/${task.projectId}`}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                transition: "background .15s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(245,158,11,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: getStatusColor(task.status),
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {task.title}
                </span>
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", flexShrink: 0, marginLeft: "8px" }}>
                {task.projectName}
              </span>
            </div>
          </Link>
        ))}
        {dueToday.length > 5 && (
          <span style={{ fontSize: "11px", color: "var(--text-muted)", padding: "4px 12px" }}>
            +{dueToday.length - 5} more
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Overview Panel ──────────────────────────────────────────────────────────

function OverviewPanel({
  activeTasks,
  inProgressTasks,
  blockedTasksCount,
  notStartedTasks,
  overdueCount,
  dueThisWeekCount,
}: {
  activeTasks: number;
  inProgressTasks: number;
  blockedTasksCount: number;
  notStartedTasks: number;
  overdueCount: number;
  dueThisWeekCount: number;
}) {
  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "var(--radius-lg)",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <Calendar style={{ width: "14px", height: "14px", color: "var(--accent)" }} />
        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
          Overview
        </span>
      </div>

      {/* Stats row */}
      <div
        className="grid grid-cols-3 gap-3 mb-4 max-[480px]:grid-cols-1 max-[480px]:gap-2"
      >
        <StatCard label="Active" value={activeTasks} color="var(--accent)" />
        <StatCard label="Overdue" value={overdueCount} color={overdueCount > 0 ? "#ef4444" : "var(--text-muted)"} />
        <StatCard label="Due This Week" value={dueThisWeekCount} color={dueThisWeekCount > 0 ? "#f59e0b" : "var(--text-muted)"} />
      </div>

      {/* Status breakdown */}
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
        {inProgressTasks > 0 && (
          <StatusPill status="IN_PROGRESS" count={inProgressTasks} />
        )}
        {blockedTasksCount > 0 && (
          <StatusPill status="BLOCKED" count={blockedTasksCount} />
        )}
        {notStartedTasks > 0 && (
          <StatusPill status="NOT_STARTED" count={notStartedTasks} />
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "14px 8px",
        borderRadius: "var(--radius-sm)",
        background: "var(--bg-muted)",
      }}
    >
      <div style={{ fontSize: "24px", fontWeight: 600, color, lineHeight: 1.2 }}>
        {value}
      </div>
      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </div>
    </div>
  );
}

function StatusPill({ status, count }: { status: string; count: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "4px 10px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 500,
        background: getStatusDotBg(status),
        color: getStatusColor(status),
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: getStatusColor(status),
        }}
      />
      {count} {getStatusLabel(status)}
    </span>
  );
}

// ─── Planning Modal ──────────────────────────────────────────────────────────

function PlanningModal({
  tasksByProject,
  projects,
  onClose,
}: {
  tasksByProject: Map<string, TaskItem[]>;
  projects: Array<{ id: string; name: string }>;
  onClose: () => void;
}) {
  const projectNameMap = new Map(projects.map((p) => [p.id, p.name]));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-lg)",
          width: "100%",
          maxWidth: "640px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-default)",
            flexShrink: 0,
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
              Planning View
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0" }}>
              Next 7 days — all tasks by project
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "none",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              transition: "background .15s ease, color .15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-muted)"; e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
            aria-label="Close planning view"
          >
            <X style={{ width: "18px", height: "18px" }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {tasksByProject.size === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
              <CheckCircle2 style={{ width: "32px", height: "32px", margin: "0 auto 12px", opacity: 0.4 }} />
              <p style={{ fontSize: "14px" }}>No upcoming tasks — you&apos;re all clear!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {Array.from(tasksByProject.entries()).map(([projectId, tasks]) => (
                <div key={projectId}>
                  {/* Project header */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      {projectNameMap.get(projectId) || tasks[0]?.projectName || "Unknown"}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      ({tasks.length} task{tasks.length !== 1 ? "s" : ""})
                    </span>
                  </div>

                  {/* Task list */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {tasks
                      .sort((a, b) => {
                        if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                        if (a.dueDate) return -1;
                        if (b.dueDate) return 1;
                        return 0;
                      })
                      .map((task) => (
                        <Link
                          key={task.id}
                          href={`/graph/${task.projectId}`}
                          style={{ textDecoration: "none" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              padding: "10px 12px",
                              borderRadius: "var(--radius-sm)",
                              borderLeft: `3px solid ${getStatusColor(task.status)}`,
                              transition: "background .15s ease",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-muted)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                          >
                            {/* Status dot */}
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                background: getStatusDotBg(task.status),
                                flexShrink: 0,
                              }}
                            >
                              <span
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "50%",
                                  background: getStatusColor(task.status),
                                }}
                              />
                            </span>

                            {/* Title */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {task.title}
                              </div>
                              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                                {getStatusLabel(task.status)}
                              </div>
                            </div>

                            {/* Date + overdue badge */}
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                              {task.daysOverdue && task.daysOverdue > 0 ? (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "10px", fontWeight: 600, color: "#ef4444", background: "rgba(239,68,68,0.08)", padding: "2px 7px", borderRadius: "999px" }}>
                                  <AlertTriangle style={{ width: "10px", height: "10px" }} />
                                  {task.daysOverdue}d late
                                </span>
                              ) : (
                                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                  {formatDate(task.dueDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
