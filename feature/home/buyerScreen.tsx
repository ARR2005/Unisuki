import Carousel from "@/feature/home/components/carousel";
import CategoryMenu from "@/feature/home/components/categories";
import ProductCard from "@/feature/home/components/productCard";
import SearchBar from "@/feature/home/components/searchBar";
import { useFetchBuyerProduct } from "@/feature/home/hooks/useFetchBuyerProduct";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  useColorScheme,
} from "react-native";

export default function BuyerScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { products, loading, error } = useFetchBuyerProduct();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();

  // Client-side filtering for real-time responsiveness
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory
        ? product.category?.toLowerCase() === selectedCategory.toLowerCase()
        : true;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <View
        className={`flex-1 justify-center items-center ${
          isDark ? "bg-[#0e0e0e]" : "bg-white"
        }`}
      >
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (error) {
    return (
      <View
        className={`flex-1 justify-center items-center px-4 ${
          isDark ? "bg-[#0e0e0e]" : "bg-white"
        }`}
      >
        <Text className="text-red-500 font-medium text-center">{error}</Text>
      </View>
    );
  }

  return (
    <View
      className={`flex-1 rounded-t-2xl ${
        isDark ? "bg-white/0" : "bg-white"
      }`}
    >
      <FlatList
        key="grid-2"
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96 }}
        columnWrapperStyle={{ justifyContent: "space-between", gap: 12 }}
        ListHeaderComponent={
          <View className="mb-4">
            <Text
              className={`ml-2 mb-2 mt-4 font-semibold ${
                isDark ? "text-gray-100" : "text-gray-800"
              }`}
            >
              What product do you want?
            </Text>

            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery("")}
              isDark={isDark}
            />

            {/* FULL-WIDTH CAROUSEL WRAPPER */}
            <View className="-mx-4 my-3">
              <Carousel />
            </View>

            <CategoryMenu
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </View>
        }
        ListEmptyComponent={
          <View className="py-12 items-center">
            <Text
              className={`text-base ${
                isDark ? "text-white" : "text-gray-500"
              }`}
            >
              No products found
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="flex-1 mb-3">
            <ProductCard
              title={item.title}
              price={item.price}
              imageUrl={item.imageUrl}
              sellerName={item.sellerName || "Seller"}
              onPress={() => {
                const cleanProductId = String(item.id).trim();
                const cleanSellerId = String(item.userId).trim();

                console.log(
                  "Navigating to:",
                  cleanProductId,
                  "Seller:",
                  cleanSellerId
                );
                router.push({
                  pathname: "/(product)/productDetail/[id]",
                  params: {
                    id: item.id,
                    sellerId: item.userId,
                  },
                });
              }}
            />
          </View>
        )}
      />
    </View>
  );
}