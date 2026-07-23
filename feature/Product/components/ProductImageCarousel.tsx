import React, { useState } from "react";
import { View, Image, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ProductImageCarouselProps {
  imageUri?: string | null;
  additionalImages?: string[];
  isDark: boolean;
}

export const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({
  imageUri,
  additionalImages = [],
  isDark,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const allImages = imageUri
    ? [imageUri, ...additionalImages]
    : additionalImages;
  const hasMultipleImages = allImages.length > 1;
  const currentImage = allImages[currentImageIndex] || imageUri || null;

  return (
    <View
      style={{
        width: "100%",
        height: 280,
        borderRadius: 12,
        overflow: "hidden",
      }}
      className={`relative ${isDark ? "bg-slate-800" : "bg-gray-100"}`}
    >
      {currentImage ? (
        <Image
          source={{ uri: currentImage }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="image-outline" size={40} color="#9CA3AF" />
        </View>
      )}

      {/* Prev / Next Arrows */}
      {hasMultipleImages && (
        <>
          <TouchableOpacity
            onPress={() =>
              setCurrentImageIndex(
                (p) => (p - 1 + allImages.length) % allImages.length
              )
            }
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 rounded-full p-2"
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              setCurrentImageIndex((p) => (p + 1) % allImages.length)
            }
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 rounded-full p-2"
          >
            <Ionicons name="chevron-forward" size={22} color="#fff" />
          </TouchableOpacity>
        </>
      )}

      {/* Dot Indicators */}
      {hasMultipleImages && (
        <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5">
          {allImages.map((_, i) => (
            <View
              key={i}
              className={`rounded-full ${
                i === currentImageIndex
                  ? "w-4 h-2 bg-white"
                  : "w-2 h-2 bg-white/50"
              }`}
            />
          ))}
        </View>
      )}

      {/* Count Badge */}
      {hasMultipleImages && (
        <View className="absolute top-3 right-3 bg-black/60 rounded-full px-2 py-0.5">
          <Text className="text-white text-xs font-medium">
            {currentImageIndex + 1}/{allImages.length}
          </Text>
        </View>
      )}
    </View>
  );
};