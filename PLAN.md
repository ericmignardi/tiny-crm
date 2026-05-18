# Tiny CRM Implementation Plan

## Build Strategy

Build the app around the core habit loop first:

1. Add people.
2. Log interactions.
3. See who is due for a check-in.
4. Create and complete reminders.

Everything else should support that loop or wait until later.

## Recommended MVP Scope

Ship in the first weekend:

- Expo app with Expo Router.
- Supabase Auth.
- Supabase tables and Row Level Security.
- Today screen.
- People list.
- Add/edit/delete person.
- Person detail.
- Log interaction.
- Automatic `last_contacted_at` updates.
- Follow-up cadence and due list.
- Basic reminders.
- Birthday field.
- Warm empty, loading, and error states.

Postpone:

- Contact import.
- AI prompts.
- Calendar integration.
- Widgets.
- Full offline sync.
- Data export.
- Complex recurring reminders.

## Weekend Timeline

### Friday Evening: Foundation

Goal: signed-in users can reach the empty app shell.

Tasks:

- Create Expo project.
- Install Expo Router.
- Set up app layout and navigation.
- Add Supabase client.
- Add environment variables.
- Create Supabase project.
- Create initial tables.
- Add RLS policies.
- Build sign in, sign up, and sign out flows.
- Add placeholder tabs: Today, People, Reminders, Settings.

Definition of done:

- User can sign up.
- User can sign in.
- User session persists.
- User can sign out.
- Authenticated user lands on Today.

### Saturday Morning: People CRUD

Goal: users can create and manage real people records.

Tasks:

- Build People list screen.
- Build Add Person screen.
- Build Edit Person screen.
- Build Person Detail screen.
- Add search by name.
- Add relationship type field.
- Add birthday field.
- Add notes field.
- Add preferred contact method.
- Add follow-up interval field.
- Add delete flow with confirmation.

Definition of done:

- User can create a person with a name.
- User can edit person details.
- User can delete a person.
- User can search people by name.
- Person detail displays saved data.

### Saturday Afternoon: Interaction Logging

Goal: the app remembers relationship history.

Tasks:

- Build Log Interaction screen.
- Add interaction type picker.
- Add date/time input.
- Add notes input.
- Save interaction to Supabase.
- Update related person's `last_contacted_at`.
- Show interaction timeline on Person Detail.
- Add quick log action from Person Detail.

Definition of done:

- User can log an interaction.
- Interaction appears in the person's history.
- Person's last contacted date updates automatically.

### Saturday Evening: Follow-Up Logic

Goal: the app can answer who needs attention.

Tasks:

- Create due-date utility functions.
- Calculate next follow-up date.
- Calculate due and overdue people.
- Build Today screen sections.
- Add "People to check in with" section.
- Add "Start the habit" section for people with cadence but no contact history.
- Sort due people by most overdue.
- Add quick action to log interaction from Today.

Definition of done:

- Today shows people due for check-in.
- Due status is based on `last_contacted_at` and `follow_up_interval_days`.
- People without a follow-up interval are excluded.

### Sunday Morning: Reminders and Birthdays

Goal: the app supports time-based memory aids.

Tasks:

- Build Reminders screen.
- Build Create Reminder flow.
- Add reminder status changes.
- Show upcoming reminders on Today.
- Show overdue reminders on Today.
- Show upcoming birthdays on Today.
- Optionally schedule local notifications with Expo Notifications.

Definition of done:

- User can create a reminder tied to a person.
- User can complete or dismiss a reminder.
- Today shows pending reminders.
- Today shows upcoming birthdays.

### Sunday Afternoon: Polish

Goal: the MVP feels like a real app.

Tasks:

- Add loading states.
- Add error states.
- Add empty states.
- Add form validation.
- Improve spacing, typography, and color.
- Add swipe or quick actions where useful.
- Add seed/demo data for manual testing if helpful.
- Review copy for warmth.

Definition of done:

