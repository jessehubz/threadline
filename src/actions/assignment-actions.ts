"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { createNotification } from "@/lib/notifications";
import { getEffectivePermissions } from "@/lib/permissions";
import { logNodeChange } from "@/actions/audit-actions";

// Resolves canEditNodes for the current user, converting the "not a member"
// throw into the {error} return convention this file uses.
async function requireCanEditNodes(userId: string, projectId: string) {
  try {
    const { perms } = await getEffectivePermissions(userId, projectId);
    if (!perms.canEditNodes) return { error: "Not authorized" as const };
    return { error: null };
  } catch {
    return { error: "Not authorized" as const };
  }
}

export async function assignUser(projectId: string, nodeId: string, userId: string, isApprover: boolean = false) {
  const currentUser = await requireUser();

  // Verify project membership and require canEditNodes permission
  const access = await requireCanEditNodes(currentUser.id, projectId);
  if (access.error) return { error: access.error };

  // IDOR fix: verify node belongs to this project
  const node = await prisma.taskNode.findUnique({
    where: { id: nodeId },
    select: { graphId: true, graph: { select: { projectId: true } } },
  });
  if (!node || node.graph.projectId !== projectId) return { error: "Task not found" };

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
    await createNotification({
      userId,
      type: "ASSIGNED",
      title: "You were assigned to a task",
      relatedNodeId: nodeId,
      relatedProjectId: projectId,
    });
  }

  await pusherServer.trigger(`private-graph-${node.graphId}`, "node-updated", { id: nodeId });

  logNodeChange(nodeId, "assignee_added", null, assignment.user.name || assignment.user.email).catch(() => {});

  return { assignment };
}

export async function unassignUser(projectId: string, nodeId: string, userId: string) {
  const currentUser = await requireUser();

  // Verify project membership and require canEditNodes permission
  const access = await requireCanEditNodes(currentUser.id, projectId);
  if (access.error) return { error: access.error };

  // IDOR fix: verify node belongs to this project
  const node = await prisma.taskNode.findUnique({
    where: { id: nodeId },
    select: { graphId: true, graph: { select: { projectId: true } } },
  });
  if (!node || node.graph.projectId !== projectId) return { error: "Task not found" };

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  await prisma.taskAssignment.delete({
    where: { nodeId_userId: { nodeId, userId } },
  }).catch(() => {});

  await pusherServer.trigger(`private-graph-${node.graphId}`, "node-updated", { id: nodeId });

  logNodeChange(nodeId, "assignee_removed", null, targetUser?.name || targetUser?.email || null).catch(() => {});

  return { success: true };
}

export async function setApprover(projectId: string, nodeId: string, userId: string, isApprover: boolean) {
  const currentUser = await requireUser();

  // Verify project membership and require canEditNodes permission
  const access = await requireCanEditNodes(currentUser.id, projectId);
  if (access.error) return { error: access.error };

  // IDOR fix: verify node belongs to this project
  const node = await prisma.taskNode.findUnique({
    where: { id: nodeId },
    select: { graphId: true, graph: { select: { projectId: true } } },
  });
  if (!node || node.graph.projectId !== projectId) return { error: "Task not found" };

  const assignment = await prisma.taskAssignment
    .update({
      where: { nodeId_userId: { nodeId, userId } },
      data: { isApprover },
      include: { user: true },
    })
    .catch(() => null);

  if (!assignment) return { error: "User is not assigned to this task" };

  await pusherServer.trigger(`private-graph-${node.graphId}`, "node-updated", { id: nodeId });

  logNodeChange(
    nodeId,
    isApprover ? "approver_set" : "approver_removed",
    null,
    assignment.user.name || assignment.user.email
  ).catch(() => {});

  return { assignment };
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
