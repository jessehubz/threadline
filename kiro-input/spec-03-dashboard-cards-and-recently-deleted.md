# Dashboard Cards, Recently Deleted & Presence Status

**Where this goes:** save as `spec-03-dashboard-cards-and-recently-deleted.md` in your spec-input folder. Kick off with `/spec new dashboard-cards-and-recently-deleted`, choose **Build a Feature**.

## Project card quick actions (Feature)
- Add a way to trigger quick actions directly from a project card on the dashboard — e.g. a small "⋯" menu that appears on hover (using the hover language from steering), with options to: edit the project's description, edit team members, and delete the project.
- Editing description/team members from here should reuse the same modal/panel used elsewhere in the app for those actions where possible, rather than building a second, separate editor for the same data.
- Deleting a project is destructive — require a confirmation step before it happens. Per steering, a delete-confirmation dialog is an intentional, correct use of the red accent color.

## Recently Deleted (Feature)
- Add a "Recently Deleted" view for recovering deleted items — there's currently nowhere to find or restore something after deleting it.
- Show, at minimum, for each entry: the item's name, what it was (project / task / node), when it was deleted, and a Restore action.
- *(Design discretion)* Add it as its own tab in the navigation.
- **Scope question to flag:** should this also cover node/task deletions (see the delete button added in `spec-07-node-graph-content-and-comments.md`), or just project deletions for now? If scoping to projects only, call that out explicitly as a known limitation rather than silently leaving node deletions unrecoverable.
- **Retention policy to flag:** decide how long deleted items stay recoverable before being purged permanently (e.g. 30 days) — "recently deleted" implies items don't stay there forever, and that needs an explicit answer, not an assumed default.

## Presence status (Feature)
- The profile indicator in the top-right should support two presence states: **Active** and **Idle**.
- Do not add an Invisible/appear-offline option — only Active and Idle should ever be available, so teammates can never fully hide their presence.
- Clarify whether Idle triggers automatically after a period of inactivity, is set manually, or both — automatic-with-manual-override is a reasonable default if not otherwise specified.
