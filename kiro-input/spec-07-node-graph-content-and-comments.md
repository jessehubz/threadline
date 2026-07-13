# Node Graph — Node Content & Comments

**Where this goes:** save as `spec-07-node-graph-content-and-comments.md` in your spec-input folder. Kick off with `/spec new node-graph-content-and-comments`, choose **Build a Feature**.

The comment-indicator bug lives in `spec-00-priority-regressions.md` — not repeated here.

## Subtask counter rule (Bug / content rule)

**Current Behavior (Defect)**
- WHEN a node has zero child nodes THEN the system still shows a "0/0" subtask counter on it, including on plain leaf task nodes — confusing, since a task with nothing under it can't have a meaningful subtask count.

**Expected Behavior (Correct)**
- WHEN a node has one or more child nodes THEN the system SHALL show a completion counter ("X/Y") on it.
- WHEN a node has zero child nodes THEN the system SHALL hide the counter completely, regardless of whether the node is labeled "task" or "folder" — the rule keys off whether the node currently has children, not its type label.

**Example:** a plain task with no subtasks shows no counter at all. A folder containing 3 tasks, 1 of which is done, shows "1/3." If a task later gains child nodes of its own, it should then start showing a counter too, since the rule is about having children, not about a fixed node type.

## Comments on folders (Feature)
- Extend commenting support to Folder-type nodes, not just Task nodes — same comment UI, same indicator/unread behavior as tasks (see `spec-00-priority-regressions.md`).

## Delete button on nodes (Feature)
- Add a small delete button directly on each node for quick removal, without needing to open task details first.
- WHEN the user deletes a node that has children (a folder with tasks inside, or a task that's become a parent) THEN the system SHALL ask for confirmation and make clear what happens to the children (deleted along with it, vs. orphaned/reparented) — it SHALL NOT silently cascade-delete without warning.
- Cross-reference `spec-03-dashboard-cards-and-recently-deleted.md` — decide whether deleted nodes should also be recoverable from Recently Deleted.
