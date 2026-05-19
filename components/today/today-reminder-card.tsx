import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Text, View } from "react-native";

type ItemType = {
  id: string;
  name: string;
  reminder: string;
};

export default function TodayReminderCard({ item }: { item: ItemType }) {
  return (
    <View className="p-4 border border-gray-300 rounded-2xl">
      <View className="flex flex-row gap-4 items-center">
        <View className="size-16 rounded-full bg-yellow-100 flex justify-center items-center">
          <Ionicons name="planet-outline" size={24} color="#FBBF24" />
        </View>

        <View className="flex flex-col gap-1">
          <Text className="text-xl">{item.name}'s Reminder</Text>
          <Text className="text-textMuted">{item.reminder}</Text>
        </View>
      </View>
    </View>
  );
}
