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

const CATEGORIES = [
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

export default function CategoryMenu() {
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
        {CATEGORIES.map((item) => (
          <TouchableOpacity key={item.id} activeOpacity={0.8}>
            <View
              className={`w-24 h-24 rounded-2xl overflow-hidden border border-black/10 relative ${item.bgColor}`}
            >
              <BlurView
                style={StyleSheet.absoluteFill}
                intensity={20}
                tint="light"
              />

              {/* Content Overlaid on BlurView */}
              <View className="flex-1 justify-center items-center p-4">
                <Ionicons name={item.icon} size={22} color="#1C1C1E" />
                <Text
                  className="mt-4 text-base font-medium text-zinc-900 text-center"
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}