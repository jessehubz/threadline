"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardGroupError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    // Auto-retry once for transient chunk load errors
    const isChunkError =
      error.message?.includes("ChunkLoadError") ||
      error.message?.includes("Failed to load chunk") ||
      error.message?.includes("Loading chunk");

    if (isChunkError && !retrying) {
      setRetrying(true);
      const timeout = setTimeout(() => {
        window.location.reload();
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [error, retrying]);

  if (retrying) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin accent-color" />
          <p className="mt-3 text-sm text-dim">Reconnecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-[var(--danger)]" />
        <h2 className="mt-4 text-xl font-semibold text-heading">
          Something went wrong
        </h2>
        <p className="mt-2 max-w-md text-sm text-body">
          {error.message || "An unexpected error occurred"}
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button onClick={reset}>Try Again</Button>
          <Button variant="secondary" onClick={() => window.location.href = "/dashboard"}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
