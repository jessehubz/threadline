import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";
import { TeamsGrid } from "@/components/teams-grid";

export default async function TeamPage() {
  const user = await requireUser();

  const teams = await prisma.team.findMany({
    where: { ownerId: user.id },
    include: { members: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-[20px] font-light tracking-tight text-heading sm:text-[22px]">
          <span className="font-semibold">Teams</span>
        </h1>
        <p className="mt-0.5 text-[13px] text-body">
          Create teams and invite them to projects in one click.
        </p>
      </div>

      <TeamsGrid teams={teams} />
    </div>
  );
}
