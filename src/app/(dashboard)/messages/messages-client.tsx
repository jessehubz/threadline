"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Send, MessageSquare, Users, Plus, Search } from "lucide-react";
import { getPusherClient } from "@/lib/pusher-client";
import { sendMessage } from "@/actions/message-actions";
import {
  getConversations,
  getOrCreateConversation,
  sendDirectMessage,
  getDirectMessages,
  markConversationRead,
} from "@/actions/dm-actions";
import { getFriends } from "@/actions/friend-actions";
import { cn, formatRelativeDate } from "@/lib/utils";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
}

interface MessageUser {
  id: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
}

interface Message {
  id: string;
  content: string;
  isSystem: boolean;
  createdAt: string;
  user: MessageUser;
}

interface Conversation {
  id: string;
  isGroup: boolean;
  name: string | null;
  participants: Array<{
    id: string;
    userId: string;
    lastReadAt: string | null;
    user: MessageUser;
  }>;
  messages: Array<{
    id: string;
    content: string;
    isSystem: boolean;
    createdAt: string;
    user: { id: string; name: string | null; email: string };
  }>;
}

// A conversation has unread messages if the most recent message is from
// someone else, isn't a system message, and postdates the caller's own
// lastReadAt on that conversation (or they've never read it at all).
function isConversationUnread(convo: Conversation, currentUserId: string): boolean {
  const lastMessage = convo.messages[0];
  if (!lastMessage || lastMessage.isSystem || lastMessage.user.id === currentUserId) {
    return false;
  }
  const ownParticipant = convo.participants.find((p) => p.userId === currentUserId);
  if (!ownParticipant?.lastReadAt) return true;
  return new Date(lastMessage.createdAt) > new Date(ownParticipant.lastReadAt);
}

type Tab = "channels" | "dms";

export function MessagesClient({
  projects,
  currentUserId,
}: {
  projects: Project[];
  currentUserId: string;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("channels");
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Persistent Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dim" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-themed-subtle bg-page p-1">
        <button
          onClick={() => setActiveTab("channels")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-150",
            activeTab === "channels"
              ? "bg-card text-heading shadow-sm"
              : "text-body hover:text-heading"
          )}
        >
          <Users className="h-4 w-4" />
          Channels
          <span className="ml-1.5 rounded-full bg-[var(--bg-muted)] px-1.5 py-0.5 text-[10px] font-medium text-dim">{filteredProjects.length}</span>
        </button>
        <button
          onClick={() => setActiveTab("dms")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-150",
            activeTab === "dms"
              ? "bg-card text-heading shadow-sm"
              : "text-body hover:text-heading"
          )}
        >
          <MessageSquare className="h-4 w-4" />
          Direct Messages
        </button>
      </div>

      {activeTab === "channels" ? (
        <ChannelsPanel projects={filteredProjects} currentUserId={currentUserId} />
      ) : (
        <DMsPanel currentUserId={currentUserId} searchQuery={searchQuery} />
      )}
    </div>
  );
}

// ─── Channels Panel (existing project chat) ────────────────────────────────

