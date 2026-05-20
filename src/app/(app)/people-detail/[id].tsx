import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar } from "../../../../components/avatar-picker";
import { InteractionTimeline } from "../../../../components/people/interaction-timeline";
import { Person } from "../../../../context/people-context";
import { formatBirthdayShort, formatRelativeDate } from "../../../../lib/dates";
import { useInteractions } from "../../../../hooks/useInteractions";
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
  if (!days) return "No cadence set";
  if (days === 7) return "Weekly";
  if (days === 30) return "Monthly";
  if (days === 90) return "Quarterly";
  if (days === 365) return "Yearly";
  return `Every ${days} days`;
};

export default function PeopleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { findPersonById, deletePerson } = usePeople();
  const {
    interactionsByPerson,
    loadingByPerson,
    errorByPerson,
    findInteractionsByPersonId,
  } = useInteractions();

  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const reloadPerson = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const { data, error } = await findPersonById(id);
    if (error) {
      setError(error.message);
    } else {
      setPerson(data);
    }
    setLoading(false);
  }, [id, findPersonById]);

  useFocusEffect(
    useCallback(() => {
      reloadPerson();
      if (id) findInteractionsByPersonId(id);
    }, [id, reloadPerson, findInteractionsByPersonId]),
  );

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
  }, [id, findPersonById]);

  const handleDelete = () => {
    if (!person) return;
    Alert.alert("Delete person", `Remove ${person.name} from your hearth?`, [
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
    ]);
  };

  if (loading && !person) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (error || !person) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-4">
        <Text className="text-red-500 mb-4 text-center">
          {error ?? "Person not found"}
        </Text>
        <TouchableOpacity
          onPress={reloadPerson}
          className="rounded-full px-4 py-2 bg-primary"
        >
          <Text className="text-background">Try again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const interactions = interactionsByPerson[person.id];
  const interactionsLoading = loadingByPerson[person.id] ?? false;
  const interactionsError = errorByPerson[person.id] ?? null;

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 p-4">
        <View className="flex flex-col gap-4">
          <View className="flex flex-col items-center gap-3">
            <Avatar avatarUrl={person.avatar_url} name={person.name} size={112} />
            <Text className="text-2xl font-bold">{person.name}</Text>
            {person.relationship_type && (
              <Text className="rounded-full text-sm text-background bg-primary px-4 py-2 capitalize">
                {person.relationship_type}
              </Text>
            )}
          </View>

          <View className="flex flex-row gap-2">
            <TouchableOpacity
              onPress={() => router.push(`/log-interaction/${person.id}`)}
              className="flex-1 rounded-full px-4 py-3 bg-primary flex flex-row items-center justify-center gap-2"
            >
              <Ionicons name="chatbubble-ellipses" size={16} color="#fff" />
              <Text className="text-background font-semibold">Log</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/reminders/new",
                  params: { personId: person.id },
                })
              }
              className="rounded-full p-3 bg-gray-200"
              accessibilityLabel="Create reminder"
            >
              <Ionicons name="notifications" size={18} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(`/edit-person/${person.id}`)}
              className="rounded-full p-3 bg-gray-200"
              accessibilityLabel="Edit person"
            >
              <Ionicons name="pencil" size={18} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              disabled={deleting}
              className={`rounded-full p-3 ${deleting ? "bg-gray-300" : "bg-red-100"}`}
              accessibilityLabel="Delete person"
            >
              <Ionicons name="trash" size={18} color="#B91C1C" />
            </TouchableOpacity>
          </View>

          <View className="flex flex-row flex-wrap gap-4 bg-backgroundCard rounded-2xl shadow-md p-4">
            <View className="flex flex-col gap-1 w-[47%]">
              <Text className="text-sm text-textMuted">Birthday</Text>
              <Text>
                <Ionicons name="calendar" size={16} />{" "}
                {formatBirthdayShort(person.birthday)}
              </Text>
            </View>

            <View className="flex flex-col gap-1 w-[47%]">
              <Text className="text-sm text-textMuted">Preferred</Text>
              <Text>
                <Ionicons name="chatbubble" size={16} />{" "}
                {person.preferred_contact_method
                  ? CONTACT_METHOD_LABELS[person.preferred_contact_method]
                  : "Not set"}
              </Text>
            </View>

            <View className="flex flex-col gap-1 w-[47%]">
              <Text className="text-sm text-textMuted">Cadence</Text>
              <Text>
                <Ionicons name="refresh" size={16} />{" "}
                {formatCadence(person.follow_up_interval_days)}
              </Text>
            </View>

            <View className="flex flex-col gap-1 w-[47%]">
              <Text className="text-sm text-textMuted">Last connected</Text>
              <Text>{formatRelativeDate(person.last_contacted_at)}</Text>
            </View>

            <View className="flex flex-col gap-1 w-[47%]">
              <Text className="text-sm text-textMuted">Phone</Text>
              <Text>{person.phone ?? "Not added"}</Text>
            </View>

            <View className="flex flex-col gap-1 w-[47%]">
              <Text className="text-sm text-textMuted">Email</Text>
              <Text>{person.email ?? "Not added"}</Text>
            </View>
          </View>

          <View className="bg-backgroundCard rounded-2xl shadow-md p-4 flex flex-col gap-2">
            <Text className="text-sm text-textMuted">Notes</Text>
            <Text>
              {person.notes ?? "No notes yet. Tap edit to add some context."}
            </Text>
          </View>

          <InteractionTimeline
            personId={person.id}
            interactions={interactions}
            loading={interactionsLoading}
            error={interactionsError}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
