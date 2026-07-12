# Requirements: Landing Page, Sign-In & Sign-Up Visual Overhaul

Source: `new_design.md`
Updated: 2026-07-12 (owner decisions resolved)

---

## Overview

A comprehensive visual and interaction overhaul of the landing page (`src/app/page.tsx`), sign-in page (`src/app/sign-in/[[...sign-in]]/page.tsx`), and sign-up page (`src/app/sign-up/[[...sign-up]]/page.tsx`). Work follows the suggested order below. Each task must pass its acceptance criteria before moving to the next.

**Non-negotiable constraint:** Do not break existing functionality — forms, validation, auth flow, routing, and current responsive behavior must all keep working exactly as they do now.

---

## Task 1 — Header: Navigation + Sticky Behavior

### Codebase Findings

- **Landing page nav:** `src/app/page.tsx` contains its own `<nav className="land-nav">` with "Product" (→ `#features`) and "Customers" (→ `#story`) links, plus Sign in / Sign up CTAs. Styled via inline `landingStyles` CSS block.
- **Dashboard header:** `src/components/header.tsx` is a separate authenticated-only floating pill navbar (Dashboard, Tasks, Messages, etc.) — not relevant to this task.
- **Sign-in/sign-up pages:** Have their own full-screen split layout. No shared nav component. They include a logo link back to `/`.
- **Existing sections on landing page:** Hero, Social Proof, Feature Rows (×4, anchored at `#features`), Testimonials (`#story`), Stats Row, Final CTA, Footer.
- **Missing sections:** No dedicated "About Us" or "Contact" section currently exists.

### Owner Decisions

- Existing feature rows (dependency graph, AI, blocker detection, team workload) → reframe as the **"Services"** section.
- Existing testimonials + social proof → fold into the **"About Us"** section.
- **"Contact"** section → new section to be created (placeholder copy, flagged for real content).
- Sign-in/sign-up pages: keep the existing logo link back to `/`. No nav bar added (preserves the full-screen split layout).

### Section Order on Landing Page

1. Hero (`#home`)
2. Social Proof (part of About Us)
3. About Us (`#about`) — testimonials, stats, team credibility
4. Services (`#services`) — the 4 feature rows (dependency graph, AI, blockers, workload)
5. Contact (`#contact`) — new section with placeholder content
6. Final CTA
7. Footer

### Requirements

1. Replace the current landing nav links ("Product," "Customers") with four items: **Home**, **About Us**, **Services**, **Contact**.
2. Each nav item smooth-scrolls to its section:
   - Home → hero section (top of page)
   - About Us → `#about` section
   - Services → `#services` section
   - Contact → `#contact` section
3. Reframe existing content into the new section structure (see Section Order above). Create a new **Contact** section with placeholder copy matching the Threadline brand voice. ⚠️ *Owner needs to provide real contact content post-implementation.*
4. Make the landing nav **sticky** (`position: sticky; top: 0`) with a z-index above all page content.
5. Add an elevated state on scroll — subtle shadow, slight background blur/opacity shift, or reduced height — so it reads as intentionally elevated once the user has scrolled.
6. Apply `scroll-margin-top` (or JS offset) to each section so content isn't hidden under the sticky header.
7. Collapse nav into a mobile menu (hamburger or similar) at small widths if four items + CTAs don't fit.
8. The header is **landing page only**. Sign-in/sign-up pages keep their existing layout (logo links to `/`).

### Acceptance Criteria

- [ ] Clicking each of the 4 nav items smooth-scrolls to the correct section, with the section heading fully visible below the header.
- [ ] Header stays visible and pinned at every scroll position on the landing page.
- [ ] Header visibly changes to an "elevated" state once scrolled.
- [ ] Works at mobile, tablet, and desktop widths — collapses nav if needed.

---

## Task 2 — Hero Card Stack: Centering

### Codebase Findings

- **Hero visual container:** `.hero-visual` is `position: relative; height: 420px`.
- **Card positions (from `landingStyles`):**
  - `.float-card.back1`: `width: 200px; height: 120px; top: 10px; right: 10px; opacity: .5; transform: rotate(5deg);`
  - `.float-card.back2`: `width: 210px; height: 115px; bottom: 80px; left: -15px; opacity: .45; transform: rotate(-6deg);`
  - `.float-card.main`: `width: 300px; top: 80px; left: 50px; transform: rotate(-3deg);`
- **Issue:** The main card's `left: 50px` makes it sit too far left.

