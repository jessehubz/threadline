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
        <h1 className="text-[22px] font-bold tracking-tight text-[#1A1A1A]">Teams</h1>
        <p className="mt-0.5 text-[13px] text-[#6B7280]">
          Create teams and invite them to projects in one click.
        </p>
      </div>

      <TeamsGrid teams={teams} />
    </div>
  );
}
