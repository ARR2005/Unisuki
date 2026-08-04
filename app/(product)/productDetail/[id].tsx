import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import { createAppNotification } from "@/feature/notifications/notifications";
import { useProductDetail } from "@/feature/Product/hooks/useProductDetail";
import { auth, db } from "@/service/firebaseConfigs";

export interface ProductDetail {
  title?: string;
  price?: number;
  total?: number;
  description?: string;
  category?: string;
  sellerName?: string;
  publishedDateLabel?: string;
  image_uri?: string;
  additionalImages?: string[];
  sizes?: string;
  styles?: string;
  shoeSize?: string;
  amount?: string;
  stationaryType?: string;
  [key: string]: any; // Allows flexible dynamic fields
}

export default function ProductDetailsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isReserving, setIsReserving] = useState(false);
  const [isInitiatingChat, setIsInitiatingChat] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const { id, sellerId } = useLocalSearchParams<{
    id: string;
    sellerId: string;
  }>();

  const { loading, error, product } = useProductDetail({
    productId: id,
    sellerId,
  });

  // Safely destructure properties with fallbacks
  const {
    title = "",
    price = 0,
    total = 0,
    description = "",
    category = "",
    sellerName = "Seller",
    publishedDateLabel = "",
    image_uri = "",
    additionalImages = [],
    sizes = "",
    styles = "",
    shoeSize = "",
    amount = "",
    stationaryType = "",
  } = (product as Record<string, any>) || {};

  // Filter valid remote image URIs
  const allImages: string[] = (
    image_uri ? [image_uri, ...additionalImages] : additionalImages || []
  ).filter(
    (u: string) =>
      typeof u === "string" &&
      (u.startsWith("http://") || u.startsWith("https://")),
  );

  const hasMultipleImages = allImages.length > 1;

  // Shared Helper for User / Seller context validation
  const getAuthAndContext = () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("Please log in to proceed.");
      return null;
    }
    if (!sellerId || !id) {
      alert("This product is missing required details.");
      return null;
    }
    if (currentUser.uid === sellerId) {
      alert("You cannot perform this action on your own listing.");
      return null;
    }

    const safeSellerId = String(sellerId).trim();
    const safeProductId = String(id).trim();
    const buyerName =
      currentUser.displayName || currentUser.email?.split("@")[0] || "Buyer";
    const resolvedSellerName = sellerName || "Seller";

    return {
      currentUser,
      safeSellerId,
      safeProductId,
      buyerName,
      resolvedSellerName,
    };
  };

  const handleReserve = async () => {
    const ctx = getAuthAndContext();
    if (!ctx) return;
    const {
      currentUser,
      safeSellerId,
      safeProductId,
      buyerName,
      resolvedSellerName,
    } = ctx;

    setIsReserving(true);

    try {
      // 1. Mark item as reserved
      const productRef = doc(
        db,
        "user",
        safeSellerId,
        "itemPosted",
        safeProductId,
      );
      await setDoc(productRef, { isReserved: true }, { merge: true });

      // 2. Setup Chat document
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
            itemPrice: price,
            totalPrice: total,
            itemImage: image_uri,
            sellerName: resolvedSellerName,
            buyerName,
            createdAt: serverTimestamp(),
          },
        },
        { merge: true },
      );

      // 3. Send initial user message
      const messagesRef = collection(db, "messages");
      const existingMessages = await getDocs(
        query(messagesRef, where("chatId", "==", chatId)),
      );

      if (existingMessages.empty) {
        await addDoc(messagesRef, {
          chatId,
          senderId: currentUser.uid,
          text: `Hi! I would like to reserve "${title || "this item"}" for ₱${total.toFixed(2)}.`,
          createdAt: serverTimestamp(),
          systemMessage: false,
        });
      }

      await createAppNotification({
        recipientUid: safeSellerId,
        title: "New reservation request",
        body: `${buyerName} reserved this item. Open the chat to review it.`,
        type: "reservation",
        chatId,
        productId: safeProductId,
        sellerId: safeSellerId,
        buyerId: currentUser.uid,
        routePath: "/(chat)/[chatId]",
        routeParams: {
          chatId,
          isReservation: "true",
          otherUserName: buyerName,
        },
      });

      router.push({
        pathname: "/(chat)/[chatId]",
        params: {
          chatId,
          isReservation: "true",
          otherUserName: resolvedSellerName,
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
    const ctx = getAuthAndContext();
    if (!ctx) return;
    const {
      currentUser,
      safeSellerId,
      safeProductId,
      buyerName,
      resolvedSellerName,
    } = ctx;

    setIsInitiatingChat(true);

    try {
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
          lastMessage: `Inquired about ${title || "item"}`,
          participantNames: {
            [currentUser.uid]: buyerName,
            [safeSellerId]: resolvedSellerName,
          },
        },
        { merge: true },
      );

      const messagesRef = collection(db, "messages");
      const existingMessages = await getDocs(
        query(messagesRef, where("chatId", "==", chatId)),
      );

      if (existingMessages.empty) {
        await addDoc(messagesRef, {
          chatId,
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
          otherUserName: resolvedSellerName,
        },
      });
    } catch (err) {
      console.error("Error initiating chat:", err);
      alert("Could not start conversation. Please try again.");
    } finally {
      setIsInitiatingChat(false);
    }
  };

  if (loading) {
    return (
      <View
        className={`flex-1 items-center justify-center ${
          isDark ? "bg-[#0e0e0e]" : "bg-white"
        }`}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#059669" />
        <Text
          className={`mt-3 font-medium text-sm ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Loading product details...
        </Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View
        className={`flex-1 items-center justify-center p-6 ${
          isDark ? "bg-[#0e0e0e]" : "bg-white"
        }`}
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
    <View className={`flex-1 ${isDark ? "bg-[#0e0e0e]" : "bg-[#f3f3f3]"}`}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        className="flex-1"
      >
        <View className="px-4 pt-1">
          {/* Header */}
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
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Product Details
            </Text>
          </View>

          {/* Product Gallery */}
          {allImages.length > 0 ? (
            <View className="mb-4">
              <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                nestedScrollEnabled
                directionalLockEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const offsetX = e.nativeEvent.contentOffset.x;
                  const width = e.nativeEvent.layoutMeasurement.width;
                  setCurrentImageIndex(Math.round(offsetX / width));
                }}
                className="w-full h-72 rounded-2xl"
              >
                {allImages.map((img: string, idx: number) => (
                  <View
                    key={`${img}-${idx}`}
                    style={{ width: Dimensions.get("window").width - 32 }}
                    className="h-72"
                  >
                    <Image
                      source={{ uri: img }}
                      className="w-full h-72 rounded-2xl"
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </ScrollView>

              {hasMultipleImages && (
                <View className="mt-3 flex-row justify-center gap-2">
                  {allImages.map((image: string, index: number) => (
                    <TouchableOpacity
                      key={`${image}-${index}`}
                      onPress={() => {
                        const width = Dimensions.get("window").width - 32;
                        scrollRef.current?.scrollTo({
                          x: index * width,
                          animated: true,
                        });
                        setCurrentImageIndex(index);
                      }}
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
            <View className="mb-4 h-72 items-center justify-center rounded-2xl bg-gray-200/50 dark:bg-[#0e0e0e]/40">
              <Ionicons name="image-outline" size={48} color="#9ca3af" />
            </View>
          )}

          {/* Title and Seller Header */}
          <View className="mb-4">
            <Text
              className={`text-2xl font-black ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {title}
            </Text>

            <View className="flex-row items-center justify-between mt-2">
              <View className="flex-row items-center gap-1.5">
                <Ionicons
                  name="person-circle-outline"
                  size={20}
                  color={isDark ? "#34d399" : "#059669"}
                />
                <Text
                  className={`text-base font-bold ${
                    isDark ? "text-emerald-400" : "text-emerald-800"
                  }`}
                >
                  {sellerName}
                </Text>
              </View>

              {publishedDateLabel ? (
                <Text
                  className={`text-xs ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Posted {publishedDateLabel}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Details Card */}
          <View
            className={`mb-4 rounded-2xl border p-4 ${
              isDark
                ? "bg-[#0e0e0e]/40 border-slate-800"
                : "bg-white border-gray-200/80"
            }`}
          >
            <Text
              className={`text-sm font-bold uppercase tracking-wider mb-2 ${
                isDark ? "text-emerald-400" : "text-emerald-700"
              }`}
            >
              Details & Description
            </Text>

            <Text
              className={`text-base mb-3 ${
                isDark ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {description || "No description available."}
            </Text>

            <View className="gap-1.5 pt-2 border-t border-gray-100 dark:border-slate-800/80">
              {category ? (
                <Text
                  className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
                >
                  <Text className="font-semibold">Category:</Text> {category}
                </Text>
              ) : null}

              {sizes ? (
                <Text
                  className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
                >
                  <Text className="font-semibold">Sizes:</Text> {sizes}
                </Text>
              ) : null}

              {styles ? (
                <Text
                  className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
                >
                  <Text className="font-semibold">Styles:</Text> {styles}
                </Text>
              ) : null}

              {shoeSize ? (
                <Text
                  className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
                >
                  <Text className="font-semibold">Shoe size:</Text> {shoeSize}
                </Text>
              ) : null}

              {amount ? (
                <Text
                  className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
                >
                  <Text className="font-semibold">Amount:</Text> {amount}
                </Text>
              ) : null}

              {stationaryType ? (
                <Text
                  className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
                >
                  <Text className="font-semibold">Stationery type:</Text>{" "}
                  {stationaryType}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Price Breakdown Card */}
          <View
            className={`mb-6 rounded-2xl border p-4 ${
              isDark
                ? "bg-[#0e0e0e]/40 border-slate-800"
                : "bg-white border-gray-200/80"
            }`}
          >
            <View className="flex-row justify-between">
              <Text
                className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                Item Price
              </Text>
              <Text
                className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                ₱{price.toFixed(2)}
              </Text>
            </View>

            <View className="mt-3 flex-row justify-between border-t border-gray-100 dark:border-slate-800 pt-2.5">
              <Text
                className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Total Price
              </Text>
              <Text className="font-black text-xl text-emerald-500">
                ₱{total.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={handleReserve}
              disabled={isReserving}
              className="rounded-xl bg-emerald-600 px-4 py-3.5 items-center justify-center"
            >
              {isReserving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-center font-bold text-white text-base">
                  Reserve this item
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleContactSeller}
              disabled={isInitiatingChat}
              className={`rounded-xl border px-4 py-3.5 items-center justify-center ${
                isDark
                  ? "border-emerald-500 bg-[#0e0e0e]/20"
                  : "border-emerald-600 bg-white"
              }`}
            >
              {isInitiatingChat ? (
                <ActivityIndicator color="#059669" />
              ) : (
                <Text className="text-center font-bold text-emerald-500 text-base">
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
