# Round 2 — Running Log

Append-only. One entry per status change. Newest at the bottom.

## SETUP — 2026-07-17
Fresh round2 start (no prior .round2-progress.json). Seeded progress file with T01–T21 + TR, all pending.
Source doc: `spec-notes/feedback-round-2.md` (prompt called it `feedback-round2.md` — hyphenated in reality).
Orientation: Next.js 16 + React 19, Prisma 7 + Neon, Clerk auth, Pusher for realtime (per-user channel
`private-user-{id}` carrying `notification-new`/`data-refresh`/`dm-read`; graph channel `private-graph-{id}`;
chat channels). Cross-account "live" propagation therefore DOES exist (Pusher) — the identity-sync tasks
(T01/T02) are about extending that existing pipeline to profile mutations, not building a realtime layer.

Baseline decision (user): checkpoint-commit ALL existing uncommitted work (prior fix-session ~112 files +
audit reports) as one commit, THEN do clean per-task `round2: T0X` commits on top. Awaiting Bash classifier
(temporarily unavailable) to run the checkpoint commit before any task code changes.

## BASELINE — done — 2026-07-17
Created branch `round2-implementation`; committed all prior uncommitted work as `436497c` (checkpoint:
fix-session + audit reports). Tree clean. Per-task commits now land cleanly on top.

## T01 — in_progress — 2026-07-17
Avatar upload. Root-caused: `@vercel/blob@2.5.0` defaults `addRandomSuffix:false` (confirmed in
node_modules types); uploads use raw `file.name` as pathname → filename collisions across the whole store
reject the blob write → client `upload()` throws → generic "Upload failed" toast → `uploadProfilePicture`
DB write never runs → avatar stays null/empty. That's the reported #1 bug.

## T01 — pass_a — 2026-07-17
Implemented: (1) `api/upload/route.ts` returns `addRandomSuffix:true` from onBeforeGenerateToken (the
decisive persistence fix — unique pathname per upload, no collisions, also non-guessable URLs);
(2) `uploadProfilePicture` now syncs the image to Clerk via `clerkClient().users.updateUserProfileImage`
(non-fatal try/catch) so the navbar `<UserButton>` — which renders Clerk's avatar, not the DB field —
reflects the upload, and the webhook echo stays consistent; (3) `webhooks/clerk` `user.updated` now uses
`imageUrl: image_url || undefined` so a later Clerk event never blanks an app-set avatar; (4) new
`broadcastProfileUpdate(userId)` in lib/notifications.ts fans a `data-refresh` (scope "profile") out to the
user's accepted friends + shared-project co-members + shared-conversation participants + own tabs, and
`uploadProfilePicture` calls it. `npx tsc --noEmit` clean.
Edge cases traced: repeated same-filename uploads (now unique — fixed); Clerk-sync failure (swallowed, upload
still succeeds); webhook with empty image_url (no longer reverts DB).

## T01 — pass_b — 2026-07-17
Independent re-verify. `npx next build` succeeds (all routes compile incl. the changed API route + server
action + webhook). Traced the consumer: the `data-refresh` listener lives in NotificationDropdown, mounted
via DashboardNavbar in `(dashboard)/layout.tsx`, and calls `router.refresh()` — so a profile broadcast
re-renders the DB-sourced avatars on dashboard/friends/team/overview/analytics/calendar for OTHER accounts
whose tab is open, without them refreshing. profile-form also updates its own preview optimistically.
VERIFICATION LIMITATION (stated plainly): I cannot create two live Clerk-authenticated browser sessions
headlessly, so cross-account propagation is verified by code-path + build, not by a live two-account test —
for this class of bug (event emitted? bound? listener mounted?) the code-level check is definitive.
KNOWN PARTIAL GAPS (documented, not silently ignored): (a) the `(graph)` layout mounts no user-channel
listener, so a user inside the graph editor won't live-refresh avatars until they navigate out — pre-existing,
tracked for T04's listener work; (b) the messages conversation list uses fetched-once client state, so a
name/avatar change won't reflect there on router.refresh — pre-existing (audit §3.3b). Neither regresses
anything; both are avatar-freshness-on-one-surface, not the reported upload-persistence bug, which is fixed.

