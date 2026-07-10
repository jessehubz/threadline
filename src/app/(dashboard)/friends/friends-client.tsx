"use client";

import { useState, useTransition, useEffect } from "react";
import { Search, UserPlus, X, Users, FolderPlus, Trash2 } from "lucide-react";
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
    <div className="space-y-6">
      {/* Add Friend Section */}
      <div className="rounded-2xl border border-themed-subtle bg-card p-5 shadow-themed">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 accent-color" />
            <h2 className="text-[14px] font-semibold text-heading">Add Friend</h2>
          </div>
          <button
            onClick={() => setShowAddFriend(!showAddFriend)}
            className={cn(
              "btn-primary text-[12px] px-3 py-1.5",
              showAddFriend && "bg-[var(--bg-muted)] text-body hover:bg-[var(--bg-muted)]"
            )}
          >
            {showAddFriend ? "Cancel" : "Search Users"}
          </button>
        </div>

        {showAddFriend && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dim" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="input-field pl-10"
                autoFocus
              />
            </div>

            {isSearching && (
              <div className="flex items-center justify-center py-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-themed border-t-[var(--accent)]" />
              </div>
            )}

            {!isSearching && searchResults.length > 0 && (
              <div className="space-y-1">
                {searchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-hover transition-colors">
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
                ))}
              </div>
            )}

            {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
              <p className="text-center text-[12px] text-dim py-3">No users found</p>
            )}
          </div>
        )}
      </div>

      {/* Friends List */}
      <div className="rounded-2xl border border-themed-subtle bg-card p-5 shadow-themed">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-dim" />
          <h2 className="text-[14px] font-semibold text-heading">Your Friends</h2>
          <span className="rounded-full bg-[var(--bg-muted)] px-2 py-0.5 text-[10px] font-medium text-dim">
            {friends.length}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-themed border-t-[var(--accent)]" />
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-8 w-8 text-dim mb-2" />
            <p className="text-[13px] text-body">No friends yet</p>
            <p className="text-[11px] text-dim mt-1">Search for users to add as friends</p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <div key={friend.id} className="rounded-xl border border-themed-subtle p-3 transition-colors hover:bg-hover">
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
                      className="rounded-lg p-1.5 text-dim hover:bg-[var(--bg-muted)] hover:text-body transition-colors"
                      title="Add to project"
                    >
                      <FolderPlus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveFriend(friend.friendId)}
                      disabled={isPending}
                      className="rounded-lg p-1.5 text-dim hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
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
