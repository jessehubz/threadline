import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CalendarGrid } from "./calendar-client";

export default async function CalendarPage() {
  const user = await requireUser();

  // Get all tasks with due dates for user's projects
  const tasks = await prisma.taskNode.findMany({
    where: {
      dueDate: { not: null },
      deletedAt: null,
      graph: {
        project: {
          deletedAt: null,
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
    projectId: t.graph.project.id,
    projectName: t.graph.project.name,
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-10">
        <h1 className="text-headline"><span className="font-bold">Calendar</span></h1>
        <p className="mt-1.5 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          View tasks by their due dates
        </p>
      </div>

      <CalendarGrid tasks={serializedTasks} />
    </div>
  );
}
