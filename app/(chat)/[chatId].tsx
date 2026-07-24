import { useChatMessages } from "@/feature/chat/hooks/useChatMessages";
import { auth, db } from "@/service/firebaseConfigs";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

function formatTime(timestamp: any): string {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ReservationQRHeader({
  chatId,
  reservationData,
  isSeller,
  isDark,
}: {
  chatId: string;
  reservationData: any;
  isSeller: boolean;
  isDark: boolean;
}) {
  const router = useRouter();
  const [showQRModal, setShowQRModal] = useState(false);

  const itemTitle =
    reservationData?.itemTitle || reservationData?.productTitle || "Reserved Item";
  const totalPrice =
    reservationData?.totalPrice || reservationData?.price || 0;
  const status = reservationData?.status || "pending";
  const productImage =
    reservationData?.itemImage || reservationData?.productImage || null;

  const isConfirmed = status === "completed" || status === "confirmed";
  const isRejected = status === "declined" || status === "rejected";

  const handleDeclineReservation = async () => {
    try {
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        "reservation.status": "declined",
        updatedAt: serverTimestamp(),
        lastMessage: "Reservation declined",
      });

      if (reservationData?.sellerId && reservationData?.productId) {
        const productRef = doc(
          db,
          "user",
          reservationData.sellerId,
          "itemPosted",
          reservationData.productId
        );
        await updateDoc(productRef, {
          isReserved: false,
        });
      }
    } catch (err) {
      console.error("Failed to decline reservation:", err);
    }
  };

  const qrPayload = JSON.stringify({
    chatId,
    reservationId: reservationData?.id || chatId,
    productId: reservationData?.productId,
    buyerId: reservationData?.buyerId,
    sellerId: reservationData?.sellerId,
  });

  const handleOpenScanner = () => {
    router.push({
      pathname: "/(scanner)/scan" as any,
      params: {
        chatId,
        reservationId: reservationData?.id || chatId,
        productId: reservationData?.productId,
      },
    });
  };

  return (
    <>
      <View
        className={`mx-3 mt-3 mb-2 rounded-2xl border overflow-hidden ${
          isDark
            ? "bg-[#0e0e0e]/60 border-slate-800"
            : "bg-white border-gray-200/80"
        }`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.25 : 0.06,
          shadowRadius: 6,
          elevation: 3,
        }}
      >
        {/* Top Header Row */}
        <View
          className={`px-3 py-2 border-b ${
            isDark ? "border-slate-800 bg-white/5" : "border-gray-100 bg-gray-50/50"
          }`}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-2">
              <Text
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isDark ? "text-emerald-400" : "text-emerald-800"
                }`}
              >
                {isSeller
                  ? "Show QR to buyer upon meeting"
                  : isConfirmed
                  ? "Scanned the QR code"
                  : "Scan QR code"}
              </Text>
              <Text
                className={`text-xs font-semibold ${
                  isDark ? "text-gray-200" : "text-gray-800"
                }`}
                numberOfLines={1}
              >
                {isSeller
                  ? ""
                  : isConfirmed
                  ? "Scanned the QR to proceed to transaction"
                  : "Scan seller's QR code to confirm item handover"}
              </Text>
            </View>

            {/* Actions / Badges */}
            {isConfirmed ? (
              <View className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 rounded-full border border-emerald-300 dark:border-emerald-700/50">
                <Text className="text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                  ✓ Confirmed
                </Text>
              </View>
            ) : isRejected ? (
              <View className="px-3 py-1 bg-rose-100 dark:bg-rose-950/60 rounded-full border border-rose-300 dark:border-rose-700/50">
                <Text className="text-rose-700 dark:text-rose-400 font-bold text-[11px]">
                  ✗ Declined
                </Text>
              </View>
            ) : isSeller ? (
              <View className="flex-row items-center gap-1.5">
                <TouchableOpacity
                  onPress={handleDeclineReservation}
                  className="flex-row items-center gap-1 bg-rose-600 px-2.5 py-1.5 rounded-xl active:bg-rose-700"
                >
                  <Ionicons name="close-circle-outline" size={14} color="#fff" />
                  <Text className="text-white font-bold text-xs">Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowQRModal(true)}
                  className="flex-row items-center gap-1 bg-emerald-600 px-2.5 py-1.5 rounded-xl active:bg-emerald-700"
                >
                  <Ionicons name="qr-code-outline" size={14} color="#fff" />
                  <Text className="text-white font-bold text-xs">Show QR</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleOpenScanner}
                className="flex-row items-center gap-1.5 bg-emerald-600 px-3 py-1.5 rounded-xl active:bg-emerald-700"
              >
                <Ionicons name="camera-outline" size={15} color="#fff" />
                <Text className="text-white font-bold text-xs">Scan QR</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Product Info Section */}
        <View className="flex-row items-center p-3 gap-3">
          {productImage ? (
            <Image
              source={{ uri: productImage }}
              className="w-14 h-14 rounded-xl bg-gray-200"
              resizeMode="cover"
            />
          ) : (
            <View
              className={`w-14 h-14 rounded-xl items-center justify-center ${
                isDark ? "bg-[#0e0e0e]/20" : "bg-gray-100"
              }`}
            >
              <Ionicons
                name="image-outline"
                size={22}
                color={isDark ? "#9CA3AF" : "#6B7280"}
              />
            </View>
          )}
          <View className="flex-1">
            <Text
              className={`font-bold text-sm ${
                isDark ? "text-white" : "text-gray-900"
              }`}
              numberOfLines={2}
            >
              {itemTitle}
            </Text>
            <Text className="text-xs font-semibold mt-0.5 text-emerald-500 dark:text-emerald-400">
              ₱ {Number(totalPrice).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Meetup Notes Section */}
        <View
          className={`px-3 pb-3 gap-2 border-t ${
            isDark ? "border-slate-800" : "border-gray-100"
          }`}
        >
          <Text
            className={`text-xs font-bold uppercase tracking-wider mt-2.5 ${
              isDark ? "text-emerald-400" : "text-emerald-800"
            }`}
          >
            Meetup Notes
          </Text>
          <View className="flex-row items-start gap-2">
            <Ionicons
              name="location-outline"
              size={15}
              color={isDark ? "#34d399" : "#059669"}
              style={{ marginTop: 1 }}
            />
            <Text
              className={`text-xs flex-1 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Where to meet — agree on one campus spot like the library,
              canteen, or main gate
            </Text>
          </View>
          <View className="flex-row items-start gap-2">
            <Ionicons
              name="time-outline"
              size={15}
              color={isDark ? "#34d399" : "#059669"}
              style={{ marginTop: 1 }}
            />
            <Text
              className={`text-xs flex-1 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Time & date — confirm the day and time together
            </Text>
          </View>
        </View>
      </View>

      {/* QR Modal for Seller */}
      {isSeller && (
        <Modal
          visible={showQRModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowQRModal(false)}
        >
          <View className="flex-1 bg-black/70 items-center justify-center p-6">
            <View
              className={`w-full max-w-xs p-6 rounded-3xl items-center border ${
                isDark
                  ? "bg-[#0e0e0e] border-slate-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`text-lg font-bold mb-1 text-center ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Handover Verification
              </Text>
              <Text
                className={`text-xs text-center mb-5 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Let the buyer scan this QR code during item exchange.
              </Text>

              <View className="p-4 bg-white rounded-2xl shadow-sm">
                <QRCode value={qrPayload} size={180} />
              </View>

              <TouchableOpacity
                onPress={() => setShowQRModal(false)}
                className="mt-5 w-full py-2.5 bg-gray-200 dark:bg-slate-800 rounded-xl"
              >
                <Text
                  className={`text-center font-bold text-sm ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

export default function ChatScreen() {
  const { chatId, isReservation, otherUserName } = useLocalSearchParams<{
    chatId: string;
    isReservation: string;
    otherUserName?: string;
  }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { messages, loading, sendMessage } = useChatMessages(chatId);
  const [inputText, setInputText] = useState("");
  const [reservationData, setReservationData] = useState<any>(null);

  const [headerTitle, setHeaderTitle] = useState<string>(
    otherUserName || "User"
  );

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!chatId) return;

    const chatRef = doc(db, "chats", chatId);
    const unsubscribe = onSnapshot(
      chatRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setReservationData({
            id: snapshot.id,
            ...data,
            ...data.reservation,
          });

          const participants: string[] = data.participants || [];
          const otherUid = participants.find((uid) => uid !== currentUser?.uid);

          if (otherUid) {
            const participantNames = data.participantNames || {};
            const matchingName = participantNames[otherUid];

            const fallbackName =
              currentUser?.uid === data.sellerId
                ? data?.reservation?.buyerName || data?.buyerName
                : data?.reservation?.sellerName || data?.sellerName;

            const resolvedName = matchingName || fallbackName || otherUserName;

            // Fetch user profile from Firestore prioritizing username
            try {
              let userRef = doc(db, "user", otherUid);
              let userSnap = await getDoc(userRef);

              if (!userSnap.exists()) {
                userRef = doc(db, "users", otherUid);
                userSnap = await getDoc(userRef);
              }

              if (userSnap.exists()) {
                const userData = userSnap.data();
                // Prioritize username over name / fullName / displayName
                const fetchedName =
                  userData.username ||
                  userData.name ||
                  userData.fullName ||
                  userData.displayName;

                if (fetchedName) {
                  setHeaderTitle(fetchedName);
                  return;
                }
              }
            } catch (err) {
              console.error("Error fetching participant details:", err);
            }

            if (resolvedName) {
              setHeaderTitle(resolvedName);
            }
          }
        }
      },
      (err) => console.error("Error listening to chat details:", err)
    );

    return () => unsubscribe();
  }, [chatId, currentUser?.uid, otherUserName]);

  const sellerId =
    reservationData?.sellerId || (chatId ? chatId.split("_")[1] : "");
  const isSeller = currentUser?.uid === sellerId;

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText("");
    }
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-[#0e0e0e]" : "bg-[#f3f3f3]"}`}>
      <Stack.Screen
        options={{
          title: headerTitle,
          headerTitle: headerTitle,
          headerStyle: { backgroundColor: isDark ? "#0e0e0e" : "#ffffff" },
          headerTintColor: isDark ? "#ffffff" : "#111827",
        }}
      />

      {isReservation === "true" && (
        <ReservationQRHeader
          chatId={chatId}
          reservationData={reservationData}
          isSeller={isSeller}
          isDark={isDark}
        />
      )}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => {
            const isMe = item.senderId === currentUser?.uid;
            const formattedTime = formatTime(item.createdAt);

            if (item.systemMessage) {
              return (
                <View className="my-1.5 p-2 px-3.5 rounded-full bg-gray-200/80 dark:bg-slate-800 self-center max-w-[85%]">
                  <Text className="text-[11px] text-center font-medium text-gray-600 dark:text-gray-300">
                    {item.text}
                  </Text>
                </View>
              );
            }

            return (
              <View
                className={`max-w-[80%] px-3.5 py-2 rounded-2xl ${
                  isMe
                    ? "self-end bg-emerald-600 rounded-br-xs"
                    : "self-start bg-white dark:bg-slate-800 rounded-bl-xs border border-gray-100 dark:border-slate-700/60"
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: isDark ? 0.2 : 0.05,
                  shadowRadius: 3,
                  elevation: 1,
                }}
              >
                <Text
                  className={`text-sm leading-5 ${
                    isMe
                      ? "text-white"
                      : isDark
                      ? "text-gray-100"
                      : "text-gray-800"
                  }`}
                >
                  {item.text}
                </Text>

                {formattedTime ? (
                  <Text
                    className={`text-[10px] mt-1 text-right ${
                      isMe
                        ? "text-emerald-100/80"
                        : "text-gray-400 dark:text-gray-400"
                    }`}
                  >
                    {formattedTime}
                  </Text>
                ) : null}
              </View>
            );
          }}
        />
      )}

      <View
        className={`p-2.5 px-3 flex-row items-center gap-2 border-t ${
          isDark ? "bg-[#0e0e0e] border-slate-800" : "bg-white border-gray-200/80"
        }`}
      >
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={isDark ? "#64748b" : "#9ca3af"}
          className={`flex-1 px-4 py-2 text-sm rounded-full ${
            isDark ? "bg-slate-800 text-white" : "bg-gray-100 text-gray-900"
          }`}
        />
        <TouchableOpacity
          onPress={handleSend}
          className="p-2.5 bg-emerald-600 rounded-full active:bg-emerald-700"
        >
          <Ionicons name="send" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}