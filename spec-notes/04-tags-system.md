# Tags System

## Default (premade) tags
- [ ] Only **two** tags are premade/built-in: **"Draft"** and **"Ongoing."**
- [ ] All other tags are **not** premade — users create/add their own custom tags as needed. Once created, a custom tag should be reusable (available to apply to other projects too, not a one-off).

## Tag container (used on project cards)
- [ ] Because a project can end up with many tags (the two defaults plus any number of custom ones), the tag row needs its own container that **scrolls horizontally** rather than wrapping to multiple lines or overflowing the card.
- [ ] This container is shared behavior — used on project cards (see `06-project-cards.md`) and anywhere else tags are displayed.

## Responsive / theming
- [ ] Tag chips and the scroll container must look correct in both light and dark mode, and remain usable (scrollable, not clipped) on mobile widths.
