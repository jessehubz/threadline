import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: authStyles }} />
      <div className="auth-page flex min-h-screen">
        {/* Left panel - dark branding, immune to theme toggle */}
        <div className="auth-left relative hidden flex-col justify-between overflow-hidden p-12 lg:flex lg:w-1/2 lg:flex-none">
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center" style={{ textDecoration: "none" }}>
              <span className="auth-logo-t1">thread</span>
              <span className="auth-logo-t2">line</span>
            </Link>
          </div>

          <div className="relative z-10 max-w-none">
            <p className="auth-eyebrow">Visual dependency graphs</p>
            <h2 className="auth-heading">
              See how every task<br />
              <span className="auth-gradient-text">connects.</span>
            </h2>
            <p className="auth-subtext">
              Map dependencies on an infinite canvas. Know what&apos;s blocked, who&apos;s overloaded, and what ships next at a glance.
            </p>

            <div className="auth-features">
              <FeaturePoint text="Drag-and-drop dependency graph editor" />
              <FeaturePoint text="AI generates task structures from descriptions" />
              <FeaturePoint text="Real-time collaboration with your team" />
            </div>
          </div>

          <p className="relative z-10" style={{ fontSize: "12px", color: "#626268" }}>
            &copy; 2026 threadline
          </p>
        </div>

        {/* Right panel - form area, responds to theme toggle */}
        <div className="auth-right flex flex-1 flex-col items-center justify-center px-6 py-12 lg:w-1/2 lg:flex-none">
          <Link
            href="/"
            className="auth-mobile-logo mb-7 flex items-center lg:hidden"
            style={{ textDecoration: "none" }}
          >
            <span className="auth-logo-t1-right">thread</span>
            <span className="auth-logo-t2-right">line</span>
          </Link>
          <div className="auth-mobile-divider lg:hidden" />

          <div className="w-full max-w-110">
            <div className="auth-custom-header">
              <h1 className="auth-custom-title">
                Welcome back.
              </h1>
              <p className="auth-custom-subtitle">
                Pick up where you left off. Your teams are waiting!
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
              Don&apos;t have an account?  {""}     
              <Link href="/sign-up">Create one free</Link>
            </p>

            <div className="auth-footer-line">
              <span>&copy; 2026 threadline</span>
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
        <svg width="13" height="13" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.4" fill="none" opacity="0.35"/><path d="M6 10.2l2.6 2.6L14.5 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
      </div>
      <span>{text}</span>
    </div>
  );
}

