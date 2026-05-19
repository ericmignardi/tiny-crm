import Ionicons from "@expo/vector-icons/Ionicons";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Person } from "../../context/people-context";

type CheckInPerson = Pick<
  Person,
  "id" | "name" | "relationship_type" | "last_contacted_at"
>;

export default function TodayCheckInCard({ item }: { item: CheckInPerson }) {
  const router = useRouter();
  const goToDetail = () => router.push(`/people-detail/${item.id}`);

  const lastContactedLabel = item.last_contacted_at
    ? `${formatDistanceToNow(new Date(item.last_contacted_at), {
        addSuffix: true,
      })} since last contact`
    : "Never contacted";

  return (
    <View className="p-4 border border-gray-300 rounded-2xl flex flex-col justify-start">
      <View className="flex flex-col gap-4">
        <View className="flex flex-col gap-4">
          <View className="flex flex-row items-start justify-between">
            <View className="flex flex-row gap-4 items-center">
              {/* Profile Image */}
              <View className="rounded-full size-16 bg-blue-400"></View>
              {/* Profile Info */}
              <View className="flex flex-col gap-1">
                <Text className="text-2xl font-semibold">{item.name}</Text>
                {item.relationship_type && (
                  <Text className="text-sm px-2 py-1 bg-primary capitalize text-background rounded-full">
                    {item.relationship_type}
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity onPress={goToDetail}>
              <Ionicons name="ellipsis-vertical" size={20} />
            </TouchableOpacity>
          </View>

          <View className="flex flex-row items-center gap-1">
            <Ionicons
              name="time-outline"
              size={16}
              className="text-textMuted"
            />
            <Text className="capitalize text-sm text-textMuted">
              {lastContactedLabel}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={goToDetail}
          className="w-full bg-primary rounded-full p-2 items-center"
        >
          <Text className="font-medium text-background">Send a text</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
