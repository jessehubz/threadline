import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: authStyles }} />
      <div className="auth-page flex min-h-screen">
        {/* Left panel — dark branding, immune to theme toggle */}
        <div className="auth-left relative hidden flex-1 flex-col justify-between overflow-hidden p-12 lg:flex">
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center" style={{ textDecoration: "none" }}>
              <span className="auth-logo-t1">Thread</span>
              <span className="auth-logo-t2">line</span>
            </Link>
          </div>

          <div className="relative z-10 max-w-md">
            <p className="auth-eyebrow">Visual dependency graphs</p>
            <h2 className="auth-heading">
              See how every task<br/><span className="auth-gradient-text">connects.</span>
            </h2>
            <p className="auth-subtext">
              Map dependencies on an infinite canvas. Know what&apos;s blocked, who&apos;s overloaded, and what ships next — at a glance.
            </p>

            <div className="auth-features">
              <FeaturePoint text="Drag-and-drop dependency graph editor" />
              <FeaturePoint text="AI generates task structures from descriptions" />
              <FeaturePoint text="Real-time collaboration with your team" />
            </div>
          </div>

          <p className="relative z-10" style={{ fontSize: "12px", color: "#626268" }}>
            &copy; 2026 Threadline
          </p>
        </div>

        {/* Right panel — form area, responds to theme toggle */}
        <div className="auth-right flex flex-1 flex-col items-center justify-center px-6 py-12">
          <div className="mb-8 flex items-center lg:hidden">
            <span className="auth-logo-t1-right">Thread</span>
            <span className="auth-logo-t2-right">line</span>
          </div>

          <div className="w-full max-w-[400px]">
            <div className="auth-custom-header">
              <h1 className="auth-custom-title">
                Welcome back<span className="auth-title-dot">.</span>
              </h1>
              <p className="auth-custom-subtitle">
                Pick up where you left off — your graphs are waiting.
              </p>
            </div>

            <SignIn
              appearance={{
                variables: {
                  colorPrimary: "#8B5CF6",
                  colorBackground: "transparent",
                },
                elements: {
                  cardBox: { boxShadow: "none", background: "transparent" },
                  card: { backgroundColor: "transparent", boxShadow: "none", border: "none", padding: 0 },
                  headerTitle: { display: "none" },
                  headerSubtitle: { display: "none" },
                  header: { display: "none" },
                  main: { background: "transparent" },
                  socialButtonsBlockButton: {
                    border: "1px solid var(--border-default)",
                    borderRadius: "10px",
                    transition: "all 0.2s ease",
                  },
                  formButtonPrimary: {
                    backgroundColor: "#8B5CF6",
                    borderRadius: "10px",
                    transition: "all 0.2s ease",
                  },
                  formFieldInput: {
                    borderRadius: "10px",
                    border: "1px solid var(--border-default)",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  },
                  footerAction: { display: "none" },
                },
              }}
            />

            <p className="auth-account-link">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up">Create one free</Link>
            </p>

            <div className="auth-footer-line">
              <span>&copy; 2026 Threadline</span>
              <span className="auth-footer-sep">&middot;</span>
              <a href="/privacy">Privacy</a>
              <span className="auth-footer-sep">&middot;</span>
              <a href="/terms">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function FeaturePoint({ text }: { text: string }) {
  return (
    <div className="auth-feature-item">
      <div className="auth-feature-icon">
        <svg width="10" height="10" viewBox="0 0 20 20"><path d="M5 10l3.5 3.5L15 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
      </div>
      <span>{text}</span>
    </div>
  );
}

