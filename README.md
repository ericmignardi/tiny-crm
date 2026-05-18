# Tiny CRM for Personal Life

Tiny CRM for Personal Life is a gentle relationship manager for remembering the people you care about, when you last connected, and what would be thoughtful to follow up on next.

The app should feel warm and personal, not like sales software. Its main job is to answer one question:

> Who should I check in with, and why?

## Project Goals

- Help users stay meaningfully connected with friends, family, mentors, coworkers, and community contacts.
- Keep lightweight notes about people, birthdays, reminders, and previous interactions.
- Surface timely follow-up prompts without feeling transactional or noisy.
- Provide a polished weekend-sized React Native/Expo app with Supabase-backed sync.

## Recommended Stack

- React Native with Expo
- Expo Router for navigation
- Supabase Auth for accounts
- Supabase Postgres for relational data
- Supabase Row Level Security for privacy
- Expo Notifications for local reminders
- `date-fns` for date and follow-up calculations
- Optional later: `expo-contacts` for contact import

## Functional Requirements

### People

- Create a person.
- Edit a person.
- Delete a person.
- View a searchable people list.
- View a detailed profile for each person.
- Store name, relationship type, birthday, contact details, notes, preferred contact method, and follow-up cadence.
- Assign tags or groups to people.

### Interactions

- Log an interaction with a person.
- Support interaction types such as call, text, email, in-person, video call, and other.
- Add optional notes to each interaction.
- Store when the interaction happened.
- Show interaction history on the person detail screen.
- Automatically update `last_contacted_at` when a new interaction is logged.

### Follow-Ups

- Set a follow-up interval per person, such as every 7, 14, 30, 60, or 90 days.
- Calculate when someone is due for a check-in.
- Show people who are due or overdue.
- Sort due people by urgency.
- Support people with no previous contact date.

### Reminders

- Create reminders connected to a person.
- View upcoming reminders.
- Mark reminders as completed or dismissed.
- Show birthday reminders.
- Optionally schedule local notifications with Expo Notifications.

### Search and Filters

- Search people by name.
- Filter by relationship type.
- Filter by tag.
- Filter by due status.
- Filter by upcoming birthday.

### Today Screen

- Show people due for check-in.
- Show upcoming birthdays.
- Show upcoming reminders.
- Provide a quick action to log an interaction.
- Provide a quick action to add a new person.

## Non-Functional Requirements

### Privacy

- All user-owned data must be scoped by `user_id`.
- Supabase Row Level Security must prevent cross-user access.
- Notes and relationship data should not be written to logs.
- The product should treat personal relationship data as sensitive.

### Usability

- The app should open to an immediately useful Today screen.
- Adding a person should be fast.
- Logging an interaction should take only a few taps.
- Copy and labels should feel human and warm.
- The app should avoid overly clinical CRM language like lead, pipeline, conversion, or score.

### Reliability

- Follow-up calculations should be deterministic and easy to understand.
- Reminder state should persist across app restarts.
- Failed network requests should show recoverable error states.
- Empty states should explain what to do next without long tutorials.

### Performance

- People list search should feel instant for typical personal datasets.
- The app should avoid unnecessary backend calls when navigating between person detail and interaction history.
- The Today screen should load quickly because it is the app's primary habit loop.

### Maintainability

- Keep domain logic such as due-date calculation in reusable utility functions.
- Keep Supabase access behind small query/mutation helpers.
- Use typed models for people, interactions, reminders, and tags.
- Prefer simple, explicit data flows over premature abstraction.

## Core Entities

### `profiles`

```ts
type Profile = {
  id: string;
  email: string;
  created_at: string;
};
```

### `people`

```ts
type Person = {
  id: string;
  user_id: string;
  name: string;
  relationship_type?: "friend" | "family" | "work" | "mentor" | "neighbor" | "community" | "other";
  birthday?: string;
  phone?: string;
  email?: string;
  notes?: string;
  preferred_contact_method?: "text" | "call" | "email" | "in_person" | "video" | "other";
  follow_up_interval_days?: number;
  last_contacted_at?: string;
  created_at: string;
  updated_at: string;
};
```

### `interactions`

```ts
type Interaction = {
  id: string;
  user_id: string;
  person_id: string;
  interaction_type: "call" | "text" | "email" | "in_person" | "video" | "other";
  happened_at: string;
  notes?: string;
  created_at: string;
};
```

### `reminders`

```ts
type Reminder = {
  id: string;
  user_id: string;
  person_id: string;
  title: string;
  remind_at: string;
  status: "pending" | "completed" | "dismissed";
  created_at: string;
};
```

### `tags`

```ts
type Tag = {
  id: string;
  user_id: string;
  name: string;
  color?: string;
  created_at: string;
};
```

### `person_tags`

