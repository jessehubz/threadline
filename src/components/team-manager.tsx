"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { inviteMember, removeMember, updateMemberRole } from "@/actions/team-actions";
import { toast } from "sonner";
import { UserPlus, Trash2, Shield } from "lucide-react";

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

  const project = projects.find((p) => p.id === selectedProject);

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
                  <div className="flex h-9 w-9 items-center justify-center rounded-full accent-bg text-sm font-semibold accent-color">
                    {member.user.name?.[0]?.toUpperCase() || member.user.email[0].toUpperCase()}
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
      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Team Member">
        <div className="space-y-4">
          <Input
            label="Email address"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@company.com"
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite} loading={loading}>Send Invite</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
