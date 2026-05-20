import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { birthdayLabel } from "../../lib/dates";

type ItemType = {
  id: string;
  name: string;
  birthday: string;
};

export default function TodayBirthdayCard({ item }: { item: ItemType }) {
  return (
    <TouchableOpacity
      onPress={() => router.push(`/people-detail/${item.id}`)}
      className="p-4 border border-gray-300 rounded-2xl"
    >
      <View className="flex flex-row justify-between items-center">
        <View className="flex flex-row items-center gap-4 flex-1">
          <View className="size-16 rounded-full bg-yellow-100 flex justify-center items-center">
            <Ionicons name="gift-outline" size={24} color="#FBBF24" />
          </View>

          <View className="flex flex-col gap-1 flex-1">
            <Text className="text-xl">{item.name}'s Birthday</Text>
            <Text className="text-textMuted">{birthdayLabel(item.birthday)}</Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );
}
