"use client";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type Node,
  type Edge,
  type NodeTypes,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TaskNodeComponent } from "@/components/graph/task-node";

const nodeTypes: NodeTypes = {
  taskNode: TaskNodeComponent,
};

interface ShareGraphViewerProps {
  graph: {
    nodes: Array<{
      id: string;
      title: string;
      status: string;
      dueDate: Date | string | null;
      positionX: number;
      positionY: number;
      subGraph?: { nodes: Array<{ id: string; status: string }> } | null;
      assignments: Array<{ user: { id: string; name: string | null; imageUrl: string | null } }>;
      attachments: Array<{ id: string }>;
    }>;
    edges: Array<{ id: string; sourceNodeId: string; targetNodeId: string }>;
  };
}

export function ShareGraphViewer({ graph }: ShareGraphViewerProps) {
  const nodes: Node[] = graph.nodes.map((node) => ({
    id: node.id,
    type: "taskNode",
    position: { x: node.positionX, y: node.positionY },
    data: {
      title: node.title,
      status: node.status,
      dueDate: node.dueDate,
      assignees: node.assignments.map((a) => a.user),
      hasSubGraph: !!node.subGraph,
      subGraphProgress: node.subGraph
        ? {
            total: node.subGraph.nodes.length,
            completed: node.subGraph.nodes.filter((n) => n.status === "COMPLETE").length,
          }
        : null,
      attachmentCount: node.attachments.length,
    },
  }));

  const edges: Edge[] = graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.sourceNodeId,
    target: edge.targetNodeId,
    animated: true,
    style: { strokeWidth: 2, stroke: "var(--accent)" },
  }));

  return (
    <ReactFlowProvider>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        className="bg-page"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--border-default)" />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </ReactFlowProvider>
  );
}
