# FABLE-PROGRESS.md — Audit, Plan & Running Progress

> **Continuity file.** If a session is interrupted, start a new session and say "Continue from FABLE-PROGRESS.md."
> Last updated: 2026-07-17 — **ALL PHASES COMPLETE** (P0–P5 + motion pass). ~112 files modified, uncommitted.
> Final gates: tsc 0 errors · eslint 0 errors (11 documented judgment-call warnings) · `next build` succeeds
> (40 routes) · dev-server smoke test green (all public pages 200, auth redirect verified, bad share token 404,
> cron endpoints fail closed 401).
>
> ### ⚠️ Remaining items that need YOU (can't be done from code)
> 1. **Review & commit.** Everything is uncommitted by design — skim `git diff`, then commit. Suggested first
>    step: `git add -A && git commit` (checkpoint commit `97e5f1c` from before the run is your rollback point).
> 2. **Manual QA (needs two real browser sessions):** live realtime flows (friend request appearing without
>    reload, DM notifications + navbar badge, added-to-project refresh), profile-picture upload (code path reads
>    intact — audit refuted the reported bug, but verify visually), create-project modal centering, settings page
>    at 320/480/768 px widths. Everything was code-verified; these deserve one human pass.
> 3. **Production env vars (Vercel):** set `CRON_SECRET` (cron routes now 401 without it — good, but Vercel's
>    scheduler must send it), `CONTACT_EMAIL` (contact form recipient), and optionally `UPSTASH_REDIS_REST_URL`/
>    `UPSTASH_REDIS_REST_TOKEN` for durable rate limiting.
> 4. **Prisma migration baseline:** the dev DB was provisioned via `db push` (no migration history), so all schema
>    changes in this run were also applied via `db push`. Before production, baseline migrations
>    (`prisma migrate diff` → init migration → `migrate resolve`).
> 5. **Username login** (from your notes): that's Clerk dashboard configuration (enable username as identifier),
>    not code — usernames are now surfaced throughout the UI.
> 6. **Deferred by decision:** kanban/list views, subtasks, project drag-reorder (P3-6), `middleware.ts`→`proxy.ts`
>    rename (Clerk compat unverified), TagChip `isSystem` visual distinction (flagged real feature gap).
>
> **How this file works:** Part 1 is the full audit inventory (static — findings as of the audit).
> Part 2 is judgment calls with reasoning. Part 3 is the prioritized work plan with live checkboxes —
> that section is the source of truth for what's done. Part 4 is a running decisions/notes log.
>
> **References:** `spec-notes/checklist.md` (newest user feedback, Jul 16) · `requirements.md` (finalized Q&A, Jul 12)
> · `edits.md` (earlier brief) · three deleted-but-in-git spec files (`git show HEAD:spec-notes/01|02|03-*.md`)
> · Next.js 16 conventions cheat-sheet saved in session scratchpad (`next16-cheatsheet.md`).
> Note: `spec-notes/personal-notes.md` referenced in the task prompt does not exist; `checklist.md` is its evident successor.

---

# PART 1 — FULL AUDIT INVENTORY

Audited via five parallel deep read-throughs (infra/realtime, dashboard pages, social, graph editor,
marketing/UI) + typecheck (passes clean). App: "Threadline" — Next.js 16.2.10, React 19, Prisma 7 + Neon,
Clerk, Pusher, Resend (unused), Vercel Blob.

## 1A. Working as expected ✅

- **Graph editor realtime collaboration** — node/edge create/update/move/delete broadcast on
  `private-graph-{id}` and consumed live; optimistic updates with dupe guards; presence
  (`presence-graph-*`, `presence-dashboard`) genuinely functional. This is NOT the source of the
  "manual refresh" complaints.
- **Chat & DM live delivery** — `new-message` / `new-dm` Pusher events wired end-to-end (messages page,
  chat popup). Messages appear live *within an open conversation*.
- **Pusher channel authorization** — membership checks per channel type, rate-limited. Solid.
- **Friend request core CRUD** — send/accept/decline/remove, self-request + duplicate guards,
  mutual-add auto-accept.
- **Profile picture pipeline** — upload → Vercel Blob → `User.imageUrl` → all render sites read the DB
  field consistently. *Code path is intact; the reported bug was either fixed already or is
  environmental — will verify live before closing (see P2-10).*
- **Clerk auth + user sync** — middleware protection, svix-verified webhook, lazy user upsert fallback.
- **Cycle detection / dependency gating** — correct DFS, enforced client and server side.
- **Comment read-tracking (task comments)** — `CommentRead` drives unread dots on nodes, updates live.
- **Trash page** — restore + permanent delete + registered daily cleanup cron all work.
- **Search dropdown (people + pages)** — debounced, keyboard-navigable, correctly scoped, rate-limited.
- **Theme system** — class-based dark/light, FOUC-prevention inline script, View Transitions crossfade,
  reduced-motion guard.
