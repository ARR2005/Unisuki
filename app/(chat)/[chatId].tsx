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
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import QRCode from "react-native-qrcode-svg";
import { useChatMessages } from "@/feature/chat/hooks/useChatMessages";
import { auth, db } from "@/service/firebaseConfigs";

// Inline or external QR Header component
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
        className={`p-3.5 px-4 flex-row items-center justify-between border-b ${
          isDark
            ? "bg-slate-800 border-slate-700"
            : "bg-emerald-50 border-emerald-200"
        }`}
      >
        <View className="flex-1 mr-3">
          <Text
            numberOfLines={1}
            className={`font-bold text-sm ${
              isDark ? "text-emerald-400" : "text-emerald-800"
            }`}
          >
            {itemTitle}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Total: ₱{Number(totalPrice).toFixed(2)} • Status: {status.toUpperCase()}
          </Text>
        </View>

        {status === "completed" ? (
          <View className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/60 rounded-xl">
            <Text className="text-emerald-700 dark:text-emerald-400 font-bold text-xs">
              Completed
            </Text>
          </View>
        ) : isSeller ? (
          <TouchableOpacity
            onPress={() => setShowQRModal(true)}
            className="flex-row items-center gap-1.5 bg-emerald-600 px-3.5 py-2 rounded-xl active:bg-emerald-700"
          >
            <Ionicons name="qr-code-outline" size={18} color="#fff" />
            <Text className="text-white font-bold text-xs">Show QR Code</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleOpenScanner}
            className="flex-row items-center gap-1.5 bg-emerald-600 px-3.5 py-2 rounded-xl active:bg-emerald-700"
          >
            <Ionicons name="camera-outline" size={18} color="#fff" />
            <Text className="text-white font-bold text-xs">Scan QR Code</Text>
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
                Scan to Complete
              </Text>
              <Text
                className={`text-xs text-center mb-6 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Allow the buyer to scan this code during the physical handover.
              </Text>

              <View className="p-4 bg-white rounded-2xl shadow-sm">
                <QRCode value={qrPayload} size={180} />
              </View>

              <TouchableOpacity
                onPress={() => setShowQRModal(false)}
                className="mt-6 w-full py-3 bg-gray-200 dark:bg-slate-700 rounded-xl"
              >
                <Text
                  className={`text-center font-bold ${
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
  const { chatId, isReservation } = useLocalSearchParams<{
    chatId: string;
    isReservation: string;
  }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { messages, loading, sendMessage } = useChatMessages(chatId);
  const [inputText, setInputText] = useState("");
  const [reservationData, setReservationData] = useState<any>(null);
  const [otherUserName, setOtherUserName] = useState<string>("Chat");

  const currentUser = auth.currentUser;

  // Real-time listener for reservation metadata stored inside the chat document
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

          // Determine the other user's UID (seller or buyer)
          const participants: string[] = data.participants || [];
          const otherUid = participants.find((uid) => uid !== currentUser?.uid);

          if (otherUid) {
            try {
              // Fetch other user's profile from Firestore 'user' collection
              const userRef = doc(db, "user", otherUid);
              const userSnap = await getDoc(