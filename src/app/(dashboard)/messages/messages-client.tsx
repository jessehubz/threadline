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
  getTeamMembers,
} from "@/actions/dm-actions";
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
  createdAt: string;
  user: MessageUser;
}

interface Conversation {
  id: string;
  isGroup: boolean;
  name: string | null;
  participants: Array<{
    id: string;
    user: MessageUser;
  }>;
  messages: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: { id: string; name: string | null; email: string };
  }>;
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
            "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150",
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
            "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150",
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
        <ChannelsPanel projects={filteredProjects} currentUserId={currentUserId} searchQuery={searchQuery} />
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
  searchQuery,
}: {
  projects: Project[];
  currentUserId: string;
  searchQuery: string;
}) {
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id ?? "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedProjectId) return;
    setLoading(true);
    fetch(`/api/messages?projectId=${selectedProjectId}`)
      .then((res) => res.json())
      .then((data) => setMessages(data.messages || []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
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
      <div className="rounded-2xl border border-themed-subtle bg-card p-12 text-center shadow-sm">
        <p className="text-sm text-body">
          Join or create a project to start messaging.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-280px)] flex-col overflow-hidden rounded-2xl border border-themed-subtle bg-card shadow-sm">
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
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-white transition-all duration-150 hover:bg-[var(--accent-hover)] hover:scale-[1.05] disabled:opacity-50 disabled:hover:scale-100"
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
  const [teammates, setTeammates] = useState<MessageUser[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    setLoading(true);
    getConversations()
      .then((convos) => setConversations(convos as unknown as Conversation[]))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, []);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;
    setMessagesLoading(true);
    getDirectMessages(selectedConversation.id)
      .then((msgs) =>
        setMessages(
          msgs.map((m) => ({
            id: m.id,
            content: m.content,
            createdAt: m.createdAt.toISOString(),
            user: m.user,
          }))
        )
      )
      .catch(() => setMessages([]))
      .finally(() => setMessagesLoading(false));
  }, [selectedConversation]);

  // Subscribe to Pusher for real-time DMs
  useEffect(() => {
    if (!selectedConversation) return;
    const channel = getPusherClient().subscribe(`private-dm-${selectedConversation.id}`);
    channel.bind("new-dm", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });
    return () => {
      channel.unbind_all();
      getPusherClient().unsubscribe(`private-dm-${selectedConversation.id}`);
    };
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function getOtherParticipant(convo: Conversation) {
    return convo.participants.find((p) => p.user.id !== currentUserId)?.user;
  }

  async function handleNewDM() {
    setShowNewDM(true);
    try {
      const members = await getTeamMembers();
      setTeammates(members);
    } catch {
      toast.error("Failed to load team members");
    }
  }

  async function handleStartConversation(userId: string) {
    setShowNewDM(false);
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
    <div className="flex h-[calc(100vh-280px)] overflow-hidden rounded-2xl border border-themed-subtle bg-card shadow-sm">
      {/* Conversation list */}
      <div className="w-64 flex-shrink-0 border-r border-themed">
        <div className="flex items-center justify-between border-b border-themed px-4 py-3">
          <h3 className="text-sm font-semibold text-heading">Conversations</h3>
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
              <p className="mb-2 px-2 text-xs font-medium text-body">Select a team member</p>
              {teammates.length === 0 ? (
                <p className="px-2 text-xs text-dim">No team members found</p>
              ) : (
                teammates.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleStartConversation(member.id)}
                    className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm text-body hover:bg-hover hover:text-heading"
                  >
                    <UserAvatar user={member} size="sm" />
                    <span className="truncate">{member.name || member.email}</span>
                  </button>
                ))
              )}
              <button
                onClick={() => setShowNewDM(false)}
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
                      <p className="truncate text-sm font-medium text-heading">
                        {other?.name || other?.email || "Unknown"}
                      </p>
                      {lastMessage && (
                        <span className="flex-shrink-0 text-[10px] text-dim">{formatRelativeDate(lastMessage.createdAt)}</span>
                      )}
                    </div>
                    {lastMessage && (
                      <p className="truncate text-xs text-body">
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
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
                <p className="text-sm font-medium text-heading">
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
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-white transition-all duration-150 hover:bg-[var(--accent-hover)] hover:scale-[1.05] disabled:opacity-50 disabled:hover:scale-100"
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
            ? "bg-[var(--accent)] text-white"
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
