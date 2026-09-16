# Splyt UX Improvement Plan

Source: `$impeccable critique` on `src/features`, 2026-09-12. Full report and evidence:
`.impeccable/critique/2026-09-12T14-29-59Z__src-features.md`. Score **19/40 (Poor)**,
2 P0 and 3 P1 issues, cognitive load 6 of 8 checks failing.

> **Status:** Phases 0–3 and the contrast/accessibility work in Phase 5 are implemented.
> Phase 4's structural items (tab IA, dashboard primary action, card-per-row cleanup in the
> fund screen) and the remaining Phase 5 cleanup are still open.

Design authority for every change here is [DESIGN.md](../DESIGN.md). Product truth is
[PRODUCT.md](../PRODUCT.md).

## Register for this pass

**Keep it calm.** The problem is not that the interface is too quiet — it is that the
money screens were never given the attention the token layer got. Fix legibility,
hierarchy, and order. Do not add color, decoration, or volume to compensate.

Three rules govern every item below:

1. **The number is the headline.** In any card or row about money, the currency value is
   the largest and heaviest element present.
2. **Meaning never rides on color alone.** Every sign, status, and selection carries a
   word, a shape, or an icon in addition to its color.
3. **One primary action per screen.** Everything else steps down.

---

## Phase 0 — Stop the bleeding (both P0s)

Blocking defects. Nothing else ships before these.

### 0.1 Android back and volatile navigation state

- `src/app/navigation.tsx` keeps the stack in `useState` and never registers
  `BackHandler`. Register `hardwareBackPress`: call `goBack()` and return `true` while
  `stack.length > 1`; return `false` at root so the OS handles exit.
- Add an unsaved-changes confirm when leaving `AddExpenseScreen` with a non-empty title,
  amount, or attached receipt.
- Evaluate migrating to React Navigation's native stack so the iOS interactive edge-swipe
  and state restoration come for free rather than being hand-maintained.

**Done when:** hardware back navigates on every screen, exits only at root, and never
silently discards a draft.

### 0.2 Money legibility and sign

- Build one `MoneyValue` component and route every currency display through it. It owns
  the size, the weight, the tabular numerals, the sign prefix, and the color. No screen
  formats money itself after this.
- `BalanceScreens.tsx`: replace the 12pt `DataPill` with `typography.amount` plus an
  explicit `You owe` / `You're owed` prefix. Delete
  `tone={balance.net >= 0 ? 'accent' : 'default'}` — it currently renders a debt in the
  color of a credit.
- Darken every semantic color used as **text**. Measured on white: `#22C55E` = 2.28:1,
  `#F59E0B` = 2.15:1, `#4CAF50` = 2.78:1, `#E74C3C` = 3.82:1, `#3B82F6` = 3.68:1. All
  fail AA. Add darkened text variants to `src/theme/tokens.ts` and keep the bright values
  for fills only, with ink-dark text on top rather than white.
- Unify money semantics across screens: `HomeEventCard` shows total spend as muted
  caption while `EventsScreen` shows the same number as green `bodyStrong`. Same data
  must mean the same thing everywhere.

**Done when:** every money value on screen passes 4.5:1, states its sign in words, and
uses one shared component.

---

## Phase 1 — Make the central fund the product

The differentiator exists in one good component and is absent everywhere it would win.

- **Add Expense:** move the payment-source choice **above** Title — it changes the meaning
  of every field below it. When `central_fund` is selected, replace the Payer card with a
  fund card reading `Central fund · ₱X available`, live-preview the balance after this
  expense as the amount is typed, and warn inline when the amount exceeds the pool. Stop
  submitting `paidByMemberId` for fund-paid expenses.
- **Event dashboard:** the fund's available balance belongs in the spine of the screen,
  not in a card the user scrolls past.
- **Settlement:** state how much of the trip the fund absorbed. It is the one sentence no
  competitor can print.
- **First run:** nothing in the app explains what a central fund is. A new user's first
  screen shows `₱0.00` as its largest number under a term they have never met. Write one
  sentence of explanation into the zero state.

**Done when:** a user can answer "can we still put this on the pool?" without leaving the
screen they are on, and cannot overspend the pool silently.

---

## Phase 2 — Accessibility floor

Measured, not estimated. Every item has a file reference in the critique snapshot.

- `accessibilityState={{selected}}` on `SelectableRow`, `AppTabBar`, and `EventIconPicker`.
  Without it a screen-reader user cannot tell who is included in a split.
