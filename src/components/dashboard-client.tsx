"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, AlertTriangle, Users, Tag, X } from "lucide-react";
import { getStatusDotColor } from "@/lib/utils";
import { addLabel, removeLabel } from "@/actions/label-actions";
import { LABEL_COLORS } from "@/lib/constants";
import { toast } from "sonner";

interface Label {
  id: string;
  name: string;
  color: string;
}

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
  projects: Array<{ id: string; name: string; totalTasks: number; completedTasks: number; memberCount: number; labels: Label[] }>;
  needsAttention: TaskItem[];
  dueToday: TaskItem[];
  dueThisWeek: TaskItem[];
  dueLater: TaskItem[];
  workload: WorkloadMember[];
  workloadByProject: Record<string, WorkloadMember[]>;
}

function projectColor(name: string): string {
  const colors = ["#7c3aed", "#6366f1", "#8b5cf6", "#a855f7", "#9333ea", "#7e22ce", "#6d28d9", "#4f46e5"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ─── Label Picker Popover (inline on dashboard cards) ─────────────────────────
function LabelPickerPopover({
  projectId,
  labels,
  onLabelsChange,
  onClose,
}: {
  projectId: string;
  labels: Label[];
  onLabelsChange: (labels: Label[]) => void;
  onClose: () => void;
}) {
  const [newLabel, setNewLabel] = useState("");
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  async function handleAdd() {
    if (!newLabel.trim()) return;
    setLoading(true);
    const result = await addLabel(projectId, newLabel.trim(), selectedColor);
    if (result.error) toast.error(result.error);
    else if (result.label) {
      onLabelsChange([...labels, result.label]);
      setNewLabel("");
      toast.success("Label added!");
    }
    setLoading(false);
  }

  async function handleRemove(labelId: string) {
    await removeLabel(projectId, labelId);
    onLabelsChange(labels.filter((l) => l.id !== labelId));
  }

  return (
    <div
      ref={ref}
      onClick={(e) => e.preventDefault()}
      style={{
        position: "absolute",
        top: "100%",
        right: 0,
        zIndex: 50,
        marginTop: "4px",
        width: "260px",
        padding: "14px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-default)",
        backgroundColor: "var(--bg-elevated)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "10px" }}>Labels</p>
      {labels.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
          {labels.map((l) => (
            <span
              key={l.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                borderRadius: "999px",
                padding: "2px 8px",
                fontSize: "10px",
                fontWeight: 600,
                color: "#fff",
                backgroundColor: l.color,
              }}
            >
              {l.name}
              <button
                onClick={(e) => { e.preventDefault(); handleRemove(l.id); }}
                style={{ opacity: 0.8, cursor: "pointer", background: "none", border: "none", color: "#fff", padding: 0 }}
              >
                <X style={{ width: "10px", height: "10px" }} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
          placeholder="New label..."
          onClick={(e) => e.preventDefault()}
          style={{
            flex: 1,
            fontSize: "12px",
            padding: "6px 10px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-default)",
            background: "var(--bg-base)",
            color: "var(--text-primary)",
            outline: "none",
          }}
        />
        <button
          onClick={(e) => { e.preventDefault(); handleAdd(); }}
          disabled={loading || !newLabel.trim()}
          style={{
            fontSize: "11px",
            fontWeight: 600,
            padding: "6px 10px",
            borderRadius: "var(--radius-sm)",
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            cursor: loading ? "wait" : "pointer",
            opacity: !newLabel.trim() ? 0.5 : 1,
          }}
        >
          Add
        </button>
      </div>
      <div style={{ display: "flex", gap: "5px", marginBottom: "8px" }}>
        {LABEL_COLORS.map((c) => (
          <button
            key={c}
            onClick={(e) => { e.preventDefault(); setSelectedColor(c); }}
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "999px",
              backgroundColor: c,
              border: selectedColor === c ? "2px solid var(--text-primary)" : "2px solid transparent",
              cursor: "pointer",
              transition: "transform 150ms",
              transform: selectedColor === c ? "scale(1.15)" : "scale(1)",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
        {["Urgent", "In Progress", "Review", "Design", "Backend"].map((p) => (
          <button
            key={p}
            onClick={(e) => { e.preventDefault(); setNewLabel(p); }}
            style={{
              fontSize: "10px",
              padding: "3px 8px",
              borderRadius: "999px",
              border: "1px solid var(--border-default)",
              background: "transparent",
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function DashboardClient({
  projects: initialProjects,
  needsAttention,
  dueToday,
  dueThisWeek,
  dueLater,
  workload,
  workloadByProject,
}: DashboardClientProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [workloadProject, setWorkloadProject] = useState<string | null>(null);
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>("all");
  const [activeLabelFilters, setActiveLabelFilters] = useState<string[]>([]);
  const [openSection, setOpenSection] = useState<"today" | "week" | "later" | null>(() => {
    if (dueToday.length > 0) return "today";
    if (dueThisWeek.length > 0) return "week";
    if (dueLater.length > 0) return "later";
    return null;
  });

  // Collect all unique labels across projects
  const allLabels = Array.from(
    new Map(projects.flatMap((p) => p.labels).map((l) => [l.name, l])).values()
  );

  function toggleLabelFilter(labelName: string) {
    setActiveLabelFilters((prev) =>
      prev.includes(labelName) ? prev.filter((n) => n !== labelName) : [...prev, labelName]
    );
  }

  function clearLabelFilters() {
    setActiveLabelFilters([]);
  }

  function handleProjectLabelsChange(projectId: string, newLabels: Label[]) {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, labels: newLabels } : p))
    );
  }

  function filterByProject<T extends { projectId: string }>(items: T[]): T[] {
    if (!activeProject) return items;
    return items.filter((i) => i.projectId === activeProject);
  }

  // Filter projects by status AND labels
  const filteredProjects = projects
    .filter((project) => {
      if (projectStatusFilter === "all") return true;
      const progress = project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0;
      if (projectStatusFilter === "not_started") return project.totalTasks > 0 && progress === 0;
      if (projectStatusFilter === "ongoing") return progress > 0 && progress < 100;
      if (projectStatusFilter === "draft") return project.totalTasks === 0;
      return true;
    })
    .filter((project) => {
      if (activeLabelFilters.length === 0) return true;
      return project.labels.some((l) => activeLabelFilters.includes(l.name));
    });

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
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
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

          {/* Label filter bar */}
          {allLabels.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
              <Tag style={{ width: "13px", height: "13px", color: "var(--text-muted)" }} />
              {allLabels.map((l) => {
                const isActive = activeLabelFilters.includes(l.name);
                return (
                  <button
                    key={l.name}
                    onClick={() => toggleLabelFilter(l.name)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "999px",
                      fontSize: "11.5px",
                      fontWeight: 600,
                      border: "1px solid",
                      borderColor: isActive ? "transparent" : "var(--border-default)",
                      background: isActive ? l.color : "transparent",
                      color: isActive ? "#fff" : "var(--text-secondary)",
                      cursor: "pointer",
                      transition: "all 150ms ease-out",
                    }}
                  >
                    {l.name}
                  </button>
                );
              })}
              {activeLabelFilters.length > 0 && (
                <button
                  onClick={clearLabelFilters}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "4px 10px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: 500,
                    background: "var(--bg-muted)",
                    color: "var(--text-muted)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 150ms ease-out",
                  }}
                >
                  <X style={{ width: "10px", height: "10px" }} />
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Cards or empty state */}
          {filteredProjects.length === 0 ? (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                borderRadius: "var(--radius-lg)",
                border: "1px dashed var(--border-default)",
                background: "var(--bg-muted)",
              }}
            >
              <Tag style={{ width: "24px", height: "24px", color: "var(--text-muted)", margin: "0 auto 12px" }} />
              <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "8px" }}>
                No projects match this filter
              </p>
              <button
                onClick={() => { clearLabelFilters(); setProjectStatusFilter("all"); }}
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--accent)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              {/* Right gradient mask */}
              <div style={{ position: "absolute", right: 0, top: 0, bottom: "8px", width: "60px", background: "linear-gradient(to left, var(--bg-base), transparent)", zIndex: 2, pointerEvents: "none" }} />

              <div
                style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px", scrollSnapType: "x mandatory", scrollPaddingLeft: "4px" }}
                className="scrollbar-hide"
              >
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onLabelsChange={(newLabels) => handleProjectLabelsChange(project.id, newLabels)}
                  />
                ))}
                {/* Spacer for peek effect */}
                <div style={{ minWidth: "40px", flexShrink: 0 }} />
              </div>
            </div>
          )}
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

        {/* Right: Team Workload */}
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
                      <span style={{ width: "60px", fontSize: "12.5px", fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>
                        {member.name}
                      </span>
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

// ─── Project Card with label chips and tag button ────────────────────────────
function ProjectCard({
  project,
  onLabelsChange,
}: {
  project: DashboardClientProps["projects"][number];
  onLabelsChange: (labels: Label[]) => void;
}) {
  const [labelPickerOpen, setLabelPickerOpen] = useState(false);
  const progress = project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0;
  const color = projectColor(project.name);

  return (
    <div
      style={{
        position: "relative",
        minWidth: "270px",
        maxWidth: "300px",
        scrollSnapAlign: "start",
        flexShrink: 0,
      }}
    >
      <Link
        href={`/graph/${project.id}`}
        className="focus-card"
        style={{
          padding: "26px",
          borderRadius: "var(--radius-lg)",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          boxShadow: "var(--shadow-sm)",
          transition: "transform 200ms ease-out, box-shadow 200ms ease-out",
          textDecoration: "none",
          display: "block",
        }}
      >
        {/* Dot + members row */}
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
        {/* Label chips */}
        {project.labels.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px" }}>
            {project.labels.map((l) => (
              <span
                key={l.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  borderRadius: "999px",
                  padding: "2px 8px",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#fff",
                  backgroundColor: l.color,
                }}
              >
                {l.name}
              </span>
            ))}
          </div>
        )}
        {/* Meta */}
        <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "14px" }}>
          {project.totalTasks} task{project.totalTasks !== 1 ? "s" : ""} · {project.completedTasks} done
        </div>
        {/* Progress track */}
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

      {/* Tag button — positioned at top-right of card */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLabelPickerOpen(!labelPickerOpen); }}
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          width: "28px",
          height: "28px",
          borderRadius: "var(--radius-sm)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: labelPickerOpen ? "var(--accent-soft)" : "transparent",
          border: "none",
          cursor: "pointer",
          color: labelPickerOpen ? "var(--accent)" : "var(--text-muted)",
          transition: "all 150ms ease-out",
          opacity: labelPickerOpen ? 1 : 0,
        }}
        className="group-hover:!opacity-100 hover:!opacity-100 hover:!bg-[var(--bg-muted)]"
        aria-label="Edit labels"
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
        onMouseLeave={(e) => { if (!labelPickerOpen) (e.currentTarget as HTMLButtonElement).style.opacity = "0"; }}
      >
        <Tag style={{ width: "14px", height: "14px" }} />
      </button>

      {/* Label picker popover */}
      {labelPickerOpen && (
        <LabelPickerPopover
          projectId={project.id}
          labels={project.labels}
          onLabelsChange={onLabelsChange}
          onClose={() => setLabelPickerOpen(false)}
        />
      )}
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
