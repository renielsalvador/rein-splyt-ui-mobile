# Splyt Plan

## 1. Product Vision

**Splyt** is a mobile-first group expense management app for trips, staycations, camping, road trips, and shared events.

The goal is to make it easy for groups to track expenses, identify who paid for what, account for centralized funds, and automatically calculate who owes whom.

## 2. Core Problem

Groups often track expenses manually, but settlement is still difficult because:

- Different people pay for different things.
- Some expenses are shared by everyone, while others are only shared by selected people.
- Some payments come from a centralized fund.
- Receipts may contain multiple items assigned to different people.
- Final balances are hard to calculate and simplify manually.

## 3. MVP Scope

The first version should focus on the core expense and settlement flow.

### MVP Features

- User account creation and login
- Create an event
- Invite members to an event
- Add members manually
- Add expense manually
- Select who paid
- Select who shares the expense
- Support equal split
- Support centralized fund tracking
- View balances
- Generate settlement summary

### Not Yet in MVP

- Receipt OCR
- Itemized receipt splitting
- Push notifications
- Payment gateway integration
- Advanced analytics
- Multi-currency conversion

## 4. Recommended Tech Stack

### Frontend

- React Native
- Expo
- TypeScript

### Backend / Platform

- Supabase

### Database

- PostgreSQL through Supabase

### Storage

- Supabase Storage for receipts and uploaded images

### Authentication

- Supabase Auth
- Email/password for MVP
- Google login optional
- Apple login later for iOS production release

## 5. Architecture

```text
React Native App
  → Supabase Client
  → Supabase API Layer
  → PostgreSQL Database
```

Splyt can start without a custom Node.js or Laravel backend. Supabase acts as the backend layer for authentication, database access, file storage, and realtime updates.

Important business logic should not live only in the React Native app. Shared logic should move into:

- PostgreSQL functions
- SQL views
- Supabase Edge Functions

This keeps logic reusable later if Splyt adds a web dashboard.

## 6. Account and Login Plan

### User Flow

```text
Open App
→ Login / Sign Up
→ Create Profile
→ Home Screen
→ Create Event or Join Event
```

### Login Methods

MVP:

- Email and password

Later:

- Google login
- Apple login
- Magic link

## 7. Invite Plan

### Invite Options

- Share invite link
- Copy invite code
- Invite by email
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

Example links:

```text
splyt://invite/ABC123
https://splyt.app/invite/ABC123
```

## 8. Database Plan

## users

Stores user profile data.

```text
users
- id
- email
- display_name
- avatar_url
- created_at
```

## events

Represents a trip, staycation, camping trip, road trip, or shared activity.

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

Represents users or placeholder members inside an event.

```text
event_members
- id
- event_id
- user_id
- display_name
- role
- status
- joined_at
```

Notes:

- `user_id` should be nullable so that a member can be added before creating an account.
- `display_name` allows temporary participants.

Roles:

```text
owner
admin
member
viewer
```

Statuses:

```text
invited
joined
declined
removed
```

## invites

Stores event invitations.

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

Statuses:

```text
pending
accepted
expired
revoked
```

## expenses

Stores each expense entry.

```text
expenses
- id
- event_id
- amount
- currency
- title
- note
- paid_by_member_id
- payment_source
- receipt_url
- created_by
- created_at
- updated_at
```

Payment sources:

```text
personal
central_fund
```

## expense_splits

Stores who is responsible for each expense.

```text
expense_splits
- id
- expense_id
- member_id
- split_type
- share_amount
- share_percent
```

Split types:

```text
equal
custom_amount
percentage
itemized
```

## central_funds

Represents a shared group fund for the event.

```text
central_funds
- id
- event_id
- name
- currency
- created_at
```

## central_fund_contributions

Tracks contributions to the central fund.

```text
central_fund_contributions
- id
- fund_id
- member_id
- amount
- created_at
```

## settlements

Stores final or suggested payments between members.

