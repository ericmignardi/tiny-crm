import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AvatarPicker } from "../../../../components/avatar-picker";
import { supabase } from "../../../../lib/supabase";
import { useAuth } from "../../../../hooks/useAuth";

export default function Settings() {
  const { signOut, session } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      let cancelled = false;
      (async () => {
        setLoading(true);
        const { data } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", session.user.id)
          .single();
        if (cancelled) return;
        setAvatarUrl((data as { avatar_url: string | null } | null)?.avatar_url ?? null);
        setLoading(false);
      })();
      return () => {
        cancelled = true;
      };
    }, [session]),
  );

  const handleSignOut = () => {
    Alert.alert("Sign out", "You'll need to sign in again to access your hearth.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: signOut },
    ]);
  };

  const handleAvatarUploaded = async (publicUrl: string) => {
    if (!session) return;
    setAvatarUrl(publicUrl);
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", session.user.id);
    if (error) {
      Alert.alert("Could not save photo", error.message);
    }
  };

  if (!session || loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 p-4">
        <Text className="text-3xl font-semibold mb-6">Settings</Text>

        <View className="rounded-2xl bg-backgroundCard shadow-md p-4 mb-4 items-center gap-2">
          <AvatarPicker
            avatarUrl={avatarUrl}
            userId={session.user.id}
            kind="profile"
            entityId={session.user.id}
            size={112}
            onUploaded={handleAvatarUploaded}
          />
          <Text className="text-base font-medium">{session.user.email}</Text>
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
