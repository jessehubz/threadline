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
