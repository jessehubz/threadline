"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, AlertTriangle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

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
  projects: Array<{ id: string; name: string }>;
  needsAttention: TaskItem[];
  dueToday: TaskItem[];
  dueThisWeek: TaskItem[];
  dueLater: TaskItem[];
  workload: WorkloadMember[];
  workloadByProject: Record<string, WorkloadMember[]>;
}

const STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: "#9ca3af",
  IN_PROGRESS: "#7c3aed",
  BLOCKED: "#ef4444",
  AWAITING_APPROVAL: "#f59e0b",
};

// Generate a deterministic color for a project name
function projectColor(name: string): string {
  const colors = ["#7c3aed", "#2563eb", "#059669", "#d97706", "#dc2626", "#7c2d12", "#4338ca", "#0891b2"];
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
  const [todayOpen, setTodayOpen] = useState(true);
  const [weekOpen, setWeekOpen] = useState(true);
  const [laterOpen, setLaterOpen] = useState(false);

  // Filter function
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

  const WORKLOAD_THRESHOLD = 8;

  return (
    <div className="space-y-6">
      {/* ─── Filter Chips ─── */}
      {projects.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveProject(null)}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-medium transition-all duration-150",
              !activeProject
                ? "bg-[var(--bg-base)] text-heading shadow-sm border border-themed-subtle"
                : "text-body hover:text-heading hover:bg-hover"
            )}
          >
            All Projects
          </button>
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveProject(activeProject === p.id ? null : p.id)}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-medium transition-all duration-150",
                activeProject === p.id
                  ? "bg-[var(--bg-base)] text-heading shadow-sm border border-themed-subtle"
                  : "text-body hover:text-heading hover:bg-hover"
              )}
            >
              <span className="inline-block h-2 w-2 rounded-full mr-2.5" style={{ backgroundColor: projectColor(p.name) }} />
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* ─── Needs Attention ─── */}
      {filteredAttention.length > 0 && (
        <div className="rounded-2xl border border-red-200/60 dark:border-red-500/20 bg-gradient-to-r from-red-50/40 to-transparent dark:from-red-500/5 dark:to-transparent p-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-[13px] font-semibold text-heading">Needs Attention</span>
            <span className="rounded-full bg-red-100 dark:bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:text-red-400">
              {filteredAttention.length}
            </span>
          </div>
          <div className="space-y-1">
            {filteredAttention.map((task) => (
              <TaskRow key={task.id} task={task} showOverdue />
            ))}
          </div>
        </div>
      )}

      {/* ─── Deadline Buckets ─── */}
      <div className="space-y-3">
        {/* Due Today */}
        <CollapsibleSection
          title="Due Today"
          count={filteredToday.length}
          open={todayOpen}
          onToggle={() => setTodayOpen(!todayOpen)}
          accentColor="text-red-600 dark:text-red-400"
        >
          {filteredToday.length === 0 ? (
            <p className="py-3 text-center text-[12px] text-dim">Nothing due today</p>
          ) : (
            <div className="space-y-1">
              {filteredToday.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </CollapsibleSection>

        {/* This Week */}
        <CollapsibleSection
          title="This Week"
          count={filteredWeek.length}
          open={weekOpen}
          onToggle={() => setWeekOpen(!weekOpen)}
          accentColor="text-amber-600 dark:text-amber-400"
        >
          {filteredWeek.length === 0 ? (
            <p className="py-3 text-center text-[12px] text-dim">Nothing due this week</p>
          ) : (
            <div className="space-y-1">
              {filteredWeek.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </CollapsibleSection>

        {/* Later */}
        <CollapsibleSection
          title="Later"
          count={filteredLater.length}
          open={laterOpen}
          onToggle={() => setLaterOpen(!laterOpen)}
          accentColor="text-body"
        >
          {filteredLater.length === 0 ? (
            <p className="py-3 text-center text-[12px] text-dim">No upcoming tasks</p>
          ) : (
            <div className="space-y-1">
              {filteredLater.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </CollapsibleSection>
      </div>

      {/* ─── Team Workload ─── */}
      {(filteredWorkload.length > 0 || workloadProject) && (
        <div className="rounded-2xl border border-themed-subtle bg-card p-5 shadow-themed">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-dim" />
              <h3 className="text-[14px] font-semibold text-heading">Team Workload</h3>
            </div>
            {/* Project filter for workload */}
            {projects.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setWorkloadProject(null)}
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-all duration-150",
                    !workloadProject
                      ? "bg-[var(--bg-muted)] text-heading border border-themed-subtle"
                      : "text-dim hover:text-body hover:bg-hover"
                  )}
                >
                  All
                </button>
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setWorkloadProject(workloadProject === p.id ? null : p.id)}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-all duration-150",
                      workloadProject === p.id
                        ? "bg-[var(--bg-muted)] text-heading border border-themed-subtle"
                        : "text-dim hover:text-body hover:bg-hover"
                    )}
                  >
                    <span className="inline-block h-1.5 w-1.5 rounded-full mr-1" style={{ backgroundColor: projectColor(p.name) }} />
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {filteredWorkload.length === 0 ? (
            <p className="py-3 text-center text-[12px] text-dim">No workload data for this project</p>
          ) : (
            <>
          <div className="space-y-3">
            {filteredWorkload.map((member) => {
              const maxBar = Math.max(...filteredWorkload.map((m) => m.total), 1);
              const overloaded = member.total >= WORKLOAD_THRESHOLD;
              return (
                <div key={member.id} className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className={cn(
                    "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                    overloaded ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" : "accent-bg accent-color"
                  )}>
                    {member.initials}
                  </div>
                  {/* Name */}
                  <span className="w-20 truncate text-[12px] font-medium text-heading">{member.name}</span>
                  {/* Stacked bar */}
                  <div className="flex flex-1 items-center gap-px">
                    <div className="flex h-5 flex-1 overflow-hidden rounded-full bg-[var(--bg-muted)]">
                      {member.inProgress > 0 && (
                        <div
                          className="h-full bg-brand-500 transition-all duration-300"
                          style={{ width: `${(member.inProgress / maxBar) * 100}%` }}
                          title={`In Progress: ${member.inProgress}`}
                        />
                      )}
                      {member.notStarted > 0 && (
                        <div
                          className="h-full bg-brand-300 transition-all duration-300"
                          style={{ width: `${(member.notStarted / maxBar) * 100}%` }}
                          title={`Not Started: ${member.notStarted}`}
                        />
                      )}
                      {member.blocked > 0 && (
                        <div
                          className="h-full bg-red-400 transition-all duration-300"
                          style={{ width: `${(member.blocked / maxBar) * 100}%` }}
                          title={`Blocked: ${member.blocked}`}
                        />
                      )}
                      {member.awaitingApproval > 0 && (
                        <div
                          className="h-full bg-amber-400 transition-all duration-300"
                          style={{ width: `${(member.awaitingApproval / maxBar) * 100}%` }}
                          title={`Awaiting: ${member.awaitingApproval}`}
                        />
                      )}
                    </div>
                  </div>
                  {/* Count + warning */}
                  <span className={cn("text-[11px] font-medium w-6 text-right", overloaded ? "text-red-600 dark:text-red-400" : "text-dim")}>
                    {member.total}
                  </span>
                  {overloaded && (
                    <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-3 text-[10px] text-dim">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-brand-500" />In Progress</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-brand-300" />Not Started</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" />Blocked</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" />Awaiting</span>
          </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function TaskRow({ task, showOverdue }: { task: TaskItem; showOverdue?: boolean }) {
  return (
    <Link
      href={`/graph/${task.projectId}?nodeId=${task.id}`}
      className="flex items-center gap-2 rounded-lg border-l-[3px] px-3 py-2 transition-colors hover:bg-hover"
      style={{ borderLeftColor: task.status === "BLOCKED" ? "#ef4444" : task.daysOverdue && task.daysOverdue > 0 ? "#ef4444" : "var(--border-default)" }}
    >
      {/* Status dot */}
      <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: STATUS_COLORS[task.status] || "#9ca3af" }} />
      {/* Task name */}
      <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-heading">{task.title}</span>
      {/* Project tag */}
      <span
        className="flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold text-white"
        style={{ backgroundColor: projectColor(task.projectName) }}
      >
        {task.projectName}
      </span>
      {/* Assignee avatar */}
      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full accent-bg text-[8px] font-semibold accent-color">
        {task.assigneeInitials}
      </div>
      {/* Due / Overdue indicator */}
      {showOverdue && task.daysOverdue != null && task.daysOverdue > 0 && (
        <span className="flex-shrink-0 text-[10px] font-medium text-red-600 dark:text-red-400">
          {task.daysOverdue}d
        </span>
      )}
      {!showOverdue && task.dueDate && (
        <span className="flex-shrink-0 text-[10px] text-dim">
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
  accentColor,
  children,
}: {
  title: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-themed-subtle bg-card shadow-themed overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-4 py-3 transition-colors hover:bg-hover"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5 text-dim" /> : <ChevronRight className="h-3.5 w-3.5 text-dim" />}
        <span className={cn("text-[13px] font-semibold", accentColor)}>{title}</span>
        <span className="rounded-full bg-hover px-2 py-0.5 text-[10px] font-medium text-dim">{count}</span>
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}
