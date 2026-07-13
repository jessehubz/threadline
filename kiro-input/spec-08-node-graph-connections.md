# Node Graph — Connections & Dependencies

**Where this goes:** save as `spec-08-node-graph-connections.md` in your spec-input folder. Kick off with `/spec new node-graph-connections`, choose **Build a Feature** (mixed bug + correction + feature — split further if you want a pure Bugfix Spec for just the performance issue).

## Connection creation performance (Bug)

**Current Behavior (Defect)**
- WHEN the user creates a connection between two nodes THEN the interaction is slow and unreliable (exact failure mode not yet diagnosed — investigate whether it's dropped connections, wrong nodes being connected, or visible lag during the drag itself).

**Expected Behavior (Correct)**
- WHEN the user creates a connection THEN the system SHALL complete it smoothly with no perceptible lag and no incorrect/failed connections.

## Delete a connection (Feature)
- Add the ability to click an edge/arrow and delete it — not currently possible.
- *(Design discretion)* a confirmation step isn't necessary here (unlike node deletion) since removing a connection only removes a dependency link, not content — flag if that assumption doesn't hold for this app.

## Connector visual style — correction (Correction — supersedes the previous connector-animation request)
- An earlier round asked to remove the connector's motion, because the specific implementation felt distracting. Based on direct feedback since then, the actual preference runs the other way: bring back a flowing, animated dashed line for connectors — just implemented smoothly rather than jarringly.
- Treat this as **replacing**, not adding to, whatever connector animation is currently in place — the goal is one consistent animated style, not two competing ones layered on the same line.
- Reference point, if useful: a "marching ants" style dashed-line animation (the classic selection-outline pattern used in image editors), but smooth and subtle rather than fast or flickery.

## Connection-creation interaction (Feature)
- Replace however connections are currently drawn with one of:
  - **(a)** clicking a node immediately shows a line following the cursor until clicking a target node completes the connection, or
  - **(b)** a long press-and-drag from source node to target node.
  - *(Design discretion on which of the two, or both — see the note in `spec-06-node-graph-canvas-navigation.md` about not conflicting with the pan/grab gesture.)*
- Whichever interaction is used, it must correctly establish the underlying dependency/"blocking" relationship between the two connected nodes — the visual interaction is separate from, and must not compromise, the dependency logic itself.
- WHEN the user starts drawing a connection (option a) and then clicks empty canvas or presses Escape instead of a target node THEN the system SHALL cancel the in-progress connection cleanly, rather than connecting to nothing or erroring.
