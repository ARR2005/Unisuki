import React from "react";
import { Modal, Pressable, Text, View, ActivityIndicator } from "react-native";
import { Product } from "../../hooks/useFetchSellerProducts";

type DeleteModalProps = {
  visible: boolean;
  product: Product | null;
  isDeleting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteProductModal({
  visible,
  product,
  isDeleting,
  error,
  onClose,
  onConfirm,
}: DeleteModalProps) {
  if (!product) return null;

  const productTitle = product.tags?.title ?? product.title ?? "this item";

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={() => !isDeleting && onClose()}>
      <Pressable className="flex-1 justify-center p-6 bg-black/45" onPress={() => !isDeleting && onClose()}>
        <Pressable className="w-full rounded-2xl p-5 bg-white" onPress={() => undefined}>
          <Text className="text-gray-900 text-xl font-bold">Delete listing?</Text>
          <Text className="mt-2 text-gray-600 text-base leading-5">
            This will permanently remove <Text className="font-semibold text-gray-900"> &quot;{productTitle} &quot;</Text> from your listings.
          </Text>

          {error && <Text className="mt-3 text-red-600 text-sm">{error}</Text>}

          <View className="flex-row justify-end gap-2.5 mt-6">
            <Pressable
              disabled={isDeleting}
              className="items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5"
              onPress={onClose}
            >
              <Text className="text-gray-700 text-base font-semibold">Cancel</Text>
            </Pressable>

            <Pressable
              disabled={isDeleting}
              className={`min-w-[84px] items-center justify-center rounded-lg px-4 py-2.5 bg-red-600 ${
                isDeleting ? "opacity-60" : ""
              }`}
              onPress={onConfirm}
            >
              {isDeleting ? <ActivityIndicator color="#ffffff" /> : <Text className="text-white text-base font-bold">Delete</Text>}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}