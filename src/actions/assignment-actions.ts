"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

export async function assignUser(projectId: string, nodeId: string, userId: string, isApprover: boolean = false) {
  const currentUser = await requireUser();

  // Verify project membership
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: currentUser.id, projectId } },
  });
  if (!member) return { error: "Not authorized" };

  // Verify target user is a project member
  const targetMember = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
  if (!targetMember) return { error: "User is not a project member" };

  const assignment = await prisma.taskAssignment.upsert({
    where: { nodeId_userId: { nodeId, userId } },
    update: { isApprover },
    create: { nodeId, userId, isApprover },
    include: { user: true },
  });

  // Notify the assigned user
  if (userId !== currentUser.id) {
    await prisma.notification.create({
      data: {
        userId,
        type: "ASSIGNED",
        message: `You were assigned to a task`,
        relatedNodeId: nodeId,
        relatedProjectId: projectId,
      },
    });
  }

  const node = await prisma.taskNode.findUnique({ where: { id: nodeId }, select: { graphId: true } });
  if (node) {
    await pusherServer.trigger(`private-graph-${node.graphId}`, "node-updated", { id: nodeId });
  }

  return { assignment };
}

export async function unassignUser(projectId: string, nodeId: string, userId: string) {
  const currentUser = await requireUser();

  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: currentUser.id, projectId } },
  });
  if (!member) return { error: "Not authorized" };

  await prisma.taskAssignment.delete({
    where: { nodeId_userId: { nodeId, userId } },
  }).catch(() => {});

  const node = await prisma.taskNode.findUnique({ where: { id: nodeId }, select: { graphId: true } });
  if (node) {
    await pusherServer.trigger(`private-graph-${node.graphId}`, "node-updated", { id: nodeId });
  }

  return { success: true };
}

export async function getProjectMembers(projectId: string) {
  const user = await requireUser();

  // IDOR check: verify requester is a member of this project
  const requesterMembership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId: user.id, projectId },
    },
  });

  if (!requesterMembership) {
    throw new Error("Not a member of this project");
  }

  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: { user: true },
  });

  return members;
}
