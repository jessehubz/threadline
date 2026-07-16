# UI & Settings Fixes (Settings, Navbar, Dashboard, AI Assistant)

## Manage Settings & Profile

Issues:
- Layout breaks when the tab/container is narrow — elements overlap/overflow
  instead of stacking gracefully. Test at ~320px, ~480px, ~768px.
- No confirmation when a profile picture upload succeeds.
- Remove "Add email address" entirely (UI + any dead code/routes).
- Password field needs valid/invalid feedback (e.g. checkmark on correct).
- Background behind the panel is blurred — make it solid dark instead.
- The settings container's layout/spacing/alignment is broken — clean up.
- **Avatar propagation bug:** when a user updates their profile picture,
  other users still see the old one everywhere this user appears (friends
  list, project members, popups, etc.) — only the owner's own view updates.
  Fix so the new avatar propagates app-wide.

Checklist:
- [ ] Settings panel doesn't break at narrow widths
- [ ] Upload shows a clear success confirmation
- [ ] "Add email address" fully removed
- [ ] Password field shows valid/invalid feedback
- [ ] Background is solid dark, not blurred
- [ ] Container layout is clean and consistent with rest of app
- [ ] New profile picture displays correctly to all other users, app-wide

## Navbar

Issues:
- Hover highlight color is purple — change to white/grey.
- Top-left logo doesn't match the landing page's top-left logo — make
  consistent.
- Remove "Synced just now" element.
- Remove "Projects need attention" element.
- Navbar width differs per page — should be one consistent width app-wide.
- Remove "Tasks" nav item (redundant, already on dashboard).
- Notification/message badge shows even with nothing unread — should only
  appear when there's an actual unread item (full logic lives in the
  friends/messaging/notifications file).

Checklist:
- [ ] Hover highlight is white/grey, not purple
- [ ] Logo matches landing page exactly
- [ ] "Synced just now" removed
- [ ] "Projects need attention" removed
- [ ] One consistent navbar width on every page
- [ ] "Tasks" nav item removed
- [ ] Badges only show when there's an actual unread item

## Dashboard

Issues:
- Loading screen doesn't visually match the dashboard's actual theme.
- Friends section doesn't accurately reflect real-time active/online
  status — for friends, and for the current user's own status shown to
  others.

Checklist:
- [ ] Loading screen matches dashboard's visual style
- [ ] Friends' active/online status is accurate in real time
- [ ] Current user's own active status is shown correctly to friends

## AI Assistant

Issue: assistant is supposed to run on Llama but can't answer a basic
question about its own name.

Check: system prompt/persona configured and passed correctly; integration
actually wired to Llama end-to-end (not silently failing/falling back); any
handling for basic identity questions.

Checklist:
- [ ] Assistant correctly answers when asked its own name
- [ ] Confirmed the model actually being called is Llama, end-to-end
