"use client";

import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Uses --danger tokens for the confirm action and icon accent. */
  destructive?: boolean;
  onConfirm: () => void;
  /** Called for cancel, backdrop click, Escape, and the close (X) button. */
  onCancel?: () => void;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Shared confirm overlay built on ui/dialog.tsx. Replaces the ad-hoc
 * confirm popups that used to duplicate Dialog's markup (and blurred their
 * backdrop, which the design language explicitly avoids).
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
  onOpenChange,
}: ConfirmDialogProps) {
  const close = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onClose={close} title={title} className="max-w-[380px] p-7">
      {description && (
        <p
          className="mb-6 text-[13.5px] leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {description}
        </p>
      )}
      <div className="flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={close}
          className="btn-secondary"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={cn(destructive ? "btn-danger" : "btn-primary")}
        >
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