### Owner Decision

The goal is simple: **push the main card to the right** so it looks visually centered/balanced relative to the two back cards. Not a mathematical formula — just nudge it rightward until it looks right, and make sure it still looks balanced at all breakpoints.

### Requirements

1. Move the main (front) card to the right so it no longer looks left-leaning relative to the back cards.
2. Use a relative/responsive approach (percentage-based left, or `left: 50%; transform: translateX(-50%)`) so it stays balanced across viewport sizes — not a hardcoded pixel value that only works at one width.
3. Preserve the existing offset/layering ("peeking out") effect of the back cards.
4. Verify at desktop, tablet, and mobile breakpoints.

### Acceptance Criteria

- [ ] Main card looks visually centered/balanced between the two back cards at desktop width — no longer left-leaning.
- [ ] Re-checked at tablet and mobile breakpoints — still balanced.
- [ ] The layered "peeking out" look of the two back cards is unchanged.

---

## Task 3 — Hero Card Stack: Scale

### Codebase Findings

- Current card sizes: back1 `200×120px`, back2 `210×115px`, main `300px` wide.
- Hero visual area: `420px` tall at desktop, `300px` at mobile.
- Internal elements: `.mini-tab-bar`, `.mini-graph`, `.mini-node` — all sized in px with small font sizes (6–8px).

### Owner Decision

Scale factor: **at least 1.5× bigger** than current size at desktop. Must still be responsive — no overflow on mobile.

### Requirements

1. Scale all three cards to **at least 1.5× their current size** at desktop so the hero visual dominates the section.
2. Scale proportionally: card dimensions, internal padding, text/icons, and offsets between cards all grow together.
3. Increase the `.hero-visual` container height accordingly to accommodate the larger cards.
4. Use responsive sizing (`clamp()`, viewport units, or breakpoint-specific values) to prevent overflow on smaller screens.
5. Ensure the enlarged stack doesn't force horizontal scroll at any viewport width.

### Acceptance Criteria

- [ ] Three-card stack is at least 1.5× larger at desktop — clearly anchors the hero section.
- [ ] No overflow or horizontal scroll at any breakpoint including mobile.
- [ ] Internal proportions (text, padding, spacing) scaled with the cards — nothing stretched or blurry.

---

## Task 4 — Scroll-Reveal Animations

### Codebase Findings

- **Existing animation infrastructure:** `globals.css` has `@keyframes fadeInUp`, entrance animation classes (`.animate-entrance`), and `@media (prefers-reduced-motion: reduce)` already disabling animations.
- **No scroll-triggered animations exist.** All current animations are page-load based.
- **Landing page is a server component** (`async function LandingPage()` using `await auth()`). Must stay a server component to preserve the auth redirect.

### Owner Decision

Implementation approach: **Keep `page.tsx` as a server component. Wrap each section in a `<RevealOnScroll>` client component** that handles Intersection Observer internally. This is the safest approach — no regression risk to auth flow.

### Requirements

1. Create a `<RevealOnScroll>` client component (e.g. `src/components/reveal-on-scroll.tsx`) that:
   - Wraps its children
   - Uses Intersection Observer to detect when the element enters the viewport
   - Applies slide-up + fade-in animation on first entry
   - Does NOT re-trigger on subsequent scroll passes
   - Respects `prefers-reduced-motion` (content just visible, no animation)
2. Wrap every content section below the hero (About Us, Services, Contact, Stats, Final CTA) in `<RevealOnScroll>`.
3. Keep `page.tsx` as a server component — only the wrapper is a client component.
4. Timing: 500–800ms, ease-out curve.
5. Nice-to-have: stagger elements within a section (heading first, then content).

### Acceptance Criteria

- [ ] Scrolling down reveals each section with smooth slide-up + fade-in on first entry.
- [ ] Scrolling back up and down does not re-trigger animations.
- [ ] With `prefers-reduced-motion` enabled, sections are simply visible without animation.
- [ ] Landing page still correctly redirects authenticated users to `/dashboard` (server component not broken).

---

## Task 5 — Gradient Text & Buttons: Theme-Aware Direction

### Codebase Findings

> **⚠️ FLAG: Current code does NOT match the spec. Discrepancies documented below.**

#### Gradient instances found in the codebase:

