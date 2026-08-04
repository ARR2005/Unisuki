import { auth, db } from "@/service/firebaseConfigs";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    onSnapshot,
    query,
    serverTimestamp,
    setDoc,
    where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export interface DirectMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: any;
  systemMessage?: boolean;
}

export function getDirectChatId(userA: string, userB: string) {
  const [first, second] = [userA, userB].sort();
  return `${first}_${second}_direct`;
}

export async function createOrOpenDirectChat(
  recipientUid: string,
  recipientName: string,
) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("You must be logged in to start a chat.");
  }

  if (recipientUid === currentUser.uid) {
    throw new Error("You cannot start a chat with yourself.");
  }

  const chatId = getDirectChatId(currentUser.uid, recipientUid);
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  const localName =
    currentUser.displayName || currentUser.email?.split("@")[0] || "You";
  const participantNames = {
    [currentUser.uid]: localName,
    [recipientUid]: recipientName,
  };

  if (!chatSnap.exists()) {
    await setDoc(chatRef, {
      chatId,
      participants: [currentUser.uid, recipientUid],
      type: "direct",
      updatedAt: serverTimestamp(),
      lastMessage: `Chat started with ${recipientName}`,
      participantNames,
    });

    await addDoc(collection(db, "messages"), {
      chatId,
      senderId: currentUser.uid,
      text: "Chat initiated.",
      createdAt: serverTimestamp(),
      systemMessage: true,
    });
  } else {
    await setDoc(
      chatRef,
      {
        participantNames,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  return {
    chatId,
    otherUserName: recipientName,
  };
}

export function useDirectMessage(chatId: string) {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
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
      (snapshot) => {
        const list: DirectMessage[] = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data();
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
        console.error("Error listening to direct messages:", err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async (text: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !text.trim() || !chatId) return;

    try {
      await addDoc(collection(db, "messages"), {
        chatId,
        senderId: currentUser.uid,
        text: text.trim(),
        createdAt: serverTimestamp(),
        systemMessage: false,
      });
    } catch (err) {
      console.error("Error sending direct message:", err);
    }
  };

  return { messages, loading, sendMessage };
}
