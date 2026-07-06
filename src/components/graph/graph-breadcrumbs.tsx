"use client";

import { ChevronRight, Home } from "lucide-react";

interface GraphBreadcrumbsProps {
  breadcrumbs: Array<{ id: string; name: string; graphId?: string }>;
  projectId: string;
  currentPath: string[];
}

export function GraphBreadcrumbs({ breadcrumbs, projectId, currentPath }: GraphBreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1 rounded-xl border border-surface-200/80 bg-white/95 px-3 py-2 text-sm shadow-sm backdrop-blur-md">
      <a
        href={`/graph/${projectId}`}
        className="flex items-center gap-1 text-surface-400 transition-colors hover:text-brand-600"
      >
        <Home className="h-3.5 w-3.5" />
      </a>

      {breadcrumbs.map((crumb, i) => {
        const pathUpTo = currentPath.slice(0, i);
        const href =
          i === 0
            ? `/graph/${projectId}`
            : `/graph/${projectId}?path=${pathUpTo.join(",")}&graphId=${crumb.graphId}`;
        const isLast = i === breadcrumbs.length - 1;

        return (
          <span key={crumb.id} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-surface-300" />
            {isLast ? (
              <span className="font-medium text-[#1A1A1A]">
                {crumb.name}
              </span>
            ) : (
              <a href={href} className="text-surface-400 transition-colors hover:text-brand-600">
                {crumb.name}
              </a>
            )}
          </span>
        );
      })}
    </nav>
  );
}
