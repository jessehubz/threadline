# Landing Page, Sign-In & Sign-Up — Visual and Interaction Overhaul

## Role and quality bar

You are acting as a world-class UI/UX designer and senior front-end engineer — the caliber of a top-tier design studio charging six figures for this work. Every decision should read as intentional: consistent spacing, considered motion, deliberate typography. Nothing should look templated or AI-generated. Apply this bar across the entire site — landing page, sign-in page, and sign-up page — not just one screen.

Before changing anything, explore the current codebase and find: the header/nav component, the landing page hero section (including the layered card component described below), the theme/dark-mode provider and its color tokens, the sign-in and sign-up pages, and the global CSS/animation setup. The descriptions below describe current behavior as observed by the site owner, not exact code — confirm the real structure before editing, and reuse the existing design tokens (colors, fonts, spacing scale) rather than introducing a new palette.

Work through the tasks in the order listed in "Suggested order of work." After finishing each one, verify it against its own acceptance criteria before moving to the next. Don't consider this finished until every line in the final "Definition of done" checklist is genuinely true, not just attempted.

Do not break existing functionality — forms, validation, auth flow, routing, and current responsive behavior must all keep working exactly as they do now.

---

## Task 1 — Header: navigation + sticky behavior

**Current state:** The header does not stay pinned while scrolling, and has no section navigation.

**Required changes:**

- Add four navigation items to the header, in this order: **Home**, **About Us**, **Services**, **Contact**.
- Each item smooth-scrolls to a matching section on the landing page:
  - Home → the hero section at the top of the page
  - About Us → an "About Us" section
  - Services → a "Services" section
  - Contact → a "Contact" section
- If any of these sections (About Us, Services, Contact) don't already exist on the landing page, design and build them now, matching the site's existing visual language, tone, and content/brand context found in the codebase. Use sensible placeholder copy if no real copy exists yet, and flag in your summary that it needs the owner's real content.
- If the header is shared across the sign-in and sign-up pages too, clicking a section link from those pages should route back to the landing page and then scroll to that section (e.g. `/#about`), rather than doing nothing.
- Make the header **sticky**: pinned to the top of the viewport through the entire scroll, on every page it appears on, always above page content (correct z-index, never clipped or overlapped by anything).
- Give the sticky header a subtle elevated treatment once the page has scrolled — a soft shadow, slight background blur/opacity change, or marginally reduced height — so it reads as intentionally "elevated," not just hard-pinned.
- Account for the sticky header's height when scrolling to a section, so the section's top content doesn't end up hidden underneath it (`scroll-margin-top` on each section, or an equivalent offset in the scroll handler).

**Acceptance criteria:**

- [ ] Clicking each of the 4 nav items smooth-scrolls to the correct section, with the section's heading fully visible below the header, not clipped.
- [ ] The header stays visible and pinned to the top at every scroll position, on every page it appears on.
- [ ] The header visibly changes to an "elevated" state once the page is scrolled, not just statically stuck in place.
- [ ] Works at mobile, tablet, and desktop widths — collapse the nav into a mobile menu if four extra items don't fit at small widths, or if the header already has one.

---

## Task 2 — Hero card stack: centering

**Current state:** The hero section has a layered stack of 3 rectangular cards — one main card in front, and two supporting cards offset behind it. The main (front) card currently sits noticeably too far to the left relative to the two cards behind it.

**Required change:**

- Recenter the main (front) card so its horizontal center sits exactly at the horizontal midpoint between the two back cards.
- Concretely: find the horizontal center of each back card, average the two to get the target center point, then position the main card — via `left` + `transform: translateX(-50%)`, flexbox/grid centering, or margin auto, whichever fits the existing layout method — so the main card's own horizontal center lands on that target point.
- Use relative positioning logic (percentages, flex/grid alignment, or a calculated transform) rather than a one-off hardcoded pixel value that only happens to work at one viewport width. It needs to stay correctly centered as the browser resizes and at every responsive breakpoint the site supports.
- Preserve the existing offset / "peeking out" relationship between the two back cards and the front card — only the front card's horizontal position changes, not the depth/layering effect itself.

**Acceptance criteria:**

