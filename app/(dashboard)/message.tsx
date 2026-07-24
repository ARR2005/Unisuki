import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
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
  const [searchQuery, setSearchQuery] = useState("");
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
              name:
                data.username ||
                data.name ||
                data.displayName ||
                data.email?.split("@")[0] ||
                "User",
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

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

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
    <View className="flex-1 bg-transparent">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Screen Header (Matches Reservations Header) */}
      <View className="pt-12 pb-6 px-4">
        <Text
          className={`text-4xl font-extrabold tracking-wide text-center ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Messages
        </Text>
      </View>

      {/* Main Content Card Wrapper with rounded top corners */}
      <View
        className={`flex-1 rounded-t-3xl overflow-hidden border-t ${
          isDark
            ? "bg-[#0e0e0e] border-[#01170f]"
            : "bg-[#f3f3f3] border-gray-200"
        }`}
      >
        {/* Search Bar Component */}
        <View className="p-4 pb-2">
          <View
            className={`flex-row items-center px-3.5 py-2.5 rounded-2xl border ${
              isDark
                ? "bg-[#0e0e0e] border-[#01170f]"
                : "bg-white border-gray-200"
            }`}
          >
            <Ionicons
              name="search-outline"
              size={18}
              color={isDark ? "#10b981" : "#059669"}
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search users..."
              placeholderTextColor={isDark ? "#64748b" : "#9ca3af"}
              className={`flex-1 ml-2.5 text-sm ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={isDark ? "#64748b" : "#9ca3af"}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content Section */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#059669" />
          </View>
        ) : filteredUsers.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons
              name="chatbubbles-outline"
              size={56}
              color={isDark ? "#10b981" : "#059669"}
            />
            <Text
              className={`mt-4 text-lg font-bold ${
                isDark ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {searchQuery ? "No Matching Users" : "No Users Found"}
            </Text>
            <Text
              className={`mt-1 text-sm text-center ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {searchQuery
                ? `No user found matching "${searchQuery}"`
                : "Other registered users will appear here."}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 96 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleStartChat(item)}
                className={`flex-row items-center p-3.5 rounded-2xl border ${
                  isDark
                    ? "bg-[#0e0e0e] border-[#01170f]"
                    : "bg-white border-gray-200"
                }`}
              >
                {/* User Avatar Placeholder */}
                <View className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-[#01170f] items-center justify-center mr-3.5">
                  <Ionicons
                    name="person"
                    size={20}
                    color={isDark ? "#10b981" : "#059669"}
                  />
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
                  color={isDark ? "#10b981" : "#059669"}
                />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}