const authStyles = `
/* ===== PAGE LAYOUT ===== */
.auth-page { background: var(--bg-base); }

/* ===== LEFT PANEL - hardcoded dark, immune to theme ===== */
.auth-left {
  background-color: #0A0A0B;
  background-image:
    radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px),
    radial-gradient(ellipse 500px 400px at 15% 10%, rgba(139,92,246,0.06), transparent 65%),
    radial-gradient(ellipse 450px 350px at 85% 90%, rgba(139,92,246,0.045), transparent 65%);
  background-size: 28px 28px, auto, auto;
  background-repeat: repeat, no-repeat, no-repeat;
  border-right: 1px solid rgba(255,255,255,0.06);
}
.auth-logo-t1 { font-family: 'Inter', sans-serif; font-size: 22px; font-weight: 450; letter-spacing: 0.05em; color: #F2F2F4; }
.auth-logo-t2 { font-family: 'Inter', sans-serif; font-size: 22px; font-weight: 450; letter-spacing: 0.05em; color: #7C3AED; }
.auth-eyebrow { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: #8B5CF6; margin-bottom: 20px; }
.auth-heading { font-family: "Inter", sans-serif; font-size: 54px; font-weight: 400; letter-spacing: -0.03em; line-height: 1.15; color: #F2F2F4; margin-bottom: 24px; }
.auth-subtext { font-family: "Figtree", sans-serif; font-size: 17px; font-weight: 400; color: #98989F; line-height: 1.6; max-width: 480px; }
.auth-features { margin-top: 36px; padding-top: 26px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; gap: 18px; }
.auth-feature-item { display: flex; align-items: center; gap: 12px; font-family: "Figtree", sans-serif; font-size: 15px; font-weight: 500; color: #C4C4CC; }
.auth-feature-icon { width: 21px; height: 21px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #A78BFA; }
.auth-gradient-text {
  color: #7C3AED;
  font-weight: 600;
}

/* ===== RIGHT PANEL - responds to theme toggle ===== */
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
.auth-mobile-logo { transition: opacity 0.15s ease; }
.auth-mobile-logo:hover { opacity: 0.75; }
.auth-logo-t1-right { font-family: 'Inter', sans-serif; font-size: 25px; font-weight: 450; letter-spacing: 0.05em; color: var(--text-primary); margin-bottom: 0; }
.auth-logo-t2-right { font-family: 'Inter', sans-serif; font-size: 25px; font-weight: 450; letter-spacing: 0.05em; color: #7C3AED; margin-bottom: 0; }

/* Mobile divider between logo and form - fades at the edges instead of a hard-stopped rule */
.auth-mobile-divider {
  width: 100%;
  max-width: 440px;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--border-default) 20%, var(--border-default) 80%, transparent);
  margin-bottom: 28px;
}

/* ===== CUSTOM HEADER ===== */
.auth-custom-header { margin-bottom: 40px; }
.auth-custom-title {
  font-family: "Inter", sans-serif;
  font-size: 35px;
  font-weight: 350;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  margin-bottom: 12px;
  line-height: 1.15;
}
.auth-title-dot {
  color: #7C3AED;
}
.auth-custom-subtitle {
  font-family: "Figtree", sans-serif;
  font-size: 16px;
  font-weight: 400;
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

/* ===== DEV MODE BANNER - white bg in light mode ===== */
.cl-internal-17z82o4,
[class*="development-mode"],
.cl-dev-mode-notice {
  background-color: var(--auth-right-bg) !important;
  border: 1px solid var(--border-default) !important;
  color: var(--text-secondary) !important;
}

/* ===== CLERK CARD - no overflow clipping ===== */
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
   which outranks the single-class rule above regardless of stylesheet order -
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
/* Social buttons (Continue with Google) - visible solid border on all sides */
.cl-socialButtonsBlockButton {
  border: 1.5px solid #D4D4D8 !important;
  border-radius: 10px !important;
  background: var(--bg-elevated) !important;
  transition: border-color 0.2s ease !important;
  font-size: 14.5px !important;
  padding: 11px 14px !important;
}
.dark .cl-socialButtonsBlockButton {
  border-color: rgba(255,255,255,0.12) !important;
  background: transparent !important;
}
.cl-socialButtonsBlockButton:hover {
  border-color: #8B5CF6 !important;
}

/* Primary button (Continue) - clean purple, subtle darken on hover, no lift */
.cl-formButtonPrimary {
  background-color: #8B5CF6 !important;
  border-radius: 10px !important;
  font-weight: 600 !important;
  font-size: 14.5px !important;
  padding: 12px 20px !important;
  border: none !important;
  transition: background-color 0.15s ease !important;
}
.cl-formButtonPrimary:hover {
  background-color: #7C3AED !important;
}

/* Input fields - solid visible border + focus purple ring */
.cl-formFieldInput {
  border: 1.5px solid #D4D4D8 !important;
  border-radius: 10px !important;
  background: var(--bg-elevated) !important;
  transition: border-color 0.15s ease, box-shadow 0.15s ease !important;
  font-size: 14.5px !important;
  padding: 11px 14px !important;
}
.dark .cl-formFieldInput {
  border-color: rgba(255,255,255,0.12) !important;
  background: transparent !important;
}
.cl-formFieldInput:focus {
  border-color: #8B5CF6 !important;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1) !important;
}
.cl-formFieldLabel {
  font-size: 13.5px !important;
}

/* Hide Clerk's footer action (Don't have an account?) but keep dev mode */
.cl-footerAction {
  display: none !important;
}

/* ===== ACCOUNT LINK ===== */
.auth-account-link {
  margin-top: 28px;
  font-family: "Figtree", sans-serif;
  font-size: 15px;
  font-weight: 400;
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

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .auth-right {
    padding: 32px 24px;
  }
  .auth-custom-title {
    font-size: 30px;
  }
}
@media (max-width: 640px) {
  .auth-right {
    padding: 24px 18px;
  }
  .auth-custom-header {
    margin-bottom: 28px;
  }
  .auth-custom-title {
    font-size: 26px;
  }
  .auth-custom-subtitle {
    font-size: 14.5px;
  }
  .auth-logo-t1-right {
    font-size: 21px;
  }
  .auth-logo-t2-right {
    font-size: 21px;
  }
  .auth-account-link {
    font-size: 14px;
    margin-top: 22px;
  }
  .auth-footer-line {
    margin-top: 24px;
    flex-wrap: wrap;
    gap: 4px;
  }
}
`;
