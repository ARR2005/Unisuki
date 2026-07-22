import React, { useState } from "react";
import { Text, View } from "react-native";
import Header from "@/components/header";

export default function Home() {
  // 1. Create a state to hold the mode ('buyer' | 'seller')
  const [activeMode, setActiveMode] = useState<"buyer" | "seller">("buyer");

  return (
    <View className="flex-1 justify-start bg-transparent">
      {/* 2. Pass the handler to receive the updated mode */}
      <Header
        activeMode={activeMode}
        onModeChange={(mode) => setActiveMode(mode)}
      />

      {/* 3. Conditional logic based on mode */}
      <View className="flex-1 p-5">
        {activeMode === "buyer" ? (
          <View>
            <
          </View>
        ) : (
          <View>
            <Text className="text-lg font-bold text-gray-800">
              Seller Dashboard
            </Text>

          </View>
        )}
      </View>
    </View>
  );
}