| # | Location | Selector / Element | Type | Current Dark Mode | Current Light Mode |
|---|----------|-------------------|------|-------------------|-------------------|
| 1 | `src/app/page.tsx` (landing) | `.hero h1 b` | Text | `linear-gradient(120deg, #C4B5FD, #6D28D9)` — lighter → darker | `linear-gradient(120deg, #4C1D95, #2E1065)` — **wrong colors** |
| 2 | `src/app/page.tsx` (landing) | `.btn-primary` | Button BG | `linear-gradient(135deg, #C4B5FD, #6D28D9)` | `linear-gradient(135deg, #4C1D95, #2E1065)` — **wrong colors** |
| 3 | `src/app/sign-in/page.tsx` | `.auth-gradient-text` | Text | `linear-gradient(120deg, #C4B5FD, #6D28D9)` | No swap — hardcoded dark panel |
| 4 | `src/app/sign-up/page.tsx` | `.auth-gradient-text` | Text | `linear-gradient(120deg, #C4B5FD, #6D28D9)` | No swap — hardcoded dark panel |

#### Discrepancies vs. spec:

1. **Landing hero h1 light mode uses wrong colors.** Currently `#4C1D95 → #2E1065` (two different dark colors). Must change to `#6D28D9 → #C4B5FD` (same pair, swapped).
2. **Landing `.btn-primary` light mode uses wrong colors.** Same issue — must use the same two colors swapped.
3. **Auth pages gradient text on hardcoded-dark panel.** The left panel background is always `#0A0A0B` regardless of theme. The gradient here always sits on a dark background, so it should **always use the dark-mode direction** (`#C4B5FD → #6D28D9`) — leave as-is.

### Owner Decisions

- **Gradient direction confirmed (body text is correct):**
  - Dark mode: `#C4B5FD → #6D28D9` (lighter → darker, left to right)
  - Light mode: `#6D28D9 → #C4B5FD` (darker → lighter, left to right)
- **Buttons ARE in scope** — `.btn-primary` gradient gets the same swap treatment.
- **Auth left-panel gradient:** Leave as-is (always light→dark), since the panel is permanently dark.

### Requirements

1. Fix the landing page `.hero h1 b` gradient:
   - Dark mode: `linear-gradient(120deg, #C4B5FD, #6D28D9)`
   - Light mode: `linear-gradient(120deg, #6D28D9, #C4B5FD)`
2. Fix the landing page `.btn-primary` gradient:
   - Dark mode: `linear-gradient(135deg, #C4B5FD, #6D28D9)`
   - Light mode: `linear-gradient(135deg, #6D28D9, #C4B5FD)`
3. Auth pages `.auth-gradient-text`: **no change** — always `linear-gradient(120deg, #C4B5FD, #6D28D9)` (matches its permanently dark context).
4. Search the entire codebase for any other gradient text/button instances and apply the same rule.
5. **Do not introduce new colors** — only swap the order of the existing `#C4B5FD` and `#6D28D9`.
6. Verify by toggling theme: colors must visibly swap sides.
7. Check contrast/legibility in both themes.

### Acceptance Criteria

- [ ] Every gradient text AND gradient button element identified across all three pages.
- [ ] Light mode: gradient reads `#6D28D9 → #C4B5FD` (darker → lighter) left to right.
- [ ] Dark mode: gradient reads `#C4B5FD → #6D28D9` (lighter → darker) left to right.
- [ ] Same two colors in both modes — a genuine swap, not new colors.
- [ ] Auth left-panel gradient unchanged (always light→dark on its dark background).
- [ ] Contrast/legibility verified against background in both themes.

---

## Task 6 — Theme Toggle: Liquid Transition

### Codebase Findings

- **Theme provider:** `src/components/theme-provider.tsx` — custom context, stores in localStorage, adds/removes `.dark` class on `<html>`.
- **Current transition:** Adds `html.theme-transition` class for 350ms, enabling a global `transition: background-color 300ms, border-color 300ms, color 300ms, box-shadow 300ms`. Simple crossfade.
- **Toggle UI:** `src/components/floating-theme-toggle.tsx` — fixed bottom-left pill with Moon/Sun icons. Only dark/light.
- **View Transitions API:** Not currently used.
- **Reduced motion:** `globals.css` already handles `prefers-reduced-motion`.

### Owner Decision

- **Scope: Apply everywhere on the site** — not just landing, sign-in, sign-up. Since the transition lives in the theme provider (which wraps the entire app), this is automatic.
- **Visual feel:** The transition should look like the active-mode indicator (circle) is a liquid blob that stretches vertically — morphing from circle → narrow waist → circle as it sweeps up or down the screen. Like a droplet of liquid moving through the viewport. Not a hard-edged expanding circle, not a plain wipe.

