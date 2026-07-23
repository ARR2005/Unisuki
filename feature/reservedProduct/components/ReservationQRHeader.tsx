import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface ReservationQRHeaderProps {
  chatId: string;
  reservationId: string;
  productId: string;
  sellerId: string;
  buyerId: string;
  isSeller: boolean;
  itemTitle: string;
  totalPrice: number;
  isDark: boolean;
}

export const ReservationQRHeader: React.FC<ReservationQRHeaderProps> = ({
  chatId,
  reservationId,
  productId,
  sellerId,
  buyerId,
  isSeller,
  itemTitle,
  totalPrice,
  isDark,
}) => {
  const router = useRouter();
  const [showQRModal, setShowQRModal] = useState(false);

  // Payload encoded inside the Seller's QR code
  const qrPayload = JSON.stringify({
    chatId,
    reservationId,
    productId,
    sellerId,
    buyerId,
  });

  const handleOpenScanner = () => {
    // Navigate to a dedicated camera scanner screen
    router.push({
      pathname: "/(scanner)/scan",
      params: { chatId, reservationId, productId },
    });
  };

  return (
    <>
      {/* Sticky Header Banner */}
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
            Total: ₱{totalPrice.toFixed(2)}
          </Text>
        </View>

        {isSeller ? (
          /* SELLER: Show QR Code Button */
          <TouchableOpacity
            onPress={() => setShowQRModal(true)}
            className="flex-row items-center gap-1.5 bg-emerald-600 px-3 py-2 rounded-xl active:bg-emerald-700"
          >
            <Ionicons name="qr-code-outline" size={18} color="#fff" />
            <Text className="text-white font-bold text-xs">Show QR Code</Text>
          </TouchableOpacity>
        ) : (
          /* BUYER: Scan QR Code Button */
          <TouchableOpacity
            onPress={handleOpenScanner}
            className="flex-row items-center gap-1.5 bg-emerald-600 px-3 py-2 rounded-xl active:bg-emerald-700"
          >
            <Ionicons name="camera-outline" size={18} color="#fff" />
            <Text className="text-white font-bold text-xs">Scan QR Code</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Seller QR Code Display Modal */}
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
                Let the buyer scan this code when handing over the item.
              </Text>

              {/* Generated QR Code */}
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
};