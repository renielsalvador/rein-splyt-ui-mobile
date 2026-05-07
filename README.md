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

The backend adapter lives under `src/lib/backend`.

- `src/lib/backend/mockBackend.ts` powers the working local flows
- `src/lib/backend/supabaseBackend.ts` implements the live Supabase adapter
- `src/lib/backend/index.ts` selects the backend at runtime
- `src/config/appConfig.ts` is the single config read point for Supabase credentials

Create a root `.env` file from `.env.example` and set:

```dotenv
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

Google OAuth in the mobile app also expects a Supabase redirect URL of
`splytuimobile://auth/callback` to be added to your Auth redirect allow list,
and the Google provider must be enabled in the Supabase dashboard.
```

When `SUPABASE_URL` and `SUPABASE_ANON_KEY` are present, the app uses the live `SupabaseBackend`. Without them, it falls back to the mock backend automatically.
