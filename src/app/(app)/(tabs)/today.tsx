import { addDays, isBefore, parseISO } from "date-fns";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TodayBirthday from "../../../../components/today/today-birthday";
import TodayCheckIn from "../../../../components/today/today-check-in";
import TodayHeader from "../../../../components/today/today-header";
import TodayReminder from "../../../../components/today/today-reminder";
import TodayStartHabit from "../../../../components/today/today-start-habit";
import { Person } from "../../../../context/people-context";
import { Reminder } from "../../../../context/reminders-context";
import { nextBirthdayDate, todayStart } from "../../../../lib/dates";
import { partitionFollowUps } from "../../../../lib/followups";
import { useAuth } from "../../../../hooks/useAuth";
import { usePeople } from "../../../../hooks/usePeople";
import { useReminders } from "../../../../hooks/useReminders";

const BIRTHDAY_WINDOW_DAYS = 30;
const REMINDER_WINDOW_DAYS = 7;

export default function Today() {
  const { session } = useAuth();
  const { people, loading: peopleLoading, error: peopleError, findAllPeople } =
    usePeople();
  const {
    reminders,
    loading: remindersLoading,
    findAllReminders,
    setReminderStatus,
  } = useReminders();
  const [updatingReminderId, setUpdatingReminderId] = useState<string | null>(
    null,
  );

  useFocusEffect(
    useCallback(() => {
      findAllPeople();
      findAllReminders();
    }, [findAllPeople, findAllReminders]),
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

  const todayReminders = useMemo(() => {
    const windowEnd = addDays(today, REMINDER_WINDOW_DAYS);
    return reminders
      .filter((r) => r.status === "pending")
      .filter((r) => isBefore(parseISO(r.remind_at), windowEnd))
      .sort((a, b) => a.remind_at.localeCompare(b.remind_at));
  }, [reminders, today]);

  const personNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of people) map.set(p.id, p.name);
    return map;
  }, [people]);

  const handleReminderStatus = async (
    reminder: Reminder,
    status: "completed" | "dismissed",
  ) => {
    setUpdatingReminderId(reminder.id);
    const err = await setReminderStatus(reminder.id, status);
    setUpdatingReminderId(null);
    if (err) Alert.alert("Could not update", err.message);
  };

  if ((peopleLoading && people.length === 0) || !session) {
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

        {peopleError && people.length === 0 && (
          <View className="px-4">
            <Text className="text-red-500">{peopleError}</Text>
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
              Nobody&apos;s due right now. Enjoy the quiet.
            </Text>
          </View>
        )}

        {startHabit.length > 0 && <TodayStartHabit people={startHabit} />}

        {todayReminders.length > 0 ? (
          <TodayReminder
            reminders={todayReminders}
            personNameById={personNameById}
            onComplete={(r) => handleReminderStatus(r, "completed")}
            onDismiss={(r) => handleReminderStatus(r, "dismissed")}
            updatingId={updatingReminderId}
          />
        ) : (
          !remindersLoading && (
            <View className="p-4">
              <Text className="text-2xl font-semibold mb-2">
                Upcoming Reminders
              </Text>
              <Text className="text-textMuted">
                No reminders in the next {REMINDER_WINDOW_DAYS} days.
              </Text>
            </View>
          )
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
      </ScrollView>
    </SafeAreaView>
  );
}
