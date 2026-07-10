"use client";

import { useState } from "react";
import { Users, Plus, X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { createTeam, deleteTeam, addTeamMember, removeTeamMember } from "@/actions/team-group-actions";
import { toast } from "sonner";

interface Team {
  id: string;
  name: string;
  members: Array<{ id: string; email: string }>;
}

export function TeamsGrid({ teams }: { teams: Team[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  return (
    <div>
      <div className="mb-5">
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Create Team
        </Button>
      </div>

      {teams.length === 0 ? (
        <div className="rounded-2xl border border-themed-subtle bg-card p-12 text-center">
          <Users className="h-10 w-10 text-dim mx-auto mb-3" />
          <p className="text-sm font-medium text-heading">No teams yet</p>
          <p className="text-xs text-body mt-1">Create a team to group collaborators together.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team, i) => (
            <button
              key={team.id}
              onClick={() => setSelectedTeam(team)}
              className={`group animate-entrance-${Math.min(i + 1, 6)} hover-lift rounded-2xl border border-themed-subtle bg-card p-5 text-left shadow-sm transition-all hover:border-themed hover:shadow-themed-md`}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl accent-bg">
                  <Users className="h-5 w-5 accent-color" />
                </div>
                <Badge variant="default">{team.members.length}</Badge>
              </div>
              <h3 className="mt-3 text-item-title group-hover:accent-color">{team.name}</h3>
              <div className="mt-2 flex flex-wrap gap-1">
                {team.members.slice(0, 3).map((m) => (
                  <span key={m.id} className="rounded-full bg-hover px-2 py-0.5 text-[10px] text-body">{m.email.split("@")[0]}</span>
                ))}
                {team.members.length > 3 && <span className="rounded-full bg-hover px-2 py-0.5 text-[10px] text-body">+{team.members.length - 3}</span>}
              </div>
            </button>
          ))}
        </div>
      )}

      <CreateTeamDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      {selectedTeam && <TeamDetailDialog team={selectedTeam} onClose={() => setSelectedTeam(null)} />}
    </div>
  );
}

function CreateTeamDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function handleAdd() {
    const email = emailInput.trim().toLowerCase();
    if (!email || !email.includes("@")) { toast.error("Enter a valid email"); return; }
    if (members.includes(email)) { toast.error("Already added"); return; }
    setMembers((p) => [...p, email]);
    setEmailInput("");
  }

  async function handleCreate() {
    if (!name.trim()) { toast.error("Team name required"); return; }
    if (members.length === 0) { toast.error("Add at least one member"); return; }
    setLoading(true);
    const result = await createTeam(name.trim(), members);
    if (result.error) toast.error(result.error);
    else { toast.success(`Team "${name}" created!`); setName(""); setMembers([]); onClose(); }
    setLoading(false);
  }

  return (
    <Dialog open={open} onClose={onClose} title="Create Team">
      <div className="space-y-4">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Team name" className="input-field" />
        <div className="flex gap-2">
          <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }} placeholder="Add email" className="input-field flex-1" />
          <Button variant="secondary" onClick={handleAdd}>Add</Button>
        </div>
        {members.length > 0 && (
          <div className="space-y-1.5">
            {members.map((e) => (
              <div key={e} className="flex items-center justify-between rounded-xl bg-page px-3 py-2 text-sm text-heading">
                {e}
                <button onClick={() => setMembers((p) => p.filter((x) => x !== e))} className="text-dim hover:text-[var(--danger)]"><X className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} loading={loading}>Create</Button>
        </div>
      </div>
    </Dialog>
  );
}

function TeamDetailDialog({ team, onClose }: { team: Team; onClose: () => void }) {
  const [newEmail, setNewEmail] = useState("");
  const [members, setMembers] = useState(team.members);
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!newEmail.trim()) return;
    setLoading(true);
    const result = await addTeamMember(team.id, newEmail.trim());
    if (result.error) toast.error(result.error);
    else { setMembers((p) => [...p, { id: Date.now().toString(), email: newEmail.trim() }]); setNewEmail(""); toast.success("Added!"); }
    setLoading(false);
  }

  async function handleRemove(id: string) {
    await removeTeamMember(team.id, id);
    setMembers((p) => p.filter((m) => m.id !== id));
  }

  async function handleDelete() {
    await deleteTeam(team.id);
    toast.success("Team deleted");
    onClose();
  }

  return (
    <Dialog open={true} onClose={onClose} title={team.name}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }} placeholder="Add email" className="input-field flex-1" />
          <Button onClick={handleAdd} loading={loading}><UserPlus className="h-4 w-4" /></Button>
        </div>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-xl bg-page px-3 py-2 text-sm">{m.email}<button onClick={() => handleRemove(m.id)} className="text-dim hover:text-[var(--danger)]"><X className="h-3.5 w-3.5" /></button></div>
          ))}
        </div>
        <button onClick={handleDelete} className="text-xs text-[var(--danger)] hover:text-[var(--danger-hover)]">Delete team</button>
      </div>
    </Dialog>
  );
}
