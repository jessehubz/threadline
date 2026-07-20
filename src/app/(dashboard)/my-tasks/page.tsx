import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MyTasksList } from "@/components/my-tasks-list";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarDays } from "lucide-react";

export default async function MyTasksPage() {
  const user = await requireUser();

  const assignments = await prisma.taskAssignment.findMany({
    where: {
      userId: user.id,
      node: { deletedAt: null, graph: { project: { deletedAt: null } } },
    },
    include: {
      node: {
        include: {
          graph: {
            include: { project: true },
          },
        },
      },
    },
    orderBy: { node: { dueDate: "asc" } },
  });

  const tasks = assignments.map((a) => ({
    id: a.node.id,
    title: a.node.title,
    status: a.node.status,
    priority: a.node.priority,
    dueDate: a.node.dueDate?.toISOString() || null,
    projectId: a.node.graph.projectId,
    projectName: a.node.graph.project.name,
    graphId: a.node.graphId,
  }));

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-10">
        <h1 className="text-headline">My <span className="font-bold">Tasks</span></h1>
        <p className="mt-1.5 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          All tasks assigned to you across projects
        </p>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-8 w-8" />}
          title="No tasks assigned"
          description="When someone assigns you a task, it will appear here."
        />
      ) : (
        <MyTasksList tasks={tasks} />
      )}
    </div>
  );
}
