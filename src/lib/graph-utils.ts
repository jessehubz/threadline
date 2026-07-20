/**
 * Cycle detection using DFS for directed graphs.
 * Returns true if adding the proposed edge would create a cycle.
 */
export function wouldCreateCycle(
  edges: { sourceNodeId: string; targetNodeId: string }[],
  newSource: string,
  newTarget: string
): boolean {
  // If the new edge goes from A to B, we check if there's already a path from B to A
  // If so, adding A->B would create a cycle
  const adjacency = new Map<string, Set<string>>();

  // Build adjacency list from existing edges
  for (const edge of edges) {
    if (!adjacency.has(edge.sourceNodeId)) {
      adjacency.set(edge.sourceNodeId, new Set());
    }
    adjacency.get(edge.sourceNodeId)!.add(edge.targetNodeId);
  }

  // Add the new edge
  if (!adjacency.has(newSource)) {
    adjacency.set(newSource, new Set());
  }
  adjacency.get(newSource)!.add(newTarget);

  // DFS from newTarget to see if we can reach newSource
  const visited = new Set<string>();
  const stack = [newTarget];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === newSource) return true; // Cycle detected
    if (visited.has(current)) continue;
    visited.add(current);

    const neighbors = adjacency.get(current);
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      }
    }
  }

  return false;
}

/**
 * Check if all direct predecessors of a node are complete.
 * A node can be completed only if all its incoming edges come from COMPLETE nodes.
 */
export function canCompleteNode(
  nodeId: string,
  edges: { sourceNodeId: string; targetNodeId: string }[],
  nodeStatuses: Map<string, string>
): boolean {
  const predecessors = edges
    .filter((e) => e.targetNodeId === nodeId)
    .map((e) => e.sourceNodeId);

  if (predecessors.length === 0) return true;

  return predecessors.every(
    (predId) => nodeStatuses.get(predId) === "COMPLETE"
  );
}

/**
 * Compute the set of node IDs that are auto-blocked because at least one
 * upstream dependency (incoming edge source) is not COMPLETE.
 *
 * @param nodes - Array of nodes with at minimum `id` and `status` in their data.
 * @param edges - Array of edges with `source` (or `sourceNodeId`) and `target` (or `targetNodeId`).
 * @returns A Set of node IDs that are currently auto-blocked.
 */
export function getBlockedNodeIds(
  nodes: Array<{ id: string; data?: { status?: string }; status?: string }>,
  edges: Array<{ source?: string; target?: string; sourceNodeId?: string; targetNodeId?: string }>
): Set<string> {
  // Build a map of nodeId -> status
  const statusMap = new Map<string, string>();
  for (const node of nodes) {
    const status = node.data?.status ?? node.status ?? "NOT_STARTED";
    statusMap.set(node.id, status);
  }

  const blockedIds = new Set<string>();

  for (const node of nodes) {
    const nodeId = node.id;
    const nodeStatus = statusMap.get(nodeId) ?? "NOT_STARTED";

    // A node that is already COMPLETE cannot be auto-blocked
    if (nodeStatus === "COMPLETE") continue;

    // Find all incoming edges (edges pointing TO this node)
    const incomingSourceIds: string[] = [];
    for (const edge of edges) {
      const target = edge.target ?? edge.targetNodeId;
      const source = edge.source ?? edge.sourceNodeId;
      if (target === nodeId && source) {
        incomingSourceIds.push(source);
      }
    }

    // If no incoming edges, not blocked
    if (incomingSourceIds.length === 0) continue;

    // If ANY upstream dependency is NOT complete, this node is blocked
    const isBlocked = incomingSourceIds.some(
      (srcId) => statusMap.get(srcId) !== "COMPLETE"
    );

    if (isBlocked) {
      blockedIds.add(nodeId);
    }
  }

  return blockedIds;
}

/**
 * Get the names of upstream nodes that are blocking a given node.
 * Returns only those upstream nodes that are NOT complete.
 */
export function getBlockingNodeNames(
  nodeId: string,
  nodes: Array<{ id: string; data?: { status?: string; title?: string }; status?: string; title?: string }>,
  edges: Array<{ source?: string; target?: string; sourceNodeId?: string; targetNodeId?: string }>
): string[] {
  const blockingNames: string[] = [];

  for (const edge of edges) {
    const target = edge.target ?? edge.targetNodeId;
    const source = edge.source ?? edge.sourceNodeId;
    if (target !== nodeId || !source) continue;

    const sourceNode = nodes.find((n) => n.id === source);
    if (!sourceNode) continue;

    const status = sourceNode.data?.status ?? sourceNode.status ?? "NOT_STARTED";
    if (status !== "COMPLETE") {
      const title = sourceNode.data?.title ?? sourceNode.title ?? "Untitled";
      blockingNames.push(title);
    }
  }

  return blockingNames;
}

/**
 * Get all downstream nodes (nodes that depend on the given node).
 */
export function getDownstreamNodes(
  nodeId: string,
  edges: { sourceNodeId: string; targetNodeId: string }[]
): string[] {
  return edges
    .filter((e) => e.sourceNodeId === nodeId)
    .map((e) => e.targetNodeId);
}

/**
 * Get all upstream nodes (nodes that this node depends on).
 */
export function getUpstreamNodes(
  nodeId: string,
  edges: { sourceNodeId: string; targetNodeId: string }[]
): string[] {
  return edges
    .filter((e) => e.targetNodeId === nodeId)
    .map((e) => e.sourceNodeId);
}

/**
 * Derive parent node status from its sub-graph children.
 */
export function deriveParentStatus(
  childStatuses: string[]
): string {
  if (childStatuses.length === 0) return "NOT_STARTED";
  if (childStatuses.every((s) => s === "COMPLETE")) return "COMPLETE";
  if (childStatuses.some((s) => s === "BLOCKED")) return "IN_PROGRESS";
  if (childStatuses.some((s) => s === "IN_PROGRESS" || s === "AWAITING_APPROVAL")) return "IN_PROGRESS";
  if (childStatuses.every((s) => s === "NOT_STARTED")) return "NOT_STARTED";
  return "IN_PROGRESS";
}
