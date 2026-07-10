"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, getStatusDotColor } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  status: string;
  dueDate: string;
  projectName: string;
}

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
      <div className="panel-quiet flex items-center justify-between px-5 py-3.5">
        <button
          onClick={prevMonth}
          className="rounded-xl p-1.5 text-body transition-colors hover:bg-hover"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-heading">
            {monthLabel}
          </h2>
          <button
            onClick={goToToday}
            className="rounded-lg border border-themed px-2.5 py-1 text-xs font-medium text-body transition-colors hover:bg-hover"
          >
            Today
          </button>
        </div>
        <button
          onClick={nextMonth}
          className="rounded-xl p-1.5 text-body transition-colors hover:bg-hover"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-2xl border border-themed-subtle bg-card shadow-sm">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-themed">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="text-eyebrow px-2 py-2.5 text-center"
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
                  className="min-h-[80px] border-b border-r border-themed-subtle"
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
                  "min-h-[80px] border-b border-r border-themed-subtle p-1.5 text-left transition-all duration-150",
                  isSelected
                    ? "accent-bg"
                    : "hover:bg-hover",
                )}
                aria-label={`${monthLabel.split(" ")[0]} ${day}, ${dayTasks.length} tasks`}
              >
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-lg text-xs font-semibold",
                    isToday
                      ? "bg-[var(--accent)] text-white"
                      : "text-body"
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
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: getStatusDotColor(task.status) }}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[10px] leading-none text-body">
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
        <div className="panel-quiet p-5">
          <h3 className="text-sm font-semibold text-heading">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h3>
          {selectedTasks.length === 0 ? (
            <p className="mt-3 text-sm text-dim">
              No tasks due on this date.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-[var(--border-subtle)]">
              {selectedTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 px-1 py-2.5"
                >
                  <span
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: getStatusDotColor(task.status) }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-item-title">
                      {task.title}
                    </p>
                    <p className="text-meta">
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
