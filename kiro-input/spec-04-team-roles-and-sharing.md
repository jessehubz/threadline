# Team, Roles & Sharing

**Where this goes:** save as `spec-04-team-roles-and-sharing.md` in your spec-input folder. Kick off with `/spec new team-roles-and-sharing`, choose **Build a Feature**. If you'd rather keep bugs and features strictly separate, pull the "Team & invite bugs" section below into its own `/spec new team-invite-bugs` (**Fix a Bug**) first, then run this spec for the rest — either approach works.

This spec extends/revises the team-members and privacy/roles work from an earlier round — see the note at the end.

## Team & invite bugs (Bug)

**Current Behavior (Defect)**
- WHEN a team is added to a project, or members are added by email, THEN the member count shown on the dashboard project card does not update.
- WHEN an email invite is sent THEN the email never actually arrives at the address entered.
- WHEN a team has been added to a project THEN that team does not appear as an assignable option in the task assign-member panel.

**Expected Behavior (Correct)**
- WHEN membership changes (team added, email invited, member added directly) THEN the system SHALL immediately reflect the correct member count on the dashboard project card.
- WHEN an invite is sent THEN the system SHALL actually deliver the email, and SHALL surface a visible error to the user if delivery fails instead of failing silently.
- WHEN a team is part of a project THEN its members SHALL appear as assignable options in the task assign-member panel, the same as individually-added members.

**Investigation notes:**
- Bug 1 is likely a stale-cache or missing-refresh issue on the card's member-count field after an invite action completes — check what actually triggers a re-fetch of that count.
- Bug 2 could be a broken email-sending integration, a silent failure with no surfaced error, or invites that write to the database but never trigger a send — the fix should also make future failures visible rather than silent.
- Bug 3 suggests team members may be getting added to some list the assign panel doesn't read from — check whether adding a team actually adds its members to the project's canonical member list, or only to a separate "teams on this project" record.

## Assign-member panel redesign (Feature)
- Pre-populate the assign-member panel with the project's full member list (don't make the user search from empty) — this should include individually-added members and anyone added via a team, once the bug above is fixed.
- Selecting a member highlights their avatar with a single accent color (per steering — purple, not a new color).
- Selected members move to the front of the list, so it's easy to see who's currently assigned and quickly deselect them.
- Confirm whether tasks support multiple assignees or exactly one — if the existing data model is single-assignee only, flag that as a decision point rather than assuming multi-select.

## Roles: add Co-Head and Viewer (Feature — extends the earlier Head/Member roles)
- Expand the role set from Head/Member to four roles: **Head**, **Co-Head**, **Member**, **Viewer**.
- Suggested permission matrix *(design discretion — recommended default, confirm before build)*:

| Capability | Head | Co-Head | Member | Viewer |
|---|---|---|---|---|
| View project | Yes | Yes | Yes | Yes |
| Comment on tasks | Yes | Yes | Yes | See flag below |
| Edit/create tasks | Yes | Yes | Yes | No |
| Invite/remove members | Yes | Yes | No | No |
| Change project privacy (public/private) | Yes | No | No | No |
| Access sharing settings | Yes | Yes | Limited (see Share panel below) | No |
| Delete project | Yes | No | No | No |

- **Flag:** this table assumes Viewers can't comment, which conflicts with "everyone can comment" in `spec-02-task-details-panel.md`. Same tension flagged there — resolve it once, consistently, in both places.
- Display each member's role as a visible badge/tag next to their name in team member lists (previously requested as Head/Member-only — extend to all four roles now).
- **Migration note:** if the earlier two-role version already shipped, this is a migration (existing Members need a role in the new four-role system — defaulting to "Member" is the safe choice) rather than a fresh build. Flag that distinction for whoever implements it.

## Share panel redesign (Feature)
- The current Share control is too minimal for members to understand what it does — redesign with clearer labeling, a short description of what sharing the link actually does, and the shareable link itself visible immediately rather than behind an extra step.
- Permission model *(design discretion — recommended default, confirm before build)*:
  - **Head/Co-Head:** full access to sharing settings, including choosing what access level a shared link grants, up to Head-level settings control.
  - **Member:** can still share the link, but only choose between two levels for whoever uses it — Viewer (view only) or Member (can edit). Cannot grant Head/Co-Head access via a shared link.
  - **Viewer:** given they're view-only by definition, they likely shouldn't be able to generate share links at all — flag this as an assumption to confirm rather than a settled rule.

## Note
Co-Head and Viewer are new additions to the earlier Head/Member role work, not replacements for it.
