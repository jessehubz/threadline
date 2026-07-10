"use client";

import { useState, useEffect } from "react";
import { Plus, X, Users, UserPlus } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "@/actions/project-actions";
import { inviteMember } from "@/actions/team-actions";
import { toast } from "sonner";

export function CreateProjectButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [members, setMembers] = useState<Array<{ email: string; role: "CO_HEAD" | "MEMBER" }>>([]);
  const [teams, setTeams] = useState<Array<{ id: string; name: string; members: Array<{ id: string; email: string }> }>>([]);

  useEffect(() => {
    if (open) {
      import("@/actions/team-group-actions").then(({ getTeams }) => getTeams().then(setTeams));
    }
  }, [open]);

  function handleAddMember() {
    const email = emailInput.trim().toLowerCase();
    if (!email || !email.includes("@")) return;
    if (members.some((m) => m.email === email)) { toast.error("Already added"); return; }
    setMembers((p) => [...p, { email, role: "MEMBER" }]);
    setEmailInput("");
  }

  function handleAddTeam(teamId: string) {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;
    const newMembers = team.members.filter((tm) => !members.some((m) => m.email === tm.email)).map((tm) => ({ email: tm.email, role: "MEMBER" as const }));
    setMembers((p) => [...p, ...newMembers]);
    toast.success(`Added ${newMembers.length} from "${team.name}"`);
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await createProject(formData);
    if (result.error) { toast.error(result.error); setLoading(false); return; }

    if (members.length > 0 && result.projectId) {
      for (const m of members) await inviteMember(result.projectId, m.email, m.role);
      toast.success(`Project created with ${members.length} invite(s)`);
    } else {
      toast.success("Project created");
    }
    setLoading(false);
    setMembers([]);
    setEmailInput("");
    setOpen(false);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New Project</Button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Create Project">
        <form action={handleSubmit} className="space-y-4">
          <Input name="name" label="Project Name" placeholder="My new project" required />
          <Textarea name="description" label="Description (optional)" placeholder="What is this project about?" rows={2} />

          {/* Add Members */}
          <div>
            <label className="block text-sm font-medium text-heading mb-1.5">
              <span className="flex items-center gap-1.5"><UserPlus className="h-4 w-4 accent-color" /> Invite Members</span>
            </label>
            <div className="flex gap-2">
              <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddMember(); } }} placeholder="Email address" className="input-field flex-1" />
              <Button type="button" variant="secondary" onClick={handleAddMember}>Add</Button>
            </div>
            {teams.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {teams.map((t) => (
                  <button key={t.id} type="button" onClick={() => handleAddTeam(t.id)} className="inline-flex items-center gap-1.5 rounded-full border border-themed bg-card px-3 py-1 text-xs font-medium text-body hover:border-[var(--accent)] hover:accent-color">
                    <Users className="h-3 w-3" /> {t.name} ({t.members.length})
                  </button>
                ))}
              </div>
            )}
            {members.length > 0 && (
              <div className="mt-2 space-y-1 max-h-28 overflow-y-auto">
                {members.map((m) => (
                  <div key={m.email} className="flex items-center justify-between rounded-lg bg-page px-3 py-1.5 text-[12px] text-heading">
                    {m.email}
                    <button type="button" onClick={() => setMembers((p) => p.filter((x) => x.email !== m.email))} className="text-dim hover:text-[var(--danger)]"><X className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>Create Project</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
