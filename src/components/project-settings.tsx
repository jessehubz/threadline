"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Shield, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { updateProjectVisibility, updateProjectPermissions, kickMember, getProjectPermissions } from "@/actions/project-permission-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProjectSettingsProps {
  projectId: string;
  currentVisibility: string;
  members: Array<{ id: string; role: string; user: { id: string; name: string | null; email: string } }>;
  currentUserRole: string;
  // Non-HEAD members with this permission can still open the dialog to
  // manage members (kick, subject to canKickMembers); visibility & the
  // permission matrix itself remain HEAD-only regardless.
  canChangeSettings?: boolean;
  open: boolean;
  onClose: () => void;
}

interface PermissionSet {
  canCreateNodes: boolean;
  canEditNodes: boolean;
  canDeleteNodes: boolean;
  canCreateEdges: boolean;
  canDeleteEdges: boolean;
  canChangeSettings: boolean;
  canInviteMembers: boolean;
  canKickMembers: boolean;
}

const defaultCoHead: PermissionSet = { canCreateNodes: true, canEditNodes: true, canDeleteNodes: true, canCreateEdges: true, canDeleteEdges: true, canChangeSettings: false, canInviteMembers: true, canKickMembers: false };
const defaultMember: PermissionSet = { canCreateNodes: false, canEditNodes: false, canDeleteNodes: false, canCreateEdges: false, canDeleteEdges: false, canChangeSettings: false, canInviteMembers: false, canKickMembers: false };

const permissionLabels: Record<keyof PermissionSet, string> = {
  canCreateNodes: "Create nodes",
  canEditNodes: "Edit nodes",
  canDeleteNodes: "Delete nodes",
  canCreateEdges: "Create edges",
  canDeleteEdges: "Delete edges",
  canChangeSettings: "Change project settings",
  canInviteMembers: "Invite members",
  canKickMembers: "Kick members",
};

