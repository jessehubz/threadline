"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
} from "lucide-react";
import { inviteMember, removeMember, updateMemberRole } from "@/actions/team-actions";
import { searchAllUsers } from "@/actions/search-actions";
import type { SearchPersonResult } from "@/actions/search-actions";
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
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white"
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
  shareToken,
  members,
  currentUserRole,
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchPersonResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SearchPersonResult | null>(null);
  const [inviteRole, setInviteRole] = useState<"CO_HEAD" | "MEMBER">("MEMBER");
  const [inviteLoading, setInviteLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Role change state
  const [roleChangeLoading, setRoleChangeLoading] = useState<string | null>(null);
  const [removeLoading, setRemoveLoading] = useState<string | null>(null);

  const canManageMembers = currentUserRole === "HEAD" || currentUserRole === "CO_HEAD";
  const canRemoveMembers = currentUserRole === "HEAD";

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareLink = shareToken ? `${baseUrl}/share/${projectId}/${shareToken}` : "";

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
          const results = await searchAllUsers(query.trim());
          // Filter out users who are already members
          const memberUserIds = new Set(members.map((m) => m.user.id));
          const filtered = results.filter((r) => !memberUserIds.has(r.id));
          setSearchResults(filtered);
          setShowDropdown(filtered.length > 0);
        } catch {
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      }, 300);
    },
    [members]
  );

  function handleSelectUser(user: SearchPersonResult) {
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
      }
    } catch {
      toast.error("Failed to add member");
    } finally {
      setInviteLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRoleChange(memberId: string, newRole: string) {
    setRoleChangeLoading(memberId);
    try {
      const result = await updateMemberRole(projectId, memberId, newRole);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Role updated");
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
      }
    } catch {
      toast.error("Failed to remove member");
    } finally {
      setRemoveLoading(null);
    }
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
                  className="w-full h-9 pl-9 pr-3 rounded-lg text-sm transition-all duration-150 outline-none"
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

                {/* Search results dropdown */}
                {showDropdown && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg overflow-hidden py-1"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      border: "1px solid var(--border-default)",
                      boxShadow: "var(--shadow-md)",
                    }}
                  >
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleSelectUser(result)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors duration-150 hover:bg-[var(--bg-muted,rgba(0,0,0,0.04))]"
                      >
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
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
                    ))}
                  </div>
                )}
              </div>

              {/* Role selector */}
              <div className="relative">
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "CO_HEAD" | "MEMBER")}
                  className="h-9 appearance-none rounded-lg pl-3 pr-7 text-xs font-medium cursor-pointer transition-all duration-150 outline-none"
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
                  className="flex-1 h-9 px-3 rounded-lg text-xs truncate outline-none"
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
            </>
          ) : (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              No share link available for this project.
            </p>
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
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
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
                        className="appearance-none rounded-full px-2.5 py-0.5 text-[11px] font-medium cursor-pointer outline-none pr-5 transition-all duration-150"
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
                      className="rounded-md p-1 transition-all duration-150 hover:bg-[var(--bg-muted,rgba(0,0,0,0.06))] disabled:opacity-50"
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
