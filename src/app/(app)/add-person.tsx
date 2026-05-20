import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { PersonForm } from "../../../components/people/person-form";
import { usePeople } from "../../../hooks/usePeople";

export default function AddPerson() {
  const { createPerson } = usePeople();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <PersonForm
        submitLabel="Save"
        photoLabel="Add photo"
        onSubmit={async (values) => {
          const { error } = await createPerson(values);
          return { error };
        }}
        onSuccess={() => router.back()}
      />
    </SafeAreaView>
  );
}
