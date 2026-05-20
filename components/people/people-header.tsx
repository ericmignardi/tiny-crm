import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

type PeopleHeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
  filter: string;
  onFilterChange: (type: string) => void;
};

const FILTER_OPTIONS = [
  { type: "", label: "All" },
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
      <View className="flex flex-row items-center justify-between">
        <Text className="text-3xl font-semibold">People</Text>
        <TouchableOpacity
          onPress={() => router.push("/add-person")}
          className="rounded-full bg-primary p-2"
          accessibilityLabel="Add person"
        >
          <Ionicons name="person-add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View className="flex flex-row items-center gap-2 rounded-full bg-background border border-gray-300 px-4 py-2">
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          className="focus:outline-none flex-1"
          value={search}
          onChangeText={onSearchChange}
          placeholder="Find someone..."
        />
      </View>

      <View className="flex flex-row gap-2 items-center flex-wrap">
        {FILTER_OPTIONS.map((filterOption) => {
          const isActive = filter === filterOption.type;
          return (
            <TouchableOpacity
              key={filterOption.type}
              className={`rounded-full px-3 py-2 ${isActive ? "bg-primary" : "bg-gray-300"}`}
              onPress={() => onFilterChange(filterOption.type)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Filter by ${filterOption.label}`}
            >
              <Text className="text-background">{filterOption.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
