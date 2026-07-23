import React from "react";
import { View, Text } from "react-native";

interface ProductReceiptProps {
  price: number;
  transactionFee: number;
  total: number;
  isDark: boolean;
}

export const ProductReceipt: React.FC<ProductReceiptProps> = ({
  price,
  transactionFee,
  total,
  isDark,
}) => {
  return (
    <>
      {/* Transaction Details */}
      <View className="mt-6">
        <Text
          className={`font-medium mb-3 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Transaction details
        </Text>

        <View className="flex-row justify-between items-center mb-2">
          <Text
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Product price
          </Text>
          <Text
            className={`text-lg font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            ₱ {price.toFixed(2)}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mb-2">
          <Text
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Transaction fee
          </Text>
          <Text
            className={`text-lg font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            ₱ {transactionFee.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Receipt Total Card */}
      <View
        className={`mt-6 p-4 rounded-lg ${
          isDark ? "bg-slate-800" : "bg-gray-50"
        }`}
      >
        <Text
          className={`font-medium mb-2 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Receipt
        </Text>

        <View className="flex-row justify-between mb-1">
          <Text
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Item price
          </Text>
          <Text
            className={`text-sm ${isDark ? "text-gray-300" : "text-gray-900"}`}
          >
            ₱ {price.toFixed(2)}
          </Text>
        </View>

        <View className="flex-row justify-between mb-1">
          <Text
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Transaction fee
          </Text>
          <Text
            className={`text-sm ${isDark ? "text-gray-300" : "text-gray-900"}`}
          >
            ₱ {transactionFee.toFixed(2)}
          </Text>
        </View>

        <View
          className={`border-t my-3 ${
            isDark ? "border-slate-700" : "border-gray-200"
          }`}
        />

        <View className="flex-row justify-between items-center">
          <Text
            className={`text-base font-medium ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Total
          </Text>
          <Text
            className={`text-2xl font-bold ${
              isDark ? "text-emerald-400" : "text-emerald-600"
            }`}
          >
            ₱ {total.toFixed(2)}
          </Text>
        </View>
      </View>
    </>
  );
};