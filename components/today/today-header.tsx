import { Session } from "@supabase/supabase-js";
import React from "react";
import { Text, View } from "react-native";

export default function TodayHeader({ session }: { session: Session }) {
  return (
    <View className="flex flex-col gap-2 p-4">
      <Text className="text-4xl font-semibold">
        Good morning, {session.user.email}
      </Text>
      <Text className="text-lg text-textMuted">
        Here's who might appreciate hearing from you today.
      </Text>
    </View>
  );
}
