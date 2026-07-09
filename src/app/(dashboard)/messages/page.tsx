import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MessagesClient } from "./messages-client";

export default async function MessagesPage() {
  const user = await requireUser();

  const projects = await prisma.project.findMany({
    where: {
      members: {
        some: { userId: user.id },
      },
    },
    select: { id: true, name: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
          Messages
        </h1>
        <p className="mt-1.5 text-sm text-[#6B7280]">
          Chat with your team in project channels or direct messages
        </p>
      </div>

      <MessagesClient
        projects={projects}
        currentUserId={user.id}
      />
    </div>
  );
}
