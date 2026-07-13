"use client";

import { useState } from "react";
import { Trash2, RotateCcw, GripVertical, ChevronDown, ChevronUp, Folder } from "lucide-react";

interface DeletedNode {
  id: string;
  title: string;
  nodeType: string;
  status: string;
  color: string | null;
  positionX: number;
  positionY: number;
  deletedAt: Date | string;
}

interface RecentlyDeletedPanelProps {
  deletedNodes: DeletedNode[];
  onRestore: (nodeId: string) => void;
  onDragStart: (e: React.DragEvent, node: DeletedNode) => void;
}

export function RecentlyDeletedPanel({ deletedNodes, onRestore, onDragStart }: RecentlyDeletedPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (deletedNodes.length === 0) return null;

  return (
    <div className="absolute top-14 left-4 z-10 w-64">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 rounded-xl border border-themed-subtle bg-card/95 px-3 py-2 text-xs font-medium text-body shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      >
        <Trash2 className="h-3.5 w-3.5 text-[var(--danger)]" />
        <span>Recently Deleted</span>
        <span className="ml-auto flex items-center gap-1">
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--danger-soft)] px-1 text-[10px] font-semibold text-[var(--danger)]">
            {deletedNodes.length}
          </span>
          {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </span>
      </button>

      {/* Panel content */}
      {isOpen && (
        <div className="mt-1 max-h-72 overflow-y-auto rounded-xl border border-themed-subtle bg-card/95 shadow-themed-md backdrop-blur-md">
          <div className="p-2 space-y-1">
            {deletedNodes.map((node) => (
              <div
                key={node.id}
                draggable
                onDragStart={(e) => onDragStart(e, node)}
                className="group flex items-center gap-2 rounded-lg px-2.5 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-hover hover:shadow-sm cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="h-3 w-3 text-dim opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                {node.nodeType === "FOLDER" ? (
                  <Folder className="h-3.5 w-3.5 text-[var(--accent)] shrink-0" />
                ) : (
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: node.color || "var(--text-muted)" }}
                  />
                )}
                <span className="flex-1 truncate text-xs text-body">{node.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore(node.id);
                  }}
                  className="shrink-0 rounded p-1 text-dim opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                  aria-label={`Restore ${node.title}`}
                  title="Restore"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="border-t border-themed-subtle px-3 py-2">
            <p className="text-[10px] text-dim">Drag onto graph to restore, or click the restore icon</p>
          </div>
        </div>
      )}
    </div>
  );
}
