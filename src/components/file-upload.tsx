"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, Image as ImageIcon, Download } from "lucide-react";
import { upload } from "@vercel/blob/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
}

interface FileUploadProps {
  nodeId: string;
  projectId: string;
  attachments: Attachment[];
  isReadOnly: boolean;
}

export function FileUpload({ nodeId, projectId, attachments, isReadOnly }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<Attachment[]>(attachments);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
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

      // Save to DB
      const res = await fetch("/api/attachments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeId,
          fileName: file.name,
          fileUrl: blob.url,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      if (res.ok) {
        const attachment = await res.json();
        setFiles((prev) => [...prev, attachment]);
        toast.success("File uploaded");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(attachmentId: string) {
    const res = await fetch(`/api/attachments/${attachmentId}`, { method: "DELETE" });
    if (res.ok) {
      setFiles((prev) => prev.filter((f) => f.id !== attachmentId));
      toast.success("File removed");
    }
  }

  const isImage = (type: string) => type.startsWith("image/");

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-2 rounded-lg border border-gray-200 p-2 dark:border-gray-700"
        >
          {isImage(file.fileType) ? (
            <ImageIcon className="h-4 w-4 text-brand-500" />
          ) : (
            <FileText className="h-4 w-4 text-gray-500" />
          )}
          <span className="flex-1 truncate text-xs text-gray-700 dark:text-gray-300">
            {file.fileName}
          </span>
          <a
            href={file.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-1 text-gray-400 hover:text-brand-600"
            aria-label="Download"
          >
            <Download className="h-3.5 w-3.5" />
          </a>
          {!isReadOnly && (
            <button
              onClick={() => handleDelete(file.id)}
              className="rounded p-1 text-gray-400 hover:text-red-600"
              aria-label="Remove"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ))}

      {!isReadOnly && (
        <label
          className={cn(
            "flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-3 text-sm text-gray-500 transition-colors hover:border-brand-500 hover:text-brand-600 dark:border-gray-700 dark:hover:border-brand-500",
            uploading && "pointer-events-none opacity-50"
          )}
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : "Upload file"}
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleUpload}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
        </label>
      )}
    </div>
  );
}
