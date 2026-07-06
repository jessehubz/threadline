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
      <div className="flex items-center gap-1.5 rounded-xl border border-gray-200/80 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm dark:border-gray-700/80 dark:bg-gray-900/95">
        <Button onClick={onAddNode} size="sm" variant="ghost" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Task
        </Button>
        <div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />
        <Button onClick={onAddFolder} size="sm" variant="ghost" className="gap-1.5">
          <Folder className="h-4 w-4" />
          Folder
        </Button>
        <div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />
        <Button
          onClick={onToggleDeadlines}
          size="sm"
          variant="ghost"
          className={showDeadlines ? "text-brand-600" : ""}
        >
          <CalendarDays className="h-4 w-4" />
        </Button>
        <Button onClick={onToggleAI} size="sm" variant="ghost">
          <Sparkles className="h-4 w-4 text-purple-500" />
        </Button>
      </div>
    </div>
  );
}
