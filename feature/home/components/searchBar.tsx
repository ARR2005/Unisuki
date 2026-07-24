import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, TextInput, View } from "react-native";

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
        className={`flex-row items-center rounded-full px-4 py-1.5 border ${
          isDark
            ? "bg-white/5 border-white/80"
            : "bg-white/60 border-white"
        }`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.15 : 0.05,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        <Ionicons
          name="search-outline"
          size={20}
          color={isDark ? "#FFFFFF" : "#000000"}
        />
        <TextInput
          placeholder={placeholder}
          value={value}
          className={`ml-3 flex-1 text-base ${
            isDark ? "text-white" : "text-black"
          }`}
          placeholderTextColor={isDark ? "#D1D5DB" : "#4B5563"}
          onChangeText={onChangeText}
        />
        {value ? (
          <Pressable onPress={onClear}>
            <Ionicons
              name="close-circle"
              size={18}
              color={isDark ? "#FFFFFF" : "#000000"}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

export default SearchBar;