function ChannelsPanel({
  projects,
  currentUserId,
}: {
  projects: Project[];
  currentUserId: string;
}) {
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id ?? "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedProjectId) return;

    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/messages?projectId=${selectedProjectId}`);
        const data = await res.json();
        if (!cancelled) setMessages(data.messages || []);
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId) return;
    const channel = getPusherClient().subscribe(`private-messages-${selectedProjectId}`);
    channel.bind("new-message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });
    return () => {
      channel.unbind_all();
      getPusherClient().unsubscribe(`private-messages-${selectedProjectId}`);
    };
  }, [selectedProjectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!input.trim() || !selectedProjectId) return;
    const content = input.trim();
    setInput("");
    startTransition(async () => {
      try {
        await sendMessage({ projectId: selectedProjectId, content });
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (projects.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-sm text-body">
          Join or create a project to start messaging.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-280px)] flex-col overflow-hidden bg-card" style={{ borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
      {/* Project selector */}
      <div className="border-b border-themed px-4 py-3">
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="input-field"
          aria-label="Select project channel"
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-themed border-t-[var(--accent)]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-dim">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} currentUserId={currentUserId} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-themed px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isPending}
            className="input-field flex-1"
            aria-label="Message input"
          />
          <button
            onClick={handleSend}
            disabled={isPending || !input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--on-accent)] transition-[background-color,transform] duration-150 hover:bg-[var(--accent-hover)] hover:scale-[1.05] disabled:opacity-50 disabled:hover:scale-100"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DMs Panel ──────────────────────────────────────────────────────────────

function DMsPanel({ currentUserId, searchQuery }: { currentUserId: string; searchQuery: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showNewDM, setShowNewDM] = useState(false);
  const [friendsList, setFriendsList] = useState<Array<{ friendId: string; name: string | null; email: string; imageUrl: string | null }>>([]);
  const [friendSearch, setFriendSearch] = useState("");
  const [friendsLoading, setFriendsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const convos = await getConversations();
        if (!cancelled) setConversations(convos as unknown as Conversation[]);
      } catch {
        if (!cancelled) setConversations([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Marks a conversation read on the server and clears its unread state
  // locally so the dot disappears immediately.
  function markRead(conversationId: string) {
    markConversationRead(conversationId).catch(() => {});
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              participants: c.participants.map((p) =>
                p.userId === currentUserId ? { ...p, lastReadAt: new Date().toISOString() } : p
              ),
            }
          : c
      )
    );
  }

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;
    const conversationId = selectedConversation.id;

    let cancelled = false;
    async function load() {
      setMessagesLoading(true);
      try {
        const msgs = await getDirectMessages(conversationId);
        if (!cancelled) {
          setMessages(
            msgs.map((m) => ({
              id: m.id,
              content: m.content,
              isSystem: m.isSystem,
              createdAt: m.createdAt.toISOString(),
              user: m.user,
            }))
          );
        }
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setMessagesLoading(false);
      }
    }
    load();
    (function runMarkRead() {
      markRead(conversationId);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation]);

  // Subscribe to Pusher for real-time DMs
  useEffect(() => {
    if (!selectedConversation) return;
    const channel = getPusherClient().subscribe(`private-dm-${selectedConversation.id}`);
    channel.bind("new-dm", (data: Message) => {
      setMessages((prev) => [...prev, data]);
      // The conversation is open/visible, so mark it read as new messages arrive.
      markRead(selectedConversation.id);
    });
    return () => {
      channel.unbind_all();
      getPusherClient().unsubscribe(`private-dm-${selectedConversation.id}`);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function getOtherParticipant(convo: Conversation) {
    return convo.participants.find((p) => p.user.id !== currentUserId)?.user;
  }

  async function handleNewDM() {
    setShowNewDM(true);
    setFriendsLoading(true);
    try {
      const data = await getFriends();
      setFriendsList(data.map((f) => ({ friendId: f.friendId, name: f.name, email: f.email, imageUrl: f.imageUrl })));
    } catch {
      toast.error("Failed to load friends");
    } finally {
      setFriendsLoading(false);
    }
  }

  // Filter friends by name or email
  const filteredFriends = friendSearch
    ? friendsList.filter((f) => {
        const q = friendSearch.toLowerCase();
        return (
          (f.name || "").toLowerCase().includes(q) ||
          f.email.toLowerCase().includes(q)
        );
      })
    : friendsList;

  async function handleStartConversation(userId: string) {
    setShowNewDM(false);
    setFriendSearch("");
    startTransition(async () => {
      try {
        const convo = await getOrCreateConversation(userId);
        const typedConvo = convo as unknown as Conversation;
        // Add to list if not already there
        setConversations((prev) => {
          if (prev.some((c) => c.id === typedConvo.id)) return prev;
          return [{ ...typedConvo, messages: [] }, ...prev];
        });
        setSelectedConversation({ ...typedConvo, messages: [] });
      } catch (error) {
        toast.error((error as Error).message || "Failed to create conversation");
      }
    });
  }

  function handleSend() {
    if (!input.trim() || !selectedConversation) return;
    const content = input.trim();
    setInput("");
    startTransition(async () => {
      try {
        await sendDirectMessage({ conversationId: selectedConversation.id, content });
      } catch (error) {
        toast.error((error as Error).message || "Failed to send message");
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex h-[calc(100vh-280px)] overflow-hidden bg-card" style={{ borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
      {/* Conversation list */}
      <div className="w-64 flex-shrink-0 border-r border-themed">
        <div className="flex items-center justify-between border-b border-themed px-4 py-3">
          <h3 className="text-card-title">Conversations</h3>
          <button
            onClick={handleNewDM}
            className="rounded-lg p-1.5 text-dim transition-colors hover:bg-hover hover:text-body"
            aria-label="New conversation"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-themed border-t-[var(--accent)]" />
            </div>
          ) : showNewDM ? (
            <div className="p-2">
              <p className="mb-2 px-2 text-xs font-medium text-body">Start a conversation</p>
              {/* Search input for friends */}
              <div className="relative mb-2 px-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-dim" />
                <input
                  type="text"
                  value={friendSearch}
                  onChange={(e) => setFriendSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="input-field pl-9 py-1.5 text-xs"
                  autoFocus
                />
              </div>
              {friendsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-themed border-t-[var(--accent)]" />
                </div>
              ) : filteredFriends.length === 0 ? (
                <p className="px-2 text-xs text-dim">
                  {friendsList.length === 0 ? "No friends yet. Add friends first!" : "No matching friends"}
                </p>
              ) : (
                filteredFriends.map((friend) => (
                  <button
                    key={friend.friendId}
                    onClick={() => handleStartConversation(friend.friendId)}
                    disabled={isPending}
                    className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm text-body hover:bg-hover hover:text-heading disabled:opacity-50"
                  >
                    <UserAvatar user={{ id: friend.friendId, name: friend.name, email: friend.email, imageUrl: friend.imageUrl }} size="sm" />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-medium truncate">{friend.name || friend.email.split("@")[0]}</p>
                      {friend.name && <p className="text-[10px] text-dim truncate">{friend.email}</p>}
                    </div>
                  </button>
                ))
              )}
              <button
                onClick={() => { setShowNewDM(false); setFriendSearch(""); }}
                className="mt-2 w-full rounded-lg px-2 py-1.5 text-xs text-body hover:bg-hover"
              >
                Cancel
              </button>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-xs text-dim">No conversations yet</p>
              <button
                onClick={handleNewDM}
                className="mt-2 text-xs accent-color hover:underline"
              >
                Start a conversation
              </button>
            </div>
          ) : (
            conversations
              .filter((convo) => {
                if (!searchQuery) return true;
                const other = getOtherParticipant(convo);
                const name = other?.name || other?.email || "";
                return name.toLowerCase().includes(searchQuery.toLowerCase());
              })
              .map((convo) => {
              const other = getOtherParticipant(convo);
              const lastMessage = convo.messages[0];
              const unread = isConversationUnread(convo, currentUserId);
              return (
                <button
                  key={convo.id}
                  onClick={() => setSelectedConversation(convo)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-hover",
                    selectedConversation?.id === convo.id && "bg-hover"
                  )}
                >
                  <UserAvatar user={other || { id: "", name: "?", email: "", imageUrl: null }} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={cn("truncate text-item-title", unread && "font-semibold text-heading")}>
                        {other?.name || other?.email || "Unknown"}
                      </p>
                      {lastMessage && (
                        <span className="flex-shrink-0 text-[10px] text-dim">{formatRelativeDate(lastMessage.createdAt)}</span>
                      )}
                    </div>
                    {lastMessage && (
                      <p className={cn("truncate text-xs text-body", unread && "font-medium text-heading")}>
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                  {unread && (
                    <span
                      className="ml-1 h-2 w-2 flex-shrink-0 rounded-full"
                      style={{ background: "var(--accent)" }}
                      aria-label="Unread"
                    />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Message area */}
      <div className="flex flex-1 flex-col">
        {!selectedConversation ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-dim" />
              <p className="mt-2 text-sm text-body">
                Select a conversation or start a new one
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b border-themed px-4 py-3">
              <div className="flex items-center gap-2">
                <UserAvatar
                  user={getOtherParticipant(selectedConversation) || { id: "", name: "?", email: "", imageUrl: null }}
                  size="sm"
                />
                <p className="text-item-title">
                  {getOtherParticipant(selectedConversation)?.name ||
                    getOtherParticipant(selectedConversation)?.email ||
                    "Unknown"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {messagesLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-themed border-t-[var(--accent)]" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-dim">
                    No messages yet. Say hello!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} currentUserId={currentUserId} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-themed px-4 py-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  disabled={isPending}
                  className="input-field flex-1"
                  aria-label="Direct message input"
                />
                <button
                  onClick={handleSend}
                  disabled={isPending || !input.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--on-accent)] transition-[background-color,transform] duration-150 hover:bg-[var(--accent-hover)] hover:scale-[1.05] disabled:opacity-50 disabled:hover:scale-100"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Shared Components ──────────────────────────────────────────────────────

function MessageBubble({ msg, currentUserId }: { msg: Message; currentUserId: string }) {
  if (msg.isSystem) {
    return (
      <div className="flex justify-center">
        <p className="text-xs text-dim">{msg.content}</p>
      </div>
    );
  }

  const isOwn = msg.user.id === currentUserId;

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className={cn("flex gap-3", isOwn && "flex-row-reverse")}>
      <UserAvatar user={msg.user} size="sm" />
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2.5",
          isOwn
            ? "bg-[var(--accent)] text-[var(--on-accent)]"
            : "bg-hover text-heading"
        )}
      >
        {!isOwn && (
          <p className="mb-0.5 text-xs font-medium text-body">
            {msg.user.name || msg.user.email}
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
        <p
          className={cn(
            "mt-1 text-[11px]",
            isOwn ? "text-[var(--accent)]" : "text-dim"
          )}
        >
          {formatTime(msg.createdAt)}
        </p>
      </div>
    </div>
  );
}

function UserAvatar({ user, size }: { user: MessageUser; size: "sm" | "md" }) {
  const sizeClasses = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";

  return (
    <div
      className={cn(
        "flex flex-shrink-0 items-center justify-center rounded-full accent-bg font-medium accent-color",
        sizeClasses
      )}
    >
      {user.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.imageUrl}
          alt={user.name || user.email}
          className={cn("rounded-full object-cover", sizeClasses)}
        />
      ) : (
        (user.name || user.email).charAt(0).toUpperCase()
      )}
    </div>
  );
}
