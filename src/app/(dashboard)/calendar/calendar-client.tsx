"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  status: string;
  dueDate: string;
  projectName: string;
}

const STATUS_DOT_COLORS: Record<string, string> = {
  NOT_STARTED: "bg-surface-400",
  IN_PROGRESS: "bg-blue-500",
  BLOCKED: "bg-red-500",
  AWAITING_APPROVAL: "bg-amber-500",
  REJECTED: "bg-orange-500",
  COMPLETE: "bg-green-500",
};

const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  BLOCKED: "Blocked",
  AWAITING_APPROVAL: "Awaiting Approval",
  REJECTED: "Rejected",
  COMPLETE: "Complete",
};

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarGrid({ tasks }: { tasks: Task[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (number | null)[] = [];

    // Leading empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Day numbers
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }

    return days;
  }, [year, month]);

  // Group tasks by date string (YYYY-MM-DD)
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((task) => {
      const dateKey = task.dueDate.slice(0, 10);
      const existing = map.get(dateKey) || [];
      existing.push(task);
      map.set(dateKey, existing);
    });
    return map;
  }, [tasks]);

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  }

  function goToToday() {
    setCurrentDate(new Date());
    setSelectedDate(null);
  }

  function getDateKey(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const selectedTasks = selectedDate ? tasksByDate.get(selectedDate) || [] : [];

  const monthLabel = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-5">
      {/* Month navigation */}
      <div className="flex items-center justify-between rounded-2xl border border-surface-200/80 bg-white px-5 py-3.5 shadow-sm">
        <button
          onClick={prevMonth}
          className="rounded-xl p-1.5 text-surface-500 transition-colors hover:bg-surface-100800"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-surface-900">
            {monthLabel}
          </h2>
          <button
            onClick={goToToday}
            className="rounded-lg border border-surface-200 px-2.5 py-1 text-xs font-medium text-surface-600 transition-colors hover:bg-surface-50700800"
          >
            Today
          </button>
        </div>
        <button
          onClick={nextMonth}
          className="rounded-xl p-1.5 text-surface-500 transition-colors hover:bg-surface-100800"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-2xl border border-surface-200/80 bg-white shadow-sm">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-surface-100">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-surface-400500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-[80px] border-b border-r border-surface-100/80/80"
                />
              );
            }

            const dateKey = getDateKey(day);
            const dayTasks = tasksByDate.get(dateKey) || [];
            const isToday = dateKey === todayKey;
            const isSelected = dateKey === selectedDate;

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDate(dateKey === selectedDate ? null : dateKey)}
                className={cn(
                  "min-h-[80px] border-b border-r border-surface-100/80 p-1.5 text-left transition-all duration-150/80",
                  isSelected
                    ? "bg-brand-50/60950/30"
                    : "hover:bg-surface-50800/30",
                )}
                aria-label={`${monthLabel.split(" ")[0]} ${day}, ${dayTasks.length} tasks`}
              >
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-lg text-xs font-semibold",
                    isToday
                      ? "bg-brand-600 text-white"
                      : "text-surface-700300"
                  )}
                >
                  {day}
                </span>
                {/* Task indicators */}
                {dayTasks.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-0.5">
                    {dayTasks.slice(0, 3).map((task) => (
                      <span
                        key={task.id}
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          STATUS_DOT_COLORS[task.status] || "bg-surface-400"
                        )}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[10px] leading-none text-surface-500">
                        +{dayTasks.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected date detail */}
      {selectedDate && (
        <div className="rounded-2xl border border-surface-200/80 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-surface-900">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h3>
          {selectedTasks.length === 0 ? (
            <p className="mt-3 text-sm text-surface-400500">
              No tasks due on this date.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {selectedTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 rounded-xl border border-surface-100 px-4 py-2.5"
                >
                  <span
                    className={cn(
                      "h-2.5 w-2.5 flex-shrink-0 rounded-full",
                      STATUS_DOT_COLORS[task.status] || "bg-surface-400"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-surface-900">
                      {task.title}
                    </p>
                    <p className="text-xs text-surface-500">
                      {task.projectName} · {STATUS_LABELS[task.status] || task.status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
