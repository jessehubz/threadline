"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Calendar, Paperclip, ChevronRight, FileText, MessageCircle, Lock, Trash2 } from "lucide-react";
import { cn, getStatusLabel, getStatusDotColor, formatDate } from "@/lib/utils";

interface TaskNodeData {
  title: string;
  status: string;
  color: string | null;
  dueDate: Date | string | null;
  assignees: Array<{ id: string; name: string | null; imageUrl: string | null }>;
  hasSubGraph: boolean;
  subGraphProgress: { total: number; completed: number } | null;
  attachmentCount: number;
  hasDescription?: boolean;
  commentCount?: number;
  hasUnreadComments?: boolean;
  isRestricted?: boolean;
  [key: string]: unknown;
}

function TaskNodeInner({ id, data, selected }: NodeProps & { data: TaskNodeData }) {
  const nodeData = data as TaskNodeData;
  const accentColor = nodeData.color || getStatusDotColor(nodeData.status);

  return (
    <div
      className={cn(
        "group relative min-w-[220px] max-w-[300px] rounded-2xl border transition-all duration-200 ease-out",
        selected
          ? "shadow-lg ring-2 ring-[var(--accent)]/40 scale-[1.02]"
          : "hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--accent)]/30"
      )}
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: selected ? accentColor : 'var(--border-default)',
        boxShadow: selected ? undefined : 'var(--elevation-1, var(--shadow-sm))',
      }}
    >
      {/* Delete button - top-right on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          window.dispatchEvent(new CustomEvent("graph-delete-node", { detail: { nodeId: id } }));
        }}
        className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-themed-subtle bg-card shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[var(--danger-soft)] hover:border-[var(--danger)] hover:text-[var(--danger)] text-dim"
        aria-label="Delete node"
      >
        <Trash2 className="h-3 w-3" />
      </button>

      {/* Connection Handles - all 4 sides */}
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className="!h-3 !w-3 !rounded-full !border-2 !border-[var(--bg-elevated)] !bg-[var(--border-default)] opacity-40 group-hover:opacity-100 hover:!bg-[var(--accent)] transition-all duration-200"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="!h-3 !w-3 !rounded-full !border-2 !border-[var(--bg-elevated)] !bg-[var(--border-default)] opacity-40 group-hover:opacity-100 hover:!bg-[var(--accent)] transition-all duration-200"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className="!h-3 !w-3 !rounded-full !border-2 !border-[var(--bg-elevated)] !bg-[var(--border-default)] opacity-40 group-hover:opacity-100 hover:!bg-[var(--accent)] transition-all duration-200"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className="!h-3 !w-3 !rounded-full !border-2 !border-[var(--bg-elevated)] !bg-[var(--border-default)] opacity-40 group-hover:opacity-100 hover:!bg-[var(--accent)] transition-all duration-200"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="!h-3 !w-3 !rounded-full !border-2 !border-[var(--bg-elevated)] !bg-[var(--border-default)] opacity-40 group-hover:opacity-100 hover:!bg-[var(--accent)] transition-all duration-200"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        className="!h-3 !w-3 !rounded-full !border-2 !border-[var(--bg-elevated)] !bg-[var(--border-default)] opacity-40 group-hover:opacity-100 hover:!bg-[var(--accent)] transition-all duration-200"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className="!h-3 !w-3 !rounded-full !border-2 !border-[var(--bg-elevated)] !bg-[var(--border-default)] opacity-40 group-hover:opacity-100 hover:!bg-[var(--accent)] transition-all duration-200"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className="!h-3 !w-3 !rounded-full !border-2 !border-[var(--bg-elevated)] !bg-[var(--border-default)] opacity-40 group-hover:opacity-100 hover:!bg-[var(--accent)] transition-all duration-200"
      />

      {/* Color accent bar at top */}
      <div
        className="h-1 w-full rounded-t-2xl"
        style={{ backgroundColor: accentColor }}
      />

      <div className="p-4">
        {/* Top row: Status + indicators */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="status-tint"
            style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
            {getStatusLabel(nodeData.status)}
          </span>

          {/* Right-side indicators */}
          <div className="flex items-center gap-1">
            {nodeData.isRestricted && (
              <Lock className="h-3 w-3 text-[var(--text-muted)]" />
            )}
            {nodeData.hasDescription && (
              <FileText className="h-3 w-3 text-[var(--text-muted)]" />
            )}
            {(nodeData.commentCount ?? 0) > 0 && (
              <div className="relative">
                <MessageCircle className="h-3 w-3 text-[var(--text-muted)]" />
                {nodeData.hasUnreadComments && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[var(--accent)] ring-2 ring-[var(--bg-elevated)]" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className="text-[13px] font-medium leading-tight line-clamp-2 text-[var(--text-primary)] mb-2">
          {nodeData.title}
        </h4>

        {/* Sub-graph progress */}
        {nodeData.hasSubGraph && nodeData.subGraphProgress && nodeData.subGraphProgress.total > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: 'var(--border-default)' }}>
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${nodeData.subGraphProgress.total > 0 ? (nodeData.subGraphProgress.completed / nodeData.subGraphProgress.total) * 100 : 0}%`, backgroundColor: accentColor }}
              />
            </div>
            <span className="text-[10px] font-medium text-[var(--text-muted)]">
              {nodeData.subGraphProgress.completed}/{nodeData.subGraphProgress.total}
            </span>
            <ChevronRight className="h-3 w-3 text-[var(--text-muted)]" />
          </div>
        )}

        {/* Footer: Assignees + metadata */}
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          {/* Assignees */}
          <div className="flex items-center">
            {nodeData.assignees.length > 0 ? (
              <div className="flex -space-x-1.5">
                {nodeData.assignees.slice(0, 3).map((assignee) => (
                  <div
                    key={assignee.id}
                    className="flex h-5 w-5 items-center justify-center rounded-full border-2 text-[8px] font-semibold"
                    style={{ borderColor: 'var(--bg-elevated)', backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
                    title={assignee.name || ''}
                  >
                    {assignee.imageUrl ? (
                      <img src={assignee.imageUrl} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      assignee.name?.[0]?.toUpperCase() || '?'
                    )}
                  </div>
                ))}
                {nodeData.assignees.length > 3 && (
                  <span className="ml-1 text-[9px] font-medium text-[var(--text-muted)]">
                    +{nodeData.assignees.length - 3}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[10px] text-[var(--text-muted)]">Unassigned</span>
            )}
          </div>

          {/* Metadata icons */}
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            {nodeData.attachmentCount > 0 && (
              <span className="flex items-center gap-0.5 text-[10px]">
                <Paperclip className="h-3 w-3" /> {nodeData.attachmentCount}
              </span>
            )}
            {nodeData.dueDate && (
              <span className="flex items-center gap-0.5 text-[10px]">
                <Calendar className="h-3 w-3" /> {formatDate(nodeData.dueDate)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const TaskNodeComponent = memo(TaskNodeInner);
