import { Text, View } from "react-native";
import { CheckInPerson } from "../../lib/followups";
import TodayCheckInCard from "./today-check-in-card";

export default function TodayCheckIn({
  peopleCheckIn,
}: {
  peopleCheckIn: CheckInPerson[];
}) {
  return (
    <View className="p-4 flex flex-col gap-4">
      <Text className="text-2xl font-semibold">People to check in with</Text>
      {peopleCheckIn.map((person) => (
        <TodayCheckInCard key={person.id} item={person} />
      ))}
    </View>
  );
}
