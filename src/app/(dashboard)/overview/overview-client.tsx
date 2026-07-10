"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ClipboardList, Users, CheckCircle2, Clock, AlertCircle } from "lucide-react";

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

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  NOT_STARTED: { label: "Not Started", color: "text-body", bg: "bg-hover" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-700", bg: "bg-blue-50" },
  BLOCKED: { label: "Blocked", color: "text-red-700", bg: "bg-red-50" },
  AWAITING_APPROVAL: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50" },
  REJECTED: { label: "Rejected", color: "text-orange-700", bg: "bg-orange-50" },
  COMPLETE: { label: "Done", color: "text-emerald-700", bg: "bg-emerald-50" },
};

export function OverviewClient({ projects }: { projects: ProjectData[] }) {
  const [selectedId, setSelectedId] = useState(projects[0]?.id || "");
  const project = projects.find((p) => p.id === selectedId);

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-themed-subtle bg-card p-12 text-center">
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
              "rounded-full px-4 py-1.5 text-[13px] font-medium transition-all",
              selectedId === p.id
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-card border border-themed-subtle text-body hover:border-brand-300 hover:accent-color"
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-themed-subtle bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="h-4 w-4 accent-color" />
            <span className="text-[11px] font-semibold text-dim uppercase">Total</span>
          </div>
          <p className="text-[24px] font-bold text-heading">{totalTasks}</p>
        </div>
        <div className="rounded-xl border border-themed-subtle bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-[11px] font-semibold text-dim uppercase">Done</span>
          </div>
          <p className="text-[24px] font-bold text-heading">{completed}</p>
        </div>
        <div className="rounded-xl border border-themed-subtle bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-[11px] font-semibold text-dim uppercase">Active</span>
          </div>
          <p className="text-[24px] font-bold text-heading">{inProgress}</p>
        </div>
        <div className="rounded-xl border border-themed-subtle bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-[11px] font-semibold text-dim uppercase">Blocked</span>
          </div>
          <p className="text-[24px] font-bold text-heading">{blocked}</p>
        </div>
      </div>

      {/* Progress bar */}
      {totalTasks > 0 && (
        <div className="rounded-xl border border-themed-subtle bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-medium text-heading">Overall Progress</span>
            <span className="text-[13px] font-semibold accent-color">{Math.round((completed / totalTasks) * 100)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-hover">
            <div className="h-2 rounded-full bg-brand-500 transition-all" style={{ width: `${(completed / totalTasks) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Team member progress */}
      <div className="rounded-xl border border-themed-subtle bg-card p-5">
        <h3 className="text-[14px] font-semibold text-heading mb-4">Team Progress</h3>
        <div className="space-y-3">
          {memberStats.map((m) => (
            <div key={m.id} className="flex items-center gap-3 py-2 border-b border-themed-subtle last:border-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full accent-bg text-xs font-semibold accent-color flex-shrink-0">
                {(m.user.name || m.user.email).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-heading truncate">{m.user.name || m.user.email}</p>
                <p className="text-[11px] text-dim">{m.role} · {m.completedTasks}/{m.totalTasks} done</p>
              </div>
              <div className="w-20">
                <div className="h-1.5 rounded-full bg-hover">
                  <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${m.totalTasks > 0 ? (m.completedTasks / m.totalTasks) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          ))}
          {memberStats.length === 0 && <p className="text-[13px] text-dim text-center py-4">No team members</p>}
        </div>
      </div>

      {/* Task list */}
      <div className="rounded-xl border border-themed-subtle bg-card p-5">
        <h3 className="text-[14px] font-semibold text-heading mb-4">All Tasks</h3>
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
                const status = STATUS_MAP[task.status] || STATUS_MAP.NOT_STARTED;
                const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== "COMPLETE";
                return (
                  <tr key={task.id} className="border-b border-themed-subtle hover:bg-hover">
                    <td className="py-2.5 pr-4 font-medium text-heading">{task.title}</td>
                    <td className="py-2.5 pr-4 text-body">
                      {task.assignees.length > 0
                        ? task.assignees.map((a) => a.name || a.email.split("@")[0]).join(", ")
                        : <span className="text-dim">Unassigned</span>
                      }
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", status.bg, status.color)}>
                        {status.label}
                      </span>
                    </td>
                    <td className={cn("py-2.5 text-[12px]", isOverdue ? "text-red-600 font-medium" : "text-body")}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {tasks.length === 0 && <p className="py-6 text-center text-[13px] text-dim">No tasks in this project</p>}
        </div>
      </div>

      {/* Overdue alerts */}
      {overdue.length > 0 && (
        <div className="rounded-xl border border-red-100 bg-red-50/50 p-5">
          <h3 className="text-[14px] font-semibold text-red-700 mb-3">⚠ Overdue Tasks ({overdue.length})</h3>
          <div className="space-y-2">
            {overdue.map((t) => (
              <div key={t.id} className="flex items-center justify-between text-[13px]">
                <span className="text-red-800 font-medium">{t.title}</span>
                <span className="text-red-600 text-[11px]">Due {new Date(t.dueDate!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
