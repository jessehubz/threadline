import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { GitBranch, Shield, Zap, Users } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - Value proposition */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-brand-700 p-12 lg:flex">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-brand-600/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-brand-800/40 blur-3xl" />
          {/* Dot grid pattern */}
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="text-xl font-bold text-white">thread</span>
            <span className="text-xl font-bold text-brand-200">line</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-[36px] font-bold leading-tight text-white tracking-tight">
            Follow every thread.<br />
            <span className="text-brand-200">Ship every project.</span>
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-brand-100/80">
            The visual project management tool that maps dependencies, tracks progress, and keeps your whole team aligned — all on one infinite canvas.
          </p>

          {/* Feature highlights */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
              <GitBranch className="h-5 w-5 text-brand-200 mb-2" />
              <p className="text-[13px] font-medium text-white">Dependency Graphs</p>
              <p className="text-[12px] text-brand-200/70 mt-0.5">See how tasks connect</p>
            </div>
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
              <Zap className="h-5 w-5 text-brand-200 mb-2" />
              <p className="text-[13px] font-medium text-white">Real-time Sync</p>
              <p className="text-[12px] text-brand-200/70 mt-0.5">Live collaboration</p>
            </div>
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
              <Users className="h-5 w-5 text-brand-200 mb-2" />
              <p className="text-[13px] font-medium text-white">Team Management</p>
              <p className="text-[12px] text-brand-200/70 mt-0.5">Roles & approvals</p>
            </div>
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
              <Shield className="h-5 w-5 text-brand-200 mb-2" />
              <p className="text-[13px] font-medium text-white">Secure by Default</p>
              <p className="text-[12px] text-brand-200/70 mt-0.5">End-to-end encryption</p>
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="h-8 w-8 rounded-full bg-brand-300 ring-2 ring-brand-700" />
              <div className="h-8 w-8 rounded-full bg-brand-400 ring-2 ring-brand-700" />
              <div className="h-8 w-8 rounded-full bg-brand-200 ring-2 ring-brand-700" />
            </div>
            <p className="text-[13px] text-brand-100/80">Trusted by 2,000+ teams shipping faster</p>
          </div>
        </div>

        <p className="relative z-10 text-[12px] text-brand-200/40">
          &copy; {new Date().getFullYear()} threadline. All rights reserved.
        </p>
      </div>

      {/* Right panel - Sign In form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-[#FAFAF8]">
        <div className="mb-10 flex items-center gap-1 lg:hidden">
          <span className="text-xl font-bold text-[#1A1A1A]">thread</span>
          <span className="text-xl font-bold text-brand-600">line</span>
        </div>

        <div className="w-full max-w-[380px]">
          <div className="mb-8">
            <h1 className="text-[24px] font-bold text-[#1A1A1A] tracking-tight">Welcome back</h1>
            <p className="mt-1.5 text-[14px] text-[#6B7280] leading-relaxed">
              Sign in to continue managing your projects and collaborating with your team.
            </p>
          </div>
          <SignIn />
          <p className="mt-6 text-center text-[12px] text-[#9CA3AF]">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
