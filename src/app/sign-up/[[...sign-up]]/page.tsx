import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { GitBranch, Shield, Zap, Users } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--bg-base)" }}>
      {/* Left panel - Value proposition */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden p-12 lg:flex" style={{ backgroundColor: "var(--bg-base)" }}>
        {/* Background decoration - subtle violet glow orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[var(--accent)]/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[var(--accent)]/8 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[var(--accent)]/5 blur-3xl" />
          {/* Dot grid pattern */}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="text-xl font-bold font-[var(--font-logo)]" style={{ color: "var(--text-primary)" }}>Thread</span>
            <span className="text-xl font-bold accent-color font-[var(--font-logo)]">line</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-[36px] font-bold leading-tight tracking-tight" style={{ color: "var(--text-primary)" }}>
            Start building<br />
            <span className="accent-color">something great.</span>
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Join thousands of teams who manage projects visually. Set up your workspace in under 60 seconds — no credit card required.
          </p>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 gap-6">
            <div>
              <p className="text-[28px] font-bold" style={{ color: "var(--text-primary)" }}>2K+</p>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--text-secondary)" }}>Active teams</p>
            </div>
            <div>
              <p className="text-[28px] font-bold" style={{ color: "var(--text-primary)" }}>50K+</p>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--text-secondary)" }}>Tasks managed</p>
            </div>
            <div>
              <p className="text-[28px] font-bold" style={{ color: "var(--text-primary)" }}>99.9%</p>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--text-secondary)" }}>Uptime</p>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-10 rounded-xl p-5" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
            <p className="text-[14px] leading-relaxed italic" style={{ color: "var(--text-primary)" }}>
              &ldquo;Threadline replaced our Jira board and three other tools. The graph view makes complex dependencies actually manageable.&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-[var(--accent)]/50" />
              <div>
                <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>Sarah Chen</p>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Engineering Lead</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-[12px]" style={{ color: "var(--text-muted)" }}>
          &copy; {new Date().getFullYear()} Threadline. All rights reserved.
        </p>
      </div>

      {/* Right panel - Sign Up form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12" style={{ backgroundColor: "var(--bg-base)" }}>
        {/* Mobile logo */}
        <div className="mb-10 flex items-center gap-1 lg:hidden">
          <span className="text-xl font-bold font-[var(--font-logo)]" style={{ color: "var(--text-primary)" }}>Thread</span>
          <span className="text-xl font-bold accent-color font-[var(--font-logo)]">line</span>
        </div>

        {/* Card container */}
        <div
          className="w-full max-w-[440px] px-8 py-10"
          style={{
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: "28px",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {/* Wordmark */}
          <div className="mb-6 flex items-center justify-center gap-1">
            <span className="text-2xl font-bold font-[var(--font-logo)]" style={{ color: "var(--text-primary)" }}>Thread</span>
            <span className="text-2xl font-bold accent-color font-[var(--font-logo)]">line</span>
          </div>

          <div className="mb-6 text-center">
            <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Create your account</h1>
            <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Free for teams up to 5. Start managing projects visually in seconds.
            </p>
          </div>

          <SignUp />

          <p className="mt-6 text-center text-[12px]" style={{ color: "var(--text-muted)" }}>
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
