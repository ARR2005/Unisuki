import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Product,
  useFetchSellerProducts,
  useUpdateProduct,
  useDeleteProduct,
} from "./hooks/useFetchSellerProducts";
import UpdateProductModal from "@/feature/home/components/seller/UpdateProductModal";
import DeleteProductModal from "@/feature/home/components/seller/DeleteProductModal";
import SearchBar from "@/feature/home/components/searchBar";


export default function SellerScreen() {
  const { products, loading } = useFetchSellerProducts();
  const { updateProduct, isUpdating, updateError, setUpdateError } =
    useUpdateProduct();
  const { deleteProduct, isDeleting, deleteError, setDeleteError } =
    useDeleteProduct();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");

  // Client-side filtering logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const title =
        product.tags?.title ?? product.title ?? product.description ?? "";
      const matchesSearch = title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());


      return matchesSearch;
    });
  }, [products, searchQuery]);

  const handleEditPress = (product: Product) => {
    setSelectedProduct(product);
    setUpdateError(null);
    setIsUpdateModalOpen(true);
  };

  const handleDeletePress = (product: Product) => {
    setSelectedProduct(product);
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmUpdate = async (
    product: Product,
    title: string,
    price: string
  ) => {
    const success = await updateProduct(product, title, price);
    if (success) {
      setIsUpdateModalOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    const success = await deleteProduct(selectedProduct.id);
    if (success) {
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 w-full items-center justify-center p-6 bg-white">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View className="flex-1 w-full pt-2 bg-white rounded-t-2xl">
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        className="w-full"
        contentContainerStyle={{ paddingBottom: 96 }}
        ListHeaderComponent={
          <View className="mb-2">
            {/* Search Bar */}
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery("")}
              isDark={false}
              placeholder="Search your inventory..."
            />

            {/* Table Header (Only display if seller has products overall) */}
            {products.length > 0 && (
              <View className="flex-row items-center justify-between w-full py-3 border-b border-gray-200 bg-gray-50 px-2 mt-2">
                <Text className="w-12 font-bold text-gray-500 text-xs text-center">
                  ITEM
                </Text>
                <Text className="flex-1 font-bold text-gray-500 text-xs ml-3">
                  TITLE
                </Text>
                <Text className="w-20 font-bold text-gray-500 text-xs text-center">
                  PRICE
                </Text>
                <Text className="w-20 font-bold text-gray-500 text-xs text-center">
                  ACTIONS
                </Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          products.length === 0 ? (
            <View className="py-16 w-full items-center justify-center">
              <Ionicons name="pricetag-outline" size={36} color="#9ca3af" />
              <Text className="mt-3 text-gray-700 text-lg font-semibold">
                No listings yet
              </Text>
              <Text className="mt-1 text-gray-500 text-sm">
                Products you post will appear here.
              </Text>
            </View>
          ) : (
            <View className="py-16 w-full items-center justify-center">
              <Ionicons name="search-outline" size={36} color="#9ca3af" />
              <Text className="mt-3 text-gray-700 text-lg font-semibold">
                No matching items
              </Text>
              <Text className="mt-1 text-gray-500 text-sm">
                Try adjusting your search or category filter.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const imageUri =
            item.imageUri ?? item.imageUrl ?? item.additionalImages?.[0];
          const title =
            item.tags?.title ??
            item.title ??
            item.description ??
            "Untitled item";

          return (
            <View className="flex-row items-center justify-between w-full py-3 border-b border-gray-100 px-2">
              <View className="w-12 items-center justify-center">
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    className="w-12 h-12 rounded-lg"
                  />
                ) : (
                  <View className="w-12 h-12 rounded-lg bg-gray-200 items-center justify-center">
                    <Ionicons name="image-outline" size={22} color="#6b7280" />
                  </View>
                )}
              </View>

              <Text
                numberOfLines={2}
                className="flex-1 mx-3 text-gray-900 text-sm font-medium"
              >
                {title}
              </Text>

              <Text className="w-20 text-center text-green-600 text-sm font-bold">
                ₱{item.price ?? 0}
              </Text>

              <View className="w-20 flex-row items-center justify-center gap-3">
                <Pressable hitSlop={8} onPress={() => handleEditPress(item)}>
                  <Ionicons name="create-outline" size={20} color="#2563eb" />
                </Pressable>
                <Pressable hitSlop={8} onPress={() => handleDeletePress(item)}>
                  <Ionicons name="trash-outline" size={20} color="#dc2626" />
                </Pressable>
              </View>
            </View>
          );
        }}
      />

      {/* Modals */}
      <UpdateProductModal
        visible={isUpdateModalOpen}
        product={selectedProduct}
        isUpdating={isUpdating}
        error={updateError}
        onClose={() => setIsUpdateModalOpen(false)}
        onSave={handleConfirmUpdate}
      />

      <DeleteProductModal
        visible={isDeleteModalOpen}
        product={selectedProduct}
        isDeleting={isDeleting}
        error={deleteError}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </View>
  );
}