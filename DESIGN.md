---
name: Splyt
description: A warm, unhurried expense ledger for groups who split the trip, not the friendship.
colors:
  settled-forest: "#2F6F57"
  canopy: "#3E8C6A"
  signal-green: "#22C55E"
  sage-wash: "#E8F2EC"
  morning-wash: "#F1F7F3"
  paper-gray: "#F4F5F6"
  surface-white: "#FFFFFF"
  hairline: "#E5E7EB"
  receipt-ink: "#1C1C1E"
  faded-ink: "#6B6B6F"
  danger-clay: "#E74C3C"
  info-blue: "#3B82F6"
  success-green: "#4CAF50"
  warning-amber: "#F59E0B"
  danger-text: "#B3261E"
  info-text: "#1D4ED8"
  success-text: "#15803D"
  warning-text: "#B45309"
typography:
  display:
    fontFamily: "System, SF Pro, Roboto, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: "38px"
  amount:
    fontFamily: "System, SF Pro, Roboto, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: "36px"
  page-title:
    fontFamily: "System, SF Pro, Roboto, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: "35px"
  section-title:
    fontFamily: "System, SF Pro, Roboto, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "26px"
  card-title:
    fontFamily: "System, SF Pro, Roboto, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: "23px"
  button:
    fontFamily: "System, SF Pro, Roboto, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "16px"
  body:
    fontFamily: "System, SF Pro, Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "22px"
  body-strong:
    fontFamily: "System, SF Pro, Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: "22px"
  label:
    fontFamily: "System, SF Pro, Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: "18px"
  caption:
    fontFamily: "System, SF Pro, Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "17px"
rounded:
  sm: "8px"
  md: "14px"
  lg: "16px"
  xl: "20px"
  xxl: "24px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.settled-forest}"
    textColor: "{colors.surface-white}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "48px"
  button-primary-pressed:
    backgroundColor: "{colors.settled-forest}"
    textColor: "{colors.surface-white}"
  button-secondary:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.settled-forest}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "48px"
  button-black:
    backgroundColor: "{colors.receipt-ink}"
    textColor: "{colors.surface-white}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "48px"
  button-destructive:
    backgroundColor: "{colors.danger-clay}"
    textColor: "{colors.surface-white}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "48px"
  card:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.receipt-ink}"
    rounded: "{rounded.lg}"
    padding: "16px"
  card-accent:
    backgroundColor: "{colors.sage-wash}"
    textColor: "{colors.receipt-ink}"
    rounded: "{rounded.xl}"
    padding: "24px"
  input:
    backgroundColor: "{colors.paper-gray}"
    textColor: "{colors.receipt-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "48px"
  input-focused:
    backgroundColor: "{colors.paper-gray}"
    textColor: "{colors.receipt-ink}"
  pill-default:
    backgroundColor: "{colors.morning-wash}"
    textColor: "{colors.settled-forest}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "4px 8px"
  pill-accent:
    backgroundColor: "{colors.settled-forest}"
    textColor: "{colors.surface-white}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "4px 8px"
  pill-outline:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.receipt-ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "4px 8px"
  app-header:
    backgroundColor: "{colors.settled-forest}"
    textColor: "{colors.surface-white}"
    padding: "16px 16px 32px"
  body-container:
    backgroundColor: "{colors.paper-gray}"
    textColor: "{colors.receipt-ink}"
    rounded: "{rounded.xxl}"
    padding: "24px 16px 32px"
  tab-bar:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.faded-ink}"
    height: "64px"
  toast:
    backgroundColor: "{colors.receipt-ink}"
    textColor: "{colors.surface-white}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.pill}"
    padding: "8px 24px"
---

# Design System: Splyt

## Overview

**Creative North Star: "The Shared Table"**

Splyt is what the group gathers around when the trip is over and the receipts come out. The system is built to feel like a table, not a bank: a deep forest-green header holds the top of every screen like a placemat, and a large pale panel slides up over it with rounded shoulders, carrying white cards that sit on the surface with almost no shadow. Nothing is dense, nothing is stacked tightly, and nothing shouts. The money is the loudest thing on any screen, and everything else stands back so it can be read at a glance, one-handed, in a hotel lobby at midnight.

