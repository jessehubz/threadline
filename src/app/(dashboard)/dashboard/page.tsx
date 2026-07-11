import { getProjects } from "@/actions/project-actions";
import { CreateProjectButton } from "@/components/create-project-button";
import { EmptyState } from "@/components/ui/empty-state";
import { LayoutDashboard, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

  // ─── Health score (0-100) ──────────────────────────────────────────────────
  let healthScore = 100;
  if (totalTasks > 0) {
    const overdueRatio = overdueCount / totalTasks;
    const blockedRatio = blockedTasksCount / totalTasks;
    healthScore = Math.max(0, Math.min(100, Math.round(100 - overdueRatio * 60 - blockedRatio * 40)));
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

  const projectList = projects.map((p) => ({
    id: p.id,
    name: p.name,
    totalTasks: p.totalTasks,
    completedTasks: p.completedTasks,
    memberCount: p.memberCount,
  }));

  // Top AI insight for the overview panel
  const topInsight = insights[0] || null;

  // Active tasks = not completed
  const activeTasks = totalTasks - completedTasks;

  return (
    <div className="mx-auto max-w-5xl animate-[fadeIn_0.3s_ease-out]">
      {/* ─── Page Header ─── */}
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1.2, color: "var(--text-primary)" }}>
            {greeting}, <span style={{ fontWeight: 700 }}>{firstName}</span>
          </h1>
          <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", marginTop: "6px" }}>
            Here&apos;s what&apos;s happening across your projects today.
          </p>
        </div>
        <CreateProjectButton />
      </div>

      {/* ─── Overview Panel (panel-outer-tinted) ─── */}
      <div
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-sm)",
          padding: "24px",
          marginBottom: "32px",
        }}
      >
        {/* Well frame */}
        <div
          style={{
            background: "var(--bg-base)",
            borderRadius: "var(--radius-lg)",
            padding: "8px",
          }}
        >
          {/* 2-col grid of nested cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {/* Health Score card */}
            <div
              style={{
                background: "var(--bg-muted)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-md)",
                padding: "24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                {/* Ring SVG */}
                <svg width="56" height="56" viewBox="0 0 56 56" style={{ flexShrink: 0 }}>
                  <circle
                    cx="28" cy="28" r="24"
                    fill="none"
                    stroke="var(--border-default)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="28" cy="28" r="24"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${(healthScore / 100) * 150.8} 150.8`}
                    transform="rotate(-90 28 28)"
                  />
                </svg>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                    Health Score
                  </div>
                  <div style={{ fontSize: "40px", fontWeight: 200, letterSpacing: "-0.02em", color: "var(--text-primary)", lineHeight: 1 }}>
                    {healthScore}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: "12px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    borderRadius: "999px",
                    padding: "3px 10px",
                    fontSize: "11px",
                    fontWeight: 500,
                    background: healthScore >= 70 ? "var(--accent-soft)" : "var(--danger-soft)",
                    color: healthScore >= 70 ? "var(--accent)" : "var(--danger)",
                  }}
                >
                  {healthScore >= 70 ? "On Track" : "Needs Attention"}
                </span>
              </div>
            </div>

            {/* Active Tasks card */}
            <div
              style={{
                background: "var(--bg-muted)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-md)",
                padding: "24px",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                Active Tasks
              </div>
              <div style={{ fontSize: "40px", fontWeight: 200, letterSpacing: "-0.02em", color: "var(--text-primary)", lineHeight: 1 }}>
                {activeTasks}
              </div>
              <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {inProgressTasks > 0 && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      borderRadius: "999px",
                      padding: "3px 10px",
                      fontSize: "11px",
                      fontWeight: 500,
                      background: "var(--accent-soft)",
                      color: "var(--accent)",
                    }}
                  >
                    {inProgressTasks} in progress
                  </span>
                )}
                {blockedTasksCount > 0 && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      borderRadius: "999px",
                      padding: "3px 10px",
                      fontSize: "11px",
                      fontWeight: 500,
                      background: "var(--danger-soft)",
                      color: "var(--danger)",
                    }}
                  >
                    {blockedTasksCount} blocked
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Insight strip */}
        {topInsight && (
          <div
            style={{
              borderTop: "1px solid var(--border-default)",
              marginTop: "20px",
              paddingTop: "16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                borderRadius: "999px",
                padding: "3px 8px",
                fontSize: "10.5px",
                fontWeight: 700,
                background: "var(--accent-soft)",
                color: "var(--accent)",
              }}
            >
              <Sparkles style={{ width: "10px", height: "10px" }} />
              AI
            </span>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              {topInsight.message}
            </span>
          </div>
        )}
      </div>

      {/* ─── Main dashboard content (client component) ─── */}
      <DashboardClient
        projects={projectList}
        needsAttention={needsAttention}
        dueToday={dueToday}
        dueThisWeek={dueThisWeek}
        dueLater={dueLater}
        workload={workloadData}
        workloadByProject={workloadByProject}
      />

      {/* ─── Empty state fallback ─── */}
      {projects.length === 0 && (
        <div className="mt-14">
          <EmptyState
            icon={<LayoutDashboard className="h-8 w-8" />}
            title="No projects yet"
            description="Create your first project to start organizing tasks as dependency graphs."
            action={<CreateProjectButton />}
          />
        </div>
      )}
    </div>
  );
}
