"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getStatusColor, getStatusDotColor, getStatusLabel, formatDate } from "@/lib/utils";
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
    <div className="space-y-8">
      {overdue.length > 0 && (
        <TaskGroup title="Overdue" icon={<AlertCircle className="h-4 w-4 text-[var(--danger)]" />} tasks={overdue} variant="danger" />
      )}
      {dueToday.length > 0 && (
        <TaskGroup title="Due Today" icon={<Clock className="h-4 w-4 accent-color" />} tasks={dueToday} variant="warning" />
      )}
      {upcoming.length > 0 && (
        <TaskGroup title="Upcoming (7 days)" icon={<Calendar className="h-4 w-4 accent-color" />} tasks={upcoming} variant="info" />
      )}
      {later.length > 0 && (
        <TaskGroup title="Later" icon={<Calendar className="h-4 w-4 text-dim" />} tasks={later} variant="default" />
      )}
      {completed.length > 0 && (
        <TaskGroup title="Completed" icon={<Calendar className="h-4 w-4 accent-color" />} tasks={completed} variant="success" />
      )}
    </div>
  );
}

function TaskGroup({ title, icon, tasks, variant }: { title: string; icon: React.ReactNode; tasks: Task[]; variant: "danger" | "warning" | "info" | "default" | "success" }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2.5">
        {icon}
        <h3 className="text-card-title">{title}</h3>
        <Badge variant={variant}>{tasks.length}</Badge>
      </div>
      <div className="space-y-0.5">
        {tasks.map((task) => (
          <Link
            key={task.id}
            href={`/graph/${task.projectId}?nodeId=${task.id}`}
            className="group flex items-center justify-between gap-3 rounded-lg border-l-[3px] px-3 py-2.5 transition-all duration-150 hover:translate-x-0.5 hover:bg-hover"
            style={{ borderLeftColor: getStatusDotColor(task.status) }}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-item-title transition-colors group-hover:accent-color">{task.title}</p>
              <p className="mt-0.5 text-meta">{task.projectName}</p>
            </div>
            <div className="ml-4 flex flex-shrink-0 items-center gap-3">
              {task.dueDate && (
                <span className="text-meta">{formatDate(task.dueDate)}</span>
              )}
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-medium ${getStatusColor(task.status)}`}>
                {getStatusLabel(task.status)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
