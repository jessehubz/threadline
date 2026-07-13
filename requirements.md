# Threadline — Redesign & Debugging Requirements
# Finalized decisions from Q&A session (2026-07-12)

===============================================================================
## 1. SCOPE & NON-NEGOTIABLES
===============================================================================

- Do NOT modify: Sign In page, Sign Up page, or Landing page.
  - If a shared CSS variable is needed by those pages, PRESERVE its current name
    and value. Add new variables alongside (strategy: preserve existing + extend).
- This pass is both a visual/UX redesign AND a full functional debugging pass.
- No partial or placeholder implementations — every item ships complete.
- Quality bar: every surface touched should read as intentionally designed.
- Hover states and motion are a signature — preserve and extend tasteful
  hover animations/transitions on buttons, cards, nav items, graph elements.
- Priority: Section 7 (Node Dependency Graph) gets the most attention.
- Design-discretion items: make best-judgment calls and ship without blocking
  on additional confirmation.

===============================================================================
## 2. DESIGN SYSTEM DECISIONS
===============================================================================

### Colors
- KEEP the current purple/violet accent (#8B5CF6 and brand-50→950 scale).
- Do NOT adopt DESIGN.md's #5e6ad2.
- Take visual inspiration from the landing page's aesthetic (dark surfaces,
  violet accents, refined spacing).

### Typography
- KEEP current font stack: Inter, Outfit, General Sans (Fontshare).
- Draw typographic inspiration from the landing page's hierarchy and spacing.

### Border Radius
- KEEP current larger scale: --radius-sm: 10px, --radius-md: 16px,
  --radius-lg: 22px, --radius-xl: 28px.

### Elevation & Shadows
- Use a SHADOW-BASED elevation system (not surface-ladder).
- Define 4 elevation tokens (elevation-1 through elevation-4) with stronger,
  higher-contrast shadows (darker, tighter) so elevated surfaces are
  unambiguous at a glance.
- Apply consistently: dashboard cards, project cards, modals, popovers,
  task detail panel, node graph toolbar.

### Light/Dark Mode
- MAINTAIN the existing light/dark theme toggle. Both themes must work.

### CSS Variable Safety
- Preserve ALL current CSS custom property names and values.
- Add new tokens alongside existing ones (e.g., --elevation-1, --elevation-2).
- Sign-in, sign-up, and landing pages must render identically before/after.

### DESIGN.md
- IGNORE the DESIGN.md file. It is not authoritative for this pass.

===============================================================================
## 3. NAVIGATION
===============================================================================

### Architecture
- Split the current single floating-pill Header into: LEFT SIDEBAR + TOP BAR.
- Designer discretion on exact item placement — optimize for user psychology:
  primary wayfinding and daily-driver features in the sidebar, utility/global
  actions in the top bar.
- Use hierarchy (weight, spacing, icon+label pairing, active-state styling)
  so a first-time user immediately knows where to look.
- Both regions need sensible small-screen behavior (designer discretion on
  mobile pattern — hamburger drawer, bottom tabs, or icon rail).

### Constraints
- The split must reduce confusion, not add it.
- The Header component is only imported by (dashboard)/layout.tsx — safe
  to restructure without touching auth/landing pages.

===============================================================================
## 4. DASHBOARD
===============================================================================

### Health Score Card
- Add a heartbeat/pulse icon as visual anchor.

### Active Tasks Card
- Add a layers/stack icon as visual anchor.

### AI Insights
- Treat as a finished component: proper header ("AI Insights") with icon,
  clear typographic hierarchy between heading and generated content.

===============================================================================
## 5. PROJECTS SECTION
===============================================================================

- Make the project row horizontally scrollable with:
  - Partial reveal of the next card (peek).
  - Soft directional gradient mask on the trailing edge.
  - scroll-snap for clean resting points.
  - Optional hover-revealed chevron controls for desktop users.

===============================================================================
## 6. CREATE PROJECT MODAL
===============================================================================

### Bug Fix (STILL BROKEN)
- The modal currently pops up at the bottom of the viewport, not centered.
- Fix: ensure the modal is truly viewport-centered using fixed positioning.
  Verify it stays centered regardless of scroll position.
- Lock body scroll while modal is open.
- Solid dark scrim (no blur) covering the entire viewport.

===============================================================================
## 7. NODE DEPENDENCY GRAPH (Core Feature — Highest Priority)
===============================================================================

### 7.1 Selection Model
- Implement marquee/rubber-band multi-select as the DEFAULT behavior when
  click-dragging on empty canvas.
- Pan mode: SPACEBAR-HOLD-TO-PAN (Figma-style). This is the cleanest
  approach — keeps toolbar minimal.
- When multiple nodes are selected, the detail panel shows:
  - Summary count of selected nodes.
  - Batch action buttons: Delete, Change Status, Assign.

### 7.2 Stacking / Z-Index Fix (STILL BROKEN)
- The zoom/recenter controls currently overlap the task detail panel.
- Fix: ensure controls render BENEATH the task detail panel in z-order.
  The panel must always be visually on top of any floating canvas controls.

### 7.3 Node Content & Indicators
All of the following must appear on the node component:

