"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, AlertTriangle, Users } from "lucide-react";
import { cn, getStatusDotColor } from "@/lib/utils";

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

interface WorkloadMember {
  id: string;
  name: string;
  initials: string;
  notStarted: number;
  inProgress: number;
  blocked: number;
  awaitingApproval: number;
  total: number;
}

interface DashboardClientProps {
  projects: Array<{ id: string; name: string; totalTasks: number; completedTasks: number; memberCount: number }>;
  needsAttention: TaskItem[];
  dueToday: TaskItem[];
  dueThisWeek: TaskItem[];
  dueLater: TaskItem[];
  workload: WorkloadMember[];
  workloadByProject: Record<string, WorkloadMember[]>;
}

function projectColor(name: string): string {
  const colors = ["#2563eb", "#059669", "#d97706", "#db2777", "#7c2d12", "#4338ca", "#0891b2", "#65a30d"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function DashboardClient({
  projects,
  needsAttention,
  dueToday,
  dueThisWeek,
  dueLater,
  workload,
  workloadByProject,
}: DashboardClientProps) {
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [workloadProject, setWorkloadProject] = useState<string | null>(null);
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>("all");
  const [openSection, setOpenSection] = useState<"today" | "week" | "later" | null>(() => {
    if (dueToday.length > 0) return "today";
    if (dueThisWeek.length > 0) return "week";
    if (dueLater.length > 0) return "later";
    return null;
  });

  function filterByProject<T extends { projectId: string }>(items: T[]): T[] {
    if (!activeProject) return items;
    return items.filter((i) => i.projectId === activeProject);
  }

  const filteredAttention = filterByProject(needsAttention);
  const filteredToday = filterByProject(dueToday);
  const filteredWeek = filterByProject(dueThisWeek);
  const filteredLater = filterByProject(dueLater);
  const filteredWorkload = workloadProject
    ? workloadByProject[workloadProject] || []
    : workload;

  return (
    <div>
      {/* ─── Filter Chips Row ─── */}
      {projects.length > 1 && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "32px" }}>
          <button
            onClick={() => setActiveProject(null)}
            style={{
              padding: "8px 15px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 500,
              border: "1px solid",
              borderColor: !activeProject ? "var(--accent)" : "var(--border-default)",
              background: !activeProject ? "var(--accent)" : "transparent",
              color: !activeProject ? "#fff" : "var(--text-secondary)",
              cursor: "pointer",
              transition: "all 150ms ease-out",
            }}
          >
            All Projects
          </button>
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveProject(activeProject === p.id ? null : p.id)}
              style={{
                padding: "8px 15px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: 500,
                border: "1px solid",
                borderColor: activeProject === p.id ? "var(--accent)" : "var(--border-default)",
                background: activeProject === p.id ? "var(--accent)" : "transparent",
                color: activeProject === p.id ? "#fff" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 150ms ease-out",
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* ─── Your Projects — Horizontal Scroll ─── */}
      {projects.length > 0 && (
        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "14.5px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em", marginBottom: "16px" }}>
            Your Projects
          </h2>
          {/* Status filter chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
            {(["all", "not_started", "ongoing", "draft"] as const).map((status) => {
              const label = { all: "All", not_started: "Not started", ongoing: "Ongoing", draft: "Draft" }[status];
              return (
                <button
                  key={status}
                  onClick={() => setProjectStatusFilter(status)}
                  style={{
                    padding: "8px 15px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: 500,
                    border: "1px solid",
                    borderColor: projectStatusFilter === status ? "transparent" : "var(--border-default)",
                    background: projectStatusFilter === status ? "var(--accent)" : "transparent",
                    color: projectStatusFilter === status ? "#fff" : "var(--text-secondary)",
                    cursor: "pointer",
                    transition: "all 150ms ease-out",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div
            style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}
            className="scrollbar-hide"
          >
            {projects
              .filter((project) => {
                if (projectStatusFilter === "all") return true;
                const progress = project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0;
                if (projectStatusFilter === "not_started") return project.totalTasks > 0 && progress === 0;
                if (projectStatusFilter === "ongoing") return progress > 0 && progress < 100;
                if (projectStatusFilter === "draft") return project.totalTasks === 0;
                return true;
              })
              .map((project) => {
              const progress = project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0;
              const color = projectColor(project.name);
              return (
                <Link
                  key={project.id}
                  href={`/graph/${project.id}`}
                  className="focus-card"
                  style={{
                    minWidth: "270px",
                    padding: "26px",
                    borderRadius: "var(--radius-lg)",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-default)",
                    boxShadow: "var(--shadow-sm)",
                    transition: "transform 200ms ease-out, box-shadow 200ms ease-out",
                    textDecoration: "none",
                    display: "block",
                    flexShrink: 0,
                  }}
                >
                  {/* Dot + avatar row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "999px", background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {project.memberCount} member{project.memberCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {/* Name */}
                  <div style={{ fontSize: "16.5px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em", marginBottom: "6px" }}>
                    {project.name}
                  </div>
                  {/* Meta */}
                  <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "14px" }}>
                    {project.totalTasks} task{project.totalTasks !== 1 ? "s" : ""} · {project.completedTasks} done
                  </div>
                  {/* Progress track — 5px tall */}
                  <div style={{ height: "5px", borderRadius: "999px", background: "var(--border-default)", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        borderRadius: "999px",
                        background: color,
                        width: `${progress}%`,
                        transition: "width 500ms ease-out",
                      }}
                    />
                  </div>
                  {/* Status pill */}
                  <div style={{ marginTop: "12px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        borderRadius: "999px",
                        padding: "3px 10px",
                        fontSize: "11px",
                        fontWeight: 500,
                        background: progress >= 100 ? "var(--accent-soft)" : "var(--bg-muted)",
                        color: progress >= 100 ? "var(--accent)" : "var(--text-muted)",
                      }}
                    >
                      {progress >= 100 ? "Complete" : `${progress}% done`}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── Second Row: 2-col grid ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }} className="max-sm:!grid-cols-1">
        {/* Left: Needs Attention */}
        <div
          style={{
            borderRadius: "var(--radius-xl)",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-sm)",
            padding: "26px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
            <AlertTriangle style={{ width: "14px", height: "14px", color: "var(--danger)" }} />
            <h3 style={{ fontSize: "14.5px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              Needs Attention
            </h3>
            {filteredAttention.length > 0 && (
              <span
                style={{
                  borderRadius: "999px",
                  padding: "2px 8px",
                  fontSize: "10.5px",
                  fontWeight: 700,
                  background: "var(--danger-soft)",
                  color: "var(--danger)",
                }}
              >
                {filteredAttention.length}
              </span>
            )}
          </div>
          {filteredAttention.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Nothing urgent — nice work!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {filteredAttention.slice(0, 5).map((task) => (
                <Link
                  key={task.id}
                  href={`/graph/${task.projectId}?nodeId=${task.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    borderLeft: "3px solid var(--danger)",
                    borderRadius: "0 8px 8px 0",
                    textDecoration: "none",
                    transition: "background 150ms",
                  }}
                  className="hover:bg-[var(--bg-muted)]"
                >
                  <span style={{ flex: 1, fontSize: "13.5px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {task.title}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", flexShrink: 0 }}>
                    {task.daysOverdue && task.daysOverdue > 0 ? `${task.daysOverdue}d overdue` : "blocked"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right: Team Workload (panel-outer-tinted with nested card) */}
        <div
          style={{
            borderRadius: "var(--radius-xl)",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-sm)",
            padding: "26px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Users style={{ width: "14px", height: "14px", color: "var(--text-muted)" }} />
              <h3 style={{ fontSize: "14.5px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                Team Workload
              </h3>
            </div>
            {projects.length > 1 && (
              <select
                value={workloadProject || ""}
                onChange={(e) => setWorkloadProject(e.target.value || null)}
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px 4px",
                }}
              >
                <option value="">All</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Nested card inside */}
          <div
            style={{
              background: "var(--bg-muted)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              padding: "16px",
            }}
          >
            {filteredWorkload.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No workload data</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredWorkload.slice(0, 5).map((member) => {
                  const maxBar = Math.max(...filteredWorkload.map((m) => m.total), 1);
                  const pct = (member.total / maxBar) * 100;
                  return (
                    <div key={member.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {/* 32px avatar circle */}
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "999px",
                          background: "var(--accent-soft)",
                          color: "var(--accent)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {member.initials}
                      </div>
                      {/* Name */}
                      <span style={{ width: "60px", fontSize: "12.5px", fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>
                        {member.name}
                      </span>
                      {/* 10px tall capsule track */}
                      <div style={{ flex: 1, height: "10px", borderRadius: "999px", background: "var(--border-default)", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            borderRadius: "999px",
                            background: "var(--accent)",
                            width: `${pct}%`,
                            transition: "width 500ms ease-out",
                          }}
                        />
                      </div>
                      {/* Task count */}
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", minWidth: "20px", textAlign: "right" }}>
                        {member.total}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Deadlines Panel ─── */}
      <div
        style={{
          borderRadius: "var(--radius-xl)",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          boxShadow: "var(--shadow-sm)",
          padding: "26px",
        }}
      >
        <CollapsibleSection
          title="Due Today"
          count={filteredToday.length}
          open={openSection === "today"}
          onToggle={() => setOpenSection((prev) => (prev === "today" ? null : "today"))}
        >
          {filteredToday.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text-muted)", padding: "8px 0 4px 28px" }}>Nothing due today</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", paddingLeft: "4px" }}>
              {filteredToday.map((task) => (
                <DeadlineTaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection
          title="This Week"
          count={filteredWeek.length}
          open={openSection === "week"}
          onToggle={() => setOpenSection((prev) => (prev === "week" ? null : "week"))}
        >
          {filteredWeek.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text-muted)", padding: "8px 0 4px 28px" }}>Nothing due this week</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", paddingLeft: "4px" }}>
              {filteredWeek.map((task) => (
                <DeadlineTaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection
          title="Later"
          count={filteredLater.length}
          open={openSection === "later"}
          onToggle={() => setOpenSection((prev) => (prev === "later" ? null : "later"))}
        >
          {filteredLater.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text-muted)", padding: "8px 0 4px 28px" }}>No upcoming tasks</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", paddingLeft: "4px" }}>
              {filteredLater.map((task) => (
                <DeadlineTaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </CollapsibleSection>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function DeadlineTaskRow({ task }: { task: TaskItem }) {
  return (
    <Link
      href={`/graph/${task.projectId}?nodeId=${task.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 10px",
        borderRadius: "8px",
        textDecoration: "none",
        transition: "background 150ms",
      }}
      className="hover:bg-[var(--bg-muted)]"
    >
      {/* Project tag pill */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          borderRadius: "999px",
          padding: "2px 8px",
          fontSize: "10px",
          fontWeight: 600,
          background: "var(--accent-soft)",
          color: "var(--accent)",
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        {task.projectName}
      </span>
      {/* Task name */}
      <span style={{ flex: 1, fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {task.title}
      </span>
      {/* Status dot */}
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "999px",
          background: getStatusDotColor(task.status),
          flexShrink: 0,
        }}
      />
      {/* Date */}
      {task.dueDate && (
        <span style={{ fontSize: "11px", color: "var(--text-muted)", flexShrink: 0 }}>
          {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      )}
    </Link>
  );
}

function CollapsibleSection({
  title,
  count,
  open,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ borderBottom: "1px solid var(--border-subtle)" }} className="last:border-b-0">
      <button
        onClick={onToggle}
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          gap: "8px",
          padding: "14px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          transition: "color 150ms",
        }}
      >
        {open ? (
          <ChevronDown style={{ width: "14px", height: "14px", color: "var(--text-muted)" }} />
        ) : (
          <ChevronRight style={{ width: "14px", height: "14px", color: "var(--text-muted)" }} />
        )}
        <span style={{ fontSize: "14.5px", fontWeight: 600, color: "var(--text-primary)" }}>
          {title}
        </span>
        {count > 0 && (
          <span
            style={{
              borderRadius: "999px",
              padding: "2px 8px",
              fontSize: "10.5px",
              fontWeight: 700,
              background: "var(--accent-soft)",
              color: "var(--accent)",
            }}
          >
            {count}
          </span>
        )}
      </button>
      {open && <div style={{ paddingBottom: "12px" }}>{children}</div>}
    </div>
  );
}
