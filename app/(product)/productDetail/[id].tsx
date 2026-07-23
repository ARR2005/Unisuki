import { useProductDetail } from "@/feature/Product/hooks/useProductDetail";
import { auth, db } from "@/service/firebaseConfigs";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
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

export default function ProductDetailsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isReserving, setIsReserving] = useState(false);
  const [isInitiatingChat, setIsInitiatingChat] = useState(false);

  const { id, sellerId } = useLocalSearchParams<{
    id: string;
    sellerId: string;
  }>();

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

  const transactionFee = 5;
  const total = price + transactionFee;

  const handleReserve = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("Please log in to reserve this item.");
      return;
    }

    if (!sellerId || !id) {
      alert("This product is missing required details.");
      return;
    }

    if (currentUser.uid === sellerId) {
      alert("You cannot reserve your own listing.");
      return;
    }

    setIsReserving(true);

    try {
      const safeSellerId = String(sellerId).trim();
      const safeProductId = String(id).trim();
      const buyerName = currentUser.displayName || currentUser.email?.split("@")[0] || "Buyer";
      const resolvedSellerName = sellerName || "Seller";

      // 1. Mark item as reserved
      const productRef = doc(
        db,
        "user",
        safeSellerId,
        "itemPosted",
        safeProductId,
      );
      await setDoc(productRef, { isReserved: true }, { merge: true });

      // 2. Setup Chat document with participant names
      const chatId = `${currentUser.uid}_${safeSellerId}_${safeProductId}_res`;
      const chatRef = doc(db, "chats", chatId);

      await setDoc(
        chatRef,
        {
          chatId,
          participants: [currentUser.uid, safeSellerId],
          buyerId: currentUser.uid,
          sellerId: safeSellerId,
          productId: safeProductId,
          type: "reservation",
          updatedAt: serverTimestamp(),
          lastMessage: `[Reservation Request] ${title || "this item"}`,
          participantNames: {
            [currentUser.uid]: buyerName,
            [safeSellerId]: resolvedSellerName,
          },
          reservation: {
            status: "pending",
            itemTitle: title || "Item",
            itemPrice: price || 0,
            transactionFee,
            totalPrice: total,
            itemImage: image_uri || "",
            sellerName: resolvedSellerName,
            buyerName: buyerName,
            createdAt: serverTimestamp(),
          },
        },
        { merge: true },
      );

      // 3. Send initial user message (not system message)
      const messagesRef = collection(db, "chats", chatId, "messages");
      await addDoc(messagesRef, {
        senderId: currentUser.uid,
        text: `Hi! I would like to reserve "${title || "this item"}" for ₱${total.toFixed(2)}.`,
        createdAt: serverTimestamp(),
        systemMessage: false,
      });

      // 4. Navigate to Chat & pass otherUserName parameter
      router.push({
        pathname: "/(chat)/[chatId]",
        params: {
          chatId,
          isReservation: "true",
          otherUserName: resolvedSellerName, // Passes seller name directly to chat header!
        },
      });
    } catch (err) {
      console.error("Error creating reservation:", err);
      alert("Could not process reservation. Please try again.");
    } finally {
      setIsReserving(false);
    }
  };

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
      const safeSellerId = String(sellerId).trim();
      const safeProductId = String(id).trim();
      const buyerName = currentUser.displayName || currentUser.email?.split("@")[0] || "Buyer";
      const resolvedSellerName = sellerName || "Seller";

      const chatId = `${currentUser.uid}_${safeSellerId}_${safeProductId}_direct`;
      const chatRef = doc(db, "chats", chatId);

      await setDoc(
        chatRef,
        {
          chatId,
          participants: [currentUser.uid, safeSellerId],
          buyerId: currentUser.uid,
          sellerId: safeSellerId,
          productId: safeProductId,
          type: "direct",
          updatedAt: serverTimestamp(),
          lastMessage: `Inquired about ${title || "item"}`,
          participantNames: {
            [currentUser.uid]: buyerName,
            [safeSellerId]: resolvedSellerName,
          },
        },
        { merge: true },
      );

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

      router.push({
        pathname: "/(chat)/[chatId]",
        params: {
          chatId,
          isReservation: "false",
          otherUserName: resolvedSellerName, // Passes seller name directly
        },
      });
    } catch (err) {
      console.error("Error initiating chat:", err);
      alert("Could not start conversation. Please try again.");
    } finally {
      setIsInitiatingChat(false);
    }
  };

  const allImages = image_uri
    ? [image_uri, ...additionalImages]
    : additionalImages;
  const hasMultipleImages = allImages.length > 1;
  const currentImage = allImages[currentImageIndex] || image_uri || null;

  if (loading) {
    return (
      <View
        className={`flex-1 items-center justify-center ${isDark ? "bg-slate-900" : "bg-white"}`}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#059669" />
        <Text
          className={`mt-3 font-medium text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          Loading product details...
        </Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View
        className={`flex-1 items-center justify-center p-6 ${isDark ? "bg-slate-900" : "bg-white"}`}
      >
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

      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        className="flex-1"
      >
        <View className="px-4 pt-1">
          <View className="flex-row items-center mb-4 mt-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3 p-2"
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={isDark ? "#fff" : "#111827"}
              />
            </TouchableOpacity>
            <Text
              className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Product Details
            </Text>
          </View>

          {currentImage ? (
            <View className="mb-4">
              <Image
                source={{ uri: currentImage }}
                className="w-full h-72 rounded-2xl"
                resizeMode="cover"
              />
              {hasMultipleImages && (
                <View className="mt-3 flex-row justify-center gap-2">
                  {allImages.map((image, index) => (
                    <TouchableOpacity
                      key={`${image}-${index}`}
                      onPress={() => setCurrentImageIndex(index)}
                      className={`h-2.5 w-2.5 rounded-full ${
                        index === currentImageIndex
                          ? "bg-emerald-600"
                          : "bg-gray-300"
                      }`}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View className="mb-4 h-72 items-center justify-center rounded-2xl bg-gray-100">
              <Ionicons name="image-outline" size={48} color="#9ca3af" />
            </View>
          )}

          <View className="mb-5">
            <Text
              className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {title}
            </Text>
            <Text
              className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              {sellerName || "Seller"}
            </Text>
            <Text
              className={`mt-3 text-base ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              {description || "No description available."}
            </Text>
          </View>

          <View className="mb-5 rounded-2xl bg-gray-50 p-4">
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Price</Text>
              <Text className="text-lg font-semibold text-gray-900">
                ₱{price.toFixed(2)}
              </Text>
            </View>
            <View className="mt-2 flex-row justify-between">
              <Text className="text-sm text-gray-600">Transaction fee</Text>
              <Text className="text-sm text-gray-700">
                ₱{transactionFee.toFixed(2)}
              </Text>
            </View>
            <View className="mt-2 flex-row justify-between border-t border-gray-200 pt-2">
              <Text className="font-semibold text-gray-900">Total</Text>
              <Text className="font-semibold text-emerald-600">
                ₱{total.toFixed(2)}
              </Text>
            </View>
          </View>

          <View className="mb-5 rounded-2xl border border-gray-200 p-4">
            <Text className="text-sm font-semibold text-gray-900">Details</Text>
            <View className="mt-3">
              {category ? (
                <Text className="text-sm text-gray-600">
                  Category: {category}
                </Text>
              ) : null}
              {sizes ? (
                <Text className="text-sm text-gray-600">Sizes: {sizes}</Text>
              ) : null}
              {styles ? (
                <Text className="text-sm text-gray-600">Styles: {styles}</Text>
              ) : null}
              {shoeSize ? (
                <Text className="text-sm text-gray-600">
                  Shoe size: {shoeSize}
                </Text>
              ) : null}
              {amount ? (
                <Text className="text-sm text-gray-600">Amount: {amount}</Text>
              ) : null}
              {stationaryType ? (
                <Text className="text-sm text-gray-600">
                  Stationery type: {stationaryType}
                </Text>
              ) : null}
              {publishedDateLabel ? (
                <Text className="text-sm text-gray-600">
                  Posted: {publishedDateLabel}
                </Text>
              ) : null}
            </View>
          </View>

          <View className="gap-3">
            <TouchableOpacity
              onPress={handleReserve}
              disabled={isReserving}
              className="rounded-xl bg-emerald-600 px-4 py-3"
            >
              {isReserving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-center font-semibold text-white">
                  Reserve this item
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleContactSeller}
              disabled={isInitiatingChat}
              className="rounded-xl border border-emerald-600 px-4 py-3"
            >
              {isInitiatingChat ? (
                <ActivityIndicator color="#059669" />
              ) : (
                <Text className="text-center font-semibold text-emerald-600">
                  Contact seller
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}