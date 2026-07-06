"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";
import { AlertCircle, Clock, Calendar } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  projectId: string;
  projectName: string;
  graphId: string;
}

export function MyTasksList({ tasks }: { tasks: Task[] }) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < today && t.status !== "COMPLETE");
  const dueToday = tasks.filter((t) => t.dueDate && new Date(t.dueDate).toDateString() === today.toDateString() && t.status !== "COMPLETE");
  const upcoming = tasks.filter((t) => t.dueDate && new Date(t.dueDate) > today && new Date(t.dueDate) <= nextWeek && t.status !== "COMPLETE");
  const later = tasks.filter((t) => (t.dueDate && new Date(t.dueDate) > nextWeek && t.status !== "COMPLETE") || (!t.dueDate && t.status !== "COMPLETE"));
  const completed = tasks.filter((t) => t.status === "COMPLETE");

  return (
    <div className="space-y-6">
      {overdue.length > 0 && (
        <TaskGroup title="Overdue" icon={<AlertCircle className="h-4 w-4 text-red-500" />} tasks={overdue} variant="danger" />
      )}
      {dueToday.length > 0 && (
        <TaskGroup title="Due Today" icon={<Clock className="h-4 w-4 text-amber-500" />} tasks={dueToday} variant="warning" />
      )}
      {upcoming.length > 0 && (
        <TaskGroup title="Upcoming (7 days)" icon={<Calendar className="h-4 w-4 text-blue-500" />} tasks={upcoming} variant="info" />
      )}
      {later.length > 0 && (
        <TaskGroup title="Later" icon={<Calendar className="h-4 w-4 text-gray-400" />} tasks={later} variant="default" />
      )}
      {completed.length > 0 && (
        <TaskGroup title="Completed" icon={<Calendar className="h-4 w-4 text-green-500" />} tasks={completed} variant="success" />
      )}
    </div>
  );
}

function TaskGroup({ title, icon, tasks, variant }: { title: string; icon: React.ReactNode; tasks: Task[]; variant: "danger" | "warning" | "info" | "default" | "success" }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
        <Badge variant={variant}>{tasks.length}</Badge>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <Link
            key={task.id}
            href={`/graph/${task.projectId}?nodeId=${task.id}`}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
              <p className="text-xs text-gray-500">{task.projectName}</p>
            </div>
            <div className="flex items-center gap-2 ml-3">
              {task.dueDate && (
                <span className="text-xs text-gray-500">{formatDate(task.dueDate)}</span>
              )}
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusColor(task.status)}`}>
                {getStatusLabel(task.status)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
