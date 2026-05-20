import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { Avatar } from "../avatar-picker";
import { formatRelativeDate } from "../../lib/dates";
import { CheckInPerson, overdueLabel } from "../../lib/followups";

export default function TodayCheckInCard({ item }: { item: CheckInPerson }) {
  const goToDetail = () => router.push(`/people-detail/${item.id}`);
  const goToLog = () => router.push(`/log-interaction/${item.id}`);

  return (
    <View className="p-4 border border-gray-300 rounded-2xl flex flex-col gap-4">
      <View className="flex flex-row items-start justify-between">
        <View className="flex flex-row gap-4 items-center flex-1">
          <Avatar avatarUrl={item.avatar_url} name={item.name} size={64} />
          <View className="flex flex-col gap-1 flex-1">
            <Text className="text-xl font-semibold">{item.name}</Text>
            {item.relationship_type && (
              <Text className="text-sm px-2 py-1 bg-primary capitalize text-background rounded-full self-start">
                {item.relationship_type}
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity onPress={goToDetail} accessibilityLabel="Person details">
          <Ionicons name="ellipsis-vertical" size={20} />
        </TouchableOpacity>
      </View>

      <View className="flex flex-row items-center justify-between">
        <View className="flex flex-row items-center gap-1">
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text className="text-sm text-textMuted">
            Last contacted {formatRelativeDate(item.last_contacted_at)}
          </Text>
        </View>
        <View className="rounded-full px-3 py-1 bg-red-100">
          <Text className="text-xs text-red-700">
            {overdueLabel(item.last_contacted_at, item.follow_up_interval_days)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={goToLog}
        className="w-full bg-primary rounded-full p-2 items-center"
      >
        <Text className="font-medium text-background">Log interaction</Text>
      </TouchableOpacity>
    </View>
  );
}
