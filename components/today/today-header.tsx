import { Session } from "@supabase/supabase-js";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

const greetingFor = (date = new Date()): string => {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const displayName = (session: Session): string => {
  const email = session.user.email ?? "";
  return email.split("@")[0] || "friend";
};

export default function TodayHeader({ session }: { session: Session }) {
  return (
    <View className="flex flex-row items-start justify-between p-4">
      <View className="flex-1 flex flex-col gap-2">
        <Text className="text-3xl font-semibold">
          {greetingFor()}, {displayName(session)}
        </Text>
        <Text className="text-base text-textMuted">
          Here&apos;s who might appreciate hearing from you today.
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => router.push("/add-person")}
        className="rounded-full bg-primary p-2 mt-1"
        accessibilityLabel="Add person"
      >
        <Ionicons name="person-add" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
