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
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col bg-page">
      {/* ─── NAV ─── */}
      <header className="sticky top-0 z-50 h-14 bg-[var(--bg-base)]/80 backdrop-blur-xl border-b border-themed-subtle">
        <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-6">
          <a href="/" className="flex items-center">
            <span className="text-[17px] font-extrabold tracking-tight text-heading font-logo">Thread</span>
            <span className="text-[17px] font-extrabold tracking-tight accent-color font-logo">line</span>
          </a>
          <nav className="hidden items-center gap-7 md:flex">
            <a href="#features" className="text-[14px] font-medium text-body transition-colors hover:text-heading">Features</a>
            <a href="#how" className="text-[14px] font-medium text-body transition-colors hover:text-heading">How it works</a>
            <a href="#customers" className="text-[14px] font-medium text-body transition-colors hover:text-heading">Customers</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-[14px] font-medium text-body transition-colors hover:text-heading">Sign In</Link>
            <Link href="/sign-up" className="btn-primary text-[13px] px-4 py-2">Get Started</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ─── HERO ─── */}
        <section className="relative overflow-hidden pt-24 pb-10 lg:pt-32 lg:pb-16">
          <div className="relative mx-auto max-w-5xl px-6">
            <FadeIn>
              <div className="mx-auto max-w-[880px] text-center">
                <h1 className="text-[48px] sm:text-[64px] lg:text-[72px] text-display">
                  See how your<br />work <span className="accent-color">connects.</span>
                </h1>
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <p className="mx-auto mt-7 max-w-[480px] text-center text-[17px] leading-relaxed text-body">
                Project management that thinks in graphs, not lists. Map dependencies, track progress, and collaborate — all on one canvas.
              </p>
            </FadeIn>
            <FadeIn delay={200}>
              <div className="mt-9 flex items-center justify-center gap-3">
                <Link href="/sign-up" className="btn-primary text-[14px] px-6 py-2.5 gap-2">
                  Start for free <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#features" className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[14px] font-medium text-body transition-colors hover:text-heading">
                  Learn more
                </a>
              </div>
              <p className="mt-4 text-center text-[12px] text-dim">Free for up to 5 people · No credit card required</p>
            </FadeIn>

            {/* Product mockup */}
            <FadeIn delay={300}>
              <div className="mx-auto mt-14 max-w-4xl">
                <div className="rounded-2xl border border-themed bg-[var(--bg-elevated)] p-1.5 shadow-[0_25px_80px_-12px_rgba(0,0,0,0.4)]">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 rounded-t-[10px] bg-[var(--bg-elevated)] px-4 py-2 border-b border-themed">
                    <div className="flex gap-[6px]">
                      <div className="h-[10px] w-[10px] rounded-full bg-[#FF5F57]" />
                      <div className="h-[10px] w-[10px] rounded-full bg-[#FFBD2E]" />
                      <div className="h-[10px] w-[10px] rounded-full bg-[#28C840]" />
                    </div>
                    <div className="ml-4 flex-1 flex justify-center">
                      <div className="h-[22px] w-52 rounded-md bg-[var(--bg-surface)] flex items-center justify-center">
                        <span className="text-[9px] text-dim font-medium">threadline.app/graph/project-alpha</span>
                      </div>
                    </div>
                  </div>
                  {/* Graph canvas */}
                  <div className="rounded-b-[10px] bg-[var(--bg-surface)] px-8 py-10 sm:px-14 sm:py-12">
                    <div className="flex items-start justify-center gap-4 sm:gap-8">
                      {/* Left branch */}
                      <div className="flex flex-col items-center">
                        <div className="rounded-xl border border-themed-subtle bg-[var(--bg-elevated)] px-5 py-3 shadow-sm">
                          <div className="h-[6px] w-20 rounded-full bg-[var(--accent)] mb-2" />
                          <div className="h-[5px] w-28 rounded-full bg-[var(--border-default)]" />
                        </div>
                        <div className="h-7 w-px bg-[var(--border-default)]" />
                        <div className="flex gap-3">
                          <div className="rounded-lg border border-themed-subtle bg-[var(--bg-elevated)] px-4 py-2.5 shadow-sm">
                            <div className="h-[5px] w-14 rounded-full bg-[var(--accent)] mb-1.5" style={{ opacity: 0.7 }} />
                            <div className="h-[4px] w-20 rounded-full bg-[var(--border-default)]" />
                          </div>
                          <div className="rounded-lg border border-themed-subtle bg-[var(--bg-elevated)] px-4 py-2.5 shadow-sm">
                            <div className="h-[5px] w-16 rounded-full bg-[var(--accent)] mb-1.5" style={{ opacity: 0.35 }} />
                            <div className="h-[4px] w-12 rounded-full bg-[var(--border-default)]" />
                          </div>
                        </div>
                      </div>
                      {/* Connector */}
                      <div className="hidden sm:flex items-center pt-6">
                        <div className="h-px w-10 bg-[var(--border-default)]" />
                        <ArrowRight className="h-3 w-3 text-dim -ml-1" />
                      </div>
                      {/* Right branch */}
                      <div className="hidden sm:flex flex-col items-center pt-4">
                        <div className="rounded-xl border border-themed-subtle bg-[var(--bg-elevated)] px-5 py-3 shadow-sm">
                          <div className="h-[6px] w-16 rounded-full bg-[var(--accent)] mb-2" style={{ opacity: 0.55 }} />
                          <div className="h-[5px] w-24 rounded-full bg-[var(--border-default)]" />
                        </div>
                        <div className="h-7 w-px bg-[var(--border-default)]" />
                        <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-5 py-3 shadow-sm">
                          <div className="h-[5px] w-14 rounded-full bg-[var(--accent)] mb-2" />
                          <div className="h-[4px] w-20 rounded-full bg-[var(--accent)]/25" />
                          <div className="mt-2.5 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 accent-color" />
                            <span className="text-[8px] font-semibold accent-color">Done</span>
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

        {/* ─── LOGOS ─── */}
        <section className="py-10 border-y border-themed-subtle">
          <div className="mx-auto max-w-5xl px-6">
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
              {["Vercel", "Stripe", "Linear", "Notion", "Figma"].map((name) => (
                <span key={name} className="text-[15px] font-bold text-dim select-none">{name}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section id="features" className="py-24">
          <div className="mx-auto max-w-5xl px-6">
            <FadeIn>
              <div className="text-center">
                <h2 className="text-[36px] text-headline">Built for how teams actually work.</h2>
                <p className="mt-3 text-[16px] text-body max-w-md mx-auto">Not another list app. A visual system for managing complex, interconnected work.</p>
              </div>
            </FadeIn>
            <div className="mt-14 space-y-4">
              {/* Row 1: hero feature (the core differentiator) + one supporting feature */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <FadeIn delay={0} className="lg:col-span-2">
                  <div className="animate-entrance group rounded-xl border border-themed-subtle bg-card p-8 transition-all duration-200 ease-out hover-lift sm:p-10">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl accent-bg accent-color">
                      <GitBranch className="h-6 w-6" />
                    </div>
                    <h3 className="text-[24px] text-card-title">Dependency Graphs</h3>
                    <p className="mt-2 max-w-md text-[15px] leading-relaxed text-body">See what blocks what. Map relationships visually instead of guessing from a flat list — the core idea Threadline is built around.</p>
                  </div>
                </FadeIn>
                <Card icon={<Users className="h-5 w-5" />} title="Live Collaboration" desc="Work in real-time. See who's online, who's editing what — instantly synced." delay={60} />
              </div>
              {/* Row 2: supporting features */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card icon={<Zap className="h-5 w-5" />} title="AI Generation" desc="Describe your project in words. Get a structured dependency graph in seconds." delay={120} compact />
                <Card icon={<Shield className="h-5 w-5" />} title="Approval Workflows" desc="Submit for review. Approvers get notified, approve or reject with one click." delay={180} compact />
                <Card icon={<BarChart3 className="h-5 w-5" />} title="Analytics" desc="Track completion rates, spot bottlenecks, balance workloads across teams." delay={240} compact />
                <Card icon={<Layers className="h-5 w-5" />} title="Nested Graphs" desc="Folders with sub-graphs inside. Organize at any scale without losing context." delay={300} compact />
              </div>
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section id="how" className="py-24 bg-hover">
          <div className="mx-auto max-w-5xl px-6">
            <FadeIn>
              <div className="text-center">
                <h2 className="text-[36px] text-headline">Three steps to clarity.</h2>
                <p className="mt-3 text-[16px] text-body max-w-md mx-auto">From idea to structured execution in under a minute.</p>
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
                <Step num="1" title="Describe" desc="Tell Threadline about your project in plain language — or pick a template." />
                <Step num="2" title="Visualize" desc="Instantly see your tasks as a dependency graph. Drag, connect, organize." />
                <Step num="3" title="Collaborate" desc="Invite your team. Assign tasks, set deadlines, track progress together." />
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ─── TESTIMONIALS ─── */}
        <section id="customers" className="py-24">
          <div className="mx-auto max-w-5xl px-6">
            <FadeIn>
              <div className="text-center">
                <h2 className="text-[36px] text-headline">Teams ship faster with Threadline.</h2>
              </div>
            </FadeIn>
            <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
              <Quote text="Replaced Jira and three other tools. The graph view makes complex dependencies actually manageable." author="Sarah Chen" role="Engineering Lead" delay={0} />
              <Quote text="We went from async confusion to live coordination overnight. Real-time editing is a game changer." author="Marcus Rodriguez" role="Product Manager" delay={80} />
              <Quote text="Finally understands how real projects work — dependencies, approvals, nested sub-projects, all of it." author="Anika Patel" role="Design Director" delay={160} />
            </div>
            {/* Stats */}
            <FadeIn delay={200}>
              <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4 max-w-2xl mx-auto">
                <Stat value="2,000+" label="Active teams" />
                <Stat value="99.9%" label="Uptime" />
                <Stat value="50ms" label="Response time" />
                <Stat value="4.9/5" label="User rating" />
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="py-24 bg-hover">
          <div className="mx-auto max-w-5xl px-6">
            <FadeIn>
              <div className="mx-auto max-w-lg text-center">
                <h2 className="text-[36px] text-headline">Ready to see clearly?</h2>
                <p className="mt-3 text-[16px] text-body">Start free. Set up in 60 seconds. No credit card required.</p>
                <div className="mt-8">
                  <Link href="/sign-up" className="btn-primary text-[14px] px-7 py-3 gap-2">
                    Start for free <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="mt-5 flex items-center justify-center gap-5 text-[12px] text-dim">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 accent-color" />Free for 5 users</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 accent-color" />No credit card</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 accent-color" />Cancel anytime</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-themed-subtle bg-page py-12">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center">
                <span className="text-[17px] font-extrabold text-heading font-logo">Thread</span>
                <span className="text-[17px] font-extrabold accent-color font-logo">line</span>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-dim max-w-[180px]">Visual project management for teams who think in systems.</p>
            </div>
            <FooterCol title="Product" links={["Features", "Pricing", "Changelog"]} />
            <FooterCol title="Company" links={["About", "Blog", "Contact"]} />
            <FooterCol title="Legal" links={["Privacy", "Terms"]} />
          </div>
          <div className="mt-10 pt-6 border-t border-themed-subtle flex items-center justify-between">
            <p className="text-[12px] text-dim">&copy; {new Date().getFullYear()} Threadline</p>
            <div className="flex items-center gap-3">
              <a href="#" className="text-dim hover:text-body transition-colors"><Globe className="h-4 w-4" /></a>
              <a href="#" className="text-dim hover:text-body transition-colors"><ExternalLink className="h-4 w-4" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── COMPONENTS ─── */

function Card({ icon, title, desc, delay, compact }: { icon: React.ReactNode; title: string; desc: string; delay: number; compact?: boolean }) {
  return (
    <FadeIn delay={delay}>
      <div className={cn(
        "animate-entrance group rounded-xl border border-themed-subtle bg-card transition-all duration-200 ease-out hover-lift",
        compact ? "p-5" : "p-7"
      )}>
        <div className={cn(
          "flex items-center justify-center rounded-xl accent-bg accent-color transition-colors duration-200",
          compact ? "mb-3 h-8 w-8" : "mb-4 h-10 w-10"
        )}>
          {icon}
        </div>
        <h3 className={cn("text-card-title", compact ? "text-[15px]" : "text-[18px]")}>{title}</h3>
        <p className={cn("leading-relaxed text-body", compact ? "mt-1 text-[12.5px]" : "mt-1.5 text-[14px]")}>{desc}</p>
      </div>
    </FadeIn>
  );
}

function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-bold text-white" style={{ backgroundColor: 'var(--accent)' }}>{num}</div>
      <h3 className="text-[18px] text-card-title">{title}</h3>
      <p className="mt-1.5 text-[14px] leading-relaxed text-body">{desc}</p>
    </div>
  );
}

function Quote({ text, author, role, delay }: { text: string; author: string; role: string; delay: number }) {
  return (
    <FadeIn delay={delay}>
      <div className="animate-entrance rounded-xl border border-themed-subtle bg-card p-7">
        <div className="flex gap-0.5 mb-4">
          {[...Array(5)].map((_, i) => (<Star key={i} className="h-4 w-4 fill-[var(--accent)] text-[var(--accent)]" />))}
        </div>
        <p className="text-[14px] leading-relaxed text-body">&ldquo;{text}&rdquo;</p>
        <div className="mt-5 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full accent-bg" />
          <div>
            <p className="text-item-title">{author}</p>
            <p className="text-[11px] text-dim">{role}</p>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-[32px] text-stat">{value}</p>
      <p className="text-[12px] text-dim mt-0.5">{label}</p>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-eyebrow">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link}><a href="#" className="text-[13px] text-body hover:text-heading transition-colors">{link}</a></li>
        ))}
      </ul>
    </div>
  );
}
