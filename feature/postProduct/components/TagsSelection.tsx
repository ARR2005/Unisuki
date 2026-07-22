import AccordionItem from "@/components/ui/AccordionItem";
import type { PostData } from "@/feature/postProduct/hooks/usePostForms";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

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

  return (
    <View className="mb-5">
      <Text className="text-gray-800 font-semibold mb-2">Tags</Text>
      <View className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        <AccordionItem
          title={formData.category || "Select Tag"}
          icon="pricetags-outline"
          isOpen={isTagOpen}
          onPress={() => setIsTagOpen(!isTagOpen)}
        >
          <View className="-mx-4 -my-4">
            {tags.map((tag, index) => (
              <TouchableOpacity
                key={index}
                className={`flex-row items-center p-4 border-b border-gray-100 ${
                  formData.category === tag.name ? "bg-green-50" : "bg-white"
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
                  color={formData.category === tag.name ? "#16a34a" : "#6b7280"}
                />
                <Text
                  className={`ml-3 flex-1 ${
                    formData.category === tag.name
                      ? "text-green-700 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {tag.name}
                </Text>
                {formData.category === tag.name && (
                  <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </AccordionItem>
      </View>
    </View>
  );
}
