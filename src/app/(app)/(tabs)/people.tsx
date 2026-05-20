import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar } from "../../../../components/avatar-picker";
import { PeopleHeader } from "../../../../components/people/people-header";
import { formatRelativeDate, todayStart } from "../../../../lib/dates";
import { isDueForFollowUp, overdueLabel } from "../../../../lib/followups";
import { usePeople } from "../../../../hooks/usePeople";

export default function People() {
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<string>("");

  const { people, loading, error, findAllPeople } = usePeople();

  useFocusEffect(
    useCallback(() => {
      findAllPeople();
    }, [findAllPeople]),
  );

  const handleFilter = (type: string) => {
    setFilter((current) => (current === type ? "" : type));
  };

  const today = useMemo(() => todayStart(), []);

  const visiblePeople = useMemo(
    () =>
      people.filter((p) => {
        const matchesFilter = !filter || p.relationship_type === filter;
        const matchesSearch =
          !search || p.name.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
      }),
    [people, filter, search],
  );

  if (loading && people.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 p-4">
        {error && people.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-4">
            <Text className="text-red-500 text-center">{error}</Text>
            <TouchableOpacity
              onPress={() => findAllPeople()}
              className="rounded-full px-4 py-2 bg-primary"
            >
              <Text className="text-background">Try again</Text>
            </TouchableOpacity>
          </View>
        ) : (
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
            renderItem={({ item }) => {
              const isOverdue =
                Boolean(item.follow_up_interval_days) &&
                Boolean(item.last_contacted_at) &&
                isDueForFollowUp(
                  item.last_contacted_at!,
                  item.follow_up_interval_days!,
                  today,
                );

              return (
                <TouchableOpacity
                  onPress={() => router.push(`/people-detail/${item.id}`)}
                  className="rounded-2xl shadow-md p-4 bg-backgroundCard mt-4"
                >
                  <View className="flex flex-row items-start gap-3">
                    <Avatar avatarUrl={item.avatar_url} name={item.name} size={48} />
                    <View className="flex-1">
                      <Text className="text-lg font-semibold">{item.name}</Text>
                      {item.relationship_type && (
                        <Text className="text-textMuted capitalize">
                          {item.relationship_type}
                        </Text>
                      )}
                      <Text className="text-sm text-textMuted mt-1">
                        Last contacted {formatRelativeDate(item.last_contacted_at)}
                      </Text>
                    </View>
                    {isOverdue && (
                      <View className="rounded-full px-3 py-1 bg-red-100">
                        <Text className="text-xs text-red-700">
                          {overdueLabel(
                            item.last_contacted_at!,
                            item.follow_up_interval_days!,
                            today,
                          )}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View className="h-4"></View>}
            ListEmptyComponent={() => (
              <TouchableOpacity
                className="p-4 rounded-2xl border border-dashed border-textMuted mt-4"
                onPress={() => router.push("/add-person")}
              >
                <View className="flex flex-col gap-2 items-center">
                  <View className="rounded-full size-12 flex items-center justify-center bg-primary">
                    <Ionicons
                      name="person-add"
                      size={24}
                      className="text-background"
                    />
                  </View>

                  <Text>
                    {search || filter
                      ? "No one matches that yet."
                      : "Welcome someone new."}
                  </Text>
                  <Text className="text-textMuted text-center">
                    {search || filter
                      ? "Try a different search or filter."
                      : "Add a new connection to your hearth."}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
