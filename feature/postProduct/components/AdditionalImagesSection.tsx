import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

type AdditionalImagesSectionProps = {
  additionalImages: string[];
  disabled?: boolean;
  onPickImages: () => void;
  onRemoveImage: (imageUri: string) => void;
};

export default function AdditionalImagesSection({
  additionalImages,
  disabled = false,
  onPickImages,
  onRemoveImage,
}: AdditionalImagesSectionProps) {
  return (
    <View className="mb-5">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-gray-800 font-semibold">Additional Images</Text>
        <Text className="text-xs text-gray-600">
          {additionalImages.length} added
        </Text>
      </View>

      <TouchableOpacity
        onPress={onPickImages}
        className="border-2 border-dashed border-gray-400 rounded-lg p-4 items-center"
        disabled={disabled || additionalImages.length >= 5}
      >
        <Ionicons name="image-outline" size={32} color="#9ca3af" />
        <Text className="text-gray-600 font-medium mt-2">
          Tap to add more photos
        </Text>
        <Text className="text-xs text-gray-500 mt-1">
          Supports up to 5 additional images
        </Text>
      </TouchableOpacity>

      {additionalImages.length > 0 && (
        <View className="mt-4">
          <Text className="text-sm text-gray-700 font-medium mb-2">
            Added Images:
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {additionalImages.map((imageUri, index) => (
              <View
                key={index}
                className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200"
              >
                <Image
                  source={{ uri: imageUri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => onRemoveImage(imageUri)}
                  className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
                >
                  <Ionicons name="close" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
