"use client";

import { Plus, Folder, CalendarDays, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GraphToolbarProps {
  onAddNode: () => void;
  onAddFolder: () => void;
  onToggleDeadlines: () => void;
  onToggleAI: () => void;
  showDeadlines: boolean;
}

export function GraphToolbar({ onAddNode, onAddFolder, onToggleDeadlines, onToggleAI, showDeadlines }: GraphToolbarProps) {
  return (
    <div className="absolute bottom-16 left-1/2 z-10 -translate-x-1/2 max-w-[calc(100%-2rem)]">
      <div className="flex items-center gap-1 sm:gap-1.5 rounded-2xl border border-themed-subtle bg-card/95 px-2.5 sm:px-4 py-2 sm:py-2.5 shadow-themed-md backdrop-blur-md">
        <Button onClick={onAddNode} size="sm" variant="ghost" className="gap-1 sm:gap-1.5 rounded-xl">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Task</span>
        </Button>
        <div className="h-5 w-px bg-[var(--border-default)]" />
        <Button onClick={onAddFolder} size="sm" variant="ghost" className="gap-1 sm:gap-1.5 rounded-xl">
          <Folder className="h-4 w-4" />
          <span className="hidden sm:inline">Folder</span>
        </Button>
        <div className="h-5 w-px bg-[var(--border-default)]" />
        <Button
          onClick={onToggleDeadlines}
          size="sm"
          variant="ghost"
          className={`rounded-xl ${showDeadlines ? "accent-color accent-bg" : ""}`}
        >
          <CalendarDays className="h-4 w-4" />
        </Button>
        <Button onClick={onToggleAI} size="sm" variant="ghost" className="rounded-xl">
          <Sparkles className="h-4 w-4 text-[var(--accent)]" />
        </Button>
      </div>
    </div>
  );
}
