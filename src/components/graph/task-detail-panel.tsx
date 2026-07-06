"use client";

import { useState } from "react";
import { X, Trash2, ChevronRight, AlertCircle, UserPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { updateNode, createSubGraph } from "@/actions/graph-actions";
import { submitForApproval } from "@/actions/approval-actions";
import { assignUser, unassignUser } from "@/actions/assignment-actions";
import { FileUpload } from "@/components/file-upload";
import { TaskComments } from "@/components/graph/task-comments";
import { cn, getStatusColor, getStatusLabel } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#22c55e", "#3b82f6",
  "#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#64748b",
];

interface TaskDetailPanelProps {
  projectId: string;
  currentUserId: string;
  node: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    color: string | null;
    dueDate: Date | string | null;
    subGraph?: { nodes: Array<{ id: string; status: string }> } | null;
    assignments: Array<{ user: { id: string; name: string | null; imageUrl: string | null }; isApprover: boolean }>;
    attachments: Array<{ id: string; fileName: string; fileUrl: string; fileType: string }>;
    incomingEdges: Array<{ id: string; sourceNodeId: string }>;
    outgoingEdges: Array<{ id: string; targetNodeId: string }>;
  };
  graphEdges: Array<{ id: string; sourceNodeId: string; targetNodeId: string }>;
  graphNodes: Array<{ id: string; title: string; status: string }>;
  members: Array<{ id: string; role: string; user: { id: string; name: string | null; email: string } }>;
  isReadOnly: boolean;
  onClose: () => void;
  onDelete: () => void;
  currentPath: string[];
}

const STATUS_OPTIONS = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "COMPLETE", label: "Complete" },
];

