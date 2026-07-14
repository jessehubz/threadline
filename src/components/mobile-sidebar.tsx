"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { X, LayoutDashboard, BarChart3, Users, Settings, User, CalendarDays, MessageSquare, Calendar, ClipboardList, UserPlus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const primaryNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Overview", href: "/overview", icon: ClipboardList },
  { name: "My Tasks", href: "/my-tasks", icon: CalendarDays },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Team", href: "/team", icon: Users },
];

const secondaryNav = [
  { name: "Friends", href: "/friends", icon: UserPlus },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Profile", href: "/profile", icon: User },
];

const allNav = [...primaryNav, ...secondaryNav];

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  // Panel stays permanently mounted (just off-screen + invisible when closed) so the
  // slide transition has something to animate from - no mount-timing effect needed.
  function handleClose() {
    setQuery("");
    onClose();
  }

  const filteredNav = query
    ? allNav.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
    : null;

  return (
    <div
      className={cn("fixed inset-0 z-50 lg:hidden", !open && "pointer-events-none")}
      aria-hidden={!open}
      inert={!open}
    >
      {/* Dimmed backdrop - no blur, per design spec */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 transition-opacity duration-200 ease-out",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />
      <div
        className={cn(
          "fixed inset-y-0 left-0 flex w-[280px] max-w-[80vw] flex-col bg-card shadow-2xl transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-5 border-b border-themed-subtle">
          <a href="/dashboard" className="flex items-center gap-0">
            <span className="text-[20px] font-bold tracking-tight text-heading font-logo">Thread</span>
            <span className="text-[20px] font-bold tracking-tight accent-color font-logo">line</span>
          </a>
          <button onClick={handleClose} className="rounded-lg p-1.5 text-dim transition-transform duration-150 hover:scale-105 hover:bg-hover" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dim" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages..."
              className="input-field pl-9 text-[13px]"
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {filteredNav ? (
            filteredNav.length === 0 ? (
              <p className="px-3 py-6 text-center text-[13px] text-dim">No pages found</p>
            ) : (
              filteredNav.map((item) => <NavRow key={item.href} item={item} pathname={pathname} onClose={handleClose} />)
            )
          ) : (
            <>
              <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-dim">
                Workspace
              </p>
              {primaryNav.map((item) => <NavRow key={item.href} item={item} pathname={pathname} onClose={handleClose} />)}

              <div className="my-3 mx-3 border-t border-themed-subtle" />

              <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-dim">
                Account
              </p>
              {secondaryNav.map((item) => <NavRow key={item.href} item={item} pathname={pathname} onClose={handleClose} />)}
            </>
          )}
        </nav>
      </div>
    </div>
  );
}

function NavRow({
  item,
  pathname,
  onClose,
}: {
  item: { name: string; href: string; icon: React.ComponentType<{ className?: string }> };
  pathname: string;
  onClose: () => void;
}) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={cn(
        "relative flex items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13px] font-medium transition-all duration-150 mb-0.5",
        isActive
          ? "bg-hover text-heading font-semibold"
          : "text-body hover:bg-page hover:text-heading"
      )}
    >
      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[var(--accent)]" />}
      <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "accent-color" : "")} />
      {item.name}
    </Link>
  );
}
