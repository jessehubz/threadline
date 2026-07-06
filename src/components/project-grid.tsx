"use client";

import Link from "next/link";
import { MoreHorizontal, Trash2, Pencil, Users, UserPlus, Search } from "lucide-react";
import { useState } from "react";
import { deleteProject, updateProject } from "@/actions/project-actions";
import { inviteMember } from "@/actions/team-actions";
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
}

export function ProjectGrid({ projects }: { projects: Project[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = searchQuery
    ? projects.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : projects;

  return (
    <div>
      {/* Search bar */}
      <div className="mb-5">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-xl border border-surface-200/80 bg-white py-2 pl-9 pr-4 text-sm text-[#1A1A1A] placeholder-surface-400 shadow-sm transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      {filtered.length === 0 && searchQuery ? (
        <p className="py-8 text-center text-sm text-[#6B7280]">No projects matching &quot;{searchQuery}&quot;</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
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
  const [loading, setLoading] = useState(false);

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
      <div className="group relative rounded-2xl border border-surface-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-surface-300 hover:shadow-md">
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
                    <button
                      onClick={() => { setEditOpen(true); setMenuOpen(false); }}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-[#1A1A1A] transition-colors hover:bg-surface-50"
                    >
                      <Pencil className="h-3.5 w-3.5 text-surface-400" /> Edit
                    </button>
                    <button
                      onClick={() => { setInviteOpen(true); setMenuOpen(false); }}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-[#1A1A1A] transition-colors hover:bg-surface-50"
                    >
                      <UserPlus className="h-3.5 w-3.5 text-surface-400" /> Invite People
                    </button>
                    <div className="my-1 border-t border-surface-100" />
                    <button
                      onClick={() => { setDeleteConfirm(true); setMenuOpen(false); }}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
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
            <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[#6B7280]">
              {project.description}
            </p>
          )}

          <div className="mt-5 flex items-center gap-3 text-xs text-[#6B7280]">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> {project.memberCount}
            </span>
            <Badge variant={progress === 100 ? "success" : "default"}>
              {project.completedTasks}/{project.totalTasks} tasks
            </Badge>
          </div>

          {project.totalTasks > 0 && (
            <div className="mt-4">
              <div className="h-1.5 w-full rounded-full bg-surface-100">
                <div
                  className="h-1.5 rounded-full bg-brand-500 transition-all duration-500"
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

function InviteDialog({ open, onClose, projectId }: { open: boolean; onClose: () => void; projectId: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [invited, setInvited] = useState<string[]>([]);

  async function handleInvite() {
    if (!email.trim()) return;
    setLoading(true);
    const result = await inviteMember(projectId, email.trim(), "EDITOR");
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Invitation sent to ${email}`);
      setInvited((prev) => [...prev, email.trim()]);
      setEmail("");
    }
    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleInvite();
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Invite Collaborators">
      <div className="space-y-4">
        <p className="text-sm text-[#6B7280]">
          Add team members by email. They&apos;ll get an invitation to join this project.
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="colleague@company.com"
            className="flex-1 rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-[#1A1A1A] placeholder-surface-400 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <Button onClick={handleInvite} loading={loading} size="md">
            Invite
          </Button>
        </div>
        {invited.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-[#6B7280]">Invited:</p>
            {invited.map((e) => (
              <div key={e} className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
                <UserPlus className="h-3 w-3" /> {e}
              </div>
            ))}
          </div>
        )}
      </div>
    </Dialog>
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
