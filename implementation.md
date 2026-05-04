# Implementation Tracker

## Status

This file tracks the implementation of the Splyt MVP foundation described in `PLAN.md`.

## Completed

- [x] Replace the static dashboard-only `App.tsx` with a real app shell.
- [x] Add navigation, provider state, and typed domain models.
- [x] Add a backend adapter entrypoint with a working mock backend fallback.
- [x] Implement auth, home, create-event, join-event, event dashboard, members, add-expense, central-fund, balances, and settlement screens.
- [x] Add balance and settlement calculation logic for equal-split expenses and centralized fund contributions.
- [x] Add baseline TypeScript, lint, and app render verification under Node 22.

## In Progress

- [ ] Expand automated coverage beyond the single app-shell render test.

## Next

- [ ] Run the new Supabase migration in a real project and fill the mobile app config with live keys.
- [ ] Add role-aware permissions and editing restrictions in the data layer.
- [ ] Add invite deep links and external delivery flow.
- [ ] Persist settlement records and paid-status updates.

## Newly Added

- [x] Add a live `SupabaseBackend` that plugs into the existing backend adapter.
- [x] Add the first SQL migration covering schema, RLS, RPC writes, and database-side balances and settlement calculations.
- [x] Document the app-side config and Supabase setup handoff.
