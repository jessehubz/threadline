# Feedback Notes — Round 2

## 🔴 Top Priority: Profile & Identity Sync

- [ ] Changing display name in Settings doesn't propagate anywhere else:
  - Dashboard greeting ("Good morning, [name]") still shows the old/default name
  - Chat/Messages UI still shows the old name too
  - Must update consistently **across all tabs and across different accounts** (other users need to see the new name, not just you)
- [ ] Profile picture (DP) upload is still broken/inconsistent:
  - Upload doesn't seem to persist correctly — avatar shows empty
  - Even when it appears to work, other accounts don't see the updated picture
  - **This is the single most important item on this list to get right.**

## Messages & Notifications

- [ ] Messages/Channels tabs need unread notification indicators
- [ ] Default tab when opening Messages should be **Friends**, not Channels
- [ ] Clicking a message notification should deep-link directly into that conversation

## AI Assistant → Task Helper Rename

- [ ] Reiterating an earlier request: the assistant shouldn't read as a generic "AI chat" — rename it to something that fits its real role as a task-manager helper
- [ ] Evolve the Dashboard Insights section beyond a single "what to start next" suggestion:
  - Keep a subtle "what to finish today" type suggestion
  - Add a general overview: schedule + priorities across all active tasks/projects
  - Add a button that opens a deeper planning view — either a popup or a chat interface (use judgment on which fits better) for full schedule/priority planning

## Projects — Dashboard & Cards

- [ ] Add multi-select so multiple projects can be deleted at once (bulk delete) — needed on both the Projects page and the main Dashboard
- [ ] Remove the project **description** field entirely — it doesn't render fully on the card today and isn't providing value
- [ ] Add a small role indicator on each project card: Head / Co-Head / Member

## Roles & Permissions

- [ ] In the project edit modal's member section, allow assigning a role per member: **Member** (default) → **Head** or **Co-Head**, changing their permissions accordingly
- [ ] New members should default to "Member" until explicitly promoted

## Member Management Bugs

- [ ] **Bug:** remove a member → save → re-add the same member → app incorrectly says "user is already a member," even though they were just removed. Looks like a stale record isn't being fully cleared on removal.
- [ ] **Real-time bug:** when a member is removed, it correctly disappears from their dashboard without a refresh. But when re-added, the added user still needs to manually refresh to see the project appear — should be live, the same way removal already is.

## View-Only Member Experience

- [ ] Members with view-only access need a distinct, minimalist popup — should only show: title, description, a small status/priority indicator, attachments, comments, and edit history. Nothing else — keep it clean and uncluttered.

## Comments

- [ ] **Bug:** the comment input box only shows a small visible portion of what's being typed — should auto-expand to show the full text as it's being typed.

## Task Assignment UX

- [ ] **Bug:** when a Head clicks a member to assign them, there's no visible selection indicator on the Head's side — it only shows up at the very end in the member/viewer list. Should show the selected state immediately.

## Due Dates

- [ ] Add a due **time**, not just a due date — if no time is specified, default to **11:59 PM**.

## Dependency Graph

- [ ] **Bug:** connecting two nodes sometimes gets the arrow direction backwards — the arrow should always point from parent → child, but the "first point clicked vs. last point clicked" logic is currently inconsistent, causing the wrong node to be treated as parent.
- [ ] Add an "auto-arrange" button that automatically re-lays-out the graph into a clean, structured view when it gets messy ("spaghetti").
- [ ] **Bug:** accuracy issue in determining which nodes are actually blocked/dependent on others — needs to be fixed.

## Overall Priority Notes

1. **Readability and general organization** — the app doesn't feel readable right now; this matters more than any single feature on this list.
2. **Image upload consistency** — repeated because it matters most functionally; this needs to actually work, and work the same way for everyone, before anything else.
