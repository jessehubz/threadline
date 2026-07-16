"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, X, Users, UserPlus, Search } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "@/actions/project-actions";
import { inviteMember } from "@/actions/team-actions";
import { getFriends } from "@/actions/friend-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type InviteTab = "friends" | "teams";

interface Friend {
  id: string;
  friendId: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
}

export function CreateProjectButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Array<{ email: string; role: "CO_HEAD" | "MEMBER"; name?: string | null }>>([]);
  const [teams, setTeams] = useState<Array<{ id: string; name: string; members: Array<{ id: string; email: string }> }>>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [activeTab, setActiveTab] = useState<InviteTab>("friends");
  const [friendSearch, setFriendSearch] = useState("");
  const submittingRef = useRef(false);

  useEffect(() => {
    if (open) {
      import("@/actions/team-group-actions").then(({ getTeams }) => getTeams().then(setTeams));
      getFriends().then((f) => setFriends(f as Friend[]));
    }
  }, [open]);

  function handleAddFriend(friend: Friend) {
    if (members.some((m) => m.email === friend.email)) { toast.error("Already added"); return; }
    setMembers((p) => [...p, { email: friend.email, role: "MEMBER", name: friend.name }]);
  }

  function handleAddTeam(teamId: string) {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;
    const newMembers = team.members.filter((tm) => !members.some((m) => m.email === tm.email)).map((tm) => ({ email: tm.email, role: "MEMBER" as const }));
    setMembers((p) => [...p, ...newMembers]);
    toast.success(`Added ${newMembers.length} from "${team.name}"`);
  }

  async function handleSubmit(formData: FormData) {
    // Ref-based guard prevents double-submission even if re-render hasn't happened yet
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    const result = await createProject(formData);
    if (result.error) { toast.error(result.error); setLoading(false); submittingRef.current = false; return; }

    if (members.length > 0 && result.projectId) {
      for (const m of members) await inviteMember(result.projectId, m.email, m.role);
      toast.success(`Project created with ${members.length} invite(s)`);
    } else {
      toast.success("Project created successfully!");
    }
    setLoading(false);
    submittingRef.current = false;
    setMembers([]);
    setOpen(false);
  }

  const filteredFriends = friendSearch
    ? friends.filter((f) => (f.name || f.email).toLowerCase().includes(friendSearch.toLowerCase()))
    : friends;

  const tabs: { key: InviteTab; label: string; icon: typeof Users }[] = [
    { key: "friends", label: "Friends", icon: UserPlus },
    { key: "teams", label: "Teams", icon: Users },
  ];

  return (
    <>
      <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New Project</Button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Create Project">
        <form action={handleSubmit} className="space-y-4">
          <Input name="name" label="Project Name" placeholder="My new project" required />
          <Textarea name="description" label="Description (optional)" placeholder="What is this project about?" rows={2} />

          {/* Invite Members - Tabbed UI */}
          <div>
            <label className="block text-sm font-medium text-heading mb-2">
              <span className="flex items-center gap-1.5"><UserPlus className="h-4 w-4 accent-color" /> Invite Members</span>
            </label>

            {/* Segmented Control */}
            <div className="flex rounded-lg p-0.5 mb-3" style={{ backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border-default)' }}>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150",
                    activeTab === tab.key
                      ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  )}
                >
                  <tab.icon className="h-3 w-3" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[120px]">
              {activeTab === "friends" && (
                <div>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={friendSearch}
                      onChange={(e) => setFriendSearch(e.target.value)}
                      placeholder="Search friends..."
                      className="input-field pl-9 py-2 text-xs"
                    />
                  </div>
                  {filteredFriends.length === 0 ? (
                    <p className="text-xs text-[var(--text-muted)] py-4 text-center">
                      {friends.length === 0 ? "No friends yet. Add friends from the Friends page." : "No matching friends."}
                    </p>
                  ) : (
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {filteredFriends.map((friend) => {
                        const isAdded = members.some((m) => m.email === friend.email);
                        return (
                          <button
                            key={friend.id}
                            type="button"
                            disabled={isAdded}
                            onClick={() => handleAddFriend(friend)}
                            className={cn(
                              "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-all duration-150",
                              isAdded ? "opacity-50 cursor-not-allowed" : "hover:bg-[var(--bg-muted)] hover:scale-[1.01]"
                            )}
                          >
                            <div className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
                              {friend.name?.[0]?.toUpperCase() || friend.email[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-[var(--text-primary)] truncate">{friend.name || friend.email}</p>
                              {friend.name && <p className="text-[10px] text-[var(--text-muted)] truncate">{friend.email}</p>}
                            </div>
                            {isAdded ? (
                              <span className="text-[10px] text-[var(--accent)] font-medium">Added</span>
                            ) : (
                              <Plus className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "teams" && (
                <div>
                  {teams.length === 0 ? (
                    <p className="text-xs text-[var(--text-muted)] py-4 text-center">No teams yet. Create teams from the Team page.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {teams.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleAddTeam(t.id)}
                          className="flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-all duration-150 hover:border-[var(--accent)] hover:bg-[var(--bg-muted)] hover:scale-[1.01]"
                          style={{ borderColor: 'var(--border-default)' }}
                        >
                          <Users className="h-4 w-4 text-[var(--accent)]" />
                          <span className="flex-1 text-left text-xs font-medium text-[var(--text-primary)]">{t.name}</span>
                          <span className="text-[10px] text-[var(--text-muted)]">{t.members.length} members</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Added members list */}
            {members.length > 0 && (
              <div className="mt-3 border-t pt-3" style={{ borderColor: 'var(--border-subtle)' }}>
                <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">{members.length} invited</p>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {members.map((m) => (
                    <div key={m.email} className="flex items-center justify-between rounded-lg px-3 py-1.5 text-[11px]" style={{ backgroundColor: 'var(--bg-muted)' }}>
                      <span className="text-[var(--text-primary)] truncate">{m.name || m.email}</span>
                      <button type="button" onClick={() => setMembers((p) => p.filter((x) => x.email !== m.email))} className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
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
