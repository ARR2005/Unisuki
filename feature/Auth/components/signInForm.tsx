import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function SignInForm() {
  const isDark = useColorScheme() === "dark";
  const [savePassword, setSavePassword] = useState(false);

  return (
    <View className="w-full">
      <View className="items-center mb-4">
        <Text
          className={`text-2xl font-bold tracking-widest text-center ${isDark ? "text-white" : "text-black"}`}
        >
          Sign IN
        </Text>
        <Text className={`text-center ${isDark ? "text-white" : "text-black"}`}>
          Welcome  back! 
        </Text>
      </View>

      {/* Input fields wrapper */}
      <View className="space-y-4 mx-2">
        {/* Email input */}
        <View className="flex-row items-center bg-white/30 py-3 px-4 my-1 rounded-2xl border border-white/30">
          <Ionicons
            name="mail-outline"
            size={20}
            color={isDark ? "white" : "black"}
          />
          <TextInput
            placeholder="Email"
            className={`flex-1 ml-3 ${isDark ? "text-white" : "text-black"}`}
            placeholderTextColor={isDark ? "#ccc" : "#000"}
            // value={email}
            // onChangeText={setEmail}
          />
        </View>

        {/* Password input */}
        <View className="flex-row items-center bg-white/30 py-3 px-4 my-1 rounded-2xl border border-white/30">
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
            // value={password}
            // onChangeText={setPassword}
          />
        </View>

        <View className=" flex-row items-center justify-between pt-2 px-2">

            <TouchableOpacity
              onPress={() => setSavePassword((prev) => !prev)}
              className="flex-row items-center py-1"
              activeOpacity={1}
            >
              <View className={`w-6 h-6 rounded-md border items-center justify-center mr-4 ${savePassword ? "bg-green-600 border-green-600" : isDark ? "border-white/60" : "border-black/60"}`}>
                {savePassword ? (
                  <Ionicons name="checkmark" size={18} color="white" />
                ) : 
                  <Ionicons name="scan-outline" size={18} color="rgba(0,0,0,0.1)" />
                }
              </View>

              <Text className={`ml-2 text-base font-medium ${isDark ? "text-white" : "text-black"}`}>
                Save password
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              // onPress={onForgotPasswordPress}
              className="py-1"
              activeOpacity={0.7}
            >
              <Text className={`font-semibold text-base ${isDark ? "text-white" : "text-black"}`}>
                Forgot <Text className="text-green-600">password?</Text>
              </Text>
            </TouchableOpacity>
        </View>
      </View>

      {/* Submit button */}
      <TouchableOpacity
        className="mx-2 mt-6"
        // onPress={onButtonPress}
      >
        <View className="bg-green-600 py-4 rounded-2xl shadow-lg active:bg-green-700">
          <Text className="text-white text-center font-bold text-lg">
            Sign in
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
