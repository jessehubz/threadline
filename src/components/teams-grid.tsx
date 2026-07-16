"use client";

import { useState, useEffect } from "react";
import { Users, Plus, X, UserPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { createTeam, deleteTeam, addTeamMember, removeTeamMember } from "@/actions/team-group-actions";
import { getFriends } from "@/actions/friend-actions";
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
        <div className="rounded-xl border border-themed-subtle bg-card p-12 text-center">
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
              className={`group animate-entrance-${Math.min(i + 1, 6)} hover-lift rounded-xl border border-themed-subtle bg-card p-5 text-left transition-all hover:border-themed`}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl accent-bg">
                  <Users className="h-5 w-5 accent-color" />
                </div>
                <Badge variant="default">{team.members.length}</Badge>
              </div>
              <h3 className="mt-3 text-card-title group-hover:accent-color">{team.name}</h3>
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

interface FriendData {
  id: string;
  friendId: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
}

function CreateTeamDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);

  // Load friends when dialog opens
  useEffect(() => {
    if (open) {
      setFriendsLoading(true);
      getFriends()
        .then((data) => setFriends(data as FriendData[]))
        .catch(() => setFriends([]))
        .finally(() => setFriendsLoading(false));
    }
  }, [open]);

  // Filter friends by name or email (consistent with Friends tab search)
  const filteredFriends = searchQuery.length >= 1
    ? friends.filter((f) => {
        const q = searchQuery.toLowerCase();
        return (
          (f.name || "").toLowerCase().includes(q) ||
          f.email.toLowerCase().includes(q)
        );
      })
    : friends;

  function handleAddEmail() {
    const email = emailInput.trim().toLowerCase();
    if (!email || !email.includes("@")) { toast.error("Enter a valid email"); return; }
    if (members.includes(email)) { toast.error("Already added"); return; }
    setMembers((p) => [...p, email]);
    setEmailInput("");
  }

  function handleAddFriend(friend: FriendData) {
    const email = friend.email.toLowerCase();
    if (members.includes(email)) { toast.error("Already added"); return; }
    setMembers((p) => [...p, email]);
  }

  async function handleCreate() {
    if (!name.trim()) { toast.error("Team name required"); return; }
    if (members.length === 0) { toast.error("Add at least one member"); return; }
    setLoading(true);
    const result = await createTeam(name.trim(), members);
    if (result.error) toast.error(result.error);
    else { toast.success(`Team "${name}" created!`); setName(""); setMembers([]); setSearchQuery(""); onClose(); }
    setLoading(false);
  }

  return (
    <Dialog open={open} onClose={onClose} title="Create Team">
      <div className="space-y-4">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Team name" className="input-field" />

        {/* Search friends by name/email */}
        <div>
          <label className="block text-xs font-medium text-body mb-1.5">Add from friends</label>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-dim" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="input-field pl-9 text-xs"
            />
          </div>
          <div className="max-h-32 overflow-y-auto rounded-xl border border-themed-subtle">
            {friendsLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-themed border-t-[var(--accent)]" />
              </div>
            ) : filteredFriends.length === 0 ? (
              <p className="py-4 text-center text-[11px] text-dim">
                {friends.length === 0 ? "No friends yet" : "No matching friends"}
              </p>
            ) : (
              filteredFriends.map((friend) => {
                const isAdded = members.includes(friend.email.toLowerCase());
                return (
                  <button
                    key={friend.id}
                    type="button"
                    disabled={isAdded}
                    onClick={() => handleAddFriend(friend)}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full accent-bg text-[10px] font-semibold accent-color">
                      {friend.imageUrl ? (
                        <img src={friend.imageUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
                      ) : (
                        (friend.name || friend.email).charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-heading truncate">{friend.name || friend.email.split("@")[0]}</p>
                      <p className="text-[10px] text-dim truncate">{friend.email}</p>
                    </div>
                    {isAdded ? (
                      <span className="text-[10px] accent-color font-medium">Added</span>
                    ) : (
                      <Plus className="h-3.5 w-3.5 text-dim" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Manual email entry */}
        <div>
          <label className="block text-xs font-medium text-body mb-1.5">Or add by email</label>
          <div className="flex gap-2">
            <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddEmail(); } }} placeholder="colleague@company.com" className="input-field flex-1 text-xs" />
            <Button variant="secondary" onClick={handleAddEmail} size="sm">Add</Button>
          </div>
        </div>

        {/* Added members list */}
        {members.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-dim">{members.length} member{members.length > 1 ? "s" : ""}</p>
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
          <Button onClick={handleCreate} loading={loading} disabled={loading}>Create</Button>
        </div>
      </div>
    </Dialog>
  );
}

function TeamDetailDialog({ team, onClose }: { team: Team; onClose: () => void }) {
  const [newEmail, setNewEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState(team.members);
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);

  useEffect(() => {
    setFriendsLoading(true);
    getFriends()
      .then((data) => setFriends(data as FriendData[]))
      .catch(() => setFriends([]))
      .finally(() => setFriendsLoading(false));
  }, []);

  const filteredFriends = searchQuery.length >= 1
    ? friends.filter((f) => {
        const q = searchQuery.toLowerCase();
        return (
          (f.name || "").toLowerCase().includes(q) ||
          f.email.toLowerCase().includes(q)
        );
      })
    : friends;

  async function handleAddEmail() {
    if (!newEmail.trim()) return;
    setLoading(true);
    const result = await addTeamMember(team.id, newEmail.trim());
    if (result.error) toast.error(result.error);
    else { setMembers((p) => [...p, { id: Date.now().toString(), email: newEmail.trim() }]); setNewEmail(""); toast.success("Added!"); }
    setLoading(false);
  }

  async function handleAddFriend(friend: FriendData) {
    const email = friend.email.toLowerCase();
    if (members.some((m) => m.email.toLowerCase() === email)) { toast.error("Already in team"); return; }
    setLoading(true);
    const result = await addTeamMember(team.id, email);
    if (result.error) toast.error(result.error);
    else { setMembers((p) => [...p, { id: Date.now().toString(), email }]); toast.success("Added!"); }
    setLoading(false);
  }

  async function handleRemove(id: string) {
    await removeTeamMember(team.id, id);
    setMembers((p) => p.filter((m) => m.id !== id));
    toast.success("Removed");
  }

  async function handleDelete() {
    await deleteTeam(team.id);
    toast.success("Team deleted");
    onClose();
  }

  return (
    <Dialog open={true} onClose={onClose} title={team.name}>
      <div className="space-y-4">
        {/* Search friends */}
        <div>
          <label className="block text-xs font-medium text-body mb-1.5">Add from friends</label>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-dim" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="input-field pl-9 text-xs"
            />
          </div>
          {searchQuery.length >= 1 && (
            <div className="max-h-28 overflow-y-auto rounded-xl border border-themed-subtle mb-2">
              {friendsLoading ? (
                <div className="flex items-center justify-center py-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-themed border-t-[var(--accent)]" />
                </div>
              ) : filteredFriends.length === 0 ? (
                <p className="py-3 text-center text-[11px] text-dim">No matching friends</p>
              ) : (
                filteredFriends.map((friend) => {
                  const isAdded = members.some((m) => m.email.toLowerCase() === friend.email.toLowerCase());
                  return (
                    <button
                      key={friend.id}
                      type="button"
                      disabled={isAdded || loading}
                      onClick={() => handleAddFriend(friend)}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full accent-bg text-[10px] font-semibold accent-color">
                        {(friend.name || friend.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-heading truncate">{friend.name || friend.email.split("@")[0]}</p>
                        <p className="text-[10px] text-dim truncate">{friend.email}</p>
                      </div>
                      {isAdded && <span className="text-[10px] accent-color font-medium">In team</span>}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Manual email entry */}
        <div className="flex gap-2">
          <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddEmail(); } }} placeholder="Or add by email" className="input-field flex-1 text-xs" />
          <Button onClick={handleAddEmail} loading={loading} disabled={loading}><UserPlus className="h-4 w-4" /></Button>
        </div>

        {/* Current members */}
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
