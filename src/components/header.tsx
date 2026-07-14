"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Menu, LayoutDashboard, CalendarDays, BarChart3, MessageSquare, ClipboardList, Users, UserPlus, Settings, Calendar, User, MoreHorizontal } from "lucide-react";
import { NotificationDropdown } from "@/components/notification-dropdown";
import { ChatPopup } from "@/components/chat-popup";
import { SearchDropdown } from "@/components/search-dropdown";
import { useState } from "react";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { cn } from "@/lib/utils";

// Primary workflow nav - lives in the center pill (kept lean: max 4-5 items).
const primaryNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Overview", href: "/overview", icon: ClipboardList },
  { name: "Tasks", href: "/my-tasks", icon: CalendarDays },
  { name: "Messages", href: "/messages", icon: MessageSquare },
];

// Secondary nav - accessible via the "More" button or mobile sidebar.
const moreNavItems = [
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Team", href: "/team", icon: Users },
];

// Account nav - lives in the profile menu (and the mobile sidebar).
const secondaryNavItems = [
  { name: "Friends", href: "/friends", icon: UserPlus },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Profile", href: "/profile", icon: User },
];

export function Header({ currentUserId }: { currentUserId: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <div className="flex items-center justify-center px-4 pt-4 pb-2 lg:px-6">
        {/* Floating pill navbar */}
        <nav className="flex w-full max-w-5xl items-center gap-2 rounded-full border border-themed-subtle bg-[var(--bg-surface)] px-3 py-1.5 shadow-themed-md">
          {/* Left: Logo + Name */}
          <Link href="/dashboard" className="flex flex-shrink-0 items-center gap-0 pl-2 hover:opacity-80 transition-opacity">
            <span className="text-[15px] font-bold tracking-tight text-heading font-logo">Thread</span>
            <span className="text-[15px] font-bold tracking-tight accent-color font-logo">line</span>
          </Link>

          {/* Center: primary nav pills - icon-only from md, labels join at lg */}
          <div className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 md:flex">
            {primaryNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.name}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 lg:px-3.5 text-[12px] font-medium transition-all duration-150 hover:scale-[1.02]",
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
            {/* More dropdown for secondary nav */}
            <div className="relative">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                title="More"
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 lg:px-3.5 text-[12px] font-medium transition-all duration-150 hover:scale-[1.02]",
                  moreNavItems.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"))
                    ? "bg-white/90 dark:bg-white/10 text-heading shadow-sm"
                    : "text-body hover:text-heading hover:bg-white/5"
                )}
              >
                <MoreHorizontal className={cn("h-3.5 w-3.5 shrink-0", moreNavItems.some((item) => pathname === item.href) && "accent-color")} />
                <span className="hidden lg:inline">More</span>
              </button>
              {moreOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                  <div
                    className="absolute left-1/2 top-full z-50 mt-2 w-44 -translate-x-1/2 py-1.5 animate-[fadeInUp_0.15s_ease-out_both]"
                    style={{
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-default)",
                      backgroundColor: "var(--bg-elevated)",
                      boxShadow: "var(--shadow-md)",
                    }}
                  >
                    {moreNavItems.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMoreOpen(false)}
                          className={cn(
                            "flex w-full items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium transition-colors hover:bg-[var(--bg-muted)]",
                            isActive ? "text-[var(--accent)]" : "text-[var(--text-primary)]"
                          )}
                        >
                          <item.icon className="h-3.5 w-3.5" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right: utility icons */}
          <div className="flex flex-shrink-0 items-center gap-1 pr-1">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-full p-2 text-body transition-all duration-150 hover:scale-[1.05] hover:bg-white/5 hover:text-heading md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="hidden md:flex">
              <SearchDropdown />
            </div>

            <ChatPopup currentUserId={currentUserId} />
            <NotificationDropdown />
            <div className="ml-0.5 h-6 w-px bg-[var(--border-default)] opacity-50" />
            <div className="ml-1">
              <UserButton appearance={{ elements: { avatarBox: "h-7 w-7" } }}>
                <UserButton.MenuItems>
                  {secondaryNavItems.map((item) => (
                    <UserButton.Link key={item.href} label={item.name} href={item.href} labelIcon={<item.icon className="h-4 w-4" />} />
                  ))}
                </UserButton.MenuItems>
              </UserButton>
            </div>
          </div>
        </nav>
      </div>

      <MobileSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
