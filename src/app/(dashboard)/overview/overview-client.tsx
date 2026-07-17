"use client";

import { useState } from "react";
import { cn, getStatusColor, getStatusLabel } from "@/lib/utils";
import { ClipboardList, CheckCircle2, Clock, AlertCircle, Sparkles } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  assignees: Array<{ id: string; name: string | null; email: string }>;
}

interface ProjectData {
  id: string;
  name: string;
  members: Array<{ id: string; role: string; user: { id: string; name: string | null; email: string; imageUrl: string | null } }>;
  tasks: Task[];
}

export function OverviewClient({ projects }: { projects: ProjectData[] }) {
  const [selectedId, setSelectedId] = useState(projects[0]?.id || "");
  const project = projects.find((p) => p.id === selectedId);

  if (projects.length === 0) {
    return (
      <div className="card p-12 text-center">
        <ClipboardList className="h-10 w-10 text-dim mx-auto mb-3" />
        <p className="text-sm font-medium text-heading">No projects to overview</p>
        <p className="text-xs text-body mt-1">You need to be a Head or Co-Head of a project to see its overview.</p>
      </div>
    );
  }

  const tasks = project?.tasks || [];
  const totalTasks = tasks.length;
  const completed = tasks.filter((t) => t.status === "COMPLETE").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const blocked = tasks.filter((t) => t.status === "BLOCKED").length;
  const now = new Date();
  const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "COMPLETE");

  // Per-member breakdown
  const memberStats = (project?.members || []).map((m) => {
    const memberTasks = tasks.filter((t) => t.assignees.some((a) => a.id === m.user.id));
    const memberDone = memberTasks.filter((t) => t.status === "COMPLETE").length;
    return {
      ...m,
      totalTasks: memberTasks.length,
      completedTasks: memberDone,
      inProgress: memberTasks.filter((t) => t.status === "IN_PROGRESS").length,
    };
  });

  return (
    <div className="space-y-6">
      {/* Project selector */}
      <div className="flex flex-wrap gap-2">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            className={cn(
              "rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors",
              selectedId === p.id
                ? "bg-[var(--accent)] text-[var(--on-accent)] shadow-sm"
                : "border border-themed-subtle text-body hover:border-[var(--violet-300)] hover:bg-hover hover:accent-color"
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Summary stats - quiet, border-only tier; the table below is the page's one focal card */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="panel-quiet p-4 hover-lift">
          <div className="flex items-center gap-2 mb-1.5">
            <ClipboardList className="h-4 w-4 accent-color" />
            <span className="text-eyebrow">Total</span>
          </div>
          <p className="text-[24px] text-stat">{totalTasks}</p>
        </div>
        <div className="panel-quiet p-4 hover-lift">
          <div className="flex items-center gap-2 mb-1.5">
            <CheckCircle2 className="h-4 w-4 accent-color" />
            <span className="text-eyebrow">Done</span>
          </div>
          <p className="text-[24px] text-stat">{completed}</p>
        </div>
        <div className="panel-quiet p-4 hover-lift">
          <div className="flex items-center gap-2 mb-1.5">
            <Clock className="h-4 w-4 accent-color" />
            <span className="text-eyebrow">Active</span>
          </div>
          <p className="text-[24px] text-stat">{inProgress}</p>
        </div>
        <div className="panel-quiet p-4 hover-lift">
          <div className="flex items-center gap-2 mb-1.5">
            <AlertCircle className="h-4 w-4 text-[var(--danger)]" />
            <span className="text-eyebrow">Blocked</span>
          </div>
          <p className="text-[24px] text-stat">{blocked}</p>
        </div>
      </div>

      {/* AI Insight - one-line contextual tip */}
      {totalTasks > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderRadius: "var(--radius-sm)", border: "1px solid var(--border-default)", backgroundColor: "var(--bg-elevated)" }}
        >
          <span className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-bold" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
            <Sparkles className="h-3 w-3" />
            AI
          </span>
          <span className="text-[13px] text-[var(--text-secondary)]">
            {overdue.length > 0
              ? <><b className="text-[var(--text-primary)]">{overdue[0].title}</b> is overdue{overdue.length > 1 ? ` - ${overdue.length - 1} more also late` : ""}. Clear blockers first.</>
              : blocked > 0
              ? <><b className="text-[var(--text-primary)]">{blocked} task{blocked > 1 ? "s" : ""}</b> blocked - might be worth a check-in.</>
              : inProgress > 0
              ? <>All on track. <b className="text-[var(--text-primary)]">{inProgress}</b> task{inProgress > 1 ? "s" : ""} actively in progress.</>
              : <>Project is clear - time to assign next steps.</>
            }
          </span>
        </div>
      )}

      {/* Progress - no container at all, just lives on the background */}
      {totalTasks > 0 && (
        <div className="px-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-medium text-heading">Overall Progress</span>
            <span className="text-[13px] font-semibold accent-color">{Math.round((completed / totalTasks) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-hover">
            <div className="h-1.5 rounded-full bg-[var(--accent)] transition-[width]" style={{ width: `${(completed / totalTasks) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Team member progress */}
      <div className="panel-quiet p-5">
        <h3 className="text-card-title mb-4">Team Progress</h3>
        <div className="space-y-3">
          {memberStats.map((m) => (
            <div key={m.id} className="flex items-center gap-3 py-2 border-b border-themed-subtle last:border-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full accent-bg text-xs font-semibold accent-color flex-shrink-0">
                {(m.user.name || m.user.email).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-item-title truncate">{m.user.name || m.user.email}</p>
                <p className="text-meta">{m.role} · {m.completedTasks}/{m.totalTasks} done</p>
              </div>
              <div className="w-20">
                <div className="h-1.5 rounded-full bg-hover">
                  <div className="h-1.5 rounded-full bg-[var(--accent)]" style={{ width: `${m.totalTasks > 0 ? (m.completedTasks / m.totalTasks) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          ))}
          {memberStats.length === 0 && <p className="text-[13px] text-dim text-center py-4">No team members</p>}
        </div>
      </div>

      {/* Task list - the one focal, level-2 card on this page */}
      <div className="card p-5">
        <h3 className="text-card-title mb-4">All Tasks</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-themed-subtle">
                <th className="pb-2 pr-4 font-medium text-body">Task</th>
                <th className="pb-2 pr-4 font-medium text-body">Assigned To</th>
                <th className="pb-2 pr-4 font-medium text-body">Status</th>
                <th className="pb-2 font-medium text-body">Due</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== "COMPLETE";
                return (
                  <tr key={task.id} className="border-b border-themed-subtle transition-colors hover:bg-hover">
                    <td className="py-2.5 pr-4 text-item-title">{task.title}</td>
                    <td className="py-2.5 pr-4 text-body">
                      {task.assignees.length > 0
                        ? task.assignees.map((a) => a.name || a.email.split("@")[0]).join(", ")
                        : <span className="text-dim">Unassigned</span>
                      }
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", getStatusColor(task.status))}>
                        {getStatusLabel(task.status)}
                      </span>
                    </td>
                    <td className={cn("py-2.5 text-[12px]", isOverdue ? "font-medium text-[var(--danger)]" : "text-body")}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {tasks.length === 0 && <p className="py-6 text-center text-[13px] text-dim">No tasks in this project</p>}
        </div>
      </div>

      {/* Overdue alerts - danger-tinted panel (solid fill), matching the treatment used on Analytics */}
      {overdue.length > 0 && (
        <div className="p-5" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--danger-soft)', backgroundColor: 'var(--danger-soft)' }}>
          <h3 className="text-card-title mb-3 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-[var(--danger)]" /> Overdue Tasks ({overdue.length})
          </h3>
          <div className="space-y-2">
            {overdue.map((t) => (
              <div key={t.id} className="flex items-center justify-between text-[13px]">
                <span className="text-item-title">{t.title}</span>
                <span className="text-[11px] text-[var(--danger)]">Due {new Date(t.dueDate!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
