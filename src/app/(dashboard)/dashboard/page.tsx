import { getProjects } from "@/actions/project-actions";
import { ProjectGrid } from "@/components/project-grid";
import { CreateProjectButton } from "@/components/create-project-button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  LayoutDashboard,
  FolderOpen,
  UsersRound,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CalendarDays,
  Users,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Zap,
  Target,
  ShieldAlert,
  Plus,
  BarChart3,
  Activity,
} from "lucide-react";
import { getTeams } from "@/actions/team-group-actions";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  HealthGauge,
  CompletionTrendChart,
  StatusDonutChart,
  WorkloadChart,
  ProgressRing,
} from "@/components/dashboard-charts";

export default async function DashboardPage() {
  const user = await requireUser();
  const [projects, teams] = await Promise.all([getProjects(), getTeams()]);

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

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

  // Fetch pending approval requests where user is the approver
  const pendingApprovals = await prisma.completionRequest.findMany({
    where: {
      approverId: user.id,
      status: "PENDING",
    },
    include: {
      node: { select: { id: true, title: true } },
      requester: { select: { name: true, email: true } },
    },
  });

  // Recent completions (last 7 days)
  const recentCompletionsAll = allTasks.filter(
    (t) => t.status === "COMPLETE" && t.updatedAt >= sevenDaysAgo
  );

  // Previous 7 days completions (for velocity)
  const previousWeekCompletions = allTasks.filter(
    (t) => t.status === "COMPLETE" && t.updatedAt >= fourteenDaysAgo && t.updatedAt < sevenDaysAgo
  );

  // ─── Compute KPIs ─────────────────────────────────────────────────────────
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.status === "COMPLETE").length;
  const inProgressTasks = allTasks.filter((t) => t.status === "IN_PROGRESS").length;
  const blockedTasksCount = allTasks.filter((t) => t.status === "BLOCKED").length;
  const awaitingApprovalCount = allTasks.filter((t) => t.status === "AWAITING_APPROVAL").length;
  const overdueTasksList = allTasks
    .filter((t) => t.dueDate && t.dueDate < now && t.status !== "COMPLETE")
    .sort((a, b) => (a.dueDate!.getTime() - b.dueDate!.getTime()));
  const overdueCount = overdueTasksList.length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Health score calculation
  const overdueRatio = totalTasks > 0 ? overdueCount / totalTasks : 0;
  const blockedRatio = totalTasks > 0 ? blockedTasksCount / totalTasks : 0;
  const velocityFactor =
    previousWeekCompletions.length > 0
      ? Math.min(recentCompletionsAll.length / previousWeekCompletions.length, 2) / 2
      : recentCompletionsAll.length > 0
        ? 1
        : 0;
  const rawHealthScore =
    completionRate * 0.4 +
    (1 - overdueRatio) * 100 * 0.3 +
    (1 - blockedRatio) * 100 * 0.2 +
    velocityFactor * 100 * 0.1;
  const healthScore = Math.round(Math.max(0, Math.min(100, rawHealthScore)));

  // ─── Lists ─────────────────────────────────────────────────────────────────
  const overdueTasks = overdueTasksList.slice(0, 5);

  const atRiskTasks = allTasks
    .filter(
      (t) =>
        t.dueDate &&
        t.dueDate > now &&
        t.dueDate <= fortyEightHoursFromNow &&
        t.status === "NOT_STARTED"
    )
    .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())
    .slice(0, 5);

  const blockedTasks = allTasks.filter((t) => t.status === "BLOCKED").slice(0, 5);

  const myTasks = allTasks
    .filter(
      (t) =>
        t.assignments.some((a) => a.user.id === user.id) &&
        t.status !== "COMPLETE"
    )
    .sort((a, b) => {
      // Blocked first
      if (a.status === "BLOCKED" && b.status !== "BLOCKED") return -1;
      if (b.status === "BLOCKED" && a.status !== "BLOCKED") return 1;
      // Then by dueDate, nulls last
      if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime();
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      return 0;
    })
    .slice(0, 7);

  // ─── Completion timeline (last 14 days) ────────────────────────────────────
  const completionTimeline: Array<{ date: string; count: number }> = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const count = allTasks.filter(
      (t) => t.status === "COMPLETE" && t.updatedAt >= dayStart && t.updatedAt < dayEnd
    ).length;
    completionTimeline.push({ date: dayStart.toISOString().slice(0, 10), count });
  }

  // ─── Status breakdown ──────────────────────────────────────────────────────
  const statusColors: Record<string, string> = {
    NOT_STARTED: "#9ca3af",
    IN_PROGRESS: "#7c3aed",
    BLOCKED: "#ef4444",
    AWAITING_APPROVAL: "#f59e0b",
    REJECTED: "#f97316",
    COMPLETE: "#10b981",
  };
  const statusLabels: Record<string, string> = {
    NOT_STARTED: "Not Started",
    IN_PROGRESS: "In Progress",
    BLOCKED: "Blocked",
    AWAITING_APPROVAL: "Awaiting Approval",
    REJECTED: "Rejected",
    COMPLETE: "Complete",
  };
  const statusBreakdown = Object.entries(statusColors)
    .map(([status, color]) => ({
      name: statusLabels[status],
      value: allTasks.filter((t) => t.status === status).length,
      color,
    }))
    .filter((s) => s.value > 0);

  // ─── Workload per person ───────────────────────────────────────────────────
  const workloadMap = new Map<string, { name: string; active: number; completed: number }>();
  for (const task of allTasks) {
    for (const assignment of task.assignments) {
      const key = assignment.user.id;
      if (!workloadMap.has(key)) {
        workloadMap.set(key, {
          name: assignment.user.name?.split(" ")[0] || assignment.user.email.split("@")[0],
          active: 0,
          completed: 0,
        });
      }
      const entry = workloadMap.get(key)!;
      if (task.status === "COMPLETE") {
        entry.completed++;
      } else {
        entry.active++;
      }
    }
  }
  const workloadData = Array.from(workloadMap.values())
    .sort((a, b) => (b.active + b.completed) - (a.active + a.completed))
    .slice(0, 8);

  // ─── Per-project health ────────────────────────────────────────────────────
  const perProjectHealth = projects.slice(0, 6).map((p) => {
    const projectTasks = allTasks.filter((t) => t.graph.project.id === p.id);
    const pCompleted = projectTasks.filter((t) => t.status === "COMPLETE").length;
    const pTotal = projectTasks.length;
    const pOverdue = projectTasks.filter(
      (t) => t.dueDate && t.dueDate < now && t.status !== "COMPLETE"
    ).length;
    const overduePercent = pTotal > 0 ? pOverdue / pTotal : 0;
    const healthDot = pOverdue === 0 ? "green" : overduePercent < 0.2 ? "amber" : "red";
    return { id: p.id, name: p.name, completedTasks: pCompleted, totalTasks: pTotal, overdueCount: pOverdue, healthDot };
  });

  // ─── Recent completions (last 5, with assignee info) ───────────────────────
  const recentCompletions = allTasks
    .filter((t) => t.status === "COMPLETE")
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  // ─── Greeting ──────────────────────────────────────────────────────────────
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user.name?.split(" ")[0] || "there";

  const completionsThisWeek = recentCompletionsAll.length;

  // ─── Attention count ───────────────────────────────────────────────────────
  const attentionCount = overdueCount + blockedTasks.length + pendingApprovals.length + atRiskTasks.length;
  const showAttention = attentionCount > 0;

  const STATUS_DOT_COLORS: Record<string, string> = {
    NOT_STARTED: "#9ca3af",
    IN_PROGRESS: "#7c3aed",
    BLOCKED: "#ef4444",
    AWAITING_APPROVAL: "#f59e0b",
    REJECTED: "#f97316",
    COMPLETE: "#10b981",
  };

  const healthLabel = healthScore >= 80 ? "On Track" : healthScore >= 50 ? "Needs Attention" : "At Risk";
  const healthLabelColor = healthScore >= 80 ? "text-emerald-600" : healthScore >= 50 ? "text-amber-600" : "text-red-600";


  return (
    <div className="mx-auto max-w-7xl animate-[fadeIn_0.3s_ease-out]">
      {/* ROW 1: Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-[#1A1A1A]">
            {greeting}, {firstName}
          </h1>
          <p className="mt-0.5 text-[13px] text-[#6B7280]">Here&apos;s your project overview</p>
        </div>
        <div className="flex items-center gap-2">
          <CreateProjectButton />
          <Link
            href="/calendar"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-200/60 bg-white shadow-sm transition-colors hover:bg-surface-50"
            title="Calendar"
          >
            <CalendarDays className="h-4 w-4 text-[#6B7280]" />
          </Link>
          <Link
            href="/analytics"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-200/60 bg-white shadow-sm transition-colors hover:bg-surface-50"
            title="Analytics"
          >
            <BarChart3 className="h-4 w-4 text-[#6B7280]" />
          </Link>
        </div>
      </div>

      {/* ROW 2: Health Score + KPI Stats */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row">
        {/* Health Gauge Card */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-surface-200/60 bg-white p-6 shadow-sm lg:w-[200px]">
          <HealthGauge score={healthScore} />
          <p className={cn("mt-2 text-[12px] font-semibold", healthLabelColor)}>
            {healthLabel}
          </p>
        </div>

        {/* KPI Grid */}
        <div className="grid flex-1 grid-cols-2 gap-3">
          {/* Total Tasks */}
          <div className="rounded-2xl border border-surface-200/60 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50">
                <Target className="h-3.5 w-3.5 text-brand-600" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">Total Tasks</span>
            </div>
            <p className="text-[24px] font-bold text-[#1A1A1A]">{totalTasks}</p>
            <p className="text-[11px] text-[#6B7280]">{projects.length} projects</p>
          </div>

          {/* Completed */}
          <div className="rounded-2xl border border-surface-200/60 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">Completed</span>
            </div>
            <p className="text-[24px] font-bold text-[#1A1A1A]">{completedTasks}</p>
            <p className="text-[11px] text-emerald-600">{completionRate}% completion rate</p>
          </div>

          {/* In Progress */}
          <div className="rounded-2xl border border-surface-200/60 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">In Progress</span>
            </div>
            <p className="text-[24px] font-bold text-[#1A1A1A]">{inProgressTasks}</p>
            <p className="text-[11px] text-[#6B7280]">{completionsThisWeek} completed this week</p>
          </div>

          {/* Blocked + Overdue */}
          <div className="rounded-2xl border border-surface-200/60 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50">
                <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">Blocked / Overdue</span>
            </div>
            <p className="text-[24px] font-bold text-[#1A1A1A]">{blockedTasksCount + overdueCount}</p>
            <p className="text-[11px] text-red-600">
              {blockedTasksCount} blocked · {overdueCount} overdue
            </p>
          </div>
        </div>
      </div>

      {/* ROW 3: Attention Required */}
      {showAttention && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-gradient-to-r from-red-50/50 to-amber-50/30 p-5">
          <div className="mb-3 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            <span className="text-[13px] font-semibold text-[#1A1A1A]">Attention Required</span>
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
              {attentionCount}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Overdue */}
            {overdueCount > 0 && (
              <div className="rounded-lg border-l-[3px] border-l-red-400 bg-white/80 px-3 py-2">
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-[11px] font-semibold text-red-700">Overdue</span>
                  <span className="text-[11px] text-[#6B7280]">({overdueCount})</span>
                </div>
                <div className="space-y-0.5">
                  {overdueTasks.slice(0, 2).map((t) => (
                    <p key={t.id} className="truncate text-[11px] text-[#6B7280]">{t.title}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Blocked */}
            {blockedTasks.length > 0 && (
              <div className="rounded-lg border-l-[3px] border-l-red-400 bg-white/80 px-3 py-2">
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-[11px] font-semibold text-red-700">Blocked</span>
                  <span className="text-[11px] text-[#6B7280]">({blockedTasks.length})</span>
                </div>
                <div className="space-y-0.5">
                  {blockedTasks.slice(0, 2).map((t) => (
                    <p key={t.id} className="truncate text-[11px] text-[#6B7280]">{t.title}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Awaiting Approval */}
            {pendingApprovals.length > 0 && (
              <div className="rounded-lg border-l-[3px] border-l-amber-400 bg-white/80 px-3 py-2">
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-[11px] font-semibold text-amber-700">Awaiting Approval</span>
                  <span className="text-[11px] text-[#6B7280]">({pendingApprovals.length})</span>
                </div>
                <div className="space-y-0.5">
                  {pendingApprovals.slice(0, 2).map((r) => (
                    <p key={r.id} className="truncate text-[11px] text-[#6B7280]">{r.node.title}</p>
                  ))}
                </div>
              </div>
            )}

            {/* At Risk */}
            {atRiskTasks.length > 0 && (
              <div className="rounded-lg border-l-[3px] border-l-amber-400 bg-white/80 px-3 py-2">
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-[11px] font-semibold text-amber-700">At Risk (48hr)</span>
                  <span className="text-[11px] text-[#6B7280]">({atRiskTasks.length})</span>
                </div>
                <div className="space-y-0.5">
                  {atRiskTasks.slice(0, 2).map((t) => (
                    <p key={t.id} className="truncate text-[11px] text-[#6B7280]">{t.title}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ROW 4: Charts */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Completion Trend */}
        <div className="rounded-2xl border border-surface-200/60 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-[14px] font-semibold text-[#1A1A1A]">Completion Velocity</h3>
            <p className="text-[11px] text-[#9CA3AF]">Last 14 days</p>
          </div>
          <CompletionTrendChart data={completionTimeline} />
        </div>

        {/* Status Breakdown */}
        <div className="rounded-2xl border border-surface-200/60 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-[14px] font-semibold text-[#1A1A1A]">Status Distribution</h3>
          </div>
          {statusBreakdown.length > 0 ? (
            <StatusDonutChart data={statusBreakdown} totalTasks={totalTasks} />
          ) : (
            <p className="py-8 text-center text-[13px] text-[#9CA3AF]">No tasks yet</p>
          )}
        </div>
      </div>

      {/* ROW 5: Three-column panels */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Col 1: My Tasks */}
        <div className="rounded-2xl border border-surface-200/60 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-[#1A1A1A]">My Tasks</h3>
            <Link
              href="/my-tasks"
              className="flex items-center gap-1 text-[12px] font-medium text-brand-600 hover:text-brand-700"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {myTasks.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-[#9CA3AF]">No active tasks assigned to you</p>
          ) : (
            <div className="space-y-1.5">
              {myTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/graph/${task.graph.project.id}?nodeId=${task.id}`}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-surface-50",
                    task.status === "BLOCKED" && "bg-red-50/50"
                  )}
                >
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: STATUS_DOT_COLORS[task.status] || "#9ca3af" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium text-[#1A1A1A]">{task.title}</p>
                    <p className="text-[10px] text-[#9CA3AF]">{task.graph.project.name}</p>
                  </div>
                  {task.dueDate && (
                    <span className="flex-shrink-0 text-[10px] text-[#9CA3AF]">
                      {task.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Col 2: Project Progress */}
        <div className="rounded-2xl border border-surface-200/60 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-[#1A1A1A]">
              Projects <span className="text-[#9CA3AF]">({projects.length})</span>
            </h3>
          </div>
          {perProjectHealth.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-[#9CA3AF]">No projects yet</p>
          ) : (
            <div className="space-y-2.5">
              {perProjectHealth.map((p) => {
                const progress = p.totalTasks > 0 ? Math.round((p.completedTasks / p.totalTasks) * 100) : 0;
                const dotColor = p.healthDot === "green" ? "#10b981" : p.healthDot === "amber" ? "#f59e0b" : "#ef4444";
                return (
                  <Link
                    key={p.id}
                    href={`/graph/${p.id}`}
                    className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-50"
                  >
                    <ProgressRing progress={progress} size={32} strokeWidth={3} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-medium text-[#1A1A1A]">{p.name}</p>
                      <p className="text-[10px] text-[#9CA3AF]">
                        {p.completedTasks}/{p.totalTasks}
                      </p>
                    </div>
                    <span
                      className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: dotColor }}
                      title={p.overdueCount > 0 ? `${p.overdueCount} overdue` : "On track"}
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Col 3: Team Workload */}
        <div className="rounded-2xl border border-surface-200/60 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-[14px] font-semibold text-[#1A1A1A]">Team Workload</h3>
          </div>
          {workloadData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6">
              <Users className="mb-2 h-6 w-6 text-[#D1D5DB]" />
              <p className="text-[13px] text-[#9CA3AF]">No team assignments yet</p>
            </div>
          ) : (
            <WorkloadChart data={workloadData} />
          )}
        </div>
      </div>

      {/* ROW 6: Recent Activity */}
      <div className="mb-6 rounded-2xl border border-surface-200/60 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#9CA3AF]" />
          <h3 className="text-[14px] font-semibold text-[#1A1A1A]">Recent Activity</h3>
        </div>
        {recentCompletions.length === 0 ? (
          <p className="py-4 text-center text-[13px] text-[#9CA3AF]">No recent completions</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {recentCompletions.map((task) => {
              const assignee = task.assignments[0]?.user;
              const initials = assignee?.name
                ? assignee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : (assignee?.email?.[0] || "?").toUpperCase();
              return (
                <div
                  key={task.id}
                  className="flex items-start gap-2.5 rounded-lg border border-surface-200/40 bg-surface-50/50 p-3"
                >
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-[#1A1A1A]">
                      <span className="font-medium">
                        {assignee?.name || assignee?.email?.split("@")[0] || "Someone"}
                      </span>{" "}
                      completed{" "}
                      <span className="font-medium">{task.title}</span>
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] text-[#9CA3AF]">{formatTimeAgo(task.updatedAt)}</span>
                      <span className="rounded bg-surface-100 px-1.5 py-0.5 text-[9px] font-medium text-[#6B7280]">
                        {task.graph.project.name}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ROW 7: Projects */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Projects</h2>
        {projects.length > 0 && (
          <Link
            href="/analytics"
            className="flex items-center gap-1 text-[12px] font-medium text-brand-600 hover:text-brand-700"
          >
            Analytics <ArrowRight className="h-3 w-3" />
          </Link>
        )}
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
  if (diffDays === 1) return "yesterday";
  return `${diffDays}d ago`;
}
