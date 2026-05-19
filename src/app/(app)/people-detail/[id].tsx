import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Person } from "../../../../context/people-context";
import { usePeople } from "../../../../hooks/usePeople";

const CONTACT_METHOD_LABELS: Record<string, string> = {
  text: "Text",
  call: "Call",
  email: "Email",
  in_person: "In person",
  video: "Video",
  other: "Other",
};

const formatCadence = (days: number | null): string => {
  if (!days) return "—";
  if (days === 7) return "Weekly";
  if (days === 30) return "Monthly";
  if (days === 90) return "Quarterly";
  if (days === 365) return "Yearly";
  return `Every ${days} days`;
};

const formatBirthday = (iso: string | null): string => {
  if (!iso) return "—";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

export default function PeopleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { findPersonById, deletePerson } = usePeople();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await findPersonById(id);
      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else {
        setPerson(data);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDelete = () => {
    if (!person) return;
    Alert.alert(
      "Delete person",
      `Remove ${person.name} from your hearth?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            const err = await deletePerson(person.id);
            setDeleting(false);
            if (err) {
              Alert.alert("Could not delete", err.message);
              return;
            }
            router.back();
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (error || !person) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-4">
        <Text className="text-red-500">{error ?? "Person not found"}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 p-4 flex flex-col gap-4">
        <View className="flex flex-col items-center gap-4">
          <View className="rounded-full size-28 bg-primary"></View>

          <Text className="text-2xl font-bold">{person.name}</Text>

          {person.relationship_type && (
            <Text className="rounded-full text-sm text-background bg-primary px-4 py-2 capitalize">
              {person.relationship_type}
            </Text>
          )}
        </View>

        <View className="flex flex-row flex-wrap gap-4 bg-backgroundCard rounded-2xl shadow-md p-4">
          <View className="flex flex-col gap-2 w-1/2">
            <Text className="text-sm text-textMuted">Birthday</Text>
            <Text>
              <Ionicons name="calendar" size={16} />{" "}
              {formatBirthday(person.birthday)}
            </Text>
          </View>

          <View className="flex flex-col gap-1 w-1/2">
            <Text className="text-sm text-textMuted">Preferred</Text>
            <Text>
              <Ionicons name="chatbubble" size={16} />{" "}
              {person.preferred_contact_method
                ? CONTACT_METHOD_LABELS[person.preferred_contact_method]
                : "—"}
            </Text>
          </View>

          <View className="flex flex-col gap-1 w-1/2">
            <Text className="text-sm text-textMuted">Cadence</Text>
            <Text>
              <Ionicons name="refresh" size={16} />{" "}
              {formatCadence(person.follow_up_interval_days)}
            </Text>
          </View>

          <View className="flex flex-col gap-1 w-1/2">
            <Text className="text-sm text-textMuted">Last Connected</Text>
            <Text>{person.last_contacted_at ?? "—"}</Text>
          </View>

          {person.phone && (
            <View className="flex flex-col gap-1 w-1/2">
              <Text className="text-sm text-textMuted">Phone</Text>
              <Text>{person.phone}</Text>
            </View>
          )}

          {person.email && (
            <View className="flex flex-col gap-1 w-1/2">
              <Text className="text-sm text-textMuted">Email</Text>
              <Text>{person.email}</Text>
            </View>
          )}
        </View>

        {person.notes && (
          <View className="bg-backgroundCard rounded-2xl shadow-md p-4 flex flex-col gap-2">
            <Text className="text-sm text-textMuted">Notes</Text>
            <Text>{person.notes}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleDelete}
          disabled={deleting}
          className={`rounded-full px-4 py-2 w-full ${deleting ? "bg-gray-300" : "bg-red-500"}`}
        >
          <Text className="text-white text-center">
            {deleting ? "Deleting..." : "Delete"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
