"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Folder, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderNodeData {
  title: string;
  status: string;
  color: string | null;
  subGraphProgress: { total: number; completed: number } | null;
  [key: string]: unknown;
}

function FolderNodeInner({ data, selected }: NodeProps & { data: FolderNodeData }) {
  const nodeData = data as FolderNodeData;
  const accentColor = nodeData.color || "#8b5cf6";
  const progress = nodeData.subGraphProgress;
  const pct = progress && progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <div
      className={cn(
        "min-w-[220px] max-w-[300px] rounded-2xl border-2 border-dashed bg-white/95 shadow-sm transition-all duration-200/95",
        selected
          ? "shadow-lg ring-2 ring-purple-300/50700/50"
          : "hover:shadow-md hover:border-solid"
      )}
      style={{ borderColor: selected ? accentColor : `${accentColor}60` }}
    >
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-purple-400900"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-purple-400900"
      />

      <div className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${accentColor}15` }}>
            <Folder className="h-4.5 w-4.5" style={{ color: accentColor }} />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-[13px] font-semibold text-surface-900">
              {nodeData.title}
            </h4>
            {progress && (
              <p className="text-[10px] text-surface-500">
                {progress.completed}/{progress.total} tasks
              </p>
            )}
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-surface-400" />
        </div>

        {progress && progress.total > 0 && (
          <div className="mt-3">
            <div className="h-1.5 w-full rounded-full bg-surface-100">
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: accentColor }}
              />
            </div>
          </div>
        )}

        <div className="mt-2.5 text-[10px] font-medium" style={{ color: accentColor }}>
          Double-click to open
        </div>
      </div>
    </div>
  );
}

export const FolderNodeComponent = memo(FolderNodeInner);
