import { Link } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../hooks/useAuth";

export default function SignUp() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing info", "Please enter both email and password.");
      return;
    }
    setSubmitting(true);
    const error = await signUp(email.trim(), password);
    setSubmitting(false);
    if (error) {
      Alert.alert("Sign up failed", error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 p-4">
      <View className="flex-1 justify-center gap-4">
        <Text className="text-3xl font-bold">Create your account</Text>
        <TextInput
          className="border border-textMuted px-4 py-2 rounded-md"
          placeholder="Email"
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={setEmail}
        />
        <TextInput
          className="border border-textMuted px-4 py-2 rounded-md"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          className={`rounded-full px-4 py-3 ${submitting ? "bg-gray-300" : "bg-primary"}`}
        >
          <Text className="text-background text-center font-medium">
            {submitting ? "Creating..." : "Sign Up"}
          </Text>
        </TouchableOpacity>
        <Link href="/(auth)/sign-in" className="text-center text-textMuted">
          Already have an account? Sign in
        </Link>
      </View>
    </SafeAreaView>
  );
}
