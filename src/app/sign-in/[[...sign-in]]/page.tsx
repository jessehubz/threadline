import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { GitBranch, Shield, Zap, Users } from "lucide-react";

export default function SignInPage() {
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
            Follow every thread.<br />
            <span className="accent-color">Ship every project.</span>
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-body">
            The visual project management tool that maps dependencies, tracks progress, and keeps your whole team aligned — all on one infinite canvas.
          </p>

          {/* Feature highlights */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
              <GitBranch className="h-5 w-5 accent-color mb-2" />
              <p className="text-[13px] font-medium text-heading">Dependency Graphs</p>
              <p className="text-[12px] text-body mt-0.5">See how tasks connect</p>
            </div>
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
              <Zap className="h-5 w-5 accent-color mb-2" />
              <p className="text-[13px] font-medium text-heading">Real-time Sync</p>
              <p className="text-[12px] text-body mt-0.5">Live collaboration</p>
            </div>
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
              <Users className="h-5 w-5 accent-color mb-2" />
              <p className="text-[13px] font-medium text-heading">Team Management</p>
              <p className="text-[12px] text-body mt-0.5">Roles & approvals</p>
            </div>
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
              <Shield className="h-5 w-5 accent-color mb-2" />
              <p className="text-[13px] font-medium text-heading">Secure by Default</p>
              <p className="text-[12px] text-body mt-0.5">End-to-end encryption</p>
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="h-8 w-8 rounded-full bg-[var(--accent)]/60 ring-2 ring-[var(--bg-base)]" />
              <div className="h-8 w-8 rounded-full bg-[var(--accent)]/50 ring-2 ring-[var(--bg-base)]" />
              <div className="h-8 w-8 rounded-full bg-[var(--accent)]/40 ring-2 ring-[var(--bg-base)]" />
            </div>
            <p className="text-[13px] text-body">Trusted by 2,000+ teams shipping faster</p>
          </div>
        </div>

        <p className="relative z-10 text-[12px] text-body/40">
          &copy; {new Date().getFullYear()} Threadline. All rights reserved.
        </p>
      </div>

      {/* Right panel - Sign In form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-page">
        <div className="mb-10 flex items-center gap-1 lg:hidden">
          <span className="text-xl font-bold text-heading font-[var(--font-logo)]">Thread</span>
          <span className="text-xl font-bold accent-color font-[var(--font-logo)]">line</span>
        </div>

        <div className="w-full max-w-[380px]">
          <div className="mb-8">
            <h1 className="text-[24px] font-bold text-heading tracking-tight">Welcome back</h1>
            <p className="mt-1.5 text-[14px] text-body leading-relaxed">
              Sign in to continue managing your projects and collaborating with your team.
            </p>
          </div>
          <SignIn />
          <p className="mt-6 text-center text-[12px] text-dim">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
