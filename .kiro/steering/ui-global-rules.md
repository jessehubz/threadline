# Spec Index & Global Rules

This is one long working note, split into precise per-area files so nothing gets lost or skipped. **Read this file first**, then work through the numbered files in order. Each file is self-contained and can be handed to Kiro on its own.

## Files in this set
1. `01-header-navbar.md` — profile/Clerk button, theme toggle, notification button, search bar
2. `02-dashboard-hero-and-layout.md` — overall dashboard width, greeting text, hero stat card
3. `03-ai-assistant-chat.md` — Loom → AI Assistant rename, chat widget redesign, scroll behavior
4. `04-tags-system.md` — default tags, custom tags, horizontal-scroll tag container
5. `05-friends-and-needs-attention.md` — Team → Friends rename, hover fix, logos, status indicators, subheadings
6. `06-project-cards.md` — compact layout, progress bar, delete + Recently Deleted, pagination, card header
7. `07-task-timeline-groups.md` — Today / This Week / Later / Overdue columns, hover
8. `08-footer-and-site-pages.md` — footer rebuild, Terms/Privacy, Product/Docs/Company pages

## Global rules — apply to EVERY file below, no exceptions
- [ ] **Strict compliance with the existing reference file(s)** — `dashboard.md` and its accompanying HTML. For the Friends panel, Needs Attention panel, subheadings, and project pagination, that reference is the source of truth for structure and content. Previous passes silently dropped content from it (e.g. subheadings) — do not remove or simplify anything from that reference unless a spec below explicitly says to change it. If something in a spec below seems to conflict with the reference file, flag it instead of guessing.
- [ ] **Hover feedback on every interactive element** — any button, card, toggle, or tag needs `cursor: pointer` plus a visible hover state (background/shadow/scale/transition). This has been missed repeatedly — treat it as a hard requirement across the whole app, not just the items called out explicitly below.
- [ ] **Full light/dark mode support** — every component touched in this spec set must be verified in both themes, not just one.
- [ ] **Fully responsive** — desktop, tablet, and mobile/narrow-width behavior must be explicitly handled for every component touched here. Nothing should break, overflow, or become unusable as the viewport shrinks.

## Open questions / needs a decision before (or during) build
These are points in the original note that were ambiguous or self-corrected mid-thought. Best-guess defaults are already written into the relevant spec files, but flag these back to the user rather than silently assuming:
- [ ] Exact font choice for the name in "Good evening, {name}" (a font was requested, not specified which).
- [ ] Exact target/behavior of the "slide up on scroll down" feature — which element, and does it slide *into* view or *away*? (see `03-ai-assistant-chat.md`)
- [ ] Confirm the full set of Friends-panel status states (Free / Busy / Stacked / others?) against `dashboard.md` — only "Free, Busy, Stacked, etc." was mentioned, "etc." implies there may be more defined in the reference file.
- [ ] Confirm search bar sizing strategy (fixed wider width vs. flex-grow with max-width).
