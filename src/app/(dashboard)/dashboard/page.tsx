import { getProjects } from "@/actions/project-actions";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardContent } from "@/components/dashboard-content";
import { getPendingReminders } from "@/actions/ai-assistant-actions";
import { computeDependencyGlyphs } from "@/lib/dependency-map";

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
      deletedAt: null,
      graph: { project: { deletedAt: null, members: { some: { userId: user.id } } } },
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
      message: `${blockedTasksCount} task${blockedTasksCount > 1 ? "s" : ""} blocked${blockedTask ? ` - "${blockedTask.title}" needs unblocking` : ""}`,
    });
  }

  if (previousWeekCompletions > 0 && completionsThisWeek < previousWeekCompletions * 0.5) {
    insights.push({
      type: "tip",
      message: `Velocity dropped - ${completionsThisWeek} completed this week vs ${previousWeekCompletions} last week. Focus on smaller tasks.`,
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
      message: `${dueTodayCount} task${dueTodayCount > 1 ? "s" : ""} due today - prioritize to stay on track.`,
    });
  }

  if (completionRate >= 80 && totalTasks > 5) {
    insights.push({ type: "positive", message: `${completionRate}% done across ${totalTasks} tasks - almost there!` });
  }

  if (insights.length === 0 && totalTasks > 0) {
    insights.push({ type: "positive", message: `All clear! ${inProgressTasks} in progress, nothing urgent.` });
  }

  // ─── Pending reminders for AI chat indicator ─────────────────────────────
  let pendingReminderCount = 0;
  try {
    const reminders = await getPendingReminders();
    pendingReminderCount = reminders.length;
  } catch {
    // Non-critical - silently default to 0
  }

  const insightsForWidget = insights.map((insight) => ({
    text: insight.message,
    color: insight.type,
  }));

  // ─── Health score (0-100) ──────────────────────────────────────────────────
  let healthScore = 100;
  if (totalTasks > 0) {
    const overdueRatio = overdueCount / totalTasks;
    const blockedRatio = blockedTasksCount / totalTasks;
    healthScore = Math.max(0, Math.min(100, Math.round(100 - overdueRatio * 60 - blockedRatio * 40)));
  }

  // ─── Task items for DashboardContent ───────────────────────────────────────
  function toTaskItem(t: (typeof allTasks)[number], daysOverdue?: number) {
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

  const overdue = allTasks
    .filter((t) => t.status !== "COMPLETE" && t.dueDate && t.dueDate < now)
    .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())
    .map((t) => {
      const daysOverdue = Math.floor((now.getTime() - t.dueDate!.getTime()) / (1000 * 60 * 60 * 24));
      return toTaskItem(t, daysOverdue);
    });

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
    visibility: p.visibility,
    totalTasks: p.totalTasks,
    completedTasks: p.completedTasks,
    memberCount: p.memberCount,
    lastOpenedAt: p.lastOpenedAt ? p.lastOpenedAt.toISOString() : null,
    displayOrder: p.displayOrder,
    role: p.role,
    labels: p.labels.map((l) => ({ id: l.id, name: l.name, color: l.color })),
    tags: p.tags.map((t) => ({ id: t.id, name: t.name, color: t.color, isSystem: t.isSystem })),
  }));

  // Active tasks = not completed
  const activeTasks = totalTasks - completedTasks;

  const awaitingApprovalCount = allTasks.filter((t) => t.status === "AWAITING_APPROVAL").length;

  // ─── Dependency map preview + "first up" task (design-preview12's focus
  // card + map section). Reuses positionX/positionY already stored on each
  // TaskNode from the real graph editor — no fabricated layout — plus each
  // graph's real edges, to derive status glyphs and blocking counts. ───────
  const graphIds = Array.from(new Set(allTasks.map((t) => t.graphId)));
  const allEdges = graphIds.length
    ? await prisma.edge.findMany({
        where: { graphId: { in: graphIds } },
        select: { graphId: true, sourceNodeId: true, targetNodeId: true },
      })
    : [];
  const depGlyphs = computeDependencyGlyphs(
    allTasks.map((t) => ({ id: t.id, status: t.status })),
    allEdges
  );

  // "First up": the single most urgent task, preferring one that's actively
  // blocking others — overdue beats due-today beats "is a blocker" beats
  // soonest-due. Mirrors the file's own example (a blocker task, not
  // necessarily assigned to the viewer).
  const eligible = allTasks.filter((t) => t.status !== "COMPLETE" && t.status !== "REJECTED");
  const byBlocksThenDue = (a: (typeof eligible)[number], b: (typeof eligible)[number]) => {
    const diff = (depGlyphs.get(b.id)?.blocks ?? 0) - (depGlyphs.get(a.id)?.blocks ?? 0);
    if (diff !== 0) return diff;
    if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime();
    return 0;
  };
  const overdueEligible = eligible.filter((t) => t.dueDate && t.dueDate < now).sort(byBlocksThenDue);
  const dueTodayEligible = eligible
    .filter((t) => t.dueDate && t.dueDate >= now && t.dueDate < todayEnd)
    .sort(byBlocksThenDue);
  const blockerEligible = eligible
    .filter((t) => (depGlyphs.get(t.id)?.blocks ?? 0) > 0)
    .sort(byBlocksThenDue);
  const soonestEligible = eligible.filter((t) => t.dueDate).sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime());
  const firstUpNode =
    overdueEligible[0] ?? dueTodayEligible[0] ?? blockerEligible[0] ?? soonestEligible[0] ?? eligible[0] ?? null;

  const firstUpTask = firstUpNode
    ? (() => {
        const isOverdue = firstUpNode.dueDate !== null && firstUpNode.dueDate < now;
        const isDueToday = firstUpNode.dueDate !== null && firstUpNode.dueDate >= now && firstUpNode.dueDate < todayEnd;
        const dueLabel = isOverdue
          ? `Overdue · was due ${firstUpNode.dueDate!.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
          : isDueToday
            ? `Due today · ${firstUpNode.dueDate!.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
            : firstUpNode.dueDate
              ? `Due ${firstUpNode.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
              : "No due date";
        return {
          id: firstUpNode.id,
          title: firstUpNode.title,
          projectId: firstUpNode.graph.project.id,
          projectName: firstUpNode.graph.project.name,
          dueLabel,
          glyph: depGlyphs.get(firstUpNode.id)?.glyph ?? "ready",
          unblocksCount: depGlyphs.get(firstUpNode.id)?.blocks ?? 0,
        };
      })()
    : null;

  // Dependency map project-switcher: the same handful of projects already
  // shown in the sidebar/dashboard, capped to match the file's 3-tab switcher.
  const mapProjects = projects.slice(0, 4);
  const dependencyMaps = mapProjects.map((p) => {
    const projectTasks = allTasks.filter((t) => t.graph.project.id === p.id);
    const projectGraphIds = new Set(projectTasks.map((t) => t.graphId));
    const projectEdges = allEdges.filter((e) => projectGraphIds.has(e.graphId));
    return {
      projectId: p.id,
      projectName: p.name,
      nodes: projectTasks.map((t) => {
        const computed = depGlyphs.get(t.id)!;
        return {
          id: t.id,
          title: t.title,
          positionX: t.positionX,
          positionY: t.positionY,
          dueDate: t.dueDate ? t.dueDate.toISOString() : null,
          glyph: computed.glyph,
          waitingOn: computed.waitingOn,
          blocks: computed.blocks,
          isFirstUp: t.id === firstUpTask?.id,
        };
      }),
      edges: projectEdges.map((e) => ({
        source: e.sourceNodeId,
        target: e.targetNodeId,
        kind:
          e.sourceNodeId === firstUpTask?.id
            ? ("hot" as const)
            : depGlyphs.get(e.sourceNodeId)?.glyph === "done"
              ? ("done" as const)
              : ("" as const),
      })),
    };
  });

  return (
    <DashboardContent
      user={user}
      greeting={greeting}
      firstName={firstName}
      healthScore={healthScore}
      activeTasks={activeTasks}
      completionRate={completionRate}
      insights={insightsForWidget}
      projects={projectList}
      needsAttention={needsAttention}
      dueToday={dueToday}
      dueThisWeek={dueThisWeek}
      dueLater={dueLater}
      overdue={overdue}
      workload={workloadData}
      workloadByProject={workloadByProject}
      pendingReminderCount={pendingReminderCount}
      totalProjects={projects.length}
      needsAttentionCount={needsAttention.length}
      inProgressTasks={inProgressTasks}
      blockedTasksCount={blockedTasksCount}
      awaitingApprovalCount={awaitingApprovalCount}
      firstUpTask={firstUpTask}
      dependencyMaps={dependencyMaps}
    />
  );
}
