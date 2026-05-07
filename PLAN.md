# Splyt Plan

## 1. Product Vision

**Splyt** is a mobile-first group expense management app for trips, staycations, camping, road trips, and shared events.

The goal is to make it easy for groups to track expenses, identify who paid for what, account for centralized funds, and automatically calculate who owes whom.

**Core differentiators:**

- Central fund concept — pooled group money before and during a trip (Splitwise has no equivalent)
- Simpler UX — less friction to add expenses and settle up
- Real-time collaboration — everyone sees updates instantly (v2)

## 2. Core Problem

Groups often track expenses manually, but settlement is still difficult because:

- Different people pay for different things.
- Some expenses are shared by everyone, while others are only shared by selected people.
- Some payments come from a centralized fund.
- Receipts may contain multiple items assigned to different people.
- Final balances are hard to calculate and simplify manually.

## 3. Target Users

**Primary:** Friend groups and travelers — splitting trip costs, restaurant bills, and group outings.

**Secondary:** Housemates — ongoing shared bills such as rent, utilities, and groceries.

## 4. MVP Status

The following features are fully implemented and working:

- User account creation and login (email/password + Google OAuth)
- Create an event
- Invite members to an event (by email or invite code)
- Add members manually (placeholder members)
- Add and edit expenses
- Select who paid and who shares the expense
- Equal split
- Centralized fund tracking
- View balances
- Generate settlement summary
- Activity feed
- Profile management with avatar upload

## 5. Recommended Tech Stack

### Frontend

- React Native 0.85
- TypeScript
- React Context API for state management

### Backend / Platform

- Supabase (Auth, PostgreSQL, Storage, Edge Functions)
- Mock backend for local development

### Authentication

- Supabase Auth
- Email/password
- Google OAuth
- Apple login — later for iOS production release

## 6. Architecture

```text
React Native App
  → Supabase Client
  → Supabase API Layer
  → PostgreSQL Database
```

Splyt does not use a custom Node.js or Laravel backend. Supabase acts as the backend layer for authentication, database access, file storage, and realtime updates.

Important business logic lives in:

- PostgreSQL functions
- SQL views
- Supabase Edge Functions

This keeps logic reusable later if Splyt adds a web dashboard.

## 7. Account and Login Plan

### User Flow

```text
Open App
→ Login / Sign Up
→ Create Profile
→ Home Screen
→ Create Event or Join Event
```

### Login Methods

Current:

- Email and password
- Google OAuth

Later:

- Apple login
- Magic link

## 8. Invite Plan

### Invite Options

- Copy invite code
- Invite by email
- Share invite link
- QR code later

### Invite Flow

```text
Event owner creates invite
→ App generates invite code/link
→ Friend opens link
→ If logged in, join event
→ If not logged in, sign up/login first
→ Join event after authentication
```

## 9. Database Plan

## users

```text
users
- id
- email
- display_name
- avatar_url
- push_token
- created_at
```

## events

```text
events
- id
- name
- description
- currency
- created_by
- created_at
- updated_at
```

## event_members

```text
event_members
- id
- event_id
- user_id (nullable for placeholder members)
- display_name
- role
- status
- joined_at
```

Roles: `owner`, `admin`, `member`, `viewer`

Statuses: `invited`, `joined`, `declined`, `removed`

## invites

```text
invites
- id
- event_id
- invited_by
- invite_code
- invited_email
- status
- expires_at
- created_at
```

Statuses: `pending`, `accepted`, `expired`, `revoked`

## expenses

```text
expenses
- id
- event_id
- amount
- currency
- title
- note
- paid_by_member_id
- payment_source (personal | central_fund)
- receipt_url
- created_by
- created_at
- updated_at
```

## expense_splits

```text
expense_splits
- id
- expense_id
- member_id
- split_type (equal | custom_amount | percentage)
- share_amount
- share_percent
```

## central_funds

```text
central_funds
- id
- event_id
- name
- currency
- target_amount
- created_at
```

## central_fund_contributions

```text
central_fund_contributions
- id
- fund_id
- member_id
- amount
- created_at
```

## settlements

```text
settlements
- id
- event_id
- from_member_id
- to_member_id
- amount
- status (pending | paid | cancelled)
- created_at
```

## 10. Permission Plan

### Owner

- Edit event, invite and remove members, delete event
- Edit all expenses
- Manage central fund, finalize settlement

### Admin

- Invite members, add and edit expenses, manage settlements

### Member

- Add and edit own expenses, view balances, mark settlements as paid

### Viewer

- View event details, expenses, and balances

## 11. Security Plan

Use Supabase Row-Level Security.

Rules enforce:

- Users can only view events where they are members.
- Users can only view expenses for events they belong to.
- Members can add expenses only to events they belong to.
- Members can edit their own expenses.
- Owners and admins can edit all expenses in the event.
- Only owners and admins can invite or remove members.

## 12. Balance Calculation Plan

```text
balance = amount_paid - amount_owed
```

Positive balance → member should receive money.
Negative balance → member owes money.

Central fund expenses reduce the fund balance instead of crediting a specific person.

## 13. Settlement Algorithm

1. Get all members with positive balances.
2. Get all members with negative balances.
3. Match debtors to creditors.
4. Generate simplified payment instructions.

Settlement logic lives in a PostgreSQL function / Supabase Edge Function.

## 14. Mobile App Screens

### Auth

