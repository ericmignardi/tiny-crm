import Ionicons from "@expo/vector-icons/Ionicons";
import { format, parseISO } from "date-fns";
import { Reminder } from "../../context/reminders-context";

import { Text, TouchableOpacity, View } from "react-native";

type ReminderRowProps = {
  reminder: Reminder;
  personName: string | undefined;
  onComplete: () => void;
  onDismiss: () => void;
  updating?: boolean;
};

export function ReminderRow({
  reminder,
  personName,
  onComplete,
  onDismiss,
  updating,
}: ReminderRowProps) {
  return (
    <View className="rounded-2xl bg-backgroundCard shadow-md p-4 flex flex-col gap-3">
      <View className="flex flex-row items-start gap-3">
        <View className="rounded-full size-10 bg-primary items-center justify-center">
          <Ionicons name="notifications" size={18} color="#fff" />
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-base">{reminder.title}</Text>
          <Text className="text-sm text-textMuted">
            {personName ? `${personName} · ` : ""}
            {format(parseISO(reminder.remind_at), "MMM d, yyyy 'at' h:mm a")}
          </Text>
        </View>
      </View>
      <View className="flex flex-row gap-2">
        <TouchableOpacity
          onPress={onComplete}
          disabled={updating}
          className={`flex-1 rounded-full py-2 items-center ${updating ? "bg-gray-300" : "bg-primary"}`}
        >
          <Text className="text-background font-medium">Complete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDismiss}
          disabled={updating}
          className="flex-1 rounded-full py-2 items-center bg-gray-200"
        >
          <Text className="text-gray-800 font-medium">Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
