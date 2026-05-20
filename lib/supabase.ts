import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const isBrowser = typeof window !== "undefined";
const supportsStorage = Platform.OS !== "web" || isBrowser;

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase env vars. Copy .env.local.example to .env.local and set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: supportsStorage ? AsyncStorage : undefined,
    autoRefreshToken: supportsStorage,
    persistSession: supportsStorage,
    detectSessionInUrl: false,
  },
});
