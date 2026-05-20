import Ionicons from "@expo/vector-icons/Ionicons";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../../hooks/useAuth";

export default function Settings() {
  const { signOut, session } = useAuth();

  const handleSignOut = () => {
    Alert.alert("Sign out", "You'll need to sign in again to access your hearth.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 p-4">
        <Text className="text-3xl font-semibold mb-6">Settings</Text>

        <View className="rounded-2xl bg-backgroundCard shadow-md p-4 mb-4">
          <Text className="text-sm text-textMuted mb-1">Signed in as</Text>
          <Text className="text-base font-medium">
            {session?.user.email ?? "—"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleSignOut}
          className="rounded-2xl bg-backgroundCard shadow-md p-4 flex flex-row items-center justify-between"
        >
          <View className="flex flex-row items-center gap-3">
            <View className="rounded-full size-10 bg-red-100 items-center justify-center">
              <Ionicons name="log-out-outline" size={20} color="#B91C1C" />
            </View>
            <Text className="text-base font-medium text-red-700">Sign out</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
