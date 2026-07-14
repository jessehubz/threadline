# Project Cards

## Layout
- [ ] Make cards more compact overall — tighten padding and vertical spacing without hurting readability.

## Card header
- [ ] Remove the **"Open"** action/button from the card.
- [ ] Remove the row of letters/initials currently shown above the project name (the small monogram/badge sitting above the title).
- [ ] Replace "Open" with a clearer single action — e.g. one icon button (a "send"/arrow-style icon) instead of a text button.

## Progress indicator
- [ ] Remove the percentage number/text next to the progress bar. Keep only the visual progress bar itself.

## Tags
- [ ] Tag row must use the horizontal-scroll container defined in `04-tags-system.md` — the two default tags (Draft, Ongoing) plus any custom tags all live in this scrollable row.

## Delete & Recently Deleted
- [ ] Add a delete action to each project card, with a confirmation step before permanent removal.
- [ ] Add a **"Recently Deleted"** area somewhere in the site (a dedicated page, or a section under settings) where deleted projects land — should support restoring a project or purging it permanently.

## Pagination ("Show More")
- [ ] Default grid displays up to **8 projects**, laid out as **2 stacked rows of 4**.
- [ ] If there are more than 8 projects, show a **"Show More"** button beneath the grid to reveal the remainder — match the exact behavior already defined in `dashboard.md`.

## Responsive / theming
- [ ] Verify compact layout, new header action, progress bar, tag scroll, delete flow, and pagination all work in both light and dark mode, and reflow correctly on mobile (e.g. grid likely drops to 1–2 columns).