The register is **calm, unhurried, trustworthy, and precise**. Precision here means legibility, not density: the system spends whitespace freely (8pt grid, 16pt screen margins, 12–16pt between cards) because a group arguing about who paid for dinner does not need a spreadsheet, it needs one clear number. Green is the identity, but it is rationed — the header, primary actions, focus rings, and selected states own it, and everything else is ink on paper. Components are **tactile and confident**: a press should feel like it landed, surfaces should feel like objects with weight, and state changes should be felt, not just seen.

The confirmed anti-reference is **Splitwise's dense list UI**. Splyt never turns into rows of hairline-separated text at the same size and weight. Each meaningful thing gets a card, a tap target, and room to breathe. The second thing it must never become is amateur — the palette is disciplined, the type scale is fixed, and the polish must read as professional and clean rather than decorated.

**Key Characteristics:**
- Three-zone architecture on every authenticated screen: flat green header → lifted body container → white cards
- Deep forest green (`#2F6F57`) as the only brand voice; everything else is ink, paper, and one signal green
- System fonts on both platforms — no custom typeface, no brand font to load
- Tonal layering over shadows; depth comes from white-on-gray, not from lift
- Money is always the largest, heaviest element in its section
- Icons are a single family (Material Community Icons), always outline variants
- Page titles live inside the body container, never in the header

## Colors

A single disciplined green, two washes of it, and an otherwise neutral paper-and-ink field. The palette reads as natural and settled rather than financial or clinical.

### Primary
- **Settled Forest** (`#2F6F57`): The brand. Header background, primary button fill, input focus border, selected-state fills, active selection marks, section-heading detail links, and the icon tone for accented actions. This is the only color allowed to represent Splyt itself.
- **Canopy** (`#3E8C6A`): A lighter sibling of the brand green, currently unused. It survives as a token for pressed states on green surfaces; it is not a background in its own right.

### Secondary
- **Signal Green** (`#22C55E`): Deliberately brighter and more digital than Settled Forest. Reserved for live status — the "active event" hero badge, positive stat-card icon badges, and success pills. Its brightness is what makes a state read as *live now*; using it as a general green destroys that.
- **Sage Wash** (`#E8F2EC`): The hero/highlight card fill. The one large tinted surface in the system — the summary card at the top of an event, the selected state of a selectable row.
- **Morning Wash** (`#F1F7F3`): Barely-there green for small fills: icon badges behind event icons, default pill backgrounds, action-tile icon squares.

### Neutral
- **Receipt Ink** (`#1C1C1E`): All primary text — titles, amounts, body copy. Also the fill for black utility buttons and the toast. Never pure black.
- **Faded Ink** (`#6B6B6F`): Labels, captions, timestamps, helper text, placeholder text, inactive tab labels, muted icons.
- **Paper Gray** (`#F4F5F6`): The canvas. App background, the body container fill, input field fills, and selectable-row backgrounds. White cards read as raised because they sit on this.
- **Surface White** (`#FFFFFF`): Cards, the tab bar, secondary button fills, auth screen backgrounds, and all text on green.
- **Hairline** (`#E5E7EB`): Secondary button borders, tab bar top edge, unselected selection marks, dividers. Used sparingly — this system separates with space, not lines.

### Semantic
- **Danger Clay** (`#E74C3C`): Reserved for fills and borders where 3:1 is the bar — input error borders.
- **Info Blue** (`#3B82F6`): Informational stat-card icon badges and pending/neutral status pills, always with Receipt Ink on top.
- **Success Green** (`#4CAF50`) and **Warning Amber** (`#F59E0B`): Defined but nearly unused. Signal Green covers most success cases; amber is reserved.

### Accessible text variants

The bright semantic colors are fills, not text. Each has a darkened sibling that clears 4.5:1 on white, Paper Gray, and Sage Wash, and these are the only versions allowed to carry a glyph:

- **Danger Text** (`#B3261E`, 6.54:1 on white): error copy, destructive button fills, the unread count, negative balances.
- **Info Text** (`#1D4ED8`, 6.70:1): informational text.
- **Success Text** (`#15803D`, 5.02:1): positive status words and positive amounts.
- **Warning Text** (`#B45309`, 5.02:1): "Upcoming" and "Ended" status words.

### Named Rules

**The Rationed Green Rule.** Settled Forest appears in exactly three places on a screen: the header, the primary action, and the current selection. If a fourth green element appears, one of them is not actually primary.

**The Two Greens Are Not Interchangeable Rule.** Settled Forest means *Splyt*. Signal Green means *live right now*. Swapping them makes brand chrome look like a status and status look like decoration.

