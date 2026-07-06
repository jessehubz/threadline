"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { sanitizeMessageContent } from "@/lib/sanitize";
import { rateLimiters } from "@/lib/rate-limit";
import { z } from "zod/v4";

const sendDMSchema = z.object({
  conversationId: z.string().min(1, "Conversation is required"),
  content: z.string().min(1, "Message cannot be empty").max(2000),
});

export async function getConversations() {
  const user = await requireUser();

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId: user.id },
      },
    },
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, email: true, imageUrl: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return conversations;
}

export async function getOrCreateConversation(otherUserId: string) {
  const user = await requireUser();

  if (otherUserId === user.id) {
    throw new Error("Cannot create a conversation with yourself");
  }

  // Verify the other user exists
  const otherUser = await prisma.user.findUnique({
    where: { id: otherUserId },
    select: { id: true },
  });

  if (!otherUser) {
    throw new Error("User not found");
  }

  // Check if a 1-on-1 conversation already exists between these two users
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      isGroup: false,
      AND: [
        { participants: { some: { userId: user.id } } },
        { participants: { some: { userId: otherUserId } } },
      ],
    },
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, email: true, imageUrl: true } },
        },
      },
    },
  });

  if (existingConversation) {
    return existingConversation;
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      isGroup: false,
      participants: {
        create: [
          { userId: user.id },
          { userId: otherUserId },
        ],
      },
    },
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, email: true, imageUrl: true } },
        },
      },
    },
  });

  return conversation;
}

export async function sendDirectMessage(data: { conversationId: string; content: string }) {
  const user = await requireUser();

  // Rate limit
  const { success: rateLimitOk } = await rateLimiters.messages.check(user.id);
  if (!rateLimitOk) {
    throw new Error("Rate limited. Please wait before sending more messages.");
  }

  const parsed = sendDMSchema.parse(data);

  // Sanitize
  const content = sanitizeMessageContent(parsed.content);
  if (!content) {
    throw new Error("Message cannot be empty after sanitization");
  }

  // Verify user is a participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId: parsed.conversationId,
        userId: user.id,
      },
    },
  });

  if (!participant) {
    throw new Error("You are not a participant in this conversation");
  }

  const message = await prisma.directMessage.create({
    data: {
      conversationId: parsed.conversationId,
      userId: user.id,
      content,
    },
    include: {
      user: { select: { id: true, name: true, email: true, imageUrl: true } },
    },
  });

  // Update conversation timestamp
  await prisma.conversation.update({
    where: { id: parsed.conversationId },
    data: { updatedAt: new Date() },
  });

  // Trigger real-time update
  await pusherServer.trigger(
    `private-dm-${parsed.conversationId}`,
    "new-dm",
    {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      user: message.user,
    }
  );

  return message;
}

export async function getDirectMessages(conversationId: string, cursor?: string) {
  const user = await requireUser();

  // Verify user is a participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: user.id,
      },
    },
  });

  if (!participant) {
    throw new Error("You are not a participant in this conversation");
  }

  const messages = await prisma.directMessage.findMany({
    where: { conversationId },
    include: {
      user: { select: { id: true, name: true, email: true, imageUrl: true } },
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

export async function getTeamMembers() {
  const user = await requireUser();

  // Get all users that share a project with the current user
  const myProjects = await prisma.projectMember.findMany({
    where: { userId: user.id },
    select: { projectId: true },
  });

  const projectIds = myProjects.map((p) => p.projectId);

  const teammates = await prisma.user.findMany({
    where: {
      id: { not: user.id },
      memberships: {
        some: { projectId: { in: projectIds } },
      },
    },
    select: { id: true, name: true, email: true, imageUrl: true },
    distinct: ["id"],
  });

  return teammates;
}
