"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { restoreProject, permanentlyDeleteProject } from "@/actions/project-actions";
import { toast } from "sonner";
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react";

interface DeletedProject {
  id: string;
  name: string;
  deletedAt: Date | null;
  deleteAfter: Date | null;
}

export function RecentlyDeleted({ projects }: { projects: DeletedProject[] }) {
  const [items, setItems] = useState(projects);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<DeletedProject | null>(null);

  if (items.length === 0) {
    return null;
  }

  async function handleRestore(projectId: string) {
    setLoadingId(projectId);
    try {
      const result = await restoreProject(projectId);
      if (result.success) {
        setItems((prev) => prev.filter((p) => p.id !== projectId));
        toast.success("Project restored");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to restore");
    }
    setLoadingId(null);
  }

  async function handlePermanentDelete(projectId: string) {
    setLoadingId(projectId);
    try {
      const result = await permanentlyDeleteProject(projectId);
      if (result.success) {
        setItems((prev) => prev.filter((p) => p.id !== projectId));
        toast.success("Project permanently deleted");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
    setLoadingId(null);
    setConfirmTarget(null);
  }

  function daysRemaining(deleteAfter: Date | null) {
    if (!deleteAfter) return null;
    const diff = new Date(deleteAfter).getTime() - Date.now();
    const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    return days;
  }

  return (
    <div>
      <p className="text-eyebrow mb-2.5 flex items-center gap-1.5 px-1">
        <Trash2 className="h-3 w-3" />
        Recently Deleted
      </p>
      <div className="panel-quiet p-5">
        <p className="mb-4 text-xs text-body">
          Deleted projects are permanently removed after 15 days.
        </p>
        <div className="space-y-1">
          {items.map((project, i) => {
            const days = daysRemaining(project.deleteAfter);
            return (
              <div
                key={project.id}
                className={`flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-150 hover:translate-x-0.5 hover:bg-hover animate-entrance-${Math.min(i + 1, 6)}`}
              >
                <div>
                  <p className="text-item-title">{project.name}</p>
                  {days !== null && (
                    <p className="text-meta text-[var(--danger)]">
                      {days === 0 ? "Expires today" : `Expires in ${days} day${days === 1 ? "" : "s"}`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRestore(project.id)}
                    disabled={loadingId === project.id}
                    title="Restore project"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmTarget(project)}
                    disabled={loadingId === project.id}
                    className="text-[var(--danger)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                    title="Delete permanently"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={confirmTarget !== null} onClose={() => setConfirmTarget(null)} title="Permanently delete project?">
        <div className="flex gap-3 rounded-xl bg-[var(--danger-soft)] p-3.5">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-[var(--danger)]" />
          <p className="text-[13px] text-body">
            This will permanently delete <span className="font-medium text-heading">&quot;{confirmTarget?.name}&quot;</span> and all its tasks, graphs, and attachments. This cannot be undone.
          </p>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmTarget(null)}>Cancel</Button>
          <Button
            variant="danger"
            loading={loadingId === confirmTarget?.id}
            onClick={() => confirmTarget && handlePermanentDelete(confirmTarget.id)}
          >
            Delete Permanently
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
