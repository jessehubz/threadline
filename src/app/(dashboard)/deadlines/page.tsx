import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DeadlinesClient } from "./deadlines-client";

export default async function DeadlinesPage() {
  const user = await requireUser();

  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const allTasks = await prisma.taskNode.findMany({
    where: {
      deletedAt: null,
      status: { not: "COMPLETE" },
      graph: { project: { deletedAt: null, members: { some: { userId: user.id } } } },
    },
    include: {
      graph: { include: { project: { select: { id: true, name: true } } } },
    },
  });

  function toItem(t: (typeof allTasks)[number], daysOverdue?: number) {
    return {
      id: t.id,
      title: t.title,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
      projectId: t.graph.project.id,
      projectName: t.graph.project.name,
      daysOverdue,
    };
  }

  const overdue = allTasks
    .filter((t) => t.dueDate && t.dueDate < now)
    .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())
    .map((t) => toItem(t, Math.floor((now.getTime() - t.dueDate!.getTime()) / (1000 * 60 * 60 * 24))));

  const dueToday = allTasks
    .filter((t) => t.dueDate && t.dueDate >= now && t.dueDate < todayEnd)
    .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())
    .map((t) => toItem(t));

  const dueThisWeek = allTasks
    .filter((t) => t.dueDate && t.dueDate >= todayEnd && t.dueDate < weekEnd)
    .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())
    .map((t) => toItem(t));

  const dueLater = allTasks
    .filter((t) => !t.dueDate || t.dueDate >= weekEnd)
    .sort((a, b) => {
      if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime();
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    })
    .map((t) => toItem(t));

  return <DeadlinesClient overdue={overdue} dueToday={dueToday} dueThisWeek={dueThisWeek} dueLater={dueLater} />;
}
