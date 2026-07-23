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
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

// Helper to format Firestore timestamps or Date objects
function formatTime(timestamp: any): string {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Header banner for Reservation status & QR actions
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

  const itemTitle = reservationData?.itemTitle || "Reserved Item";
  const totalPrice = reservationData?.totalPrice || 0;
  const status = reservationData?.status || "pending";

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
          reservationData.productId,
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
        className={`p-3 px-4 flex-row items-center justify-between border-b ${
          isDark
            ? "bg-slate-800/80 border-slate-700/60"
            : "bg-emerald-50/70 border-emerald-100"
        }`}
      >
        <View className="flex-1 mr-3">
          <Text
            numberOfLines={1}
            className={`font-bold text-xs ${
              isDark ? "text-emerald-400" : "text-emerald-800"
            }`}
          >
            {itemTitle}
          </Text>
          <Text className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            Total: ₱{Number(totalPrice).toFixed(2)} • Status:{" "}
            <Text className="font-semibold text-emerald-600 dark:text-emerald-400">
              {status.toUpperCase()}
            </Text>
          </Text>
        </View>

        {status === "completed" ? (
          <View className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 rounded-full">
            <Text className="text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
              Completed
            </Text>
          </View>
        ) : status === "declined" ? (
          <View className="px-3 py-1 bg-rose-100 dark:bg-rose-950/60 rounded-full">
            <Text className="text-rose-700 dark:text-rose-400 font-bold text-[11px]">
              Declined
            </Text>
          </View>
        ) : isSeller ? (
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={handleDeclineReservation}
              className="flex-row items-center gap-1.5 bg-rose-600 px-3 py-1.5 rounded-xl active:bg-rose-700"
            >
              <Ionicons name="close-circle-outline" size={16} color="#fff" />
              <Text className="text-white font-bold text-xs">Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowQRModal(true)}
              className="flex-row items-center gap-1.5 bg-emerald-600 px-3 py-1.5 rounded-xl active:bg-emerald-700"
            >
              <Ionicons name="qr-code-outline" size={16} color="#fff" />
              <Text className="text-white font-bold text-xs">Show QR</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleOpenScanner}
            className="flex-row items-center gap-1.5 bg-emerald-600 px-3 py-1.5 rounded-xl active:bg-emerald-700"
          >
            <Ionicons name="camera-outline" size={16} color="#fff" />
            <Text className="text-white font-bold text-xs">Scan QR</Text>
          </TouchableOpacity>
        )}
      </View>

      {isSeller && (
        <Modal
          visible={showQRModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowQRModal(false)}
        >
          <View className="flex-1 bg-black/70 items-center justify-center p-6">
            <View
              className={`w-full max-w-xs p-6 rounded-3xl items-center ${
                isDark ? "bg-slate-800" : "bg-white"
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
                className="mt-5 w-full py-2.5 bg-gray-200 dark:bg-slate-700 rounded-xl"
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

  // Use param name if available, otherwise fallback to "User"
  const [headerTitle, setHeaderTitle] = useState<string>(
    otherUserName || "User",
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

            if (resolvedName) {
              setHeaderTitle(resolvedName);
            } else {
              try {
                let userRef = doc(db, "user", otherUid);
                let userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                  userRef = doc(db, "users", otherUid);
                  userSnap = await getDoc(userRef);
                }

                if (userSnap.exists()) {
                  const userData = userSnap.data();
                  const fetchedName =
                    userData.name ||
                    userData.username ||
                    userData.fullName ||
                    userData.displayName;

                  if (fetchedName) {
                    setHeaderTitle(fetchedName);
                  }
                }
              } catch (err) {
                console.error("Error fetching participant details:", err);
              }
            }
          }
        }
      },
      (err) => console.error("Error listening to chat details:", err),
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
    <View className={`flex-1 ${isDark ? "bg-slate-900" : "bg-gray-50"}`}>
      {/* Explicit Header Configuration */}
      <Stack.Screen
        options={{
          title: headerTitle,
          headerTitle: headerTitle,
          headerStyle: { backgroundColor: isDark ? "#0f172a" : "#ffffff" },
          headerTintColor: isDark ? "#ffffff" : "#0f172a",
        }}
      />

      {/* Sticky QR Verification Bar */}
      {isReservation === "true" && (
        <ReservationQRHeader
          chatId={chatId}
          reservationData={reservationData}
          isSeller={isSeller}
          isDark={isDark}
        />
      )}

      {/* Messages List */}
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

      {/* Message Input Box */}
      <View
        className={`p-2.5 px-3 flex-row items-center gap-2 border-t ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"
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
