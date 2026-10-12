# Splyt 15-Second Social Ad Design

## Goal

Create a polished 15-second vertical video ad that shows genuine Splyt mobile UI and realistic touch interactions. The ad should quickly communicate that Splyt helps mixed groups—friends, travelers, and roommates—record shared expenses, manage pooled money, understand balances, and settle up.

The primary placements are TikTok, Instagram Reels, and Facebook Reels. The finished ad must remain understandable with sound disabled.

## Deliverables

- One H.264 MP4 at 1080 × 1920 pixels, 30 fps, exactly 15 seconds
- One editable source project and its local assets
- Burned-in captions placed inside common social-platform safe areas
- Upbeat instrumental background music without voice-over
- A clean final frame with the Splyt logo and the line “Splyt it. Settle it.”

## Creative Direction

The video should feel like a concise, realistic app demonstration rather than an abstract product animation. Genuine Splyt screens appear full-height inside a mobile presentation, with visible touch indicators, purposeful taps, short scrolls, and quick editorial cuts. Motion should be confident and readable, not frantic.

The visual treatment follows the existing Splyt brand: teal-led color, light product surfaces, rounded cards, and the current logo assets. Captions use large, high-contrast type and short phrases. Music provides energy, while UI action sounds and subtle transition accents reinforce taps and scene changes.

## Narrative and Timing

### 0.0–2.0 seconds: The problem

- Show the Splyt event list with at least two distinct use cases: “Weekend Trip” and “Apartment.”
- A touch indicator begins moving toward “Weekend Trip.”
- Caption: “Shared costs get messy.”
- The opening frame must immediately read as a mobile app; no long logo intro.

### 2.0–6.0 seconds: Add an expense

- Tap “Weekend Trip.”
- Tap the Expense shortcut.
- Show an expense form already close to completion, enter or reveal “Dinner,” then save.
- Use a short cut or speed ramp so the interaction remains believable without consuming the full ad.
- Caption: “Add expenses in seconds.”

### 6.0–9.0 seconds: Central fund

- Transition to the event dashboard and tap the central-fund card.
- Show the available pooled amount and recent member contributions.
- Use one brief vertical scroll to reveal contribution activity.
- Caption: “Keep group money together.”

### 9.0–12.0 seconds: Balances

- Return to the event dashboard and tap Balances.
- Show an itemized balance view with clear “you owe” and “you’re owed” information.
- Continue to a settlement summary or settlement action.
- Caption: “Know exactly who owes what.”

### 12.0–15.0 seconds: Resolution and brand

- Let the settlement state resolve cleanly, then transition into the Splyt end card.
- End card includes the current Splyt logo, product name, and “Splyt it. Settle it.”
- Hold the final composition long enough to read, targeting at least 1.5 seconds.

## Capture and Editing Approach

Use a hybrid capture workflow:

1. Run the app against its mock backend with deterministic demo data.
2. Capture genuine screens and short interaction segments from a mobile simulator.
3. Assemble selected clips into a precise 15-second timeline.
4. Add editorial touch indicators, captions, zooms, transitions, sound effects, music, and the end card during composition.

This preserves the credibility of a real screen recording while avoiding slow form entry, loading delays, or timing variance in a single continuous take.

If simulator capture is unavailable in the environment, reproduce the same approved sequence using faithful captures of the implemented UI. Any fallback must use the app’s existing components, text, colors, and assets rather than inventing unsupported features.

## Demo Content

Use the following fictional, non-sensitive data:

- Events: “Weekend Trip” and “Apartment”
- Expense: “Dinner”
- Members: Alex, Maya, Sam, and Jordan
- Currency: PHP throughout the “Weekend Trip” event
- Featured expense: “Dinner,” ₱2,400, paid by Alex and split equally
- Central fund: ₱6,000 contributed and ₱4,850 available
- Balances: Alex is owed ₱1,200; Maya owes ₱600; Sam owes ₱600

The UI may contain additional realistic activity, but nothing should distract from the four advertised capabilities.

## Interaction Treatment

- Represent touches with a small translucent circle that expands slightly on contact.
- Keep the pointer stationary only around the moment of action; it should not behave like a desktop cursor.
- Use direct cuts, short push transitions, or subtle zooms between flows.
- Avoid excessive camera movement, decorative particles, or transitions that obscure the UI.
- Preserve legibility: each major feature view should remain visible for roughly two seconds.

## Caption and Safe-Area Rules

- Captions are burned into the video and remain readable without audio.
- Keep essential text and the logo away from the top 180 pixels and bottom 320 pixels, where social-platform overlays commonly appear.
- Avoid the rightmost 160 pixels for essential text because engagement controls may cover it.
- Use high contrast and no more than one short sentence per scene.

## Audio

- Use an upbeat instrumental track suitable for a modern consumer finance utility.
- Do not use voice-over.
- Add restrained tap sounds and transition accents where they improve clarity.
- Music and effects must be licensed for reuse or generated/created specifically for the deliverable.
- The visual narrative and captions remain complete when muted.

## Technical Requirements

- Canvas: 1080 × 1920, 9:16
- Frame rate: 30 fps
- Duration: 15.0 seconds
- Delivery codec: H.264 video with AAC audio in an MP4 container
- Color space: standard Rec. 709 / sRGB-compatible presentation
- No private credentials, real user information, debug overlays, simulator chrome, or development menus in the final export

## Validation

Before delivery:

- Confirm the video duration and dimensions with a media probe.
- Watch the full export with audio and again muted.
- Verify all captions are readable on a phone-sized preview and remain inside safe areas.
- Verify each advertised capability exists in the current app.
- Inspect the opening frame, every scene transition, and the final frame for clipping or visual artifacts.
- Confirm the final end card is held for at least 1.5 seconds.

## Out of Scope

- Voice-over recording
- Actor footage or lifestyle stock footage
- Multiple aspect-ratio variants
- App Store or Play Store badges
- Claims about payment transfer, bank connectivity, or other capabilities not implemented by Splyt