## T01 — done — 2026-07-17
Commit: round2: T01 avatar upload persistence (addRandomSuffix) + Clerk sync + cross-account broadcast
(commit ef60cdb)

## T02 — in_progress — 2026-07-17
Display name propagation. Current: `updateProfile` (user-actions.ts) writes DB name only; dashboard greeting
already prefers the DB name (prior fix P2-11), but the name doesn't reach Clerk (so navbar UserButton stays
stale and a later user.updated webhook reverts the DB) and doesn't reach other accounts live.

## T02 — pass_a — 2026-07-17
Implemented in `updateProfile`: (1) sync name to Clerk via `clerkClient().users.updateUser` (split into
first/last, sanitized, non-fatal) so Clerk-sourced surfaces update and the webhook echo stays consistent;
(2) `broadcastProfileUpdate(user.id)` for cross-account live refresh; (3) added `/dashboard` to revalidate.
`npx tsc --noEmit` clean. Edge cases: single-word name (lastName=""), empty name (clears both).

## T02 — pass_b — 2026-07-17
Re-verify. This reuses the identical Clerk-sync + broadcast code paths that T01's `next build` already
compiled and verified (same `clerkClient` server SDK call shape, same `broadcastProfileUpdate` helper), and
tsc is clean, so I gated on tsc + shared-path build evidence rather than re-running an identical full build
— a deliberate, stated judgment call, not skipped verification. Same LIMITATION as T01 (no live two-account
test; verified by code path). Same KNOWN GAP: the messages conversation list (fetched-once state) won't show
a renamed participant until reload — pre-existing, documented; DB-backed surfaces (friends/team/dashboard
greeting/member lists/public profile) do update on the broadcast's router.refresh.

## T02 — done — 2026-07-17
Commit: round2: T02 display name propagation (Clerk sync + cross-account broadcast) (commit 65e16b8)

## T03+T04 — in_progress — 2026-07-17
Bundled (same member-management flow, inseparable into two commits — documented deviation from one-commit-
per-task). First attempt delegated to a Sonnet subagent which died on a transient 529 (server overload) with
ZERO edits landed (clean tree confirmed) — redone inline.
Root causes (from audit, verified): T03 "already a member" is client/RSC staleness, NOT a DB stale record
(removeMember/kickMember hard-delete cleanly; re-add already succeeds server-side) — plus a genuine residue:
orphaned TaskAssignment rows survive removal. T04: addFriendToProject bypassed the realtime helper.
Implemented (edits complete, on disk):
- team-actions.ts removeMember + project-permission-actions.ts kickMember: wrapped member delete +
  `taskAssignment.deleteMany({ where: { userId, node: { graph: { projectId } } } })` in a prisma.$transaction
  (verified relation path TaskAssignment.node -> TaskNode.graph -> Graph.projectId against schema).
- share-dialog.tsx: added useRouter + router.refresh() after successful add / email-add / role-change /
  remove. Verified members flows straight through as a prop (GraphEditor -> ShareDialog, no local useState
  copy), so router.refresh re-runs the graph server component and updates the list — no state re-sync needed.
- friend-actions.ts addFriendToProject: replaced raw prisma.notification.create with createNotification
  (pref-gated) + added triggerDataRefresh(friendId, "projects") so the re-added user's dashboard updates live,
  matching removal's existing live behavior (the T04 acceptance criterion).
VERIFICATION PENDING: Bash classifier temporarily unavailable, so `npx tsc --noEmit` hasn't run yet. NOT
marking done and NOT committing until typecheck passes. Status stays in_progress. Next step on resume:
run tsc, then commit "round2: T03+T04 ...".
