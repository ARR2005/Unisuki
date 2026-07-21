import {
  useColorScheme,
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSignUp } from "@/feature/Auth/hooks/useSignUp";
import { useEmailVerification } from "@/feature/Auth/hooks/useEmailVerification";

const validateSignUpInputs = (
  email: string,
  password: string,
  confirmPassword: string,
): string | null => {
  if (!email || !password || !confirmPassword) {
    return "All fields are required.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters long.";
  }

  return null;
};

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const isDark = useColorScheme() === "dark";

  const { signUp, isSigningUp, error: signUpError } = useSignUp();
  const {
    sendVerificationEmail,
    isSendingVerification,
    error: verificationError,
    successMessage,
  } = useEmailVerification();

  const isLoading = isSigningUp || isSendingVerification;
  const errorMessage = validationError ?? signUpError ?? verificationError;

  async function handleSignUp() {
    setValidationError(null);

    const currentValidationError = validateSignUpInputs(
      email,
      password,
      confirmPassword,
    );

    if (currentValidationError) {
      setValidationError(currentValidationError);
      return;
    }

    try {
      const user = await signUp(email, password);
      await sendVerificationEmail(user);
    } catch {
      // Errors are already handled in the hooks
    }
  }

  return (
    <View className="w-full">
      <View className="items-center mb-4">
        <Text
          className={`text-2xl font-bold tracking-widest text-center ${
            isDark ? "text-white" : "text-black"
          }`}
        >
          Create an  Account
        </Text>
        <Text className={`text-center ${isDark ? "text-white" : "text-black"}`}>
          Come and join our campus marketplace.
        </Text>
      </View>

      <View className="space-y-4 mx-2 gap-2">
        <View
          className={`flex-row items-center bg-white/30 py-1 px-4 my-1 rounded-2xl border ${
            isDark ? "border-white" : "border-black/30"
          }`}
        >
          <Ionicons
            name="mail-outline"
            size={20}
            color={isDark ? "white" : "black"}
          />
          <TextInput
            placeholder="Email"
            className={`flex-1 ml-3 ${isDark ? "text-white" : "text-black"}`}
            placeholderTextColor={isDark ? "#ccc" : "#000"}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View
          className={`flex-row items-center bg-white/30 py-1 px-4 my-1 rounded-2xl border ${
            isDark ? "border-white" : "border-black/30"
          }`}
        >
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={isDark ? "white" : "black"}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            className={`flex-1 ml-3 ${isDark ? "text-white" : "text-black"}`}
            placeholderTextColor={isDark ? "#ccc" : "#000"}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View
          className={`flex-row items-center bg-white/30 py-1 px-4 my-1 rounded-2xl border ${
            isDark ? "border-white" : "border-black/30"
          }`}
        >
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={isDark ? "white" : "black"}
          />
          <TextInput
            placeholder="Confirm Password"
            secureTextEntry
            className={`flex-1 ml-3 ${isDark ? "text-white" : "text-black"}`}
            placeholderTextColor={isDark ? "#ccc" : "#000"}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <TouchableOpacity
          className={`mx-8 mt-2 rounded-2xl overflow-hidden ${isLoading ? "opacity-70" : ""}`}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          <View
            className={`py-2 rounded-2xl shadow-lg ${
              isLoading ? "bg-green-700" : "bg-green-600 rounded-2xl"
            }`}
          >
            {isLoading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white text-center font-bold text-lg ml-2">
                  Creating...
                </Text>
              </View>
            ) : (
              <Text className="text-white text-center font-bold text-lg">
                Sign Up
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {errorMessage && (
          <Text className="text-red-500 text-center font-semibold mx-2">
            {errorMessage}
          </Text>
        )}

        {successMessage && (
          <Text className="text-green-500 text-center font-semibold mx-2">
            {successMessage}
          </Text>
        )}
      </View>
    </View>
  );
}
