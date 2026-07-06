import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - Branding */}
      <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 p-12 lg:flex">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-xl font-bold text-white">thread</span>
          <span className="text-xl font-bold text-brand-200">line</span>
        </Link>

        <div className="max-w-md">
          <h2 className="text-3xl font-bold text-white">
            Follow every thread.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-brand-100">
            Visualize dependencies, collaborate in real-time, and ship projects faster with graph-based task management.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <svg className="h-4 w-4 text-brand-200" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
              <span className="text-sm text-brand-100">Infinite canvas with visual dependency mapping</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <svg className="h-4 w-4 text-brand-200" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
              <span className="text-sm text-brand-100">Real-time collaboration with presence indicators</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <svg className="h-4 w-4 text-brand-200" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
              <span className="text-sm text-brand-100">Built-in approvals, analytics, and messaging</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-brand-200/60">
          &copy; {new Date().getFullYear()} Threadline
        </p>
      </div>

      {/* Right panel - Sign In form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 flex items-center gap-1 lg:hidden">
          <span className="text-xl font-bold text-[#1A1A1A]">thread</span>
          <span className="text-xl font-bold text-brand-600">line</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Welcome back</h1>
            <p className="mt-2 text-sm text-[#6B7280]">
              Sign in to your account to continue
            </p>
          </div>
          <SignIn />
        </div>
      </div>
    </div>
  );
}
