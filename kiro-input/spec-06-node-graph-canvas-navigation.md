# Node Graph — Canvas Navigation & Interaction

**Where this goes:** save as `spec-06-node-graph-canvas-navigation.md` in your spec-input folder. Kick off with `/spec new node-graph-canvas-navigation`, choose **Build a Feature** (mostly bug-shaped — split into a **Fix a Bug** spec instead if you'd rather keep the grab-tool addition and the removal separate from the pure bugs).

Covers how the canvas itself behaves when navigating/manipulating it — separate from node content (`spec-07-node-graph-content-and-comments.md`) and connections (`spec-08-node-graph-connections.md`). The task-detail/zoom-control stacking bug lives in `spec-00-priority-regressions.md` — not repeated here.

## Home breadcrumb bug (Bug)

**Current Behavior (Defect)**
- WHEN the user clicks "Home" in the graph view's breadcrumb ("Home > [Project Name]") THEN nothing happens — it does not navigate to the dashboard.

**Expected Behavior (Correct)**
- WHEN the user clicks "Home" THEN the system SHALL navigate to the dashboard, from any state of the graph view (zoomed in/out, a node selected, mid-pan, etc.).

## Grid dots visibility (Polish)
- The background grid dots on the canvas are too faint — increase contrast so they're clearly visible against the canvas background, without becoming visually noisy or competing with the nodes themselves.

## New node placement (Bug)

**Current Behavior (Defect)**
- WHEN the user creates a new task node THEN it spawns at a random position, often outside the current viewport, so the user has to pan or search to find it.

**Expected Behavior (Correct)**
- WHEN the user creates a new task node THEN the system SHALL place it within the current viewport, as close to center as possible, avoiding overlap with any existing node and keeping reasonable spacing from neighbors so the canvas doesn't look cluttered.
- WHEN the viewport is already dense and there is no clearly open spot near center THEN the system SHALL fall back to the nearest available open space within the viewport — it SHALL NOT fall back to placing the node off-screen again.

## Node drag responsiveness (Bug)

**Current Behavior (Defect)**
- WHEN the user drags a node to reposition it THEN there is a noticeable lag before the new position sticks.

**Expected Behavior (Correct)**
- WHEN the user drags a node THEN the system SHALL track the cursor/finger in real time with no perceptible delay, and SHALL commit the final position as soon as the drag ends.

## Grab/pan tool (Feature)
- Add a pan/grab interaction: right-click-and-drag to pan, and standard two-finger trackpad panning on Mac.
- *(Design discretion)* the exact gesture set beyond these two is open — keep it to whichever combination feels cleanest, and make sure it can never be confused with the connection-creation interaction in `spec-08-node-graph-connections.md` (e.g. click-drag on empty canvas = pan; click-drag starting on a node = connection — never ambiguous).

## Cursor icon logic (Bug)

**Current Behavior (Defect)**
- WHEN the user is not actively panning THEN the cursor still shows an open/spread-hand icon.

**Expected Behavior (Correct)**
- WHEN the user is not actively panning THEN the system SHALL show a normal pointer/arrow cursor. WHEN panning is actively in progress (right-click-drag or the trackpad gesture) THEN the system SHALL show the hand icon, reverting to the pointer the instant panning stops.

## Remove "Create Subgraph" (Removal)
- Remove the "Create Subgraph" feature and all of its UI entry points entirely — buttons, menu items, any related modal/flow, and any now-dead code paths behind it.
- Confirm nothing else in the app depends on subgraph data before removing the underlying logic, not just the UI surface.
