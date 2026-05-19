import Ionicons from "@expo/vector-icons/Ionicons";
import {
  addYears,
  differenceInCalendarDays,
  formatDistanceToNowStrict,
  isBefore,
  setYear,
  startOfDay,
} from "date-fns";
import React from "react";
import { Text, View } from "react-native";

type ItemType = {
  id: string;
  name: string;
  birthday: string;
};

function nextBirthday(birthday: string): Date {
  const today = startOfDay(new Date());
  const thisYear = setYear(startOfDay(new Date(birthday)), today.getFullYear());
  return isBefore(thisYear, today) ? addYears(thisYear, 1) : thisYear;
}

function birthdayLabel(birthday: string): string {
  const next = nextBirthday(birthday);
  const days = differenceInCalendarDays(next, startOfDay(new Date()));
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return formatDistanceToNowStrict(next, { addSuffix: true });
}

export default function TodayBirthdayCard({ item }: { item: ItemType }) {
  return (
    <View className="p-4 border border-gray-300 rounded-2xl">
      <View className="flex flex-row justify-between items-center">
        <View className="flex flex-row items-center gap-4">
          <View className="size-16 rounded-full bg-yellow-100 flex justify-center items-center">
            <Ionicons name="planet-outline" size={24} color="#FBBF24" />
          </View>

          <View className="flex flex-col gap-1">
            <Text className="text-xl">{item.name}'s Birthday</Text>
            <Text className="text-textMuted">{birthdayLabel(item.birthday)}</Text>
          </View>
        </View>

        <View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </View>
      </View>
    </View>
  );
}
