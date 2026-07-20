import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function ValidationScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-2xl font-semibold text-black">
        Please verify your account
      </Text>
      <Text className="mt-2 text-center text-gray-600">
        Check your email inbox and confirm your account to continue.
      </Text>

      <TouchableOpacity
        className="mt-6 rounded-xl bg-green-600 px-6 py-3"
        onPress={() => router.replace("/(auth)")}
      >
        <Text className="font-semibold text-white">Back to Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}
