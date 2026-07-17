"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Ensure we only portal on the client
  useEffect(() => {
    function run() {
      setPortalContainer(document.body);
    }
    run();
  }, []);

  useEffect(() => {
    function run() {
      if (open) {
        setMounted(true);
        if (closeTimerRef.current) {
          clearTimeout(closeTimerRef.current);
          closeTimerRef.current = null;
        }
        // EXIT is faster than enter; enter waits a frame so the panel mounts
        // at its initial (closed) state before transitioning to open.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setShow(true);
          });
        });
      } else if (mounted) {
        setShow(false);
        closeTimerRef.current = setTimeout(() => {
          setMounted(false);
        }, 140);
      }
    }
    run();
  }, [open, mounted]);

  // Lock body scroll
  useEffect(() => {
    if (mounted) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mounted]);

  // Escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (mounted) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mounted, onClose]);

  // Focus trap: focus the first focusable element (or the panel itself) on
  // open, cycle Tab/Shift+Tab within the panel, and restore focus to the
  // previously-focused element on close.
  useEffect(() => {
    if (!mounted) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    const focusFirst = () => {
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        panel.focus();
      }
    };
    // Wait a tick so the panel is in the DOM (and any autofocus targets exist).
    const raf = requestAnimationFrame(focusFirst);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab" || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !panel.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [mounted]);

  if (!mounted || !portalContainer) return null;

  const dialogContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ isolation: "isolate" }}
    >
      {/* Overlay - solid dark scrim, NO blur */}
      <div
        className={cn(
          "fixed inset-0 transition-opacity ease-(--ease-out-strong)",
          show ? "opacity-100 duration-[180ms]" : "opacity-0 duration-[140ms]"
        )}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Dialog panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full max-w-lg p-6 origin-center transition-[opacity,transform] ease-(--ease-out-strong) focus:outline-none",
          show
            ? "opacity-100 scale-100 duration-[190ms]"
            : "opacity-0 scale-[0.98] duration-[140ms]",
          className
        )}
        style={{
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-default)",
          backgroundColor: "var(--bg-elevated)",
          boxShadow: "var(--elevation-4, var(--shadow-md))",
        }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[16px] font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-[background-color,transform] duration-150 hover:bg-[var(--bg-muted)] hover:scale-105"
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

  return createPortal(dialogContent, portalContainer);
}
