import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const isBrowser = typeof window !== "undefined";
const supportsStorage = Platform.OS !== "web" || isBrowser;

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage: supportsStorage ? AsyncStorage : undefined,
      autoRefreshToken: supportsStorage,
      persistSession: supportsStorage,
      detectSessionInUrl: false,
    },
  },
);
