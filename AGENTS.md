# Repository Guidelines

## Project Structure & Module Organization
The app is a React Native CLI project. Main app entry points are `App.tsx` and `index.js`. Feature screens live under `src/features/*` (`auth`, `events`, `expenses`, `funds`, `balances`, `settings`). Shared app wiring is in `src/app`, reusable UI in `src/components`, theme tokens in `src/theme`, and backend adapters in `src/lib/backend`. Tests currently live in `__tests__/`, and Supabase SQL migrations are stored in `supabase/migrations/`. Use `docs/` for longer-form technical notes.

## Build, Test, and Development Commands
Use Node `22.x` as noted in `package.json` and `README.md`.

- `source ~/.nvm/nvm.sh && nvm use 22 && npm install` installs dependencies.
- `npm start` starts the Metro bundler.
- `npm run ios` launches the iOS app.
- `npm run android` launches the Android app.
- `npm run lint` runs ESLint across the repo.
- `npm test -- --runInBand` runs Jest tests serially.
- `npx tsc --noEmit` checks TypeScript types before opening a PR.

## Coding Style & Naming Conventions
This repo uses TypeScript with the React Native ESLint preset and Prettier. Prettier is configured for single quotes, trailing commas, and no parens for single-arg arrows. Follow the existing style: 2-space indentation, PascalCase for screen/component files (`AuthScreen.tsx`), camelCase for helpers (`format.ts`), and descriptive feature folders under `src/features`. Keep backend contracts centralized in `src/lib/backend/types.ts` and config reads in `src/config/appConfig.ts`.

## Testing Guidelines
Jest uses `@react-native/jest-preset` with `jest.setup.js`, and React Native UI tests use `@testing-library/react-native`. Add tests in `__tests__/` using the `*.test.tsx` pattern. Prefer user-visible assertions such as rendered text or screen state over implementation details. For feature work, cover the happy path and any regression-prone state transitions.

## Commit & Pull Request Guidelines
Recent history mixes short imperative messages (`update UI`) with `chore:` prefixes. Prefer concise, imperative commits and use a scope when helpful, for example `feat: add event invite flow` or `fix: prevent duplicate fund entries`. PRs should include a clear summary, test notes (`npm run lint`, `npm test`, `npx tsc --noEmit`), linked issues when applicable, and screenshots or recordings for UI changes.

## Configuration Notes
Local development defaults to the mock backend in `src/lib/backend/mockBackend.ts`. Copy `.env.example` to `.env` only when wiring Supabase, and never commit real credentials.
