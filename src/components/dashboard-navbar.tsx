"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { NotificationDropdown } from "@/components/notification-dropdown";
import { SearchDropdown } from "@/components/search-dropdown";
import { UserButton } from "@clerk/nextjs";
import { AIChatPanel } from "@/components/ai-chat-panel";
import { useUserChannel } from "@/hooks/use-user-channel";
import { cn } from "@/lib/utils";

// ─── Navigation Items ────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "My tasks", href: "/my-tasks" },
  { name: "Deadlines", href: "/deadlines" },
  { name: "Team", href: "/team" },
  { name: "Messages", href: "/messages" },
  { name: "Calendar", href: "/calendar" },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface DashboardNavbarProps {
  userId: string;
  projects?: Array<{ id: string; name: string; open: number }>;
}

export function DashboardNavbar({ userId }: DashboardNavbarProps) {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  // Scroll-based compression
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 60);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch unread message count
  async function fetchUnreadCount() {
    try {
      const res = await fetch("/api/messages/unread-count");
      if (res.ok) {
        const data = await res.json();
        setUnreadMessageCount(data.count ?? 0);
      }
    } catch {
      // silently fail
    }
  }

  useEffect(() => { void fetchUnreadCount(); }, []);

  useUserChannel(userId, {
    "notification-new": (data) => {
      const notification = data as { type?: string };
      if (notification?.type === "NEW_MESSAGE") fetchUnreadCount();
    },
    "dm-read": () => fetchUnreadCount(),
  });

  useEffect(() => {
    window.addEventListener("focus", fetchUnreadCount);
    return () => window.removeEventListener("focus", fetchUnreadCount);
  }, []);

  // AI Chat panel listener
  useEffect(() => {
    const handleOpenAiChat = () => setAiChatOpen(true);
    window.addEventListener("open-ai-chat", handleOpenAiChat);
    (window as unknown as { __tlAssistantReady?: boolean }).__tlAssistantReady = true;
    return () => {
      window.removeEventListener("open-ai-chat", handleOpenAiChat);
      (window as unknown as { __tlAssistantReady?: boolean }).__tlAssistantReady = false;
    };
  }, []);

  return (
    <>
      {/* Pill navbar — fixed, centered, wide */}
      <div
        className={cn(
          "fixed top-4 left-0 right-0 z-[100] flex justify-center pointer-events-none transition-all duration-300",
          scrolled && "top-2"
        )}
      >
        <nav
          className={cn(
            "pointer-events-auto flex items-center gap-1 rounded-full",
            "border backdrop-blur-[20px] backdrop-saturate-[1.8]",
            "transition-all duration-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
            "w-[calc(100%-40px)]",
            "px-5 py-2.5",
            // Light
            "bg-white/80 border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.06)]",
            // Dark
            "dark:bg-[rgba(10,10,12,0.78)] dark:border-white/[0.08] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3),0_4px_24px_rgba(0,0,0,0.4)]",
            // Default: compact pill (wide enough to fit all items comfortably)
            !scrolled && "max-w-[1200px]",
            // Scrolled: expands to match dashboard content width
            scrolled && "max-w-[1492px] py-2 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_8px_40px_rgba(0,0,0,0.09)]",
            scrolled && "dark:shadow-[0_2px_8px_rgba(0,0,0,0.4),0_8px_40px_rgba(0,0,0,0.5)]"
          )}
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link
            href="/dashboard"
            className="text-[15px] font-bold tracking-[-0.03em] text-[var(--text-primary)] no-underline pr-6 shrink-0 hover:opacity-70 transition-opacity"
          >
            threadline
          </Link>

          {/* Separator */}
          <div className="w-px h-4 bg-black/10 dark:bg-white/10 shrink-0 mr-2" />

          {/* Nav links — sit right next to search */}
          <div className="flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-3 py-1.5 rounded-full",
                  "text-[13px] font-medium whitespace-nowrap no-underline",
                  "transition-all duration-150",
                  isActive(item.href)
                    ? "text-[var(--text-primary)] font-semibold bg-[var(--bg-muted)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]"
                )}
              >
                {item.name}
                {item.name === "Messages" && unreadMessageCount > 0 && (
                  <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                )}
              </Link>
            ))}
          </div>

          {/* Right actions — search + bell + avatar */}
          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            {/* Search */}
            <SearchDropdown className="hidden md:flex" />

            {/* Notifications */}
            <NotificationDropdown userId={userId} />

            {/* User avatar */}
            <div className="flex items-center ml-0.5">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-[32px] w-[32px]",
                    userButtonPopoverCard: {
                      backgroundColor: resolvedTheme === "dark" ? "#0A0A0A" : "#FFFFFF",
                      border: resolvedTheme === "dark" ? "1px solid rgba(255, 255, 255, 0.16)" : "1px solid rgba(0, 0, 0, 0.12)",
                      borderRadius: "20px",
                      boxShadow: resolvedTheme === "dark"
                        ? "0 2px 4px rgba(0,0,0,0.4), 0 8px 18px rgba(0,0,0,0.5)"
                        : "0 2px 4px rgba(0,0,0,0.08), 0 8px 18px rgba(0,0,0,0.12)",
                    },
                    userButtonPopoverActionButton: { borderRadius: "12px", transition: "all 180ms ease" },
                    userButtonPopoverActionButtonText: {
                      color: resolvedTheme === "dark" ? "#F5F5F7" : "#1D1D1F",
                      fontSize: "13.5px", fontWeight: "500",
                    },
                    userButtonPopoverActionButtonIcon: {
                      color: resolvedTheme === "dark" ? "#F5F5F7" : "#1D1D1F",
                      opacity: 0.8,
                    },
                    userButtonPopoverFooter: { display: "none" },
                  },
                  variables: {
                    colorBackground: resolvedTheme === "dark" ? "#0A0A0A" : "#FFFFFF",
                    colorForeground: resolvedTheme === "dark" ? "#F5F5F7" : "#1D1D1F",
                    colorMutedForeground: resolvedTheme === "dark" ? "#A1A1A6" : "#6E6E73",
                    colorNeutral: resolvedTheme === "dark" ? "white" : "black",
                    colorPrimary: "var(--accent)",
                    colorDanger: resolvedTheme === "dark" ? "#E5484D" : "#DC4C4C",
                    colorBorder: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.16)" : "rgba(0, 0, 0, 0.12)",
                    borderRadius: "20px",
                    fontFamily: "General Sans, Inter, ui-sans-serif, system-ui, sans-serif",
                  },
                }}
              />
            </div>
          </div>
        </nav>
      </div>

      {/* AI Chat Panel */}
      <AIChatPanel open={aiChatOpen} onClose={() => setAiChatOpen(false)} />
    </>
  );
}
