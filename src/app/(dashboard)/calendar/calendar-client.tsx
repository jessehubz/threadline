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
  NOT_STARTED: "bg-gray-400",
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
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
        <button
          onClick={prevMonth}
          className="rounded-md p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {monthLabel}
          </h2>
          <button
            onClick={goToToday}
            className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Today
          </button>
        </div>
        <button
          onClick={nextMonth}
          className="rounded-md p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400"
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
                  className="min-h-[80px] border-b border-r border-gray-100 dark:border-gray-800"
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
                  "min-h-[80px] border-b border-r border-gray-100 p-1 text-left transition-colors dark:border-gray-800",
                  isSelected
                    ? "bg-brand-50 dark:bg-brand-950"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                )}
                aria-label={`${monthLabel.split(" ")[0]} ${day}, ${dayTasks.length} tasks`}
              >
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                    isToday
                      ? "bg-brand-600 text-white"
                      : "text-gray-900 dark:text-gray-100"
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
                          STATUS_DOT_COLORS[task.status] || "bg-gray-400"
                        )}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[10px] leading-none text-gray-500">
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
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h3>
          {selectedTasks.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              No tasks due on this date.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {selectedTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 rounded-md border border-gray-100 px-3 py-2 dark:border-gray-800"
                >
                  <span
                    className={cn(
                      "h-2.5 w-2.5 flex-shrink-0 rounded-full",
                      STATUS_DOT_COLORS[task.status] || "bg-gray-400"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
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
