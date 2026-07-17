"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Send, Sparkles, Bell, CheckCircle2 } from "lucide-react";
import { chatWithAssistant, createReminder } from "@/actions/ai-assistant-actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface AIChatPanelProps {
  open: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "priority_list" | "schedule" | "reminder_confirm";
  reminderData?: { description: string; scheduledFor: string; taskId?: string };
  confirmed?: boolean;
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const GREETING_MESSAGE: ChatMessage = {
  id: "greeting",
  role: "assistant",
  content:
    "Hi, I'm Loom! 👋 I'm your built-in planning assistant. I can help you figure out what to focus on across all your projects. Try asking me:\n\n• \"What should I prioritize?\"\n• \"Help me plan my schedule\"\n• \"Remind me about [task] tomorrow\"",
  type: "text",
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function AIChatPanel({ open, onClose }: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING_MESSAGE]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  // Generate unique message ID
  const generateId = useCallback(() => {
    return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }, []);

  // Handle sending a message
  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isProcessing) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: trimmed,
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      // Build conversation history for the AI (last 20 messages for context window)
      const conversationHistory = [...messages, userMessage]
        .filter((m) => m.id !== "greeting")
        .slice(-20)
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      // Call the LLM-powered assistant (falls back to heuristic if no API key)
      const response = await chatWithAssistant(conversationHistory);

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: response.content,
        type: "text",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "Sorry, I ran into an issue. Please try again in a moment.",
        type: "text",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [input, isProcessing, generateId]);

  // Handle confirming a reminder
  const handleConfirmReminder = useCallback(
    async (messageId: string, reminderData: NonNullable<ChatMessage["reminderData"]>) => {
      try {
        await createReminder(
          reminderData.description,
          reminderData.scheduledFor,
          reminderData.taskId,
        );

        // Mark message as confirmed
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, confirmed: true } : msg,
          ),
        );

        // Add success message
        const successMessage: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: `✅ Reminder set! I'll notify you at the scheduled time.`,
          type: "text",
        };
        setMessages((prev) => [...prev, successMessage]);

        toast.success("Reminder created successfully");
      } catch {
        toast.error("Failed to create reminder");
      }
    },
    [generateId],
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex flex-col",
        "w-[360px] max-h-[520px]",
        "rounded-2xl border border-[var(--border-default)]",
        "bg-[var(--bg-elevated)] shadow-[var(--shadow-md)]",
        "ai-chat-popup",
      )}
      role="dialog"
      aria-modal="false"
      aria-label="AI Assistant chat"
    >
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[var(--border-default)] px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            AI Assistant
          </h2>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)] cursor-pointer"
          aria-label="Close AI Assistant"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
        <div className="space-y-3">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onConfirmReminder={handleConfirmReminder}
            />
          ))}

          {/* Loading indicator */}
          {isProcessing && (
            <div className="flex items-start gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)]">
                <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
              </div>
              <div className="rounded-xl rounded-tl-sm bg-[var(--accent-soft)] px-3 py-2">
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-[var(--border-default)] px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about priorities, schedule..."
            disabled={isProcessing}
            className="flex-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-colors focus:border-[var(--accent)] disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--on-accent)] transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Message Bubble
// -----------------------------------------------------------------------------

function MessageBubble({
  message,
  onConfirmReminder,
}: {
  message: ChatMessage;
  onConfirmReminder: (
    messageId: string,
    reminderData: NonNullable<ChatMessage["reminderData"]>,
  ) => void;
}) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-xl rounded-br-sm bg-[var(--accent)] px-3 py-2 text-[var(--on-accent)] shadow-sm">
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex items-start gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)]">
        <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
      </div>
      <div className="max-w-[85%] space-y-2">
        <div className="rounded-xl rounded-tl-sm bg-[var(--accent-soft)] px-3 py-2 shadow-sm">
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--text-primary)]">
            {message.content}
          </p>
        </div>

        {/* Reminder confirmation card */}
        {message.type === "reminder_confirm" && message.reminderData && (
          <ReminderCard
            messageId={message.id}
            reminderData={message.reminderData}
            confirmed={message.confirmed}
            onConfirm={onConfirmReminder}
          />
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Reminder Confirmation Card
// -----------------------------------------------------------------------------

function ReminderCard({
  messageId,
  reminderData,
  confirmed,
  onConfirm,
}: {
  messageId: string;
  reminderData: NonNullable<ChatMessage["reminderData"]>;
  confirmed?: boolean;
  onConfirm: (
    messageId: string,
    reminderData: NonNullable<ChatMessage["reminderData"]>,
  ) => void;
}) {
  const [isConfirming, setIsConfirming] = useState(false);

  const formattedDate = new Date(reminderData.scheduledFor).toLocaleString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    },
  );

  const handleClick = async () => {
    setIsConfirming(true);
    await onConfirm(messageId, reminderData);
    setIsConfirming(false);
  };

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3 shadow-sm">
      <div className="flex items-start gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
          <Bell className="h-3.5 w-3.5 text-[var(--accent)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">
            {reminderData.description}
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
            {formattedDate}
          </p>
          {reminderData.taskId && (
            <p className="mt-1 text-[11px] text-[var(--text-muted)] italic">
              Linked to a task
            </p>
          )}
        </div>
      </div>

      {confirmed ? (
        <div className="mt-2.5 flex items-center gap-2 text-[13px] font-medium text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Reminder set
        </div>
      ) : (
        <button
          onClick={handleClick}
          disabled={isConfirming}
          className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-[13px] font-semibold text-[var(--on-accent)] transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer"
        >
          {isConfirming ? (
            <>
              <svg
                className="h-3.5 w-3.5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Setting...
            </>
          ) : (
            <>
              <Bell className="h-3.5 w-3.5" />
              Set Reminder
            </>
          )}
        </button>
      )}
    </div>
  );
}
