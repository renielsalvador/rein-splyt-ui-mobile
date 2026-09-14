# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

**Primary:** friend groups and travelers splitting the cost of a shared trip, staycation, camping trip, road trip, restaurant bill, or group outing. They are in the middle of the event — on a phone, often with patchy attention and a group chat running in parallel — and the job is to record who paid for what fast enough that it doesn't interrupt the trip, then settle up cleanly afterward.

**Secondary:** housemates tracking ongoing shared bills such as rent, utilities, and groceries. Confirmed in scope, but design decisions are led by the trip/event case.

## Product Purpose

Splyt lets a group track shared expenses across an event, account for money pooled before or during the trip, and get an automatically computed answer to "who owes whom." Success is a group finishing a trip and settling with no spreadsheet, no argument, and no manual arithmetic.

## Positioning

The **central fund**: pooled group money that members contribute to before or during an event, which expenses can be paid from. A central-fund expense draws down the pool instead of crediting an individual payer, so pooled and personal spending settle in the same balance calculation. Competing split apps (Splitwise) have no equivalent. The secondary position is lower friction than those apps for adding an expense and settling up.

## Operating Context

- Work is organized into **events** (a trip, staycation, outing) that members join by invite code, by email invite, or by being added as a placeholder member with no account.
- Roles: `owner`, `admin`, `member`, `viewer`. Membership statuses: `invited`, `joined`, `declined`, `removed`.
- A member can exist without a user account (placeholder members), so the group can start tracking before everyone signs up.
- Core loop: create or join event → add members → log expenses (choosing payer, participants, and whether payment came from personal money or the central fund) → contribute to the central fund → read balances → generate a settlement summary.
- Existing screens: auth (sign in / sign up / forgot password / reset via deep link), events list, create event, join event, event dashboard, members, add and edit expense, central fund, balances, settlement summary, activity feed, notification detail, settings, profile/account.
- Balance rule: `balance = amount_paid - amount_owed`. Positive means the member is owed money; negative means they owe. Central-fund expenses reduce the fund rather than crediting a person.
- Settlement matches debtors to creditors and emits simplified payment instructions.

## Capabilities and Constraints

- React Native CLI app (RN 0.85, React 19, TypeScript, React Navigation, React Context for state) shipping to both iOS and Android.
- Supabase is the backend (Auth, Postgres, Storage, Edge Functions); business logic lives in Postgres functions, SQL views, and Edge Functions so it can be reused by a future web dashboard. There is no custom Node/Laravel server. The schema is owned by the sibling `splyt-api` repository; this repo's `supabase/` directory is legacy and read-only.
- Backend selection is explicit via `BACKEND_MODE=mock|supabase` with no implicit fallback; a mock backend powers local development.
- Currencies are limited to **PHP and USD**. PHP (₱) is the default. Currency is set per event.
- Auth is email/password plus Google OAuth (redirect `splytuimobile://auth/callback`). Apple Sign In is planned for the iOS production release; magic link is undecided.
- Splits are **equal only** today. Custom-amount and percentage splits are planned but not built; equal remains the default.
- Row-Level Security governs access: members only see events they belong to, members edit their own expenses, owners and admins edit all expenses and manage membership.
- Not built yet, do not present as existing: push notifications (the settings toggle is inert), in-app email change, contribution requests with target amounts, QR-code invites, real-time collaboration, persisted settlement paid-status.
- Node 22.x is required for development.

## Brand Commitments

- Product name: **Splyt**. Wordmark is used as-is.
- App icon and wordmark assets live in `assets/branding/` (SVG and PNG, including white/no-background variants), with generated splash screens for iOS and Android.
- No confirmed voice or tone document exists yet.

## Evidence on Hand

- Working product: a complete MVP implementation across the screens listed above, on either the mock or live Supabase backend.
- Product documentation: `PLAN.md` (vision, data model, permissions, roadmap), `implementation.md` (build status), `README.md` (setup), `docs/supabase.md`.
- The visual system is recorded in `DESIGN.md` with its `.impeccable/design.json` sidecar, extracted from the shipped code. `STYLEGUIDE.md` is a pointer to it, and `agents/ui-designer.md` reviews against it.
- Branding assets in `assets/branding/`.
- Automated tests under `__tests__/` covering app render, auth service, activity feed, event status, mock backend, config, and formatting.
- **No real users, testers, testimonials, press, case studies, pricing, or launch date have been established.** Future work must not fabricate any of these. App Store / Play Store submission timing is undecided; a "Plan & Billing" screen is named in the plan but no pricing exists.

## Product Principles

1. **The trip comes first.** Logging an expense happens mid-event on a phone; every added step costs more than it does in a desktop finance tool.
2. **The central fund is the product.** Pooled money is a first-class citizen in entry, balances, and settlement — never an afterthought bolted onto a split calculator.
3. **Nobody is blocked by onboarding.** Placeholder members, invite codes, and join-by-link mean a group can start tracking before everyone has an account.
4. **The number is the answer.** Balances and settlement instructions are stated plainly enough to be acted on without interpretation or manual checking.
5. **Money earns trust through clarity.** Amounts, payers, participants, and payment source are always legible and attributable; ambiguity about who paid is a product failure.

## Accessibility & Inclusion

No product-specific accessibility standard has been established. Both target platforms' baseline expectations (dynamic type, sufficient contrast, screen-reader labels on controls) apply until the user sets a stricter requirement.
