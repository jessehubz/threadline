import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-[fadeIn_0.2s_ease-out]">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="mt-2 h-4 w-40" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>

      {/* Health Score + KPI Stats */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row">
        {/* Health Gauge */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-themed-subtle bg-card p-6 lg:w-[200px]">
          <Skeleton className="h-[90px] w-[140px] rounded-full" />
          <Skeleton className="mt-2 h-4 w-16" />
        </div>
        {/* KPI Grid */}
        <div className="grid flex-1 grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-themed-subtle bg-card p-4">
              <div className="mb-2 flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded-lg" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-7 w-12" />
              <Skeleton className="mt-1 h-3 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Attention Required */}
      <div className="mb-6 rounded-2xl border border-themed-subtle bg-page p-5">
        <Skeleton className="mb-3 h-5 w-36" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-card px-3 py-2">
              <Skeleton className="mb-1 h-3 w-16" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-themed-subtle bg-card p-5">
          <Skeleton className="mb-1 h-4 w-32" />
          <Skeleton className="mb-4 h-3 w-20" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
        <div className="rounded-2xl border border-themed-subtle bg-card p-5">
          <Skeleton className="mb-4 h-4 w-32" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
      </div>

      {/* Three-column panels */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-themed-subtle bg-card p-5">
            <Skeleton className="mb-4 h-4 w-24" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mb-6 rounded-2xl border border-themed-subtle bg-card p-5">
        <Skeleton className="mb-4 h-4 w-28" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-themed-subtle bg-page p-3">
              <div className="flex items-start gap-2.5">
                <Skeleton className="h-7 w-7 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="mt-1 h-2.5 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <Skeleton className="mb-4 h-5 w-20" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-themed-subtle bg-card p-5">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-3 w-full mb-4" />
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
