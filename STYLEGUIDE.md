# Splyt Mobile Style Guide

A calm, iOS-inspired design system for a shared-expense mobile app. The aesthetic is **elegant, minimal, and trust-building**: a soft green gradient header anchors every screen, a white body container with rounded top corners floats over it, and content lives in roomy white cards with generous whitespace. Inspired by the *My Wisdom* healthcare reference and adapted to Splyt's expense-tracking context.

---

## 1. Visual Signature (Read This First)

Every authenticated screen in Splyt follows the same three-zone structure. This is the single most important rule in the guide — get this right and the rest cascades naturally.

```
┌──────────────────────────────────┐
│  Green gradient header           │  ← Zone 1: Header (gradient bg)
│  ┌──────┐                  ┌──┐  │     • Logo + page/user name (left)
│  │ Logo │ Page name    🔔 │👤│  │     • Notification bell + avatar (right)
│  └──────┘                  └──┘  │
├╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┤
│ ╭──────────────────────────────╮ │  ← Zone 2: Body container
│ │                              │ │     • White (#FFFFFF) or light gray (#F4F5F6)
│ │  Page Title                  │ │     • Rounded top corners only (24pt)
│ │                              │ │     • Full screen width
│ │  ┌────────────────────────┐  │ │     • Overlaps header by ~16pt
│ │  │ Card                   │  │ │
│ │  └────────────────────────┘  │ │  ← Zone 3: Cards
│ │                              │ │     • White, 16-20pt radius
│ │  ┌────────────────────────┐  │ │     • Soft shadow
│ │  │ Card                   │  │ │     • 16pt internal padding
│ │  └────────────────────────┘  │ │
│ │                              │ │
│ ├──────────────────────────────┤ │
│ │  🏠   📡   👥   ⚙️           │ │  ← Bottom tab bar (when applicable)
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

**Pre-auth screens** (Sign in, Sign up) are the exception — they skip the gradient header and use a plain white background with a large `Splyt` wordmark, since the user has no identity yet.

---

## 2. Color System

### Primary Greens

| Token | Hex | Usage |
|---|---|---|
| `--green-primary` | `#2F6F57` | Primary buttons, header gradient start, brand wordmark |
| `--green-secondary` | `#3E8C6A` | Header gradient end, hover/pressed states |
| `--green-accent` | `#22C55E` | Active badges, success indicators |
| `--green-tint` | `#E8F2EC` | Card backgrounds for hero/highlight cards (e.g., the "Sign in" panel, the active-events panel) |
| `--green-tint-soft` | `#F1F7F3` | Subtle fills on icon backgrounds, chart bars |

### Header Gradient

```css
background: linear-gradient(180deg, #2F6F57 0%, #3E8C6A 100%);
```

The gradient runs **top to bottom** and extends behind the status bar. Status bar text is white on this background.

### Neutrals

| Token | Hex | Usage |
|---|---|---|
| `--bg-app` | `#F4F5F6` | App background visible behind cards inside the body container |
| `--surface` | `#FFFFFF` | Cards, body container, input fields |
| `--divider` | `#E5E7EB` | Hairlines, input borders, separators |
| `--text-primary` | `#1C1C1E` | Headings, primary content |
| `--text-secondary` | `#6B6B6F` | Subtitles, captions, helper text |
| `--text-on-green` | `#FFFFFF` | Text on the gradient header and primary buttons |

### Semantic & Accents

| Token | Hex | Usage |
|---|---|---|
| `--success` | `#4CAF50` | Confirmation states (rarely used — the greens cover most of this) |
| `--danger` | `#E74C3C` | Risk badges, "Risk!" status, emergency button, unread red dot |
| `--info` | `#3B82F6` | Pending badges, unread blue dots, informational icons |
| `--warning` | `#F59E0B` | Reserved for future use |

### Button Color Convention

