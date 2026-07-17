"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";

const MIN_LEFT_PERCENT = 25;
const MAX_LEFT_PERCENT = 65;
const CENTER_PERCENT = 50;
const SNAP_THRESHOLD = 3; // snaps to center when within ±3% of 50%

export default function SignUpPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  // Pointer Events approach: setPointerCapture ensures all subsequent pointer
  // events (move, up) are delivered to the divider element itself — no window
  // listeners needed, no timing gap with React 19 concurrent rendering.
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    setIsDragging(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Only process if we have pointer capture (i.e., dragging)
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    let percent = ((e.clientX - rect.left) / rect.width) * 100;
    percent = Math.min(MAX_LEFT_PERCENT, Math.max(MIN_LEFT_PERCENT, percent));
    // Snap to center when within threshold
    if (Math.abs(percent - CENTER_PERCENT) < SNAP_THRESHOLD) {
      percent = CENTER_PERCENT;
    }
    setLeftWidth(percent);
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.hasPointerCapture(e.pointerId)) {
      target.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: authStyles }} />
      <div ref={containerRef} className="auth-page flex min-h-screen">
        {/* Left panel - dark branding, immune to theme toggle */}
        <div
          className="auth-left relative hidden flex-none flex-col justify-between overflow-hidden p-12 lg:flex"
          style={{ width: `${leftWidth}%` }}
        >
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center" style={{ textDecoration: "none" }}>
              <span className="auth-logo-t1">thread</span>
              <span className="auth-logo-t2">line</span>
            </Link>
          </div>

          <div className="relative z-10 max-w-none">
            <h2 className="auth-heading">
              Stop asking<br/><span className="auth-gradient-text">what&apos;s next.</span>
            </h2>
            <p className="auth-subtext">
              Join thousands of teams who manage projects as visual dependency graphs. Set up in under 60 seconds with no credit card required.
            </p>

            <div className="auth-stats">
              <div className="auth-stat">
                <span className="auth-stat-value">Free</span>
                <span className="auth-stat-label">While in beta</span>
              </div>
              <div className="auth-stat">
                <span className="auth-stat-value">Solo-built</span>
                <span className="auth-stat-label">No team, no funding</span>
              </div>
              <div className="auth-stat">
                <span className="auth-stat-value">Real-time</span>
                <span className="auth-stat-label">Live collaboration</span>
              </div>
            </div>

            <div className="auth-quote">
              <p>&ldquo;The graph view makes complex dependencies actually manageable.&rdquo;</p>
              <div className="auth-quote-person">
                <span className="auth-quote-name">&mdash; Threadline principles</span>
                <span className="auth-quote-role">Graph-first workflow</span>
              </div>
            </div>
          </div>

          <p className="relative z-10" style={{ fontSize: "12px", color: "#626268" }}>
            &copy; 2026 Threadline
          </p>
        </div>

        {/* Draggable divider - lg+ only, matches the left/right split */}
        <div
          className={`auth-divider hidden lg:flex${isDragging ? " auth-divider-active" : ""}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />

        {/* Right panel - form area, responds to theme toggle */}
        <div className="auth-right flex flex-1 flex-col items-center justify-center px-6 py-12">
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
                Get started
              </h1>
              <p className="auth-custom-subtitle">
                Create your free workspace and start mapping dependencies
              </p>
            </div>

            <SignUp
              appearance={{
                variables: {
                  colorPrimary: "var(--accent)",
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
                    transition: "background-color 0.2s ease, border-color 0.2s ease",
                    overflow: "visible",
                    whiteSpace: "normal",
                    minHeight: "auto",
                  },
                  socialButtonsBlockButtonText: {
                    overflow: "visible",
                    textOverflow: "unset",
                    whiteSpace: "normal",
                  },
                  formButtonPrimary: {
                    backgroundColor: "var(--accent)",
                    color: "var(--on-accent)",
                    borderRadius: "10px",
                    transition: "background-color 0.2s ease",
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
              Already have an account?{" "}
              <Link href="/sign-in">Sign in</Link>
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

const authStyles = `
/* ===== PAGE LAYOUT ===== */
.auth-page { background: var(--bg-base); }

/* ===== LEFT PANEL - hardcoded dark, immune to theme ===== */
.auth-left {
  background-color: #0A0A0B;
  background-image: radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
  background-size: 28px 28px;
  background-repeat: repeat;
}

/* ===== DRAGGABLE DIVIDER between left/right panels ===== */
.auth-divider {
  position: relative;
  flex: none;
  width: 16px;
  margin-left: -8px;
  margin-right: -8px;
  cursor: col-resize;
  background: transparent;
  z-index: 30;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
}
.auth-divider::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  background: rgba(255,255,255,0.10);
  transform: translateX(-50%);
  transition: background-color 0.15s ease, width 0.15s ease, box-shadow 0.15s ease;
}
.auth-divider:hover::after,
.auth-divider-active::after {
  background: #D4D4D8;
  width: 3px;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.35);
}
.auth-logo-t1 { font-family: 'Inter', sans-serif; font-size: 22px; font-weight: 450; letter-spacing: 0.05em; color: #F2F2F4; }
.auth-logo-t2 { font-family: 'Inter', sans-serif; font-size: 22px; font-weight: 450; letter-spacing: 0.05em; color: var(--logo-accent); }
.auth-eyebrow { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: #D4D4D8; margin-bottom: 20px; }
.auth-heading { font-family: "Inter", sans-serif; font-size: 54px; font-weight: 300; letter-spacing: -0.03em; line-height: 1.15; color: #F2F2F4; margin-bottom: 24px; }
.auth-subtext { font-family: "Figtree", sans-serif; font-size: 17px; font-weight: 400; color: #98989F; line-height: 1.6; max-width: 480px; }
.auth-stats { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
.auth-stat-value { display: block; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif; font-size: 28px; font-weight: 400; letter-spacing: -0.01em; color: #F2F2F4; }
.auth-stat-label { display: block; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #626268; margin-top: 4px; }
.auth-quote { margin-top: 32px; padding: 18px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); background: #151517; }
.auth-quote p { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif; font-size: 14.5px; font-weight: 300; letter-spacing: -0.005em; line-height: 1.6; color: #F2F2F4; margin-bottom: 10px; }
.auth-quote-person { display: flex; align-items: center; gap: 8px; }
.auth-quote-avatar { width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #A1A1AA, #52525B); flex-shrink: 0; }
.auth-quote-name { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif; font-size: 12.5px; font-weight: 600; color: #F2F2F4; }
.auth-quote-role { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif; font-size: 11px; color: #626268; }
.auth-gradient-text {
  color: #D4D4D8;
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
.auth-logo-t2-right { font-family: 'Inter', sans-serif; font-size: 25px; font-weight: 450; letter-spacing: 0.05em; color: var(--logo-accent); margin-bottom: 0; }

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
  font-size: 36px;
  font-weight: 350;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  margin-bottom: 12px;
  line-height: 1.15;
}
.auth-title-dot {
  color: var(--accent);
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
  color: var(--accent) !important;
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
  overflow: visible !important;
  min-height: auto !important;
}
.dark .cl-socialButtonsBlockButton {
  border-color: rgba(255,255,255,0.12) !important;
  background: transparent !important;
}
.cl-socialButtonsBlockButton:hover {
  border-color: var(--accent) !important;
}
/* Prevent text truncation inside social buttons (fixes "Continue with Google" cutoff) */
.cl-socialButtonsBlockButton * {
  overflow: visible !important;
  text-overflow: unset !important;
  white-space: normal !important;
}
.cl-socialButtonsBlockButtonText {
  overflow: visible !important;
  text-overflow: unset !important;
  white-space: normal !important;
}

/* Primary button (Continue) - neutral ink fill, subtle darken on hover, no lift */
.cl-formButtonPrimary {
  background-color: var(--accent) !important;
  color: var(--on-accent) !important;
  border-radius: 10px !important;
  font-weight: 600 !important;
  font-size: 14.5px !important;
  padding: 12px 20px !important;
  border: none !important;
  transition: background-color 0.15s ease !important;
}
.cl-formButtonPrimary:hover {
  background-color: var(--accent-hover) !important;
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
  border-color: var(--accent) !important;
  box-shadow: 0 0 0 3px var(--ring-color) !important;
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
  color: var(--accent);
  text-decoration: none;
  font-weight: 700;
  transition: color 0.15s ease;
}
.auth-account-link a:hover {
  color: var(--accent-hover);
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
  color: var(--accent);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .auth-right {
    padding: 32px 24px;
  }
  .auth-custom-title {
    font-size: 30px;
    font-weight: 400;
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
    font-weight: 400;
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