- Raise `iconButton`, `iconButtonOnWhite`, `headerBellButton`, `backButton`, and
  `refreshButtonLight` from 36×36 to 44, or add `hitSlop`. Take `receiptRemoveButton` from
  28×28 to 44. `hitSlop` currently appears **zero** times in the codebase.
- `accessibilityViewIsModal` on `AppModal`; `importantForAccessibility="no-hide-descendants"`
  on both modal backdrops, which are currently focusable and unlabeled.
- Replace fixed `height` with `minHeight` on every container holding text, and cap
  `maxFontSizeMultiplier` (~1.6) on buttons and tab labels. Nine fixed-height containers
  currently clip at large Dynamic Type.
- Associate field errors with their inputs and announce them (`accessibilityLiveRegion`).
- Raise the 9pt notification count and 9pt avatar overflow to the token floor of 11pt.

**Done when:** the primary flow — create event, add expense, read balance — is completable
with VoiceOver and at Larger Accessibility Sizes without clipping.

---

## Phase 3 — Give the loop an ending

- A **settled state** when `instructions.length === 0` that reads as an achievement, not
  the current neutral "This event is already balanced."
- A **Share summary** action producing plain text for the group chat: who pays whom, how
  much, and the fund's contribution. Persisted paid-status is not built yet, so the
  shareable artifact is the shippable version of "done."
- A **confirmation** when an expense saves. Today `AddExpenseScreen` calls
  `navigation.goBack()` in silence, which produces duplicate entries.

**Done when:** the last screen of the trip is something the group wants to send each other.

---

## Phase 4 — The UX redesign

Structural, not cosmetic. See the UI/UX critique for the reasoning behind each.

- **Collapse the Home/Events tab overlap.** Two of four tabs list the same events. Free
  the slot.
- **One primary action per screen.** The event dashboard currently presents ~13 competing
  targets and four equal-weight shortcut tiles. Pick the primary, demote the rest into a
  row of quiet controls.
- **Add Expense becomes a flow, not a form.** Amount first at display size, source second,
  participants collapsed to an editable chip that defaults to everyone and expands only on
  exclusion, preview **above** the commit button, Save pinned in the footer.
- **Stop drawing a card around every row.** Contributions and balances are lists inside one
  card, not stacks of near-empty full-width cards. Reserve the card for the group.
- **Use the thumb zone.** `AppScreen` already supports `footerOverlay` and almost nothing
  uses it. Primary actions belong at the bottom of the screen on a phone.
- **Rewrite the zero states.** "Settled" on an empty event is the wrong word and it stops
  new users cold.

---

## Phase 5 — Cleanup

- Wire or visually disable the five inert controls: the Events-tab bell
  (`onPress={() => undefined}`) and four `SettingsRow` entries that render a chevron with
  no handler. A chevron is a promise.
- Route `AuthScreen` through `AppScreen variant="auth"` — that branch already exists,
  already has the `KeyboardAvoidingView` + `ScrollView`, and is currently dead code. The
  keyboard presently covers the Create-account button.
- Adopt `react-native-safe-area-context`. `useSafeAreaInsets` and `SafeAreaProvider` appear
  **zero** times; `tabBarBottomInset` defaults to `0` and no caller computes it.
- Fold 25 non-token colors and 15 off-scale font sizes back into `src/theme/tokens.ts`, or
  promote the ones that earn a place (the `AppAvatar` identity palette is legitimate and
  should become a documented token group).
- Migrate `Clipboard` off `react-native` core, from which it was removed.
- Delete the fabricated `DataPill label="Trusted"` in Settings.
- Fix the dangling `· ` separator in the fund overview meta line.
- Pass `currentBalance` to `HomeEventCard` — the better "You're owed / You owe" design
  already exists and no caller uses it.
- Replace the first-issue-only validation in `src/lib/validation/forms.ts` with all-issue
  mapping, and stop swallowing backend failures in the six `.catch(() => undefined)` sites.
- Add `RefreshControl` — there is currently no way for a user to refresh a stale balance.
- Add haptics on selection, save, and destructive confirm. The system's stated character is
  "tactile and confident" and nothing is currently felt.

---

## Verification

Re-run `$impeccable critique` on `src/features` after each phase. The trend is tracked in
`.impeccable/critique/` and the score should be read against the same 40-point maximum.

Per-phase checks: `npx tsc --noEmit`, `npm run lint`, `npm test -- --runInBand`, plus a
manual pass on the shipped device classes at default and Larger Accessibility text sizes.
