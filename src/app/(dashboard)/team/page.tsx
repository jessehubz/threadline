import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TeamManager } from "@/components/team-manager";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";

export default async function TeamPage() {
  const user = await requireUser();

  const projects = await prisma.project.findMany({
    where: { members: { some: { userId: user.id } } },
    include: {
      members: {
        include: { user: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  if (projects.length === 0) {
    return (
      <div>
        <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">Team</h1>
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="No projects yet"
          description="Create a project first, then you can manage team members here."
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage project members and permissions
        </p>
      </div>
      <TeamManager projects={projects} currentUserId={user.id} />
    </div>
  );
}
