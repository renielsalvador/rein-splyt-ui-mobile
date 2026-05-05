# Splyt Mobile

React Native CLI app for group expense tracking, balances, centralized funds, and settlement summaries.

## Current State

The app now includes:

- Auth flow with sign in and sign up
- Event list, create event, and join by invite code
- Event dashboard with members, expenses, and balances preview
- Manual member creation and invite-code generation
- Equal-split expense entry
- Central fund contribution tracking
- Computed balances and settlement summary

By default, the app runs on a local mock backend adapter so the flows work without live infrastructure. The backend entrypoint is already structured for a Supabase handoff.

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

## Supabase Handoff

The current backend adapter lives under `src/lib/backend`.

- `src/lib/backend/mockBackend.ts` powers the working local flows
- `src/lib/backend/index.ts` is the backend entrypoint
- `src/config/appConfig.ts` is the single config read point for Supabase credentials

Create a root `.env` file from `.env.example` and set:

```dotenv
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

Google OAuth in the mobile app also expects a Supabase redirect URL of
`splytuimobile://auth/callback` to be added to your Auth redirect allow list,
and the Google provider must be enabled in the Supabase dashboard.
```

To switch from mock to live Supabase, the next implementation step is to replace the mock-backed methods behind the `AppBackend` interface with real auth, table, and RPC operations.
