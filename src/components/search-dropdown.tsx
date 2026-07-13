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
} from "lucide-react";
import { searchPeople, type SearchPersonResult } from "@/actions/search-actions";
import { cn } from "@/lib/utils";

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
  type: "person" | "page";
  label: string;
  sublabel?: string;
  href: string;
  imageUrl?: string | null;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SearchDropdownProps {
  /** Additional class name for the wrapper */
  className?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function SearchDropdown({ className }: SearchDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isPending, startTransition] = useTransition();

  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // ── Open / Close ────────────────────────────────────────────────────────

  const openDropdown = useCallback(() => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 30);
  }, []);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setActiveIndex(-1);
  }, []);

  // ── Global ⌘K shortcut ─────────────────────────────────────────────────

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) {
          closeDropdown();
        } else {
          openDropdown();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, openDropdown, closeDropdown]);

  // ── Click-away ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, closeDropdown]);

  // ── Debounced search ────────────────────────────────────────────────────

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim().toLowerCase();

    if (!trimmed) {
      setResults([]);
      setActiveIndex(-1);
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

      // Search people (server action)
      startTransition(async () => {
        let peopleResults: SearchResult[] = [];
        try {
          const people = await searchPeople(query.trim());
          peopleResults = people.map((p: SearchPersonResult) => ({
            id: `person-${p.id}`,
            type: "person" as const,
            label: p.name || p.email,
            sublabel: p.name ? p.email : undefined,
            href: `/profile/${p.id}`,
            imageUrl: p.imageUrl,
          }));
        } catch {
          // Silently fail on people search errors
        }

        setResults([...peopleResults, ...pageResults]);
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

  const peopleGroup = results.filter((r) => r.type === "person");
  const pagesGroup = results.filter((r) => r.type === "page");
  const hasQuery = query.trim().length > 0;
  const noResults = hasQuery && !isPending && results.length === 0;

  // Flat index for keyboard navigation
  const flatResults = [...peopleGroup, ...pagesGroup];

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      {/* Search trigger button */}
      <button
        onClick={openDropdown}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] transition-all duration-200 cursor-text",
          "border hover:scale-[1.01]",
          open && "ring-1 ring-[var(--accent)]"
        )}
        style={{
          borderColor: "var(--border-default)",
          color: "var(--text-muted)",
          backgroundColor: open ? "var(--bg-elevated)" : "transparent",
        }}
        aria-label="Search"
        title="Search (⌘K)"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden lg:inline">Search...</span>
        <kbd
          className="ml-2 hidden lg:inline rounded px-1.5 py-0.5 text-[10px] font-medium border"
          style={{
            borderColor: "var(--border-default)",
            color: "var(--text-muted)",
            backgroundColor: "var(--bg-elevated)",
          }}
        >
          ⌘K
        </kbd>
      </button>

      {/* Inline dropdown */}
      {open && (
        <div
          className="absolute top-full left-0 z-50 mt-2 w-72 sm:w-80 overflow-hidden rounded-xl border animate-[fadeInDown_180ms_ease-out]"
          style={{
            borderColor: "var(--border-default)",
            backgroundColor: "var(--bg-elevated)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {/* Input area */}
          <div
            className="flex items-center gap-2.5 border-b px-3 py-2.5"
            style={{ borderColor: "var(--border-default)" }}
          >
            <Search
              className="h-3.5 w-3.5 flex-shrink-0"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search people & pages..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--text-primary)" }}
              autoFocus
            />
            <kbd
              className="rounded border px-1 py-0.5 text-[10px] font-medium"
              style={{
                borderColor: "var(--border-default)",
                color: "var(--text-muted)",
                backgroundColor: "var(--bg-elevated)",
              }}
            >
              Esc
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-72 overflow-y-auto py-1">
            {/* No results */}
            {noResults && (
              <p
                className="px-4 py-6 text-center text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                No results
              </p>
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
                      {/* Avatar */}
                      {result.imageUrl ? (
                        <img
                          src={result.imageUrl}
                          alt=""
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
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
