"use client";

import { useEffect, useRef, useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
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
  Folder,
} from "lucide-react";
import { searchWorkspace, type SearchPersonResult, type SearchProjectResult, type SearchTaskResult } from "@/actions/search-actions";
import { cn, getStatusDotColor } from "@/lib/utils";

// ─── Nav items (pages) ──────────────────────────────────────────────────────

const allNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Overview", href: "/overview", icon: ClipboardList },
  { name: "Tasks", href: "/my-tasks", icon: CalendarDays },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Team", href: "/team", icon: Users },
  { name: "Friends", href: "/friends", icon: UserPlus },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Profile", href: "/profile", icon: User },
];

// ─── Types ──────────────────────────────────────────────────────────────────

interface SearchResult {
  id: string;
  type: "project" | "task" | "person" | "page";
  label: string;
  sublabel?: string;
  href: string;
  imageUrl?: string | null;
  icon?: React.ComponentType<{ className?: string }>;
  statusColor?: string;
}

interface SearchDropdownProps {
  /** Additional class name for the wrapper */
  className?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function SearchDropdown({ className }: SearchDropdownProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [focused, setFocused] = useState(false);
  const [isPending, startTransition] = useTransition();

  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // ── Close ───────────────────────────────────────────────────────────────

  const closeDropdown = useCallback(() => {
    setFocused(false);
    setQuery("");
    setResults([]);
    setActiveIndex(-1);
    inputRef.current?.blur();
  }, []);

  // ── Global ⌘K shortcut ─────────────────────────────────────────────────

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── Click-away ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!focused) return;

    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [focused, closeDropdown]);

  // ── Debounced search ────────────────────────────────────────────────────

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim().toLowerCase();

    if (!trimmed) {
      debounceRef.current = setTimeout(() => {
        setResults([]);
        setActiveIndex(-1);
      }, 0);
      return;
    }

    debounceRef.current = setTimeout(() => {
      // Filter pages (client-side, instant)
      const pageResults: SearchResult[] = allNavItems
        .filter((item) => item.name.toLowerCase().includes(trimmed))
        .map((item) => ({
          id: `page-${item.href}`,
          type: "page" as const,
          label: item.name,
          href: item.href,
          icon: item.icon,
        }));

      // Search workspace: projects + tasks + people (single server action)
      startTransition(async () => {
        let projectResults: SearchResult[] = [];
        let taskResults: SearchResult[] = [];
        let peopleResults: SearchResult[] = [];
        try {
          const { people, projects, tasks } = await searchWorkspace(query.trim());
          projectResults = projects.map((p: SearchProjectResult) => ({
            id: `project-${p.id}`,
            type: "project" as const,
            label: p.name,
            href: `/graph/${p.id}`,
          }));
          taskResults = tasks.map((t: SearchTaskResult) => ({
            id: `task-${t.id}`,
            type: "task" as const,
            label: t.title,
            href: `/graph/${t.projectId}?nodeId=${t.id}`,
            statusColor: getStatusDotColor(t.status),
          }));
          peopleResults = people.map((p: SearchPersonResult) => ({
            id: `person-${p.id}`,
            type: "person" as const,
            label: p.name || p.email,
            sublabel: p.name ? p.email : undefined,
            href: `/profile/${p.id}`,
            imageUrl: p.imageUrl,
          }));
        } catch {
          // Silently fail on workspace search errors
        }

        setResults([...projectResults, ...taskResults, ...peopleResults, ...pageResults]);
        setActiveIndex(-1);
      });
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // ── Navigation ──────────────────────────────────────────────────────────

  function navigate(href: string) {
    router.push(href);
    closeDropdown();
  }

  // ── Keyboard handling ───────────────────────────────────────────────────

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeDropdown();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i < results.length - 1 ? i + 1 : 0));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : results.length - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        navigate(results[activeIndex].href);
      }
    }
  }

  // ── Group results by type ───────────────────────────────────────────────

  const projectsGroup = results.filter((r) => r.type === "project");
  const tasksGroup = results.filter((r) => r.type === "task");
  const peopleGroup = results.filter((r) => r.type === "person");
  const pagesGroup = results.filter((r) => r.type === "page");
  const hasQuery = query.trim().length > 0;
  const noResults = hasQuery && !isPending && results.length === 0;
  const flatResults = [...projectsGroup, ...tasksGroup, ...peopleGroup, ...pagesGroup];

  // Show dropdown when focused AND there's a query with content to show
  const showDropdown = focused && hasQuery;

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      {/* 
        The search bar itself - always visible, full width, inline. 
        Clicking focuses the same input in-place. No popup, no modal.
      */}
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-full transition-shadow duration-200",
          "border",
          focused && "ring-1 ring-[var(--accent)]"
        )}
        style={{
          borderColor: "var(--border-default)",
          color: "var(--text-muted)",
          backgroundColor: "var(--bg-base)",
          padding: "9px 16px",
        }}
      >
        <Search className="h-4 w-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          className="flex-1 min-w-0 bg-transparent text-[13.5px] outline-none placeholder:text-[var(--text-muted)]"
          style={{ color: "var(--text-primary)" }}
          aria-label="Search"
          title="Search (⌘K)"
        />
        <kbd
          className="hidden sm:inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium border"
          style={{
            borderColor: "var(--border-default)",
            color: "var(--text-muted)",
            backgroundColor: "var(--bg-elevated)",
          }}
        >
          ⌘K
        </kbd>
      </div>

      {/* 
        Suggestions dropdown - anchored directly beneath the search bar,
        matching its width. Think Safari address bar behavior.
      */}
      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 z-50 mt-1.5 origin-top overflow-hidden rounded-xl border animate-[scaleIn_170ms_var(--ease-out-strong)_both]"
          style={{
            borderColor: "var(--border-default)",
            backgroundColor: "var(--bg-elevated)",
            boxShadow: "var(--shadow-md)",
            maxHeight: "min(320px, calc(100vh - 120px))",
          }}
        >
          <div className="max-h-[320px] overflow-y-auto py-1">
            {/* No results */}
            {noResults && (
              <p
                className="px-4 py-6 text-center text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                No results for &ldquo;{query.trim()}&rdquo;
              </p>
            )}

            {/* Projects group */}
            {projectsGroup.length > 0 && (
              <div>
                <p
                  className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Projects
                </p>
                {projectsGroup.map((result) => {
                  const flatIdx = flatResults.indexOf(result);
                  return (
                    <button
                      key={result.id}
                      onClick={() => navigate(result.href)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors duration-150",
                        flatIdx === activeIndex
                          ? "bg-[var(--accent-soft)]"
                          : "hover:bg-[var(--accent-soft)]"
                      )}
                      style={{
                        color:
                          flatIdx === activeIndex
                            ? "var(--text-primary)"
                            : "var(--text-secondary)",
                      }}
                      onMouseEnter={() => setActiveIndex(flatIdx)}
                    >
                      <Folder className="h-4 w-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                      <span className="truncate font-medium text-[13px]">{result.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tasks group */}
            {tasksGroup.length > 0 && (
              <div>
                <p
                  className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Tasks
                </p>
                {tasksGroup.map((result) => {
                  const flatIdx = flatResults.indexOf(result);
                  return (
                    <button
                      key={result.id}
                      onClick={() => navigate(result.href)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors duration-150",
                        flatIdx === activeIndex
                          ? "bg-[var(--accent-soft)]"
                          : "hover:bg-[var(--accent-soft)]"
                      )}
                      style={{
                        color:
                          flatIdx === activeIndex
                            ? "var(--text-primary)"
                            : "var(--text-secondary)",
                      }}
                      onMouseEnter={() => setActiveIndex(flatIdx)}
                    >
                      <span
                        className="h-2 w-2 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: result.statusColor }}
                      />
                      <span className="truncate font-medium text-[13px]">{result.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* People group */}
            {peopleGroup.length > 0 && (
              <div>
                <p
                  className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  People
                </p>
                {peopleGroup.map((result) => {
                  const flatIdx = flatResults.indexOf(result);
                  return (
                    <button
                      key={result.id}
                      onClick={() => navigate(result.href)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors duration-150",
                        flatIdx === activeIndex
                          ? "bg-[var(--accent-soft)]"
                          : "hover:bg-[var(--accent-soft)]"
                      )}
                      style={{
                        color:
                          flatIdx === activeIndex
                            ? "var(--text-primary)"
                            : "var(--text-secondary)",
                      }}
                      onMouseEnter={() => setActiveIndex(flatIdx)}
                    >
                      {result.imageUrl ? (
                        <img
                          src={result.imageUrl}
                          alt=""
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-[var(--on-accent)]"
                          style={{ backgroundColor: "var(--accent)" }}
                        >
                          {(result.label || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col items-start min-w-0">
                        <span className="truncate font-medium text-[13px]">
                          {result.label}
                        </span>
                        {result.sublabel && (
                          <span
                            className="truncate text-[11px]"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {result.sublabel}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Pages group */}
            {pagesGroup.length > 0 && (
              <div>
                <p
                  className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Pages
                </p>
                {pagesGroup.map((result) => {
                  const flatIdx = flatResults.indexOf(result);
                  const Icon = result.icon;
                  return (
                    <button
                      key={result.id}
                      onClick={() => navigate(result.href)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors duration-150",
                        flatIdx === activeIndex
                          ? "bg-[var(--accent-soft)]"
                          : "hover:bg-[var(--accent-soft)]"
                      )}
                      style={{
                        color:
                          flatIdx === activeIndex
                            ? "var(--text-primary)"
                            : "var(--text-secondary)",
                      }}
                      onMouseEnter={() => setActiveIndex(flatIdx)}
                    >
                      {Icon && (
                        <Icon
                          className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)]"
                        />
                      )}
                      <span className="font-medium text-[13px]">{result.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Loading hint */}
            {isPending && hasQuery && results.length === 0 && (
              <p
                className="px-4 py-4 text-center text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                Searching...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
