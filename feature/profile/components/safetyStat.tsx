import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View, useColorScheme } from "react-native";

interface SafetyStatProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  isVerified?: boolean;
}

const SafetyStat: React.FC<SafetyStatProps> = ({
  icon,
  label,
  value,
  isVerified,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="flex-row items-center py-3 px-1">
      <Ionicons
        name={icon}
        size={20}
        color={isVerified ? "#22C55E" : isDark ? "#9CA3AF" : "#4B5563"}
      />
      <Text className={`ml-3 flex-1 text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        {label}
      </Text>
      <Text
        className={`font-semibold text-sm ${
          isVerified
            ? "text-emerald-500 dark:text-emerald-400"
            : isDark
            ? "text-gray-100"
            : "text-gray-900"
        }`}
      >
        {value}
      </Text>
    </View>
  );
};

export default SafetyStat;