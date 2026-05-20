import Ionicons from "@expo/vector-icons/Ionicons";
import { format, parseISO } from "date-fns";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { Interaction } from "../../context/interactions-context";

const TYPE_LABELS: Record<Interaction["interaction_type"], string> = {
  text: "Text",
  call: "Call",
  email: "Email",
  in_person: "In person",
  video: "Video call",
  other: "Other",
};

const TYPE_ICONS: Record<
  Interaction["interaction_type"],
  keyof typeof Ionicons.glyphMap
> = {
  text: "chatbubble-outline",
  call: "call-outline",
  email: "mail-outline",
  in_person: "people-outline",
  video: "videocam-outline",
  other: "ellipsis-horizontal-outline",
};

type InteractionTimelineProps = {
  personId: string;
  interactions: Interaction[] | undefined;
  loading: boolean;
  error: string | null;
};

export function InteractionTimeline({
  personId,
  interactions,
  loading,
  error,
}: InteractionTimelineProps) {
  const list = interactions ?? [];

  if (loading && list.length === 0) {
    return (
      <View className="bg-backgroundCard rounded-2xl shadow-md p-4">
        <Text className="text-textMuted">Loading history…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-backgroundCard rounded-2xl shadow-md p-4">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  if (list.length === 0) {
    return (
      <TouchableOpacity
        onPress={() => router.push(`/log-interaction/${personId}`)}
        className="p-4 rounded-2xl border border-dashed border-textMuted flex flex-col items-center gap-2"
      >
        <View className="rounded-full size-10 bg-primary items-center justify-center">
          <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
        </View>
        <Text className="font-semibold">No history yet</Text>
        <Text className="text-textMuted text-center">
          Log your first interaction to start their story.
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View className="bg-backgroundCard rounded-2xl shadow-md p-4 flex flex-col gap-4">
      <Text className="text-lg font-semibold">History</Text>
      {list.map((interaction) => (
        <View
          key={interaction.id}
          className="flex flex-row gap-3 items-start"
        >
          <View className="rounded-full size-10 bg-primary items-center justify-center">
            <Ionicons
              name={TYPE_ICONS[interaction.interaction_type]}
              size={18}
              color="#fff"
            />
          </View>
          <View className="flex-1 flex flex-col gap-1">
            <View className="flex flex-row items-center justify-between">
              <Text className="font-semibold">
                {TYPE_LABELS[interaction.interaction_type]}
              </Text>
              <Text className="text-sm text-textMuted">
                {format(parseISO(interaction.happened_at), "MMM d, yyyy")}
              </Text>
            </View>
            {interaction.notes && (
              <Text className="text-sm text-gray-700">{interaction.notes}</Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}