**The Ink Over Black Rule.** Text and dark fills use Receipt Ink (`#1C1C1E`), never `#000`. Pure black next to a soft green field reads as a rendering bug.

**The Bright Is A Fill Rule.** Signal Green, Info Blue, Danger Clay, and Warning Amber are fills only. A colored fill carries Receipt Ink on top; text in a semantic color uses that color's darkened text variant. White on `#22C55E` measures 2.28:1 and is banned.

## Typography

**Display / Body / Label Font:** System (`System` on iOS → SF Pro; `sans-serif` on Android → Roboto)

**Character:** One platform-native voice doing every job, differentiated purely by size and weight. This is a deliberate trust decision: financial values in the OS's own typeface read as native and factual, and there is no webfont to fail to load on a hotel connection. The scale is tight (32 / 30 / 28 / 20 / 17 / 15 / 13 / 12) and every step earns its place.

### Hierarchy
- **Display** (700, 32pt, 38pt line): The `Splyt` wordmark on the auth screens. Nothing else.
- **Amount** (700, 30pt, 36pt line; scaled to 36pt on hero cards): Currency values that are the answer to the screen's question — total spend, balance owed, fund total.
- **Page Title** (700, 28pt, 35pt line): The screen name, placed inside the body container, left-aligned, with an optional subtitle in Body/Faded Ink beneath it.
- **Section Title** (600, 20pt, 26pt line): Group headings inside a screen ("Your events", "Latest activity"). Also the stat-card value at 24pt/700.
- **Card Title** (600, 17pt, 23pt line): The title of a single card or modal.
- **Button** (600, 16pt, 16pt line): All button labels. Sentence case.
- **Body** (400, 15pt, 22pt line): Descriptions, input text, list copy.
- **Body Strong** (600, 15pt, 22pt line): Inline values inside rows — a member's name, a row amount, a menu item label.
- **Label** (500, 13pt, 18pt line, Faded Ink): Form field labels and stat labels. Uppercase with 0.5pt letter-spacing *only* on the hero card's eyebrow label.
- **Caption** (500, 12pt, 17pt line, Faded Ink): Timestamps, helper text, pill text (at 600), tab labels (at 11pt).

### Named Rules

**The Money Is The Headline Rule.** Within any card or section, the currency value is the largest and heaviest element present. If a label or title outweighs the number, the hierarchy is inverted.

**The Two Steps Rule.** A value sits one size step *and* one weight step above its own label — never one or the other. 13pt/500 Faded Ink label over 15pt/600 or larger Receipt Ink value.

**The No Shouting Rule.** No uppercase anywhere except the hero eyebrow label. Currency codes, statuses, and pills stay sentence case. Bold is for titles and money only, never for emphasis inside a sentence.

## Layout

**The three-zone signature** governs every authenticated screen and is the single most important structural rule:

1. **Header zone** — a flat Settled Forest fill (`#2F6F57`) extending behind the status bar, with light-content status bar text. 16pt horizontal padding, 16pt top / 32pt bottom padding, a 44pt minimum content row. Left holds the brand mark (28pt) plus a name in Body Strong/18pt white, or a 36pt circular back button on detail screens. Right holds the notification bell and a 34pt avatar circle, 8pt apart.
2. **Body container** — Paper Gray, 24pt radius on the top corners only, pulled up `-20pt` so it overlaps the header. This overlap is the system's signature gesture; without it the screens look like generic stacked bars. Content is padded 16pt horizontally, 24pt top, 32pt bottom, with a 16pt gap between children.
3. **Hero band (optional)** — when a screen leads with a summary, it is a full-bleed Sage Wash band at the top of the body container, not an inset card. `AppHeroBand` cancels the scroll padding with negative margins and re-applies it inside, so the fill meets the screen edges while the content still lands on the 16pt margin and aligns with every card below it. It inherits the container's 24pt shoulders by clipping. The result is a tonal descent: Settled Forest → Sage Wash → Paper Gray.
4. **Cards** — white, full-width to the 16pt margin, stacked with 16pt gaps.

**Auth screens are the documented exception:** no header, plain white background, the `Splyt` wordmark at Display size, 16pt horizontal and 32pt vertical padding.

**Spacing** is a strict 8pt grid: 4 / 8 / 16 / 24 / 32 / 48. 16pt is the default for card padding, screen margins, and stacked-card gaps; 24pt is the hero-card padding and the gap between major sections; 8pt is used for side-by-side grid gaps (stat card pairs, action rows).

