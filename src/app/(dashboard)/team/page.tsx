import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TeamsGrid } from "@/components/teams-grid";
import { getProjects } from "@/actions/project-actions";

export default async function TeamPage() {
  const user = await requireUser();

  const [teams, projects] = await Promise.all([
    prisma.team.findMany({
      where: { ownerId: user.id },
      include: { members: { include: { user: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    getProjects(),
  ]);
  const projectList = projects.map((p) => ({ id: p.id, name: p.name }));

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-headline"><span className="font-bold">Teams</span></h1>
        <p className="mt-0.5 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          Create teams and invite them to projects in one click.
        </p>
      </div>

      <TeamsGrid teams={teams} projects={projectList} />
    </div>
  );
}
