# Dashboard Hero & Overall Layout

## Overall dashboard width
- [ ] The dashboard content area currently feels too wide. Reduce it — add an appropriate `max-width` to the main content container with centered margins, instead of letting it stretch edge-to-edge on large screens.

## Greeting text ("Good evening, {name}")
- [ ] Change the font applied specifically to the `{name}` portion of the greeting (not the "Good evening," part) — it should read as visually distinct, e.g. different font-family or weight. Exact font is an open question — see `00-README-and-global-rules.md`.

## Hero stat card (the "95% on track" health card)
- [ ] Currently has no hover feedback. Add a "lift" animation on hover to the **entire card**: e.g. `transform: translateY(-4px)` combined with an increased/softer box-shadow, with a smooth transition (~150–200ms ease).

## Today / This Week / Later boxes
- [ ] These also need hover animation — full detail (including the new Overdue column) is in `07-task-timeline-groups.md`. Use the same hover "feel"/timing as the hero card above so the dashboard reads consistently.

## Responsive / theming
- [ ] Verify the reduced-width layout, the greeting font, and the hero card hover all work correctly in both light and dark mode, and at mobile/narrow widths (card should reflow, not overflow).
