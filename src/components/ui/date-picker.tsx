"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  format,
  addDays,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  isBefore,
  parseISO,
} from "date-fns";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

export function DatePicker({
  value,
  onChange,
  disabled = false,
  label,
  placeholder = "Select date...",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(() => {
    if (value) {
      try {
        return startOfMonth(parseISO(value));
      } catch {
        return startOfMonth(new Date());
      }
    }
    return startOfMonth(new Date());
  });
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const selectedDate = useMemo(() => {
    if (!value) return null;
    try {
      return parseISO(value);
    } catch {
      return null;
    }
  }, [value]);

  // Generate calendar days for the current view month
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(viewMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [viewMonth]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Reset view month when opening
  useEffect(() => {
    if (isOpen) {
      const base = selectedDate || new Date();
      setViewMonth(startOfMonth(base));
      setFocusedDate(selectedDate || new Date());
    }
  }, [isOpen, selectedDate]);

  const handleSelect = useCallback(
    (date: Date) => {
      const formatted = format(date, "yyyy-MM-dd");
      onChange(formatted);
      setIsOpen(false);
    },
    [onChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange("");
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || !focusedDate) return;

      switch (e.key) {
        case "ArrowLeft": {
          e.preventDefault();
          const prev = addDays(focusedDate, -1);
          setFocusedDate(prev);
          if (!isSameMonth(prev, viewMonth)) {
            setViewMonth(startOfMonth(prev));
          }
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          const next = addDays(focusedDate, 1);
          setFocusedDate(next);
          if (!isSameMonth(next, viewMonth)) {
            setViewMonth(startOfMonth(next));
          }
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const prevWeek = addDays(focusedDate, -7);
          setFocusedDate(prevWeek);
          if (!isSameMonth(prevWeek, viewMonth)) {
            setViewMonth(startOfMonth(prevWeek));
          }
          break;
        }
        case "ArrowDown": {
          e.preventDefault();
          const nextWeek = addDays(focusedDate, 7);
          setFocusedDate(nextWeek);
          if (!isSameMonth(nextWeek, viewMonth)) {
            setViewMonth(startOfMonth(nextWeek));
          }
          break;
        }
        case "Enter":
        case " ": {
          e.preventDefault();
          handleSelect(focusedDate);
          break;
        }
        case "Escape": {
          e.preventDefault();
          setIsOpen(false);
          break;
        }
      }
    },
    [isOpen, focusedDate, viewMonth, handleSelect]
  );

  const handleTriggerKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!disabled) setIsOpen(true);
      }
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    },
    [disabled, isOpen]
  );

  const shortcuts = useMemo(
    () => [
      { label: "Today", date: new Date() },
      { label: "Tomorrow", date: addDays(new Date(), 1) },
      { label: "Next Week", date: addDays(new Date(), 7) },
    ],
    []
  );

  const displayValue = selectedDate ? format(selectedDate, "MMM d, yyyy") : "";

  return (
    <div className="space-y-1.5" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-heading">{label}</label>
      )}

      {/* Trigger */}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleTriggerKeyDown}
          className={cn(
            "input-field flex w-full cursor-pointer items-center gap-2 text-left",
            disabled && "cursor-not-allowed opacity-50",
            !value && "text-[var(--text-muted)]"
          )}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <Calendar className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
          <span className="flex-1 truncate">
            {displayValue || placeholder}
          </span>
          {value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClear(e as unknown as React.MouseEvent);
                }
              }}
              className="rounded-full p-0.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]"
              aria-label="Clear date"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
        </button>

        {/* Dropdown */}
        <div
          className={cn(
            "absolute left-0 top-full z-50 mt-1.5 w-[300px] origin-top-left rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3 shadow-[var(--shadow-md)] transition-all duration-200 ease-out",
            isOpen
              ? "pointer-events-auto scale-100 opacity-100"
              : "pointer-events-none scale-95 opacity-0"
          )}
          role="dialog"
          aria-label="Date picker"
          onKeyDown={handleKeyDown}
        >
          {/* Quick shortcuts */}
          <div className="mb-3 flex gap-1.5">
            {shortcuts.map((shortcut) => (
              <button
                key={shortcut.label}
                type="button"
                onClick={() => handleSelect(shortcut.date)}
                className="rounded-md bg-[var(--bg-muted)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] transition-all duration-150 hover:-translate-y-px hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] hover:shadow-sm"
              >
                {shortcut.label}
              </button>
            ))}
          </div>

          {/* Month navigation */}
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth(subMonths(viewMonth, 1))}
              className="rounded-md p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {format(viewMonth, "MMMM yyyy")}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth(addMonths(viewMonth, 1))}
              className="rounded-md p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="mb-1 grid grid-cols-7 gap-0">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div
                key={day}
                className="py-1 text-center text-[11px] font-medium text-[var(--text-muted)]"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div
            ref={gridRef}
            className="grid grid-cols-7 gap-0"
            role="grid"
            aria-label="Calendar"
          >
            {calendarDays.map((day) => {
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
              const isFocused = focusedDate ? isSameDay(day, focusedDate) : false;
              const isCurrentMonth = isSameMonth(day, viewMonth);
              const isDayToday = isToday(day);
              const isPast = isBefore(day, new Date()) && !isDayToday;

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  tabIndex={isFocused ? 0 : -1}
                  onClick={() => handleSelect(day)}
                  className={cn(
                    "relative mx-auto flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-all duration-150",
                    // Base state
                    isCurrentMonth
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-muted)]",
                    // Past dates dimmed
                    isPast && isCurrentMonth && "opacity-60",
                    isPast && !isCurrentMonth && "opacity-40",
                    // Hover
                    !isSelected &&
                      "hover:-translate-y-px hover:bg-[var(--bg-muted)] hover:shadow-sm",
                    // Selected
                    isSelected &&
                      "bg-[var(--accent)] text-white shadow-sm",
                    // Today ring
                    isDayToday &&
                      !isSelected &&
                      "ring-1 ring-inset ring-[var(--accent)]",
                    // Focus outline
                    isFocused &&
                      !isSelected &&
                      "outline outline-2 outline-offset-1 outline-[var(--accent)]"
                  )}
                  aria-label={format(day, "EEEE, MMMM d, yyyy")}
                  aria-selected={isSelected}
                  role="gridcell"
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
