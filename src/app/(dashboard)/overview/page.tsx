import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OverviewClient } from "./overview-client";

export default async function OverviewPage() {
  const user = await requireUser();

  const projects = await prisma.project.findMany({
    where: {
      members: {
        some: { userId: user.id, role: { in: ["HEAD", "CO_HEAD"] } },
      },
    },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true, imageUrl: true } } } },
      graphs: {
        include: {
          nodes: {
            include: {
              assignments: { include: { user: { select: { id: true, name: true, email: true } } } },
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const serialized = projects.map((p) => ({
    id: p.id,
    name: p.name,
    members: p.members.map((m) => ({
      id: m.id,
      role: m.role,
      user: m.user,
    })),
    tasks: p.graphs.flatMap((g) => g.nodes).map((n) => ({
      id: n.id,
      title: n.title,
      status: n.status,
      dueDate: n.dueDate?.toISOString() || null,
      assignees: n.assignments.map((a) => a.user),
    })),
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-[22px] font-bold tracking-tight text-[#1A1A1A]">Overview</h1>
        <p className="mt-0.5 text-[13px] text-[#6B7280]">
          Detailed progress for each project you lead
        </p>
      </div>

      <OverviewClient projects={serialized} />
    </div>
  );
}
