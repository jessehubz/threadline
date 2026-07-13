# Priority Regressions (Run First)

**Where this goes:** save as `spec-00-priority-regressions.md` in your spec-input folder (see the placement note at the end of this batch). Kick off with `/spec new priority-regressions`, and choose **Fix a Bug** when Kiro asks what kind of spec this is — this puts it through Kiro's bugfix workflow (Current/Expected/Unchanged behavior, root-cause analysis, regression-preventing tests) instead of the feature workflow.

Both items below were requested in an earlier round and, per direct follow-up feedback, were **not actually fixed**. Keep this spec small and isolated from everything else — don't bundle it in with other work. When you kick it off, explicitly tell Kiro these were reported fixed before and weren't, and ask it to explain *why* the earlier attempt likely didn't hold, as part of its root cause analysis, before it writes any code.

## 1. Task detail panel still hidden behind zoom/recenter controls (Regression)

**Current Behavior (Defect)**
- WHEN a node is selected and its task detail panel opens on the right THEN the canvas zoom-in, zoom-out, and recenter controls render on top of the panel, covering part of it.

**Expected Behavior (Correct)**
- WHEN a node is selected and its task detail panel opens THEN the system SHALL render the panel above the zoom/recenter controls, with no overlap, at every zoom level, every screen size, and regardless of how the panel was opened.

**Unchanged Behavior (Regression Prevention)**
- WHEN the task detail panel is closed THEN the system SHALL CONTINUE TO show the zoom/recenter controls in their current position, size, and function.

**Root cause hints for the investigation:**
- Check whether the earlier stacking-order fix was applied to the component that's actually rendered (not a duplicate, an old version, or a component that's since been refactored elsewhere).
- Check whether the canvas's own zoom/pan transform creates a new CSS stacking context that scopes z-index locally — a child element's z-index can't escape its parent's stacking context, which is a common reason a "fix the z-index" patch silently fails to hold on a zoomable/pannable canvas.
- Check whether the panel and the controls are siblings in the DOM at all, or nested in a way where z-index alone can't resolve the conflict (in which case the fix may need to be a portal/rendering-order change, not a z-index change).

**Definition of done:** open a node's task details at minimum zoom, maximum zoom, and default zoom, and confirm the entire panel — including its bottom edge — stays visible and clickable, with the zoom controls tucked behind it in all three cases.

## 2. Comment indicator on nodes still missing (Regression)

**Current Behavior (Defect)**
- WHEN a node has one or more comments THEN the system shows no visual indicator of that on the node itself.
- WHEN a node has unread/new comments THEN there is no alert state distinguishing it from a node with only "seen" comments.

**Expected Behavior (Correct)**
- WHEN a node has one or more comments THEN the system SHALL show a small indicator icon on the node (e.g. a comment/speech-bubble icon, optionally with a count).
- WHEN a node has unread/new comments THEN the system SHALL show a visually distinct alert state in addition to the base indicator — the "has comments" state and the "has unread comments" state SHALL look different from each other, not share one generic icon.
- WHEN a user opens a node and views its comments THEN the system SHALL clear the unread state for that user.

**Unchanged Behavior (Regression Prevention)**
- WHEN comments are created, edited, or stored THEN the system SHALL CONTINUE TO use the existing comment storage/backend logic — this spec is only about surfacing state on the node, not changing how comments are stored.

**Definition of done:** add a comment as User A; confirm the base indicator appears immediately for everyone. View as User B (who hasn't seen it yet) and confirm the unread alert state is visually distinct from the base indicator. Open the node as User B and confirm the unread state clears on their view without affecting whether User A still sees it as read.
