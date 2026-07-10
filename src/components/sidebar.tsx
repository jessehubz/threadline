"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  GitBranch,
  BarChart3,
  Users,
  Settings,
  User,
  CalendarDays,
  MessageSquare,
  Calendar,
  Search,
  X,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Overview", href: "/overview", icon: ClipboardList },
  { name: "My Tasks", href: "/my-tasks", icon: CalendarDays },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Profile", href: "/profile", icon: User },
];

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 64;
// Snap when sidebar is narrower than this (about 50px before text gets cut)
const SNAP_TO_COLLAPSE = 150;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(EXPANDED_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Drag to resize with snap
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!isResizing) return;
      e.preventDefault();
      const newWidth = e.clientX;

      if (newWidth <= SNAP_TO_COLLAPSE) {
        // Snap to collapsed
        setCollapsed(true);
        setSidebarWidth(COLLAPSED_WIDTH);
      } else {
        // Smoothly resize between snap threshold and max
        setCollapsed(false);
        setSidebarWidth(Math.min(400, Math.max(SNAP_TO_COLLAPSE, newWidth)));
      }
    }
    function handleMouseUp() {
      setIsResizing(false);
      document.body.classList.remove("select-none");
      document.body.style.cursor = "";
    }
    if (isResizing) {
      document.body.style.cursor = "col-resize";
      document.body.classList.add("select-none");
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // Cmd+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  const filteredNav = searchQuery
    ? navigation.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : navigation;

  function handleSearchNavigate(href: string) {
    router.push(href);
    setSearchOpen(false);
    setSearchQuery("");
  }

  const width = collapsed ? COLLAPSED_WIDTH : sidebarWidth;

  return (
    <aside
      style={{ width }}
      className={cn(
        "relative hidden flex-shrink-0 flex-col border-r lg:flex overflow-hidden bg-panel border-themed",
        !isResizing && "transition-[width] duration-200 ease-in-out"
      )}
    >
      {/* Drag handle */}
      <div
        onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
        className="absolute right-0 top-0 bottom-0 w-[6px] cursor-col-resize z-30 hover:bg-[var(--bg-muted)]/50 transition-colors"
      />

      {/* Logo */}
      <div className="flex h-16 items-center border-b border-themed px-5 flex-shrink-0">
        <a href="/dashboard" className="flex items-center gap-0 hover:opacity-80 transition-opacity">
          {collapsed ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] mx-auto">
              <GitBranch className="h-4.5 w-4.5 text-white" />
            </div>
          ) : (
            <>
              <span className="text-lg font-bold tracking-tight text-heading font-[var(--font-logo)]">Thread</span>
              <span className="text-lg font-bold tracking-tight accent-color">line</span>
            </>
          )}
        </a>
      </div>

      {/* Search - only when expanded */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-1 flex-shrink-0">
          <button
            onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50); }}
            className="flex w-full items-center gap-2 rounded-lg border bg-hover px-3 py-2 text-dim transition-colors hover:border-themed border-themed-subtle"
          >
            <Search className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="flex-1 text-left text-[12px]">Search...</span>
            <kbd className="text-[10px] text-dim font-medium bg-card border border-themed rounded px-1 py-0.5">⌘K</kbd>
          </button>
        </div>
      )}
      {collapsed && (
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <button
            onClick={() => { setCollapsed(false); setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 150); }}
            className="rounded-lg p-2 text-dim hover:bg-white/5 transition-colors"
            title="Search (⌘K)"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pt-2">
        {!collapsed && (
          <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-dim">
            Workspace
          </p>
        )}
        {navigation.slice(0, 6).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={cn(
                "relative flex items-center rounded-lg transition-all duration-150 ease-out mb-0.5",
                collapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2 text-[13px] font-medium",
                isActive
                  ? "bg-white/10 text-heading font-semibold"
                  : "text-body hover:bg-white/5 hover:text-heading"
              )}
            >
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full" style={{ backgroundColor: 'var(--accent)' }} />}
              <item.icon className={cn("flex-shrink-0", collapsed ? "h-[18px] w-[18px]" : "h-4 w-4", isActive ? "accent-color" : "")} />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}

        {!collapsed && <div className="my-3 mx-3 border-t border-themed" />}
        {collapsed && <div className="my-2" />}

        {!collapsed && (
          <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-dim">
            Account
          </p>
        )}
        {navigation.slice(6).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={cn(
                "relative flex items-center rounded-lg transition-all duration-150 ease-out mb-0.5",
                collapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2 text-[13px] font-medium",
                isActive
                  ? "bg-white/10 text-heading font-semibold"
                  : "text-body hover:bg-white/5 hover:text-heading"
              )}
            >
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full" style={{ backgroundColor: 'var(--accent)' }} />}
              <item.icon className={cn("flex-shrink-0", collapsed ? "h-[18px] w-[18px]" : "h-4 w-4", isActive ? "accent-color" : "")} />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle at bottom */}
      <div className="border-t border-themed px-3 py-2 flex-shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg p-2 text-dim hover:bg-white/5 hover:text-body transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M19 19l-7-7 7-7" /></svg>
          )}
        </button>
      </div>

      {/* Resize overlay */}
      {isResizing && <div className="fixed inset-0 z-10 cursor-col-resize" />}

      {/* Quick Find Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[18vh]">
          <div className="fixed inset-0 bg-black/15 backdrop-blur-sm" onClick={() => { setSearchOpen(false); setSearchQuery(""); }} />
          <div className="relative z-10 w-full max-w-md rounded-xl border bg-card border-themed shadow-2xl">
            <div className="flex items-center gap-3 border-b border-themed px-4 py-3">
              <Search className="h-4 w-4 text-dim" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pages..."
                className="flex-1 bg-transparent text-sm text-heading placeholder-[var(--text-secondary)] outline-none"
                autoFocus
              />
              <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="rounded-md p-1 text-dim hover:bg-white/5">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {filteredNav.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-dim">No results</p>
              ) : (
                filteredNav.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleSearchNavigate(item.href)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-body hover:bg-white/5 transition-colors"
                  >
                    <item.icon className="h-4 w-4 text-dim" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
