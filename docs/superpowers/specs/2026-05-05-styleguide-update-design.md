# Splyt UI — Style Guide Update Design

**Date:** 2026-05-05  
**Status:** Approved  
**Scope:** Full visual overhaul of all screens to match STYLEGUIDE.md v1.0 and reference screenshots

---

## Overview

Rebuild every screen in the Splyt mobile app to match the 3-zone layout, color system, typography scale, and component library defined in STYLEGUIDE.md. The reference screenshots provide pixel-level fidelity targets.

**Key constraints:**
- React Native 0.85 (bare, no Expo)
- Install `react-native-linear-gradient` for true gradient header
- Add bottom tab bar (no third-party nav library — extend existing custom navigator)
- No backend changes

---

## 1. Foundation — tokens.ts

Update `src/theme/tokens.ts` with the following changes.

### Colors (palette)

```ts
greenPrimary: '#2F6F57'      // was: primary
greenSecondary: '#3E8C6A'    // was: secondary
greenAccent: '#22C55E'       // existing
greenTint: '#E8F2EC'         // NEW — hero/accent card background
greenTintSoft: '#F1F7F3'     // NEW — icon backgrounds, chart bars
bgApp: '#F4F5F6'             // was: canvas
surface: '#FFFFFF'           // existing
divider: '#E5E7EB'           // was: border (rename)
textPrimary: '#1C1C1E'       // was: ink
textSecondary: '#6B6B6F'     // was: inkMuted
danger: '#E74C3C'            // was: warning (rename + repoint)
info: '#3B82F6'              // was: blue (rename)
success: '#4CAF50'           // existing
warning: '#F59E0B'           // NEW — reserved
shadow: '#163628'            // existing
```

Remove: `canvasWarm`, `surfaceMuted`, `surfaceSoft`, `accentSoft`, `accent` (all replaced by the above).

### Typography scale

```ts
display:      { fontSize: 32, fontWeight: '700', lineHeight: 38 }  // "Splyt" wordmark
pageTitle:    { fontSize: 28, fontWeight: '700', lineHeight: 35 }  // page titles inside body container
sectionTitle: { fontSize: 20, fontWeight: '600', lineHeight: 26 }  // "Your events", "Balances"
cardTitle:    { fontSize: 17, fontWeight: '600', lineHeight: 23 }  // card headings
body:         { fontSize: 15, fontWeight: '400', lineHeight: 22 }  // body copy
bodyStrong:   { fontSize: 15, fontWeight: '600', lineHeight: 22 }  // inline emphasis
label:        { fontSize: 13, fontWeight: '500', lineHeight: 18 }  // field labels
caption:      { fontSize: 12, fontWeight: '500', lineHeight: 17 }  // timestamps, helper text
button:       { fontSize: 16, fontWeight: '600', lineHeight: 16 }  // all button labels
amount:       { fontSize: 30, fontWeight: '700', lineHeight: 36 }  // hero currency amounts
```

Remove: `eyebrow`, `title` (replaced by the named scale above).

### Spacing

```ts
xs: 4   // icon ↔ text
sm: 8   // label ↔ input
md: 16  // card padding, screen horizontal margin
lg: 24  // section gap, body container top padding
xl: 32  // body top, safe-area buffer
xxl: 48 // empty state
```

### Radii

```ts
sm: 8    // small pills
md: 14   // inputs (was 16)
lg: 16   // standard cards
xl: 20   // hero cards
xxl: 24  // body container top corners, modals
pill: 999
```

### Card surface

```ts
surfaces.card = {
  backgroundColor: '#FFFFFF',
  borderRadius: 16,           // no borderWidth
  shadowColor: '#163628',
  shadowOpacity: 0.06,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
}
```

---

## 2. AppScreen — 3-zone layout

Redesign `src/components/ui/AppScreen.tsx`.

### Variants

| Variant | Zone 1 | Zone 2 | Notes |
|---|---|---|---|
| `main` | Gradient header + logo + user name + bell + avatar | White body, 24pt top radius | Top-level tab screens |
| `detail` | Gradient header + back button (+ optional action right) | White body, 24pt top radius | Sub-screens |
| `auth` | None — plain white `#FFFFFF` full screen | N/A | Sign in / Sign up |