**Density and reach:** every interactive element clears 44pt (buttons are 48pt, compact 44pt, small 40pt only for inline secondary actions; icon buttons are 36pt visual with the row providing the rest of the target). Content scrolls in a single column; side-by-side is limited to two items and only for stat cards and action tiles. The tab bar is 64pt plus the bottom safe-area inset, and scroll content reserves that space rather than letting cards slide under it.

### Named Rules

**The Flat Header Rule.** The header is a single flat Settled Forest fill. A gradient was tried and reverted: `react-native-linear-gradient` mis-measures the header on this RN version and clips the header row under the status bar. There are no gradients in this system.

**The Lifted Panel Rule.** The body container always overlaps the header by 20pt with 24pt top corners and square bottom corners. It never gains a shadow, a border, or bottom rounding.

**The One Content Margin Rule.** Every piece of content on a screen starts at the same 16pt margin, whatever container it sits in. A tinted section earns its emphasis by bleeding to the screen edges, never by insetting its text further than the text above and below it.

**The Title Lives Below Rule.** The page title belongs inside the body container, not in the green header. The header carries identity and navigation; the body carries content.

**The One Column Rule.** Content is a single scrolling column. Two-up is allowed only for stat cards and action tiles, and never three-up.

## Elevation & Depth

This system is **tonal-first**. Depth comes from stacking value: white cards on a Paper Gray canvas, a Paper Gray panel lifted over a green header, Morning Wash badges inside white cards. Shadows exist but are whisper-soft and strictly ambient — they hint that a card is a separate object, they never simulate physical height. A card's shadow at 6% opacity over a 16pt blur is, by design, almost subliminal; if you can clearly see it, it is wrong.

### Shadow Vocabulary
- **Card ambient** (`0 4px 16px rgba(22, 54, 40, 0.06)`, Android `elevation: 3`): Every white card, stat card, event card, and menu surface. The shadow color is a dark green (`#163628`), not neutral black — it keeps the shadow in the same family as the canvas.
- **Floating** (`0 8px 16px rgba(22, 54, 40, 0.16)`, `elevation: 6`): The toast only. The one element genuinely above the page.
- **Edge** (`0 -2px 12px rgba(22, 54, 40, 0.04)`, `elevation: 8`): The tab bar's upward shadow, paired with a hairline top border.
- **Control** (`0 2px 8px rgba(22, 54, 40, 0.08)`, `elevation: 2`): The white circular back button sitting on the green header, where tone alone cannot separate it.

**Modals** use a `rgba(28, 28, 30, 0.4)` scrim, a bottom sheet with 24pt top corners and 20pt bottom corners, and a 36×4pt Hairline-gray grab handle centered above it.

### Named Rules

**The Green Shadow Rule.** Shadows use `#163628`, never black. A neutral shadow under a green-tinted UI reads as dirt.

**The Tone Before Lift Rule.** To separate two surfaces, change their tone first (white on Paper Gray, Morning Wash on white). Reach for a shadow only when tone cannot do it — which in practice means only the back button and the toast.

## Shapes

Corners are consistently and generously soft, but the radius is not uniform — it scales with the element's size, which is what keeps the softness from reading as childish.

- **8pt (`sm`)**: Small square icon badges (36–40pt) inside rows and tiles.
- **14pt (`md`)**: Buttons, input fields, and the 44pt event icon badge. Buttons are deliberately *less* round than cards — a 48pt button at 14pt reads as a control, not a capsule.
- **16pt (`lg`)**: Standard cards, menu items, selectable rows.
- **20pt (`xl`)**: The Sage Wash hero card and modal bottom corners. The most important surface is also the softest.
- **24pt (`xxl`)**: The body container's top corners and the modal sheet's top corners — the two places where a panel meets the edge of the screen.
- **999pt (`pill`)**: Status pills, avatars, notification dots, selection marks, circular icon buttons, the toast, and the modal handle.

**Borders are the exception, not the rule.** Only four things carry one: secondary buttons (1pt Hairline), focused inputs (1.5pt Settled Forest), errored inputs (1.5pt Danger Clay), and unselected selection marks (1.5pt Hairline). The tab bar uses a hairline-width top edge. Nothing else is outlined.

