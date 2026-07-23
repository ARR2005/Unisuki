import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "@/service/firebaseConfigs";

export interface Message {
  id: string;
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
      setLoading(false);
      return;
    }

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Message[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Message[];

        setMessages(list);
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to chat messages:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  // Send a new text message
  const sendMessage = async (text: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !text.trim()) return;

    try {
      const messagesRef = collection(db, "chats", chatId, "messages");
      await addDoc(messagesRef, {
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