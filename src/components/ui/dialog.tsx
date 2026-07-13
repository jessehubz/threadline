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

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ensure we only portal on the client
  useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  useEffect(() => {
    if (open) {
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

  // Escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (mounted) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mounted, onClose]);

  if (!mounted || !portalContainer) return null;

  const dialogContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ isolation: "isolate" }}
    >
      {/* Overlay — solid dark scrim, NO blur */}
      <div
        className={cn(
          "fixed inset-0 transition-opacity duration-[220ms] ease-out",
          show ? "opacity-100" : "opacity-0"
        )}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Dialog panel */}
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
          boxShadow: "var(--elevation-4, var(--shadow-md))",
        }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[16px] font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-all duration-150 hover:bg-[var(--bg-muted)] hover:scale-105"
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
