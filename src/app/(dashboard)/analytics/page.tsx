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

  // Compute analytics data
  const statusBreakdown = [
    { name: "Not Started", value: tasks.filter((t) => t.status === "NOT_STARTED").length, color: "#9ca3af" },
    { name: "In Progress", value: tasks.filter((t) => t.status === "IN_PROGRESS").length, color: "#3b82f6" },
    { name: "Blocked", value: tasks.filter((t) => t.status === "BLOCKED").length, color: "#ef4444" },
    { name: "Awaiting Approval", value: tasks.filter((t) => t.status === "AWAITING_APPROVAL").length, color: "#f59e0b" },
    { name: "Rejected", value: tasks.filter((t) => t.status === "REJECTED").length, color: "#f97316" },
    { name: "Complete", value: tasks.filter((t) => t.status === "COMPLETE").length, color: "#22c55e" },
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
  const workload = Array.from(workloadMap.values());

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Track progress across all your projects
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
      />
    </div>
  );
}
