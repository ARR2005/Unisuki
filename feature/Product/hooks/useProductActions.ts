import { useState } from "react";
import { useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/service/firebaseConfigs";

interface UseProductActionsProps {
  productId: string;
  sellerId: string;
  title: string;
  price: number;
  transactionFee: number;
  total: number;
  imageUri?: string | null;
}

export function useProductActions({
  productId,
  sellerId,
  title,
  price,
  transactionFee,
  total,
  imageUri,
}: UseProductActionsProps) {
  const router = useRouter();
  const [isReserving, setIsReserving] = useState(false);
  const [isInitiatingChat, setIsInitiatingChat] = useState(false);

  // 1. Handle Product Reservation Logic
  const handleReserve = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("Please log in to reserve this item.");
      return;
    }

    if (currentUser.uid === sellerId) {
      alert("You cannot reserve your own listing.");
      return;
    }

    setIsReserving(true);

    try {
      // Step A: Mark item as reserved in seller's posted items
      const productRef = doc(db, "user", sellerId, "itemPosted", productId);
      await updateDoc(productRef, { isReserved: true });

      // Step B: Save reservation document and store reference ID
      const reservationPayload = {
        buyerId: currentUser.uid,
        sellerId,
        productId,
        title,
        price,
        transactionFee,
        totalPrice: total,
        imageUri: imageUri || "",
        status: "pending",
        createdAt: serverTimestamp(),
      };

      const reservationDocRef = await addDoc(
        collection(db, "reservations"),
        reservationPayload
      );

      // Step C: Create deterministic reservation chat session
      const chatId = `${currentUser.uid}_${sellerId}_${productId}_res`;
      const chatRef = doc(db, "chats", chatId);

      await setDoc(
        chatRef,
        {
          chatId,
          participants: [currentUser.uid, sellerId],
          buyerId: currentUser.uid,
          sellerId,
          productId,
          reservationId: reservationDocRef.id,
          type: "reservation",
          updatedAt: serverTimestamp(),
          lastMessage: `[Reservation Request] ${title}`,
          reservation: {
            ...reservationPayload,
            id: reservationDocRef.id,
          },
        },
        { merge: true }
      );

      // Step D: Send initial user message (not systemMessage)
      const messagesRef = collection(db, "chats", chatId, "messages");
      const existingMessages = await getDocs(messagesRef);

      if (existingMessages.empty) {
        await addDoc(messagesRef, {
          senderId: currentUser.uid,
          text: `Hi! I would like to reserve "${title}" for ₱${total.toFixed(2)}.`,
          createdAt: serverTimestamp(),
          systemMessage: false,
        });
      }

      // Step E: Navigate to reservation chat
      router.push({
        pathname: "/(chat)/[chatId]",
        params: { chatId, isReservation: "true" },
      });
    } catch (err) {
      console.error("Error creating reservation:", err);
      alert("Could not process reservation. Please try again.");
    } finally {
      setIsReserving(false);
    }
  };

  // 2. Handle Normal Direct Chat Logic
  const handleContactSeller = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("Please log in to contact the seller.");
      return;
    }

    if (currentUser.uid === sellerId) {
      alert("You cannot start a chat with yourself.");
      return;
    }

    setIsInitiatingChat(true);

    try {
      const chatId = `${currentUser.uid}_${sellerId}_${productId}_direct`;
      const chatRef = doc(db, "chats", chatId);

      await setDoc(
        chatRef,
        {
          chatId,
          participants: [currentUser.uid, sellerId],
          buyerId: currentUser.uid,
          sellerId,
          productId,
          type: "direct",
          updatedAt: serverTimestamp(),
          lastMessage: `Inquired about ${title}`,
        },
        { merge: true }
      );

      const messagesRef = collection(db, "chats", chatId, "messages");
      const existingMessages = await getDocs(messagesRef);

      if (existingMessages.empty) {
        await addDoc(messagesRef, {
          senderId: currentUser.uid,
          text: `Hi! I'm interested in "${title}". Is this still available?`,
          createdAt: serverTimestamp(),
          systemMessage: false,
        });
      }

      router.push({
        pathname: "/(chat)/[chatId]",
        params: { chatId, isReservation: "false" },
      });
    } catch (err) {
      console.error("Error initiating chat:", err);
      alert("Could not start conversation. Please try again.");
    } finally {
      setIsInitiatingChat(false);
    }
  };

  return {
    isReserving,
    isInitiatingChat,
    handleReserve,
    handleContactSeller,
  };
}