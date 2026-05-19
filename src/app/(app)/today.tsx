import { addDays, addYears, isBefore, parseISO, startOfDay } from "date-fns";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TodayBirthday from "../../../components/today/today-birthday";
import TodayCheckIn from "../../../components/today/today-check-in";
import TodayHeader from "../../../components/today/today-header";
import TodayReminder from "../../../components/today/today-reminder";
import { Person } from "../../../context/people-context";
import { useAuth } from "../../../hooks/useAuth";
import { usePeople } from "../../../hooks/usePeople";

const BIRTHDAY_WINDOW_DAYS = 30;

const isDueForCheckIn = (p: Person, today: Date): boolean => {
  if (!p.follow_up_interval_days) return false;
  if (!p.last_contacted_at) return true;
  const last = startOfDay(parseISO(p.last_contacted_at));
  const due = addDays(last, p.follow_up_interval_days);
  return !isBefore(today, due);
};

const nextBirthdayDate = (birthday: string, today: Date): Date => {
  const parsed = startOfDay(parseISO(birthday));
  const thisYear = new Date(
    today.getFullYear(),
    parsed.getMonth(),
    parsed.getDate(),
  );
  return isBefore(thisYear, today) ? addYears(thisYear, 1) : thisYear;
};

export default function Today() {
  const { session } = useAuth();
  const { people, loading, findAllPeople } = usePeople();

  useFocusEffect(
    useCallback(() => {
      findAllPeople();
    }, []),
  );

  const today = useMemo(() => startOfDay(new Date()), []);

  const checkInPeople = useMemo(
    () => people.filter((p) => isDueForCheckIn(p, today)),
    [people, today],
  );

  const birthdayPeople = useMemo(() => {
    const windowEnd = addDays(today, BIRTHDAY_WINDOW_DAYS);
    return people
      .filter((p): p is Person & { birthday: string } => Boolean(p.birthday))
      .filter((p) => {
        const next = nextBirthdayDate(p.birthday, today);
        return !isBefore(windowEnd, next);
      })
      .sort(
        (a, b) =>
          nextBirthdayDate(a.birthday, today).getTime() -
          nextBirthdayDate(b.birthday, today).getTime(),
      );
  }, [people, today]);

  if (!session || loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1">
        <TodayHeader session={session} />

        {checkInPeople.length > 0 ? (
          <TodayCheckIn peopleCheckIn={checkInPeople} />
        ) : (
          <View className="p-4">
            <Text className="text-2xl font-semibold mb-2">
              People to check in with
            </Text>
            <Text className="text-textMuted">
              Nobody's due right now. Enjoy the quiet.
            </Text>
          </View>
        )}

        {birthdayPeople.length > 0 ? (
          <TodayBirthday peopleBirthday={birthdayPeople} />
        ) : (
          <View className="p-4">
            <Text className="text-2xl font-semibold mb-2">
              Upcoming Birthdays
            </Text>
            <Text className="text-textMuted">
              No birthdays in the next {BIRTHDAY_WINDOW_DAYS} days.
            </Text>
          </View>
        )}

        <TodayReminder peopleReminder={[]} />
      </ScrollView>
    </SafeAreaView>
  );
}
