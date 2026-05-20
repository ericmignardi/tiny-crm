# Tiny CRM

A gentle relationship manager for remembering the people you care about, when you last connected, and what would be thoughtful to follow up on next.

> Who should I check in with, and why?

Tiny CRM is a focused weekend MVP built around a single habit loop: add a person → log how you connected → let the app surface who is due for a check-in. It is intentionally **not** a sales tool — no leads, no pipelines, no scoring.

## Features

- **Today** — people due for a check-in, an upcoming-birthday window, and pending reminders, with a warm empty state.
- **People** — full CRUD with relationship type, birthday, phone, email, notes, preferred contact method, follow-up cadence, and avatar upload.
- **Person detail** — profile + interaction timeline, last-contacted date, follow-up status, and quick actions for *log interaction* and *create reminder*.
- **Interaction logging** — text, call, email, in-person, video, or other; native date/time picker; automatically updates the person's `last_contacted_at`.
- **Follow-ups** — derived from `last_contacted_at + follow_up_interval_days`, split into "check in" and "start the habit" sections so first-time contacts don't get lost.
- **Reminders** — per-person, scheduled, with pending / completed / dismissed states; shown on both the Reminders tab and Today.
- **Auth** — Supabase email/password with persistent sessions on native (AsyncStorage) and a clean sign-out that clears local caches so a second user on a shared device never sees prior data.
- **Privacy** — every user-owned table is protected by Postgres RLS scoped to `auth.uid()`; the `avatars` storage bucket restricts writes to each user's own folder.

## Tech stack

- **Expo SDK 55** on React Native 0.83 / React 19 (`react-compiler` and `typedRoutes` experiments enabled)
- **Expo Router v55** — file-based routing with `Stack.Protected` for auth gating
- **Supabase** — Postgres, Auth, Storage
- **NativeWind 4** (Tailwind for React Native)
- `date-fns`, `expo-image`, `expo-image-picker`, `@react-native-community/datetimepicker`, `base64-arraybuffer`

## Getting started

### Prerequisites

- Node 20+
- An iOS simulator, Android emulator, or Expo Go on a physical device
- A Supabase project (free tier is sufficient)
- The Supabase CLI (`npm i -g supabase`) for applying migrations

### 1. Install

```bash
git clone https://github.com/ericmignardi/tiny-crm.git
cd tiny-crm
npm install
```

### 2. Configure environment

Create `.env.local` in the project root:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=<anon-key>
```

Both keys are read by `lib/supabase.ts`. They are public by design (anon keys are safe to ship in a client); RLS is what protects the data.

### 3. Apply the database schema

```bash
supabase link --project-ref <project-ref>
supabase db push
```

This applies three migrations:

- `20260519115924_init.sql` — `profiles`, `people`, `interactions`, `reminders` + RLS policies + a trigger that creates a profile row on sign-up.
- `20260520120000_avatars_bucket.sql` — `avatars` storage bucket with per-user-folder write policies.
- `20260520130000_people_avatar.sql` — `avatar_url` column on `people`.

### 4. Run

```bash
npm start          # Expo dev server (press i / a / w to open a target)
npm run ios        # iOS simulator
npm run android    # Android emulator
```

Supabase enables email confirmation on new projects by default. For local testing, either turn it off in **Authentication → Providers → Email**, or click the confirmation link in the test inbox before signing in.

## Project layout

```
src/app/                Expo Router screens
  (auth)/               sign-in, sign-up
  (app)/                authenticated stack
    (tabs)/             today, people, reminders, settings
    people-detail/[id]  profile + interaction timeline
    edit-person/[id]
    log-interaction/[id]
    reminders/new
    add-person.tsx
context/                React context providers (auth, people, interactions, reminders)
components/             avatar picker, date/time input, today widgets, reminder row, people header
hooks/                  typed context hooks (useAuth, usePeople, useInteractions, useReminders)
lib/                    supabase client, date helpers, follow-up logic
types/database.ts       generated Supabase types (regenerate via `npm run gen:types`)
supabase/migrations/    SQL schema, RLS, and storage policies
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Expo dev server |
| `npm run ios` / `npm run android` / `npm run web` | Open a specific target |
| `npm run lint` | `expo lint` |
| `npm run gen:types` | Regenerate `types/database.ts` from the linked Supabase project |

## Notes on scope

The MVP scope from [`PLAN.md`](./PLAN.md) and [`PRD.md`](./PRD.md) is shipped. Intentionally postponed:

- Contact import (`expo-contacts`)
- AI-generated follow-up prompts
- Calendar integration
- Home-screen widgets
- Offline-first / full local sync
- Data export
- Complex recurring reminders
- Tags & filters beyond relationship type

## Verifying RLS

In Supabase Studio, run as user A:

```sql
set request.jwt.claim.sub = '<userA-uuid>';
select count(*) from people;
```

Then repeat as user B with a different UUID. Each user should only see their own rows. The same isolation applies to `interactions`, `reminders`, and `storage.objects` in the `avatars` bucket.
