import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AnalyticsCharts } from "@/components/analytics-charts";

export default async function AnalyticsPage() {
  const user = await requireUser();

  const projects = await prisma.project.findMany({
    where: { members: { some: { userId: user.id } } },
    select: { id: true, name: true },
  });

  // Get all tasks for user's projects
  const tasks = await prisma.taskNode.findMany({
    where: {
      graph: { project: { members: { some: { userId: user.id } } } },
    },
    include: {
      assignments: { include: { user: true } },
      graph: { include: { project: true } },
    },
  });

  // Status breakdown — single-accent system: violet intensity rises with progress,
  // muted coral flags anything that needs attention. No other hues.
  const statusBreakdown = [
    { name: "Not Started", value: tasks.filter((t) => t.status === "NOT_STARTED").length, color: "var(--text-muted)" },
    { name: "Awaiting Approval", value: tasks.filter((t) => t.status === "AWAITING_APPROVAL").length, color: "var(--violet-500)" },
    { name: "In Progress", value: tasks.filter((t) => t.status === "IN_PROGRESS").length, color: "var(--violet-600)" },
    { name: "Complete", value: tasks.filter((t) => t.status === "COMPLETE").length, color: "var(--violet-700)" },
    { name: "Blocked", value: tasks.filter((t) => t.status === "BLOCKED").length, color: "var(--danger)" },
    { name: "Rejected", value: tasks.filter((t) => t.status === "REJECTED").length, color: "var(--danger-hover)" },
  ].filter((s) => s.value > 0);

  // Overdue tasks
  const now = new Date();
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "COMPLETE"
  );

  // Workload per person
  const workloadMap = new Map<string, { name: string; total: number; completed: number }>();
  tasks.forEach((task) => {
    task.assignments.forEach((a) => {
      const key = a.user.id;
      const existing = workloadMap.get(key) || { name: a.user.name || a.user.email, total: 0, completed: 0 };
      existing.total++;
      if (task.status === "COMPLETE") existing.completed++;
      workloadMap.set(key, existing);
    });
  });
  const workload = Array.from(workloadMap.values()).sort((a, b) => b.total - a.total).slice(0, 8);

  // Completion over time (last 30 days)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const completedTasks = tasks.filter(
    (t) => t.status === "COMPLETE" && t.updatedAt >= thirtyDaysAgo
  );
  const completionTimeline: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    const count = completedTasks.filter(
      (t) => t.updatedAt.toISOString().split("T")[0] === dateStr
    ).length;
    completionTimeline.push({ date: dateStr, count });
  }

  // Week-over-week trend — gives the hero chart something to actually say
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const completionsThisWeek = tasks.filter((t) => t.status === "COMPLETE" && t.updatedAt >= sevenDaysAgo).length;
  const completionsPrevWeek = tasks.filter(
    (t) => t.status === "COMPLETE" && t.updatedAt >= fourteenDaysAgo && t.updatedAt < sevenDaysAgo
  ).length;
  const weeklyTrendPct = completionsPrevWeek > 0
    ? Math.round(((completionsThisWeek - completionsPrevWeek) / completionsPrevWeek) * 100)
    : completionsThisWeek > 0 ? 100 : 0;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-[20px] sm:text-[22px] font-light tracking-tight text-heading">
          <span className="font-semibold">Analytics</span>
        </h1>
        <p className="mt-0.5 text-[13px] text-body">
          Your performance and activity across all projects
        </p>
      </div>

      <AnalyticsCharts
        statusBreakdown={statusBreakdown}
        completionTimeline={completionTimeline}
        workload={workload}
        overdueTasks={overdueTasks.map((t) => ({
          id: t.id,
          title: t.title,
          dueDate: t.dueDate!.toISOString(),
          projectName: t.graph.project.name,
        }))}
        totalTasks={tasks.length}
        completedCount={tasks.filter((t) => t.status === "COMPLETE").length}
        completionsThisWeek={completionsThisWeek}
        weeklyTrendPct={weeklyTrendPct}
      />
    </div>
  );
}
