"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <AlertCircle className="h-12 w-12 text-red-500" />
      <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
        Something went wrong
      </h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {error.message || "Failed to load dashboard"}
      </p>
      <Button onClick={reset} className="mt-4">
        Try Again
      </Button>
    </div>
  );
}
