import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth, db } from "@/service/firebaseConfigs";
import { collection, getDocs } from "firebase/firestore";

interface ChatUser {
  id: string;
  name: string;
  email?: string;
}

export default function MessageScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = auth.currentUser;

  useEffect(() => {
    async function fetchUsers() {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const fetchedUsersMap = new Map<string, ChatUser>();

        // 1. Fetch from userVerifications collection
        const verificationsSnap = await getDocs(collection(db, "userVerifications"));
        verificationsSnap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const profile = data.profileData || {};
          const uid = profile.uid;

          if (uid && uid !== currentUser.uid) {
            fetchedUsersMap.set(uid, {
              id: uid,
              // Prioritize username over full name
              name: profile.username || profile.name || "Verified User",
            });
          }
        });

        // 2. Fallback/Supplement from main user collection
        const userSnap = await getDocs(collection(db, "user"));
        userSnap.docs.forEach((docSnap) => {
          const uid = docSnap.id;
          const data = docSnap.data();

          if (uid !== currentUser.uid && !fetchedUsersMap.has(uid)) {
            fetchedUsersMap.set(uid, {
              id: uid,
              // Prioritize username over name/displayName/email
              name: data.username || data.name || data.displayName || data.email?.split("@")[0] || "User",
              email: data.email,
            });
          }
        });

        setUsers(Array.from(fetchedUsersMap.values()));
      } catch (error) {
        console.error("Error loading chat users:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [currentUser]);

  const handleStartChat = (recipient: ChatUser) => {
    if (!currentUser) return;

    // Generate a consistent direct chat ID between two users
    const sortedIds = [currentUser.uid, recipient.id].sort();
    const chatId = `${sortedIds[0]}_${sortedIds[1]}_direct`;

    router.push({
      pathname: "/(chat)/direct/[chatId]" as any,
      params: {
        chatId,
        otherUserName: recipient.name,
      },
    });
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-[#0e0e0e]" : "bg-[#f3f3f3]"}`}>
      {/* Header */}
      <View className="pt-12 pb-4 px-4 border-b border-gray-200/40 dark:border-slate-800">
        <Text
          className={`text-3xl font-extrabold tracking-wide ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Messages
        </Text>
        <Text
          className={`text-xs mt-0.5 ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Select a user to start chatting
        </Text>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : users.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons
            name="chatbubbles-outline"
            size={48}
            color={isDark ? "#475569" : "#9ca3af"}
          />
          <Text
            className={`mt-4 text-lg font-bold ${
              isDark ? "text-gray-200" : "text-gray-800"
            }`}
          >
            No Users Found
          </Text>
          <Text
            className={`mt-1 text-sm text-center ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Other registered users will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleStartChat(item)}
              className={`flex-row items-center p-3.5 rounded-2xl border ${
                isDark
                  ? "bg-[#0e0e0e]/40 border-slate-800"
                  : "bg-white border-gray-200/80"
              }`}
            >
              {/* User Avatar Placeholder */}
              <View className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 items-center justify-center mr-3.5">
                <Ionicons name="person" size={20} color="#059669" />
              </View>

              {/* User Info */}
              <View className="flex-1">
                <Text
                  className={`text-base font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text
                  className={`text-xs mt-0.5 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                  numberOfLines={1}
                >
                  Tap to open conversation
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={isDark ? "#64748b" : "#9ca3af"}
              />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}