"use client";

import { useCallback, useState, useRef } from "react";
import {
  ReactFlow,
  Background,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Connection,
  type Node,
  type Edge,
  type NodeTypes,
  type OnNodesChange,
  type OnEdgesChange,
  BackgroundVariant,
  Panel,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TaskNodeComponent } from "@/components/graph/task-node";
import { FolderNodeComponent } from "@/components/graph/folder-node";
import { GraphToolbar } from "@/components/graph/graph-toolbar";
import { CustomControls } from "@/components/graph/custom-controls";
import { TaskDetailPanel } from "@/components/graph/task-detail-panel";
import { GraphBreadcrumbs } from "@/components/graph/graph-breadcrumbs";
import { CollaboratorPresence } from "@/components/graph/collaborator-presence";
import { ShareDialog } from "@/components/graph/share-dialog";
import { DeadlinesPanel } from "@/components/graph/deadlines-panel";
import { AIAssistantPanel } from "@/components/graph/ai-assistant-panel";
import { createNode, createEdge, deleteNode, deleteEdge, updateNodePosition } from "@/actions/graph-actions";
import { wouldCreateCycle } from "@/lib/graph-utils";
import { toast } from "sonner";
import { usePusher } from "@/hooks/use-pusher";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const nodeTypes: NodeTypes = {
  taskNode: TaskNodeComponent,
  folderNode: FolderNodeComponent,
};

interface GraphEditorProps {
  projectId: string;
  graph: {
    id: string;
    nodes: Array<{
      id: string;
      title: string;
      description: string | null;
      status: string;
      nodeType: string;
      color: string | null;
      dueDate: Date | string | null;
      positionX: number;
      positionY: number;
      subGraph?: { nodes: Array<{ id: string; status: string }> } | null;
      assignments: Array<{ user: { id: string; name: string | null; imageUrl: string | null }; isApprover: boolean }>;
      attachments: Array<{ id: string; fileName: string; fileUrl: string; fileType: string }>;
      incomingEdges: Array<{ id: string; sourceNodeId: string }>;
      outgoingEdges: Array<{ id: string; targetNodeId: string }>;
    }>;
    edges: Array<{ id: string; sourceNodeId: string; targetNodeId: string }>;
  };
  projectName: string;
  shareToken: string | null;
  members: Array<{ id: string; role: string; user: { id: string; name: string | null; email: string } }>;
  role: string;
  breadcrumbs: Array<{ id: string; name: string; graphId?: string }>;
  currentPath: string[];
  currentUserId: string;
}