const authStyles = `
/* ===== PAGE LAYOUT ===== */
.auth-page { background: var(--bg-base); }

/* ===== LEFT PANEL — hardcoded dark, immune to theme ===== */
.auth-left {
  background-color: #0A0A0B;
  background-image:
    radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px),
    radial-gradient(ellipse 500px 400px at 15% 10%, rgba(139,92,246,0.12), transparent 65%),
    radial-gradient(ellipse 450px 350px at 85% 90%, rgba(139,92,246,0.09), transparent 65%);
  background-size: 28px 28px, auto, auto;
  background-repeat: repeat, no-repeat, no-repeat;
  border-right: 1px solid rgba(255,255,255,0.06);
}
.auth-logo-t1 { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: #F2F2F4; }
.auth-logo-t2 { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: #8B5CF6; }
.auth-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #8B5CF6; margin-bottom: 18px; }
.auth-heading { font-size: 57px; font-weight: 200; letter-spacing: -0.03em; line-height: 1.1; color: #F2F2F4; margin-bottom: 22px; }
.auth-subtext { font-size: 22px; color: #98989F; line-height: 1.65; max-width: 460px; }
.auth-features { margin-top: 36px; display: flex; flex-direction: column; gap: 14px; }
.auth-feature-item { display: flex; align-items: center; gap: 10px; font-size: 13.5px; color: #98989F; }
.auth-feature-icon { width: 20px; height: 20px; border-radius: 6px; background: rgba(139,92,246,0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #8B5CF6; }
.auth-gradient-text {
  font-weight: 600;
  background: linear-gradient(120deg, #C4B5FD, #6D28D9);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* ===== RIGHT PANEL — responds to theme toggle ===== */
.auth-right {
  background: var(--auth-right-bg);
}
:root { 
  --auth-right-bg: var(--bg-base);
  --clerk-card-bg: transparent;
  --clerk-body-text: #1A1A1A;
}
.dark { 
  --auth-right-bg: var(--bg-base);
  --clerk-card-bg: transparent;
  --clerk-body-text: #F2F2F4;
}

/* Mobile logo (only shows when left panel hidden) */
.auth-logo-t1-right { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: var(--text-primary); }
.auth-logo-t2-right { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: #8B5CF6; }

/* ===== CUSTOM HEADER ===== */
.auth-custom-header { margin-bottom: 32px; }
.auth-custom-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  margin-bottom: 10px;
  line-height: 1.2;
}
.auth-title-dot {
  color: #8B5CF6;
}
.auth-custom-subtitle {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* ===== HIDE CLERK'S INTERNAL HEADER (not dev banner) ===== */
.cl-headerTitle,
.cl-headerSubtitle,
.cl-header {
  display: none !important;
}

/* ===== HIDE "Secured by Clerk" badge ===== */
.cl-footer {
  display: none !important;
}
.cl-internal-b3fm6y,
a[href*="clerk.com"],
[class*="powered"] {
  display: none !important;
}

/* ===== DEV MODE BANNER — white bg in light mode ===== */
.cl-internal-17z82o4,
[class*="development-mode"],
.cl-dev-mode-notice {
  background-color: var(--auth-right-bg) !important;
  border: 1px solid var(--border-default) !important;
  color: var(--text-secondary) !important;
}

/* ===== CLERK CARD — no overflow clipping ===== */
.cl-card,
.cl-cardBox,
.cl-rootBox {
  overflow: visible !important;
}

/* ===== FORCE CLERK BACKGROUND TO MATCH RIGHT PANEL ===== */
.cl-card,
.cl-cardBox,
.cl-rootBox,
.cl-signIn-root,
.cl-signUp-root,
.cl-formFieldRow,
.cl-formField,
.cl-identityPreview,
.cl-identityPreviewEditButton,
.cl-otpCodeField,
.cl-main {
  background-color: transparent !important;
  background: transparent !important;
}

/* globals.css defines .cl-card.cl-card (2 classes) for the UserProfile modal,
   which outranks the single-class rule above regardless of stylesheet order —
   this is why the card kept its opaque background. Match that specificity. */
.cl-card.cl-card.cl-card {
  background-color: transparent !important;
  background: transparent !important;
}

/* Force all Clerk internal container backgrounds */
.auth-right .cl-internal-b97m6y,
.auth-right .cl-internal-vqda6,
.auth-right [class^="cl-internal"],
.auth-right [class*="__internal"] {
  background-color: transparent !important;
  background: transparent !important;
}

/* Clerk text colors to match theme */
.cl-formFieldLabel,
.cl-formFieldLabelRow label,
.cl-dividerText,
.cl-socialButtonsBlockButtonText,
.cl-formFieldAction,
.cl-otpCodeFieldInput,
.cl-alternativeMethods button,
.cl-identityPreviewText {
  color: var(--text-primary) !important;
}
.cl-dividerLine {
  background: var(--border-default) !important;
}
.cl-formFieldHintText,
.cl-footerActionText {
  color: var(--text-secondary) !important;
}
.cl-formFieldSuccessText {
  color: var(--accent) !important;
}

/* Clerk link colors */
.cl-formFieldAction .cl-formFieldActionLink,
.cl-footer a,
.cl-alternativeMethods button {
  color: #8B5CF6 !important;
}

/* ===== CLERK CARD INTERACTIONS ===== */
/* Social buttons (Continue with Google) — visible solid border on all sides */
.cl-socialButtonsBlockButton {
  border: 1.5px solid #D4D4D8 !important;
  border-radius: 10px !important;
  background: var(--bg-elevated) !important;
  transition: border-color 0.2s ease !important;
}
.dark .cl-socialButtonsBlockButton {
  border-color: rgba(255,255,255,0.12) !important;
  background: transparent !important;
}
.cl-socialButtonsBlockButton:hover {
  border-color: #8B5CF6 !important;
}

/* Primary button (Continue) — clean purple, subtle darken on hover, no lift */
.cl-formButtonPrimary {
  background-color: #8B5CF6 !important;
  border-radius: 10px !important;
  font-weight: 600 !important;
  border: none !important;
  transition: background-color 0.15s ease !important;
}
.cl-formButtonPrimary:hover {
  background-color: #7C3AED !important;
}

/* Input fields — solid visible border + focus purple ring */
.cl-formFieldInput {
  border: 1.5px solid #D4D4D8 !important;
  border-radius: 10px !important;
  background: var(--bg-elevated) !important;
  transition: border-color 0.15s ease, box-shadow 0.15s ease !important;
}
.dark .cl-formFieldInput {
  border-color: rgba(255,255,255,0.12) !important;
  background: transparent !important;
}
.cl-formFieldInput:focus {
  border-color: #8B5CF6 !important;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1) !important;
}

/* Hide Clerk's footer action (Don't have an account?) but keep dev mode */
.cl-footerAction {
  display: none !important;
}

/* ===== ACCOUNT LINK ===== */
.auth-account-link {
  margin-top: 28px;
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
}
.auth-account-link a {
  color: #8B5CF6;
  text-decoration: none;
  font-weight: 700;
  transition: color 0.15s ease;
}
.auth-account-link a:hover {
  color: #7C3AED;
}

/* ===== FOOTER ===== */
.auth-footer-line {
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--border-default);
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.auth-footer-sep { color: var(--text-muted); opacity: 0.5; }
.auth-footer-line a {
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.15s ease;
}
.auth-footer-line a:hover {
  color: #8B5CF6;
}
`;
