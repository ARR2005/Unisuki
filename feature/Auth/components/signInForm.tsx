import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import useSignIn from "@/feature/Auth/hooks/useSignIn";
import ForgotPasswordModal from "@/feature/components/forgotPasswordModal";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [savePassword, setSavePassword] = useState(false);

  const isDark = useColorScheme() === "dark";
  const { signIn, isLoading, error } = useSignIn();

  async function handleSignIn() {
    setLocalError(null);

    if (!email.trim() || !password.trim()) {
      setLocalError("Please enter your email and password.");
      return;
    }

    try {
      await signIn(email.trim(), password, {
        persistLogin: savePassword,
      });

      router.replace("/(validationScreen)");
    } catch (firebaseError: any) {
      setLocalError(firebaseError?.message ?? "Sign in failed.");
    }
  }

  const displayError = localError ?? error;

  return (
    <View className="w-full">
      <View className="mb-4 items-center">
        <Text
          className={`text-2xl font-bold tracking-widest text-center ${
            isDark ? "text-white" : "text-black"
          }`}
        >
          Welcome Back
        </Text>
        <Text className={`text-center ${isDark ? "text-white" : "text-black"}`}>
          Sign in to continue
        </Text>
      </View>

      <View className="mx-2 gap-2">
        <View
          className={`flex-row items-center rounded-2xl border px-4 py-3 ${
            isDark
              ? "border-white/40 bg-white/20"
              : "border-black/20 bg-white/70"
          }`}
        >
          <Ionicons
            name="mail-outline"
            size={20}
            color={isDark ? "white" : "black"}
          />
          <TextInput
            placeholder="Email"
            placeholderTextColor={isDark ? "#ccc" : "#6b7280"}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            className={`ml-3 flex-1 ${isDark ? "text-white" : "text-black"}`}
          />
        </View>

        <View
          className={`flex-row items-center rounded-2xl border px-4 py-3 ${
            isDark
              ? "border-white/40 bg-white/20"
              : "border-black/20 bg-white/70"
          }`}
        >
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={isDark ? "white" : "black"}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor={isDark ? "#ccc" : "#6b7280"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className={`ml-3 flex-1 ${isDark ? "text-white" : "text-black"}`}
          />
        </View>

        <View className="flex-column items-start gap-2 justify-between">
          <TouchableOpacity
            className="self-end"
            onPress={() => setShowForgotModal(true)}
          >
            <Text className="font-semibold text-red-500">Forgot Password?</Text>
          </TouchableOpacity>

          <ForgotPasswordModal
            open={showForgotModal}
            onClose={() => setShowForgotModal(false)}
          />

          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => setSavePassword((prev) => !prev)}
          >
            <View
              className={`mr-2.5 h-6 w-6 items-center justify-center rounded-md border ${
                savePassword
                  ? "border-green-600 bg-green-600"
                  : isDark
                    ? "border-white/60"
                    : "border-black/60"
              }`}
            >
              {savePassword ? (
                <Ionicons name="checkmark" size={16} color="white" />
              ) : (
                <Ionicons
                  name="scan-outline"
                  size={18}
                  color="rgba(0,0,0,0.1)"
                />
              )}
            </View>

            <Text
              className={`ml-3 font-semibold ${isDark ? "text-white" : "text-black"}`}
            >
              Remember Sign In Details
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className={`rounded-2xl px-4 py-4 ${
            isLoading ? "bg-green-700" : "bg-green-600"
          }`}
          onPress={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="ml-2 font-semibold text-white">
                Signing In...
              </Text>
            </View>
          ) : (
            <Text className="text-center font-semibold text-white">
              Sign In
            </Text>
          )}
        </TouchableOpacity>

        {displayError ? (
          <Text className="text-center font-semibold text-red-500">
            {displayError}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
