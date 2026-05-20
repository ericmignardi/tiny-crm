import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePeople } from "../../../../hooks/usePeople";

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

const birthdayToIso = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, mm, dd, yyyy] = match;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
};

const isoToBirthday = (iso: string | null): string => {
  if (!iso) return "";
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const [, yyyy, mm, dd] = match;
  return `${mm}/${dd}/${yyyy}`;
};

export default function EditPerson() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { findPersonById, updatePerson } = usePeople();

  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState<string>("");
  const [relationship, setRelationship] = useState<RelationshipType | "">("");
  const [birthday, setBirthday] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [contactMethod, setContactMethod] = useState<ContactMethod | "">("");
  const [cadenceDays, setCadenceDays] = useState<CadenceDays | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      const { data, error } = await findPersonById(id);
      if (cancelled) return;
      if (error || !data) {
        setLoadError(error?.message ?? "Person not found");
        setLoading(false);
        return;
      }
      setName(data.name ?? "");
      setRelationship(
        (RELATIONSHIP_OPTIONS.some((o) => o.value === data.relationship_type)
          ? (data.relationship_type as RelationshipType)
          : "") as RelationshipType | "",
      );
      setBirthday(isoToBirthday(data.birthday));
      setPhone(data.phone ?? "");
      setEmail(data.email ?? "");
      setContactMethod(
        (CONTACT_METHOD_OPTIONS.some(
          (o) => o.value === data.preferred_contact_method,
        )
          ? (data.preferred_contact_method as ContactMethod)
          : "") as ContactMethod | "",
      );
      setCadenceDays(
        (CADENCE_OPTIONS.some((o) => o.value === data.follow_up_interval_days)
          ? (data.follow_up_interval_days as CadenceDays)
          : null) as CadenceDays | null,
      );
      setNotes(data.notes ?? "");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSelectRelationship = (value: RelationshipType) => {
    setRelationship((current) => (current === value ? "" : value));
  };

  const handleSelectContactMethod = (value: ContactMethod) => {
    setContactMethod((current) => (current === value ? "" : value));
  };

  const handleSelectCadence = (value: CadenceDays) => {
    setCadenceDays((current) => (current === value ? null : value));
  };

  const handleSave = async () => {
    if (!id) return;
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
    const { error } = await updatePerson(id, {
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

    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-4">
        <Text className="text-red-500">{loadError}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 bg-backgroundCard rounded-2xl p-4 gap-4">
        {/* Image */}
        <View className="flex flex-col items-center gap-2">
          <View className="rounded-full size-24 bg-primary flex items-center justify-center">
            <Ionicons name="person" size={24} className="text-background" />
          </View>
          <Text>Change photo</Text>
        </View>

        {/* Name */}
        <View className="flex flex-col gap-2 mb-4">
          <Text className="text-lg font-semibold">Name</Text>
          <TextInput
            className="border focus:outline-none border-textMuted px-4 py-2 rounded-md"
            placeholder="Who are we remembering?"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Relationship */}
        <View className="flex flex-col gap-2 mb-4">
          <Text className="text-lg font-semibold">Relationship</Text>
          <View className="flex flex-row items-center gap-2 flex-wrap">
            {RELATIONSHIP_OPTIONS.map(({ value, label }) => {
              const isActive = relationship === value;
              return (
                <TouchableOpacity
                  onPress={() => handleSelectRelationship(value)}
                  key={value}
                  className={`rounded-full px-4 py-2 ${isActive ? "bg-primary" : "bg-gray-300"}`}
                >
                  <Text className="text-background">{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Birthday */}
        <View className="flex flex-col gap-2 mb-4">
          <Text className="text-lg font-semibold">Birthday</Text>
          <TextInput
            value={birthday}
            onChangeText={setBirthday}
            className="border focus:outline-none border-textMuted px-4 py-2 rounded-md"
            placeholder="mm/dd/yyyy"
          />
        </View>

        {/* Phone */}
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

        {/* Email */}
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

        {/* Preferred Contact Method */}
        <View className="flex flex-col gap-2 mb-4">
          <Text className="text-lg font-semibold">
            Preferred Contact Method
          </Text>
          <View className="flex flex-row items-center gap-2 flex-wrap">
            {CONTACT_METHOD_OPTIONS.map(({ value, label }) => {
              const isActive = contactMethod === value;
              return (
                <TouchableOpacity
                  key={value}
                  onPress={() => handleSelectContactMethod(value)}
                  className={`rounded-full px-4 py-2 ${isActive ? "bg-primary" : "bg-gray-300"}`}
                >
                  <Text className="text-background">{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Follow Up Cadence */}
        <View className="flex flex-col gap-2 mb-4">
          <Text className="text-lg font-semibold">Follow Up Cadence</Text>
          <View className="flex flex-row items-center gap-2 flex-wrap">
            {CADENCE_OPTIONS.map(({ value, label }) => {
              const isActive = cadenceDays === value;
              return (
                <TouchableOpacity
                  key={value}
                  onPress={() => handleSelectCadence(value)}
                  className={`rounded-full px-4 py-2 ${isActive ? "bg-primary" : "bg-gray-300"}`}
                >
                  <Text className="text-background">{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notes */}
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

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className={`rounded-full px-4 py-2 w-full ${saving ? "bg-gray-300" : "bg-primary"}`}
        >
          <Text className="text-background text-center">
            {saving ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
