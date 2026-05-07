# Supabase Setup

The app now supports a live `SupabaseBackend` when `SUPABASE_URL` and `SUPABASE_ANON_KEY` are defined in a root `.env` file. If those values are missing, the app continues to use the in-memory mock backend.

## What To Apply

Apply the schema in [supabase/migrations/202605040001_initial_schema.sql](/Users/rensalvador/projects/rein-splyt-ui-mobile/supabase/migrations/202605040001_initial_schema.sql:1). It creates:

- Auth-linked `users`
- Events, members, invites, expenses, splits, central funds, and contributions
- RLS policies for member-scoped access
- RPC functions for multi-step writes
- SQL functions for balances and settlement instructions

## Supabase Project Settings

For the current mobile auth flow, disable email confirmation in the Supabase Auth settings for MVP testing. The app expects `signUp()` to return an active session immediately.

Google OAuth should also allow the mobile redirect URL `splytuimobile://auth/callback`.

## Runtime Config

Copy [.env.example](/Users/rensalvador/projects/rein-splyt-ui-mobile/.env.example:1) to `.env` at the repo root and set:

```dotenv
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## Current Limitation

The app now uses `AsyncStorage` for Supabase auth session persistence in React Native. The remaining setup gap is environment and project readiness: migrations must still be applied to a real Supabase project, and production rules such as role-aware restrictions and invite delivery are still pending.
