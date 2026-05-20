import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { PersonInput } from "../../context/people-context";

const RELATIONSHIP_OPTIONS = [
  { value: "friend", label: "Friend" },
  { value: "family", label: "Family" },
  { value: "work", label: "Colleague" },
] as const;

const CONTACT_METHOD_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "call", label: "Phone" },
  { value: "text", label: "Text" },
  { value: "in_person", label: "In person" },
] as const;

const CADENCE_OPTIONS = [
  { value: 7, label: "Weekly" },
  { value: 30, label: "Monthly" },
  { value: 90, label: "Quarterly" },
  { value: 365, label: "Yearly" },
] as const;

type RelationshipType = (typeof RELATIONSHIP_OPTIONS)[number]["value"];
type ContactMethod = (typeof CONTACT_METHOD_OPTIONS)[number]["value"];
type CadenceDays = (typeof CADENCE_OPTIONS)[number]["value"];

export type PersonFormInitialValues = {
  name?: string;
  relationship_type?: string | null;
  birthday?: string | null;
  phone?: string | null;
  email?: string | null;
  preferred_contact_method?: string | null;
  follow_up_interval_days?: number | null;
  notes?: string | null;
};

type PersonFormProps = {
  initialValues?: PersonFormInitialValues;
  submitLabel: string;
  photoLabel?: string;
  onSubmit: (values: PersonInput) => Promise<{ error: { message: string } | null }>;
  onSuccess: () => void;
};

const birthdayToIso = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, mm, dd, yyyy] = match;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
};

const isoToBirthday = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const [, yyyy, mm, dd] = match;
  return `${mm}/${dd}/${yyyy}`;
};

const coerceRelationship = (value?: string | null): RelationshipType | "" =>
  RELATIONSHIP_OPTIONS.some((o) => o.value === value)
    ? (value as RelationshipType)
    : "";

const coerceContactMethod = (value?: string | null): ContactMethod | "" =>
  CONTACT_METHOD_OPTIONS.some((o) => o.value === value)
    ? (value as ContactMethod)
    : "";

const coerceCadence = (value?: number | null): CadenceDays | null =>
  CADENCE_OPTIONS.some((o) => o.value === value) ? (value as CadenceDays) : null;

