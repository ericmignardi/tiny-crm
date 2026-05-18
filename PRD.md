# Product Requirements Document: Tiny CRM for Personal Life

## Summary

Tiny CRM for Personal Life helps users remember, nurture, and follow up with the people they care about. It combines lightweight contact management, interaction history, birthdays, reminders, and follow-up prompts in a mobile-first React Native app.

The product should not feel like traditional sales CRM. It should feel like a thoughtful memory aid.

## Problem

People often want to maintain relationships but forget:

- When they last checked in.
- What someone told them recently.
- Important dates like birthdays.
- Who they meant to follow up with.
- Which relationships have gone quiet.

Existing contacts apps store information, but they do not help users maintain relationship habits. Task apps can create reminders, but they lack personal context.

## Target Users

### Primary User

A busy adult who wants to be more intentional about staying connected with friends, family, mentors, professional contacts, and community members.

### Secondary Users

- Freelancers who maintain loose professional networks.
- Students staying in touch with classmates, mentors, and professors.
- People who have moved cities and want to maintain long-distance relationships.
- Community builders who want a lightweight way to remember people.

## Product Principles

- Gentle over transactional.
- Useful on open.
- Fast to capture.
- Private by default.
- Relationship context over raw contact data.
- Small, repeatable habits over heavy workflows.

## Goals

- Let users add people and key context quickly.
- Help users know who to check in with today.
- Let users log interactions after they happen.
- Surface reminders and birthdays in a calm way.
- Build a strong MVP that can be completed in a weekend.

## Non-Goals

- Replacing the phone's native contacts app.
- Building a sales pipeline tool.
- Building a full calendar application.
- Building full offline sync in version one.
- Importing and cleaning a user's entire address book in version one.
- Adding AI-generated prompts before the core workflow is useful.

## MVP User Stories

### People

- As a user, I want to add a person so I can remember them in the app.
- As a user, I want to edit a person's details so my notes stay accurate.
- As a user, I want to search people so I can quickly find someone.
- As a user, I want to view a person profile so I can remember context before reaching out.

### Interactions

- As a user, I want to log that I texted, called, emailed, or met someone so I can remember our history.
- As a user, I want to add notes to an interaction so I can remember what we talked about.
- As a user, I want the app to update the last contacted date automatically so I do not have to manage it manually.

### Follow-Ups

- As a user, I want to set how often I want to check in with someone so the app can remind me.
- As a user, I want to see who is due for a check-in so I can maintain relationships intentionally.
- As a user, I want overdue people sorted clearly so I can decide who to contact first.

### Reminders and Birthdays

- As a user, I want to save birthdays so I can remember important dates.
- As a user, I want to create a reminder for a person so I can follow up on something specific.
- As a user, I want to mark reminders as complete or dismissed so my list stays clean.

## MVP Features

### 1. Authentication

Users can sign up, sign in, sign out, and maintain a Supabase-backed session.

Acceptance criteria:

- User can create an account.
- User can sign in with an existing account.
- User remains signed in after reopening the app.
- User can sign out.

### 2. Today Screen

The Today screen is the default authenticated landing screen.

Acceptance criteria:

- Shows people due for check-in.
- Shows people with upcoming birthdays.
- Shows pending reminders.
- Shows empty states when there is no data.
- Provides quick actions for adding a person and logging an interaction.

### 3. People Management

Users can create, read, update, and delete people.

Acceptance criteria:

- User can add a person with at least a name.
- User can optionally add relationship type, birthday, phone, email, notes, preferred contact method, and follow-up interval.
- User can edit all person fields.
- User can delete a person.
- User can search people by name.

### 4. Person Detail

Each person has a detail screen with context and actions.

Acceptance criteria:

- Shows person details.
- Shows last contacted date.
- Shows follow-up cadence.
- Shows interaction history.
- Provides actions to edit person, log interaction, and create reminder.

### 5. Interaction Logging

Users can log interactions connected to a person.

Acceptance criteria:

- User can choose interaction type.
- User can set interaction date/time.
- User can add optional notes.
- Saving an interaction updates the person's `last_contacted_at`.
- Interaction appears on the person's timeline.

### 6. Follow-Up Calculation

The app calculates who is due for check-in.

Acceptance criteria:

- A person with `last_contacted_at` and `follow_up_interval_days` becomes due when the interval has elapsed.
- People due today or earlier appear on the Today screen.
- People without a follow-up interval are excluded from due calculations.
- People with a follow-up interval and no contact history appear in a "Start the habit" style section.

### 7. Reminders

Users can create and manage reminders.

Acceptance criteria:

- User can create a reminder tied to a person.
- User can set reminder title and date/time.
- Pending reminders appear in the Reminders screen.
- Due or upcoming reminders appear on Today.
- User can complete or dismiss a reminder.

## Future Features

- Contact import with `expo-contacts`.
- Tags and groups.
- Local notifications with more advanced scheduling.
- AI follow-up suggestions.
- Weekly digest.
- Data export.
- Calendar integration.
- Home screen widgets.
- Offline-first storage.
- Biometric app lock.

## UX Requirements

- The app opens to Today after authentication.
- Primary actions should be reachable within one or two taps.
- Empty states should guide the user without lengthy instructions.
- Forms should be short and progressive where possible.
- The copy should use warm, human language.
- Avoid labels like lead, pipeline, deal, conversion, prospect, or score.

## Information Architecture

- Today
- People
- Reminders
- Settings

Nested:

- Add Person
- Edit Person
- Person Detail
- Log Interaction
- Create Reminder
- Tag Manager later

## Data Requirements

Required MVP tables:

- `profiles`
- `people`
- `interactions`
- `reminders`

Optional MVP tables:

- `tags`
- `person_tags`

## Privacy and Security Requirements

- Every user-owned table must include `user_id`.
- RLS must restrict users to their own rows.
- The app must not expose other users' people, notes, interactions, or reminders.
- Deleting a person should delete related interactions and reminders.
- Sensitive notes should not be sent to analytics or console logs.

## Success Metrics

For a personal MVP, success can be measured by:

- User can add 10 people in under 10 minutes.
- User can log an interaction in under 30 seconds.
- Today screen clearly shows who needs attention.
- The app remains understandable without onboarding.
- The user wants to open it again the next day.

## Risks

- The app may feel too transactional if language and design are too CRM-like.
- Reminder and notification behavior can become noisy.
- Contact import can consume too much build time.
- Supabase RLS mistakes can expose private data if not tested.
- Follow-up logic can become confusing if too many states are introduced.

## Open Product Decisions

- Should the MVP require authentication, or support local-only mode first?
- Should people with no `last_contacted_at` be shown as due or as a separate onboarding group?
- Should reminders be in-app only for MVP, or should local notifications ship in version one?
- Should tags be included in MVP or postponed?
- Should phone/email fields launch native contact actions?
