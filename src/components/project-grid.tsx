"use client";

import Link from "next/link";
import { MoreHorizontal, Trash2, Pencil, Users, UserPlus, Search, Tag, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { deleteProject, updateProject } from "@/actions/project-actions";
import { inviteMember } from "@/actions/team-actions";
import { addLabel, removeLabel } from "@/actions/label-actions";
import { LABEL_COLORS } from "@/lib/constants";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatRelativeDate } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  totalTasks: number;
  completedTasks: number;
  needsAttention?: boolean;
  createdAt: Date;
  updatedAt: Date;
  role: string;
  labels: Array<{ id: string; name: string; color: string }>;
}

export function ProjectGrid({ projects }: { projects: Project[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const allLabels = Array.from(new Map(projects.flatMap((p) => p.labels).map((l) => [l.name, l])).values());

  const filtered = projects.filter((p) => {
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLabel = !activeLabel || p.labels.some((l) => l.name === activeLabel);
    return matchSearch && matchLabel;
  });

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search projects..." className="input-field pl-9" />
        </div>
        {allLabels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setActiveLabel(null)} className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${!activeLabel ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-body hover:text-heading hover:bg-[var(--bg-muted)]"}`}>All</button>
            {allLabels.map((l) => (
              <button key={l.name} onClick={() => setActiveLabel(activeLabel === l.name ? null : l.name)} className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${activeLabel === l.name ? "text-white" : "text-body hover:text-heading hover:bg-[var(--bg-muted)]"}`} style={activeLabel === l.name ? { backgroundColor: l.color } : undefined}>{l.name}</button>
            ))}
          </div>
        )}
      </div>
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-body">No projects found</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project, i) => (
            <div key={project.id} className={`animate-entrance-${Math.min(i + 1, 6)}`}>
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function ProjectCard({ project }: { project: Project }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [labelOpen, setLabelOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [labels, setLabels] = useState(project.labels || []);
  const [hoverPreview, setHoverPreview] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const progress =
    project.totalTasks > 0
      ? Math.round((project.completedTasks / project.totalTasks) * 100)
      : 0;

  function handleMouseEnter() {
    hoverTimeoutRef.current = setTimeout(() => setHoverPreview(true), 400);
  }

  function handleMouseLeave() {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoverPreview(false);
  }

  async function handleDelete() {
    setLoading(true);
    const result = await deleteProject(project.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Project deleted");
    }
    setLoading(false);
    setDeleteConfirm(false);
  }

  return (
    <>
      <div className="group relative p-5 transition-all duration-200 ease-out hover:-translate-y-1" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elevated)', boxShadow: 'var(--shadow-sm)' }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; handleMouseEnter(); }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; handleMouseLeave(); }}>
        {/* Hover Preview Popup */}
        {hoverPreview && (
          <div
            className="pointer-events-none absolute -top-2 left-1/2 z-30 w-64 -translate-x-1/2 -translate-y-full animate-[fadeInUp_0.2s_ease-out_both] p-4"
            style={{
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-default)",
              backgroundColor: "var(--bg-elevated)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-1.5">{project.name}</p>
            {project.description && (
              <p className="text-[12px] text-[var(--text-secondary)] line-clamp-2 mb-2">{project.description}</p>
            )}
            <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
              <span>{project.completedTasks}/{project.totalTasks} tasks done</span>
              <span>·</span>
              <span>{project.memberCount} member{project.memberCount !== 1 ? "s" : ""}</span>
            </div>
            {project.totalTasks > 0 && (
              <div className="mt-2 h-1.5 w-full rounded-full" style={{ background: "var(--border-default)" }}>
                <div className="h-1.5 rounded-full bg-[var(--accent)]" style={{ width: `${progress}%` }} />
              </div>
            )}
            {/* Arrow */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rotate-45" style={{ backgroundColor: "var(--bg-elevated)", borderRight: "1px solid var(--border-default)", borderBottom: "1px solid var(--border-default)" }} />
          </div>
        )}
        <div className="flex items-start justify-between">
          <Link href={`/graph/${project.id}`} className="flex flex-1 items-center gap-2.5 min-w-0">
            <span
              className="h-2 w-2 flex-shrink-0 rounded-full"
              style={{ backgroundColor: project.needsAttention ? "var(--danger)" : "var(--accent)" }}
              title={project.needsAttention ? "Needs attention" : "On track"}
            />
            <h3 className="truncate text-card-title transition-colors group-hover:accent-color">
              {project.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1">
            {/* Invite collaborator button */}
            <button
              onClick={() => setInviteOpen(true)}
              className="rounded-lg p-1.5 text-dim opacity-0 transition-all hover:bg-hover hover:text-body group-hover:opacity-100"
              aria-label="Invite collaborators"
            >
              <UserPlus className="h-4 w-4" />
            </button>
            {/* More options menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-lg p-1.5 text-dim opacity-0 transition-all hover:bg-hover hover:text-body group-hover:opacity-100"
                aria-label="More options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-1 w-40 py-1.5 shadow-xl" style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elevated)' }}>
                    <button onClick={() => { setEditOpen(true); setMenuOpen(false); }} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-heading transition-colors hover:bg-hover">
                      <Pencil className="h-3.5 w-3.5 text-dim" /> Edit
                    </button>
                    <button onClick={() => { setInviteOpen(true); setMenuOpen(false); }} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-heading transition-colors hover:bg-hover">
                      <UserPlus className="h-3.5 w-3.5 text-dim" /> Invite People
                    </button>
                    <button onClick={() => { setLabelOpen(true); setMenuOpen(false); }} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-heading transition-colors hover:bg-hover">
                      <Tag className="h-3.5 w-3.5 text-dim" /> Add Label
                    </button>
                    <div className="my-1 border-t border-themed-subtle" />
                    <button onClick={() => { setDeleteConfirm(true); setMenuOpen(false); }} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-[var(--danger)] transition-colors hover:bg-[var(--danger-soft)]">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <Link href={`/graph/${project.id}`}>
          {project.description && (
            <p className="mt-0.5 line-clamp-1 text-[12px] text-dim">
              {project.description}
            </p>
          )}

          {labels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {labels.map((l) => (
                <span key={l.id} className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white" style={{ backgroundColor: l.color }}>{l.name}</span>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-3 text-[11px] text-dim">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {project.memberCount}
            </span>
            <span>{project.completedTasks}/{project.totalTasks} tasks</span>
          </div>

          {project.totalTasks > 0 && (
            <div className="mt-2.5">
              <div className="h-1 w-full rounded-full accent-bg">
                <div
                  className="h-1 rounded-full bg-[var(--accent)] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <p className="mt-3 text-[11px] text-dim">
            Updated {formatRelativeDate(project.updatedAt)}
          </p>
        </Link>
      </div>

      {/* Edit Dialog */}
      <EditProjectDialog open={editOpen} onClose={() => setEditOpen(false)} project={project} />

      {/* Invite Dialog */}
      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} projectId={project.id} />

      {/* Label Dialog */}
      {labelOpen && <LabelDialog open={labelOpen} onClose={() => setLabelOpen(false)} projectId={project.id} labels={labels} onLabelsChange={setLabels} />}

      {/* Delete Confirm */}
      <Dialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)} title="Delete Project">
        <p className="text-sm text-body">
          Are you sure you want to delete &quot;{project.name}&quot;? This action cannot be undone
          and will delete all tasks, graphs, and attachments.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={loading}>
            Delete Project
          </Button>
        </div>
      </Dialog>
    </>
  );
}

function EditProjectDialog({
  open,
  onClose,
  project,
}: {
  open: boolean;
  onClose: () => void;
  project: Project;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.set("id", project.id);
    const result = await updateProject(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Project updated");
      onClose();
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onClose={onClose} title="Edit Project">
      <form action={handleSubmit} className="space-y-4">
        <Input
          name="name"
          label="Project Name"
          defaultValue={project.name}
          required
        />
        <Textarea
          name="description"
          label="Description"
          defaultValue={project.description || ""}
          rows={3}
        />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function LabelDialog({ open, onClose, projectId, labels, onLabelsChange }: { open: boolean; onClose: () => void; projectId: string; labels: Array<{ id: string; name: string; color: string }>; onLabelsChange: (l: Array<{ id: string; name: string; color: string }>) => void }) {
  const [newLabel, setNewLabel] = useState("");
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0]);
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!newLabel.trim()) return;
    setLoading(true);
    const result = await addLabel(projectId, newLabel.trim(), selectedColor);
    if (result.error) toast.error(result.error);
    else if (result.label) { onLabelsChange([...labels, result.label]); setNewLabel(""); toast.success("Label added!"); }
    setLoading(false);
  }

  async function handleRemove(labelId: string) {
    await removeLabel(projectId, labelId);
    onLabelsChange(labels.filter((l) => l.id !== labelId));
  }

  return (
    <Dialog open={open} onClose={onClose} title="Labels">
      <div className="space-y-4">
        {labels.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {labels.map((l) => (
              <span key={l.id} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: l.color }}>
                {l.name}
                <button onClick={() => handleRemove(l.id)} className="hover:opacity-70"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }} placeholder="Label name" className="input-field flex-1" />
          <Button onClick={handleAdd} loading={loading}>Add</Button>
        </div>
        <div className="flex gap-2">
          {LABEL_COLORS.map((c) => (
            <button key={c} onClick={() => setSelectedColor(c)} className={`h-6 w-6 rounded-full transition-all ${selectedColor === c ? "ring-2 ring-offset-2 ring-[var(--accent)] scale-110" : "hover:scale-110"}`} style={{ backgroundColor: c }} />
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["Urgent", "In Progress", "Review", "Design", "Backend"].map((p) => (
            <button key={p} onClick={() => setNewLabel(p)} className="rounded-full border border-themed-subtle px-2.5 py-1 text-[11px] text-body hover:border-[var(--accent)] hover:accent-color">{p}</button>
          ))}
        </div>
      </div>
    </Dialog>
  );
}

function InviteDialog({ open, onClose, projectId }: { open: boolean; onClose: () => void; projectId: string }) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"CO_HEAD" | "MEMBER">("MEMBER");
  const [loading, setLoading] = useState(false);
  const [invited, setInvited] = useState<Array<{ name: string; email: string }>>([]);
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string | null; email: string; imageUrl: string | null }>>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) { setSearchResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { searchAllUsers } = await import("@/actions/search-actions");
        const results = await searchAllUsers(trimmed);
        setSearchResults(results);
      } catch { setSearchResults([]); }
      setSearching(false);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  async function handleInvite(email: string, name: string | null) {
    setLoading(true);
    const result = await inviteMember(projectId, email, role);
    if (result.error) toast.error(result.error);
    else {
      setInvited((p) => [...p, { name: name || email, email }]);
      toast.success("Member added!");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onClose={onClose} title="Add Members">
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dim" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search people by name..." className="input-field pl-9" />
          </div>
          <select value={role} onChange={(e) => setRole(e.target.value as "CO_HEAD" | "MEMBER")} className="input-field w-auto text-xs">
            <option value="MEMBER">Member</option>
            <option value="CO_HEAD">Co-Head</option>
          </select>
        </div>
        {searching && <p className="text-xs text-dim text-center py-2">Searching...</p>}
        {searchResults.length > 0 && (
          <div className="space-y-1">
            {searchResults.map((person) => {
              const isInvited = invited.some((i) => i.email === person.email);
              return (
                <div key={person.id} className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-hover transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
                      {person.imageUrl ? <img src={person.imageUrl} alt="" className="h-7 w-7 rounded-full object-cover" /> : (person.name?.[0]?.toUpperCase() || person.email[0].toUpperCase())}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-heading">{person.name || person.email}</p>
                      {person.name && <p className="text-[10px] text-dim">{person.email}</p>}
                    </div>
                  </div>
                  {isInvited ? (
                    <span className="text-[10px] font-medium text-[var(--accent)]">Added</span>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => handleInvite(person.email, person.name)} loading={loading}>Add</Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {query.length >= 2 && !searching && searchResults.length === 0 && (
          <p className="text-xs text-dim text-center py-3">No users found</p>
        )}
        {invited.length > 0 && (
          <div className="space-y-1.5 border-t border-themed-subtle pt-3">
            <p className="text-xs font-medium text-body">Added:</p>
            {invited.map((inv) => (
              <div key={inv.email} className="rounded-lg bg-[var(--accent-soft)] px-3 py-2 text-xs text-[var(--accent)]">
                {inv.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
