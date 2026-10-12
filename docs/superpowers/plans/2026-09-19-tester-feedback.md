# Tester Feedback — Implementation Tracker

Opened 2026-09-19 · Source: tester round (Ren, Kim, Leng)

Status values: `Not started` / `In progress` / `Needs review` / `Done` / `Deferred`.
A phase reaches `Done` only after its visual is approved **and** verification passes.
Update this file in the same commit as the code.

## Status summary

| Phase | Item | Status | Visual approved | Migration | Notes |
|-------|------|--------|-----------------|-----------|-------|
| A1 | Full expense list screen | Needs review | – | none | member-count sub-task reverted, see A3 |
| A2 | Date picker sticky footer (`AppModal` `footer` prop) | Needs review | – | none | |
| A3 | Balance diagnostic (₱1,333 vs ₱1,000) | Needs review | n/a | none | findings below — blocks a design decision |
| B | Global toasts, never occluded | Not started | – | none | after A2 |
| C | Event colour coding | Not started | – | TBD | |
| D | Balances per-person itemisation | Not started | – | none | |
| E | Roles/admin + expense audit | Not started | – | TBD | |
| F | Bank QR payment options | Not started | – | TBD | + storage bucket |
| G | Hide bottom nav on scroll | Not started | – | none | |
| H | Document payment submit/accept | Not started | n/a | none | PRODUCT.md |

## Original feedback → phase mapping

| Tester item | Verdict | Phase |
|---|---|---|
| Member display/count wrong | Reclassified by reporter → expense count/list | A1 |
| Balance off in shared event (₱1,333 vs ₱1,000) | Needs diagnosis | A3 |
| Recent expenses capped at 4, no scroll | Valid bug | A1 |
| Event colour coding | Valid feature | C |
| Balances per-person itemisation | Valid feature | D |
| Bank QR upload | Valid feature | F |
| Toast messages | Valid, refine existing `AppToast` | B |
| Roles/admin + expense edit audit | Valid feature | E |
| Payment submission & acceptance | Deferred by reporter | H |
| Hide bottom nav on scroll | Valid feature | G |
| Date picker Apply/Clear below fold | Valid bug | A2 |
| Toast must not hide behind footer/components | Valid | B |

---

## Per-phase detail

### A1 — Full expense list

**Problem.** The dashboard heading printed `summary.expenses.length` as "N total" while the
body rendered only `.slice().reverse().slice(0, 4)`. The count and the list read from the
same array, so the heading was accurate and the list was not.

**Changes.**
- `src/features/expenses/ExpenseListScreen.tsx` (new) — full history, newest first,
  grouped by day with per-day subtotals, event total in the hero card, tap-through to edit.
- `src/app/navigation.tsx` — added `AllExpenses: {eventId: string}` to `AppStackParamList`,
  import, and switch case.
- `src/features/events/EventScreens.tsx` — the "N total" heading is now tappable via
  `SectionHeading.onDetailPress` (the prop already existed), plus a
  "View all N expenses" button when more than 4 exist.

**Notes.**
- All expenses are already fetched client-side by `getEventSummary`; no backend pagination.
- Rendered via mapped `AppCard`s rather than a `FlatList` — `AppScreen` already owns a
  `ScrollView` and nesting a `FlatList` inside it is an anti-pattern. Matches `HomeScreen`.

**Reverted sub-task.** The planned "N joined · M invited" member label was implemented and
then reverted — see A3 for why it was wrong.

**Verification.** `npx tsc --noEmit` clean · `npm test` 45/45 · `npm run lint` 0 errors,
19 pre-existing warnings.

---

### A2 — Date picker sticky footer

**Problem.** `EventDateRangePicker` rendered the summary card, a ~340px
`react-native-calendars` Calendar, and the Clear/Apply action row all inside `AppModal`'s
single `ScrollView`, with the card capped at `maxHeight: '88%'`. The buttons fell below the
fold and required scrolling.

**Changes.**
- `src/components/ui/AppModal.tsx` — new optional `footer?: React.ReactNode`, rendered as a
  sibling **after** the ScrollView so it never scrolls. Mirrors the `footerOverlay` pattern
  already used by `AppScreen`.
- `src/components/ui/styles.ts` — added `modalFooter` (hairline top border, padding, gap).
- `src/features/events/EventScreenComponents.tsx` — `EventDateRangePicker` replaced by
  `EventDateRangeModal`, which owns the draft state and renders its own `AppModal` with the
  actions in the footer. Draft state re-seeds on open so a cancelled edit cannot leak forward.
