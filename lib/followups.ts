import {
  addDays,
  differenceInCalendarDays,
  isBefore,
  parseISO,
  startOfDay,
} from "date-fns";
import { Person } from "../context/people-context";
import { todayStart } from "./dates";

export const getNextFollowUpDate = (
  lastContactedAt: string,
  intervalDays: number,
): Date => addDays(startOfDay(parseISO(lastContactedAt)), intervalDays);

export const isDueForFollowUp = (
  lastContactedAt: string,
  intervalDays: number,
  today = todayStart(),
): boolean => !isBefore(today, getNextFollowUpDate(lastContactedAt, intervalDays));

export const daysOverdue = (
  lastContactedAt: string,
  intervalDays: number,
  today = todayStart(),
): number =>
  differenceInCalendarDays(today, getNextFollowUpDate(lastContactedAt, intervalDays));

export const overdueLabel = (
  lastContactedAt: string,
  intervalDays: number,
  today = todayStart(),
): string => {
  const days = daysOverdue(lastContactedAt, intervalDays, today);
  if (days <= 0) return "Due today";
  if (days === 1) return "1 day overdue";
  return `${days} days overdue`;
};

export type CheckInPerson = Person & {
  last_contacted_at: string;
  follow_up_interval_days: number;
};

export type StartHabitPerson = Person & {
  last_contacted_at: null;
  follow_up_interval_days: number;
};

export const partitionFollowUps = (
  people: Person[],
  today = todayStart(),
): { checkIn: CheckInPerson[]; startHabit: StartHabitPerson[] } => {
  const checkIn: CheckInPerson[] = [];
  const startHabit: StartHabitPerson[] = [];

  for (const person of people) {
    if (!person.follow_up_interval_days) continue;
    if (!person.last_contacted_at) {
      startHabit.push(person as StartHabitPerson);
      continue;
    }
    if (
      isDueForFollowUp(
        person.last_contacted_at,
        person.follow_up_interval_days,
        today,
      )
    ) {
      checkIn.push(person as CheckInPerson);
    }
  }

  checkIn.sort(
    (a, b) =>
      daysOverdue(b.last_contacted_at, b.follow_up_interval_days, today) -
      daysOverdue(a.last_contacted_at, a.follow_up_interval_days, today),
  );
  startHabit.sort((a, b) => a.name.localeCompare(b.name));

  return { checkIn, startHabit };
};
