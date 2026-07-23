import { auth, db } from "@/service/firebaseConfigs";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
    addDoc,
    collection,
    doc,
    getDoc,
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
    transactionFee: transactionFeeParam,
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
    transactionFee?: string;
    totalPrice?: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionData, setTransactionData] = useState<any>(null);

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
              0,
          ),
          transactionFee: Number(
            transactionFeeParam ||
              parsedPayload?.transactionFee ||
              parsedPayload?.fee ||
              0,
          ),
          totalPrice: Number(
            totalPriceParam ||
              parsedPayload?.totalPrice ||
              parsedPayload?.total ||
              0,
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
    transactionFeeParam,
    totalPriceParam,
    router,
  ]);

  const handleCompleteTransaction = async () => {
    if (!transactionData) return;

    setIsSubmitting(true);

    try {
      const targetChatId = transactionData.chatId || chatId;
      const targetSellerId = transactionData.sellerId || sellerId;
      const targetProductId = transactionData.productId || productId;
      const currentUser = auth.currentUser;

      // 1. Update status to 'completed' in chat room
      if (targetChatId) {
        const chatRef = doc(db, "chats", targetChatId);
        await updateDoc(chatRef, {
          "reservation.status": "completed",
          updatedAt: serverTimestamp(),
          lastMessage: "Transaction Completed",
        });

        // 2. Add confirmation message to chat
        const messagesRef = collection(db, "chats", targetChatId, "messages");
        await addDoc(messagesRef, {
          senderId: currentUser?.uid || "system",
          text: "🎉 Item handed over! Transaction completed via QR code verification.",
          createdAt: serverTimestamp(),
          systemMessage: true,
        });
      }

      // 3. Mark seller's product item as 'sold'
      if (targetSellerId && targetProductId) {
        const productRef = doc(
          db,
          "user",
          targetSellerId,
          "itemPosted",
          targetProductId,
        );
        await updateDoc(productRef, {
          status: "sold",
          isReserved: false,
        });
      }

      Alert.alert(
        "Transaction Complete!",
        "The handover has been verified and recorded successfully.",
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
        ],
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
          isDark ? "bg-slate-900" : "bg-white"
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
  const itemPrice = Number(
    transactionData?.itemPrice || transactionData?.price || 0,
  );
  const transactionFee = Number(transactionData?.transactionFee || 5);
  const totalPrice = Number(
    transactionData?.totalPrice || itemPrice + transactionFee,
  );

  return (
    <View className={`flex-1 ${isDark ? "bg-slate-900" : "bg-gray-50"}`}>
      <Stack.Screen
        options={{
          title: "Transaction Receipt",
          headerStyle: { backgroundColor: isDark ? "#0f172a" : "#ffffff" },
          headerTintColor: isDark ? "#ffffff" : "#0f172a",
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

        {/* Receipt Card */}
        <View
          className={`p-5 rounded-2xl border ${
            isDark
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-gray-100"
          }`}
        >
          <Text
            className={`font-bold text-lg mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {itemTitle}
          </Text>

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
              ₱{itemPrice.toFixed(2)}
            </Text>
          </View>

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
              ₱{transactionFee.toFixed(2)}
            </Text>
          </View>

          <View
            className={`border-t my-3 ${
              isDark ? "border-slate-700" : "border-gray-200"
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
            <Text className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₱{totalPrice.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Handover Info */}
        <View
          className={`mt-4 p-4 rounded-xl flex-row items-center gap-3 ${
            isDark ? "bg-slate-800" : "bg-emerald-50"
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
                ? "border-slate-700 bg-slate-800"
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
