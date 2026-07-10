import Link from "next/link";
import { GitBranch } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page p-6">
      <div className="text-center">
        <GitBranch className="mx-auto h-12 w-12 text-dim" />
        <h1 className="mt-4 text-4xl font-bold text-heading">404</h1>
        <p className="mt-2 text-lg text-body">
          Page not found
        </p>
        <p className="mt-1 text-sm text-dim">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/dashboard" className="btn-primary mt-6 inline-block">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