export function PersonForm({
  initialValues,
  submitLabel,
  photoLabel = "Add photo",
  onSubmit,
  onSuccess,
}: PersonFormProps) {
  const [name, setName] = useState<string>(initialValues?.name ?? "");
  const [relationship, setRelationship] = useState<RelationshipType | "">(
    coerceRelationship(initialValues?.relationship_type),
  );
  const [birthday, setBirthday] = useState<string>(
    isoToBirthday(initialValues?.birthday),
  );
  const [phone, setPhone] = useState<string>(initialValues?.phone ?? "");
  const [email, setEmail] = useState<string>(initialValues?.email ?? "");
  const [contactMethod, setContactMethod] = useState<ContactMethod | "">(
    coerceContactMethod(initialValues?.preferred_contact_method),
  );
  const [cadenceDays, setCadenceDays] = useState<CadenceDays | null>(
    coerceCadence(initialValues?.follow_up_interval_days),
  );
  const [notes, setNotes] = useState<string>(initialValues?.notes ?? "");
  const [saving, setSaving] = useState<boolean>(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter a name before saving.");
      return;
    }

    let birthdayIso: string | null = null;
    if (birthday.trim()) {
      birthdayIso = birthdayToIso(birthday);
      if (!birthdayIso) {
        Alert.alert("Invalid birthday", "Please use mm/dd/yyyy format.");
        return;
      }
    }

    setSaving(true);
    const { error } = await onSubmit({
      name: name.trim(),
      relationship_type: relationship || null,
      birthday: birthdayIso,
      phone: phone.trim() || null,
      email: email.trim() || null,
      preferred_contact_method: contactMethod || null,
      follow_up_interval_days: cadenceDays,
      notes: notes.trim() || null,
    });
    setSaving(false);

    if (error) {
      Alert.alert("Could not save", error.message);
      return;
    }

    onSuccess();
  };

  return (
    <ScrollView className="flex-1 bg-backgroundCard rounded-2xl p-4 gap-4">
      <View className="flex flex-col items-center gap-2">
        <View className="rounded-full size-24 bg-primary flex items-center justify-center">
          <Ionicons name="person" size={24} className="text-background" />
        </View>
        <Text>{photoLabel}</Text>
      </View>

      <View className="flex flex-col gap-2 mb-4">
        <Text className="text-lg font-semibold">Name</Text>
        <TextInput
          className="border focus:outline-none border-textMuted px-4 py-2 rounded-md"
          placeholder="Who are we remembering?"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View className="flex flex-col gap-2 mb-4">
        <Text className="text-lg font-semibold">Relationship</Text>
        <View className="flex flex-row items-center gap-2 flex-wrap">
          {RELATIONSHIP_OPTIONS.map(({ value, label }) => {
            const isActive = relationship === value;
            return (
              <TouchableOpacity
                onPress={() =>
                  setRelationship((current) => (current === value ? "" : value))
                }
                key={value}
                className={`rounded-full px-4 py-2 ${isActive ? "bg-primary" : "bg-gray-300"}`}
              >
                <Text className="text-background">{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View className="flex flex-col gap-2 mb-4">
        <Text className="text-lg font-semibold">Birthday</Text>
        <TextInput
          value={birthday}
          onChangeText={setBirthday}
          className="border focus:outline-none border-textMuted px-4 py-2 rounded-md"
          placeholder="mm/dd/yyyy"
        />
      </View>

      <View className="flex flex-col gap-2 mb-4">
        <Text className="text-lg font-semibold">Phone</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          className="border focus:outline-none border-textMuted px-4 py-2 rounded-md"
          placeholder="Enter phone number"
        />
      </View>

      <View className="flex flex-col gap-2 mb-4">
        <Text className="text-lg font-semibold">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          className="border focus:outline-none border-textMuted px-4 py-2 rounded-md"
          placeholder="Enter email address"
        />
      </View>

      <View className="flex flex-col gap-2 mb-4">
        <Text className="text-lg font-semibold">Preferred Contact Method</Text>
        <View className="flex flex-row items-center gap-2 flex-wrap">
          {CONTACT_METHOD_OPTIONS.map(({ value, label }) => {
            const isActive = contactMethod === value;
            return (
              <TouchableOpacity
                key={value}
                onPress={() =>
                  setContactMethod((current) =>
                    current === value ? "" : value,
                  )
                }
                className={`rounded-full px-4 py-2 ${isActive ? "bg-primary" : "bg-gray-300"}`}
              >
                <Text className="text-background">{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View className="flex flex-col gap-2 mb-4">
        <Text className="text-lg font-semibold">Follow Up Cadence</Text>
        <View className="flex flex-row items-center gap-2 flex-wrap">
          {CADENCE_OPTIONS.map(({ value, label }) => {
            const isActive = cadenceDays === value;
            return (
              <TouchableOpacity
                key={value}
                onPress={() =>
                  setCadenceDays((current) =>
                    current === value ? null : value,
                  )
                }
                className={`rounded-full px-4 py-2 ${isActive ? "bg-primary" : "bg-gray-300"}`}
              >
                <Text className="text-background">{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View className="flex flex-col gap-2 mb-4">
        <Text className="text-lg font-semibold">Notes</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          className="border focus:outline-none border-textMuted px-4 py-2 rounded-md h-24 text-align-top"
          placeholder="How did you meet them? What is important to them?"
          multiline
        />
      </View>

      <TouchableOpacity
        onPress={handleSave}
        disabled={saving}
        className={`rounded-full px-4 py-2 w-full ${saving ? "bg-gray-300" : "bg-primary"}`}
      >
        <Text className="text-background text-center">
          {saving ? "Saving..." : submitLabel}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
