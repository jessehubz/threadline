"use client";

import { useState, useTransition, useEffect } from "react";
import { Search, Users, FolderPlus, Trash2 } from "lucide-react";
import { searchUsers, addFriend, removeFriend, getFriends, addFriendToProject } from "@/actions/friend-actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
}

interface FriendData {
  id: string;
  friendId: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
  projects: Project[];
}

interface SearchResult {
  id: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
}

export function FriendsClient({ projects, currentUserId }: { projects: Project[]; currentUserId: string }) {
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [addToProjectFriend, setAddToProjectFriend] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  // Load friends
  useEffect(() => {
    setLoading(true);
    getFriends()
      .then((data) => setFriends(data as FriendData[]))
      .catch(() => setFriends([]))
      .finally(() => setLoading(false));
  }, []);

  // Search users
  useEffect(() => {
    if (!showAddFriend || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
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
    return () => clearTimeout(timer);
  }, [searchQuery, showAddFriend, friends]);

  function handleAddFriend(userId: string) {
    startTransition(async () => {
      try {
        await addFriend(userId);
        toast.success("Friend added!");
        setSearchQuery("");
        setShowAddFriend(false);
        // Reload friends
        const data = await getFriends();
        setFriends(data as FriendData[]);
      } catch (error) {
        toast.error((error as Error).message || "Failed to add friend");
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
    startTransition(async () => {
      try {
        await addFriendToProject(friendId, projectId);
        toast.success("Added to project!");
        setAddToProjectFriend(null);
        // Reload friends to update project tags
        const data = await getFriends();
        setFriends(data as FriendData[]);
      } catch (error) {
        toast.error((error as Error).message || "Failed to add to project");
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Search-first add-friend bar — floats results below, no permanent boxed panel */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dim" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowAddFriend(true); }}
            onFocus={() => setShowAddFriend(true)}
            placeholder="Search by name or email to add a friend..."
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
                      <div className="flex h-8 w-8 items-center justify-center rounded-full accent-bg text-xs font-medium accent-color">
                        {user.imageUrl ? (
                          <img src={user.imageUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          (user.name || user.email).charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-heading">{user.name || user.email.split("@")[0]}</p>
                        <p className="text-[11px] text-dim">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddFriend(user.id)}
                      disabled={isPending}
                      className="btn-primary text-[11px] px-3 py-1"
                    >
                      Add
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

      {/* Friends list — open, not nested inside another card */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-[13px] font-medium uppercase tracking-wide text-dim">Your Friends</h2>
          <span className="rounded-full bg-[var(--bg-muted)] px-2 py-0.5 text-[10px] font-medium text-dim">
            {friends.length}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-themed border-t-[var(--accent)]" />
          </div>
        ) : friends.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-themed py-10 text-center">
            <Users className="mx-auto h-8 w-8 text-dim mb-2" />
            <p className="text-[13px] text-body">No friends yet</p>
            <p className="text-[11px] text-dim mt-1">Search above to add your first friend</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)] rounded-2xl border border-themed-subtle">
            {friends.map((friend, i) => (
              <div key={friend.id} className={cn("p-3.5 transition-colors hover:bg-hover", `animate-entrance-${Math.min(i + 1, 6)}`)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full accent-bg text-sm font-medium accent-color">
                      {friend.imageUrl ? (
                        <img src={friend.imageUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                      ) : (
                        (friend.name || friend.email).charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-heading">{friend.name || friend.email.split("@")[0]}</p>
                      <p className="text-[11px] text-dim">{friend.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setAddToProjectFriend(addToProjectFriend === friend.friendId ? null : friend.friendId)}
                      className="rounded-lg p-1.5 text-dim transition-all duration-150 hover:scale-105 hover:bg-[var(--bg-muted)] hover:text-body"
                      title="Add to project"
                    >
                      <FolderPlus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveFriend(friend.friendId)}
                      disabled={isPending}
                      className="rounded-lg p-1.5 text-dim transition-all duration-150 hover:scale-105 hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                      title="Remove friend"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Project tags */}
                {friend.projects.length > 0 && (
                  <div className="mt-2 ml-12 flex flex-wrap gap-1.5">
                    {friend.projects.map((p) => (
                      <span key={p.id} className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-medium accent-color">
                        {p.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Add to project dropdown */}
                {addToProjectFriend === friend.friendId && (
                  <div className="mt-3 ml-12 rounded-xl border border-themed-subtle bg-[var(--bg-surface)] p-2">
                    <p className="text-[11px] font-medium text-dim mb-1.5 px-2">Add to project:</p>
                    {projects.length === 0 ? (
                      <p className="text-[11px] text-dim px-2 py-1">No projects available</p>
                    ) : (
                      <div className="space-y-0.5">
                        {projects.filter((p) => !friend.projects.some((fp) => fp.id === p.id)).map((project) => (
                          <button
                            key={project.id}
                            onClick={() => handleAddToProject(friend.friendId, project.id)}
                            disabled={isPending}
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] text-body hover:bg-hover hover:text-heading transition-colors"
                          >
                            <FolderPlus className="h-3 w-3" />
                            {project.name}
                          </button>
                        ))}
                        {projects.filter((p) => !friend.projects.some((fp) => fp.id === p.id)).length === 0 && (
                          <p className="text-[11px] text-dim px-2 py-1">Already in all projects</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
