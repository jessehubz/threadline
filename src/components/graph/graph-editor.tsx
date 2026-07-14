"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import {
  ReactFlow,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Connection,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type OnNodesChange,
  type OnEdgesChange,
  type OnSelectionChangeParams,
  type ReactFlowInstance,
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
import { ThemedBezierEdge } from "@/components/graph/themed-edge";
import { MultiSelectPanel } from "@/components/graph/multi-select-panel";
import { createNode, createEdge, deleteNode, deleteEdge, updateNodePosition, restoreNode, getDeletedNodes } from "@/actions/graph-actions";
import { wouldCreateCycle } from "@/lib/graph-utils";
import { toast } from "sonner";
import { usePusher } from "@/hooks/use-pusher";
import { useUndo } from "@/hooks/use-undo";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecentlyDeletedPanel } from "@/components/graph/recently-deleted-panel";

const nodeTypes: NodeTypes = {
  taskNode: TaskNodeComponent,
  folderNode: FolderNodeComponent,
};

const edgeTypes: EdgeTypes = {
  themed: ThemedBezierEdge,
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
      subGraph?: { id: string; nodes: Array<{ id: string; status: string }> } | null;
      assignments: Array<{ user: { id: string; name: string | null; imageUrl: string | null }; isApprover: boolean }>;
      attachments: Array<{ id: string; fileName: string; fileUrl: string; fileType: string }>;
      incomingEdges: Array<{ id: string; sourceNodeId: string }>;
      outgoingEdges: Array<{ id: string; targetNodeId: string }>;
      _count?: { comments: number };
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
  unreadCommentNodeIds?: string[];
}

function makeEdge(id: string, source: string, target: string): Edge {
  return {
    id,
    source,
    target,
    type: "themed",
    style: { strokeWidth: 2, stroke: "var(--accent)" },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "var(--accent)",
      width: 16,
      height: 16,
    },
  };
}

