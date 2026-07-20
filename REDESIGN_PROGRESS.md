# Threadline UI Redesign — Progress Log

> **Purpose:** session-continuity file. If a session ends, say "continue" and the assistant
> resumes from the state recorded here. Keep this file updated after every checklist item.

## Round 7 — 2026-07-20 (total dashboard rebuild — structural, not a reskin)

User rejected everything up through round 6 as "not even close" to `design-preview12.html`
structurally, despite prior rounds getting tokens right. Confirmed via direct comparison: the
`/dashboard` page had drifted into its own invented composition (rich searchable/filterable
project grid, Insights + Friends panels, a generic 4-count snapshot card instead of the file's
single-task focus card, no dependency-map section at all, visible `<hr>` separators the file
doesn't have, marketing `SiteFooter` instead of the file's `.helper` Assistant strip). Asked the
user 3 direct questions before rebuilding (answers now settled, do not re-ask):
1. **Projects section** → dashboard shows the exact plain `.prow` 3-row-style list only. The
   rich search/tag-filter/bulk-select grid moved to a new **`/projects`** page
   (`src/app/(dashboard)/projects/page.tsx` + `src/components/projects-grid-section.tsx`).
2. **Insights panel + Friends/workload panel** (not in the file) → **kept**, but moved below
   every file-derived section, never interleaved with them.
3. **Footer** → marketing `SiteFooter` removed from all dashboard/inner pages; every page now
   ends with a real `.helper`-style **`AssistantHelperStrip`** (`src/components/
   assistant-helper-strip.tsx`), mounted once in `(dashboard)/layout.tsx` so it's structurally
   guaranteed on every inner page, not just `/dashboard`.

