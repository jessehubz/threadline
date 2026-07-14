# Header / Top Nav Bar

Components: profile (Clerk) button, theme toggle, notification button, search bar — all top-right of the header.

## 1. Profile button (Clerk, circular avatar top-right)
- [ ] Fix the circular profile icon so it renders correctly — check for broken image source, wrong sizing, or misalignment in the circle container.
- [ ] Recolor the Clerk-provided settings/menu icon so it follows the app's theme the same way the "Threadline" brand mark elsewhere in the header does: **black in dark mode, white in light mode**. Use Clerk's `appearance`/`variables` config to override the icon color per theme rather than hardcoding.

## 2. Theme toggle (light/dark switch)
- [ ] Problem: currently has zero hover feedback — cursor doesn't change, no visual response.
- [ ] Add `cursor: pointer`.
- [ ] Add a visible hover state (background tint, subtle scale, or border/ring) — should feel consistent with other icon buttons in the header.

## 3. Notification button (bell icon)
- [ ] Same problem as the theme toggle: no hover feedback at all right now.
- [ ] Add the same treatment: pointer cursor + visible hover state, styled consistently with the theme toggle's hover so the header reads as one coherent set of icon buttons.

## 4. Search bar
- [ ] Too narrow currently — increase its width.
- [ ] Recommended approach: let it flex-grow within available header space, capped by a sensible max-width, so it doesn't collide with the profile/notification/theme icons on smaller screens (see open question in `00-README-and-global-rules.md` if a fixed width is preferred instead).

## Responsive / theming (see global rules in `00-README-and-global-rules.md`)
- [ ] Verify all four elements above in both light and dark mode.
- [ ] Define mobile behavior explicitly — e.g. does the search bar shrink, collapse to an icon-triggered overlay, or stay full width and force the icon cluster to wrap? Pick one and implement it consistently.
