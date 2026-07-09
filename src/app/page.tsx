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
    <div className="flex min-h-screen flex-col bg-white">
      {/* ─── NAV ─── */}
      <header className="sticky top-0 z-50 h-14 bg-white/80 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-6">
          <a href="/" className="flex items-center">
            <span className="text-[17px] font-extrabold tracking-tight text-[#111111]">thread</span>
            <span className="text-[17px] font-extrabold tracking-tight text-brand-600">line</span>
          </a>
          <nav className="hidden items-center gap-7 md:flex">
            <a href="#features" className="text-[14px] font-medium text-[#4B5563] transition-colors hover:text-[#111111]">Features</a>
            <a href="#how" className="text-[14px] font-medium text-[#4B5563] transition-colors hover:text-[#111111]">How it works</a>
            <a href="#customers" className="text-[14px] font-medium text-[#4B5563] transition-colors hover:text-[#111111]">Customers</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-[14px] font-medium text-[#4B5563] transition-colors hover:text-[#111111]">Sign In</Link>
            <Link href="/sign-up" className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-700 hover:-translate-y-[1px] hover:shadow-md active:translate-y-0">Get Started</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ─── HERO ─── */}
        <section className="relative overflow-hidden pt-20 pb-10 lg:pt-28 lg:pb-16">
          <div className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-brand-100/20 blur-[120px]" />

          <div className="relative mx-auto max-w-5xl px-6">
            <FadeIn>
              <div className="mx-auto max-w-[680px] text-center">
                <h1 className="text-[48px] font-extrabold leading-[1.08] tracking-tight text-[#111111] sm:text-[56px]">
                  See how your<br />work <span className="text-brand-600">connects.</span>
                </h1>
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <p className="mx-auto mt-5 max-w-[480px] text-center text-[16px] leading-relaxed text-[#4B5563]">
                Project management that thinks in graphs, not lists. Map dependencies, track progress, and collaborate — all on one canvas.
              </p>
            </FadeIn>
            <FadeIn delay={200}>
              <div className="mt-8 flex items-center justify-center gap-3">
                <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-700 hover:-translate-y-[1px] hover:shadow-md active:translate-y-0">
                  Start for free <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#features" className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[14px] font-medium text-[#4B5563] transition-colors hover:text-[#111111]">
                  Learn more
                </a>
              </div>
              <p className="mt-4 text-center text-[12px] text-[#9CA3AF]">Free for up to 5 people · No credit card required</p>
            </FadeIn>

            {/* Product mockup */}
            <FadeIn delay={300}>
              <div className="mx-auto mt-14 max-w-4xl">
                <div className="rounded-2xl border border-black/[0.06] bg-[#F9FAFB] p-1.5 shadow-[0_25px_80px_-12px_rgba(0,0,0,0.12)]">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 rounded-t-[10px] bg-white px-4 py-2 border-b border-black/[0.04]">
                    <div className="flex gap-[6px]">
                      <div className="h-[10px] w-[10px] rounded-full bg-[#FF5F57]" />
                      <div className="h-[10px] w-[10px] rounded-full bg-[#FFBD2E]" />
                      <div className="h-[10px] w-[10px] rounded-full bg-[#28C840]" />
                    </div>
                    <div className="ml-4 flex-1 flex justify-center">
                      <div className="h-[22px] w-52 rounded-md bg-[#F3F4F6] flex items-center justify-center">
                        <span className="text-[9px] text-[#9CA3AF] font-medium">threadline.app/graph/project-alpha</span>
                      </div>
                    </div>
                  </div>
                  {/* Graph canvas */}
                  <div className="rounded-b-[10px] bg-[#FAFAFA] px-8 py-10 sm:px-14 sm:py-12">
                    <div className="flex items-start justify-center gap-4 sm:gap-8">
                      {/* Left branch */}
                      <div className="flex flex-col items-center">
                        <div className="rounded-xl border border-brand-200/80 bg-white px-5 py-3 shadow-sm">
                          <div className="h-[6px] w-20 rounded-full bg-brand-500 mb-2" />
                          <div className="h-[5px] w-28 rounded-full bg-[#E5E7EB]" />
                        </div>
                        <div className="h-7 w-px bg-[#D1D5DB]" />
                        <div className="flex gap-3">
                          <div className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 shadow-sm">
                            <div className="h-[5px] w-14 rounded-full bg-emerald-400 mb-1.5" />
                            <div className="h-[4px] w-20 rounded-full bg-[#E5E7EB]" />
                          </div>
                          <div className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 shadow-sm">
                            <div className="h-[5px] w-16 rounded-full bg-amber-400 mb-1.5" />
                            <div className="h-[4px] w-12 rounded-full bg-[#E5E7EB]" />
                          </div>
                        </div>
                      </div>
                      {/* Connector */}
                      <div className="hidden sm:flex items-center pt-6">
                        <div className="h-px w-10 bg-[#D1D5DB]" />
                        <ArrowRight className="h-3 w-3 text-[#D1D5DB] -ml-1" />
                      </div>
                      {/* Right branch */}
                      <div className="hidden sm:flex flex-col items-center pt-4">
                        <div className="rounded-xl border border-[#E5E7EB] bg-white px-5 py-3 shadow-sm">
                          <div className="h-[6px] w-16 rounded-full bg-brand-400 mb-2" />
                          <div className="h-[5px] w-24 rounded-full bg-[#E5E7EB]" />
                        </div>
                        <div className="h-7 w-px bg-[#D1D5DB]" />
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-5 py-3 shadow-sm">
                          <div className="h-[5px] w-14 rounded-full bg-emerald-500 mb-2" />
                          <div className="h-[4px] w-20 rounded-full bg-emerald-200" />
                          <div className="mt-2.5 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            <span className="text-[8px] font-semibold text-emerald-600">Done</span>
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
        <section className="py-10 border-y border-black/[0.04]">
          <div className="mx-auto max-w-5xl px-6">
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
              {["Vercel", "Stripe", "Linear", "Notion", "Figma"].map((name) => (
                <span key={name} className="text-[15px] font-bold text-[#D1D5DB] select-none">{name}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section id="features" className="py-24">
          <div className="mx-auto max-w-5xl px-6">
            <FadeIn>
              <div className="text-center">
                <h2 className="text-[36px] font-bold tracking-tight text-[#111111]">Built for how teams actually work.</h2>
                <p className="mt-3 text-[16px] text-[#4B5563] max-w-md mx-auto">Not another list app. A visual system for managing complex, interconnected work.</p>
              </div>
            </FadeIn>
            <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Card icon={<GitBranch className="h-5 w-5" />} title="Dependency Graphs" desc="See what blocks what. Map relationships visually instead of guessing from a flat list." delay={0} />
              <Card icon={<Users className="h-5 w-5" />} title="Live Collaboration" desc="Work in real-time. See who's online, who's editing what — instantly synced." delay={60} />
              <Card icon={<Zap className="h-5 w-5" />} title="AI Generation" desc="Describe your project in words. Get a structured dependency graph in seconds." delay={120} />
              <Card icon={<Shield className="h-5 w-5" />} title="Approval Workflows" desc="Submit for review. Approvers get notified, approve or reject with one click." delay={180} />
              <Card icon={<BarChart3 className="h-5 w-5" />} title="Analytics" desc="Track completion rates, spot bottlenecks, balance workloads across teams." delay={240} />
              <Card icon={<Layers className="h-5 w-5" />} title="Nested Graphs" desc="Folders with sub-graphs inside. Organize at any scale without losing context." delay={300} />
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section id="how" className="py-24 bg-[#F9FAFB]">
          <div className="mx-auto max-w-5xl px-6">
            <FadeIn>
              <div className="text-center">
                <h2 className="text-[36px] font-bold tracking-tight text-[#111111]">Three steps to clarity.</h2>
                <p className="mt-3 text-[16px] text-[#4B5563] max-w-md mx-auto">From idea to structured execution in under a minute.</p>
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
                <Step num="1" title="Describe" desc="Tell threadline about your project in plain language — or pick a template." />
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
                <h2 className="text-[36px] font-bold tracking-tight text-[#111111]">Teams ship faster with threadline.</h2>
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
        <section className="py-24 bg-[#F9FAFB]">
          <div className="mx-auto max-w-5xl px-6">
            <FadeIn>
              <div className="mx-auto max-w-lg text-center">
                <h2 className="text-[36px] font-bold tracking-tight text-[#111111]">Ready to see clearly?</h2>
                <p className="mt-3 text-[16px] text-[#4B5563]">Start free. Set up in 60 seconds. No credit card required.</p>
                <div className="mt-8">
                  <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3 text-[14px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-700 hover:-translate-y-[1px] hover:shadow-md active:translate-y-0">
                    Start for free <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="mt-5 flex items-center justify-center gap-5 text-[12px] text-[#9CA3AF]">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />Free for 5 users</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />No credit card</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />Cancel anytime</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-black/[0.04] bg-white py-12">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center">
                <span className="text-[17px] font-extrabold text-[#111111]">thread</span>
                <span className="text-[17px] font-extrabold text-brand-600">line</span>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-[#9CA3AF] max-w-[180px]">Visual project management for teams who think in systems.</p>
            </div>
            <FooterCol title="Product" links={["Features", "Pricing", "Changelog"]} />
            <FooterCol title="Company" links={["About", "Blog", "Contact"]} />
            <FooterCol title="Legal" links={["Privacy", "Terms"]} />
          </div>
          <div className="mt-10 pt-6 border-t border-black/[0.04] flex items-center justify-between">
            <p className="text-[12px] text-[#9CA3AF]">&copy; {new Date().getFullYear()} threadline</p>
            <div className="flex items-center gap-3">
              <a href="#" className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors"><Globe className="h-4 w-4" /></a>
              <a href="#" className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors"><ExternalLink className="h-4 w-4" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── COMPONENTS ─── */

function Card({ icon, title, desc, delay }: { icon: React.ReactNode; title: string; desc: string; delay: number }) {
  return (
    <FadeIn delay={delay}>
      <div className="group rounded-2xl border border-black/[0.06] bg-white p-7 transition-all duration-200 ease-out hover:border-black/[0.1] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.07)] hover:-translate-y-[2px]">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F3FF] text-brand-600 transition-colors duration-200 group-hover:bg-brand-100">
          {icon}
        </div>
        <h3 className="text-[18px] font-semibold text-[#111111]">{title}</h3>
        <p className="mt-1.5 text-[14px] leading-relaxed text-[#4B5563]">{desc}</p>
      </div>
    </FadeIn>
  );
}

function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-[14px] font-bold text-white">{num}</div>
      <h3 className="text-[18px] font-semibold text-[#111111]">{title}</h3>
      <p className="mt-1.5 text-[14px] leading-relaxed text-[#4B5563]">{desc}</p>
    </div>
  );
}

function Quote({ text, author, role, delay }: { text: string; author: string; role: string; delay: number }) {
  return (
    <FadeIn delay={delay}>
      <div className="rounded-2xl border border-black/[0.06] bg-white p-7">
        <div className="flex gap-0.5 mb-4">
          {[...Array(5)].map((_, i) => (<Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />))}
        </div>
        <p className="text-[14px] leading-relaxed text-[#4B5563]">&ldquo;{text}&rdquo;</p>
        <div className="mt-5 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-brand-100" />
          <div>
            <p className="text-[13px] font-semibold text-[#111111]">{author}</p>
            <p className="text-[11px] text-[#9CA3AF]">{role}</p>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-[32px] font-bold tracking-tight text-[#111111]">{value}</p>
      <p className="text-[12px] text-[#9CA3AF] mt-0.5">{label}</p>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#9CA3AF]">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link}><a href="#" className="text-[13px] text-[#4B5563] hover:text-[#111111] transition-colors">{link}</a></li>
        ))}
      </ul>
    </div>
  );
}
