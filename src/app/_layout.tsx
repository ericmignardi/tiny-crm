import { Inter_400Regular, useFonts } from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { AuthProvider } from "../../context/auth-context";
import { PeopleProvider } from "../../context/people-context";
import "../../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Inter-Regular": Inter_400Regular,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
      <PeopleProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="add-person" options={{ presentation: "modal" }} />
        </Stack>
      </PeopleProvider>
    </AuthProvider>
  );
}