**Icons** are Material Community Icons, and the shipped set is almost entirely the `-outline` variants (`account-outline`, `bell-outline`, `wallet-outline`). Filled icons appear only where the glyph has no outline form. Standard sizes are 16pt inside buttons and pills, 18pt default, 20pt in the tab bar.

### Named Rules

**The Radius Scales With Size Rule.** Bigger surface, rounder corner. Icon badge 8pt → button 14pt → card 16pt → hero 20pt → screen panel 24pt. Never give a small chip a 24pt radius or a full panel an 8pt one.

**The Outline Icon Rule.** Icons are outline-weight by default. A filled icon in a row of outlined ones reads as a selected state, so never introduce one casually.

## Components

### Buttons
- **Shape:** Softly squared (14pt radius), 48pt tall at default, 44pt compact, 40pt small. Horizontal padding 16pt; content is a centered row with an optional 16pt leading icon and an 8pt gap.
- **Primary:** Settled Forest fill, white label at Button type. The main affirmative action — *Sign in*, *Create event*, *Add expense*. One per screen.
- **Secondary:** White fill, 1pt Hairline border, Settled Forest label. Alternative paths — *Join by code*, *Cancel*, *Switch to sign up*.
- **Black:** Receipt Ink fill, white label. Operational actions that are not brand-affirmative — *Invite user*, *Dismiss*. Choosing black over green is how the system says "useful, not celebratory."
- **Destructive:** Danger Clay fill, white label. Irreversible actions only.
- **Pressed / Disabled:** A spring scale to `0.97` on press-in with `opacity: 0.82`, releasing back to `1`. `opacity: 0.4` when disabled. The scale is what makes the press feel like it landed; opacity alone does not.
- **Loading:** The leading icon is replaced by an `ActivityIndicator` in the label's color; the label stays. The button never collapses to a bare spinner.

### Inputs
- **Style:** Filled, not outlined. Paper Gray fill, 14pt radius, 48pt tall, 16pt horizontal padding, no border at rest. Multiline variants grow from an 88pt minimum with 16pt vertical padding and top-aligned text.
- **Label:** Always present, above the field, Label type in Faded Ink, 8pt gap. There are no placeholder-only fields in this system.
- **Focus:** A 1.5pt Settled Forest border appears. The fill does not change — the border is the entire focus signal, so it must never be removed.
- **Error:** A 1.5pt Danger Clay border plus Caption-size error text in Danger Clay below the field.
- **Prefix icon:** 16pt, muted tone, 8pt before the text.

### Cards
- **Default:** White, 16pt radius, 16pt padding, 16pt internal gap, Card ambient shadow, no border.
- **Accent (hero):** Sage Wash fill, 20pt radius, 24pt padding, **no shadow** — the tint does the separating. Used for a summary nested inside a screen; at the top of a screen, use the hero band instead.
- **Hero band (`AppHeroBand`):** The top-of-screen variant of the accent card. Full-bleed Sage Wash, no radius of its own, 16pt horizontal / 24pt vertical padding. Carries an uppercase Label eyebrow in Settled Forest, the amount at hero size, a meta line in Faded Ink, and up to two actions.
- **Warm:** Paper Gray fill with the standard card shadow, for a card that should recede inside a white parent.
- **Stat card:** Half-width white card with a label row (Label + a 32pt circular Signal Green or Info Blue icon badge) above a 24pt/700 value.

### Pills (`DataPill`)
- **Shape:** Fully rounded, 8pt horizontal / 4pt vertical padding, Caption type at 600, self-aligned to the start.
- **Tones:** `default` (Morning Wash fill, Settled Forest text), `accent` (Settled Forest, white), `success` (Signal Green fill, **Receipt Ink** text), `info` (Info Blue fill, **Receipt Ink** text), `danger` (Danger Text fill, white), `outline` (white fill, Hairline border, Receipt Ink text).
- Pills state facts — status, currency, counts. They are never tappable.

### Money (`MoneyValue`)
The single money display in the app. Every currency value on every screen routes through it, so the same number cannot mean two different things on two screens. It owns four sizes (`hero` 36pt/700, `amount` 30pt/700, `value` 17pt/600, `inline` 15pt/600), tabular figures, and five tones (`default` ink, `positive` Settled Forest, `negative` Danger Text, `muted`, `inverted`). Sign is never carried by the component alone: pair it with `balanceLabel()`, which returns "You owe" / "You're owed" / "Settled up" in words.

