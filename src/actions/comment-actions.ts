"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { sanitizeMessageContent } from "@/lib/sanitize";
import { rateLimiters } from "@/lib/rate-limit";
import { pusherServer } from "@/lib/pusher";
import { z } from "zod/v4";

const addCommentSchema = z.object({
  nodeId: z.string().min(1, "Node is required"),
  content: z.string().min(1, "Comment cannot be empty").max(5000),
  isPrivate: z.boolean().optional(),
  attachments: z
    .array(
      z.object({
        fileName: z.string(),
        fileUrl: z.string().url(),
        fileType: z.string(),
        fileSize: z.number(),
      })
    )
    .optional(),
});

export async function addComment(data: {
  nodeId: string;
  content: string;
  isPrivate?: boolean;
  attachments?: { fileName: string; fileUrl: string; fileType: string; fileSize: number }[];
}) {
  const user = await requireUser();

  // Rate limit
  const { success: rateLimitOk } = await rateLimiters.messages.check(user.id);
  if (!rateLimitOk) {
    return { error: "Rate limited. Please wait before posting more comments." };
  }

  const parsed = addCommentSchema.parse(data);

  // Sanitize content
  const content = sanitizeMessageContent(parsed.content);
  if (!content) {
    return { error: "Comment cannot be empty after sanitization" };
  }

  // Verify node belongs to a project the user is a member of
  const node = await prisma.taskNode.findUnique({
    where: { id: parsed.nodeId },
    include: {
      graph: {
        include: {
          project: {
            include: {
              members: { where: { userId: user.id } },
            },
          },
        },
      },
    },
  });

  if (!node || node.graph.project.members.length === 0) {
    return { error: "Node not found or access denied" };
  }

  // Create comment with optional attachments
  const comment = await prisma.comment.create({
    data: {
      nodeId: parsed.nodeId,
      userId: user.id,
      content,
      isPrivate: parsed.isPrivate ?? false,
      attachments: parsed.attachments?.length
        ? {
            create: parsed.attachments.map((a) => ({
              fileName: a.fileName,
              fileUrl: a.fileUrl,
              fileType: a.fileType,
              fileSize: a.fileSize,
            })),
          }
        : undefined,
    },
    include: {
      user: { select: { id: true, name: true, email: true, imageUrl: true } },
      attachments: true,
    },
  });

  // Get updated comment count for real-time indicator
  const commentCount = await prisma.comment.count({ where: { nodeId: parsed.nodeId } });

  // Mark comments as read for the author (their own comments should not appear as unread)
  await prisma.commentRead.upsert({
    where: { userId_nodeId: { userId: user.id, nodeId: parsed.nodeId } },
    create: { userId: user.id, nodeId: parsed.nodeId, lastReadAt: new Date() },
    update: { lastReadAt: new Date() },
  });

  // Broadcast real-time update so all viewers see the comment indicator immediately
  await pusherServer.trigger(`private-graph-${node.graph.id}`, "node-updated", {
    id: parsed.nodeId,
    commentCount,
    lastCommentUserId: user.id,
  });

  return { comment };
}

export async function deleteComment(commentId: string) {
  const user = await requireUser();

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      node: {
        include: {
          graph: {
            include: {
              project: {
                include: {
                  members: { where: { userId: user.id } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!comment) {
    return { error: "Comment not found" };
  }

  // Only the comment author or project owner can delete
  const membership = comment.node.graph.project.members[0];
  if (!membership) {
    return { error: "Access denied" };
  }

  if (comment.userId !== user.id && membership.role !== "HEAD") {
    return { error: "Only the author or project owner can delete this comment" };
  }

  await prisma.comment.delete({ where: { id: commentId } });

  // Get updated comment count for real-time indicator
  const commentCount = await prisma.comment.count({ where: { nodeId: comment.nodeId } });

  // Broadcast real-time update so comment indicator reflects deletion
  await pusherServer.trigger(`private-graph-${comment.node.graph.id}`, "node-updated", {
    id: comment.nodeId,
    commentCount,
  });

  return { success: true };
}
