# Threadline — UI Redesign Checklist

> **Pivot files (strictly follow these, do not deviate):**
> - Landing page → `landing-page-design-8.html`
> - Dashboard & all inner pages → `design-preview12.html`
>
> Every animation, transition, color, spacing, and component pattern must be derived from these two files. They are the source of truth. When in doubt, check the file before deciding.

---

## Landing Page (`landing-page-design-8.html`)

- [x] Add tagline / headline title to the footer
- [x] Replace "Open App" in top-right with **Sign In** and **Sign Up** buttons
- [x] Add dotted lines to the hero background
- [x] Rename "The Supporting Cast" section — replace with a professional, product-forward heading
- [x] Replace "5 more tasks before the bottom of this page" text — rewrite as an app introduction/value proposition copy
- [x] Fix the AI Assistant hover highlight — currently too white, tone it down to match the dark theme
- [x] Pricing: consolidate to **one plan** — name it appropriately (not just "Standard")
  - Free tier: max **7 members per project**, max **5 projects**
  - Paid / Most Popular tier: **unlimited** teammates and projects
  - Make the pricing section feel persuasive — the paid tier should sell itself
- [x] Keep "Ready to see your project clearly?" CTA + "Start Project" button at the bottom exactly as-is — it works *(lives in `src/app/page.tsx`, not the preview — preserve untouched in Phase 2)*

---

## Dashboard & Inner Pages (`design-preview12.html` as base for everything)

- [x] Remove **Blocked** status — do not use this label anywhere *(label renamed "Waiting upstream" to match the landing legend; verbs like "blocking/unblocks" kept — flag if those should go too)*
- [x] Rework the **Due Today / Awaiting Approval / In Progress** section — stats folded into the black "Fix API Rate Limits" card as a hairline-separated ledger row (`.fstats`); generic gray stat-strip deleted
- [x] Remove the letters/avatars shown on the right side of the Projects list
- [x] Add **Assistant** button/entry point at the top of the dashboard (header area)
- [x] Add **Assistant** to the footer/bottom nav — bottom helper strip renamed to Assistant; *(propagating to every inner page happens in Phase 2)*
- [x] Remove all logo/icon usage — **use the wordmark "Threadline" only** everywhere *(both previews done; app-wide in Phase 2)*

---

## Global / Consistency Rules (apply across every page)

- [x] No logo mark — wordmark **Threadline** only, always
- [ ] All animations and transitions must match `landing-page-design-8.html` exactly — do not invent new ones
- [ ] Every tab/inner page (Tasks, Projects, Members, Settings, etc.) must follow the design language of `design-preview12.html` — adjust those pages to match, not the other way around *(round 7 rebuilt the dashboard shell + `/dashboard` itself; the other 10 inner pages are next)*
- [x] Assistant feature must be consistently present: top header + footer on every inner page *(round 7: `AssistantHelperStrip` now mounted in the shared dashboard layout, not just the /dashboard page)*
- [x] Do not lose any existing features — this is a UI pass only, functionality stays intact *(rich project search/filter/tags/bulk-select relocated to new `/projects` page, not removed)*
- [x] Treat `design-preview12.html` as if you are building from the dashboard outward — all other pages inherit from it *(dashboard shell now correct — round 7; per-page propagation is the next round)*

### Round 7 rebuild — 2026-07-20 (see REDESIGN_PROGRESS.md for full detail)

- [x] Dependency graph preview per project — built for real (`dependency-map-preview.tsx`), using each task's actual editor position + real edges, not simplified
- [x] Focus card ("First up") — real single-task card w/ Open task/View in graph + fstats ledger, replacing the old generic 4-count snapshot
- [x] Projects list — wired onto the exact `.dash-prow` markup (existed as dead CSS since an earlier round, never used until now)
- [x] Sidebar primary nav matches the file exactly (Dashboard/My tasks/Deadlines/Team/More); new `/deadlines` page added
- [x] Marketing footer removed from dashboard/inner pages; helper strip is layout-level now
- [x] Section `<hr>` separators removed — file uses spacing only, no divider lines
- [ ] Full side-by-side visual verification against the file (light + dark, signed in) — not done in this environment, no authenticated session available; user to verify

---

## Status Key

| Symbol | Meaning |
|--------|---------|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Done |
