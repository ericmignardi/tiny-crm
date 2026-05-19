import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

type PeopleHeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
  filter: string;
  onFilterChange: (type: string) => void;
};

const FILTER_OPTIONS = [
  { type: "", label: "All Connections" },
  { type: "friend", label: "Friends" },
  { type: "family", label: "Family" },
  { type: "work", label: "Colleagues" },
];

export const PeopleHeader = ({
  search,
  onSearchChange,
  filter,
  onFilterChange,
}: PeopleHeaderProps) => {
  return (
    <View className="flex flex-col gap-4">
      <View className="flex flex-row items-center gap-2 rounded-full bg-background border border-gray-300 px-4 py-2">
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          className="focus:outline-none flex-1"
          value={search}
          onChangeText={onSearchChange}
          placeholder="Find someone..."
        />
      </View>

      <View className="flex flex-row gap-2 items-center">
        {FILTER_OPTIONS.map((filterOption) => {
          const isActive = filter === filterOption.type;
          return (
            <TouchableOpacity
              key={filterOption.type}
              className={`rounded-full px-2 py-2 ${isActive ? "bg-primary" : "bg-gray-300"}`}
              onPress={() => onFilterChange(filterOption.type)}
            >
              <Text className="text-background">{filterOption.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
