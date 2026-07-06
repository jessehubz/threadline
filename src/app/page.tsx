import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { GitBranch, Zap, Users, BarChart3 } from "lucide-react";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-brand-600" />
            <span className="text-xl font-bold">Threadline</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="btn-ghost">
              Sign In
            </Link>
            <Link href="/sign-up" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Task management,{" "}
            <span className="text-brand-600">threadlined.</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Organize your projects as visual dependency graphs instead of flat
            lists. See how tasks connect, what&apos;s blocking progress, and
            collaborate with your team in real-time.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/sign-up" className="btn-primary px-8 py-3 text-base">
              Start for Free
            </Link>
            <Link href="/sign-in" className="btn-secondary px-8 py-3 text-base">
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto mt-24 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<GitBranch className="h-6 w-6" />}
            title="Dependency Graphs"
            description="Visualize task dependencies on an infinite canvas. See exactly what blocks what."
          />
          <FeatureCard
            icon={<Users className="h-6 w-6" />}
            title="Real-time Collaboration"
            description="Work together with live cursors, instant updates, and shared editing."
          />
          <FeatureCard
            icon={<Zap className="h-6 w-6" />}
            title="Approval Workflows"
            description="Built-in review and approval process with proof-of-completion attachments."
          />
          <FeatureCard
            icon={<BarChart3 className="h-6 w-6" />}
            title="Analytics"
            description="Track completion rates, identify bottlenecks, and balance workloads."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Threadline. Built with Next.js, React Flow,
          and Prisma.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}
