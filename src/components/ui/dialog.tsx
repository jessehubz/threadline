"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  // mounted = present in DOM; show = CSS classes for visible state
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      // Mount immediately, then trigger enter on next frame
      setMounted(true);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setShow(true);
        });
      });
    } else if (mounted) {
      // Trigger exit, then unmount after transition
      setShow(false);
      closeTimerRef.current = setTimeout(() => {
        setMounted(false);
      }, 220);
    }
  }, [open]);

  // Lock body scroll
  useEffect(() => {
    if (mounted) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mounted]);

  // Escape key handler
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (mounted) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mounted, onClose]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ isolation: "isolate" }}
    >
      {/* Overlay — plain dim, NO blur, stays sharp/legible behind */}
      <div
        className={cn(
          "fixed inset-0 transition-opacity duration-[220ms] ease-out",
          show ? "opacity-100" : "opacity-0"
        )}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.35)" }}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Dialog panel — viewport-centered, scale 96%→100% + fade */}
      <div
        className={cn(
          "relative z-10 w-full max-w-lg p-6 transition-all duration-[220ms] ease-out",
          show
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-[0.96] translate-y-1",
          className
        )}
        style={{
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-default)",
          backgroundColor: "var(--bg-elevated)",
          boxShadow: "var(--shadow-md)",
        }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[16px] font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-all duration-150 hover:bg-[var(--bg-muted)]"
            style={{ color: "var(--text-muted)" }}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
