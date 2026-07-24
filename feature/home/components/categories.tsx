import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

export const CATEGORIES = [
  {
    id: "1",
    label: "All",
    icon: "grid-outline",
    bgColor: "bg-blue-200/20 dark:bg-blue-500/10",
  },
  {
    id: "2",
    label: "Clothes",
    icon: "shirt-outline",
    bgColor: "bg-pink-200/20 dark:bg-pink-500/10",
  },
  {
    id: "3",
    label: "Gadgets",
    icon: "phone-portrait-outline",
    bgColor: "bg-yellow-200/20 dark:bg-yellow-500/10",
  },
  {
    id: "4",
    label: "Shoes",
    icon: "footsteps-outline",
    bgColor: "bg-emerald-200/20 dark:bg-emerald-500/10",
  },
  {
    id: "5",
    label: "Stationery",
    icon: "pencil-outline",
    bgColor: "bg-purple-200/20 dark:bg-purple-500/10",
  },
  {
    id: "6",
    label: "Miscellaneous",
    icon: "ellipsis-horizontal-circle-outline",
    bgColor: "bg-orange-200/20 dark:bg-orange-500/10",
  },
] as const;

interface CategoryMenuProps {
  selectedCategory?: string | null;
  onSelectCategory?: (category: string | null) => void;
}

export default function CategoryMenu({
  selectedCategory,
  onSelectCategory,
}: CategoryMenuProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleSelect = (label: string) => {
    if (!onSelectCategory) return;

    if (label === "All" || selectedCategory === label) {
      onSelectCategory(null);
    } else {
      onSelectCategory(label);
    }
  };

  return (
    <View className="py-1">
      {/* Top Left Header Label */}
      <Text
        className={`self-start ml-4 mb-2 text-[12px] font-bold tracking-widest uppercase ${
          isDark ? "text-gray-400" : "text-gray-800"
        }`}
      >
        CATEGORIES
      </Text>

      {/* Horizontal Scrollable Menu Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-4 flex-row gap-3"
      >
        {CATEGORIES.map((item) => {
          const isSelected =
            selectedCategory === item.label ||
            (!selectedCategory && item.label === "All");

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => handleSelect(item.label)}
            >
              <View
                className={`w-24 h-24 rounded-2xl overflow-hidden relative ${
                  isSelected
                    ? isDark
                      ? "border-2 border-emerald-500 bg-emerald-950/40"
                      : "border-2 border-emerald-600 bg-emerald-500/10"
                    : isDark
                    ? `border border-white/10 ${item.bgColor}`
                    : `border border-black/10 ${item.bgColor}`
                }`}
              >
                <BlurView
                  style={StyleSheet.absoluteFill}
                  intensity={20}
                  tint={isDark ? "dark" : "light"}
                />

                {/* Content Overlaid on BlurView */}
                <View className="flex-1 justify-center items-center p-2">
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color={
                      isSelected
                        ? isDark
                          ? "#34d399"
                          : "#059669"
                        : isDark
                        ? "#e2e8f0"
                        : "#1C1C1E"
                    }
                  />
                  <Text
                    className={`mt-2 text-xs font-medium text-center ${
                      isSelected
                        ? isDark
                          ? "text-emerald-400 font-bold"
                          : "text-emerald-700 font-bold"
                        : isDark
                        ? "text-gray-200"
                        : "text-zinc-900"
                    }`}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}