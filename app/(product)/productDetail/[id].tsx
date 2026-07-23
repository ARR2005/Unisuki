import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useProductDetail } from "@/feature/Product/hooks/useProductDetail";
import { auth, db } from "@/service/firebaseConfigs";

export default function ProductDetailsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Dynamic Route Parameters
  const { id, sellerId } = useLocalSearchParams<{ id: string; sellerId: string }>();

  // Fetch product dynamically via hook
  const {
    loading,
    error,
    product,
    title,
    price = 0,
    image_uri,
    additionalImages = [],
    description,
    sellerName,
    category,
    sizes,
    styles,
    shoeSize,
    amount,
    stationaryType,
    publishedDateLabel,
  } = useProductDetail({
    productId: id,
    sellerId: sellerId,
  });

  const [isReserving, setIsReserving] = useState(false);
  const [isInitiatingChat, setIsInitiatingChat] = useState(false);

  // Hardcoded flat transaction fee
  const transactionFee = 5;
  const total = price + transactionFee;

  // 1. Handle Product Reservation Logic
  const handleReserve = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("Please log in to reserve this item.");
      return;
    }

    if (currentUser.uid === sellerId) {
      alert("You cannot reserve your own listing.");
      return;
    }

    setIsReserving(true);

    try {
      // Step A: Mark item as reserved in Firestore subcollection
      const productRef = doc(db, "user", sellerId, "itemPosted", id);
      await updateDoc(productRef, {
        isReserved: true,
      });

      // Step B: Create deterministic reservation chat session
      const chatId = `${currentUser.uid}_${sellerId}_${id}_res`;
      const chatRef = doc(db, "chats", chatId);

      await setDoc(
        chatRef,
        {
          chatId,
          participants: [currentUser.uid, sellerId],
          buyerId: currentUser.uid,
          sellerId: sellerId,
          productId: id,
          type: "reservation",
          updatedAt: serverTimestamp(),
          lastMessage: `[Reservation Request] ${title}`,
          reservation: {
            status: "pending",
            itemTitle: title,
            itemPrice: price,
            transactionFee: transactionFee,
            totalPrice: total,
            itemImage: image_uri || "",
            createdAt: serverTimestamp(),
          },
        },
        { merge: true }
      );

      // Step C: Send initial system message if room is new
      const messagesRef = collection(db, "chats", chatId, "messages");
      const existingMessages = await getDocs(messagesRef);

      if (existingMessages.empty) {
        await addDoc(messagesRef, {
          senderId: currentUser.uid,
          text: `Hi! I would like to reserve "${title}" for ₱${total.toFixed(2)}.`,
          createdAt: serverTimestamp(),
          systemMessage: true,
        });
      }

      // Step D: Navigate to reservation chat
      router.push({
        pathname: "/(chat)/[chatId]",
        params: { chatId, isReservation: "true" },
      });
    } catch (err) {
      console.error("Error creating reservation:", err);
      alert("Could not process reservation. Please try again.");
    } finally {
      setIsReserving(false);
    }
  };

  // 2. Handle Normal Direct Chat Logic
  const handleContactSeller = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("Please log in to contact the seller.");
      return;
    }

    if (currentUser.uid === sellerId) {
      alert("You cannot start a chat with yourself.");
      return;
    }

    setIsInitiatingChat(true);

    try {
      // Step A: Create deterministic direct chat session
      const chatId = `${currentUser.uid}_${sellerId}_${id}_direct`;
      const chatRef = doc(db, "chats", chatId);

      await setDoc(
        chatRef,
        {
          chatId,
          participants: [currentUser.uid, sellerId],
          buyerId: currentUser.uid,
          sellerId: sellerId,
          productId: id,
          type: "direct",
          updatedAt: serverTimestamp(),
          lastMessage: `Inquired about ${title}`,
        },
        { merge: true }
      );

      // Step B: Send initial inquiry message if room is new
      const messagesRef = collection(db, "chats", chatId, "messages");
      const existingMessages = await getDocs(messagesRef);

      if (existingMessages.empty) {
        await addDoc(messagesRef, {
          senderId: currentUser.uid,
          text: `Hi! I'm interested in "${title}". Is this still available?`,
          createdAt: serverTimestamp(),
          systemMessage: false,
        });
      }

      // Step C: Navigate to direct chat
      router.push({
        pathname: "/(chat)/[chatId]",
        params: { chatId, isReservation: "false" },
      });
    } catch (err) {
      console.error("Error initiating chat:", err);
      alert("Could not start conversation. Please try again.");
    } finally {
      setIsInitiatingChat(false);
    }
  };

  // Gallery image setup
  const allImages = image_uri ? [image_uri, ...additionalImages] : additionalImages;
  const hasMultipleImages = allImages.length > 1;
  const currentImage = allImages[currentImageIndex] || image_uri || null;

  // Loading State
  if (loading) {
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? "bg-slate-900" : "bg-white"}`}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#059669" />
        <Text className={`mt-3 font-medium text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Loading product details...
        </Text>
      </View>
    );
  }

  // Error State
  if (error || !product) {
    return (
      <View className={`flex-1 items-center justify-center p-6 ${isDark ? "bg-slate-900" : "bg-white"}`}>
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="mt-3 text-lg font-bold text-red-500 text-center">
          {error || "Product not found"}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 px-6 py-3 bg-emerald-600 rounded-xl active:bg-emerald-700"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? "bg-slate-900" : "bg-white"}`}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} className="flex-1">
        <View className="px-4 pt-1">
          {/* Header */}
          <View className="flex-row items-center mb-4 mt-8">
            <TouchableOpacity onPress={() => router.back()} className="mr-3 p-2">
              <Ionicons
                name="chevron-back"
                size={24}
                color={isDark ? "#fff" : "#111827"}
              />
            </TouchableOpacity>
            <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Product Details
            </Text>
          </View>

          {/* Product Image Carousel */}
          <View
            style={{
              width: "100%",
              height: 280,
              borderRadius: 12,
              overflow: "hidden",
            }}
            className={`relative ${isDark ? "bg-slate-800" : "bg-gray-100"}`}
          >
            {currentImage ? (
              <Image
                source={{ uri: currentImage }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="image-outline" size={40} color="#9CA3AF" />
              </View>
            )}

            {/* Prev / Next Arrows */}
            {hasMultipleImages && (
              <>
                <TouchableOpacity
                  onPress={() =>
                    setCurrentImageIndex(
                      (p) => (p - 1 + allImages.length) % allImages.length
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 rounded-full p-2"
                >
                  <Ionicons name="chevron-back" size={22} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    setCurrentImageIndex((p) => (p + 1) % allImages.length)
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 rounded-full p-2"
                >
                  <Ionicons name="chevron-forward" size={22} color="#fff" />
                </TouchableOpacity>
              </>
            )}

            {/* Dot Indicators */}
            {hasMultipleImages && (
              <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5">
                {allImages.map((_, i) => (
                  <View
                    key={i}
                    className={`rounded-full ${
                      i === currentImageIndex ? "w-4 h-2 bg-white" : "w-2 h-2 bg-white/50"
                    }`}
                  />
                ))}
              </View>
            )}

            {/* Count Badge */}
            {hasMultipleImages && (
              <View className="absolute top-3 right-3 bg-black/60 rounded-full px-2 py-0.5">
                <Text className="text-white text-xs font-medium">
                  {currentImageIndex + 1}/{allImages.length}
                </Text>
              </View>
            )}
          </View>

          {/* Title & Published Date */}
          <View className="mt-4 flex-row flex-wrap items-end gap-x-3 gap-y-1">
            <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              {title}
            </Text>
            {publishedDateLabel ? (
              <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Published {publishedDateLabel}
              </Text>
            ) : null}
          </View>

          {/* Seller Name */}
          {sellerName ? (
            <View className="flex-row items-center mt-1">
              <Ionicons
                name="person-circle-outline"
                size={16}
                color={isDark ? "#9CA3AF" : "#6B7280"}
              />
              <Text className={`text-sm ml-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {sellerName}
              </Text>
            </View>
          ) : null}

          {/* Category Details */}
          {category === "Clothes" && (sizes || styles) ? (
            <View
              className={`mt-3 px-3 py-2 rounded-lg flex-row flex-wrap gap-2 ${
                isDark ? "bg-blue-900/30" : "bg-blue-50"
              }`}
            >
              {sizes ? (
                <Text className={`text-sm ${isDark ? "text-blue-300" : "text-blue-700"}`}>
                  Size: {sizes}
                </Text>
              ) : null}
              {sizes && styles ? (
                <Text className={isDark ? "text-blue-500" : "text-blue-400"}>•</Text>
              ) : null}
              {styles ? (
                <Text className={`text-sm ${isDark ? "text-blue-300" : "text-blue-700"}`}>
                  Style: {styles}
                </Text>
              ) : null}
            </View>
          ) : category === "Shoes" && shoeSize ? (
            <View className={`mt-3 px-3 py-2 rounded-lg ${isDark ? "bg-purple-900/30" : "bg-purple-50"}`}>
              <Text className={`text-sm ${isDark ? "text-purple-300" : "text-purple-700"}`}>
                Sizing: {shoeSize}
              </Text>
            </View>
          ) : category === "Stationery" && (amount || stationaryType) ? (
            <View
              className={`mt-3 px-3 py-2 rounded-lg flex-row flex-wrap gap-2 ${
                isDark ? "bg-yellow-900/30" : "bg-yellow-50"
              }`}
            >
              {amount ? (
                <Text className={`text-sm ${isDark ? "text-yellow-300" : "text-yellow-700"}`}>
                  Amount: {amount}
                </Text>
              ) : null}
              {amount && stationaryType ? (
                <Text className={isDark ? "text-yellow-500" : "text-yellow-400"}>•</Text>
              ) : null}
              {stationaryType ? (
                <Text className={`text-sm ${isDark ? "text-yellow-300" : "text-yellow-700"}`}>
                  Type: {stationaryType}
                </Text>
              ) : null}
            </View>
          ) : null}

          {/* Description */}
          <Text className={`text-base mt-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            {description || "No description provided."}
          </Text>

          {/* Pick-up Method */}
          <View className={`mt-6 p-4 rounded-lg ${isDark ? "bg-slate-800" : "bg-gray-50"}`}>
            <Text className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
              Pick-up method
            </Text>
            <Text className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              On-campus pick-up
            </Text>
          </View>

          {/* Transaction Details */}
          <View className="mt-6">
            <Text className={`font-medium mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
              Transaction details
            </Text>

            <View className="flex-row justify-between items-center mb-2">
              <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Product price
              </Text>
              <Text className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                ₱ {price.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between items-center mb-2">
              <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Transaction fee
              </Text>
              <Text className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                ₱ {transactionFee.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Receipt Total */}
          <View className={`mt-6 p-4 rounded-lg ${isDark ? "bg-slate-800" : "bg-gray-50"}`}>
            <Text className={`font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Receipt
            </Text>

            <View className="flex-row justify-between mb-1">
              <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Item price
              </Text>
              <Text className={`text-sm ${isDark ? "text-gray-300" : "text-gray-900"}`}>
                ₱ {price.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between mb-1">
              <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Transaction fee
              </Text>
              <Text className={`text-sm ${isDark ? "text-gray-300" : "text-gray-900"}`}>
                ₱ {transactionFee.toFixed(2)}
              </Text>
            </View>

            <View className={`border-t my-3 ${isDark ? "border-slate-700" : "border-gray-200"}`} />

            <View className="flex-row justify-between items-center">
              <Text className={`text-base font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                Total
              </Text>
              <Text className={`text-2xl font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                ₱ {total.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="mt-8 mb-6 gap-3">
            <TouchableOpacity
              className={`w-full px-4 py-4 rounded-xl shadow-sm bg-emerald-600 ${
                isReserving ? "opacity-70" : ""
              }`}
              onPress={handleReserve}
              disabled={isReserving}
            >
              {isReserving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-center text-white font-bold text-lg">Reserve</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className={`w-full border px-4 py-4 rounded-xl ${
                isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white"
              }`}
              onPress={handleContactSeller}
              disabled={isInitiatingChat}
            >
              {isInitiatingChat ? (
                <ActivityIndicator color={isDark ? "#fff" : "#000"} size="small" />
              ) : (
                <Text className={`text-center font-bold text-lg ${isDark ? "text-white" : "text-gray-800"}`}>
                  Chat with seller
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}