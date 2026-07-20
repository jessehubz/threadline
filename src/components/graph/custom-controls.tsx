"use client";

import { useReactFlow, type Node, type Edge } from "@xyflow/react";
import { ZoomIn, ZoomOut, LocateFixed, Sun, Moon, LayoutGrid } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/components/theme-provider";
import { batchUpdateNodePositions } from "@/actions/graph-actions";
import { toast } from "sonner";

/**
 * Layered layout algorithm (Sugiyama-style):
 * 1. Find root nodes (no incoming edges)
 * 2. Assign layers via BFS from roots
 * 3. Position nodes in a grid: x by position within layer, y by layer depth
 * 4. Unconnected nodes (no edges at all) go in a separate bottom row
 */
function computeLayeredLayout(
  nodes: Node[],
  edges: Edge[],
  layerGap = 200,
  nodeGap = 250
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  // Build adjacency: for each node, track incoming and outgoing
  const incoming = new Map<string, Set<string>>();
  const outgoing = new Map<string, Set<string>>();
  const nodeIds = new Set(nodes.map((n) => n.id));

  for (const id of nodeIds) {
    incoming.set(id, new Set());
    outgoing.set(id, new Set());
  }

  for (const edge of edges) {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      outgoing.get(edge.source)!.add(edge.target);
      incoming.get(edge.target)!.add(edge.source);
    }
  }

  // Identify connected vs unconnected nodes
  const connectedNodes: string[] = [];
  const unconnectedNodes: string[] = [];
  for (const id of nodeIds) {
    if (incoming.get(id)!.size === 0 && outgoing.get(id)!.size === 0) {
      unconnectedNodes.push(id);
    } else {
      connectedNodes.push(id);
    }
  }

  // Assign layers via BFS (Kahn's algorithm / topological ordering)
  const layers = new Map<string, number>();
  const inDegree = new Map<string, number>();
  for (const id of connectedNodes) {
    // Only count edges within the connected set
    const inc = [...incoming.get(id)!].filter((s) => connectedNodes.includes(s));
    inDegree.set(id, inc.length);
  }

  // Roots: connected nodes with 0 in-degree
  const queue: string[] = [];
  for (const id of connectedNodes) {
    if (inDegree.get(id)! === 0) {
      queue.push(id);
      layers.set(id, 0);
    }
  }

  // BFS to assign layers
  let head = 0;
  while (head < queue.length) {
    const current = queue[head++];
    const currentLayer = layers.get(current)!;
    for (const next of outgoing.get(current)!) {
      if (!connectedNodes.includes(next)) continue;
      // The layer of a node is the max depth from any root
      const newLayer = currentLayer + 1;
      if (!layers.has(next) || layers.get(next)! < newLayer) {
        layers.set(next, newLayer);
      }
      const deg = inDegree.get(next)! - 1;
      inDegree.set(next, deg);
      if (deg === 0) {
        queue.push(next);
      }
    }
  }

  // Handle any remaining nodes not reached (cycles or disconnected within connected set)
  for (const id of connectedNodes) {
    if (!layers.has(id)) {
      layers.set(id, 0);
    }
  }

  // Group nodes by layer
  const layerGroups = new Map<number, string[]>();
  for (const [id, layer] of layers) {
    if (!layerGroups.has(layer)) layerGroups.set(layer, []);
    layerGroups.get(layer)!.push(id);
  }

  // Position connected nodes
  const maxLayer = Math.max(...(layerGroups.size > 0 ? [...layerGroups.keys()] : [0]));
  for (const [layer, ids] of layerGroups) {
    const totalWidth = (ids.length - 1) * nodeGap;
    const startX = -totalWidth / 2;
    ids.forEach((id, index) => {
      positions.set(id, {
        x: startX + index * nodeGap,
        y: layer * layerGap,
      });
    });
  }

  // Position unconnected nodes in a separate row below all layers
  if (unconnectedNodes.length > 0) {
    const unconnectedY = (maxLayer + 2) * layerGap;
    const totalWidth = (unconnectedNodes.length - 1) * nodeGap;
    const startX = -totalWidth / 2;
    unconnectedNodes.forEach((id, index) => {
      positions.set(id, {
        x: startX + index * nodeGap,
        y: unconnectedY,
      });
    });
  }

  return positions;
}