export function ProjectSettings({ projectId, currentVisibility, members, currentUserRole, canChangeSettings = false, open, onClose }: ProjectSettingsProps) {
  const isHead = currentUserRole === "HEAD";
  const [visibility, setVisibility] = useState(currentVisibility);
  const [coHeadPerms, setCoHeadPerms] = useState<PermissionSet>(defaultCoHead);
  const [memberPerms, setMemberPerms] = useState<PermissionSet>(defaultMember);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "permissions" | "members">(isHead ? "general" : "members");

  useEffect(() => {
    if (open) {
      getProjectPermissions(projectId).then((perms) => {
        if (perms) {
          const ch = perms.find((p) => p.role === "CO_HEAD");
          const m = perms.find((p) => p.role === "MEMBER");
          if (ch) setCoHeadPerms({ canCreateNodes: ch.canCreateNodes, canEditNodes: ch.canEditNodes, canDeleteNodes: ch.canDeleteNodes, canCreateEdges: ch.canCreateEdges, canDeleteEdges: ch.canDeleteEdges, canChangeSettings: ch.canChangeSettings, canInviteMembers: ch.canInviteMembers, canKickMembers: ch.canKickMembers });
          if (m) setMemberPerms({ canCreateNodes: m.canCreateNodes, canEditNodes: m.canEditNodes, canDeleteNodes: m.canDeleteNodes, canCreateEdges: m.canCreateEdges, canDeleteEdges: m.canDeleteEdges, canChangeSettings: m.canChangeSettings, canInviteMembers: m.canInviteMembers, canKickMembers: m.canKickMembers });
        }
      });
    }
  }, [open, projectId]);

  async function handleSaveVisibility() {
    setSaving(true);
    const result = await updateProjectVisibility(projectId, visibility as "PUBLIC" | "PRIVATE");
    if (result.error) toast.error(result.error);
    else toast.success("Visibility updated");
    setSaving(false);
  }

  async function handleSavePermissions() {
    setSaving(true);
    await updateProjectPermissions(projectId, "CO_HEAD", coHeadPerms);
    await updateProjectPermissions(projectId, "MEMBER", memberPerms);
    toast.success("Permissions saved");
    setSaving(false);
  }

  async function handleKick(memberId: string) {
    if (!confirm("Remove this member from the project?")) return;
    const result = await kickMember(projectId, memberId);
    if (result.error) toast.error(result.error);
    else toast.success("Member removed");
  }

  if (!isHead && !canChangeSettings) return null;

  const visibleTabs = (["general", "permissions", "members"] as const).filter(
    (tab) => tab === "members" || isHead
  );

  return (
    <Dialog open={open} onClose={onClose} title="Project Settings">
      {/* Tabs */}
      <div className="flex rounded-lg p-0.5 mb-4" style={{ backgroundColor: "var(--bg-muted)", border: "1px solid var(--border-default)" }}>
        {visibleTabs.map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={cn("flex-1 rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors duration-150", activeTab === tab ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]")}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "general" && isHead && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Visibility</label>
            <div className="mt-2 space-y-2">
              <button type="button" onClick={() => setVisibility("PUBLIC")} className={cn("flex w-full items-center gap-3 rounded-xl p-3 border transition-colors duration-150", visibility === "PUBLIC" ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border-default)] hover:border-[var(--accent)]/50")}>
                <Eye className="h-4 w-4" style={{ color: visibility === "PUBLIC" ? "var(--accent)" : "var(--text-muted)" }} />
                <div className="text-left"><p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Public</p><p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Visible on your profile, viewable by anyone</p></div>
              </button>
              <button type="button" onClick={() => setVisibility("PRIVATE")} className={cn("flex w-full items-center gap-3 rounded-xl p-3 border transition-colors duration-150", visibility === "PRIVATE" ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border-default)] hover:border-[var(--accent)]/50")}>
                <EyeOff className="h-4 w-4" style={{ color: visibility === "PRIVATE" ? "var(--accent)" : "var(--text-muted)" }} />
                <div className="text-left"><p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Private</p><p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Only members can view this project</p></div>
              </button>
            </div>
          </div>
          <Button onClick={handleSaveVisibility} loading={saving} size="sm">Save</Button>
        </div>
      )}

      {activeTab === "permissions" && isHead && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4" style={{ color: "var(--accent)" }} />
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>CO_HEAD Permissions</h3>
            </div>
            <div className="space-y-1.5">
              {(Object.keys(permissionLabels) as (keyof PermissionSet)[]).map((key) => (
                <label key={key} className="flex items-center gap-2.5 rounded-lg px-3 py-2 cursor-pointer transition-colors hover:bg-[var(--bg-muted)]">
                  <input type="checkbox" checked={coHeadPerms[key]} onChange={(e) => setCoHeadPerms((p) => ({ ...p, [key]: e.target.checked }))} className="rounded" />
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{permissionLabels[key]}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>MEMBER Permissions</h3>
            <div className="space-y-1.5">
              {(Object.keys(permissionLabels) as (keyof PermissionSet)[]).map((key) => (
                <label key={key} className="flex items-center gap-2.5 rounded-lg px-3 py-2 cursor-pointer transition-colors hover:bg-[var(--bg-muted)]">
                  <input type="checkbox" checked={memberPerms[key]} onChange={(e) => setMemberPerms((p) => ({ ...p, [key]: e.target.checked }))} className="rounded" />
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{permissionLabels[key]}</span>
                </label>
              ))}
            </div>
          </div>
          <Button onClick={handleSavePermissions} loading={saving} size="sm">Save Permissions</Button>
        </div>
      )}

      {activeTab === "members" && (
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ backgroundColor: "var(--bg-muted)" }}>
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{m.user.name || m.user.email}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{m.role}</p>
              </div>
              {m.role !== "HEAD" && (
                <button onClick={() => handleKick(m.id)} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-colors duration-150" title="Remove member">
                  <UserMinus className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </Dialog>
  );
}