- **Title** — primary text, 2-line clamp.
- **Status badge** — colored dot + label (existing, keep).
- **Deadline** — show due date directly on node (existing, keep).
- **Assignees** — overlapping avatar stack (existing, keep). Max 3 + "+N".
- **Description indicator** — small icon when a description is saved.
  (NOTE: description is NOT shown on the node itself; only visible when
  task detail panel is opened.)
- **Comment indicator** — icon when comments exist, PLUS a distinct
  "unread/new" alert state. These two states must look different.
- **Attachment count** — paperclip + count (existing, keep).
- **Permission indicator** — show if the node has restricted edit access.

### 7.4 Connection Handles
- Support connection points on ALL FOUR SIDES (top/right/bottom/left).
- User drags from/to whichever side is convenient.
- Auto-snap to nearest valid handle.

### 7.5 Node Visual Redesign
- Full visual redesign of the node component.
- Must accommodate all indicators from §7.3 in a minimalist, easy-to-scan
  layout: iconography, restrained color, clear type hierarchy (title vs
  metadata).
- Consistent spacing/radius scale; hold color usage back so status/priority
  signals stand out.
- The node does NOT show description text — only an indicator icon that it
  has one. Description is revealed in the task detail panel.

### 7.6 Edge/Connector Redesign
- Remove the constant animation on edges (currently all edges are animated).
- Designer discretion on line style: recommend smooth bezier curves with a
  refined filled-triangle arrowhead. Subtle hover/selection-only animation
  is acceptable; constant motion is not.
