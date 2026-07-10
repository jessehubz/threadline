import { getProjects } from "@/actions/project-actions";
import { ProjectGrid } from "@/components/project-grid";
import { CreateProjectButton } from "@/components/create-project-button";
import { EmptyState } from "@/components/ui/empty-state";
import { LayoutDashboard, Sparkles, TrendingUp, AlertTriangle, Clock, CheckCircle2, Zap } from "lucide-react";
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
  const inProgressTasks = allTasks.filter((t) => t.status === "IN_PROGRESS").length;
  const blockedTasksCount = allTasks.filter((t) => t.status === "BLOCKED").length;
  const overdueCount = allTasks.filter((t) => t.dueDate && t.dueDate < now && t.status !== "COMPLETE").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const completionsThisWeek = allTasks.filter(
    (t) => t.status === "COMPLETE" && t.updatedAt >= sevenDaysAgo
  ).length;
  const previousWeekCompletions = allTasks.filter(
    (t) => t.status === "COMPLETE" && t.updatedAt >= fourteenDaysAgo && t.updatedAt < sevenDaysAgo
  ).length;

  // ─── Greeting ──────────────────────────────────────────────────────────────
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user.name?.split(" ")[0] || "there";

  // ─── AI Insights (server-computed) ─────────────────────────────────────────
  const insights: Array<{ type: "urgent" | "warning" | "tip" | "positive"; message: string }> = [];

  if (overdueCount > 0) {
    const topOverdue = allTasks
      .filter((t) => t.dueDate && t.dueDate < now && t.status !== "COMPLETE")
      .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())[0];
    if (topOverdue) {
      const daysLate = Math.floor((now.getTime() - topOverdue.dueDate!.getTime()) / (1000 * 60 * 60 * 24));
      insights.push({
        type: "urgent",
        message: `"${topOverdue.title}" is ${daysLate} day${daysLate > 1 ? "s" : ""} overdue. ${overdueCount > 1 ? `${overdueCount - 1} more also overdue.` : ""}`,
      });
    }
  }

  if (blockedTasksCount > 0) {
    const blockedTask = allTasks.find((t) => t.status === "BLOCKED");
    insights.push({
      type: "warning",
      message: `${blockedTasksCount} task${blockedTasksCount > 1 ? "s" : ""} blocked${blockedTask ? ` — "${blockedTask.title}" needs unblocking` : ""}`,
    });
  }

  if (previousWeekCompletions > 0 && completionsThisWeek < previousWeekCompletions * 0.5) {
    insights.push({
      type: "tip",
      message: `Velocity dropped — ${completionsThisWeek} completed this week vs ${previousWeekCompletions} last week. Focus on smaller tasks.`,
    });
  } else if (completionsThisWeek > previousWeekCompletions && previousWeekCompletions > 0) {
    insights.push({
      type: "positive",
      message: `Great pace! ${completionsThisWeek} tasks done this week, up from ${previousWeekCompletions} last week.`,
    });
  }

  const dueTodayCount = allTasks.filter((t) => t.status !== "COMPLETE" && t.dueDate && t.dueDate >= now && t.dueDate < todayEnd).length;
  if (dueTodayCount > 0) {
    insights.push({
      type: "tip",
      message: `${dueTodayCount} task${dueTodayCount > 1 ? "s" : ""} due today — prioritize to stay on track.`,
    });
  }

  if (completionRate >= 80 && totalTasks > 5) {
    insights.push({ type: "positive", message: `${completionRate}% done across ${totalTasks} tasks — almost there!` });
  }

  if (insights.length === 0 && totalTasks > 0) {
    insights.push({ type: "positive", message: `All clear! ${inProgressTasks} in progress, nothing urgent.` });
  }

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

  const dueToday = allTasks
    .filter((t) => t.status !== "COMPLETE" && t.dueDate && t.dueDate >= now && t.dueDate < todayEnd)
    .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())
    .map((t) => toTaskItem(t));

  const dueThisWeek = allTasks
    .filter((t) => t.status !== "COMPLETE" && t.dueDate && t.dueDate >= todayEnd && t.dueDate < weekEnd)
    .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())
    .map((t) => toTaskItem(t));

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

      if (!workloadMap.has(key)) workloadMap.set(key, { id: key, name, initials, notStarted: 0, inProgress: 0, blocked: 0, awaitingApproval: 0, total: 0 });
      const entry = workloadMap.get(key)!;
      entry.total++;
      if (task.status === "NOT_STARTED") entry.notStarted++;
      else if (task.status === "IN_PROGRESS") entry.inProgress++;
      else if (task.status === "BLOCKED") entry.blocked++;
      else if (task.status === "AWAITING_APPROVAL") entry.awaitingApproval++;

      if (!workloadByProjectMap.has(projectId)) workloadByProjectMap.set(projectId, new Map());
      const pw = workloadByProjectMap.get(projectId)!;
      if (!pw.has(key)) pw.set(key, { id: key, name, initials, notStarted: 0, inProgress: 0, blocked: 0, awaitingApproval: 0, total: 0 });
      const pe = pw.get(key)!;
      pe.total++;
      if (task.status === "NOT_STARTED") pe.notStarted++;
      else if (task.status === "IN_PROGRESS") pe.inProgress++;
      else if (task.status === "BLOCKED") pe.blocked++;
      else if (task.status === "AWAITING_APPROVAL") pe.awaitingApproval++;
    }
  }
  const workloadData = Array.from(workloadMap.values()).sort((a, b) => b.total - a.total).slice(0, 10);
  const workloadByProject: Record<string, typeof workloadData> = {};
  for (const [projectId, memberMap] of workloadByProjectMap) {
    workloadByProject[projectId] = Array.from(memberMap.values()).sort((a, b) => b.total - a.total).slice(0, 10);
  }

  const projectList = projects.map((p) => ({ id: p.id, name: p.name }));

  return (
    <div className="mx-auto max-w-5xl animate-[fadeIn_0.3s_ease-out]">
      {/* ─── Header with greeting + stats inline ─── */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <h1 className="text-[26px] sm:text-[32px] font-light tracking-tight text-heading">
            {greeting}, <span className="font-semibold">{firstName}</span>
          </h1>
          <CreateProjectButton />
        </div>

        {/* Stats as inline flowing numbers — no boxes, no containers */}
        <div className="mt-5 flex flex-wrap items-baseline gap-x-8 gap-y-2 sm:gap-x-12">
          <span className="inline-flex items-baseline gap-1.5">
            <span className="text-[28px] sm:text-[34px] font-bold tracking-tight text-heading">{totalTasks}</span>
            <span className="text-[11px] font-medium text-dim">tasks</span>
          </span>
          <span className="inline-flex items-baseline gap-1.5">
            <span className="text-[28px] sm:text-[34px] font-bold tracking-tight text-[var(--accent)]">{completedTasks}</span>
            <span className="text-[11px] font-medium text-dim">done</span>
          </span>
          <span className="inline-flex items-baseline gap-1.5">
            <span className="text-[28px] sm:text-[34px] font-bold tracking-tight text-heading">{inProgressTasks}</span>
            <span className="text-[11px] font-medium text-dim">in progress</span>
          </span>
          {blockedTasksCount > 0 && (
            <span className="inline-flex items-baseline gap-1.5">
              <span className="text-[28px] sm:text-[34px] font-bold tracking-tight text-[var(--danger)]">{blockedTasksCount}</span>
              <span className="text-[11px] font-medium text-[var(--danger)]">blocked</span>
            </span>
          )}
          {overdueCount > 0 && (
            <span className="inline-flex items-baseline gap-1.5">
              <span className="text-[28px] sm:text-[34px] font-bold tracking-tight text-[var(--danger)]">{overdueCount}</span>
              <span className="text-[11px] font-medium text-[var(--danger)]">overdue</span>
            </span>
          )}
        </div>

        {/* Thin progress line — shows completion visually without a box */}
        {totalTasks > 0 && (
          <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-700"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        )}
      </div>

      {/* ─── AI Insights — no container box, just rows ─── */}
      {insights.length > 0 && (
        <section className="mb-10">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span className="text-[12px] font-semibold uppercase tracking-wider text-dim">Insights</span>
          </div>
          <div className="space-y-2">
            {insights.slice(0, 4).map((insight, i) => (
              <InsightRow key={i} type={insight.type} message={insight.message} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Main dashboard content ─── */}
      <DashboardClient
        projects={projectList}
        needsAttention={needsAttention}
        dueToday={dueToday}
        dueThisWeek={dueThisWeek}
        dueLater={dueLater}
        workload={workloadData}
        workloadByProject={workloadByProject}
      />

      {/* ─── Projects section ─── */}
      <div className="mt-14 mb-4">
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

// ─── AI Insight row — no box, just icon + text ───────────────────────────────

function InsightRow({ type, message }: { type: "urgent" | "warning" | "tip" | "positive"; message: string }) {
  const config = {
    urgent: { icon: AlertTriangle, color: "text-[var(--danger)]" },
    warning: { icon: Clock, color: "text-amber-500" },
    tip: { icon: Zap, color: "text-[var(--accent)]" },
    positive: { icon: TrendingUp, color: "text-emerald-500" },
  }[type];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-2.5 py-1">
      <Icon className={cn("h-3.5 w-3.5 mt-0.5 flex-shrink-0", config.color)} />
      <p className="text-[13px] leading-relaxed text-body">{message}</p>
    </div>
  );
}
