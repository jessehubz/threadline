"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "@/actions/project-actions";
import { toast } from "sonner";

export function CreateProjectButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await createProject(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Project created");
      setOpen(false);
    }
    setLoading(false);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        New Project
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Create Project">
        <form action={handleSubmit} className="space-y-4">
          <Input
            name="name"
            label="Project Name"
            placeholder="My new project"
            required
          />
          <Textarea
            name="description"
            label="Description (optional)"
            placeholder="What is this project about?"
            rows={3}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Project
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
