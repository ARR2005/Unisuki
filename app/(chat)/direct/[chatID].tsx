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
    <View className={`flex-1 ${isDark ? "bg-[#0e0e0e]" : "bg-[#f3f3f3]"}`}>
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

      {/* Message Input Container */}
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