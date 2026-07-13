"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  MessageSquare,
  Calendar,
  BarChart3,
  Users,
  UserPlus,
  Settings,
  User,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const primaryNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Overview", href: "/overview", icon: ClipboardList },
  { name: "Tasks", href: "/my-tasks", icon: CalendarDays },
  { name: "Messages", href: "/messages", icon: MessageSquare },
];

const secondaryNavItems = [
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Team", href: "/team", icon: Users },
  { name: "Friends", href: "/friends", icon: UserPlus },
];

const bottomNavItems = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Auto-collapse on medium breakpoints (768–1024px)
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setCollapsed(false);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen border-r sticky top-0 transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-60"
      )}
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-default)",
      }}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-14 border-b px-4 flex-shrink-0",
          collapsed && "justify-center px-0"
        )}
        style={{ borderColor: "var(--border-default)" }}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-0 transition-opacity duration-150 hover:opacity-80"
        >
          {collapsed ? (
            <span className="text-[18px] font-bold tracking-tight accent-color font-logo">
              T
            </span>
          ) : (
            <>
              <span className="text-[18px] font-bold tracking-tight text-heading font-logo">
                Thread
              </span>
              <span className="text-[18px] font-bold tracking-tight accent-color font-logo">
                line
              </span>
            </>
          )}
        </Link>
      </div>

      {/* Primary Nav */}
      <nav className="flex-1 overflow-y-auto px-2 pt-4">
        <div className="space-y-0.5">
          {!collapsed && (
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-dim">
              Workspace
            </p>
          )}
          {primaryNavItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
            />
          ))}
        </div>

        <div
          className="my-3 mx-2 border-t"
          style={{ borderColor: "var(--border-subtle)" }}
        />

        <div className="space-y-0.5">
          {!collapsed && (
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-dim">
              Explore
            </p>
          )}
          {secondaryNavItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
            />
          ))}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="flex-shrink-0 border-t px-2 py-3" style={{ borderColor: "var(--border-default)" }}>
        <div className="space-y-0.5">
          {bottomNavItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
            />
          ))}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "mt-2 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200",
            "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
          ) : (
            <>
              <ChevronsLeft className="h-4 w-4 transition-transform duration-200" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

function NavItem({
  item,
  pathname,
  collapsed,
}: {
  item: { name: string; href: string; icon: React.ComponentType<{ className?: string }> };
  pathname: string;
  collapsed: boolean;
}) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      title={collapsed ? item.name : undefined}
      className={cn(
        "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 group",
        collapsed && "justify-center px-0",
        isActive
          ? "font-semibold"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] hover:scale-[1.01]"
      )}
      style={
        isActive
          ? {
              backgroundColor: "var(--accent-soft)",
              color: "var(--accent)",
            }
          : undefined
      }
    >
      {/* Active indicator bar */}
      {isActive && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
          style={{ backgroundColor: "var(--accent)" }}
        />
      )}

      <item.icon
        className={cn(
          "h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-105",
          isActive ? "text-[var(--accent)]" : ""
        )}
      />

      {!collapsed && (
        <span className="truncate">{item.name}</span>
      )}
    </Link>
  );
}