interface CustomControlsProps {
  projectId?: string;
  graphId?: string;
  canEdit?: boolean;
}

export function CustomControls({ projectId, graphId, canEdit = true }: CustomControlsProps) {
  const { fitView, zoomIn, zoomOut, getZoom, getNodes, getEdges, setNodes } = useReactFlow();
  const [zoom, setZoom] = useState(100);
  const [isArranging, setIsArranging] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const interval = setInterval(() => {
      setZoom(Math.round(getZoom() * 100));
    }, 200);
    return () => clearInterval(interval);
  }, [getZoom]);

  const handleAutoArrange = useCallback(async () => {
    if (!projectId || !graphId || isArranging) return;

    setIsArranging(true);
    try {
      const nodes = getNodes();
      const edges = getEdges();

      if (nodes.length === 0) {
        toast.error("No nodes to arrange");
        return;
      }

      // Compute new layout
      const newPositions = computeLayeredLayout(nodes, edges);

      // Validate all positions are finite
      for (const [nodeId, pos] of newPositions) {
        if (!Number.isFinite(pos.x) || !Number.isFinite(pos.y)) {
          toast.error(`Layout error: invalid position computed for node ${nodeId}`);
          return;
        }
      }

      // Update local node positions
      setNodes((nds) =>
        nds.map((n) => {
          const newPos = newPositions.get(n.id);
          if (newPos) {
            return { ...n, position: { x: newPos.x, y: newPos.y } };
          }
          return n;
        })
      );

      // Fit view after layout
      setTimeout(() => {
        fitView({ padding: 0.3, duration: 300 });
      }, 50);

      // Batch save to server
      const positionUpdates = [...newPositions].map(([nodeId, pos]) => ({
        nodeId,
        positionX: pos.x,
        positionY: pos.y,
      }));

      await batchUpdateNodePositions(projectId, graphId, positionUpdates);
      toast.success("Graph arranged");
    } catch (error) {
      toast.error("Failed to arrange graph");
      console.error("Auto-arrange error:", error);
    } finally {
      setIsArranging(false);
    }
  }, [projectId, graphId, isArranging, getNodes, getEdges, setNodes, fitView]);

  return (
    <div className="absolute bottom-4 right-4 z-[5] flex items-center gap-1 rounded-xl border border-themed-subtle bg-card px-2.5 py-1.5 shadow-sm">
      <button
        onClick={() => zoomOut()}
        className="rounded-lg p-1.5 text-dim transition-colors hover:bg-hover hover:text-body"
        aria-label="Zoom out"
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      <span className="min-w-[2.5rem] text-center text-xs font-medium text-body">
        {zoom}%
      </span>
      <button
        onClick={() => zoomIn()}
        className="rounded-lg p-1.5 text-dim transition-colors hover:bg-hover hover:text-body"
        aria-label="Zoom in"
      >
        <ZoomIn className="h-4 w-4" />
      </button>
      <div className="mx-1 h-4 w-px bg-hover" />
      <button
        onClick={() => fitView({ padding: 0.3, duration: 300 })}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-dim transition-colors hover:bg-hover hover:text-body"
        aria-label="Recenter"
      >
        <LocateFixed className="h-4 w-4" />
        <span className="text-xs font-medium">Recenter</span>
      </button>
      {canEdit && projectId && graphId && (
        <>
          <div className="mx-1 h-4 w-px bg-hover" />
          <button
            onClick={handleAutoArrange}
            disabled={isArranging}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-dim transition-colors hover:bg-hover hover:text-body disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Auto arrange"
            title="Auto-arrange nodes into a clean layout"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="text-xs font-medium">
              {isArranging ? "Arranging…" : "Auto Arrange"}
            </span>
          </button>
        </>
      )}
      <div className="mx-1 h-4 w-px bg-hover" />
      <button
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="rounded-lg p-1.5 text-dim transition-colors hover:bg-hover hover:text-body"
        aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        title={resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
      >
        {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </div>
  );
}
