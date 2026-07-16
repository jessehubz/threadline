# Social System (Friends, Teams, Messaging, Notifications, Username)

This whole area should behave like Meta apps (Facebook/Messenger) — use
that as the reference model throughout.

## Friends

Bugs:
- Name doesn't sync: a friend's updated display name only changes on their
  own profile, not in other users' Friends tab.
- "Your Friends" section shows project names instead of actual friends.
- Friends tab shouldn't display a user's projects at all — keep it purely
  social (profile info only).
- Avatar propagation bug (see UI file) also applies here — must be fixed
  in the Friends tab specifically.

New features:
- Clicking a friend opens a small popup with their profile summary: name,
  username, email, contact, bio, health score/load (add other relevant
  fields as needed).
- Friend requests must be mutual — add Accept/Decline, not auto-connect.
- Add a close ("X") button to the "Add to Project" popup.
- Add a chat/DM button on each friend's row that opens a conversation with
  them.

Checklist:
- [ ] Friend name updates everywhere immediately after a profile change
- [ ] Friends tab shows real friends, not project names
- [ ] Friends tab no longer shows projects
- [ ] Updated avatars display correctly to other users
- [ ] Clicking a friend opens a profile popup with the fields above
- [ ] Friend requests require Accept/Decline
- [ ] "Add to Project" popup has a working close button
- [ ] Each friend row has a working DM button

## Teams

Issue: Create Team only supports adding members by email. Add a
Friends-tab-style search so users can find and add people by name/username.

Checklist:
- [ ] Create Team has a search input for name/username, not just email
- [ ] Search behaves consistently with the Friends tab search

## Messaging

Issues:
- Starting a new conversation shows no contacts to choose from — should
  let the user search their friends list.
- No acknowledgment when a friend request is accepted — add a first
  system message in the new conversation, e.g. "You and [Name] are now
  connected!" (Messenger-style).
- Message badge should only show when there's an actual unread message.

Checklist:
- [ ] New conversation lets user search/select from friends list
- [ ] Accepting a friend request creates a conversation with a "now
      connected" first message
- [ ] Message badge only shows when there's an actual unread message

## Notifications

Issues:
- Being added to a project should generate a notification.
- Notification icon should show a badge with the unread count.
- Opening/closing the notifications panel should clear that count to zero.

Checklist:
- [ ] Being added to a project generates a notification
- [ ] Badge shows correct unread count
- [ ] Viewing/closing notifications resets the count to 0

## Username system

Requirements:
- Add a unique username field (e.g. `@postmalone`), distinct from display
  name and email.
- Visible on profiles and in friend lists/popups.
- Support login via username, in addition to existing methods.
- Friends tab and Create Team search should match on username, name, or
  email.

Checklist:
- [ ] Username is unique, enforced at signup/creation
- [ ] Username displayed on profiles/friend displays
- [ ] Login accepts username as a valid identifier
- [ ] Friends tab and Create Team search match username, name, and email
