import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-[fadeIn_0.2s_ease-out]">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
        {/* Inline stats */}
        <div className="mt-5 flex flex-wrap items-baseline gap-x-8 gap-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-baseline gap-1.5">
              <Skeleton className="h-8 w-10" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
        {/* Progress line */}
        <Skeleton className="mt-4 h-[3px] w-full rounded-full" />
      </div>

      {/* AI Insights */}
      <div className="mb-10">
        <div className="mb-3 flex items-center gap-2">
          <Skeleton className="h-3.5 w-3.5 rounded" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-2.5 py-1">
              <Skeleton className="h-3.5 w-3.5 mt-0.5 rounded" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Task sections — just lines */}
      <div className="mb-10 space-y-0">
        {["Due Today", "This Week", "Later"].map((title) => (
          <div key={title} className="border-b border-[var(--border-subtle)] py-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-3.5" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Team Workload */}
      <div className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-3.5 w-3.5" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-[6px] flex-1 rounded-full" />
              <Skeleton className="h-3 w-5" />
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <Skeleton className="mb-4 h-5 w-16" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[var(--glass-border)] p-5">
            <Skeleton className="h-4 w-3/4 mb-3" />
            <Skeleton className="h-3 w-full mb-4" />
            <Skeleton className="h-1.5 w-full rounded-full" />
            <Skeleton className="mt-3 h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
