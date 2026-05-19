import { Redirect, Stack } from "expo-router";
import React from "react";
import { ActivityIndicator } from "react-native";
import { useAuth } from "../../../hooks/useAuth";

export default function AuthLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return <ActivityIndicator />;
  }

  if (session) {
    return <Redirect href={"/(app)/today"} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