- **Primary (filled green)** — `--green-primary` background, white text. Use for the main affirmative action: *Sign in*, *Create event*, *Add expense*.
- **Primary (filled black)** — `#1C1C1E` background, white text. Reserved for utility CTAs that aren't brand-affirmative: *Invite user*, *Add sensor*, *Dismiss* on notification cards. Both styles appear in the inspiration set; pick black when the action is neutral/operational rather than brand-forward.
- **Secondary (outlined)** — White background, `--green-primary` text, 1px `--divider` border. Use for *Switch to sign up*, *Join by code*, *Cancel*.
- **Destructive** — `--danger` background, white text. Reserved for *Emergency* and irreversible actions.

---

## 3. Typography

### Font Family

```css
font-family: -apple-system, "SF Pro Text", "SF Pro Display", "Inter", system-ui, sans-serif;
```

iOS uses SF Pro automatically via `-apple-system`. Inter is the cross-platform fallback.

### Type Scale

| Role | Size | Weight | Line height | Example |
|---|---|---|---|---|
| Display | 32pt | 700 Bold | 1.2 | "Splyt" wordmark on sign-in |
| Page Title | 28pt | 700 Bold | 1.25 | "Hi, test", "Bora", "Create event" |
| Section Title | 20pt | 600 Semibold | 1.3 | "Your events", "Dashboard", "Trusted Circle" |
| Card Title | 17pt | 600 Semibold | 1.35 | "My balance", "Latest Activity", "Bora" (in event card) |
| Body | 15pt | 400 Regular | 1.45 | Card descriptions, form labels' values |
| Body Strong | 15pt | 600 Semibold | 1.45 | Important inline values like "₱0.00" amounts |
| Label | 13pt | 500 Medium | 1.4 | Field labels: "Event name", "Email", "Members" |
| Caption | 12pt | 500 Medium | 1.4 | Timestamps, helper text, "Tap for details" |
| Button | 16pt | 600 Semibold | 1 | All button labels |

### Rules

- Headings are tight (1.2–1.3 line height); body text is loose (1.4–1.5).
- Bold is used **only** for titles and money amounts — never for emphasis inside body copy.
- Numbers in cards (the "21h", "₱0.00", "5:32 AM" type) sit one weight heavier than their label and one size larger.
- Never use all-caps except for the currency pill ("Currency: PHP" stays sentence case — this is a deliberate departure from the all-caps trap).

---

## 4. Spacing

8pt grid, no exceptions.

| Token | Value | Where |
|---|---|---|
| `--space-xs` | 4pt | Icon ↔ adjacent text inside a pill |
| `--space-sm` | 8pt | Between a label and its input field |
| `--space-md` | 16pt | Default card padding, gap between stacked cards, screen horizontal margin |
| `--space-lg` | 24pt | Gap between major sections (header → first card, card group → next group) |
| `--space-xl` | 32pt | Top of body container after the title, bottom safe-area buffer |
| `--space-2xl` | 48pt | Reserved for empty-state spacing |

### Layout rules

- **Screen horizontal margin: 16pt.** Cards align to this margin on both sides.
- **Card internal padding: 16pt** for compact cards (list rows), **20pt** for hero cards (the green-tint summary card on the event detail screen).
- **Vertical gap between cards in the same group: 12pt.** Between groups: 24pt.
- **Body container top padding: 24pt** before the page title, then 16pt between title and first card.

---

## 5. The Header (Zone 1)

The defining element. Three variants based on screen depth.

### 5.1 Standard header (top-level screens)

Used on Home, Sensors, Trusted Circle, Settings — anywhere the bottom tab bar is visible.

- **Background:** Linear gradient `#2F6F57 → #3E8C6A`, top to bottom.
- **Height:** 56pt of content area + status bar inset above.
- **Left:** Logo (24pt) + page or app name in white, 18pt Semibold. Logo and text are 8pt apart.
- **Right:** Notification bell (44pt circular tap target, white icon on translucent white circle `rgba(255,255,255,0.15)`) followed by user avatar (32pt circle), 12pt apart.
- **Notification badge:** Red dot with white number (e.g., "12") sits on the bell's top-right, 16pt diameter, 11pt bold white text.
- **Status bar:** White text/icons (light content style).

