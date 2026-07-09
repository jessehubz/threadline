"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Calendar, Paperclip, ChevronRight } from "lucide-react";
import { cn, getStatusLabel, formatDate } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: "#9ca3af",
  IN_PROGRESS: "#3b82f6",
  BLOCKED: "#ef4444",
  AWAITING_APPROVAL: "#f59e0b",
  REJECTED: "#f97316",
  COMPLETE: "#22c55e",
};

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
  const accentColor = nodeData.color || STATUS_COLORS[nodeData.status] || "#9ca3af";

  return (
    <div
      className={cn(
        "min-w-[200px] max-w-[280px] rounded-2xl border bg-white shadow-sm transition-all duration-200",
        selected
          ? "shadow-lg ring-2 ring-brand-300/50700/50"
          : "hover:shadow-md"
      )}
      style={{ borderColor: selected ? accentColor : `${accentColor}30`, borderLeftWidth: "4px", borderLeftColor: accentColor }}
    >
      {/* Source Handle (right) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-surface-400900500"
      />
      {/* Target Handle (left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-surface-400900500"
      />

      <div className="p-3.5">
        {/* Status Badge */}
        <div className="mb-2">
          <span
            className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold text-white"
            style={{ backgroundColor: accentColor }}
          >
            {getStatusLabel(nodeData.status)}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-[13px] font-semibold leading-tight text-[#1A1A1A] line-clamp-2">
          {nodeData.title}
        </h4>

        {/* Sub-graph progress */}
        {nodeData.hasSubGraph && nodeData.subGraphProgress && (
          <div className="mt-2.5 flex items-center gap-1.5">
            <div className="h-1.5 flex-1 rounded-full bg-surface-100">
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${nodeData.subGraphProgress.total > 0 ? (nodeData.subGraphProgress.completed / nodeData.subGraphProgress.total) * 100 : 0}%`, backgroundColor: accentColor }}
              />
            </div>
            <span className="text-[10px] font-medium text-[#6B7280]">
              {nodeData.subGraphProgress.completed}/{nodeData.subGraphProgress.total}
            </span>
            <ChevronRight className="h-3 w-3 text-surface-400" />
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
                    className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-brand-100 text-[9px] font-semibold text-brand-700900"
                    title={assignee.name || ""}
                  >
                    {assignee.name?.[0]?.toUpperCase() || "?"}
                  </div>
                ))}
                {nodeData.assignees.length > 3 && (
                  <span className="ml-1 text-[10px] text-[#6B7280]">+{nodeData.assignees.length - 3}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-surface-400">
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
