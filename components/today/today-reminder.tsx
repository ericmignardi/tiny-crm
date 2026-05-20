import { Reminder } from "../../context/reminders-context";
import { Text, View } from "react-native";
import TodayReminderCard from "./today-reminder-card";

type TodayReminderProps = {
  reminders: Reminder[];
  personNameById: Map<string, string>;
  onComplete: (reminder: Reminder) => void;
  onDismiss: (reminder: Reminder) => void;
  updatingId: string | null;
};

export default function TodayReminder({
  reminders,
  personNameById,
  onComplete,
  onDismiss,
  updatingId,
}: TodayReminderProps) {
  return (
    <View className="p-4 flex flex-col gap-4">
      <Text className="text-2xl font-semibold">Upcoming Reminders</Text>
      {reminders.map((reminder) => (
        <TodayReminderCard
          key={reminder.id}
          reminder={reminder}
          personName={personNameById.get(reminder.person_id)}
          onComplete={() => onComplete(reminder)}
          onDismiss={() => onDismiss(reminder)}
          updating={updatingId === reminder.id}
        />
      ))}
    </View>
  );
}
