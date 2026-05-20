import { router } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PersonForm } from "../../../components/people/person-form";
import { useAuth } from "../../../hooks/useAuth";
import { usePeople } from "../../../hooks/usePeople";

export default function AddPerson() {
  const { session } = useAuth();
  const { createPerson } = usePeople();

  const tempEntityId = useMemo(
    () => `new-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    [],
  );

  if (!session) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <PersonForm
        submitLabel="Save"
        userId={session.user.id}
        entityId={tempEntityId}
        onSubmit={async (values) => {
          const { error } = await createPerson(values);
          return { error };
        }}
        onSuccess={() => router.back()}
      />
    </SafeAreaView>
  );
}