What was actually built this round (not just restyled):
- **Focus card ("First up")** is real now: `(dashboard)/dashboard/page.tsx` picks the single
  most urgent task (overdue > due-today > is-a-blocker > soonest-due, each tier sorted by how
  many other tasks it's blocking) and `HeroSection` in `dashboard-content.tsx` renders it with
  Open task / View in graph buttons + a Due-today/In-progress/Awaiting-approval `fstats` ledger
  — replacing the old generic Overdue/Today/Week/Later snapshot card.
- **Dependency map section** built from scratch — `src/components/dependency-map-preview.tsx`.
  Real data, not a fabricated layout: reuses each `TaskNode`'s actual `positionX`/`positionY`
  from the graph editor (normalized into the file's fixed canvas box) and real `Edge` rows.
  Glyph/badge logic lives in `src/lib/dependency-map.ts` (`computeDependencyGlyphs`) — a node is
  "blocked" (`g-blocked`, label "Waiting upstream", never the literal word "Blocked") if it has
  an incoming edge from a not-yet-complete node; "blocks N" badge = count of its own outgoing
  edges to not-yet-complete nodes. Shared by both the map preview and the first-up task picker.
- **Projects list on the dashboard** now uses the `.dash-prow`/`.dash-role-*` CSS classes that
  already existed verbatim in `globals.css` from an earlier round but were never actually wired
  up to any markup — they were dead code until this round.
- **Sidebar**: primary nav reordered to match the file exactly — Dashboard / My tasks /
  **Deadlines** / Team / More — with Messages + Calendar moved into "More" alongside
  Overview/Analytics/Friends/Trash (file's sidebar never shows Messages/Calendar as primary
  items). Added the file's `+` new-project button next to the "Projects" section label and the
  `.ava` initials avatar in the sidebar footer (both existed in the file, were missing in-app).
  New `/deadlines` page created for that nav item (`(dashboard)/deadlines/page.tsx` +
  `deadlines-client.tsx`) since no equivalent page existed before.
- **Topbar**: added the file's presence-avatar cluster + pulsing "N online" live dot
  (`usePresenceMembers`, a new export in `use-presence.ts` returning full member info instead of
  just online ids, used only by the topbar — the dashboard's Friends panel still uses the
  original `usePresence` id-only hook).
- Removed the `<hr class="dash-separator">` elements between every dashboard section — the file
  has no divider lines, only `margin-top: 44px` between sections (`.dash-sect`).
- `formatRelativeTime` moved from a private helper in `dashboard-content.tsx` into
  `src/lib/utils.ts` so both the dashboard's plain project rows and the new `/projects` grid can
  share it without duplication.

Verified: `tsc --noEmit` and `eslint` clean on every touched/new file. Server boots cleanly —
confirmed via curl that `/dashboard`, `/projects`, `/deadlines` (and pre-existing `/overview`,
`/friends`, `/trash`, which all hit the identical pre-existing `requireUser()` "Unauthorized"
throw when signed out) fail for the *expected* auth-gate reason, not a compile/runtime bug — no
new errors introduced. **Not yet verified visually against the file** — this environment has no
authenticated Clerk session to screenshot the real signed-in dashboard. User should do the
side-by-side comparison the brief itself demands (light + dark) before this is considered done.

Known gap, flagged not silently skipped: "Open task" on the focus card links to the graph
editor (same destination as "View in graph") rather than deep-linking straight to the specific
task's detail panel — the graph editor (`graph-editor.tsx`) has no query-param-driven
node-select today, and wiring that in was out of scope for a UI-shell rebuild pass.

Scope boundary carried forward: this round rebuilt the dashboard shell (sidebar/topbar/footer,
shared by every inner page) and the `/dashboard` page itself. The other 10 inner pages
(my-tasks, calendar, team, analytics, friends, trash, messages, overview, settings, profile)
have NOT been restyled onto these dashboard patterns yet — per the brief's own sequencing
("once the dashboard passes review, it becomes the pivot for other pages"), that is next.

## Decisions made (do not re-ask)

- **2026-07-19:** User confirmed the plan: **refine the HTML previews first**
  (`design-preview8.html` = landing pivot, `design-preview12.html` = dashboard pivot),
  then port the finished design into the Next.js app (`src/`) in a later phase.
- The checklist's `landing-page-design-8.html` refers to **`design-preview8.html`**
  (verified: it contains "Open app", "The supporting cast", pricing).
- `design-preview13.html` exists but the user's pivot is explicitly **12** — use 12.
- Task tracking lives in `REDESIGN_CHECKLIST.md` (`[ ]` todo, `[~]` in progress, `[x]` done).

## Phases

1. **Phase 1 (current):** work through REDESIGN_CHECKLIST.md by editing the two preview
   HTML files until final.
2. **Phase 2 (later):** port finished design into the Next.js app under `src/`
   (landing page `src/app/page.tsx` + marketing components, dashboard `src/app/(dashboard)`,
   all inner pages inherit from design-preview12 patterns). UI-only pass — no feature removal.

## Current state

- **Phase 1 COMPLETE:** both preview files match the checklist (incl. user feedback rounds 1–2).
- **Phase 2 IN PROGRESS — porting the design into the Next.js app:**
  - **Landing page: DONE 2026-07-20.** `src/app/page.tsx` fully rewritten to the
    design-preview8 language (monochrome, SF stack). New client components:
    `src/components/marketing/landing-stage.tsx` (hero graph cascade demo, "Watch it flow")
    and `src/components/marketing/landing-stations.tsx` (scroll-thread + 5 interactive
    vignettes: roles / live / timing / focus / assistant plan-mode). CSS is the
    `landingStyles` string in page.tsx, all selectors scoped under `.landing-page`,
    dark mode via the app's `.dark` class (NOT `[data-theme]`). Kept: Clerk redirect,
    About/solo-developer content + stats, contact links, final CTA ("Ready to see your
    projects clearly?" — markup untouched), FloatingThemeToggle, SiteFooter.
    LandingNav: added Pricing anchor; monochrome wordmark via CSS. SiteFooter: added
    tagline headline "Work flows when you see how it connects."
    Contact form from the pivot was NOT ported (demo-only fake submit) — landing links
    to the real /contact page instead.
  - **App-wide pass: DONE 2026-07-20.**
    - `globals.css` tokens aligned to the exact preview12 palette (light: #fff canvas /
      #1d1d1f ink / #f5f5f7 band; dark: pure #000 canvas / #f5f5f7 ink / #141414 band) —
      every page inherits this since the whole app is built on these variables.
    - `dashboard-navbar.tsx`: added a visible **Assistant** button (sparkle + label,
      quiet pill) in the header utility group → opens the existing AIChatPanel. Sets
      `window.__tlAssistantReady` so the footer knows a panel is mounted.
    - `site-footer.tsx` (shared by dashboard + site pages = every-page consistency):
      added **Assistant** entry at the top of the Product column — dispatches
      `open-ai-chat` when a panel is mounted, otherwise routes to /dashboard.
    - `dashboard-content.tsx` HeroSection: snapshot card is now the page's single
      **ink card** (accent bg, on-accent text, health ring in on-ink tones) with the
      four counts (Overdue/Today/This week/Later) as a hairline-separated ledger row —
      the generic boxed hover-tiles are gone.
    - **Blocked label removed app-wide** (UI only; BLOCKED status/logic untouched):
      `getStatusLabel` → "Waiting upstream", plus hardcoded strings in calendar-client,
      analytics, overview-client, dashboard-content, task-detail-panel,
      multi-select-panel, task-node ("Waiting on dependencies"), docs page.
    - Wordmark verified text-only + monochrome everywhere (`--logo-accent` =
      `--text-primary`; no logo marks in the app).
  - **Possible follow-ups (not yet done):** page-by-page structural polish to match
    preview12's quiet-row patterns (project cards → rows, section shells), and the
    graph editor toolbar could carry the Assistant label check. Tokens carry the look;
    these are refinements.
### User feedback round 2 — applied 2026-07-20
- **About section + stats removed** from the landing (user request); Contact section
  removed too (footer already covers it). Nav: About anchor dropped, Contact now routes
  to the real `/contact` page (`handleNavClick` lets non-hash hrefs navigate normally).
- **Sticky nav fixed:** `.landing-page` had `overflow-x: hidden`, which creates a scroll
  container and silently disables `position: sticky` → changed to `overflow-x: clip`.
- **Check glyphs:** rendered correctly in headless verification; the user's broken
  screenshot (blobby off-center checks) + "sign in doesn't work" almost certainly came
  from the window where the dev server was down (killed accidentally last session) —
  stale page, no CSS/JS. Still hardened: explicit `fill="none"` on check SVGs, and
  `pathLength` only on the st-node check (pivot-exact).
- **Clerk theming aligned to new palette:** swept old-palette hexes → new ones in
  `dashboard-navbar.tsx` (UserButton popover/profile modal), sign-in and sign-up pages
  (#151517→#0A0A0A, #0A0A0B→#000000, #1C1C1F→#141414, #F2F2F4→#F5F5F7, etc.).
  `src/actions/team-actions.ts` email template left untouched (backend).
- **Footer links verified:** all 9 routes (features, pricing, changelog, docs, guides,
  about, contact, terms, privacy) return 200.
- **NO backend/feature changes** — user emphasized UI-only; logic untouched throughout.

### User feedback round 6 — applied 2026-07-20 (auth input overflow fix + full dashboard audit)
- **Auth input overflow (sign-in/sign-up):** root cause was `overflow: visible !important` I'd
  applied to `.cl-card/.cl-cardBox/.cl-rootBox` in round 5, unmasking an internal Clerk width
  mismatch that used to be silently clipped. Removed that rule; added `box-sizing: border-box`
  + `max-width: 100%` on every Clerk wrapper and the input itself as a hard guarantee. Also
  widened the card `420px → 440px` since the user said the container itself felt cramped.
  Verified via screenshot — input now sits inside the card with correct padding on both edges.
- **Full dashboard audit against design-preview12.html** (re-read the pivot file completely
  and fresh before touching anything, per the user's explicit brief). Real findings:
  - **Confirmed regression:** `dashboard-content.tsx` still had responsive rules targeting
    `.dash-hero`/`.dash-search-box`, classes that no longer exist on any element since round 4
    replaced that markup — dead/orphaned CSS, silently losing intended mobile behavior. Removed
    and replaced with rules that target the actual current `.greet-row` markup.
  - **Confirmed radius drift:** the app's shared `--radius-sm/md/lg/xl` tokens (10/16/22/28px)
    predate this redesign and never matched preview12's actual scale (`--r-sm/md/lg` =
    8/12/16px). Introduced a `.dash-shell`-scoped `--dp-*` token set (colors, radius, shadow,
    pill, ease — every value copied verbatim from preview12's own `:root`/`[data-theme=dark]`
    block) so this section traces to exactly one source, without touching the shared tokens
    used elsewhere in the app (Settings, modals, etc. — out of scope for this brief).
  - **Confirmed a second, cohesive drift pattern** repeated across every real panel (Needs
    Attention, Deadlines, Projects/ProjectCard, Friends): colored violet/danger accents,
    hover-lift + elevated shadow on the OUTER card, and the wrong radius scale. Preview12's own
    language is monochrome and flat — cards never lift, only individual rows tint on hover.
    Reworked all four panels onto new shared exact-match utility classes (`.dash-card`,
    `.dash-trow`, `.dash-g*` status glyphs, `.dash-seg`, `.dash-prow`) mirroring preview12's
    `.card`/`.trow`/`.g-*`/`.seg`/`.prow` 1:1.
  - **The "AI Banner"** (a Task Helper prompt near the top of the dashboard) turned out to be
    the same underlying feature as preview12's bottom `.helper` "Assistant" strip — restyled
    it to that exact spec (ink square icon badge, flat band-2 card, no lift) rather than
    building a second redundant assistant entry point.
  - **The Projects section fork:** the real "Projects" UI is a rich card grid with a search
    box, sliding-pill tag/status filter bar, per-card tag manager, visibility toggle, and bulk
    select+delete — nothing like preview12's static 3-row mock. Asked the user directly rather
    than silently picking; answer: keep every feature, reskin fully onto preview12's tokens.
    Did that — search box, filter bar, active-pill, show-all bar, select-mode toggle, grid
    cell radius, and the ProjectCard itself all now use `--dp-*` tokens; ProjectCard's hover is
    modeled on preview12's own `.tnode:hover` (the pivot's only boxed-card hover precedent —
    1px lift + ink-3 border tint, never a 4px lift or colored ring).
  - **Two real dark-mode contrast bugs found and fixed in passing** (hardcoded `color: "#fff"`
    on `--accent`/`--danger` backgrounds that both flip to near-white in dark mode, making text
    invisible): the active project-tab pill and the bulk-select checkbox/floating-delete-bar
    button. Both now use `var(--dp-bg)`, which correctly flips light/dark.
  - **Confirmed already-clean** (no changes needed): "Blocked" label — zero remaining instances
    app-wide; letter-avatar remnants in ProjectCard — never existed there (the brief's original
    "remove letter avatars" applied to a different, simpler list UI); logo/icon marks — zero,
    wordmark is text-only everywhere; Assistant header+footer — structurally guaranteed on
    every one of the 13 inner pages since they all share one `(dashboard)/layout.tsx`.
  - Fixed `dash-content-inner` max-width 1100px → 1060px (verbatim `.content-inner`).
  - Not done (flagged, not silently skipped): sidebar/topbar radius were already exactly
    correct from round 4 (hardcoded 8px, matches `--dp-r-sm`) — no change needed there.
- Verified: `tsc --noEmit` clean, `eslint` clean on all touched files. Not yet verified with a
  live signed-in screenshot (requires a real session) — user should check the dashboard visually.

### User feedback round 5 — applied 2026-07-20 (full from-scratch auth rebuild)
User rejected round 4's auth pages outright ("nothing is well thought off... follow the
laws of ui/ux") and gave an explicit from-scratch brief naming `landing-page-design-8.html`
as sole source of truth. That exact filename doesn't exist in this repo — confirmed via
`find`; used `design-preview8.html` (the real pivot) cross-checked against the LIVE
`src/app/page.tsx` `landingStyles` (its faithful current port) as the authoritative source,
and said so rather than silently guessing.
- **`auth-shell.tsx` fully deleted and rewritten** (not patched) — every token in the new
  file is commented with its exact source rule from the pivot (verbatim vs. explicitly
  derived), per the brief's own requirement to show the extraction work:
  - Colors/fields/radii/pill/ease: verbatim `:root`/`[data-theme=dark]` vars.
  - Card = verbatim `.cform` spec (18px radius, 0.5px hair-soft border, 26px pad, shadow-frame)
    — the landing's OWN existing form-card, the closest possible precedent, reused exactly.
  - Input = verbatim `.cfield input` spec (10px radius, transparent border, `--field` bg,
    focus border `--blue` + bg `--card`).
  - Primary button = verbatim `.btn` + `.btn-blue` + `.btn-big` (pill radius, 13px/28px pad,
    17px, hover bg `--blue-hover` + `--shadow-float`, active `scale(.97)`).
  - Google button = verbatim `.btn-quiet` + `.btn-big` (ghost, 1px hair border).
  - Heading = verbatim `.headline`. Subtext size (15px) = an EXISTING size already used
    in the file (`.btn`/`.applelink`), not invented, chosen because the brief's "small"
    requirement conflicts with `.sub`'s hero-scale (18-21px).
  - Entrance choreography = verbatim `.hero h1`/`.hero .sub`/`.stage-wrap` riseIn timings
    (800/900ms, `var(--ease-out)`, 0/100/300ms delays), extended one more arithmetic step
    (380ms) for the switch link — the brief's own allowance for "derive from closest pattern."
  - Divider built fresh from verbatim tokens (hair-soft hairline + footnote text spec +
    the file's 22px spacing constant, which recurs throughout as the base gutter).
  - **`--a-danger` (warm red) is the one value with NO precedent** — pivot is strictly
    monochrome by its own header comment. Brief explicitly demanded a warm red for errors
    despite this; followed the explicit instruction, scoped the color locally to
    `.auth-page` only (doesn't touch the app's existing monochrome `--danger` tokens
    elsewhere), kept it muted/desaturated per "subtle, not alarming."
- **Layout completely changed**: dropped the two-panel split + draggable divider from
  round 4 entirely (brief: "do not replicate the old design," single centered card,
  vertically centered, wordmark above). Pages are Server Components again (no client
  state needed without the divider) — enables clean per-page `export const metadata`
  for exact tab titles ("Sign in — Threadline" / "Sign up — Threadline"), verified live.
- **Caught and fixed a real functional bug**: initially used `appearance={{ layout: {...} }}`
  to reorder Clerk's social button below the primary form (per brief: primary → divider →
  Google). Screenshot-verified it did NOTHING — the key silently no-opped. Traced into
  `node_modules/@clerk/react`'s actual shipped `.d.cts` type declarations (not memory of
  older Clerk docs) and found this SDK version renamed the config key to `options` — fixed
  to `options: { socialButtonsPlacement: "bottom" }`, re-screenshotted, confirmed correct
  order. Left a comment explaining why, since this is exactly the kind of silent-mismatch
  bug that's invisible without visual verification.
- **Confirm-password**: skipped per the brief's own explicit branch ("or a show/hide
  toggle instead — use judgment") — Clerk's password field already ships a show/hide eye
  icon; verified present in the screenshot.
- **Full Name field**: NOT added. Clerk's `<SignUp/>` renders only fields enabled in the
  Clerk Dashboard (User & Authentication → Email, Phone, Username → Name) — this is a
  remote dashboard toggle, not a code change, and not something reachable from this repo.
  Explicitly flagged to the user rather than fabricating a disconnected input that
  wouldn't actually submit anywhere. Once they enable it in the Dashboard, Clerk will
  render it automatically inside this exact same styled form — the CSS already targets
  `.cl-formFieldInput`/`.cl-formFieldLabel` generically, so zero further code is needed.
- Verified: tsc clean, eslint clean, both pages screenshotted in dark mode (light mode
  not yet screenshotted — the app's default is dark via `themeScript` in root layout).

### User feedback round 4 — applied 2026-07-20 (the big one)
User rejected the round-3 auth design (right: it was a reskin, not a redesign) and
called out that the dashboard never got preview12's actual SHELL. Both rebuilt:
- **Dashboard shell (preview12 for real):** new `dashboard-sidebar.tsx` (wordmark, nav
  w/ More disclosure, Projects section w/ open counts, user+theme footer);
  `dashboard-navbar.tsx` converted from floating pill-card to preview12 topbar (search
  left, spacer, Assistant, messages, bell, CreateProjectButton, UserButton; theme switch
  mobile-only; pill nav replaced by `.dash-mobile-nav` row <1024px). `(dashboard)/layout.tsx`
  = `.dash-shell` (sidebar + main{topbar, `.dash-content-inner` 1100px, SiteFooter});
  layout runs a lean prisma read for sidebar projects (id/name/open count — read-only).
  All shell CSS in globals.css under "App shell — ported from design-preview12".
  ALL topbar logic preserved (unread badge, channels, Clerk config, AIChatPanel).
- **Dashboard greeting:** 52px hero card → preview12 greet-row (27px h1, sub line with
  due today/overdue/open counts, 42px health ring right). Ink snapshot card now leads
  with "TODAY / N tasks remaining" (ring no longer duplicated inside it).
- **Auth v2 (actual redesign):** left = brand statement + a working miniature
  dependency-graph artifact (Done node → two Ready nodes, animated dashed edges,
  caption) on the dotted backdrop; right = form directly on canvas (killed the
  card-in-card), 28px title, quiet-pill social, ink-pill primary (visible disabled
  state), field-spec inputs, legal footer pinned bottom. Copy deduped (no more
  "Welcome back" twice). Same AuthShell for both pages. Verified via screenshot.
- **Dashboard NOT yet eyeballed signed-in** (headless can't auth) — user to verify.

### User feedback round 3 — applied 2026-07-20
- **Sign-in / sign-up FULL redesign** (user: palette swap wasn't enough — total redesign
  on the pivots). New shared `src/components/marketing/auth-shell.tsx` (AuthShell +
  AuthCheckRow + AuthStatLedger + clerkAuthAppearance + all styles) so both pages can't
  drift. Left panel = landing hero in dark: dotted-line backdrop, lowercase wordmark,
  eyebrow + headline scale, dark hairline vignette card (sign-in: ink-check feature rows;
  sign-up: fstats-style stat ledger + quote). Right panel = form in the landing
  contact-card spec (18px radius, hairline, frame shadow), Clerk restyled: field-spec
  inputs (quiet bg, transparent border, ink focus), ink PILL primary, quiet-pill socials,
  applelink account links w/ chevron, staggered rise-in entrance (landing's animation).
  Split layout + draggable divider feature preserved; Clerk logic untouched.
  Verified via headless screenshots — both pages render correctly.
- **Turbopack panic fixed earlier this session:** corrupted `.next` cache (two dev
  servers had shared it). Fix: kill server → `rm -rf .next` → restart. Never run two
  `next dev` instances on this project.

- Dev note: threadline dev server now runs at **localhost:3000** (the other project
  "noted" no longer occupies it; user restarted `npm run dev` themselves — do NOT kill
  their server). `/dashboard` returns 404 to unauthenticated curl (Clerk
  protect-rewrite) — normal. Headless screenshots:
  `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --screenshot=out.png --window-size=1400,6200 http://localhost:3001/`
  (renders dark mode — app default without localStorage).

## Item-by-item notes

### Landing (design-preview8.html) — all done 2026-07-19
- **Footer tagline:** added `.ftag` block with `<h2 class="headline-s">Work flows when you see how it connects.</h2>` above `.fnote`; removed the duplicated sentence from the fnote body. CSS: `.l-footer .ftag` rules next to `.l-footer .fnote`.
- **Sign In / Sign Up:** replaced the top-nav "Open app" button with `.btn-quiet` Sign In + `.btn-blue` Sign Up (both `data-go="dash"` for preview navigation).
- **Dotted hero background:** `.screen.landing::before` pseudo-element — radial-gradient dot rows (`background-size: 14px 28px`, reads as dotted horizontal lines), color `var(--gray-dot)` (theme-aware), radial mask fading out below the hero, `z-index: -1`.
- **Section rename:** eyebrow "The supporting cast" → "Beyond the graph"; headline "Five more tasks before the bottom of this page." → "Everything your team needs to ship in the right order." + value-prop sub copy (kept the "watch the thread" cue since the scroll animation remains).
- **Assistant hover too white (dark):** root cause — `.plan-mini { background: var(--ink) }` inverts to near-white in dark theme. Fix: `[data-theme="dark"] .plan-mini { background: var(--card); color: var(--ink); border: 0.5px solid var(--hair); }`.
- **Pricing:** 3 cards → 2 (Free + **Team** $8/member/mo "Most popular"). Free lists: 5 projects max, 7 members/project max, unlimited tasks & deps, live sync/roles/views. Team: unlimited teammates & projects + assistant + analytics + stakeholder seats + priority support (absorbed old Business perks). Featured card uses the file's ink-card treatment (black card in light mode, `--card` in dark) — CSS at `.price-card.feat`. Grid now `repeat(2, 1fr)` max-width 780px. Headline: "Two plans. The graph is in both." Hero footnote updated to "Free for teams up to seven per project."
- **Bottom CTA ("Ready to see your project clearly?" / "Start Project"):** NOT in preview8 — lives in `src/app/page.tsx`. Rule recorded: keep exactly as-is in Phase 2.
- **Wordmark-only (preview8 part):** removed both thread-line logo SVGs (gnav + dashboard-screen sidebar); `.wordmark` is now text only.

### Dashboard (design-preview12.html) — all done 2026-07-19
- **Blocked status removed:** stat-strip entry deleted; `STATUS.blocked` label → "Waiting upstream" (matches preview8's landing legend); q3 insight copy "Nothing is blocked" → "Nothing is waiting upstream". Kept: verbs "blocking / unblocks / Blocks 3 / blocker to clear" (dependency mechanics, not the status label) and internal `blocked`/`g-blocked` keys+classes. Flag to user if they want those renamed too.
- **Due Today / In Progress / Awaiting Approval rework:** deleted the generic `.stat-strip`; the three counts now live INSIDE the black focus card as `.fstats` — a hairline-separated ledger row under the task (border/dividers `color-mix(--bg 22%)`, labels `color-mix(--bg 62%)`, hover `color-mix(--bg 9%)`). Focus card restructured: new `.ftop` wraps fbody+frow; card padding now `24px 26px 12px`. On-ink glyph variants added: `.focus-card .g-ready/.g-await`; `.focus-card .eyebrow .g-prog` selector generalized to `.focus-card .g-prog`. Responsive (≤1020px) rules updated for `.ftop`/`.fstats`.
- **Projects letter avatars removed:** `.presence` spans deleted from all three `.prow`s + their CSS. Topbar "online now" presence cluster intentionally kept (not part of Projects list).
- **Assistant entry points:** topbar gets `#assistantBtn` (`.btn-quiet` + sparkle svg, sits before "＋ New task"); bottom `.helper` strip renamed "Task Helper" → "Assistant", button "Open helper" → "Open Assistant". Same sparkle icon both places.
- **Wordmark-only (preview12 part):** `.wm-dot` glyph + CSS removed; sidebar shows the word only.

### User feedback round 1 — applied 2026-07-19
- **Footer wordmark (preview8):** user wanted the "threadline" wordmark itself in the footer, not just the tagline. Added `<a class="wordmark">threadline</a>` at the top of the footer, tagline headline right under it.
- **Assistant black box hover (preview8):** still too light — darkened dark-theme `.plan-mini` further to `var(--band)` (#101012) with `--hair-soft` border, and dark-mode hover shadow on its vignette kept dark (`:has(.plan-mini)` rule).
- **Boxed letters (preview12):** user meant the LEFT-side boxed letter glyphs (L/W/Q, `.pi-glyph`), not just right-side avatars. Removed from sidebar project nav AND Projects card rows, CSS deleted, row divider offset fixed (50px → 18px).
- **Dashboard organization (preview12):** sections reordered by urgency so the page isn't confusing: greeting → focus card → Needs attention + Deadlines → Projects → Dependency map → Assistant. (The mid-page graph was the confusion point — user's own round-13 notes agree.) Nothing removed; "View in graph" still scrolls to the map.
