"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { sanitizeMessageContent } from "@/lib/sanitize";
import { rateLimiters } from "@/lib/rate-limit";
import { createNotification } from "@/lib/notifications";
import { z } from "zod/v4";

const sendMessageSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  content: z.string().min(1, "Message cannot be empty").max(2000),
});

export async function sendMessage(data: { projectId: string; content: string }) {
  const user = await requireUser();

  // Rate limit check
  const { success: rateLimitOk } = await rateLimiters.messages.check(user.id);
  if (!rateLimitOk) throw new Error("Rate limited. Please wait before sending more messages.");

  const parsed = sendMessageSchema.parse(data);

  // Sanitize content
  const content = sanitizeMessageContent(parsed.content);
  if (!content) {
    throw new Error("Message cannot be empty after sanitization");
  }

  // Verify user is a member of the project
  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId: parsed.projectId,
      },
    },
  });

  if (!membership) {
    throw new Error("You are not a member of this project");
  }

  const message = await prisma.message.create({
    data: {
      projectId: parsed.projectId,
      userId: user.id,
      content,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, imageUrl: true },
      },
    },
  });

  // Trigger real-time update via Pusher
  await pusherServer.trigger(
    `private-messages-${parsed.projectId}`,
    "new-message",
    {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      user: message.user,
    }
  );

  // Notify all other project members of the new message
  const [project, otherMembers] = await Promise.all([
    prisma.project.findUnique({ where: { id: parsed.projectId }, select: { name: true } }),
    prisma.projectMember.findMany({
      where: { projectId: parsed.projectId, userId: { not: user.id } },
      select: { userId: true },
    }),
  ]);
  const projectName = project?.name || "a project";
  await Promise.all(
    otherMembers.map((m) =>
      createNotification({
        userId: m.userId,
        type: "NEW_MESSAGE",
        title: `New message in ${projectName}`,
        relatedProjectId: parsed.projectId,
      })
    )
  );

  return message;
}

export async function getMessages(projectId: string, cursor?: string) {
  const user = await requireUser();

  // Verify user is a member of the project
  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId,
      },
    },
  });

  if (!membership) {
    throw new Error("You are not a member of this project");
  }

  const messages = await prisma.message.findMany({
    where: { projectId },
    include: {
      user: {
        select: { id: true, name: true, email: true, imageUrl: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    ...(cursor
      ? {
          skip: 1,
          cursor: { id: cursor },
        }
      : {}),
  });

  return messages.reverse();
}
