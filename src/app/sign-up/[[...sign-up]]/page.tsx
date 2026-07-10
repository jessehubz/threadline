import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { GitBranch, Shield, Zap, Users } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - Value proposition */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-page p-12 lg:flex">
        {/* Background decoration - subtle violet glow orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[var(--accent)]/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[var(--accent)]/8 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[var(--accent)]/5 blur-3xl" />
          {/* Dot grid pattern */}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="text-xl font-bold text-heading font-[var(--font-logo)]">Thread</span>
            <span className="text-xl font-bold accent-color font-[var(--font-logo)]">line</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-[36px] font-bold leading-tight text-heading tracking-tight">
            Start building<br />
            <span className="accent-color">something great.</span>
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-body">
            Join thousands of teams who manage projects visually. Set up your workspace in under 60 seconds — no credit card required.
          </p>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 gap-6">
            <div>
              <p className="text-[28px] font-bold text-heading">2K+</p>
              <p className="text-[12px] text-body mt-0.5">Active teams</p>
            </div>
            <div>
              <p className="text-[28px] font-bold text-heading">50K+</p>
              <p className="text-[12px] text-body mt-0.5">Tasks managed</p>
            </div>
            <div>
              <p className="text-[28px] font-bold text-heading">99.9%</p>
              <p className="text-[12px] text-body mt-0.5">Uptime</p>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-10 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
            <p className="text-[14px] text-heading/90 leading-relaxed italic">
              &ldquo;Threadline replaced our Jira board and three other tools. The graph view makes complex dependencies actually manageable.&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-[var(--accent)]/50" />
              <div>
                <p className="text-[12px] font-medium text-heading">Sarah Chen</p>
                <p className="text-[11px] text-body/60">Engineering Lead</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-[12px] text-body/40">
          &copy; {new Date().getFullYear()} Threadline. All rights reserved.
        </p>
      </div>

      {/* Right panel - Sign Up form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-page">
        <div className="mb-10 flex items-center gap-1 lg:hidden">
          <span className="text-xl font-bold text-heading font-[var(--font-logo)]">Thread</span>
          <span className="text-xl font-bold accent-color font-[var(--font-logo)]">line</span>
        </div>

        <div className="w-full max-w-[380px]">
          <div className="mb-8">
            <h1 className="text-[24px] font-bold text-heading tracking-tight">Create your account</h1>
            <p className="mt-1.5 text-[14px] text-body leading-relaxed">
              Free for teams up to 5. Start managing projects visually in seconds.
            </p>
          </div>
          <SignUp />
          <p className="mt-6 text-center text-[12px] text-dim">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
