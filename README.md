# Splyt Mobile

React Native CLI app for group expense tracking, balances, centralized funds, and settlement summaries.

## Current State

The app now includes:

- Auth flow with sign in, sign up, Google OAuth, and password reset
- Event list, create event, and join by invite code
- Event dashboard with members, expenses, activity, and balances preview
- Manual member creation and invite-code generation
- Equal-split expense entry and expense editing
- Central fund contribution tracking
- Computed balances and settlement summary
- Profile management with avatar upload
- Live Supabase backend support with mock fallback
- Branded iOS and Android splash screens

By default, the app can run on the local mock backend for development, or switch to the live Supabase backend when environment config is present.

## Tooling

- React Native `0.85.2`
- React `19.2.3`
- TypeScript
- React Navigation
- Supabase client package

Node `22.x` is required. In this repo, commands were verified with `nvm use 22`.

## Run

```sh
source ~/.nvm/nvm.sh
nvm use 22
npm install
npm start
```

In another terminal:

```sh
source ~/.nvm/nvm.sh
nvm use 22
bundle install
bundle exec pod install --project-directory=ios
npm run ios
```

or

```sh
source ~/.nvm/nvm.sh
nvm use 22
npm run android
```

## Verification

```sh
source ~/.nvm/nvm.sh
nvm use 22
npx tsc --noEmit
npm run lint
npm test -- --runInBand
```

## Backend Setup

The Supabase backend itself (schema, RLS, RPCs, Storage, Auth templates,
generated types) is owned by the sibling **`splyt-api`** repository. The
`supabase/` directory here is legacy and read-only.

The backend adapter lives under `src/lib/backend`.

- `src/lib/backend/mockBackend.ts` powers the working local flows
- `src/lib/backend/supabaseBackend.ts` implements the live Supabase adapter
- `src/lib/backend/index.ts` selects the backend from the explicit `BACKEND_MODE`
- `src/config/appConfig.ts` is the single config read point and validates it

Copy an environment example to `.env` and set the required values:

```dotenv
BACKEND_MODE=mock
```

```dotenv
BACKEND_MODE=supabase
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

`BACKEND_MODE` is required; there is no implicit fallback. `supabase` mode
requires both `SUPABASE_URL` and `SUPABASE_ANON_KEY` and fails fast otherwise.
Use `http://127.0.0.1:54321` on the iOS Simulator and `http://10.0.2.2:54321`
on the Android Emulator when running the local `splyt-api` stack.

Google OAuth also expects the redirect URL `splytuimobile://auth/callback` in
the target project's Auth redirect allow list, with the Google provider enabled.

See [docs/supabase.md](docs/supabase.md) for the per-environment files and
commands.
