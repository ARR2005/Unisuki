import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useChatMessages } from "@/feature/chat/hooks/useChatMessages";
import { auth } from "@/service/firebaseConfigs";

export default function ChatScreen() {
  const { chatId, isReservation } = useLocalSearchParams<{
    chatId: string;
    isReservation: string;
  }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { messages, loading, sendMessage } = useChatMessages(chatId);
  const [inputText, setInputText] = useState("");

  const currentUser = auth.currentUser;
  // Parse sellerId from deterministic chatId string: buyerId_sellerId_productId_res
  const chatIdParts = chatId ? chatId.split("_") : [];
  const sellerId = chatIdParts[1];
  const isSeller = currentUser?.uid === sellerId;

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText("");
    }
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-slate-900" : "bg-gray-50"}`}>
      <Stack.Screen
        options={{
          title: isReservation === "true" ? "Reservation Chat" : "Direct Chat",
          headerStyle: { backgroundColor: isDark ? "#0f172a" : "#ffffff" },
          headerTintColor: isDark ? "#ffffff" : "#0f172a",
        }}
      />

      {/* Reservation Status Banner */}
      {isReservation === "true" && (
        <View
          className={`p-3.5 flex-row items-center border-b ${
            isDark
              ? "bg-amber-950/40 border-amber-800/40"
              : "bg-amber-50 border-amber-200"
          }`}
        >
          <Ionicons name="time-outline" size={20} color="#d97706" />
          <Text className="ml-2.5 flex-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
            {isSeller
              ? "Product has been reserved by this buyer. Awaiting your response."
              : "You reserved this product. Waiting for seller approval."}
          </Text>
        </View>
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
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => {
            const isMe = item.senderId === currentUser?.uid;

            if (item.systemMessage) {
              return (
                <View className="my-2 p-2.5 rounded-xl bg-gray-200 dark:bg-slate-800 self-center max-w-[85%]">
                  <Text className="text-xs text-center font-medium text-gray-600 dark:text-gray-300">
                    {item.text}
                  </Text>
                </View>
              );
            }

            return (
              <View
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                  isMe
                    ? "self-end bg-emerald-600 rounded-tr-none"
                    : "self-start bg-white dark:bg-slate-800 rounded-tl-none border border-gray-100 dark:border-slate-700"
                }`}
              >
                <Text
                  className={`text-sm ${
                    isMe
                      ? "text-white"
                      : isDark
                      ? "text-gray-100"
                      : "text-gray-800"
                  }`}
                >
                  {item.text}
                </Text>
              </View>
            );
          }}
        />
      )}

      {/* Message Input Field */}
      <View
        className={`p-3 flex-row items-center gap-2 border-t ${
          isDark
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-gray-200"
        }`}
      >
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={isDark ? "#64748b" : "#9ca3af"}
          className={`flex-1 px-4 py-2.5 rounded-full ${
            isDark ? "bg-slate-800 text-white" : "bg-gray-100 text-gray-900"
          }`}
        />
        <TouchableOpacity
          onPress={handleSend}
          className="p-3 bg-emerald-600 rounded-full active:bg-emerald-700"
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}