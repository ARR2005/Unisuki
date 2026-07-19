import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View, useColorScheme } from "react-native";

interface AccordionItemProps {
  title: string;
  icon: any;
  children: React.ReactNode;
  isOpen: boolean;
  onPress: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  icon,
  children,
  isOpen,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View 
      className={`border-b ${isDark ? "border-slate-700" : "border-gray-100"}`}
    >
      <TouchableOpacity 
        onPress={onPress} 
        className={`flex-row items-center p-4 active:opacity-70`}
      >
        <Ionicons 
          name={icon} 
          size={22} 
          color={isDark ? "#10b981" : "#059669"} 
        />
        <Text className={`flex-1 ml-4 text-base font-semibold ${
          isDark ? "text-white" : "text-gray-900"
        }`}>
          {title}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-down" : "chevron-forward"}
          size={20}
          color={isDark ? "#6B7280" : "#9CA3AF"}
        />
      </TouchableOpacity>
      {isOpen && (
        <View className={`px-4 py-3 border-t ${
          isDark ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-100"
        }`}>
          {children}
        </View>
      )}
    </View>
  );
};

export default AccordionItem;