- [ ] The main card is visibly centered between the two back cards at desktop width, not left-leaning.
- [ ] Re-checked at tablet and mobile breakpoints — still centered, not just correct at one screen size.
- [ ] The layered "peeking out" look of the two back cards is unchanged.

---

## Task 3 — Hero card stack: scale

**Current state:** All three cards are too small for the space they occupy, leaving too much unused whitespace around them.

**Required change:**

- Scale up all three cards substantially — a noticeable jump, not a minor bump — so the hero visual feels like the focal point of the section instead of a small graphic floating in empty space.
- Scale proportionally: card dimensions, internal padding, and any text/icons/images inside the cards, plus the offsets between the three cards, should all grow together, so the enlarged stack still reads as one cohesively-designed component rather than one box stretched out of proportion with the rest.
- Use responsive sizing (`clamp()`, viewport units, or breakpoint-specific values) rather than one fixed large pixel size, so the enlarged cards don't overflow or force horizontal scrolling on smaller screens.

**Acceptance criteria:**

- [ ] The three-card stack is clearly, substantially larger at desktop width, and now anchors the hero section instead of leaving large gaps of empty space around it.
- [ ] Nothing overflows the viewport or triggers horizontal scroll at any breakpoint, including mobile.
- [ ] Proportions inside each card (text size, padding, internal spacing) scaled along with the cards — nothing looks stretched, cropped, or blurry.

---

## Task 4 — Scroll-reveal animations

**Current state:** Landing page content is simply present on load — no motion tied to scroll position.

**Required change:**

- Every content section below the hero — About Us, Services, Contact, and any other content blocks (features, testimonials, etc.) that exist — should start hidden (slightly translated down, opacity 0) and animate into place (slide up + fade in) the first time it scrolls into the viewport.
- Use an Intersection Observer–based approach, or your framework's equivalent (e.g. Framer Motion's `whileInView`), so this is driven by scroll position, not just a page-load animation.
- Each section animates in once, the first time it enters view. It should not re-trigger every time the user scrolls back up and down past the same section.
- Timing: roughly 500–800ms, eased out rather than linear, so it reads as smooth and deliberate rather than snappy or delayed.
- Nice-to-have, apply if it doesn't add excessive complexity: stagger elements within a section slightly (heading first, then supporting content) for a more polished cascade rather than everything appearing as one block.
- Respect `prefers-reduced-motion`: those users should see content simply present, without the slide/fade motion.

**Acceptance criteria:**

- [ ] Scrolling down the landing page reveals each section with a smooth slide-up-and-fade-in, the first time it comes into view.
- [ ] Scrolling back up and down again does not repeatedly re-trigger the animation in a distracting way.
- [ ] With `prefers-reduced-motion` enabled, sections are simply visible, without the animated motion.

---

## Task 5 — Gradient text: theme-aware direction (critical — get this exactly right)

This has been implemented incorrectly before. Treat this section as the precise specification, not a rough guideline.

**Current state:** Gradient-styled text (headings, logo, or similar) does not correctly flip direction between light and dark mode.

**Required behavior, exactly:** Every instance of gradient text uses exactly two colors from the site's existing palette — find and reuse whichever two colors the current gradient already uses; don't invent new ones. The two colors always stay the same; only which one sits on the left versus the right changes, depending on theme.

- **dark mode:** gradient reads left → right, lighter color → darker color.
  `background: linear-gradient(to right, [lighter color], [darker color]);`
- **light mode:** the exact same two colors, positions swapped — darker color → lighter color, left → right. The direction (left-to-right) does not change; only which color occupies which end does.
  `background: linear-gradient(to right, [darker color], [lighter color]);`

In other words: dark mode is not "the same gradient, recolored." It's the same two colors with their left/right positions mirrored. Toggling the theme should visibly flip which color sits on the left edge of the text versus the right edge.

**Apply this everywhere gradient text appears, across all of:**

- Landing page (hero heading, logo, any other gradient-styled headings)
- Sign-in page
- Sign-up page

**Verification method — do this, don't skip it:** for every gradient text element, check it in light mode, note which color is on the left edge and which is on the right, then toggle to dark mode and confirm they've swapped sides using the same two colors. If any element doesn't swap, it isn't done — find it and fix it. Search the whole codebase for every class/style that applies a text gradient; don't rely on checking just one page.

