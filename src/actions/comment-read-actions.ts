"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function markCommentsRead(nodeId: string) {
  const user = await requireUser();
  await prisma.commentRead.upsert({
    where: { userId_nodeId: { userId: user.id, nodeId } },
    create: { userId: user.id, nodeId, lastReadAt: new Date() },
    update: { lastReadAt: new Date() },
  });
  return { success: true };
}

export async function getUnreadCommentNodes(projectId: string): Promise<string[]> {
  const user = await requireUser();

  // Get all nodes in this project that have comments
  const nodesWithComments = await prisma.taskNode.findMany({
    where: {
      graph: { projectId },
      comments: { some: {} },
    },
    select: {
      id: true,
      comments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
      commentReads: {
        where: { userId: user.id },
        select: { lastReadAt: true },
      },
    },
  });

  // Return node IDs that have unread comments
  const unreadNodeIds: string[] = [];
  for (const node of nodesWithComments) {
    const lastComment = node.comments[0];
    const lastRead = node.commentReads[0];
    if (lastComment && (!lastRead || lastComment.createdAt > lastRead.lastReadAt)) {
      unreadNodeIds.push(node.id);
    }
  }

  return unreadNodeIds;
}

export async function getNodeCommentStatus(nodeId: string): Promise<{ hasComments: boolean; hasUnread: boolean; commentCount: number }> {
  const user = await requireUser();

  const node = await prisma.taskNode.findUnique({
    where: { id: nodeId },
    select: {
      _count: { select: { comments: true } },
      comments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
      commentReads: {
        where: { userId: user.id },
        select: { lastReadAt: true },
      },
    },
  });

  if (!node) return { hasComments: false, hasUnread: false, commentCount: 0 };

  const commentCount = node._count.comments;
  const hasComments = commentCount > 0;
  const lastComment = node.comments[0];
  const lastRead = node.commentReads[0];
  const hasUnread = hasComments && (!lastRead || (lastComment ? lastComment.createdAt > lastRead.lastReadAt : false));

  return { hasComments, hasUnread, commentCount };
}
