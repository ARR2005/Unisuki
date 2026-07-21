import { useValidationCamera } from "@/feature/validation/hooks/useValidationCamera";
import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

type StepKey = "front" | "back" | "selfie";

interface SubmitPictureScreenHandle {
  validateImages: () => boolean;
  getImages: () => Record<StepKey, string | null>;
}

const SubmitPictureScreen = forwardRef<SubmitPictureScreenHandle>((_, ref) => {
  const [images, setImages] = useState<Record<StepKey, string | null>>({
    front: null,
    back: null,
    selfie: null,
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { isLoading, error, launchCamera } = useValidationCamera();

  const openCamera = async (key: StepKey) => {
    const captured = await launchCamera();
    if (!captured) return;

    setSubmitError(null);
    setImages((prev) => ({
      ...prev,
      [key]: captured.uri,
    }));
  };

  const validateImages = () => {
    if (!images.front || !images.back || !images.selfie) {
      setSubmitError("Please capture all required photos before proceeding.");
      return false;
    }

    setSubmitError(null);
    return true;
  };

  const getImages = () => images;

  useImperativeHandle(ref, () => ({
    validateImages,
    getImages,
  }));

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="p-4"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="my-4 mb-6 w-full items-center justify-center">
        <Text className="text-2xl font-bold text-black">
          Verify Your Identity
        </Text>
        <Text className="mt-1 text-center text-sm text-gray-500">
          Help us verify your identity for added security.
        </Text>
      </View>

      {/* Main Container */}
      <View className="gap-4 w-full mb-6">
        {error ? (
          <View className="rounded-2xl bg-red-50 p-4">
            <Text className="text-sm font-medium text-red-700">{error}</Text>
          </View>
        ) : null}
        {submitError ? (
          <View className="rounded-2xl bg-red-50 p-4">
            <Text className="text-sm font-medium text-red-700">
              {submitError}
            </Text>
          </View>
        ) : null}

        {/* --- ID FRONT --- */}
        <View className="gap-2 bg-white p-4  border rounded-2xl border-slate-400">
          {/* Header: Title + Dynamic Badge */}
          <View className="flex-row items-center justify-between w-full">
            <Text className="text-base font-bold text-black">Front ID</Text>

            <View
              className={`px-3 py-1 rounded-full border border-gray-200 ${
                images.front ? "bg-green-600" : "bg-white"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  images.front ? "text-white" : "text-orange-500"
                }`}
              >
                {images.front ? "Uploaded" : "Required"}
              </Text>
            </View>
          </View>

          {/* Description & Tip Box */}
          <View className="rounded-2xl bg-slate-100 p-4 gap-1">
            <Text className="text-xs leading-4 text-gray-800">
              Take a clear photo of the front of your school or government ID.
            </Text>
            <Text className="text-xs italic leading-4 text-gray-500">
              Avoid blur, glare, or cropped edges so review is faster.
            </Text>
          </View>

          {/* Media Section */}
          {!images.front ? (
            <TouchableOpacity
              onPress={() => openCamera("front")}
              activeOpacity={0.7}
              className="mt-1  items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-4"
            >
              <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200">
                <Ionicons name="camera-outline" size={20} color="#4b5563" />
              </View>
              <Text className="text-sm font-semibold text-gray-700">
                Open Camera
              </Text>
              <Text className="mt-0.5 text-xs text-gray-400">
                Tap to capture photo
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="mt-1 gap-2">
              <View className="h-44 w-full rounded-2xl border border-gray-200 bg-black/5 overflow-hidden items-center justify-center">
                <Image
                  source={{ uri: images.front }}
                  className="h-full w-full rounded-2xl"
                  resizeMode="contain"
                />
              </View>

              <TouchableOpacity
                onPress={() => openCamera("front")}
                activeOpacity={0.8}
                className="flex-row items-center justify-center rounded-full border border-black bg-black py-2"
              >
                <Ionicons name="refresh-outline" size={16} color="#ffffff" />
                <Text className="ml-2 text-xs font-semibold text-white">
                  Retake Photo
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* --- ID BACK --- */}
        <View className="gap-2 bg-white p-4 rounded-2xl border border-slate-400">
          {/* Header: Title + Dynamic Badge */}
          <View className="flex-row items-center justify-between w-full">
            <Text className="text-base font-bold text-black">ID Back</Text>

            <View
              className={`px-3 py-1 rounded-full border border-gray-200 ${
                images.back ? "bg-green-600" : "bg-white"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  images.back ? "text-white" : "text-orange-500"
                }`}
              >
                {images.back ? "Uploaded" : "Required"}
              </Text>
            </View>
          </View>

          {/* Description & Tip Box */}
          <View className="rounded-2xl bg-slate-100 p-4 gap-1">
            <Text className="text-xs leading-4 text-gray-800">
              Take a clear photo of the back of your school or government ID.
            </Text>
            <Text className="text-xs italic leading-4 text-gray-500">
              Avoid blur, glare, or cropped edges so review is faster.
            </Text>
          </View>

          {/* Media Section */}
          {!images.back ? (
            <TouchableOpacity
              onPress={() => openCamera("back")}
              activeOpacity={0.7}
              className="mt-1 min-h-[120px] items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-4"
            >
              <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200">
                <Ionicons name="camera-outline" size={20} color="#4b5563" />
              </View>
              <Text className="text-sm font-semibold text-gray-700">
                Open Camera
              </Text>
              <Text className="mt-0.5 text-xs text-gray-400">
                Tap to capture photo
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="mt-1 gap-2">
              <View className="h-44 w-full rounded-2xl border border-gray-200 bg-black/5 overflow-hidden items-center justify-center">
                <Image
                  source={{ uri: images.back }}
                  className="h-full w-full rounded-2xl"
                  resizeMode="contain"
                />
              </View>

              <TouchableOpacity
                onPress={() => openCamera("back")}
                activeOpacity={0.8}
                className="flex-row items-center justify-center rounded-full border border-black bg-black py-2"
              >
                <Ionicons name="refresh-outline" size={16} color="#ffffff" />
                <Text className="ml-2 text-xs font-semibold text-white">
                  Retake Photo
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* --- SELFIE WITH ID --- */}
        <View className="gap-2 bg-white p-4 rounded-2xl border border-slate-400">
          {/* Header: Title + Dynamic Badge */}
          <View className="flex-row items-center justify-between w-full">
            <Text className="text-base font-bold text-black">
              Selfie With ID
            </Text>

            <View
              className={`px-3 py-1 rounded-full border border-gray-200 ${
                images.selfie ? "bg-green-600" : "bg-white"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  images.selfie ? "text-white" : "text-orange-500"
                }`}
              >
                {images.selfie ? "Uploaded" : "Required"}
              </Text>
            </View>
          </View>

          {/* Description & Tip Box */}
          <View className="rounded-2xl bg-slate-100 p-4 gap-1">
            <Text className="text-xs leading-4 text-gray-800">
              Take a clear photo of yourself holding your ID next to your face.
            </Text>
            <Text className="text-xs italic leading-4 text-gray-500">
              Avoid blur, glare, or cropped edges so review is faster.
            </Text>
          </View>

          {/* Media Section */}
          {!images.selfie ? (
            <TouchableOpacity
              onPress={() => openCamera("selfie")}
              activeOpacity={0.7}
              className="mt-1 min-h-[120px] items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-4"
            >
              <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200">
                <Ionicons name="camera-outline" size={20} color="#4b5563" />
              </View>
              <Text className="text-sm font-semibold text-gray-700">
                Open Camera
              </Text>
              <Text className="mt-0.5 text-xs text-gray-400">
                Tap to capture photo
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="mt-1 gap-2">
              <View className="h-44 w-full rounded-2xl border border-gray-200 bg-black/5 overflow-hidden items-center justify-center">
                <Image
                  source={{ uri: images.selfie }}
                  className="h-full w-full rounded-2xl"
                  resizeMode="contain"
                />
              </View>

              <TouchableOpacity
                onPress={() => openCamera("selfie")}
                activeOpacity={0.8}
                className="flex-row items-center justify-center rounded-full border border-black bg-black py-2"
              >
                <Ionicons name="refresh-outline" size={16} color="#ffffff" />
                <Text className="ml-2 text-xs font-semibold text-white">
                  Retake Photo
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
});

SubmitPictureScreen.displayName = "SubmitPictureScreen";
export default SubmitPictureScreen;