export function GraphEditor({ projectId, graph, projectName, shareToken, members, role, breadcrumbs, currentPath, currentUserId }: GraphEditorProps) {
  const isReadOnly = role === "VIEWER";
  const router = useRouter();

  const initialNodes: Node[] = graph.nodes.map((node) => ({
    id: node.id,
    type: node.nodeType === "FOLDER" ? "folderNode" : "taskNode",
    position: { x: node.positionX, y: node.positionY },
    data: {
      title: node.title,
      status: node.status,
      color: node.color,
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

  const initialEdges: Edge[] = graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.sourceNodeId,
    target: edge.targetNodeId,
    animated: true,
    style: { strokeWidth: 2, stroke: "#6366f1" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1", width: 20, height: 20 },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [showDeadlines, setShowDeadlines] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const positionUpdateTimeout = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Real-time via Pusher
  usePusher(graph.id, {
    onNodeCreated: (data: unknown) => {
      const raw = data as { id: string; title: string; status: string; nodeType: string; color: string | null; positionX: number; positionY: number };
      setNodes((nds) => {
        if (nds.find((n) => n.id === raw.id)) return nds;
        return [...nds, {
          id: raw.id,
          type: raw.nodeType === "FOLDER" ? "folderNode" : "taskNode",
          position: { x: raw.positionX, y: raw.positionY },
          data: { title: raw.title, status: raw.status, color: raw.color, dueDate: null, assignees: [], hasSubGraph: false, subGraphProgress: null, attachmentCount: 0 },
        }];
      });
    },
    onNodeUpdated: (data: unknown) => {
      const node = data as { id: string; [key: string]: unknown };
      setNodes((nds) => nds.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, ...node } } : n)));
    },
    onNodeMoved: (data: unknown) => {
      const moved = data as { id: string; positionX: number; positionY: number };
      setNodes((nds) => nds.map((n) => (n.id === moved.id ? { ...n, position: { x: moved.positionX, y: moved.positionY } } : n)));
    },
    onNodeDeleted: (data: unknown) => {
      const deleted = data as { id: string };
      setNodes((nds) => nds.filter((n) => n.id !== deleted.id));
    },
    onEdgeCreated: (data: unknown) => {
      const edge = data as { id: string; sourceNodeId: string; targetNodeId: string };
      setEdges((eds) => {
        if (eds.find((e) => e.id === edge.id)) return eds;
        return [...eds, { id: edge.id, source: edge.sourceNodeId, target: edge.targetNodeId, animated: true, style: { strokeWidth: 2, stroke: "#6366f1" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1", width: 20, height: 20 } }];
      });
    },
    onEdgeDeleted: (data: unknown) => {
      const deleted = data as { id: string };
      setEdges((eds) => eds.filter((e) => e.id !== deleted.id));
    },
  });

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      changes.forEach((change) => {
        if (change.type === "position" && change.position && !change.dragging) {
          const nodeId = change.id;
          const existing = positionUpdateTimeout.current.get(nodeId);
          if (existing) clearTimeout(existing);
          const timeout = setTimeout(() => {
            updateNodePosition(projectId, nodeId, change.position!.x, change.position!.y);
            positionUpdateTimeout.current.delete(nodeId);
          }, 500);
          positionUpdateTimeout.current.set(nodeId, timeout);
        }
      });
    },
    [onNodesChange, projectId]
  );

  const handleConnect = useCallback(
    async (connection: Connection) => {
      if (isReadOnly || !connection.source || !connection.target) return;
      const edgeData = edges.map((e) => ({ sourceNodeId: e.source, targetNodeId: e.target }));
      if (wouldCreateCycle(edgeData, connection.source, connection.target)) {
        toast.error("Cannot connect: would create a circular dependency");
        return;
      }
      const result = await createEdge(projectId, graph.id, connection.source, connection.target);
      if ("error" in result) { toast.error(result.error); return; }
      if (result.edge) {
        setEdges((eds) => addEdge({ ...connection, id: result.edge.id, animated: true, style: { strokeWidth: 2, stroke: "#6366f1" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1", width: 20, height: 20 } }, eds));
      }
    },
    [edges, graph.id, isReadOnly, projectId, setEdges]
  );

  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      const source = "source" in connection ? connection.source : null;
      const target = "target" in connection ? connection.target : null;
      if (!source || !target) return false;
      if (source === target) return false;
      const edgeData = edges.map((e) => ({ sourceNodeId: e.source, targetNodeId: e.target }));
      return !wouldCreateCycle(edgeData, source, target);
    },
    [edges]
  );

  const handleAddNode = useCallback(async (nodeType: "TASK" | "FOLDER" = "TASK") => {
    if (isReadOnly) return;
    const position = { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 };
    const tempId = `temp-${Date.now()}`;
    setNodes((nds) => [...nds, {
      id: tempId,
      type: nodeType === "FOLDER" ? "folderNode" : "taskNode",
      position,
      data: { title: nodeType === "FOLDER" ? "New Folder" : "New Task", status: "NOT_STARTED", color: null, dueDate: null, assignees: [], hasSubGraph: false, subGraphProgress: null, attachmentCount: 0 },
    }]);

    try {
      const node = await createNode(projectId, graph.id, { title: nodeType === "FOLDER" ? "New Folder" : undefined, positionX: position.x, positionY: position.y, nodeType });
      setNodes((nds) => nds.map((n) => n.id === tempId ? { ...n, id: node.id } : n));
      toast.success(nodeType === "FOLDER" ? "Folder added" : "Task added");
    } catch {
      setNodes((nds) => nds.filter((n) => n.id !== tempId));
      toast.error("Failed to create node");
    }
  }, [graph.id, isReadOnly, projectId, setNodes]);

  const handleDeleteNode = useCallback(async (nodeId: string) => {
    if (isReadOnly) return;
    await deleteNode(projectId, nodeId);
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNodeId(null);
    toast.success("Deleted");
  }, [isReadOnly, projectId, setNodes, setEdges]);

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      changes.forEach((change) => { if (change.type === "remove") deleteEdge(projectId, change.id); });
    },
    [onEdgesChange, projectId]
  );

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const handleNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    // Double-click folder nodes to navigate into sub-graph
    const graphNode = graph.nodes.find((n) => n.id === node.id);
    if (graphNode?.nodeType === "FOLDER" && graphNode.subGraph) {
      const newPath = [...currentPath, node.id].join(",");
      router.push(`/graph/${projectId}?path=${newPath}&graphId=${graphNode.subGraph}`);
    }
  }, [currentPath, graph.nodes, projectId, router]);

  const handleSelectNodeFromPanel = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    // Focus the node on canvas
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === nodeId })));
    }
  }, [nodes, setNodes]);

  const selectedNode = graph.nodes.find((n) => n.id === selectedNodeId);
  const validNodes = nodes.filter((n) => n.position && typeof n.position.x === "number" && typeof n.position.y === "number");

  const deadlineTasks = graph.nodes
    .filter((n) => n.dueDate)
    .map((n) => ({ id: n.id, title: n.title, status: n.status, dueDate: n.dueDate }));

  return (
    <ReactFlowProvider>
      <div className="relative flex h-full flex-1">
        {/* Deadlines Panel */}
        {showDeadlines && (
          <DeadlinesPanel
            tasks={deadlineTasks}
            onSelectNode={handleSelectNodeFromPanel}
            onClose={() => setShowDeadlines(false)}
          />
        )}

        <div className="flex-1">
          <ReactFlow
            nodes={validNodes}
            edges={edges}
            onNodesChange={isReadOnly ? undefined : handleNodesChange}
            onEdgesChange={isReadOnly ? undefined : handleEdgesChange}
            onConnect={handleConnect}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            isValidConnection={isValidConnection}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode={isReadOnly ? null : "Delete"}
            className="bg-gray-50 dark:bg-gray-950"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#d1d5db" className="dark:!bg-gray-950" />
            {/* Small, dark minimap in top-right */}
            <MiniMap
              position="top-right"
              className="!w-[120px] !h-[80px] !rounded-lg !border !border-gray-200/50 !bg-white/80 !shadow-sm dark:!border-gray-700/50 dark:!bg-gray-900/80"
              maskColor="rgba(0,0,0,0.1)"
              nodeColor={(node) => {
                const color = node.data?.color as string | undefined;
                if (color) return color;
                switch (node.data?.status) {
                  case "COMPLETE": return "#22c55e";
                  case "IN_PROGRESS": return "#3b82f6";
                  case "BLOCKED": return "#ef4444";
                  case "AWAITING_APPROVAL": return "#f59e0b";
                  default: return "#9ca3af";
                }
              }}
            />
            <Panel position="top-left" className="space-y-2">
              <GraphBreadcrumbs breadcrumbs={breadcrumbs} projectId={projectId} currentPath={currentPath} />
            </Panel>
            <Panel position="top-right" className="!right-[140px] flex items-center gap-2">
              <CollaboratorPresence graphId={graph.id} />
              <Button size="sm" variant="secondary" onClick={() => setShareOpen(true)} className="gap-1.5">
                <Share2 className="h-3.5 w-3.5" /> Share
              </Button>
            </Panel>
          </ReactFlow>

          <CustomControls />

          {!isReadOnly && (
            <GraphToolbar
              onAddNode={() => handleAddNode("TASK")}
              onAddFolder={() => handleAddNode("FOLDER")}
              onToggleDeadlines={() => setShowDeadlines(!showDeadlines)}
              onToggleAI={() => setShowAI(!showAI)}
              showDeadlines={showDeadlines}
            />
          )}

          {!isReadOnly && (
            <AIAssistantPanel
              projectId={projectId}
              graphId={graph.id}
              open={showAI}
              onToggle={() => setShowAI(!showAI)}
            />
          )}
        </div>

        {selectedNodeId && selectedNode && (
          <TaskDetailPanel
            key={selectedNodeId}
            projectId={projectId}
            currentUserId={currentUserId}
            node={selectedNode}
            graphEdges={edges.map((e) => ({ id: e.id, sourceNodeId: e.source, targetNodeId: e.target }))}
            graphNodes={graph.nodes}
            members={members}
            isReadOnly={isReadOnly}
            onClose={() => setSelectedNodeId(null)}
            onDelete={() => handleDeleteNode(selectedNodeId)}
            currentPath={currentPath}
          />
        )}

        <ShareDialog
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          projectId={projectId}
          shareToken={shareToken}
          members={members}
        />
      </div>
    </ReactFlowProvider>
  );
}
