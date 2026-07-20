import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { AuthShell, clerkAuthAppearance } from "@/components/marketing/auth-shell";

export const metadata: Metadata = { title: "Sign in — Threadline" };

export default function SignInPage() {
  return (
    <AuthShell
      heading="See how every task connects."
      subtext="Pick up where you left off — your teams are waiting."
      title="Sign in"
      switchLink={
        <>Don&apos;t have an account? <Link href="/sign-up">Sign up</Link></>
      }
    >
      <SignIn appearance={clerkAuthAppearance} />
    </AuthShell>
  );
}
