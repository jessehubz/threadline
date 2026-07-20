"use client";

import { useState, useRef, useEffect } from "react";
import { X, Calendar, Paperclip, Download, FileText, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TaskComments } from "@/components/graph/task-comments";
import { NodeHistory } from "@/components/graph/node-history";
import { cn, getStatusColor, getStatusLabel, getPriorityColor, getPriorityLabel } from "@/lib/utils";

interface TaskViewPanelProps {
  projectId: string;
  currentUserId: string;
  node: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority?: string;
    color: string | null;
    dueDate: Date | string | null;
    assignments: Array<{ user: { id: string; name: string | null; imageUrl: string | null }; isApprover: boolean }>;
    attachments: Array<{ id: string; fileName: string; fileUrl: string; fileType: string }>;
  };
  isOpen?: boolean;
  onClose: () => void;
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) return <ImageIcon className="h-3.5 w-3.5" />;
  return <FileText className="h-3.5 w-3.5" />;
}

export function TaskViewPanel({
  projectId,
  currentUserId,
  node,
  isOpen = true,
  onClose,
}: TaskViewPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to top when panel opens
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, []);

  // Slide/fade transition (same pattern as TaskDetailPanel)
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(isOpen));
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  const formattedDueDate = node.dueDate
    ? new Date(node.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const formattedDueTime = node.dueDate
    ? new Date(node.dueDate).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  return (
    <div
      ref={scrollRef}
      className={cn(
        "fixed inset-0 z-30 w-full md:relative md:inset-auto md:z-auto md:w-[400px] shrink-0 overflow-y-auto border-l border-themed-subtle bg-card",
        "transition-[transform,opacity] duration-200 ease-(--ease-out-strong)",
        visible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0 pointer-events-none"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-themed-subtle px-5 py-4">
        <h3 className="text-card-title">Task Details</h3>
        <button
          onClick={onClose}
          className="rounded-xl p-1.5 text-dim transition-colors hover:bg-hover"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-6 p-5">
        {/* Title */}
        <div>
          <h2 className="text-lg font-semibold text-heading leading-snug">
            {node.title}
          </h2>
        </div>

        {/* Description */}
        {node.description && (
          <p className="text-sm text-body leading-relaxed whitespace-pre-wrap">
            {node.description}
          </p>
        )}

        {/* Status & Priority */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={getStatusColor(node.status)}>
            {getStatusLabel(node.status)}
          </Badge>
          {node.priority && node.priority !== "NONE" && (
            <Badge className={getPriorityColor(node.priority)}>
              {getPriorityLabel(node.priority)}
            </Badge>
          )}
        </div>

        {/* Due Date */}
        {formattedDueDate && (
          <div className="flex items-center gap-2 text-sm text-dim">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {formattedDueDate}
              {formattedDueTime && ` at ${formattedDueTime}`}
            </span>
          </div>
        )}

        {/* Assignees */}
        {node.assignments.length > 0 && (
          <div className="border-t border-themed-subtle pt-5">
            <label className="text-eyebrow mb-2 block">Assigned</label>
            <div className="flex flex-wrap gap-2">
              {node.assignments.map((a) => (
                <div
                  key={a.user.id}
                  className="flex items-center gap-2 rounded-full bg-hover px-3 py-1.5"
                >
                  {a.user.imageUrl ? (
                    <img
                      src={a.user.imageUrl}
                      alt={a.user.name || "User"}
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-semibold text-[var(--on-accent)]">
                      {(a.user.name?.[0] || "?").toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-medium text-body">
                    {a.user.name || "Unnamed"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attachments */}
        {node.attachments.length > 0 && (
          <div className="border-t border-themed-subtle pt-5">
            <label className="text-eyebrow mb-2 flex items-center gap-1.5">
              <Paperclip className="h-3.5 w-3.5" />
              Attachments ({node.attachments.length})
            </label>
            <div className="space-y-1.5">
              {node.attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-lg bg-hover px-3 py-2 text-sm text-body transition-colors hover:bg-[var(--accent-soft)]"
                >
                  {getFileIcon(att.fileType)}
                  <span className="min-w-0 flex-1 truncate">{att.fileName}</span>
                  <Download className="h-3.5 w-3.5 shrink-0 text-dim" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Comments — viewers can add comments but not edit/delete others */}
        <div className="border-t border-themed-subtle pt-5">
          <TaskComments
            nodeId={node.id}
            currentUserId={currentUserId}
            isReadOnly={false}
          />
        </div>

        {/* Edit History */}
        <NodeHistory nodeId={node.id} />
      </div>
    </div>
  );
}
