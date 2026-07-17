"use client";

import { useState } from "react";
import { Trash2, UserPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateNode, deleteNode } from "@/actions/graph-actions";
import { assignUser } from "@/actions/assignment-actions";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "AWAITING_APPROVAL", label: "Awaiting Approval" },
  { value: "REJECTED", label: "Rejected" },
  { value: "COMPLETE", label: "Complete" },
];

interface MultiSelectPanelProps {
  selectedNodeIds: string[];
  projectId: string;
  members: Array<{ id: string; role: string; user: { id: string; name: string | null; email: string } }>;
  canEditNodes: boolean;
  canDeleteNodes: boolean;
  onDelete: (nodeIds: string[]) => void;
  onClearSelection: () => void;
}

export function MultiSelectPanel({
  selectedNodeIds,
  projectId,
  members,
  canEditNodes,
  canDeleteNodes,
  onDelete,
  onClearSelection,
}: MultiSelectPanelProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const count = selectedNodeIds.length;

  const handleBatchDelete = async () => {
    if (!confirm(`Delete ${count} selected node${count > 1 ? "s" : ""}?`)) return;
    setIsProcessing(true);
    try {
      await Promise.all(selectedNodeIds.map((id) => deleteNode(projectId, id)));
      onDelete(selectedNodeIds);
      toast.success(`Deleted ${count} node${count > 1 ? "s" : ""}`);
    } catch {
      toast.error("Failed to delete some nodes");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchStatusChange = async (status: string) => {
    setIsProcessing(true);
    try {
      const results = await Promise.all(
        selectedNodeIds.map((id) => updateNode(projectId, id, { status }))
      );
      const failures = results.filter((r) => r && "error" in r);
      if (failures.length > 0) {
        toast.error(`${failures.length} node${failures.length > 1 ? "s" : ""} could not be updated`);
      } else {
        toast.success(`Updated ${count} node${count > 1 ? "s" : ""} to ${STATUS_OPTIONS.find((s) => s.value === status)?.label}`);
      }
      setShowStatusMenu(false);
      onClearSelection();
    } catch {
      toast.error("Failed to update some nodes");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchAssign = async (userId: string) => {
    setIsProcessing(true);
    try {
      await Promise.all(
        selectedNodeIds.map((nodeId) => assignUser(projectId, nodeId, userId, false))
      );
      toast.success(`Assigned ${count} node${count > 1 ? "s" : ""}`);
      setShowAssignMenu(false);
      onClearSelection();
    } catch {
      toast.error("Failed to assign some nodes");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="absolute bottom-16 left-1/2 z-20 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-auto rounded-xl border border-themed-subtle bg-card px-3 py-2.5 sm:px-4 sm:py-3 shadow-themed-lg">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
        <span className="text-sm font-medium text-body">
          {count} node{count > 1 ? "s" : ""} selected
        </span>

        <div className="hidden sm:block h-5 w-px bg-hover" />

        {/* Change Status */}
        {canEditNodes && (
        <div className="relative">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => { setShowStatusMenu(!showStatusMenu); setShowAssignMenu(false); }}
            disabled={isProcessing}
            className="gap-1.5"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            Change Status
          </Button>
          {showStatusMenu && (
            <div className="absolute bottom-full left-0 mb-2 w-48 rounded-xl border border-themed bg-card py-1 shadow-themed-md">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleBatchStatusChange(opt.value)}
                  className="block w-full px-3 py-2 text-left text-sm text-body hover:bg-hover"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Assign */}
        {canEditNodes && (
        <div className="relative">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => { setShowAssignMenu(!showAssignMenu); setShowStatusMenu(false); }}
            disabled={isProcessing}
            className="gap-1.5"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Assign
          </Button>
          {showAssignMenu && (
            <div className="absolute bottom-full left-0 mb-2 max-h-48 w-56 overflow-y-auto rounded-xl border border-themed bg-card py-1 shadow-themed-md">
              {members.map((m) => (
                <button
                  key={m.user.id}
                  onClick={() => handleBatchAssign(m.user.id)}
                  className="block w-full px-3 py-2 text-left text-sm text-body hover:bg-hover"
                >
                  {m.user.name || m.user.email}
                </button>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Delete */}
        {canDeleteNodes && (
        <Button
          size="sm"
          variant="danger"
          onClick={handleBatchDelete}
          disabled={isProcessing}
          className="gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
        )}

        <div className="hidden sm:block h-5 w-px bg-hover" />

        <button
          onClick={onClearSelection}
          className="text-xs text-dim hover:text-body"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
