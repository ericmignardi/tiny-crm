import {
  addYears,
  differenceInCalendarDays,
  formatDistanceToNowStrict,
  isBefore,
  parseISO,
  setYear,
  startOfDay,
} from "date-fns";

export const todayStart = (): Date => startOfDay(new Date());

export const nextBirthdayDate = (birthday: string, today = todayStart()): Date => {
  const parsed = startOfDay(parseISO(birthday));
  const thisYear = setYear(parsed, today.getFullYear());
  return isBefore(thisYear, today) ? addYears(thisYear, 1) : thisYear;
};

export const daysUntilNextBirthday = (
  birthday: string,
  today = todayStart(),
): number => differenceInCalendarDays(nextBirthdayDate(birthday, today), today);

export const birthdayLabel = (birthday: string, today = todayStart()): string => {
  const days = daysUntilNextBirthday(birthday, today);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return formatDistanceToNowStrict(nextBirthdayDate(birthday, today), {
    addSuffix: true,
  });
};

export const formatBirthdayShort = (iso: string | null): string => {
  if (!iso) return "—";
  const parsed = parseISO(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

export const formatRelativeDate = (iso: string | null): string => {
  if (!iso) return "Never";
  return formatDistanceToNowStrict(parseISO(iso), { addSuffix: true });
};