### 5.2 Detail header (sub-screens)

Used on Mike Smith profile, Expected activity, event detail (Bora), Create event.

- Same gradient background but **shorter** — the gradient only fills the status bar area and ~16pt below, then the body container's white takes over.
- **Back button:** 36pt circular white button with `<` chevron in `--green-primary`, top-left at 16pt margin.
- **No logo, no avatar, no bell.** Page title moves into the body container instead.
- An optional trash/delete icon (same circular treatment) can appear top-right for destroy actions.

### 5.3 No header (auth screens)

Sign in / Sign up screens have no gradient. Plain `--surface` background, the wordmark "Splyt" sits as the page title at 32pt Bold, top-left at 16pt margin from screen edges.

---

## 6. The Body Container (Zone 2)

The large white panel that hosts content. This is the second part of the visual signature.

- **Background:** `--surface` (`#FFFFFF`) on most screens. On screens with grouped content (Settings, Trusted Circle list), the body uses `--bg-app` (`#F4F5F6`) so that white cards sit visibly on top of it.
- **Top corners:** 24pt radius. Bottom corners: 0 (flush to screen bottom or to the tab bar).
- **Position:** Overlaps the header by ~16pt, creating the "card lifting off the gradient" effect.
- **Shadow:** None — the contrast with the green header is enough separation.
- **Internal padding:** 16pt horizontal, 24pt top (before the page title).

### Page title placement

The page title (`Dashboard`, `Settings`, `Sensors`, `Trusted Circle`) lives **inside** the body container, not in the header. It sits at the top of the white area in 28pt Bold, left-aligned, with 16pt of breathing room below before the first card.

---

## 7. Cards (Zone 3)

The core content unit.

### 7.1 Standard card

- **Background:** `--surface`
- **Radius:** 16pt
- **Padding:** 16pt all sides
- **Shadow:** `0 4px 16px rgba(0, 0, 0, 0.06)` — soft, low-opacity, generous blur
- **Border:** None (shadow does the work)

### 7.2 Hero card (tinted)

Used for the primary summary block on a screen — the active events panel on Home, the spending summary on event detail, the green sign-in panel.

- **Background:** `--green-tint` (`#E8F2EC`)
- **Radius:** 20pt
- **Padding:** 20pt
- **Shadow:** None (the tint provides the visual weight)

### 7.3 Stat card (paired)

Two cards side by side, each taking 50% width minus an 8pt gap. Used for "Latest Activity" + "Today's Status", "Members" + "Fund contributed".

- Same as standard card but with a **circular icon badge** in the top-right corner: 32pt circle, `--green-accent` fill (or `--danger` for risk states), white icon.
- Label sits top-left in 13pt Medium `--text-secondary`.
- Value sits below the label in 17pt Semibold `--text-primary`.

### 7.4 List row card

For repeated items in a list (Trusted Circle members, sensor rows, expenses, settings entries).

- 16pt radius, 16pt padding, white background, soft shadow.
- Layout: `[Avatar/Icon] [Title + Subtitle stack] [Trailing element]`
- Trailing element is one of: status pill, chevron `>`, action icon, or a kebab menu `⋮`.

---

## 8. Buttons

| Variant | Height | Radius | Padding | Notes |
|---|---|---|---|---|
| Primary (full-width) | 52pt | 24pt (pill) | 16pt horizontal | Filled green or black |
| Primary (auto-width) | 44pt | 22pt (pill) | 20pt horizontal | "Add sensor", "+ Invite user" |
| Secondary | 52pt or 44pt | matches primary | matches primary | White fill, green text, 1px divider border |
| Icon-only | 36pt × 36pt | 18pt (circular) | n/a | Back button, close `×`, trash |
| Pill / Tag | 28pt | 14pt (full pill) | 12pt horizontal | "Active", "Pending", "Risk", currency pill |

### Standard rules

- All primary CTAs are **fully rounded pills** (radius = height ÷ 2). This is non-negotiable — sharp-cornered buttons are off-brand.
- Icons inside buttons sit **left** of the label with 8pt gap.
- Disabled state: 40% opacity on the entire button. No separate disabled color.
- Pressed state: scale to 0.98 over 150ms with ease-out.

