"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 dark:bg-gray-950">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              An unexpected error occurred. Please try again.
            </p>
            <Button onClick={reset} className="mt-6">
              Try Again
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
