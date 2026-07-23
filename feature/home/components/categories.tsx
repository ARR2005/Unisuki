import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export const CATEGORIES = [
  {
    id: "1",
    label: "All",
    icon: "grid-outline",
    bgColor: "bg-blue-200/20",
  },
  {
    id: "2",
    label: "Clothes",
    icon: "shirt-outline",
    bgColor: "bg-pink-200/20",
  },
  {
    id: "3",
    label: "Gadgets",
    icon: "phone-portrait-outline",
    bgColor: "bg-yellow-200/20",
  },
  {
    id: "4",
    label: "Shoes",
    icon: "footsteps-outline",
    bgColor: "bg-emerald-200/20",
  },
  {
    id: "5",
    label: "Stationery",
    icon: "pencil-outline",
    bgColor: "bg-purple-200/20",
  },
  {
    id: "6",
    label: "Miscellaneous",
    icon: "ellipsis-horizontal-circle-outline",
    bgColor: "bg-orange-200/20",
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
  const handleSelect = (label: string) => {
    if (!onSelectCategory) return;

    // Direct match check: handle "All" or toggle selection
    if (label === "All" || selectedCategory === label) {
      onSelectCategory(null);
    } else {
      onSelectCategory(label);
    }
  };

  return (
    <View className="py-1">
      {/* Top Left Label */}
      <Text className="self-start ml-4 mb-1 text-[12px] font-bold tracking-widest text-gray-800 uppercase">
        CATEGORIES
      </Text>

      {/* Horizontal Menu Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-4 flex-row gap-3"
      >
        {CATEGORIES.map((item) => {
          // Check if item is active (or 'All' when no filter is applied)
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
                    ? "border-2 border-emerald-600 bg-emerald-500/10"
                    : `border border-black/10 ${item.bgColor}`
                }`}
              >
                <BlurView
                  style={StyleSheet.absoluteFill}
                  intensity={20}
                  tint="light"
                />

                {/* Content Overlaid on BlurView */}
                <View className="flex-1 justify-center items-center p-2">
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color={isSelected ? "#059669" : "#1C1C1E"}
                  />
                  <Text
                    className={`mt-2 text-xs font-medium text-center ${
                      isSelected
                        ? "text-emerald-700 font-bold"
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