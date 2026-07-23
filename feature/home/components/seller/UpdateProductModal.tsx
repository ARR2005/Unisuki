import React, { useState, useEffect } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "../../hooks/useFetchSellerProducts";

type UpdateModalProps = {
  visible: boolean;
  product: Product | null;
  isUpdating: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (product: Product, title: string, price: string) => void;
};

export default function UpdateProductModal({
  visible,
  product,
  isUpdating,
  error,
  onClose,
  onSave,
}: UpdateModalProps) {
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");

  useEffect(() => {
    if (product) {
      setEditTitle(
        product.tags?.title ?? product.title ?? product.description ?? ""
      );
      setEditPrice(product.price ? String(product.price) : "");
    }
  }, [product]);

  if (!product) return null;

  // Validation Checks
  const parsedPrice = parseFloat(editPrice) || 0;
  const isPriceInvalid =
    editPrice.length > 0 && (parsedPrice <= 0 || parsedPrice > 50000);

  const isTitleInvalid =
    editTitle.length > 0 &&
    (editTitle.trim().length === 0 || editTitle.length > 25);

  const isFormValid =
    editTitle.trim().length > 0 &&
    !isTitleInvalid &&
    editPrice.length > 0 &&
    !isPriceInvalid;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => !isUpdating && onClose()}
    >
      <Pressable
        className="flex-1 justify-center p-6 bg-black/45"
        onPress={() => !isUpdating && onClose()}
      >
        <Pressable
          className="w-full rounded-2xl p-5 bg-white"
          onPress={() => undefined}
        >
          <Text className="text-gray-900 text-xl font-bold mb-4">
            Update Listing
          </Text>

          {/* Title Input */}
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-xs font-semibold text-gray-500">
                TITLE
              </Text>
              <Text
                className={`text-xs ${
                  editTitle.length > 80 ? "text-red-500 font-semibold" : "text-gray-400"
                }`}
              >
                {editTitle.length}/25
              </Text>
            </View>

            <View
              className={`flex-row items-center border rounded-lg bg-gray-50 px-3 ${
                isTitleInvalid ? "border-red-500 bg-red-50/50" : "border-gray-300"
              }`}
            >
              <TextInput
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Item title"
                maxLength={25}
                className="flex-1 py-2 text-base text-gray-900"
              />
              {isTitleInvalid && (
                <Ionicons name="alert-circle" size={18} color="#ef4444" />
              )}
            </View>

            {isTitleInvalid && (
              <Text className="mt-1 text-xs text-red-500">
                {editTitle.length > 80
                  ? "Title cannot exceed 80 characters."
                  : "Title cannot be empty."}
              </Text>
            )}
          </View>

          {/* Price Input */}
          <View className="mb-2">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-xs font-semibold text-gray-500">
                PRICE (₱)
              </Text>
              <Text
                className={`text-xs ${
                  isPriceInvalid ? "text-red-500 font-semibold" : "text-gray-500"
                }`}>
                max-(50,000)
              </Text>
            </View>

            <View
              className={`flex-row items-center border rounded-lg bg-gray-50 px-3 ${
                isPriceInvalid ? "border-red-500 bg-red-50/50" : "border-gray-300"
              }`}
            >
              <TextInput
                value={editPrice}
                onChangeText={setEditPrice}
                placeholder="Enter price (max ₱50,000)"
                keyboardType="numeric"
                className="flex-1 py-2 text-base text-gray-900"
              />
              {isPriceInvalid && (
                <Ionicons name="alert-circle" size={18} color="#ef4444" />
              )}
            </View>

            {isPriceInvalid && (
              <Text className="mt-1 text-xs text-red-500">
                {parsedPrice <= 0
                  ? "Price must be greater than ₱0."
                  : "Price cannot exceed ₱50,000."}
              </Text>
            )}
          </View>

          {error && <Text className="mt-2 text-red-600 text-sm">{error}</Text>}

          {/* Actions */}
          <View className="flex-row justify-end gap-2.5 mt-6">
            <Pressable
              disabled={isUpdating}
              className="items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5"
              onPress={onClose}
            >
              <Text className="text-gray-700 text-base font-semibold">
                Cancel
              </Text>
            </Pressable>

            <Pressable
              disabled={isUpdating || !isFormValid}
              className={`min-w-[84px] items-center justify-center rounded-lg px-4 py-2.5 bg-blue-600 ${
                isUpdating || !isFormValid ? "opacity-40" : ""
              }`}
              onPress={() => onSave(product, editTitle.trim(), editPrice)}
            >
              {isUpdating ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white text-base font-bold">Save</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}