import React from "react";
import { FlatList, Text, View } from "react-native";
import TodayCheckInCard from "./today-check-in-card";

export default function TodayCheckIn({
  peopleCheckIn,
}: {
  peopleCheckIn: any[];
}) {
  return (
    <View className="p-4">
      <FlatList
        ListHeaderComponent={() => (
          <Text className="text-2xl font-semibold mb-4">
            People to check in with
          </Text>
        )}
        data={peopleCheckIn}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TodayCheckInCard item={item} />}
        ItemSeparatorComponent={() => <View className="h-4"></View>}
      />
    </View>
  );
}