### Navigation
- **Tab bar:** White, 64pt tall plus safe-area inset, hairline top border, Edge shadow. Four tabs — Home, Events, Activity, Settings — each a 20pt outline icon above an 11pt label. Active is Receipt Ink at 600; inactive is Faded Ink at 500. **There is no green in the tab bar** and no indicator pill; weight and ink darkness carry the active state.
- **Header navigation:** Detail screens replace the brand block with a 36pt white circular back button (Settled Forest chevron, Control shadow). Destructive or overflow actions go top-right as translucent-white circular icon buttons (`rgba(255,255,255,0.18)`).
- **Menus:** A white card (188pt minimum width, 4pt padding) anchored under its trigger, with 46pt rows at 16pt radius and Body Strong labels.

### Modals
Bottom sheets. Scrim at `rgba(28,28,30,0.4)`, a centered grab handle, a white card with 24pt top / 20pt bottom corners, 24pt padding, 88% maximum height, and a header row holding a 22pt/700 title with a close button opposite. Long content scrolls inside the sheet; the sheet never fills the screen.

### Signature: the three-zone screen (`AppScreen`)
The system's defining component, with three variants. `main` renders the full identity header (brand mark, name, bell, avatar) over the lifted body container. `detail` swaps the identity block for a back button and moves the title into the body. `auth` drops the green entirely for a white, keyboard-aware scroll view. Every screen in the app goes through this component — new screens compose it rather than rebuilding the zones.
## Do's and Don'ts

### Do:
- **Do** build every authenticated screen with `AppScreen`, preserving the flat green header → `-20pt` lifted Paper Gray body → white cards sequence.
- **Do** put the page title inside the body container at Page Title size (28pt/700), with any subtitle in Body/Faded Ink directly beneath it.
- **Do** route every currency value through `MoneyValue`, and state the sign in words with `balanceLabel()` so meaning survives without color.
- **Do** make the currency value the largest and heaviest element in its card, one size *and* one weight step above its label.
- **Do** hold to the 8pt grid — 16pt screen margins, 16pt card padding and gaps, 24pt for hero padding and between major sections.
- **Do** use Settled Forest (`#2F6F57`) as the flat header fill, the single primary action, and the current selection — and stop there.
- **Do** reserve Signal Green (`#22C55E`) for live status, and Info Blue (`#3B82F6`) for neutral/pending status.
- **Do** give every field a visible Label above it, and signal focus with the 1.5pt Settled Forest border.
- **Do** separate surfaces by tone (white on Paper Gray) before reaching for a shadow.
- **Do** use outline-variant Material Community Icons via `AppIcon`, at 16 / 18 / 20pt.
- **Do** keep every tap target at or above 44pt.
- **Do** choose the black button for operational actions and the green button for brand-affirmative ones.

### Don't:
- **Don't** build dense hairline-separated list rows. Splitwise's list UI is the named anti-reference; give each item a card, a target, and space.
- **Don't** put the page title in the green header, add a shadow to the body container, or round its bottom corners.
- **Don't** use pure black (`#000`) for text, fills, or shadows — Receipt Ink (`#1C1C1E`) and shadow green (`#163628`) are the only darks.
- **Don't** introduce a new accent hue. The palette is one green, two washes, one signal green, one blue, one clay.
- **Don't** outline a card. Cards separate by tone and a 6% ambient shadow; borders belong to secondary buttons, focused/errored inputs, and selection marks only.
- **Don't** raise shadow opacity to make a card "pop." If it needs emphasis, change its tone (Sage Wash) or its size, not its lift.
- **Don't** use uppercase anywhere except the hero card's eyebrow label, and don't bold text for emphasis mid-sentence.
- **Don't** load a custom font. Both platforms use their system face deliberately.
- **Don't** put green in the tab bar or add an active-tab indicator; ink weight carries the state.
- **Don't** add a gradient anywhere in the app, including the header. The system is flat fills and tonal layering.
- **Don't** put white text on Signal Green, Success Green, Warning Amber, or Danger Clay — all four measure below 4.5:1. Use Receipt Ink on the fill, or the darkened text variant on a light surface.
- **Don't** inset a tinted section's content past the 16pt screen margin. If a section needs emphasis at the top of a screen, bleed it to the edges with `AppHeroBand` rather than nesting a padded card inside a padded container.
- **Don't** stack more than two items side by side.
