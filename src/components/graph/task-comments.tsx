"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Send, Trash2, Paperclip, Lock, Image as ImageIcon, FileText, X } from "lucide-react";
import { upload } from "@vercel/blob/client";
import { addComment, deleteComment } from "@/actions/comment-actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
}: {
  nodeId: string;
  currentUserId: string;
  isReadOnly: boolean;
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

  useEffect(() => {
    setLoading(true);
    fetch(`/api/comments?nodeId=${nodeId}`)
      .then((res) => res.json())
      .then((data) => setComments(data.comments || []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [nodeId]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

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

    startTransition(async () => {
      const result = await addComment({
        nodeId,
        content,
        isPrivate,
        attachments: attachments.length > 0 ? attachments : undefined,
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

  function handleKeyDown(e: React.KeyboardEvent) {
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
    <div>
      <label className="mb-2 block text-xs font-medium text-dim">
        Comments
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
                {comment.content}
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

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a comment..."
              disabled={isPending}
              className="flex-1 rounded-md border border-themed px-2.5 py-1.5 text-xs text-heading placeholder-[var(--text-muted)] bg-card focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] disabled:opacity-50"
              aria-label="Comment input"
            />

            <button
              onClick={handleSend}
              disabled={isPending || (!input.trim() && pendingAttachments.length === 0)}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent)] text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
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
