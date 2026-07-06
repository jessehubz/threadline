"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { pusherServer } from "@/lib/pusher";

export async function submitForApproval(projectId: string, nodeId: string) {
  const user = await requireUser();

  const node = await prisma.taskNode.findUnique({
    where: { id: nodeId },
    include: {
      assignments: true,
      graph: true,
    },
  });

  if (!node) return { error: "Task not found" };

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

  // Create notification for approver
  await prisma.notification.create({
    data: {
      userId: approver.userId,
      type: "APPROVAL_REQUESTED",
      message: `"${node.title}" is awaiting your approval`,
      relatedNodeId: nodeId,
      relatedProjectId: projectId,
    },
  });

  await pusherServer.trigger(`private-graph-${node.graphId}`, "node-updated", {
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
    include: { node: { include: { graph: true } } },
  });

  if (!request) return { error: "Request not found" };
  if (request.approverId !== user.id) return { error: "Not authorized" };

  await prisma.completionRequest.update({
    where: { id: requestId },
    data: { status: "APPROVED" },
  });

  await prisma.taskNode.update({
    where: { id: request.nodeId },
    data: { status: "COMPLETE" },
  });

  await prisma.notification.create({
    data: {
      userId: request.requesterId,
      type: "APPROVED",
      message: `"${request.node.title}" has been approved`,
      relatedNodeId: request.nodeId,
      relatedProjectId: projectId,
    },
  });

  await pusherServer.trigger(`private-graph-${request.node.graphId}`, "node-updated", {
    id: request.nodeId,
    status: "COMPLETE",
  });

  revalidatePath(`/graph/${projectId}`);
  return { success: true };
}

export async function rejectCompletion(projectId: string, requestId: string, reason: string) {
  const user = await requireUser();

  const request = await prisma.completionRequest.findUnique({
    where: { id: requestId },
    include: { node: { include: { graph: true } } },
  });

  if (!request) return { error: "Request not found" };
  if (request.approverId !== user.id) return { error: "Not authorized" };

  await prisma.completionRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED", rejectionReason: reason },
  });

  await prisma.taskNode.update({
    where: { id: request.nodeId },
    data: { status: "REJECTED" },
  });

  await prisma.notification.create({
    data: {
      userId: request.requesterId,
      type: "REJECTED",
      message: `"${request.node.title}" was rejected: ${reason}`,
      relatedNodeId: request.nodeId,
      relatedProjectId: projectId,
    },
  });

  await pusherServer.trigger(`private-graph-${request.node.graphId}`, "node-updated", {
    id: request.nodeId,
    status: "REJECTED",
  });

  revalidatePath(`/graph/${projectId}`);
  return { success: true };
}
