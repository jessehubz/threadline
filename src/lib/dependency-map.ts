// Shared, derived-from-real-data glyph computation for the dependency map
// preview (dashboard) and the "first up" task pick — never a fabricated
// status. "blocked" here means "waiting on an incomplete upstream edge",
// which is exactly design-preview12's own g-blocked/"Waiting upstream"
// semantics; the raw TaskStatus.BLOCKED value is unrelated and never
// surfaced as the word "Blocked" (see getStatusLabel in lib/utils.ts).

export type DepGlyph = "done" | "prog" | "ready" | "blocked" | "await" | "rej";

export interface DepNodeInput {
  id: string;
  status: string;
}

export interface DepEdgeInput {
  sourceNodeId: string;
  targetNodeId: string;
}

export interface DepNodeComputed {
  glyph: DepGlyph;
  /** unresolved incoming edges — only meaningful when glyph === "blocked" */
  waitingOn: number;
  /** direct downstream nodes still waiting on this one (0 if this node is COMPLETE) */
  blocks: number;
}

export function computeDependencyGlyphs(
  nodes: DepNodeInput[],
  edges: DepEdgeInput[]
): Map<string, DepNodeComputed> {
  const statusOf = new Map(nodes.map((n) => [n.id, n.status]));
  const incoming = new Map<string, string[]>();
  const outgoing = new Map<string, string[]>();

  for (const e of edges) {
    if (!statusOf.has(e.sourceNodeId) || !statusOf.has(e.targetNodeId)) continue;
    if (!incoming.has(e.targetNodeId)) incoming.set(e.targetNodeId, []);
    incoming.get(e.targetNodeId)!.push(e.sourceNodeId);
    if (!outgoing.has(e.sourceNodeId)) outgoing.set(e.sourceNodeId, []);
    outgoing.get(e.sourceNodeId)!.push(e.targetNodeId);
  }

  const result = new Map<string, DepNodeComputed>();
  for (const n of nodes) {
    const ins = incoming.get(n.id) ?? [];
    const waitingOn = ins.filter((sid) => statusOf.get(sid) !== "COMPLETE").length;
    const outs = outgoing.get(n.id) ?? [];
    const blocks = n.status !== "COMPLETE" ? outs.filter((tid) => statusOf.get(tid) !== "COMPLETE").length : 0;

    let glyph: DepGlyph;
    if (n.status === "COMPLETE") glyph = "done";
    else if (waitingOn > 0) glyph = "blocked";
    else if (n.status === "REJECTED") glyph = "rej";
    else if (n.status === "AWAITING_APPROVAL") glyph = "await";
    else if (n.status === "IN_PROGRESS" || n.status === "URGENT") glyph = "prog";
    else glyph = "ready";

    result.set(n.id, { glyph, waitingOn, blocks });
  }
  return result;
}

export const DEP_GLYPH_LABEL: Record<DepGlyph, string> = {
  done: "Done",
  prog: "In progress",
  ready: "Ready",
  blocked: "Waiting upstream",
  await: "Awaiting approval",
  rej: "Rejected",
};
