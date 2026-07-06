import Link from "next/link";
import { GitBranch } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6950">
      <div className="text-center">
        <GitBranch className="mx-auto h-12 w-12 text-gray-400" />
        <h1 className="mt-4 text-4xl font-bold text-gray-900">404</h1>
        <p className="mt-2 text-lg text-gray-600400">
          Page not found
        </p>
        <p className="mt-1 text-sm text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/dashboard" className="btn-primary mt-6 inline-block">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
