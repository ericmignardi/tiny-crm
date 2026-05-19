import React from "react";
import { FlatList, Text, View } from "react-native";
import TodayBirthdayCard from "./today-birthday-card";

export default function TodayBirthday({
  peopleBirthday,
}: {
  peopleBirthday: any[];
}) {
  return (
    <View className="p-4">
      <FlatList
        ListHeaderComponent={() => (
          <Text className="text-2xl font-semibold mb-4">
            Upcoming Birthdays
          </Text>
        )}
        data={peopleBirthday}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TodayBirthdayCard item={item} />}
        ItemSeparatorComponent={() => <View className="h-4"></View>}
      />
    </View>
  );
}
