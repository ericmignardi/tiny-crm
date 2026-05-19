import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../../hooks/useAuth";

export default function Settings() {
  const { signOut, loading } = useAuth();

  return (
    <View>
      <Text>Settings</Text>
      <TouchableOpacity onPress={signOut} disabled={loading}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
