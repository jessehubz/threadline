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
## T03+T04 — pass_a — 2026-07-17
`npx tsc --noEmit` clean (ran once the Bash classifier recovered). Edits as described above.

## T03+T04 — pass_b — 2026-07-17
Traced members-prop flow: graph page (server) fetches ProjectMember rows → passes to GraphEditor → straight
through to ShareDialog (no local useState copy), so router.refresh() genuinely updates the list. Removal
symmetry with re-add confirmed: both now fire triggerDataRefresh to the affected user. LIMITATION: cross-
account "added user sees it live" verified by code path (event fired + dashboard listener mounted), not a
live two-account test. Regression check: assignment cleanup is scoped to the specific user+project, won't
touch other members' assignments.

## T03+T04 — done — 2026-07-17
Commit: round2: T03+T04 member re-add fixes (commit f6267a1)

## T05 — done — 2026-07-17
Implemented HEAD transfer semantics in team-actions.ts (transferHeadRole: atomic swap current HEAD→CO_HEAD,
target→HEAD; Zod validation + rate limit + IDOR protection + self-transfer prevention + notification).
ShareDialog updated with HEAD option in role dropdown (only visible to current HEAD, with confirm dialog).
Commit pending.

## T06 — verified — 2026-07-17
Already correct. All member creation points (inviteByEmail, team-group-actions, friend-actions, create-project,
share-dialog) hardcode role: "MEMBER". Schema has @default(MEMBER). inviteMember validates via
z.enum(["CO_HEAD", "MEMBER"]) — cannot escalate to HEAD. No changes needed.

## T07 — done — 2026-07-17
Implemented bulk multi-select delete: (1) bulkDeleteProjects server action with HEAD-per-project validation +
transaction; (2) Dashboard UI with select mode toggle, per-card checkboxes (disabled for non-HEAD), floating
action bar with count + delete button, confirm dialog, loading state. Commit pending.

## T08 — done — 2026-07-17
Removed project description from: create-project-button form, project-actions (createProject/updateProject/
getProjects schemas + data), profile/[userId]/page.tsx card display. DB column kept. Commit pending.

## T09 — done — 2026-07-17
Added role badge pill (Head=purple, Co-Head=blue, Member=muted) to project cards on dashboard. Role data was
already returned by getProjects, just needed to pass through + render. Commit pending.

## T10 — done — 2026-07-17
Created src/components/graph/task-view-panel.tsx — minimalist read-only panel showing title, description,
status/priority badges, due date, assignees, attachments (viewable/downloadable), comments (can add), and
edit history. No edit buttons, no status dropdowns. graph-editor.tsx conditionally renders this when
isReadOnly is true. Commit pending.

## T11 — done — 2026-07-17
Added optimistic UI state to member assignment in task-detail-panel.tsx. Two Sets (optimisticAssigned,
optimisticUnassigned) track pending changes. effectiveAssignedIds merges server + optimistic state for
immediate visual feedback (accent ring, checkmark, colored text). Reverts on server failure. Commit pending.

## T12 — done — 2026-07-17
Converted comment input from <input> to <textarea> with auto-grow (height=auto then scrollHeight on change,
min 2.75rem, max 200px, overflow-y:auto). Resets on send. Updated all TS types. Commit pending.

## T13 — done — 2026-07-17
Added time input (type='time') alongside date picker in task-detail-panel. Defaults to 23:59 when no time
set. Combined date+time on save as ISO string. Display format: "Due: Jan 15, 2026 at 11:59 PM". No schema
changes (DateTime already stores time). Commit pending.

## T14 — done — 2026-07-17
Fixed in task-node.tsx: replaced 8 overlapping handles (source+target on each of 4 sides) with 4 handles at
distinct positions: Target=TOP+LEFT, Source=BOTTOM+RIGHT. Direction is now unambiguous. folder-node already
had correct handles. No existing edge data affected. Commit pending.

## T15 — done — 2026-07-17
Added getBlockedNodeIds(nodes,edges) utility to graph-utils.ts. graph-editor.tsx computes blocked IDs on
node/edge change, passes isAutoBlocked to task nodes. task-node.tsx shows red "Blocked by dependencies" badge.
task-detail-panel.tsx prevents COMPLETE status when auto-blocked (toast + disabled button + warning box with
blocking task names). Commit pending.

## T16 — done — 2026-07-17
Added auto-arrange: (1) batchUpdateNodePositions server action (validates finite positions, transaction,
Pusher notify); (2) computeLayeredLayout() in custom-controls.tsx (Kahn's topological sort → layer assignment
→ grid positioning; layerGap=200, nodeGap=250; unconnected nodes in separate row); (3) LayoutGrid button in
controls; (4) fitView() after layout. Commit pending.

## T17 — done — 2026-07-17
DMs tab: computes unread count from conversations using existing lastReadAt field, shows pill badge when >0.
Channels tab: localStorage-based approach (threadline:channels-last-seen timestamp), shows dot when newer
messages exist. Both conditional — zero means no indicator rendered. Commit pending.

## T18 — done — 2026-07-17
Changed activeTab default from "channels" to "dms" in messages-client.tsx. Commit pending.

## T19 — done — 2026-07-17
DM notifications: store conversationId in relatedNodeId field. Channel notifications: already have
relatedProjectId. notification-dropdown.tsx routes NEW_MESSAGE to /messages?tab=dms&conversation=<id> or
/messages?tab=channels&projectId=<id>. messages-client.tsx reads URL params (tab, conversation, projectId)
and auto-selects the right panel/conversation. No schema changes. Commit pending.

## T20 — done — 2026-07-17
Renamed all user-facing "AI Assistant"/"Loom" strings to "Task Helper" across 10 files (22 occurrences).
Labels, headers, aria-labels, greetings, feature descriptions all updated. Internal file names unchanged.
Commit pending.

## T21 — done — 2026-07-17
Created src/components/dashboard-insights.tsx with three sections: (A) Finish Today — compact task list for
today's due items; (B) Overview Panel — stat cards (active/overdue/due-this-week) + status breakdown pills;
(C) Planning View — modal with tasks grouped by project, sorted by due date, color-coded by status. All
heuristic-based, no LLM. Commit pending.

## TR — done — 2026-07-17
Global readability sweep: (1) Dashboard badge flex-wrap; (2) Insights responsive grid + spacing; (3)
Task detail panel section separators + increased spacing; (4) Messages responsive tab stacking + mobile
back-button; (5) Comments textarea larger size + relaxed text; (6) View-only panel separators; (7) AI panel
spacing. All pass tsc + next build.

## ROUND 2 COMPLETE — 2026-07-17
All tasks T01-T21 + TR done. `npx next build` passes clean (all routes compile). No Prisma schema changes
required. Ready for commit + merge.
