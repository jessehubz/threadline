"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, RotateCcw, Clock, CheckCircle2 } from "lucide-react";
import { restoreProject, permanentlyDeleteProject, getDeletedProjects } from "@/actions/project-actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface DeletedProject {
  id: string;
  name: string;
  deletedAt: Date | null;
  deleteAfter: Date | null;
}

export function TrashPageClient({ initialProjects }: { initialProjects: DeletedProject[] }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  // `Date.now()` is impure and must not be called during render (it would
  // also differ between server and client, causing a hydration mismatch).
  // Capture it once on mount instead.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    function init() {
      setNow(Date.now());
    }
    init();
  }, []);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", confirmLabel: "", onConfirm: () => {} });

  // Rows fade+scale out before being removed from `projects`, so a
  // destructive/committing action on this page (the whole point of which is
  // deliberate review) gets motion feedback instead of teleporting away.
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const ROW_EXIT_MS = 160;

  const handleRestore = async (projectId: string) => {
    await restoreProject(projectId);
    setRemovingIds((prev) => new Set(prev).add(projectId));
    setTimeout(async () => {
      const updated = await getDeletedProjects();
      setProjects(updated);
      router.refresh();
    }, ROW_EXIT_MS);
  };

  const handlePermanentlyDelete = (projectId: string, projectName: string) => {
    setConfirmDialog({
      open: true,
      title: "Permanently delete?",
      description: `"${projectName}" and all its data will be permanently removed. This action cannot be undone.`,
      confirmLabel: "Delete Forever",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        await permanentlyDeleteProject(projectId);
        setRemovingIds((prev) => new Set(prev).add(projectId));
        setTimeout(async () => {
          const updated = await getDeletedProjects();
          setProjects(updated);
          router.refresh();
        }, ROW_EXIT_MS);
      },
    });
  };

  const daysUntilPurge = (deleteAfter: Date | null) => {
    if (!deleteAfter || now === null) return null;
    const diff = new Date(deleteAfter).getTime() - now;
    const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    return days;
  };

  return (
    <>
      {/* Page header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(239,68,68,0.08)",
            }}
          >
            <Trash2 style={{ width: "20px", height: "20px", color: "var(--error, #ef4444)" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Trash
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              Deleted projects are kept for 15 days before permanent removal
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {projects.length === 0 ? (
        <div
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-sm)",
            padding: "60px 28px",
            textAlign: "center",
          }}
        >
          <CheckCircle2 style={{ width: "40px", height: "40px", margin: "0 auto 16px", color: "var(--text-muted)", opacity: 0.4 }} />
          <p style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>
            Trash is empty
          </p>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Deleted projects will appear here for 15 days before being permanently removed.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-sm)",
            overflow: "hidden",
          }}
        >
          {/* List header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 140px 200px",
              gap: "12px",
              padding: "14px 24px",
              borderBottom: "1px solid var(--border-default)",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            <span>Project</span>
            <span>Deleted</span>
            <span style={{ textAlign: "right" }}>Actions</span>
          </div>

          {/* List items */}
          {projects.map((project) => {
            const days = daysUntilPurge(project.deleteAfter);
            const isRemoving = removingIds.has(project.id);
            return (
              <div
                key={project.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 140px 200px",
                  gap: "12px",
                  alignItems: "center",
                  padding: "16px 24px",
                  borderBottom: "1px solid var(--border-subtle, var(--border-default))",
                  transition: "background .15s ease, opacity .15s var(--ease-out-strong), transform .15s var(--ease-out-strong)",
                  opacity: isRemoving ? 0 : 1,
                  transform: isRemoving ? "scale(0.98)" : "scale(1)",
                  pointerEvents: isRemoving ? "none" : undefined,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-muted)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                {/* Project name + auto-delete countdown */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {project.name}
                  </div>
                  {days !== null && (
                    <div style={{ fontSize: "11px", color: days <= 3 ? "var(--error, #ef4444)" : "var(--text-muted)", marginTop: "3px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock style={{ width: "10px", height: "10px" }} />
                      {days === 0 ? "Purging today" : `Auto-deletes in ${days} day${days !== 1 ? "s" : ""}`}
                    </div>
                  )}
                </div>

                {/* Deleted date */}
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {project.deletedAt
                    ? new Date(project.deletedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "-"
                  }
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => handleRestore(project.id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "7px 14px",
                      fontSize: "12px",
                      fontWeight: 600,
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-default)",
                      background: "var(--bg-elevated)",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      transition: "all .15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent)";
                      e.currentTarget.style.color = "var(--accent)";
                      e.currentTarget.style.background = "var(--accent-soft)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-default)";
                      e.currentTarget.style.color = "var(--text-secondary)";
                      e.currentTarget.style.background = "var(--bg-elevated)";
                    }}
                  >
                    <RotateCcw style={{ width: "12px", height: "12px" }} />
                    Restore
                  </button>
                  <button
                    onClick={() => handlePermanentlyDelete(project.id, project.name)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "7px 14px",
                      fontSize: "12px",
                      fontWeight: 600,
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-default)",
                      background: "var(--bg-elevated)",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      transition: "all .15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--error, #ef4444)";
                      e.currentTarget.style.color = "var(--error, #ef4444)";
                      e.currentTarget.style.background = "rgba(239,68,68,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-default)";
                      e.currentTarget.style.color = "var(--text-secondary)";
                      e.currentTarget.style.background = "var(--bg-elevated)";
                    }}
                  >
                    <Trash2 style={{ width: "12px", height: "12px" }} />
                    Delete Forever
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ CONFIRM DIALOG ═══ */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        destructive
        onConfirm={confirmDialog.onConfirm}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
      />
    </>
  );
}
