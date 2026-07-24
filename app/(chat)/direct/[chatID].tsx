import { useChatMessages } from "@/feature/chat/hooks/useChatMessages";
import { auth, db } from "@/service/firebaseConfigs";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
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

function formatTime(timestamp: any): string {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function DirectChatScreen() {
  const { chatId, otherUserName } = useLocalSearchParams<{
    chatId: string;
    otherUserName?: string;
  }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { messages, loading, sendMessage } = useChatMessages(chatId);
  const [inputText, setInputText] = useState("");
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
          const participants: string[] = data.participants || [];
          const otherUid = participants.find(
            (uid) => uid !== currentUser?.uid
          );

          if (otherUid) {
            const participantNames = data.participantNames || {};
            const matchingName = participantNames[otherUid];

            if (matchingName) {
              setHeaderTitle(matchingName);
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
                console.error("Error fetching participant name:", err);
              }
            }
          }
        }
      },
      (err) => console.error("Error listening to direct chat details:", err)
    );

    return () => unsubscribe();
  }, [chatId, currentUser?.uid, otherUserName]);

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText("");
    }
  };

  return (
    <View className={`flex-1`}>
      <Stack.Screen
        options={{
          title: headerTitle,
          headerTitle: headerTitle,
          headerStyle: { backgroundColor: isDark ? "#0e0e0e" : "#ffffff" },
          headerTintColor: isDark ? "#ffffff" : "#111827",
        }}
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}
          renderItem={({ item }) => {
            const isMe = item.senderId === currentUser?.uid;
            const formattedTime = formatTime(item.createdAt);

            if (item.systemMessage) {
              return (
                <View
                  className={`my-1.5 p-2 px-4 rounded-full self-center max-w-[85%] border ${
                    isDark
                      ? "bg-[#01170f] border-[#01170f]"
                      : "bg-gray-200/80 border-gray-300/50"
                  }`}
                >
                  <Text
                    className={`text-xs text-center font-medium ${
                      isDark ? "text-emerald-400" : "text-gray-700"
                    }`}
                  >
                    {item.text}
                  </Text>
                </View>
              );
            }

            return (
              <View
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl border ${
                  isMe
                    ? isDark
                      ? "self-end bg-[#065f46] border-[#10b981]/30 rounded-br-xs"
                      : "self-end bg-emerald-600 border-emerald-600 rounded-br-xs"
                    : isDark
                    ? "self-start bg-[#0e0e0e] border-[#01170f] rounded-bl-xs"
                    : "self-start bg-white border-gray-200 rounded-bl-xs"
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: isDark ? 0.3 : 0.05,
                  shadowRadius: 3,
                  elevation: 1,
                }}
              >
                <Text
                  className={`text-sm leading-5 ${
                    isMe
                      ? "text-white"
                      : isDark
                      ? "text-white"
                      : "text-gray-900"
                  }`}
                >
                  {item.text}
                </Text>

                {formattedTime ? (
                  <Text
                    className={`text-[10px] mt-1 text-right ${
                      isMe
                        ? "text-emerald-100/80"
                        : isDark
                        ? "text-gray-400"
                        : "text-gray-500"
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

      {/* Message Input Container */}
      <View
        className={`p-3 px-4 pb-10 flex-row items-center gap-2.5 border-t ${
          isDark
            ? "bg-[#0e0e0e] border-[#01170f]"
            : "bg-white border-gray-200"
        }`}
      >
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
          className={`flex-1 px-4 py-4.5 text-sm rounded-2xl border ${
            isDark
              ? "bg-black/10 border-[#01170f] text-white"
              : "bg-gray-100 border-gray-200 text-gray-900"
          }`}
        />
        <TouchableOpacity
          onPress={handleSend}
          className="p-3 bg-emerald-600 dark:bg-[#065f46] rounded-2xl active:opacity-80"
        >
          <Ionicons name="send" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}