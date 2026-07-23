import React from "react";
import { View, Text } from "react-native";

interface ProductCategoryDetailsProps {
  category?: string;
  sizes?: string;
  styles?: string;
  shoeSize?: string;
  amount?: string;
  stationaryType?: string;
  isDark: boolean;
}

export const ProductCategoryDetails: React.FC<ProductCategoryDetailsProps> = ({
  category,
  sizes,
  styles,
  shoeSize,
  amount,
  stationaryType,
  isDark,
}) => {
  if (category === "Clothes" && (sizes || styles)) {
    return (
      <View
        className={`mt-3 px-3 py-2 rounded-lg flex-row flex-wrap gap-2 ${
          isDark ? "bg-blue-900/30" : "bg-blue-50"
        }`}
      >
        {sizes ? (
          <Text className={`text-sm ${isDark ? "text-blue-300" : "text-blue-700"}`}>
            Size: {sizes}
          </Text>
        ) : null}
        {sizes && styles ? (
          <Text className={isDark ? "text-blue-500" : "text-blue-400"}>•</Text>
        ) : null}
        {styles ? (
          <Text className={`text-sm ${isDark ? "text-blue-300" : "text-blue-700"}`}>
            Style: {styles}
          </Text>
        ) : null}
      </View>
    );
  }

  if (category === "Shoes" && shoeSize) {
    return (
      <View
        className={`mt-3 px-3 py-2 rounded-lg ${
          isDark ? "bg-purple-900/30" : "bg-purple-50"
        }`}
      >
        <Text
          className={`text-sm ${isDark ? "text-purple-300" : "text-purple-700"}`}
        >
          Sizing: {shoeSize}
        </Text>
      </View>
    );
  }

  if (category === "Stationery" && (amount || stationaryType)) {
    return (
      <View
        className={`mt-3 px-3 py-2 rounded-lg flex-row flex-wrap gap-2 ${
          isDark ? "bg-yellow-900/30" : "bg-yellow-50"
        }`}
      >
        {amount ? (
          <Text
            className={`text-sm ${
              isDark ? "text-yellow-300" : "text-yellow-700"
            }`}
          >
            Amount: {amount}
          </Text>
        ) : null}
        {amount && stationaryType ? (
          <Text className={isDark ? "text-yellow-500" : "text-yellow-400"}>
            •
          </Text>
        ) : null}
        {stationaryType ? (
          <Text
            className={`text-sm ${
              isDark ? "text-yellow-300" : "text-yellow-700"
            }`}
          >
            Type: {stationaryType}
          </Text>
        ) : null}
      </View>
    );
  }

  return null;
};