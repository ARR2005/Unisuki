import { View, Text, ActivityIndicator, FlatList, ScrollView } from 'react-native'
import React from 'react'
import Carousel from "@/feature/home/components/carousel"
import Categories from "@/feature/home/components/categories"
import ProductCard from "@/feature/home/components/productCard"
import SearchBar from "@/feature/home/components/searchBar"
import { useFetchBuyerProduct } from "@/feature/home/hooks/useFetchBuyerProduct";



export default function BuyerScreen() {
  const { products, loading, error } = useFetchBuyerProduct();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500 font-medium">{error}</Text>
      </View>
    );
  }
  
  return (
  <ScrollView className="flex-1">
    <View className="flex-1 bg-white border-1 rounded-t-2xl">
      <View>
        <Text className="ml-6 mb-2 mt-4">What product do you want?</Text>
        <SearchBar isDark={false} />
      </View>

      <Carousel />
      
      <Categories />

      <FlatList
        key="grid-2"
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        columnWrapperStyle={{ justifyContent: "space-between", gap: 12 }}
        renderItem={({ item }) => (
          <View className="flex-1">
            <ProductCard
              title={item.title}
              price={item.price}
              imageUrl={item.imageUrl}
              sellerName={item.sellerName || "Seller"}
              onPress={() => console.log("Pressed product:", item.id)}
            />
          </View>
        )}
      />
        <View className="h-24">
        <View/>
      </View>
    </View>
  </ScrollView>
  )
}