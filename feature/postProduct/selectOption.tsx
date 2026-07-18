import { View, Text,  TouchableOpacity, ActivityIndicator } from 'react-native'
import React from 'react'
import { router, useRouter } from '@/.expo/types/router'
import { Ionicons } from '@expo/vector-icons';

export default function selectOption() {
    const router = useRouter();
  const {
    isLoading,
    handleCameraCapture,
    handlePickFromGallery,
  } = useCameraCapture();

  return (
      <View className="flex-1 px-6 py-8">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 rounded-full bg-main items-center justify-center mb-6"
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>

        <View className="flex-1 justify-center">
        <View className="bg-secondary px-5 py-7">
          <View className="items-center mb-8">
            <View className="w-16 h-16 rounded-full bg-main items-center justify-center mb-4">
              <Ionicons name="image-outline" size={28} color="#fff" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 text-center">Add Product Photo</Text>
            <Text className="text-gray-600 text-center mt-2 leading-5">
              Start with a clear image of your item. You can take a new photo or choose one from your gallery.
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleCameraCapture}
            disabled={isLoading}
            className={`rounded-2xl p-5 mb-4 flex-row items-center ${isLoading ? "bg-darkMain" : "bg-main"}`}
          >
            <View className="w-12 h-12 rounded-full bg-white  items-center justify-center">
              <Ionicons name="camera-outline" size={24} color="#000" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="font-semibold text-lg">Use Camera</Text>
              <Text className=" text-sm mt-1">Capture a fresh photo right now</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePickFromGallery}
            disabled={isLoading}
            className={`rounded-2xl p-5 flex-row items-center ${isLoading ? "bg-gray-300" : "bg-main" }`}
          >
            <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center">
              <Ionicons name="images-outline" size={24} color="#000" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="font-semibold text-lg">Choose From Gallery</Text>
              <Text className="text-sm mt-1">Select an image you already have</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity>

          {isLoading && (
            <View className="mt-8 items-center">
              <ActivityIndicator size="small" color="#111827" />
              <Text className="text-gray-600 mt-2">Opening image picker...</Text>
            </View>
          )}
        </View>
        </View>
    </View>
  );
  )
}