export function GraphEditor({ projectId, graph, projectName, shareToken, members, role, breadcrumbs, currentPath, currentUserId, unreadCommentNodeIds = [] }: GraphEditorProps) {
  const isReadOnly = false; // All project members (HEAD, CO_HEAD, MEMBER) can edit. View-only access uses the separate /share page.

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
      hasDescription: !!node.description,
      commentCount: node._count?.comments ?? 0,
      hasUnreadComments: unreadCommentNodeIds.includes(node.id),
    },
  }));

  const initialEdges: Edge[] = graph.edges.map((edge) => makeEdge(edge.id, edge.sourceNodeId, edge.targetNodeId));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [showDeadlines, setShowDeadlines] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [edgeContextMenu, setEdgeContextMenu] = useState<{ edgeId: string; x: number; y: number } | null>(null);
  const positionUpdateTimeout = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const { push: pushUndo, undo: performUndo, canUndo } = useUndo();

  // Recently deleted nodes
  interface DeletedNodeData {
    id: string;
    title: string;
    nodeType: string;
    status: string;
    color: string | null;
    positionX: number;
    positionY: number;
    deletedAt: Date | string;
  }
  const [deletedNodes, setDeletedNodes] = useState<DeletedNodeData[]>([]);

  // Load deleted nodes on mount
  useEffect(() => {
    getDeletedNodes(projectId, graph.id)
      .then((nodes) => setDeletedNodes(nodes.map((n) => ({ ...n, deletedAt: n.deletedAt! }))))
      .catch(() => {});
  }, [projectId, graph.id]);

  // Ctrl+Z / Cmd+Z undo handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        e.preventDefault();
        if (canUndo()) {
          performUndo().then((action) => {
            if (action) {
              toast.success(`Undid: ${action.description}`);
            }
          });
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, performUndo]);

  // 7.1 - Spacebar-to-pan (Figma-style)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setIsPanning(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsPanning(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Track multi-selection
  const handleSelectionChange = useCallback(({ nodes: selectedNodes }: OnSelectionChangeParams) => {
    const ids = selectedNodes.map((n) => n.id);
    setSelectedNodeIds(ids);
    // If exactly one node selected via marquee, open its detail panel
    if (ids.length === 1) {
      setSelectedNodeId(ids[0]);
    } else if (ids.length > 1) {
      // Multi-select: close detail panel
      setSelectedNodeId(null);
    }
  }, []);

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
      const node = data as { id: string; commentCount?: number; lastCommentUserId?: string; [key: string]: unknown };
      setNodes((nds) => nds.map((n) => {
        if (n.id !== node.id) return n;
        const updatedData = { ...n.data, ...node };
        // If this is a comment count update, derive unread state for the current user
        if (node.commentCount !== undefined && node.lastCommentUserId) {
          updatedData.hasUnreadComments = node.lastCommentUserId !== currentUserId;
        }
        return { ...n, data: updatedData };
      }));
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
        return [...eds, makeEdge(edge.id, edge.sourceNodeId, edge.targetNodeId)];
      });
    },
    onEdgeDeleted: (data: unknown) => {
      const deleted = data as { id: string };
      setEdges((eds) => eds.filter((e) => e.id !== deleted.id));
    },
  });

  // Track previous positions for undo
  const previousPositions = useRef<Map<string, { x: number; y: number }>>(new Map());

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      changes.forEach((change) => {
        if (change.type === "position" && change.dragging) {
          // Capture start position at beginning of drag
          if (!previousPositions.current.has(change.id)) {
            const currentNode = nodes.find((n) => n.id === change.id);
            if (currentNode) {
              previousPositions.current.set(change.id, { ...currentNode.position });
            }
          }
        }
        if (change.type === "position" && change.position && !change.dragging) {
          const nodeId = change.id;
          const prevPos = previousPositions.current.get(nodeId);
          const newPos = change.position;
          previousPositions.current.delete(nodeId);

          const existing = positionUpdateTimeout.current.get(nodeId);
          if (existing) clearTimeout(existing);
          const timeout = setTimeout(() => {
            updateNodePosition(projectId, nodeId, newPos.x, newPos.y);
            positionUpdateTimeout.current.delete(nodeId);
          }, 300);
          positionUpdateTimeout.current.set(nodeId, timeout);

          // Push undo for move
          if (prevPos && (Math.abs(prevPos.x - newPos.x) > 1 || Math.abs(prevPos.y - newPos.y) > 1)) {
            const savedPrevPos = { ...prevPos };
            pushUndo({
              type: "node-move",
              description: "Move node",
              undo: async () => {
                setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, position: savedPrevPos } : n));
                await updateNodePosition(projectId, nodeId, savedPrevPos.x, savedPrevPos.y);
              },
            });
          }
        }
      });
    },
    [onNodesChange, projectId, nodes, pushUndo, setNodes]
  );

  const handleConnect = useCallback(
    async (connection: Connection) => {
      if (isReadOnly || !connection.source || !connection.target) return;
      const edgeData = edges.map((e) => ({ sourceNodeId: e.source, targetNodeId: e.target }));
      if (wouldCreateCycle(edgeData, connection.source, connection.target)) {
        toast.error("Cannot connect: would create a circular dependency");
        return;
      }

      // Optimistic: add edge immediately with temp ID
      const tempId = `temp-edge-${Date.now()}`;
      const tempEdge = makeEdge(tempId, connection.source, connection.target);
      setEdges((eds) => addEdge({ ...connection, ...tempEdge }, eds));

      // Persist to server
      const result = await createEdge(projectId, graph.id, connection.source, connection.target);
      if ("error" in result) {
        // Rollback optimistic edge
        setEdges((eds) => eds.filter((e) => e.id !== tempId));
        toast.error(result.error);
        return;
      }
      if (result.edge) {
        // Replace temp edge with real one
        setEdges((eds) => eds.map((e) => e.id === tempId ? makeEdge(result.edge.id, connection.source!, connection.target!) : e));
        // Push undo action for edge creation
        const edgeId = result.edge.id;
        pushUndo({
          type: "edge-create",
          description: "Create connection",
          undo: async () => {
            await deleteEdge(projectId, edgeId);
            setEdges((eds) => eds.filter((e) => e.id !== edgeId));
          },
        });
      }
    },
    [edges, graph.id, isReadOnly, projectId, setEdges, pushUndo]
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

    // Calculate viewport center
    let position = { x: 300, y: 200 }; // fallback
    if (reactFlowInstance.current) {
      const { x, y, zoom } = reactFlowInstance.current.getViewport();
      // Get the container dimensions
      const container = document.querySelector('.react-flow');
      if (container) {
        const rect = container.getBoundingClientRect();
        // Convert screen center to flow coordinates
        position = {
          x: (-x + rect.width / 2) / zoom,
          y: (-y + rect.height / 2) / zoom,
        };
      }
    }

    // Overlap avoidance: check if any existing node is too close
    const NODE_WIDTH = 250;
    const NODE_HEIGHT = 120;
    const SPACING = 30;
    let attempts = 0;
    const maxAttempts = 20;
    const centerX = position.x;
    const centerY = position.y;

    while (attempts < maxAttempts) {
      const overlaps = nodes.some((n) => {
        const dx = Math.abs(n.position.x - position.x);
        const dy = Math.abs(n.position.y - position.y);
        return dx < NODE_WIDTH + SPACING && dy < NODE_HEIGHT + SPACING;
      });

      if (!overlaps) break;

      // Spiral outward from center
      const angle = attempts * 0.8;
      const radius = 50 + attempts * 40;
      position = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      };
      attempts++;
    }

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
      // Push undo action for node creation
      pushUndo({
        type: "node-create",
        description: `Create ${nodeType === "FOLDER" ? "folder" : "task"}`,
        undo: async () => {
          await deleteNode(projectId, node.id);
          setNodes((nds) => nds.filter((n) => n.id !== node.id));
          setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
          setDeletedNodes((prev) => [{ id: node.id, title: nodeType === "FOLDER" ? "New Folder" : "New Task", nodeType, status: "NOT_STARTED", color: null, positionX: position.x, positionY: position.y, deletedAt: new Date() }, ...prev]);
        },
      });
      toast.success(nodeType === "FOLDER" ? "Folder added" : "Task added");
    } catch {
      setNodes((nds) => nds.filter((n) => n.id !== tempId));
      toast.error("Failed to create node");
    }
  }, [graph.id, isReadOnly, projectId, setNodes, setEdges, nodes, pushUndo]);

  const handleDeleteNode = useCallback(async (nodeId: string) => {
    if (isReadOnly) return;
    // Capture node data before deletion for undo
    const nodeToDelete = nodes.find((n) => n.id === nodeId);
    const nodeData = nodeToDelete?.data as Record<string, unknown> | undefined;

    await deleteNode(projectId, nodeId);
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNodeId(null);

    // Add to recently deleted
    const title = (nodeData?.title as string) || "Untitled";
    const nodeType = nodeToDelete?.type === "folderNode" ? "FOLDER" : "TASK";
    const deletedEntry = {
      id: nodeId,
      title,
      nodeType,
      status: (nodeData?.status as string) || "NOT_STARTED",
      color: (nodeData?.color as string | null) || null,
      positionX: nodeToDelete?.position.x ?? 0,
      positionY: nodeToDelete?.position.y ?? 0,
      deletedAt: new Date(),
    };
    setDeletedNodes((prev) => [deletedEntry, ...prev]);

    // Push undo action
    pushUndo({
      type: "node-delete",
      description: `Delete "${title}"`,
      undo: async () => {
        const result = await restoreNode(projectId, nodeId);
        if (result.success && result.node) {
          setNodes((nds) => [...nds, {
            id: result.node.id,
            type: result.node.nodeType === "FOLDER" ? "folderNode" : "taskNode",
            position: { x: result.node.positionX, y: result.node.positionY },
            data: { title: result.node.title, status: result.node.status, color: result.node.color, dueDate: null, assignees: [], hasSubGraph: false, subGraphProgress: null, attachmentCount: 0 },
          }]);
          setDeletedNodes((prev) => prev.filter((n) => n.id !== nodeId));
        }
      },
    });
    toast("Deleted", {
      action: {
        label: "Undo",
        onClick: async () => {
          const result = await restoreNode(projectId, nodeId);
          if (result.success && result.node) {
            setNodes((nds) => [...nds, {
              id: result.node.id,
              type: result.node.nodeType === "FOLDER" ? "folderNode" : "taskNode",
              position: { x: result.node.positionX, y: result.node.positionY },
              data: { title: result.node.title, status: result.node.status, color: result.node.color, dueDate: null, assignees: [], hasSubGraph: false, subGraphProgress: null, attachmentCount: 0 },
            }]);
            setDeletedNodes((prev) => prev.filter((n) => n.id !== nodeId));
          }
        },
      },
    });
  }, [isReadOnly, projectId, setNodes, setEdges, nodes, pushUndo]);

  const handleBatchDelete = useCallback((nodeIds: string[]) => {
    setNodes((nds) => nds.filter((n) => !nodeIds.includes(n.id)));
    setEdges((eds) => eds.filter((e) => !nodeIds.includes(e.source) && !nodeIds.includes(e.target)));
    setSelectedNodeIds([]);
    setSelectedNodeId(null);
  }, [setNodes, setEdges]);

  // Listen for delete-node custom events dispatched from node components
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { nodeId: string };
      if (detail?.nodeId) {
        handleDeleteNode(detail.nodeId);
      }
    };
    window.addEventListener("graph-delete-node", handler);
    return () => window.removeEventListener("graph-delete-node", handler);
  }, [handleDeleteNode]);

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      changes.forEach((change) => {
        if (change.type === "remove") {
          const removedEdge = edges.find((e) => e.id === change.id);
          deleteEdge(projectId, change.id);
          if (removedEdge) {
            const source = removedEdge.source;
            const target = removedEdge.target;
            pushUndo({
              type: "edge-delete",
              description: "Delete connection",
              undo: async () => {
                const result = await createEdge(projectId, graph.id, source, target);
                if (!("error" in result) && result.edge) {
                  setEdges((eds) => [...eds, makeEdge(result.edge.id, source, target)]);
                }
              },
            });
          }
        }
      });
    },
    [onEdgesChange, projectId, edges, graph.id, setEdges, pushUndo]
  );

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const handleNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const handleSelectNodeFromPanel = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === nodeId })));
    }
  }, [nodes, setNodes]);

  const handleEdgeContextMenu = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    event.stopPropagation();
    setEdgeContextMenu({ edgeId: edge.id, x: event.clientX, y: event.clientY });
  }, []);

  const handleDeleteEdgeFromMenu = useCallback(() => {
    if (!edgeContextMenu) return;
    const edgeId = edgeContextMenu.edgeId;
    const edgeToDelete = edges.find((e) => e.id === edgeId);
    if (edgeToDelete) {
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      deleteEdge(projectId, edgeId);
      pushUndo({
        type: "edge-delete",
        description: "Delete connection",
        undo: async () => {
          const result = await createEdge(projectId, graph.id, edgeToDelete.source, edgeToDelete.target);
          if (!("error" in result) && result.edge) {
            setEdges((eds) => [...eds, makeEdge(result.edge.id, edgeToDelete.source, edgeToDelete.target)]);
          }
        },
      });
    }
    setEdgeContextMenu(null);
  }, [edgeContextMenu, edges, projectId, graph.id, setEdges, pushUndo]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // Recently Deleted: restore a node
  const handleRestoreNode = useCallback(async (nodeId: string) => {
    try {
      const result = await restoreNode(projectId, nodeId);
      if (result.success && result.node) {
        setNodes((nds) => [...nds, {
          id: result.node.id,
          type: result.node.nodeType === "FOLDER" ? "folderNode" : "taskNode",
          position: { x: result.node.positionX, y: result.node.positionY },
          data: { title: result.node.title, status: result.node.status, color: result.node.color, dueDate: null, assignees: [], hasSubGraph: false, subGraphProgress: null, attachmentCount: 0 },
        }]);
        setDeletedNodes((prev) => prev.filter((n) => n.id !== nodeId));
        toast.success(`Restored "${result.node.title}"`);
      }
    } catch {
      toast.error("Failed to restore node");
    }
  }, [projectId, setNodes]);

  // Recently Deleted: drag start
  const handleDeletedDragStart = useCallback((e: React.DragEvent, node: DeletedNodeData) => {
    e.dataTransfer.setData("application/reactflow-restore", JSON.stringify(node));
    e.dataTransfer.effectAllowed = "move";
  }, []);

  // Handle drop on canvas to restore deleted node
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/reactflow-restore");
    if (!data) return;

    const deletedNode = JSON.parse(data) as DeletedNodeData;

    // Calculate drop position in flow coordinates
    let position = { x: deletedNode.positionX, y: deletedNode.positionY };
    if (reactFlowInstance.current) {
      const bounds = (e.target as HTMLElement).closest('.react-flow')?.getBoundingClientRect();
      if (bounds) {
        position = reactFlowInstance.current.screenToFlowPosition({
          x: e.clientX - bounds.left,
          y: e.clientY - bounds.top,
        });
      }
    }

    try {
      const result = await restoreNode(projectId, deletedNode.id);
      if (result.success && result.node) {
        // Update position to drop location
        await updateNodePosition(projectId, result.node.id, position.x, position.y);
        setNodes((nds) => [...nds, {
          id: result.node.id,
          type: result.node.nodeType === "FOLDER" ? "folderNode" : "taskNode",
          position,
          data: { title: result.node.title, status: result.node.status, color: result.node.color, dueDate: null, assignees: [], hasSubGraph: false, subGraphProgress: null, attachmentCount: 0 },
        }]);
        setDeletedNodes((prev) => prev.filter((n) => n.id !== deletedNode.id));
        toast.success(`Restored "${result.node.title}"`);
      }
    } catch {
      toast.error("Failed to restore node");
    }
  }, [projectId, setNodes]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setEdgeContextMenu(null);
  }, []);

  const selectedNode = graph.nodes.find((n) => n.id === selectedNodeId) || (selectedNodeId && nodes.find((n) => n.id === selectedNodeId) ? {
    id: selectedNodeId,
    title: (nodes.find((n) => n.id === selectedNodeId)?.data?.title as string) || "New Task",
    description: null,
    status: (nodes.find((n) => n.id === selectedNodeId)?.data?.status as string) || "NOT_STARTED",
    nodeType: (nodes.find((n) => n.id === selectedNodeId)?.type === "folderNode" ? "FOLDER" : "TASK"),
    color: (nodes.find((n) => n.id === selectedNodeId)?.data?.color as string | null) || null,
    dueDate: null,
    positionX: 0,
    positionY: 0,
    subGraph: null,
    assignments: [] as Array<{ user: { id: string; name: string | null; imageUrl: string | null }; isApprover: boolean }>,
    attachments: [] as Array<{ id: string; fileName: string; fileUrl: string; fileType: string }>,
    incomingEdges: [] as Array<{ id: string; sourceNodeId: string }>,
    outgoingEdges: [] as Array<{ id: string; targetNodeId: string }>,
  } : null);

  const deadlineTasks = graph.nodes
    .filter((n) => n.dueDate)
    .map((n) => ({ id: n.id, title: n.title, status: n.status, dueDate: n.dueDate }));

  const showMultiSelect = selectedNodeIds.length > 1 && !isReadOnly;

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

        <div className="relative flex-1" onContextMenu={handleContextMenu} onDrop={handleDrop} onDragOver={handleDragOver}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={isReadOnly ? undefined : handleNodesChange}
            onEdgesChange={isReadOnly ? undefined : handleEdgesChange}
            onConnect={handleConnect}
            connectOnClick={true}
            onInit={(instance) => { reactFlowInstance.current = instance; }}
            onNodeClick={handleNodeClick}
            onEdgeContextMenu={handleEdgeContextMenu}
            onNodeDoubleClick={handleNodeDoubleClick}
            onPaneClick={handlePaneClick}
            onSelectionChange={handleSelectionChange}
            isValidConnection={isValidConnection}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={{ type: "themed" }}
            fitView
            fitViewOptions={{ padding: 0.4, maxZoom: 1 }}
            deleteKeyCode={isReadOnly ? null : ["Delete", "Backspace"]}
            className={`bg-page [&_.react-flow__pane]:!cursor-default [&_.react-flow__pane.dragging]:!cursor-grabbing ${isPanning ? "[&_.react-flow__pane]:!cursor-grab [&_.react-flow__pane.dragging]:!cursor-grabbing" : ""}`}
            /* 7.1 - Marquee select by default, spacebar-to-pan */
            selectionOnDrag={!isPanning}
            panOnDrag={isPanning ? [0, 2] : [2]}
            panOnScroll={true}
            /* Selection styling */
            selectionMode={undefined}
          >
            <Background variant={BackgroundVariant.Dots} gap={22} size={2} color="var(--text-muted)" />
            <Panel position="top-left" className="space-y-2">
              <GraphBreadcrumbs breadcrumbs={breadcrumbs} projectId={projectId} currentPath={currentPath} />
            </Panel>
            <Panel position="top-right" className="flex items-center gap-2">
              <CollaboratorPresence graphId={graph.id} />
              <Button size="sm" variant="secondary" onClick={() => setShareOpen(true)} className="gap-1.5">
                <Share2 className="h-3.5 w-3.5" /> Share
              </Button>
            </Panel>
          </ReactFlow>

          {/* 7.2 - Controls at z-5, below task detail panel */}
          <CustomControls />

          {/* Recently Deleted Panel */}
          {!isReadOnly && (
            <RecentlyDeletedPanel
              deletedNodes={deletedNodes}
              onRestore={handleRestoreNode}
              onDragStart={handleDeletedDragStart}
            />
          )}

          {/* 7.1 - Multi-select batch actions panel */}
          {showMultiSelect && (
            <MultiSelectPanel
              selectedNodeIds={selectedNodeIds}
              projectId={projectId}
              members={members}
              onDelete={handleBatchDelete}
              onClearSelection={() => {
                setSelectedNodeIds([]);
                setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
              }}
            />
          )}

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

          {/* Edge right-click context menu */}
          {edgeContextMenu && (
            <div
              className="fixed z-50 min-w-[140px] rounded-xl border border-themed-subtle bg-card py-1 shadow-themed-md"
              style={{ left: edgeContextMenu.x, top: edgeContextMenu.y }}
            >
              <button
                onClick={handleDeleteEdgeFromMenu}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--danger)] transition-colors hover:bg-[var(--danger-soft)]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete connection
              </button>
            </div>
          )}
        </div>

        {/* 7.2 - Task detail panel renders at z-20, above controls */}
        {selectedNodeId && selectedNode && (
          <TaskDetailPanel
            key={selectedNodeId}
            projectId={projectId}
            currentUserId={currentUserId}
            node={selectedNode}
            graphEdges={edges.map((e) => ({ id: e.id, sourceNodeId: e.source, targetNodeId: e.target }))}
            graphNodes={graph.nodes.map((gn) => {
              const liveNode = nodes.find((n) => n.id === gn.id);
              return { ...gn, status: (liveNode?.data?.status as string) || gn.status };
            })}
            members={members}
            isReadOnly={isReadOnly}
            onClose={() => setSelectedNodeId(null)}
            onDelete={() => handleDeleteNode(selectedNodeId)}
          />
        )}

        <ShareDialog
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          projectId={projectId}
          projectName={projectName}
          shareToken={shareToken}
          members={members}
          currentUserRole={role}
        />
      </div>
    </ReactFlowProvider>
  );
}
