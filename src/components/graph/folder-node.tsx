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
        "min-w-[220px] max-w-[300px] rounded-xl border-2 border-dashed bg-white/95 shadow-sm transition-all dark:bg-gray-900/95",
        selected
          ? "ring-2 ring-purple-300 dark:ring-purple-700"
          : "hover:shadow-md hover:border-solid"
      )}
      style={{ borderColor: selected ? accentColor : `${accentColor}80` }}
    >
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-white !bg-purple-400 dark:!border-gray-900"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-white !bg-purple-400 dark:!border-gray-900"
      />

      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${accentColor}20` }}>
            <Folder className="h-4 w-4" style={{ color: accentColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {nodeData.title}
            </h4>
            {progress && (
              <p className="text-[10px] text-gray-500">
                {progress.completed}/{progress.total} tasks
              </p>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
        </div>

        {progress && progress.total > 0 && (
          <div className="mt-3">
            <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-1.5 rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: accentColor }}
              />
            </div>
          </div>
        )}

        <div className="mt-2 text-[10px] font-medium" style={{ color: accentColor }}>
          Double-click to open
        </div>
      </div>
    </div>
  );
}

export const FolderNodeComponent = memo(FolderNodeInner);
