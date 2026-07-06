"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface GraphBreadcrumbsProps {
  breadcrumbs: Array<{ id: string; name: string; graphId?: string }>;
  projectId: string;
  currentPath: string[];
}

export function GraphBreadcrumbs({ breadcrumbs, projectId, currentPath }: GraphBreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <Link
        href={`/graph/${projectId}`}
        className="flex items-center gap-1 text-gray-500 hover:text-brand-600 dark:text-gray-400"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {breadcrumbs.map((crumb, i) => {
        const pathUpTo = currentPath.slice(0, i);
        const href =
          i === 0
            ? `/graph/${projectId}`
            : `/graph/${projectId}?path=${pathUpTo.join(",")}&graphId=${crumb.graphId}`;
        const isLast = i === breadcrumbs.length - 1;

        return (
          <span key={crumb.id} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-gray-400" />
            {isLast ? (
              <span className="font-medium text-gray-900 dark:text-white">
                {crumb.name}
              </span>
            ) : (
              <Link href={href} className="text-gray-500 hover:text-brand-600 dark:text-gray-400">
                {crumb.name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
