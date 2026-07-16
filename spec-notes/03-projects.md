# Projects: Card Status & Duplicate Creation Bug

## Issues

1. Project cards need a visible Private/Public indicator, editable
   directly from the card (or an accessible menu on it).
2. **Bug:** clicking "Create" after adding members gives no feedback that
   the project was created. Users click repeatedly (thinking it didn't
   register), creating multiple duplicate projects from one action.

## Fix requirements (bug #2)

- Disable "Create" immediately on first click (prevent double-submit)
- Show a loading state while creation is in progress
- Show a clear success confirmation once done (toast/redirect/modal close)
- Consider backend idempotency protection too, in case duplicate requests
  slip through

## Checklist

- [ ] Project card shows Private/Public status
- [ ] Status is editable from the card/menu
- [ ] "Create" disables and shows loading on click
- [ ] Clear success confirmation appears once created
- [ ] Repeated clicks no longer create duplicate projects
