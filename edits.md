# Edits.md — Redesign & Debugging Requirements

**Purpose:** this document organizes a round of product feedback into a structured requirements brief, grouped by screen/feature, meant to seed Kiro's generation of `requirements.md`. Where the original feedback explicitly left a decision open, a recommended default is given and marked **(design discretion)** so implementation isn't blocked — these can be revised freely before this goes further.

## Contents

1. [Scope and Non-Negotiables](#1-scope-and-non-negotiables)
2. [Navigation](#2-navigation)
3. [Dashboard](#3-dashboard)
4. [Projects Section](#4-projects-section)
5. [Elevation and Shadows (Global)](#5-elevation-and-shadows-global)
6. [Create Project Modal](#6-create-project-modal)
7. [Node Dependency Graph (Core Feature)](#7-node-dependency-graph-core-feature)
8. [Team Members (Create Project Flow)](#8-team-members-create-project-flow)
9. [Profile](#9-profile)
10. [Project Privacy and Roles](#10-project-privacy-and-roles)
11. [Responsive and Mobile QA Pass](#11-responsive-and-mobile-qa-pass)
12. [Functional Debugging Pass](#12-functional-debugging-pass)

---

## 1. Scope and Non-Negotiables

- **Do not modify** the Sign In page, Sign Up page, or Landing page in this pass — no visual or functional changes, including indirectly through shared components. If a component is shared between an excluded page and an in-scope page, only the in-scope usage should change; confirm the excluded pages render identically before/after.
- This pass is **both** a visual/UX redesign **and** a full functional debugging pass. Section 12 names specific areas to regression-test, but any bug found anywhere should be fixed, not only what's explicitly listed.
- No partial or placeholder implementations — every item below ships complete.
- Quality bar: every surface touched should read as intentionally designed — consistent spacing and type scale, deliberate motion, nothing generic or templated.
- Hover states and motion are a signature part of the product's feel — preserve and extend tasteful hover animations/transitions on buttons, cards, nav items, and node-graph elements site-wide.
- Priority: **Section 7 (Node Dependency Graph)** is the product's core feature and should get more design and engineering attention than any other single item here.
- Speed/cost is not a constraint for this pass — correctness and completeness come first.

## 2. Navigation

**Problem:** the current single navbar is overcrowded.

**Requirement:**

- Split navigation into two coordinated regions: a **top bar** and a **left sidebar**.
- _(Design discretion, suggested default)_ Top bar: global/utility actions — search, notifications, an AI Insights shortcut, create-new, profile menu. Left sidebar: primary section navigation — Dashboard, Projects, Node Graph, Teams, etc. Rebalance once the full navigation inventory is known, but keep a consistent logic (global/utility vs. primary wayfinding) rather than an arbitrary split.
- The split should reduce, not add, confusion — use hierarchy (weight, spacing, icon+label pairing, active-state styling) so a first-time user immediately understands where to look for each type of action.
- Both regions need sensible small-screen behavior — see Section 11.

## 3. Dashboard

**Health Score & Active Task cards**

- Add a small logo/thumbnail/icon to both cards so they aren't text-only — gives the user a quick visual anchor.
- Must stay visually cohesive with the rest of the design system (icon set, color treatment, radius), not feel bolted on.

**AI Insights**

- Currently just the label "AI" followed by raw generated text.
- Treat as a complete, finished component: a proper header (e.g. "AI Insights") with icon, and clear typographic hierarchy between the heading and the generated content — it should read as a finished feature, not a placeholder block.

## 4. Projects Section

**Problem:** project cards are hard-clipped at the container edge with no indication there's more to see.

**Requirement:**

- Make the project row horizontally scrollable.
- Add a clear "there's more" affordance — partially reveal the next card plus a soft directional fade/gradient mask over the trailing edge (the pattern most horizontal rails use for exactly this reason). Pair with scroll-snap for clean resting points.
- _(Design discretion)_ Optional hover-revealed chevron controls for pointer/desktop users, alongside native touch/trackpad scroll.

## 5. Elevation and Shadows (Global)

**Problem:** shadows currently read as a soft, diffuse blur and don't communicate elevation.

**Requirement:**

- Replace with a stronger, higher-contrast shadow system — darker and tighter, so elevated surfaces are unambiguous at a glance.
- Define as a small set of elevation tokens (e.g. `elevation-1` … `elevation-4`) and apply consistently across dashboard cards, project cards, modals, popovers, and the node-graph task detail panel, rather than one-off shadow values per component.

## 6. Create Project Modal

**Problem 1 — positioning:** the modal currently sits low on the page, centered against total document height rather than the viewport.
**Fix:** center the modal in the _current viewport_ using fixed positioning (not centered against page/scroll height), and lock body scroll while it's open — it should stay centered no matter where the page was scrolled.

**Problem 2 — backdrop:** the backdrop is a blur that only darkens part of the page.
**Fix:** replace with a solid dark scrim (no blur) covering the _entire_ viewport. Keep it a balanced dark tone, not near-black — enough to clearly recede the background without feeling heavy.

## 7. Node Dependency Graph (Core Feature)

> This is the product's signature feature and should get more design and engineering care than anything else in this document. The current implementation has real usability and visual problems, detailed below.

**7.1 Selection model**

- Add an explicit select mode on the canvas.
- Default behavior: click-and-drag on empty canvas performs marquee/rubber-band multi-select. Multi-select-by-drag should be the default, not something the user opts into first.
- _(Design discretion)_ Provide one clean way to distinguish select vs. pan mode — e.g. a dedicated toolbar toggle, hold-spacebar-to-pan (as in tools like Figma), or right-click. Pick whichever keeps the toolbar least cluttered; it needs to be discoverable, not a hidden-only shortcut.

**7.2 Task detail panel**

- Opens on the right side when a node is selected.
- **Bug:** the zoom in/out/recenter controls currently render above (in front of) this panel and cover it.
- **Fix:** correct the stacking order so the task detail panel always renders above the zoom/recenter controls.

**7.3 Node content and indicators** _(currently missing — add all of the following)_

- **Description indicator:** a small icon on the node when it has a saved description. Today there's no indication on the node at all — confirm whether this is purely a missing display element or whether description data is failing to persist, and fix accordingly.
- **Deadline:** show the due date directly on the node so the team can see timing without opening task details.
- **Assignees:** show assigned members' avatars on the node using a standard overlapping avatar stack; collapse overflow into a faded "+N" chip when there are more assignees than fit (the conventional pattern, e.g. Linear/Asana-style stacks).
- **Comments:** an indicator when a node has comments, _plus_ a visually distinct alert state for unread/new comments — these two states need to look different from each other, not share one generic icon.

**7.4 Connection handles**

- Currently connections always anchor from a fixed side.
- Support connection points on all four sides (top/right/bottom/left); the user should be able to drag a connection from or to whichever side is convenient, snapping cleanly to the nearest valid handle.

**7.5 Node visual redesign**

- The node component needs a full visual redesign — it's currently the weakest part of the product and also the most important.
- Reconcile the new indicators above with a minimalist, easy-to-scan look: lean on iconography, restrained color, and a clear type hierarchy (title vs. metadata) rather than cramming raw text onto the node.
- Apply a consistent spacing/radius scale and hold color usage back so status/priority signals actually stand out.

**7.6 Edge/connector (arrow) redesign**

- The current connector animation is distracting — remove or replace it.
- Redesign the connector line and arrowhead style itself, not just the motion: cleaner path routing (smooth curve or orthogonal routing) and a refined arrowhead. If any motion is kept, it should be subtle and purposeful (e.g. only on hover/selection), never constant.

**7.7 Top navbar behavior while task details is open** _(graph view only)_

- When the task detail panel is open, the top navbar hides (slides out of view) by default, since it would otherwise overlap the panel.
- While the panel is open, hovering near the top edge slides the navbar back into view temporarily.
- When the hover ends and the panel is still open, the navbar hides again.
- When the panel is closed (including via Save), the navbar returns to its normal always-visible state — no hover needed.

## 8. Team Members (Create Project Flow)

- The "add team members" step should support three ways of adding people, all visually polished:
  1. Add existing friends/connections from a searchable list.
  2. Invite by email address.
  3. Add a premade Team wholesale via a "Teams" tab.
- _(Design discretion)_ These should feel like one cohesive flow — e.g. a segmented control or tabs for Friends / Email / Teams within the same step — rather than three disconnected mechanisms.

## 9. Profile

- Expand the profile so it feels complete — allow connecting external links/social/portfolio pages and other relevant fields.
- When viewing another member's profile (e.g. after finding a friend), show a lightweight popup/preview — it doesn't need a full page — surfacing the projects they own, the projects they're a member of, and other relevant details. _(Design discretion on the exact field set.)_

## 10. Project Privacy and Roles

- Add a Private/Public setting per project.
- Only the project's **Head** (owner/admin) can change this setting — permission-gated, not editable by regular members.
- Add a visible role indicator (badge/tag) in team member lists showing whether each member is a **Head** or a **Member**.

## 11. Responsive and Mobile QA Pass

_(Do this last, once everything above is implemented.)_

- Re-inspect the full product at mobile widths.
- Specifically verify that as tab/label width shrinks toward smaller breakpoints, the reflow (truncation, icon-only collapse, etc.) stays smooth across the resize range, not just at fixed breakpoints.
- Confirm the split navbar (Section 2), node graph interactions (Section 7), and horizontal-scroll project rail (Section 4) all have sensible touch/mobile equivalents.

## 12. Functional Debugging Pass

- Independent of the redesign items above, run a full regression pass on existing functionality — explicitly including **messaging** and every **"add" flow** (add project, add task, add team member, etc.) — and fix any bugs found, even where not listed elsewhere in this document.

---

## Notes and Assumptions

- The opening feedback describes a general quality bar "across the entire site — landing, sign-in, sign-up," but later explicitly says not to touch those three pages. **"Do not touch" was treated as authoritative for this pass** (Section 1) — the quality bar still describes the standard for whatever _is_ touched. Flag this if that's not what was meant.
- Where the feedback said "you're free to decide," a recommended default is given so there's something concrete to start from, marked **(design discretion)** — remove or firm these up before this goes to Kiro if you'd rather decide them yourself.
