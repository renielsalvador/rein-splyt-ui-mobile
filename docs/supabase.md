# Supabase Backend

The canonical Supabase backend lives in the sibling **`splyt-api`** repository.
It owns the database schema, RLS policies, RPCs, Storage policies, Auth email
templates, local fixtures, and the generated TypeScript database types.

Do not add or edit migrations in this repository. See `splyt-api/README.md` for
local stack commands and `splyt-api/docs/production-reconciliation.md` for the
mandatory gate that must be completed before any cloud deployment.

## Backend selection

Backend selection is explicit. `BACKEND_MODE` is required and must be `mock` or
`supabase`; there is no implicit fallback. In `supabase` mode both
`SUPABASE_URL` and `SUPABASE_ANON_KEY` (the publishable key) are required, and
the app fails fast with a clear message when either is missing.

| Environment file | Purpose |
| --- | --- |
| `.env.example` | Default `BACKEND_MODE=mock` development setup |
| `.env.local.example` | Local `splyt-api` Supabase stack |
| `.env.staging.example` | Staging Supabase project |
| `.env.production.example` | Production Supabase project |

Copy the file you need to `.env`, `.env.local`, `.env.staging`, or
`.env.production` and fill in the values. Never commit a real key.

```sh
npm run ios:local        # or npm run android:local
npm run ios:staging      # or npm run android:staging
npm run ios:production   # or npm run android:production
```

`npm run ios` and `npm run android` use the default `.env`.

## Supabase URLs per target

| Target | `SUPABASE_URL` |
| --- | --- |
| iOS Simulator (local stack) | `http://127.0.0.1:54321` |
| Android Emulator (local stack) | `http://10.0.2.2:54321` |
| Physical device (local stack) | `http://<your-lan-ip>:54321` |
| Staging / production | The hosted project URL |

Read the local publishable key from `npm run status` in `splyt-api`. Never copy
a hosted key into a local environment file, and never expose the local stack to
the public internet.

## Auth project settings

Google OAuth must allow the mobile redirect URL `splytuimobile://auth/callback`,
and the Google provider must be enabled in the target Supabase project.

## Legacy directory

The `supabase/` directory in this repository is **legacy and read-only**. It is
retained only as the extraction source until production reconciliation is signed
off in `splyt-api`. See [supabase/README.md](../supabase/README.md).
