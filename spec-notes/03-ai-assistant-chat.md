# AI Assistant Chat — Round 2 (post-implementation follow-up)

> This supersedes the earlier round on this feature. A few things changed
> after seeing the first implementation — most importantly, the popup
> placement is now **bottom-right**, not bottom-left as originally
> requested. Use this file as the current source of truth for the AI
> Assistant chat; replace/update your existing `02` with this version.

## 1. Bug: hero "AI Assistant" trigger doesn't open the chat

There are (at least) two entry points into the AI Assistant:

- A trigger button near the bottom of the dashboard hero section.
- A trigger button in the top-right of the navbar.

Currently only the navbar one works. Clicking the hero one does nothing.

- [ ] Find the hero trigger's click handler and confirm it's wired to the
      same open/close state (or component) as the navbar trigger — it's
      likely calling a different/missing handler, or not wired at all.
- [ ] Both triggers must open the exact same chat widget/component — not
      two separate implementations. If two separate components currently
      exist, consolidate to one and point both buttons at it.
- [ ] Verify both triggers open and close it correctly, from every page
      the hero trigger appears on.

## 2. Placement correction: bottom-right, not bottom-left

- [ ] The chat popup must open anchored to the **bottom-right** of the
      viewport — standard chat-widget placement (like Intercom/Crisp-style
      widgets), not bottom-left.
- [ ] It should stay fixed to the bottom-right regardless of which trigger
      (hero or navbar) opened it, and regardless of scroll position.
- [ ] Confirm it doesn't overlap or get overlapped by other fixed-position
      elements already in that corner (if any exist).
- [ ] Confirm correct positioning at mobile widths too — don't let it run
      off-screen or cover unreachable close/dismiss controls.

## 3. Navbar consistency across the entire app (not just the dashboard)

- [ ] The navbar must be identical across every authenticated app page —
      Dashboard, Overview, Tasks, and any other internal section — same
      component, same styling, same behavior everywhere.
- [ ] The one exception is the public marketing/landing page, which keeps
      its own separate navbar (this is intentional, not a bug).
- [ ] Audit every internal route right now and confirm which ones are NOT
      using the shared navbar component — list them, then migrate each to
      the shared one rather than maintaining separate copies. (This is the
      same class of bug as the old-vs-new dashboard duplication found
      earlier — check whether it has the same root cause.)
- [ ] Once migrated, delete any leftover duplicate/old navbar
      implementations so this can't drift out of sync again.

## 4. Bug: the assistant isn't actually AI — no model is connected

Asking it something simple like "what's your name?" gets no real answer,
which means there's currently no conversational AI actually wired up
behind this UI — it's likely a static/placeholder chat shell.

- [ ] Confirm current state: is there any backend/model call happening at
      all right now, or is this purely a front-end shell with no request
      going out? Report back what you find.
- [ ] Wire the chat up to an actual conversational AI backend so it can:
  - [ ] Hold a real back-and-forth conversation (maintain context across
        turns within a session, not just answer one message in isolation).
  - [ ] Answer basic questions about itself (e.g. its name/persona — this
        is where "Loom" belongs, per the earlier tags/naming spec: the
        assistant can introduce itself as Loom inside the conversation
        even though the trigger button says "AI Assistant").
  - [ ] Actually perform whatever assistant-level tasks it's meant to help
        with in this app (e.g. answering questions about the user's
        tasks/projects/dashboard data) — confirm with me exactly which
        capabilities are in scope before building custom tool-calling for
        all of them, since "assistant benefits" wasn't fully spelled out.

## Open questions — flag back before/while building

- [ ] Which AI provider/model should power this (existing account,
      preferred vendor, cost constraints)?
- [ ] Should the assistant have access to real user data (tasks, project
      status, etc.) to answer questions about them, or is it general-purpose
      only for now?
- [ ] Confirm the full list of internal routes so the navbar audit in
      section 3 has a complete checklist.
