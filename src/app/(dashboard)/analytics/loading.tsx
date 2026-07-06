import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div>
      <Skeleton className="mb-8 h-8 w-32" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card">
            <Skeleton className="mb-4 h-5 w-40" />
            <Skeleton className="h-[250px] w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
