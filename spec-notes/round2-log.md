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
