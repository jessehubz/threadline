# Friends Panel & Needs Attention Panel

> ⚠️ This is the area where the most content has been lost in previous passes. Treat `dashboard.md` (and its accompanying HTML) as the source of truth for structure. Where anything here seems to conflict with that reference, flag it rather than guessing.

## Rename
- [ ] Rename the **"Team"** panel to **"Friends"** everywhere (label text, any internal references that surface in the UI).

## Hover state
- [ ] The Needs Attention panel currently hovers **purple** — remove that.
- [ ] Its hover state should instead **match** whatever hover treatment the Friends panel uses — the two panels should feel consistent with each other side-by-side, just not purple.
- [ ] Per the global rule, if either panel currently has no hover feedback at all, add it.

## Logos — final decision
- [ ] **No logo** for the Friends panel, and **no logo** for the Needs Attention panel. (An earlier idea floated giving the Friends panel a new purple-toned logo — that idea is superseded; do not add one.)

## Friends panel — status indicators
- [ ] Follow the layout already defined in the reference HTML/`dashboard.md` — don't invent a new card structure.
- [ ] Each friend entry needs a status indicator driven by health score, using states along the lines of **Free / Busy / Stacked** (the original note said "etc." — confirm the complete state list against the reference file, since there may be more than these three).
- [ ] Each friend entry also needs to separately indicate whether they're currently **active** (this is distinct from the health-score status above — both should be visible).

## Subheadings
- [ ] Every panel/section has an auto-surfaced subheading beneath its title, defined in the reference HTML. This was dropped in a previous implementation pass — **restore it**, matching the reference file exactly, for every section (not just these two panels).

## Needs Attention — remove the alert badge
- [ ] Remove the red numeric badge showing the count of items needing attention. The panel should no longer surface that number at all.

## Responsive / theming
- [ ] Verify renamed labels, hover states, status indicators, and subheadings all render correctly in both light and dark mode, and reflow sensibly at mobile widths.
