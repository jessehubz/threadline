"use client";

import { useEffect, useRef } from "react";
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
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ isolation: "isolate" }}
    >
      {/* Overlay — dimmed background */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] animate-[fadeIn_0.15s_ease-out]"
        onClick={onClose}
      />
      {/* Dialog panel — centered via parent flex, scale-in animation */}
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-2xl border border-themed-subtle bg-card p-6 shadow-2xl",
          "animate-[scaleIn_0.2s_ease-out]",
          className
        )}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[16px] font-semibold text-heading">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-dim transition-all duration-150 hover:bg-hover hover:text-body"
            aria-label="Close"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
