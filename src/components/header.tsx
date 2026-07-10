"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Menu, Search, LayoutDashboard, CalendarDays, BarChart3, MessageSquare, ClipboardList, Users, UserPlus, Settings, Calendar } from "lucide-react";
import { NotificationDropdown } from "@/components/notification-dropdown";
import { ChatPopup } from "@/components/chat-popup";
import { useState } from "react";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Overview", href: "/overview", icon: ClipboardList },
  { name: "Tasks", href: "/my-tasks", icon: CalendarDays },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Team", href: "/team", icon: Users },
  { name: "Friends", href: "/friends", icon: UserPlus },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Header({ currentUserId }: { currentUserId: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <div className="flex items-center justify-center px-4 pt-4 pb-2 lg:px-6">
        {/* Floating pill navbar */}
        <nav className="flex w-full max-w-5xl items-center justify-between rounded-full border border-themed-subtle bg-[var(--bg-surface)] px-3 py-1.5 shadow-themed-md">
          {/* Left: Logo + Name */}
          <Link href="/dashboard" className="flex items-center gap-0 pl-2 hover:opacity-80 transition-opacity">
            <span className="text-[15px] font-bold tracking-tight text-heading font-[var(--font-logo)]">Thread</span>
            <span className="text-[15px] font-bold tracking-tight accent-color">line</span>
          </Link>

          {/* Center: Nav items as pills */}
          <div className="hidden items-center gap-0 overflow-x-auto scrollbar-hide md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2 py-1.5 lg:px-3.5 text-[12px] font-medium transition-all duration-150",
                    isActive
                      ? "bg-white/90 dark:bg-white/10 text-heading shadow-sm"
                      : "text-body hover:text-heading hover:bg-white/5"
                  )}
                >
                  <item.icon className={cn("h-3.5 w-3.5 shrink-0", isActive && "accent-color")} />
                  <span className="hidden lg:inline">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-1 pr-1">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-full p-2 text-body transition-colors hover:bg-white/5 hover:text-heading md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            <ChatPopup currentUserId={currentUserId} />
            <NotificationDropdown />
            <div className="ml-0.5 h-6 w-px bg-[var(--border-default)] opacity-50" />
            <div className="ml-1">
              <UserButton appearance={{ elements: { avatarBox: "h-7 w-7" } }} />
            </div>
          </div>
        </nav>
      </div>
      <MobileSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
