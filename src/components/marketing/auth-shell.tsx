/**
 * Auth page shell — Sign In and Sign Up, built from a blank slate on
 * design-preview8.html (the landing pivot) as the single source of truth.
 * Every color, radius, font size, button spec, input spec, and animation
 * timing below is either lifted verbatim from that file or explicitly
 * derived from its closest existing pattern — see the comment above each
 * rule for the exact source. Nothing here is an invented value.
 *
 * Layout: wordmark → heading → subtext → one centered card → switch link.
 * No split panel, no illustration. The dotted-line hero backdrop is the
 * only decoration, at the same low opacity the landing uses.
 *
 * Server component — no client state needed now that the old draggable
 * split-panel divider is gone.
 */

import Link from "next/link";
import type { ReactNode } from "react";

/** Clerk appearance shared by SignIn and SignUp — structural hiding + field
 *  order only. Visual styling lives in the CSS below (Clerk internals need
 *  !important). `socialButtonsPlacement: "bottom"` is Clerk's own documented
 *  layout option (nested under `options` in this SDK version — confirmed
 *  against the installed @clerk/react type declarations, not assumed from
 *  memory) — it puts the primary button first, matching the brief's order
 *  (primary → divider → Google), without any DOM/CSS-order hacking. */
export const clerkAuthAppearance = {
  options: {
    socialButtonsPlacement: "bottom",
  },
  variables: {
    colorPrimary: "var(--a-blue)",
    colorBackground: "transparent",
    colorDanger: "var(--a-danger)",
    borderRadius: "var(--a-r-field)",
    fontFamily: "var(--a-font)",
  },
  elements: {
    cardBox: { boxShadow: "none", background: "transparent" },
    card: { backgroundColor: "transparent", boxShadow: "none", border: "none", padding: 0 },
    headerTitle: { display: "none" },
    headerSubtitle: { display: "none" },
    header: { display: "none" },
    main: { background: "transparent" },
    footerAction: { display: "none" },
  },
} as const;

export function AuthShell({
  heading,
  subtext,
  title,
  children,
  switchLink,
}: {
  heading: ReactNode;
  subtext: string;
  title: string;
  children: ReactNode;
  switchLink: ReactNode;
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: authStyles }} />
      <div className="auth-page">
        <div className="auth-col">
          <Link href="/" className="auth-word">threadline</Link>

          <h1 className="auth-heading">{heading}</h1>
          <p className="auth-subtext">{subtext}</p>

          <div className="auth-card" role="region" aria-label={title}>
            {children}
          </div>

          <p className="auth-switch">{switchLink}</p>
        </div>
      </div>
    </>
  );
}

// ─── Styles — every token traced to design-preview8.html ──────────────────
//
//   --a-bg / --a-card / --a-ink / --a-ink-2 / --a-ink-3 / --a-hair / --a-hair-soft / --a-field
//     = verbatim :root / [data-theme="dark"] values from design-preview8.html
//   --a-blue / --a-blue-hover  = verbatim --blue / --blue-hover (the file's own accent
//     tokens; their computed value IS ink — this design has no hue, "blue" is a name only)
//   --a-r-field (10px) = verbatim --r-field
//   --a-pill (980px)   = verbatim --pill
//   18px card radius   = verbatim, matches .cform/.price-card/.vig in the pivot
//   --a-ease (cubic-bezier(0.23,1,0.32,1)) = verbatim --ease-out
//   .auth-heading      = verbatim .headline (clamp(32px,4vw,48px) / 700 / -0.018em / 1.07)
//   .auth-card         = verbatim .cform (18px radius, 0.5px hair-soft border, 26px pad,
//                        shadow-frame)
//   .auth-input        = verbatim .cfield input (13px/16px pad, r-field radius, transparent
//                        border, --field bg, 15px, focus border --blue + bg --card)
//   .auth-btn-primary  = verbatim .btn + .btn-blue + .btn-big (pill radius, 13px/28px pad,
//                        17px, ink bg, hover --blue-hover + shadow-float, active scale(.97))
//   .auth-btn-google   = verbatim .btn-quiet + .btn-big (1px hair border, card bg, hover
//                        border-color ink-3)
//   riseIn 800ms / 900ms var(--ease-out) with 0/100/300/380ms delays = verbatim hero
//     entrance choreography (.hero h1 / .hero .sub / .stage-wrap / — extended one more
//     step for the switch link, same duration+easing, next delay in the sequence)
//   14px field gap, 22px divider margin = verbatim spacing constants already used
//     throughout the file (.cfield margin-bottom; .hero/.gnav/.cta-row use 22px)
//   Google "G" mark keeps its real four-color glyph — a trademark, not a palette choice.
//   --a-danger (warm red) is the one value with no monochrome precedent in the pivot;
//     the brief explicitly calls for a warm red here, so it's defined locally, scoped
//     to .auth-page only, and kept muted/desaturated so it doesn't clash with the theme.

