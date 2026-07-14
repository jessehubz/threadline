"use client";

import { useState, useRef, useEffect } from "react";
import { X, Trash2, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { updateNode } from "@/actions/graph-actions";
import { submitForApproval } from "@/actions/approval-actions";
import { assignUser, unassignUser } from "@/actions/assignment-actions";
import { FileUpload } from "@/components/file-upload";
import { TaskComments } from "@/components/graph/task-comments";
import { DatePicker } from "@/components/ui/date-picker";
import { cn, getStatusColor, getStatusLabel } from "@/lib/utils";
import { toast } from "sonner";

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
}

const STATUS_OPTIONS = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "URGENT", label: "Urgent" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "COMPLETE", label: "Complete" },
];

export function TaskDetailPanel({
  projectId, currentUserId, node, graphEdges, graphNodes, members, isReadOnly, onClose, onDelete,
}: TaskDetailPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to top when panel opens
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, []);
  const [title, setTitle] = useState(node.title);
  const [description, setDescription] = useState(node.description || "");
  const [status, setStatus] = useState(node.status);
  const [color, setColor] = useState(node.color || "");
  const [dueDate, setDueDate] = useState(
    node.dueDate ? new Date(node.dueDate).toISOString().split("T")[0] : ""
  );
  const [saving, setSaving] = useState(false);


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
  }

  async function handleUnassign(userId: string) {
    await unassignUser(projectId, node.id, userId);
    toast.success("Removed");
  }



  return (
    <div ref={scrollRef} className="fixed inset-0 z-30 w-full md:relative md:inset-auto md:z-auto md:w-[400px] shrink-0 overflow-y-auto border-l border-themed-subtle bg-card">
      <div className="flex items-center justify-between border-b border-themed-subtle px-5 py-4">
        <h3 className="text-card-title">Task Details</h3>
        <div className="flex items-center gap-1">
          {!isReadOnly && (
            <button onClick={onDelete} className="rounded-xl p-1.5 text-dim transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]" aria-label="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button onClick={onClose} className="rounded-xl p-1.5 text-dim transition-colors hover:bg-hover" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-6 p-5">
        {/* Status */}
        <div>
          <label className="text-eyebrow mb-2 block">Status</label>
          {isReadOnly ? (
            <Badge className={getStatusColor(status)}>{getStatusLabel(status)}</Badge>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 hover:scale-105",
                    status === opt.value ? getStatusColor(opt.value) : "bg-hover text-body"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
          {status === "AWAITING_APPROVAL" && <p className="mt-2 text-xs text-[var(--violet-600)]">Awaiting approval</p>}
          {status === "REJECTED" && <p className="mt-2 flex items-center gap-1 text-xs text-[var(--danger)]"><AlertCircle className="h-3 w-3" /> Rejected</p>}
        </div>

        {/* Color */}
        {!isReadOnly && (
          <div>
            <label className="text-eyebrow mb-2 block">Color</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setColor(""); updateNode(projectId, node.id, { color: null }); }}
                className={cn("h-7 w-7 rounded-lg border-2 bg-hover transition-all", !color && "ring-2 ring-[var(--accent)] ring-offset-2")}
                title="Auto (from status)"
              />
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => { setColor(c); updateNode(projectId, node.id, { color: c }); }}
                  className={cn("h-7 w-7 rounded-lg border-2 border-transparent transition-all", color === c && "ring-2 ring-[var(--accent)] ring-offset-2")}
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
        <DatePicker label="Due Date" value={dueDate} onChange={(val) => { setDueDate(val); updateNode(projectId, node.id, { title, description, color: color || null, dueDate: val || null }).then(() => toast.success("Saved")); }} disabled={isReadOnly} />

        {/* Assignees */}
        <div>
          <label className="text-eyebrow mb-2 block">Assigned People</label>
          <div className="space-y-1.5">
            {(() => {
              const assignedIds = new Set(node.assignments.map((a) => a.user.id));
              const sortedMembers = [...members].sort((a, b) => {
                const aAssigned = assignedIds.has(a.user.id);
                const bAssigned = assignedIds.has(b.user.id);
                if (aAssigned && !bAssigned) return -1;
                if (!aAssigned && bAssigned) return 1;
                return 0;
              });
              return sortedMembers.map((m) => {
                const isAssigned = assignedIds.has(m.user.id);
                const assignment = node.assignments.find((a) => a.user.id === m.user.id);
                const isApprover = assignment?.isApprover ?? false;
                return (
                  <button
                    key={m.user.id}
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => isAssigned ? handleUnassign(m.user.id) : handleAssign(m.user.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ease-out",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1",
                      isAssigned
                        ? "bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]"
                        : "bg-hover ring-1 ring-transparent",
                      !isReadOnly && "hover:-translate-y-0.5 hover:shadow-themed-md cursor-pointer",
                      isReadOnly && "cursor-default opacity-80"
                    )}
                    aria-pressed={isAssigned}
                    aria-label={`${isAssigned ? "Unassign" : "Assign"} ${m.user.name || m.user.email}`}
                  >
                    <div className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200",
                      isAssigned ? "bg-[var(--accent)] text-white" : "accent-bg accent-color"
                    )}>
                      {isAssigned && <Check className="h-3.5 w-3.5" />}
                      {!isAssigned && (m.user.name?.[0]?.toUpperCase() || m.user.email[0].toUpperCase())}
                    </div>
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className={cn(
                        "truncate text-[13px] font-medium transition-colors duration-200",
                        isAssigned ? "text-[var(--accent)]" : "text-body"
                      )}>
                        {m.user.name || m.user.email}
                      </span>
                      <Badge variant={isAssigned ? "success" : "default"} className="shrink-0 text-[10px] px-1.5 py-0">
                        {m.role === "OWNER" ? "Owner" : m.role === "EDITOR" ? "Editor" : "Viewer"}
                      </Badge>
                      {isApprover && (
                        <Badge variant="info" className="shrink-0 text-[10px] px-1.5 py-0">
                          Approver
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              });
            })()}
          </div>
        </div>

        {/* Dependencies */}
        {blockedBy.length > 0 && (
          <div>
            <label className="text-eyebrow mb-2 block text-[var(--danger)]">Blocked by ({blockedBy.length})</label>
            <div className="space-y-1.5">
              {blockedBy.map((dep) => (
                <div key={dep!.id} className="rounded-xl bg-[var(--danger-soft)] px-3 py-2 text-xs font-medium text-[var(--danger)]">{dep!.title}</div>
              ))}
            </div>
          </div>
        )}
        {blocks.length > 0 && (
          <div>
            <label className="text-eyebrow mb-2 block">Blocks ({blocks.length})</label>
            <div className="space-y-1.5">
              {blocks.map((dep) => (
                <div key={dep!.id} className="rounded-xl bg-hover px-3 py-2 text-xs font-medium text-body">{dep!.title}</div>
              ))}
            </div>
          </div>
        )}

        {/* Attachments */}
        <div>
          <label className="text-eyebrow mb-2 block">Attachments</label>
          <FileUpload nodeId={node.id} projectId={projectId} attachments={node.attachments} isReadOnly={isReadOnly} />
        </div>

        {/* Comments - all project members can comment regardless of graph edit role */}
        <div>
          <TaskComments nodeId={node.id} currentUserId={currentUserId} isReadOnly={false} />
        </div>

        {!isReadOnly && (
          <Button onClick={handleSave} loading={saving} className="w-full">Save Changes</Button>
        )}
      </div>
    </div>
  );
}
