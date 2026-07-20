"use client";

/**
 * App sidebar — wordmark, full nav (all items shown directly), and a Projects
 * section. Pure navigation UI — no data logic beyond what's passed in.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreateProjectButton } from "@/components/create-project-button";
import { cn } from "@/lib/utils";

type SidebarProject = { id: string; name: string; open: number };

const NAV_ITEMS = [
  {
    name: "Dashboard", href: "/dashboard",
    icon: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" /></svg>,
  },
  {
    name: "My tasks", href: "/my-tasks",
    icon: <svg viewBox="0 0 24 24"><path d="M4 6.5h10M4 12h16M4 17.5h13" /><circle cx="19" cy="6.5" r="1.4" /></svg>,
  },
  {
    name: "Deadlines", href: "/deadlines",
    icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>,
  },
  {
    name: "Team", href: "/team",
    icon: <svg viewBox="0 0 24 24"><circle cx="9" cy="8.5" r="3.2" /><path d="M3.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6" /><circle cx="17" cy="9.5" r="2.5" /><path d="M16 14.7c2.3.2 4 1.6 4.5 4" /></svg>,
  },
  {
    name: "Messages", href: "/messages",
    icon: <svg viewBox="0 0 24 24"><path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H8l-5 4V5a1 1 0 0 1 1-1z" /></svg>,
  },
  {
    name: "Calendar", href: "/calendar",
    icon: <svg viewBox="0 0 24 24"><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /></svg>,
  },
  {
    name: "Overview", href: "/overview",
    icon: <svg viewBox="0 0 24 24"><path d="M4 20v-6M10 20V8M16 20v-9M22 20V4" /></svg>,
  },
  {
    name: "Analytics", href: "/analytics",
    icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" /><path d="M12 12V5.5M12 12l4.5 3.5" /></svg>,
  },
  {
    name: "Friends", href: "/friends",
    icon: <svg viewBox="0 0 24 24"><circle cx="10" cy="8" r="3.4" /><path d="M4 19.5c.7-3.6 3-5.4 6-5.4s5.3 1.8 6 5.4" /><path d="M18.5 8v6M15.5 11h6" /></svg>,
  },
  {
    name: "Trash", href: "/trash",
    icon: <svg viewBox="0 0 24 24"><path d="M4 6.5h16M9 6.5v-2h6v2M6 6.5l1 13.5h10l1-13.5" /></svg>,
  },
];

export function DashboardSidebar({
  projects,
}: {
  projects: SidebarProject[];
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="dash-sidebar">
      <Link href="/dashboard" className="dash-side-wordmark">threadline</Link>

      <nav className="dash-side-nav">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={isActive(item.href) ? "on" : undefined}>
            {item.icon}
            {item.name}
          </Link>
        ))}
      </nav>

      {projects.length > 0 && (
        <>
          <div className="dash-side-sec">
            Projects
            <CreateProjectButton trigger="+" />
          </div>
          <nav className="dash-side-nav">
            {projects.map((p) => (
              <Link key={p.id} href={`/graph/${p.id}`}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                {p.open > 0 && <span className="count">{p.open}</span>}
              </Link>
            ))}
          </nav>
        </>
      )}
    </aside>
  );
}
