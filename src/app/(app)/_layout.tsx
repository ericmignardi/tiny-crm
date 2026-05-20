import { Stack } from "expo-router";
import React from "react";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="people-detail/[id]" />
      <Stack.Screen
        name="add-person"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="edit-person/[id]"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="log-interaction/[id]"
        options={{ presentation: "modal" }}
      />
    </Stack>
  );
}