### Zone 1 — gradient header

- `LinearGradient` colors: `['#2F6F57', '#3E8C6A']` direction top → bottom
- Height: status bar inset + `56pt` content area
- `main`: Splyt logo (24pt icon) + page/user name (`18pt Semibold`, white) left; bell button + avatar right
- `detail`: white circular back button (`36pt`, `<` chevron in `#2F6F57`) left; optional action slot right

### Zone 2 — body container

- `backgroundColor: '#FFFFFF'`
- `borderTopLeftRadius: 24`, `borderTopRightRadius: 24`
- `marginTop: -16` (overlaps header)
- `flex: 1`

### Zone 3 — content

- `ScrollView` inside body container
- `paddingHorizontal: 16`, `paddingTop: 24`
- `paddingBottom: 40` (safe area buffer)
- Page title at top: `pageTitle` style, `marginBottom: 16`
- `gap: 12` between cards in a group, `gap: 24` between groups

### Props

```ts
AppScreen({
  title: string
  subtitle?: string
  variant?: 'main' | 'detail' | 'auth'  // default: 'main'
  userName?: string          // shown in main header
  onNotificationPress?: ()=>void
  avatarLabel?: string       // initials for header avatar
  leading?: ReactNode        // back button slot (detail)
  actions?: ReactNode        // right slot (detail/main)
  footerOverlay?: ReactNode
  children: ReactNode
})
```

---

## 3. Navigation — tab bar

Extend `src/app/navigation.tsx`.

### Tab structure

```
Home      → HomeScreen
Events    → EventsScreen (new — extract event list from HomeScreen)
Activity  → ActivityScreen (new — placeholder empty state)
Settings  → SettingsScreen (promoted to top-level, uses 'main' variant)
```

### AppTabBar component (new)

- `src/components/ui/AppTabBar.tsx`
- Height: `64pt + safe area inset`
- Background: `#FFFFFF`, shadow `0 -2px 12px rgba(0,0,0,0.04)`
- 4 tabs, each with outline icon (24pt) + label (11pt)
- Active: icon + label in `#1C1C1E`, Semibold
- Inactive: icon + label in `#6B6B6F`, Medium
- No pill or background behind active tab

### Tab icons

| Tab | Inactive icon | Active icon |
|---|---|---|
| Home | house outline | house filled |
| Events | calendar outline | calendar filled |
| Activity | waveform/activity | waveform filled |
| Settings | gear outline | gear filled |

Icons implemented as SVG-like View paths via `AppIcon` (existing pattern).

### Navigation state

The tab bar wraps a stack navigator. Tab switch resets sub-stack to root for that tab. Back button only appears on sub-screens (detail variant).

---

## 4. Core UI components

### AppCard

File: `src/components/ui/AppCard.tsx`

Tones:
- `default`: white bg, `16pt` radius, `16pt` padding, shadow only (no border)
- `accent`: `#E8F2EC` bg, `20pt` radius, `20pt` padding, no shadow
- `warm`: `#F4F5F6` bg, `16pt` radius, `16pt` padding, no shadow

### AppButton

File: `src/components/ui/AppButton.tsx`

Variants:
- `primary`: `#2F6F57` bg, white text, `52pt` height, `26pt` radius (pill), full-width by default
- `secondary`: white bg, `#2F6F57` text, `1pt` `#E5E7EB` border, same dimensions
- `black`: `#1C1C1E` bg, white text — utility CTAs (Copy code, Receipt, Mark paid)
- `destructive`: `#E74C3C` bg, white text

All variants: `16pt Semibold` label, icon left of label with `8pt` gap, pressed state `scale(0.98)` over 150ms, disabled at `40%` opacity.

Auto-width variant: `44pt` height, `22pt` radius — used for "+ Add member", "Invite link", etc.

### AppInput

File: `src/components/ui/AppInput.tsx`

- Height: `48pt`
- Radius: `14pt`
- Background: `#F4F5F6`
- Border: none by default; `1.5pt #2F6F57` on focus
- Padding: `14pt` horizontal
- Label: `13pt Medium #6B6B6F`, `8pt` gap above input
- `prefixIcon?: AppIconName` prop — renders icon inside input left side with `14pt` left padding, icon in `#6B6B6F`

