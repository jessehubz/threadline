"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { inviteMember, removeMember, updateMemberRole } from "@/actions/team-actions";
import { getFriends } from "@/actions/friend-actions";
import { toast } from "sonner";
import { UserPlus, Trash2, Shield, Search } from "lucide-react";

interface Project {
  id: string;
  name: string;
  members: Array<{
    id: string;
    userId: string;
    role: string;
    user: { id: string; name: string | null; email: string; imageUrl: string | null };
  }>;
}

export function TeamManager({ projects, currentUserId }: { projects: Project[]; currentUserId: string }) {
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || "");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<Array<{ friendId: string; name: string | null; email: string; imageUrl: string | null }>>([]);
  const [friendSearch, setFriendSearch] = useState("");
  const [friendsLoading, setFriendsLoading] = useState(false);

  const project = projects.find((p) => p.id === selectedProject);

  // Load friends when invite dialog opens
  useEffect(() => {
    if (inviteOpen) {
      setFriendsLoading(true);
      getFriends()
        .then((data) => setFriends(data.map((f) => ({ friendId: f.friendId, name: f.name, email: f.email, imageUrl: f.imageUrl }))))
        .catch(() => setFriends([]))
        .finally(() => setFriendsLoading(false));
    }
  }, [inviteOpen]);

  // Filter friends by name or email (consistent with Friends tab search)
  const filteredFriends = friendSearch
    ? friends.filter((f) => {
        const q = friendSearch.toLowerCase();
        return (
          (f.name || "").toLowerCase().includes(q) ||
          f.email.toLowerCase().includes(q)
        );
      })
    : friends;

  async function handleInvite() {
    if (!inviteEmail || !selectedProject) return;
    setLoading(true);
    const result = await inviteMember(selectedProject, inviteEmail, "CO_HEAD");
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Invitation sent");
      setInviteOpen(false);
      setInviteEmail("");
      setFriendSearch("");
    }
    setLoading(false);
  }

  async function handleInviteFriend(email: string) {
    if (!selectedProject) return;
    setLoading(true);
    const result = await inviteMember(selectedProject, email, "CO_HEAD");
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Invitation sent");
      setInviteOpen(false);
      setFriendSearch("");
    }
    setLoading(false);
  }

  async function handleRemove(memberId: string) {
    const result = await removeMember(selectedProject, memberId);
    if (result.error) toast.error(result.error);
    else toast.success("Member removed");
  }

  async function handleRoleChange(memberId: string, newRole: string) {
    const result = await updateMemberRole(selectedProject, memberId, newRole);
    if (result.error) toast.error(result.error);
    else toast.success("Role updated");
  }

  const roleVariant = (role: string) => {
    switch (role) {
      case "HEAD": return "info" as const;
      case "CO_HEAD": return "success" as const;
      default: return "default" as const;
    }
  };

  return (
    <div className="space-y-6">
      {/* Project selector */}
      <div className="flex items-center gap-4">
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="input-field max-w-xs"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <Button onClick={() => setInviteOpen(true)} size="sm">
          <UserPlus className="h-4 w-4" /> Invite
        </Button>
      </div>

      {/* Members list */}
      {project && (
        <div className="rounded-xl border border-themed-subtle bg-card p-2">
          <div className="divide-y divide-[var(--border-subtle)]">
            {project.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-hover">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full accent-bg text-sm font-semibold accent-color">
                    {member.user.imageUrl ? (
                      <img src={member.user.imageUrl} alt={member.user.name || member.user.email} className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      member.user.name?.[0]?.toUpperCase() || member.user.email[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-item-title">
                      {member.user.name || member.user.email}
                    </p>
                    <p className="text-xs text-body">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Badge variant={roleVariant(member.role)}>{member.role}</Badge>
                  {member.userId !== currentUserId && member.role !== "HEAD" && (
                    <>
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        className="input-field h-7 w-24 text-xs"
                      >
                        <option value="CO_HEAD">Co-Head</option>
                        <option value="MEMBER">Member</option>
                      </select>
                      <button
                        onClick={() => handleRemove(member.id)}
                        className="rounded-lg p-1.5 text-dim transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                        aria-label="Remove member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onClose={() => { setInviteOpen(false); setFriendSearch(""); }} title="Invite Team Member">
        <div className="space-y-4">
          {/* Search friends by name/email */}
          <div>
            <label className="block text-xs font-medium text-body mb-1.5">Search friends</label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-dim" />
              <input
                type="text"
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
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
                  const isAlreadyMember = project?.members.some((m) => m.user.email === friend.email);
                  return (
                    <button
                      key={friend.friendId}
                      type="button"
                      disabled={isAlreadyMember || loading}
                      onClick={() => handleInviteFriend(friend.email)}
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
                      {isAlreadyMember && <span className="text-[10px] text-dim">Already member</span>}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Manual email entry */}
          <div>
            <label className="block text-xs font-medium text-body mb-1.5">Or invite by email</label>
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setInviteOpen(false); setFriendSearch(""); }}>Cancel</Button>
            <Button onClick={handleInvite} loading={loading} disabled={loading || !inviteEmail}>Send Invite</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
