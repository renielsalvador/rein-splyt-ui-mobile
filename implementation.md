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
- [ ] Add a clear Supabase handoff path beyond the current mock-backed adapter.

## Next

- [ ] Replace the mock backend implementation with live Supabase auth, tables, and RPC-backed calculations.
- [ ] Add role-aware permissions and editing restrictions in the data layer.
- [ ] Add invite deep links and external delivery flow.
- [ ] Persist settlement records and paid-status updates.
