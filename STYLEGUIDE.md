# Splyt Mobile Style Guide

**Superseded by [DESIGN.md](DESIGN.md).**

The visual system now lives in `DESIGN.md` at the project root, extracted from the
shipped code in `src/theme/tokens.ts` and `src/components/ui/`. It is the single
source of truth for color, typography, layout, elevation, shape, and component rules.

- `DESIGN.md` — the design system (tokens in YAML frontmatter, rules in prose)
- `.impeccable/design.json` — machine-readable sidecar: tonal ramps, shadow and motion
  tokens, and renderable component snippets
- `docs/styleguide-preview.html` — a browser preview of the system applied to real screens
- `src/theme/tokens.ts` — the normative runtime tokens
- `src/components/ui/` — the components those rules describe

This file previously held the v1.0 guide that drove the 2026-05 visual overhaul. Its
rules were folded into `DESIGN.md`, including the two places where the guide and the
code disagreed:

- The **header is a flat `#2F6F57` fill.** The v1.0 gradient was implemented and reverted
  — `react-native-linear-gradient` mis-measures the header on this RN version and clips
  the header row under the status bar.
- The page title lives **inside the body container**, never in the green header.

Do not add visual rules here. Add them to `DESIGN.md`.
