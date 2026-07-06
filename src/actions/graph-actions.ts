"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { wouldCreateCycle, canCompleteNode, deriveParentStatus } from "@/lib/graph-utils";
import { pusherServer } from "@/lib/pusher";

async function requireProjectAccess(projectId: string, minRole: "VIEWER" | "EDITOR" | "OWNER" = "VIEWER") {
  const user = await requireUser();
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });

  if (!member) throw new Error("Not a member of this project");

  const roleHierarchy = { VIEWER: 0, EDITOR: 1, OWNER: 2 };
  if (roleHierarchy[member.role] < roleHierarchy[minRole]) {
    throw new Error("Insufficient permissions");
  }

  return { user, member };
}

export async function getGraphData(projectId: string, graphId?: string) {
  const user = await requireUser();

  // Check membership
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });

  if (!member) throw new Error("Not a member of this project");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { graphs: { take: 1, orderBy: { createdAt: "asc" } } },
  });

  if (!project) throw new Error("Project not found");

  const targetGraphId = graphId || project.graphs[0]?.id;
  if (!targetGraphId) throw new Error("No graph found");

  const graph = await prisma.graph.findUnique({
    where: { id: targetGraphId },
    include: {
      nodes: {
        include: {
          assignments: { include: { user: true } },
          attachments: true,
          subGraph: { include: { nodes: { select: { id: true, status: true } } } },
          incomingEdges: true,
          outgoingEdges: true,
        },
      },
      edges: true,
    },
  });

  if (!graph) throw new Error("Graph not found");

  return {
    project: { id: project.id, name: project.name },
    graph,
    role: member.role,
  };
}

export async function createNode(
  projectId: string,
  graphId: string,
  data: { title?: string; positionX: number; positionY: number; nodeType?: string; color?: string }
) {
  const { user } = await requireProjectAccess(projectId, "EDITOR");

  const node = await prisma.taskNode.create({
    data: {
      graphId,
      title: data.title || (data.nodeType === "FOLDER" ? "New Folder" : "New Task"),
      nodeType: (data.nodeType as "TASK" | "FOLDER") || "TASK",
      color: data.color || null,
      positionX: data.positionX,
      positionY: data.positionY,
    },
    include: {
      assignments: { include: { user: true } },
      attachments: true,
      incomingEdges: true,
      outgoingEdges: true,
    },
  });

  await pusherServer.trigger(`private-graph-${graphId}`, "node-created", node);
  return node;
}

export async function updateNode(
  projectId: string,
  nodeId: string,
  data: {
    title?: string;
    description?: string;
    status?: string;
    color?: string | null;
    dueDate?: string | null;
    positionX?: number;
    positionY?: number;
  }
) {
  const { user } = await requireProjectAccess(projectId, "EDITOR");

  const existingNode = await prisma.taskNode.findUnique({
    where: { id: nodeId },
    include: { incomingEdges: true, outgoingEdges: true, graph: true },
  });

  if (!existingNode) throw new Error("Node not found");

  // If trying to complete, check dependencies
  if (data.status === "COMPLETE" || data.status === "AWAITING_APPROVAL") {
    const graphEdges = await prisma.edge.findMany({
      where: { graphId: existingNode.graphId },
    });
    const nodeStatuses = new Map<string, string>();
    const allNodes = await prisma.taskNode.findMany({
      where: { graphId: existingNode.graphId },
      select: { id: true, status: true },
    });
    allNodes.forEach((n) => nodeStatuses.set(n.id, n.status));

    if (!canCompleteNode(nodeId, graphEdges, nodeStatuses)) {
      return { error: "Cannot complete: upstream dependencies are not finished" };
    }
  }

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.color !== undefined) updateData.color = data.color;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.positionX !== undefined) updateData.positionX = data.positionX;
  if (data.positionY !== undefined) updateData.positionY = data.positionY;

  const node = await prisma.taskNode.update({
    where: { id: nodeId },
    data: updateData,
    include: {
      assignments: { include: { user: true } },
      attachments: true,
      incomingEdges: true,
      outgoingEdges: true,
    },
  });

  // If status changed, propagate
  if (data.status && data.status !== existingNode.status) {
    await propagateStatusChange(existingNode.graphId, nodeId, data.status);
  }

  await pusherServer.trigger(`private-graph-${existingNode.graphId}`, "node-updated", node);
  return { node };
}

export async function updateNodePosition(
  projectId: string,
  nodeId: string,
  positionX: number,
  positionY: number
) {
  await requireProjectAccess(projectId, "EDITOR");

  const node = await prisma.taskNode.update({
    where: { id: nodeId },
    data: { positionX, positionY },
    select: { id: true, graphId: true, positionX: true, positionY: true },
  });

  await pusherServer.trigger(`private-graph-${node.graphId}`, "node-moved", {
    id: node.id,
    positionX: node.positionX,
    positionY: node.positionY,
  });

  return node;
}

