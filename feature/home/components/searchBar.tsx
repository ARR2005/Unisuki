import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TextInput, View, Pressable } from "react-native";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onClear?: () => void;
  isDark: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search products...",
  value,
  onChangeText,
  onClear,
  isDark,
}) => {
  return (
    <View className="px-4 pb-2">
      <View
        className={`flex-row items-center rounded-full px-4 py-1 ${
          isDark ? "bg-slate-800" : "bg-white"
        }`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.25 : 0.12,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <Ionicons
          name="search-outline"
          size={20}
          color={isDark ? "#9CA3AF" : "#6B7280"}
        />
        <TextInput
          placeholder={placeholder}
          value={value}
          className={`ml-3 flex-1 text-base ${
            isDark ? "text-white" : "text-gray-900"
          }`}
          placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
          onChangeText={onChangeText}
        />
        {value ? (
          <Pressable onPress={onClear}>
            <Ionicons
              name="close-circle"
              size={18}
              color={isDark ? "#9CA3AF" : "#6B7280"}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

export default SearchBar;