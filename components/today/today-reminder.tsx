import React from "react";
import { FlatList, Text, View } from "react-native";
import TodayReminderCard from "./today-reminder-card";

export default function TodayReminder({
  peopleReminder,
}: {
  peopleReminder: any[];
}) {
  return (
    <View className="p-4">
      <FlatList
        ListHeaderComponent={() => (
          <Text className="text-2xl font-semibold mb-4">
            Upcoming Reminders
          </Text>
        )}
        data={peopleReminder}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TodayReminderCard item={item} />}
        ItemSeparatorComponent={() => <View className="h-4"></View>}
      />
    </View>
  );
}
