# Task Details Panel — Content, Status & Permissions

**Where this goes:** save as `spec-02-task-details-panel.md` in your spec-input folder. Kick off with `/spec new task-details-panel`, choose **Build a Feature**. Run this one *before* `spec-05-ai-assistant.md` — that spec's natural-language examples depend on the Urgent status added here.

## Urgent status (Feature)
- Add "Urgent" as a status/tag option available on tasks, alongside whatever status options already exist (e.g. To Do / In Progress / Done, or the current equivalent set).
- **Open question to resolve during requirements:** is Urgent a status of its own (replacing, say, "To Do"), or a flag layered on top of an existing status (a task can be "In Progress" *and* "Urgent" at once)? The request was to "put urgent in the status," which reads as a standalone status — treat that as the default, but confirm, since it changes the data model.
- Visually, Urgent should use the red accent reserved for alerts (see `steering-updates.md`) so it reads as distinct from every other status at a glance.
- Confirm whether Urgent should also show as a visual cue directly on the node in the graph (cross-reference `spec-07-node-graph-content-and-comments.md`) — not explicitly requested, but a natural extension worth flagging.

## Comment permissions (Feature)
- Any project member should be able to comment on a task — not role-restricted.
- **Cross-spec conflict to flag:** `spec-04-team-roles-and-sharing.md` introduces a Viewer role that's view-only by definition. Decide explicitly whether Viewers are an intentional exception to "everyone can comment," or whether commenting should be allowed even for Viewers. Don't let these two specs silently disagree — resolve it one way before either is implemented.

## Date picker redesign (Redesign)
- Replace the current default/standard calendar widget used for setting a deadline with a custom-styled date picker matching the rest of the design system.
- Minimum functionality: open on click of the date field, a month-view calendar for picking a specific day, and a clear/remove-date option.
- Nice-to-have, not required: quick-select shortcuts like "Today," "Tomorrow," "Next week."

## Lock icon — needs investigation (Investigate)
- There's a lock icon next to the link field in the task details panel whose purpose isn't clear from the UI — this isn't a new request, it's existing behavior nobody can currently explain.
- Investigate what it currently does (look for a click handler, tooltip, or related permission logic already in the codebase) before deciding what to do with it.
- Outcome: if it's functional and useful, add a visible tooltip/label explaining what it does. If it's dead code or a leftover from a removed feature, remove it.
