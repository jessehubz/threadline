"use client";

import Link from "next/link";
import { MoreHorizontal, Trash2, Pencil, Users, UserPlus, Search, Tag, X } from "lucide-react";
import { useState, useEffect } from "react";
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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search projects..." className="w-full rounded-xl border border-surface-200/60 bg-white py-2.5 pl-9 pr-4 text-sm text-[#1A1A1A] placeholder-surface-400 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
        </div>
        {allLabels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setActiveLabel(null)} className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${!activeLabel ? "bg-[#1A1A1A] text-white" : "bg-surface-100 text-[#6B7280] hover:bg-surface-200"}`}>All</button>
            {allLabels.map((l) => (
              <button key={l.name} onClick={() => setActiveLabel(activeLabel === l.name ? null : l.name)} className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${activeLabel === l.name ? "text-white" : "bg-surface-100 text-[#6B7280] hover:bg-surface-200"}`} style={activeLabel === l.name ? { backgroundColor: l.color } : undefined}>{l.name}</button>
            ))}
          </div>
        )}
      </div>
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#6B7280]">No projects found</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (<ProjectCard key={project.id} project={project} />))}
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

  const progress =
    project.totalTasks > 0
      ? Math.round((project.completedTasks / project.totalTasks) * 100)
      : 0;

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
      <div className="group relative rounded-2xl border border-surface-200/60 bg-white p-5 shadow-sm transition-all duration-200 ease-out hover:border-surface-300 hover:shadow-md hover:-translate-y-[1px]">
        <div className="flex items-start justify-between">
          <Link href={`/graph/${project.id}`} className="flex-1">
            <h3 className="text-[15px] font-semibold text-[#1A1A1A] transition-colors group-hover:text-brand-600">
              {project.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1">
            {/* Invite collaborator button */}
            <button
              onClick={() => setInviteOpen(true)}
              className="rounded-lg p-1.5 text-surface-300 opacity-0 transition-all hover:bg-surface-100 hover:text-surface-600 group-hover:opacity-100"
              aria-label="Invite collaborators"
            >
              <UserPlus className="h-4 w-4" />
            </button>
            {/* More options menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-lg p-1.5 text-surface-300 opacity-0 transition-all hover:bg-surface-100 hover:text-surface-600 group-hover:opacity-100"
                aria-label="More options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-xl border border-surface-200 bg-white py-1.5 shadow-xl">
                    <button onClick={() => { setEditOpen(true); setMenuOpen(false); }} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-[#1A1A1A] transition-colors hover:bg-surface-50">
                      <Pencil className="h-3.5 w-3.5 text-surface-400" /> Edit
                    </button>
                    <button onClick={() => { setInviteOpen(true); setMenuOpen(false); }} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-[#1A1A1A] transition-colors hover:bg-surface-50">
                      <UserPlus className="h-3.5 w-3.5 text-surface-400" /> Invite People
                    </button>
                    <button onClick={() => { setLabelOpen(true); setMenuOpen(false); }} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-[#1A1A1A] transition-colors hover:bg-surface-50">
                      <Tag className="h-3.5 w-3.5 text-surface-400" /> Add Label
                    </button>
                    <div className="my-1 border-t border-surface-100" />
                    <button onClick={() => { setDeleteConfirm(true); setMenuOpen(false); }} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50">
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
            <p className="mt-0.5 line-clamp-1 text-[12px] text-[#9CA3AF]">
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

          <div className="mt-3 flex items-center gap-3 text-[11px] text-[#9CA3AF]">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {project.memberCount}
            </span>
            <span>{project.completedTasks}/{project.totalTasks} tasks</span>
          </div>

          {project.totalTasks > 0 && (
            <div className="mt-2.5">
              <div className="h-1 w-full rounded-full bg-brand-100">
                <div
                  className="h-1 rounded-full bg-brand-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <p className="mt-3 text-[11px] text-surface-400">
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
        <p className="text-sm text-[#6B7280]">
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
            <button key={c} onClick={() => setSelectedColor(c)} className={`h-6 w-6 rounded-full transition-all ${selectedColor === c ? "ring-2 ring-offset-2 ring-brand-500 scale-110" : "hover:scale-110"}`} style={{ backgroundColor: c }} />
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["Urgent", "In Progress", "Review", "Design", "Backend"].map((p) => (
            <button key={p} onClick={() => setNewLabel(p)} className="rounded-full border border-surface-200 px-2.5 py-1 text-[11px] text-[#6B7280] hover:border-brand-300 hover:text-brand-600">{p}</button>
          ))}
        </div>
      </div>
    </Dialog>
  );
}

function InviteDialog({ open, onClose, projectId }: { open: boolean; onClose: () => void; projectId: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"CO_HEAD" | "MEMBER">("MEMBER");
  const [loading, setLoading] = useState(false);
  const [invited, setInvited] = useState<Array<{ email: string; link?: string }>>([]);
  const [teams, setTeams] = useState<Array<{ id: string; name: string; members: Array<{ id: string; email: string }> }>>([]);

  useEffect(() => {
    if (open) { import("@/actions/team-group-actions").then(({ getTeams }) => getTeams().then(setTeams)); }
  }, [open]);

  async function handleInvite() {
    if (!email.trim()) return;
    setLoading(true);
    const result = await inviteMember(projectId, email.trim(), role);
    if (result.error) toast.error(result.error);
    else {
      const link = "inviteLink" in result ? (result as { inviteLink?: string }).inviteLink : undefined;
      setInvited((p) => [...p, { email: email.trim(), link }]);
      setEmail("");
      toast.success("Invite created!");
    }
    setLoading(false);
  }

  async function handleInviteTeam(teamId: string) {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;
    setLoading(true);
    for (const m of team.members) {
      const result = await inviteMember(projectId, m.email, role);
      if (!result.error) {
        const link = "inviteLink" in result ? (result as { inviteLink?: string }).inviteLink : undefined;
        setInvited((p) => [...p, { email: m.email, link }]);
      }
    }
    toast.success(`Invited ${team.members.length} from "${team.name}"`);
    setLoading(false);
  }

  return (
    <Dialog open={open} onClose={onClose} title="Invite Collaborators">
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        <div className="flex gap-2">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleInvite(); } }} placeholder="Email address" className="input-field flex-1" />
          <select value={role} onChange={(e) => setRole(e.target.value as "CO_HEAD" | "MEMBER")} className="input-field w-auto">
            <option value="MEMBER">Member</option>
            <option value="CO_HEAD">Co-Head</option>
          </select>
          <Button onClick={handleInvite} loading={loading}>Invite</Button>
        </div>
        {teams.length > 0 && (
          <div>
            <p className="text-xs font-medium text-[#6B7280] mb-2">Or invite a team</p>
            <div className="space-y-2">
              {teams.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-xl border border-surface-200 bg-white px-3 py-2">
                  <div><p className="text-sm font-medium text-[#1A1A1A]">{t.name}</p><p className="text-[11px] text-[#6B7280]">{t.members.length} members</p></div>
                  <Button size="sm" variant="secondary" onClick={() => handleInviteTeam(t.id)}>Invite All</Button>
                </div>
              ))}
            </div>
          </div>
        )}
        {invited.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-[#6B7280]">Invited:</p>
            {invited.map((inv) => (
              <div key={inv.email} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                {inv.email}
                {inv.link && <input readOnly value={inv.link} className="mt-1 w-full rounded border border-emerald-200 bg-white px-2 py-1 text-[11px] text-[#6B7280]" onClick={(e) => { (e.target as HTMLInputElement).select(); navigator.clipboard.writeText(inv.link!); toast.success("Copied!"); }} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
