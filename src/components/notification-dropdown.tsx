"use client";

import { Bell } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn, formatRelativeDate } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedProjectId?: string | null;
  relatedNodeId?: string | null;
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Silent fail
    }
  }, []);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // When dropdown opens, mark all as read
  useEffect(() => {
    if (open && unreadCount > 0) {
      markAllRead();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  function handleToggle() {
    const newOpen = !open;
    setOpen(newOpen);
    // Refetch when opening to get latest notifications
    if (newOpen) {
      fetchNotifications();
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
        className="relative flex items-center justify-center w-[38px] h-[38px] rounded-full cursor-pointer text-[var(--text-secondary)] transition-all duration-[180ms] ease-in-out hover:bg-[rgba(139,92,246,0.08)] hover:text-[var(--text-primary)] hover:-translate-y-px"
        aria-label="Notifications"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--danger)] text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-themed-subtle bg-card shadow-xl animate-[fadeInUp_0.15s_ease-out]">
          <div className="flex items-center justify-between border-b border-themed-subtle px-4 py-3">
            <h3 className="text-card-title">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium accent-color transition-colors hover:accent-color"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-dim">
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 20).map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "border-b border-themed-subtle px-4 py-3.5 last:border-0",
                    !notification.read && "accent-bg"
                  )}
                >
                  <p className="text-[13px] text-heading">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-[11px] text-dim">
                    {formatRelativeDate(notification.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
