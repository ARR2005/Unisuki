import AccordionItem from "@/components/ui/AccordionItem";
import {
    ClassificationResult,
    LocalModelService,
    generateAutoFilledData,
    usePostForm,
} from "@/feature/postProduct/camera";
import { useImage } from "@/context/storeImage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PostFormScreen() {
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

  const [isTagOpen, setIsTagOpen] = React.useState(false);
  const [isClassifying, setIsClassifying] = React.useState(false);
  const [classificationResult, setClassificationResult] =
    React.useState<ClassificationResult | null>(null);
  const [showClassificationResults, setShowClassificationResults] =
    React.useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = React.useState(false);
  const [suggestedData, setSuggestedData] = React.useState<any>(null);
  const [showAnalysisPrompt, setShowAnalysisPrompt] = React.useState(
    Boolean(capturedImage?.uri),
  );

  // Track the last classified image URI to prevent spam
  const lastClassifiedUriRef = useRef<string | null>(null);
  const classificationAbortRef = useRef(false);

  const tags = [
    { name: "Miscellaneous", icon: "grid-outline" },
    { name: "Stationery", icon: "pencil-outline" },
    { name: "Clothes", icon: "shirt-outline" },
    { name: "Shoes", icon: "footsteps-outline" },
    { name: "Gadget", icon: "phone-portrait-outline" },
  ];

  // Auto-classify image when it's captured (only once per unique image)
  useEffect(() => {
    let cancelled = false;

    const autoClassifyImage = async () => {
      if (!capturedImage?.uri) return;

      // Only classify if this is a new image URI
      if (lastClassifiedUriRef.current === capturedImage.uri) {
        return;
      }

      // Mark this URI immediately so no duplicate runs happen
      lastClassifiedUriRef.current = capturedImage.uri;

      // Show the analysis prompt instead of starting immediately
      setShowAnalysisPrompt(true);
    };

    autoClassifyImage();

    return () => {
      cancelled = true;
    };
  }, [capturedImage?.uri]);

  const handleStartAnalysis = async () => {
    setShowAnalysisPrompt(false);
    setIsClassifying(true);
    classificationAbortRef.current = false;

    // Start a hard 30s deadline — once it fires, NO classification result is accepted
    const deadlineTimer = setTimeout(() => {
      classificationAbortRef.current = true;
      setClassificationResult(null);
      setShowClassificationResults(false);
      setIsClassifying(false);
    }, 30000);

    try {
      await LocalModelService.loadModel();

      // Abort check after model load
      if (classificationAbortRef.current) {
        clearTimeout(deadlineTimer);
        return;
      }

      const result = await LocalModelService.classifyImage(capturedImage?.uri!);

      // Abort check after classification — this is the key guard
      if (classificationAbortRef.current) {
        clearTimeout(deadlineTimer);
        return;
      }

      clearTimeout(deadlineTimer);

      if (result.success && result.topResult) {
        setClassificationResult(result.topResult);
        setShowClassificationResults(true);

        // Do not show suggestion for uncertain predictions.
        if (result.topResult.confidence < 0.5) {
          setIsClassifying(false);
          return;
        }

        // Add delay before showing suggestion (500ms)
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (classificationAbortRef.current) return;

        // Prepare suggested data but don't auto-fill yet
        const suggestedFormData = generateAutoFilledData(
          result.topResult.label,
          result.topResult.confidence,
        );
        setSuggestedData(suggestedFormData);
        setShowSuggestionModal(true);
      } else {
        setShowClassificationResults(false);
      }
    } catch {
      clearTimeout(deadlineTimer);
      if (!classificationAbortRef.current) {
        setShowClassificationResults(false);
      }
    } finally {
      if (!classificationAbortRef.current) {
        setIsClassifying(false);
      }
    }
  };

  const handleSkipAnalysis = () => {
    setShowAnalysisPrompt(false);
    setIsClassifying(false);
  };

  const handlePublish = async () => {
    setUploadError(null);
    const success = await uploadAndPublish();
    if (success) {
      router.push("/(dashboard)/home");
    }
  };

  const handleAcceptSuggestion = () => {
    if (suggestedData) {
      updateFormField("title", suggestedData.title);
      updateFormField("price", suggestedData.price);
      updateFormField("description", suggestedData.description);
      updateFormField("category", suggestedData.category);
    }
    setShowSuggestionModal(false);
    setSuggestedData(null);
    setIsClassifying(false);
  };

  const handleRejectSuggestion = () => {
    setShowSuggestionModal(false);
    setSuggestedData(null);
    setIsClassifying(false);
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
      <SafeAreaView edges={["top"]} className="flex-1  bg-primary">
        <View className="flex-1 items-center justify-start pt-32">
          <View className="w-full h-72  bg-secondary items-center ">
            <View className="w-20 h-20 rounded-full bg-main items-center justify-center mb-5">
              <Ionicons name="sparkles-outline" size={34} color="#000000" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 text-center">
              Analyzing Your Image
            </Text>
            <Text className="text-gray-600 text-center mt-2 leading-6">
              Please wait while the model checks your photo and prepares
              suggested details for your post.
            </Text>
            <ActivityIndicator size="large" color="#111827" className=" p-24" />
            <Text className="text-sm text-gray-500 mt-4">
              This usually takes a few seconds.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      {/* Analysis Prompt Modal */}
      <Modal
        visible={showAnalysisPrompt}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 bg-black/50 items-center justify-center p-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="mb-4">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full items-center justify-center mb-3">
                  <Ionicons name="scan-outline" size={24} color="#16a34a" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 mb-2">
                  AI Image Analysis
                </Text>
              </View>
              <Text className="text-gray-600 text-sm">
                Let our AI analyze your image to auto-fill product details, or
                skip and fill them manually.
              </Text>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleSkipAnalysis}
                className="flex-1 border border-gray-300 rounded-lg py-3 items-center"
              >
                <Text className="font-semibold text-gray-700">
                  Continue to Form
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleStartAnalysis}
                className="flex-1 bg-green-600 rounded-lg py-3 items-center"
              >
                <Text className="font-semibold text-white">Analyze</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Suggestion Modal */}
      <Modal
        visible={showSuggestionModal}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 bg-black/50 items-center justify-center p-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="mb-4">
              <Text className="text-2xl font-bold text-green-900 mb-2">
                UNISUKI Suggestion
              </Text>
              <Text className="text-gray-600 text-sm">
                Based on your image, we suggest the following details:
              </Text>
            </View>

            {suggestedData && (
              <View className="bg-gray-50 rounded-lg p-4 mb-6 gap-3">
                <View>
                  <Text className="text-xs font-semibold text-gray-500 mb-1">
                    Title
                  </Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {suggestedData.title}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs font-semibold text-gray-500 mb-1">
                    Category
                  </Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {suggestedData.category}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs font-semibold text-gray-500 mb-1">
                    Price
                  </Text>
                  <Text className="text-sm font-medium text-gray-900">
                    ₱{suggestedData.price}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs font-semibold text-gray-500 mb-1">
                    Description
                  </Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {suggestedData.description}
                  </Text>
                </View>
              </View>
            )}

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleRejectSuggestion}
                className="flex-1 border border-gray-300 rounded-lg py-3 items-center"
              >
                <Text className="font-semibold text-gray-700">Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAcceptSuggestion}
                className="flex-1 bg-green-600 rounded-lg py-3 items-center"
              >
                <Text className="font-semibold text-white">Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <SafeAreaView edges={["top"]} className="flex-1 bg-white">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            className="flex-1 bg-white"
            contentContainerStyle={{ paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Image Preview */}
            <View className="h-80 bg-gray-200 relative overflow-hidden">
              <Image
                source={{ uri: capturedImage.uri }}
                className="w-full h-full"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => router.back()}
                className="absolute top-4 left-4 bg-black/50 rounded-full p-2"
              >
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.back()}
                className="absolute top-4 right-4 bg-black/50 rounded-full p-2"
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View className="px-5 pt-6">
              {/* Title Input */}
              <View className="mb-5">
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-800 font-semibold mb-2">
                    Item Title
                  </Text>
                  <Text
                    className={`text-xs ${formData.title.length >= 25 ? "text-red-500 font-semibold" : "text-gray-500"}`}
                  >
                    {formData.title.length}/24
                  </Text>
                </View>
                <View
                  className={`flex-row items-center border rounded-lg ${
                    formData.title.length >= 25
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                >
                  <TextInput
                    value={formData.title}
                    onChangeText={(text) => updateFormField("title", text)}
                    placeholder="Enter product title (max 24 chars)"
                    className="flex-1 p-3 text-base"
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
                  <Text className="text-gray-800 font-semibold mb-2">
                    Price (₱)
                  </Text>
                  <Text
                    className={`text-xs ${
                      formData.price && parseFloat(formData.price) >= 100000
                        ? "text-red-500 font-semibold"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.price
                      ? `₱${parseFloat(formData.price).toLocaleString()}`
                      : ""}
                  </Text>
                </View>
                <View
                  className={`flex-row items-center border rounded-lg ${
                    formData.price && parseFloat(formData.price) >= 100000
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                >
                  <TextInput
                    value={formData.price}
                    onChangeText={(text) => updateFormField("price", text)}
                    placeholder="Enter price (max ₱99,999)"
                    keyboardType="decimal-pad"
                    className="flex-1 p-3 text-base"
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
                <Text className="text-gray-800 font-semibold mb-2">
                  Description
                </Text>
                <TextInput
                  value={formData.description}
                  onChangeText={(text) => updateFormField("description", text)}
                  placeholder="Describe your product"
                  multiline
                  numberOfLines={4}
                  className="border border-gray-300 rounded-lg p-3 text-base"
                  textAlignVertical="top"
                  editable={!isUploadingImage}
                />
              </View>

              {/* Tags Selection */}
              <View className="mb-5">
                <Text className="text-gray-800 font-semibold mb-2">Tags</Text>
                <View className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                  <AccordionItem
                    title={(formData as any).category || "Select Tag"}
                    icon="pricetags-outline"
                    isOpen={isTagOpen}
                    onPress={() => setIsTagOpen(!isTagOpen)}
                  >
                    <View className="-mx-4 -my-4">
                      {tags.map((tag, index) => (
                        <TouchableOpacity
                          key={index}
                          className={`flex-row items-center p-4 border-b border-gray-100 ${
                            (formData as any).category === tag.name
                              ? "bg-green-50"
                              : "bg-white"
                          }`}
                          onPress={() => {
                            updateFormField("category", tag.name);
                            setIsTagOpen(false);
                          }}
                        >
                          <Ionicons
                            name={tag.icon as any}
                            size={20}
                            color={
                              (formData as any).category === tag.name
                                ? "#16a34a"
                                : "#6b7280"
                            }
                          />
                          <Text
                            className={`ml-3 flex-1 ${(formData as any).category === tag.name ? "text-green-700 font-medium" : "text-gray-700"}`}
                          >
                            {tag.name}
                          </Text>
                          {(formData as any).category === tag.name && (
                            <Ionicons
                              name="checkmark-circle"
                              size={20}
                              color="#16a34a"
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </AccordionItem>
                </View>
              </View>

              {/* Category-Specific Fields */}
              {(formData as any).category === "Clothes" && (
                <View className="mb-5 p-4 rounded-l border border-gray-300">
                  <View className="mb-4">
                    <Text className="text-gray-800 font-semibold mb-2">
                      Sizes
                    </Text>
                    <TextInput
                      value={formData.sizes || ""}
                      onChangeText={(text) => updateFormField("sizes", text)}
                      placeholder="e.g., S, M, L, XL"
                      className="border border-gray-300 rounded-lg p-3 text-base"
                      editable={!isUploadingImage}
                    />
                  </View>
                  <View>
                    <Text className="text-gray-800 font-semibold mb-2">
                      Styles
                    </Text>
                    <TextInput
                      value={formData.styles || ""}
                      onChangeText={(text) => updateFormField("styles", text)}
                      placeholder="e.g., Casual, Formal, Sporty"
                      className="border border-gray-300 rounded-lg p-3 text-base"
                      editable={!isUploadingImage}
                    />
                  </View>
                </View>
              )}

              {(formData as any).category === "Shoes" && (
                <View className="mb-5 p-4 rounded-lg border border-gray-300">
                  <Text className="text-gray-800 font-semibold mb-2">
                    Shoe Sizing
                  </Text>
                  <TextInput
                    value={formData.shoeSize || ""}
                    onChangeText={(text) => updateFormField("shoeSize", text)}
                    placeholder="e.g., 6, 7, 8, 9, 10+"
                    className="border border-gray-300 rounded-lg p-3 text-base"
                    editable={!isUploadingImage}
                  />
                </View>
              )}

              {(formData as any).category === "Stationery" && (
                <View className="mb-5 p-4 rounded-lg border border-gray-300 ">
                  <View className="mb-4">
                    <Text className="text-gray-800 font-semibold mb-2">
                      Amount
                    </Text>
                    <TextInput
                      value={formData.amount || ""}
                      onChangeText={(text) => updateFormField("amount", text)}
                      placeholder="e.g., 100 pcs, 1 box"
                      className="border border-gray-300 rounded-lg p-3 text-base"
                      editable={!isUploadingImage}
                    />
                  </View>
                  <View>
                    <Text className="text-gray-800 font-semibold mb-2">
                      Type
                    </Text>
                    <TextInput
                      value={formData.stationeryType || ""}
                      onChangeText={(text) =>
                        updateFormField("stationeryType", text)
                      }
                      placeholder="e.g., Pens, Notebooks, Markers"
                      className="border border-gray-300 rounded-lg p-3 text-base"
                      editable={!isUploadingImage}
                    />
                  </View>
                </View>
              )}

              {/* Additional Images */}
              <View className="mb-5">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-gray-800 font-semibold">
                    Additional Images
                  </Text>
                  <Text className="text-xs text-gray-600">
                    {(formData.additionalImages || []).length} added
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={pickAdditionalImages}
                  className="border-2 border-dashed border-gray-400 rounded-lg p-4 items-center"
                  disabled={
                    isUploadingImage ||
                    (formData.additionalImages || []).length >= 5
                  }
                >
                  <Ionicons name="image-outline" size={32} color="#9ca3af" />
                  <Text className="text-gray-600 font-medium mt-2">
                    Tap to add more photos
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    Supports up to 5 additional images
                  </Text>
                </TouchableOpacity>

                {/* Display additional images */}
                {(formData.additionalImages || []).length > 0 && (
                  <View className="mt-4">
                    <Text className="text-sm text-gray-700 font-medium mb-2">
                      Added Images:
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {(formData.additionalImages || []).map(
                        (imageUri, index) => (
                          <View
                            key={index}
                            className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200"
                          >
                            <Image
                              source={{ uri: imageUri }}
                              className="w-full h-full"
                              resizeMode="cover"
                            />
                            <TouchableOpacity
                              onPress={() => removeAdditionalImage(imageUri)}
                              className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
                            >
                              <Ionicons name="close" size={12} color="#fff" />
                            </TouchableOpacity>
                          </View>
                        ),
                      )}
                    </View>
                  </View>
                )}
              </View>
              {/* Error Display */}
              {uploadError && (
                <View className="mb-4 p-4 rounded-lg bg-red-50 border border-red-300">
                  <View className="flex-row items-start">
                    <Ionicons
                      name="alert-circle"
                      size={18}
                      color="#dc2626"
                      style={{ marginTop: 1 }}
                    />
                    <Text className="ml-2 text-red-700 text-sm flex-1">
                      {uploadError}
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                onPress={handlePublish}
                className={`mt-2 p-4 rounded-lg items-center ${
                  isUploadingImage
                    ? "bg-gray-400"
                    : !isAuthenticated
                      ? "bg-orange-500"
                      : "bg-green-600"
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
