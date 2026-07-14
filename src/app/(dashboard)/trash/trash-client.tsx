"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, RotateCcw, Clock, CheckCircle2, X } from "lucide-react";
import { restoreProject, permanentlyDeleteProject, getDeletedProjects } from "@/actions/project-actions";

interface DeletedProject {
  id: string;
  name: string;
  deletedAt: Date | null;
  deleteAfter: Date | null;
}

export function TrashPageClient({ initialProjects }: { initialProjects: DeletedProject[] }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", confirmLabel: "", onConfirm: () => {} });

  const handleRestore = async (projectId: string) => {
    await restoreProject(projectId);
    const updated = await getDeletedProjects();
    setProjects(updated);
    router.refresh();
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
        const updated = await getDeletedProjects();
        setProjects(updated);
        router.refresh();
      },
    });
  };

  const daysUntilPurge = (deleteAfter: Date | null) => {
    if (!deleteAfter) return null;
    const diff = new Date(deleteAfter).getTime() - Date.now();
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
                  transition: "background .15s ease",
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
      {confirmDialog.open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        >
          <div
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-lg, 0 25px 50px rgba(0,0,0,0.25))",
              padding: "28px",
              width: "100%",
              maxWidth: "380px",
              margin: "0 16px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(239,68,68,0.08)",
                marginBottom: "16px",
              }}
            >
              <Trash2 style={{ width: "20px", height: "20px", color: "var(--error, #ef4444)" }} />
            </div>

            {/* Title */}
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px", letterSpacing: "-0.01em" }}>
              {confirmDialog.title}
            </h3>

            {/* Description */}
            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "24px" }}>
              {confirmDialog.description}
            </p>

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
                style={{
                  padding: "9px 18px",
                  fontSize: "13px",
                  fontWeight: 600,
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-default)",
                  background: "var(--bg-elevated)",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  transition: "all .15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--text-muted)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-default)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                style={{
                  padding: "9px 18px",
                  fontSize: "13px",
                  fontWeight: 600,
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: "var(--error, #ef4444)",
                  color: "#fff",
                  cursor: "pointer",
                  transition: "all .15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.85";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