- App is usable with no data.
- App is pleasant with sample data.
- Common errors are visible and recoverable.

### Sunday Evening: Hardening

Goal: the app is stable enough to keep using.

Tasks:

- Test sign up, sign in, and sign out.
- Test RLS by verifying users cannot access each other's rows.
- Test create/edit/delete people.
- Test interaction logging.
- Test due-date calculations.
- Test reminder completion and dismissal.
- Test on a physical device with Expo Go.
- Fix final UI overlap or navigation issues.
- Write setup notes.

Definition of done:

- No known blocker bugs in the core loop.
- App works on device.
- README explains setup.

## Suggested File Structure

```txt
app/
  (auth)/
    sign-in.tsx
    sign-up.tsx
  (tabs)/
    _layout.tsx
    index.tsx
    people.tsx
    reminders.tsx
    settings.tsx
  people/
    [id].tsx
    new.tsx
    [id]/edit.tsx
    [id]/log-interaction.tsx
  reminders/
    new.tsx
components/
  EmptyState.tsx
  PersonCard.tsx
  ReminderCard.tsx
  InteractionTimeline.tsx
  FormField.tsx
lib/
  supabase.ts
  dates.ts
  followups.ts
  notifications.ts
  validation.ts
services/
  people.ts
  interactions.ts
  reminders.ts
types/
  database.ts
  domain.ts
supabase/
  migrations/
```

## Implementation Notes

### Follow-Up Calculation

Keep follow-up logic out of screen components.

```ts
export function getNextFollowUpDate(
  lastContactedAt: string,
  intervalDays: number
): Date {
  return addDays(parseISO(lastContactedAt), intervalDays);
}

export function isDueForFollowUp(
  lastContactedAt: string,
  intervalDays: number,
  today = new Date()
): boolean {
  return !isAfter(getNextFollowUpDate(lastContactedAt, intervalDays), today);
}
```

### Interaction Save Flow

When saving an interaction:

1. Insert interaction.
2. Update the related person's `last_contacted_at`.
3. Refresh person detail and Today data.

If the insert succeeds but the person update fails, show an error and allow retry. A Supabase function or transaction can make this safer later.

### RLS Policy Shape

Every table with `user_id` should use policies equivalent to:

```sql
user_id = auth.uid()
```

For `person_tags`, access should be constrained through ownership of the related person and tag.

## Milestones

### Milestone 1: App Shell

- Expo app running.
- Navigation in place.
- Supabase connected.
- Auth working.

### Milestone 2: People

- People CRUD complete.
- Person detail complete.
- Search working.

### Milestone 3: Interactions

- Interaction logging complete.
- Timeline visible.
- Last contacted date updates.

### Milestone 4: Today

- Due people visible.
- Upcoming birthdays visible.
- Reminders visible.

### Milestone 5: Polish

- Empty states.
- Error states.
- Loading states.
- Device testing complete.

## Test Checklist

- New user can sign up.
- Existing user can sign in.
- User can sign out.
- User can create a person.
- User can edit a person.
- User can delete a person.
- User can search by name.
- User can log a text interaction.
- User can log a call interaction.
- Interaction updates last contacted date.
- Person with elapsed follow-up interval appears on Today.
- Person without follow-up interval does not appear as due.
- Person with follow-up interval and no contact date appears in the start section.
- User can create a reminder.
- User can complete a reminder.
- User can dismiss a reminder.
- Upcoming birthday appears on Today.
- Empty states appear when there is no data.
- RLS prevents access to another user's rows.

## Later Roadmap

### Version 1.1

- Tags and filters.
- Better reminder notifications.
- Contact actions for phone, SMS, and email.
- More detailed stats.

### Version 1.2

- Contact import.
- Data export.
- Weekly digest.
- Calendar integration.

### Version 2.0

- AI-generated follow-up prompts.
- Local-first offline sync.
- Encrypted notes.
- Home screen widget.
