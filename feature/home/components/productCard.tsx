import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

export type ProductCardProps = {
  imageUrl?: string;
  title?: string;
  price?: number | string;
  sellerName?: string;
  onPress?: () => void;
};

export default function ProductCard({
  imageUrl = "https://picsum.photos/id/26/400/300",
  title = "Untitled Product",
  price = "$0.00",
  sellerName = "Verified Seller",
  onPress,
}: ProductCardProps) {
  // Format numeric prices safely
  const formattedPrice =
    typeof price === "number" ? `$${price.toFixed(2)}` : price;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="w-44 bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100"
    >
      {/* Image */}
      <View className="h-44 w-full bg-zinc-100">
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {/* Product Details */}
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-1">
          <Text
            className="text-base font-semibold text-zinc-900 flex-1 mr-2"
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
        <Text className="text-base font-bold text-emerald-600">
        {formattedPrice}
        </Text>
      </View>
    </TouchableOpacity>
  );
}