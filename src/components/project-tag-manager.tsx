"use client";

import { useState, useTransition } from "react";
import { Tag, Plus, X } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { TagChip } from "@/components/ui/tag-chip";
import { TagScrollContainer } from "@/components/ui/tag-scroll-container";
import { addTagToProject, removeTagFromProject, createTag } from "@/actions/tag-actions";
import { toast } from "sonner";

interface ProjectTagManagerProps {
  projectId: string;
  projectName: string;
  currentTags: Array<{ id: string; name: string; color: string; isSystem: boolean }>;
  availableTags: Array<{ id: string; name: string; color: string; isSystem: boolean }>;
}

const TAG_COLORS = [
  "#8B5CF6", // Violet
  "#6366F1", // Indigo
  "#3B82F6", // Blue
  "#06B6D4", // Cyan
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#EC4899", // Pink
  "#6B7280", // Gray
];

export function ProjectTagManager({ projectId, projectName, currentTags, availableTags }: ProjectTagManagerProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);

  const appliedIds = new Set(currentTags.map((t) => t.id));
  const unAppliedTags = availableTags.filter((t) => !appliedIds.has(t.id));

  const handleAddTag = (tagId: string) => {
    startTransition(async () => {
      const result = await addTagToProject(projectId, tagId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Tag added");
      }
    });
  };

  const handleRemoveTag = (tagId: string) => {
    startTransition(async () => {
      const result = await removeTagFromProject(projectId, tagId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Tag removed");
      }
    });
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", newTagName.trim());
      formData.set("color", newTagColor);
      const result = await createTag(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Tag "${newTagName.trim()}" created`);
        setNewTagName("");
        // Also apply it to the project immediately
        if (result.tag) {
          const addResult = await addTagToProject(projectId, result.tag.id);
          if (addResult.error) {
            toast.error(addResult.error);
          }
        }
      }
    });
  };

  return (
    <>
      {/* Trigger button - small tag icon button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "26px",
          height: "26px",
          borderRadius: "50%",
          border: "1px solid var(--border-default)",
          background: "transparent",
          color: "var(--text-muted)",
          cursor: "pointer",
          transition: "all .18s ease",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.color = "var(--accent)";
          e.currentTarget.style.background = "var(--accent-soft)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-default)";
          e.currentTarget.style.color = "var(--text-muted)";
          e.currentTarget.style.background = "transparent";
        }}
        aria-label="Manage tags"
        title="Manage tags"
      >
        <Tag style={{ width: "12px", height: "12px" }} />
      </button>

      {/* Tag management dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} title={`Tags — ${projectName}`}>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Current tags */}
          <div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Applied Tags
            </p>
            {currentTags.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No tags applied yet.</p>
            ) : (
              <TagScrollContainer>
                {currentTags.map((tag) => (
                  <TagChip
                    key={tag.id}
                    name={tag.name}
                    color={tag.color}
                    isSystem={tag.isSystem}
                    size="md"
                    onRemove={() => handleRemoveTag(tag.id)}
                  />
                ))}
              </TagScrollContainer>
            )}
          </div>

          {/* Available tags to add */}
          {unAppliedTags.length > 0 && (
            <div>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Available Tags
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {unAppliedTags.map((tag) => (
                  <TagChip
                    key={tag.id}
                    name={tag.name}
                    color={tag.color}
                    isSystem={tag.isSystem}
                    size="md"
                    onClick={() => handleAddTag(tag.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Create new tag */}
          <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: "16px" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Create New Tag
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Tag name"
                maxLength={30}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateTag();
                  }
                }}
                className="input-field"
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: "13px",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-default)",
                  background: "var(--bg-muted)",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={handleCreateTag}
                disabled={!newTagName.trim() || isPending}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "8px 14px",
                  borderRadius: "999px",
                  background: newTagName.trim() ? "var(--accent)" : "var(--bg-muted)",
                  color: newTagName.trim() ? "#fff" : "var(--text-muted)",
                  border: "none",
                  cursor: newTagName.trim() ? "pointer" : "not-allowed",
                  transition: "all .18s ease",
                  flexShrink: 0,
                  opacity: isPending ? 0.6 : 1,
                }}
              >
                <Plus style={{ width: "12px", height: "12px" }} />
                Add
              </button>
            </div>
            {/* Color picker */}
            <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
              {TAG_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewTagColor(color)}
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: color,
                    border: newTagColor === color ? "2px solid var(--text-primary)" : "2px solid transparent",
                    cursor: "pointer",
                    transition: "border-color .15s ease, transform .15s ease",
                    transform: newTagColor === color ? "scale(1.15)" : "scale(1)",
                  }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
