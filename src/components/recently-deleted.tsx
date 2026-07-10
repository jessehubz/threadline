"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { restoreProject, permanentlyDeleteProject } from "@/actions/project-actions";
import { toast } from "sonner";
import { Trash2, RotateCcw } from "lucide-react";

interface DeletedProject {
  id: string;
  name: string;
  deletedAt: Date | null;
  deleteAfter: Date | null;
}

export function RecentlyDeleted({ projects }: { projects: DeletedProject[] }) {
  const [items, setItems] = useState(projects);
  const [loadingId, setLoadingId] = useState<string | null>(null);

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
    if (!confirm("This will permanently delete the project and all its data. This cannot be undone.")) {
      return;
    }
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
  }

  function daysRemaining(deleteAfter: Date | null) {
    if (!deleteAfter) return null;
    const diff = new Date(deleteAfter).getTime() - Date.now();
    const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    return days;
  }

  return (
    <div className="rounded-2xl border border-themed-subtle bg-card p-6 shadow-themed">
      <h3 className="mb-4 text-sm font-semibold text-heading flex items-center gap-2">
        <Trash2 className="h-4 w-4" />
        Recently Deleted
      </h3>
      <p className="mb-4 text-xs text-body">
        Deleted projects are permanently removed after 15 days.
      </p>
      <div className="space-y-3">
        {items.map((project) => {
          const days = daysRemaining(project.deleteAfter);
          return (
            <div
              key={project.id}
              className="flex items-center justify-between rounded-xl border border-themed px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-heading">{project.name}</p>
                {days !== null && (
                  <p className="text-xs text-body">
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
                  onClick={() => handlePermanentDelete(project.id)}
                  disabled={loadingId === project.id}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
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
  );
}
