import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-[fadeIn_0.2s_ease-out]">
      {/* ─── Page Header ─── */}
      <div className="mb-10 flex items-start justify-between">
        <div>
          <Skeleton className="h-9 w-72" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* ─── Overview Panel ─── */}
      <div
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-sm)",
          padding: "24px",
          marginBottom: "32px",
        }}
      >
        {/* Well frame */}
        <div
          style={{
            background: "var(--bg-base)",
            borderRadius: "var(--radius-lg)",
            padding: "8px",
          }}
        >
          <div className="grid grid-cols-2 gap-2 max-sm:grid-cols-1">
            {/* Health Score skeleton */}
            <div
              style={{
                background: "var(--bg-muted)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-md)",
                padding: "24px",
              }}
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div>
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-10 w-12" />
                </div>
              </div>
              <Skeleton className="mt-3 h-5 w-20 rounded-full" />
            </div>
            {/* Active Tasks skeleton */}
            <div
              style={{
                background: "var(--bg-muted)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-md)",
                padding: "24px",
              }}
            >
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-10 w-12" />
              <div className="mt-3 flex gap-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        {/* AI insight strip */}
        <div className="mt-5 border-t border-[var(--border-default)] pt-4">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-5 w-10 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        </div>
      </div>

      {/* ─── Filter Chips ─── */}
      <div className="mb-8 flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>

      {/* ─── Your Projects horizontal scroll ─── */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-4 w-28" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                minWidth: "270px",
                padding: "26px",
                borderRadius: "var(--radius-lg)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-3 w-24 mb-4" />
              <Skeleton className="h-[5px] w-full rounded-full" />
              <Skeleton className="mt-3 h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* ─── Second Row: 2-col grid ─── */}
      <div className="mb-8 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        {/* Needs Attention */}
        <div
          style={{
            borderRadius: "var(--radius-xl)",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-sm)",
            padding: "26px",
          }}
        >
          <div className="mb-4 flex items-center gap-2">
            <Skeleton className="h-3.5 w-3.5" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-6 rounded-full" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-l-[3px] border-[var(--border-default)] pl-3 mb-1 rounded-r-lg">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
        {/* Team Workload */}
        <div
          style={{
            borderRadius: "var(--radius-xl)",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-sm)",
            padding: "26px",
          }}
        >
          <div className="mb-4 flex items-center gap-2">
            <Skeleton className="h-3.5 w-3.5" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div
            style={{
              background: "var(--bg-muted)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              padding: "16px",
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2.5 mb-3 last:mb-0">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-2.5 flex-1 rounded-full" />
                <Skeleton className="h-3 w-5" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Deadlines Panel ─── */}
      <div
        style={{
          borderRadius: "var(--radius-xl)",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          boxShadow: "var(--shadow-sm)",
          padding: "26px",
        }}
      >
        {["Due Today", "This Week", "Later"].map((title) => (
          <div key={title} className="border-b border-[var(--border-subtle)] py-3.5 last:border-b-0">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-3.5" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-6 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
