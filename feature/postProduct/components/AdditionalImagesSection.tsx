import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View, useColorScheme } from "react-native";

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="mb-5">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-gray-800 dark:text-gray-200 font-semibold">
          Additional Images
        </Text>
        <Text className="text-xs text-gray-600 dark:text-gray-400">
          {additionalImages.length} added
        </Text>
      </View>

      <TouchableOpacity
        onPress={onPickImages}
        className={`border-2 border-dashed rounded-xl p-4 items-center ${
          isDark
            ? "border-[#01170f] bg-[#0e0e0e]"
            : "border-gray-300 bg-white"
        }`}
        disabled={disabled || additionalImages.length >= 5}
      >
        <Ionicons
          name="image-outline"
          size={32}
          color={isDark ? "#10b981" : "#059669"}
        />
        <Text className="text-gray-700 dark:text-gray-300 font-medium mt-2">
          Tap to add more photos
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Supports up to 5 additional images
        </Text>
      </TouchableOpacity>

      {additionalImages.length > 0 && (
        <View className="mt-4">
          <Text className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2">
            Added Images:
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {additionalImages.map((imageUri, index) => (
              <View
                key={index}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border ${
                  isDark
                    ? "border-[#01170f] bg-[#0e0e0e]"
                    : "border-gray-200 bg-white"
                }`}
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