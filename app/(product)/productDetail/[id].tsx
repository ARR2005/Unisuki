import { createAppNotification } from "@/feature/notifications/notifications";
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

interface Coupon {
  id: string;
  code: string;
  discountAmount: number; // Flat discount in PHP
  label: string;
}

const AVAILABLE_COUPONS: Coupon[] = [
  { id: "1", code: "WELCOME10", discountAmount: 10, label: "₱10 Off Welcome Coupon" },
  { id: "2", code: "STUDENT20", discountAmount: 20, label: "₱20 Off Student Pass" },
];

export default function ProductDetailsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isReserving, setIsReserving] = useState(false);
  const [isInitiatingChat, setIsInitiatingChat] = useState(false);

  // Coupon state
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

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

  const discount = selectedCoupon ? selectedCoupon.discountAmount : 0;
  const total = Math.max(0, price - discount);

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
      const buyerName =
        currentUser.displayName || currentUser.email?.split("@")[0] || "Buyer";
      const resolvedSellerName = sellerName || "Seller";

      // 1. Mark item as reserved
      const productRef = doc(
        db,
        "user",
        safeSellerId,
        "itemPosted",
        safeProductId
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
            discountApplied: discount,
            appliedCouponCode: selectedCoupon?.code || null,
            totalPrice: total,
            itemImage: image_uri || "",
            sellerName: resolvedSellerName,
            buyerName: buyerName,
            createdAt: serverTimestamp(),
          },
        },
        { merge: true }
      );

      // 3. Send initial user message
      const messagesRef = collection(db, "chats", chatId, "messages");
      await addDoc(messagesRef, {
        senderId: currentUser.uid,
        text: `Hi! I would like to reserve "${title || "this item"}" for ₱${total.toFixed(2)}${
          selectedCoupon ? ` (Applied Coupon: ${selectedCoupon.code})` : ""
        }.`,
        createdAt: serverTimestamp(),
        systemMessage: false,
      });

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
    const buyerName =
      currentUser.displayName || currentUser.email?.split("@")[0] || "Buyer";
    const resolvedSellerName = sellerName || "Seller";

    // Direct Chat Identifier
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
        type: "direct", // Direct chat type without reservation metadata
        updatedAt: serverTimestamp(),
        lastMessage: `Inquired about ${title || "item"}`,
        participantNames: {
          [currentUser.uid]: buyerName,
          [safeSellerId]: resolvedSellerName,
        },
      },
      { merge: true }
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

    // Push to the direct chat screen
    router.push({
      pathname: "/(chat)/direct/[chatId]" as any,
      params: {
        chatId,
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

  const allImages = image_uri
    ? [image_uri, ...additionalImages]
    : additionalImages;
  const hasMultipleImages = allImages.length > 1;
  const currentImage = allImages[currentImageIndex] || image_uri || null;

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
          {/* Top Header */}
          <View className="flex-row items-center mb-4 mt-8">
            <TouchableOpacity onPress={() => router.back()} className="mr-3 p-2">
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

            {/* Seller Name + Published At Date */}
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
                  {sellerName || "Seller"}
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
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <Text className="font-semibold">Category:</Text> {category}
                </Text>
              ) : null}
              {sizes ? (
                <Text
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <Text className="font-semibold">Sizes:</Text> {sizes}
                </Text>
              ) : null}
              {styles ? (
                <Text
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <Text className="font-semibold">Styles:</Text> {styles}
                </Text>
              ) : null}
              {shoeSize ? (
                <Text
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <Text className="font-semibold">Shoe size:</Text> {shoeSize}
                </Text>
              ) : null}
              {amount ? (
                <Text
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <Text className="font-semibold">Amount:</Text> {amount}
                </Text>
              ) : null}
              {stationaryType ? (
                <Text
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <Text className="font-semibold">Stationery type:</Text>{" "}
                  {stationaryType}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Coupon Selection Card */}
          <View
            className={`mb-4 rounded-2xl border p-4 ${
              isDark
                ? "bg-[#0e0e0e]/40 border-slate-800"
                : "bg-white border-gray-200/80"
            }`}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <Ionicons name="pricetag-outline" size={18} color="#059669" />
                <Text
                  className={`text-sm font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Apply Coupon
                </Text>
              </View>
              {selectedCoupon && (
                <TouchableOpacity onPress={() => setSelectedCoupon(null)}>
                  <Text className="text-xs font-semibold text-rose-500">
                    Remove Coupon
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View className="gap-2">
              {AVAILABLE_COUPONS.map((coupon) => {
                const isSelected = selectedCoupon?.id === coupon.id;
                return (
                  <TouchableOpacity
                    key={coupon.id}
                    onPress={() =>
                      setSelectedCoupon(isSelected ? null : coupon)
                    }
                    className={`p-3 rounded-xl border flex-row items-center justify-between ${
                      isSelected
                        ? isDark
                          ? "bg-emerald-950/40 border-emerald-500"
                          : "bg-emerald-50 border-emerald-600"
                        : isDark
                        ? "border-slate-800 bg-[#0e0e0e]/20"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <View>
                      <Text
                        className={`font-bold text-sm ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {coupon.code}
                      </Text>
                      <Text
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {coupon.label}
                      </Text>
                    </View>
                    <Ionicons
                      name={
                        isSelected ? "checkmark-circle" : "ellipse-outline"
                      }
                      size={20}
                      color={isSelected ? "#059669" : "#9ca3af"}
                    />
                  </TouchableOpacity>
                );
              })}
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
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Item Price
              </Text>
              <Text
                className={`text-base font-semibold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                ₱{price.toFixed(2)}
              </Text>
            </View>

            {selectedCoupon ? (
              <View className="mt-2 flex-row justify-between">
                <Text className="text-sm text-emerald-500 font-medium">
                  Coupon Discount ({selectedCoupon.code})
                </Text>
                <Text className="text-sm text-emerald-500 font-bold">
                  -₱{discount.toFixed(2)}
                </Text>
              </View>
            ) : null}

            <View className="mt-3 flex-row justify-between border-t border-gray-100 dark:border-slate-800 pt-2.5">
              <Text
                className={`font-bold text-base ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
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