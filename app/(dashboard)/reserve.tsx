import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFetchBuyerReservations } from "@/feature/reservedProduct/hooks/useFetchBuyerReservation";
import { useFetchSellerReservations } from "@/feature/reservedProduct/hooks/useFetchSellerReservation";

type Mode = "buyer" | "seller";
const ACTIVE_RESERVATIONS_MODE_STORAGE_KEY = "@unisuki:reservations-active-mode";

export default function ReservationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [activeMode, setActiveMode] = useState<Mode>("buyer");

  // Restore saved active tab mode on load
  useEffect(() => {
    const loadActiveMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(
          ACTIVE_RESERVATIONS_MODE_STORAGE_KEY
        );
        if (savedMode === "buyer" || savedMode === "seller") {
          setActiveMode(savedMode);
        }
      } catch (error) {
        console.warn("Unable to restore selected reservations mode:", error);
      }
    };

    loadActiveMode();
  }, []);

  // Save selected mode to AsyncStorage
  const selectMode = async (mode: Mode) => {
    setActiveMode(mode);
    try {
      await AsyncStorage.setItem(ACTIVE_RESERVATIONS_MODE_STORAGE_KEY, mode);
    } catch (error) {
      console.warn("Unable to save selected reservations mode:", error);
    }
  };

  // Custom Hooks for both buyer & seller
  const { reservations: buyerReservations, loading: buyerLoading } =
    useFetchBuyerReservations();
  const { sellerReservations, loading: sellerLoading } =
    useFetchSellerReservations();

  const isLoading = activeMode === "buyer" ? buyerLoading : sellerLoading;
  const currentData =
    activeMode === "buyer" ? buyerReservations : sellerReservations;

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
      case "confirmed":
        return {
          bg: "bg-emerald-100 dark:bg-emerald-950/50",
          text: "text-emerald-700 dark:text-emerald-400",
          label: "Accepted",
        };
      case "completed":
        return {
          bg: "bg-blue-100 dark:bg-blue-950/50",
          text: "text-blue-700 dark:text-blue-400",
          label: "Completed",
        };
      case "cancelled":
      case "declined":
      case "rejected":
        return {
          bg: "bg-rose-100 dark:bg-rose-950/50",
          text: "text-rose-700 dark:text-rose-400",
          label: "Closed / Declined",
        };
      default:
        return {
          bg: "bg-amber-100 dark:bg-amber-950/50",
          text: "text-amber-700 dark:text-amber-400",
          label: activeMode === "buyer" ? "Pending Approval" : "Request Pending",
        };
    }
  };

  const handleOpenChat = (item: any) => {
    // Block routing if the item is completed, cancelled, or declined
    const isClosed =
      item.status === "completed" ||
      item.status === "cancelled" ||
      item.status === "declined" ||
      item.status === "rejected";

    if (isClosed) return;

    const chatId =
      item.chatId || `${item.buyerId}_${item.sellerId}_${item.productId}_res`;
    router.push({
      pathname: "/(chat)/[chatId]",
      params: { chatId, isReservation: "true" },
    });
  };

  const renderModeButton = (mode: Mode, label: string) => {
    const isActive = activeMode === mode;

    return (
      <TouchableOpacity
        key={mode}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
        onPress={() => selectMode(mode)}
        style={[
          styles.modeButton,
          isActive &&
            (isDark ? styles.activeModeButtonDark : styles.activeModeButton),
        ]}
      >
        <Text
          style={[
            styles.modeLabel,
            isDark && styles.modeLabelDark,
            isActive &&
              (isDark
                ? styles.activeModeLabelDark
                : styles.activeModeLabel),
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Screen Header */}
      <View className="pt-12 pb-4 px-4">
        <Text
          className={`text-4xl font-extrabold tracking-wide text-center ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Reservations
        </Text>
      </View>

      {/* Mode Switcher */}
      <View style={styles.switcherContainer}>
        <View
          style={[
            styles.modeSwitcher,
            isDark && styles.modeSwitcherDark,
          ]}
        >
          {renderModeButton("buyer", "MY RESERVED")}
          {renderModeButton("seller", "PRODUCT RESERVED")}
        </View>
      </View>

      {/* Content Section */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : (
        <FlatList
          data={currentData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
          ListEmptyComponent={
            <View className="py-20 items-center justify-center">
              <Ionicons
                name={
                  activeMode === "buyer"
                    ? "bookmark-outline"
                    : "pricetags-outline"
                }
                size={56}
                color={isDark ? "#475569" : "#9ca3af"}
              />
              <Text
                className={`mt-4 text-lg font-bold ${
                  isDark ? "text-gray-200" : "text-gray-800"
                }`}
              >
                {activeMode === "buyer"
                  ? "No Reservations Found"
                  : "No Products Reserved Yet"}
              </Text>
              <Text
                className={`mt-1 text-sm text-center px-8 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {activeMode === "buyer"
                  ? "Products you reserve from sellers will appear here."
                  : "Items buyers reserve from your listings will appear here."}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const badge = getStatusBadge(item.status);
            const isClosed =
              item.status === "completed" ||
              item.status === "cancelled" ||
              item.status === "declined" ||
              item.status === "rejected";

            return (
              <TouchableOpacity
                activeOpacity={isClosed ? 1 : 0.8}
                disabled={isClosed}
                onPress={() => handleOpenChat(item)}
                className={`mb-4 p-4 rounded-2xl border ${
                  isClosed
                    ? isDark
                      ? "bg-[#0e0e0e]/20 border-slate-800/40 opacity-60"
                      : "bg-gray-100/60 border-gray-200 opacity-60"
                    : isDark
                    ? "bg-[#0e0e0e]/40 border-slate-800"
                    : "bg-white border-emerald-200"
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.2 : 0.05,
                  shadowRadius: 6,
                  elevation: isClosed ? 0 : 2,
                }}
              >
                <View className="flex-row gap-3">
                  {/* Thumbnail */}
                  {item.imageUri || item.itemImage ? (
                    <Image
                      source={{ uri: item.imageUri || item.itemImage }}
                      className="w-20 h-20 rounded-xl bg-gray-200"
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      className={`w-20 h-20 rounded-xl items-center justify-center ${
                        isDark ? "bg-[#0e0e0e]/20" : "bg-gray-200"
                      }`}
                    >
                      <Ionicons
                        name="image-outline"
                        size={24}
                        color="#9ca3af"
                      />
                    </View>
                  )}

                  {/* Info Column */}
                  <View className="flex-1 justify-between">
                    <View>
                      <View className="flex-row items-center justify-between gap-2">
                        <Text
                          numberOfLines={1}
                          className={`text-base font-bold flex-1 ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {item.title || item.itemTitle || "Reserved Item"}
                        </Text>

                        {/* Status Badge */}
                        <View className={`px-2.5 py-0.5 rounded-full ${badge.bg}`}>
                          <Text className={`text-xs font-semibold ${badge.text}`}>
                            {badge.label}
                          </Text>
                        </View>
                      </View>

                      {/* Price */}
                      <Text className="mt-1 text-emerald-600 dark:text-emerald-400 font-bold text-base">
                        ₱{Number(item.totalPrice || item.price || 0).toFixed(2)}
                      </Text>
                    </View>

                    {/* Chat Action Prompt or Archived Disabled Badge */}
                    <View className="flex-row items-center justify-between mt-2">
                      {isClosed ? (
                        <View className="flex-row items-center gap-1">
                          <Ionicons
                            name="lock-closed-outline"
                            size={14}
                            color={isDark ? "#64748b" : "#9ca3af"}
                          />
                          <Text className="text-xs text-gray-500 font-medium">
                            Transaction closed
                          </Text>
                        </View>
                      ) : (
                        <>
                          <Text className="text-xs text-gray-400">
                            {activeMode === "buyer"
                              ? "Chat with seller"
                              : "Chat with buyer"}
                          </Text>
                          <Ionicons
                            name="chatbubble-ellipses-outline"
                            size={18}
                            color="#059669"
                          />
                        </>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  switcherContainer: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  modeSwitcher: {
    alignSelf: "center",
    flexDirection: "row",
    width: 300,
    padding: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 999,
    backgroundColor: "#ffffff",
  },
  modeSwitcherDark: {
    borderColor: "#1f2937",
    backgroundColor: "rgba(14, 14, 14, 0.2)",
  },
  modeButton: {
    flex: 1,
    alignItems: "center",
    borderRadius: 999,
    paddingVertical: 10,
  },
  activeModeButton: {
    backgroundColor: "#f3f3f3",
    elevation: 1,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activeModeButtonDark: {
    backgroundColor: "#065f46",
    elevation: 1,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  modeLabel: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "600",
  },
  modeLabelDark: {
    color: "#9ca3af",
  },
  activeModeLabel: {
    color: "#000000",
  },
  activeModeLabelDark: {
    color: "#ffffff",
  },
});