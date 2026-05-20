import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PersonForm } from "../../../../components/people/person-form";
import { Person } from "../../../../context/people-context";
import { useAuth } from "../../../../hooks/useAuth";
import { usePeople } from "../../../../hooks/usePeople";

export default function EditPerson() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { findPersonById, updatePerson } = usePeople();

  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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
      } else {
        setPerson(data);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, findPersonById]);

  if (loading || !session) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (loadError || !person) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-4">
        <Text className="text-red-500">{loadError ?? "Person not found"}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <PersonForm
        initialValues={person}
        submitLabel="Save changes"
        userId={session.user.id}
        entityId={person.id}
        onSubmit={async (values) => {
          const { error } = await updatePerson(person.id, values);
          return { error };
        }}
        onSuccess={() => router.back()}
      />
    </SafeAreaView>
  );
}
