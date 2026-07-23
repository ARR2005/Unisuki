import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";

interface ProductActionButtonsProps {
  isReserving: boolean;
  isInitiatingChat: boolean;
  onReserve: () => void;
  onContactSeller: () => void;
  isDark: boolean;
}

export const ProductActionButtons: React.FC<ProductActionButtonsProps> = ({
  isReserving,
  isInitiatingChat,
  onReserve,
  onContactSeller,
  isDark,
}) => {
  return (
    <View className="mt-8 mb-6 gap-3">
      <TouchableOpacity
        className={`w-full px-4 py-4 rounded-xl shadow-sm bg-emerald-600 ${
          isReserving ? "opacity-70" : ""
        }`}
        onPress={onReserve}
        disabled={isReserving}
      >
        {isReserving ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text className="text-center text-white font-bold text-lg">
            Reserve
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className={`w-full border px-4 py-4 rounded-xl ${
          isDark
            ? "border-slate-700 bg-slate-800"
            : "border-gray-200 bg-white"
        }`}
        onPress={onContactSeller}
        disabled={isInitiatingChat}
      >
        {isInitiatingChat ? (
          <ActivityIndicator
            color={isDark ? "#fff" : "#000"}
            size="small"
          />
        ) : (
          <Text
            className={`text-center font-bold text-lg ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            Chat with seller
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};