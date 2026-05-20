import Ionicons from "@expo/vector-icons/Ionicons";
import { addDays } from "date-fns";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DateTimePickerInput } from "../../../../components/date-time-picker-input";
import { Person } from "../../../../context/people-context";
import { usePeople } from "../../../../hooks/usePeople";
import { useReminders } from "../../../../hooks/useReminders";

const combineDateAndTime = (date: Date, time: Date): Date => {
  const result = new Date(date);
  result.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return result;
};

export default function NewReminder() {
  const { personId: personIdParam } = useLocalSearchParams<{ personId?: string }>();
  const { people, findAllPeople, findPersonById } = usePeople();
  const { createReminder } = useReminders();

  const defaultRemindAt = useMemo(() => {
    const d = addDays(new Date(), 1);
    d.setHours(9, 0, 0, 0);
    return d;
  }, []);

  const [personId, setPersonId] = useState<string>(personIdParam ?? "");
  const [lockedPerson, setLockedPerson] = useState<Person | null>(null);
  const [title, setTitle] = useState<string>("");
  const [date, setDate] = useState<Date | null>(defaultRemindAt);
  const [time, setTime] = useState<Date | null>(defaultRemindAt);
  const [saving, setSaving] = useState<boolean>(false);
  const [loadingPerson, setLoadingPerson] = useState<boolean>(Boolean(personIdParam));

  useEffect(() => {
    if (personIdParam) {
      let cancelled = false;
      (async () => {
        const { data } = await findPersonById(personIdParam);
        if (cancelled) return;
        setLockedPerson(data);
        setLoadingPerson(false);
      })();
      return () => {
        cancelled = true;
      };
    } else {
      findAllPeople();
    }
  }, [personIdParam, findAllPeople, findPersonById]);

  const handleSave = async () => {
    if (!personId) {
      Alert.alert("Person required", "Choose who this reminder is for.");
      return;
    }
    if (!title.trim()) {
      Alert.alert("Title required", "Give the reminder a short title.");
      return;
    }
    if (!date || !time) {
      Alert.alert("Date and time required", "Pick when to be reminded.");
      return;
    }

    const remindAt = combineDateAndTime(date, time);

    setSaving(true);
    const { error } = await createReminder({
      person_id: personId,
      title: title.trim(),
      remind_at: remindAt.toISOString(),
    });
    setSaving(false);

    if (error) {
      Alert.alert("Could not save", error.message);
      return;
    }

    router.back();
  };

  if (loadingPerson) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 bg-backgroundCard rounded-2xl p-4">
        <View className="flex flex-col items-center gap-2 mb-4">
          <View className="rounded-full size-16 bg-primary items-center justify-center">
            <Ionicons name="notifications" size={24} color="#fff" />
          </View>
          <Text className="text-2xl font-semibold">New reminder</Text>
        </View>

        {lockedPerson ? (
          <View className="flex flex-col gap-2 mb-4">
            <Text className="text-lg font-semibold">For</Text>
            <View className="border border-gray-200 rounded-md px-4 py-3 bg-gray-50">
              <Text>{lockedPerson.name}</Text>
            </View>
          </View>
        ) : (
          <View className="flex flex-col gap-2 mb-4">
            <Text className="text-lg font-semibold">For</Text>
            {people.length === 0 ? (
              <Text className="text-textMuted">
                Add a person first before creating a reminder.
              </Text>
            ) : (
              <View className="flex flex-row flex-wrap gap-2">
                {people.map((p) => {
                  const isActive = personId === p.id;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => setPersonId(p.id)}
                      className={`rounded-full px-4 py-2 ${isActive ? "bg-primary" : "bg-gray-300"}`}
                    >
                      <Text className="text-background">{p.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        <View className="flex flex-col gap-2 mb-4">
          <Text className="text-lg font-semibold">What to remember</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            className="border focus:outline-none border-textMuted px-4 py-2 rounded-md"
            placeholder="e.g. Ask about the new job"
          />
        </View>

        <View className="flex flex-row gap-4 mb-4">
          <View className="flex-1 flex flex-col gap-2">
            <Text className="text-lg font-semibold">Date</Text>
            <DateTimePickerInput
              mode="date"
              value={date}
              onChange={setDate}
              minimumDate={new Date()}
            />
          </View>
          <View className="flex-1 flex flex-col gap-2">
            <Text className="text-lg font-semibold">Time</Text>
            <DateTimePickerInput mode="time" value={time} onChange={setTime} />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className={`rounded-full px-4 py-3 w-full ${saving ? "bg-gray-300" : "bg-primary"}`}
        >
          <Text className="text-background text-center font-medium">
            {saving ? "Saving..." : "Save reminder"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
