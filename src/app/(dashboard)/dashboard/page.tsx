import { getProjects } from "@/actions/project-actions";
import { ProjectGrid } from "@/components/project-grid";
import { CreateProjectButton } from "@/components/create-project-button";
import { EmptyState } from "@/components/ui/empty-state";
import { LayoutDashboard, FolderOpen, UsersRound, CheckCircle2, Clock, AlertTriangle, CalendarDays, Users } from "lucide-react";
import { getTeams } from "@/actions/team-group-actions";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();
  const projects = await getProjects();
  const teams = await getTeams();

  const totalTasks = projects.reduce((acc, p) => acc + p.totalTasks, 0);
  const completedTasks = projects.reduce((acc, p) => acc + p.completedTasks, 0);
  const totalMembers = projects.reduce((acc, p) => acc + p.memberCount, 0);
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const inProgressTasks = totalTasks - completedTasks;

  // Fetch upcoming deadlines (next 7 days)
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingTasks = await prisma.taskNode.findMany({
    where: {
      dueDate: { gte: now, lte: sevenDaysFromNow },
      status: { not: "COMPLETE" },
      graph: { project: { members: { some: { userId: user.id } } } },
    },
    include: {
      assignments: { include: { user: { select: { id: true, name: true, email: true } } } },
      graph: { include: { project: { select: { id: true, name: true } } } },
    },
    orderBy: { dueDate: "asc" },
    take: 5,
  });

  // Fetch overdue tasks
  const overdueTasks = await prisma.taskNode.findMany({
    where: {
      dueDate: { lt: now },
      status: { not: "COMPLETE" },
      graph: { project: { members: { some: { userId: user.id } } } },
    },
    include: {
      graph: { include: { project: { select: { id: true, name: true } } } },
    },
    take: 5,
  });

  // Fetch my assigned tasks (in progress or not started)
  const myTasks = await prisma.taskNode.findMany({
    where: {
      assignments: { some: { userId: user.id } },
      status: { in: ["NOT_STARTED", "IN_PROGRESS", "BLOCKED"] },
    },
    include: {
      graph: { include: { project: { select: { id: true, name: true } } } },
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  // Projects needing attention (have overdue or blocked tasks)
  const projectsWithIssues = projects.filter((p) => {
    return p.totalTasks > 0 && p.completedTasks < p.totalTasks;
  });

  // Recently completed tasks (team activity)
  const recentCompletions = await prisma.taskNode.findMany({
    where: {
      status: "COMPLETE",
      graph: { project: { members: { some: { userId: user.id } } } },
      updatedAt: { gte: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
    },
    include: {
      assignments: { include: { user: { select: { id: true, name: true, email: true } } } },
      graph: { include: { project: { select: { name: true } } } },
    },
    orderBy: { updatedAt: "desc" },
    take: 6,
  });

  const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
    NOT_STARTED: { label: "To Do", color: "text-[#6B7280]", bg: "bg-surface-100" },
    IN_PROGRESS: { label: "Active", color: "text-blue-700", bg: "bg-blue-50" },
    BLOCKED: { label: "Blocked", color: "text-red-700", bg: "bg-red-50" },
    AWAITING_APPROVAL: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50" },
  };

  return (
    <div className="mx-auto max-w-6xl">
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-[#1A1A1A]">Dashboard</h1>
          <p className="mt-0.5 text-[13px] text-[#6B7280]">Your workspace at a glance</p>
        </div>
        <CreateProjectButton />
      </div>

      {/* Stat cards - UNCHANGED */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-surface-200/60 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <FolderOpen className="h-4 w-4 text-brand-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">Projects</span>
          </div>
          <p className="text-[28px] font-bold text-[#1A1A1A]">{projects.length}</p>
        </div>
        <div className="rounded-2xl border border-surface-200/60 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">Completed</span>
          </div>
          <p className="text-[28px] font-bold text-[#1A1A1A]">{completedTasks}</p>
          <p className="text-[11px] text-emerald-600 mt-0.5">of {totalTasks} tasks</p>
        </div>
        <div className="rounded-2xl border border-surface-200/60 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">In Progress</span>
          </div>
          <p className="text-[28px] font-bold text-[#1A1A1A]">{inProgressTasks}</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-surface-100">
            <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
        <div className="rounded-2xl border border-surface-200/60 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <UsersRound className="h-4 w-4 text-brand-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">Teams</span>
          </div>
          <p className="text-[28px] font-bold text-[#1A1A1A]">{teams.length}</p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">{totalMembers} members</p>
        </div>
      </div>

      {/* Two-column layout for dashboard panels */}
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* My Assigned Tasks */}
        <div className="rounded-2xl border border-surface-200/60 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold text-[#1A1A1A]">My Tasks</h3>
            <Link href="/my-tasks" className="text-[12px] text-brand-600 hover:text-brand-700 font-medium">View all</Link>
          </div>
          {myTasks.length === 0 ? (
            <p className="text-[13px] text-[#9CA3AF] py-4 text-center">No active tasks assigned to you</p>
          ) : (
            <div className="space-y-2">
              {myTasks.map((task) => {
                const style = STATUS_STYLES[task.status] || STATUS_STYLES.NOT_STARTED;
                return (
                  <Link key={task.id} href={`/graph/${task.graph.project.id}?nodeId=${task.id}`} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-surface-50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-[#1A1A1A] truncate">{task.title}</p>
                      <p className="text-[11px] text-[#9CA3AF]">{task.graph.project.name}</p>
                    </div>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium ml-2 flex-shrink-0", style.bg, style.color)}>{style.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="rounded-2xl border border-surface-200/60 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold text-[#1A1A1A]">Upcoming Deadlines</h3>
            <Link href="/calendar" className="text-[12px] text-brand-600 hover:text-brand-700 font-medium">Calendar</Link>
          </div>
          {upcomingTasks.length === 0 && overdueTasks.length === 0 ? (
            <p className="text-[13px] text-[#9CA3AF] py-4 text-center">No upcoming deadlines</p>
          ) : (
            <div className="space-y-2">
              {overdueTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between rounded-lg bg-red-50/50 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-[#1A1A1A] truncate">{task.title}</p>
                    <p className="text-[11px] text-[#9CA3AF]">{task.graph.project.name}</p>
                  </div>
                  <span className="text-[10px] font-medium text-red-600 ml-2 flex-shrink-0">Overdue</span>
                </div>
              ))}
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between rounded-lg px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-[#1A1A1A] truncate">{task.title}</p>
                    <p className="text-[11px] text-[#9CA3AF]">{task.graph.project.name}</p>
                  </div>
                  <span className="text-[11px] text-[#6B7280] ml-2 flex-shrink-0">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity (team) */}
        <div className="rounded-2xl border border-surface-200/60 bg-white p-5 shadow-sm">
          <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-4">Recent Activity</h3>
          {recentCompletions.length === 0 ? (
            <p className="text-[13px] text-[#9CA3AF] py-4 text-center">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentCompletions.map((task) => {
                const assignee = task.assignments[0]?.user;
                return (
                  <div key={task.id} className="flex items-start gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700 flex-shrink-0">
                      {(assignee?.name || assignee?.email || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-[#1A1A1A]">
                        <span className="font-medium">{assignee?.name || assignee?.email?.split("@")[0] || "Someone"}</span>
                        {" completed "}
                        <span className="font-medium">{task.title}</span>
                      </p>
                      <p className="text-[10px] text-[#9CA3AF]">{task.graph.project.name} · {formatTimeAgo(task.updatedAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Projects Needing Attention */}
        <div className="rounded-2xl border border-surface-200/60 bg-white p-5 shadow-sm">
          <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-4">Projects Status</h3>
          {projects.length === 0 ? (
            <p className="text-[13px] text-[#9CA3AF] py-4 text-center">No projects yet</p>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map((project) => {
                const pct = project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0;
                return (
                  <Link key={project.id} href={`/graph/${project.id}`} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-surface-50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-[#1A1A1A] truncate">{project.name}</p>
                      <p className="text-[11px] text-[#9CA3AF]">{project.completedTasks}/{project.totalTasks} tasks</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="h-1.5 w-16 rounded-full bg-surface-100">
                        <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] font-medium text-[#6B7280] w-8 text-right">{pct}%</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Team Activity - who's been active */}
      {recentCompletions.length > 0 && (
        <div className="mb-8 rounded-2xl border border-surface-200/60 bg-white p-5 shadow-sm">
          <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-3">Active Team Members</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {(() => {
              const members = new Map<string, { id: string; name: string | null; email: string }>();
              recentCompletions.forEach((t) => t.assignments.forEach((a) => { if (!members.has(a.user.id)) members.set(a.user.id, a.user); }));
              return Array.from(members.values()).slice(0, 8).map((member) => (
                <div key={member.id} className="flex items-center gap-2 rounded-full border border-surface-200/60 bg-surface-50 px-3 py-1.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-700">
                    {(member.name || member.email).charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[12px] font-medium text-[#1A1A1A]">{member.name || member.email.split("@")[0]}</span>
                  <div className="h-2 w-2 rounded-full bg-emerald-400" title="Recently active" />
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* Projects section */}
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Projects</h2>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<LayoutDashboard className="h-8 w-8" />}
          title="No projects yet"
          description="Create your first project to start organizing tasks as dependency graphs."
          action={<CreateProjectButton />}
        />
      ) : (
        <ProjectGrid projects={projects} />
      )}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