### AppAvatar (new)

File: `src/components/ui/AppAvatar.tsx`

- Sizes: `sm` (24pt), `md` (32pt), `lg` (48pt)
- Colored circle background (deterministic color from name hash — same palette used in EventMemberAvatarStack)
- Initials: first letter of each word, max 2 chars, bold white text scaled to size
- Used in: member list rows, header avatar, avatar stacks, expense payer display

### AppTabBar (new)

Described in Section 3.

---

## 5. Screen updates

### Auth — `src/features/auth/AuthScreen.tsx`

- `auth` variant AppScreen (plain white, no gradient)
- "Splyt" in `#2F6F57`, `32pt Bold`, top-left
- Subtitle `15pt Regular #6B6B6F` below wordmark
- Fields: Email (envelope icon prefix), Password (lock icon prefix + "show" toggle)
- "Forgot password?" link aligned right, `13pt #2F6F57`
- Full-width "Sign in" pill button (`#2F6F57`)
- "or continue with" divider (hairline + text)
- Google + Apple outline buttons side-by-side (white bg, `#E5E7EB` border, black text)
- "New to Splyt? **Create account**" footer link (bottom of screen)
- Sign up mode: "Create your account" as page title `28pt Bold`, same field layout

### Home — `src/features/events/EventScreens.tsx` (HomeScreen)

- `main` variant AppScreen
- Page title: "Welcome back" (`28pt Bold`)
- Subtitle: dynamic (e.g., "You are owed across N active events.")
- Hero card (`accent` tone): "MY BALANCE" label, large balance amount, net pill badge, "Across N events · N settlements", "+ New event" primary button + "Join code" secondary button side-by-side
- Two stat cards side-by-side: "Active events" (green calendar icon badge) + "Pending owed" (blue clock icon badge)
- "Your events" section heading + "See all" → navigates to Events tab
- **Event list removed** — moved to Events tab

### Events (new) — `src/features/events/EventsScreen.tsx`

- `main` variant AppScreen
- Page title: "Events"
- Event list rows extracted from HomeScreen: icon badge, event name `17pt Semibold`, avatar stack, time ago label, balance label + amount (green if owed, red if owing, `—` if settled)
- Empty state if no events

### Activity (new) — `src/features/events/ActivityScreen.tsx`

- `main` variant AppScreen
- Page title: "Activity"
- Empty state: "No activity yet" with calm body copy

### EventDashboard — `src/features/events/EventScreens.tsx`

- `detail` variant AppScreen
- Header: back button left, "Add expense" pill button right
- Page title: event name `28pt Bold`
- Subtitle: description or "Shared expense workspace"
- Hero card (`accent` tone): event icon + name row + "Live · day N" status badge + member count, "TOTAL SPENT" label, large amount + "across N expenses", YOU PAID / YOUR SHARE / NET metrics row
- 4-button shortcut row: Expense, Invite, Settle, Fund — each as an icon-over-label tile
- "Recent expenses" section heading + "See all"
- Expense list rows: icon badge, title, payer + time meta, amount right-aligned
- Delete event button (text link, danger color, bottom)

### CreateEvent — `src/features/events/EventScreens.tsx`

- `detail` variant AppScreen
- Page title: "Create event"
- Inputs: Event name, Description (multiline)
- "Choose an icon" section: `3×3` icon grid, each tile `#F1F7F3` bg, selected tile `#2F6F57` bg + white icon/label, `16pt` radius
- Currency row: selectable row style showing "Philippine Peso" + "PHP · ₱" badge
- Full-width "Create event" primary button at bottom

### Members — `src/features/events/EventScreens.tsx`

- `detail` variant AppScreen
- Page title: "Members", subtitle "N people · [Event name]"
- "+ Add member" primary button + "Invite link" secondary button row
- Member list rows: `AppAvatar` (colored initials) + name + role label + balance amount (green/red) or status pill (Invited = blue, Owner badge = dark green)
- Invite code flow: greenTint card showing "EVENT CODE" label + large code + expiry + Copy/Share buttons

### AddExpense — `src/features/expenses/AddExpenseScreen.tsx`

