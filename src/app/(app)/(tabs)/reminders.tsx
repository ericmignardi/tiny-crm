import Ionicons from "@expo/vector-icons/Ionicons";
import { endOfDay, isBefore, parseISO, startOfDay } from "date-fns";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ReminderRow } from "../../../../components/reminders/reminder-row";
import { Reminder } from "../../../../context/reminders-context";
import { usePeople } from "../../../../hooks/usePeople";
import { useReminders } from "../../../../hooks/useReminders";

export default function Reminders() {
  const {
    reminders,
    loading,
    error,
    findAllReminders,
    setReminderStatus,
  } = useReminders();
  const { people, findAllPeople } = usePeople();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      findAllReminders();
      findAllPeople();
    }, [findAllReminders, findAllPeople]),
  );

  const personNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of people) map.set(p.id, p.name);
    return map;
  }, [people]);

  const { overdue, todayList, upcoming } = useMemo(() => {
    const now = new Date();
    const endToday = endOfDay(now);
    const startToday = startOfDay(now);
    const pending = reminders.filter((r) => r.status === "pending");

    const overdue: Reminder[] = [];
    const todayList: Reminder[] = [];
    const upcoming: Reminder[] = [];

    for (const reminder of pending) {
      const at = parseISO(reminder.remind_at);
      if (isBefore(at, startToday)) overdue.push(reminder);
      else if (isBefore(at, endToday)) todayList.push(reminder);
      else upcoming.push(reminder);
    }
    return { overdue, todayList, upcoming };
  }, [reminders]);

  const handleStatus = async (
    reminder: Reminder,
    status: "completed" | "dismissed",
  ) => {
    setUpdatingId(reminder.id);
    const err = await setReminderStatus(reminder.id, status);
    setUpdatingId(null);
    if (err) {
      Alert.alert("Could not update", err.message);
    }
  };

  const renderRow = (reminder: Reminder) => (
    <ReminderRow
      key={reminder.id}
      reminder={reminder}
      personName={personNameById.get(reminder.person_id)}
      onComplete={() => handleStatus(reminder, "completed")}
      onDismiss={() => handleStatus(reminder, "dismissed")}
      updating={updatingId === reminder.id}
    />
  );

  if (loading && reminders.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  const pendingCount = overdue.length + todayList.length + upcoming.length;

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 p-4">
        <View className="flex flex-row items-center justify-between mb-4">
          <Text className="text-3xl font-semibold">Reminders</Text>
          <TouchableOpacity
            onPress={() => router.push("/reminders/new")}
            className="rounded-full bg-primary p-2"
            accessibilityLabel="Create reminder"
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {error && reminders.length === 0 && (
          <View className="items-center gap-2 mb-4">
            <Text className="text-red-500">{error}</Text>
            <TouchableOpacity
              onPress={() => findAllReminders()}
              className="rounded-full px-4 py-2 bg-primary"
            >
              <Text className="text-background">Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        {pendingCount === 0 ? (
          <TouchableOpacity
            onPress={() => router.push("/reminders/new")}
            className="p-6 rounded-2xl border border-dashed border-textMuted flex flex-col items-center gap-2"
          >
            <View className="rounded-full size-12 bg-primary items-center justify-center">
              <Ionicons name="notifications" size={22} color="#fff" />
            </View>
            <Text className="font-semibold">No pending reminders</Text>
            <Text className="text-textMuted text-center">
              Tap to create a reminder for someone you care about.
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="flex flex-col gap-6">
            {overdue.length > 0 && (
              <View className="flex flex-col gap-3">
                <Text className="text-lg font-semibold">Overdue</Text>
                {overdue.map(renderRow)}
              </View>
            )}

            {todayList.length > 0 && (
              <View className="flex flex-col gap-3">
                <Text className="text-lg font-semibold">Today</Text>
                {todayList.map(renderRow)}
              </View>
            )}

            {upcoming.length > 0 && (
              <View className="flex flex-col gap-3">
                <Text className="text-lg font-semibold">Upcoming</Text>
                {upcoming.map(renderRow)}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
