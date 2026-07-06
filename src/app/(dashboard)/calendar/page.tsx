import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CalendarGrid } from "./calendar-client";

export default async function CalendarPage() {
  const user = await requireUser();

  // Get all tasks with due dates for user's projects
  const tasks = await prisma.taskNode.findMany({
    where: {
      dueDate: { not: null },
      graph: {
        project: {
          members: { some: { userId: user.id } },
        },
      },
    },
    select: {
      id: true,
      title: true,
      status: true,
      dueDate: true,
      graph: {
        select: {
          project: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  const serializedTasks = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    dueDate: t.dueDate!.toISOString(),
    projectName: t.graph.project.name,
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Calendar
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        View tasks by their due dates
      </p>

      <div className="mt-6">
        <CalendarGrid tasks={serializedTasks} />
      </div>
    </div>
  );
}
