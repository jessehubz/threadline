"use client";

import { memo, useEffect, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Folder, ChevronRight, MessageCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderNodeData {
  title: string;
  status: string;
  color: string | null;
  subGraphProgress: { total: number; completed: number } | null;
  commentCount?: number;
  hasUnreadComments?: boolean;
  isRemoving?: boolean;
  [key: string]: unknown;
}

function FolderNodeInner({ id, data, selected }: NodeProps & { data: FolderNodeData }) {
  const nodeData = data as FolderNodeData;
  const accentColor = nodeData.color || "#71717A";
  const progress = nodeData.subGraphProgress;
  const pct = progress && progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  // Nodes have no native React Flow enter transition, so fade+scale in on
  // first mount via a rAF-delayed flag (the @starting-style-fallback pattern).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const isVisible = mounted && !nodeData.isRemoving;

  return (
    <div
      className={cn(
        "group relative min-w-[220px] max-w-[300px] rounded-xl border-2 border-dashed bg-card/95 shadow-sm transition-[transform,opacity,box-shadow,border-color] duration-200",
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
        nodeData.isRemoving && "pointer-events-none",
        selected
          ? "shadow-lg ring-2 ring-[var(--accent)]/50"
          : "hover:shadow-md hover:border-solid"
      )}
      style={{ borderColor: selected ? accentColor : `${accentColor}60` }}
    >
      {/* Delete button - top-right on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          window.dispatchEvent(new CustomEvent("graph-delete-node", { detail: { nodeId: id } }));
        }}
        className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-themed-subtle bg-card shadow-sm opacity-0 group-hover:opacity-100 transition-[opacity,background-color,border-color,color] duration-200 hover:bg-[var(--danger-soft)] hover:border-[var(--danger)] hover:text-[var(--danger)] text-dim"
        aria-label="Delete node"
      >
        <Trash2 className="h-3 w-3" />
      </button>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !rounded-full !border-2 !border-card !bg-[var(--accent)] opacity-60 group-hover:opacity-100 hover:!scale-125 transition-[opacity,transform] duration-200"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !rounded-full !border-2 !border-card !bg-[var(--accent)] opacity-60 group-hover:opacity-100 hover:!scale-125 transition-[opacity,transform] duration-200"
      />

      <div className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${accentColor}15` }}>
            <Folder className="h-4.5 w-4.5" style={{ color: accentColor }} />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-item-title">
              {nodeData.title}
            </h4>
            {progress && progress.total > 0 && (
              <p className="text-[10px] text-body">
                {progress.completed}/{progress.total} tasks
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {(nodeData.commentCount ?? 0) > 0 && (
              <div className="relative">
                <MessageCircle className="h-3.5 w-3.5 text-dim" />
                {nodeData.hasUnreadComments && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[var(--accent)] ring-2 ring-card" />
                )}
              </div>
            )}
            <ChevronRight className="h-4 w-4 text-dim" />
          </div>
        </div>

        {progress && progress.total > 0 && (
          <div className="mt-3">
            <div className="h-1.5 w-full rounded-full bg-hover">
              <div
                className="h-1.5 rounded-full transition-[width] duration-300"
                style={{ width: `${pct}%`, backgroundColor: accentColor }}
              />
            </div>
          </div>
        )}


      </div>
    </div>
  );
}

export const FolderNodeComponent = memo(FolderNodeInner);
