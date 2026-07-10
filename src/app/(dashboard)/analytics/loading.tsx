import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="mx-auto max-w-6xl">
      <Skeleton className="mb-2 h-6 w-28" />
      <Skeleton className="mb-6 h-4 w-64 sm:mb-8" />

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
          <div className="card">
            <Skeleton className="mb-4 h-5 w-44" />
            <Skeleton className="h-[220px] w-full" />
          </div>
          <div className="card flex flex-col items-center justify-center">
            <Skeleton className="mb-4 h-3 w-24" />
            <Skeleton className="h-[140px] w-[140px] rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
          <div className="card">
            <Skeleton className="mb-4 h-5 w-36" />
            <Skeleton className="h-[200px] w-full rounded-full" />
          </div>
          <div className="card">
            <Skeleton className="mb-4 h-5 w-36" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
