# Risk Review — Status
- [x] 1. Permissions & Access Levels
- [x] 2. Data Integrity
- [ ] 3. Real-Time / Sync Consistency  (NOT written — review interrupted here; see VULNERABILITY-ASSESSMENT.md §3 for equivalent findings)
- [ ] 4. Image Upload Pipeline  (NOT written — see VULNERABILITY-ASSESSMENT.md §4)
- [ ] 5. Dependency Graph Logic  (NOT written — see VULNERABILITY-ASSESSMENT.md §5)
- [ ] 6. General Code Health & Data Handling  (NOT written — see VULNERABILITY-ASSESSMENT.md §6)

> ⚠️ This RISK-REVIEW.md was interrupted after sections 1–2. Sections 3–6 were never written here.
> The completed VULNERABILITY-ASSESSMENT.md (same working tree, earlier this session) already covers all six
> areas in full — treat it as the authoritative risk document; this file's §1–2 duplicate its findings.

---
(findings go below, appended as each section completes)

> **Scope & method:** read-only review of the current working tree (large uncommitted change-set — see
> FABLE-PROGRESS.md), evaluated against the planned work in spec-notes/feedback-round-2.md. Findings are
> verified against actual code with file:line evidence and cross-checked against running behavior where a
> single dev session can observe it. (`spec-notes/personal-notes.md` referenced in the brief does not exist;
> `spec-notes/feedback-round-2.md` + `checklist.md` are the live feedback sources.) Sections are written
> incrementally; if a session is cut off, resume from the first unchecked box.
>
> **Note on "new-risk" tags:** items marked *(new-risk)* are not bugs today — they are weak points that
> building the feedback-round-2 features would introduce or expose, so they read as design gates on that work.

## 1. Permissions & Access Levels

Server-side enforcement is broadly sound — graph node/edge mutations consistently go through the permission
matrix (`requirePermission`/`getEffectivePermissions` in `src/lib/permissions.ts`), and cron/webhook/
notification/message routes are correctly gated. The real risks are the planned role-promotion UI landing on
missing ownership semantics, and a handful of hardcoded role checks that diverge from the matrix.

### 1.1 HEAD can self-demote → permanent zero-HEAD lockout 🔴 CRITICAL (live today)
- **Weak point:** `updateMemberRole` (`team-actions.ts:148-183`) only checks `currentMember.role === "HEAD"` — no self-target guard, no last-head guard. A HEAD can set their own row to MEMBER. Nothing grants HEAD except `createProject`, so it's irreversible.
- **Why it matters:** Every HEAD-gated capability (delete/restore/visibility/shareToken/permissions/trash) becomes permanently unreachable — the project is a zombie with no recovery path. Whoever owns the project loses all control over it forever.
- **Suggested fix direction:** Reject role updates that target a HEAD row and/or the caller themself; move ownership changes to an explicit transfer action. Must land before the promotion UI.

### 1.2 Planned Member→Head promotion has no ownership-transfer scaffolding 🔴 CRITICAL (new-risk)
- **Weak point:** `updateRoleSchema` (`team-actions.ts:25-29`) currently hard-blocks HEAD ("prevents escalation"). feedback-round-2.md:36 asks to promote to Head/Co-Head. The obvious implementation (widen the enum) combined with 1.1's weak check lets any HEAD mint unlimited co-equal HEADs, each able to delete the project and demote the others; no single-HEAD invariant exists structurally.
- **Why it matters:** Unbounded ownership escalation and accidental lockout on an irreversible action — a founder-level "who controls this project" failure.
- **Suggested fix direction:** Build an atomic `transferOwnership` (promote new HEAD + demote old to CO_HEAD in one txn), enforce ≥1 HEAD always, confirm the transfer, and decide explicitly whether multiple HEADs are supported (recommend single-owner).

### 1.3 `canChangeSettings` is a dead permission — matrix vs hardcoded role disagree 🟠 HIGH
- **Weak point:** `canChangeSettings` is defined and surfaced in the UI (`permissions.ts`, `project-settings.tsx:93`), but every settings mutation enforces `role === "HEAD"`/`!== "MEMBER"` instead: `updateProjectVisibility`/`updateProjectPermissions` (`project-permission-actions.ts:40,65`), `regenerateShareToken`/`disableShareLink` (`project-actions.ts:260,283`), `updateProject` rename (`project-actions.ts:166`).
- **Why it matters:** Two disagreeing sources of truth. Granting a CO_HEAD `canChangeSettings:true` shows them a panel where every button 403s; setting it false still lets any CO_HEAD rename the project. Confusing today, worse once the planned role UI surfaces the toggle prominently.
- **Suggested fix direction:** Either wire those four actions to `requirePermission(..., "canChangeSettings")`, or drop the flag and document settings as HEAD-only.

