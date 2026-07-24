import { auth, db } from "@/service/firebaseConfigs";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

// Helper to format timestamps or date objects
function formatDate(timestamp: any): string {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PurchaseHistoryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const historyRef = collection(
      db,
      "user",
      currentUser.uid,
      "purchaseHistory"
    );
    const q = query(historyRef, orderBy("archivedAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const historyItems = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Record<string, any>),
        }));
        setItems(historyItems);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load purchase history:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleOpenChat = (item: any) => {
    setSelectedItem(null);
    if (item.chatId) {
      router.push({
        pathname: "/(chat)/[chatId]",
        params: {
          chatId: item.chatId,
          isReservation: "true",
          otherUserName: item.sellerName || "Seller",
        },
      });
    }
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-[#0e0e0e]" : "bg-[#f3f3f3]"}`}>
      <Stack.Screen
        options={{
          title: "Purchase History",
          headerStyle: { backgroundColor: isDark ? "#0e0e0e" : "#ffffff" },
          headerTintColor: isDark ? "#ffffff" : "#111827",
        }}
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
          <Text
            className={`mt-3 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Loading purchase history...
          </Text>
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="bag-handle-outline" size={48} color="#059669" />
          <Text
            className={`mt-4 text-lg font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            No completed purchases yet
          </Text>
          <Text
            className={`mt-2 text-center ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Once an item is handed over, it will appear here as an archived
            purchase.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          {items.map((item) => {
            const imageUri =
              item.imageUrl || item.itemImage || item.productImage;
            const archivedDate = formatDate(
              item.archivedAt || item.completedAt
            );

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => setSelectedItem(item)}
                className={`mb-3 rounded-2xl border p-3.5 ${
                  isDark
                    ? "border-slate-800 bg-[#0e0e0e]/40"
                    : "border-gray-200/80 bg-white"
                }`}
              >
                <View className="flex-row items-center gap-3">
                  {/* Item Image Thumbnail */}
                  {imageUri ? (
                    <Image
                      source={{ uri: imageUri }}
                      className="w-16 h-16 rounded-xl bg-gray-200"
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      className={`w-16 h-16 rounded-xl items-center justify-center ${
                        isDark ? "bg-white/10" : "bg-gray-100"
                      }`}
                    >
                      <Ionicons
                        name="image-outline"
                        size={24}
                        color={isDark ? "#9ca3af" : "#6b7280"}
                      />
                    </View>
                  )}

                  {/* Item Title & Seller */}
                  <View className="flex-1">
                    <Text
                      numberOfLines={2}
                      className={`font-bold text-sm leading-5 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {item.itemTitle || "Archived Item"}
                    </Text>
                    <Text
                      className={`mt-0.5 text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Seller: {item.sellerName || "Unknown seller"}
                    </Text>
                    {archivedDate ? (
                      <Text
                        className={`text-[11px] mt-0.5 ${
                          isDark ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        Purchased {archivedDate}
                      </Text>
                    ) : null}
                  </View>

                  {/* Price & Completed Status Badge */}
                  <View className="items-end justify-between self-stretch py-0.5">
                    <Text className="text-emerald-500 dark:text-emerald-400 font-bold text-base">
                      ₱
                      {Number(item.totalPrice || item.itemPrice || 0).toFixed(
                        2
                      )}
                    </Text>
                    <View className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/50">
                      <Text className="text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                        ✓ Completed
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Item Details Receipt Modal */}
      {selectedItem && (
        <Modal
          transparent
          animationType="slide"
          visible={!!selectedItem}
          onRequestClose={() => setSelectedItem(null)}
        >
          <View
            className={`flex-1 justify-end ${
              isDark ? "bg-black/70" : "bg-black/40"
            }`}
          >
            <View
              className={`rounded-t-3xl p-6 border-t ${
                isDark
                  ? "bg-[#0e0e0e] border-slate-800"
                  : "bg-white border-gray-200"
              }`}
            >
              {/* Modal Header */}
              <View className="flex-row items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
                <Text
                  className={`text-lg font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Purchase Receipt
                </Text>
                <TouchableOpacity onPress={() => setSelectedItem(null)}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={isDark ? "#fff" : "#000"}
                  />
                </TouchableOpacity>
              </View>

              {/* Item Card Body */}
              <View className="my-5 flex-row items-center gap-4">
                {selectedItem.imageUrl ||
                selectedItem.itemImage ||
                selectedItem.productImage ? (
                  <Image
                    source={{
                      uri:
                        selectedItem.imageUrl ||
                        selectedItem.itemImage ||
                        selectedItem.productImage,
                    }}
                    className="w-20 h-20 rounded-2xl bg-gray-200"
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    className={`w-20 h-20 rounded-2xl items-center justify-center ${
                      isDark ? "bg-white/10" : "bg-gray-100"
                    }`}
                  >
                    <Ionicons name="image-outline" size={32} color="#9ca3af" />
                  </View>
                )}

                <View className="flex-1">
                  <Text
                    className={`font-bold text-base ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {selectedItem.itemTitle || "Archived Item"}
                  </Text>
                  <Text
                    className={`text-xs mt-1 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Seller: {selectedItem.sellerName || "Unknown seller"}
                  </Text>
                  <Text className="text-emerald-500 font-extrabold text-lg mt-1">
                    ₱
                    {Number(
                      selectedItem.totalPrice || selectedItem.itemPrice || 0
                    ).toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="gap-3 mt-2">
                {selectedItem.chatId ? (
                  <TouchableOpacity
                    onPress={() => handleOpenChat(selectedItem)}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 flex-row items-center justify-center gap-2"
                  >
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={18}
                      color="#fff"
                    />
                    <Text className="text-white font-bold text-sm">
                      View Chat History
                    </Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  onPress={() => setSelectedItem(null)}
                  className={`w-full py-3.5 rounded-xl border items-center justify-center ${
                    isDark
                      ? "border-slate-800 bg-[#0e0e0e]/40"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <Text
                    className={`font-bold text-sm ${
                      isDark ? "text-white" : "text-gray-700"
                    }`}
                  >
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}