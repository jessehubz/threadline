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
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Tasks", href: "/my-tasks", icon: CalendarDays },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(272);
  const [isResizing, setIsResizing] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  // Drag to resize
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!isResizing) return;
      e.preventDefault();
      const newWidth = Math.max(68, Math.min(400, e.clientX));
      if (newWidth <= 100) {
        setCollapsed(true);
        setSidebarWidth(68);
      } else {
        setCollapsed(false);
        setSidebarWidth(newWidth);
      }
    }
    function handleMouseUp() {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.classList.remove("select-none");
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

  // Keyboard shortcut: Cmd+K to open search
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
    ? navigation.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : navigation;

  function handleSearchNavigate(href: string) {
    router.push(href);
    setSearchOpen(false);
    setSearchQuery("");
  }

  return (
    <aside
      ref={sidebarRef}
      style={{ width: collapsed ? 68 : sidebarWidth }}
      className="relative hidden flex-shrink-0 flex-col border-r border-surface-200/60 bg-white transition-[width] duration-200 ease-in-out lg:flex"
    >
      {/* Drag handle */}
      <div
        onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
        className={cn(
          "absolute right-0 top-0 bottom-0 w-[5px] cursor-col-resize z-20 transition-colors",
          isResizing ? "bg-brand-500/30" : "hover:bg-brand-500/20"
        )}
      />
      {/* Workspace switcher */}
      <div className={cn("flex h-16 items-center border-b border-surface-100", collapsed ? "justify-center px-2" : "gap-3 px-5")}>
        {collapsed ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 flex-shrink-0">
            <GitBranch className="h-4 w-4 text-white" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <span className="text-lg font-bold tracking-tight text-[#1A1A1A]">thread</span>
              <span className="text-lg font-bold tracking-tight text-brand-600">line</span>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="rounded-lg p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </>
        )}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="absolute left-[72px] top-4 z-10 rounded-lg border border-surface-200 bg-white p-1 text-surface-400 shadow-sm hover:bg-surface-50 hover:text-surface-600 transition-colors"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50); }}
            className="flex w-full items-center gap-2.5 rounded-xl border border-surface-200/80 bg-surface-50/80 px-3 py-2 text-surface-400 transition-colors hover:border-surface-300 hover:bg-surface-100"
          >
            <Search className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1 text-left text-[13px]">Quick find...</span>
            <kbd className="rounded-md border border-surface-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-surface-400 shadow-sm">⌘K</kbd>
          </button>
        </div>
      )}
      {collapsed && (
        <div className="flex justify-center pt-4 pb-2">
          <button
            onClick={() => { setCollapsed(false); setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 100); }}
            className="rounded-xl p-2 text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors"
            aria-label="Search"
          >
            <Search className="h-4.5 w-4.5" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pt-3">
        {!collapsed && (
          <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
            Workspace
          </p>
        )}
        {navigation.slice(0, 5).map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={cn(
                "group relative flex items-center rounded-xl transition-all duration-150",
                collapsed ? "justify-center px-2 py-2.5 mx-auto" : "gap-3 px-3 py-2 text-[13px] font-medium",
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-surface-600 hover:bg-surface-50 hover:text-surface-900"
              )}
            >
              {isActive && !collapsed && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-brand-600" />}
              <item.icon className={cn("flex-shrink-0", collapsed ? "h-5 w-5" : "h-[18px] w-[18px]", isActive ? "text-brand-600" : "text-surface-400 group-hover:text-surface-500")} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                </>
              )}
            </Link>
          );
        })}

        <div className="my-4" />

        {!collapsed && (
          <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
            Account
          </p>
        )}
        {navigation.slice(5).map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={cn(
                "group relative flex items-center rounded-xl transition-all duration-150",
                collapsed ? "justify-center px-2 py-2.5 mx-auto" : "gap-3 px-3 py-2 text-[13px] font-medium",
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-surface-600 hover:bg-surface-50 hover:text-surface-900"
              )}
            >
              {isActive && !collapsed && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-brand-600" />}
              <item.icon className={cn("flex-shrink-0", collapsed ? "h-5 w-5" : "h-[18px] w-[18px]", isActive ? "text-brand-600" : "text-surface-400 group-hover:text-surface-500")} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-surface-100 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-brand-100 flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-brand-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-surface-700 truncate">Free Plan</p>
            </div>
          </div>
        </div>
      )}

      {/* Resize overlay to prevent selection on main content */}
      {isResizing && (
        <div className="fixed inset-0 z-10 cursor-col-resize" />
      )}

      {/* Quick Find Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => { setSearchOpen(false); setSearchQuery(""); }} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-surface-200 bg-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-surface-100 px-4 py-3">
              <Search className="h-5 w-5 text-surface-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pages..."
                className="flex-1 bg-transparent text-sm text-[#1A1A1A] placeholder-surface-400 outline-none"
                autoFocus
              />
              <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="rounded-lg p-1 text-surface-400 hover:bg-surface-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto py-2">
              {filteredNav.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-[#6B7280]">No results found</p>
              ) : (
                filteredNav.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleSearchNavigate(item.href)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
                  >
                    <item.icon className="h-4.5 w-4.5 text-surface-400" />
                    <span className="font-medium">{item.name}</span>
                    <span className="ml-auto text-xs text-surface-400">{item.href}</span>
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
