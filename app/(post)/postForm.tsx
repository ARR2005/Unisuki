import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useImage } from "@/context/storeImage";
import { usePostForm } from "@/feature/postProduct/camera";
import AdditionalImagesSection from "@/feature/postProduct/components/AdditionalImagesSection";
import CategorySpecificFields from "@/feature/postProduct/components/CategorySpecificFields";
import TagsSelection from "@/feature/postProduct/components/TagsSelection";
import { useAutoClassification } from "@/feature/postProduct/hooks/useAutoClassification";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PostFormScreen() {
  const isDark = useColorScheme() == "dark";
  const router = useRouter();
  const { capturedImage, uploadError, setUploadError, isUploadingImage } =
    useImage();
  const {
    formData,
    tagInput,
    isAuthenticated,
    currentUser,
    updateFormField,
    setTagInput,
    addTag,
    removeTag,
    uploadAndPublish,
    addAdditionalImage,
    removeAdditionalImage,
    pickAdditionalImages,
  } = usePostForm();

  const {
    isClassifying,
    showSuggestionModal,
    suggestedData,
    showAnalysisPrompt,
    startAnalysis,
    skipAnalysis,
    acceptSuggestion,
    rejectSuggestion,
  } = useAutoClassification();

  const handlePublish = async () => {
    setUploadError(null);
    const success = await uploadAndPublish();
    if (success) {
      router.push("/(dashboard)/home");
    }
  };

  const handleSkipAnalysis = () => {
    skipAnalysis();
  };

  const handleAcceptSuggestion = () => {
    acceptSuggestion((field, value) => updateFormField(field as any, value));
  };

  const handleRejectSuggestion = () => {
    rejectSuggestion();
  };

  if (!capturedImage) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">No image captured</Text>
      </View>
    );
  }

  if (isClassifying && !showSuggestionModal) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1">
        <View className="flex-1 items-center justify-start pt-32">
          <View className="w-full h-70 items-center px-4">
            
            {/* Icon Container */}
            <View className="w-20 h-20 rounded-full bg-[#16a34a] items-center justify-center mb-5">
              <Ionicons name="sparkles-outline" size={34} color={isDark ? "#ffffff" : "#000000"} />
            </View>

            {/* Heading */}
            <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">
              Analyzing Your Image
            </Text>

            {/* Subtitle */}
            <Text className="text-gray-600 dark:text-gray-400 text-center mt-2 leading-6">
              Please wait while the model checks your photo and prepares
              suggested details for your post.
            </Text>

            {/* Activity Indicator */}
            <ActivityIndicator 
              size="large" 
              color={isDark ? "#38bdf8" : "#111827"} 
              className="mt-6" 
            />

            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              This usually takes a few seconds.
            </Text>

          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Dialog
        open={showAnalysisPrompt}
        onOpenChange={(open) => {
          if (!open) {
            handleSkipAnalysis();
          }
        }}
      >
      <DialogContent className="w-full max-w-sm bg-[#f3f3f3] dark:bg-[#131313] border-none">
        <DialogHeader>
          <View className="flex-row items-center gap-3 mb-2">
            <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 items-center justify-center">
              <Ionicons name="scan-outline" size={22} color="#16a34a" />
            </View>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Unisuki Auto-Fill
            </DialogTitle>
          </View>

          <DialogDescription className="bg-gray-200/60  dark:bg-gray-700/30 p-4 rounded-lg flex-col gap-3">
            <Text className="text-sm text-gray-700 dark:text-gray-300">
              Let our Image classifier analyze your image to auto-fill product details, or
              skip and fill them manually. This classifier only supports: PE Shirt ,PE Pants ,Black Pants ,White Polo ,UC Green Vest.
            </Text>
          </DialogDescription>
        </DialogHeader>

        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity
            onPress={handleSkipAnalysis}
            className="flex-1 border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-800/50 rounded-lg py-3 items-center"
          >
            <Text className="font-semibold text-gray-700 dark:text-gray-300 text-xs">
              Continue to Form
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={startAnalysis}
            className="flex-1 bg-green-600 dark:bg-green-600 rounded-lg py-3 items-center"
          >
            <Text className="font-semibold text-white text-xs">Analyze</Text>
          </TouchableOpacity>
        </View>
      </DialogContent>
      </Dialog>
      
      {/* Suggestion Dialog */}
      <Dialog
      open={showSuggestionModal}
      onOpenChange={(open) => {
      if (!open) {
        handleRejectSuggestion();
      }
        }}>
      <DialogContent className="w-full max-w-sm bg-[#f3f3f3] dark:bg-[#131313] border-none">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-700 dark:text-green-500 mb-2">
            UNISUKI Suggestion
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-slate-200">
            Based on your image, we suggest the following details:
          </DialogDescription>
        </DialogHeader>

      {suggestedData && (
      <View className="bg-white dark:bg-slate-800/30 rounded-lg p-4 mb-6 gap-3 border border-gray-200/30 dark:border-slate-700/30">
        <View>
          <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Title
          </Text>
          <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {suggestedData.title}
          </Text>
        </View>

        <View>
          <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Category
          </Text>
          <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {suggestedData.category}
          </Text>
        </View>

        <View>
          <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Price
          </Text>
          <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">
            ₱{suggestedData.price}
          </Text>
        </View>

        <View>
          <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Description
          </Text>
          <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {suggestedData.description}
          </Text>
        </View>
      </View>
      )}

      <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleRejectSuggestion}
            className="flex-1 border border-gray-300 dark:border-slate-700/30 bg-transparent dark:bg-slate-800/30 rounded-lg py-3 items-center"
          >
            <Text className="font-semibold text-gray-700 dark:text-gray-300">
              Skip
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleAcceptSuggestion}
            className="flex-1 bg-green-600 dark:bg-green-600 rounded-lg py-3 items-center"
          >
            <Text className="font-semibold text-white">Accept</Text>
          </TouchableOpacity>
        </View>
      </DialogContent>
    </Dialog>

