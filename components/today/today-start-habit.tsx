import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { StartHabitPerson } from "../../lib/followups";

const formatCadence = (days: number): string => {
  if (days === 7) return "Weekly";
  if (days === 30) return "Monthly";
  if (days === 90) return "Quarterly";
  if (days === 365) return "Yearly";
  return `Every ${days} days`;
};

function StartHabitCard({ item }: { item: StartHabitPerson }) {
  const goToLog = () => router.push(`/log-interaction/${item.id}`);
  const goToDetail = () => router.push(`/people-detail/${item.id}`);

  return (
    <View className="p-4 border border-gray-300 rounded-2xl flex flex-col gap-3">
      <View className="flex flex-row items-start justify-between">
        <View className="flex flex-row gap-4 items-center flex-1">
          <View className="rounded-full size-16 bg-emerald-200 items-center justify-center">
            <Ionicons name="sparkles" size={20} color="#047857" />
          </View>
          <View className="flex flex-col gap-1 flex-1">
            <Text className="text-xl font-semibold">{item.name}</Text>
            <View className="flex flex-row gap-2">
              {item.relationship_type && (
                <Text className="text-xs px-2 py-1 bg-primary capitalize text-background rounded-full self-start">
                  {item.relationship_type}
                </Text>
              )}
              <Text className="text-xs text-textMuted self-center">
                {formatCadence(item.follow_up_interval_days)}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={goToDetail} accessibilityLabel="Person details">
          <Ionicons name="ellipsis-vertical" size={20} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={goToLog}
        className="w-full bg-primary rounded-full p-2 items-center"
      >
        <Text className="font-medium text-background">Log first interaction</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function TodayStartHabit({
  people,
}: {
  people: StartHabitPerson[];
}) {
  return (
    <View className="p-4 flex flex-col gap-4">
      <Text className="text-2xl font-semibold">Start the habit</Text>
      {people.map((person) => (
        <StartHabitCard key={person.id} item={person} />
      ))}
    </View>
  );
}
