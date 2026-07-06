"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Send, MessageSquare, Users, Plus } from "lucide-react";
import { getPusherClient } from "@/lib/pusher-client";
import { sendMessage } from "@/actions/message-actions";
import {
  getConversations,
  getOrCreateConversation,
  sendDirectMessage,
  getDirectMessages,
  getTeamMembers,
} from "@/actions/dm-actions";
import { cn } from "@/lib/utils";
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

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-surface-200/80 bg-surface-50 p-1">
        <button
          onClick={() => setActiveTab("channels")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150",
            activeTab === "channels"
              ? "bg-white text-surface-900 shadow-sm"
              : "text-surface-500 hover:text-surface-700300"
          )}
        >
          <Users className="h-4 w-4" />
          Channels
        </button>
        <button
          onClick={() => setActiveTab("dms")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150",
            activeTab === "dms"
              ? "bg-white text-surface-900 shadow-sm"
              : "text-surface-500 hover:text-surface-700300"
          )}
        >
          <MessageSquare className="h-4 w-4" />
          Direct Messages
        </button>
      </div>

      {activeTab === "channels" ? (
        <ChannelsPanel projects={projects} currentUserId={currentUserId} />
      ) : (
        <DMsPanel currentUserId={currentUserId} />
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
      <div className="rounded-2xl border border-surface-200/80 bg-white p-12 text-center shadow-sm">
        <p className="text-sm text-surface-500">
          Join or create a project to start messaging.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-280px)] flex-col overflow-hidden rounded-2xl border border-surface-200/80 bg-white shadow-sm">
      {/* Project selector */}
      <div className="border-b border-surface-100 px-4 py-3">
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="input-field"
          aria-label="Select project channel"
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              # {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-surface-200 border-t-brand-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-surface-400500">
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
      <div className="border-t border-surface-100 px-4 py-3">
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
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
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

function DMsPanel({ currentUserId }: { currentUserId: string }) {
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
    <div className="flex h-[calc(100vh-280px)] overflow-hidden rounded-2xl border border-surface-200/80 bg-white shadow-sm">
      {/* Conversation list */}
      <div className="w-64 flex-shrink-0 border-r border-surface-100">
        <div className="flex items-center justify-between border-b border-surface-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-surface-900">Conversations</h3>
          <button
            onClick={handleNewDM}
            className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600800"
            aria-label="New conversation"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-surface-200 border-t-brand-600" />
            </div>
          ) : showNewDM ? (
            <div className="p-2">
              <p className="mb-2 px-2 text-xs font-medium text-surface-500">Select a team member</p>
              {teammates.length === 0 ? (
                <p className="px-2 text-xs text-surface-400">No team members found</p>
              ) : (
                teammates.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleStartConversation(member.id)}
                    className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm text-surface-700 hover:bg-surface-50300800"
                  >
                    <UserAvatar user={member} size="sm" />
                    <span className="truncate">{member.name || member.email}</span>
                  </button>
                ))
              )}
              <button
                onClick={() => setShowNewDM(false)}
                className="mt-2 w-full rounded-lg px-2 py-1.5 text-xs text-surface-500 hover:bg-surface-100800"
              >
                Cancel
              </button>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-xs text-surface-400500">No conversations yet</p>
              <button
                onClick={handleNewDM}
                className="mt-2 text-xs text-brand-600 hover:underline"
              >
                Start a conversation
              </button>
            </div>
          ) : (
            conversations.map((convo) => {
              const other = getOtherParticipant(convo);
              const lastMessage = convo.messages[0];
              return (
                <button
                  key={convo.id}
                  onClick={() => setSelectedConversation(convo)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-50800",
                    selectedConversation?.id === convo.id && "bg-surface-50"
                  )}
                >
                  <UserAvatar user={other || { id: "", name: "?", email: "", imageUrl: null }} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-surface-900">
                      {other?.name || other?.email || "Unknown"}
                    </p>
                    {lastMessage && (
                      <p className="truncate text-xs text-surface-500">
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
              <MessageSquare className="mx-auto h-8 w-8 text-surface-300600" />
              <p className="mt-2 text-sm text-surface-500">
                Select a conversation or start a new one
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b border-surface-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <UserAvatar
                  user={getOtherParticipant(selectedConversation) || { id: "", name: "?", email: "", imageUrl: null }}
                  size="sm"
                />
                <p className="text-sm font-medium text-surface-900">
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
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-surface-200 border-t-brand-600" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-surface-400500">
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
            <div className="border-t border-surface-100 px-4 py-3">
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
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
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
            ? "bg-brand-600 text-white"
            : "bg-surface-100 text-surface-900"
        )}
      >
        {!isOwn && (
          <p className="mb-0.5 text-xs font-medium text-surface-500">
            {msg.user.name || msg.user.email}
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
        <p
          className={cn(
            "mt-1 text-[11px]",
            isOwn ? "text-brand-200" : "text-surface-400500"
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
        "flex flex-shrink-0 items-center justify-center rounded-full bg-brand-100 font-medium text-brand-700900300",
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