- Update hardcoded stroke color (#8B5CF6) to use the design system's accent
  variable for theme consistency.

### 7.7 Navbar Behavior While Task Detail Panel is Open
- When the task detail panel opens, the top navbar hides (slides out).
- Hovering near the top edge brings it back temporarily.
- When panel closes, navbar returns to normal always-visible state.
- Implementation: Lift the graph page out of the dashboard layout into its
  own layout without a header (cleanest approach — avoids cross-boundary
  state coordination).

===============================================================================
## 8. TEAM MEMBERS (Create Project Flow)
===============================================================================

- Redesign the "Invite Members" section into a cohesive tabbed/segmented UI:
  - **Friends** tab — searchable list from user's Friendship model.
  - **Email** tab — invite by email address (existing flow).
  - **Teams** tab — add a premade Team wholesale (existing team-quick-add).
- Designer discretion on tab component style (segmented control, underlined
  tabs, pill toggles — pick whichever is most readable in a modal context).

===============================================================================
## 9. PROFILE
===============================================================================

### Public Profile Page (NEW — does not exist yet)
- Build a public-facing profile page viewable without authentication.
- URL pattern: /profile/[userId] or /u/[username] (designer discretion).
- Shows: display name, avatar, bio, social links, public projects owned,
  public projects they're a member of.
- Private projects appear in the list but are shown as "locked" (title
  visible, content not accessible).
- This page must work for unauthenticated visitors.

### Social Links
- Add social/external link fields to the User model.
- Designer discretion on approach (fixed fields vs flexible table — pick
  whichever is best for the product).

### Member Profile Popup
- Build a lightweight popup/preview when viewing another member's profile.
- Shows: projects owned, projects they're a member of, social links, bio.
- Designer discretion on trigger (hover, click, or both) and which surfaces
  it appears on.
- Links to the full public profile page.

===============================================================================
## 10. PROJECT PRIVACY & ROLES
===============================================================================

### Privacy Model
- Add a visibility setting per project: PUBLIC or PRIVATE.
- **Public**: the project appears on the owner's profile and is viewable by
  anyone in the world (read-only for non-members).
- **Private**: the project appears on the owner's profile but is shown as
  "locked" / not viewable. People who are members of the project can still
  see and access it normally.
- Only the HEAD can change the privacy setting (CO_HEAD cannot, unless the
  HEAD explicitly grants that permission — see §10B below).

### Permission Granularity (NEW FEATURE)
- Use a PROJECT-WIDE role configuration approach (not per-node).
- When starting a project or managing team settings, the HEAD can configure
  what each role (CO_HEAD, MEMBER) is allowed to do in that project:
  - Create nodes
  - Edit nodes
  - Delete nodes
  - Create/delete edges
  - Change project settings
  - Invite/kick members
- This is a simple permissions matrix in project settings — designer
  discretion on UI presentation (checkboxes, toggles, permission cards,
  whatever is clearest and most professional).
- CO_HEAD permissions: HEAD decides what CO_HEAD can do (including whether
  they can change privacy). This should be configurable in project settings.
- Default permissions for new projects:
  - HEAD: all permissions
  - CO_HEAD: create/edit/delete nodes, create/delete edges, invite members
  - MEMBER: view only (cannot create/edit/delete nodes)

### Kick Members (NEW FEATURE)
- Add the ability for HEAD (and CO_HEAD if permitted) to remove/kick
  members from the project.
- Kicked members lose access immediately.

### Role Badges
- Designer discretion on where role badges appear (share dialog already has
  them; extend to other surfaces like team page, graph presence, sidebar
  project list as appropriate).

===============================================================================
## 11. NODE EDIT HISTORY (NEW FEATURE)
===============================================================================

- Add a Google-Docs-style edit history for nodes.
- Track: what was added, changed, or deleted on each node, and by whom.
- Include: title changes, description edits, status changes, assignment
  changes, connection changes, due date changes.
- Display in the task detail panel (or a dedicated history view).
- This is a full audit trail — not just "last edited by."
- **Retention: prune history entries older than 10 days.** Implement a
  cleanup mechanism (e.g., a scheduled action or on-read pruning).

===============================================================================
## 12. UNREAD COMMENT TRACKING
===============================================================================

- Implement tracking for which comments a user has seen.
- Designer discretion on mechanism: per-node `lastReadAt` timestamp, or
  per-comment read tracking — whichever is best for the product experience.
- The node's comment indicator must distinguish between "has comments" and
  "has NEW/unread comments" visually.

===============================================================================
## 13. INVITE EMAILS
===============================================================================

- Wire up actual email sending via Resend for project invites.
- NOTE: User does not have a custom domain. Use Resend's default sending
  domain (onboarding@resend.dev or similar) or whatever works without a
  verified custom domain. If Resend requires a verified domain for
  production sending and it's not available, fall back to generating the
  invite link for manual sharing and leave a TODO marker for when a domain
  is available.

===============================================================================
## 14. RESPONSIVE & MOBILE QA PASS
===============================================================================

- Do this LAST, after all other sections are implemented.
- Re-inspect at mobile widths.
- Verify smooth reflow (truncation, icon-only collapse) across resize range.
- Confirm: split navbar, node graph interactions, horizontal-scroll project
  rail all have sensible touch/mobile equivalents.
- Designer discretion on mobile nav pattern.

===============================================================================
## 15. FUNCTIONAL DEBUGGING PASS
===============================================================================

- Run a full regression pass on existing functionality.
- Explicitly test: messaging, all "add" flows (project, task, team member),
  approval workflow, file uploads, notifications.
- Fix any bugs found — even if not listed in this document.
- At the end, provide a summary of bugs found and fixed on your own
  initiative (separate from the explicitly requested changes above).

===============================================================================
## SUMMARY OF NEW FEATURES (not in original edits.md)
===============================================================================

These were requested during the Q&A and are IN SCOPE for this pass:

1. **Permission granularity** — project-wide configurable role permissions.
   HEAD controls what CO_HEAD and MEMBER can do via project settings.
2. **Kick members** — remove members from a project (HEAD/CO_HEAD if allowed).
3. **Node edit history** — full audit trail (Google-Docs style) of all
   changes to each node, by whom, and when. Pruned after 10 days.
4. **Invite emails via Resend** — send actual emails (with domain caveat).
5. **Unread comment tracking** — distinguish read vs. unread on node indicators.
6. **Public profile page** — new page viewable without auth, showing user's
   public projects, bio, social links.

===============================================================================
## IMPLEMENTATION NOTES
===============================================================================

- The graph page should have its own layout (no shared header) to support
  the navbar auto-hide behavior cleanly.
- Prisma schema migrations needed for:
  - Project.visibility (enum: PUBLIC, PRIVATE)
  - ProjectPermissions model (project-wide role→permission matrix)
  - User social links (new fields or relation)
  - NodeAuditLog model (tracks changes, pruned after 10 days)
  - CommentRead model (userId + nodeId + lastReadAt) or equivalent
- React Flow configuration changes:
  - selectionOnDrag: true (for marquee multi-select)
  - panOnDrag with spacebar modifier
  - Multiple handles per node (4 sides)
  - Custom edge component (no animation, bezier, themed stroke)
- CreateProjectButton modal: investigate why it appears at bottom despite
  fixed+centered CSS. May be a parent overflow or transform issue.
- New pages to build:
  - /profile/[userId] (or /u/[username]) — public profile, no auth required

===============================================================================
## EXECUTION CONTRACT
===============================================================================

**Role:** You (Kiro) are the sole implementer for this entire pass. You are
a senior full-stack engineer AND product designer. Make all design-discretion
calls yourself — do not ask for confirmation. Ship complete, production-quality
work.

**Constraints: NONE on time or cost.**
- There is NO budget limit on credits, tokens, or iterations.
- There is NO time constraint. Take as many iterations as needed.
- Correctness and completeness come first. Speed is irrelevant.
- The user will be away from the laptop. Work autonomously and iteratively
  until EVERYTHING in this document is fully implemented, tested, and
  polished.

**Process:**
- Work through each section sequentially (or in whatever order minimizes
  rework).
- Do NOT leave TODOs, placeholders, or partial implementations.
- If you hit an environmental blocker (missing API key, service down),
  document it clearly and move to the next section.
- At the end, provide a complete summary of:
  1. Everything implemented.
  2. Any bugs found and fixed during the debugging pass.
  3. Any blockers encountered and their status.

**Quality bar:**
- Every surface touched must look intentionally designed.
- Every feature must be fully functional end-to-end.
- Light AND dark mode must both work.
- No regressions to existing functionality.
- Sign In, Sign Up, and Landing pages remain UNTOUCHED.