### Requirements

1. Replace the current 300ms crossfade with a fluid, liquid-feeling vertical reveal transition.
2. Use the **View Transitions API** (`document.startViewTransition`) to capture old/new states.
3. Drive the reveal with a custom animation on `::view-transition-new(root)`:
   - Vertical sweep (bottom-to-top or top-to-bottom) with an organic, liquid-edged shape.
   - The shape should read as a blob — circle → pinched/narrow → circle — like liquid flowing vertically through the screen.
   - Achieve via animated clip-path with a wavy/organic edge, or overlapping blurred shapes with a goo filter.
4. Duration: 600–900ms, ease-out deceleration.
5. **Fallback:** Browsers without View Transitions API → instant or simple crossfade (existing 300ms). Users with `prefers-reduced-motion` → instant switch.
6. Performance: animate only `transform`/`clip-path`, no layout-triggering properties.
7. **Applies site-wide** — the transition lives in the theme provider, so it works on every page (landing, auth, dashboard, all routes).

### Implementation Notes

- Modify `setTheme` in `src/components/theme-provider.tsx` to wrap the DOM class change inside `document.startViewTransition()`.
- Add `::view-transition-old(root)` and `::view-transition-new(root)` animation keyframes in `globals.css`.
- The floating toggle calls `setTheme` — no change needed there.
- The liquid blob effect can be achieved with an animated `clip-path: polygon(...)` or `clip-path: ellipse(...)` that changes aspect ratio as it moves vertically.

### Acceptance Criteria

- [ ] Toggling theme produces a visibly fluid, liquid-blob transition with vertical motion.
- [ ] The shape reads as organic — circle → narrow → circle — not a hard edge or plain fade.
- [ ] Stays smooth (no stutter/jank) on repeated toggling.
- [ ] Falls back gracefully in browsers without View Transitions support.
- [ ] Falls back to instant switch for `prefers-reduced-motion` users.
- [ ] Works on **every page** of the site (landing, sign-in, sign-up, dashboard, all routes).

---

## Suggested Implementation Order

1. **Task 1** — Header + section restructure (later tasks depend on sections existing)
2. **Task 2 + Task 3** — Hero card stack centering + scale (same component)
3. **Task 4** — Scroll-reveal animations (needs sections to exist)
4. **Task 5** — Gradient direction pass (independent; do as one dedicated pass)
5. **Task 6** — Liquid theme toggle (most technically involved, last)

---

## Definition of Done

All of the following must be genuinely true (not just attempted):

- [ ] Header nav (Home / About Us / Services / Contact) present on landing page, smooth-scrolls correctly, sticky, with a distinct scrolled/elevated state.
- [ ] Hero main card pushed right so it looks balanced between the two back cards, at every breakpoint.
- [ ] Hero card stack at least 1.5× larger, proportionally scaled, no overflow at any breakpoint.
- [ ] Every section below the hero animates in with slide-up + fade-in on first scroll into view; reduced-motion respected.
- [ ] Every gradient text AND button instance verified to swap color position correctly between light and dark mode.
- [ ] Theme toggle transition is fluid, liquid-blob-feeling, vertical, works on every page — not instant — with working fallback.
- [ ] Nothing pre-existing (forms, auth, routing, responsive behavior) has regressed.
- [ ] Everything checked in both themes, at mobile, tablet, and desktop widths.

---

## Appendix: Key Files

| File | Role |
|------|------|
| `src/app/page.tsx` | Landing page (hero, features, testimonials, CTA, footer + all inline styles) |
| `src/app/sign-in/[[...sign-in]]/page.tsx` | Sign-in page (split layout + inline auth styles) |
| `src/app/sign-up/[[...sign-up]]/page.tsx` | Sign-up page (split layout + inline auth styles) |
| `src/components/header.tsx` | Dashboard-only header (not used on landing/auth pages) |
| `src/components/theme-provider.tsx` | Theme context, `setTheme`, dark class management |
| `src/components/floating-theme-toggle.tsx` | Fixed bottom-left toggle (Moon/Sun) |
| `src/app/globals.css` | Design tokens, animations, reduced-motion handling |

---

## Remaining Flag for Owner

- **Task 1 — Contact section content:** Will use placeholder copy. Owner should replace with real contact information post-implementation.
