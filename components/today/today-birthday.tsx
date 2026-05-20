import { Text, View } from "react-native";
import TodayBirthdayCard from "./today-birthday-card";

type BirthdayPerson = {
  id: string;
  name: string;
  birthday: string;
};

export default function TodayBirthday({
  peopleBirthday,
}: {
  peopleBirthday: BirthdayPerson[];
}) {
  return (
    <View className="p-4 flex flex-col gap-4">
      <Text className="text-2xl font-semibold">Upcoming Birthdays</Text>
      {peopleBirthday.map((person) => (
        <TodayBirthdayCard key={person.id} item={person} />
      ))}
    </View>
  );
}
