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
  projects: Array<{ id: string; name: string }>;
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
  const [openSection, setOpenSection] = useState<'today' | 'week' | 'later' | null>(() => {
    if (dueToday.length > 0) return 'today';
    if (dueThisWeek.length > 0) return 'week';
    if (dueLater.length > 0) return 'later';
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

  const WORKLOAD_THRESHOLD = 8;

  return (
    <div className="space-y-10">
      {/* ─── Filter Chips ─── */}
      {projects.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveProject(null)}
            className={cn(
              "rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors duration-150",
              !activeProject
                ? "text-[var(--accent)] border border-[var(--glass-border)] bg-[var(--glass-bg)]"
                : "text-body hover:text-heading"
            )}
          >
            All Projects
          </button>
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveProject(activeProject === p.id ? null : p.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors duration-150",
                activeProject === p.id
                  ? "text-[var(--accent)] border border-[var(--glass-border)] bg-[var(--glass-bg)]"
                  : "text-body hover:text-heading"
              )}
            >
              <span className="inline-block h-2 w-2 rounded-full mr-1.5" style={{ backgroundColor: projectColor(p.name) }} />
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* ─── Needs Attention ─── */}
      {filteredAttention.length > 0 && (
        <section>
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-[var(--danger)]" />
            <h3 className="text-[13px] font-semibold text-heading">Needs Attention</h3>
            <span className="text-[11px] font-medium text-[var(--danger)]">{filteredAttention.length}</span>
          </div>
          <div>
            {filteredAttention.map((task) => (
              <TaskRow key={task.id} task={task} showOverdue />
            ))}
          </div>
        </section>
      )}

      {/* ─── Deadline Sections — no wrapping container ─── */}
      <section className="space-y-0">
        <CollapsibleSection
          title="Due Today"
          count={filteredToday.length}
          open={openSection === 'today'}
          onToggle={() => setOpenSection(prev => prev === 'today' ? null : 'today')}
        >
          {filteredToday.length === 0 ? (
            <p className="py-3 pl-6 text-[12px] text-dim">Nothing due today</p>
          ) : (
            <div>
              {filteredToday.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection
          title="This Week"
          count={filteredWeek.length}
          open={openSection === 'week'}
          onToggle={() => setOpenSection(prev => prev === 'week' ? null : 'week')}
        >
          {filteredWeek.length === 0 ? (
            <p className="py-3 pl-6 text-[12px] text-dim">Nothing due this week</p>
          ) : (
            <div>
              {filteredWeek.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection
          title="Later"
          count={filteredLater.length}
          open={openSection === 'later'}
          onToggle={() => setOpenSection(prev => prev === 'later' ? null : 'later')}
        >
          {filteredLater.length === 0 ? (
            <p className="py-3 pl-6 text-[12px] text-dim">No upcoming tasks</p>
          ) : (
            <div>
              {filteredLater.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </CollapsibleSection>
      </section>

      {/* ─── Team Workload — no wrapping box ─── */}
      {(filteredWorkload.length > 0 || workloadProject) && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-dim" />
              <h3 className="text-[13px] font-semibold text-heading">Team Workload</h3>
            </div>
            {projects.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setWorkloadProject(null)}
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors duration-150",
                    !workloadProject ? "text-[var(--accent)]" : "text-dim hover:text-body"
                  )}
                >
                  All
                </button>
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setWorkloadProject(workloadProject === p.id ? null : p.id)}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors duration-150",
                      workloadProject === p.id ? "text-[var(--accent)]" : "text-dim hover:text-body"
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
            <p className="py-3 text-[12px] text-dim">No workload data for this project</p>
          ) : (
            <>
              <div className="space-y-2.5">
                {filteredWorkload.map((member) => {
                  const maxBar = Math.max(...filteredWorkload.map((m) => m.total), 1);
                  const overloaded = member.total >= WORKLOAD_THRESHOLD;
                  return (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-semibold",
                        overloaded ? "bg-[var(--danger-soft)] text-[var(--danger)]" : "bg-[var(--accent-soft)] text-[var(--accent)]"
                      )}>
                        {member.initials}
                      </div>
                      <span className="w-16 sm:w-20 truncate text-[12px] font-medium text-heading">{member.name}</span>
                      {/* Bar directly on background — only the filled portion is colored */}
                      <div className="flex flex-1 items-center">
                        <div className="flex h-[6px] flex-1 overflow-hidden rounded-full bg-[var(--border-subtle)]">
                          {member.notStarted > 0 && (
                            <div
                              className="h-full bg-[var(--accent)]"
                              style={{ width: `${(member.notStarted / maxBar) * 100}%`, opacity: 0.3 }}
                            />
                          )}
                          {member.awaitingApproval > 0 && (
                            <div
                              className="h-full bg-[var(--accent)]"
                              style={{ width: `${(member.awaitingApproval / maxBar) * 100}%`, opacity: 0.5 }}
                            />
                          )}
                          {member.inProgress > 0 && (
                            <div
                              className="h-full bg-[var(--accent)]"
                              style={{ width: `${(member.inProgress / maxBar) * 100}%`, opacity: 0.75 }}
                            />
                          )}
                          {member.blocked > 0 && (
                            <div
                              className="h-full bg-[var(--danger)]"
                              style={{ width: `${(member.blocked / maxBar) * 100}%` }}
                            />
                          )}
                        </div>
                      </div>
                      <span className={cn("text-[11px] font-medium w-5 text-right", overloaded ? "text-[var(--danger)]" : "text-dim")}>
                        {member.total}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-3 text-[9px] text-dim">
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" style={{ opacity: 0.3 }} />Not Started</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" style={{ opacity: 0.5 }} />Awaiting</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" style={{ opacity: 0.75 }} />In Progress</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--danger)]" />Blocked</span>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function TaskRow({ task, showOverdue }: { task: TaskItem; showOverdue?: boolean }) {
  return (
    <Link
      href={`/graph/${task.projectId}?nodeId=${task.id}`}
      className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-150 hover:bg-[var(--glass-bg)]"
    >
      <span
        className="h-2 w-2 flex-shrink-0 rounded-full"
        style={{ backgroundColor: getStatusDotColor(task.status) }}
      />
      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-heading group-hover:text-[var(--accent)] transition-colors">
        {task.title}
      </span>
      <span
        className="hidden flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold text-white sm:inline-block"
        style={{ backgroundColor: projectColor(task.projectName) }}
      >
        {task.projectName}
      </span>
      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[8px] font-semibold text-[var(--accent)]">
        {task.assigneeInitials}
      </div>
      {showOverdue && task.daysOverdue != null && task.daysOverdue > 0 && (
        <span className="flex-shrink-0 text-[10px] font-medium text-[var(--danger)]">{task.daysOverdue}d</span>
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
  children,
}: {
  title: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[var(--border-subtle)] last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 py-3 transition-colors duration-150 hover:text-[var(--accent)]"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5 text-dim" /> : <ChevronRight className="h-3.5 w-3.5 text-dim" />}
        <span className="text-[13px] font-semibold text-heading">{title}</span>
        {count > 0 && <span className="text-[11px] font-medium text-[var(--accent)]">{count}</span>}
      </button>
      {open && <div className="pb-2">{children}</div>}
    </div>
  );
}