### 1.4 Two hardcoded `role !== "MEMBER"` gates bypass the matrix 🟠 HIGH
- **Weak point:** `api/attachments/route.ts:53` + `[id]/route.ts:50` gate on raw role (should be `canEditNodes`); `friend-actions.ts:325-334` `addFriendToProject` gates on raw role (should be `canInviteMembers`).
- **Why it matters:** (a) A MEMBER granted `canEditNodes:true` can edit nodes but can't attach files to them — a capability cliff. (b) A CO_HEAD explicitly set to `canInviteMembers:false` can STILL add friends to the project via `addFriendToProject` — a real matrix bypass. The permission matrix a HEAD configures is quietly not honored in these paths.
- **Suggested fix direction:** Replace both with `requirePermission` keyed to `canEditNodes` / `canInviteMembers`.

### 1.5 Planned view-only popup is UI-only; server ships the full node payload to MEMBERs 🟠 HIGH (new-risk)
- **Weak point:** `getGraphData` (`graph-actions.ts:31-87`) gates on plain membership then returns the full node tree (descriptions, attachment `fileUrl`s, assignee PII, comment counts) to every role; `task-detail-panel.tsx` only toggles `disabled`.
- **Why it matters:** feedback-round-2.md:46's "minimalist view-only popup," if it reuses this payload, restricts only what's *rendered* — a view-only MEMBER sees everything in DevTools/network. If the intent was to limit access (not just declutter), it's unenforced.
- **Suggested fix direction:** If access-limiting is intended, back the popup with a field-scoped server read for MEMBER role; otherwise document "view-only = declutter, not an access boundary."

### 1.6 Kicked members keep live read access 🟠 MEDIUM (also in §3)
- **Weak point:** `kickMember`/`removeMember` fire only `triggerDataRefresh` on the target's own channel; nothing force-unsubscribes their `private-graph-*`/`presence-*` sockets, and the graph layout doesn't mount the refresh listener (§3.3). Pusher auth is only re-checked at subscribe time.
- **Why it matters:** A kicked user viewing the graph keeps receiving live node/edge events and stays in the presence roster until they navigate/refresh. Writes correctly fail per-call, so it's a read/confidentiality window, not a mutation gap.
- **Suggested fix direction:** Emit a `member-removed {userId}` event on the project channels; the removed client unsubscribes + redirects. Mount the refresh listener in the graph layout.

### 1.7 `initializeProjectPermissions` has zero auth 🟠 MEDIUM (latent)
- **Weak point:** `project-permission-actions.ts:79-114` — no `requireUser()`, no ownership check; currently dead code (unreferenced).
- **Why it matters:** Weakest-gated export in the actions dir; the planned role UI is exactly what might wire it in ("init permissions when the modal opens") without adding auth → any caller initializes permission rows for any guessable projectId.
- **Suggested fix direction:** Add `requireUser()` + HEAD check before it's wired in, or fold its logic into the HEAD-gated `updateProjectPermissions` upsert and delete it.

### 1.8 Lower-severity
Tag mutations gated on bare membership (`tag-actions.ts:182-238`); public share page leaks soft-deleted nodes (missing `deletedAt:null`, `share/[projectId]/[token]/page.tsx:16-32`); existing-account additions are unilateral (no accept step) while new-account email invites require acceptance — asymmetry, not a hole. Confirmed correctly gated: cron (secret), Clerk webhook (svix), notifications/messages (self-scoped), pusher subscribe-time membership checks.

## 2. Data Integrity

