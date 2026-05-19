import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PeopleHeader } from "../../../components/people/people-header";
import { useAuth } from "../../../hooks/useAuth";
import { usePeople } from "../../../hooks/usePeople";

export default function People() {
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<string>("");

  const { loading: authLoading } = useAuth();
  const { people, loading, error, findAllPeople } = usePeople();

  useFocusEffect(
    useCallback(() => {
      findAllPeople();
    }, []),
  );

  const handleFilter = (type: string) => {
    setFilter((current) => (current === type ? "" : type));
  };

  const visiblePeople = people.filter((p) => {
    const matchesFilter = !filter || p.relationship_type === filter;
    const matchesSearch =
      !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (authLoading || loading) {
    return <ActivityIndicator />;
  }

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 p-4">
        <FlatList
          ListHeaderComponent={
            <PeopleHeader
              search={search}
              onSearchChange={setSearch}
              filter={filter}
              onFilterChange={handleFilter}
            />
          }
          data={visiblePeople}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/people-detail/${item.id}`)}
              className="rounded-2xl shadow-md p-4 bg-backgroundCard mt-4"
            >
              <Text className="text-lg font-semibold">{item.name}</Text>
              {item.relationship_type && (
                <Text className="text-textMuted capitalize">
                  {item.relationship_type}
                </Text>
              )}
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View className="h-4"></View>}
          ListEmptyComponent={() => (
            <TouchableOpacity
              className="p-4 rounded-2xl border border-dashed border-textMuted mt-4"
              onPress={() => router.push("/add-person")}
            >
              {error && (
                <Text className="text-center text-red-500 mb-2">{error}</Text>
              )}

              <View className="flex flex-col gap-2 items-center">
                <View className="rounded-full size-12 flex items-center justify-center bg-primary">
                  <Ionicons
                    name="person-add"
                    size={24}
                    className="text-background"
                  />
                </View>

                <Text>Welcome someone new.</Text>
                <Text className="text-textMuted">
                  Add a new connection to your hearth.
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
