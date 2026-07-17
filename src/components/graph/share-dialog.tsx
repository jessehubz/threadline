"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Check,
  Link2,
  UserPlus,
  Search,
  X,
  ChevronDown,
  Mail,
  RotateCcw,
} from "lucide-react";
import { inviteMember, removeMember, updateMemberRole, inviteByEmail, getPendingInvites, revokeInvite, searchUsersForProject } from "@/actions/team-actions";
import type { ProjectSearchResult } from "@/actions/team-actions";
import { regenerateShareToken, disableShareLink } from "@/actions/project-actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  shareToken: string | null;
  members: Array<{
    id: string;
    role: string;
    user: { id: string; name: string | null; email: string };
  }>;
  currentUserRole: string;
  canInviteMembers?: boolean;
}

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  expiresAt: Date;
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name[0].toUpperCase();
  }
  return email[0].toUpperCase();
}

function RoleBadge({ role }: { role: string }) {
  if (role === "HEAD") {
    return (
      <span
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-[var(--on-accent)]"
        style={{ backgroundColor: "var(--accent)" }}
      >
        Head
      </span>
    );
  }
  if (role === "CO_HEAD") {
    return (
      <span
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
        style={{
          color: "var(--accent)",
          border: "1.5px solid var(--accent)",
          backgroundColor: "transparent",
        }}
      >
        Co-Head
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
      style={{
        color: "var(--text-secondary)",
        backgroundColor: "var(--bg-muted, rgba(0,0,0,0.06))",
      }}
    >
      Member
    </span>
  );
}

export function ShareDialog({
  open,
  onClose,
  projectId,
  projectName,
  shareToken: initialShareToken,
  members,
  currentUserRole,
  canInviteMembers,
}: ShareDialogProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  // Add-people tab
  const [addTab, setAddTab] = useState<"friends" | "email">("friends");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProjectSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ProjectSearchResult | null>(null);
  const [inviteRole, setInviteRole] = useState<"CO_HEAD" | "MEMBER">("MEMBER");
  const [inviteLoading, setInviteLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Email invite state
  const [emailInput, setEmailInput] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailInviteResult, setEmailInviteResult] = useState<{ email: string; url: string } | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);

  // Pending invites
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Role change state
  const [roleChangeLoading, setRoleChangeLoading] = useState<string | null>(null);
  const [removeLoading, setRemoveLoading] = useState<string | null>(null);

  // Share link state (local, so a regenerate/disable reflects instantly
  // without waiting on a server round-trip to re-render the parent).
  const [shareToken, setShareToken] = useState(initialShareToken);
  const [linkActionLoading, setLinkActionLoading] = useState(false);
  const [linkConfirmMode, setLinkConfirmMode] = useState<"reset" | "disable" | null>(null);

  const canManageMembers = currentUserRole === "HEAD" || currentUserRole === "CO_HEAD";
  const canRemoveMembers = currentUserRole === "HEAD";
  const canManageInvites = canInviteMembers ?? canManageMembers;
  const canManageLink = currentUserRole === "HEAD";

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareLink = shareToken ? `${baseUrl}/share/${projectId}/${shareToken}` : "";

  // Load pending invites whenever the dialog opens
  useEffect(() => {
    if (!open || !canManageInvites) return;
    let active = true;
    async function loadPendingInvites() {
      setPendingLoading(true);
      try {
        const invites = await getPendingInvites(projectId);
        if (active) setPendingInvites(invites);
      } catch {
        if (active) setPendingInvites([]);
      } finally {
        if (active) setPendingLoading(false);
      }
    }
    loadPendingInvites();
    return () => {
      active = false;
    };
  }, [open, projectId, canManageInvites]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setSelectedUser(null);

      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

      if (query.trim().length < 2) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      searchTimerRef.current = setTimeout(async () => {
        setSearchLoading(true);
        try {
          const results = await searchUsersForProject(projectId, query.trim());
          setSearchResults(results);
          setShowDropdown(results.length > 0);
        } catch {
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      }, 300);
    },
    [projectId]
  );

  function handleSelectUser(user: ProjectSearchResult) {
    setSelectedUser(user);
    setSearchQuery(user.name || user.email);
    setShowDropdown(false);
  }

  async function handleInvite() {
    if (!selectedUser) return;
    setInviteLoading(true);
    try {
      const result = await inviteMember(projectId, selectedUser.email, inviteRole);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${selectedUser.name || selectedUser.email} has been added!`);
        setSelectedUser(null);
        setSearchQuery("");
        setSearchResults([]);
        router.refresh(); // re-fetch the members list so it reflects the add

      }
    } catch {
      toast.error("Failed to add member");
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleEmailInvite() {
    const trimmed = emailInput.trim();
    if (!trimmed) return;
    setEmailLoading(true);
    setEmailInviteResult(null);
    try {
      const result = await inviteByEmail(projectId, trimmed);
      if (result.error) {
        toast.error(result.error);
      } else if (result.addedDirectly) {
        toast.success(`${trimmed} has been added!`);
        setEmailInput("");
        router.refresh(); // existing-account add → reflect in the members list
      } else if (result.inviteUrl) {
        setEmailInviteResult({ email: trimmed, url: result.inviteUrl });
        setEmailInput("");
        if (result.emailSent) {
          toast.success(`Invite sent to ${trimmed}`);
        } else {
          toast.error("Couldn't send the invite email, but you can share the link below");
        }
        getPendingInvites(projectId).then(setPendingInvites).catch(() => {});
      }
    } catch {
      toast.error("Failed to send invite");
    } finally {
      setEmailLoading(false);
    }
  }

  function handleCopyEmailInviteLink() {
    if (!emailInviteResult) return;
    navigator.clipboard.writeText(emailInviteResult.url);
    setEmailCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setEmailCopied(false), 2000);
  }

  async function handleRevokeInvite(inviteId: string, email: string) {
    setRevokingId(inviteId);
    try {
      const result = await revokeInvite(inviteId);
      if (result.error) {
        toast.error(result.error);
      } else {
        setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
        toast.success(`Invite to ${email} revoked`);
      }
    } catch {
      toast.error("Failed to revoke invite");
    } finally {
      setRevokingId(null);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRegenerateLink() {
    setLinkActionLoading(true);
    try {
      const result = await regenerateShareToken(projectId);
      if (result.error) {
        toast.error(result.error);
      } else {
        setShareToken(result.shareToken ?? null);
        toast.success("Share link reset — the old link no longer works");
      }
    } catch {
      toast.error("Failed to reset link");
    } finally {
      setLinkActionLoading(false);
      setLinkConfirmMode(null);
    }
  }

  async function handleDisableLink() {
    setLinkActionLoading(true);
    try {
      const result = await disableShareLink(projectId);
      if (result.error) {
        toast.error(result.error);
      } else {
        setShareToken(null);
        toast.success("Link sharing disabled");
      }
    } catch {
      toast.error("Failed to disable link");
    } finally {
      setLinkActionLoading(false);
      setLinkConfirmMode(null);
    }
  }

  async function handleEnableLink() {
    setLinkActionLoading(true);
    try {
      const result = await regenerateShareToken(projectId);
      if (result.error) {
        toast.error(result.error);
      } else {
        setShareToken(result.shareToken ?? null);
        toast.success("Link sharing enabled");
      }
    } catch {
      toast.error("Failed to enable link");
    } finally {
      setLinkActionLoading(false);
    }
  }

  async function handleRoleChange(memberId: string, newRole: string) {
    setRoleChangeLoading(memberId);
    try {
      const result = await updateMemberRole(projectId, memberId, newRole);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Role updated");
        router.refresh(); // reflect the new role in the members list
      }
    } catch {
      toast.error("Failed to update role");
    } finally {
      setRoleChangeLoading(null);
    }
  }

  async function handleRemoveMember(memberId: string, userName: string) {
    setRemoveLoading(memberId);
    try {
      const result = await removeMember(projectId, memberId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${userName} has been removed`);
        router.refresh(); // drop the removed member from the list immediately
      }
    } catch {
      toast.error("Failed to remove member");
    } finally {
      setRemoveLoading(null);
    }
  }

  const friendResults = searchResults.filter((r) => r.isFriend);
  const otherResults = searchResults.filter((r) => !r.isFriend);

  function renderSearchResultRow(result: ProjectSearchResult) {
    return (
      <button
        key={result.id}
        onClick={() => handleSelectUser(result)}
        className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors duration-150 hover:bg-[var(--bg-muted,rgba(0,0,0,0.04))]"
      >
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-[var(--on-accent)]"
          style={{ backgroundColor: "var(--accent)" }}
        >
          {getInitials(result.name, result.email)}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="text-sm font-medium truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {result.name || result.email}
          </div>
          {result.name && (
            <div
              className="text-xs truncate"
              style={{ color: "var(--text-muted)" }}
            >
              {result.email}
            </div>
          )}
        </div>
      </button>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} title={`Share '${projectName}'`}>
      <div className="space-y-6">
        {/* Add people section - only for HEAD/CO_HEAD */}
        {canManageMembers && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="h-4 w-4" style={{ color: "var(--accent)" }} />
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Add people
              </span>
            </div>

            {/* Segmented toggle: Friends / Email */}
            <div
              className="mb-3 inline-flex rounded-lg p-0.5"
              style={{ backgroundColor: "var(--bg-muted, rgba(0,0,0,0.04))" }}
            >
              <button
                onClick={() => setAddTab("friends")}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-[background-color,color,opacity,box-shadow] duration-150",
                  addTab === "friends" ? "shadow-sm" : "opacity-60 hover:opacity-100"
                )}
                style={{
                  backgroundColor: addTab === "friends" ? "var(--bg-elevated)" : "transparent",
                  color: addTab === "friends" ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              >
                Search people
              </button>
              <button
                onClick={() => setAddTab("email")}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-[background-color,color,opacity,box-shadow] duration-150",
                  addTab === "email" ? "shadow-sm" : "opacity-60 hover:opacity-100"
                )}
                style={{
                  backgroundColor: addTab === "email" ? "var(--bg-elevated)" : "transparent",
                  color: addTab === "email" ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              >
                Email invite
              </button>
            </div>

            {addTab === "friends" ? (
              <div className="flex gap-2" ref={searchRef}>
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => {
                      if (searchResults.length > 0 && !selectedUser) setShowDropdown(true);
                    }}
                    placeholder="Search by name or email..."
                    className="w-full h-9 pl-9 pr-3 rounded-lg text-sm transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1"
                    style={{
                      backgroundColor: "var(--bg-muted, rgba(0,0,0,0.04))",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                    }}
                  />
                  {searchLoading && (
                    <div
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
                      style={{ color: "var(--accent)" }}
                    />
                  )}

                  {/* Search results dropdown - grouped Friends / Other people */}
                  {showDropdown && (
                    <div
                      className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg overflow-hidden py-1 max-h-64 overflow-y-auto"
                      style={{
                        backgroundColor: "var(--bg-elevated)",
                        border: "1px solid var(--border-default)",
                        boxShadow: "var(--shadow-md)",
                      }}
                    >
                      {friendResults.length > 0 && (
                        <>
                          <div className="px-3 pt-1 pb-0.5 text-eyebrow">Friends</div>
                          {friendResults.map(renderSearchResultRow)}
                        </>
                      )}
                      {otherResults.length > 0 && (
                        <>
                          <div className="px-3 pt-2 pb-0.5 text-eyebrow">Other people</div>
                          {otherResults.map(renderSearchResultRow)}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Role selector */}
                <div className="relative">
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as "CO_HEAD" | "MEMBER")}
                    className="h-9 appearance-none rounded-lg pl-3 pr-7 text-xs font-medium cursor-pointer transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1"
                    style={{
                      backgroundColor: "var(--bg-muted, rgba(0,0,0,0.04))",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="CO_HEAD">Co-Head</option>
                    <option value="MEMBER">Member</option>
                  </select>
                  <ChevronDown
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none"
                    style={{ color: "var(--text-muted)" }}
                  />
                </div>

                <Button
                  size="sm"
                  onClick={handleInvite}
                  loading={inviteLoading}
                  disabled={!selectedUser}
                >
                  Add
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
                      style={{ color: "var(--text-muted)" }}
                    />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleEmailInvite();
                        }
                      }}
                      placeholder="person@email.com"
                      className="w-full h-9 pl-9 pr-3 rounded-lg text-sm transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1"
                      style={{
                        backgroundColor: "var(--bg-muted, rgba(0,0,0,0.04))",
                        border: "1px solid var(--border-default)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={handleEmailInvite}
                    loading={emailLoading}
                    disabled={!emailInput.trim()}
                  >
                    Send invite
                  </Button>
                </div>

                {emailInviteResult && (
                  <div
                    className="rounded-lg p-3"
                    style={{ backgroundColor: "var(--accent-soft)" }}
                  >
                    <p className="text-xs" style={{ color: "var(--text-primary)" }}>
                      Invite sent to <strong>{emailInviteResult.email}</strong>
                    </p>
                    <div className="mt-2 flex gap-2">
                      <input
                        readOnly
                        value={emailInviteResult.url}
                        className="flex-1 h-8 px-2.5 rounded-md text-xs truncate outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1"
                        style={{
                          backgroundColor: "var(--bg-elevated)",
                          border: "1px solid var(--border-default)",
                          color: "var(--text-secondary)",
                        }}
                      />
                      <Button size="sm" variant="secondary" onClick={handleCopyEmailInviteLink}>
                        {emailCopied ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pending invites - only for HEAD/CO_HEAD, only rendered when there's something to show */}
        {canManageInvites && (pendingLoading || pendingInvites.length > 0) && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Pending invites
              </span>
              {pendingInvites.length > 0 && <Badge className="text-[10px]">{pendingInvites.length}</Badge>}
            </div>
            {pendingLoading ? (
              <div className="flex items-center justify-center py-3">
                <div
                  className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                  style={{ color: "var(--accent)" }}
                />
              </div>
            ) : (
              <div className="space-y-1">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors duration-150 hover:bg-[var(--bg-muted,rgba(0,0,0,0.03))]"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {invite.email}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Invited · expires {new Date(invite.expiresAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokeInvite(invite.id, invite.email)}
                      disabled={revokingId === invite.id}
                      className="rounded-md p-1 transition-colors duration-150 hover:bg-[var(--bg-muted,rgba(0,0,0,0.06))] disabled:opacity-50"
                      style={{ color: "var(--text-muted)" }}
                      aria-label={`Revoke invite to ${invite.email}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Link sharing section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="h-4 w-4" style={{ color: "var(--accent)" }} />
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Link sharing
            </span>
          </div>
          <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
            Anyone with this link can view this project
          </p>
          {shareLink ? (
            <>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={shareLink}
                  className="flex-1 h-9 px-3 rounded-lg text-xs truncate outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1"
                  style={{
                    backgroundColor: "var(--bg-muted, rgba(0,0,0,0.04))",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-secondary)",
                  }}
                />
                <Button size="sm" variant="secondary" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              <p
                className="mt-2 text-[11px] leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                People with the link can view but not edit. To allow editing, add
                them as a member above.
              </p>

              {canManageLink && (
                <div className="mt-3">
                  {linkConfirmMode ? (
                    <div
                      className="flex items-center gap-2 rounded-lg px-3 py-2"
                      style={{ backgroundColor: "var(--danger-soft)" }}
                    >
                      <span className="flex-1 text-xs" style={{ color: "var(--danger)" }}>
                        {linkConfirmMode === "reset"
                          ? "Reset the link? The current link will stop working immediately."
                          : "Disable link sharing? The link will stop working until re-enabled."}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setLinkConfirmMode(null)}
                        disabled={linkActionLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        loading={linkActionLoading}
                        onClick={linkConfirmMode === "reset" ? handleRegenerateLink : handleDisableLink}
                      >
                        Confirm
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setLinkConfirmMode("reset")}
                        className="gap-1.5"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Reset link
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setLinkConfirmMode("disable")}>
                        Disable
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Link sharing is disabled.
              </p>
              {canManageLink && (
                <Button size="sm" className="mt-2" onClick={handleEnableLink} loading={linkActionLoading}>
                  Enable link sharing
                </Button>
              )}
            </div>
          )}
        </div>

        {/* People with access section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              People with access
            </span>
            <Badge className="text-[10px]">{members.length}</Badge>
          </div>
          <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors duration-150 hover:bg-[var(--bg-muted,rgba(0,0,0,0.03))]"
              >
                {/* Avatar */}
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-[var(--on-accent)]"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  {getInitials(member.user.name, member.user.email)}
                </div>

                {/* Name + email */}
                <div className="min-w-0 flex-1">
                  <div
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {member.user.name || member.user.email}
                  </div>
                  {member.user.name && (
                    <div
                      className="text-xs truncate"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {member.user.email}
                    </div>
                  )}
                </div>

                {/* Role badge or role dropdown */}
                <div className="flex items-center gap-2 shrink-0">
                  {canManageMembers && member.role !== "HEAD" ? (
                    <div className="relative">
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        disabled={
                          roleChangeLoading === member.id ||
                          currentUserRole !== "HEAD"
                        }
                        className="appearance-none rounded-full px-2.5 py-0.5 text-[11px] font-medium cursor-pointer outline-none pr-5 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1"
                        style={{
                          color:
                            member.role === "CO_HEAD"
                              ? "var(--accent)"
                              : "var(--text-secondary)",
                          border:
                            member.role === "CO_HEAD"
                              ? "1.5px solid var(--accent)"
                              : "1px solid var(--border-default)",
                          backgroundColor:
                            member.role === "CO_HEAD"
                              ? "transparent"
                              : "var(--bg-muted, rgba(0,0,0,0.04))",
                        }}
                      >
                        <option value="CO_HEAD">Co-Head</option>
                        <option value="MEMBER">Member</option>
                      </select>
                      <ChevronDown
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 pointer-events-none"
                        style={{
                          color:
                            member.role === "CO_HEAD"
                              ? "var(--accent)"
                              : "var(--text-muted)",
                        }}
                      />
                    </div>
                  ) : (
                    <RoleBadge role={member.role} />
                  )}

                  {/* Remove button - only HEAD can remove non-HEAD members */}
                  {canRemoveMembers && member.role !== "HEAD" && (
                    <button
                      onClick={() =>
                        handleRemoveMember(
                          member.id,
                          member.user.name || member.user.email
                        )
                      }
                      disabled={removeLoading === member.id}
                      className="rounded-md p-1 transition-colors duration-150 hover:bg-[var(--bg-muted,rgba(0,0,0,0.06))] disabled:opacity-50"
                      style={{ color: "var(--text-muted)" }}
                      aria-label={`Remove ${member.user.name || member.user.email}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
