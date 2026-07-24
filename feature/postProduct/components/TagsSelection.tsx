import AccordionItem from "@/components/ui/AccordionItem";
import type { PostData } from "@/feature/postProduct/hooks/usePostForms";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View, useColorScheme } from "react-native";

type TagsSelectionProps = {
  formData: PostData;
  disabled?: boolean;
  onSelectCategory: (category: string) => void;
};

const tags = [
  { name: "Miscellaneous", icon: "grid-outline" },
  { name: "Stationery", icon: "pencil-outline" },
  { name: "Clothes", icon: "shirt-outline" },
  { name: "Shoes", icon: "footsteps-outline" },
  { name: "Gadget", icon: "phone-portrait-outline" },
];

export default function TagsSelection({
  formData,
  disabled = false,
  onSelectCategory,
}: TagsSelectionProps) {
  const [isTagOpen, setIsTagOpen] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="mb-5">
      <Text className="text-gray-800 dark:text-gray-200 font-semibold mb-2">
        Tags
      </Text>
      <View
        className={`border rounded-xl overflow-hidden ${
          isDark
            ? "border-[#01170f] bg-[#0e0e0e]"
            : "border-gray-300 bg-white"
        }`}
      >
        <AccordionItem
          title={
            formData.category ? (
              formData.category
            ) : (
              <Text style={{ color: isDark ? "#e2e2e2" : "#6b7280" }}>
                Select Tag
              </Text>
            )
          }
          icon="pricetags-outline"
          isOpen={isTagOpen}
          onPress={() => setIsTagOpen(!isTagOpen)}
        >
          <View className="-mx-4 -my-4">
            {tags.map((tag, index) => {
              const isSelected = formData.category === tag.name;

              return (
                <TouchableOpacity
                  key={index}
                  className={`flex-row items-center p-4 border-b ${
                    isDark
                      ? `border-[#01170f] ${
                          isSelected ? "bg-[#01170f]" : "bg-[#0e0e0e]"
                        }`
                      : `border-gray-100 ${
                          isSelected ? "bg-emerald-50" : "bg-white"
                        }`
                  }`}
                  onPress={() => {
                    onSelectCategory(tag.name);
                    setIsTagOpen(false);
                  }}
                  disabled={disabled}
                >
                  <Ionicons
                    name={tag.icon as any}
                    size={20}
                    color={
                      isSelected
                        ? isDark
                          ? "#10b981"
                          : "#059669"
                        : isDark
                        ? "#9ca3af"
                        : "#6b7280"
                    }
                  />
                  <Text
                    className={`ml-3 flex-1 ${
                      isSelected
                        ? isDark
                          ? "text-emerald-400 font-bold"
                          : "text-emerald-700 font-bold"
                        : isDark
                        ? "text-gray-200"
                        : "text-gray-700"
                    }`}
                  >
                    {tag.name}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={isDark ? "#10b981" : "#059669"}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </AccordionItem>
      </View>
    </View>
  );
}