**Acceptance criteria:**

- [ ] Every gradient text element identified across the landing, sign-in, and sign-up pages.
- [ ] Light mode confirmed left-to-right lighter → darker for every one of them.
- [ ] Dark mode confirmed the same two colors now read darker → lighter, left to right — a genuine swap, not a new gradient.
- [ ] No gradient text element left using the old, non-swapping behavior.
- [ ] Contrast/legibility of the gradient text checked against its background in both themes.

---

## Task 6 — Theme toggle: liquid transition

**Current state:** Toggling light/dark mode swaps colors instantly, without distinctive motion.

**Required feel:** Toggling the theme should feel fluid and organic — like liquid moving through the screen — not an instant snap, and not a flat cross-fade. In the site owner's own words: "like water flowing… liquid moving up and down."

**Suggested technical approach** (pick the best fit for the existing stack, or combine techniques):

- Use the View Transitions API (`document.startViewTransition`) to capture old/new theme states, and drive the reveal with a custom animation on `::view-transition-new(root)` instead of the default cross-fade.
- Instead of a plain circular clip-path reveal, give the reveal a wavy, liquid-edged shape that sweeps vertically (bottom-to-top or top-to-bottom) rather than growing outward as a hard-edged circle — e.g. an animated SVG wave path used as a clip-path/mask, or a couple of overlapping blurred circles combined with a `feGaussianBlur` + `feColorMatrix` "goo" filter so they merge into one organic moving shape.
- The motion should read as vertical — rising or falling — matching "moving up and down," rather than radiating outward from a point.
- Duration roughly 600–900ms, eased so it decelerates naturally rather than moving at constant speed.
- Always provide a fallback: browsers without View Transitions API support, and users with `prefers-reduced-motion` set, should get an instant or simple cross-fade theme switch — never a broken or missing toggle.
- Keep it performant: animate `transform`/`clip-path`, not properties that force layout recalculation, so it stays smooth on lower-powered devices.

**Acceptance criteria:**

- [ ] Toggling the theme produces a visibly fluid, organic-edged transition with vertical motion — not an instant flip, not a plain fade, not a hard-edged expanding circle.
- [ ] Transition stays smooth (no stutter/jank) on repeated toggling.
- [ ] Falls back gracefully (instant or simple fade) in browsers without View Transitions support, and for users with `prefers-reduced-motion` enabled.
- [ ] Works consistently from wherever the toggle button is placed, across landing, sign-in, and sign-up pages.

---

## Suggested order of work

1. **Task 1** — header and the sections it needs to exist, since later scroll/nav work depends on those sections being there.
2. **Task 2 + Task 3** — hero card stack centering and scale together, since they affect the same component.
3. **Task 4** — scroll-reveal, once sections exist to reveal.
4. **Task 5** — gradient direction pass across all three pages. Independent of the above, but do it as one dedicated pass rather than fixing gradients piecemeal.
5. **Task 6** — liquid theme toggle, last, since it's the most technically involved.

---

## Definition of done

Go through this literally before calling the work complete:

- [ ] Header nav (Home / About Us / Services / Contact) present, smooth-scrolls correctly, sticky on every page, with a distinct scrolled/elevated state.
- [ ] Hero main card mathematically centered between the two back cards, at every breakpoint.
- [ ] Hero card stack visibly larger, proportionally scaled, no overflow at any breakpoint.
- [ ] Every section below the hero animates in with a slide-up + fade-in the first time it's scrolled into view; reduced-motion respected.
- [ ] Every gradient text instance on the landing, sign-in, and sign-up pages verified to swap color position correctly between light and dark mode.
- [ ] Theme toggle transition is fluid, liquid-feeling, and vertical, not instant, with a working fallback for unsupported browsers and reduced-motion users.
- [ ] Nothing pre-existing (forms, auth, routing, other responsive behavior) has regressed.
- [ ] Everything above checked in both themes, and at mobile, tablet, and desktop widths.

Work through these iteratively: implement, check against the criteria above, fix any gaps you find, then move to the next task. Don't mark the overall job finished until every box above is genuinely true, not just attempted.