---

## 9. Form Inputs

- **Height:** 48pt
- **Radius:** 14pt
- **Background:** `--bg-app` (`#F4F5F6`) — slightly off-white so it reads as an input even without a border on a white card.
- **Border:** None by default; 1.5px `--green-primary` on focus.
- **Padding:** 14pt horizontal.
- **Placeholder:** `--text-secondary`, same size as input text (15pt Regular).
- **Label:** Sits above the input, 13pt Medium `--text-secondary`, 8pt gap to input.

### Special inputs

- **Time pickers** (Expected activity screen) are pill-shaped — 44pt height, fully rounded.
- **Multi-line description** uses 88pt min-height, same radius and fill as single-line inputs.
- **Trash icon** for removable rows: 44pt circular `--bg-app` button with `--text-secondary` icon, sits at row's right end.

---

## 10. Pills & Badges

Fully rounded, used for status communication.

| Type | Background | Text color | Example |
|---|---|---|---|
| Active | `--green-accent` | white | "Active" sensor/user status |
| Pending | `--info` | white | Invitation pending |
| Risk | `--danger` | white | "Risk!" status, alert states |
| Trusted | `--green-primary` | white | "Trusted User" badge |
| Currency | white fill, `--divider` border | `--green-primary` | "Currency: PHP" |
| Filter chip | `--bg-app` | `--text-primary` | "Weekly ⌄" date selector |

Padding: 8pt horizontal, 4pt vertical. Text: 12pt Semibold.

---

## 11. Bottom Tab Bar

- **Height:** 64pt + safe-area inset
- **Background:** `--surface` with subtle top shadow `0 -2px 12px rgba(0,0,0,0.04)`
- **Tabs:** 4 maximum — Home, Sensors, Trusted Circle, Settings (Splyt equivalents: Home, Events, Activity, Settings — adapt as needed).
- **Active state:** Icon and label in `--text-primary`, label in 11pt Semibold.
- **Inactive state:** Icon and label in `--text-secondary`, label in 11pt Medium.
- **Icon size:** 24pt, outline style with 2px stroke.
- **No background fill or pill behind the active tab** — the weight change does the job. Keep it minimal.

---

## 12. Notifications & Alerts

In-card layout for alert items (e.g., "Potential fall detected" → Splyt equivalents: "Settlement reminder", "New expense added"):

- **Icon container:** 40pt circle, `--danger` background for urgent / `--info` for informational, white icon inside.
- **Title:** 16pt Semibold `--text-primary`
- **Body:** 14pt Regular `--text-secondary`, max 2 lines
- **Meta line:** 12pt Medium `--text-secondary` — "3:34 PM, 16 Feb · Rear Door Sensor"
- **Unread indicator:** 8pt blue dot (`--info`) at top-right, vertically aligned with the title.

---

## 13. Modals & Bottom Sheets

- **Top corners:** 24pt radius. Bottom corners: 0 (flush to screen edge).
- **Drag handle:** 36pt × 4pt rounded gray bar, centered, 12pt from top.
- **Backdrop:** `rgba(0, 0, 0, 0.4)`
- **Header inside sheet:** Title 22pt Bold left-aligned, close `×` button (36pt circular `--bg-app`) right-aligned, 1pt `--divider` line below.
- **Animation:** 280ms slide up with ease-out.
- **Padding:** 20pt horizontal, 24pt top after handle, 24pt bottom before safe area.

---

## 14. Data Visualization

For the activity bar charts and similar:

- **Bars:** `--green-tint-soft` fill, 12pt corner radius (top corners only — flat-bottom bars).
- **Bar width:** 24pt, gap between bars: 12pt.
- **Gridlines:** None. The single baseline is a 1px `--divider` line.
- **Labels:** 11pt Medium `--text-secondary` below each bar, no axis line.
- **No legends, no titles inside the chart** — that metadata lives in the card's header.

---

## 15. Iconography

