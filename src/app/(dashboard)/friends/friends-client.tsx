"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Search, Users, FolderPlus, Trash2, MessageCircle, X, UserCheck, UserX, Clock } from "lucide-react";
import {
  searchUsers,
  addFriend,
  removeFriend,
  getFriends,
  addFriendToProject,
  getPendingFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
  getSentFriendRequests,
  cancelFriendRequest,
} from "@/actions/friend-actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { usePresence } from "@/hooks/use-presence";

interface Project {
  id: string;
  name: string;
}

interface FriendData {
  id: string;
  friendId: string;
  name: string | null;
  username: string | null;
  email: string;
  imageUrl: string | null;
  bio: string | null;
}

interface PendingRequest {
  id: string;
  requesterId: string;
  name: string | null;
  username: string | null;
  email: string;
  imageUrl: string | null;
  createdAt: string;
}

interface SentRequest {
  id: string;
  recipientId: string;
  name: string | null;
  username: string | null;
  email: string;
  imageUrl: string | null;
  createdAt: string;
}

interface SearchResult {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  imageUrl: string | null;
}

// ─── Friend Profile Popup ───────────────────────────────────────────────────

function FriendProfilePopup({
  friend,
  anchorRect,
  onClose,
}: {
  friend: FriendData;
  anchorRect: DOMRect | null;
  onClose: () => void;
}) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Position popup near the clicked element
  const style: React.CSSProperties = {};
  if (anchorRect) {
    style.position = "fixed";
    style.top = Math.min(anchorRect.bottom + 8, window.innerHeight - 320);
    style.left = Math.min(anchorRect.left, window.innerWidth - 320);
    style.zIndex = 50;
  }

  return (
    <div
      ref={popupRef}
      style={style}
      className="animate-entrance w-[300px] rounded-2xl border border-themed bg-card p-5 shadow-2xl"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full accent-bg text-lg font-medium accent-color overflow-hidden">
            {friend.imageUrl ? (
              <img src={friend.imageUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
            ) : (
              (friend.name || friend.email).charAt(0).toUpperCase()
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-dim hover:bg-hover hover:text-body transition-colors"
          aria-label="Close profile popup"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-[15px] font-semibold text-heading">
            {friend.name || friend.email.split("@")[0]}
          </p>
          {friend.username && (
            <p className="text-[12px] accent-color">@{friend.username}</p>
          )}
          <p className="text-[12px] text-dim">{friend.email}</p>
        </div>

        {friend.bio && (
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-dim mb-0.5">Bio</p>
            <p className="text-[12px] text-body">{friend.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Friends Client ────────────────────────────────────────────────────

export function FriendsClient({
  projects,
  initialFriends,
  initialPendingRequests,
  initialSentRequests,
}: {
  projects: Project[];
  currentUserId: string;
  initialFriends: FriendData[];
  initialPendingRequests: PendingRequest[];
  initialSentRequests: SentRequest[];
}) {
  const router = useRouter();
  const [friends, setFriends] = useState<FriendData[]>(initialFriends);
  const [prevInitialFriends, setPrevInitialFriends] = useState(initialFriends);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>(initialPendingRequests);
  const [prevInitialPendingRequests, setPrevInitialPendingRequests] = useState(initialPendingRequests);
  const [sentRequests, setSentRequests] = useState<SentRequest[]>(initialSentRequests);
  const [prevInitialSentRequests, setPrevInitialSentRequests] = useState(initialSentRequests);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [addToProjectFriend, setAddToProjectFriend] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [profilePopup, setProfilePopup] = useState<{ friend: FriendData; rect: DOMRect } | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [addingToProjectId, setAddingToProjectId] = useState<string | null>(null);

  // Presence dots: which friends are currently online (shared dashboard
  // presence channel, same source dashboard-content.tsx uses).
  const onlineUserIds = usePresence("presence-dashboard", true);

  // The server component (friends/page.tsx) refetches friends + pending
  // requests on every render, so router.refresh() (triggered by the
  // "data-refresh" Pusher event when e.g. a friend request comes in) needs
  // to flow back into this local state, which was only seeded from props
  // once. Adjust state during render (React's documented pattern for this)
  // rather than in an effect, so there's no extra render pass.
  if (initialFriends !== prevInitialFriends) {
    setPrevInitialFriends(initialFriends);
    setFriends(initialFriends);
  }
  if (initialPendingRequests !== prevInitialPendingRequests) {
    setPrevInitialPendingRequests(initialPendingRequests);
    setPendingRequests(initialPendingRequests);
  }
  if (initialSentRequests !== prevInitialSentRequests) {
    setPrevInitialSentRequests(initialSentRequests);
    setSentRequests(initialSentRequests);
  }

  // ─── Entrance-animation tracking (by identity, not array position) ─────
  // Accepting/declining a request reorders `friends`, so deriving the
  // stagger class from index would replay entrance motion on rows that
  // never actually mounted. Kept in state (a ref can't be read during
  // render) and marked "seen" a frame after paint (same rAF-deferred-
  // setState pattern as the mount flags in task-node.tsx/tag-chip.tsx) so
  // the entrance class is still present for the first paint instead of
  // being replaced pre-commit.
  const [seenFriendIds, setSeenFriendIds] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setSeenFriendIds((prev) => {
        let changed = false;
        const next = new Set(prev);
        for (const friend of friends) {
          if (!next.has(friend.id)) {
            next.add(friend.id);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [friends]);

  // Search users
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    function run() {
      if (!showAddFriend || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      timer = setTimeout(async () => {
        setIsSearching(true);
        try {
          const results = await searchUsers(searchQuery);
          // Filter out existing friends
          const friendIds = new Set(friends.map((f) => f.friendId));
          setSearchResults(results.filter((r) => !friendIds.has(r.id)));
        } catch {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    }

    run();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchQuery, showAddFriend, friends]);

  function handleAddFriend(userId: string) {
    startTransition(async () => {
      try {
        await addFriend(userId);
        toast.success("Friend request sent!");
        setSearchQuery("");
        setShowAddFriend(false);
        // Reload
        const [friendsData, requestsData, sentData] = await Promise.all([
          getFriends(),
          getPendingFriendRequests(),
          getSentFriendRequests(),
        ]);
        setFriends(friendsData as FriendData[]);
        setPendingRequests(requestsData as PendingRequest[]);
        setSentRequests(sentData as SentRequest[]);
      } catch (error) {
        toast.error((error as Error).message || "Failed to send friend request");
      }
    });
  }

  function handleCancelRequest(friendshipId: string) {
    setCancelingId(friendshipId);
    startTransition(async () => {
      try {
        const result = await cancelFriendRequest(friendshipId);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Friend request canceled");
          setSentRequests((prev) => prev.filter((r) => r.id !== friendshipId));
        }
      } catch (error) {
        toast.error((error as Error).message || "Failed to cancel friend request");
      } finally {
        setCancelingId(null);
      }
    });
  }

  function handleAcceptRequest(requesterId: string) {
    setAcceptingId(requesterId);
    startTransition(async () => {
      try {
        await acceptFriendRequest(requesterId);
        toast.success("Friend request accepted!");
        // Reload
        const [friendsData, requestsData] = await Promise.all([getFriends(), getPendingFriendRequests()]);
        setFriends(friendsData as FriendData[]);
        setPendingRequests(requestsData as PendingRequest[]);
      } catch (error) {
        toast.error((error as Error).message || "Failed to accept friend request");
      } finally {
        setAcceptingId(null);
      }
    });
  }

  function handleDeclineRequest(requesterId: string) {
    setDecliningId(requesterId);
    startTransition(async () => {
      try {
        await declineFriendRequest(requesterId);
        toast.success("Friend request declined");
        // Reload
        const [friendsData, requestsData] = await Promise.all([getFriends(), getPendingFriendRequests()]);
        setFriends(friendsData as FriendData[]);
        setPendingRequests(requestsData as PendingRequest[]);
      } catch (error) {
        toast.error((error as Error).message || "Failed to decline friend request");
      } finally {
        setDecliningId(null);
      }
    });
  }

  function handleRemoveFriend(friendId: string) {
    startTransition(async () => {
      try {
        await removeFriend(friendId);
        toast.success("Friend removed");
        setFriends((prev) => prev.filter((f) => f.friendId !== friendId));
      } catch (error) {
        toast.error((error as Error).message || "Failed to remove friend");
      }
    });
  }

  function handleAddToProject(friendId: string, projectId: string) {
    setAddingToProjectId(`${friendId}-${projectId}`);
    startTransition(async () => {
      try {
        await addFriendToProject(friendId, projectId);
        toast.success("Added to project!");
        setAddToProjectFriend(null);
      } catch (error) {
        toast.error((error as Error).message || "Failed to add to project");
      } finally {
        setAddingToProjectId(null);
      }
    });
  }

  function handleOpenProfile(friend: FriendData, event: React.MouseEvent) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setProfilePopup({ friend, rect });
  }

  function handleDM(friendId: string) {
    router.push(`/messages?dm=${friendId}`);
  }

  return (
    <div className="space-y-5">
      {/* Profile popup */}
      {profilePopup && (
        <FriendProfilePopup
          friend={profilePopup.friend}
          anchorRect={profilePopup.rect}
          onClose={() => setProfilePopup(null)}
        />
      )}

      {/* Search-first add-friend bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dim" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowAddFriend(true); }}
            onFocus={() => setShowAddFriend(true)}
            placeholder="Search by name, username, or email to add a friend..."
            className="input-field pl-10"
          />
        </div>

        {showAddFriend && searchQuery.length >= 2 && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowAddFriend(false)} />
            <div className="animate-entrance absolute left-0 right-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-themed bg-card p-1.5 shadow-2xl">
              {isSearching ? (
                <div className="flex items-center justify-center py-6">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-themed border-t-[var(--accent)]" />
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-hover">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full accent-bg text-xs font-medium accent-color overflow-hidden">
                        {user.imageUrl ? (
                          <img src={user.imageUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          (user.name || user.email).charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-heading">{user.name || user.email.split("@")[0]}</p>
                        {user.username && (
                          <p className="text-[11px] accent-color">@{user.username}</p>
                        )}
                        <p className="text-[11px] text-dim">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddFriend(user.id)}
                      disabled={isPending}
                      className="btn-primary text-[11px] px-3 py-1 disabled:opacity-50"
                    >
                      {isPending ? "Sending..." : "Add"}
                    </button>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-[12px] text-dim">No users found</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Pending friend requests */}
      {pendingRequests.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-dim" />
            <h2 className="text-[13px] font-medium uppercase tracking-wide text-dim">Pending Requests</h2>
            <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-medium accent-color">
              {pendingRequests.length}
            </span>
          </div>

          <div className="divide-y divide-[var(--border-subtle)] rounded-2xl border border-themed-subtle">
            {pendingRequests.map((request) => (
              <div key={request.id} className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full accent-bg text-sm font-medium accent-color overflow-hidden">
                    {request.imageUrl ? (
                      <img src={request.imageUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      (request.name || request.email).charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-heading">{request.name || request.email.split("@")[0]}</p>
                    {request.username && (
                      <p className="text-[11px] accent-color">@{request.username}</p>
                    )}
                    <p className="text-[11px] text-dim">{request.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAcceptRequest(request.requesterId)}
                    disabled={isPending || acceptingId === request.requesterId}
                    className="flex items-center gap-1 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-[11px] font-medium text-[var(--on-accent)] transition-colors hover:opacity-90 disabled:opacity-50"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    {acceptingId === request.requesterId ? "Accepting..." : "Accept"}
                  </button>
                  <button
                    onClick={() => handleDeclineRequest(request.requesterId)}
                    disabled={isPending || decliningId === request.requesterId}
                    className="flex items-center gap-1 rounded-lg border border-themed px-3 py-1.5 text-[11px] font-medium text-dim transition-colors hover:bg-hover hover:text-body disabled:opacity-50"
                  >
                    <UserX className="h-3.5 w-3.5" />
                    {decliningId === request.requesterId ? "Declining..." : "Decline"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sent friend requests */}
      {sentRequests.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-dim" />
            <h2 className="text-[13px] font-medium uppercase tracking-wide text-dim">Sent Requests</h2>
            <span className="rounded-full bg-[var(--bg-muted)] px-2 py-0.5 text-[10px] font-medium text-dim">
              {sentRequests.length}
            </span>
          </div>

          <div className="divide-y divide-[var(--border-subtle)] rounded-2xl border border-themed-subtle">
            {sentRequests.map((request) => (
              <div key={request.id} className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full accent-bg text-sm font-medium accent-color overflow-hidden">
                    {request.imageUrl ? (
                      <img src={request.imageUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      (request.name || request.email).charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-heading">{request.name || request.email.split("@")[0]}</p>
                    {request.username && (
                      <p className="text-[11px] accent-color">@{request.username}</p>
                    )}
                    <p className="text-[11px] text-dim">{request.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCancelRequest(request.id)}
                  disabled={isPending || cancelingId === request.id}
                  className="flex items-center gap-1 rounded-lg border border-themed px-3 py-1.5 text-[11px] font-medium text-dim transition-colors hover:bg-hover hover:text-body disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  {cancelingId === request.id ? "Canceling..." : "Cancel"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends list */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-[13px] font-medium uppercase tracking-wide text-dim">Your Friends</h2>
          <span className="rounded-full bg-[var(--bg-muted)] px-2 py-0.5 text-[10px] font-medium text-dim">
            {friends.length}
          </span>
        </div>

        {friends.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-themed py-10 text-center">
            <Users className="mx-auto h-8 w-8 text-dim mb-2" />
            <p className="text-[13px] text-body">No friends yet</p>
            <p className="text-[11px] text-dim mt-1">Search above to add your first friend</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)] rounded-2xl border border-themed-subtle">
            {friends.map((friend, i) => {
              const isNew = !seenFriendIds.has(friend.id);
              return (
              <div key={friend.id} className={cn("p-3.5 transition-colors hover:bg-hover", isNew && `animate-entrance-${Math.min(i + 1, 6)}`)}>
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={(e) => handleOpenProfile(friend, e)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View profile of ${friend.name || friend.email}`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full accent-bg text-sm font-medium accent-color overflow-hidden">
                        {friend.imageUrl ? (
                          <img src={friend.imageUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          (friend.name || friend.email).charAt(0).toUpperCase()
                        )}
                      </div>
                      {onlineUserIds.has(friend.friendId) && (
                        <span
                          style={{
                            position: "absolute",
                            bottom: "0px",
                            right: "0px",
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: "#22c55e",
                            border: "2px solid var(--bg-elevated)",
                          }}
                          aria-label="Online"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-heading">{friend.name || friend.email.split("@")[0]}</p>
                      {friend.username && (
                        <p className="text-[11px] accent-color">@{friend.username}</p>
                      )}
                      <p className="text-[11px] text-dim">{friend.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDM(friend.friendId)}
                      className="rounded-lg p-1.5 text-dim transition-[transform,background-color,color] duration-150 hover:scale-105 hover:bg-[var(--bg-muted)] hover:text-body"
                      title="Send message"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setAddToProjectFriend(addToProjectFriend === friend.friendId ? null : friend.friendId)}
                      className="rounded-lg p-1.5 text-dim transition-[transform,background-color,color] duration-150 hover:scale-105 hover:bg-[var(--bg-muted)] hover:text-body"
                      title="Add to project"
                    >
                      <FolderPlus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveFriend(friend.friendId)}
                      disabled={isPending}
                      className="rounded-lg p-1.5 text-dim transition-[transform,background-color,color] duration-150 hover:scale-105 hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] disabled:opacity-50"
                      title="Remove friend"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Add to project dropdown */}
                {addToProjectFriend === friend.friendId && (
                  <div className="mt-3 ml-12 rounded-xl border border-themed-subtle bg-[var(--bg-surface)] p-2">
                    <div className="flex items-center justify-between mb-1.5 px-2">
                      <p className="text-[11px] font-medium text-dim">Add to project:</p>
                      <button
                        onClick={() => setAddToProjectFriend(null)}
                        className="rounded p-0.5 text-dim hover:bg-hover hover:text-body transition-colors"
                        aria-label="Close add to project"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {projects.length === 0 ? (
                      <p className="text-[11px] text-dim px-2 py-1">No projects available</p>
                    ) : (
                      <div className="space-y-0.5">
                        {projects.map((project) => (
                          <button
                            key={project.id}
                            onClick={() => handleAddToProject(friend.friendId, project.id)}
                            disabled={isPending || addingToProjectId === `${friend.friendId}-${project.id}`}
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] text-body hover:bg-hover hover:text-heading transition-colors disabled:opacity-50"
                          >
                            <FolderPlus className="h-3 w-3" />
                            {addingToProjectId === `${friend.friendId}-${project.id}` ? "Adding..." : project.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
