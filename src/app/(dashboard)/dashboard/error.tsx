"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // If it's a ChunkLoadError (Turbopack dev issue), auto-retry once after a delay
    if (error.message?.includes("ChunkLoadError") || error.message?.includes("Failed to load chunk")) {
      if (retryCount < 1) {
        const timeout = setTimeout(() => {
          setRetryCount((c) => c + 1);
          reset();
        }, 2000);
        return () => clearTimeout(timeout);
      }
    }
  }, [error, reset, retryCount]);

  // Don't show error UI for chunk errors (transient dev issue)
  if (error.message?.includes("ChunkLoadError") || error.message?.includes("Failed to load chunk")) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <RefreshCw className="h-8 w-8 animate-spin text-dim" />
        <p className="mt-4 text-sm text-dim">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <AlertCircle className="h-12 w-12 text-[var(--danger)]" />
      <h2 className="mt-4 text-xl font-semibold text-heading">
        Something went wrong
      </h2>
      <p className="mt-2 text-sm text-body">
        {error.message || "Failed to load dashboard"}
      </p>
      <Button onClick={reset} className="mt-4">
        Try Again
      </Button>
    </div>
  );
}
