"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, LayoutDashboard, GitBranch, BarChart3, Users, Settings, User, CalendarDays, MessageSquare, Calendar } from "lucide-react";
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

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-[280px] bg-white shadow-2xl">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <GitBranch className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-surface-900">Threadline</span>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 text-surface-400 hover:bg-surface-100 hover:text-surface-600" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                  isActive
                    ? "bg-brand-50 text-brand-700 shadow-sm"
                    : "text-surface-600 hover:bg-surface-50 hover:text-surface-900"
                )}
              >
                <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-brand-600" : "text-surface-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
