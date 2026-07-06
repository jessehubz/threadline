"use client";

import { X, CalendarDays, AlertCircle } from "lucide-react";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";

interface DeadlineTask {
  id: string;
  title: string;
  status: string;
  dueDate: Date | string | null;
}

interface DeadlinesPanelProps {
  tasks: DeadlineTask[];
  onSelectNode: (nodeId: string) => void;
  onClose: () => void;
}

export function DeadlinesPanel({ tasks, onSelectNode, onClose }: DeadlinesPanelProps) {
  const now = new Date();
  const tasksWithDates = tasks
    .filter((t) => t.dueDate && t.status !== "COMPLETE")
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  const overdue = tasksWithDates.filter((t) => new Date(t.dueDate!) < now);
  const upcoming = tasksWithDates.filter((t) => new Date(t.dueDate!) >= now);

  return (
    <div className="absolute left-4 top-16 z-10 w-72 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-brand-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Deadlines</h3>
        </div>
        <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto p-2">
        {tasksWithDates.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-gray-500">No upcoming deadlines</p>
        ) : (
          <>
            {overdue.length > 0 && (
              <div className="mb-2">
                <p className="px-2 py-1 text-[10px] font-semibold uppercase text-red-500">
                  <AlertCircle className="mr-1 inline h-3 w-3" />Overdue
                </p>
                {overdue.map((task) => (
                  <TaskRow key={task.id} task={task} onSelect={onSelectNode} isOverdue />
                ))}
              </div>
            )}
            {upcoming.length > 0 && (
              <div>
                <p className="px-2 py-1 text-[10px] font-semibold uppercase text-gray-500">Upcoming</p>
                {upcoming.map((task) => (
                  <TaskRow key={task.id} task={task} onSelect={onSelectNode} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TaskRow({ task, onSelect, isOverdue }: { task: DeadlineTask; onSelect: (id: string) => void; isOverdue?: boolean }) {
  return (
    <button
      onClick={() => onSelect(task.id)}
      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-gray-900 dark:text-white">{task.title}</p>
        <p className={`text-[10px] ${isOverdue ? "text-red-500" : "text-gray-500"}`}>
          {formatDate(task.dueDate!)}
        </p>
      </div>
      <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${getStatusColor(task.status)}`}>
        {getStatusLabel(task.status)}
      </span>
    </button>
  );
}
