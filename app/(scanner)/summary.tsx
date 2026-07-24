import { useRedeemCoupons, Coupon } from "@/feature/coupon/useRedeemCoupons";
import { createAppNotification } from "@/feature/notifications/notifications";
import { auth, db } from "@/service/firebaseConfigs";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

export default function SummaryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const {
    payload,
    chatId,
    reservationId,
    productId,
    sellerId,
    buyerId,
    itemTitle: itemTitleParam,
    sellerName: sellerNameParam,
    itemPrice: itemPriceParam,
    totalPrice: totalPriceParam,
  } = useLocalSearchParams<{
    payload?: string;
    chatId?: string;
    reservationId?: string;
    productId?: string;
    sellerId?: string;
    buyerId?: string;
    itemTitle?: string;
    sellerName?: string;
    itemPrice?: string;
    totalPrice?: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionData, setTransactionData] = useState<any>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  // Pull valid, unused coupons claimed by the user
  const { validCouponsForPurchase } = useRedeemCoupons();

  const TRANSACTION_FEE = 5; // Standard ₱5 transaction fee

  useEffect(() => {
    async function loadTransactionFromFirestore() {
      try {
        const payloadValue = typeof payload === "string" ? payload : "";
        let parsedPayload: Record<string, any> | null = null;

        if (payloadValue) {
          try {
            parsedPayload = JSON.parse(payloadValue);
          } catch (err) {
            console.warn("Failed to parse QR payload:", err);
          }
        }

        const fallbackData = {
          chatId: chatId || parsedPayload?.chatId || "",
          reservationId: reservationId || parsedPayload?.reservationId || "",
          productId: productId || parsedPayload?.productId || "",
          sellerId: sellerId || parsedPayload?.sellerId || "",
          buyerId: buyerId || parsedPayload?.buyerId || "",
          itemTitle:
            itemTitleParam ||
            parsedPayload?.itemTitle ||
            parsedPayload?.title ||
            parsedPayload?.productName ||
            "",
          sellerName:
            sellerNameParam ||
            parsedPayload?.sellerName ||
            parsedPayload?.seller ||
            "",
          itemPrice: Number(
            itemPriceParam ||
              parsedPayload?.itemPrice ||
              parsedPayload?.price ||
              parsedPayload?.amount ||
              0
          ),
          totalPrice: Number(
            totalPriceParam ||
              parsedPayload?.totalPrice ||
              parsedPayload?.total ||
              0
          ),
        };

        if (
          !fallbackData.chatId &&
          !fallbackData.itemTitle &&
          !fallbackData.sellerName
        ) {
          Alert.alert("Error", "No transaction payload found.");
          router.back();
          return;
        }

        setTransactionData(fallbackData);

        if (fallbackData.chatId) {
          const chatRef = doc(db, "chats", fallbackData.chatId);
          const chatSnap = await getDoc(chatRef);

          if (chatSnap.exists()) {
            const chatData = chatSnap.data();
            setTransactionData((prev: any) => ({
              ...prev,
              ...chatData.reservation,
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching summary data:", err);
        Alert.alert("Error", "Could not load transaction details.");
      } finally {
        setLoading(false);
      }
    }

    loadTransactionFromFirestore();
  }, [
    payload,
    chatId,
    reservationId,
    productId,
    sellerId,
    buyerId,
    itemTitleParam,
    sellerNameParam,
    itemPriceParam,
    totalPriceParam,
    router,
  ]);

  const basePrice = Number(
    transactionData?.itemPrice || transactionData?.price || 0
  );
  const discountAmount = selectedCoupon ? selectedCoupon.discountAmount : 0;

  // Total Calculation: Item Price - Coupon Discount + ₱5 Transaction Fee
  const finalPrice = Math.max(0, basePrice - discountAmount) + TRANSACTION_FEE;

  // Reward Rule: Every ₱10 spent = 1 point earned
  const earnedPoints = Math.floor(finalPrice / 10);

  const handleCompleteTransaction = async () => {
    if (!transactionData) return;

    setIsSubmitting(true);

    try {
      const targetChatId = transactionData.chatId || chatId;
      const targetSellerId = transactionData.sellerId || sellerId;
      const targetProductId = transactionData.productId || productId;
      const currentUser = auth.currentUser;
      const buyerUid = currentUser?.uid || transactionData.buyerId || buyerId;

      // 1. Mark used coupon as consumed in user's profile if applied
      if (buyerUid && selectedCoupon?.id) {
        const couponDocRef = doc(
          db,
          "user",
          buyerUid,
          "claimedCoupons",
          selectedCoupon.id
        );
        await updateDoc(couponDocRef, { isUsed: true });
      }

      // 2. Award Points to Buyer (1 point per ₱10 spent)
      if (buyerUid && earnedPoints > 0) {
        const buyerDocRef = doc(db, "user", buyerUid);
        await updateDoc(buyerDocRef, {
          points: increment(earnedPoints),
        });
      }

      // 3. Update chat status & remove active reservation data
      if (targetChatId) {
        const chatRef = doc(db, "chats", targetChatId);
        await updateDoc(chatRef, {
          "reservation.status": "completed",
          updatedAt: serverTimestamp(),
          lastMessage: "Transaction Completed",
        });

        // Add a system confirmation message in the chat
        const messagesRef = collection(db, "chats", targetChatId, "messages");
        await addDoc(messagesRef, {
          senderId: buyerUid || "system",
          text: `🎉 Item handed over! Transaction completed for ₱${finalPrice.toFixed(
            2
          )}. You earned ${earnedPoints} points!`,
          createdAt: serverTimestamp(),
          systemMessage: true,
        });
      }

      // 4. Remove product from active seller listings
      if (targetSellerId && targetProductId) {
        const productRef = doc(
          db,
          "user",
          targetSellerId,
          "itemPosted",
          targetProductId
        );
        await deleteDoc(productRef);
      }

      const itemTitle =
        transactionData.itemTitle || transactionData.title || "Reserved Item";
      const imageUrl =
        transactionData.itemImage || transactionData.imageUrl || "";

      // 5. Archive under Buyer's Purchase History
      if (buyerUid) {
        const buyerHistoryRef = collection(
          db,
          "user",
          buyerUid,
          "purchaseHistory"
        );
        await addDoc(buyerHistoryRef, {
          itemTitle,
          itemPrice: basePrice,
          discountAmount,
          transactionFee: TRANSACTION_FEE,
          totalPrice: finalPrice,
          earnedPoints,
          appliedCoupon: selectedCoupon?.code || null,
          sellerName:
            transactionData.sellerName || transactionData.seller || "",
          sellerId: targetSellerId || "",
          buyerId: buyerUid,
          productId: targetProductId || "",
          chatId: targetChatId || "",
          status: "completed",
          archivedAt: serverTimestamp(),
          completedAt: serverTimestamp(),
          imageUrl,
        });
      }

      // 6. Archive under Seller's Sales History
      if (targetSellerId) {
        const sellerHistoryRef = collection(
          db,
          "user",
          targetSellerId,
          "salesHistory"
        );
        await addDoc(sellerHistoryRef, {
          itemTitle,
          itemPrice: basePrice,
          totalPrice: finalPrice,
          buyerName:
            transactionData.buyerName ||
            currentUser?.displayName ||
            currentUser?.email?.split("@")[0] ||
            "Buyer",
          sellerId: targetSellerId,
          buyerId: buyerUid || "",
          productId: targetProductId || "",
          chatId: targetChatId || "",
          status: "completed",
          archivedAt: serverTimestamp(),
          completedAt: serverTimestamp(),
          imageUrl,
        });
      }

      // 7. Send completion notification to seller
      if (targetSellerId && targetChatId) {
        await createAppNotification({
          recipientUid: targetSellerId,
          title: "Transaction completed 🎉",
          body: `Handover for "${itemTitle}" was successful. The item has been moved to your sales archive.`,
          type: "transaction",
          chatId: targetChatId,
          productId: targetProductId,
          sellerId: targetSellerId,
          buyerId: buyerUid || "",
          routePath: "/(chat)/[chatId]",
          routeParams: {
            chatId: targetChatId,
            isReservation: "true",
          },
        });
      }

      Alert.alert(
        "Transaction Complete!",
        `The handover is verified! You earned +${earnedPoints} points from this purchase.`,
        [
          {
            text: "Return to Chat",
            onPress: () => {
              if (targetChatId) {
                router.dismissAll();
                router.push({
                  pathname: "/(chat)/[chatId]",
                  params: { chatId: targetChatId, isReservation: "true" },
                });
              } else {
                router.dismissAll();
              }
            },
          },
        ]
      );
    } catch (err) {
      console.error("Error completing transaction:", err);
      Alert.alert("Error", "Could not finalize transaction. Please try again.");
    } finally {
      setIsSubmitting(false);
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
          Loading receipt...
        </Text>
      </View>
    );
  }

  const itemTitle =
    transactionData?.itemTitle || transactionData?.title || "Reserved Item";

  return (
    <View className={`flex-1 ${isDark ? "bg-[#0e0e0e]" : "bg-[#f3f3f3]"}`}>
      <Stack.Screen
        options={{
          title: "Transaction Receipt",
          headerStyle: { backgroundColor: isDark ? "#0e0e0e" : "#ffffff" },
          headerTintColor: isDark ? "#ffffff" : "#111827",
        }}
      />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Verification Icon Header */}
        <View className="items-center my-6">
          <View className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/50 rounded-full items-center justify-center mb-3">
            <Ionicons name="checkmark-circle" size={54} color="#059669" />
          </View>
          <Text
            className={`text-2xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            QR Verified
          </Text>
          <Text
            className={`text-sm mt-1 text-center ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Confirm details below to finalize the exchange.
          </Text>
        </View>

        {/* Claimed Coupons Selection Card (Always Visible) */}
        <View
          className={`mb-4 p-4 rounded-2xl border ${
            isDark
              ? "bg-[#0e0e0e]/40 border-slate-800"
              : "bg-white border-gray-200/80"
          }`}
        >
          <View className="flex-row items-center justify-between mb-2.5">
            <View className="flex-row items-center gap-2">
              <Ionicons name="ticket-outline" size={18} color="#059669" />
              <Text
                className={`text-xs font-bold uppercase tracking-wider ${
                  isDark ? "text-emerald-400" : "text-emerald-800"
                }`}
              >
                Apply Coupon
              </Text>
            </View>

            {selectedCoupon && (
              <TouchableOpacity onPress={() => setSelectedCoupon(null)}>
                <Text className="text-xs font-bold text-rose-500">
                  Remove Coupon
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {validCouponsForPurchase.length > 0 ? (
            <View className="gap-2">
              {validCouponsForPurchase.map((coupon) => {
                const isSelected = selectedCoupon?.id === coupon.id;
                return (
                  <TouchableOpacity
                    key={coupon.id || coupon.code}
                    onPress={() =>
                      setSelectedCoupon(isSelected ? null : coupon)
                    }
                    className={`p-3 rounded-xl border flex-row items-center justify-between ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-100/30 dark:bg-emerald-950/40"
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
                        {coupon.title || coupon.code}
                      </Text>
                      <Text
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Discount: -₱{coupon.discountAmount}
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
          ) : (
            <View className="flex-row items-center justify-between pt-1">
              <Text
                className={`text-xs ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No unlocked coupons available.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(profile)/redeem-coupons" as any)}
              >
                <Text className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Claim Coupons →
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Receipt Card */}
        <View
          className={`p-5 rounded-2xl border ${
            isDark
              ? "bg-[#0e0e0e]/40 border-slate-800"
              : "bg-white border-gray-200/80"
          }`}
        >
          <Text
            className={`font-bold text-lg mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {itemTitle}
          </Text>

          {/* Base Item Price */}
          <View className="flex-row justify-between mb-2">
            <Text
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Item Price
            </Text>
            <Text
              className={`text-sm font-semibold ${
                isDark ? "text-gray-200" : "text-gray-900"
              }`}
            >
              ₱{basePrice.toFixed(2)}
            </Text>
          </View>

          {/* Coupon Discount (if applied) */}
          {selectedCoupon && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-emerald-500 font-medium">
                Coupon Discount ({selectedCoupon.code})
              </Text>
              <Text className="text-sm font-bold text-emerald-500">
                -₱{discountAmount.toFixed(2)}
              </Text>
            </View>
          )}

          {/* Transaction Fee */}
          <View className="flex-row justify-between mb-2">
            <Text
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Transaction Fee
            </Text>
            <Text
              className={`text-sm font-semibold ${
                isDark ? "text-gray-200" : "text-gray-900"
              }`}
            >
              ₱{TRANSACTION_FEE.toFixed(2)}
            </Text>
          </View>

          <View
            className={`border-t my-3 ${
              isDark ? "border-slate-800" : "border-gray-200"
            }`}
          />

          <View className="flex-row justify-between items-center">
            <Text
              className={`text-base font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Total Amount
            </Text>
            <Text className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
              ₱{finalPrice.toFixed(2)}
            </Text>
          </View>

          {/* Points Earned Preview Badge */}
          <View className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-slate-800 flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="star" size={16} color="#eab308" />
              <Text
                className={`text-xs font-semibold ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Points You'll Earn (₱10 = 1 pt):
              </Text>
            </View>
            <Text className="text-xs font-extrabold text-amber-500">
              +{earnedPoints} pts
            </Text>
          </View>
        </View>

        {/* Handover Info */}
        <View
          className={`mt-4 p-4 rounded-xl flex-row items-center gap-3 border ${
            isDark
              ? "bg-[#0e0e0e]/40 border-slate-800"
              : "bg-emerald-50 border-emerald-200"
          }`}
        >
          <Ionicons name="location-outline" size={22} color="#059669" />
          <View>
            <Text
              className={`text-xs font-semibold ${
                isDark ? "text-emerald-400" : "text-emerald-800"
              }`}
            >
              Handover Method
            </Text>
            <Text
              className={`text-sm ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              On-campus pick-up
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View className="mt-8 gap-3">
          <TouchableOpacity
            disabled={isSubmitting}
            onPress={handleCompleteTransaction}
            className={`w-full py-4 rounded-xl bg-emerald-600 items-center justify-center ${
              isSubmitting ? "opacity-70" : ""
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-white font-bold text-lg">
                Confirm Handover
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            disabled={isSubmitting}
            onPress={() => router.back()}
            className={`w-full py-4 rounded-xl border items-center justify-center ${
              isDark
                ? "border-slate-800 bg-[#0e0e0e]/40"
                : "border-gray-300 bg-white"
            }`}
          >
            <Text
              className={`font-bold text-base ${
                isDark ? "text-white" : "text-gray-700"
              }`}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}