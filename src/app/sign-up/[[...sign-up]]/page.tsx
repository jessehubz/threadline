import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { AuthShell, clerkAuthAppearance } from "@/components/marketing/auth-shell";

export const metadata: Metadata = { title: "Sign up — Threadline" };

export default function SignUpPage() {
  return (
    <AuthShell
      heading="Stop asking what's next."
      subtext="Set up in under 60 seconds — no credit card required."
      title="Sign up"
      switchLink={
        <>Already have an account? <Link href="/sign-in">Sign in</Link></>
      }
    >
      <SignUp appearance={clerkAuthAppearance} />
    </AuthShell>
  );
}