### 2.1 remove→re-add "already a member": root cause is client/cache staleness, NOT DB residue 🔴 (reported bug)
- **Weak point:** `removeMember` (`team-actions.ts:103-146`) does a clean **hard delete** — no soft-delete flag, no `ProjectMember` row left behind — and `inviteMember`/`searchUsersForProject` re-check membership live against the DB. So server-side, remove-then-re-add **succeeds**. The failure is that ShareDialog's `members` list is a server-fetched prop that `handleRemoveMember` (`share-dialog.tsx:367-381`) never refreshes (no `router.refresh()`, no local mutation) and the graph layout doesn't mount the data-refresh listener (§3.3), so the removed member stays visible and the flow *looks* broken / re-add appears to conflict.
- **Why it matters:** Reads as data corruption on the #1 reported member bug; erodes trust in member management. The feedback's "stale record isn't cleared" intuition is right about the symptom but the stale record is in the **client/RSC cache, not the database**.
- **Suggested fix direction:** Refresh the source of truth after remove/add (router.refresh or lift `members` to prop-seeded state) and mount the refresh listener in the graph layout. No schema change needed for this symptom.

### 2.2 Orphaned `TaskAssignment` rows survive member removal 🟠 HIGH (genuine residue)
- **Weak point:** Removal deletes only the `ProjectMember` row; `TaskAssignment` references `User`+`TaskNode` (not `ProjectMember`), so nothing cascades. No `taskAssignment.delete` in any removal path.
- **Why it matters:** A removed member remains assigned to the project's tasks — ghost avatars on nodes, entries in their "my tasks," assignment notifications, and (worst) if they were the sole `isApprover` on a task, that task's approval flow silently deadlocks. This is the real "stale record" residue.
- **Suggested fix direction:** Delete the user's `TaskAssignment` rows for that project (and clear/reassign any `isApprover`) in the same transaction as removal.

### 2.3 `Invite` rows never deduped or cleared 🟠 MEDIUM (genuine residue)
- **Weak point:** `Invite` (`schema.prisma:259-268`) has no `@@unique([email, projectId])`; `inviteByEmail` always creates a fresh row; acceptance only sets `accepted=true` (never deletes); removal never touches invites; expired invites are never pruned.
- **Why it matters:** Duplicate pending invites, a `getPendingInvites` list that drifts wrong, stale accepted rows after removal, unbounded expired-token accumulation — the second literal "stale record" source.
- **Suggested fix direction:** Add `@@unique([email, projectId])` (or dedup before create), delete the Invite on acceptance and on member removal, prune expired ones on a cron.

### 2.4 Bulk project delete (planned): cascade is comprehensive but has three gaps 🟠 (new-risk)
- **Weak point:** `deleteProject` (`project-actions.ts:182-205`) is per-ID HEAD-gated, soft-deletes (`deletedAt` + 15-day `deleteAfter`), cron-swept. Schema has 36 `onDelete: Cascade` so relational cleanup on hard delete is sound. Gaps for a bulk variant: (a) Blob files are never `del()`d on delete (orphan/cost leak — §4); (b) a naive bulk action must re-check HEAD for **each** ID server-side, not trust a client list or check only the first (§6); (c) no rate limit on delete.
- **Why it matters:** Irreversible bulk action; a naive port could soft-delete projects the caller doesn't own, and multiplies orphaned storage.
- **Suggested fix direction:** Loop server-side re-checking HEAD per ID; keep the existing confirm + trash window (good recovery already exists — don't make bulk more destructive than single); fix Blob cleanup first; add a `sensitive`-tier limit.

### 2.5 Soft-deleted `TaskNode`s never purged, and still act as blockers 🟠 MEDIUM
- **Weak point:** Only `nodeAuditLog` is cron-pruned; there is no purge for `TaskNode.deletedAt`. Combined with §5.2, the blocking queries don't filter `deletedAt`, so invisible deleted nodes permanently gate live ones.
- **Suggested fix direction:** Add a node purge (hard-delete + cascade edges/assignments after N days) and filter `deletedAt:null` in all blocking computation.

### 2.6 Lower-severity
Non-atomic multi-step mutations (acceptFriendRequest, create-project's client-side invite loop `create-project-button.tsx:64`, deleteNode+edges) risk partial-failure corruption — wrap in `prisma.$transaction`. Friendship/Conversation residue after unfriend (duplicate conversations on re-friend). **Migration drift:** only the init migration exists; everything since via `db push` → no history, and the planned description-column removal via `db push` would silently DROP COLUMN (data loss) and break every query/component still selecting it — sweep reads first, then migrate.
