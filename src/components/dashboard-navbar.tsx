"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { NotificationDropdown } from "@/components/notification-dropdown";
import { SearchDropdown } from "@/components/search-dropdown";
import { UserButton } from "@clerk/nextjs";
import { AIChatPanel } from "@/components/ai-chat-panel";
import { cn } from "@/lib/utils";

// ─── Navigation Items ────────────────────────────────────────────────────────

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
        <rect x="3" y="3" width="6" height="6" rx="1.5" />
        <rect x="11" y="3" width="6" height="6" rx="1.5" />
        <rect x="3" y="11" width="6" height="6" rx="1.5" />
        <rect x="11" y="11" width="6" height="6" rx="1.5" />
      </svg>
    ),
  },
  {
    name: "Overview",
    href: "/overview",
    icon: (
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="4" y="2" width="12" height="16" rx="2" />
        <line x1="7" y1="6" x2="13" y2="6" strokeLinecap="round" />
        <line x1="7" y1="9.5" x2="13" y2="9.5" strokeLinecap="round" />
        <line x1="7" y1="13" x2="11" y2="13" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Tasks",
    href: "/my-tasks",
    icon: (
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="14" height="14" rx="2" />
        <line x1="3" y1="7" x2="17" y2="7" />
        <line x1="7" y1="3" x2="7" y2="7" />
        <polyline points="7,11 9,13 13,9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Messages",
    href: "/messages",
    icon: (
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 4h12a2 2 0 012 2v7a2 2 0 01-2 2H7l-4 3V6a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  { name: "divider", href: "", icon: null },
  {
    name: "Calendar",
    href: "/calendar",
    icon: (
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="4" width="14" height="13" rx="2" />
        <line x1="3" y1="8.5" x2="17" y2="8.5" />
        <line x1="7" y1="2" x2="7" y2="5" strokeLinecap="round" />
        <line x1="13" y1="2" x2="13" y2="5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: (
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="10" width="3" height="7" rx="0.5" />
        <rect x="8.5" y="6" width="3" height="11" rx="0.5" />
        <rect x="14" y="3" width="3" height="14" rx="0.5" />
      </svg>
    ),
  },
  {
    name: "Team",
    href: "/team",
    icon: (
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="7" cy="7" r="2.5" />
        <circle cx="13" cy="7" r="2.5" />
        <path d="M2 16c0-2.5 2-4 5-4s5 1.5 5 4" strokeLinecap="round" />
        <path d="M13 12c2.5 0 4.5 1.5 4.5 4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Friends",
    href: "/friends",
    icon: (
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="8" cy="7" r="3" />
        <path d="M2 17c0-3 2.5-5 6-5s6 2 6 5" strokeLinecap="round" />
        <line x1="16" y1="6" x2="16" y2="12" strokeLinecap="round" />
        <line x1="13" y1="9" x2="19" y2="9" strokeLinecap="round" />
      </svg>
    ),
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function DashboardNavbar() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [aiChatOpen, setAiChatOpen] = useState(false);

  return (
    <>
      <nav
        className="flex flex-col"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-xl, 28px)",
          padding: "16px 20px",
          boxShadow: "var(--shadow-sm)",
          gap: "14px",
          marginBottom: "26px",
        }}
      >
        {/* ─── Row 1: Brand + Utilities ─────────────────────────────────── */}
        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link href="/dashboard" className="flex items-center gap-0 select-none hover:opacity-80 transition-opacity duration-150">
            <span
              className="text-[18px] font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Thread
            </span>
            <span
              className="text-[18px] font-bold tracking-tight"
              style={{ color: "var(--accent)" }}
            >
              line
            </span>
          </Link>

          {/* Utility group */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <SearchDropdown />

            {/* Message icon button with notification dot */}
            <Link
              href="/messages"
              className="relative flex items-center justify-center w-[38px] h-[38px] rounded-full text-[var(--text-secondary)] transition-all duration-[180ms] ease-in-out hover:bg-[rgba(139,92,246,0.08)] hover:text-[var(--text-primary)] hover:-translate-y-px"
              aria-label="Messages"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4h12a2 2 0 012 2v7a2 2 0 01-2 2H7l-4 3V6a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {/* Notification dot */}
              <span
                className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
                style={{ background: "var(--accent)" }}
              />
            </Link>

            {/* Notification bell */}
            <NotificationDropdown />

            {/* AI Sparkle button */}
            <button
              onClick={() => setAiChatOpen(true)}
              className="relative flex items-center justify-center w-[38px] h-[38px] rounded-full text-[var(--text-secondary)] transition-all duration-[180ms] ease-in-out hover:bg-[rgba(139,92,246,0.08)] hover:text-[var(--text-primary)] hover:-translate-y-px hover:shadow-[0_0_12px_rgba(139,92,246,0.3)]"
              aria-label="AI Assistant"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 13l0.75 2.25L18 16l-2.25 0.75L15 19l-0.75-2.25L12 16l2.25-0.75L15 13z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Theme switch */}
            <div
              className="flex items-center"
              style={{
                background: "var(--bg-base)",
                borderRadius: "999px",
                padding: "3px",
              }}
            >
              {/* Light mode button */}
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "flex items-center justify-center w-[30px] h-[30px] rounded-full transition-all duration-[180ms] ease-in-out",
                  resolvedTheme === "light"
                    ? "text-white"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
                style={{
                  background: resolvedTheme === "light" ? "var(--accent)" : "transparent",
                }}
                aria-label="Light mode"
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="10" cy="10" r="4" />
                  <line x1="10" y1="1" x2="10" y2="3" strokeLinecap="round" />
                  <line x1="10" y1="17" x2="10" y2="19" strokeLinecap="round" />
                  <line x1="1" y1="10" x2="3" y2="10" strokeLinecap="round" />
                  <line x1="17" y1="10" x2="19" y2="10" strokeLinecap="round" />
                  <line x1="3.9" y1="3.9" x2="5.3" y2="5.3" strokeLinecap="round" />
                  <line x1="14.7" y1="14.7" x2="16.1" y2="16.1" strokeLinecap="round" />
                  <line x1="3.9" y1="16.1" x2="5.3" y2="14.7" strokeLinecap="round" />
                  <line x1="14.7" y1="5.3" x2="16.1" y2="3.9" strokeLinecap="round" />
                </svg>
              </button>

              {/* Dark mode button */}
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex items-center justify-center w-[30px] h-[30px] rounded-full transition-all duration-[180ms] ease-in-out",
                  resolvedTheme === "dark"
                    ? "text-white"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
                style={{
                  background: resolvedTheme === "dark" ? "var(--accent)" : "transparent",
                }}
                aria-label="Dark mode"
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M17 12.5A7.5 7.5 0 017.5 3 7.5 7.5 0 1017 12.5z" />
                </svg>
              </button>
            </div>

            {/* Divider */}
            <div
              className="mx-1"
              style={{
                width: "1px",
                height: "22px",
                background: "var(--border-default)",
              }}
            />

            {/* User avatar (Clerk UserButton) */}
            <div className="flex items-center gap-1">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-[34px] w-[34px]",
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* ─── Row 2: Navigation Pills ──────────────────────────────────── */}
        <div
          className="hidden sm:block"
          style={{
            borderTop: "1px solid var(--border-default)",
            paddingTop: "14px",
          }}
        >
          <div
            className="flex overflow-x-auto"
            style={{
              background: "var(--bg-base)",
              borderRadius: "999px",
              padding: "4px",
            }}
          >
            {navItems.map((item, idx) => {
              if (item.name === "divider") {
                return (
                  <div
                    key={`divider-${idx}`}
                    className="flex-shrink-0 self-center mx-1"
                    style={{
                      width: "1px",
                      height: "22px",
                      background: "var(--border-default)",
                    }}
                  />
                );
              }

              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 transition-all duration-[180ms] ease-in-out",
                    !isActive && "hover:text-[var(--text-primary)] hover:bg-[rgba(139,92,246,0.08)]"
                  )}
                  style={{
                    padding: "8px 15px",
                    borderRadius: "999px",
                    fontSize: "13.5px",
                    fontWeight: 500,
                    color: isActive ? "#fff" : "var(--text-secondary)",
                    background: isActive ? "var(--accent)" : "transparent",
                  }}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* AI Chat Panel */}
      <AIChatPanel open={aiChatOpen} onClose={() => setAiChatOpen(false)} />
    </>
  );
}