const authStyles = `
.auth-page {
  --a-font: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Helvetica Neue", Arial, sans-serif;
  --a-bg: #ffffff;
  --a-card: #ffffff;
  --a-ink: #1d1d1f;
  --a-ink-2: #6e6e73;
  --a-ink-3: #86868b;
  --a-hair: #d2d2d7;
  --a-hair-soft: #e8e8ed;
  --a-field: #f5f5f7;
  --a-blue: #1d1d1f;
  --a-blue-hover: #000000;
  --a-gray-dot: #aeaeb2;
  --a-shadow-frame: 0 2px 8px rgba(0, 0, 0, 0.04), 0 24px 60px rgba(0, 0, 0, 0.08);
  --a-shadow-float: 0 6px 16px rgba(0, 0, 0, 0.16);
  --a-r-field: 10px;
  --a-pill: 980px;
  --a-ease: cubic-bezier(0.23, 1, 0.32, 1);
  --a-danger: #b54b3f;
  --a-danger-soft: rgba(181, 75, 63, 0.08);

  min-height: 100dvh; width: 100%;
  display: flex; align-items: center; justify-content: center;
  padding: 40px 22px;
  position: relative; overflow: hidden;
  background: var(--a-bg); color: var(--a-ink);
  font-family: var(--a-font); letter-spacing: -0.012em;
}
.dark .auth-page {
  --a-bg: #000000;
  --a-card: #1c1c1e;
  --a-ink: #f5f5f7;
  --a-ink-2: #a1a1a6;
  --a-ink-3: #8e8e93;
  --a-hair: #3a3a3c;
  --a-hair-soft: #2c2c2e;
  --a-field: #1c1c1e;
  --a-blue: #f5f5f7;
  --a-blue-hover: #ffffff;
  --a-gray-dot: #636366;
  --a-shadow-frame: 0 0 0 1px rgba(255, 255, 255, 0.06);
  --a-shadow-float: none;
  --a-danger: #e2897c;
  --a-danger-soft: rgba(226, 137, 124, 0.10);
}

/* dotted-line hero backdrop, verbatim recipe from .lp-top::before, centered on the card */
.auth-page::before {
  content: ""; position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background-image: radial-gradient(circle, var(--a-gray-dot) 1px, transparent 1.5px);
  background-size: 14px 28px;
  opacity: 0.3;
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 42%, #000 20%, transparent 74%);
  mask-image: radial-gradient(ellipse 70% 60% at 50% 42%, #000 20%, transparent 74%);
}

.auth-col { position: relative; z-index: 1; width: 100%; max-width: 440px; display: flex; flex-direction: column; align-items: center; box-sizing: border-box; }

/* wordmark — verbatim .word: no entrance animation, same as the landing's sticky nav */
.auth-word {
  font-size: 16px; font-weight: 600; letter-spacing: -0.02em; color: var(--a-ink);
  text-decoration: none; margin-bottom: 40px;
}

@keyframes authRiseIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }

/* heading — verbatim .headline, verbatim .hero h1 entrance (800ms, 0ms delay) */
.auth-heading {
  font-size: clamp(32px, 4vw, 48px); font-weight: 700; letter-spacing: -0.018em; line-height: 1.07;
  text-align: center; color: var(--a-ink);
  animation: authRiseIn 800ms var(--a-ease) backwards;
}

/* subtext — 15px reuses an existing size already used in this file (.btn/.applelink),
   color+tracking verbatim from .sub; verbatim .hero .sub entrance (800ms, 100ms delay) */
.auth-subtext {
  margin-top: 10px; font-size: 15px; line-height: 1.5; color: var(--a-ink-2);
  font-weight: 400; letter-spacing: -0.01em; text-align: center; max-width: 340px;
  animation: authRiseIn 800ms var(--a-ease) 100ms backwards;
}

/* card — verbatim .cform; entrance timing verbatim .stage-wrap (900ms, 300ms delay) */
.auth-card {
  margin-top: 32px; width: 100%; box-sizing: border-box;
  background: var(--a-card); border: 0.5px solid var(--a-hair-soft); border-radius: 18px;
  padding: 26px; box-shadow: var(--a-shadow-frame);
  animation: authRiseIn 900ms var(--a-ease) 300ms backwards;
}

/* switch link — extends the hero's stagger one more step (800ms, 380ms delay);
   sentence in --a-ink-2, the link itself verbatim .applelink (ink color + hover underline) */
.auth-switch {
  margin-top: 24px; font-size: 15px; color: var(--a-ink-2); letter-spacing: -0.01em; text-align: center;
  animation: authRiseIn 800ms var(--a-ease) 380ms backwards;
}
.auth-switch a { color: var(--a-ink); text-decoration: none; }
@media (hover: hover) and (pointer: fine) { .auth-switch a:hover { text-decoration: underline; } }

/* ─── Clerk element overrides — mapped 1:1 onto the tokens above.
   Clerk renders the actual fields/labels/forgot-password link itself (not custom
   HTML), so all styling for them lives here rather than in bespoke classes. ─── */
.cl-headerTitle, .cl-headerSubtitle, .cl-header { display: none !important; }
.cl-footer, .cl-footerAction { display: none !important; }
.cl-internal-b3fm6y, a[href*="clerk.com"], [class*="powered"] { display: none !important; }

/* Every Clerk wrapper is forced to respect the card's content box exactly —
   no wrapper is allowed to compute wider than its parent, which is what was
   letting the input visually overrun the card. (An earlier overflow:visible
   on these same wrappers, copied forward from a previous draft, was masking
   this by making the overrun visible instead of clipped — removed.) */
.cl-card, .cl-cardBox, .cl-rootBox, .cl-signIn-root, .cl-signUp-root,
.cl-formFieldRow, .cl-formField, .cl-identityPreview, .cl-identityPreviewEditButton,
.cl-otpCodeField, .cl-main, .cl-form {
  background-color: transparent !important; background: transparent !important;
  box-sizing: border-box !important;
  width: 100% !important;
  max-width: 100% !important;
}
.cl-card.cl-card.cl-card { background-color: transparent !important; background: transparent !important; }

.cl-internal-17z82o4, [class*="development-mode"], .cl-dev-mode-notice {
  background-color: var(--a-field) !important;
  border: 0.5px solid var(--a-hair-soft) !important;
  color: var(--a-ink-2) !important;
}

/* labels, dividers, secondary text — verbatim color tokens */
.cl-formFieldLabel, .cl-formFieldLabelRow label {
  color: var(--a-ink-2) !important; font-size: 13px !important; font-weight: 500 !important;
  letter-spacing: -0.006em !important;
}
.cl-dividerRow { margin: 22px 0 !important; }
.cl-dividerLine { background: var(--a-hair-soft) !important; height: 0.5px !important; }
.cl-dividerText { color: var(--a-ink-3) !important; font-size: 12px !important; letter-spacing: 0 !important; }
.cl-formFieldHintText, .cl-footerActionText { color: var(--a-ink-3) !important; }
.cl-formFieldAction, .cl-alternativeMethods button { color: var(--a-ink-2) !important; font-size: 12.5px !important; transition: color 180ms ease !important; }
.cl-formFieldAction:hover, .cl-alternativeMethods button:hover { color: var(--a-ink) !important; text-decoration: underline !important; }
.cl-identityPreviewText { color: var(--a-ink) !important; }

/* error text — the brief's one explicit exception to monochrome; muted, no layout
   shift (fades in place), no icon */
.cl-formFieldErrorText, .cl-formFieldError {
  color: var(--a-danger) !important; font-size: 12.5px !important; margin-top: 6px !important;
  opacity: 1; transition: opacity 200ms ease;
}
@starting-style { .cl-formFieldErrorText, .cl-formFieldError { opacity: 0; } }
.cl-formField:has(.cl-formFieldErrorText) .cl-formFieldInput,
.cl-formField:has(.cl-formFieldError) .cl-formFieldInput {
  border-color: var(--a-danger) !important;
}

/* social button — verbatim .btn-quiet + .btn-big, full width */
.cl-socialButtonsBlockButton {
  width: 100% !important;
  border: 1px solid var(--a-hair) !important;
  border-radius: var(--a-pill) !important;
  background: var(--a-card) !important;
  color: var(--a-ink) !important;
  transition: border-color 180ms ease, transform 160ms var(--a-ease) !important;
  font-size: 17px !important; font-weight: 500 !important; letter-spacing: -0.01em !important;
  padding: 13px 28px !important;
  overflow: visible !important; min-height: auto !important; box-shadow: none !important;
}
.cl-socialButtonsBlockButton:hover { border-color: var(--a-ink-3) !important; }
.cl-socialButtonsBlockButton:active { transform: scale(0.97) !important; }
.cl-socialButtonsBlockButton *, .cl-socialButtonsBlockButtonText {
  overflow: visible !important; text-overflow: unset !important; white-space: normal !important;
  color: var(--a-ink) !important; font-size: 15px !important;
}

/* primary button — verbatim .btn + .btn-blue + .btn-big, full width */
.cl-formButtonPrimary {
  width: 100% !important;
  background-color: var(--a-ink) !important;
  color: var(--a-bg) !important;
  border-radius: var(--a-pill) !important;
  font-weight: 500 !important; font-size: 17px !important; letter-spacing: -0.01em !important;
  padding: 13px 28px !important;
  border: none !important; box-shadow: none !important;
  transition: transform 160ms var(--a-ease), background-color 180ms ease, opacity 180ms ease !important;
}
@media (hover: hover) and (pointer: fine) {
  .cl-formButtonPrimary:hover { background-color: var(--a-blue-hover) !important; box-shadow: var(--a-shadow-float) !important; }
}
.cl-formButtonPrimary:active { transform: scale(0.97) !important; }
.cl-formButtonPrimary[disabled], .cl-formButtonPrimary[data-disabled] { opacity: 0.5 !important; }

/* inputs — verbatim .cfield input */
.cl-formFieldInput {
  box-sizing: border-box !important;
  width: 100% !important;
  max-width: 100% !important;
  border: 1px solid transparent !important;
  border-radius: var(--a-r-field) !important;
  background: var(--a-field) !important;
  color: var(--a-ink) !important;
  transition: border-color 180ms ease, background-color 180ms ease !important;
  font-size: 15px !important; letter-spacing: -0.01em !important;
  padding: 13px 16px !important; box-shadow: none !important;
}
.cl-formFieldInput::placeholder { color: var(--a-ink-3) !important; }
.cl-formFieldInput:focus { border-color: var(--a-blue) !important; background: var(--a-card) !important; box-shadow: none !important; }
.cl-otpCodeFieldInput {
  border: 1px solid transparent !important; border-radius: var(--a-r-field) !important; background: var(--a-field) !important;
}
.cl-otpCodeFieldInput:focus { border-color: var(--a-blue) !important; }

.cl-formFieldRow { margin-bottom: 14px !important; }
.cl-formButtonPrimary { margin-top: 6px !important; }

/* ─── responsive: full-width card, comfortable padding ─── */
@media (max-width: 480px) {
  .auth-page { padding: 28px 16px; }
  .auth-card { padding: 22px; }
  .auth-word { margin-bottom: 32px; }
}
`;
