import { auth, db } from "@/service/firebaseConfigs";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: any;
  systemMessage?: boolean;
}

export function useChatMessages(chatId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, where("chatId", "==", chatId));

    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        const list: Message[] = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data({ serverTimestamps: "estimate" });
            return {
              id: docSnap.id,
              chatId: data.chatId || chatId,
              senderId: data.senderId || "",
              text: data.text || "",
              createdAt: data.createdAt,
              systemMessage: data.systemMessage ?? false,
            };
          })
          .sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            const aTime = a.createdAt.toMillis
              ? a.createdAt.toMillis()
              : a.createdAt;
            const bTime = b.createdAt.toMillis
              ? b.createdAt.toMillis()
              : b.createdAt;
            return aTime - bTime;
          });

        setMessages(list);
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to chat messages:", err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async (text: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !text.trim() || !chatId) return;

    try {
      const messagesRef = collection(db, "messages");
      await addDoc(messagesRef, {
        chatId,
        senderId: currentUser.uid,
        text: text.trim(),
        createdAt: serverTimestamp(),
        systemMessage: false,
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return { messages, loading, sendMessage };
}