<SafeAreaView edges={["top"]} className="flex-1 bg-[#f3f3f3] dark:bg-[#131313]">
  <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    className="flex-1"
  >
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Navigation Controls Overlay */}
      <View className="z-10 absolute top-4 left-0 right-0 flex-row justify-between px-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-black/60 dark:bg-black/80 rounded-full p-2"
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-black/60 dark:bg-black/80 rounded-full p-2"
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Image Preview */}
      <View className="h-80 bg-gray-200 dark:bg-gray-800 m-2 rounded-2xl relative overflow-hidden">
        <Image
          source={{ uri: capturedImage.uri }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      <View className="px-5 pt-6">
        {/* Title Input */}
        <View className="mb-5">
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-800 dark:text-gray-200 font-semibold mb-2">
              Item Title
            </Text>
            <Text
              className={`text-xs ${
                formData.title.length >= 25
                  ? "text-red-500 font-semibold"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {formData.title.length}/24
            </Text>
          </View>
          <View
            className={`flex-row items-center border rounded-lg bg-white dark:bg-gray-800/60 ${
              formData.title.length >= 25
                ? "border-red-500 bg-red-50 dark:bg-red-950/30"
                : "border-gray-300 dark:border-gray-700"
            }`}
          >
            <TextInput
              value={formData.title}
              onChangeText={(text) => updateFormField("title", text)}
              placeholder="Enter product title (max 24 chars)"
              placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
              className="flex-1 p-3 text-base text-gray-900 dark:text-gray-100"
              editable={!isUploadingImage}
              maxLength={24}
            />
            {formData.title.length >= 25 && (
              <Ionicons
                name="alert-circle"
                size={20}
                color="#ef4444"
                className="mr-3"
              />
            )}
          </View>
        </View>

        {/* Price Input */}
        <View className="mb-5">
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-800 dark:text-gray-200 font-semibold mb-2">
              Price (₱)
            </Text>
            <Text
              className={`text-xs ${
                formData.price && parseFloat(formData.price) >= 100000
                  ? "text-red-500 font-semibold"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {formData.price
                ? `₱${parseFloat(formData.price).toLocaleString()}`
                : ""}
            </Text>
          </View>
          <View
            className={`flex-row items-center border rounded-lg bg-white dark:bg-gray-800/60 ${
              formData.price && parseFloat(formData.price) >= 100000
                ? "border-red-500 bg-red-50 dark:bg-red-950/30"
                : "border-gray-300 dark:border-gray-700"
            }`}
          >
            <TextInput
              value={formData.price}
              onChangeText={(text) => updateFormField("price", text)}
              placeholder="Enter price (max ₱99,999)"
              placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
              keyboardType="decimal-pad"
              className="flex-1 p-3 text-base text-gray-900 dark:text-gray-100"
              editable={!isUploadingImage}
            />
            {formData.price && parseFloat(formData.price) >= 100000 && (
              <Ionicons
                name="alert-circle"
                size={20}
                color="#ef4444"
                className="mr-3"
              />
            )}
          </View>
        </View>

        {/* Description Input */}
        <View className="mb-5">
          <Text className="text-gray-800 dark:text-gray-200 font-semibold mb-2">
            Description
          </Text>
          <TextInput
            value={formData.description}
            onChangeText={(text) => updateFormField("description", text)}
            placeholder="Describe your product"
            placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
            multiline
            numberOfLines={4}
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/60 rounded-lg p-3 text-base text-gray-900 dark:text-gray-100"
            textAlignVertical="top"
            editable={!isUploadingImage}
          />
        </View>

        <TagsSelection
          formData={formData}
          disabled={isUploadingImage}
          onSelectCategory={(category) =>
            updateFormField("category", category)
          }
        />

        <CategorySpecificFields
          formData={formData}
          disabled={isUploadingImage}
          onFieldChange={(field, value) => updateFormField(field, value)}
        />

        <AdditionalImagesSection
          additionalImages={formData.additionalImages || []}
          disabled={isUploadingImage}
          onPickImages={pickAdditionalImages}
          onRemoveImage={removeAdditionalImage}
        />

        {/* Error Display */}
        {uploadError && (
          <View className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800">
            <View className="flex-row items-start">
              <Ionicons
                name="alert-circle"
                size={18}
                color="#dc2626"
                style={{ marginTop: 1 }}
              />
              <Text className="ml-2 text-red-700 dark:text-red-400 text-sm flex-1">
                {uploadError}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={handlePublish}
          className={`mt-2 p-4 rounded-lg items-center ${
            isUploadingImage
              ? "bg-gray-400 dark:bg-gray-700"
              : !isAuthenticated
                ? "bg-orange-500"
                : "bg-green-600 dark:bg-green-600"
          }`}
          disabled={isUploadingImage}
        >
          {isUploadingImage ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : !isAuthenticated ? (
            <Text className="text-white font-bold text-base">
              🔐 Login to Post
            </Text>
          ) : (
            <Text className="text-white font-bold text-base">
              Publish Post
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
</SafeAreaView>
    </>
  );
}
