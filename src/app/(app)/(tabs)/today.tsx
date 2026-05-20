import { addDays, isBefore } from "date-fns";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TodayBirthday from "../../../../components/today/today-birthday";
import TodayCheckIn from "../../../../components/today/today-check-in";
import TodayHeader from "../../../../components/today/today-header";
import TodayStartHabit from "../../../../components/today/today-start-habit";
import { Person } from "../../../../context/people-context";
import { nextBirthdayDate, todayStart } from "../../../../lib/dates";
import { partitionFollowUps } from "../../../../lib/followups";
import { useAuth } from "../../../../hooks/useAuth";
import { usePeople } from "../../../../hooks/usePeople";

const BIRTHDAY_WINDOW_DAYS = 30;

export default function Today() {
  const { session } = useAuth();
  const { people, loading, error, findAllPeople } = usePeople();

  useFocusEffect(
    useCallback(() => {
      findAllPeople();
    }, [findAllPeople]),
  );

  const today = useMemo(() => todayStart(), []);

  const { checkIn, startHabit } = useMemo(
    () => partitionFollowUps(people, today),
    [people, today],
  );

  const birthdayPeople = useMemo(() => {
    const windowEnd = addDays(today, BIRTHDAY_WINDOW_DAYS);
    return people
      .filter((p): p is Person & { birthday: string } => Boolean(p.birthday))
      .filter((p) => !isBefore(windowEnd, nextBirthdayDate(p.birthday, today)))
      .sort(
        (a, b) =>
          nextBirthdayDate(a.birthday, today).getTime() -
          nextBirthdayDate(b.birthday, today).getTime(),
      );
  }, [people, today]);

  if ((loading && people.length === 0) || !session) {
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

        {error && people.length === 0 && (
          <View className="px-4">
            <Text className="text-red-500">{error}</Text>
          </View>
        )}

        {checkIn.length > 0 ? (
          <TodayCheckIn peopleCheckIn={checkIn} />
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

        {startHabit.length > 0 && <TodayStartHabit people={startHabit} />}

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
      </ScrollView>
    </SafeAreaView>
  );
}
