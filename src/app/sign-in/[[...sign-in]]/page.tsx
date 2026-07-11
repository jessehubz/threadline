import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { GitBranch, Shield, Zap, Users } from "lucide-react";

export default function SignInPage() {
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
            Follow every thread.<br />
            <span className="accent-color">Ship every project.</span>
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            The visual project management tool that maps dependencies, tracks progress, and keeps your whole team aligned — all on one infinite canvas.
          </p>

          {/* Feature highlights */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
              <GitBranch className="h-5 w-5 accent-color mb-2" />
              <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>Dependency Graphs</p>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--text-secondary)" }}>See how tasks connect</p>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
              <Zap className="h-5 w-5 accent-color mb-2" />
              <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>Real-time Sync</p>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--text-secondary)" }}>Live collaboration</p>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
              <Users className="h-5 w-5 accent-color mb-2" />
              <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>Team Management</p>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--text-secondary)" }}>Roles & approvals</p>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
              <Shield className="h-5 w-5 accent-color mb-2" />
              <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>Secure by Default</p>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--text-secondary)" }}>End-to-end encryption</p>
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="h-8 w-8 rounded-full bg-[var(--accent)]/60 ring-2 ring-[var(--bg-base)]" />
              <div className="h-8 w-8 rounded-full bg-[var(--accent)]/50 ring-2 ring-[var(--bg-base)]" />
              <div className="h-8 w-8 rounded-full bg-[var(--accent)]/40 ring-2 ring-[var(--bg-base)]" />
            </div>
            <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>Trusted by 2,000+ teams shipping faster</p>
          </div>
        </div>

        <p className="relative z-10 text-[12px]" style={{ color: "var(--text-muted)" }}>
          &copy; {new Date().getFullYear()} Threadline. All rights reserved.
        </p>
      </div>

      {/* Right panel - Sign In form */}
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
            <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Welcome back</h1>
            <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Sign in to continue managing your projects and collaborating with your team.
            </p>
          </div>

          <SignIn />

          <p className="mt-6 text-center text-[12px]" style={{ color: "var(--text-muted)" }}>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
