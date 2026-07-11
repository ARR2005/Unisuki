import React from "react";
import { Text, View } from "react-native";

export default function Home() {
  return (
    // Use `bg-transparent` to allow the layout's background image to show through.
    // We can also center the content for now.
    <View className="flex-1 items-center justify-center bg-transparent">
      <Text className="text-white text-2xl">Home Screen</Text>
    </View>
  );
}