- `src/features/events/EventScreens.tsx` — both call sites migrated. The event-dashboard
  edit modal was a single `AppModal` switching on `editModalStep`; it is now two siblings
  (`EventDateRangeModal` for `'dates'`, `AppModal` for `'details'`).

**Reusable.** Any other `AppModal` with confirm actions (icon picker, payer/split pickers,
account sheet) can now adopt the same sticky footer.

**Verification.** Same run as A1 — all clean.

---

### A3 — Balance diagnostic (investigation only)

**Conclusion: the split maths is correct. The defect is in participant selection, and it is
the opposite of the original hypothesis.**

**1. The RPC is sound.** `create_expense_with_equal_split`
(`20260510000000_baseline.sql` ~2494) computes `round(amount / count, 2)` and assigns the
rounding remainder to the final participant, so splits always re-sum to the expense total.
No rounding drift. `update_expense_with_equal_split` deletes and recreates all splits, so
participants *can* be corrected after the fact.

**2. The reported direction rules out the "forgot to add a member" theory.**
For an expense of ₱4,000: ÷3 = ₱1,333.33, ÷4 = ₱1,000. The tester expected ₱1,333 and the
app showed ₱1,000, which means the expense was split across **one person too many**, not too
few. An expense created before someone joined would have produced the opposite error.

**3. Likely root cause — the new-expense form preselects every member row.**
`src/features/expenses/AddExpenseScreen.tsx` seeds participants with
`summary.members.map(member => member.id)` and derives `memberCount` from
`summary.members.length`. Both include rows with `status = 'invited'`.

**4. The real problem: `status = 'invited'` conflates two different things.**
Local data confirms it:

```
 event | display_name | status  | placeholder | has invite row
 Bills | Fam 1        | invited | yes         | no
 Bills | Fam 2        | invited | yes         | no
 Bills | Fam 3        | invited | yes         | no
 Bills | Ren          | joined  | no          | –
 Bills | Test2        | joined  | no          | –
```

- **Placeholder participants** — manually added, `user_id IS NULL`, no `invites` row. They
  will never "join" and they *must* be included in splits. This is a documented MVP feature.
- **Genuine pending invitees** — have an `invites` row awaiting acceptance. Whether they
  should be in a split is a product decision.

Both carry `status = 'invited'`, so nothing in the schema currently tells them apart.

**5. Why the member-count sub-task was reverted.** The planned "N joined · M invited" label
would have rendered the Bills event as "2 joined · 3 invited" when all five are genuine
participants. Shipping it would have replaced one misleading number with a worse one. The
helper, its call sites, and its unit test were all backed out.

**6. Confirmed the mechanism exists.** Scanning local data for expenses split across fewer
members than have joined returns a real hit (`Bills` → "Borrowed Money", ₱3,000, 1 split vs
2 joined members), so under-splitting happens too.

**Recommended next step (needs a product decision before any code):** give the two kinds of
member distinct states rather than overloading `invited` — e.g. a `placeholder` status, or
deriving the distinction from `user_id IS NULL AND NOT EXISTS (pending invite)`. That single
change would let us fix, coherently: the member count label, the default participant
selection on new expenses, and the "Everyone · N" copy.

**Diagnostic query for production** (read-only, run against the HK event):

```sql
select e.name as event,
       x.title, x.amount, x.created_at::date,
       (select count(*) from expense_splits s where s.expense_id = x.id) as split_count,
       (select count(*) from event_members m
         where m.event_id = e.id and m.status = 'joined') as joined_members,
       (select count(*) from event_members m
         where m.event_id = e.id and m.status = 'invited') as invited_members
from expenses x
join events e on e.id = x.event_id
where e.name ilike '%hong kong%'
order by x.created_at;
```

---

## Deferred / future

- Payment submission & acceptance — needs a notification channel that does not exist yet.
  To be written into `PRODUCT.md` in Phase H.
- Retroactive split backfill for late-joining members — superseded by the A3 finding; the
  member-state model should be fixed first.

## Open questions

1. **Should genuine pending invitees be included in expense splits by default?**
   Placeholders clearly should. Pending invitees are ambiguous. Blocks the member-count
   label, the default participant selection, and the "Everyone · N" copy.
2. Should existing `invited` rows with no invite row be migrated to a new `placeholder`
   status, or should the distinction stay derived at query time?
