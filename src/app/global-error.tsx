"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-page p-6">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-[var(--danger)]" />
            <h1 className="mt-4 text-2xl font-bold text-heading">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-body">
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
