import type { PostData } from "@/feature/postProduct/hooks/usePostForms";
import { Text, TextInput, View } from "react-native";

type CategorySpecificFieldsProps = {
  formData: PostData;
  disabled?: boolean;
  onFieldChange: (field: keyof PostData, value: string) => void;
};

export default function CategorySpecificFields({
  formData,
  disabled = false,
  onFieldChange,
}: CategorySpecificFieldsProps) {
  if (formData.category === "Clothes") {
    return (
      <View className="mb-5 p-4 rounded-lg border border-gray-300">
        <View className="mb-4">
          <Text className="text-gray-800 font-semibold mb-2">Sizes</Text>
          <TextInput
            value={formData.sizes || ""}
            onChangeText={(text) => onFieldChange("sizes", text)}
            placeholder="e.g., S, M, L, XL"
            className="border border-gray-300 rounded-lg p-3 text-base"
            editable={!disabled}
          />
        </View>
        <View>
          <Text className="text-gray-800 font-semibold mb-2">Styles</Text>
          <TextInput
            value={formData.styles || ""}
            onChangeText={(text) => onFieldChange("styles", text)}
            placeholder="e.g., Casual, Formal, Sporty"
            className="border border-gray-300 rounded-lg p-3 text-base"
            editable={!disabled}
          />
        </View>
      </View>
    );
  }

  if (formData.category === "Shoes") {
    return (
      <View className="mb-5 p-4 rounded-lg border border-gray-300">
        <Text className="text-gray-800 font-semibold mb-2">Shoe Sizing</Text>
        <TextInput
          value={formData.shoeSize || ""}
          onChangeText={(text) => onFieldChange("shoeSize", text)}
          placeholder="e.g., 6, 7, 8, 9, 10+"
          className="border border-gray-300 rounded-lg p-3 text-base"
          editable={!disabled}
        />
      </View>
    );
  }

  if (formData.category === "Stationery") {
    return (
      <View className="mb-5 p-4 rounded-lg border border-gray-300">
        <View className="mb-4">
          <Text className="text-gray-800 font-semibold mb-2">Amount</Text>
          <TextInput
            value={formData.amount || ""}
            onChangeText={(text) => onFieldChange("amount", text)}
            placeholder="e.g., 100 pcs, 1 box"
            className="border border-gray-300 rounded-lg p-3 text-base"
            editable={!disabled}
          />
        </View>
        <View>
          <Text className="text-gray-800 font-semibold mb-2">Type</Text>
          <TextInput
            value={formData.stationeryType || ""}
            onChangeText={(text) => onFieldChange("stationeryType", text)}
            placeholder="e.g., Pens, Notebooks, Markers"
            className="border border-gray-300 rounded-lg p-3 text-base"
            editable={!disabled}
          />
        </View>
      </View>
    );
  }

  return null;
}
