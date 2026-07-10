import { getProjects } from "@/actions/project-actions";
import { ProjectGrid } from "@/components/project-grid";
import { CreateProjectButton } from "@/components/create-project-button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  LayoutDashboard,
  Target,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { DashboardClient } from "@/components/dashboard-client";

export default async function DashboardPage() {
  const user = await requireUser();
  const projects = await getProjects();

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Fetch ALL tasks across user's projects
  const allTasks = await prisma.taskNode.findMany({
    where: {
      graph: { project: { members: { some: { userId: user.id } } } },
    },
    include: {
      assignments: { include: { user: { select: { id: true, name: true, email: true, imageUrl: true } } } },
      graph: { include: { project: { select: { id: true, name: true } } } },
    },
  });

  // ─── KPIs ──────────────────────────────────────────────────────────────────
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.status === "COMPLETE").length;
  const blockedTasksCount = allTasks.filter((t) => t.status === "BLOCKED").length;
  const overdueCount = allTasks.filter((t) => t.dueDate && t.dueDate < now && t.status !== "COMPLETE").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Completions this week
  const completionsThisWeek = allTasks.filter(
    (t) => t.status === "COMPLETE" && t.updatedAt >= sevenDaysAgo
  ).length;
  const previousWeekCompletions = allTasks.filter(
    (t) => t.status === "COMPLETE" && t.updatedAt >= fourteenDaysAgo && t.updatedAt < sevenDaysAgo
  ).length;

  // Health score
  const overdueRatio = totalTasks > 0 ? overdueCount / totalTasks : 0;
  const blockedRatio = totalTasks > 0 ? blockedTasksCount / totalTasks : 0;
  const velocityFactor = previousWeekCompletions > 0
    ? Math.min(completionsThisWeek / previousWeekCompletions, 2) / 2
    : completionsThisWeek > 0 ? 1 : 0;
  const rawHealthScore =
    completionRate * 0.4 +
    (1 - overdueRatio) * 100 * 0.3 +
    (1 - blockedRatio) * 100 * 0.2 +
    velocityFactor * 100 * 0.1;
  const healthScore = Math.round(Math.max(0, Math.min(100, rawHealthScore)));
  const healthLabel = healthScore >= 80 ? "On Track" : healthScore >= 50 ? "Needs Attention" : "At Risk";
  const healthLabelColor = healthScore >= 80 ? "text-emerald-600" : healthScore >= 50 ? "text-amber-600" : "text-red-600";

  // ─── Greeting ──────────────────────────────────────────────────────────────
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user.name?.split(" ")[0] || "there";

  // ─── Task items for DashboardClient ────────────────────────────────────────
  function toTaskItem(t: typeof allTasks[number], daysOverdue?: number) {
    const assignee = t.assignments[0]?.user;
    const name = assignee?.name || assignee?.email?.split("@")[0] || "?";
    const initials = assignee?.name
      ? assignee.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      : (assignee?.email?.[0] || "?").toUpperCase();
    return {
      id: t.id,
      title: t.title,
      status: t.status,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
      projectId: t.graph.project.id,
      projectName: t.graph.project.name,
      assigneeName: name,
      assigneeInitials: initials,
      daysOverdue,
    };
  }

  // Needs Attention: overdue + blocked, sorted most-overdue first
  const needsAttention = allTasks
    .filter((t) => t.status !== "COMPLETE" && (t.status === "BLOCKED" || (t.dueDate && t.dueDate < now)))
    .sort((a, b) => {
      const aOverdue = a.dueDate ? Math.max(0, Math.floor((now.getTime() - a.dueDate.getTime()) / (1000 * 60 * 60 * 24))) : 0;
      const bOverdue = b.dueDate ? Math.max(0, Math.floor((now.getTime() - b.dueDate.getTime()) / (1000 * 60 * 60 * 24))) : 0;
      return bOverdue - aOverdue;
    })
    .slice(0, 10)
    .map((t) => {
      const days = t.dueDate ? Math.max(0, Math.floor((now.getTime() - t.dueDate.getTime()) / (1000 * 60 * 60 * 24))) : 0;
      return toTaskItem(t, days);
    });

  // Due Today
  const dueToday = allTasks
    .filter((t) => t.status !== "COMPLETE" && t.dueDate && t.dueDate >= now && t.dueDate < todayEnd)
    .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())
    .map((t) => toTaskItem(t));

  // Due This Week (excluding today)
  const dueThisWeek = allTasks
    .filter((t) => t.status !== "COMPLETE" && t.dueDate && t.dueDate >= todayEnd && t.dueDate < weekEnd)
    .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())
    .map((t) => toTaskItem(t));

  // Due Later (after this week, or no due date)
  const dueLater = allTasks
    .filter((t) => t.status !== "COMPLETE" && (!t.dueDate || t.dueDate >= weekEnd))
    .sort((a, b) => {
      if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime();
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    })
    .slice(0, 15)
    .map((t) => toTaskItem(t));

  // ─── Workload per person ───────────────────────────────────────────────────
  const workloadMap = new Map<string, { id: string; name: string; initials: string; notStarted: number; inProgress: number; blocked: number; awaitingApproval: number; total: number }>();
  // Also compute workload per project
  const workloadByProjectMap = new Map<string, Map<string, { id: string; name: string; initials: string; notStarted: number; inProgress: number; blocked: number; awaitingApproval: number; total: number }>>();

  for (const task of allTasks) {
    if (task.status === "COMPLETE") continue;
    const projectId = task.graph.project.id;

    for (const assignment of task.assignments) {
      const key = assignment.user.id;
      const name = assignment.user.name?.split(" ")[0] || assignment.user.email.split("@")[0];
      const initials = assignment.user.name
        ? assignment.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : assignment.user.email[0].toUpperCase();

      // Aggregate workload
      if (!workloadMap.has(key)) {
        workloadMap.set(key, { id: key, name, initials, notStarted: 0, inProgress: 0, blocked: 0, awaitingApproval: 0, total: 0 });
      }
      const entry = workloadMap.get(key)!;
      entry.total++;
      if (task.status === "NOT_STARTED") entry.notStarted++;
      else if (task.status === "IN_PROGRESS") entry.inProgress++;
      else if (task.status === "BLOCKED") entry.blocked++;
      else if (task.status === "AWAITING_APPROVAL") entry.awaitingApproval++;

      // Per-project workload
      if (!workloadByProjectMap.has(projectId)) {
        workloadByProjectMap.set(projectId, new Map());
      }
      const projectWorkload = workloadByProjectMap.get(projectId)!;
      if (!projectWorkload.has(key)) {
        projectWorkload.set(key, { id: key, name, initials, notStarted: 0, inProgress: 0, blocked: 0, awaitingApproval: 0, total: 0 });
      }
      const projectEntry = projectWorkload.get(key)!;
      projectEntry.total++;
      if (task.status === "NOT_STARTED") projectEntry.notStarted++;
      else if (task.status === "IN_PROGRESS") projectEntry.inProgress++;
      else if (task.status === "BLOCKED") projectEntry.blocked++;
      else if (task.status === "AWAITING_APPROVAL") projectEntry.awaitingApproval++;
    }
  }
  const workloadData = Array.from(workloadMap.values()).sort((a, b) => b.total - a.total).slice(0, 10);

  // Build workloadByProject as a serializable record
  const workloadByProject: Record<string, typeof workloadData> = {};
  for (const [projectId, memberMap] of workloadByProjectMap) {
    workloadByProject[projectId] = Array.from(memberMap.values()).sort((a, b) => b.total - a.total).slice(0, 10);
  }

  // Project list for filter chips
  const projectList = projects.map((p) => ({ id: p.id, name: p.name }));

  return (
    <div className="mx-auto max-w-7xl animate-[fadeIn_0.3s_ease-out]">
      {/* Hero Section */}
      <div className="mb-4 sm:mb-6 grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Hero Card - Greeting + Health Ring */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-themed-subtle bg-card p-5 sm:p-6 shadow-themed">
          {/* Decorative gradient blob */}
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-[20px] sm:text-[22px] font-bold tracking-tight text-heading">
                {greeting}, {firstName}
              </h1>
              <p className="mt-0.5 text-[13px] text-body">Here&apos;s your project overview</p>
            </div>
            {/* Circular Health Ring */}
            <div className="flex flex-col items-center">
              <div className="relative h-16 w-16 sm:h-20 sm:w-20">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border-default)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke={healthScore >= 80 ? '#8B5CF6' : healthScore >= 50 ? '#f59e0b' : '#ef4444'} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${healthScore} ${100 - healthScore}`} className="transition-all duration-700" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[14px] sm:text-[16px] font-bold text-heading">{healthScore}</span>
                </div>
              </div>
              <p className={cn("mt-1 text-[11px] font-semibold", healthLabelColor)}>{healthLabel}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats Mini Card */}
        <div className="rounded-3xl border border-themed-subtle bg-card p-5 shadow-themed flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-dim">This Week</span>
          </div>
          <div>
            <p className="text-[28px] font-bold text-heading">{completionsThisWeek}</p>
            <p className="text-[12px] text-body">tasks completed</p>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <CreateProjectButton />
          </div>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="mb-4 sm:mb-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {/* Total Tasks - spans 2 cols on sm */}
        <div className="sm:col-span-2 animate-entrance-1 rounded-2xl border border-themed-subtle bg-card p-4 shadow-themed hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-dim">Total Tasks</span>
              <p className="text-[28px] font-bold text-heading mt-1">{totalTasks}</p>
              <p className="text-[11px] text-body">{projects.length} active projects</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl accent-bg">
              <Target className="h-5 w-5 accent-color" />
            </div>
          </div>
        </div>

        {/* Completed - with mini donut */}
        <div className="animate-entrance-2 rounded-2xl border border-themed-subtle bg-card p-4 shadow-themed hover-lift">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-dim">Done</span>
          <div className="mt-2 flex items-center gap-2">
            <div className="relative h-10 w-10">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border-default)" strokeWidth="4" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#8B5CF6" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${completionRate} ${100 - completionRate}`} />
              </svg>
            </div>
            <div>
              <p className="text-[20px] font-bold text-heading">{completedTasks}</p>
              <p className="text-[10px] text-body">{completionRate}%</p>
            </div>
          </div>
        </div>

        {/* Blocked/Overdue */}
        <div className="animate-entrance-3 rounded-2xl border border-themed-subtle bg-card p-4 shadow-themed hover-lift">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-dim">Attention</span>
          <p className="text-[20px] font-bold text-heading mt-2">{blockedTasksCount + overdueCount}</p>
          <div className="mt-1 flex items-center gap-1.5 text-[10px]">
            <span className="text-red-500">{blockedTasksCount} blocked</span>
            <span className="text-dim">·</span>
            <span className="text-red-500">{overdueCount} overdue</span>
          </div>
        </div>
      </div>

      {/* Main dashboard content - interactive client component */}
      <DashboardClient
        projects={projectList}
        needsAttention={needsAttention}
        dueToday={dueToday}
        dueThisWeek={dueThisWeek}
        dueLater={dueLater}
        workload={workloadData}
        workloadByProject={workloadByProject}
      />

      {/* Projects section */}
      <div className="mt-8 mb-4">
        <h2 className="text-[15px] font-semibold text-heading">Projects</h2>
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