- `detail` variant AppScreen
- Page title: "Add expense"
- Hero card (`accent` tone): "AMOUNT" label + large `₱` amount display + PHP pill + Personal/Fund pill
- "What's it for?" input with document icon prefix
- "Note" multiline input
- "Paid by" selector row (avatar + name + chevron)
- "Split between" section with per-member rows: checkbox + avatar + name + split amount

### Balances — `src/features/balances/BalanceScreens.tsx`

- `detail` variant AppScreen
- Page title: "Balances", subtitle "[Event] · N active members"
- Hero card (`accent` tone): TOTAL OWED amount + SETTLEMENTS count
- "Per member" section: rows with `AppAvatar` + name + "is owed"/"owes" label + amount (green positive, red negative) + colored progress bar
- "View settlement" primary button at bottom

### Settlement — `src/features/balances/BalanceScreens.tsx`

- `detail` variant AppScreen
- Page title: "Settle up"
- Hero card (dark green `#2F6F57` bg, white text): "N PAYMENTS to settle [Event]" + shuffle icon
- Instruction rows: from avatar → to avatar + name labels + amount + "Mark paid" black button or "Paid" green pill

### CentralFund — `src/features/funds/CentralFundScreen.tsx`

- `detail` variant AppScreen
- Page title: "Central fund", subtitle "A shared pot for the group."
- Balance card (`accent` tone): "BALANCE" label + large amount + "[contributed] contributed · [spent] spent" + progress bar (green fill, gray track)
- "+ Contribute" primary button + "Spend from fund" secondary button row
- "Contributions" section: rows with `AppAvatar` + name + date + green amount
- "Spent from fund" section: rows with icon + expense name + date + red amount

### Settings — `src/features/settings/SettingsScreen.tsx`

- **`main` variant AppScreen** (promoted to top-level, gradient header with "Settings" + bell + avatar)
- Profile card: large `AppAvatar` (48pt) + name `17pt Semibold` + email `15pt` + "Trusted" dark green badge + edit icon right
- Section labels: "PREFERENCES", "ACCOUNT", "SPLYT" — `12pt Medium #6B6B6F` uppercase category headers
- Grouped rows inside white cards: icon (greenTintSoft circle bg) + label + value/chevron
- "Sign out" row: danger red `#E74C3C` text

---

## 6. Files changed

| File | Change type |
|---|---|
| `src/theme/tokens.ts` | Full rewrite |
| `src/components/ui/styles.ts` | Full rewrite |
| `src/components/ui/AppScreen.tsx` | Full rewrite |
| `src/components/ui/AppCard.tsx` | Update tones |
| `src/components/ui/AppButton.tsx` | Update variants + sizes |
| `src/components/ui/AppInput.tsx` | Add icon prefix, update styles |
| `src/components/ui/AppAvatar.tsx` | New component |
| `src/components/ui/AppTabBar.tsx` | New component |
| `src/components/ui/ui.tsx` | Export new components |
| `src/app/navigation.tsx` | Add tab bar + EventsScreen + ActivityScreen routing |
| `src/features/auth/AuthScreen.tsx` | Full redesign |
| `src/features/events/EventScreens.tsx` | Update all screens |
| `src/features/events/EventsScreen.tsx` | New screen |
| `src/features/events/ActivityScreen.tsx` | New screen |
| `src/features/events/EventScreenComponents.tsx` | Update components |
| `src/features/events/EventScreenStyles.ts` | Full rewrite |
| `src/features/expenses/AddExpenseScreen.tsx` | Update layout |
| `src/features/balances/BalanceScreens.tsx` | Update layout |
| `src/features/funds/CentralFundScreen.tsx` | Update layout |
| `src/features/settings/SettingsScreen.tsx` | Update layout |

**New dependency:** `react-native-linear-gradient` (requires `pod install` + native rebuild)

---

## 7. Out of scope

- Forgot password / reset password flow (shown in screenshots but no backend support yet)
- QR code scanner on Join event
- Google / Apple OAuth (UI shell only on auth screen)
- Activity feed data (ActivityScreen is a placeholder)
- "Mark paid" settlement action (UI only, no backend mutation)
- Dynamic type / accessibility scaling
