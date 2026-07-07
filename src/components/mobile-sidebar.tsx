"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, LayoutDashboard, GitBranch, BarChart3, Users, Settings, User, CalendarDays, MessageSquare, Calendar, ClipboardList } from "lucide-react";
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

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-[280px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-5 border-b border-surface-100">
          <a href="/dashboard" className="flex items-center gap-0">
            <span className="text-[20px] font-bold tracking-tight text-[#1A1A1A]">thread</span>
            <span className="text-[20px] font-bold tracking-tight text-brand-600">line</span>
          </a>
          <button onClick={onClose} className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Workspace
          </p>
          {navigation.slice(0, 6).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13px] font-medium transition-all duration-100 mb-0.5",
                  isActive
                    ? "bg-surface-100 text-[#1A1A1A] font-semibold"
                    : "text-[#6B7280] hover:bg-surface-50 hover:text-[#1A1A1A]"
                )}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-brand-600" />}
                <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-brand-600" : "")} />
                {item.name}
              </Link>
            );
          })}

          <div className="my-3 mx-3 border-t border-surface-100" />

          <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Account
          </p>
          {navigation.slice(6).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13px] font-medium transition-all duration-100 mb-0.5",
                  isActive
                    ? "bg-surface-100 text-[#1A1A1A] font-semibold"
                    : "text-[#6B7280] hover:bg-surface-50 hover:text-[#1A1A1A]"
                )}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-brand-600" />}
                <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-brand-600" : "")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
