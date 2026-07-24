import { auth, db } from "@/service/firebaseConfigs";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  chatId?: string;
  routePath?: string;
  routeParams?: Record<string, string>;
  createdAt?: any;
};

type FilterCategory =
  | "all"
  | "unread"
  | "transaction"
  | "reservation"
  | "Post"
  | "System"
  | "New User"
  | "Sold";

const FILTERS: { id: FilterCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "transaction", label: "Transactions" },
  { id: "reservation", label: "Reservations" },
  { id: "Post", label: "Posts" },
  { id: "System", label: "System" },
  { id: "New User", label: "New User" },
  { id: "Sold", label: "Sold" },
];

export default function NotificationsPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>("all");

  useEffect(() => {
    let unsubscribeNotifications: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeNotifications?.();
      unsubscribeNotifications = undefined;

      if (!user) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "notifications"),
        where("recipientUid", "==", user.uid),
      );

      unsubscribeNotifications = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              title: data.title || "Notification",
              body: data.body || "",
              type: data.type || "general",
              read: Boolean(data.read),
              chatId: data.chatId || "",
              routePath: data.routePath || "",
              routeParams: data.routeParams || {},
              createdAt: data.createdAt,
            } as NotificationItem;
          });

          // Unread items first
          items.sort((a, b) => Number(a.read) - Number(b.read));

          setNotifications(items);
          setLoading(false);
        },
        (error) => {
          console.error("Error listening to notifications:", error);
          setLoading(false);
        },
      );
    });

    return () => {
      unsubscribeAuth();
      unsubscribeNotifications?.();
    };
  }, []);

  // Filtered Notifications derived state
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (selectedFilter === "all") return true;
      if (selectedFilter === "unread") return !item.read;
      if (selectedFilter === "Post") return item.type === "Post";
      if (selectedFilter === "New User") return item.type === "New User";
      if (selectedFilter === "Sold") return item.type === "Sold";
      return item.type === selectedFilter;
    });
  }, [notifications, selectedFilter]);

  const handleOpenNotification = async (item: NotificationItem) => {
    if (!auth.currentUser) return;

    if (item.id && !item.read) {
      try {
        const notifRef = doc(db, "notifications", item.id);
        await updateDoc(notifRef, { read: true });
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    }

    if (item.routePath) {
      const params = item.routeParams || {};
      router.push({ pathname: item.routePath as any, params });
      return;
    }

    if (item.chatId) {
      router.push({
        pathname: "/(chat)/[chatId]",
        params: { chatId: item.chatId, isReservation: "true" },
      });
    }
  };

  // Helper for type-based color themes with /40 opacity
  const getTypeTheme = (type: string, read: boolean) => {
    switch (type) {
      case "transaction":
        return {
          bg: isDark ? "bg-emerald-900/40" : "bg-emerald-100/40",
          border: isDark ? "border-emerald-700/50" : "border-emerald-300/60",
          iconBg: isDark ? "bg-emerald-600" : "bg-emerald-500",
          iconName: "checkmark-circle-outline",
          iconColor: "#ffffff",
        };

      case "reservation":
        return {
          bg: isDark ? "bg-blue-900/40" : "bg-blue-100/40",
          border: isDark ? "border-blue-700/50" : "border-blue-300/60",
          iconBg: isDark ? "bg-blue-600" : "bg-blue-500",
          iconName: "cart-outline",
          iconColor: "#ffffff",
        };

      case "promo":
      case "coupon":
        return {
          bg: isDark ? "bg-purple-900/40" : "bg-purple-100/40",
          border: isDark ? "border-purple-700/50" : "border-purple-300/60",
          iconBg: isDark ? "bg-purple-600" : "bg-purple-500",
          iconName: "pricetag-outline",
          iconColor: "#ffffff",
        };

      case "security":
      case "verification":
        return {
          bg: isDark ? "bg-amber-900/40" : "bg-amber-100/40",
          border: isDark ? "border-amber-700/50" : "border-amber-300/60",
          iconBg: isDark ? "bg-amber-600" : "bg-amber-500",
          iconName: "shield-checkmark-outline",
          iconColor: "#ffffff",
        };

      default:
        return {
          bg: isDark ? "bg-[#0e0e0e]/40" : "bg-gray-100/40",
          border: isDark ? "border-slate-800" : "border-gray-200",
          iconBg: isDark ? "bg-slate-700" : "bg-gray-200",
          iconName: "notifications-outline",
          iconColor: isDark ? "#ffffff" : "#374151",
        };
    }
  };

  return (
    <SafeAreaView
      edges={["top"]}
      className={`flex-1 ${isDark ? "bg-[#0e0e0e]" : "bg-[#f3f3f3]"}`}
    >
      {/* Header */}
      <View
        className={`flex-row items-center justify-between px-4 pb-4 border-b ${
          isDark ? "border-slate-800" : "border-gray-200"
        }`}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={isDark ? "#fff" : "#111827"}
          />
        </TouchableOpacity>
        <Text
          className={`text-xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Notifications
        </Text>
        <View className="w-6" />
      </View>

      {/* Filter Options Pills */}
      <View className="py-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-4 flex-row gap-2"
        >
          {FILTERS.map((filter) => {
            const isActive = selectedFilter === filter.id;
            return (
              <TouchableOpacity
                key={filter.id}
                onPress={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-full border ${
                  isActive
                    ? isDark
                      ? "bg-emerald-900 border-emerald-500"
                      : "bg-emerald-600 border-emerald-600"
                    : isDark
                      ? "bg-[#0e0e0e]/40 border-white/10"
                      : "bg-black/10 border-black/10"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isActive
                      ? "text-white"
                      : isDark
                        ? "text-gray-300"
                        : "text-gray-700"
                  }`}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : filteredNotifications.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons
            name="notifications-off-outline"
            size={48}
            color={isDark ? "#64748b" : "#9ca3af"}
          />
          <Text
            className={`mt-4 text-center text-lg font-semibold ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            {selectedFilter === "all"
              ? "No notifications yet"
              : `No ${selectedFilter} notifications`}
          </Text>
          <Text
            className={`mt-2 text-center text-sm ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Reservation and transaction updates will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          renderItem={({ item }) => {
            const theme = getTypeTheme(item.type, item.read);

            return (
              <TouchableOpacity
                onPress={() => handleOpenNotification(item)}
                className={`mb-3 rounded-2xl border p-4 ${theme.bg} ${
                  theme.border
                } ${item.read ? "opacity-60" : "opacity-100"}`}
              >
                <View className="flex-row items-start gap-3">
                  <View className={`mt-0.5 rounded-full p-2.5 ${theme.iconBg}`}>
                    <Ionicons
                      name={theme.iconName as any}
                      size={18}
                      color={theme.iconColor}
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text
                        className={`font-semibold text-base ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.title}
                      </Text>

                      {!item.read && (
                        <View className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </View>

                    <Text
                      className={`mt-1 text-sm ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {item.body}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
