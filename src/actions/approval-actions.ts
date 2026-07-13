"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { pusherServer } from "@/lib/pusher";
import { rateLimiters } from "@/lib/rate-limit";
import { sanitizeTitle, sanitizeText } from "@/lib/sanitize";
import { z } from "zod/v4";

const rejectSchema = z.object({
  reason: z.string().min(1, "Reason is required").max(500),
});

export async function submitForApproval(projectId: string, nodeId: string) {
  const user = await requireUser();

  // Rate limit
  const { success: rateLimitOk } = await rateLimiters.sensitive.check(user.id);
  if (!rateLimitOk) return { error: "Too many requests. Please wait." };

  const node = await prisma.taskNode.findUnique({
    where: { id: nodeId },
    include: {
      assignments: true,
      graph: { select: { id: true, projectId: true } },
    },
  });

  if (!node) return { error: "Task not found" };

  // IDOR fix: verify node belongs to the specified project
  if (node.graph.projectId !== projectId) return { error: "Task not found" };

  // Verify user is a member of the project
  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });
  if (!membership || membership.role === "MEMBER") return { error: "Not authorized" };

  const approver = node.assignments.find((a) => a.isApprover);
  if (!approver) return { error: "No approver assigned" };

  await prisma.taskNode.update({
    where: { id: nodeId },
    data: { status: "AWAITING_APPROVAL" },
  });

  await prisma.completionRequest.create({
    data: {
      nodeId,
      requesterId: user.id,
      approverId: approver.userId,
    },
  });

  // Create notification for approver (sanitize title for safety)
  const safeTitle = sanitizeTitle(node.title);
  await prisma.notification.create({
    data: {
      userId: approver.userId,
      type: "APPROVAL_REQUESTED",
      message: `"${safeTitle}" is awaiting your approval`,
      relatedNodeId: nodeId,
      relatedProjectId: projectId,
    },
  });

  await pusherServer.trigger(`private-graph-${node.graph.id}`, "node-updated", {
    id: nodeId,
    status: "AWAITING_APPROVAL",
  });

  revalidatePath(`/graph/${projectId}`);
  return { success: true };
}

export async function approveCompletion(projectId: string, requestId: string) {
  const user = await requireUser();

  const request = await prisma.completionRequest.findUnique({
    where: { id: requestId },
    include: { node: { include: { graph: { select: { id: true, projectId: true } } } } },
  });

  if (!request) return { error: "Request not found" };

  // IDOR fix: verify request belongs to this project
  if (request.node.graph.projectId !== projectId) return { error: "Request not found" };

  if (request.approverId !== user.id) return { error: "Not authorized" };

  await prisma.completionRequest.update({
    where: { id: requestId },
    data: { status: "APPROVED" },
  });

  await prisma.taskNode.update({
    where: { id: request.nodeId },
    data: { status: "COMPLETE" },
  });

  const safeTitle = sanitizeTitle(request.node.title);
  await prisma.notification.create({
    data: {
      userId: request.requesterId,
      type: "APPROVED",
      message: `"${safeTitle}" has been approved`,
      relatedNodeId: request.nodeId,
      relatedProjectId: projectId,
    },
  });

  await pusherServer.trigger(`private-graph-${request.node.graph.id}`, "node-updated", {
    id: request.nodeId,
    status: "COMPLETE",
  });

  revalidatePath(`/graph/${projectId}`);
  return { success: true };
}

export async function rejectCompletion(projectId: string, requestId: string, reason: string) {
  const user = await requireUser();

  // Validate reason
  const parsed = rejectSchema.parse({ reason });
  const sanitizedReason = sanitizeText(parsed.reason);

  const request = await prisma.completionRequest.findUnique({
    where: { id: requestId },
    include: { node: { include: { graph: { select: { id: true, projectId: true } } } } },
  });

  if (!request) return { error: "Request not found" };

  // IDOR fix: verify request belongs to this project
  if (request.node.graph.projectId !== projectId) return { error: "Request not found" };

  if (request.approverId !== user.id) return { error: "Not authorized" };

  await prisma.completionRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED", rejectionReason: sanitizedReason },
  });

  await prisma.taskNode.update({
    where: { id: request.nodeId },
    data: { status: "URGENT" },
  });

  const safeTitle = sanitizeTitle(request.node.title);
  await prisma.notification.create({
    data: {
      userId: request.requesterId,
      type: "REJECTED",
      message: `"${safeTitle}" was rejected: ${sanitizedReason}`,
      relatedNodeId: request.nodeId,
      relatedProjectId: projectId,
    },
  });

  await pusherServer.trigger(`private-graph-${request.node.graph.id}`, "node-updated", {
    id: request.nodeId,
    status: "URGENT",
  });

  revalidatePath(`/graph/${projectId}`);
  return { success: true };
}
