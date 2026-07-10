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
    <div className="absolute bottom-16 left-1/2 z-10 -translate-x-1/2">
      <div className="flex items-center gap-1.5 rounded-2xl border border-themed-subtle bg-card/95 px-4 py-2.5 shadow-xl shadow-themed backdrop-blur-md/80/95">
        <Button onClick={onAddNode} size="sm" variant="ghost" className="gap-1.5 rounded-xl">
          <Plus className="h-4 w-4" />
          Task
        </Button>
        <div className="h-5 w-px bg-[var(--border-default)]" />
        <Button onClick={onAddFolder} size="sm" variant="ghost" className="gap-1.5 rounded-xl">
          <Folder className="h-4 w-4" />
          Folder
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
          <Sparkles className="h-4 w-4 text-purple-500" />
        </Button>
      </div>
    </div>
  );
}
