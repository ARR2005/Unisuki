import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
  useColorScheme,
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
      <View
        className={`flex-1 w-full items-center justify-center p-6 rounded-t-3xl border-t ${
          isDark
            ? "bg-[#0e0e0e] border-[#01170f]"
            : "bg-[#f3f3f3] border-gray-200"
        }`}
      >
        <ActivityIndicator size="large" color="#059669" />
        <Text
          className={`mt-3 text-lg font-bold ${
            isDark ? "text-gray-200" : "text-gray-700"
          }`}
        >
          Loading inventory...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 w-full bg-transparent">
      {/* Search Bar Title & Component */}
      <View className="mb-4 px-4">
        <Text
          className={`ml-1 mb-3 mt-4 text-xl font-bold tracking-tight ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Search your inventory
        </Text>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery("")}
          isDark={isDark}
          placeholder="Search your inventory..."
        />
      </View>

      {/* Main Content Container Card */}
      <View
        className={`flex-1 w-full rounded-t-3xl overflow-hidden border-t ${
          isDark
            ? "bg-[#0e0e0e] border-[#01170f]"
            : "bg-[#f3f3f3] border-gray-200"
        }`}
      >
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          className="w-full"
          contentContainerStyle={{ paddingBottom: 96 }}
          ListHeaderComponent={
            products.length > 0 ? (
              <View
                className={`flex-row items-center justify-between w-full py-3.5 px-3 border-b ${
                  isDark
                    ? "bg-[#0e0e0e] border-[#01170f]"
                    : "bg-gray-100/80 border-gray-200"
                }`}
              >
                <Text
                  className={`w-12 font-bold text-xs text-center ${
                    isDark ? "text-emerald-400" : "text-emerald-800"
                  }`}
                >
                  ITEM
                </Text>
                <Text
                  className={`flex-1 font-bold text-xs ml-3 ${
                    isDark ? "text-emerald-400" : "text-emerald-800"
                  }`}
                >
                  TITLE
                </Text>
                <Text
                  className={`w-20 font-bold text-xs text-center ${
                    isDark ? "text-emerald-400" : "text-emerald-800"
                  }`}
                >
                  PRICE
                </Text>
                <Text
                  className={`w-20 font-bold text-xs text-center ${
                    isDark ? "text-emerald-400" : "text-emerald-800"
                  }`}
                >
                  ACTIONS
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            products.length === 0 ? (
              <View className="py-20 w-full items-center justify-center px-6">
                <Ionicons
                  name="pricetag-outline"
                  size={56}
                  color={isDark ? "#10b981" : "#059669"}
                />
                <Text
                  className={`mt-4 text-2xl font-extrabold text-center ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  No Listings Yet
                </Text>
                <Text
                  className={`text-base mt-2 text-center font-medium ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Products you post will appear here for management.
                </Text>
              </View>
            ) : (
              <View className="py-20 w-full items-center justify-center px-6">
                <Ionicons
                  name="search-outline"
                  size={56}
                  color={isDark ? "#10b981" : "#059669"}
                />
                <Text
                  className={`mt-4 text-2xl font-extrabold text-center ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  No Matching Items
                </Text>
                <Text
                  className={`text-base mt-2 text-center font-medium ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Try adjusting your inventory search query.
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
              <View
                className={`flex-row items-center justify-between w-full py-3.5 px-3 border-b ${
                  isDark ? "border-[#01170f]" : "border-gray-200"
                }`}
              >
                <View className="w-12 items-center justify-center">
                  {imageUri ? (
                    <Image
                      source={{ uri: imageUri }}
                      className="w-12 h-12 rounded-lg bg-gray-200"
                    />
                  ) : (
                    <View
                      className={`w-12 h-12 rounded-lg items-center justify-center ${
                        isDark ? "bg-[#01170f]" : "bg-gray-200"
                      }`}
                    >
                      <Ionicons
                        name="image-outline"
                        size={22}
                        color={isDark ? "#10b981" : "#059669"}
                      />
                    </View>
                  )}
                </View>

                <Text
                  numberOfLines={2}
                  className={`flex-1 mx-3 text-sm font-semibold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {title}
                </Text>

                <Text className="w-20 text-center text-emerald-500 dark:text-emerald-400 text-sm font-bold">
                  ₱{item.price ?? 0}
                </Text>

                <View className="w-20 flex-row items-center justify-center gap-3">
                  <Pressable hitSlop={8} onPress={() => handleEditPress(item)}>
                    <Ionicons
                      name="create-outline"
                      size={20}
                      color={isDark ? "#60a5fa" : "#2563eb"}
                    />
                  </Pressable>
                  <Pressable hitSlop={8} onPress={() => handleDeletePress(item)}>
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={isDark ? "#f87171" : "#dc2626"}
                    />
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      </View>

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