# Implementation Tracker

## Status

This file tracks the implementation of the Splyt MVP foundation described in `PLAN.md`.

## Completed

- [x] Replace the static dashboard-only `App.tsx` with a real app shell.
- [x] Add navigation, provider state, and typed domain models.
- [x] Add a backend adapter entrypoint with a working mock backend fallback.
- [x] Implement auth, home, create-event, join-event, event dashboard, members, add-expense, central-fund, balances, and settlement screens.
- [x] Add Google OAuth, password reset, activity feed, and profile avatar management.
- [x] Add balance and settlement calculation logic for equal-split expenses and centralized fund contributions.
- [x] Add a live `SupabaseBackend` with auth, events, expenses, balances, contacts, funds, invites, and avatar storage support.
- [x] Add Supabase SQL migrations covering schema, RPC helpers, and balance-related database logic.
- [x] Add branded mobile splash screens for iOS and Android.
- [x] Add automated coverage for app render, auth service, activity feed, event status, backend, and formatting utilities.
- [x] Add TypeScript, lint, and Jest verification under Node 22.

## In Progress

- [ ] Validate the full live Supabase flow in a real project environment.

## Next

- [ ] Run the Supabase migrations in a real project and fill the mobile app config with live keys.
- [ ] Add role-aware permissions and editing restrictions in the data layer.
- [ ] Add invite deep links and external delivery flow.
- [ ] Persist settlement records and paid-status updates.