export function TaskDetailPanel({
  projectId, currentUserId, node, graphEdges, graphNodes, members, isReadOnly, onClose, onDelete, currentPath,
}: TaskDetailPanelProps) {
  const router = useRouter();
  const [title, setTitle] = useState(node.title);
  const [description, setDescription] = useState(node.description || "");
  const [status, setStatus] = useState(node.status);
  const [color, setColor] = useState(node.color || "");
  const [dueDate, setDueDate] = useState(
    node.dueDate ? new Date(node.dueDate).toISOString().split("T")[0] : ""
  );
  const [saving, setSaving] = useState(false);
  const [showMemberPicker, setShowMemberPicker] = useState(false);

  const blockedBy = graphEdges
    .filter((e) => e.targetNodeId === node.id)
    .map((e) => graphNodes.find((n) => n.id === e.sourceNodeId))
    .filter(Boolean)
    .filter((n) => n!.status !== "COMPLETE");

  const blocks = graphEdges
    .filter((e) => e.sourceNodeId === node.id)
    .map((e) => graphNodes.find((n) => n.id === e.targetNodeId))
    .filter(Boolean);

  const hasApprover = node.assignments.some((a) => a.isApprover);
  const assignedUserIds = new Set(node.assignments.map((a) => a.user.id));
  const unassignedMembers = members.filter((m) => !assignedUserIds.has(m.user.id));

  async function handleSave() {
    setSaving(true);
    await updateNode(projectId, node.id, { title, description, color: color || null, dueDate: dueDate || null });
    toast.success("Saved");
    setSaving(false);
  }

  async function handleStatusChange(newStatus: string) {
    setStatus(newStatus);
    if (newStatus === "COMPLETE" && hasApprover) {
      const result = await submitForApproval(projectId, node.id);
      if (result.error) { toast.error(result.error); setStatus(node.status); return; }
      setStatus("AWAITING_APPROVAL");
      toast.success("Submitted for approval");
      return;
    }
    const result = await updateNode(projectId, node.id, { status: newStatus });
    if (result && "error" in result) { toast.error(result.error as string); setStatus(node.status); }
  }

  async function handleAssign(userId: string) {
    const result = await assignUser(projectId, node.id, userId);
    if (result.error) toast.error(result.error);
    else toast.success("Assigned");
    setShowMemberPicker(false);
  }

  async function handleUnassign(userId: string) {
    await unassignUser(projectId, node.id, userId);
    toast.success("Removed");
  }

  async function handleOpenSubGraph() {
    let subGraphId: string | undefined;
    if (!node.subGraph) {
      const result = await createSubGraph(projectId, node.id);
      if ("error" in result) { toast.error("Failed to create sub-graph"); return; }
      subGraphId = result.graphId;
    } else {
      subGraphId = (node as unknown as { subGraphId?: string }).subGraphId;
    }
    const newPath = [...currentPath, node.id].join(",");
    router.push(`/graph/${projectId}?path=${newPath}&graphId=${subGraphId}`);
  }

  return (
    <div className="w-96 shrink-0 overflow-y-auto border-l border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Task Details</h3>
        <div className="flex items-center gap-1">
          {!isReadOnly && (
            <button onClick={onDelete} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950" aria-label="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-5 p-4">
        {/* Status */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Status</label>
          {isReadOnly ? (
            <Badge className={getStatusColor(status)}>{getStatusLabel(status)}</Badge>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    status === opt.value ? getStatusColor(opt.value) : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
          {status === "AWAITING_APPROVAL" && <p className="mt-2 text-xs text-amber-600">Awaiting approval</p>}
          {status === "REJECTED" && <p className="mt-2 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Rejected</p>}
        </div>

        {/* Color */}
        {!isReadOnly && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">Color</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => { setColor(""); updateNode(projectId, node.id, { color: null }); }}
                className={cn("h-6 w-6 rounded-full border-2 bg-gray-200 dark:bg-gray-700", !color && "ring-2 ring-brand-500 ring-offset-1")}
                title="Auto (from status)"
              />
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => { setColor(c); updateNode(projectId, node.id, { color: c }); }}
                  className={cn("h-6 w-6 rounded-full border-2 border-transparent", color === c && "ring-2 ring-brand-500 ring-offset-1")}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Title */}
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={handleSave} disabled={isReadOnly} />

        {/* Description */}
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} onBlur={handleSave} disabled={isReadOnly} rows={3} placeholder="Add details..." />

        {/* Due Date */}
        <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} onBlur={handleSave} disabled={isReadOnly} />

        {/* Assignees */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">Assigned People</label>
          <div className="space-y-1.5">
            {node.assignments.map((assignment) => (
              <div key={assignment.user.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-2 py-1.5 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                    {assignment.user.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">{assignment.user.name || "Unknown"}</span>
                  {assignment.isApprover && <Badge variant="info">Approver</Badge>}
                </div>
                {!isReadOnly && (
                  <button onClick={() => handleUnassign(assignment.user.id)} className="text-gray-400 hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {!isReadOnly && (
            <div className="mt-2 relative">
              <button
                onClick={() => setShowMemberPicker(!showMemberPicker)}
                className="flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-2.5 py-1.5 text-xs text-gray-500 hover:border-brand-500 hover:text-brand-600 dark:border-gray-700"
              >
                <UserPlus className="h-3 w-3" /> Assign member
              </button>
              {showMemberPicker && unassignedMembers.length > 0 && (
                <div className="absolute left-0 top-full z-10 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                  {unassignedMembers.map((m) => (
                    <button
                      key={m.user.id}
                      onClick={() => handleAssign(m.user.id)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-[10px] font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                        {m.user.name?.[0]?.toUpperCase() || m.user.email[0].toUpperCase()}
                      </div>
                      {m.user.name || m.user.email}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dependencies */}
        {blockedBy.length > 0 && (
          <div>
            <label className="mb-1 block text-xs font-medium text-red-500">Blocked by ({blockedBy.length})</label>
            <div className="space-y-1">
              {blockedBy.map((dep) => (
                <div key={dep!.id} className="rounded-lg bg-red-50 px-2 py-1 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">{dep!.title}</div>
              ))}
            </div>
          </div>
        )}
        {blocks.length > 0 && (
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Blocks ({blocks.length})</label>
            <div className="space-y-1">
              {blocks.map((dep) => (
                <div key={dep!.id} className="rounded-lg bg-gray-50 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">{dep!.title}</div>
              ))}
            </div>
          </div>
        )}

        {/* Attachments */}
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">Attachments</label>
          <FileUpload nodeId={node.id} projectId={projectId} attachments={node.attachments} isReadOnly={isReadOnly} />
        </div>

        {/* Comments */}
        <div>
          <TaskComments nodeId={node.id} currentUserId={currentUserId} isReadOnly={isReadOnly} />
        </div>

        {/* Sub-graph */}
        <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
          <Button variant="secondary" size="sm" onClick={handleOpenSubGraph} className="w-full">
            <ChevronRight className="h-4 w-4" />
            {node.subGraph ? "Open Sub-Graph" : "Create Sub-Graph"}
          </Button>
        </div>

        {!isReadOnly && (
          <Button onClick={handleSave} loading={saving} className="w-full">Save Changes</Button>
        )}
      </div>
    </div>
  );
}
