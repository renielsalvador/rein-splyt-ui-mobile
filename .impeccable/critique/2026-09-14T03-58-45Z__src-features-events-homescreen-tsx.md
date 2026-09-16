---
target: Home, event dashboard and add expense screens
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 3
target_identity: "file:/Users/rensalvador/projects/splyt/rein-splyt-ui-mobile/src/features/events/HomeScreen.tsx"
target_fingerprint: "sha256:e2e9e0a4003ef96f01b61e669083028f4115e7d13d766ff2dd8357dc2f1160bc"
target_path: /Users/rensalvador/projects/splyt/rein-splyt-ui-mobile/src/features/events/HomeScreen.tsx
timestamp: 2026-09-14T03-58-45Z
slug: src-features-events-homescreen-tsx
---
Method: dual-agent (A: design-review subagent · B: detector + platform-evidence subagent). Isolated, parallel; neither saw the other before synthesis.

# Critique — Home → Event dashboard → Add expense

Targets: src/features/events/HomeScreen.tsx, src/features/events/EventScreens.tsx (+EventScreenComponents/Styles), src/features/expenses/AddExpenseScreen.tsx. Mode: Operate. Platform: React Native (iOS/Android).

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Un-hydrated trip cards render ₱0.00 at 30pt (HomeScreen.tsx#L404); no skeletons, no pull-to-refresh, no offline state |
| 2 | Match System / Real World | 3 | "You're owed"/"Day 6 of 6" excellent; "Active/Inactive" is a DB column with a switch attached |
| 3 | User Control and Freedom | 2 | Good unsaved-work guard; no swipe-back gesture, no transition animation (navigation.tsx#L108) |
| 4 | Consistency and Standards | 1 | 20 concrete divergences from DESIGN.md's own named rules |
| 5 | Error Prevention | 2 | Fund overdraw guard excellent; required Title below the fold; "1.2.3" coerces to 0 (format.ts#L75) |
| 6 | Recognition Rather Than Recall | 3 | Payer/participants/source all visible; "Active" header vs "Ongoing" card = two status models |
| 7 | Flexibility and Efficiency | 3 | Inline Add expense on the trip card is the best decision here; no search/filter/sort at 15+ events |
| 8 | Aesthetic and Minimalist Design | 2 | High surface craft, weak composition; dashboard ends on a loose red text link on bare canvas |
| 9 | Error Recovery | 2 | Global error renders as last child of the scroll view, behind the sticky footer (AddExpenseScreen.tsx#L579) |
| 10 | Help and Documentation | 1 | Central fund explained by one 12pt caption, shown after you pick it |
| **Total** | | **21/40** | **Needs work** |

## Design Specificity Verdict

Partially authored — specific at the center (central fund: segmented Personal/Central-fund choice, live pool math, overdraw guard with both recovery paths, the OpenTripCard that compresses day-of-trip + total + your position + last expense + add expense into one object), generic at the edges (green header, lifted gray panel, white cards, 4-up icon tiles, black pill CTA, avatar stack). The tell: the differentiator is invisible on Home — the trips list shows "Total tracked", exactly what Splitwise shows.

Deterministic scan: `impeccable detect --json` returned 0 findings / exit 0 on all four targets, verified with --no-config and no inline disables. This is a FALSE NEGATIVE: the detector's non-HTML mode is regex/web-token oriented and caught none of the 60+ off-scale RN StyleSheet literals or the 16 raw hex avatar colors found by manual sweep.

Visual overlays: not applicable (native RN, no viewable URL). Platform evidence: iPhone 17 Pro Max iOS 26.5 simulator capture at /tmp/impeccable-critique-current.png corroborates both structural findings.

## Overall Impression

Not a consistency problem — an adoption problem. The design system exists and the screens are hand-rolled next to it. AppHeroBand: 0 call sites. ActionTile: 0 call sites. AppMenu: 0 call sites. HomeScreen: 0 AppCards. Event dashboard: 0 MoneyValues. Biggest opportunity is deleting ~600 lines of bespoke StyleSheet and routing through what already exists.

## What's Working

1. OpenTripCard's inline "Add expense" (HomeScreen.tsx#L474) — collapses the core loop to 4 taps, removes a navigation transition from the critical path.
2. The central-fund overdraw guard (AddExpenseScreen.tsx#L386) — prevents rather than reports, shows the arithmetic, offers both recovery paths in one sentence.
3. MoneyValue + balanceLabel() as architecture — tabular figures, fixed tone set, sign stated in words so meaning survives greyscale.

## Priority Issues

### [P0] "Join with a code" is buried at the bottom of scroll, and it is the only door
Index 8 of 8, last child of the scroll view (HomeScreen.tsx#L321), after Now/Upcoming/Ended, outside every .map(), not a list footer, not sticky. No FlatList anywhere in the app (zero matches for FlatList/SectionList/VirtualizedList) — every event mounts eagerly above it. The two join affordances are mutually exclusive: prominent button only when events.length === 0 (#L224); ghost pill only when > 0 (#L322). No second door: no JoinEvent route (navigation.tsx#L23), no join row in AccountSheet, nothing on Activity/Balances, zero Linking handlers, no CFBundleURLTypes. At 15 events ≈ 1,300pt / 3–4 swipes, rendered as the lightest-weight control on screen. Sharpest violation of "nobody is blocked by onboarding."
Fix: widen AppScreen titleAction to titleActions[] (max 2), render Join + New in the title row (AppScreen.tsx#L104) — scroll-order- and count-independent. Delete the hasAnyEvent fork. Add JoinEvent:{code?} route + URL scheme so an invite link pre-fills the code.
Command: $impeccable layout, then $impeccable onboard

### [P0] The same action is green on one screen and black on the next
Add expense = black pill 46pt radii.pill (HomeScreen.tsx#L594); Save expense = green 48pt radii.md (AddExpenseScreen.tsx#L328); "+ New" = black pill 40pt (AppScreen.tsx#L200); Join = outlined ghost pill 46pt. Six button heights app-wide (48/46/44/40/26/~25), two radius languages. DESIGN.md names Add expense as a green primary example.
Fix: delete primaryAction/joinRow/titlePill, route all through AppButton at radii.md and 48/44/40. Rule: green = commits money; black = manages the ledger.
Command: $impeccable polish

### [P1] The event dashboard has no page title, and its hero is inset instead of full-bleed
variant="detail" with no title/subtitle (EventScreens.tsx#L542), then leads with AppCard tone="accent" — content at 40pt from the edge vs 16pt for every card below. AppHeroBand, fully implemented and documented as THE top-of-screen pattern, has zero call sites. Breaks The Title Lives Below Rule and The One Content Margin Rule; also makes the uppercase eyebrow illegal under The No Shouting Rule.
Fix: pass title/subtitle; replace accent AppCard with AppHeroBand.
Command: $impeccable layout

### [P1] The dashboard renders zero MoneyValues, and Home renders ₱0.00 at hero size
Every dashboard amount is raw Text + formatCurrency: fund hero fontSize 34 (EventScreenComponents.tsx#L978 — a fifth money size off the scale), balance card 28, expense rows as a pre-formatted string prop. No tabular-nums, no numberOfLines, no font-scale cap. HomeScreen.tsx#L283 hard-codes a literal ₱, ignoring event.currency — wrong for USD events. Separately, async hydration (#L99) + sum over `expenses ?? []` (#L404) means every un-hydrated card shows ₱0.00 at 30pt under "Total tracked".
Fix: route all amounts through MoneyValue; gate the card amount on a hydrated flag, render an em-dash/shimmer, never a zero.
Command: $impeccable harden

### [P1] Destructive controls are under 44pt, and "Delete event" is the last thing on every trip
dashboardEditButton ≈25pt with a 12pt icon; deleteEventButton ≈38pt, content-hugging; titlePill fixed 40pt; remove-member chip ≈25pt; none carry hitSlop. Peak-end: every scroll to the bottom of a shared-money record ends on "destroy this", a red text link loose on bare gray. testID appears zero times in all of src/. The dashboard header Switch has no accessibilityLabel.
Fix: minHeight 44 (or hitSlop) on all four, 16pt icons minimum, move Delete into the Edit-event modal.
Command: $impeccable audit

## Complaint (a) inventory — 20 divergences from DESIGN.md

1. Four button radii (14 vs 999) — The Radius Scales With Size Rule.
2. Six button heights: 48/46/44/40/26/~25 — "48/44/40 only; everything clears 44pt".
3. Same action two colors: black Add expense vs green Save expense.
4. Money bypasses MoneyValue across the entire dashboard (15 call sites).
5. A fifth money size, fontSize 34 / lineHeight 40 (EventScreenComponents.tsx#L978).
6. Half-point type across Home: 12.5, 13.5, 14.5, 15.5, 18.
7. Card padding 18, gaps 14/13/11/9/2; radii.xl on a plain white card.
8. Two heading components for one job: SectionRule (13.5pt+hairline) vs SectionHeading (20pt).
9. Tinted hero inset at 40pt instead of bled — The One Content Margin Rule.
10. Page title missing on 1 of 3 screens — The Title Lives Below Rule.
11. Four-up action row — The One Column Rule ("never three-up").
12. Six green elements on Home — The Rationed Green Rule ("exactly three").
13. The "Live" chip uses Settled Forest, the identity green — The Two Greens Are Not Interchangeable Rule.
14. Filled glyphs in an outline set (receipt, scale-balance, swap-horizontal, basketball); 3 of 4 dashboard tiles filled — The Outline Icon Rule.
15. DataPill used as a button ("Manage fund", EventScreenComponents.tsx#L612) — "pills are never tappable".
16. Two input languages on Add expense: hand-rolled 64pt amount field with NO focus state vs AppInput 48pt with one.
17. Two footerOverlay styles, one dead; the shipped one's shadow ≈0.096 opacity — hence content scrolling under with no visible boundary.
18. Uppercase outside the hero band — The No Shouting Rule.
19. Six distinct icon sizes on the dashboard alone (28/22/20/16/15/12) vs "16/18/20".
20. A bare RN Switch in the header zone, unlabelled; its label uses c.surface, near-black in dark mode.

DESIGN.md staleness (doc wrong, not code): "no gradients" vs shipped HeaderGradient (four-stop + bloom, navigation.tsx#L198); "four tabs Home/Events/Activity/Settings, 20pt icons, 11pt labels, hairline top border" vs shipped three tabs (Home/Balances/Activity), 24pt icons, 12pt labels, no border, 28pt shoulders; an undocumented dark scheme in tokens.ts#L74 that does break the never-pure-black rule (shadow #000000, scrim rgba(0,0,0,0.6)). Code IS wrong on one point: the tab bar claims outline→filled active state, but Balances and Activity use identical glyphs for both states.

## Persona Red Flags

Maya, 24 (invited friend, first launch): if already added as a placeholder member she has 1 event, so the prominent zero-state Join button never renders for her. Dashboard has no title, an Active toggle she can flip (not owner-gated in UI), and a red Delete event link on a trip she just joined.
Ren, 34 (organiser, one hand, at a counter): must scroll to the mandatory Title field (third card, below fold, forms.ts#L154). Amount field has no focus ring. No swipe-back gesture; every retreat means the top-left corner.
Tito Boy, 61 (member, Large text): maxFontSizeMultiplier set at 1.2/1.3/1.4/1.6 across one tier and absent on every dashboard label and raw money Text; tripName truncates at numberOfLines=1. His answer is the second number at 20pt under a 34pt fund figure that isn't about him.

## Minor Observations

- formatDateRangeLabel returns "No dates" whenever endDate is missing even if a start date exists (format.ts#L39).
- Clipboard imported from react-native core (EventScreens.tsx#L2) — removed from core, will break.
- Dashboard .slice(0,4) recent expenses with an "N total" heading and no "See all".
- setTimeout(goBack, 900) after the save toast; below readable threshold, timer not cleared on unmount.
- bottomInset hardcoded to 34 on iOS (navigation.tsx#L188) — wrong on iPhone SE and Android gesture nav.
- 16 raw hex avatar colors, no token, no dark variant (AppAvatar.tsx#L7).
- AppIcon tone="danger" resolves to #E74C3C — a fill color carrying a glyph, explicitly forbidden.
- EmptyState has no icon and no action.

## Questions to Consider

1. If the central fund is the product, why can't you see it on Home?
2. AppHeroBand, ActionTile and AppMenu are built, documented, and used zero times — wrong pattern or un-refactored screens?
3. Why is Add expense black where speed matters and green where you're already committed?
4. What is the trip word for "Active/Inactive", and does anyone need to set it manually when getEventLifecycle already computes it?
5. The last thing on every trip is "Delete event." What should occupy that position — and why does settling up have no ending screen at all?
