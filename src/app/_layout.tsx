import { Inter_400Regular, useFonts } from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { AuthProvider } from "../../context/auth-context";
import { InteractionsProvider } from "../../context/interactions-context";
import { PeopleProvider } from "../../context/people-context";
import "../../global.css";
import { useAuth } from "../../hooks/useAuth";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, loading } = useAuth();
  const [loaded, error] = useFonts({
    "Inter-Regular": Inter_400Regular,
  });

  useEffect(() => {
    if ((loaded || error) && !loading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, loading]);

  if ((!loaded && !error) || loading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PeopleProvider>
        <InteractionsProvider>
          <RootNavigator />
        </InteractionsProvider>
      </PeopleProvider>
    </AuthProvider>
  );
}
