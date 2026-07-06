import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  GitBranch,
  Zap,
  Users,
  BarChart3,
  Shield,
  Layers,
  ArrowRight,
  Star,
  CheckCircle2,
  Globe,
  ExternalLink,
} from "lucide-react";
import { FadeIn } from "@/components/marketing/fade-in";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF8]">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-surface-100 bg-[#FAFAF8]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-1">
            <span className="text-xl font-bold tracking-tight text-[#1A1A1A]">thread</span>
            <span className="text-xl font-bold tracking-tight text-brand-600">line</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-surface-500 transition-colors hover:text-surface-900">
              Features
            </a>
            <a href="#testimonials" className="text-sm font-medium text-surface-500 transition-colors hover:text-surface-900">
              Testimonials
            </a>
            <a href="#pricing" className="text-sm font-medium text-surface-500 transition-colors hover:text-surface-900">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-surface-600 transition-colors hover:text-surface-900"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="btn-primary"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Subtle gradient background */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-50/40 via-[#FAFAF8] to-[#FAFAF8]" />
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-brand-100/30 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-8 lg:pb-32 lg:pt-28">
            <FadeIn>
              <div className="mx-auto max-w-3xl text-center">
                {/* Social proof pill */}
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-surface-200 bg-white px-4 py-1.5 text-sm shadow-sm">
                  <div className="flex -space-x-1">
                    <div className="h-5 w-5 rounded-full bg-brand-200 ring-2 ring-white" />
                    <div className="h-5 w-5 rounded-full bg-brand-300 ring-2 ring-white" />
                    <div className="h-5 w-5 rounded-full bg-brand-400 ring-2 ring-white" />
                  </div>
                  <span className="text-surface-600">
                    Trusted by 2,000+ teams worldwide
                  </span>
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1A] sm:text-5xl lg:text-6xl">
                  Follow every{" "}
                  <span className="text-brand-600">
                    thread.
                  </span>
                </h1>
                <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#6B7280]">
                  The visual way to manage projects. Map dependencies, track progress, and collaborate in real time — all on one canvas.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href="/sign-up"
                    className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-base"
                  >
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/sign-in"
                    className="btn-secondary inline-flex items-center gap-2 px-8 py-3.5 text-base"
                  >
                    Sign In
                  </Link>
                </div>
                <p className="mt-4 text-sm text-surface-400">
                  No credit card required. Free for teams up to 5.
                </p>
              </div>
            </FadeIn>

            {/* Hero visual / product preview */}
            <FadeIn delay={200}>
              <div className="mx-auto mt-16 max-w-5xl">
                <div className="relative overflow-hidden rounded-2xl border border-surface-200 bg-surface-50 shadow-2xl shadow-surface-900/5">
                  <div className="flex items-center gap-2 border-b border-surface-200 bg-white px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-surface-200" />
                      <div className="h-3 w-3 rounded-full bg-surface-200" />
                      <div className="h-3 w-3 rounded-full bg-surface-200" />
                    </div>
                    <div className="ml-4 h-5 w-64 rounded-md bg-surface-100" />
                  </div>
                  <div className="grid grid-cols-12 gap-0">
                    {/* Mini sidebar mockup */}
                    <div className="col-span-2 hidden border-r border-surface-200 bg-white p-4 sm:block">
                      <div className="space-y-3">
                        <div className="h-3 w-16 rounded bg-surface-100" />
                        <div className="h-3 w-20 rounded bg-brand-100" />
                        <div className="h-3 w-14 rounded bg-surface-100" />
                        <div className="h-3 w-18 rounded bg-surface-100" />
                        <div className="h-3 w-12 rounded bg-surface-100" />
                      </div>
                    </div>
                    {/* Canvas mockup */}
                    <div className="col-span-12 p-8 sm:col-span-10 sm:p-12">
                      <div className="flex flex-wrap items-start justify-center gap-6">
                        {/* Mock nodes */}
                        <div className="flex flex-col items-center gap-2">
                          <div className="rounded-xl border border-surface-200 bg-white px-4 py-3 shadow-sm">
                            <div className="h-2 w-16 rounded bg-brand-400" />
                            <div className="mt-2 h-2 w-24 rounded bg-surface-200" />
                          </div>
                          <div className="h-8 w-px bg-surface-300" />
                        </div>
                        <div className="flex flex-col items-center gap-2 mt-12">
                          <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 shadow-sm">
                            <div className="h-2 w-20 rounded bg-brand-500" />
                            <div className="mt-2 h-2 w-16 rounded bg-brand-200" />
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2 mt-4">
                          <div className="rounded-xl border border-surface-200 bg-white px-4 py-3 shadow-sm">
                            <div className="h-2 w-14 rounded bg-green-400" />
                            <div className="mt-2 h-2 w-20 rounded bg-surface-200" />
                          </div>
                          <div className="h-8 w-px bg-surface-300" />
                          <div className="rounded-xl border border-surface-200 bg-white px-4 py-3 shadow-sm">
                            <div className="h-2 w-18 rounded bg-amber-400" />
                            <div className="mt-2 h-2 w-14 rounded bg-surface-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Logo Cloud / Social Proof */}
        <section className="border-y border-surface-100 bg-surface-50/50 py-12">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <p className="text-center text-sm font-medium text-surface-400 uppercase tracking-wider">
              Trusted by teams at
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {["Vercel", "Stripe", "Linear", "Notion", "Figma", "Shopify"].map((name) => (
                <div key={name} className="text-lg font-bold text-surface-300 transition-colors hover:text-surface-500">
                  {name}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <FadeIn>
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
                  Features
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
                  Everything you need to ship faster
                </h2>
                <p className="mt-4 text-lg text-surface-500">
                  Built for modern teams who need more than checkboxes.
                </p>
              </div>
            </FadeIn>

            <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<GitBranch className="h-5 w-5" />}
                title="Visual Dependency Graphs"
                description="Map task relationships on an infinite canvas. See exactly what blocks what and plan accordingly."
                delay={0}
              />
              <FeatureCard
                icon={<Users className="h-5 w-5" />}
                title="Real-time Collaboration"
                description="Work together with live presence indicators, instant updates, and shared editing across your team."
                delay={100}
              />
              <FeatureCard
                icon={<Zap className="h-5 w-5" />}
                title="AI-Powered Generation"
                description="Describe your project in plain text and get a full dependency graph generated automatically."
                delay={200}
              />
              <FeatureCard
                icon={<Shield className="h-5 w-5" />}
                title="Approval Workflows"
                description="Built-in review process with proof-of-completion attachments and role-based permissions."
                delay={300}
              />
              <FeatureCard
                icon={<BarChart3 className="h-5 w-5" />}
                title="Project Analytics"
                description="Track completion rates, identify bottlenecks, and balance workloads with rich visual dashboards."
                delay={400}
              />
              <FeatureCard
                icon={<Layers className="h-5 w-5" />}
                title="Nested Sub-graphs"
                description="Organize complex projects with folder nodes that contain their own sub-graphs with breadcrumb navigation."
                delay={500}
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="bg-surface-50 py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <FadeIn>
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
                  Testimonials
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
                  Loved by high-performing teams
                </h2>
              </div>
            </FadeIn>

            <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
              <TestimonialCard
                quote="Threadline replaced our Jira board and three other tools. The graph view makes complex dependencies actually manageable."
                author="Sarah Chen"
                role="Engineering Lead, TechCorp"
                delay={0}
              />
              <TestimonialCard
                quote="The real-time collaboration is incredible. We went from async confusion to live coordination overnight."
                author="Marcus Rodriguez"
                role="Product Manager, ScaleUp"
                delay={100}
              />
              <TestimonialCard
                quote="Finally, a task management tool that understands how real projects work. Dependencies, approvals, the whole thing."
                author="Anika Patel"
                role="Design Director, Studio IX"
                delay={200}
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <FadeIn>
              <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
                <StatBlock value="2,000+" label="Active teams" />
                <StatBlock value="99.9%" label="Uptime SLA" />
                <StatBlock value="50ms" label="Avg. response" />
                <StatBlock value="4.9/5" label="User rating" />
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Final CTA Section */}
        <section id="pricing" className="relative overflow-hidden py-24 lg:py-32">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-50/60 via-[#FAFAF8] to-[#FAFAF8]" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
            <FadeIn>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
                  Ready to rethink project management?
                </h2>
                <p className="mt-4 text-lg text-surface-500">
                  Join thousands of teams who shipped faster after switching to
                  Threadline. Start for free in 30 seconds.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href="/sign-up"
                    className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-base"
                  >
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/sign-in"
                    className="btn-ghost inline-flex items-center gap-2 px-8 py-3.5 text-base"
                  >
                    Sign In
                  </Link>
                </div>
                <div className="mt-6 flex items-center justify-center gap-6 text-sm text-surface-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-brand-500" />
                    Free forever for small teams
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-brand-500" />
                    No credit card required
                  </span>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          {/* About Sections */}
          <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-surface-200/60 bg-[#FAFAF8] p-6">
              <h4 className="text-sm font-bold uppercase tracking-wider text-brand-600">About Threadline</h4>
              <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">
                Threadline is a collaborative task management platform where the core organizing structure is a visual dependency graph — not a flat to-do list. Teams use Threadline to map complex project dependencies, collaborate in real-time, and track progress with built-in approval workflows, analytics, and messaging.
              </p>
            </div>
            <div className="rounded-2xl border border-surface-200/60 bg-[#FAFAF8] p-6">
              <h4 className="text-sm font-bold uppercase tracking-wider text-brand-600">Built by Array</h4>
              <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">
                Threadline is developed by Array, a startup focused on building thoughtful productivity tools for modern teams. We believe the best project management happens when you can see the full picture — not just individual tasks, but how they connect. Array is committed to building software that feels fast, looks beautiful, and works the way teams actually think.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold tracking-tight text-[#1A1A1A]">thread</span>
                <span className="text-xl font-bold tracking-tight text-brand-600">line</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
                Visual task management for modern teams. See dependencies, not just lists.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#1A1A1A]">Product</h4>
              <ul className="mt-4 space-y-2.5">
                <li><a href="#features" className="text-sm text-[#6B7280] hover:text-brand-600 transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-sm text-[#6B7280] hover:text-brand-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-sm text-[#6B7280] hover:text-brand-600 transition-colors">Changelog</a></li>
                <li><a href="#" className="text-sm text-[#6B7280] hover:text-brand-600 transition-colors">Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#1A1A1A]">Company</h4>
              <ul className="mt-4 space-y-2.5">
                <li><a href="#" className="text-sm text-[#6B7280] hover:text-brand-600 transition-colors">About</a></li>
                <li><a href="#" className="text-sm text-[#6B7280] hover:text-brand-600 transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-[#6B7280] hover:text-brand-600 transition-colors">Careers</a></li>
                <li><a href="#" className="text-sm text-[#6B7280] hover:text-brand-600 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#1A1A1A]">Legal</h4>
              <ul className="mt-4 space-y-2.5">
                <li><a href="#" className="text-sm text-[#6B7280] hover:text-brand-600 transition-colors">Privacy</a></li>
                <li><a href="#" className="text-sm text-[#6B7280] hover:text-brand-600 transition-colors">Terms</a></li>
                <li><a href="#" className="text-sm text-[#6B7280] hover:text-brand-600 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-surface-200 pt-8 sm:flex-row">
            <p className="text-sm text-[#6B7280]">
              &copy; {new Date().getFullYear()} Threadline by Array. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-surface-400 transition-colors hover:text-brand-600" aria-label="Website">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="text-surface-400 transition-colors hover:text-brand-600" aria-label="Docs">
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <FadeIn delay={delay}>
      <div className="group relative rounded-2xl border border-surface-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-brand-200 hover:shadow-md">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
          {icon}
        </div>
        <h3 className="text-base font-semibold text-surface-900">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-surface-500">
          {description}
        </p>
      </div>
    </FadeIn>
  );
}

function TestimonialCard({
  quote,
  author,
  role,
  delay,
}: {
  quote: string;
  author: string;
  role: string;
  delay: number;
}) {
  return (
    <FadeIn delay={delay}>
      <div className="flex flex-col rounded-2xl border border-surface-200/80 bg-white p-6 shadow-sm">
        <div className="mb-4 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="flex-1 text-sm leading-relaxed text-surface-600">
          &ldquo;{quote}&rdquo;
        </p>
        <div className="mt-6 border-t border-surface-100 pt-4">
          <p className="text-sm font-semibold text-surface-900">{author}</p>
          <p className="text-xs text-surface-500">{role}</p>
        </div>
      </div>
    </FadeIn>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-surface-900 sm:text-4xl">{value}</p>
      <p className="mt-1 text-sm text-surface-500">{label}</p>
    </div>
  );
}
