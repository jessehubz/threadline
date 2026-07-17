"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Send, Trash2, Paperclip, Lock, Image as ImageIcon, FileText, X } from "lucide-react";
import { upload } from "@vercel/blob/client";
import { addComment, deleteComment } from "@/actions/comment-actions";
import { markCommentsRead } from "@/actions/comment-read-actions";
import { getProjectMembers } from "@/actions/assignment-actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ProjectMemberWithUser = Awaited<ReturnType<typeof getProjectMembers>>[number];

// Matches an in-progress "@query" mention trigger at the end of a string
// (must be preceded by start-of-string or whitespace, no spaces in the query).
const MENTION_TRIGGER_RE = /(?:^|\s)@(\w*)$/;
// Matches complete "@token" occurrences for display highlighting.
const MENTION_TOKEN_RE = /(@[\w.-]+)/g;

/** Wraps @token occurrences in rendered comment text with a subtle accent span. */
function formatCommentContent(content: string) {
  const parts = content.split(MENTION_TOKEN_RE);
  return parts.map((part, i) =>
    /^@[\w.-]+$/.test(part) ? (
      <span key={i} className="font-medium accent-color">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

interface CommentAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

interface CommentUser {
  id: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
}

interface Comment {
  id: string;
  content: string;
  isPrivate: boolean;
  createdAt: string;
  user: CommentUser;
  attachments: CommentAttachment[];
}

interface PendingAttachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export function TaskComments({
  nodeId,
  currentUserId,
  isReadOnly,
  onCountChange,
}: {
  nodeId: string;
  currentUserId: string;
  isReadOnly: boolean;
  onCountChange?: (count: number) => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [input, setInput] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  // @mentions: projectId is discovered from the comments fetch (this
  // component only receives nodeId as a prop), then used to lazily load
  // project members for the autocomplete the first time it's needed.
  const [projectId, setProjectId] = useState<string | null>(null);
  const [members, setMembers] = useState<ProjectMemberWithUser[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionedUserIds, setMentionedUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/comments?nodeId=${nodeId}`);
        const data = await res.json();
        setComments(data.comments || []);
        if (data.projectId) setProjectId(data.projectId);
        // Mark comments as read for this user when they view them
        markCommentsRead(nodeId).catch(() => {});
      } catch {
        setComments([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [nodeId]);

  useEffect(() => {
    if (!projectId) return;
    getProjectMembers(projectId)
      .then(setMembers)
      .catch(() => setMembers([]));
  }, [projectId]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  useEffect(() => {
    onCountChange?.(comments.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments.length]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      setPendingAttachments((prev) => [
        ...prev,
        { fileName: file.name, fileUrl: blob.url, fileType: file.type, fileSize: file.size },
      ]);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removePendingAttachment(index: number) {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSend() {
    if (!input.trim() && pendingAttachments.length === 0) return;
    const content = input.trim() || "(attachment)";
    setInput("");
    const attachments = [...pendingAttachments];
    setPendingAttachments([]);
    const mentionIds = Array.from(mentionedUserIds);
    setMentionedUserIds(new Set());
    setMentionQuery(null);

    startTransition(async () => {
      const result = await addComment({
        nodeId,
        content,
        isPrivate,
        attachments: attachments.length > 0 ? attachments : undefined,
        mentionedUserIds: mentionIds.length > 0 ? mentionIds : undefined,
      });
      if ("error" in result && result.error) {
        toast.error(result.error);
      } else if ("comment" in result && result.comment) {
        setComments((prev) => [
          ...prev,
          { ...result.comment, createdAt: new Date(result.comment.createdAt).toISOString() },
        ]);
      }
    });
  }

  // ── @mention autocomplete ────────────────────────────────────────────────

  const mentionCandidates: ProjectMemberWithUser[] =
    mentionQuery !== null
      ? members
          .filter((m) => m.userId !== currentUserId)
          .filter((m) => {
            const q = mentionQuery.toLowerCase();
            if (!q) return true;
            return (
              (m.user.name || "").toLowerCase().includes(q) ||
              (m.user.username || "").toLowerCase().includes(q) ||
              m.user.email.toLowerCase().includes(q)
            );
          })
          .slice(0, 6)
      : [];

  function handleCommentInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setInput(value);
    const cursor = e.target.selectionStart ?? value.length;
    const match = value.slice(0, cursor).match(MENTION_TRIGGER_RE);
    if (match) {
      setMentionQuery(match[1]);
      setMentionIndex(0);
    } else {
      setMentionQuery(null);
    }
  }

  function insertMention(member: ProjectMemberWithUser) {
    const el = commentInputRef.current;
    const cursor = el?.selectionStart ?? input.length;
    const uptoCursor = input.slice(0, cursor);
    const match = uptoCursor.match(MENTION_TRIGGER_RE);
    if (!match) return;

    const triggerStart = cursor - match[0].length + (match[0].startsWith(" ") ? 1 : 0);
    const token = member.user.username || member.user.name || member.user.email.split("@")[0];
    const mentionText = `@${token} `;
    const newValue = input.slice(0, triggerStart) + mentionText + input.slice(cursor);

    setInput(newValue);
    setMentionedUserIds((prev) => new Set(prev).add(member.user.id));
    setMentionQuery(null);

    requestAnimationFrame(() => {
      const pos = triggerStart + mentionText.length;
      el?.setSelectionRange(pos, pos);
      el?.focus();
    });
  }

  function handleDelete(commentId: string) {
    startTransition(async () => {
      const result = await deleteComment(commentId);
      if (result.error) {
        toast.error(result.error);
      } else {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        toast.success("Comment deleted");
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (mentionQuery !== null && mentionCandidates.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((i) => (i + 1) % mentionCandidates.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex((i) => (i - 1 + mentionCandidates.length) % mentionCandidates.length);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        insertMention(mentionCandidates[mentionIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setMentionQuery(null);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { month: "short", day: "numeric" }) +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const isImage = (type: string) => type.startsWith("image/");

  return (
    <div id="comments-section">
      <label className="text-eyebrow mb-2 block">
        Comments{!loading && comments.length > 0 ? ` (${comments.length})` : ""}
      </label>

      {/* Comments list */}
      <div className="max-h-64 space-y-3 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border-default)] border-t-[var(--accent)]" />
          </div>
        ) : comments.length === 0 ? (
          <p className="py-2 text-center text-xs text-dim">
            No comments yet
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={cn(
                "rounded-lg border px-3 py-2",
                comment.isPrivate
                  ? "border-[var(--violet-300)] bg-[var(--violet-100)]"
                  : "border-themed bg-page"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full accent-bg text-[10px] font-medium accent-color">
                    {comment.user.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={comment.user.imageUrl}
                        alt={comment.user.name || comment.user.email}
                        className="h-5 w-5 rounded-full object-cover"
                      />
                    ) : (
                      (comment.user.name || comment.user.email).charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-medium text-body">
                    {comment.user.name || comment.user.email}
                  </span>
                  {comment.isPrivate && (
                    <Lock className="h-3 w-3 text-[var(--violet-600)]" />
                  )}
                </div>
                {comment.user.id === currentUserId && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="rounded p-0.5 text-dim hover:text-[var(--danger)]"
                    aria-label="Delete comment"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs whitespace-pre-wrap break-words text-body">
                {formatCommentContent(comment.content)}
              </p>
              {/* Attachments */}
              {comment.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {comment.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded bg-card px-2 py-1 text-xs accent-color hover:underline"
                    >
                      {isImage(att.fileType) ? (
                        <ImageIcon className="h-3 w-3" />
                      ) : (
                        <FileText className="h-3 w-3" />
                      )}
                      {att.fileName}
                    </a>
                  ))}
                </div>
              )}
              <p className="mt-1 text-[10px] text-dim">{formatTime(comment.createdAt)}</p>
            </div>
          ))
        )}
        <div ref={commentsEndRef} />
      </div>

      {/* Input area */}
      {!isReadOnly && (
        <div className="mt-3 space-y-2">
          {/* Pending attachments */}
          {pendingAttachments.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {pendingAttachments.map((att, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 rounded bg-hover px-2 py-0.5 text-xs text-body"
                >
                  {isImage(att.fileType) ? (
                    <ImageIcon className="h-3 w-3" />
                  ) : (
                    <FileText className="h-3 w-3" />
                  )}
                  <span className="max-w-[100px] truncate">{att.fileName}</span>
                  <button onClick={() => removePendingAttachment(i)} className="text-dim hover:text-[var(--danger)]">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPrivate(!isPrivate)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                isPrivate
                  ? "bg-[var(--violet-200)] text-[var(--violet-600)]"
                  : "text-dim hover:bg-hover"
              )}
              title={isPrivate ? "Private comment" : "Public comment"}
              aria-label={isPrivate ? "Private comment" : "Public comment"}
            >
              <Lock className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex h-8 w-8 items-center justify-center rounded-md text-dim hover:bg-hover disabled:opacity-50"
              aria-label="Attach file"
            >
              <Paperclip className="h-3.5 w-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />

            <div className="relative flex-1">
              <input
                ref={commentInputRef}
                type="text"
                value={input}
                onChange={handleCommentInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Add a comment... (@ to mention)"
                disabled={isPending}
                className="w-full rounded-md border border-themed px-2.5 py-1.5 text-xs text-heading placeholder-[var(--text-muted)] bg-card focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] disabled:opacity-50"
                aria-label="Comment input"
              />

              {/* @mention autocomplete dropdown */}
              {mentionQuery !== null && mentionCandidates.length > 0 && (
                <div className="absolute bottom-full left-0 z-20 mb-1 w-56 overflow-hidden rounded-lg border border-themed bg-card shadow-lg">
                  {mentionCandidates.map((m, i) => (
                    <button
                      key={m.userId}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => insertMention(m)}
                      className={cn(
                        "flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs transition-colors",
                        i === mentionIndex ? "bg-hover" : "hover:bg-hover"
                      )}
                    >
                      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center overflow-hidden rounded-full accent-bg text-[9px] font-medium accent-color">
                        {m.user.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.user.imageUrl}
                            alt=""
                            className="h-5 w-5 rounded-full object-cover"
                          />
                        ) : (
                          (m.user.name || m.user.email).charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-body">
                          {m.user.name || m.user.email.split("@")[0]}
                        </p>
                        {m.user.username && (
                          <p className="truncate text-[10px] text-dim">@{m.user.username}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSend}
              disabled={isPending || (!input.trim() && pendingAttachments.length === 0)}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent)] text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
              aria-label="Send comment"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