- **Style:** SF Symbols equivalent — outline, 1.75pt stroke, rounded line-caps.
- **Default size:** 20pt inline, 24pt for tab bar, 16pt inside pills.
- **Color:** Inherits text color by default. Filled circular icons inside cards use white on `--green-accent` or `--danger`.
- **Avoid filled / glyph-style icons** except where explicitly called out (notification bell, trash, the airplane in the event icon picker).

---

## 16. Motion

| Action | Duration | Easing |
|---|---|---|
| Button press | 150ms | ease-out |
| Card / list expand | 240ms | ease-in-out |
| Modal slide-up | 280ms | ease-out (cubic-bezier(0.16, 1, 0.3, 1)) |
| Page transition | 300ms | ease-in-out |
| Toggle / state change | 200ms | ease-in-out |

Avoid bounce, spring, or anything > 350ms. The app's tone is calm and confident.

---

## 17. Accessibility

- **Contrast:** All text on white must hit WCAG AA (4.5:1) — `--text-secondary` (`#6B6B6F`) on white is 4.6:1 ✓.
- **Tap targets:** Minimum 44pt × 44pt for any interactive element, even when the visible glyph is smaller.
- **Dynamic type:** The Settings screen exposes Standard / Enhanced / Maximized — all type tokens must scale proportionally.
- **Color independence:** Status pills always pair color with a label (never a bare green dot to mean "active").
- **VoiceOver:** Every icon-only button needs an accessible label.

---

## 18. Splyt-Specific Adaptations

These are the conventions that diverge from the generic *My Wisdom* reference and are specific to Splyt.

- **Currency display:** Always prefix with the symbol attached to the number, no space: `₱0.00`, not `₱ 0.00`. Use 28pt Bold for hero amounts, 17pt Semibold for inline amounts.
- **Event icons:** The grid in the Edit event modal is the canonical icon set — Classic, Trip, Flight, Beach, Food, Party, Work, Home, Gift. Each tile is 96pt × 96pt, 16pt radius, `--green-tint-soft` fill, with the selected state filled in `--green-primary` and white icon/label.
- **Members chip:** Stacked overlapping avatars (24pt each, 8pt overlap) followed by a "+N" pill when the count exceeds 3.
- **Empty / zero states:** When a value is `0` or `0.00`, still show it in full type weight — never gray it out. The "No payments needed right now" line is the right tone: factual, calm, present-tense.
- **Auth screens:** The "Splyt" wordmark is the only place the brand name appears at display size. Once authenticated, the page title (Hi, test / Bora / Settings) replaces it — the wordmark does not return until logout.

---

## 19. Component Checklist for Codex

When updating a screen, verify in this order:

1. **Header zone** — Is there a green gradient with logo + page/user name on top-level screens, or a back-button-only header on detail screens, or no header on auth screens?
2. **Body container** — Does the white (or `--bg-app`) panel have 24pt top-rounded corners and overlap the header?
3. **Page title** — Is it inside the body container at 28pt Bold, not in the header?
4. **Cards** — 16pt radius, 16pt padding, soft shadow, no border?
5. **Primary button** — Pill-shaped (radius = height ÷ 2), green or black fill?
6. **Inputs** — `--bg-app` fill, 14pt radius, 48pt height, label above?
7. **Pills** — Fully rounded with the right semantic color?
8. **Spacing** — 16pt screen margin, 12pt between cards in a group, 24pt between groups?
9. **Type** — 28pt Bold page titles, 17pt Semibold card titles, 15pt body, 13pt labels?
10. **Tab bar** (if present) — 4 tabs max, no background pill on active, weight-only emphasis?

If all ten check out, the screen is on style.

---

## 20. Summary

The Splyt aesthetic is **a calm green gradient header, a white card lifting off it with rounded top corners, and roomy content cards with soft shadows**. Type is iOS-native (SF Pro), spacing is on an 8pt grid, buttons are pill-shaped, and color is used semantically — green for affirmative, black for utility, red for risk, blue for pending. Strip anything that adds visual noise; every element earns its place.