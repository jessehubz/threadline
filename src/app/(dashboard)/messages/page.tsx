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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Messages
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Chat with your team in project channels or direct messages
      </p>

      <div className="mt-6">
        <MessagesClient
          projects={projects}
          currentUserId={user.id}
        />
      </div>
    </div>
  );
}
