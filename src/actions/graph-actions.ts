"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { wouldCreateCycle, canCompleteNode, deriveParentStatus } from "@/lib/graph-utils";
import { pusherServer } from "@/lib/pusher";
import { sanitizeTitle, sanitizeText } from "@/lib/sanitize";
import { rateLimiters } from "@/lib/rate-limit";

async function requireProjectAccess(projectId: string, minRole: "MEMBER" | "CO_HEAD" | "HEAD" | "EDITOR" | "VIEWER" | "OWNER" = "MEMBER") {
  const user = await requireUser();
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });

  if (!member) throw new Error("Not a member of this project");

  const roleHierarchy: Record<string, number> = { MEMBER: 0, VIEWER: 0, CO_HEAD: 1, EDITOR: 1, HEAD: 2, OWNER: 2 };
  if ((roleHierarchy[member.role] ?? 0) < (roleHierarchy[minRole] ?? 0)) {
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

  // IDOR fix: verify graph belongs to this project
  const graph = await prisma.graph.findUnique({
    where: { id: targetGraphId, projectId },
    include: {
      nodes: {
        where: { deletedAt: null },
        include: {
          assignments: {
            include: {
              user: {
                select: { id: true, name: true, email: true, imageUrl: true },
              },
            },
          },
          attachments: true,
          subGraph: { include: { nodes: { select: { id: true, status: true } } } },
          incomingEdges: true,
          outgoingEdges: true,
          _count: { select: { comments: true } },
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

  // Rate limit node creation
  const { success: rateLimitOk } = await rateLimiters.api.check(user.id);
  if (!rateLimitOk) throw new Error("Too many requests. Please wait.");

  // IDOR fix: verify graph belongs to this project
  const graph = await prisma.graph.findUnique({
    where: { id: graphId, projectId },
    select: { id: true },
  });
  if (!graph) throw new Error("Graph not found in this project");

  // Validate inputs
  if (!Number.isFinite(data.positionX) || !Number.isFinite(data.positionY)) {
    throw new Error("Invalid position");
  }
  if (data.color && !/^#[0-9a-fA-F]{6}$/.test(data.color)) {
    throw new Error("Invalid color");
  }
  if (data.nodeType && !["TASK", "FOLDER"].includes(data.nodeType)) {
    throw new Error("Invalid node type");
  }

  const node = await prisma.taskNode.create({
    data: {
      graphId,
      title: sanitizeTitle(data.title || (data.nodeType === "FOLDER" ? "New Folder" : "New Task")),
      nodeType: (data.nodeType as "TASK" | "FOLDER") || "TASK",
      color: data.color || null,
      positionX: data.positionX,
      positionY: data.positionY,
    },
    include: {
      assignments: {
        include: {
          user: { select: { id: true, name: true, email: true, imageUrl: true } },
        },
      },
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
  await requireProjectAccess(projectId, "EDITOR");

  const existingNode = await prisma.taskNode.findUnique({
    where: { id: nodeId },
    include: { incomingEdges: true, outgoingEdges: true, graph: { select: { projectId: true } } },
  });

  if (!existingNode) throw new Error("Node not found");

  // IDOR fix: verify node belongs to this project
  if (existingNode.graph.projectId !== projectId) throw new Error("Node not found");

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
  if (data.title !== undefined) updateData.title = sanitizeTitle(data.title);
  if (data.description !== undefined) updateData.description = data.description ? sanitizeText(data.description) : null;
  if (data.status !== undefined) {
    const validStatuses = ["NOT_STARTED", "IN_PROGRESS", "BLOCKED", "AWAITING_APPROVAL", "REJECTED", "COMPLETE"];
    if (!validStatuses.includes(data.status)) throw new Error("Invalid status");
    updateData.status = data.status;
  }
  if (data.color !== undefined) {
    // Allow null or valid hex color
    if (data.color !== null && !/^#[0-9a-fA-F]{6}$/.test(data.color)) throw new Error("Invalid color");
    updateData.color = data.color;
  }
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.positionX !== undefined) {
    if (!Number.isFinite(data.positionX)) throw new Error("Invalid position");
    updateData.positionX = data.positionX;
  }
  if (data.positionY !== undefined) {
    if (!Number.isFinite(data.positionY)) throw new Error("Invalid position");
    updateData.positionY = data.positionY;
  }

  const node = await prisma.taskNode.update({
    where: { id: nodeId },
    data: updateData,
    include: {
      assignments: {
        include: {
          user: { select: { id: true, name: true, email: true, imageUrl: true } },
        },
      },
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

  // IDOR fix: verify node belongs to this project
  const existingNode = await prisma.taskNode.findUnique({
    where: { id: nodeId },
    select: { graph: { select: { projectId: true } } },
  });
  if (!existingNode || existingNode.graph.projectId !== projectId) {
    throw new Error("Node not found");
  }

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
    select: { id: true, graphId: true, title: true, nodeType: true, graph: { select: { projectId: true } } },
  });

  if (!node) throw new Error("Node not found");

  // IDOR fix: verify node belongs to this project
  if (node.graph.projectId !== projectId) throw new Error("Node not found");

  // Soft-delete: set deletedAt timestamp
  await prisma.taskNode.update({
    where: { id: nodeId },
    data: { deletedAt: new Date() },
  });

  await pusherServer.trigger(`private-graph-${node.graphId}`, "node-deleted", { id: nodeId });
  return { success: true };
}

export async function restoreNode(projectId: string, nodeId: string) {
  await requireProjectAccess(projectId, "EDITOR");

  const node = await prisma.taskNode.findUnique({
    where: { id: nodeId },
    include: {
      graph: { select: { projectId: true } },
      assignments: { include: { user: { select: { id: true, name: true, imageUrl: true } } } },
    },
  });

  if (!node) throw new Error("Node not found");
  if (node.graph.projectId !== projectId) throw new Error("Node not found");
  if (!node.deletedAt) throw new Error("Node is not deleted");

  await prisma.taskNode.update({
    where: { id: nodeId },
    data: { deletedAt: null },
  });

  // Notify via Pusher
  await pusherServer.trigger(`private-graph-${node.graphId}`, "node-created", {
    id: node.id,
    title: node.title,
    status: node.status,
    nodeType: node.nodeType,
    color: node.color,
    positionX: node.positionX,
    positionY: node.positionY,
  });

  return {
    success: true,
    node: {
      id: node.id,
      title: node.title,
      status: node.status,
      nodeType: node.nodeType,
      color: node.color,
      positionX: node.positionX,
      positionY: node.positionY,
    },
  };
}

export async function getDeletedNodes(projectId: string, graphId: string) {
  await requireProjectAccess(projectId, "VIEWER");

  // Verify graph belongs to project
  const graph = await prisma.graph.findUnique({
    where: { id: graphId, projectId },
    select: { id: true },
  });
  if (!graph) throw new Error("Graph not found");

  const deletedNodes = await prisma.taskNode.findMany({
    where: {
      graphId,
      deletedAt: { not: null },
    },
    select: {
      id: true,
      title: true,
      nodeType: true,
      status: true,
      color: true,
      positionX: true,
      positionY: true,
      deletedAt: true,
    },
    orderBy: { deletedAt: "desc" },
  });

  return deletedNodes;
}

export async function createEdge(
  projectId: string,
  graphId: string,
  sourceNodeId: string,
  targetNodeId: string
) {
  await requireProjectAccess(projectId, "EDITOR");

  // IDOR fix: verify graph belongs to this project
  const graph = await prisma.graph.findUnique({
    where: { id: graphId, projectId },
    select: { id: true },
  });
  if (!graph) throw new Error("Graph not found in this project");

  // IDOR fix: verify both nodes belong to this graph
  const sourceNode = await prisma.taskNode.findUnique({
    where: { id: sourceNodeId },
    select: { graphId: true },
  });
  const targetNode = await prisma.taskNode.findUnique({
    where: { id: targetNodeId },
    select: { graphId: true },
  });
  if (!sourceNode || sourceNode.graphId !== graphId || !targetNode || targetNode.graphId !== graphId) {
    throw new Error("Nodes must belong to the specified graph");
  }

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
    select: { id: true, graphId: true, graph: { select: { projectId: true } } },
  });

  if (!edge) throw new Error("Edge not found");

  // IDOR fix: verify edge belongs to this project
  if (edge.graph.projectId !== projectId) throw new Error("Edge not found");

  await prisma.edge.delete({ where: { id: edgeId } });
  await pusherServer.trigger(`private-graph-${edge.graphId}`, "edge-deleted", { id: edgeId });
  return { success: true };
}



export async function getBreadcrumbs(projectId: string, path: string[]) {
  // IDOR fix: verify user has access to this project
  await requireProjectAccess(projectId, "VIEWER");

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
