# Projects Tagging & Search

**Where this goes:** save as `spec-01-projects-tags-and-search.md` in your spec-input folder. Kick off with `/spec new projects-tags-and-search`, choose **Build a Feature**.

## Organization tags & filtering (Feature)
- Projects can be tagged with one or more organization labels (e.g. "2026", "Engineering Student Council") — a project can carry multiple tags at once (e.g. one project tagged both "2026" **and** "Engineering Student Council" simultaneously).
- Add a way to assign/edit tags on a project — from project settings, or from the quick-actions menu added in `spec-03-dashboard-cards-and-recently-deleted.md`.
- Add a filter control in the Projects section that lets the user filter the visible project list by one or more tags at once.
- Show which tags are active on a project somewhere on the card itself (small chips/pills), so tags are visible without opening the filter.
- Handle the empty state: if a filter selection matches zero projects, show a clear "no projects match this filter" message rather than a blank area.
- *(Design discretion)* Tag chips on the card, plus a filter dropdown/multi-select above the project rail, is a reasonable default — adjust to fit the existing design system. Once any filter is active, a "clear filters" action should be easy to find.

## Search redesign (Bug + Redesign)

**Current Behavior (Defect)**
- WHEN the user hovers or focuses the search input THEN the cursor does not switch to the standard text-input (I-beam) cursor.
- WHEN the user searches THEN results currently open in a separate popup/modal.

**Expected Behavior (Correct)**
- WHEN the user hovers or focuses the search input THEN the system SHALL show the standard text-input cursor, like any normal text field.
- WHEN the user types in the search bar THEN the system SHALL show suggested results in an inline dropdown directly below the search bar, not a separate popup/modal.

**Additional detail for the dropdown:**
- Update as the user types, with reasonable debounce so it isn't re-querying on every keystroke.
- Dismissible by clicking away or pressing Escape.
- Clicking a suggestion navigates directly to it.
- If there are no matches, show a brief "no results" row rather than an empty or missing dropdown.