- Login / Sign Up
- Forgot Password
- Reset Password (deep link)

### Main

- Home / Dashboard
- Events List
- Create Event
- Join Event
- Activity Feed

### Event

- Event Dashboard
- Members
- Add / Edit Expense
- Central Fund
- Balances
- Settlement Summary
- Notification Detail

### User

- Settings
- Account Update
- Plan & Billing

## 15. Development Roadmap

### Phase 1: Pre-Launch Blockers ✅ In Progress

Must be resolved before App Store / Play Store submission.

- [ ] Forgot password — `AuthScreen.tsx` (currently a no-op tap)
  - Call `supabase.auth.resetPasswordForEmail(email)`
  - Add `ResetPasswordScreen` for deep link handler
- [ ] Email change in-app — `SettingsScreen.tsx` (shows placeholder text)
  - Call `supabase.auth.updateUser({ email })`
  - Add `EmailUpdateScreen` or modal
- [ ] Push notification toggle wiring — currently does nothing in `SettingsScreen.tsx`
  - Wire to actual permission state (resolved in Phase 2)

### Phase 2: Push Notifications

Library: `expo-notifications` (no native FCM setup required)

- [ ] Add `expo-notifications` and `expo-device`
- [ ] Create `src/hooks/usePushNotifications.ts` — request permission on first login, store Expo push token
- [ ] Add `push_token` column to `user_profiles` Supabase table
- [ ] Wire notification toggle in `SettingsScreen.tsx`
- [ ] Create Supabase Edge Function `notify` to send push notifications
- [ ] Handle notification tap deep links in `src/app/navigation.tsx`

Notification triggers:

| Event | Recipients | Deep link |
|-------|-----------|-----------|
| New expense added | All event members | EventDashboard |
| Invite accepted | Event creator | Members screen |
| Settlement marked complete | Person owed | Settlement screen |
| Fund contribution requested | Members who haven't contributed | CentralFund screen |
| New event invite | Invitee | NotificationDetail screen |

### Phase 3: Split Types

Current state: only equal split is supported (`splitType: 'equal'` in `domain.ts`)

- [ ] Update `src/types/domain.ts` — `splitType: 'equal' | 'custom' | 'percentage'`
- [ ] Update `AddExpenseScreen.tsx` — add split type toggle (Equal / Custom / Percentage)
  - Custom: per-participant amount input, validate sum equals total
  - Percentage: per-participant % input, validate sum equals 100%
- [ ] Update `src/lib/backend/supabase/expense.ts` — handle new split types
- [ ] Update `src/lib/backend/mockBackend.ts` — support new split types

Equal split remains the default.

### Phase 4: Central Fund Improvements

The central fund is Splyt's core differentiator. Make it active, not passive.

- [ ] **Contribution requests** — event owner sets a target amount and requests contributions
  - Add `targetAmount?: number` to `CentralFund` model in `domain.ts`
  - Add target input and "Request Contributions" button to `CentralFundScreen.tsx`
  - Sends push notification to members who haven't contributed
- [ ] **Fund health indicator** — color-coded pill on `EventDashboardScreen.tsx`
  - Green: target met or exceeded
  - Yellow: contributions below target
  - Grey: no target set
- [ ] **Who hasn't contributed** — add "Pending" section to `CentralFundScreen.tsx`
- [ ] **Surplus handling** — prompt when event ends with leftover fund balance
  - Options: distribute equally back to contributors, or leave as is

### Phase 5: Monetization (v1.1 — post-launch)

Model: one-time Pro purchase ($9.99–$14.99). Better fit than subscription for occasional friend-group users.

Library: `react-native-purchases` (RevenueCat)

**Free vs Pro limits:**

| Feature | Free | Pro |
|---------|------|-----|
| Active events | 3 | Unlimited |
| Members per event | 8 | Unlimited |
| Split types | Equal only | Equal + Custom + Percentage |
| Receipt photo per expense | — | ✓ |
| Export to CSV/PDF | — | ✓ |
| Event archive access | Last 3 | All time |

- [ ] Create `src/hooks/useEntitlements.ts` — wraps RevenueCat, exposes `isPro: boolean`
- [ ] Create `src/components/ui/UpgradePrompt.tsx` — paywall modal (lock icon, not hidden UI)
- [ ] Add Plan & Billing section to `SettingsScreen.tsx`
  - Current plan badge (Free / Pro)
  - Upgrade to Pro button
  - Restore Purchases button
- [ ] Gate at action points: 4th event (`CreateEventScreen`), 9th member (`MembersScreen`), non-equal splits (`AddExpenseScreen`)

## 16. Deferred to v2

- **Real-time collaboration** — Supabase Realtime on `EventDashboard`. Deferred due to connection costs at scale. Use pull-to-refresh for v1.
- **Receipt capture** — Camera/photo attach to expense (Pro feature).
- **Currency conversion** — Live FX rates for international trips.
- **Recurring expenses** — For housemates (rent, utilities).
- **CSV/PDF export** — Pro feature.
- **QR invite** — Scan to join event.
- **Web dashboard** — View and manage events from a browser.
- **AI-assisted receipt parsing** — OCR and itemized splitting.
- **Offline mode** — For travelers with limited connectivity.

## 17. Key Product Principle

Splyt should feel simple during the trip and reliable at the end.

The user should never need to manually calculate:

- Who paid the most
- Who owes money
- Who should receive money
- How much is left in the shared fund
- What the final settlement should be
