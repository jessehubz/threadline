# Steering Updates

**Where this goes:** `.kiro/steering/design-system.md` in your project root (create the file, or merge this content into an existing steering file if you have one). This is a *workspace* steering file — kiro-cli loads everything under `.kiro/steering/` automatically into every session in this project, so nothing here needs to be repeated inside the spec files below. Default inclusion mode ("always included") is correct for all three sections — no front-matter needed.

If you want these rules to apply across *all* your projects, not just this one, the same content also works at `~/.kiro/steering/design-system.md` (global scope). Workspace steering wins if the two ever conflict.

## Color palette
- Keep the UI to a black / white / purple monochromatic palette. Shades of gray count as part of "monochromatic."
- The only exception is red, reserved exclusively for alerts, warnings, and destructive/urgent states — e.g. the new "Urgent" task status (see `spec-02-task-details-panel.md`) and delete confirmations are natural, intentional uses of it.
- Don't introduce any other accent color anywhere in the UI without an explicit request — this includes incidental places it's easy to forget, like chart colors, empty-state illustrations, or default avatar-background colors.

## Motion & hover language
- Hover states on cards/boxes use a subtle "rise" effect: a slight lift (translateY) paired with an increase in shadow depth, with smooth easing — not an abrupt snap. Aim for quick, snappy timing rather than a slow animation — roughly 150–250ms is a reasonable starting point *(suggested default, adjust to taste)*.
- Modal/popup open transitions should animate their backdrop and any color changes smoothly rather than appearing instantly — same "not abrupt" principle.
- This motion language applies to every interactive surface added or touched in **any** spec below, not only the ones where hover/motion is called out explicitly in that spec's file.

## Scope guardrail
- Do not modify the Sign In, Sign Up, or Landing pages in any spec, unless a future request explicitly says otherwise.
- This applies even to shared components: if a component is used by both an excluded page and an in-scope page, only the in-scope usage should change. Confirm the excluded pages render identically before/after any spec that touches a shared component.
