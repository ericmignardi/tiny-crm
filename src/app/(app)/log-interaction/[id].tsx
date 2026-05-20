import Ionicons from "@expo/vector-icons/Ionicons";
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
import {
  Interaction,
  InteractionType,
} from "../../../../context/interactions-context";
import { Person } from "../../../../context/people-context";
import { useInteractions } from "../../../../hooks/useInteractions";
import { usePeople } from "../../../../hooks/usePeople";

const INTERACTION_OPTIONS: { value: InteractionType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "text", label: "Text", icon: "chatbubble-outline" },
  { value: "call", label: "Call", icon: "call-outline" },
  { value: "email", label: "Email", icon: "mail-outline" },
  { value: "in_person", label: "In person", icon: "people-outline" },
  { value: "video", label: "Video", icon: "videocam-outline" },
  { value: "other", label: "Other", icon: "ellipsis-horizontal-outline" },
];

const combineDateAndTime = (date: Date, time: Date): Date => {
  const result = new Date(date);
  result.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return result;
};

export default function LogInteraction() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { findPersonById, applyLastContactedAt } = usePeople();
  const { createInteraction } = useInteractions();

  const initialDate = useMemo(() => new Date(), []);

  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [type, setType] = useState<InteractionType>("text");
  const [date, setDate] = useState<Date | null>(initialDate);
  const [time, setTime] = useState<Date | null>(initialDate);
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      const { data, error } = await findPersonById(id);
      if (cancelled) return;
      if (error || !data) {
        setLoadError(error?.message ?? "Person not found");
      } else {
        setPerson(data);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, findPersonById]);

  const handleSave = async () => {
    if (!person) return;
    if (!date || !time) {
      Alert.alert("Date and time required", "Please choose when this happened.");
      return;
    }

    const happenedAt = combineDateAndTime(date, time);

    if (happenedAt.getTime() > Date.now() + 60_000) {
      Alert.alert(
        "Future date",
        "Interactions can't be logged for a future time.",
      );
      return;
    }

    setSaving(true);
    const result = await createInteraction({
      person_id: person.id,
      interaction_type: type,
      happened_at: happenedAt.toISOString(),
      notes: notes.trim() || null,
    });
    setSaving(false);

    if (result.error || !result.data) {
      Alert.alert("Could not save", result.error?.message ?? "Unknown error");
      return;
    }

    if (result.lastContactedAtUpdated) {
      const newDate = (result.data as Interaction).happened_at.slice(0, 10);
      applyLastContactedAt(person.id, newDate);
    }

    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (loadError || !person) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-4">
        <Text className="text-red-500">{loadError ?? "Person not found"}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 bg-backgroundCard rounded-2xl p-4 gap-4">
        <View className="flex flex-col items-center gap-1 mb-2">
          <Text className="text-textMuted">Logging for</Text>
          <Text className="text-2xl font-semibold">{person.name}</Text>
        </View>

        <View className="flex flex-col gap-2 mb-4">
          <Text className="text-lg font-semibold">How did you connect?</Text>
          <View className="flex flex-row flex-wrap gap-2">
            {INTERACTION_OPTIONS.map((option) => {
              const isActive = type === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setType(option.value)}
                  className={`rounded-full px-4 py-2 flex flex-row items-center gap-2 ${isActive ? "bg-primary" : "bg-gray-300"}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={`Interaction type: ${option.label}`}
                >
                  <Ionicons
                    name={option.icon}
                    size={16}
                    color={isActive ? "#fff" : "#374151"}
                  />
                  <Text className={isActive ? "text-background" : "text-gray-800"}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View className="flex flex-row gap-4 mb-4">
          <View className="flex-1 flex flex-col gap-2">
            <Text className="text-lg font-semibold">Date</Text>
            <DateTimePickerInput
              mode="date"
              value={date}
              onChange={setDate}
              maximumDate={new Date()}
            />
          </View>
          <View className="flex-1 flex flex-col gap-2">
            <Text className="text-lg font-semibold">Time</Text>
            <DateTimePickerInput mode="time" value={time} onChange={setTime} />
          </View>
        </View>

        <View className="flex flex-col gap-2 mb-4">
          <Text className="text-lg font-semibold">Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            className="border focus:outline-none border-textMuted px-4 py-2 rounded-md h-24 text-align-top"
            placeholder="What did you talk about? Anything to remember?"
            multiline
          />
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className={`rounded-full px-4 py-2 w-full ${saving ? "bg-gray-300" : "bg-primary"}`}
        >
          <Text
            className={`text-center ${saving ? "text-gray-600" : "text-background"}`}
          >
            {saving ? "Saving..." : "Save interaction"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
