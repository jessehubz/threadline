"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Globe, Lock, UserPlus } from "lucide-react";
import { inviteMember } from "@/actions/team-actions";
import { toast } from "sonner";

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  shareToken: string | null;
  members: Array<{
    id: string;
    role: string;
    user: { id: string; name: string | null; email: string };
  }>;
}

export function ShareDialog({ open, onClose, projectId, shareToken, members }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("EDITOR");
  const [loading, setLoading] = useState(false);
  const [linkType, setLinkType] = useState<"view" | "edit">("view");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const viewLink = shareToken ? `${baseUrl}/share/${projectId}/${shareToken}` : "";
  const editLink = `${baseUrl}/graph/${projectId}`;
  const currentLink = linkType === "view" ? viewLink : editLink;

  function handleCopy() {
    navigator.clipboard.writeText(currentLink);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleInvite() {
    if (!inviteEmail) return;
    setLoading(true);
    const result = await inviteMember(projectId, inviteEmail, inviteRole);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Invite sent!");
      setInviteEmail("");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onClose={onClose} title="Share Project">
      <div className="space-y-5">
        {/* Link sharing */}
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Share link
          </label>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setLinkType("view")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                linkType === "view"
                  ? "bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              <Globe className="h-3 w-3" /> View only
            </button>
            <button
              onClick={() => setLinkType("edit")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                linkType === "edit"
                  ? "bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              <Lock className="h-3 w-3" /> Can edit
            </button>
          </div>
          <div className="flex gap-2">
            <input
              readOnly
              value={currentLink}
              className="input-field flex-1 text-xs"
            />
            <Button size="sm" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
          {linkType === "edit" && (
            <p className="mt-1 text-[10px] text-gray-500">Requires sign-in to edit</p>
          )}
        </div>

        {/* Invite by email */}
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">
            <UserPlus className="inline h-3 w-3 mr-1" /> Invite people
          </label>
          <div className="flex gap-2">
            <Input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@example.com"
              className="flex-1 text-sm"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="input-field w-24 text-xs"
            >
              <option value="EDITOR">Editor</option>
              <option value="VIEWER">Viewer</option>
            </select>
            <Button size="sm" onClick={handleInvite} loading={loading}>
              Invite
            </Button>
          </div>
        </div>

        {/* Current members */}
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">
            People with access
          </label>
          <div className="max-h-40 space-y-2 overflow-y-auto">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                    {member.user.name?.[0]?.toUpperCase() || member.user.email[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {member.user.name || member.user.email}
                  </span>
                </div>
                <Badge variant={member.role === "OWNER" ? "info" : member.role === "EDITOR" ? "success" : "default"}>
                  {member.role}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
