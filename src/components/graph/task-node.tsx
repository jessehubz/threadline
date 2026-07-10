"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Calendar, Paperclip, ChevronRight } from "lucide-react";
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
  [key: string]: unknown;
}

function TaskNodeInner({ data, selected }: NodeProps & { data: TaskNodeData }) {
  const nodeData = data as TaskNodeData;
  const accentColor = nodeData.color || getStatusDotColor(nodeData.status);

  return (
    <div
      className={cn(
        "min-w-[200px] max-w-[280px] rounded-2xl border bg-card shadow-sm transition-all duration-200 ease-out",
        selected
          ? "shadow-lg ring-2 ring-[var(--accent)]/50"
          : "hover:-translate-y-px hover:shadow-md hover:border-[var(--accent)]/40"
      )}
      style={{ borderColor: selected ? accentColor : `${accentColor}25`, borderLeftWidth: "3px", borderLeftColor: accentColor }}
    >
      {/* Source Handle (right) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !rounded-full !border-2 !border-card !bg-[var(--border-default)]"
      />
      {/* Target Handle (left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !rounded-full !border-2 !border-card !bg-[var(--border-default)]"
      />

      <div className="p-3.5">
        {/* Status Badge — soft tint, not a solid block */}
        <div className="mb-2">
          <span
            className="status-tint"
            style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
            {getStatusLabel(nodeData.status)}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-item-title leading-tight line-clamp-2">
          {nodeData.title}
        </h4>

        {/* Sub-graph progress */}
        {nodeData.hasSubGraph && nodeData.subGraphProgress && (
          <div className="mt-2.5 flex items-center gap-1.5">
            <div className="h-1.5 flex-1 rounded-full bg-hover">
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${nodeData.subGraphProgress.total > 0 ? (nodeData.subGraphProgress.completed / nodeData.subGraphProgress.total) * 100 : 0}%`, backgroundColor: accentColor }}
              />
            </div>
            <span className="text-[10px] font-medium text-body">
              {nodeData.subGraphProgress.completed}/{nodeData.subGraphProgress.total}
            </span>
            <ChevronRight className="h-3 w-3 text-dim" />
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {nodeData.assignees.length > 0 && (
              <div className="flex -space-x-1.5">
                {nodeData.assignees.slice(0, 3).map((assignee) => (
                  <div
                    key={assignee.id}
                    className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-card accent-bg text-[9px] font-semibold accent-color"
                    title={assignee.name || ""}
                  >
                    {assignee.name?.[0]?.toUpperCase() || "?"}
                  </div>
                ))}
                {nodeData.assignees.length > 3 && (
                  <span className="ml-1 text-[10px] text-body">+{nodeData.assignees.length - 3}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-dim">
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
