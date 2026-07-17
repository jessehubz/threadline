"use client";

import { Bell } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn, formatRelativeDate } from "@/lib/utils";
import { useUserChannel } from "@/hooks/use-user-channel";

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedProjectId?: string | null;
  relatedNodeId?: string | null;
}

const FRIEND_TYPES = new Set(["FRIEND_REQUEST", "FRIEND_ACCEPTED"]);

export function NotificationDropdown({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    function load() {
      fetchNotifications();
    }
    load();
  }, [fetchNotifications]);

  const markAllRead = useCallback(async () => {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // Subscribe to the shared private user channel for realtime notifications
  // and cross-page data refresh. The subscription itself is reference-counted
  // in useUserChannel since DashboardNavbar also binds to this channel.
  useUserChannel(userId, {
    "notification-new": (data) => {
      const notification = data as Notification;
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast(notification.message);
    },
    "data-refresh": () => {
      router.refresh();
    },
  });

  // Mark all as read when the dropdown closes (not while it's open), so
  // unread items stay visually distinct while the user is viewing them.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (wasOpenRef.current && !open && unreadCount > 0) {
      markAllRead();
    }
    wasOpenRef.current = open;
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

  function handleToggle() {
    const newOpen = !open;
    setOpen(newOpen);
    // Refetch when opening to get latest notifications
    if (newOpen) {
      fetchNotifications();
    }
  }

  function handleNotificationClick(notification: Notification) {
    setOpen(false);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );
    if (!notification.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
      fetch(`/api/notifications/${notification.id}/read`, { method: "POST" }).catch(() => {});
    }

    if (notification.relatedNodeId && notification.relatedProjectId) {
      router.push(`/graph/${notification.relatedProjectId}?nodeId=${notification.relatedNodeId}`);
    } else if (notification.relatedProjectId) {
      router.push(`/graph/${notification.relatedProjectId}`);
    } else if (FRIEND_TYPES.has(notification.type)) {
      router.push("/friends");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
        className="relative flex items-center justify-center w-[38px] h-[38px] rounded-full cursor-pointer text-[var(--text-secondary)] transition-[transform,background-color,color] duration-[180ms] ease-in-out hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)] hover:-translate-y-px"
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
        <div className="absolute right-0 top-full z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-2xl border border-themed-subtle bg-card shadow-xl animate-[scaleIn_170ms_var(--ease-out-strong)_both]">
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
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "block w-full text-left border-b border-themed-subtle px-4 py-3.5 last:border-0 cursor-pointer transition-[background-color,transform] active:scale-[0.98] hover:bg-[var(--accent-soft)]",
                    !notification.read && "accent-bg"
                  )}
                >
                  <p className="text-[13px] text-heading">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-[11px] text-dim">
                    {formatRelativeDate(notification.createdAt)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
