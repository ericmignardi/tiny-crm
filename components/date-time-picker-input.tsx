import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

type DateTimePickerInputProps = {
  mode: "date" | "time";
  value: Date | null;
  onChange: (value: Date | null) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  allowClear?: boolean;
};

const formatValue = (value: Date | null, mode: "date" | "time"): string => {
  if (!value) return "";
  return mode === "date"
    ? format(value, "MMM d, yyyy")
    : format(value, "h:mm a");
};

export function DateTimePickerInput({
  mode,
  value,
  onChange,
  placeholder,
  minimumDate,
  maximumDate,
  allowClear,
}: DateTimePickerInputProps) {
  const [show, setShow] = useState<boolean>(false);

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== "ios") setShow(false);
    if (event.type === "dismissed") return;
    if (selected) onChange(selected);
  };

  const display = value ? formatValue(value, mode) : placeholder ?? "Select";

  return (
    <View className="flex flex-row items-center gap-2">
      <TouchableOpacity
        onPress={() => setShow(true)}
        className="flex-1 border border-textMuted px-4 py-3 rounded-md flex flex-row items-center justify-between"
      >
        <Text className={value ? "text-base" : "text-textMuted"}>{display}</Text>
        <Ionicons
          name={mode === "date" ? "calendar-outline" : "time-outline"}
          size={18}
          color="#6B7280"
        />
      </TouchableOpacity>

      {allowClear && value && (
        <TouchableOpacity
          onPress={() => onChange(null)}
          className="rounded-full p-2 bg-gray-200"
          accessibilityLabel="Clear date"
        >
          <Ionicons name="close" size={16} color="#374151" />
        </TouchableOpacity>
      )}

      {show && (
        <DateTimePicker
          value={value ?? new Date()}
          mode={mode}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleChange}
          display={Platform.OS === "ios" ? "inline" : "default"}
        />
      )}
    </View>
  );
}
