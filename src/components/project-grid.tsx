"use client";

import Link from "next/link";
import { MoreHorizontal, Trash2, Pencil, Users } from "lucide-react";
import { useState } from "react";
import { deleteProject, updateProject } from "@/actions/project-actions";
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
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
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
      <div className="card group relative transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between">
          <Link href={`/graph/${project.id}`} className="flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
              {project.name}
            </h3>
          </Link>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              aria-label="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                <button
                  onClick={() => { setEditOpen(true); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => { setDeleteConfirm(true); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <Link href={`/graph/${project.id}`}>
          {project.description && (
            <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
              {project.description}
            </p>
          )}

          <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {project.memberCount}
            </span>
            <Badge variant={progress === 100 ? "success" : "default"}>
              {project.completedTasks}/{project.totalTasks} tasks
            </Badge>
          </div>

          {project.totalTasks > 0 && (
            <div className="mt-3">
              <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-1.5 rounded-full bg-brand-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <p className="mt-3 text-xs text-gray-400">
            Updated {formatRelativeDate(project.updatedAt)}
          </p>
        </Link>
      </div>

      {/* Edit Dialog */}
      <EditProjectDialog open={editOpen} onClose={() => setEditOpen(false)} project={project} />

      {/* Delete Confirm */}
      <Dialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)} title="Delete Project">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to delete &quot;{project.name}&quot;? This action cannot be undone
          and will delete all tasks, graphs, and attachments.
        </p>
        <div className="mt-4 flex justify-end gap-3">
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