export async function deleteNode(projectId: string, nodeId: string) {
  await requireProjectAccess(projectId, "EDITOR");

  const node = await prisma.taskNode.findUnique({
    where: { id: nodeId },
    select: { id: true, graphId: true },
  });

  if (!node) throw new Error("Node not found");

  await prisma.taskNode.delete({ where: { id: nodeId } });
  await pusherServer.trigger(`private-graph-${node.graphId}`, "node-deleted", { id: nodeId });
  return { success: true };
}

export async function createEdge(
  projectId: string,
  graphId: string,
  sourceNodeId: string,
  targetNodeId: string
) {
  await requireProjectAccess(projectId, "EDITOR");

  // Get all edges in this graph for cycle detection
  const existingEdges = await prisma.edge.findMany({
    where: { graphId },
    select: { sourceNodeId: true, targetNodeId: true },
  });

  // Check for cycles
  if (wouldCreateCycle(existingEdges, sourceNodeId, targetNodeId)) {
    return { error: "Cannot create connection: would create a circular dependency" };
  }

  // Check if edge already exists
  const existing = await prisma.edge.findUnique({
    where: { sourceNodeId_targetNodeId: { sourceNodeId, targetNodeId } },
  });
  if (existing) {
    return { error: "Connection already exists" };
  }

  const edge = await prisma.edge.create({
    data: { graphId, sourceNodeId, targetNodeId },
  });

  await pusherServer.trigger(`private-graph-${graphId}`, "edge-created", edge);
  return { edge };
}

export async function deleteEdge(projectId: string, edgeId: string) {
  await requireProjectAccess(projectId, "EDITOR");

  const edge = await prisma.edge.findUnique({
    where: { id: edgeId },
    select: { id: true, graphId: true },
  });

  if (!edge) throw new Error("Edge not found");

  await prisma.edge.delete({ where: { id: edgeId } });
  await pusherServer.trigger(`private-graph-${edge.graphId}`, "edge-deleted", { id: edgeId });
  return { success: true };
}

export async function createSubGraph(projectId: string, nodeId: string) {
  await requireProjectAccess(projectId, "EDITOR");

  const node = await prisma.taskNode.findUnique({
    where: { id: nodeId },
    include: { graph: true },
  });

  if (!node) throw new Error("Node not found");
  if (node.subGraphId) throw new Error("Node already has a sub-graph");

  const subGraph = await prisma.graph.create({
    data: {
      projectId,
      name: node.title,
    },
  });

  await prisma.taskNode.update({
    where: { id: nodeId },
    data: { subGraphId: subGraph.id },
  });

  revalidatePath(`/graph/${projectId}`);
  return { graphId: subGraph.id };
}

export async function getBreadcrumbs(projectId: string, path: string[]) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { name: true },
  });

  const breadcrumbs: { id: string; name: string; graphId?: string }[] = [
    { id: projectId, name: project?.name || "Project" },
  ];

  for (const nodeId of path) {
    const node = await prisma.taskNode.findUnique({
      where: { id: nodeId },
      select: { id: true, title: true, subGraphId: true },
    });
    if (node) {
      breadcrumbs.push({ id: node.id, name: node.title, graphId: node.subGraphId || undefined });
    }
  }

  return breadcrumbs;
}

async function propagateStatusChange(graphId: string, changedNodeId: string, newStatus: string) {
  const edges = await prisma.edge.findMany({ where: { graphId } });
  const allNodes = await prisma.taskNode.findMany({
    where: { graphId },
    select: { id: true, status: true },
  });

  const nodeStatuses = new Map<string, string>(allNodes.map((n) => [n.id, n.status]));
  nodeStatuses.set(changedNodeId, newStatus);

  // Find downstream nodes
  const downstreamEdges = edges.filter((e) => e.sourceNodeId === changedNodeId);

  for (const edge of downstreamEdges) {
    const targetId = edge.targetNodeId;
    const targetStatus = nodeStatuses.get(targetId);

    if (newStatus === "COMPLETE" && targetStatus === "BLOCKED") {
      // Check if all predecessors are now complete
      if (canCompleteNode(targetId, edges, nodeStatuses)) {
        await prisma.taskNode.update({
          where: { id: targetId },
          data: { status: "NOT_STARTED" },
        });
      }
    }
  }

  // Update parent node status if this graph is a sub-graph
  const graph = await prisma.graph.findUnique({
    where: { id: graphId },
    include: { parentNode: true },
  });

  if (graph?.parentNode) {
    const childStatuses = Array.from(nodeStatuses.values());
    const derivedStatus = deriveParentStatus(childStatuses);
    await prisma.taskNode.update({
      where: { id: graph.parentNode.id },
      data: { status: derivedStatus as "NOT_STARTED" | "IN_PROGRESS" | "BLOCKED" | "COMPLETE" },
    });
  }
}