```text
settlements
- id
- event_id
- from_member_id
- to_member_id
- amount
- status
- created_at
```

Statuses:

```text
pending
paid
cancelled
```

## 9. Permission Plan

### Owner

Can:

- Edit event
- Invite members
- Remove members
- Delete event
- Edit all expenses
- Manage central fund
- Finalize settlement

### Admin

Can:

- Invite members
- Add expenses
- Edit expenses
- Manage settlements

### Member

Can:

- Add expenses
- Edit own expenses
- View balances
- Mark settlements as paid

### Viewer

Can:

- View event details
- View expenses
- View balances

## 10. Security Plan

Use Supabase Row-Level Security.

Rules should enforce:

- Users can only view events where they are members.
- Users can only view expenses for events they belong to.
- Members can add expenses only to events they belong to.
- Members can edit their own expenses.
- Owners and admins can edit all expenses in the event.
- Only owners/admins can invite or remove members.

## 11. Balance Calculation Plan

Each member has a running balance.

Concept:

```text
balance = amount_paid - amount_owed
```

If balance is positive:

```text
member should receive money
```

If balance is negative:

```text
member owes money
```

Example:

```text
Mark paid ₱3,000 for gas split by 4 people.
Each person owes ₱750.
Mark balance: +₱2,250
Other members: -₱750 each
```

Central fund expenses should reduce the fund balance instead of crediting a specific person.

## 12. Settlement Algorithm

After balances are calculated:

1. Get all members with positive balances.
2. Get all members with negative balances.
3. Match debtors to creditors.
4. Generate simplified payment instructions.

Example:

```text
Ana pays Mark ₱750
Jay pays Mark ₱750
Bea pays Mark ₱750
```

Later, this logic should be moved into a PostgreSQL function or Supabase Edge Function.

## 13. Mobile App Screens

### Auth

- Login
- Sign Up
- Forgot Password

### Main

- Home / Events List
- Create Event
- Join Event
- Event Dashboard

### Event

- Members
- Add Expense
- Expense Details
- Edit Expense
- Central Fund
- Balances
- Settlement Summary
- Invite Friends

### User

- Profile
- Settings

## 14. Suggested Build Order

### Phase 1: Project Setup

- Create React Native / Expo app
- Add TypeScript
- Set up navigation
- Set up Supabase project
- Add Supabase client
- Configure environment variables

### Phase 2: Authentication

- Implement sign up
- Implement login
- Implement logout
- Create user profile after sign up
- Protect authenticated screens

### Phase 3: Events

- Create event table
- Create event screen
- Create event form
- List user events
- View event details

### Phase 4: Members and Invites

- Add event_members table
- Add members screen
- Generate invite code
- Join event by invite code
- Support placeholder members

### Phase 5: Expenses

- Add expenses table
- Add expense_splits table
- Create add expense form
- Select payer
- Select split participants
- Support equal split

### Phase 6: Balances

- Calculate member balances
- Show who paid and who owes
- Show total event spending
- Show per-member share

### Phase 7: Settlements

- Generate simplified settlement suggestions
- Allow members to mark payment as paid
- Store settlement records

### Phase 8: Central Fund

- Create central fund
- Add member contributions
- Add expenses paid from central fund
- Show fund balance

### Phase 9: Receipt Upload

- Upload receipt image
- Store in Supabase Storage
- Attach receipt to expense

### Phase 10: Polish

- Improve UI
- Add validations
- Add empty states
- Add loading states
- Add error handling

## 15. Later Features

- Receipt OCR
- Itemized receipt splitting
- QR invite
- Push notifications
- Offline mode
- Multi-currency support
- Expense categories
- Trip summary export
- Web dashboard
- Payment app integration
- AI-assisted receipt parsing

## 16. Key Product Principle

Splyt should feel simple during the trip and reliable at the end.

The user should never need to manually calculate:

- Who paid the most
- Who owes money
- Who should receive money
- How much is left in the shared fund
- What the final settlement should be