- **ui/* component kit** — token-driven, clean; `ui/dialog.tsx` already has the solid no-blur scrim.
- **Analytics & Calendar pages** — real data, correct math/date logic (subject to the soft-delete bug below).
- **Share link read-only view** — public graph viewer works (subject to over-fetch + no-revoke below).
- **Sanitization** — HTML/JS stripping consistently applied to comments/messages.
- **IDOR protection on most graph mutations** — consistent ownership re-derivation pattern
  (two outlier files below).

## 1B. Partially working / buggy 🐛

**Security (fix first):**
1. **Cross-project IDOR in `assignUser`/`unassignUser`** (`src/actions/assignment-actions.ts:7-68`) —
   never verifies `nodeId` belongs to `projectId`; any project member can tamper with assignments on
   arbitrary nodes. Also missing the EDITOR role gate its siblings have.
2. **Cron endpoints fail OPEN** (`api/cron/cleanup-projects`, `api/cron/prune-audit`) — auth check is
   `if (cronSecret && ...)` and `CRON_SECRET` is unset ⇒ anyone can trigger permanent project deletion.
3. **IDOR in `removeTeamMember`** (`src/actions/team-group-actions.ts:53-59`) — doesn't verify the
   member row belongs to the caller's team.
4. **Public share page over-fetches** (`app/share/[projectId]/[token]/page.tsx:21`) — ships full `User`
   rows (emails, clerkIds) to unauthenticated visitors.
5. **`getNodeHistory` missing membership check** (`audit-actions.ts:18-35`) — latent IDOR (log is
   currently always empty).

**Data correctness — the single biggest recurring defect:**
6. **Soft-deleted rows leak into every dashboard-area query.** `deletedAt: null` filter missing in:
   `dashboard/page.tsx:18-26`, `overview/page.tsx:8-27` (BOTH the Project and TaskNode queries),
   `my-tasks/page.tsx:10-22`, `analytics/page.tsx:14-22`, `calendar/page.tsx:9-30`.
   Deleted tasks pollute health score, workload, deadlines, calendar, analytics; trashed projects stay
   visible in Overview *even after reload*. This — not caching — is the "deleted items still appear" bug.

**Realtime / notifications (user's #1 priority area):**
7. **No Pusher channel for notifications exists at all.** Bell fetches on mount/open only. New
   notifications never appear live.
8. **Notification items aren't clickable** — `relatedProjectId`/`relatedNodeId` fetched and ignored
   (`notification-dropdown.tsx:108-124`). Also auto-mark-read-on-open makes the "Mark all read" button
   unreachable and kills the unread highlight before it's seen.
9. **No notifications are ever created for:** new DMs, new project-chat messages, new comments, friend
   requests, friend acceptances. (Schema has no enum values for these either.) Only ASSIGNED, APPROVAL_*,
   INVITED are created today.
10. **No Pusher events for:** project CRUD, membership changes (add/kick/role), permission changes,
    attachment add/delete. Being added to a project → notification row is written but the other user's
    open dashboard never updates.
11. **DM unread count is a heuristic** ("last message not mine") — no read model, never clears on read,
    only on reply; navbar badge fetched once on mount, never updates (`api/messages/unread-count`,
    `dashboard-navbar.tsx:119-132`).
12. **"You and X are now connected" renders as a normal chat bubble** — plain DM row, no system flag
    (`friend-actions.ts:69-75`; renderers in `messages-client.tsx:592-628`, `chat-popup.tsx:48`).
13. **Notification preference toggles are inert** — `notifyAssigned/notifyDueSoon/etc.` saved but never
    read at any creation site.

**Graph editor:**
14. **Granular `ProjectPermission` system is non-functional** — matrix editable in `project-settings.tsx`
    but `graph-actions.ts` only checks the hardcoded role hierarchy; AND `project-settings.tsx` is never
    imported anywhere (unreachable UI); AND two parallel member-removal paths exist (`kickMember` honors
    `canKickMembers`, `removeMember` in the share dialog is HEAD-only and ignores it).
15. **MEMBER-role users see all edit controls but every server call fails silently** —
    `graph-editor.tsx:105` hardcodes `isReadOnly = false`; deletes/moves have no error handling
    (unhandled rejections, nodes snap back with zero feedback).
16. **`URGENT` status selectable in UI, rejected by server** (`validStatuses` at `graph-actions.ts:180`
    omits it) — optimistic UI desyncs from DB. Related: `rejectCompletion` sets URGENT instead of
    `REJECTED`, so REJECTED status + its dedicated UI are unreachable.
17. **Role badge in Assigned People always says "Viewer"** — compares against `OWNER`/`EDITOR` which
    aren't in the `HEAD|CO_HEAD|MEMBER` enum (`task-detail-panel.tsx:246`).
18. **Approval flow is vaporware from the UI** — fully implemented server-side, but nothing ever sets
    `isApprover: true`, so `submitForApproval` always returns "No approver assigned."
19. **Node edit history doubly dead** — `logNodeChange` never called by any mutation; `node-history.tsx`
    never rendered; prune cron exists but isn't registered in `vercel.json`.

**AI assistant:**
20. **Every chat request attempts a doomed Ollama call** (`ai-assistant-actions.ts:228-283`,
    `localhost:11434`, env vars unset) — adds latency + error logs, then falls back to the built-in
    heuristic engine. Copy falsely claims "Llama-powered." The heuristic engine itself
    (`lib/ai-assistant.ts`) is exactly the "lightweight non-generative assistant" the user asked for.

**Other app surfaces:**
21. **Dashboard greeting shows stale name forever** — prefers Clerk `firstName` (never updated by the
    profile form, which writes DB only) over fresh DB name (`dashboard-content.tsx:195-198`).
22. **Calendar day-panel task rows are dead ends** — no link/onClick (`calendar-client.tsx:217-238`).
23. **My Tasks page orphaned from nav** — reachable only via ⌘K or direct URL.
24. **Marketing dead controls:** contact form no-op submit (`contact/page.tsx:144`); all three pricing
    CTAs do nothing; docs topic "links" and guides cards are fake non-focusable spans/divs; footer
    "Send feedback" is `href="#"`.
25. **About page invents a fictional team** ("Jordan Vale, Co-Founder & CEO") contradicting the landing
    page's "one stubborn developer" story and the footer's real credit.
26. **Two ad-hoc confirm dialogs use backdrop blur + duplicate `ui/dialog`**
    (`trash-client.tsx:243-254`, `dashboard-content.tsx:826-837`) — user explicitly wants blur gone.
27. **`ui/dialog.tsx` has no focus trap / initial focus / focus restore** — keyboard a11y gap in the
    most shared component.
28. **Theme toggle absent** on graph editor, all (site) pages, and sign-in/up; "System" option missing
    despite README claiming it.
29. **In-memory rate limiting only** — Upstash env vars unset; limiter resets per cold start (weak in
    serverless prod).

## 1C. Missing entirely but implied by existing UI/data model 🔌

- **Email invite flow** — `Invite` model + `/invite/[token]` acceptance page + `lib/resend.ts` all exist;
  nothing ever creates an Invite or sends an email. (Changelog page even advertises Resend emails.)
- **Notification deep-linking** — related IDs modeled + fetched, never used.
- **Realtime notification delivery** — Pusher infra exists, no user channel.
- **`MENTIONED` notifications / @mention parsing** — enum value + user preference exist, zero creation sites.
- **`DUE_SOON` proactive reminders** — enum + preference exist; no cron scans due dates.
- **Share-link revocation/regeneration** — token generated once at creation, permanent forever.
- **Friends/Non-Friends split in add-people search** — explicitly requested (checklist #3); current
  search is a flat all-users list.
- **Drag-and-drop project reordering** — `displayOrder` + `reorderProjects()` action exist, no UI.
- **Cancel/view outgoing friend requests** — only incoming requests are queryable.
- **Teams → projects link** — `/team` page's whole promise ("invite them to projects in one click") has
  zero code path; `TeamMember` rows are bare email strings unlinked to `User`.
- **Presence on Friends/Messages surfaces** — presence infra exists but only the dashboard widget uses it.
- **Project/task search** — navbar search covers people + static page list only.

## 1D. Missing and not yet started, but expected for this type of app 📋

(See Part 2 for adopt/reject reasoning against Asana/Linear/Notion/Trello/ClickUp.)

- **Task priority** (adopt) — no priority field exists at all.
- **Real DM read receipts / unread model** (adopt — also fixes bug #11).
- **@mention autocomplete in comments** (adopt, schema already anticipates it).
- **Due-date reminder job** (adopt, schema already anticipates it).
- **Kanban/board & list alternate views** (reject for now).
- **Task templates / recurring tasks** (reject).
- **Time tracking** (reject).
- **Subtasks/checklists** (reject — nested sub-graphs already cover decomposition).
- **Public REST API / integrations** (reject).

## 1E. Dead code inventory 🪦

| Item | Location | Disposition |
|---|---|---|
| `Header`/`Sidebar`/`TopBar`/`MobileSidebar` chain | `src/components/{header,sidebar,top-bar,mobile-sidebar}.tsx` | Delete (superseded by `dashboard-navbar.tsx`) |
| `DashboardClient` | `src/components/dashboard-client.tsx` | Delete (superseded by `dashboard-content.tsx`) |
| `ProjectGrid` | `src/components/project-grid.tsx` | Delete after confirming label-dialog parity lives in `dashboard-content` |
| `AIInsightsWidget` | `src/components/ai-insights-widget.tsx` | Delete (rendered inline instead) |
| `TeamManager` | `src/components/team-manager.tsx` | Delete (actions used elsewhere; component orphaned) |
| `ProjectSettings` | `src/components/project-settings.tsx` | **Keep & wire up** (P2-1) — it's the missing permissions UI |
| `node-history.tsx` | `src/components/graph/node-history.tsx` | **Keep & wire up** (P2-3) |
| `/invite/[token]` + `Invite` model + `resend.ts` | various | **Keep & wire up** (P2-4) |
| `reorderProjects()` | `project-actions.ts:250-264` | Wire up (P3-6) or delete if dropped |
| Duplicate trash UI on Settings | `recently-deleted.tsx` on `/settings` | Remove from Settings; `/trash` is canonical |
| `NotificationType.MENTIONED`, `DUE_SOON` creation paths | — | Build (P3) |
| Landing page local CSS var shadow layer | `app/page.tsx` | Simplify during polish pass |

---

# PART 2 — FEATURE COMPARISON & JUDGMENT CALLS

**Reference model:** the user pointed at Asana/Linear/Notion/Trello/ClickUp generally, and (in
spec-notes/02) explicitly at **Facebook/Messenger for the social system**. This app's identity is a
*graph-first* task tool with a social layer — closest spiritual neighbor is Linear (focused, opinionated,
fast) rather than ClickUp (everything-and-the-kitchen-sink). Decisions below optimize for that identity.

| Decision | Call | Reasoning |
|---|---|---|
| Notifications architecture | One `private-user-{userId}` Pusher channel per user; all notification writes go through a single `createNotification()` helper that (a) checks user prefs, (b) writes the row, (c) triggers the channel. Bell subscribes once in navbar. | Linear/Asana treat notifications as a first-class inbox. A single choke-point helper fixes bugs #7/#9/#13 at once and makes future types one-liners. |
| Membership/project changes | Same user channel carries a `data-refresh` event; affected clients call `router.refresh()`. | Cheapest correct fix for "added to project doesn't show until reload" — server components re-render with fresh data; no client cache to hand-sync. |
| DM read model | `lastReadAt` on `ConversationParticipant`; mark on conversation open/focus; unread = messages newer than it. Navbar badge updates via the user channel. | Messenger-style per the user's explicit reference. Mirrors the pattern already proven in `comment-read-actions.ts`. |
| System messages in chat | `isSystem` boolean on `DirectMessage`; render centered gray subtext. | Exactly the Messenger pattern the user described in checklist #7. |
| Task priority | Add `priority` enum (URGENT/HIGH/MEDIUM/LOW/NONE) on TaskNode; **remove URGENT from the status enum options in UI** and migrate its semantics to priority. | Every reference tool separates "how it's going" (status) from "how much it matters" (priority). The current URGENT-as-status is both broken (bug #16) and conceptually wrong — rejection flow setting URGENT proves the confusion. |
| Approval flow | Keep and finish (approver picker in detail panel) rather than delete. | Server side is complete and sound; unique differentiator vs Trello/Asana's paid approval features; small UI lift. |
| Permissions | Enforce the existing `ProjectPermission` matrix inside a single `checkPermission()` helper used by all graph mutations; wire `ProjectSettings` into the graph toolbar; collapse `removeMember` into `kickMember` semantics. | requirements.md §10 demands it; half the machinery already exists. One enforcement point avoids drift. |
| Teams | Link `TeamMember` to real `User` rows (keep email for pending), add friend-style user search, one-click "add team to project" (bulk `ProjectMember` upsert + notifications). | This was the page's advertised purpose; spec-notes/02 asks for exactly this. Without the link the page is decorative. |
| Email invites | Wire `Invite` + Resend using `onboarding@resend.dev`, with copy-link fallback rendered regardless (requirements §13 anticipates domain limits). | All three pieces already exist; finishing beats deleting a user-visible promise (changelog advertises it). |
| Add-people search | Two sections: Friends first, then "Other people"; non-friends addable (checklist #3 explicit). | Matches Asana's "frequent collaborators first" pattern without blocking non-friend adds. |
| AI assistant | Delete the Ollama/network branch entirely; pure heuristic engine; honest copy ("built-in assistant"); keep the template graph generator. | checklist #2 asks for exactly this; removes latency, error spam, and false "Llama-powered" claims. |
| Monochrome retrofit | Grayscale the app; purple survives ONLY in the logo/wordmark (checklist exception). Focus rings become high-contrast neutral. Status/priority colors get a restrained semantic treatment (they're information, not decoration — Linear does the same on its mono canvas). | checklist #1 (Jul 16) supersedes requirements.md §2 "keep purple" (Jul 12) — newest instruction wins. Semantic status colors kept because a task tool where BLOCKED and COMPLETE look identical is objectively worse; this reads as consistent with "monochromatic UI chrome." |
| Kanban/list views | Reject for now. | The graph IS the product's signature (requirements §7: "core feature"); My Tasks already provides a personal list. A board view is a large surface that dilutes focus — revisit only when core is polished. |
| Subtasks | Reject. | Nested sub-graphs already model decomposition; a second checklist concept would compete with the core metaphor. |
| Time tracking / templates / recurring / API | Reject. | ClickUp-style breadth; wrong scope for this app's stage. |
| Username login | Surface `@username` in profiles/search (already synced from Clerk); actual username *login* is Clerk dashboard configuration, not code — noting for the user rather than building. | spec-notes/02 asked; the code half is cheap, the auth half isn't ours to write. |
| middleware→proxy rename | Defer, keep `middleware.ts`. | Next 16 deprecation vs unverified Clerk 7.5 `proxy` compat — not worth the risk in this pass. Documented in cheat-sheet. |
| Fabricated testimonials/stats/team | Fix the self-contradiction (About page fake execs → solo-dev story); leave clearly-decorative testimonial styling but de-specify fake named people and fake numeric claims toward honest copy. | Named fake people + fake "2,000+ teams" stats are a credibility liability the user likely pasted from a template without noticing. |

---

# PART 3 — PRIORITIZED WORK PLAN (live checklist)

Execution model: Fable orchestrates & reviews; mechanical multi-file work is delegated to Sonnet
subagents with precise instructions. Every phase ends with typecheck + lint + targeted verification.

## P0 — Security & data-correctness hotfixes (small, surgical) ✅ DONE 2026-07-16
- [x] P0-1 Add `deletedAt: null` filters: dashboard, overview (Project AND TaskNode), my-tasks, analytics, calendar (also filtered soft-deleted projects via relations)
- [x] P0-2 Fix `assignUser`/`unassignUser`: node∈project verification + CO_HEAD/HEAD role gate
- [x] P0-3 Fix `removeTeamMember` IDOR (verify member∈team)
- [x] P0-4 Cron routes fail closed (401 when `CRON_SECRET` unset); `CRON_SECRET` added to `.env.example`
- [x] P0-5 Share page: user select narrowed to id/name/imageUrl (matches viewer usage)
- [x] P0-6 Status enum hygiene: URGENT added to server validStatuses (interim until P3-1); `rejectCompletion` now sets REJECTED; status change has try/catch + revert
- [x] P0-7 Role badge mapping fixed (Head/Co-Head/Member)
- [x] P0-8 Membership check added to `getNodeHistory`
- [x] P0-9 Verified: `tsc --noEmit` clean; eslint clean on touched files (2 pre-existing issues elsewhere noted)

## P1 — Realtime & notifications overhaul (user's top priority)
- [x] P1-1 Schema ✅: new NotificationType values + `ConversationParticipant.lastReadAt` + `DirectMessage.isSystem`. Applied via `prisma db push` (migrate dev blocked by pre-existing drift: DB was provisioned by db push originally — no migration file; flagged in Part 4 log)
- [x] P1-2 `lib/notifications.ts` ✅: `createNotification` (pref-gated) + `triggerDataRefresh`; `private-user-{userId}` authorized in pusher/auth
- [x] P1-3 NotificationDropdown ✅: live subscription, toast on arrival, mark-all-read deferred to close, per-item mark-read endpoint (new `api/notifications/[id]/read`), click-to-navigate deep links, `data-refresh` → `router.refresh()`
- [x] P1-4 Creation sites ✅: DMs, project chat, comments (assignees minus author — TaskNode has no creator field), friend request, friend accept (incl. mutual-add auto-accept branch), invited/assigned/approvals routed through helper
- [x] P1-5 Membership refresh ✅: invite/remove/role-change/kick fire `data-refresh`; listener lives in NotificationDropdown (mounted on every dashboard page)
- [x] P1-6 DM read model ✅: `markConversationRead` + `lastReadAt`-based unread counts + live navbar badge
  (new ref-counted `use-user-channel` hook shared with NotificationDropdown) + unread dots in conversation list
- [x] P1-7 System message ✅: `isSystem` propagated through payloads; centered muted rendering in messages page + chat popup
- [x] P1-8 Attachment add/delete triggers `node-updated` with attachmentCount ✅
- [x] P1-9 Friends page ✅: presence dots via `use-presence`; page refactored to server-props flow so
  `data-refresh` → `router.refresh()` actually updates it (was fetch-once client state)
- [ ] P1-10 Verify end-to-end with two simulated users (scheduled after P2 lands — one combined live-verification pass)

## P2 — Broken-but-visible features
- [x] P2-1 Permissions ✅: `lib/permissions.ts` (`getEffectivePermissions`/`requirePermission`), enforced in all
  graph/assignment/team mutations; ProjectSettings wired in via gear button; kick/remove unified (+ self-removal
  "leave project"); UI gating (toolbar, dragging, connecting, delete, multi-select, View-only pill); delete/move
  now toast on rejection. Follow-up applied by orchestrator: `submitForApproval` aligned to `canEditNodes`.
- [x] P2-2 Approval flow ✅: `setApprover` action + shield toggle in Assigned People; Approve/Reject block for the
  approver (with reject reason); full chain verified in code (was doubly unreachable before)
- [x] P2-3 Node edit history ✅: `logNodeChange` wired into all node/edge/assignment mutations (field-level
  diffs, fire-and-forget), NodeHistory section mounted in detail panel, prune cron registered in vercel.json
- [x] P2-4 Email invites ✅: `inviteByEmail` (existing users added directly; else Invite row + Resend email +
  always-returned copy-link), pending-invites list with revoke, Search/Email tabs in share dialog. Bonus bug
  fixed: invite acceptance page had a redirect loop for brand-new users (bare clerkId lookup instead of
  lazy-creating `getCurrentUser()`); expired/used invites now get friendly status cards instead of 404
- [x] P2-5 Share links ✅: `regenerateShareToken` + `disableShareLink` (token is nullable → true revoke),
  HEAD-only, confirm-step UI in share dialog
- [x] P2-6 AI assistant ✅: Ollama branch deleted, `ai`/`@ai-sdk/openai` uninstalled, honest "built-in planning
  assistant" copy, IDENTITY intent added ("what's your name" now answered)
- [x] P2-7 Add-people search ✅: `searchUsersForProject` with isFriend flag; Friends / Other people sections
- [x] P2-8 Assigned people UX ✅: explicit X-unassign button (aria-labeled) beside approver shield; row-click toggle kept
- [x] P2-9 Comments surfacing ✅: count chip + unread dot in panel header, smooth jump-link, proper section header
- [ ] P2-10 Verify reported-but-unconfirmed bugs live: profile picture upload, create-project modal centering, duplicate-project double-submit (notes-03 — add disable+loading+idempotency regardless), settings responsiveness at 320/480/768
- [x] P2-11 Dashboard greeting prefers DB name ✅ (Clerk override + unused useUser removed)
- [x] P2-12 Calendar day-panel rows link to `/graph/{projectId}?nodeId=` ✅ (+ found & fixed one more missing
  `deletedAt` filter pair in calendar/page.tsx serialization path)
- [ ] P2-13 Navbar cleanup per notes-01 (remove "Synced just now", "Projects need attention"; consistent width;
  logo parity). **Decision change:** NOT adding My Tasks to the main nav — notes-01 explicitly called a Tasks nav
  item redundant. Instead the dashboard tasks widget gets a "View all →" link to /my-tasks (un-orphans the page
  while respecting the stated preference). Purple hover → neutral happens in P4-1.
- [x] P2-14 Search ✅: `searchWorkspace` (people+projects+tasks, shared core lookup), grouped dropdown results
  with working keyboard nav across all groups
- [x] P2-13 partial ✅: logo unified with landing wordmark; navbar width verified already-consistent;
  "Synced just now"/"Projects need attention" turned out to be already removed in HEAD (stale checklist items);
  My Tasks un-orphaned via "View all →" on the dashboard deadlines widget (nav item intentionally NOT added)
- [x] P2-10 partial ✅: create-project double-submit guard hardened ("Creating…" label, close-before-reset).
  Live verification of profile-picture upload, modal centering, settings responsiveness still pending (P2-10 rest)
- [x] P2-15 Marketing dead controls ✅ 2026-07-16: contact form wired (server action → Resend →
  `CONTACT_EMAIL`, validated/rate-limited/sanitized, pending+success+error states); pricing CTAs → /sign-up
  & /contact; docs topics → real keyboard-accessible `<details>` docs grounded in actual features (fake
  SSO/API/billing claims removed); guides cards → expandable real step-by-step guides; footer feedback →
  /contact; About page rewritten to truthful solo-dev story (fake exec team removed).
  *Remaining (moved to P4-1):* landing-page fabricated stats/testimonials get de-specified during the
  monochrome copy-touching pass.
- [ ] P2-16 Notification deep-links (covered by P1-3 — verify against project/node routes)

## P3 — Missing features that fit ✅ DONE 2026-07-16 (except P3-6, deferred)
- [x] P3-1 Task priority ✅: enum + field (schema pushed), picker in detail panel, restrained HIGH/URGENT chip on
  nodes + My Tasks, priority-then-due-date sorting, URGENT status removed from options, data migrated
  (URGENT-status rows → priority URGENT + status IN_PROGRESS; migration re-run idempotently by orchestrator)
- [x] P3-2 Due-soon cron ✅: `/api/cron/due-soon` (fail-closed auth, 20h dedupe window), registered daily 01:00
- [x] P3-3 @mentions ✅: autocomplete (keyboard-navigable) in comment input, validated server-side, MENTIONED
  notifications (pref-gated), mention-vs-COMMENT dedupe, safe highlight rendering (no innerHTML)
- [x] P3-4 Teams rebuild ✅: TeamMember↔User linkage (+ email backfill migration), user search in team add,
  `addTeamToProject` bulk action with INVITED notifications + data refresh, "Add to project" picker on team cards
- [x] P3-5 Outgoing friend requests ✅: Sent-requests section + cancel action
- [ ] P3-6 Project reordering: DEFERRED — decided against drag-and-drop for now; `reorderProjects` action left
  in place; revisit only if the user asks (dashboard grid ordering by recency reads fine)
- [x] P3-7 `@username` surfaced ✅ on friend rows, sent requests, member popup, public profile
- NOTE: P3 agents were killed by a second session-limit during their verification steps; orchestrator verified
  their work directly (typecheck clean, deliverables spot-checked, both migrations re-run idempotently).
  Repo-wide eslint: 24 errors remain, all pre-existing strict react-hooks violations — queued for P5.

## P4 — Design & polish (emil-design-eng + improve-animations skills, whole-app retrofit)
**Monochrome token spec (decided, wave 1 executing):** redefine in globals.css —
light: `--accent #17171A / --accent-hover #2E2E33 / --accent-soft rgba(20,20,25,.06) / ring rgba(20,20,25,.20)`;
dark: `--accent #F2F2F4 / --accent-hover #FFF / --accent-soft rgba(255,255,255,.08) / ring rgba(255,255,255,.28)`;
NEW `--on-accent` (#FFF light / #0A0A0B dark) for text on accent fills; NEW `--logo-accent`
(#7C3AED light / #A78BFA dark) — the ONLY purple, used solely by `.logo-word-accent`; `--violet-*` ramp
repointed to neutral grays (names kept); danger/status/tag-data colors unchanged. Motion tokens added:
`--ease-out-strong cubic-bezier(0.23,1,0.32,1)`, `--ease-in-out-strong cubic-bezier(0.77,0,0.175,1)`.
- [x] P4-1 wave 1 ✅ (2026-07-16): tokens flipped to neutral ink both themes, `--on-accent`/`--logo-accent`
  added, Clerk overrides tokenized (globals + navbar props), ~18 components switched to on-accent text,
  PROJECT_COLORS neutralized, select-chevron SVG neutralized. Survivors OK'd: tag palette (user data),
  `--color-brand-*` @theme scale flagged dead → delete in P5.
- [x] P4-1 wave 2 ✅: landing/sign-in/sign-up/(site) fully monochrome (grep-verified zero purple outside
  `--logo-accent`); local landing var shadow layer repointed to the grayscale ramp; glow blobs de-saturated.
  **Honest copy:** fake logos → feature-keyword strip; named testimonials → unattributed "Threadline
  principles" quotes; fabricated stats → Free-beta / Solo-built / Real-time value statements (same layout).
  FloatingThemeToggle added to (site) layout; focus-visible rings on marketing interactive elements.
- [x] P4-1 wave 3 ✅: charts token-monochrome (contrast fix on Completed bar); folder-node purple fallback →
  neutral; edge animation confirmed already static (dash + hover glow only); theme toggle added to graph
  custom-controls; System theme confirmed already end-to-end; micro-pass: ~55 transition-all fixes across 24
  files, durations capped ≤300ms, press feedback on cards/rows, 7 focus-visible rings, dropdown/chat-popup
  enter animations (170ms ease-out-strong, correct origins)
- [x] P4-4 Theme toggle coverage ✅ (graph via wave 3, site pages via wave 2, System option pre-existing in Settings)
- [x] P4-6 Emil pass core screens ✅ (folded into waves 1-3)
- [x] P4-2 Blur removal ✅ (wave 1: shared ConfirmDialog on ui/dialog, both ad-hoc blurred overlays replaced;
  floating chrome blur intentionally kept)
- [x] P4-3 Dialog a11y ✅ (wave 1: manual focus trap, initial focus, focus restore, enter 190ms/exit 140ms
  scale+fade, ease-out-strong)
- [ ] P4-2 Blur removal: fix the two ad-hoc confirm dialogs (→ shared `ui/dialog` or ConfirmDialog component); decide graph glass-toolbar blur (keep — it's chrome, not popup — unless it reads badly after mono pass)
- [ ] P4-3 Dialog a11y: focus trap, initial focus, focus restore in `ui/dialog.tsx`
- [ ] P4-4 Theme toggle coverage: graph editor + (site) pages + settings ("System" option); consolidate Clerk theming to one layer
- [ ] P4-5 Motion pass (improve-animations skill): audit → prioritized fixes; site pages get the landing's reveal treatment; graph edge constant animation removed (requirements §7.6) if still present
- [ ] P4-6 Emil pass over core screens: dashboard, graph editor + detail panel, messages, friends — spacing, hierarchy, hover states, empty states
- [ ] P4-7 Marketing pages adopt ui/* primitives + shared focus states (kill inline-style/hover-handler pattern where cheap)
- [ ] P4-8 Responsive QA pass (last): 320/480/768/1024 across dashboard, graph, messages, settings

## P5 — Code quality & cleanup ✅ DONE 2026-07-16
- [x] P5-1 Dead components deleted ✅ (9 files earlier + recently-deleted.tsx + `--color-brand-*` scale)
- [x] P5-2 Settings duplicate trash UI removed ✅ (/trash canonical)
- [x] P5-3 Role vocabulary reconciled ✅ — including a REAL BUG: team roster badge compared `"ADMIN"` (not in
  enum) so co-heads always showed "Member"; docs/guides updated to real role names (historical changelog left)
- [x] P5-4 Confirm-dialog consolidation ✅ (done in P4 wave 1)
- [x] P5-5 .env.example complete ✅ (CRON_SECRET, CONTACT_EMAIL, optional UPSTASH block); zero OLLAMA refs
- [x] P5-6 Final gates ✅: tsc 0 errors · eslint 0 errors (11 judgment-call warnings documented: 8× img→next/image,
  1 custom-font, 1 exhaustive-deps stale-closure risk, 1 TagChip isSystem unused prop = real feature gap noted)
  · `next build` SUCCEEDS, 40 routes
- [x] P4-5 Motion audit + execution ✅ (2026-07-17): all top-10 fixes applied — identity-keyed entrance stagger
  (projects grid + friends list no longer replay on filter), node enter/exit transitions in the graph editor
  (mount fade-scale + removingNodeIds exit before unmount), task-detail & AI panels slide/collapse instead of
  hard-cutting (with NODE_EXIT_MS persistence for exit animation), recently-deleted popover got the standard
  dropdown treatment, tag-chip explicit transitions + press feedback, date-picker transition-property mismatch
  fixed, landing hero loop reduced-motion override, trash rows exit animation, (site) pages wired with
  RevealOnScroll, orphaned fade-in.tsx deleted. Orchestrator finished the last panel-persistence lint fix and
  restored live-prop freshness for the open panel.
- [x] P4-7 Marketing focus states ✅ (wave 2); full ui/* adoption on marketing pages intentionally skipped
  (invasive for low value — pages are consistent via tokens now)
- [x] P4-8 Responsive QA — smoke-level only; full manual pass handed to user (see header ⚠️ list)
- [x] Live smoke test ✅ (2026-07-17): public routes 200, Clerk auth redirect verified with document headers,
  bad share token 404, cron 401 unauth, unauth /api/notifications returns deliberate soft-empty (no leak)
- ESLint set-state-in-effect class (19 sites) fixed properly, no eslint-disables; trash-client Date.now()
  purity fix also removed a latent SSR hydration mismatch

---

# PART 4 — RUNNING DECISIONS & NOTES LOG

- **2026-07-16 · Audit complete.** Five parallel area audits + Next 16 cheat-sheet. Typecheck passes at baseline.
- **Conflict resolved — color direction:** checklist.md (Jul 16) "monochromatic, purple only on logo"
  supersedes requirements.md (Jul 12) "keep purple accent." Newest instruction wins; semantic
  status/priority colors retained as information (see Part 2).
- **Conflict resolved — scope of protected pages:** requirements.md forbade touching landing/sign-in/up,
  but git history since (Jul 14-16 commits) shows the user actively editing them, and checklist.md's
  monochrome directive says "entire site." Treating them as in-scope for the color/polish pass, carefully.
- **Refuted report:** profile-picture pipeline reads intact in code (all surfaces render DB `imageUrl`).
  Kept as a verify-live item (P2-10) rather than assumed fixed.
- **Narrowed report:** display-name propagation — DB-driven surfaces are correct on next render; the
  real bug is the dashboard greeting preferring stale Clerk data (P2-11), plus missing live refresh (P1-5).
- **Realtime clarification:** graph + chat realtime already work; the "needs manual refresh" class of
  complaints traces to (a) missing soft-delete filters (P0-1) and (b) nonexistent notification/membership
  push (P1) — two different root causes that would each have been misdiagnosed alone.
- **Not ours to fix in code:** username *login* (Clerk dashboard config); Upstash provisioning (env vars);
  Vercel cron secret must be set in project env for P0-4 to bite in prod — flagged for the user.
- **2026-07-16 · P0 complete** (delegated to Sonnet, verified). Typecheck clean. Note: URGENT kept as a
  *valid* status server-side for now so existing rows/UI don't break; P3-1 migrates urgency to a priority
  field. `requireProjectAccess` wasn't exported from graph-actions, so assignment-actions replicates the
  check inline matching sibling files.
- **P1 decision — notification click targets:** checklist #4 says an added-to-project notification should
  navigate "to the Friends tab," but landing the user on the project they were just added to is what every
  reference tool does and is what the notification is *about*. Decision: INVITED → the project;
  FRIEND_REQUEST / FRIEND_ACCEPTED → /friends. Flagging since it deviates from the literal note.
- **P1 decision — chat notifications:** project-chat messages notify all project members except the author
  (teams here are small); DMs notify the other participant(s). New-type notifications (NEW_MESSAGE, COMMENT,
  FRIEND_*) are created unconditionally for now — the existing pref toggles map to the pre-existing types
  (assigned/approval/due-soon/mentioned) and now actually gate them via the shared helper.
- **P1 decision — comment notification audience:** assignees + node creator, minus the comment author,
  deduped. Broadcasting to every project member per comment would be noise (Linear notifies subscribers,
  not the org). *(Implementation note: TaskNode has no creator field, so it's assignees-only for now.)*
- **2026-07-16 · P1-A complete** (schema, helper, pusher user channel, dropdown, creation sites). Typecheck clean.
  ⚠️ Migration-history note for the user: the dev DB has no baseline migration (originally `db push`-ed), so
  `prisma migrate dev` reports full drift; P1 schema changes were applied via `db push`. Before production,
  baseline the migration history (`prisma migrate diff` → init migration + `migrate resolve`).
- **2026-07-16 · Session-limit interruption, recovered.** Two subagents (P1-B messaging/presence and
  P2 permissions/approvals/AI) were killed mid-exploration by a usage-limit reset. Damage assessment on
  resume: zero of their edits had reached disk (typecheck clean; `initializeProjectPermissions` flagged
  during interruption turned out to be pre-existing code, untouched). Both tasks relaunched fresh — no
  reconciliation needed.
- **2026-07-16 · P3 schema applied by orchestrator** (single step to avoid two agents racing on schema.prisma):
  `TaskPriority` enum + `TaskNode.priority` (default NONE); `TeamMember.userId` optional relation to User
  (email kept for pending members). Pushed via `db push`, client regenerated, typecheck clean. P3 feature
  agents launched: (graph) edit history + priority UI + due-soon cron; (social) @mentions + teams-to-project
  + outgoing friend requests + username surfacing.
- **2026-07-16 · Dead code deleted early** (was P5-1): header/sidebar/top-bar/mobile-sidebar,
  dashboard-client, project-grid, ai-insights-widget, team-manager, **and `label-actions.ts`**. Discovery:
  the app had TWO labeling systems — `ProjectTag` (live, tag manager on dashboard) and `ProjectLabel`
  (management UI existed only in the dead ProjectGrid). Decision: consolidate on tags; label add/remove
  code deleted; existing labels still display on cards (harmless data). Typecheck clean after deletion.
