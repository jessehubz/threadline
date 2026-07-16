---
inclusion: always
name: fix-conventions
description: Cross-cutting conventions that came out of the current bug list. Apply these to every fix, not just the specific bug they were noticed in.
---

# Conventions to apply across all fixes

These aren't one-off bugs — they're patterns that show up more than once in
this app. When fixing any of them, fix the underlying pattern app-wide, not
just the one screen where it was noticed.

## 1. Any async "create/submit" action needs three states

Symptom seen in: project creation (caused duplicate projects).

- Disable the trigger button on first click.
- Show a loading state while the request is in flight.
- Show an explicit success confirmation when it completes (toast, redirect,
  modal close — something visible).

Apply this to every create/submit/upload action in the app, not just the
ones explicitly listed elsewhere, since silent async actions is how the
duplicate-project bug happened in the first place.

## 2. User-identity fields must propagate everywhere, not just the owner's view

Symptom seen in: display name and avatar both updating only on the user's
own profile, staying stale in the Friends tab / project members / elsewhere.

When a user's name, username, or avatar changes, treat it as a single
source of truth referenced everywhere that user appears (friends list,
project members, popups, messages) — not a value copied at add-time. Prefer
referencing the user record directly (or a live query) over duplicating
user fields into other tables/state.

## 3. Notification/status badges are conditional, never decorative

Symptom seen in: message/notification badge showing even with nothing
unread.

Any badge, dot, or count indicator must be driven by real unread/pending
state. If the underlying count is 0, the indicator does not render at all
(not "renders but styled subtly").

## 4. Layout must hold up at narrow widths

Symptom seen in: Manage Settings breaking at narrow tab widths.

Check any panel/modal touched during these fixes at ~320px, ~480px, and
~768px before considering it done, even if narrow-width wasn't the specific
bug being fixed.

## 5. Shared UI elements (navbar, hover states, colors) should be one
   source of truth

Symptom seen in: navbar width differing per page, hover highlight color
inconsistent.

Prefer a single shared component/style token for navbar, hover states, and
similar chrome, rather than per-page overrides. If fixing one page's navbar
width or hover color, check whether other pages are pulling from a
different copy of the same component.

## 6. Friends/messaging/notifications should mirror Meta apps

For anything in the social system (friends, requests, DMs, notifications),
default to how Facebook/Messenger handles it when a specific behavior isn't
spelled out. Use that as the tiebreaker for UX decisions not otherwise
specified.