```ts
type PersonTag = {
  person_id: string;
  tag_id: string;
};
```

## Supabase Tables

### `people`

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `name text not null`
- `relationship_type text`
- `birthday date`
- `phone text`
- `email text`
- `notes text`
- `preferred_contact_method text`
- `follow_up_interval_days integer`
- `last_contacted_at date`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

### `interactions`

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `person_id uuid references people(id) on delete cascade`
- `interaction_type text not null`
- `happened_at timestamptz not null`
- `notes text`
- `created_at timestamptz default now()`

### `reminders`

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `person_id uuid references people(id) on delete cascade`
- `title text not null`
- `remind_at timestamptz not null`
- `status text default 'pending'`
- `created_at timestamptz default now()`

### `tags`

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `name text not null`
- `color text`
- `created_at timestamptz default now()`

### `person_tags`

- `person_id uuid references people(id) on delete cascade`
- `tag_id uuid references tags(id) on delete cascade`
- Primary key: `(person_id, tag_id)`

## API Routes or Supabase Operations

The first version can use the Supabase client directly from Expo. These route names describe the app's data operations even if no custom server routes are created.

### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/session`

### People

- `GET /people`
- `GET /people/:id`
- `POST /people`
- `PATCH /people/:id`
- `DELETE /people/:id`
- `GET /people/search?q=alex`
- `GET /people/due-for-followup`

### Interactions

- `GET /people/:id/interactions`
- `POST /people/:id/interactions`
- `PATCH /interactions/:id`
- `DELETE /interactions/:id`

### Reminders

- `GET /reminders`
- `GET /reminders/upcoming`
- `POST /reminders`
- `PATCH /reminders/:id`
- `POST /reminders/:id/complete`
- `POST /reminders/:id/dismiss`

### Tags

- `GET /tags`
- `POST /tags`
- `PATCH /tags/:id`
- `DELETE /tags/:id`
- `POST /people/:id/tags`
- `DELETE /people/:id/tags/:tagId`

## High-Level Design

### Navigation

- Auth stack
  - Sign in
  - Sign up
  - Forgot password
- App tabs
  - Today
  - People
  - Reminders
  - Settings
- Nested screens
  - Person detail
  - Add person
  - Edit person
  - Log interaction
  - Reminder detail
  - Tag manager

### Primary Screens

#### Today

The Today screen is the home base. It should show the user's relationship tasks for the day:

- People due for check-in
- Upcoming birthdays
- Pending reminders
- Recently contacted people

#### People List

The People screen should support browsing and finding contacts:

- Search input
- Relationship filters
- Tag filters
- Due status filters
- Add person button

#### Person Detail

The Person Detail screen should feel like a personal memory page:

- Name and relationship type
- Contact details
- Last contacted date
- Follow-up cadence
- Birthday
- Notes
- Tags
- Interaction timeline
- Actions for log interaction, edit, and create reminder

#### Reminders

The Reminders screen should show:

- Upcoming reminders
- Overdue reminders
- Completed reminders
- Birthday reminders

#### Settings

Settings should include:

- Account information
- Notification preferences
- Default follow-up cadence
- Data export later
- Sign out

## Follow-Up Logic

A person is due for follow-up when:

```ts
last_contacted_at + follow_up_interval_days <= today
```

If `last_contacted_at` is missing, the app can either:

- Treat the person as due immediately.
- Treat the person as not due until the first interaction is logged.

Recommended MVP behavior:

- If the person has a follow-up interval and no `last_contacted_at`, show them in a separate "Start the habit" section.
- If the person has no follow-up interval, do not include them in the due list.

## Visual Direction

The app should feel personal, calm, and useful.

Recommended Tailwind color palette:

```js
theme: {
  extend: {
    colors: {
      primary: "#2F6F73",
      secondary: "#8A6FAD",
      accent: "#E09F5A",
      bg: "#F8F7F3",
      "bg-card": "#FFFFFF",
      text: "#1F2933",
      "text-muted": "#6B7280",
    },
  },
}
```

Avoid UI language and styling that makes relationships feel like sales operations. Favor labels such as:

- People to check in with
- Last connected
- Remember for next time
- Upcoming birthdays
- Recently connected

## Weekend MVP Scope

Build first:

- Supabase Auth
- People CRUD
- Person detail
- Interaction logging
- Automatic `last_contacted_at` update
- Follow-up cadence
- Today screen
- Basic reminders
- Birthday field
- Warm empty states

Postpone:

- Contact import
- AI-generated prompts
- Calendar integration
- Widgets
- Data export
- Complex notification scheduling

## Future Ideas

- Contact import from the user's phone.
- AI-generated follow-up suggestions.
- Weekly relationship digest.
- Message templates.
- Calendar integration for birthdays and reminders.
- Home screen widget.
- Local-first offline mode.
- Encrypted notes.
